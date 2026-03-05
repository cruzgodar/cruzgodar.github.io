import { hsvToHex } from "../applets/applet.js";
import { changeOpacity } from "./animation.js";
import { enterFullscreen, exitFullscreen, isFullscreen } from "./fullscreen.js";
import { distinguishColorsCheckboxContainer } from "./header.js";
import { addHoverEventWithScale } from "./hoverEvents.js";
import { addTemporaryListener, loadScript, raw } from "./main.js";
import { siteSettings } from "./settings.js";
import { clamp, searchProperties } from "./utils.js";

export const desmosDragModes = {
	NONE: "NONE",
	X: "X",
	Y: "Y",
	XY: "XY",
};

export const desmosPointStyles = {
	POINT: "POINT",
	OPEN: "OPEN",
	CROSS: "CROSS",
	SQUARE: "SQUARE",
	PLUS: "PLUS",
	TRIANGLE: "TRIANGLE",
	DIAMOND: "DIAMOND",
	STAR: "STAR"
};

export const desmosLineStyles = {
	SOLID: "SOLID",
	DASHED: "DASHED",
	DOTTED: "DOTTED",
};

// Properties that the Desmos API erases during graph construction.
// These must be re-applied from the original expression data to the state object.
const desmosApiErasedProperties = ["colorLatex"];

export const desmosColors = {
	purple: "_desmosPurple",
	blue: "_desmosBlue",
	red: "_desmosRed",
	orange: "_desmosOrange",
	black: "_desmosBlack",
	gray: "_desmosGray",
};

function getDesmosHue(color)
{
	if (color === desmosColors.purple)
	{
		return 270;
	}

	if (color === desmosColors.blue)
	{
		return siteSettings.distinguishColors ? 180 : 210;
	}

	if (color === desmosColors.red)
	{
		return siteSettings.distinguishColors ? 350 : 0;
	}

	return siteSettings.distinguishColors ? 45 : 30;
}

function getDesmosColor(color, is3d, alwaysDark, highContrast)
{
	if (color === desmosColors.black)
	{
		if (is3d)
		{
			throw new Error("desmosBlack is not a valid color for 3d graphs");
		}
		
		return "#000000";
	}

	if (color === desmosColors.gray)
	{
		if (is3d)
		{
			return "#777777";
		}
		
		throw new Error("desmosGray is not a valid color for 2d graphs");
	}

	const isDark = alwaysDark || siteSettings.darkTheme;
	const invert = !is3d && isDark;

	const hue = getDesmosHue(color) / 360;
	
	const saturation = isDark
		? highContrast
			? 0.5
			: 0.8
		: 0.75;

	const value = (!is3d && isDark) ? 1 : 0.8;

	return invert
		? hsvToHex(hue + 0.5, value, saturation)
		: hsvToHex(hue, saturation, value);
}

function restoreErasedProperties(state, originalExpressions)
{
	for (let i = 0; i < originalExpressions.length; i++)
	{
		for (const property of desmosApiErasedProperties)
		{
			if (originalExpressions[i][property])
			{
				state.expressions.list[i][property] =
					originalExpressions[i][property];
			}
		}
	}
}

export let desmosGraphs = {};

export let desmosGraphsDefaultState = {};

// A promise for every graph
export let desmosGraphsLoaded = {};
let desmosGraphResolves = {};



// This whole system loads in desmos graphs only when they're about to be visible,
// since trying to load multiple 3D graphs at once on iOS crashes the page. 2D graphs
// are constructed as they approach the viewport and stay loaded. 3D graphs are pooled:
// at most max3dPoolSize Calculator3D instances are ever created for the entire site session.
// They live in a persistent off-screen container on document.body that survives page
// navigations. When a 3D graph needs to be shown, a calculator's DOM children are
// reparented from the pool into the page's .desmos-container, then reconfigured.

// Each entry is an object { element, constructor, is3d, isConstructed }
let desmosGraphsConstructorData = {};

// Maximum number of Calculator3D instances in the persistent pool.
const max3dPoolSize = 3;

// Track which 3D graph IDs currently have an active calculator instance.
let active3dGraphIds = [];

// Store the per-graph configuration needed to reconstruct/swap a 3D graph.
// Keyed by element ID, populated during createDesmosGraphs.
let desmosGraphConfigs = {};

// The persistent 3D pool: up to max3dPoolSize Calculator3D instances that survive page navigations.
// Each entry is { calculator, poolElement } where poolElement is the div inside
// the off-screen container that houses the calculator when idle.
const persistent3dPool = [];
let persistent3dPoolContainer = null;

function ensurePoolContainer()
{
	if (persistent3dPoolContainer)
	{
		return;
	}

	persistent3dPoolContainer = document.createElement("div");
	persistent3dPoolContainer.id = "desmos-3d-pool";
	persistent3dPoolContainer.style.position = "fixed";
	persistent3dPoolContainer.style.left = "-9999px";
	persistent3dPoolContainer.style.top = "-9999px";
	persistent3dPoolContainer.style.width = "500px";
	persistent3dPoolContainer.style.height = "500px";
	persistent3dPoolContainer.style.pointerEvents = "none";
	document.body.appendChild(persistent3dPoolContainer);
}

function createPoolSlot()
{
	const el = document.createElement("div");
	el.style.width = "100%";
	el.style.height = "100%";
	persistent3dPoolContainer.appendChild(el);
	return el;
}

function getPoolEntryForCalculator(calculator)
{
	return persistent3dPool.find(entry => entry.calculator === calculator);
}



export function clearDesmosGraphs()
{
	desmosGraphs = {};
	desmosGraphsDefaultState = {};
	desmosGraphsLoaded = {};
	desmosGraphResolves = {};
	active3dGraphIds = [];
	desmosGraphConfigs = {};
	desmosGraphsConstructorData = {};
	
	if (distinguishColorsCheckboxContainer)
	{
		distinguishColorsCheckboxContainer.style.display = "none";
	}
}

// Moves any active 3D calculators back to their off-screen pool slots.
// Called during page unload and at the start of createDesmosGraphs().
export function returnPersistent3dGraphsToPool()
{
	for (const activeId of active3dGraphIds)
	{
		const calculator = desmosGraphs[activeId];
		const poolEntry = getPoolEntryForCalculator(calculator);

		if (poolEntry)
		{
			// Move the pool slot element back to the off-screen container.
			persistent3dPoolContainer.appendChild(poolEntry.poolElement);

			// Clear expressions to free memory while idle.
			const existingExpressions = calculator.getExpressions();

			if (existingExpressions.length > 0)
			{
				calculator.removeExpressions(existingExpressions);
			}
		}

		delete desmosGraphs[activeId];
		delete desmosGraphsDefaultState[activeId];
		delete desmosGraphsLoaded[activeId];
		delete desmosGraphResolves[activeId];
	}

	active3dGraphIds = [];
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

	// Return any active 3D calculators to the persistent pool (don't destroy them).
	returnPersistent3dGraphsToPool();

	// Destroy remaining (2D only) graphs.
	for (const key in desmosGraphs)
	{
		if (desmosGraphs[key]?.destroy)
		{
			desmosGraphs[key].destroy();
			delete desmosGraphs[key];
			delete desmosGraphsDefaultState[key];
			delete desmosGraphsLoaded[key];
			delete desmosGraphResolves[key];
		}
	}

	desmosData = desmosDataInitializer;
	desmosGraphsConstructorData = {};
	active3dGraphIds = [];
	desmosGraphConfigs = {};

	const data = structuredClone(desmosData);

	

	for (const key in data)
	{
		const is3d = data[key].use3d;

		for (const expression of data[key].expressions)
		{
			if (expression.color && Object.values(desmosColors).includes(expression.color))
			{
				expression.color = getDesmosColor(
					expression.color,
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



	const desmosContainers = document.body.querySelectorAll(".desmos-container");
	
	// We have to set these up before awaiting something, since synchronous
	// code might await these.
	for (const element of desmosContainers)
	{
		desmosGraphsLoaded[element.id] = new Promise(resolve =>
		{
			desmosGraphResolves[element.id] = resolve;
		});
	}

	if (desmosContainers.length > 0 && distinguishColorsCheckboxContainer)
	{
		distinguishColorsCheckboxContainer.style.display = "block";
	}



	await loadScript("/scripts/desmos.min.js");



	for (const element of desmosContainers)
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

			xAxisMinorSubdivisions: 1,
			yAxisMinorSubdivisions: 1,

			expressions: anyNonSecretExpressions,

			colors: {
				PURPLE: getDesmosColor(
					desmosColors.purple,
					data[element.id].use3d,
					data[element.id].alwaysDark,
					data[element.id].highContrast
				),
				BLUE: getDesmosColor(
					desmosColors.blue,
					data[element.id].use3d,
					data[element.id].alwaysDark,
					data[element.id].highContrast
				),
				RED: getDesmosColor(
					desmosColors.red,
					data[element.id].use3d,
					data[element.id].alwaysDark,
					data[element.id].highContrast
				),
				ORANGE: getDesmosColor(
					desmosColors.orange,
					data[element.id].use3d,
					data[element.id].alwaysDark,
					data[element.id].highContrast
				),
				...(
					data[element.id].use3d
						? { BLACK: getDesmosColor(desmosColors.gray, data[element.id].use3d) }
						: { BLACK: getDesmosColor(desmosColors.black, data[element.id].use3d) }
				)
			},

			...(data[element.id].options ?? {})
		};



		const desmosClass = data[element.id].use3d
			// eslint-disable-next-line no-undef
			? Desmos.Calculator3D
			// eslint-disable-next-line no-undef
			: Desmos.GraphingCalculator;

		// Normalize bounds property names up front so they're ready
		// for both initial construction and 3D graph swaps.
		const bounds = data[element.id].bounds;

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

		// Store configuration for potential 3D graph swapping.
		desmosGraphConfigs[element.id] = {
			element,
			options,
			bounds,
			expressions: data[element.id].expressions,
			is3d: data[element.id].use3d,
			alwaysDark: data[element.id].alwaysDark,
			desmosClass,
			anyNonSecretExpressions,
		};

		// We'll call this once the graph is onscreen.
		// 2D graphs are constructed directly. 3D graphs use the persistent pool.
		const constructor = data[element.id].use3d
			? () =>
			{
				let calculator;
				let poolEntry;

				if (persistent3dPool.length < max3dPoolSize)
				{
					// First-time construction: create a real Calculator3D
					// in an off-screen pool slot.
					ensurePoolContainer();
					const poolElement = createPoolSlot();
					calculator = desmosClass(poolElement, options);

					if (window.DEBUG)
					{
						console.log("Constructing Desmos 3D instance");
					}

					poolEntry = { calculator, poolElement };
					persistent3dPool.push(poolEntry);
				}
				else
				{
					// Reuse an idle calculator from the pool (one whose pool slot
					// is still in the off-screen container, not in a page element).
					poolEntry = persistent3dPool.find(entry =>
						entry.poolElement.parentElement === persistent3dPoolContainer
					);

					if (!poolEntry)
					{
						// All calculators are in-page; this case is handled
						// by onScroll's swap logic instead.
						return;
					}

					calculator = poolEntry.calculator;
				}

				// Move the pool slot element itself into the page container.
				// Desmos internally tracks this element for size detection,
				// so moving it (rather than its children) lets the auto-resize
				// observer pick up the new container's dimensions.
				element.appendChild(poolEntry.poolElement);

				// Clear any leftover expressions from a previous use.
				const existingExpressions = calculator.getExpressions();

				if (existingExpressions.length > 0)
				{
					calculator.removeExpressions(existingExpressions);
				}

				// Configure the calculator for this graph's data.
				calculator.setMathBounds(bounds);
				calculator.setExpressions(data[element.id].expressions);

				if (options.showPlane3D !== undefined)
				{
					calculator.controller.graphSettings.showPlane3D = options.showPlane3D;
				}
				else
				{
					calculator.controller.graphSettings.showPlane3D = true;
				}

				calculator.controller.graphSettings.showBox3D = false;

				calculator.updateSettings({
					expressions: anyNonSecretExpressions,
					translucentSurfaces: options.translucentSurfaces ?? false,
				});

				calculator.controller.dispatch({
					type: "set-inverted-colors",
					value: siteSettings.darkTheme || data[element.id].alwaysDark,
				});

				desmosGraphs[element.id] = calculator;

				desmosGraphsDefaultState[element.id] = calculator.getState();

				restoreErasedProperties(
					desmosGraphsDefaultState[element.id],
					data[element.id].expressions
				);

				calculator.setState(desmosGraphsDefaultState[element.id]);
				calculator.setDefaultState(desmosGraphsDefaultState[element.id]);

				// Store the clean default state in the config so swap3dGraph()
				// can fully reset the calculator (including camera and spin).
				desmosGraphConfigs[element.id].defaultState = desmosGraphsDefaultState[element.id];

				active3dGraphIds.push(element.id);

				if (window.DEBUG && !element.dataset.hasScreenshotHandler)
				{
					element.addEventListener("click", (e) =>
					{
						if (e.metaKey)
						{
							getDesmosScreenshot(element.id, e.altKey);
						}
					});
					element.dataset.hasScreenshotHandler = "true";
				}

				desmosGraphResolves[element.id]();
			}
			: () =>
			{
				desmosGraphs[element.id] = desmosClass(element, options);



				if (options.showPlane3D !== undefined)
				{
					desmosGraphs[element.id].controller.graphSettings.showPlane3D =
						options.showPlane3D;
				}



				// Enforce a square aspect ratio.
				const rect = element.getBoundingClientRect();
				const aspectRatio = rect.width / rect.height;
				const width = bounds.xmax - bounds.xmin;
				const centerX = (bounds.xmin + bounds.xmax) / 2;
				bounds.xmin = centerX - width / 2 * aspectRatio;
				bounds.xmax = centerX + width / 2 * aspectRatio;



				desmosGraphs[element.id].setMathBounds(bounds);

				desmosGraphs[element.id].setExpressions(data[element.id].expressions);

				// Set some more things that currently aren't exposed in the API :(
				desmosGraphs[element.id].controller.graphSettings.showBox3D = false;

				desmosGraphs[element.id].updateSettings({
					invertedColors: siteSettings.darkTheme || data[element.id].alwaysDark,
				});

				desmosGraphsDefaultState[element.id] = desmosGraphs[element.id].getState();

				restoreErasedProperties(
					desmosGraphsDefaultState[element.id],
					data[element.id].expressions
				);

				desmosGraphs[element.id].setState(desmosGraphsDefaultState[element.id]);
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

				desmosGraphResolves[element.id]();
			};

		desmosGraphsConstructorData[element.id] = {
			element,
			constructor,
			is3d: data[element.id].use3d,
			isConstructed: false,
		};

		// Create a fullscreen button for each graph,
		// removing any existing one first (e.g. from recreateDesmosGraphs).
		const border = element.closest(".desmos-border");
		border.style.position = "relative";
		border.querySelector(".desmos-fullscreen-button")?.remove();

		const fullscreenButton = document.createElement("div");
		fullscreenButton.classList.add("desmos-fullscreen-button");

		const enterIcon = document.createElement("img");
		enterIcon.src = "/graphics/general-icons/enter-fullscreen.png";

		const exitIcon = document.createElement("img");
		exitIcon.src = "/graphics/general-icons/exit-fullscreen.png";
		exitIcon.style.display = "none";

		fullscreenButton.appendChild(enterIcon);
		fullscreenButton.appendChild(exitIcon);

		addHoverEventWithScale({
			element: fullscreenButton,
			scale: 1.1,
			addBounceOnTouch: () => true,
		});

		fullscreenButton.addEventListener("click", async () =>
		{
			fullscreenButton.style.viewTransitionName =
				`desmos-fullscreen-button-${element.id}`;

			if (isFullscreen(border))
			{
				await exitFullscreen({ element: border });
			}
			else
			{
				// Look up the canvas fresh, since ephemeral applets
				// replace the canvas element when they're recreated.
				const canvas = border.querySelector("canvas");

				await enterFullscreen({
					element: border,
					callback: () =>
					{
						desmosGraphs[element.id].resize();

						enterIcon.style.display = "none";
						exitIcon.style.display = "";

						if (canvas?.wilson)
						{
							canvas.wilson.enterExternalFullscreen();
						}
					},
					exitCallback: () =>
					{
						// Look up canvas fresh — it may have been
						// replaced by ephemeral applet recreation.
						const canvas = border.querySelector("canvas");

						desmosGraphs[element.id].resize();

						enterIcon.style.display = "";
						exitIcon.style.display = "none";

						if (canvas?.wilson)
						{
							canvas.wilson.exitExternalFullscreen();
						}
					}
				});
			}

			fullscreenButton.style.viewTransitionName = "";
		});

		border.appendChild(fullscreenButton);
	}



	addTemporaryListener({
		object: window,
		event: "scroll",
		callback: onScroll
	});

	onScroll();
}

function getDistanceFromViewport(element)
{
	const rect = element.getBoundingClientRect();

	// If the element overlaps the viewport, distance is 0.
	if (rect.bottom >= 0 && rect.top <= window.innerHeight)
	{
		return 0;
	}

	// Above the viewport.
	if (rect.bottom < 0)
	{
		return -rect.bottom;
	}

	// Below the viewport.
	return rect.top - window.innerHeight;
}

function swap3dGraph(oldId, newId)
{
	const calculator = desmosGraphs[oldId];
	const newElement = desmosGraphConfigs[newId].element;
	const newConfig = desmosGraphConfigs[newId];

	// Move the pool slot element from the old container to the new one.
	const poolEntry = getPoolEntryForCalculator(calculator);
	newElement.appendChild(poolEntry.poolElement);

	if (newConfig.defaultState)
	{
		// This graph was previously constructed, so we have a clean default
		// state that includes expressions, bounds, and a zeroed-out camera.
		// setState() fully resets everything in one call.
		calculator.setState(newConfig.defaultState);
	}
	else
	{
		// This graph was never constructed (it's beyond the first two).
		// Set it up from the raw config data.
		const existingExpressions = calculator.getExpressions();

		if (existingExpressions.length > 0)
		{
			calculator.removeExpressions(existingExpressions);
		}

		calculator.setMathBounds(newConfig.bounds);
		calculator.setExpressions(newConfig.expressions);
	}

	// Apply 3D-specific controller settings.
	if (newConfig.options.showPlane3D !== undefined)
	{
		calculator.controller.graphSettings.showPlane3D = newConfig.options.showPlane3D;
	}
	else
	{
		calculator.controller.graphSettings.showPlane3D = true;
	}

	calculator.controller.graphSettings.showBox3D = false;

	calculator.updateSettings({
		expressions: newConfig.anyNonSecretExpressions,
		translucentSurfaces: newConfig.options.translucentSurfaces ?? false,
	});

	calculator.controller.dispatch({
		type: "set-inverted-colors",
		value: siteSettings.darkTheme || newConfig.alwaysDark,
	});

	// Capture and store the clean default state (for graphs that were
	// never constructed, this is the first time we have one).
	if (!newConfig.defaultState)
	{
		const state = calculator.getState();

		// Zero out any lingering rotation/spin from the previous graph
		// so the default state has a clean camera.
		state.graph.worldRotation3D = [];
		state.graph.axis3D = [0, 0, 1];
		state.graph.speed3D = 0;

		newConfig.defaultState = state;

		// Apply the cleaned state so the calculator actually stops spinning.
		calculator.setState(newConfig.defaultState);
	}

	desmosGraphsDefaultState[newId] = newConfig.defaultState;
	calculator.setDefaultState(newConfig.defaultState);

	// Update bookkeeping: move the calculator reference.
	desmosGraphs[newId] = calculator;
	delete desmosGraphs[oldId];
	delete desmosGraphsDefaultState[oldId];

	// Mark old graph as not constructed, new graph as constructed.
	desmosGraphsConstructorData[oldId].isConstructed = false;
	desmosGraphsConstructorData[newId].isConstructed = true;

	// Update active 3D graph tracking.
	const index = active3dGraphIds.indexOf(oldId);
	active3dGraphIds[index] = newId;

	// Register screenshot click handler if not already present.
	if (window.DEBUG && !newElement.dataset.hasScreenshotHandler)
	{
		newElement.addEventListener("click", (e) =>
		{
			if (e.metaKey)
			{
				getDesmosScreenshot(newId, e.altKey);
			}
		});
		newElement.dataset.hasScreenshotHandler = "true";
	}

	// Resolve the new graph's loaded promise.
	desmosGraphResolves[newId]?.();

	// Recreate the old graph's promise so it can resolve again
	// when the graph is swapped back in.
	desmosGraphsLoaded[oldId] = new Promise(resolve =>
	{
		desmosGraphResolves[oldId] = resolve;
	});
}

function onScroll()
{
	for (const data of Object.values(desmosGraphsConstructorData))
	{
		const rect = data.element.getBoundingClientRect();
		const top = rect.top;
		const height = rect.height;

		// Construct graphs when they're within a screen height of being visible.
		const isNearViewport = top >= -height - window.innerHeight
			&& top < window.innerHeight * 2;

		if (!isNearViewport || data.isConstructed)
		{
			continue;
		}

		if (!data.is3d)
		{
			// 2D graphs: construct and keep loaded.
			data.constructor();
			data.isConstructed = true;
			continue;
		}

		// 3D graph needs loading.
		if (active3dGraphIds.length < max3dPoolSize)
		{
			// Pool has room: construct normally.
			data.constructor();
			data.isConstructed = true;
			continue;
		}

		// Pool is full: find the most distant active 3D graph to swap out.
		const newId = data.element.id;
		const newDistance = getDistanceFromViewport(data.element);

		let maxDistance = -1;
		let victimId = null;

		for (const activeId of active3dGraphIds)
		{
			const dist = getDistanceFromViewport(desmosGraphConfigs[activeId].element);

			if (dist > maxDistance)
			{
				maxDistance = dist;
				victimId = activeId;
			}
		}

		// Only swap if the victim is off-screen (distance > 0)
		// and the new graph is actually closer to the viewport.
		if (victimId !== null && maxDistance > 0 && newDistance < maxDistance)
		{
			swap3dGraph(victimId, newId);

			if (window.DEBUG)
			{
				console.log(`Swapped Desmos 3D instace ${victimId} in to fill ${newId}`);
			}

			// Only one swap per scroll event to prevent oscillation.
			break;
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

	console.log(desmosGraphs[id]);
	console.log(desmosGraphs[id].getExpressions());

	console.log(searchProperties(desmosGraphs[id], /colorLatex/));

	if (!is3d)
	{
		const expressions = desmosGraphs[id].getExpressions();

		for (let i = 0; i < expressions.length; i++)
		{
			// Set lineWidth to 15 for cover images
			expressions[i].lineWidth = forPdf ? 5 : 15;
			expressions[i].pointSize = forPdf ? 10 : 25;
			expressions[i].dragMode = "NONE";
		}

		desmosGraphs[id].setExpressions(expressions);
	}

	const imageData = is3d
		? desmosGraphs[id].screenshot({
			width: 800,
			height: 800,
			targetPixelRatio: 2,
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
	dragMode = desmosDragModes.XY,
	style = desmosPointStyles.POINT,
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
	useUnitNormal = false,
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

		const unitVector = useUnitNormal
			? [
				rPrime[1] / magnitudeRPrime,
				-rPrime[0] / magnitudeRPrime
			] : [
				rPrime[0] / magnitudeRPrime,
				rPrime[1] / magnitudeRPrime
			];

		const fieldHere = fieldFunction(pathFunctionHere[0], pathFunctionHere[1]);

		const dotProduct = clamp(
			fieldHere[0] * unitVector[0] + fieldHere[1] * unitVector[1],
			-2,
			2
		) / 2;

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