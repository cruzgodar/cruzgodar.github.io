import { changeOpacity } from "./animation.js";
import { $$, loadScript } from "./main.js";
import { siteSettings } from "./settings.js";

export let desmosPurple = "#772fbf";
export let desmosBlue = "#2f77bf";
export let desmosRed = "#bf2f2f";
export let desmosGreen = "#2fbf2f";
export const desmosBlack = "#000000";

function updateDesmosColors()
{
	desmosPurple = siteSettings.darkTheme ? "#60c000" : "#772fbf";
	desmosBlue = siteSettings.darkTheme ? "#c06000" : "#2f77bf";
	desmosRed = siteSettings.darkTheme ? "#00c0c0" : "#bf2f2f";
	desmosGreen = siteSettings.darkTheme ? "#c000c0" : "#2fbf2f";
}

export let desmosGraphs = {};

export function clearDesmosGraphs()
{
	desmosGraphs = {};
}

let getDesmosData = () => { return {}; };

export function setGetDesmosData(newGetDesmosData)
{
	getDesmosData = newGetDesmosData;
}



export async function createDesmosGraphs(recreating = false)
{
	if (window.OFFLINE)
	{
		return;
	}
	
	await loadScript(
		"https://www.desmos.com/api/v1.11/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"
	);

	for (const key in desmosGraphs)
	{
		if (desmosGraphs[key]?.destroy)
		{
			desmosGraphs[key].destroy();
		}
	}

	desmosGraphs = {};

	updateDesmosColors();

	const data = getDesmosData();

	for (const key in data)
	{
		data[key].expressions.forEach(expression =>
		{
			expression.latex = expression.latex.replace(/\(/g, String.raw`\left(`);
			expression.latex = expression.latex.replace(/\)/g, String.raw`\right)`);

			expression.latex = expression.latex.replace(/\[/g, String.raw`\left[`);
			expression.latex = expression.latex.replace(/\]/g, String.raw`\right]`);
		});
	}

	$$(".desmos-container").forEach(element =>
	{
		const options = {
			keypad: false,
			settingsMenu: false,
			zoomButtons: false,
			showResetButtonOnGraphpaper: true,
			border: false,
			expressionsCollapsed: true,
			invertedColors: siteSettings.darkTheme,

			xAxisMinorSubdivisions: 1,
			yAxisMinorSubdivisions: 1
		};

		if (data[element.id].options)
		{
			for (const key in data[element.id].options)
			{
				options[key] = data[element.id].options[key];
			}
		}



		// eslint-disable-next-line no-undef
		desmosGraphs[element.id] = Desmos.GraphingCalculator(element, options);

		desmosGraphs[element.id].setMathBounds(data[element.id].bounds);

		desmosGraphs[element.id].setExpressions(data[element.id].expressions);

		desmosGraphs[element.id].setDefaultState(desmosGraphs[element.id].getState());

		if (window.DEBUG && !recreating)
		{
			element.addEventListener("click", (e) =>
			{
				if (e.metaKey)
				{
					getDesmosScreenshot(element.id, e.altKey);
				}
			});
		}
	});
}

// Animates out and back in all the Desmos graphs. Used when switching themes.

export async function recreateDesmosGraphs()
{
	const elements = Array.from($$(".desmos-container"));

	if (elements)
	{
		await Promise.all(elements.map(element => changeOpacity({ element, opacity: 0 })));

		await createDesmosGraphs(true);

		await Promise.all(elements.map(element => changeOpacity({ element, opacity: 1 })));
	}
}

export function getDesmosScreenshot(id, forPdf = false)
{
	desmosGraphs[id].updateSettings({
		showGrid: forPdf,
		xAxisNumbers: forPdf,
		yAxisNumbers: forPdf
	});

	const expressions = desmosGraphs[id].getExpressions();

	for (let i = 0; i < expressions.length; i++)
	{
		expressions[i].lineWidth = forPdf ? 5 : 7.5;
		expressions[i].pointSize = forPdf ? 15 : 27;
		expressions[i].dragMode = "NONE";
	}

	desmosGraphs[id].setExpressions(expressions);

	desmosGraphs[id].asyncScreenshot({
		width: 500,
		height: 500,
		targetPixelRatio: 8
	}, imageData =>
	{
		const img = document.createElement("img");
		img.width = 4000;
		img.height = 4000;
		img.style.width = "50vmin";
		img.style.height = "50vmin";
		img.src = imageData;
		document.body.appendChild(img);
	});
}

let uid = 0;

export function getDesmosPoint({
	point, // ["a", "b"]
	color,
	// "", "X", "Y", "XY"
	dragMode = "XY",
	// "POINT", "OPEN", "CROSS"
	style = "POINT",
	secret = true
}) {
	return [
		{ latex: String.raw`(${point[0]}, ${point[1]})`, dragMode, pointStyle: style, color, secret },
	];
}

export function getDesmosSlider({
	expression, // "a = 1"
	min,
	max,
	step,
	secret = true
}) {
	return [
		{ latex: String.raw`${expression}`, sliderBounds: { min, max, step }, secret },
	];
}

export function getDesmosVector({
	from, // ["a", "b"]
	to,   // ["c", "d"]
	color
}) {
	uid++;

	return [
		{ latex: String.raw`(${from[0]}, ${from[1]}), (${to[0]}, ${to[1]})`, color, lines: true, points: false, secret: true },
		{ latex: String.raw`s_{${uid}} = \arctan(${to[1]} - ${from[1]}, ${to[0]} - ${from[0]})`, secret: true },
		{
			latex: String.raw`(${to[0]}, ${to[1]}), (${to[0]} - .35\cos(s_{${uid}} + .5), ${to[1]} - .35\sin(s_{${uid}} + .5))`,
			color,
			lines: true,
			points: false,
			secret: true
		},
		{
			latex: String.raw`(${to[0]}, ${to[1]}), (${to[0]} - .35\cos(s_{${uid}} - .5), ${to[1]} - .35\sin(s_{${uid}} - .5))`,
			color,
			lines: true,
			points: false,
			secret: true
		}
	];
}