import { showPage } from "../../../scripts/src/loadPage.js";
import { LambdaCalculus } from "./class.js";
import { Button, DownloadButton, ToggleButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { Dropdown } from "/scripts/src/dropdowns.js";
import { $ } from "/scripts/src/main.js";
import { setOnThemeChange } from "/scripts/src/settings.js";
import { Slider } from "/scripts/src/sliders.js";
import { Textarea } from "/scripts/src/textareas.js";
import { TextBox } from "/scripts/src/textBoxes.js";

const examples = {
	identity: "λx.x",
	booleans: "&T (| (!F) F)",
	successor: ">3",
	addition: "+34",
	multiplication: "*34",
	exponentiation: "^34",
};

export default function()
{
	const applet = new LambdaCalculus({ canvas: $("#output-canvas") });

	const examplesDropdown = new Dropdown({
		element: $("#examples-dropdown"),
		name: "Examples",
		options: {
			identity: "Identity",
			booleans: "Booleans",
			successor: "Successor",
			addition: "Addition",
			multiplication: "Multiplication",
			exponentiation: "Exponentiation",
		},
		onInput: onDropdownInput
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 2000,
		minValue: 1000,
		maxValue: 3000,
		onEnter: () => run(true),
	});

	const expressionTextarea = new Textarea({
		element: $("#expression-textarea"),
		name: "Expression",
		value: "",
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

	const expandShorthandsCheckbox = new Checkbox({
		element: $("#expand-shorthands-checkbox"),
		name: "Expand shorthands",
		checked: false,
		onInput: () =>
		{
			if (examplesDropdown.value)
			{
				expressionTextarea.setValue(examples[examplesDropdown.value]);
			}

			run();
		}
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
		max: 10,
		logarithmic: true,
		snapPoints: [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		onInput: onSliderInput
	});

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: "a-lambda-diagram.png"
	});

	showPage();

	setTimeout(() => run(), 10);

	setOnThemeChange(() => run());

	async function run(betaReduce = false)
	{
		await Promise.all([
			expressionTextarea.loaded,
			resolutionInput.loaded,
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
			expressionTextarea.value.replaceAll(/[^a-km-zA-Zλ().0-9+*^_\-!,<>'"&|]/g, "")
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
			resolution: resolutionInput.value,
			expression: expressionTextarea.value,
			expandShorthands: expandShorthandsCheckbox.checked,
			betaReduce
		});

		expressionTextarea.setValue(text);
		expressionTextarea.overlayElement.innerHTML = html;
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