import anime from "/scripts/anime.js";
import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { hsvToRgb } from "/scripts/applets/applet.js";
import { siteSettings } from "/scripts/src/settings.js";
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

// The outermost expression also gets a rectIndex field.

export class LambdaCalculus extends AnimationFrameApplet
{
	outerExpressionSize;
	resolution = 2000;
	lambdaIndex = 0;
	numLambdas = 0;
	animationTime = 500;

	nextId = 0;
	nextUniqueArgument = 0;

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

		this.wilson = new WilsonCPU(this.canvas, options);
	}

	run({
		resolution = 2000,
		expression: expressionString,
		betaReduce = false
	}) {
		this.resolution = resolution;
		expressionString = expressionString.replaceAll(/[\n\t\s.]/g, "");

		this.numLambdas = expressionString.split("λ").length - 1;
		this.lambdaIndex = 0;

		const expression = this.parseExpression(expressionString);
		this.validateExpression(expression);
		this.setupExpression(expression);

		this.drawExpression(expression);



		const html = this.expressionToString(expression);

		if (betaReduce)
		{
			this.animateIteratedBetaReduction(expression);
		}

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
					argumentText: argument,
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
					valueText: expressionString[0],
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
	addExpressionBindings(expression, bindings = {}, argumentRewriteMap = {})
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
			if (expression.argument in bindings)
			{
				this.nextUniqueArgument++;

				const oldArgument = expression.argument;
				expression.argument = this.nextUniqueArgument;

				// This variable is already taken, so we'll rewrite it.
				this.addExpressionBindings(expression.body, {
					...bindings,
					[expression.argument]: expression,
				}, {
					[oldArgument]: this.nextUniqueArgument,
				});
			}

			this.addExpressionBindings(expression.body, {
				...bindings,
				[expression.argument]: expression,
			});
		}

		else if (expression.type === APPLICATION)
		{
			this.addExpressionBindings(expression.function, bindings, argumentRewriteMap);
			this.addExpressionBindings(expression.input, bindings, argumentRewriteMap);
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
					color: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
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
				type: CONNECTOR,
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

			const rects = [
				// The connecting bar almost at the bottom.
				{
					type: APPLICATION,
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
					color: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
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
		this.resolution = Math.round(this.resolution / (this.outerExpressionSize + 2))
			* (this.outerExpressionSize + 2);
		
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
	expressionToString(expression)
	{
		const startText = expression.startText ?? "";
		const endText = expression.endText ?? "";

		const valueFactor = siteSettings.darkTheme ? 1 : 0.7;

		if (expression.type === LITERAL)
		{
			const color = expression.bindingLambda.literalColor;
			const rgb = hsvToRgb(color.h, color.s, color.v * valueFactor);
			const rgbString = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

			return `<span style="color: ${rgbString}">${startText}${expression.valueText}${endText}</span>`;
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

			return `<span style="color: ${rgbString}">${startText}</span><span style="color: ${literalRgbString}">λ${expression.argumentText}.</span>${this.expressionToString(expression.body)}<span style="color: ${rgbString}">${endText}</span>`;
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



	async animateBetaReduction(expression, betaReducedExpression)
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
				return [key, value.color.slice(4, -1).split(",").map(Number)];
			})
		);

		const rgbNew = Object.fromEntries(
			Object.entries(betaReducedExpression.rectIndex).map(([key, value]) =>
			{
				return [key, value.color.slice(4, -1).split(",").map(Number)];
			})
		);

		const numReplacementBlocks = newRects.length / replacementRects.length;



		if (newRects.length % replacementRects.length !== 0 && !replacementIsLiteral)
		{
			throw new Error("Chunking failed.");
		}



		const dummy = { t: 0 };

		// Fade out deleted rects.
		await anime({
			targets: dummy,
			t: 1,
			duration: this.animationTime * 0.5,
			easing: "easeInOutQuad",
			update: () =>
			{
				this.outerExpressionSize = oldExpressionSize;

				for (const key of rectsToFadeDown)
				{
					expression.rectIndex[key].row = oldRectIndex[key].row + dummy.t;
					expression.rectIndex[key].color = `rgba(${oldRectIndex[key].color.slice(4, -1)}, ${1 - dummy.t})`;
				}

				for (const key of rectsToFadeUp)
				{
					expression.rectIndex[key].row = oldRectIndex[key].row - dummy.t;
					expression.rectIndex[key].color = `rgba(${oldRectIndex[key].color.slice(4, -1)}, ${1 - dummy.t})`;
				}

				if (newRects.length === 0 || replacementIsLiteral)
				{
					for (const key of replacementRects)
					{
						expression.rectIndex[key].color = `rgba(${oldRectIndex[key].color.slice(4, -1)}, ${1 - dummy.t})`;
					}
				}

				this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
				this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);
				this.drawExpressionStep(expression);
			}
		}).finished;

		await new Promise(resolve => setTimeout(resolve, this.animationTime / 3));



		dummy.t = 0;

		// Stretch rects to their new positions and
		// move the replacement block 3px above the whole thing.
		// If the replacement block is a literal, we just skip this.
		await anime({
			targets: dummy,
			t: 1,
			duration: this.animationTime,
			easing: "easeInOutQuad",
			update: () =>
			{
				this.outerExpressionSize = (1 - dummy.t) * oldExpressionSize
					+ dummy.t * expandedExpressionSize;

				for (const key of preservedRects)
				{
					expression.rectIndex[key].row = (1 - dummy.t) * oldRectIndex[key].row
						+ dummy.t * betaReducedExpression.rectIndex[key].row;

					expression.rectIndex[key].col = (1 - dummy.t) * oldRectIndex[key].col
						+ dummy.t * betaReducedExpression.rectIndex[key].col;

					expression.rectIndex[key].width = (1 - dummy.t) * oldRectIndex[key].width
						+ dummy.t * betaReducedExpression.rectIndex[key].width;

					expression.rectIndex[key].height = (1 - dummy.t) * oldRectIndex[key].height
						+ dummy.t * betaReducedExpression.rectIndex[key].height;
					
					const r = (1 - dummy.t) * rgbOld[key][0] + dummy.t * rgbNew[key][0];
					const g = (1 - dummy.t) * rgbOld[key][1] + dummy.t * rgbNew[key][1];
					const b = (1 - dummy.t) * rgbOld[key][2] + dummy.t * rgbNew[key][2];

					expression.rectIndex[key].color = `rgb(${r}, ${g}, ${b})`;
				}

				for (const key of replacementRects)
				{
					expression.rectIndex[key].row = oldRectIndex[key].row
						+ dummy.t * (replacementRectRowOffset + expandedExpressionRowOffset);

					expression.rectIndex[key].col = oldRectIndex[key].col
						+ dummy.t * (replacementRectColOffset + expandedExpressionColOffset);
				}

				this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
				this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);
				this.drawExpressionStep(expression);
			}
		}).finished;

		await new Promise(resolve => setTimeout(resolve, this.animationTime / 3));



		if (replacementIsLiteral)
		{
			this.drawExpression(betaReducedExpression);

			await new Promise(resolve => setTimeout(resolve, this.animationTime / 3));

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
			dummy.t = 0;

			await anime({
				targets: dummy,
				t: 1,
				duration: 1.5 * this.animationTime / numReplacementBlocks,
				easing: "easeInOutQuad",
				update: () =>
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
							(1 - dummy.t) * expandedRectIndex[key].row
							+ dummy.t * (newRectIndex[key].row + expandedExpressionRowOffset);

						betaReducedExpression.rectIndex[key].col =
							(1 - dummy.t) * expandedRectIndex[key].col
							+ dummy.t * (newRectIndex[key].col + expandedExpressionColOffset);

						betaReducedExpression.rectIndex[key].width =
							(1 - dummy.t) * expandedRectIndex[key].width
							+ dummy.t * newRectIndex[key].width;
						
						betaReducedExpression.rectIndex[key].height =
							(1 - dummy.t) * expandedRectIndex[key].height
							+ dummy.t * newRectIndex[key].height;
					}

					this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
					this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);
					this.drawExpressionStep(betaReducedExpression);
				}
			}).finished;
		}

		dummy.t = 0;
		
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
			await anime({
				targets: dummy,
				t: 1,
				duration: 1.5 * this.animationTime / numReplacementBlocks,
				easing: "easeInOutQuad",
				update: () =>
				{
					this.outerExpressionSize = (1 - dummy.t) * expandedExpressionSize
						+ dummy.t * newExpressionSize;

					for (const key in newRectIndex)
					{
						betaReducedExpression.rectIndex[key].row =
							(1 - dummy.t) * expandedRectIndex[key].row
							+ dummy.t * newRectIndex[key].row;

						betaReducedExpression.rectIndex[key].col =
							(1 - dummy.t) * expandedRectIndex[key].col
							+ dummy.t * newRectIndex[key].col;

						betaReducedExpression.rectIndex[key].width =
							(1 - dummy.t) * expandedRectIndex[key].width
							+ dummy.t * newRectIndex[key].width;
						
						betaReducedExpression.rectIndex[key].height =
							(1 - dummy.t) * expandedRectIndex[key].height
							+ dummy.t * newRectIndex[key].height;
					}

					this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
					this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);
					this.drawExpressionStep(betaReducedExpression);
				}
			}).finished;
		}

		// If all went well, this call should be unnoticable!
		this.drawExpression(betaReducedExpression);

		await new Promise(resolve => setTimeout(resolve, this.animationTime / 3));
	}



	async animateIteratedBetaReduction(expression)
	{
		for (;;)
		{
			const betaReductions = this.listAllBetaReductions(expression);

			if (betaReductions.length === 0)
			{
				break;
			}

			// Find the one with the smallest area.
			let minArea = Infinity;
			let minAreaIndex = 0;


			for (let i = 0; i < betaReductions.length; i++)
			{
				this.setupExpression(betaReductions[i], true);
				const area = betaReductions[i].width * betaReductions[i].height;

				if (area < minArea)
				{
					minArea = area;
					minAreaIndex = i;
				}
			}

			this.setupExpression(betaReductions[minAreaIndex], true);
			await this.animateBetaReduction(expression, betaReductions[minAreaIndex]);

			expression = betaReductions[minAreaIndex];
		}
	}
}