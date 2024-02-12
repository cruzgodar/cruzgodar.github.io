import { getGlslBundle, loadGlsl } from "../../../scripts/src/complexGlsl.js";
import { Applet } from "/scripts/src/applets.js";
import { addTemporaryListener } from "/scripts/src/main.js";
import { Wilson } from "/scripts/wilson.js";

export class GeneralizedJuliaSet extends Applet
{
	loadPromise = null;

	generatingCode = "cadd(cpow(z, 2.0), c)";

	wilsonHidden = null;

	switchJuliaModeButton;

	juliaMode = 0;

	aspectRatio = 1;

	numIterations = 200;

	exposure = 1;

	pastBrightnessScales = [];

	a = 0;
	b = 0;

	resolution = 500;
	resolutionHidden = 50;

	lastTimestamp = -1;



	constructor({
		canvas,
		switchJuliaModeButton
	}) {
		super(canvas);

		this.switchJuliaModeButton = switchJuliaModeButton;

		const hiddenCanvas = this.createHiddenCanvas();



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

			mousemoveCallback: this.onHoverCanvas.bind(this),
			mousedragCallback: this.onDragCanvas.bind(this),
			touchmoveCallback: this.onDragCanvas.bind(this),

			mouseupCallback: this.onReleaseCanvas.bind(this),
			touchendCallback: this.onReleaseCanvas.bind(this),

			wheelCallback: this.onWheelCanvas.bind(this),
			pinchCallback: this.onPinchCanvas.bind(this)
		};

		this.wilson = new Wilson(canvas, options);

		const optionsHidden =
		{
			renderer: "gpu",

			shader: tempShader,

			canvasWidth: this.resolutionHidden,
			canvasHeight: this.resolutionHidden
		};

		this.wilsonHidden = new Wilson(hiddenCanvas, optionsHidden);



		const boundFunction = () => this.changeAspectRatio(true);
		addTemporaryListener({
			object: window,
			event: "resize",
			callback: boundFunction
		});

		this.loadPromise = loadGlsl();
	}


	run({
		generatingCode = "cpow(z, 2.0) + c",
		resolution = 500,
		exposure = 1,
		numIterations = 200
	}) {
		this.generatingCode = generatingCode;

		this.resolution = resolution;
		this.exposure = exposure;
		this.numIterations = numIterations;



		const fragShaderSource = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform int juliaMode;
			
			uniform float aspectRatio;
			
			uniform float worldCenterX;
			uniform float worldCenterY;
			uniform float worldSize;
			
			uniform float a;
			uniform float b;
			uniform float exposure;
			uniform int numIterations;
			uniform float brightnessScale;
			
			uniform vec2 draggableArg;
			
			
			
			${getGlslBundle(generatingCode)}
			
			
			
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
				
				vec3 color = normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				float brightness = exp(-length(z));
				
				
				
				if (juliaMode == 0)
				{
					vec2 c = z;
					
					for (int iteration = 0; iteration < 3001; iteration++)
					{
						if (iteration == numIterations)
						{
							gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
							return;
						}
						
						if (length(z) >= 1000.0)
						{
							break;
						}
						
						z = ${generatingCode};
						
						brightness += exp(-length(z));
					}
					
					
					gl_FragColor = vec4(brightness / brightnessScale * exposure * color, 1.0);
				}
				
				
				
				else if (juliaMode == 1)
				{
					vec2 c = vec2(a, b);
					
					for (int iteration = 0; iteration < 3001; iteration++)
					{
						if (iteration == numIterations)
						{
							gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
							return;
						}
						
						if (length(z) >= 1000.0)
						{
							break;
						}
						
						z = ${generatingCode};
						
						brightness += exp(-length(z));
					}
					
					
					gl_FragColor = vec4(brightness / brightnessScale * exposure * color, 1.0);
				}
				
				
				
				else
				{
					vec2 c = z;
					
					bool broken = false;
					
					for (int iteration = 0; iteration < 3001; iteration++)
					{
						if (iteration == numIterations)
						{
							gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
							
							broken = true;
							
							break;
						}
						
						if (length(z) >= 1000.0)
						{
							break;
						}
						
						z = ${generatingCode};
						
						brightness += exp(-length(z));
					}
					
					
					
					if (!broken)
					{
						gl_FragColor = vec4(.5 * brightness / brightnessScale * exposure * color, 1.0);
					}
					
					
					
					z = vec2(uv.x * aspectRatio * 2.0, uv.y * 2.0);
					color = normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
					brightness = exp(-length(z));
					
					broken = false;
					
					c = vec2(a, b);
					
					for (int iteration = 0; iteration < 3001; iteration++)
					{
						if (iteration == numIterations)
						{
							gl_FragColor.xyz /= 4.0;
							
							broken = true;
							
							break;
						}
						
						if (length(z) >= 4.0)
						{
							break;
						}
						
						z = ${generatingCode};
						
						brightness += exp(-length(z));
					}
					
					if (!broken)
					{
						gl_FragColor += vec4(brightness / brightnessScale * exposure * color, 0.0);
					}
				}
			}
		`;



		this.wilson.render.shaderPrograms = [];
		this.wilson.render.loadNewShader(fragShaderSource);
		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]);
		this.wilson.render.initUniforms([
			"juliaMode",
			"aspectRatio",
			"worldCenterX",
			"worldCenterY",
			"worldSize",
			"a",
			"b",
			"exposure",
			"numIterations",
			"brightnessScale",
			"draggableArg"
		]);
		this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatio"], 1);

		this.wilsonHidden.render.shaderPrograms = [];
		this.wilsonHidden.render.loadNewShader(fragShaderSource);
		this.wilsonHidden.gl.useProgram(this.wilsonHidden.render.shaderPrograms[0]);
		this.wilsonHidden.render.initUniforms([
			"juliaMode",
			"aspectRatio",
			"worldCenterX",
			"worldCenterY",
			"worldSize",
			"a",
			"b",
			"exposure",
			"numIterations",
			"brightnessScale",
			"draggableArg"
		]);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["aspectRatio"], 1);

		this.wilson.worldWidth = 4;
		this.wilson.worldHeight = 4;
		this.wilson.worldCenterX = 0;
		this.wilson.worldCenterY = 0;

		this.juliaMode = 0;
		this.zoom.init();

		this.pastBrightnessScales = [];



		// Render the inital frame.
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["aspectRatio"], 1);



		const needDraggable = generatingCode.indexOf("draggableArg") !== -1;

		if (needDraggable && this.wilson.draggables.numDraggables === 0)
		{
			this.wilson.draggables.add(.5, .5);

			this.wilson.gl.uniform2f(this.wilson.uniforms["draggableArg"], .5, .5);
		}

		else if (!needDraggable && this.wilson.draggables.numDraggables !== 0)
		{
			this.wilson.draggables.numDraggables--;

			this.wilson.draggables.draggables[0].remove();

			this.wilson.draggables.draggables = [];
		}

		window.requestAnimationFrame(this.drawFrame.bind(this));
	}



	switchJuliaMode()
	{
		if (this.juliaMode === 0)
		{
			this.juliaMode = 2;

			this.a = 0;
			this.b = 0;

			this.pastBrightnessScales = [];

			if (this.switchJuliaModeButton)
			{
				this.switchJuliaModeButton.disabled = true;
			}
		}

		else if (this.juliaMode === 1)
		{
			this.juliaMode = 0;

			this.wilson.worldCenterX = 0;
			this.wilson.worldCenterY = 0;
			this.wilson.worldWidth = 4;
			this.wilson.worldHeight = 4;
			this.zoom.init();

			this.pastBrightnessScales = [];
		}
	}



	onGrabCanvas(x, y, event)
	{
		this.pan.onGrabCanvas();
		this.zoom.onGrabCanvas();



		if (this.juliaMode === 2 && event.type === "mousedown")
		{
			this.juliaMode = 1;

			this.wilson.worldCenterX = 0;
			this.wilson.worldCenterY = 0;
			this.wilson.worldWidth = 4;
			this.wilson.worldHeight = 4;
			this.zoom.init();

			this.pastBrightnessScales = [];

			if (this.switchJuliaModeButton)
			{
				this.switchJuliaModeButton.disabled = false;
			}
		}
	}



	onDragCanvas(x, y, xDelta, yDelta, event)
	{
		if (this.juliaMode === 2 && event.type === "touchmove")
		{
			this.a = x;
			this.b = y;
		}

		else
		{
			this.pan.onDragCanvas(x, y, xDelta, yDelta);
		}
	}



	onHoverCanvas(x, y, xDelta, yDelta, event)
	{
		if (this.juliaMode === 2 && event.type === "mousemove")
		{
			this.a = x;
			this.b = y;
		}
	}



	onReleaseCanvas(x, y, event)
	{
		if (this.juliaMode === 2 && event.type === "touchend")
		{
			this.juliaMode = 1;

			this.wilson.worldCenterX = 0;
			this.wilson.worldCenterY = 0;
			this.wilson.worldWidth = 4;
			this.wilson.worldHeight = 4;
			this.zoom.init();

			this.pastBrightnessScales = [];

			if (this.switchJuliaModeButton)
			{
				this.switchJuliaModeButton.disabled = false;
			}
		}

		else
		{
			this.pan.onReleaseCanvas();
			this.zoom.onReleaseCanvas();
		}
	}



	onWheelCanvas(x, y, scrollAmount)
	{
		if (this.juliaMode !== 2)
		{
			this.zoom.onWheelCanvas(x, y, scrollAmount);
		}
	}



	onPinchCanvas(x, y, touchDistanceDelta)
	{
		if (this.juliaMode !== 2)
		{
			this.zoom.onPinchCanvas(x, y, touchDistanceDelta);
		}
	}



	onDragDraggable(activeDraggable, x, y)
	{
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



		this.numIterations = (-this.zoom.level * 30) + 200;



		this.wilsonHidden.gl.uniform1i(
			this.wilsonHidden.uniforms["juliaMode"],
			this.juliaMode
		);

		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms["worldCenterX"],
			this.wilson.worldCenterX
		);

		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms["worldCenterY"],
			this.wilson.worldCenterY
		);

		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms["worldSize"],
			Math.min(this.wilson.worldHeight, this.wilson.worldWidth) / 2
		);

		this.wilsonHidden.gl.uniform1i(
			this.wilsonHidden.uniforms["numIterations"],
			this.numIterations
		);

		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms["exposure"],
			1
		);

		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms["a"],
			this.a
		);

		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms["b"],
			this.b
		);

		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms["brightnessScale"],
			20 * (Math.abs(this.zoom.level) + 1)
		);

		this.wilsonHidden.render.drawFrame();



		const pixelData = this.wilsonHidden.render.getPixelData();

		const brightnesses = new Array(this.resolutionHidden * this.resolutionHidden);

		for (let i = 0; i < this.resolutionHidden * this.resolutionHidden; i++)
		{
			brightnesses[i] = pixelData[4 * i] + pixelData[4 * i + 1] + pixelData[4 * i + 2];
		}

		brightnesses.sort((a, b) => a - b);

		let brightnessScale = (
			brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .96)]
			+ brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .98)]
		) / 255 * 15 * (Math.abs(this.zoom.level / 2) + 1);

		this.pastBrightnessScales.push(brightnessScale);

		const denom = this.pastBrightnessScales.length;

		if (denom > 10)
		{
			this.pastBrightnessScales.shift();
		}

		brightnessScale = Math.max(this.pastBrightnessScales.reduce((a, b) => a + b) / denom, .5);



		this.wilson.gl.uniform1i(this.wilson.uniforms["juliaMode"], this.juliaMode);

		this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatio"], this.aspectRatio);

		this.wilson.gl.uniform1f(this.wilson.uniforms["worldCenterX"], this.wilson.worldCenterX);
		this.wilson.gl.uniform1f(this.wilson.uniforms["worldCenterY"], this.wilson.worldCenterY);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["worldSize"],
			Math.min(this.wilson.worldHeight, this.wilson.worldWidth) / 2
		);

		this.wilson.gl.uniform1i(this.wilson.uniforms["numIterations"], this.numIterations);
		this.wilson.gl.uniform1f(this.wilson.uniforms["exposure"], this.exposure);
		this.wilson.gl.uniform1f(this.wilson.uniforms["a"], this.a);
		this.wilson.gl.uniform1f(this.wilson.uniforms["b"], this.b);
		this.wilson.gl.uniform1f(this.wilson.uniforms["brightnessScale"], brightnessScale);

		this.wilson.render.drawFrame();



		if (!this.animationPaused)
		{
			window.requestAnimationFrame(this.drawFrame.bind(this));
		}
	}
}