import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { WilsonCPU } from "/scripts/wilson.js";

const LITERAL = 0; // { value, bindingLambda }
const LAMBDA = 1; // { argument, body }
const APPLICATION = 2; // { function, input }

// Additionally, every expression has row, col, width, and height.
// Finally, each has rect: { row, col, width, height }, which is the part actually used
// for drawing.

export class LambdaCalculus extends AnimationFrameApplet
{
	resolution = 2000;

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

		const expression = this.parseExpression(expressionString);

		this.validateExpression(expression);



		this.addExpressionSize(expression);

		expression.row = 0;
		expression.col = 0;
		this.addExpressionLocation(expression);

		this.addExpressionBindings(expression);

		this.addExpressionRects(expression);

		const size = Math.max(expression.width, expression.height);
		this.wilson.resizeCanvas({ width: size + 2 });
		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, size + 2, size + 2);
		this.drawExpression(expression);
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
					body: this.parseExpression(body)
				});

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

				terms.push(this.parseExpression(expressionString.slice(1, i - 1)));
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

	// Adds the rects fields to each expression recursively,
	// which is an array of objects with row, col, width, and height fields.
	addExpressionRects(expression)
	{
		if (expression.type === LAMBDA)
		{
			expression.rects = [
				{
					color: "rgb(255, 255, 255)",
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
			// Vertical connecting bars up to the function and input.
			const functionConnector = {
				col: expression.col + 1,
				width: 1,
			};
			
			// Connect to the bottom of the lambda.
			if (expression.function.type === LAMBDA)
			{
				functionConnector.color = "rgb(255, 255, 255)";
				functionConnector.row = expression.function.row + expression.function.height - 1;
			}
			
			// Connect to the top of the literal's binding lambda.
			else if (expression.function.type === LITERAL)
			{
				functionConnector.color = "rgb(255, 255, 255)";
				functionConnector.row = expression.function.bindingLambda.row + 1;
			}

			// Connect to the bottom of the application.
			else
			{
				functionConnector.color = "rgb(255, 255, 255)";
				functionConnector.row = expression.function.row + expression.function.height - 1;
			}

			functionConnector.height = expression.row + expression.height - 3
				- functionConnector.row + 1;



			const inputConnector = {
				col: expression.col + expression.function.width + 2,
				width: 1,
			};

			if (expression.input.type === LAMBDA)
			{
				inputConnector.color = "rgb(255, 255, 255)";
				inputConnector.row = expression.input.row + expression.input.height - 1;
			}
			
			else if (expression.input.type === LITERAL)
			{
				inputConnector.color = "rgb(255, 255, 255)";
				inputConnector.row = expression.input.bindingLambda.row + 1;
			}

			else
			{
				inputConnector.color = "rgb(255, 255, 255)";
				inputConnector.row = expression.input.row + expression.input.height - 1;
			}

			inputConnector.height = expression.row + expression.height - 3
				- inputConnector.row + 1;



			expression.rects = [
				// The connecting bar almost at the bottom.
				{
					color: "rgb(255, 255, 255)",
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
			// We still need to connect this literal to its binding lambda
			// To handle cases like lx.(x(ly.x)).
			expression.rects = [
				{
					color: "rgb(255, 255, 255)",
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
		for (const rect of expression.rects)
		{
			this.wilson.ctx.fillStyle = rect.color;
			this.wilson.ctx.fillRect(rect.col + 1, rect.row + 1, rect.width, rect.height);
		}

		if (expression.type === LAMBDA)
		{
			this.drawExpression(expression.body);
		}

		else if (expression.type === APPLICATION)
		{
			this.drawExpression(expression.function);
			this.drawExpression(expression.input);
		}
	}
}