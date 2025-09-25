import { LambdaCalculus } from "./class.js";
import { Button, DownloadButton, ToggleButton } from "/scripts/components/buttons.js";
import { Checkbox } from "/scripts/components/checkboxes.js";
import { Dropdown } from "/scripts/components/dropdowns.js";
import { Slider } from "/scripts/components/sliders.js";
import { Textarea } from "/scripts/components/textareas.js";
import { $ } from "/scripts/src/main.js";
import { setOnThemeChange } from "/scripts/src/settings.js";

const examples = {
	identity: "λx.x",
	returnLambda: "λx.λy.x",
	evaluation: "λx.xx",
	betaReduction: "(λz.zz)(λx.λy.x)",
	booleans: "&T (| (!F) F)",
	successor: ">3",
	addition: "+34",
	multiplication: "*34",
	exponentiation: "^34",
	division: "/62",
	omega: "Yλx.x",
	recursiveTriangleNumbers: "(Y λf. λn. _(<n) 1 (+ n (f(<n)))) 4",
	recursiveFactorial: "(Y λf. λn. _(<n) 1 (* n (f(<n)))) 4",
	recursiveFibonacci: "(Y λf. λn. _(<n) 1 (+ (f(<(<n))) (f(<n)) )) 4",
	iterativeTriangleNumbers: "(λn.n( λg.λa.λb.g (>a) (+ab) ) (λa.λb.b) 1 0) 4",
	iterativeFactorial: "(λn.n( λg.λa.λb.g (>a) (*ab) ) (λa.λb.b) 1 1) 4",
	iterativeFibonacci: "(λn.n( λg.λa.λb.g (+ab) a ) (λa.λb.b) 1 0) 4",
	knuthUpArrows: "(Yλf.λn.λa.λb.(_(<n)(ba)(((<b)(λg.λc.λd.gc(f(<n)cd)))(λc.λd.d)aa)))223"
};

export default function()
{
	const examplesDropdown = new Dropdown({
		element: $("#examples-dropdown"),
		name: "Examples",
		options: {
			identity: "Identity",
			returnLambda: "Returning a Lambda",
			evaluation: "Evaluation",
			betaReduction: "Beta Reduction",
			booleans: "Booleans",
			successor: "Successor",
			addition: "Addition",
			multiplication: "Multiplication",
			exponentiation: "Exponentiation",
			division: "Division",
			omega: "Omega",
			recursiveTriangleNumbers: "Recursive Triangle Numbers",
			recursiveFactorial: "Recursive Factorial",
			iterativeTriangleNumbers: "Iterative Triangle Numbers",
			iterativeFactorial: "Iterative Factorial",
			iterativeFibonacci: "Iterative Fibonacci",
			knuthUpArrows: "Knuth's Up Arrows"
		},
		onInput: onDropdownInput
	});

	const expressionTextarea = new Textarea({
		element: $("#expression-textarea"),
		name: "Expression",
		value: "*23",
		onInput: () =>
		{
			if (examplesDropdown.value)
			{
				examplesDropdown.setValue({ newValue: "default" });
			}

			run();
		},
		onEnter: () => run(true),
	});

	const applet = new LambdaCalculus({ canvas: $("#output-canvas"), expressionTextarea });

	const expandShorthandsCheckbox = new Checkbox({
		element: $("#expand-shorthands-checkbox"),
		name: "Expand shorthands",
		onInput: () =>
		{
			if (examplesDropdown.value)
			{
				expressionTextarea.setValue(examples[examplesDropdown.value]);
			}

			run();
			setTimeout(() => run(), 50);
		}
	});

	const updateExpressionDuringReduction = new Checkbox({
		element: $("#update-expression-during-reduction-checkbox"),
		name: "Update expression during reduction",
	});

	new Button({
		element: $("#reduce-button"),
		name: "Reduce",
		onClick: () => run(true)
	});

	const playPauseButton = new ToggleButton({
		element: $("#play-pause-button"),
		name0: "Pause",
		name1: "Play",
		persistState: false,
		onClick0: () => applet.animationPaused = true,
		onClick1: () => applet.animationPaused = false
	});

	const animationTimeSlider = new Slider({
		element: $("#animation-time-slider"),
		name: "Animation Speed",
		value: 1,
		min: 0.25,
		max: 20,
		logarithmic: true,
		snapPoints: [0.5, 1, 2, 5, 10],
		onInput: onSliderInput
	});

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: () => "a-lambda-diagram.png"
	});

	setTimeout(() => run(), 10);

	setOnThemeChange(() => run());

	async function run(betaReduce = false)
	{
		await Promise.all([
			expressionTextarea.loaded,
			playPauseButton.loaded,
			animationTimeSlider.loaded,
		]);

		if (playPauseButton.state)
		{
			playPauseButton.setState({ newState: false });
			applet.animationPaused = false;
		}

		const oldLength = expressionTextarea.value.length;

		// Update the textarea.
		const { selectionStart, selectionEnd } = expressionTextarea.element;

		let cursorBump = 0;

		// Replace ls with lambdas.
		expressionTextarea.setValue(
			expressionTextarea.value.replaceAll(/l/g, "λ")
		);

		// Remove everything except valid tokens
		expressionTextarea.setValue(
			expressionTextarea.value.replaceAll(/[^a-km-zA-Zλ().0-9+*^_\-!,<>'"&=|/]/g, "")
				.replaceAll(/\.+/g, match =>
				{
					cursorBump += match.length - 1;
					return ".";
				})
		);

		// Restore cursor position.
		if (document.activeElement === expressionTextarea.element)
		{
			expressionTextarea.element.setSelectionRange(
				selectionStart + expressionTextarea.value.length - oldLength + cursorBump,
				selectionEnd + expressionTextarea.value.length - oldLength + cursorBump
			);
		}

		const invalidRange = validateString(expressionTextarea.value);

		if (invalidRange !== -1)
		{
			const value = expressionTextarea.value.replaceAll(/</g, ";");
			const html = value.slice(0, invalidRange[0])
				+ `<span class="invalid">${value.slice(invalidRange[0], invalidRange[1])}</span>`
				+ value.slice(invalidRange[1]);
			expressionTextarea.overlayElement.innerHTML = html.replaceAll(/;/g, "&lt;");

			return;
		}
			
		const [html, text] = await applet.run({
			expression: expressionTextarea.value,
			expandShorthands: expandShorthandsCheckbox.checked,
			updateExpressionDuringReduction: updateExpressionDuringReduction.checked,
			betaReduce,
		});

		expressionTextarea.setValue(text);
		expressionTextarea.overlayElement.innerHTML = html;

		setTimeout(() =>
		{
			expressionTextarea.overlayElement.innerHTML = html;
		});
	}

	// Returns a range of the first invalid segment, or -1 if there are no invalid characters.
	function validateString(expressionString)
	{
		// Check for parentheses.
		let parenthesesCount = 0;
		let lastParenthesisZeroIndex = expressionString.search(/\(/g);

		for (let i = 0; i < expressionString.length; i++)
		{
			if (expressionString[i] === "(")
			{
				parenthesesCount++;
			}

			else if (expressionString[i] === ")")
			{
				parenthesesCount--;
			}

			if (parenthesesCount < 0)
			{
				return [i, i + 1];
			}

			else if (parenthesesCount === 0)
			{
				lastParenthesisZeroIndex = i + 1;
			}
		}

		if (parenthesesCount !== 0)
		{
			return [lastParenthesisZeroIndex, lastParenthesisZeroIndex + 1];
		}



		// Find lambdas not closed properly.
		let index = expressionString.search(/λ([a-km-zA-Z0-9])[^.]/g);

		if (index !== -1)
		{
			return [
				index,
				index + expressionString.match(/λ([a-km-zA-Z0-9])[^.]/g)[0].length
			];
		}

		index = expressionString.search(/λ([a-km-zA-Z0-9])$/g);
		
		if (index !== -1)
		{
			return [
				index,
				index + expressionString.match(/λ([a-km-zA-Z0-9])$/g)[0].length
			];
		}

		index = expressionString.search(/λ\./g);
		
		if (index !== -1)
		{
			return [
				index,
				index + expressionString.match(/λ\./g)[0].length
			];
		}

		index = expressionString.search(/λ[a-km-zA-Z0-9]\.$/g);
		
		if (index !== -1)
		{
			return [
				index,
				index + expressionString.match(/λ[a-km-zA-Z0-9]\.$/g)[0].length
			];
		}

		return -1;
	}



	function onSliderInput()
	{
		applet.animationTime = 500 / animationTimeSlider.value;
	}

	function onDropdownInput()
	{
		if (examplesDropdown.value)
		{
			expressionTextarea.setValue(
				examples[examplesDropdown.value]
			);

			run();
		}
	}
}
