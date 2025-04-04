import { showPage } from "../../../scripts/src/loadPage.js";
import { LambdaCalculus } from "./class.js";
import { Button, DownloadButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
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
		onInput: updateTextarea,
		onEnter: run,
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

	function updateTextarea()
	{
		const { selectionStart, selectionEnd } = expressionTextarea.element;

		// Replace ls with lambdas.
		expressionTextarea.setValue(
			expressionTextarea.value.replaceAll(/l/g, "λ")
		);

		// Remove everything except letters, lambdas, parentheses, dots, and whitespace.
		expressionTextarea.setValue(
			expressionTextarea.value.replaceAll(/[^a-km-zA-KM-Zλ().\n\t ]/g, "")
		);

		// Restore cursor position.
		expressionTextarea.element.setSelectionRange(
			selectionStart,
			selectionEnd
		);
	}

	function run()
	{
		const parsedValue = expressionTextarea.value
			.replaceAll(/λ([a-mk-zA-KM-Z]+?)\./g, (match, $1) =>
			{
				const variables = $1.split("");
				return `λ${variables.join(".λ")}.`;
			});
			
		applet.run({
			expression: parsedValue
		});
	}
}