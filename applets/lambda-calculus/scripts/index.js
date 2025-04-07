import { showPage } from "../../../scripts/src/loadPage.js";
import { LambdaCalculus } from "./class.js";
import { Button, DownloadButton, ToggleButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { setOnThemeChange } from "/scripts/src/settings.js";
import { Slider } from "/scripts/src/sliders.js";
import { Textarea } from "/scripts/src/textareas.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const applet = new LambdaCalculus({ canvas: $("#output-canvas") });

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
		onInput: run,
		onEnter: () => run(true),
		allowEnter: true,
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

	run();

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

		// Replace ls with lambdas, numbers with Church numerals, and
		// I -> λx.x
		// K -> λx.λy.x
		// S -> λx.λy.λz.(xz)(yz)
		// Y -> λf.(λx.f(xx))(λx.f(xx))
		expressionTextarea.setValue(
			expressionTextarea.value.replaceAll(/l/gi, "λ")
				.replaceAll(/([0-9]+)/g, (match, $1) =>
				{
					const num = parseInt($1);

					return `(λf.λx.${"f(".repeat(num)}x${")".repeat(num)})`;
				})
				.replaceAll(/I/g, "(λx.x)")
				.replaceAll(/K/g, "(λx.λy.x)")
				.replaceAll(/S/g, "(λx.λy.λz.(xz)(yz))")
				.replaceAll(/Y/g, "(λf.(λx.f(xx))(λx.f(xx)))")
		);

		// Remove everything except letters, lambdas, parentheses, dots, and numerals.
		expressionTextarea.setValue(
			expressionTextarea.value.replaceAll(/[^a-km-zA-KM-Zλ().0-9]/g, "")
		);

		// Restore cursor position.
		if (document.activeElement === expressionTextarea.element)
		{
			expressionTextarea.element.setSelectionRange(
				selectionStart + expressionTextarea.value.length - oldLength,
				selectionEnd + expressionTextarea.value.length - oldLength
			);
		}

		const invalidRange = validateString(expressionTextarea.value);

		if (invalidRange !== -1)
		{
			expressionTextarea.overlayElement.innerHTML =
				expressionTextarea.value.slice(0, invalidRange[0])
				+ `<span class="invalid">${expressionTextarea.value.slice(invalidRange[0], invalidRange[1])}</span>`
				+ expressionTextarea.value.slice(invalidRange[1]);

			return;
		}
			
		const html = await applet.run({
			resolution: resolutionInput.value,
			expression: expressionTextarea.value,
			betaReduce
		});

		expressionTextarea.overlayElement.innerHTML = html;
		setTimeout(() => expressionTextarea.overlayElement.innerHTML = html, 50);
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
		let index = expressionString.search(/λ([a-mk-zA-KM-Z0-9])[^.]/g);

		if (index !== -1)
		{
			return [
				index,
				index + expressionString.match(/λ([a-mk-zA-KM-Z0-9])[^.]/g)[0].length
			];
		}

		index = expressionString.search(/λ([a-mk-zA-KM-Z0-9])$/g);
		
		if (index !== -1)
		{
			return [
				index,
				index + expressionString.match(/λ([a-mk-zA-KM-Z0-9])$/g)[0].length
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

		index = expressionString.search(/λ[a-mk-zA-KM-Z0-9]\.$/g);
		
		if (index !== -1)
		{
			return [
				index,
				index + expressionString.match(/λ[a-mk-zA-KM-Z0-9]\.$/g)[0].length
			];
		}

		return -1;
	}



	function onSliderInput()
	{
		applet.animationTime = 500 / animationTimeSlider.value;
	}
}