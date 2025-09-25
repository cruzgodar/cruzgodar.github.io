import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { hsvToRgb } from "/scripts/applets/applet.js";
import { browserSupportsP3, browserSupportsRec2020, convertColor } from "/scripts/src/browser.js";
import { addTemporaryInterval, addTemporaryWorker } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { animate, clamp, sleep } from "/scripts/src/utils.js";
import { WilsonCPU } from "/scripts/wilson.js";

const LITERAL = 0; // { value, bindingLambda }
const LAMBDA = 1; // { argument, body }
const APPLICATION = 2; // { function, input }

// Only used as a type in rects. Represents the
// vertical connectors up to both the function and input.
const CONNECTOR = 3;

// Additionally, every expression has row, col, width, and height.
// Each also has rect: { row, col, width, height }, which is the part actually used for drawing.
// And also color: { h, s, v }.
// Lambdas get a literalColor field too.
// Applications get a startText and endText field.
// And lambdas get an argumentText, and literals get a valueText
// so that we can uniqueify the argument as we parse.
// Finally, literals can be shorthands! They get a shorthand field.

// The outermost expression also gets a rectIndex field.

const shorthands = {
	"0": "(λfλxx)",
	"F": "(λxλyy)",
	"1": "(λfλxf(x))",
	"2": "(λfλxf(f(x)))",
	"3": "(λfλxf(f(f(x))))",
	"4": "(λfλxf(f(f(f(x)))))",
	"5": "(λfλxf(f(f(f(f(x))))))",
	"6": "(λfλxf(f(f(f(f(f(x)))))))",
	"7": "(λfλxf(f(f(f(f(f(f(x))))))))",
	"8": "(λfλxf(f(f(f(f(f(f(f(x)))))))))",
	"9": "(λfλxf(f(f(f(f(f(f(f(f(x))))))))))",

	">": "(λnλfλxf(nf(x)))",
	"<": "(λnλfλxn(λgλhh(gf))(λux)I)",

	"I": "(λxx)",
	"K": "(λxλyx)",
	"T": "(λxλyx)",
	"S": "(λxλyλz(xz)(yz))",
	"Y": "(λf(λxf(xx))(λxf(xx)))",

	"_": "(λnn(λxF)T)",

	"!": "(λbbFT)",
	"&": "(λbλccbF)",
	"|": "(λbλcbTc)",

	",": "(λxλyλiixy)",
	"'": "(λpp(λxλyx))",
	"\"": "(λpp(λxλyy))",

	"+": "(λaλbλfλx(af)(bfx))",
	"-": "(λmλnn<m)",
	"*": "(λaλbλfb(af))",
	"/": "(λn((λf(λxxx)(λxf(xx)))(λcλnλmλfλx(λd_d(Ffx)(f(cdmfx)))(-nm)))(>n))",
	"^": "(λaλbba)",
	// "=": "λaλb&(_(-ab))(_(-ba))"
	"=": "(λaλb(a(λnλfλxn(λgλhh(gf))(λux)(λuu))b(λxF)T)(b(λnλfλxn(λgλhh(gf))(λux)(λuu))a(λxF)T)(F))"
};

function getRgbFromColorString(color)
{
	if (color.startsWith("rgba("))
	{
		const startIndex = 5; // "rgba(".length;
		const endIndex = color.lastIndexOf(",");
		return color
			.slice(startIndex, endIndex)
			.replaceAll(" ", "")
			.split(",")
			.map(Number);
	}

	if (color.startsWith("rgb("))
	{
		const startIndex = 4; // "rgb(".length;
		const endIndex = -1;
		return color
			.slice(startIndex, endIndex)
			.replaceAll(" ", "")
			.split(",")
			.map(Number);
	}

	if (color.startsWith("color(display-p3 "))
	{
		const startIndex = 17; // "color(display-p3 ".length;
		// This very conveniently returns -1 if there is no alpha slash,
		// which then cuts off the last parenthesis anyway.
		const endIndex = color.lastIndexOf(" /");
		return color
			.slice(startIndex, endIndex)
			.split(" ")
			.map(x => parseFloat(x) * 255);
	}

	if (color.startsWith("color(rec2020 "))
	{
		const startIndex = 14; // "color(rec2020 ".length;
		const endIndex = color.lastIndexOf(" /");
		return color
			.slice(startIndex, endIndex)
			.split(" ")
			.map(x => parseFloat(x) * 255);
	}

	throw new Error("Invalid color string.");
}

export class LambdaCalculus extends AnimationFrameApplet
{
	outerExpressionSize;
	resolution = 2000;
	lambdaIndex = 0;
	numLambdas = 0;
	animationTime = 500;
	animationPaused = false;

	animationRunning = false;
	needReload = false;
	reloaded = Promise.resolve();
	reloadedResolve;

	expressionTextarea;

	nextId = 0;
	nextUniqueArgument = 0;

	worker;

	constructor({ canvas, expressionTextarea })
	{
		super(canvas);

		this.expressionTextarea = expressionTextarea;

		const options =
		{
			canvasWidth: this.resolution,

			fullscreenOptions: {
				useFullscreenButton: true,

				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
			},

			verbose: window.DEBUG,
		};

		this.wilson = new WilsonCPU(this.canvas, options);
	}

	async run({
		expression: expressionString,
		expandShorthands = false,
		updateExpressionDuringReduction = false,
		betaReduce = false,
		maxBetaReductions = Infinity
	}) {
		if (this.needReload)
		{
			return;
		}

		if (this.animationRunning)
		{
			this.reloaded = new Promise(resolve => this.reloadedResolve = resolve);
			this.needReload = true;
			await this.reloaded;
			this.needReload = false;
			this.animationRunning = false;
		}

		expressionString = expressionString.replaceAll(/[\n\t\s.]/g, "");

		this.numLambdas = this.computeNumLambdasFromString(expressionString);
		this.lambdaIndex = 0;

		const expression = this.parseExpression(expressionString, expandShorthands);
		this.setupExpression(expression);

		this.drawExpression(expression);

		const html = this.expressionToString({ expression })
			.replaceAll(/\[LEFTCARET\]/g, "&lt;");
		const text = this.expressionToString({ expression, addHtml: false })
			.replaceAll(/\[LEFTCARET\]/g, "<");

		if (betaReduce)
		{
			this.expressionTextarea.syncOverlay = false;

			if (!expandShorthands)
			{
				const expression = this.parseExpression(expressionString, true);
				this.setupExpression(expression);
				this.animateIteratedBetaReduction(
					expression,
					maxBetaReductions,
					updateExpressionDuringReduction
				);
			}

			else
			{
				this.animateIteratedBetaReduction(
					expression,
					maxBetaReductions,
					updateExpressionDuringReduction
				);
			}

			this.expressionTextarea.syncOverlay = true;
		}

		return [html, text];
	}

	computeNumLambdasFromString(expressionString)
	{
		for (;;)
		{
			let foundShorthand = false;

			for (const key in shorthands)
			{
				if (!expressionString.includes(key))
				{
					continue;
				}

				expressionString = expressionString.replaceAll(key, shorthands[key]);
				foundShorthand = true;
			}

			if (!foundShorthand)
			{
				break;
			}
		}

		let numLambdas = 0;
		const chars = expressionString.split("");

		for (let i = 0; i < chars.length; i++)
		{
			if (chars[i] === "λ")
			{
				numLambdas++;
			}

			else if (chars[i] in shorthands)
			{
				numLambdas += shorthands[chars[i]].split("λ").length - 1;
			}
		}

		return numLambdas;
	}
	
	parseExpression(expressionString, expandShorthands)
	{
		if (expressionString.length === 0)
		{
			throw new Error("Empty expression.");
		}

		const terms = [];

		while (expressionString.length > 0)
		{
			if (expressionString[0] === "λ")
			{
				if (expressionString.length < 3)
				{
					throw new Error("Expression too short.");
				}

				const argument = expressionString[1];
				const body = expressionString.slice(2);

				terms.push({
					type: LAMBDA,
					argument,
					argumentText: argument,
					body: this.parseExpression(body, expandShorthands),
					literalColor: { h: this.lambdaIndex / this.numLambdas, s: 0.8, v: 1 },
				});
				this.lambdaIndex++;

				expressionString = "";
			}

			else if (expressionString[0] === "(")
			{
				let i = 1;
				let parenthesisCount = 1;

				while (parenthesisCount > 0)
				{
					if (expressionString[i] === "(")
					{
						parenthesisCount++;
					}

					else if (expressionString[i] === ")")
					{
						parenthesisCount--;
					}

					i++;
				}

				const subExpression = this.parseExpression(
					expressionString.slice(1, i - 1),
					expandShorthands
				);

				subExpression.startText = "(" + (subExpression.startText ?? "");
				subExpression.endText = (subExpression.endText ?? "") + ")";

				terms.push(subExpression);
				expressionString = expressionString.slice(i);
			}

			else
			{
				if (expressionString[0] in shorthands)
				{
					terms.push(this.parseExpression(
						shorthands[expressionString[0]],
						expandShorthands
					));

					if (!expandShorthands)
					{
						terms[terms.length - 1].shorthandText = expressionString[0] === "<"
							? "[LEFTCARET]"
							: expressionString[0];
					}
				}

				else
				{
					terms.push({
						type: LITERAL,
						value: expressionString[0],
						valueText: expressionString[0],
					});
				}

				expressionString = expressionString.slice(1);
			}
		}

		if (terms.length === 1)
		{
			return terms[0];
		}
		
		// This is now an application, so we apply them from left to right.
		let returnValue = terms[0];
		for (let i = 1; i < terms.length; i++)
		{
			returnValue = {
				type: APPLICATION,
				function: returnValue,
				input: terms[i],
			};
		}

		return returnValue;
	}

	validateExpression(expression, scopedVariables = [])
	{
		if (expression.type === LITERAL)
		{
			if (!scopedVariables.includes(expression.value))
			{
				throw new Error(`Undefined variable ${expression.value}.`);
			}

			return true;
		}

		if (expression.type === LAMBDA)
		{
			return this.validateExpression(
				expression.body,
				[...scopedVariables, expression.argument]
			);
		}

		return this.validateExpression(expression.function, scopedVariables)
			&& this.validateExpression(expression.input, scopedVariables);
	}

	checkIfExpressionContainsApplication(expression)
	{
		if (expression.type === LITERAL)
		{
			return false;
		}

		if (expression.type === LAMBDA)
		{
			return this.checkIfExpressionContainsApplication(expression.body);
		}

		return true;
	}



	// Adds size, location, rect, and color info to an expression, and uniqueifies its arguments.
	setupExpression(expression, isBetaReduction = false)
	{
		this.addExpressionSize(expression);

		// Technical thing to make centering work.
		if (this.checkIfExpressionContainsApplication(expression))
		{
			expression.height--;
		}

		this.outerExpressionSize = Math.max(expression.width, expression.height);
		expression.row = Math.max((this.outerExpressionSize - expression.height) / 2, 0);
		expression.col = Math.max((this.outerExpressionSize - expression.width) / 2, 0);

		this.addExpressionLocation(expression);
		this.addExpressionBindings(expression);
		this.addExpressionColors(expression);
		this.addExpressionRects(expression, isBetaReduction);

		// In the specific case where the outermost expression is an application,
		// we need to move all three of its the rectangles down 1 for reasons I don't understand.
		if (expression.type === APPLICATION)
		{
			expression.rects[0].row++;
			expression.rects[1].height++;
			expression.rects[2].height++;
		}

		expression.rectIndex = {};
		this.addExpressionRectIndices(expression, expression.rectIndex);
	}

	// Adds width and height fields to each expression recursively.
	addExpressionSize(expression)
	{
		// If the immediately following expression is a lambda, then we just let
		// that one dictate the width.
		if (expression.type === LAMBDA)
		{
			this.addExpressionSize(expression.body);

			expression.width = expression.body.width;
			// Add the new lambda bar in.
			expression.height = expression.body.height + 2;
		}

		else if (expression.type === APPLICATION)
		{
			this.addExpressionSize(expression.function);
			this.addExpressionSize(expression.input);

			// Add the gap in between the two expressions.
			expression.width = expression.function.width + expression.input.width + 1;
			// Add the function bar in and the output.
			expression.height = Math.max(expression.function.height, expression.input.height) + 2;
		}

		else
		{
			expression.width = 3;
			expression.height = 0;
		}
	}

	// Adds row and col fields to each expression recursively.
	addExpressionLocation(expression)
	{
		if (expression.type === LAMBDA)
		{
			expression.body.row = expression.row + 2;
			expression.body.col = expression.col;

			this.addExpressionLocation(expression.body);
		}

		else if (expression.type === APPLICATION)
		{
			expression.function.row = expression.row;
			expression.function.col = expression.col;

			expression.input.row = expression.row;
			expression.input.col = expression.col + expression.function.width + 1;

			this.addExpressionLocation(expression.function);
			this.addExpressionLocation(expression.input);
		}
	}

	// Adds bindingLambda pointers to each literal expression.
	addExpressionBindings(expression, bindings = {}, argumentRewriteMap = {}, argumentsSeen = [])
	{
		if (expression.type === LITERAL)
		{
			if (expression.value in argumentRewriteMap)
			{
				expression.value = argumentRewriteMap[expression.value];
			}

			expression.bindingLambda = bindings[expression.value];
		}

		else if (expression.type === LAMBDA)
		{
			if (argumentsSeen.includes(expression.argument))
			{
				this.nextUniqueArgument++;

				const oldArgument = expression.argument;
				expression.argument = this.nextUniqueArgument;

				// This variable is already taken, so we'll rewrite it.
				this.addExpressionBindings(expression.body, {
					...bindings,
					[expression.argument]: expression,
				}, {
					...argumentRewriteMap,
					[oldArgument]: this.nextUniqueArgument,
				}, argumentsSeen);
			}

			else
			{
				argumentsSeen.push(expression.argument);

				this.addExpressionBindings(expression.body, {
					...bindings,
					[expression.argument]: expression,
				}, argumentRewriteMap, argumentsSeen);
			}
		}

		else if (expression.type === APPLICATION)
		{
			this.addExpressionBindings(
				expression.function,
				bindings,
				argumentRewriteMap,
				argumentsSeen
			);

			this.addExpressionBindings(
				expression.input,
				bindings,
				argumentRewriteMap,
				argumentsSeen
			);
		}
	}

	addExpressionColors(expression)
	{
		if (expression.type === LITERAL)
		{
			expression.color = expression.bindingLambda.literalColor;
		}

		else if (expression.type === LAMBDA)
		{
			this.addExpressionColors(expression.body);
			expression.color = expression.body.color;
		}

		else
		{
			this.addExpressionColors(expression.function);
			this.addExpressionColors(expression.input);

			const h1 = expression.function.color.h;
			const h2 = expression.input.color.h;

			const s1 = expression.function.color.s;
			const s2 = expression.input.color.s;

			expression.color = {
				h: Math.abs(h1 - h2) <= 0.5
					? (h1 + h2) / 2
					: ((h1 + h2 + 1) / 2) % 1,
				s: Math.max(
					(s1 + s2) / 2 - 0.1,
					0.1
				),
				v: 1,
			};
		}
	}

	// Adds the rects fields to each expression recursively,
	// which is an array of objects with row, col, width, and height fields.
	// If isBetaReduction is true, then we only change the position of the rects.
	addExpressionRects(expression, isBetaReduction)
	{
		if (expression.type === LAMBDA)
		{
			const rgb = hsvToRgb(
				expression.literalColor.h,
				expression.literalColor.s,
				expression.literalColor.v
			);

			const rects = [
				{
					type: LAMBDA,
					color: convertColor(...rgb),
					row: expression.row,
					col: expression.col,
					width: expression.width,
					height: 1
				},
			];

			if (isBetaReduction)
			{
				expression.rects[0].row = rects[0].row;
				expression.rects[0].col = rects[0].col;
				expression.rects[0].width = rects[0].width;
				expression.rects[0].height = rects[0].height;
				expression.rects[0].color = rects[0].color;
			}

			else
			{
				expression.rects = rects;
			}

			this.addExpressionRects(expression.body, isBetaReduction);
		}

		else if (expression.type === APPLICATION)
		{
			const rgb = hsvToRgb(
				expression.function.color.h,
				expression.function.color.s,
				expression.function.color.v
			);

			// Vertical connecting bars up to the function and input.
			const functionConnector = {
				type: CONNECTOR,
				color: convertColor(...rgb),
				col: expression.col + 1,
				width: 1,
			};
			
			// Connect to the bottom of the lambda.
			if (expression.function.type === LAMBDA)
			{
				functionConnector.row = expression.function.row + expression.function.height - 1;
			}
			
			// Connect to the top of the literal's binding lambda.
			else if (expression.function.type === LITERAL)
			{
				functionConnector.row = expression.function.bindingLambda.row + 1;
			}

			// Connect to the bottom of the application.
			else
			{
				functionConnector.row = expression.function.row + expression.function.height - 1;
			}

			functionConnector.height = expression.row + expression.height - 3
				- functionConnector.row + 1;

			
			
			const rgb2 = hsvToRgb(
				expression.input.color.h,
				expression.input.color.s,
				expression.input.color.v
			);

			const inputConnector = {
				type: CONNECTOR,
				color: convertColor(...rgb2),
				col: expression.col + expression.function.width + 2,
				width: 1,
			};

			if (expression.input.type === LAMBDA)
			{
				inputConnector.row = expression.input.row + expression.input.height - 1;
			}
			
			else if (expression.input.type === LITERAL)
			{
				inputConnector.row = expression.input.bindingLambda.row + 1;
			}

			else
			{
				inputConnector.row = expression.input.row + expression.input.height - 1;
			}

			inputConnector.height = expression.row + expression.height - 3
				- inputConnector.row + 1;

			

			const rgb3 = hsvToRgb(
				expression.color.h,
				expression.color.s,
				expression.color.v
			);

			const rects = [
				// The connecting bar almost at the bottom.
				{
					type: APPLICATION,
					color: convertColor(...rgb3),
					row: expression.row + expression.height - 2,
					// Adjust to ensure we're connecting exactly to the function and inputs.
					col: expression.col + 1,
					width: expression.function.width + 2,
					height: 1
				},
				functionConnector,
				inputConnector,
			];

			if (isBetaReduction)
			{
				for (let i = 0; i < 3; i++)
				{
					expression.rects[i].row = rects[i].row;
					expression.rects[i].col = rects[i].col;
					expression.rects[i].width = rects[i].width;
					expression.rects[i].height = rects[i].height;
					expression.rects[i].color = rects[i].color;
				}
			}

			else
			{
				expression.rects = rects;
			}

			this.addExpressionRects(expression.function, isBetaReduction);
			this.addExpressionRects(expression.input, isBetaReduction);
		}
		
		else
		{
			const rgb = hsvToRgb(expression.color.h, expression.color.s, expression.color.v);

			// We still need to connect this literal to its binding lambda
			// To handle cases like lx.(x(ly.x)).
			const rects = [
				{
					type: LITERAL,
					color: convertColor(...rgb),
					row: expression.bindingLambda.row + 1,
					col: expression.col + 1,
					width: 1,
					height: expression.row - 1 - (expression.bindingLambda.row + 1) + 1,
				}
			];

			if (isBetaReduction)
			{
				expression.rects[0].row = rects[0].row;
				expression.rects[0].col = rects[0].col;
				expression.rects[0].width = rects[0].width;
				expression.rects[0].height = rects[0].height;
			}

			else
			{
				expression.rects = rects;
			}
		}
	}

	// Adds never-before-seen rect IDs to each expression recursively.
	addExpressionRectIndices(expression, rectIndex)
	{
		if (expression.type === LAMBDA)
		{
			if (expression.rects[0].id === undefined)
			{
				expression.rects[0].id = this.nextId;
				this.nextId++;
			}

			rectIndex[expression.rects[0].id] = expression.rects[0];

			this.addExpressionRectIndices(expression.body, rectIndex);
		}

		else if (expression.type === APPLICATION)
		{
			for (let i = 0; i < 3; i++)
			{
				if (expression.rects[i].id === undefined)
				{
					expression.rects[i].id = this.nextId;
					this.nextId++;
				}

				rectIndex[expression.rects[i].id] = expression.rects[i];
			}

			this.addExpressionRectIndices(expression.function, rectIndex);
			this.addExpressionRectIndices(expression.input, rectIndex);
		}
		
		else
		{
			if (expression.rects[0].id === undefined)
			{
				expression.rects[0].id = this.nextId;
				this.nextId++;
			}

			rectIndex[expression.rects[0].id] = expression.rects[0];
		}
	}

	// This doesn't remove the indices from the rectIndex!
	// To clear them, we need to rerun the expression through addExpressionRectIndices.
	removeExpressionRectIndices(expression)
	{
		if (expression.type === LAMBDA)
		{
			expression.rects[0].id = undefined;

			this.removeExpressionRectIndices(expression.body);
		}

		else if (expression.type === APPLICATION)
		{
			for (let i = 0; i < 3; i++)
			{
				expression.rects[i].id = undefined;
			}

			this.removeExpressionRectIndices(expression.function);
			this.removeExpressionRectIndices(expression.input);
		}
		
		else
		{
			expression.rects[0].id = undefined;
		}
	}



	drawExpression(expression)
	{
		this.outerExpressionSize = Math.max(expression.width, expression.height);
		this.resolution = Math.round(
			clamp(this.resolution, 2000, 5000) / (this.outerExpressionSize + 2),
		) * (this.outerExpressionSize + 2);
		
		this.wilson.resizeCanvas({ width: this.resolution });
		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);
		this.drawExpressionStep(expression);
	}

	drawExpressionStep(expression)
	{
		for (const rect of expression.rects)
		{
			this.wilson.ctx.fillStyle = rect.color;
			
			const scaleFactor = this.resolution / (this.outerExpressionSize + 2);

			this.wilson.ctx.fillRect(
				scaleFactor * (rect.col + 1),
				scaleFactor * (rect.row + 1),
				scaleFactor * rect.width,
				scaleFactor * rect.height
			);
		}

		if (expression.type === LAMBDA)
		{
			this.drawExpressionStep(expression.body);
		}

		else if (expression.type === APPLICATION)
		{
			this.drawExpressionStep(expression.function);
			this.drawExpressionStep(expression.input);
		}
	}


	// Converts an expression to a colored string.
	expressionToString({
		expression,
		addHtml = true,
		addParentheses = false,
		useForSelfInterpreter = false,
	}) {
		const startText = expression.startText ?? "";
		const endText = expression.endText ?? "";

		const valueFactor = siteSettings.darkTheme ? 1 : 0.7;

		if (expression.type === LITERAL)
		{
			const color = expression.bindingLambda.literalColor;
			const rgb = hsvToRgb(color.h, color.s, color.v * valueFactor);
			const rgbString = convertColor(...rgb);

			const valueText = useForSelfInterpreter
				? `λa.λb.λc.${expression.valueText}`
				: expression.valueText;

			if (expression.shorthandText)
			{
				return addHtml
					? /* html */`<span style="color: ${rgbString}">${startText.slice(1)}${expression.shorthandText}${endText.slice(1)}</span>`
					: `${startText.slice(1)}${expression.shorthandText}${endText.slice(1)}`;
			}

			return addHtml
				? /* html */`<span style="color: ${rgbString}">${startText}${valueText}${endText}</span>`
				: `${startText}${valueText}${endText}`;
		}

		if (expression.type === LAMBDA)
		{
			const literalColor = expression.literalColor;
			const literalRgb = hsvToRgb(
				literalColor.h,
				literalColor.s,
				literalColor.v * valueFactor
			);
			const literalRgbString = convertColor(...literalRgb);

			const color = expression.color;
			const rgb = hsvToRgb(color.h, color.s, color.v * valueFactor);
			const rgbString = convertColor(...rgb);

			const lambdaText = useForSelfInterpreter
				? `λa.λb.λc.c(λ${expression.argumentText}.`
				: `λ${expression.argumentText}.`;

			const bodyString = this.expressionToString({
				expression: expression.body,
				addHtml,
				addParentheses,
				useForSelfInterpreter,
			});

			const bodyText = useForSelfInterpreter
				? bodyString + ")"
				: bodyString;

			if (expression.shorthandText)
			{
				return addHtml
					? /* html */`<span style="color: ${rgbString}">${startText.slice(1)}${expression.shorthandText}${endText.slice(1)}</span>`
					: `${startText.slice(1)}${expression.shorthandText}${endText.slice(1)}`;
			}

			return addHtml
				? /* html */`<span style="color: ${rgbString}">${startText}</span><span style="color: ${literalRgbString}">${lambdaText}</span>${bodyText}<span style="color: ${rgbString}">${endText}</span>`
				: `${startText}${lambdaText}${bodyText}${endText}`;
		}


		
		if (addParentheses)
		{
			const functionStringWithoutHtml = this.expressionToString({
				expression: expression.function,
				addHtml: false,
				addParentheses,
				useForSelfInterpreter,
			});

			if (
				functionStringWithoutHtml.length > 1
				&& functionStringWithoutHtml[0] !== "("
			) {
				expression.function.startText = "(" + (expression.function.startText ?? "");
				expression.function.endText = (expression.function.endText ?? "") + ")";
			}
		}

		const functionString = this.expressionToString({
			expression: expression.function,
			addHtml,
			addParentheses,
			useForSelfInterpreter,
		});



		if (addParentheses)
		{
			const inputStringWithoutHtml = this.expressionToString({
				expression: expression.input,
				addHtml: false,
				addParentheses,
				useForSelfInterpreter,
			});

			if (
				inputStringWithoutHtml.length > 1
				&& inputStringWithoutHtml[0] !== "("
			) {
				expression.input.startText = "(" + (expression.input.startText ?? "");
				expression.input.endText = (expression.input.endText ?? "") + ")";
			}
		}

		const inputString = this.expressionToString({
			expression: expression.input,
			addHtml,
			addParentheses,
			useForSelfInterpreter,
		});



		const color = expression.color;
		const rgb = hsvToRgb(color.h, color.s, color.v * valueFactor);
		const rgbString = convertColor(...rgb);

		const applicationString = useForSelfInterpreter
			? `λa.λb.λc.b(${functionString}${inputString})`
			: `${functionString}${inputString}`;

		if (expression.shorthandText)
		{
			return addHtml
				? /* html */`<span style="color: ${rgbString}">${startText.slice(1)}${expression.shorthandText}${endText.slice(1)}</span>`
				: `${startText.slice(1)}${expression.shorthandText}${endText.slice(1)}`;
		}

		return addHtml
			? /* html */`<span style="color: ${rgbString}">${startText}</span>${applicationString}<span style="color: ${rgbString}">${endText}</span>`
			: `${startText}${applicationString}${endText}`;
	}



	isSubexpressionOf(subexpressionString, expressionString)
	{
		let i = 0;

		for (const char of expressionString)
		{
			if (char === subexpressionString[i])
			{
				i++;
			}

			if (i === subexpressionString.length)
			{
				return true;
			}
		}

		return false;
	}


	// Makes a list of all different beta reductions.
	listAllBetaReductions(expression)
	{
		if (expression.type === APPLICATION)
		{
			const functionBetaReductions = this.listAllBetaReductions(expression.function)
				.map(reduction =>
				{
					const reducedExpression = structuredClone(expression);
					reducedExpression.function = reduction;
					return reducedExpression;
				});

			const inputBetaReductions = this.listAllBetaReductions(expression.input)
				.map(reduction =>
				{
					const reducedExpression = structuredClone(expression);
					reducedExpression.input = reduction;
					return reducedExpression;
				});

			if (expression.function.type === LAMBDA)
			{
				// We need to replace every instance of this variable with the input.
				// However, variables can be shadowed, so we actually have to do this
				// by examining literals' binding lambdas. Thankfully, structuredClone
				// supports circular references, so we don't need to worry about
				// rebinding stuff within input all the time.
				const clonedExpression = structuredClone(expression);

				// It's super important that we take the binding lambda from the
				// *cloned* expression, since otherwise we'll never find anything to replace.
				const expressionToReduce = clonedExpression.function.body;
				const bindingLambdaToReplace = clonedExpression.function;
				const replacementValue = clonedExpression.input;

				// Okay so. We need the replacement value to have different rect IDs
				// than the original expression, but we can't easily update
				// the rectIndex here. Instead, we'll clear the IDs off it and then
				// go back and add them all back in later.
				this.removeExpressionRectIndices(replacementValue);
	
				const betaReduction = this.computeBetaReduction(
					expressionToReduce,
					bindingLambdaToReplace,
					replacementValue
				);
				
				return [
					...functionBetaReductions,
					...inputBetaReductions,
					betaReduction,
				];
			}

			else
			{
				return [
					...functionBetaReductions,
					...inputBetaReductions
				];
			}
		}

		else if (expression.type === LAMBDA)
		{
			const bodyBetaReductions = this.listAllBetaReductions(expression.body)
				.map(reduction =>
				{
					const reducedExpression = structuredClone(expression);
					reducedExpression.body = reduction;
					return reducedExpression;
				});

			return bodyBetaReductions;
		}

		else
		{
			return [];
		}
	}

	// Returns the beta reduction of the expression, replacing any literals
	// with the given binding lambda with replacementValue.
	computeBetaReduction(expression, bindingLambdaToReplace, replacementValue)
	{
		if (expression.type === LITERAL)
		{
			if (expression.bindingLambda === bindingLambdaToReplace)
			{
				return structuredClone(replacementValue);
			}
		}

		else if (expression.type === LAMBDA)
		{
			expression.body = this.computeBetaReduction(
				expression.body,
				bindingLambdaToReplace,
				replacementValue
			);
		}

		else
		{
			expression.function = this.computeBetaReduction(
				expression.function,
				bindingLambdaToReplace,
				replacementValue
			);
			
			expression.input = this.computeBetaReduction(
				expression.input,
				bindingLambdaToReplace,
				replacementValue
			);
		}

		return expression;
	}



	async *animateBetaReduction(expression, betaReducedExpression)
	{
		const oldRectIndex = structuredClone(expression.rectIndex);

		// This stores the actual rects of the new expression so we know where
		// they're supposed to go.
		const newRectIndex = structuredClone(betaReducedExpression.rectIndex);



		const preservedRects = Object.keys(expression.rectIndex).filter(
			rectId => rectId in betaReducedExpression.rectIndex
		);
		
		// We sort these by row, then by column.
		const deletedRects = Object.keys(expression.rectIndex).filter(
			rectId => !(rectId in betaReducedExpression.rectIndex)
		).sort((a, b) =>
		{
			if (
				oldRectIndex[a].row + oldRectIndex[a].height
					!== oldRectIndex[b].row + oldRectIndex[b].height
			) {
				return oldRectIndex[a].row + oldRectIndex[a].height
					- (oldRectIndex[b].row + oldRectIndex[b].height);
			}

			return oldRectIndex[a].col - oldRectIndex[b].col;
		});
		
		// We sort these by ID. The number of these should be an integer multiple of the number
		// of replacement rects, so to ensure they're lined up correctly, we sort each chunk
		// of these later by row, then by column.
		const newRectsById = Object.keys(betaReducedExpression.rectIndex).filter(
			rectId => !(rectId in expression.rectIndex)
		).sort((a, b) => parseInt(a) - parseInt(b));

		
		
		// This is the application bar and its connectors.
		// Determine the bottommost three deleted rects.
		// Note that bottommost means those with the lowest *bottom*,
		// not the lowest row. Also, sometimes literals can be in the last three
		// if they completely overlap a connector bar, so we find the last three
		// rects of type APPLICATION or CONNECTOR.
		const rectsToFadeDown = [];
		let i = deletedRects.length - 1;
		while (rectsToFadeDown.length < 3)
		{
			if (
				oldRectIndex[deletedRects[i]].type === APPLICATION
				|| oldRectIndex[deletedRects[i]].type === CONNECTOR
			) {
				rectsToFadeDown.push(deletedRects[i]);
			}

			i--;
		}

		const deletedLambdaKey = deletedRects.find(key => oldRectIndex[key].type === LAMBDA);

		// The no-longer-used lambda bar (the unique one with type LAMBDA) and all of its literals,
		// which are the rects with type LITERAL that have the same row (+1) as the deleted lambda,
		// *and* have a column within the deleted lambda's column range.
		const rectsToFadeUp = [deletedLambdaKey].concat(
			deletedRects.filter(key =>
			{
				return oldRectIndex[key].type === LITERAL
					&& oldRectIndex[key].row === oldRectIndex[deletedLambdaKey].row + 1
					&& oldRectIndex[key].col >= oldRectIndex[deletedLambdaKey].col
					&& oldRectIndex[key].col < oldRectIndex[deletedLambdaKey].col
						+ oldRectIndex[deletedLambdaKey].width;
			})
		);

		// We resort these by ID so that the colors and groupings work.
		const replacementRects = deletedRects.filter(
			key => !(rectsToFadeDown.includes(key) || rectsToFadeUp.includes(key))
		);



		const newRectChunks = [];
		for (let i = 0; i < newRectsById.length; i += replacementRects.length)
		{
			newRectChunks.push(
				newRectsById.slice(i, i + replacementRects.length).sort((a, b) =>
				{
					if (
						newRectIndex[a].row + newRectIndex[a].height
							!== newRectIndex[b].row + newRectIndex[b].height
					) {
						return newRectIndex[a].row + newRectIndex[a].height
							- (newRectIndex[b].row + newRectIndex[b].height);
					}

					return newRectIndex[a].col - newRectIndex[b].col;
				})
			);
		}

		const newRects = newRectChunks.flat();


		
		// console.log(deletedRects, newRects, replacementRects);
		// console.log(deletedRects.map(key => oldRectIndex[key]));
		// console.log(newRects.map(key => newRectIndex[key]));
		// console.log(replacementRects.map(key => oldRectIndex[key]));


		const replacementIsLiteral = replacementRects
			.every(key =>
			{
				return oldRectIndex[key].type === LITERAL || oldRectIndex[key].type === CONNECTOR;
			});

		// We also need to know the size of the thing
		// we're subbing in so we can keep it on the right.
		let minRow = Infinity;
		let minCol = Infinity;
		let maxRow = 0;
		let maxCol = 0;

		for (const key of replacementRects)
		{
			const rect = oldRectIndex[key];
			minRow = Math.min(minRow, rect.row);
			minCol = Math.min(minCol, rect.col);
			maxRow = Math.max(maxRow, rect.row + rect.height);
			maxCol = Math.max(maxCol, rect.col + rect.width);
		}

		const replacementRectWidth = maxCol - minCol;
		const replacementRectHeight = maxRow - minRow;



		const oldExpressionSize = Math.max(expression.width, expression.height);

		const newExpressionSize = Math.max(
			betaReducedExpression.width,
			betaReducedExpression.height
		);

		// This is the size of the expanded expression
		// plus the replacement thing held off above.
		const expandedExpressionSize = (newRects.length === 0 || replacementIsLiteral)
			? newExpressionSize
			: Math.max(
				Math.max(betaReducedExpression.width, replacementRectWidth),
				// + 3 for the gap and +3 for the margin, *2 since we need
				// to count space above and below.
				betaReducedExpression.height + 2 * (replacementRectHeight + 6)
			);



		// Now we need to figure out where to put the replacement rects.
		const replacementRectTargetRow = betaReducedExpression.row - 3 - replacementRectHeight;
		const replacementRectTargetCol = (newExpressionSize - replacementRectWidth) / 2;
		const replacementRectRowOffset = replacementRectTargetRow - minRow;
		const replacementRectColOffset = replacementRectTargetCol - minCol;

		// If the expression is taller than it is wide, we also need to move the old rects.
		const expandedExpressionRowOffset = replacementIsLiteral
			? 0
			: (expandedExpressionSize - betaReducedExpression.height) / 2
				- betaReducedExpression.row;

		const expandedExpressionColOffset = replacementIsLiteral
			? 0
			: (expandedExpressionSize - betaReducedExpression.width) / 2
				- betaReducedExpression.col;

		for (const key of preservedRects)
		{
			betaReducedExpression.rectIndex[key].row += expandedExpressionRowOffset;
			betaReducedExpression.rectIndex[key].col += expandedExpressionColOffset;
		}


		const rgbOld = Object.fromEntries(
			Object.entries(expression.rectIndex).map(([key, value]) =>
			{
				return [key, getRgbFromColorString(value.color)];
			})
		);

		const rgbNew = Object.fromEntries(
			Object.entries(betaReducedExpression.rectIndex).map(([key, value]) =>
			{
				return [key, getRgbFromColorString(value.color)];
			})
		);

		const numReplacementBlocks = newRects.length / replacementRects.length;



		if (newRects.length % replacementRects.length !== 0 && !replacementIsLiteral)
		{
			throw new Error("Chunking failed.");
		}



		await animate((t) =>
		{
			this.outerExpressionSize = oldExpressionSize;

			for (const key of rectsToFadeDown)
			{
				expression.rectIndex[key].row = oldRectIndex[key].row + t;
				
				const rgb = getRgbFromColorString(oldRectIndex[key].color);
				expression.rectIndex[key].color = convertColor(...rgb, 1 - t);
			}

			for (const key of rectsToFadeUp)
			{
				expression.rectIndex[key].row = oldRectIndex[key].row - t;

				const rgb = getRgbFromColorString(oldRectIndex[key].color);
				expression.rectIndex[key].color = convertColor(...rgb, 1 - t);
			}

			if (newRects.length === 0 || replacementIsLiteral)
			{
				for (const key of replacementRects)
				{
					const rgb = getRgbFromColorString(oldRectIndex[key].color);
					expression.rectIndex[key].color = convertColor(...rgb, 1 - t);
				}
			}

			this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
			this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);
			this.drawExpressionStep(expression);
		}, this.animationTime * 0.5, "easeInOutQuad");

		yield await sleep(this.animationTime / 3);


		// Stretch rects to their new positions and
		// move the replacement block 3px above the whole thing.
		// If the replacement block is a literal, we just skip this.
		await animate((t) =>
		{
			this.outerExpressionSize = (1 - t) * oldExpressionSize
				+ t * expandedExpressionSize;

			for (const key of preservedRects)
			{
				expression.rectIndex[key].row = (1 - t) * oldRectIndex[key].row
					+ t * betaReducedExpression.rectIndex[key].row;

				expression.rectIndex[key].col = (1 - t) * oldRectIndex[key].col
					+ t * betaReducedExpression.rectIndex[key].col;

				expression.rectIndex[key].width = (1 - t) * oldRectIndex[key].width
					+ t * betaReducedExpression.rectIndex[key].width;

				expression.rectIndex[key].height = (1 - t) * oldRectIndex[key].height
					+ t * betaReducedExpression.rectIndex[key].height;
				
				const r = (1 - t) * rgbOld[key][0] + t * rgbNew[key][0];
				const g = (1 - t) * rgbOld[key][1] + t * rgbNew[key][1];
				const b = (1 - t) * rgbOld[key][2] + t * rgbNew[key][2];
				
				expression.rectIndex[key].color = convertColor(r, g, b);
			}

			for (const key of replacementRects)
			{
				expression.rectIndex[key].row = oldRectIndex[key].row
					+ t * (replacementRectRowOffset + expandedExpressionRowOffset);

				expression.rectIndex[key].col = oldRectIndex[key].col
					+ t * (replacementRectColOffset + expandedExpressionColOffset);
			}

			this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
			this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);
			this.drawExpressionStep(expression);
		}, this.animationTime, "easeInOutQuad");

		yield await sleep(this.animationTime / 6);



		if (replacementIsLiteral)
		{
			this.drawExpression(betaReducedExpression);

			yield await sleep(this.animationTime / 6);

			return;
		}

		

		// Now the sleight of hand. Currently we have a stretched copy of the old expression
		// and the replacement block floating above. Making a bunch of new rects and copying
		// them all in would be nasty, but instead, we can just draw the *new* expression
		// and move all of its replacement blocks up to where the block is hovering!

		for (let i = 0; i < numReplacementBlocks; i++)
		{
			for (let j = replacementRects.length * i; j < replacementRects.length * (i + 1); j++)
			{
				const replacementRectKey = replacementRects[j % replacementRects.length];
				const key = newRects[j];

				betaReducedExpression.rectIndex[key].row =
					expression.rectIndex[replacementRectKey].row;
				
				betaReducedExpression.rectIndex[key].col =
					expression.rectIndex[replacementRectKey].col;

				betaReducedExpression.rectIndex[key].width =
					expression.rectIndex[replacementRectKey].width;
				
				betaReducedExpression.rectIndex[key].height =
					expression.rectIndex[replacementRectKey].height;
			}
		}

		const expandedRectIndex = structuredClone(betaReducedExpression.rectIndex);

		for (let i = 0; i < numReplacementBlocks - 1; i++)
		{
			await animate((t) =>
			{
				this.outerExpressionSize = expandedExpressionSize;

				for (
					let j = replacementRects.length * i;
					j < replacementRects.length * (i + 1);
					j++
				) {
					const key = newRects[j];
					
					// For these, we have to add the offset
					// because the whole expression hasn't moved yet.
					betaReducedExpression.rectIndex[key].row =
						(1 - t) * expandedRectIndex[key].row
						+ t * (newRectIndex[key].row + expandedExpressionRowOffset);

					betaReducedExpression.rectIndex[key].col =
						(1 - t) * expandedRectIndex[key].col
						+ t * (newRectIndex[key].col + expandedExpressionColOffset);

					betaReducedExpression.rectIndex[key].width =
						(1 - t) * expandedRectIndex[key].width
						+ t * newRectIndex[key].width;
					
					betaReducedExpression.rectIndex[key].height =
						(1 - t) * expandedRectIndex[key].height
						+ t * newRectIndex[key].height;
				}

				this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
				this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);
				this.drawExpressionStep(betaReducedExpression);
			}, 1.5 * this.animationTime / numReplacementBlocks, "easeInOutQuad");
		}
		
		// For this one, we also update the size.
		// We also need to be able to handle the case where numReplacementBlocks is 0.

		// Now everything in betaReducedExpression needs its offset removed
		// All that means is we need to animate all the rects,
		// including those that were already moved in.
		// To prevent them from animating again, we just update their position
		// in expandedRectIndex.
		for (
			let j = 0;
			j < replacementRects.length * (numReplacementBlocks - 1);
			j++
		) {
			const key = newRects[j];

			expandedRectIndex[key].row = betaReducedExpression.rectIndex[key].row;
			expandedRectIndex[key].col = betaReducedExpression.rectIndex[key].col;
			expandedRectIndex[key].width = betaReducedExpression.rectIndex[key].width;
			expandedRectIndex[key].height = betaReducedExpression.rectIndex[key].height;
		}
		
		if (newRects.length !== 0)
		{
			await animate((t) =>
			{
				this.outerExpressionSize = (1 - t) * expandedExpressionSize
					+ t * newExpressionSize;

				for (const key in newRectIndex)
				{
					betaReducedExpression.rectIndex[key].row =
						(1 - t) * expandedRectIndex[key].row
						+ t * newRectIndex[key].row;

					betaReducedExpression.rectIndex[key].col =
						(1 - t) * expandedRectIndex[key].col
						+ t * newRectIndex[key].col;

					betaReducedExpression.rectIndex[key].width =
						(1 - t) * expandedRectIndex[key].width
						+ t * newRectIndex[key].width;
					
					betaReducedExpression.rectIndex[key].height =
						(1 - t) * expandedRectIndex[key].height
						+ t * newRectIndex[key].height;
				}

				this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
				this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);
				this.drawExpressionStep(betaReducedExpression);
			}, 1.5 * this.animationTime / numReplacementBlocks, "easeInOutQuad");
		}

		// If all went well, this call should be unnoticable!
		this.drawExpression(betaReducedExpression);

		yield await sleep(this.animationTime / 3);
	}



	async animateIteratedBetaReduction(
		expression,
		maxBetaReductions,
		updateExpressionDuringReduction
	) {
		this.animationRunning = true;

		let expressionString = this.expressionToString({
			expression,
			addHtml: false,
		});

		let collapsedExpressionString = expressionString.replaceAll(/a-zA-Z/g, "x")
			.replaceAll(/\(\)/g, "");

		outerLoop: for (let i = 0; i < maxBetaReductions; i++)
		{
			const betaReductions = this.listAllBetaReductions(expression).map(reduction =>
			{
				const string = this.expressionToString({
					expression: reduction,
					addHtml: false,
				});

				const collapsedString = string.replaceAll(/a-zA-Z/g, "x")
					.replaceAll(/\(\)/g, "");

				return {
					expression: reduction,
					expressionString: string,
					collapsedExpressionString: collapsedString,
					isNestedBadly: this.isSubexpressionOf(
						collapsedExpressionString,
						collapsedString
					),
					isNestedVeryBadly: this.isSubexpressionOf(expressionString, string)
				};
			});

			if (betaReductions.length === 0)
			{
				break;
			}

			// Sort expressions by containment, then by string length.
			const sortedBetaReductions = betaReductions.sort((a, b) =>
			{
				if (!a.isNestedVeryBadly && b.isNestedVeryBadly)
				{
					return -1;
				}

				if (a.isNestedVeryBadly && !b.isNestedVeryBadly)
				{
					return 1;
				}

				if (!a.isNestedBadly && b.isNestedBadly)
				{
					return -1;
				}

				if (a.isNestedBadly && !b.isNestedBadly)
				{
					return 1;
				}

				return a.expressionString.length - b.expressionString.length;
			});

			this.setupExpression(sortedBetaReductions[0].expression, true);
			const animation = this.animateBetaReduction(
				expression,
				sortedBetaReductions[0].expression
			);

			// eslint-disable-next-line no-unused-vars
			for await (const _ of animation)
			{
				if (this.needReload)
				{
					break outerLoop;
				}

				if (this.animationPaused)
				{
					await new Promise(resolve => {
						addTemporaryInterval(setInterval(() =>
						{
							if (!this.animationPaused)
							{
								resolve();
							}
						}), 100);
					});
				}
			}

			expression = sortedBetaReductions[0].expression;
			expressionString = sortedBetaReductions[0].expressionString;
			collapsedExpressionString = sortedBetaReductions[0].collapsedExpressionString;

			if (this.expressionTextarea && updateExpressionDuringReduction)
			{
				this.worker && this.worker.terminate();
				this.worker = addTemporaryWorker("/applets/lambda-calculus/scripts/worker.js");

				this.worker.onmessage = e =>
				{
					const { text, html } = e.data;

					this.expressionTextarea.overlayElement.innerHTML = html;
					// this.expressionTextarea.setValue(text);
				};

				this.worker.postMessage({
					expression,
					darkTheme: siteSettings.darkTheme,
					browserSupportsP3,
					browserSupportsRec2020
				});
			}
		}

		if (this.needReload)
		{
			this.needReload = false;
			this.reloadedResolve();
		}

		this.animationRunning = false;
	}
}