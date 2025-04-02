import { showPage } from "../../../scripts/src/loadPage.js";
import { MaurerRoses } from "./class.js";
import { Button, DownloadButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { Textarea } from "/scripts/src/textareas.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const applet = new MaurerRoses({ canvas: $("#output-canvas") });

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 2000,
		minValue: 1000,
		maxValue: 3000,
		onInput: redraw,
		onEnter: run,
	});

	const expressionTextarea = new Textarea({
		element: $("#expression-textarea"),
		name: "Expression",
		value: "",
		onInput: updateTextarea,
		onEnter: run,
		allowEnter: true,
	});

	let lastValue = expressionTextarea.value;

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

	function redraw()
	{
		
	}

	function updateTextarea()
	{
		const { selectionStart, selectionEnd } = expressionTextarea.element;
		const valueBeforeReplacement = expressionTextarea.value;
		let cursorBump = 0;

		// Remove ephemeral tokens.
		if (expressionTextarea.value.length < lastValue.length)
		{
			const index = findRemovedCharIndex(lastValue, expressionTextarea.value);

			if (lastValue[index] === "." && index !== 0)
			{
				expressionTextarea.setValue(
					expressionTextarea.value.slice(0, index - 1) +
					expressionTextarea.value.slice(index + 1)
				);
			}

			else if (
				lastValue[index] === "("
				&& index !== expressionTextarea.value.length - 1
				&& lastValue[index + 1] === ")"
			) {
				expressionTextarea.setValue(
					expressionTextarea.value.slice(0, index) +
					expressionTextarea.value.slice(index + 1)
				);
			}
		}

		else if (selectionStart !== 0 && expressionTextarea.value[selectionStart - 1] === "(")
		{
			const numLeftParens = expressionTextarea.value.split("(").length - 1;
			const numRightParens = expressionTextarea.value.split(")").length - 1;

			if (numLeftParens === numRightParens + 1)
			{
				expressionTextarea.setValue(
					expressionTextarea.value.slice(0, selectionStart) + ")"
					+ expressionTextarea.value.slice(selectionStart)
				);
			}
		}

		// Replace ls with lambdas.
		expressionTextarea.setValue(
			expressionTextarea.value.replaceAll(/l/g, "λ")
		);

		// Disallow multiple lambdas.
		expressionTextarea.setValue(
			expressionTextarea.value.replaceAll(/λ+/g, (match) =>
			{
				cursorBump -= match.length - 1;
				return "λ";
			})
		);

		// Add dots after lambdas with with an argument and nowhere else.
		expressionTextarea.setValue(expressionTextarea.value.replaceAll(/\./g, () =>
		{
			cursorBump--;
			return "";
		}));

		expressionTextarea.setValue(
			expressionTextarea.value
				.replaceAll(/λ([a-km-zA-KM-Z])/g, (match, $1) =>
				{
					cursorBump++;
					return `λ${$1}.`;
				})
		);

		// Restore cursor position.
		expressionTextarea.element.setSelectionRange(
			selectionStart + cursorBump,
			selectionEnd + cursorBump
		);

		lastValue = expressionTextarea.value;
	}

	function run()
	{
		applet.run({
			expression: expressionTextarea.value,
		});
	}

	function findRemovedCharIndex(str1, str2)
	{
		for (let i = 0; i < str1.length; i++)
		{
			if (str1[i] !== str2[i])
			{
				return i;
			}
		}

		return str1.length;
	}
}