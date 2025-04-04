import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { hsvToRgb } from "/scripts/applets/applet.js";
import { siteSettings } from "/scripts/src/settings.js";
import { WilsonCPU } from "/scripts/wilson.js";

const LITERAL = 0; // { value, bindingLambda }
const LAMBDA = 1; // { argument, body }
const APPLICATION = 2; // { function, input }

// Additionally, every expression has row, col, width, and height.
// Each also has rect: { row, col, width, height }, which is the part actually used for drawing.
// And also color: { h, s, v }.
// Lambdas get a literalColor field too.
// Applications get a startText and endText field.

export class LambdaCalculus extends AnimationFrameApplet
{
	resolution = 2000;
	lambdaIndex = 0;
	numLambdas = 0;

	constructor({ canvas })
	{
		super(canvas);

		const options =
		{
			canvasWidth: this.resolution,

			fullscreenOptions: {
				useFullscreenButton: true,

				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
			}
		};

		this.canvas.style.imageRendering = "pixelated";

		this.wilson = new WilsonCPU(this.canvas, options);
	}

	run({
		expression: expressionString
	}) {
		expressionString = expressionString.replaceAll(/[\n\t\s.]/g, "");

		this.numLambdas = expressionString.split("λ").length - 1;
		this.lambdaIndex = 0;
		const expression = this.parseExpression(expressionString);
		this.validateExpression(expression);
		this.setupExpression(expression);
		this.drawExpression(expression);

		const html = this.expressionToString(expression);

		// const reductions = this.listAllBetaReductions(expression);
		// console.log(reductions.map(reduction => this.expressionToString(reduction)));
		// this.setupExpression(reductions[0]);
		// this.drawExpression(reductions[0]);

		return html;
	}
	
	parseExpression(expressionString)
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
					body: this.parseExpression(body),
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

				const subExpression = this.parseExpression(expressionString.slice(1, i - 1));
				subExpression.startText = "(" + (subExpression.startText ?? "");
				subExpression.endText = (subExpression.endText ?? "") + ")";

				terms.push(subExpression);
				expressionString = expressionString.slice(i);
			}

			else
			{
				terms.push({
					type: LITERAL,
					value: expressionString[0],
				});
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

	// Adds size, location, rect, and color info to an expression.
	setupExpression(expression)
	{
		this.addExpressionSize(expression);
		const size = Math.max(expression.width, expression.height);
		expression.row = Math.max(Math.round((size - expression.height) / 2), 0);
		expression.col = Math.max(Math.round((size - expression.width) / 2), 0);

		this.addExpressionLocation(expression);
		this.addExpressionBindings(expression);
		this.addExpressionColors(expression);
		this.addExpressionRects(expression);
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
	addExpressionBindings(expression, bindings = {})
	{
		if (expression.type === LITERAL)
		{
			expression.bindingLambda = bindings[expression.value];
		}

		else if (expression.type === LAMBDA)
		{
			this.addExpressionBindings(expression.body, {
				...bindings,
				[expression.argument]: expression,
			});
		}

		else
		{
			this.addExpressionBindings(expression.function, bindings);
			this.addExpressionBindings(expression.input, bindings);
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
	addExpressionRects(expression)
	{
		if (expression.type === LAMBDA)
		{
			const rgb = hsvToRgb(
				expression.literalColor.h,
				expression.literalColor.s,
				expression.literalColor.v
			);

			expression.rects = [
				{
					color: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
					row: expression.row,
					col: expression.col,
					width: expression.width,
					height: 1
				},
			];

			this.addExpressionRects(expression.body);
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
				color: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
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
				color: `rgb(${rgb2[0]}, ${rgb2[1]}, ${rgb2[2]})`,
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

			expression.rects = [
				// The connecting bar almost at the bottom.
				{
					color: `rgb(${rgb3[0]}, ${rgb3[1]}, ${rgb3[2]})`,
					row: expression.row + expression.height - 2,
					// Adjust to ensure we're connecting exactly to the function and inputs.
					col: expression.col + 1,
					width: expression.function.width + 2,
					height: 1
				},
				functionConnector,
				inputConnector,
			];

			this.addExpressionRects(expression.function);
			this.addExpressionRects(expression.input);
		}
		
		else
		{
			const rgb = hsvToRgb(expression.color.h, expression.color.s, expression.color.v);

			// We still need to connect this literal to its binding lambda
			// To handle cases like lx.(x(ly.x)).
			expression.rects = [
				{
					color: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
					row: expression.bindingLambda.row + 1,
					col: expression.col + 1,
					width: 1,
					height: expression.row - 1 - (expression.bindingLambda.row + 1) + 1,
				}
			];
		}
	}

	drawExpression(expression)
	{
		const size = Math.max(expression.width, expression.height);
		
		this.wilson.resizeCanvas({ width: size + 2 });
		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, size + 2, size + 2);
		this.drawExpressionStep(expression);
	}

	drawExpressionStep(expression)
	{
		for (const rect of expression.rects)
		{
			this.wilson.ctx.fillStyle = rect.color;
			this.wilson.ctx.fillRect(rect.col + 1, rect.row + 1, rect.width, rect.height);
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
	expressionToString(expression)
	{
		const startText = expression.startText ?? "";
		const endText = expression.endText ?? "";

		const valueFactor = siteSettings.darkTheme ? 1 : 0.75;

		if (expression.type === LITERAL)
		{
			const color = expression.bindingLambda.literalColor;
			const rgb = hsvToRgb(color.h, color.s, color.v * valueFactor);
			const rgbString = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

			return `<span style="color: ${rgbString}">${startText}${expression.value}${endText}</span>`;
		}

		if (expression.type === LAMBDA)
		{
			const literalColor = expression.literalColor;
			const literalRgb = hsvToRgb(
				literalColor.h,
				literalColor.s,
				literalColor.v * valueFactor
			);
			const literalRgbString = `rgb(${literalRgb[0]}, ${literalRgb[1]}, ${literalRgb[2]})`;

			const color = expression.color;
			const rgb = hsvToRgb(color.h, color.s, color.v * valueFactor);
			const rgbString = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

			return `<span style="color: ${rgbString}">${startText}</span><span style="color: ${literalRgbString}">λ${expression.argument}.</span>${this.expressionToString(expression.body)}<span style="color: ${rgbString}">${endText}</span>`;
		}

		const functionString = this.expressionToString(expression.function);
		const inputString = this.expressionToString(expression.input);

		const color = expression.color;
		const rgb = hsvToRgb(color.h, color.s, color.v * valueFactor);
		const rgbString = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

		return `<span style="color: ${rgbString}">${startText}</span>${functionString}${inputString}<span style="color: ${rgbString}">${endText}</span>`;
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
}