import { changeOpacity } from "./animation.js";
import { $$, loadScript, raw } from "./main.js";
import { siteSettings } from "./settings.js";

export let desmosPurple = "#772fbf";
export let desmosBlue = "#2f77bf";
export let desmosRed = "#bf2f2f";
export let desmosGreen = "#2fbf2f";
export const desmosBlack = "#000000";

// 3d graphs don't invert graph colors in invert mode.
export const desmosPurple3d = "#772fbf";
export const desmosBlue3d = "#2f77bf";
export const desmosRed3d = "#bf2f2f";
export const desmosGreen3d = "#2fbf2f";
export let desmosBlack3d = "#333333";


function updateDesmosColors()
{
	desmosPurple = siteSettings.darkTheme ? "#60c000" : "#772fbf";
	desmosBlue = siteSettings.darkTheme ? "#c06000" : "#2f77bf";
	desmosRed = siteSettings.darkTheme ? "#00c0c0" : "#bf2f2f";
	desmosGreen = siteSettings.darkTheme ? "#c000c0" : "#2fbf2f";

	desmosBlack3d = siteSettings.darkTheme ? "#cccccc" : "#333333";
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



// Each entry in a Desmos data object is of the form
// {
// 	expressions: a list of obejcts containing the fields latex
//  and optionally color, lines, points, hidden, secret, etc.
//
// 	bounds: { left, right, bottom, top },
//
// 	options: extra options for the Desmos constructor, like
//  showGrid, showXAxis, etc.

//  use3d: a boolean for whether to use the Desmos.Calculator3D class.
// }

export async function createDesmosGraphs(recreating = false)
{
	if (window.OFFLINE)
	{
		return;
	}

	await loadScript(
		"https://www.desmos.com/api/v1.12/calculator.js?apiKey=2ede6b5fa6644332a74225bf2b8addb4"
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
		for (const expression of data[key].expressions)
		{
			expression.latex = expression.latex.replace(/\(/g, raw`\left(`);
			expression.latex = expression.latex.replace(/\)/g, raw`\right)`);

			expression.latex = expression.latex.replace(/\[/g, raw`\left[`);
			expression.latex = expression.latex.replace(/\]/g, raw`\right]`);
		}
	}

	for (const element of $$(".desmos-container"))
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
			yAxisMinorSubdivisions: 1,

			...(data[element.id].options ?? {})
		};



		const desmosClass = data[element.id].use3d
			// eslint-disable-next-line no-undef
			? Desmos.Calculator3D
			// eslint-disable-next-line no-undef
			: Desmos.GraphingCalculator;
		
		desmosGraphs[element.id] = desmosClass(element, options);

		const bounds = data[element.id].bounds;
		const rect = element.getBoundingClientRect();
		const aspectRatio = rect.width / rect.height;
		const width = bounds.right - bounds.left;
		const centerX = (bounds.left + bounds.right) / 2;
		bounds.left = centerX - width / 2 * aspectRatio;
		bounds.right = centerX + width / 2 * aspectRatio;

		desmosGraphs[element.id].setMathBounds(bounds);

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
	}
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
	console.log(desmosGraphs[id].getState());
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

	const imageData = desmosGraphs[id].screenshot({
		width: 500,
		height: 500,
		targetPixelRatio: 8
	});

	const img = document.createElement("img");
	img.width = 4000;
	img.height = 4000;
	img.style.width = "50vmin";
	img.style.height = "50vmin";
	img.src = imageData;
	document.body.appendChild(img);
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
		{ latex: raw`(${point[0]}, ${point[1]})`, dragMode, pointStyle: style, color, secret },
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
		{ latex: raw`${expression}`, sliderBounds: { min, max, step }, secret },
	];
}

export function getDesmosVector({
	from, // ["a", "b"]
	to,   // ["c", "d"]
	color,
	secret = true,
	lineStyle = "SOLID"
}) {
	uid++;

	return [
		{ latex: raw`((${from[0]}), (${from[1]})), ((${to[0]}), (${to[1]}))`, color, lines: true, points: false, secret, lineStyle },
		{ latex: raw`s_{${uid}} = \arctan(${to[1]} - (${from[1]}), ${to[0]} - (${from[0]}))`, secret },
		{
			latex: raw`((${to[0]}), (${to[1]})), ((${to[0]}) - .35\cos(s_{${uid}} + .5), (${to[1]}) - .35\sin(s_{${uid}} + .5))`,
			color,
			lines: true,
			points: false,
			secret
		},
		{
			latex: raw`((${to[0]}), (${to[1]})), ((${to[0]}) - .35\cos(s_{${uid}} - .5), (${to[1]}) - .35\sin(s_{${uid}} - .5))`,
			color,
			lines: true,
			points: false,
			secret
		}
	];
}