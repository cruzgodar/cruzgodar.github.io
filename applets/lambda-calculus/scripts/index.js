import { showPage } from "../../../scripts/src/loadPage.js";
import { LambdaCalculus } from "./class.js";
import { Button, DownloadButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { setOnThemeChange } from "/scripts/src/settings.js";
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
		onEnter: run,
	});

	const expressionTextarea = new Textarea({
		element: $("#expression-textarea"),
		name: "Expression",
		value: "",
		onInput: run,
		allowEnter: true,
	});

	new Button({
		element: $("#evaluate-button"),
		name: "Evaluate",
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: "lambda-calculus.png"
	});

	showPage();

	run();

	setOnThemeChange(() => run());

	async function run()
	{
		await expressionTextarea.loaded;

		// Update the textarea.
		const { selectionStart, selectionEnd } = expressionTextarea.element;

		// Replace ls with lambdas.
		expressionTextarea.setValue(
			expressionTextarea.value.replaceAll(/l/g, "λ")
		);

		// Remove everything except letters, lambdas, parentheses, dots, and whitespace.
		expressionTextarea.setValue(
			expressionTextarea.value.replaceAll(/[^a-km-zA-KM-Zλ().]/g, "")
		);

		// Restore cursor position.
		expressionTextarea.element.setSelectionRange(
			selectionStart,
			selectionEnd
		);

		const invalidRange = validateString(expressionTextarea.value);

		if (invalidRange !== -1)
		{
			expressionTextarea.overlayElement.innerHTML =
				expressionTextarea.value.slice(0, invalidRange[0])
				+ `<span class="invalid">${expressionTextarea.value.slice(invalidRange[0], invalidRange[1])}</span>`
				+ expressionTextarea.value.slice(invalidRange[1]);

			return;
		}


			
		const html = applet.run({
			expression: expressionTextarea.value
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
		let index = expressionString.search(/λ([a-mk-zA-KM-Z])[()λ]/g);

		if (index !== -1)
		{
			return [
				index,
				index + expressionString.match(/λ([a-mk-zA-KM-Z])[()λ]/g)[0].length
			];
		}



		index = expressionString.search(/λ([a-mk-zA-KM-Z])$/g);
		
		if (index !== -1)
		{
			return [
				index,
				index + expressionString.match(/λ([a-mk-zA-KM-Z])$/g)[0].length
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

		index = expressionString.search(/λ[a-mk-zA-KM-Z]\.$/g);
		
		if (index !== -1)
		{
			return [
				index,
				index + expressionString.match(/λ[a-mk-zA-KM-Z]\.$/g)[0].length
			];
		}

		return -1;
	}
}