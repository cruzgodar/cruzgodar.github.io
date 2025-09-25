"use strict";

function hsvToRgb(h, s, v)
{
	function f(n)
	{
		const k = (n + 6 * h) % 6;
		return v - v * s * Math.max(0, Math.min(k, Math.min(4 - k, 1)));
	}

	return [255 * f(5), 255 * f(3), 255 * f(1)];
}

function convertColor(browserSupportsP3, browserSupportsRec2020, r, g, b, a)
{
	if (browserSupportsRec2020)
	{
		return `color(rec2020 ${r / 255} ${g / 255} ${b / 255} / ${a ?? 1})`;
	}

	if (browserSupportsP3)
	{
		return `color(display-p3 ${r / 255} ${g / 255} ${b / 255} / ${a ?? 1})`;
	}

	return `rgba(${r}, ${g}, ${b}, ${a ?? 1})`;
}

const LITERAL = 0; // { value, bindingLambda }
const LAMBDA = 1; // { argument, body }

// Converts an expression to a colored string. Does not support self-interpreter.
function expressionToString({
	expression,
	addHtml = true,
	darkTheme = false,
	browserSupportsP3,
	browserSupportsRec2020
}) {
	const startText = expression.startText ?? "";
	const endText = expression.endText ?? "";

	const valueFactor = darkTheme ? 1 : 0.7;

	if (expression.type === LITERAL)
	{
		const color = expression.bindingLambda.literalColor;
		const rgb = hsvToRgb(color.h, color.s, color.v * valueFactor);
		const rgbString = convertColor(browserSupportsP3, browserSupportsRec2020, ...rgb);

		const valueText = expression.valueText;

		if (expression.shorthandText)
		{
			return addHtml
				? /* html */`<span style="color: ${rgbString}">${startText.slice(1)}${expression.shorthandText}${endText.slice(1)}</span>`
				: `${startText.slice(1)}${expression.shorthandText}${endText.slice(1)}`;
		}

		return addHtml
			? /* html */`<span style="color: ${rgbString}">${startText}${valueText}${endText}</span>`
			: `${startText}${valueText}${endText}`;
	}

	if (expression.type === LAMBDA)
	{
		const literalColor = expression.literalColor;
		const literalRgb = hsvToRgb(
			literalColor.h,
			literalColor.s,
			literalColor.v * valueFactor
		);
		const literalRgbString = convertColor(
			browserSupportsP3,
			browserSupportsRec2020,
			...literalRgb
		);

		const color = expression.color;
		const rgb = hsvToRgb(color.h, color.s, color.v * valueFactor);
		const rgbString = convertColor(
			browserSupportsP3,
			browserSupportsRec2020,
			...rgb
		);

		const lambdaText = `λ${expression.argumentText}.`;

		const bodyString = expressionToString({
			expression: expression.body,
			addHtml,
			darkTheme,
		});

		const bodyText = bodyString;

		if (expression.shorthandText)
		{
			return addHtml
				? /* html */`<span style="color: ${rgbString}">${startText.slice(1)}${expression.shorthandText}${endText.slice(1)}</span>`
				: `${startText.slice(1)}${expression.shorthandText}${endText.slice(1)}`;
		}

		return addHtml
			? /* html */`<span style="color: ${rgbString}">${startText}</span><span style="color: ${literalRgbString}">${lambdaText}</span>${bodyText}<span style="color: ${rgbString}">${endText}</span>`
			: `${startText}${lambdaText}${bodyText}${endText}`;
	}

	const functionStringWithoutHtml = expressionToString({
		expression: expression.function,
		addHtml: false,
		darkTheme
	});

	if (
		functionStringWithoutHtml.length > 1
		&& functionStringWithoutHtml[0] !== "("
	) {
		expression.function.startText = "(" + (expression.function.startText ?? "");
		expression.function.endText = (expression.function.endText ?? "") + ")";
	}

	const functionString = expressionToString({
		expression: expression.function,
		addHtml,
		darkTheme
	});



	const inputStringWithoutHtml = expressionToString({
		expression: expression.input,
		addHtml: false,
		darkTheme
	});

	if (
		inputStringWithoutHtml.length > 1
		&& inputStringWithoutHtml[0] !== "("
	) {
		expression.input.startText = "(" + (expression.input.startText ?? "");
		expression.input.endText = (expression.input.endText ?? "") + ")";
	}

	const inputString = expressionToString({
		expression: expression.input,
		addHtml,
	});



	const color = expression.color;
	const rgb = hsvToRgb(color.h, color.s, color.v * valueFactor);
	const rgbString = convertColor(
		browserSupportsP3,
		browserSupportsRec2020,
		...rgb
	);

	const applicationString = `${functionString}${inputString}`;

	if (expression.shorthandText)
	{
		return addHtml
			? /* html */`<span style="color: ${rgbString}">${startText.slice(1)}${expression.shorthandText}${endText.slice(1)}</span>`
			: `${startText.slice(1)}${expression.shorthandText}${endText.slice(1)}`;
	}

	return addHtml
		? /* html */`<span style="color: ${rgbString}">${startText}</span>${applicationString}<span style="color: ${rgbString}">${endText}</span>`
		: `${startText}${applicationString}${endText}`;
}

// e.data is of the form { expression, darkTheme, browserSupportsP3, browserSupportsRec2020 }
onmessage = (e) =>
{
	const text = expressionToString({
		...e.data,
		addHtml: false,
	});

	const html = expressionToString({
		...e.data,
		addHtml: true,
	});

	postMessage({ text, html });
};