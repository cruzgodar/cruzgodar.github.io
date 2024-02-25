import { Applet } from "../../../scripts/applets/applet.js";
import { getGlslBundle, loadGlsl } from "../../../scripts/src/complexGlsl.js";
import anime from "/scripts/anime.js";
import { addTemporaryListener } from "/scripts/src/main.js";
import { Wilson } from "/scripts/wilson.js";

export class NewtonsMethodExtended extends Applet
{
	loadPromise = null;

	wilsonHidden = null;



	a = [1, 0];
	c = [0, 0];

	aspectRatio = 1;

	numIterations = 100;

	pastBrightnessScales = [];

	resolution = 500;
	resolutionHidden = 100;

	derivativePrecision = 6;

	lastTimestamp = -1;

	colors = null;



	constructor({ canvas })
	{
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

			canvasWidth: 500,
			canvasHeight: 500,

			worldWidth: 32,
			worldHeight: 32,
			worldCenterX: 0,
			worldCenterY: 0,



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

		const optionsHidden =
		{
			renderer: "gpu",

			shader: tempShader,

			canvasWidth: this.resolutionHidden,
			canvasHeight: this.resolutionHidden
		};



		this.wilson = new Wilson(canvas, options);

		this.wilson.render.initUniforms([
			"aspectRatio",
			"derivativePrecision",
			"worldCenterX",
			"worldCenterY",
			"worldSize",
			"colors",
			"a",
			"c",
			"brightnessScale"
		]);



		const hiddenCanvas = this.createHiddenCanvas();
		hiddenCanvas.classList.remove("hidden-canvas");
		hiddenCanvas.classList.add("output-canvas");
		this.wilsonHidden = new Wilson(hiddenCanvas, optionsHidden);

		this.wilsonHidden.render.initUniforms([
			"aspectRatio",
			"derivativePrecision",
			"worldCenterX",
			"worldCenterY",
			"worldSize",
			"colors",
			"a",
			"c",
			"brightnessScale"
		]);



		let element = this.wilson.draggables.add(1, 0);

		element.classList.add("a-marker");

		element = this.wilson.draggables.add(0, 0);

		element.classList.add("c-marker");



		const boundFunction = () => this.changeAspectRatio(true);
		addTemporaryListener({
			object: window,
			event: "resize",
			callback: boundFunction
		});



		this.loadPromise = loadGlsl();
	}



	run({ generatingCode })
	{
		const fragShaderSource = /* glsl */`
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform float worldCenterX;
			uniform float worldCenterY;
			uniform float worldSize;
			
			uniform float derivativePrecision;
			
			
			uniform vec3 colors[4];
			
			uniform vec2 a;
			uniform vec2 c;
			
			uniform float brightnessScale;
			
			const float threshhold = .01;
			
			
			
			${getGlslBundle(generatingCode)}
			
			
			
			//Returns f(z) for a polynomial f with given roots.
			vec2 f(vec2 z)
			{
				return ${generatingCode};
			}
			
			
			
			//Approximates f'(z) for a polynomial f with given roots.
			vec2 cderiv(vec2 z)
			{
				return derivativePrecision * (f(z + vec2(1.0 / (2.0*derivativePrecision), 0.0)) - f(z - vec2(1.0 / (2.0*derivativePrecision), 0.0)));
			}
			
			
			
			void main(void)
			{
				vec2 z;
				vec2 lastZ = vec2(0.0, 0.0);
				vec2 oldZ = vec2(0.0, 0.0);
				
				if (aspectRatio >= 1.0)
				{
					z = vec2(uv.x * aspectRatio * worldSize + worldCenterX, uv.y * worldSize + worldCenterY);
				}
				
				else
				{
					z = vec2(uv.x * worldSize + worldCenterX, uv.y / aspectRatio * worldSize + worldCenterY);
				}
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				
				
				
				for (int iteration = 0; iteration < 200; iteration++)
				{
					vec2 temp = cmul(cmul(f(z), cinv(cderiv(z))), a) + c;
					
					oldZ = lastZ;
					
					lastZ = z;
					
					z -= temp;
					
					
					
					//If we're slowing down, it's reasonably safe to assume that we're near a root.
					
					float d0 = length(lastZ - z);
					
					if (d0 < threshhold)
					{
						float d1 = length(oldZ - lastZ);
						
						float brightnessAdjust = (log(threshhold) - log(d0)) / (log(d1) - log(d0));
						
						float brightness = 1.0 - (float(iteration) - brightnessAdjust) / brightnessScale;
						
						//Round to a square grid so that basin colors are consistent.
						vec2 theoreticalRoot = floor(z / (threshhold / 3.0)) * threshhold / 3.0;
						
						float c0 = sin(theoreticalRoot.x * 7.239846) + cos(theoreticalRoot.x * 2.945387) + 2.0;
						
						float c1 = sin(theoreticalRoot.y * 5.918445) + cos(theoreticalRoot.y * .987235) + 2.0;
						
						float c2 = sin((theoreticalRoot.x + theoreticalRoot.y) * 1.023974) + cos((theoreticalRoot.x + theoreticalRoot.y) * 9.130874) + 2.0;
						
						float c3 = sin((theoreticalRoot.x - theoreticalRoot.y) * 3.258342) + cos((theoreticalRoot.x - theoreticalRoot.y) * 4.20957) + 2.0;
						
						//Pick an interpolated color between the 4 that we chose earlier.
						gl_FragColor = vec4((c0 * colors[0] + c1 * colors[1] + c2 * colors[2] + c3 * colors[3]) / (c0 + c1 + c2 + c3) * brightness, 1.0);
						
						return;
					}
				}
			}
		`;

		this.wilson.render.shaderPrograms = [];
		this.wilson.render.loadNewShader(fragShaderSource);
		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]);

		this.wilson.render.initUniforms([
			"aspectRatio",
			"derivativePrecision",
			"worldCenterX",
			"worldCenterY",
			"worldSize",
			"colors",
			"a",
			"c",
			"brightnessScale"
		]);

		this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatio"], 1);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["derivativePrecision"],
			this.derivativePrecision
		);

		this.wilsonHidden.render.shaderPrograms = [];
		this.wilsonHidden.render.loadNewShader(fragShaderSource);
		this.wilsonHidden.gl.useProgram(this.wilsonHidden.render.shaderPrograms[0]);

		this.wilsonHidden.render.initUniforms([
			"aspectRatio",
			"derivativePrecision",
			"worldCenterX",
			"worldCenterY",
			"worldSize",
			"colors",
			"a",
			"c",
			"brightnessScale"
		]);

		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["aspectRatio"], 1);

		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms["derivativePrecision"],
			this.derivativePrecision
		);

		this.wilson.worldCenterX = 0;
		this.wilson.worldCenterY = 0;
		this.wilson.worldWidth = 32;
		this.wilson.worldHeight = 32;

		this.zoom.init();



		this.pastBrightnessScales = [];



		this.a = [1, 0];
		this.c = [0, 0];



		this.colors = this.generateNewPalette();

		this.wilson.gl.uniform3fv(this.wilson.uniforms["colors"], this.colors);
		this.wilsonHidden.gl.uniform3fv(this.wilsonHidden.uniforms["colors"], this.colors);



		window.requestAnimationFrame(this.drawFrame.bind(this));
	}



	// Pick 4 colors, each with a bright, medium, and dim component.
	// Each of these colors will be interpolated between based on
	// the target x and y coordinates of the attractive root,
	// forming a quadrilateral in the color plane. Since these 4 corner points
	// are brightish but not overly so and decently saturated,
	// this process almost always produces a pleasing palette.
	generateNewPalette()
	{
		const newColors = new Array(12);

		let hue = 0;

		const restrictions = [];

		const restrictionWidth = .1;



		for (let i = 0; i < 4; i++)
		{
			hue = Math.random() * (1 - i * 2 * restrictionWidth);

			for (let j = 0; j < i; j++)
			{
				if (hue > restrictions[j])
				{
					hue += restrictionWidth * 2;
				}
			}

			restrictions[i] = hue - restrictionWidth;

			restrictions.sort();



			const rgb = this.wilson.utils.hsvToRgb(
				hue,
				Math.random() * .25 + .75,
				Math.random() * .25 + .75
			);

			newColors[3 * i] = rgb[0] / 255;
			newColors[3 * i + 1] = rgb[1] / 255;
			newColors[3 * i + 2] = rgb[2] / 255;
		}

		return newColors;
	}



	animatePaletteChange()
	{
		const dummy = { t: 0 };

		const oldColors = [...this.colors];
		const newColors = this.generateNewPalette();

		anime({
			targets: dummy,
			t: 1,
			duration: 1000,
			easing: "easeOutQuad",
			update: () =>
			{
				for (let i = 0; i < 12; i++)
				{
					this.colors[i] = (1 - dummy.t) * oldColors[i] + dummy.t * newColors[i];

					this.wilson.gl.uniform3fv(this.wilson.uniforms["colors"], this.colors);

					this.wilsonHidden.gl.uniform3fv(
						this.wilsonHidden.uniforms["colors"],
						this.colors
					);
				}
			}
		});
	}



	onDragDraggable(activeDraggable, x, y)
	{
		if (activeDraggable === 0)
		{
			this.a = [x, y];
		}

		else
		{
			this.c = [x, y];
		}
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



		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms["aspectRatio"],
			this.aspectRatio
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

		this.wilsonHidden.gl.uniform2fv(
			this.wilsonHidden.uniforms["a"],
			this.a
		);

		this.wilsonHidden.gl.uniform2f(
			this.wilsonHidden.uniforms["c"],
			this.c[0] / 10, this.c[1] / 10
		);
		
		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms["brightnessScale"],
			30
		);

		this.wilsonHidden.render.drawFrame();



		const pixelData = this.wilsonHidden.render.getPixelData();

		const brightnesses = new Array(this.resolutionHidden * this.resolutionHidden);

		for (let i = 0; i < this.resolutionHidden * this.resolutionHidden; i++)
		{
			brightnesses[i] = Math.max(
				Math.max(
					pixelData[4 * i],
					pixelData[4 * i + 1]
				),
				pixelData[4 * i + 2]
			);
		}

		brightnesses.sort((a, b) => a - b);

		let brightnessScale = Math.min(
			10000 / (
				brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .96)]
				+ brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .98)]
			),
			200
		);

		this.pastBrightnessScales.push(brightnessScale);

		const denom = this.pastBrightnessScales.length;

		if (denom > 10)
		{
			this.pastBrightnessScales.shift();
		}

		brightnessScale = Math.max(this.pastBrightnessScales.reduce((a, b) => a + b) / denom, .5);



		this.wilson.gl.uniform1f(
			this.wilson.uniforms["aspectRatio"],
			this.aspectRatio
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["worldCenterX"],
			this.wilson.worldCenterX
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["worldCenterY"],
			this.wilson.worldCenterY
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["worldSize"],
			Math.min(this.wilson.worldHeight, this.wilson.worldWidth) / 2
		);

		this.wilson.gl.uniform2fv(
			this.wilson.uniforms["a"],
			this.a
		);

		this.wilson.gl.uniform2f(
			this.wilson.uniforms["c"],
			this.c[0] / 10, this.c[1] / 10
		);
		
		this.wilson.gl.uniform1f(
			this.wilson.uniforms["brightnessScale"],
			brightnessScale
		);

		this.wilson.render.drawFrame();



		if (!this.animationPaused)
		{
			window.requestAnimationFrame(this.drawFrame.bind(this));
		}
	}
}