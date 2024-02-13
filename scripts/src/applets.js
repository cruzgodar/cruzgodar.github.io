import {
	addTemporaryListener,
	pageElement
} from "./main.js";

export class Applet
{
	canvas;
	wilson;

	fpsDisplayCtx;

	// Temporary things that should be destroyed when calling Applet.destroy.

	workers = [];
	timeoutIds = [];

	animationPaused = false;



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



	pause()
	{
		this.animationPaused = true;
	}



	resume()
	{
		this.animationPaused = false;
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

		console.log(`Destroyed an applet of type ${this.constructor.name}`);
	}



	pauseWhenOffscreen()
	{
		const onScroll = () =>
		{
			const rect = this.canvas.getBoundingClientRect();
			const top = rect.top;
			const height = rect.height;

			if (top >= -height && top < window.innerHeight)
			{
				this.resume();
			}

			else
			{
				this.pause();
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

		fpsDisplayElement.style.width = "100px";
		fpsDisplayElement.style.height = "100px";
		fpsDisplayElement.style.position = "absolute";
		fpsDisplayElement.style.bottom = "4px";
		fpsDisplayElement.style.right = "4px";
		fpsDisplayElement.style.borderBottomRightRadius = "12px";

		fpsDisplayElement.setAttribute("width", "100");
		fpsDisplayElement.setAttribute("height", "100");

		this.canvas.parentNode.insertBefore(fpsDisplayElement, this.canvas.nextElementSibling);

		this.fpsDisplayCtx = fpsDisplayElement.getContext("2d");

		window.requestAnimationFrame(this.updateFpsDisplay.bind(this));
	}

	lastFpsDisplayTimestamp;
	fpsTimestampHistory = new Array(100);

	updateFpsDisplay(timestamp)
	{
		const timeElapsed = timestamp - this.lastFpsDisplayTimestamp;

		if (!timeElapsed || !this.lastFpsDisplayTimestamp)
		{
			this.lastFpsDisplayTimestamp = timestamp;

			window.requestAnimationFrame(this.updateFpsDisplay.bind(this));

			return;
		}

		this.lastFpsDisplayTimestamp = timestamp;

		this.fpsTimestampHistory.push(timeElapsed);
		this.fpsTimestampHistory.shift();

		this.fpsDisplayCtx.clearRect(0, 0, 100, 100);

		for (let i = 0; i < 100; i++)
		{
			const height = this.fpsTimestampHistory[i];

			const rgb = hsvToRgb(Math.max(.3333 - (this.fpsTimestampHistory[i] - 6) / 50, 0), 1, 1);

			this.fpsDisplayCtx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

			this.fpsDisplayCtx.fillRect(i, 100 - height, 1, height);
		}

		this.fpsDisplayCtx.fillStyle = "rgb(127, 127, 127)";

		this.fpsDisplayCtx.fillRect(0, 100 - 6.944, 100, 2);
		this.fpsDisplayCtx.fillRect(0, 100 - 16.667, 100, 2);
		this.fpsDisplayCtx.fillRect(0, 100 - 33.333, 100, 2);

		window.requestAnimationFrame(this.updateFpsDisplay.bind(this));
	}



	hiddenCanvasContainer = null;

	createHiddenCanvas()
	{
		const hiddenCanvas = document.createElement("canvas");
		hiddenCanvas.classList.add("hidden-canvas");

		if (this.hiddenCanvasContainer === null)
		{
			this.hiddenCanvasContainer = document.createElement("div");
			this.hiddenCanvasContainer.style.display = "none";
			pageElement.appendChild(this.hiddenCanvasContainer);
		}

		this.hiddenCanvasContainer.appendChild(hiddenCanvas);

		return hiddenCanvas;
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



	changeAspectRatio(useZoomLevel = false, wilsons = [this.wilson])
	{
		wilsons.forEach(wilson =>
		{
			if (wilson.fullscreen.currentlyFullscreen)
			{
				this.aspectRatio = window.innerWidth / window.innerHeight;

				if (this.aspectRatio >= 1)
				{
					wilson.changeCanvasSize(
						this.resolution,
						Math.floor(this.resolution / this.aspectRatio)
					);

					if (useZoomLevel)
					{
						wilson.worldWidth = 3 * Math.pow(2, this.zoom.level) * this.aspectRatio;
						wilson.worldHeight = 3 * Math.pow(2, this.zoom.level);
					}
				}

				else
				{
					wilson.changeCanvasSize(
						Math.floor(this.resolution * this.aspectRatio),
						this.resolution
					);

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

		clamp()
		{
			this.parent.wilson.worldCenterX = Math.min(
				Math.max(
					this.parent.wilson.worldCenterX,
					this.minX + this.parent.wilson.worldWidth / 2
				),
				this.maxX - this.parent.wilson.worldWidth / 2
			);

			this.parent.wilson.worldCenterY = Math.min(
				Math.max(
					this.parent.wilson.worldCenterY,
					this.minY + this.parent.wilson.worldHeight / 2
				),
				this.maxY - this.parent.wilson.worldHeight / 2
			);
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

			if (this.parent.wilson.worldWidth > this.parent.pan.maxX - this.parent.pan.minX)
			{
				this.parent.wilson.worldWidth = this.parent.pan.maxX - this.parent.pan.minX;

				this.parent.wilson.worldHeight = this.parent.wilson.worldWidth / aspectRatio;

				this.level = Math.log2(
					Math.min(this.parent.wilson.worldWidth, this.parent.wilson.worldHeight) / 3
				);
			}

			if (this.parent.wilson.worldHeight > this.parent.pan.maxY - this.parent.pan.minY)
			{
				this.parent.wilson.worldHeight = this.parent.pan.maxY - this.parent.pan.minY;

				this.parent.wilson.worldWidth = this.parent.wilson.worldHeight * aspectRatio;

				this.level = Math.log2(
					Math.min(this.parent.wilson.worldWidth, this.parent.wilson.worldHeight) / 3
				);
			}

			this.level = Math.max(this.level, this.minLevel);

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
			this.fixedPointX = x;
			this.fixedPointY = y;

			if (Math.abs(scrollAmount / 100) < .3)
			{
				this.level += scrollAmount / 100;
				this.clamp();
			}

			else
			{
				this.velocity += Math.sign(scrollAmount) * .085;
			}

			this.zoomCanvas();
		},

		onDragCanvas(x, y, xDelta, yDelta)
		{
			this.parent.wilson.worldCenterX -= xDelta;
			this.parent.wilson.worldCenterY -= yDelta;

			this.nextVelocityX = -xDelta / this.parent.wilson.worldWidth;
			this.nextVelocityY = -yDelta / this.parent.wilson.worldHeight;
		},

		onPinchCanvas(x, y, touchDistanceDelta)
		{
			if (this.parent.wilson.worldWidth >= this.parent.wilson.worldHeight)
			{
				this.level -= touchDistanceDelta / this.parent.wilson.worldWidth
					* this.pinchMultiplier;

				this.clamp();

				this.nextVelocity = -touchDistanceDelta / this.parent.wilson.worldWidth
					* this.pinchMultiplier;
			}

			else
			{
				this.level -= touchDistanceDelta / this.parent.wilson.worldHeight
					* this.pinchMultiplier;

				this.clamp();

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

			this.clamp();
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
			}

			if (this.parent?.wilson?.draggables?.recalculateLocations)
			{
				this.parent.wilson.draggables.recalculateLocations();
			}
		}
	};



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
	static parseNaturalGLSL(GLSL)
	{
		let newGLSL = GLSL.replaceAll(/\s/g, ""); // Remove spaces

		while (newGLSL.match(/([^.0-9])([0-9]+)([^.0-9])/g))
		{
			newGLSL = newGLSL.replaceAll(/([^.0-9])([0-9]+)([^.0-9])/g, (match, $1, $2, $3) => `${$1}${$2}.0${$3}`); // Convert ints to floats
		}

		newGLSL = newGLSL.replaceAll(/([^0-9])(\.[0-9])/g, (match, $1, $2) => `${$1}0${$2}`) // Lead decimals with zeros
			.replaceAll(/([0-9]\.)([^0-9])/g, (match, $1, $2) => `${$1}0${$2}`) // End decimals with zeros
			.replaceAll(/([0-9)])([a-z(])/g, (match, $1, $2) => `${$1} * ${$2}`); // Juxtaposition to multiplication

		while (newGLSL.match(/([xyz])([xyz])/g))
		{
			newGLSL = newGLSL.replaceAll(/([xyz])([xyz])/g, (match, $1, $2) => `${$1} * ${$2}`); // Particular juxtaposition to multiplication
		}

		newGLSL = newGLSL.replaceAll(/([a-z0-9.]+)\^([a-z0-9.]+)/g, (match, $1, $2) => `pow(${$1}, ${$2})`); // Carats to power

		if (window.DEBUG)
		{
			console.log(newGLSL);
		}

		return newGLSL;
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
}



export class RaymarchApplet extends Applet
{
	movingForwardKeyboard = false;
	movingBackwardKeyboard = false;
	movingRightKeyboard = false;
	movingLeftKeyboard = false;

	movingForwardTouch = false;
	movingBackwardTouch = false;

	wasMovingTouch = false;

	movingSpeed = 0;

	nextMoveVelocity = [0, 0, 0];

	moveVelocity = [0, 0, 0];

	moveFriction = .95;
	moveVelocityStopThreshhold = .0005;



	distanceToScene = 1;

	lastTimestamp = -1;



	theta = 0;
	phi = 0;



	imageSize = 400;
	imageWidth = 400;
	imageHeight = 400;

	maxIterations = 16;

	maxMarches = 100;

	imagePlaneCenterPos = [];

	forwardVec = [];
	rightVec = [];
	upVec = [];

	cameraPos = [0, 0, 0];

	focalLength = 2;

	lightPos = [0, 0, 5];



	constructor(canvas)
	{
		super(canvas);

		const boundFunction = this.handleKeydownEvent.bind(this);
		addTemporaryListener({
			object: document.documentElement,
			event: "keydown",
			callback: boundFunction
		});

		const boundFunction2 = this.handleKeyupEvent.bind(this);
		addTemporaryListener({
			object: document.documentElement,
			event: "keyup",
			callback: boundFunction2
		});

		const refreshId = setInterval(() =>
		{
			if (this?.wilson?.draggables?.container)
			{
				const boundFunction3 = this.handleTouchstartEvent.bind(this);
				addTemporaryListener({
					object: this.wilson.draggables.container,
					event: "touchstart",
					callback: boundFunction3
				});

				const boundFunction4 = this.handleTouchendEvent.bind(this);
				addTemporaryListener({
					object: this.wilson.draggables.container,
					event: "touchend",
					callback: boundFunction4
				});

				clearInterval(refreshId);
			}
		}, 500);
	}



	calculateVectors()
	{
		// Here comes the serious math. Theta is the angle in the xy-plane and
		// phi the angle down from the z-axis. We can use them get a normalized forward vector:
		this.forwardVec = [
			Math.cos(this.theta) * Math.sin(this.phi),
			Math.sin(this.theta) * Math.sin(this.phi),
			Math.cos(this.phi)
		];

		// Now the right vector needs to be constrained to the xy-plane,
		// since otherwise the image will appear tilted. For a vector (a, b, c),
		// the orthogonal plane that passes through the origin is ax + by + cz = 0,
		// so we want ax + by = 0. One solution is (b, -a), and that's the one that
		// goes to the "right" of the forward vector (when looking down).
		this.rightVec = RaymarchApplet.normalize([this.forwardVec[1], -this.forwardVec[0], 0]);

		// Finally, the upward vector is the cross product of the previous two.
		this.upVec = RaymarchApplet.crossProduct(this.rightVec, this.forwardVec);

		

		this.distanceToScene = this.distanceEstimator(
			this.cameraPos[0],
			this.cameraPos[1],
			this.cameraPos[2]
		);



		this.focalLength = this.distanceToScene / 2;

		// The factor we divide by here sets the fov.
		this.rightVec[0] *= this.focalLength / 2;
		this.rightVec[1] *= this.focalLength / 2;

		this.upVec[0] *= this.focalLength / 2;
		this.upVec[1] *= this.focalLength / 2;
		this.upVec[2] *= this.focalLength / 2;

		

		this.imagePlaneCenterPos = [
			this.cameraPos[0] + this.focalLength * this.forwardVec[0],
			this.cameraPos[1] + this.focalLength * this.forwardVec[1],
			this.cameraPos[2] + this.focalLength * this.forwardVec[2]
		];

		

		this.wilson.gl.uniform3fv(this.wilson.uniforms["cameraPos"], this.cameraPos);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms["imagePlaneCenterPos"],
			this.imagePlaneCenterPos
		);

		this.wilson.gl.uniform3fv(this.wilson.uniforms["forwardVec"], this.forwardVec);
		this.wilson.gl.uniform3fv(this.wilson.uniforms["rightVec"], this.rightVec);
		this.wilson.gl.uniform3fv(this.wilson.uniforms["upVec"], this.upVec);

		this.wilson.gl.uniform1f(this.wilson.uniforms["focalLength"], this.focalLength);
	}



	handleKeydownEvent(e)
	{
		if (
			document.activeElement.tagName === "INPUT"
			|| !(e.key === "w" || e.key === "s" || e.key === "d" || e.key === "a")
		) {
			return;
		}



		this.nextMoveVelocity = [0, 0, 0];
		this.moveVelocity = [0, 0, 0];



		if (e.key === "w")
		{
			this.movingForwardKeyboard = true;
		}

		else if (e.key === "s")
		{
			this.movingBackwardKeyboard = true;
		}

		if (e.key === "d")
		{
			this.movingRightKeyboard = true;
		}

		else if (e.key === "a")
		{
			this.movingLeftKeyboard = true;
		}
	}



	handleKeyupEvent(e)
	{
		if (
			document.activeElement.tagName === "INPUT"
			|| !(e.key === "w" || e.key === "s" || e.key === "d" || e.key === "a")
		) {
			return;
		}



		if (this.moveVelocity[0] === 0 && this.moveVelocity[1] === 0 && this.moveVelocity[2] === 0)
		{
			this.moveVelocity[0] = this.nextMoveVelocity[0];
			this.moveVelocity[1] = this.nextMoveVelocity[1];
			this.moveVelocity[2] = this.nextMoveVelocity[2];

			this.nextMoveVelocity[0] = 0;
			this.nextMoveVelocity[1] = 0;
			this.nextMoveVelocity[2] = 0;
		}



		// W
		if (e.key === "w")
		{
			this.movingForwardKeyboard = false;
		}

		// S
		else if (e.key === "s")
		{
			this.movingBackwardKeyboard = false;
		}

		// D
		if (e.key === "d")
		{
			this.movingRightKeyboard = false;
		}

		// A
		else if (e.key === "a")
		{
			this.movingLeftKeyboard = false;
		}
	}



	handleTouchstartEvent(e)
	{
		if (e.touches.length === 2)
		{
			this.movingForwardTouch = true;
			this.movingBackwardTouch = false;
		}

		else if (e.touches.length === 3)
		{
			this.movingBackwardTouch = true;
			this.movingForwardTouch = false;
		}
	}

	handleTouchendEvent(e)
	{
		if (e.touches.length === 2)
		{
			this.movingForwardTouch = true;
			this.movingBackwardTouch = false;
		}

		else if (e.touches.length === 3)
		{
			this.movingBackwardTouch = true;
			this.movingForwardTouch = false;
		}
	}



	updateCameraParameters()
	{
		this.movingSpeed = Math.min(Math.max(.000001, this.distanceToScene / 20), .02);

		const oldCameraPos = [...this.cameraPos];



		if (this.movingForwardKeyboard || this.movingForwardTouch)
		{
			this.cameraPos[0] += this.movingSpeed * this.forwardVec[0];
			this.cameraPos[1] += this.movingSpeed * this.forwardVec[1];
			this.cameraPos[2] += this.movingSpeed * this.forwardVec[2];
		}

		else if (this.movingBackwardKeyboard || this.movingBackwardTouch)
		{
			this.cameraPos[0] -= this.movingSpeed * this.forwardVec[0];
			this.cameraPos[1] -= this.movingSpeed * this.forwardVec[1];
			this.cameraPos[2] -= this.movingSpeed * this.forwardVec[2];
		}



		if (this.movingRightKeyboard)
		{
			this.cameraPos[0] += this.movingSpeed * this.rightVec[0] / this.focalLength * .7;
			this.cameraPos[1] += this.movingSpeed * this.rightVec[1] / this.focalLength * .7;
			this.cameraPos[2] += this.movingSpeed * this.rightVec[2] / this.focalLength * .7;
		}

		else if (this.movingLeftKeyboard)
		{
			this.cameraPos[0] -= this.movingSpeed * this.rightVec[0] / this.focalLength * .7;
			this.cameraPos[1] -= this.movingSpeed * this.rightVec[1] / this.focalLength * .7;
			this.cameraPos[2] -= this.movingSpeed * this.rightVec[2] / this.focalLength * .7;
		}



		if (
			(
				this.movingForwardKeyboard
				|| this.movingForwardTouch
				|| this.movingBackwardKeyboard
				|| this.movingBackwardTouch
			) && (
				this.movingRightKeyboard
				|| this.movingLeftKeyboard
			)
		) {
			this.cameraPos[0] = oldCameraPos[0]
				+ (this.cameraPos[0] - oldCameraPos[0]) * .7071;
			this.cameraPos[1] = oldCameraPos[1]
				+ (this.cameraPos[1] - oldCameraPos[1]) * .7071;
			this.cameraPos[2] = oldCameraPos[2]
				+ (this.cameraPos[2] - oldCameraPos[2]) * .7071;
		}



		this.nextMoveVelocity[0] = (this.cameraPos[0] - oldCameraPos[0]) * .8;
		this.nextMoveVelocity[1] = (this.cameraPos[1] - oldCameraPos[1]) * .8;
		this.nextMoveVelocity[2] = (this.cameraPos[2] - oldCameraPos[2]) * .8;



		this.calculateVectors();
	}



	moveUpdate(timeElapsed)
	{
		if (
			this.moveVelocity[0] !== 0
			|| this.moveVelocity[1] !== 0
			|| this.moveVelocity[2] !== 0
		) {
			this.cameraPos[0] += this.moveVelocity[0] * timeElapsed / 6.944;
			this.cameraPos[1] += this.moveVelocity[1] * timeElapsed / 6.944;
			this.cameraPos[2] += this.moveVelocity[2] * timeElapsed / 6.944;

			this.moveVelocity[0] *= this.moveFriction ** (timeElapsed / 6.944);
			this.moveVelocity[1] *= this.moveFriction ** (timeElapsed / 6.944);
			this.moveVelocity[2] *= this.moveFriction ** (timeElapsed / 6.944);

			if (
				this.moveVelocity[0] ** 2
				+ this.moveVelocity[1] ** 2
				+ this.moveVelocity[2] ** 2 <
					(this.moveVelocityStopThreshhold * this.movingSpeed) ** 2
			) {
				this.moveVelocity[0] = 0;
				this.moveVelocity[1] = 0;
				this.moveVelocity[2] = 0;
			}
		}
	}



	static magnitude(vec)
	{
		return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
	}



	static addVectors(vec1, vec2)
	{
		return [vec1[0] + vec2[0], vec1[1] + vec2[1], vec1[2] + vec2[2]];
	}

	static scaleVector(c, vec)
	{
		return [c * vec[0], c * vec[1], c * vec[2]];
	}



	static dotProduct(vec1, vec2)
	{
		return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2];
	}

	static dotProduct4(vec1, vec2)
	{
		return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2] + vec1[3] * vec2[3];
	}



	static crossProduct(vec1, vec2)
	{
		return [
			vec1[1] * vec2[2] - vec1[2] * vec2[1],
			vec1[2] * vec2[0] - vec1[0] * vec2[2],
			vec1[0] * vec2[1] - vec1[1] * vec2[0]
		];
	}



	static matMul(mat1, mat2)
	{
		return [
			[
				mat1[0][0] * mat2[0][0] + mat1[0][1] * mat2[1][0] + mat1[0][2] * mat2[2][0],
				mat1[0][0] * mat2[0][1] + mat1[0][1] * mat2[1][1] + mat1[0][2] * mat2[2][1],
				mat1[0][0] * mat2[0][2] + mat1[0][1] * mat2[1][2] + mat1[0][2] * mat2[2][2]
			],

			[
				mat1[1][0] * mat2[0][0] + mat1[1][1] * mat2[1][0] + mat1[1][2] * mat2[2][0],
				mat1[1][0] * mat2[0][1] + mat1[1][1] * mat2[1][1] + mat1[1][2] * mat2[2][1],
				mat1[1][0] * mat2[0][2] + mat1[1][1] * mat2[1][2] + mat1[1][2] * mat2[2][2]
			],

			[
				mat1[2][0] * mat2[0][0] + mat1[2][1] * mat2[1][0] + mat1[2][2] * mat2[2][0],
				mat1[2][0] * mat2[0][1] + mat1[2][1] * mat2[1][1] + mat1[2][2] * mat2[2][1],
				mat1[2][0] * mat2[0][2] + mat1[2][1] * mat2[1][2] + mat1[2][2] * mat2[2][2]
			]
		];
	}



	static qmul(x1, y1, z1, w1, x2, y2, z2, w2)
	{
		return [
			x1 * x2 - y1 * y2 - z1 * z1 - w1 * w2,
			x1 * y2 + y1 * x2 + z1 * w2 - w1 * z2,
			x1 * z2 - y1 * w2 + z1 * x2 + w1 * y2,
			x1 * w2 + y1 * z2 - z1 * y2 + w1 * x2
		];
	}



	static normalize(vec)
	{
		const magnitude = RaymarchApplet.magnitude(vec);

		return [vec[0] / magnitude, vec[1] / magnitude, vec[2] / magnitude];
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