import { changeOpacity } from "./animation.js";
import { loadScript, raw } from "./main.js";
import { siteSettings } from "./settings.js";


export const desmosPurple = "_desmosPurple";
export const desmosBlue = "_desmosBlue";
export const desmosRed = "_desmosRed";
export const desmosOrange = "_desmosOrange";
export const desmosBlack = "_desmosBlack";
export const desmosGray = "_desmosGray";

const functionsForColors = {
	[desmosPurple]: (is3d) =>
	{
		if (is3d)
		{
			return "#7f32cc";
		}
		
		return siteSettings.darkTheme ? "#66cc00" : "#7f32cc";
	},

	[desmosBlue]: (is3d) =>
	{
		if (is3d)
		{
			return "#327fcc";
		}
		
		return siteSettings.darkTheme ? "#cc6600" : "#327fcc";
	},

	[desmosRed]: (is3d) =>
	{
		if (is3d)
		{
			return "#cc3232";
		}
		
		return siteSettings.darkTheme ? "#00cccc" : "#cc3232";
	},

	[desmosOrange]: (is3d) =>
	{
		if (is3d)
		{
			return "#cc7f32";
		}
		
		return siteSettings.darkTheme ? "#0066cc" : "#cc7f32";
	},

	[desmosBlack]: (is3d) =>
	{
		if (is3d)
		{
			throw new Error("desmosBlack is not a valid color for 3d graphs");
		}
		
		return "#000000";
	},

	[desmosGray]: (is3d) =>
	{
		if (is3d)
		{
			return "#777777";
		}
		
		throw new Error("desmosGray is not a valid color for 2d graphs");
	}
};

export let desmosGraphs = {};

export function clearDesmosGraphs()
{
	desmosGraphs = {};
}



// Each entry in a Desmos data object is of the form
// {
// 	expressions: a list of obejcts containing the fields latex
//  and optionally color, lines, points, hidden, secret, etc.
//
// 	bounds: { left, right, bottom, top },
//
// 	options: extra options for the Desmos constructor
//
//  use3d: a boolean for whether to use the Desmos.Calculator3D class.
// }

let desmosData = {};

export async function createDesmosGraphs(desmosDataInitializer = desmosData, recreating = false)
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
			delete desmosGraphs[key];
		}
	}

	desmosData = desmosDataInitializer;

	const data = structuredClone(desmosData);

	for (const key in data)
	{
		const is3d = data[key].use3d;

		for (const expression of data[key].expressions)
		{
			if (expression.color)
			{
				expression.color = functionsForColors[expression.color](is3d);
			}

			expression.latex = expression.latex.replace(/\(/g, raw`\left(`);
			expression.latex = expression.latex.replace(/\)/g, raw`\right)`);

			expression.latex = expression.latex.replace(/\[/g, raw`\left[`);
			expression.latex = expression.latex.replace(/\]/g, raw`\right]`);

			expression.latex = expression.latex.replace(/([^\\left])\\\{/g, (match, $1) => raw`${$1}\left\{`);
			expression.latex = expression.latex.replace(/([^\\right])\\\}/g, (match, $1) => raw`${$1}\right\}`);

			if (!is3d)
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

			colors: {
				PURPLE: functionsForColors[desmosPurple](data[element.id].use3d),
				BLUE: functionsForColors[desmosBlue](data[element.id].use3d),
				RED: functionsForColors[desmosRed](data[element.id].use3d),
				ORANGE: functionsForColors[desmosOrange](data[element.id].use3d),
				...(
					data[element.id].use3d
						? { BLACK: functionsForColors[desmosGray](data[element.id].use3d) }
						: { BLACK: functionsForColors[desmosBlack](data[element.id].use3d) }
				)
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

		await createDesmosGraphs(desmosData);

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