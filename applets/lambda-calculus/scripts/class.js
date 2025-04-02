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
		expression: expressionString,
	}) {
		expressionString = expressionString.replaceAll(/[\n\t.]/g, "")
			.replaceAll(/\s+/g, " ");
		
		if (
			expressionString.length === 0
			|| (expressionString[0] !== "λ" && expressionString[0] !== "(")
		) {
			throw new Error("Lambda expressions must start with λ.");
		}

		console.log(this.parseExpression(expressionString));
	}
	
	// Converts a string expression to a nested array. Each is of the form
	// [variable, return value, input]
	parseExpression(expressionString)
	{
		if (expressionString.length === 0)
		{
			throw new Error("Empty expression.");
		}

		if (expressionString.length === 1)
		{
			return {
				type: LITERAL,
				value: expressionString[0],
			};
		}

		if (expressionString[0] === "λ")
		{
			if (expressionString.length < 3)
			{
				throw new Error("Expression too short.");
			}

			const argument = expressionString[1];
			const body = expressionString.slice(2);

			return {
				type: LAMBDA,
				argument,
				body: this.parseExpression(body)
			};
		}

		else if (expressionString[0] === "(")
		{
			if (expressionString[expressionString.length - 1] !== ")")
			{
				throw new Error("Mismatched parentheses.");
			}

			// If the first expression starts with a parenthesis,
			// ditch it and scan until there's a matching closing one.
			if (expressionString[1] === "(")
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

				return {
					type: APPLICATION,
					function: this.parseExpression(expressionString.slice(2, i - 1)),
					input: this.parseExpression(expressionString.slice(i + 1, expressionString.length - 1)),
				};
			}

			// Otherwise, use the first space appearing at the shallowest depth
			// as the separator if there is one.

			let i = 1;
			let parenthesisCount = 1;

			while (i < expressionString.length && !(parenthesisCount === 1 && expressionString[i] === " "))
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
			
			// Take the very last character as the input and the first stuff as the function.
			if (i === expressionString.length)
			{
				return {
					type: APPLICATION,
					function: this.parseExpression(expressionString.slice(1, expressionString.length - 2)),
					input: {
						type: LITERAL,
						value: expressionString[expressionString.length - 2],
					}
				};
			}
			return {
				type: APPLICATION,
				function: this.parseExpression(expressionString.slice(1, i)),
				input: this.parseExpression(expressionString.slice(i + 1, expressionString.length - 1)),
			};
		}
	}
}