import { Applet } from "/scripts/src/applets.mjs";
import { getGlslBundle, loadGlsl } from "/scripts/src/complex-glsl.mjs";
import { addTemporaryListener } from "/scripts/src/main.mjs";
import { Wilson } from "/scripts/wilson.mjs";

export class ComplexMap extends Applet
{
	loadPromise = null;

	generatingCode = "";
	uniformCode = "";

	aspectRatio = 1;

	pastBrightnessScales = [];

	resolution = 500;

	blackPoint = 1;
	whitePoint = 1;

	draggableCallback = null;

	lastTimestamp = -1;

	addIndicatorDraggable = false;
	useSelectorMode = false;

	totalBenchmarkTime = 0;
	benchmarksLeft = 0;
	benchmarkCycles = 10;
	benchmarkResolution = 4000;



	constructor({
		canvas,
		generatingCode,
		uniformCode = "",
		worldCenterX = 0,
		worldCenterY = 0,
		zoomLevel = -.585,
		addIndicatorDraggable = false,
		draggableCallback = null,
		selectorMode = false
	}) {
		super(canvas);

		const tempShader = `
			precision highp float;
			varying vec2 uv;
			
			void main(void)
			{
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			}
		`;

		const options =
		{
			renderer: "gpu",

			shader: tempShader,

			canvasWidth: this.resolution,
			canvasHeight: this.resolution,



			useDraggables: true,

			draggablesMousemoveCallback: this.onDragDraggable.bind(this),
			draggablesTouchmoveCallback: this.onDragDraggable.bind(this),



			useFullscreen: true,

			trueFullscreen: true,

			useFullscreenButton: true,

			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",

			switchFullscreenCallback: () => this.changeAspectRatio(true),



			mousedownCallback: this.onGrabCanvas.bind(this),
			touchstartCallback: this.onGrabCanvas.bind(this),

			mousedragCallback: this.onDragCanvas.bind(this),
			touchmoveCallback: this.onDragCanvas.bind(this),

			mouseupCallback: this.onReleaseCanvas.bind(this),
			touchendCallback: this.onReleaseCanvas.bind(this),

			wheelCallback: this.onWheelCanvas.bind(this),
			pinchCallback: this.onPinchCanvas.bind(this)
		};

		this.wilson = new Wilson(canvas, options);

		const boundFunction = () => this.changeAspectRatio(true);
		addTemporaryListener({
			object: window,
			event: "resize",
			callback: boundFunction
		});

		this.loadPromise = new Promise(resolve =>
		{
			loadGlsl()
				.then(() =>
				{
					this.run({
						generatingCode,
						uniformCode,
						worldCenterX,
						worldCenterY,
						zoomLevel,
						addIndicatorDraggable,
						draggableCallback,
						selectorMode
					});

					resolve();
				});
		});
	}



	run({
		generatingCode,
		uniformCode = "",
		worldCenterX = 0,
		worldCenterY = 0,
		zoomLevel = -.585,
		addIndicatorDraggable = false,
		draggableCallback = null,
		selectorMode = false
	})
	{
		this.generatingCode = generatingCode;
		this.uniformCode = uniformCode;

		this.zoom.level = zoomLevel;

		this.wilson.worldWidth = 3 * Math.pow(2, this.zoom.level);
		this.wilson.worldHeight = this.wilson.worldWidth;

		this.wilson.worldCenterX = worldCenterX;
		this.wilson.worldCenterY = worldCenterY;

		this.addIndicatorDraggable = addIndicatorDraggable;
		this.draggableCallback = draggableCallback;

		let selectorModeString = "";

		if (selectorMode)
		{
			selectorModeString = `
				imageZ.x += 127.0;
				imageZ.y += 127.0;
				
				float whole1 = floor(imageZ.x);
				float whole2 = floor(imageZ.y);
				
				float fract1 = (imageZ.x - whole1);
				float fract2 = (imageZ.y - whole2);
				
				gl_FragColor = vec4(whole1 / 256.0, fract1, whole2 / 256.0, fract2);
				
				return;
			`;
		}



		const fragShaderSource = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform float worldCenterX;
			uniform float worldCenterY;
			uniform float worldSize;
			
			uniform float blackPoint;
			uniform float whitePoint;
			
			uniform vec2 draggableArg;
			
			${uniformCode}
			
			
			
			${getGlslBundle(generatingCode)}
			
			
			
			vec3 hsv2rgb(vec3 c)
			{
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}
			
			
			
			//Returns f(z) for a polynomial f with given roots.
			vec2 f(vec2 z)
			{
				return ${generatingCode};
			}
			
			
			
			void main(void)
			{
				vec2 z;
				
				if (aspectRatio >= 1.0)
				{
					z = vec2(uv.x * aspectRatio * worldSize + worldCenterX, uv.y * worldSize + worldCenterY);
				}
				
				else
				{
					z = vec2(uv.x * worldSize + worldCenterX, uv.y / aspectRatio * worldSize + worldCenterY);
				}
				
				
				
				vec2 imageZ = f(z);
				
				
				
				${selectorModeString}
				
				
				
				float modulus = length(imageZ);
				
				float h = atan(imageZ.y, imageZ.x) / 6.283;
				float s = clamp(1.0 / (1.0 + .01 * (modulus / whitePoint / whitePoint)), 0.0, 1.0);
				float v = clamp(1.0 / (1.0 + .01 / (modulus * blackPoint * blackPoint)), 0.0, 1.0);
				
				gl_FragColor = vec4(hsv2rgb(vec3(h, s, v)), 1.0);
			}
		`;
		
		this.wilson.render.shaderPrograms = [];
		this.wilson.render.loadNewShader(fragShaderSource);
		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]);
		
		this.wilson.render.initUniforms([
			"aspectRatio",
			"worldCenterX",
			"worldCenterY",
			"worldSize",
			"blackPoint",
			"whitePoint",
			"draggableArg"
		]);

		this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatio"], 1);

		const needDraggable = addIndicatorDraggable
			|| generatingCode.indexOf("draggableArg") !== -1;

		if (needDraggable && this.wilson.draggables.numDraggables === 0)
		{
			this.wilson.draggables.add(.5, .5, !addIndicatorDraggable);

			this.wilson.gl.uniform2f(this.wilson.uniforms["draggableArg"], .5, .5);
		}

		else if (!needDraggable && this.wilson.draggables.numDraggables !== 0)
		{
			this.wilson.draggables.numDraggables--;

			this.wilson.draggables.draggables[0].remove();

			this.wilson.draggables.draggables = [];
		}

		if (!this.animationPaused)
		{
			window.requestAnimationFrame(this.drawFrame.bind(this));
		}
	}



	onGrabCanvas(x, y)
	{
		this.pan.onGrabCanvas();
		this.zoom.onGrabCanvas();

		if (this.useSelectorMode)
		{
			this.run({
				generatingCode: this.generatingCode,
				uniformCode: this.uniformCode,
				worldCenterX: this.wilson.worldCenterX,
				worldCenterY: this.wilson.worldCenterY,
				zoomLevel: this.zoom.level,
				addIndicatorDraggable: this.forceAddDraggable,
				selectorMode: true
			});

			const timeoutId = setTimeout(() =>
			{
				this.wilson.render.drawFrame();

				const coordinates = this.wilson.utils.interpolate.worldToCanvas(x, y);

				const pixel = new Uint8Array(4);

				this.wilson.gl.readPixels(
					coordinates[1],
					this.wilson.canvasHeight - coordinates[0],
					1,
					1,
					this.wilson.gl.RGBA,
					this.wilson.gl.UNSIGNEDBYTE,
					pixel
				);

				const zX = (pixel[0] - 127) + pixel[1] / 256;
				const zY = (pixel[2] - 127) + pixel[3] / 256;



				let plus1 = "+";

				if (y < 0)
				{
					plus1 = "-";
				}

				let plus2 = "+";

				if (zY < 0)
				{
					plus2 = "-";
				}

				console.log(`${x} ${plus1} ${Math.abs(y)}i |---> ${zX} ${plus2} ${Math.abs(zY)}i`);

				this.run({
					generatingCode: this.generatingCode,
					uniformCode: this.uniformCode,
					worldCenterX: this.wilson.worldCenterX,
					worldCenterY: this.wilson.worldCenterY,
					zoomLevel: this.zoom.level,
					addIndicatorDraggable: this.forceAddDraggable,
					selectorMode: false
				});

				this.useSelectorMode = false;
			}, 20);

			this.timeoutIds.push(timeoutId);
		}
	}



	onDragDraggable(activeDraggable, x, y, event)
	{
		if (this.draggableCallback)
		{
			this.draggableCallback(activeDraggable, x, y, event);
		}

		this.wilson.gl.uniform2f(this.wilson.uniforms["draggableArg"], x, y);
	}



	drawFrame(timestamp)
	{
		const timeElapsed = timestamp - this.lastTimestamp;

		this.lastTimestamp = timestamp;

		if (timeElapsed === 0)
		{
			return;
		}



		this.pan.update(timeElapsed);
		this.zoom.update(timeElapsed);



		this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatio"], this.aspectRatio);
		this.wilson.gl.uniform1f(this.wilson.uniforms["worldCenterX"], this.wilson.worldCenterX);
		this.wilson.gl.uniform1f(this.wilson.uniforms["worldCenterY"], this.wilson.worldCenterY);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["worldSize"],
			Math.min(this.wilson.worldHeight, this.wilson.worldWidth) / 2
		);

		this.wilson.gl.uniform1f(this.wilson.uniforms["blackPoint"], this.blackPoint);
		this.wilson.gl.uniform1f(this.wilson.uniforms["whitePoint"], this.whitePoint);

		this.wilson.render.drawFrame();



		if (!this.animationPaused)
		{
			window.requestAnimationFrame(this.drawFrame.bind(this));
		}
	}



	runBenchmark()
	{
		this.wilson.changeCanvasSize(this.benchmarkResolution, this.benchmarkResolution);

		const startTime = Date.now();

		const pixel = new Uint8Array(4);

		for (let i = 0; i < this.benchmarkCycles; i++)
		{
			this.wilson.render.drawFrame();

			this.wilson.gl.readPixels(
				0,
				0,
				1,
				1,
				this.wilson.gl.RGBA,
				this.wilson.gl.UNSIGNEDBYTE,
				pixel
			);
		}

		const averageTime = (Date.now() - startTime) / this.benchmarkCycles;

		console.log(`Finished benchmark --- average time to draw a ${this.benchmarkResolution}x${this.benchmarkResolution} frame is ${averageTime}ms`);

		this.wilson.changeCanvasSize(this.resolution, this.resolution);

		this.wilson.render.drawFrame();
	}
}