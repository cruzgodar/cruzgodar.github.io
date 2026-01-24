import { changeOpacity } from "./animation.js";
import { loadScript, raw } from "./main.js";
import { siteSettings } from "./settings.js";


// These are hsv with varying hue, 75% saturation, and 80% value.
export let desmosPurple = "#7f32cc";
export let desmosBlue = "#327fcc";
export let desmosRed = "#cc3232";
export let desmosOrange = "#cc7f32";
export const desmosBlack = "#000000";

// 3d graphs don't invert graph colors in invert mode.
export const desmosPurple3d = "#7f32cc";
export const desmosBlue3d = "#327fcc";
export const desmosRed3d = "#cc3232";
export const desmosOrange3d = "#cc7f32";
export const desmosGray3d = "#777777";


function updateDesmosColors()
{
	// In dark mode, we invert the hude (since desmos will invert it back)
	// and use 100% saturation.
	desmosPurple = siteSettings.darkTheme ? "#66cc00" : "#7f32cc";
	desmosBlue = siteSettings.darkTheme ? "#cc6600" : "#327fcc";
	desmosRed = siteSettings.darkTheme ? "#00cccc" : "#cc3232";
	desmosOrange = siteSettings.darkTheme ? "#0066cc" : "#cc7f32";
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

	await loadScript("/scripts/desmos.min.js");

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
		const replaceLineWidth = !data[key].use3d;

		for (const expression of data[key].expressions)
		{
			expression.latex = expression.latex.replace(/\(/g, raw`\left(`);
			expression.latex = expression.latex.replace(/\)/g, raw`\right)`);

			expression.latex = expression.latex.replace(/\[/g, raw`\left[`);
			expression.latex = expression.latex.replace(/\]/g, raw`\right]`);

			expression.latex = expression.latex.replace(/[^\\left]\\\{/g, raw`\left\{`);
			expression.latex = expression.latex.replace(/[^\\right]\\\}/g, raw`\right\}`);

			if (replaceLineWidth)
			{
				expression.lineWidth ??= 3.5;
			}
		}
	}

	for (const element of document.body.querySelectorAll(".desmos-container"))
	{
		let anyNonSecretExpressions = false;

		for (const expression of data[element.id].expressions)
		{
			if (!expression.secret)
			{
				anyNonSecretExpressions = true;
				break;
			}
		}

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

			expressions: anyNonSecretExpressions,

			colors: data[element.id].use3d ? {
				PURPLE: desmosPurple3d,
				BLUE: desmosBlue3d,
				RED: desmosRed3d,
				ORANGE: desmosOrange3d,
				BLACK: desmosBlack,
			} : {
				PURPLE: desmosPurple,
				BLUE: desmosBlue,
				RED: desmosRed,
				ORANGE: desmosOrange,
				BLACK: desmosBlack,
			},

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

		if (bounds.xmin === undefined && bounds.left !== undefined)
		{
			bounds.xmin = bounds.left;
			delete bounds.left;
		}

		if (bounds.xmax === undefined && bounds.right !== undefined)
		{
			bounds.xmax = bounds.right;
			delete bounds.right;
		}

		if (bounds.ymin === undefined && bounds.bottom !== undefined)
		{
			bounds.ymin = bounds.bottom;
			delete bounds.bottom;
		}

		if (bounds.ymax === undefined && bounds.top !== undefined)
		{
			bounds.ymax = bounds.top;
			delete bounds.top;
		}



		if (options.showPlane3D !== undefined)
		{
			desmosGraphs[element.id].controller.graphSettings.showPlane3D = options.showPlane3D;
		}



		if (!data[element.id].use3d)
		{
			// Enforce a square aspect ratio.
			const width = bounds.xmax - bounds.xmin;
			const centerX = (bounds.xmin + bounds.xmax) / 2;
			bounds.xmin = centerX - width / 2 * aspectRatio;
			bounds.xmax = centerX + width / 2 * aspectRatio;
		}



		desmosGraphs[element.id].setMathBounds(bounds);

		desmosGraphs[element.id].setExpressions(data[element.id].expressions);

		// Set some more things that currently aren't exposed in the API :(
		desmosGraphs[element.id].controller.graphSettings.showBox3D = false;

		desmosGraphs[element.id].updateSettings({});

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
	const elements = Array.from(document.body.querySelectorAll(".desmos-container"));

	if (elements)
	{
		await Promise.all(elements.map(element => changeOpacity({ element, opacity: 0 })));

		await createDesmosGraphs(true);

		await Promise.all(elements.map(element => changeOpacity({ element, opacity: 1 })));
	}
}

export function getDesmosScreenshot(id, forPdf = false)
{
	// Yeesh is this hacky. Hopefully these are exposed in the API in the future!
	desmosGraphs[id].controller.graphSettings.showPlane3D = false;
	desmosGraphs[id].controller.graphSettings.showNumbers3D = forPdf;
	desmosGraphs[id].controller.graphSettings.showAxisLabels3D = forPdf;
	
	desmosGraphs[id].updateSettings({
		showGrid: forPdf,
		xAxisNumbers: forPdf,
		yAxisNumbers: forPdf,
	});

	if (!desmosGraphs[id].getState().graph.threeDMode)
	{
		const expressions = desmosGraphs[id].getExpressions();

		for (let i = 0; i < expressions.length; i++)
		{
			expressions[i].lineWidth = forPdf ? 2.5 : 15;
			expressions[i].pointSize = forPdf ? 10 : 50;
			expressions[i].dragMode = "NONE";
		}

		desmosGraphs[id].setExpressions(expressions);
	}

	const imageData = desmosGraphs[id].screenshot({
		width: 400,
		height: 400,
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