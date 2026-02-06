import { changeOpacity } from "./animation.js";
import { addTemporaryListener, loadScript, raw } from "./main.js";
import { siteSettings } from "./settings.js";


export const desmosPurple = "_desmosPurple";
export const desmosBlue = "_desmosBlue";
export const desmosRed = "_desmosRed";
export const desmosOrange = "_desmosOrange";
export const desmosBlack = "_desmosBlack";
export const desmosGray = "_desmosGray";

// Light mode: 75% S, 80% V
// Dark mode: 100% S, 80% V
// Dark mode high contrast: 100% S, 50% V (when inverted results in 50% S, 100% V)

const functionsForColors = {
	[desmosPurple]: (is3d, alwaysDark, highContrast) =>
	{
		if (is3d)
		{
			return siteSettings.increaseContrast || highContrast ? "#7f00ff" : "#7f32cc";
		}

		if (siteSettings.increaseContrast || highContrast)
		{
			return siteSettings.darkTheme || alwaysDark ? "#3f7f00" : "#7f32cc";
		}
		
		return siteSettings.darkTheme || alwaysDark ? "#66cc00" : "#7f32cc";
	},

	[desmosBlue]: (is3d, alwaysDark, highContrast) =>
	{
		if (is3d)
		{
			return siteSettings.increaseContrast || highContrast ? "#007fff" : "#327fcc";
		}

		if (siteSettings.increaseContrast || highContrast)
		{
			return siteSettings.darkTheme || alwaysDark ? "#7f3f00" : "#327fcc";
		}
		
		return siteSettings.darkTheme || alwaysDark ? "#cc6600" : "#327fcc";
	},

	[desmosRed]: (is3d, alwaysDark, highContrast) =>
	{
		if (is3d)
		{
			return siteSettings.increaseContrast || highContrast ? "#ff0000" : "#cc3232";
		}

		if (siteSettings.increaseContrast || highContrast)
		{
			return siteSettings.darkTheme || alwaysDark ? "#007f7f" : "#cc3232";
		}
		
		return siteSettings.darkTheme || alwaysDark ? "#00cccc" : "#cc3232";
	},

	[desmosOrange]: (is3d, alwaysDark, highContrast) =>
	{
		if (is3d)
		{
			return siteSettings.increaseContrast || highContrast ? "#ff7f00" : "#cc7f32";
		}

		if (siteSettings.increaseContrast || highContrast)
		{
			return siteSettings.darkTheme || alwaysDark ? "#003f7f" : "#cc7f32";
		}
		
		return siteSettings.darkTheme || alwaysDark ? "#0066cc" : "#cc7f32";
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

export let desmosGraphsDefaultState = {};

export function clearDesmosGraphs()
{
	desmosGraphs = {};
	desmosGraphsDefaultState = {};
}



// This whole system loads in desmos graphs only when they're about to be visible,
// since trying to load multiple 3D graphs at once on iOS crashes the page. The stack
// system means that scrolling quickly causes the latest-request graph to be constructed
// first. 2D graphs aren't throttled, just 3D ones.

// Each entry is an object { element, constructor, is3d }
let desmosGraphsConstructorData = {};

let desmosGraphConstructionStack = [];

const desmosGraphConstructionCooldownTime = 750;
let desmosGraphConstructionCooldown = Promise.resolve();



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
			delete desmosGraphsDefaultState[key];
		}
	}

	desmosData = desmosDataInitializer;
	desmosGraphsConstructorData = {};
	desmosGraphConstructionStack = [];

	const data = structuredClone(desmosData);

	for (const key in data)
	{
		const is3d = data[key].use3d;

		for (const expression of data[key].expressions)
		{
			if (expression.color && functionsForColors[expression.color])
			{
				expression.color = functionsForColors[expression.color](
					is3d,
					data[key].alwaysDark,
					data[key].highContrast
				);
			}

			if (!expression.latex)
			{
				continue;
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
			invertedColors: siteSettings.darkTheme || data[element.id].alwaysDark,

			xAxisMinorSubdivisions: 1,
			yAxisMinorSubdivisions: 1,

			expressions: anyNonSecretExpressions,

			colors: {
				PURPLE: functionsForColors[desmosPurple](
					data[element.id].use3d,
					data[element.id].alwaysDark,
					data[element.id].highContrast
				),
				BLUE: functionsForColors[desmosBlue](
					data[element.id].use3d,
					data[element.id].alwaysDark,
					data[element.id].highContrast
				),
				RED: functionsForColors[desmosRed](
					data[element.id].use3d,
					data[element.id].alwaysDark,
					data[element.id].highContrast
				),
				ORANGE: functionsForColors[desmosOrange](
					data[element.id].use3d,
					data[element.id].alwaysDark,
					data[element.id].highContrast
				),
				...(
					data[element.id].use3d
						? { BLACK: functionsForColors[desmosGray](
							data[element.id].use3d,
						) }
						: { BLACK: functionsForColors[desmosBlack](
							data[element.id].use3d,
						) }
				)
			},

			...(data[element.id].options ?? {})
		};



		const desmosClass = data[element.id].use3d
			// eslint-disable-next-line no-undef
			? Desmos.Calculator3D
			// eslint-disable-next-line no-undef
			: Desmos.GraphingCalculator;

		// We'll call this once the graph is onscreen.
		const constructor = () =>
		{
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

			desmosGraphsDefaultState[element.id] = desmosGraphs[element.id].getState();

			desmosGraphs[element.id].setDefaultState(desmosGraphsDefaultState[element.id]);

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
		};

		desmosGraphsConstructorData[element.id] = {
			element,
			constructor,
			is3d: data[element.id].use3d
		};
	}



	addTemporaryListener({
		object: window,
		event: "scroll",
		callback: onScroll
	});

	onScroll();
}

function onScroll()
{
	for (const [id, data] of Object.entries(desmosGraphsConstructorData))
	{
		const rect = data.element.getBoundingClientRect();
		const top = rect.top;
		const height = rect.height;
	
		// Construct graphs when they're within a screen height of being visible.
		const isOnscreen = top >= -height - window.innerHeight
			&& top < window.innerHeight * 2;

		if (isOnscreen)
		{
			desmosGraphConstructionStack.push(data);

			if (desmosGraphConstructionStack.length === 1)
			{
				handleDesmosGraphConstructionStack();
			}

			delete desmosGraphsConstructorData[id];
		}
	}
}

async function handleDesmosGraphConstructionStack()
{
	if (!desmosGraphConstructionStack.length)
	{
		return;
	}

	await desmosGraphConstructionCooldown;

	const data = desmosGraphConstructionStack.pop();

	data.constructor();

	if (data.is3d)
	{
		desmosGraphConstructionCooldown = new Promise(resolve =>
		{
			setTimeout(resolve, desmosGraphConstructionCooldownTime);
		});
	}

	handleDesmosGraphConstructionStack();
}



// Animates out and back in all the Desmos graphs. Used when switching themes.
export async function recreateDesmosGraphs()
{
	const elements = Array.from(document.body.querySelectorAll(".desmos-container"));

	if (elements)
	{
		await Promise.all(elements.map(element => changeOpacity({ element, opacity: 0 })));

		await createDesmosGraphs(desmosData, true);

		await Promise.all(elements.map(element => changeOpacity({ element, opacity: 1 })));
	}
}

export async function getDesmosScreenshot(id, forPdf = false)
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

	const is3d = desmosGraphs[id].getState().graph.threeDMode;

	console.log(desmosGraphs[id].getExpressions());

	if (!is3d)
	{
		const expressions = desmosGraphs[id].getExpressions();

		for (let i = 0; i < expressions.length; i++)
		{
			expressions[i].lineWidth = forPdf ? 5 : 30;
			expressions[i].pointSize = forPdf ? 10 : 50;
			expressions[i].dragMode = "NONE";
		}

		desmosGraphs[id].setExpressions(expressions);
	}

	const imageData = is3d
		? desmosGraphs[id].screenshot({
			width: 800,
			height: 800,
			targetPixelRatio: 4,
		})
		: await new Promise(resolve =>
		{
			desmosGraphs[id].asyncScreenshot({
				width: 800,
				height: 800,
				targetPixelRatio: 4,
				showLabels: forPdf
			}, resolve);
		});

	const img = document.createElement("img");
	img.width = 3600;
	img.height = 3600;
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
	secret = true,
	size = 9
}) {
	return [
		{ latex: raw`(${point[0]}, ${point[1]})`, dragMode, pointStyle: style, color, secret, pointSize: size },
	];
}

export function getDesmosSlider({
	expression, // "a = 1"
	min,
	max,
	step,
	playing = false,
	secret = true
}) {
	return [
		{ latex: raw`${expression}`, sliderBounds: { min, max, step }, playing, secret },
	];
}

export function getDesmosVector({
	from, // ["a", "b"]
	to,   // ["c", "d"]
	color,
	secret = true,
	lineStyle = "SOLID",
	arrowSize = "0.35",
	lineWidth
}) {
	uid++;

	return [
		{ latex: raw`((${from[0]}), (${from[1]})), ((${to[0]}), (${to[1]}))`, color, lines: true, points: false, secret, lineStyle, lineWidth },
		{ latex: raw`s_{${uid}} = \arctan(${to[1]} - (${from[1]}), ${to[0]} - (${from[0]}))`, secret, lineWidth },
		{
			latex: raw`((${to[0]}), (${to[1]})), ((${to[0]}) - ${arrowSize}\cos(s_{${uid}} + .5), (${to[1]}) - ${arrowSize}\sin(s_{${uid}} + .5))`,
			color,
			lines: true,
			points: false,
			secret,
			lineWidth
		},
		{
			latex: raw`((${to[0]}), (${to[1]})), ((${to[0]}) - ${arrowSize}\cos(s_{${uid}} - .5), (${to[1]}) - ${arrowSize}\sin(s_{${uid}} - .5))`,
			color,
			lines: true,
			points: false,
			secret,
			lineWidth
		}
	];
}

export function getDesmosBounds(desmosGraph)
{
	const bounds = desmosGraph.graphpaperBounds.mathCoordinates;

	return {
		xmin: bounds.xmin,
		xmax: bounds.xmax,
		ymin: bounds.ymin,
		ymax: bounds.ymax,
	};
}

export function getColoredParametricCurve({
	// a function mapping x and y to a 2D vector
	fieldFunction,
	// a function mapping t to (x, y)
	pathFunction,
	// the Desmos equivalent as a function of t
	pathFunctionDesmos,
	minT,
	maxT,
	numSlices,
	// a function mapping the dot product,
	// normalized to (-1, 1), to a hex string.
	colorFunction,
}) {
	return Array.from({ length: numSlices }, (_, i) =>
	{
		const step = (maxT - minT) / numSlices;
		const t = minT + i * step;

		const pathFunctionHere = pathFunction(t);
		const pathFunctionNext = pathFunction(t + step);

		const rPrime = [
			(pathFunctionNext[0] - pathFunctionHere[0]) / step,
			(pathFunctionNext[1] - pathFunctionHere[1]) / step
		];

		const magnitudeRPrime = Math.sqrt(rPrime[0] * rPrime[0] + rPrime[1] * rPrime[1]);

		const unitTangent = [
			rPrime[0] / magnitudeRPrime,
			rPrime[1] / magnitudeRPrime
		];

		const fieldHere = fieldFunction(pathFunctionHere[0], pathFunctionHere[1]);

		const magnitudeFieldHere = Math.sqrt(
			fieldHere[0] * fieldHere[0] + fieldHere[1] * fieldHere[1]
		);

		const normalizedFieldHere = [
			fieldHere[0] / magnitudeFieldHere,
			fieldHere[1] / magnitudeFieldHere
		];

		const dotProduct = normalizedFieldHere[0] * unitTangent[0]
			+ normalizedFieldHere[1] * unitTangent[1];

		const color = colorFunction(dotProduct);

		return {
			latex: pathFunctionDesmos,
			parametricDomain: { min: t, max: t + step },
			color,
			lineWidth: 5,
			secret: true
		};
	});
}