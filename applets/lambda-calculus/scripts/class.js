import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { WilsonCPU } from "/scripts/wilson.js";

const LITERAL = 0; // { value }
const LAMBDA = 1; // { argument, body }
const APPLICATION = 2; // { function, input }

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

		this.wilson = new WilsonCPU(this.canvas, options);
	}

	run({
		expression: expressionString
	}) {
		expressionString = expressionString.replaceAll(/[\n\t.]/g, "")
			.replaceAll(/\s+/g, " ");
		
		if (
			expressionString.length === 0
			|| (expressionString[0] !== "λ" && expressionString[0] !== "(")
		) {
			throw new Error("Lambda expressions must start with λ.");
		}

		const expression = this.parseExpression(expressionString);

		console.log(expression);

		this.validateExpression(expression);
	}
	
	// Converts a string expression to a nested array. Each is of the form
	// [variable, return value, input]
	parseExpression(expressionString)
	{
		console.log(expressionString);
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
			if (scopedVariables.includes(expression.argument))
			{
				throw new Error(`Variable ${expression.argument} is already in scope.`);
			}

			return this.validateExpression(
				expression.body,
				[...scopedVariables, expression.argument]
			);
		}

		return this.validateExpression(expression.function, scopedVariables)
			&& this.validateExpression(expression.input, scopedVariables);
	}
}