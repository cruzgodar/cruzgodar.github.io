import { convertColor } from "../src/browser.js";
import { showZoomCard } from "../src/cards.js";
import { addHoverEventWithScale } from "../src/hoverEvents.js";
import {
	$,
	$$,
	addTemporaryListener
} from "../src/main.js";
import { siteSettings } from "../src/settings.js";
import { WilsonCPU, WilsonGPU } from "../wilson.js";

// Each entry is an array beginning with the return type,
// followed by the parameter types. The types are either "float" or "vec2",
// or "float | vec2" to indicate that the function can return either.
const randomGlslFunctions = {
	cadd: ["vec2", "vec2", "vec2"],
	csub: ["vec2", "vec2", "vec2"],
	cmul: ["vec2", "vec2", "vec2"],
	cdiv: ["vec2", "vec2", "vec2"],

	cexp: ["vec2", "vec2"],
	// clog: ["vec2", "vec2"],

	csin: ["vec2", "vec2"],
	ccos: ["vec2", "vec2"],
	// ctan: ["vec2", "vec2"],
};

export let currentlyLoadedApplets = [];

export function clearCurrentlyLoadedApplets()
{
	currentlyLoadedApplets = [];
}



export class Applet
{
	canvas;
	wilson;
	wilsonForFullscreen;
	wilsonForReset;
	wilsons = [];
	allowFullscreenWithKeyboard = true;
	allowResetWithKeyboard = true;

	fpsDisplayCtx;

	workers = [];
	timeoutIds = [];

	keysPressed = {};
	numTouches = 0;
	needNewFrame = false;

	constructor(canvas)
	{
		this.canvas = canvas;

		if (window.DEBUG)
		{
			setTimeout(() => this.addFpsDisplay(), 500);
		}

		if ($("#applet-controls-card") && !this.addHelpButton())
		{
			const refreshId = setInterval(() =>
			{
				if (this.addHelpButton())
				{
					clearInterval(refreshId);
				}
			}, 50);
		}

		this.addHoverEventOnWilsonButtons();

		this.setReduceMotionOnWilsons();

		currentlyLoadedApplets.push(this);
	}

	destroy()
	{
		this.animationPaused = true;

		for (const worker of this.workers)
		{
			if (worker?.terminate)
			{
				worker.terminate();
			}
		}

		for (const timeoutId of this.timeoutIds)
		{
			if (timeoutId != null)
			{
				clearTimeout(timeoutId);
			}
		}

		if (this.hiddenCanvasContainer)
		{
			this.hiddenCanvasContainer.remove();
		}

		for (const wilson of this.wilsons)
		{
			wilson.destroy();
		}

		const n = ["a", "e", "i", "o", "u", "y"]
			.includes(this.constructor.name[0].toLowerCase())
			? "n"
			: "";
		
		if (window.DEBUG)
		{
			console.log(`Destroyed a${n} ${this.constructor.name} applet`);
		}
	}

	runWhenOnscreen(data)
	{
		let hasRun = false;

		const onScroll = () =>
		{
			if (hasRun)
			{
				return;
			}

			const rect = this.canvas.getBoundingClientRect();
			const top = rect.top;
			const height = rect.height;

			if (top >= -height && top < window.innerHeight)
			{
				hasRun = true;
				
				setTimeout(() => this.run(data), 250);
			}
		};

		addTemporaryListener({
			object: window,
			event: "scroll",
			callback: onScroll
		});

		onScroll();
	}



	addFpsDisplay()
	{
		const fpsDisplayElement = document.createElement("canvas");

		fpsDisplayElement.classList.add("fps-canvas");

		fpsDisplayElement.setAttribute("width", "100");
		fpsDisplayElement.setAttribute("height", "100");

		this.canvas.parentNode.insertBefore(fpsDisplayElement, this.canvas.nextElementSibling);

		this.fpsDisplayCtx = fpsDisplayElement.getContext("2d");
		
		fpsDisplayElement.style.setProperty(
			"view-transition-name",
			"fps-canvas" + Math.random().toString(36).slice(2)
		);

		requestAnimationFrame(this.updateFpsDisplay.bind(this));
	}

	lastFpsDisplayTimestamp;
	fpsTimestampHistory = new Array(100);

	updateFpsDisplay(timestamp)
	{
		const timeElapsed = timestamp - this.lastFpsDisplayTimestamp;

		if (!timeElapsed || !this.lastFpsDisplayTimestamp)
		{
			this.lastFpsDisplayTimestamp = timestamp;

			requestAnimationFrame(this.updateFpsDisplay.bind(this));

			return;
		}

		this.lastFpsDisplayTimestamp = timestamp;

		this.fpsTimestampHistory.push(timeElapsed);
		this.fpsTimestampHistory.shift();

		this.fpsDisplayCtx.clearRect(0, 0, 100, 100);

		for (let i = 0; i < 100; i++)
		{
			const height = Math.min(this.fpsTimestampHistory[i], 100);
			const hue = (() =>
			{
				if (height < 8.333)
				{
					return 5 / 9 - (height / 8.333) * (5 / 9 - 1 / 3);
				}

				if (height < 16.667)
				{
					return 1 / 3 - (height - 8.333) / (16.667 - 8.333) * (1 / 3 - 7 / 45);
				}

				if (height < 33.333)
				{
					return 7 / 45 - (height - 16.667) / (33.333 - 16.667) * (7 / 45 - 1 / 12);
				}

				return 1 / 12 - (height - 33.333) / (100 - 33.333) * 1 / 12;
			})();

			const rgb = hsvToRgb(hue, 1, 1);

			this.fpsDisplayCtx.fillStyle = convertColor(...rgb);

			this.fpsDisplayCtx.fillRect(i, 100 - height, 1, height);
		}

		this.fpsDisplayCtx.fillStyle = "rgb(127, 127, 127)";

		this.fpsDisplayCtx.fillRect(0, 100 - 8.333, 100, 2);
		this.fpsDisplayCtx.fillRect(0, 100 - 16.667, 100, 2);
		this.fpsDisplayCtx.fillRect(0, 100 - 33.333, 100, 2);

		requestAnimationFrame(this.updateFpsDisplay.bind(this));
	}



	hiddenCanvasContainer;

	createHiddenCanvas(hidden = true, aspectRatio = 1)
	{
		const hiddenCanvas = document.createElement("canvas");
		hiddenCanvas.classList.add(hidden ? "hidden-canvas" : "output-canvas");

		hiddenCanvas.style.width = "10px";
		hiddenCanvas.style.height = `${10 / aspectRatio}px`;

		if (!this.hiddenCanvasContainer)
		{
			this.hiddenCanvasContainer = document.createElement("div");
			this.hiddenCanvasContainer.classList.add("temporary-element");
			
			this.hiddenCanvasContainer.style.position = "fixed";
			this.hiddenCanvasContainer.style.top = "0";
			this.hiddenCanvasContainer.style.left = "calc(-1000vw - 100px)";
			
			document.body.appendChild(this.hiddenCanvasContainer);
		}

		this.hiddenCanvasContainer.appendChild(hiddenCanvas);

		return hiddenCanvas;
	}

	

	addHoverEventOnWilsonButtons()
	{
		let attempts = 0;

		const refreshId = setInterval(() =>
		{
			if (attempts > 40)
			{
				return;
			}

			attempts++;

			const buttons = $$(`
				.WILSON_enter-fullscreen-button,
				.WILSON_exit-fullscreen-button,
				.WILSON_reset-button
			`);

			for (const button of buttons)
			{
				addHoverEventWithScale({
					element: button,
					scale: 1.1,
					addBounceOnTouch: () => true
				});
			}

			if (buttons.length !== 0)
			{
				clearInterval(refreshId);
			}
		}, 50);
	}

	setReduceMotionOnWilsons()
	{
		let attempts = 0;

		const refreshId = setInterval(() =>
		{
			if (attempts > 40)
			{
				return;
			}

			attempts++;

			this.wilsons = Object.values(this).filter(field =>
			{
				return field instanceof WilsonCPU || field instanceof WilsonGPU;
			});

			if (this.wilsons.length !== 0)
			{
				clearInterval(refreshId);

				for (const wilson of this.wilsons)
				{
					wilson.reduceMotion = siteSettings.reduceMotion;
				}
			}
		}, 50);
	}

	addHelpButton()
	{
		const outputCanvasContainer = this.wilson?.canvas?.parentElement;

		if (!outputCanvasContainer)
		{
			return null;
		}

		const element = document.createElement("div");
		element.classList.add("wilson-help-button");
		element.innerHTML = /* html */`
			<img src="/graphics/general-icons/help.webp" alt="Help" tabindex="0"></img>
		`;
		outputCanvasContainer.appendChild(element);

		setTimeout(() =>
		{
			addHoverEventWithScale({
				element,
				scale: 1.1,
				addBounceOnTouch: () => true,
			});

			element.addEventListener("click", () => showZoomCard({
				id: "applet-controls",
				fromElement: element,
			}));

			if (!siteSettings.reduceMotion)
			{
				element.style.setProperty("view-transition-name", `wilson-help-button${Math.random().toString(36).slice(2)}`);
			}
		}, 10);

		return element;
	}

	handleTouchstart(e)
	{
		this.numTouches = e.touches.length;
	}

	handleTouchend(e)
	{
		// Prevents abruptly moving back then forward.
		if (this.numTouches >= 3 && e.touches.length === 2)
		{
			this.numTouches = 1;
		}

		else
		{
			this.numTouches = e.touches.length;
		}
	}


	listenForKeysPressed(keys, callback = () => {})
	{
		function handleKeydown(e)
		{
			if (
				document.activeElement.tagName === "INPUT"
				|| document.activeElement.tagName === "TEXTAREA"
			) {
				return;
			}
			
			const key = e.key.toLowerCase();

			if (Object.prototype.hasOwnProperty.call(this.keysPressed, key))
			{
				e.preventDefault();

				if (!this.keysPressed[key])
				{
					this.keysPressed[key] = true;
					callback(key, true);
				}
			}
		}

		function handleKeyup(e)
		{
			const key = e.key.toLowerCase();

			if (Object.prototype.hasOwnProperty.call(this.keysPressed, key))
			{
				e.preventDefault();

				if (this.keysPressed[key])
				{
					this.keysPressed[key] = false;
					callback(key, false);
				}
			}
		}

		for (const key of keys)
		{
			this.keysPressed[key] = false;
		}

		addTemporaryListener({
			object: document.documentElement,
			event: "keydown",
			callback: handleKeydown.bind(this)
		});

		addTemporaryListener({
			object: document.documentElement,
			event: "keyup",
			callback: handleKeyup.bind(this)
		});
	}

	listenForNumTouches()
	{
		addTemporaryListener({
			object: this.canvas.parentNode.nextElementSibling,
			event: "touchstart",
			callback: this.handleTouchStartEvent.bind(this)
		});

		addTemporaryListener({
			object: this.canvas.parentNode.nextElementSibling,
			event: "touchend",
			callback: this.handleTouchEndEvent.bind(this)
		});
	}

	downloadBokehFrameFromPixels({
		pixels,
		resolution,
		blurAmount = 1,
		clipDistance
	}) {
		// A minimum radius of 0 is just one pixel, but it causes weird sharpness artifacts.
		const minRadius = 0.5;
		const maxRadius = resolution / 250 * blurAmount;

		const canvas = this.createHiddenCanvas();
		const options = {
			canvasWidth: resolution,
			verbose: window.DEBUG
		};
		const wilsonHidden = new WilsonCPU(canvas, options);

		wilsonHidden.ctx.fillStyle = "rgb(0, 0, 0)";
		wilsonHidden.ctx.fillRect(0, 0, resolution, resolution);

		const chunkedPixels = new Array(resolution * resolution);

		for (let i = 0; i < resolution * resolution; i++)
		{
			const col = i % resolution;
			const row = Math.floor(i / resolution);

			chunkedPixels[i] = [
				pixels[4 * i + 3],
				col,
				row,
				pixels[4 * i] * 255,
				pixels[4 * i + 1] * 255,
				pixels[4 * i + 2] * 255,
			];
		}

		const pixelsByDepth = chunkedPixels.sort((a, b) => b[0] - a[0]);

		const minDepth = pixelsByDepth[pixelsByDepth.length - 1][0];
		
		let maxDepthIndex = 0;
		for (let i = 0; i < pixelsByDepth.length; i++)
		{
			if (pixelsByDepth[i][0] < clipDistance)
			{
				maxDepthIndex = i;
				break;
			}
		}
		maxDepthIndex = Math.floor(
			maxDepthIndex
			+ .1 * (pixelsByDepth.length - maxDepthIndex)
		);
		const maxDepth = pixelsByDepth[maxDepthIndex][0];

		const imageData = new Array(resolution * resolution * 4).fill(0);
		


		for (const pixel of pixelsByDepth)
		{
			const depth = pixel[0];

			if (depth === clipDistance)
			{
				continue;
			}

			const col = pixel[1];
			const row = pixel[2];

			const radius = Math.min(
				Math.max(
					(depth - minDepth) / (maxDepth - minDepth),
					0,
				),
				1
			) * (maxRadius - minRadius) + minRadius;



			// First we have to compute the total opacity spread over
			// all the pixels hit by this circle. There's unfortunately not a good
			// way to compute this other than taking a full pass over the pixels.

			let totalValue = 0;

			for (let y = Math.floor(-radius); y <= Math.ceil(radius); y++)
			{
				for (let x = Math.floor(-radius); x <= Math.ceil(radius); x++)
				{
					if (x * x + y * y <= radius * radius)
					{
						const value = Math.min(radius - Math.sqrt(x * x + y * y), 1);

						totalValue += value;
					}
				}
			}

			const opacity = 1 / totalValue;

			for (let y = Math.floor(-radius); y <= Math.ceil(radius); y++)
			{
				for (let x = Math.floor(-radius); x <= Math.ceil(radius); x++)
				{
					if (x * x + y * y <= radius * radius)
					{
						const row2 = row + y;
						const col2 = col + x;

						if (
							row2 < 0
							|| row2 >= resolution
							|| col2 < 0
							|| col2 >= resolution
						) {
							continue;
						}

						const index = row2 * resolution + col2;
						const value = opacity * Math.min(radius - Math.sqrt(x * x + y * y), 1);

						imageData[4 * index] += pixel[3] * value;
						imageData[4 * index + 1] += pixel[4] * value;
						imageData[4 * index + 2] += pixel[5] * value;
					}
				}
			}
		}

		const normalizedImageData = new Uint8ClampedArray(imageData);

		for (let i = 0; i < resolution * resolution; i++)
		{
			normalizedImageData[4 * i + 3] = 255;
		}

		wilsonHidden.drawFrame(normalizedImageData);

		wilsonHidden.downloadFrame("bokeh-render.png");

		canvas.remove();
	}
}



// HSV are in [0, 1], and the outputs are in [0, 255].
export function hsvToRgb(h, s, v)
{
	function f(n)
	{
		const k = (n + 6 * h) % 6;
		return v - v * s * Math.max(0, Math.min(k, Math.min(4 - k, 1)));
	}

	return [255 * f(5), 255 * f(3), 255 * f(1)];
}

export function rgbToHsv(r, g, b)
{
	r /= 255;
	g /= 255;
	b /= 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const delta = max - min;

	let h = 0;
	const s = max === 0 ? 0 : delta / max;
	const v = max;

	if (delta !== 0)
	{
		if (max === r)
		{
			h = ((g - b) / delta + 6) % 6;
		}

		else if (max === g)
		{
			h = (b - r) / delta + 2;
		}

		else
		{
			h = (r - g) / delta + 4;
		}

		h /= 6;
	}

	return [h, s, v];
}

/*
	Produces strings like
 	min(
		min(
			min(distance1, distance2),
			min(distance3, distance4)
		),
		min(
			min(distance5, distance6),
			distance7
		)
	);
 */
export function getMinGlslString(varName, numVars, functionName = "min")
{
	const numLayers = Math.ceil(Math.log2(numVars));

	let strings = new Array(numVars);

	for (let i = 0; i < numVars; i++)
	{
		strings[i] = `${varName}${i + 1}`;
	}

	for (let i = 0; i < numLayers; i++)
	{
		const newStrings = new Array(Math.ceil(strings.length / 2));

		for (let j = 0; j < strings.length; j += 2)
		{
			newStrings[j / 2] = `${functionName}(${strings[j]}, ${strings[j + 1]})`;
		}

		if (strings.length % 2 === 1)
		{
			newStrings[newStrings.length - 1] = strings[strings.length - 1];
		}

		strings = newStrings;
	}

	return strings[0];
}

export function getMaxGlslString(varName, numVars)
{
	return getMinGlslString(varName, numVars, "max");
}

export function getColorGlslString(varName, minVarName, colors)
{
	let colorGlsl = "";

	for (let i = 0; i < colors.length; i++)
	{
		colorGlsl += `if (${minVarName} == ${varName}${i + 1}) { return vec3(${colors[i][0] / 255}, ${colors[i][1] / 255}, ${colors[i][2] / 255}); }
		`;
	}

	return colorGlsl;
}

export function getFloatGlsl(float)
{
	if (typeof float === "string" || float !== Math.floor(float))
	{
		return float;
	}

	return /* glsl */`float(${float})`;
}

export function getVectorGlsl(vector)
{
	if (vector.length === 2)
	{
		return /* glsl */`vec2(${vector[0]}, ${vector[1]})`;
	}

	if (vector.length === 3)
	{
		return /* glsl */`vec3(${vector[0]}, ${vector[1]}, ${vector[2]})`;
	}

	if (vector.length === 4)
	{
		return /* glsl */`vec4(${vector[0]}, ${vector[1]}, ${vector[2]}, ${vector[3]})`;
	}

	console.error("Invalid vector length!");
	return "";
}

export function getMatrixGlsl(matrix)
{
	if (matrix.length === 2)
	{
		return /* glsl */`mat2(
			${matrix[0][0]}, ${matrix[1][0]},
			${matrix[0][1]}, ${matrix[1][1]}
		)`;
	}

	if (matrix.length === 3)
	{
		return /* glsl */`mat3(
			${matrix[0][0]}, ${matrix[1][0]}, ${matrix[2][0]},
			${matrix[0][1]}, ${matrix[1][1]}, ${matrix[2][1]},
			${matrix[0][2]}, ${matrix[1][2]}, ${matrix[2][2]}
		)`;
	}

	if (matrix.length === 4)
	{
		return /* glsl */`mat4(
			${matrix[0][0]}, ${matrix[1][0]}, ${matrix[2][0]}, ${matrix[3][0]},
			${matrix[0][1]}, ${matrix[1][1]}, ${matrix[2][1]}, ${matrix[3][1]},
			${matrix[0][2]}, ${matrix[1][2]}, ${matrix[2][2]}, ${matrix[3][2]},
			${matrix[0][3]}, ${matrix[1][3]}, ${matrix[2][3]}, ${matrix[3][3]}
		)`;
	}

	console.error("Invalid matrix shape!");
	return "";
}

export function doubleToDf(d)
{
	const df = new Float32Array(2);
	const split = (1 << 29) + 1;

	const a = d * split;
	const hi = a - (a - d);
	const lo = d - hi;

	df[0] = hi;
	df[1] = lo;

	return [df[0], df[1]];
}



export function hexToRgb(hex)
{
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

	return result ? [
		parseInt(result[1], 16),
		parseInt(result[2], 16),
		parseInt(result[3], 16)
	] : null;
}

function componentToHex(c)
{
	const hex = Math.floor(c).toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(r, g, b)
{
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// Turns expressions like 2(3x^2+1) into something equivalent
// to 2.0 * (3.0 * pow(x, 2.0) + 1.0).
export function parseNaturalGlsl(glsl)
{
	let newGlsl = glsl.replaceAll(/\s/g, ""); // Remove spaces

	while (newGlsl.match(/([^.0-9])([0-9]+)([^.0-9])/g))
	{
		newGlsl = newGlsl.replaceAll(/([^.0-9])([0-9]+)([^.0-9])/g, (match, $1, $2, $3) => `${$1}${$2}.0${$3}`); // Convert ints to floats
	}

	newGlsl = newGlsl.replaceAll(/([^0-9])(\.[0-9])/g, (match, $1, $2) => `${$1}0${$2}`) // Lead decimals with zeros
		.replaceAll(/([0-9]\.)([^0-9])/g, (match, $1, $2) => `${$1}0${$2}`) // End decimals with zeros
		.replaceAll(/([0-9)])([a-z(])/g, (match, $1, $2) => `${$1} * ${$2}`); // Juxtaposition to multiplication

	while (newGlsl.match(/([xyz])([xyz])/g))
	{
		newGlsl = newGlsl.replaceAll(/([xyz])([xyz])/g, (match, $1, $2) => `${$1} * ${$2}`); // Particular juxtaposition to multiplication
	}

	newGlsl = newGlsl.replaceAll(/([a-z0-9.]+)\^([a-z0-9.]+)/g, (match, $1, $2) => `pow(${$1}, ${$2})`); // Carats to power

	if (window.DEBUG)
	{
		console.log(newGlsl);
	}

	return newGlsl;
}



export function getRandomGlsl({
	depth = 0,
	maxDepth,
	variables = [],
	returnType = "vec2"
}) {
	if (!maxDepth)
	{
		maxDepth = Math.floor(Math.random() * 3) + 2;
	}

	if (depth >= maxDepth)
	{
		if (Math.random() < 0.8)
		{
			const variable = variables[Math.floor(Math.random() * variables.length)];

			return variable;
		}

		const x = Math.random() < 0.99
			? `${variables[Math.floor(Math.random() * variables.length)]}.${Math.random() < 0.5 ? "x" : "y"}`
			: `${Math.round((Math.random()) * 100) / 100}`;
		
		const y = Math.random() < 0.99
			? `${variables[Math.floor(Math.random() * variables.length)]}.${Math.random() < 0.5 ? "x" : "y"}`
			: `${Math.round((Math.random()) * 100) / 100}`;

		return `vec2(${x}, ${y})`;
	}

	// Otherwise, select a function with the correct return type.
	const possibleFunctions = Object.keys(randomGlslFunctions)
		.filter(key => randomGlslFunctions[key][0] === returnType);
	
	const functionName = possibleFunctions[
		Math.floor(Math.random() * possibleFunctions.length)
	];
	
	const parameterTypes = randomGlslFunctions[functionName].slice(1);

	const parameters = parameterTypes.map(type =>
	{
		return getRandomGlsl({
			depth: depth + 1,
			maxDepth,
			variables,
			returnType: type
		});
	});

	return `${functionName}(${parameters.join(",")})`;
}

export const tempShader = /* glsl */`
	precision highp float;
	varying vec2 uv;
	
	void main(void)
	{
		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
	}
`;