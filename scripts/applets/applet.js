import { addHoverEventWithScale } from "../src/hoverEvents.js";
import {
	addTemporaryListener,
	pageElement,
	pageUrl
} from "../src/main.js";

// Each entry is an array beginning with the return type,
// followed by the parameter types. The types are either "float" or "vec2",
// or "float | vec2" to indicate that the function can return either.
const glslFunctions = {
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

export class Applet
{
	canvas;
	wilson;
	wilsonForFullscreen;
	allowFullscreenWithKeyboard = true;

	fpsDisplayCtx;

	// Temporary things that should be destroyed when calling Applet.destroy.

	workers = [];
	timeoutIds = [];

	keysPressed = {};
	numTouches = 0;
	needNewFrame = false;

	aspectRatio = 1;

	state = {};
	defaultState = {};

	constructor(canvas)
	{
		this.canvas = canvas;

		this.pan.parent = this;
		this.zoom.parent = this;

		if (window.DEBUG)
		{
			setTimeout(() => this.addFpsDisplay(), 500);
		}

		Applet.current.push(this);
	}

	destroy()
	{
		this.animationPaused = true;

		this.workers.forEach(worker =>
		{
			if (worker?.terminate)
			{
				worker?.terminate();
			}
		});

		this.timeoutIds.forEach(timeoutId =>
		{
			if (timeoutId != null)
			{
				clearTimeout(timeoutId);
			}
		});

		if (this.hiddenCanvasContainer)
		{
			this.hiddenCanvasContainer.remove();
		}

		const params = new URLSearchParams(window.location.search);

		for (const key in this.state)
		{
			params.delete(key);
		}

		const string = params.toString();

		window.history.replaceState(
			{ url: pageUrl },
			document.title,
			pageUrl.replace(/\/home\//, "/") + (string ? `?${string}` : "")
		);

		const vowel = ["a", "e", "i", "o", "u", "y"]
			.includes(this.constructor.name[0].toLowerCase())
			? "n"
			: "";

		console.log(`Destroyed a${vowel} ${this.constructor.name} applet`);
	}

	initState()
	{
		const searchParams = new URLSearchParams(window.location.search);

		for (const key in this.defaultState)
		{
			this.state[key] = searchParams.get(key);
		}
	}

	setState(key, value)
	{
		this.state[key] = value;

		const searchParams = new URLSearchParams(window.location.search);
		searchParams.set(key, value);

		const string = searchParams.toString();

		window.history.replaceState({ url: pageUrl }, "", pageUrl.replace(/\/home\//, "/") + (string ? `?${string}` : ""));
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

			this.fpsDisplayCtx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

			this.fpsDisplayCtx.fillRect(i, 100 - height, 1, height);
		}

		this.fpsDisplayCtx.fillStyle = "rgb(127, 127, 127)";

		this.fpsDisplayCtx.fillRect(0, 100 - 8.333, 100, 2);
		this.fpsDisplayCtx.fillRect(0, 100 - 16.667, 100, 2);
		this.fpsDisplayCtx.fillRect(0, 100 - 33.333, 100, 2);

		requestAnimationFrame(this.updateFpsDisplay.bind(this));
	}



	hiddenCanvasContainer;

	createHiddenCanvas()
	{
		const hiddenCanvas = document.createElement("canvas");
		hiddenCanvas.classList.add("hidden-canvas");

		if (!this.hiddenCanvasContainer)
		{
			this.hiddenCanvasContainer = document.createElement("div");
			this.hiddenCanvasContainer.style.display = "none";
			pageElement.appendChild(this.hiddenCanvasContainer);
		}

		this.hiddenCanvasContainer.appendChild(hiddenCanvas);

		return hiddenCanvas;
	}



	addHelpButton(callback)
	{
		const element = document.createElement("div");
		element.classList.add("wilson-help-button");
		element.innerHTML = /* html */`
			<img src="/graphics/general-icons/help.webp" alt="Help" tabindex="0"></img>
		`;
		this.wilson.outputCanvasContainer.appendChild(element);

		setTimeout(() =>
		{
			addHoverEventWithScale({
				element,
				scale: 1.1,
			});

			element.addEventListener("click", (e) => callback(e));
		}, 10);
	}


	onGrabCanvas()
	{
		this.pan.onGrabCanvas();
		this.zoom.onGrabCanvas();
	}

	onDragCanvas(x, y, xDelta, yDelta)
	{
		this.pan.onDragCanvas(x, y, xDelta, yDelta);
	}

	onReleaseCanvas()
	{
		this.pan.onReleaseCanvas();
		this.zoom.onReleaseCanvas();
	}

	onWheelCanvas(x, y, scrollAmount)
	{
		this.zoom.onWheelCanvas(x, y, scrollAmount);
	}

	onPinchCanvas(x, y, touchDistanceDelta)
	{
		this.zoom.onPinchCanvas(x, y, touchDistanceDelta);
	}

	handleKeydownEvent(e)
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

			this.keysPressed[key] = true;
		}
	}

	handleKeyupEvent(e)
	{
		const key = e.key.toLowerCase();

		if (Object.prototype.hasOwnProperty.call(this.keysPressed, key))
		{
			e.preventDefault();

			this.keysPressed[key] = false;
		}
	}

	handleTouchStartEvent(e)
	{
		this.numTouches = e.touches.length;
	}

	handleTouchEndEvent(e)
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
		function handleKeydownEvent(e)
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

		function handleKeyupEvent(e)
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

		keys.forEach(key => this.keysPressed[key] = false);

		addTemporaryListener({
			object: document.documentElement,
			event: "keydown",
			callback: handleKeydownEvent.bind(this)
		});

		addTemporaryListener({
			object: document.documentElement,
			event: "keyup",
			callback: handleKeyupEvent.bind(this)
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
	
	

	changeAspectRatio(useZoomLevel = false, wilsons = [this.wilson])
	{
		wilsons.forEach(wilson =>
		{
			if (wilson.fullscreen.currentlyFullscreen)
			{
				wilson.changeCanvasSize(
					...Applet.getEqualPixelFullScreen(this.resolution)
				);

				this.aspectRatio = window.innerWidth / window.innerHeight;

				if (this.aspectRatio >= 1)
				{
					if (useZoomLevel)
					{
						wilson.worldWidth = 3 * Math.pow(2, this.zoom.level) * this.aspectRatio;
						wilson.worldHeight = 3 * Math.pow(2, this.zoom.level);
					}
				}

				else
				{
					if (useZoomLevel)
					{
						wilson.worldWidth = 3 * Math.pow(2, this.zoom.level);
						wilson.worldHeight = 3 * Math.pow(2, this.zoom.level) / this.aspectRatio;
					}
				}
			}

			else
			{
				this.aspectRatio = 1;

				wilson.changeCanvasSize(this.resolution, this.resolution);

				if (useZoomLevel)
				{
					wilson.worldWidth = 3 * Math.pow(2, this.zoom.level);
					wilson.worldHeight = 3 * Math.pow(2, this.zoom.level);
				}
			}
		});

		if (useZoomLevel)
		{
			this.zoom.clamp();
		}

		this.needNewFrame = true;
	}



	makeVideo(time)
	{
		const record = () =>
		{
			const recordedChunks = [];
			return new Promise(resolve =>
			{
				const stream = this.canvas.captureStream(120);
				const mediaRecorder = new MediaRecorder(
					stream,
					{ mimeType: "video/mp4", videoBitsPerSecond: Infinity }
				);
				
				// ondataavailable will fire in interval of `time || 4000 ms`
				mediaRecorder.start(time || 4000);

				mediaRecorder.ondataavailable = function(event)
				{
					recordedChunks.push(event.data);
					// after stop `dataavilable` event run one more time
					if (mediaRecorder.state === "recording")
					{
						mediaRecorder.stop();
					}

				};

				mediaRecorder.onstop = function()
				{
					const blob = new Blob(recordedChunks, { type: "video/mp4" });
					const url = URL.createObjectURL(blob);
					resolve(url);
				};
			});
		};

		const recording = record(10000);

		const video = document.createElement("video");
		pageElement.appendChild(video);
		recording.then(url => video.setAttribute("src", url));

		const link = document.createElement("a");
		link.setAttribute("download","recordingVideo");
		recording.then(url =>
		{
			link.setAttribute("href", url);
			link.click();
		});
	}



	pan = {
		parent: null,

		frame: 0,

		minX: -Infinity,
		maxX: Infinity,
		minY: -Infinity,
		maxY: Infinity,

		velocityX: 0,
		velocityY: 0,
		nextVelocityX: 0,
		nextVelocityY: 0,
		velocityListLength: 4,
		lastVelocitiesX: new Array(this.velocityListLength),
		lastVelocitiesY: new Array(this.velocityListLength),

		friction: .93,
		velocityStartThreshhold: .005,
		velocityStopThreshhold: .0005,

		setBounds({
			minX,
			maxX,
			minY,
			maxY
		}) {
			this.minX = minX;
			this.maxX = maxX;
			this.minY = minY;
			this.maxY = maxY;

			this.parent.zoom.maxLevel = Math.log2(
				Math.min(this.maxX - this.minX, this.maxY - this.minY) / 3
			);

			this.parent.zoom.clamp();
		},

		clamp()
		{
			if (this.parent.wilson.worldWidth > this.maxX - this.minX)
			{
				this.parent.wilson.worldCenterX = (this.maxX + this.minX) / 2;
			}

			else
			{
				const minWorldCenterX = this.minX + this.parent.wilson.worldWidth / 2;
				const maxWorldCenterX = this.maxX - this.parent.wilson.worldWidth / 2;

				this.parent.wilson.worldCenterX = Math.min(
					Math.max(
						this.parent.wilson.worldCenterX,
						minWorldCenterX
					),
					maxWorldCenterX
				);
			}

			if (this.parent.wilson.worldHeight > this.maxY - this.minY)
			{
				this.parent.wilson.worldCenterY = (this.maxY + this.minY) / 2;
			}

			else
			{
				const minWorldCenterY = this.minY + this.parent.wilson.worldHeight / 2;
				const maxWorldCenterY = this.maxY - this.parent.wilson.worldHeight / 2;

				this.parent.wilson.worldCenterY = Math.min(
					Math.max(
						this.parent.wilson.worldCenterY,
						minWorldCenterY
					),
					maxWorldCenterY
				);
			}
		},

		onGrabCanvas()
		{
			this.velocityX = 0;
			this.velocityY = 0;

			for (let i = 0; i < this.velocityListLength; i++)
			{
				this.lastVelocitiesX[i] = 0;
				this.lastVelocitiesY[i] = 0;
			}

			this.frame = 0;
		},

		onDragCanvas(x, y, xDelta, yDelta)
		{
			this.parent.wilson.worldCenterX -= xDelta;
			this.parent.wilson.worldCenterY -= yDelta;

			this.parent.needNewFrame = true;

			this.clamp();

			this.nextVelocityX = -xDelta / this.parent.wilson.worldWidth;
			this.nextVelocityY = -yDelta / this.parent.wilson.worldHeight;
		},

		onReleaseCanvas()
		{
			// Find the max absolute value.
			for (let i = 0; i < this.velocityListLength; i++)
			{
				if (Math.abs(this.lastVelocitiesX[i]) > Math.abs(this.velocityX))
				{
					this.velocityX = this.lastVelocitiesX[i];
				}

				if (Math.abs(this.lastVelocitiesY[i]) > Math.abs(this.velocityY))
				{
					this.velocityY = this.lastVelocitiesY[i];
				}
			}

			const magnitude = this.velocityX * this.velocityX + this.velocityY * this.velocityY;

			if (magnitude < this.velocityStartThreshhold * this.velocityStartThreshhold)
			{
				this.velocityX = 0;
				this.velocityY = 0;
				this.nextVelocityX = 0;
				this.nextVelocityY = 0;

				for (let i = 0; i < this.velocityListLength; i++)
				{
					this.lastVelocitiesX[i] = 0;
					this.lastVelocitiesY[i] = 0;
				}
			}
		},

		// Call this in the drawFrame loop.
		update(timeElapsed)
		{
			this.lastVelocitiesX[this.frame] = this.nextVelocityX;
			this.lastVelocitiesY[this.frame] = this.nextVelocityY;

			this.frame = (this.frame + 1) % this.velocityListLength;

			// This ensures that velocities don't get double-counted.
			this.nextVelocityX = 0;
			this.nextVelocityY = 0;

			const magnitude = this.velocityX * this.velocityX + this.velocityY * this.velocityY;

			if (magnitude < this.velocityStopThreshhold * this.velocityStopThreshhold)
			{
				this.velocityX = 0;
				this.velocityY = 0;
			}

			else
			{
				this.parent.needNewFrame = true;

				this.parent.wilson.worldCenterX += this.velocityX
					* this.parent.wilson.worldWidth * timeElapsed / 6.944;

				this.parent.wilson.worldCenterY += this.velocityY
					* this.parent.wilson.worldHeight * timeElapsed / 6.944;

				this.clamp();

				this.velocityX *= this.friction ** (timeElapsed / 6.944);
				this.velocityY *= this.friction ** (timeElapsed / 6.944);
			}

			if (this.parent?.wilson?.draggables?.recalculateLocations)
			{
				this.parent.wilson.draggables.recalculateLocations();
			}
		}
	};



	zoom = {
		parent: null,
		frame: 0,

		pinchMultiplier: 9,

		level: 0,
		maxLevel: Infinity,
		minLevel: -Infinity,

		fixedPointX: 0,
		fixedPointY: 0,

		velocity: 0,
		nextVelocity: 0,
		velocityListLength: 4,
		lastVelocities: new Array(this.velocityListLength),

		friction: .9,
		velocityStartThreshhold: .001,
		velocityStopThreshhold: .001,

		init()
		{
			this.level = Math.log2(
				Math.min(this.parent.wilson.worldWidth, this.parent.wilson.worldHeight) / 3
			);
		},

		clamp()
		{
			const aspectRatio = this.parent.wilson.worldWidth / this.parent.wilson.worldHeight;
			const maxWidth = this.parent.pan.maxX - this.parent.pan.minX;
			const maxHeight = this.parent.pan.maxY - this.parent.pan.minY;

			if (
				this.parent.wilson.worldWidth > maxWidth
				&& this.parent.wilson.worldHeight > maxHeight
			) {
				if (aspectRatio >= 1)
				{
					this.parent.wilson.worldWidth = maxWidth;

					this.parent.wilson.worldHeight = this.parent.wilson.worldWidth / aspectRatio;
				}
				
				else
				{
					this.parent.wilson.worldHeight = maxHeight;

					this.parent.wilson.worldWidth = this.parent.wilson.worldHeight * aspectRatio;
				}

				this.level = Math.log2(
					Math.min(this.parent.wilson.worldWidth, this.parent.wilson.worldHeight) / 3
				);
			}

			this.level = Math.min(Math.max(this.level, this.minLevel), this.maxLevel);

			this.parent.pan.clamp();
		},

		onGrabCanvas()
		{
			this.velocity = 0;

			for (let i = 0; i < this.velocityListLength; i++)
			{
				this.lastVelocities[i] = 0;
			}

			this.frame = 0;
		},

		onWheelCanvas(x, y, scrollAmount)
		{
			this.parent.needNewFrame = true;

			this.fixedPointX = x;
			this.fixedPointY = y;

			if (Math.abs(scrollAmount / 100) < .3)
			{
				this.level += scrollAmount / 100;
			}

			else
			{
				this.velocity += Math.sign(scrollAmount) * .085;
			}

			this.zoomCanvas();
		},

		onPinchCanvas(x, y, touchDistanceDelta)
		{
			this.parent.needNewFrame = true;
			
			if (this.parent.wilson.worldWidth >= this.parent.wilson.worldHeight)
			{
				this.level -= touchDistanceDelta / this.parent.wilson.worldWidth
					* this.pinchMultiplier;

				this.nextVelocity = -touchDistanceDelta / this.parent.wilson.worldWidth
					* this.pinchMultiplier;
			}

			else
			{
				this.level -= touchDistanceDelta / this.parent.wilson.worldHeight
					* this.pinchMultiplier;

				this.nextVelocity = -touchDistanceDelta / this.parent.wilson.worldHeight
					* this.pinchMultiplier;
			}

			this.fixedPointX = x;
			this.fixedPointY = y;

			this.zoomCanvas();
		},

		onReleaseCanvas()
		{
			// Find the max absolute value.
			for (let i = 0; i < this.velocityListLength; i++)
			{
				if (Math.abs(this.lastVelocities[i]) > Math.abs(this.velocity))
				{
					this.velocity = this.lastVelocities[i];
				}
			}

			if (Math.abs(this.velocity) < this.velocityStartThreshhold)
			{
				this.velocity = 0;
				this.nextVelocity = 0;

				for (let i = 0; i < this.velocityListLength; i++)
				{
					this.lastVelocities[i] = 0;
				}
			}
		},

		zoomCanvas()
		{
			this.clamp();

			const aspectRatio = this.parent.wilson.worldWidth / this.parent.wilson.worldHeight;

			if (aspectRatio >= 1)
			{
				const newWorldCenter = this.parent.wilson.input.getZoomedWorldCenter(
					this.fixedPointX,
					this.fixedPointY,
					3 * Math.pow(2, this.level) * aspectRatio,
					3 * Math.pow(2, this.level)
				);

				this.parent.wilson.worldWidth = 3 * Math.pow(2, this.level) * aspectRatio;
				this.parent.wilson.worldHeight = 3 * Math.pow(2, this.level);

				this.parent.wilson.worldCenterX = newWorldCenter[0];
				this.parent.wilson.worldCenterY = newWorldCenter[1];
			}

			else
			{
				const newWorldCenter = this.parent.wilson.input.getZoomedWorldCenter(
					this.fixedPointX,
					this.fixedPointY,
					3 * Math.pow(2, this.level),
					3 * Math.pow(2, this.level) / aspectRatio
				);

				this.parent.wilson.worldWidth = 3 * Math.pow(2, this.level);
				this.parent.wilson.worldHeight = 3 * Math.pow(2, this.level) / aspectRatio;

				this.parent.wilson.worldCenterX = newWorldCenter[0];
				this.parent.wilson.worldCenterY = newWorldCenter[1];
			}
		},

		// Call this in the drawFrame loop.
		update(timeElapsed)
		{
			this.lastVelocities[this.frame] = this.nextVelocity;

			this.frame = (this.frame + 1) % this.velocityListLength;

			// This ensures that velocities don't get double-counted.
			this.nextVelocity = 0;

			if (Math.abs(this.velocity) < this.velocityStopThreshhold)
			{
				this.velocity = 0;
			}

			else
			{
				this.level += this.velocity * timeElapsed / 6.944;

				this.zoomCanvas();

				this.velocity *= this.friction ** (timeElapsed / 6.944);

				this.parent.needNewFrame = true;
			}

			if (this.parent?.wilson?.draggables?.recalculateLocations)
			{
				this.parent.wilson.draggables.recalculateLocations();
			}
		}
	};



	async createVideo({
		perFrameCallback,
		totalFrames,
		fps
	}) {
		const module = await import("https://unpkg.com/mp4-wasm@1.0.6");
		const MP4 = await module.loadMP4Module();
		const encoder = MP4.createWebCodecsEncoder({
			width: this.wilson.canvasWidth,
			height: this.wilson.canvasHeight,
			fps,
			bitrate: 50_000_000
		});

		let frame = 0;

		requestAnimationFrame(loop.bind(this));

		async function loop()
		{
			if (frame < totalFrames)
			{
				console.log(`Encoding frame ${frame + 1} of ${totalFrames}`);

				perFrameCallback(frame);

				// Create a bitmap out of the frame
				const bitmap = await createImageBitmap(this.canvas);

				// Add bitmap to encoder
				await encoder.addFrame(bitmap);

				// Trigger next frame loop
				frame++;
				requestAnimationFrame(loop.bind(this));
			}
			
			else
			{
				// Get an Uint8Array buffer
				const buf = await encoder.end();
				show(buf, this.wilson.canvasWidth, this.wilson.canvasHeight);
				return;
			}
		}

		function show(data, width, height)
		{
			const url = URL.createObjectURL(new Blob([data], { type: "video/mp4" }));
			const video = document.createElement("video");
			video.setAttribute("muted", "muted");
			video.setAttribute("autoplay", "autoplay");
			video.setAttribute("controls", "controls");
			const min = Math.min(width, window.innerWidth, window.innerHeight);
			const aspect = width / height;
			const size = min * 0.75;
			video.style.width = `${size}px`;
			video.style.height = `${size / aspect}px`;

			pageElement.appendChild(video);
			video.src = url;

			const text = document.createElement("div");
			const anchor = document.createElement("a");
			text.appendChild(anchor);
			anchor.href = url;
			anchor.id = "download";
			anchor.textContent = "Click here to download MP4 file...";
			anchor.download = "download.mp4";
			pageElement.appendChild(text);
		}
	}



	static current = [];



	static listenToInputElements(elements, run)
	{
		elements.forEach(element =>
		{
			element.addEventListener("keydown", (e) =>
			{
				if (e.key === "Enter")
				{
					e.preventDefault();
					run();
				}
			});
		});
	}



	// Turns expressions like 2(3x^2+1) into something equivalent
	// to 2.0 * (3.0 * pow(x, 2.0) + 1.0).
	static parseNaturalGlsl(glsl)
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

	static getRandomGlsl({
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
		const possibleFunctions = Object.keys(glslFunctions)
			.filter(key => glslFunctions[key][0] === returnType);
		
		const functionName = possibleFunctions[
			Math.floor(Math.random() * possibleFunctions.length)
		];
		
		const parameterTypes = glslFunctions[functionName].slice(1);

		const parameters = parameterTypes.map(type =>
		{
			return Applet.getRandomGlsl({
				depth: depth + 1,
				maxDepth,
				variables,
				returnType: type
			});
		});

		return `${functionName}(${parameters.join(",")})`;
	}



	static doubleToDf(d)
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



	static hexToRgb(hex)
	{
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}

	static componentToHex(c)
	{
		const hex = Math.floor(c).toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}

	static rgbToHex(r, g, b)
	{
		return "#" + Applet.componentToHex(r) + Applet.componentToHex(g) + Applet.componentToHex(b);
	}

	static getEqualPixelFullScreen(resolution)
	{
		const sqrtAspectRatio = Math.sqrt(window.innerWidth / window.innerHeight);

		return [Math.round(resolution * sqrtAspectRatio), Math.round(resolution / sqrtAspectRatio)];
	}
}



function hsvToRgb(h, s, v)
{
	function f(n)
	{
		const k = (n + 6 * h) % 6;
		return v - v * s * Math.max(0, Math.min(k, Math.min(4 - k, 1)));
	}

	return [255 * f(5), 255 * f(3), 255 * f(1)];
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

export const tempShader = /* glsl */`
	precision highp float;
	varying vec2 uv;
	
	void main(void)
	{
		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
	}
`;