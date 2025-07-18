import { getFloatGlsl, hsvToRgb, rgbToHex } from "../../../scripts/applets/applet.js";
import anime from "/scripts/anime.js";
import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { changeOpacity } from "/scripts/src/animation.js";
import { animate, sleep } from "/scripts/src/utils.js";
import { WilsonGPU } from "/scripts/wilson.js";

export class NewtonsMethod extends AnimationFrameApplet
{
	wilsonHidden;

	rootSetterElement;
	rootAInput;
	rootBInput;
	colorSetterElement;

	colors = {
		root0: [216 / 255, 1 / 255, 42 / 255],
		root1: [255 / 255, 139 / 255,56 / 255],
		root2: [249 / 255, 239 / 255, 20 / 255],
		root3: [27 / 255, 181 / 255, 61 / 255],
		root4: [0 / 255, 86 / 255, 195 / 255],
		root5: [154 / 255, 82 / 255, 164 / 255],
		root6: [32 / 255, 32 / 255, 32 / 255],
		root7: [155 / 255, 92 / 255, 15 / 255],
	};

	lastActiveRoot = "root0";

	numRoots = 3;

	numIterations = 100;

	secantProportion = 0;

	pastBrightnessScales = [];

	resolution = 500;
	resolutionHidden = 50;

	constructor({
		canvas,
		rootSetterElement,
		rootAInput,
		rootBInput,
		colorSetterElement,
		derivativePrecision = 10
	}) {
		super(canvas);

		this.rootSetterElement = rootSetterElement;
		this.rootAInput = rootAInput;
		this.rootBInput = rootBInput;
		this.colorSetterElement = colorSetterElement;

		const hiddenCanvas = this.createHiddenCanvas();

		this.randomizeColors(false);



		const shader = /* glsl */`
			precision highp float;
			
			varying vec2 uv;
			
			uniform vec2 worldCenter;
			uniform vec2 worldSize;
			
			uniform int numRoots;
			
			uniform vec2 root0;
			uniform vec2 root1;
			uniform vec2 root2;
			uniform vec2 root3;
			uniform vec2 root4;
			uniform vec2 root5;
			uniform vec2 root6;
			uniform vec2 root7;
			
			uniform vec3 color0;
			uniform vec3 color1;
			uniform vec3 color2;
			uniform vec3 color3;
			uniform vec3 color4;
			uniform vec3 color5;
			uniform vec3 color6;
			uniform vec3 color7;
			
			uniform vec2 a;
			uniform vec2 c;
			
			uniform float brightnessScale;

			uniform float secantProportion;
			
			const float derivativePrecision = ${getFloatGlsl(derivativePrecision)};
			
			const float threshhold = .05;
			
			
			
			//Returns z1 * z2.
			vec2 cmul(vec2 z1, vec2 z2)
			{
				return vec2(z1.x * z2.x - z1.y * z2.y, z1.x * z2.y + z1.y * z2.x);
			}
			
			
			
			//Returns 1/z.
			vec2 cinv(vec2 z)
			{
				float magnitude = z.x*z.x + z.y*z.y;
				
				return vec2(z.x / magnitude, -z.y / magnitude);
			}
			
			
			
			//Returns f(z) for a polynomial f with given roots.
			vec2 cpoly(vec2 z)
			{
				vec2 result = vec2(1.0, 0.0);

				if (numRoots >= 1)
				{
					result = cmul(result, z - root0);
				}

				if (numRoots >= 2)
				{
					result = cmul(result, z - root1);
				}

				if (numRoots >= 3)
				{
					result = cmul(result, z - root2);
				}

				if (numRoots >= 4)
				{
					result = cmul(result, z - root3);
				}

				if (numRoots >= 5)
				{
					result = cmul(result, z - root4);
				}

				if (numRoots >= 6)
				{
					result = cmul(result, z - root5);
				}

				if (numRoots >= 7)
				{
					result = cmul(result, z - root6);
				}

				if (numRoots >= 8)
				{
					result = cmul(result, z - root7);
				}

				return result;
			}
			
			
			
			//Approximates f'(z) for a polynomial f with given roots.
			vec2 cderiv(vec2 z)
			{
				return 1.0 / 12.0 * derivativePrecision * (
					-cpoly(z + vec2(2.0 / derivativePrecision, 0.0))
					+ 8.0 * cpoly(z + vec2(1.0 / derivativePrecision, 0.0))
					- 8.0 * cpoly(z - vec2(1.0 / derivativePrecision, 0.0))
					+ cpoly(z - vec2(2.0 / derivativePrecision, 0.0))
				);
			}



			void computeColor(
				vec2 lastZ,
				vec2 root,
				vec3 color,
				float d0,
				int iteration
			) {
				float d1 = length(lastZ - root);
				
				float brightnessAdjust = (log(threshhold) - log(d0)) / (log(d1) - log(d0));
				
				float brightness = 1.0 - (float(iteration) - brightnessAdjust) / brightnessScale;
				
				gl_FragColor = vec4(color * brightness, 1.0);
			}
			
			
			
			void main(void)
			{
				vec2 z = uv * worldSize * 0.5 + worldCenter;
				vec2 lastZ = vec2(0.0, 0.0);
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				
				
				
				for (int iteration = 0; iteration < 100; iteration++)
				{
					vec2 temp = mix(
						cmul(cmul(cpoly(z), cinv(cderiv(z))), a) + c * 0.1,
						cmul(cmul(cpoly(z), cmul(z - lastZ, cinv(cpoly(z) - cpoly(lastZ)))), a) + c * 0.1,
						secantProportion
					);
					
					lastZ = z;
					
					z -= temp;

					if (numRoots >= 1)
					{
						float d0 = length(z - root0);

						if (d0 < threshhold)
						{
							computeColor(lastZ, root0, color0, d0, iteration);
							return;
						}
					}

					if (numRoots >= 2)
					{
						float d0 = length(z - root1);

						if (d0 < threshhold)
						{
							computeColor(lastZ, root1, color1, d0, iteration);
							return;
						}
					}

					if (numRoots >= 3)
					{
						float d0 = length(z - root2);

						if (d0 < threshhold)
						{
							computeColor(lastZ, root2, color2, d0, iteration);
							return;
						}
					}

					if (numRoots >= 4)
					{
						float d0 = length(z - root3);

						if (d0 < threshhold)
						{
							computeColor(lastZ, root3, color3, d0, iteration);
							return;
						}
					}

					if (numRoots >= 5)
					{
						float d0 = length(z - root4);

						if (d0 < threshhold)
						{
							computeColor(lastZ, root4, color4, d0, iteration);
							return;
						}
					}

					if (numRoots >= 6)
					{
						float d0 = length(z - root5);

						if (d0 < threshhold)
						{
							computeColor(lastZ, root5, color5, d0, iteration);
							return;
						}
					}

					if (numRoots >= 7)
					{
						float d0 = length(z - root6);

						if (d0 < threshhold)
						{
							computeColor(lastZ, root6, color6, d0, iteration);
							return;
						}
					}

					if (numRoots >= 8)
					{
						float d0 = length(z - root7);

						if (d0 < threshhold)
						{
							computeColor(lastZ, root7, color7, d0, iteration);
							return;
						}
					}
				}
			}
		`;



		const options = {
			shader,

			uniforms: {
				worldCenter: [0, 0],
				worldSize: [2, 2],
				
				numRoots: this.numRoots,
				
				root0: [0, 0],
				root1: [0, 0],
				root2: [0, 0],
				root3: [0, 0],
				root4: [0, 0],
				root5: [0, 0],
				root6: [0, 0],
				root7: [0, 0],
				
				color0: this.colors.root0,
				color1: this.colors.root1,
				color2: this.colors.root2,
				color3: this.colors.root3,
				color4: this.colors.root4,
				color5: this.colors.root5,
				color6: this.colors.root6,
				color7: this.colors.root7,
				
				a: [1, 0],
				c: [0, 0],
				
				brightnessScale: 12.75,

				secantProportion: this.secantProportion,
			},

			canvasWidth: this.resolution,

			worldWidth: 4,

			minWorldWidth: 0.00001,
			maxWorldWidth: 100,
			minWorldHeight: 0.00001,
			maxWorldHeight: 100,

			useResetButton: true,
			resetButtonIconPath: "/graphics/general-icons/reset.png",

			onResizeCanvas: () => this.needNewFrame = true,

			interactionOptions: {
				useForPanAndZoom: true,
				onPanAndZoom: () => this.needNewFrame = true,
			},

			draggableOptions: {
				draggables: {
					a: [1, 0],
					c: [0, 0],
					root0: [0, 0],
					root1: [0, 0],
					root2: [0, 0],
					root3: [0, 0],
					root4: [0, 0],
					root5: [0, 0],
					root6: [0, 0],
					root7: [0, 0],
				},
				callbacks: {
					drag: this.onDragDraggable.bind(this),
					release: this.onReleaseDraggable.bind(this),
				}
			},

			fullscreenOptions: {
				onSwitch: this.switchFullscreen.bind(this),
				beforeSwitch: this.beforeSwitchFullscreen.bind(this),
				fillScreen: true,
				useFullscreenButton: true,
				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			},
		};



		this.wilson = new WilsonGPU(canvas, options);

		this.wilsonHidden = new WilsonGPU(hiddenCanvas, {
			...options,
			canvasWidth: this.resolutionHidden,
		});

		for (let i = 3; i < 8; i++)
		{
			this.wilson.draggables[`root${i}`].element.style.display = "none";
		}

		this.spreadRoots({ doAnimation: false });

		if (this.colorSetterElement)
		{
			setTimeout(() =>
			{
				const color = this.colors.root0;

				this.colorSetterElement.firstElementChild.value = rgbToHex(
					color[0] * 255,
					color[1] * 255,
					color[2] * 255
				);
			}, 16);
		}

		this.wilson.setCurrentStateAsDefault();

		this.resume();
	}



	switchMethod(instant)
	{
		const oldSecantProportion = this.secantProportion;
		const newSecantProportion = this.secantProportion === 0 ? 1 : 0;

		animate((t) =>
		{
			this.secantProportion = t * newSecantProportion + (1 - t) * oldSecantProportion;

			this.wilson.setUniforms({
				secantProportion: this.secantProportion
			});

			this.wilsonHidden.setUniforms({
				secantProportion: this.secantProportion
			});

			this.needNewFrame = true;
		}, instant ? 0 : 1000, "easeInOutQuad");
	}



	async addRoot()
	{
		if (this.numRoots === 8)
		{
			return;
		}

		const x = Math.random() * 3 - 1.5;
		const y = Math.random() * 3 - 1.5;

		const magnitude = Math.sqrt(x * x + y * y);
		const farAway = [ x / magnitude * 150, y / magnitude * 150 ];

		this.wilson.setDraggables({ [`root${this.numRoots}`]: farAway });

		this.wilson.draggables[`root${this.numRoots}`].element.style.opacity = 0;
		this.wilson.draggables[`root${this.numRoots}`].element.style.display = "block";

		this.wilson.setUniforms({
			[`root${this.numRoots}`]: this.wilson.draggables[`root${this.numRoots}`].location
		});

		this.wilsonHidden.setUniforms({
			[`root${this.numRoots}`]: this.wilson.draggables[`root${this.numRoots}`].location
		});

		this.numRoots++;

		this.wilson.setUniforms({
			numRoots: this.numRoots
		});

		this.wilsonHidden.setUniforms({
			numRoots: this.numRoots
		});
		
		this.moveRoots({
			newRoots: {
				[`root${this.numRoots - 1}`]: [x, y]
			},
			easing: "cubicBezier(0, 1, 0.5, 1)",
			duration: 1000
		})
			.then(() =>
			{
				this.wilson.setCurrentStateAsDefault();
			});

		changeOpacity({
			element: this.wilson.draggables[`root${this.numRoots - 1}`].element,
			opacity: 1,
			duration: 1000
		});

		this.onReleaseDraggable({ id: `root${this.numRoots - 1}` });

		this.needNewFrame = true;
	}



	async removeRoot()
	{
		if (this.numRoots === 1)
		{
			return;
		}

		this.numRoots--;

		this.onReleaseDraggable({ id: `root${this.numRoots - 1}` });

		const [x, y] = this.wilson.draggables[`root${this.numRoots}`].location;

		const magnitude = Math.sqrt(x * x + y * y);
		const farAway = [ x / magnitude * 1000, y / magnitude * 1000 ];

		changeOpacity({
			element: this.wilson.draggables[`root${this.numRoots}`].element,
			opacity: 0,
			duration: 1000
		});

		await this.moveRoots({
			newRoots: {
				[`root${this.numRoots}`]: farAway
			},
			easing: "cubicBezier(1, 0, 1, 0.5)",
			duration: 1000
		});

		this.wilson.draggables[`root${this.numRoots}`].element.style.display = "none";

		this.wilson.setUniforms({
			numRoots: this.numRoots
		});

		this.wilsonHidden.setUniforms({
			numRoots: this.numRoots
		});

		this.needNewFrame = true;
	}



	spreadRoots({
		doAnimation = true,
		randomize = false
	}) {
		const newRoots = {};

		for (let i = 0; i < 8; i++)
		{
			const mag = 1 + randomize * .75 * Math.random();

			newRoots[`root${i}`] = [
				mag * Math.cos(2 * Math.PI * i / this.numRoots),
				mag * Math.sin(2 * Math.PI * i / this.numRoots)
			];
		}

		this.moveRoots({ newRoots, doAnimation });
	}

	async moveRoots({
		newRoots,
		doAnimation = true,
		easing = "easeInOutQuad",
		duration = 1000
	}) {
		const oldRoots = Object.fromEntries(
			Object.entries(this.wilson.draggables)
				.map(([id, draggable]) => [id, draggable.location])
		);

		await animate((t) =>
		{
			for (const id of Object.keys(newRoots))
			{
				const oldRoot = oldRoots[id];
				const newRoot = newRoots[id];

				const location = [
					(1 - t) * oldRoot[0]
						+ t * newRoot[0],
					(1 - t) * oldRoot[1]
						+ t * newRoot[1]
				];

				this.wilson.setDraggables({ [id]: location });

				this.wilson.setUniforms({ [id]: location });
				this.wilsonHidden.setUniforms({ [id]: location });
			}

			this.needNewFrame = true;
		}, doAnimation ? duration : 0, easing);
	}



	setRoot(x, y)
	{
		this.wilson.setDraggables({ [this.lastActiveRoot]: [x, y] });

		this.wilson.setUniforms({ [this.lastActiveRoot]: [x, y] });
		this.wilsonHidden.setUniforms({ [this.lastActiveRoot]: [x, y] });

		this.needNewFrame = true;
	}



	setColor({
		rgb,
		root = this.lastActiveRoot,
		animate = true
	}) {
		if (!(root in this.colors))
		{
			return;
		}

		const r = rgb[0] / 255;
		const g = rgb[1] / 255;
		const b = rgb[2] / 255;

		const result = {
			r: this.colors[root][0],
			g: this.colors[root][1],
			b: this.colors[root][2]
		};

		const index = root.slice(4);
		const uniformName = `color${index}`;

		anime({
			targets: result,
			r,
			g,
			b,
			easing: "easeInOutQuad",
			duration: animate ? 250 : 0,
			update: () =>
			{
				this.colors[root][0] = result.r;
				this.colors[root][1] = result.g;
				this.colors[root][2] = result.b;

				this.wilson.setUniforms({
					[uniformName]: this.colors[root]
				});

				this.wilsonHidden.setUniforms({
					[uniformName]: this.colors[root]
				});

				this.needNewFrame = true;
			},
			complete: () =>
			{
				this.colors[root][0] = r;
				this.colors[root][1] = g;
				this.colors[root][2] = b;

				this.wilson.setUniforms({
					[uniformName]: this.colors[root]
				});

				this.wilsonHidden.setUniforms({
					[uniformName]: this.colors[root]
				});

				this.needNewFrame = true;
			}
		});
	}

	randomizeColors(animate = true)
	{
		for (const root in this.colors)
		{
			const color = hsvToRgb(
				(Math.random() * 0.55 + 0.525) % 1,
				0.2 * Math.random() + 0.3,
				0.2 * Math.random() + 0.8,
			);

			this.setColor({
				rgb: color,
				root,
				animate
			});
		}
	}

	onDragDraggable({ id, x, y })
	{
		this.wilson.setUniforms({
			[id]: [x, y]
		});

		this.wilsonHidden.setUniforms({
			[id]: [x, y]
		});

		this.needNewFrame = true;
	}

	onReleaseDraggable({ id })
	{
		this.lastActiveRoot = id;

		if (this.rootSetterElement && this.colorSetterElement)
		{
			this.updateRootSetterValues();

			if (this.lastActiveRoot in this.colors)
			{
				const color = this.colors[this.lastActiveRoot];

				this.colorSetterElement.firstElementChild.value = rgbToHex(
					color[0] * 255,
					color[1] * 255,
					color[2] * 255
				);
			}
		}
	}

	updateRootSetterValues()
	{
		if (this.rootSetterElement && this.colorSetterElement)
		{
			this.rootAInput.setValue(
				Math.round(this.wilson.draggables[this.lastActiveRoot].location[0] * 1000) / 1000,
				false
			);
			
			this.rootBInput.setValue(
				Math.round(this.wilson.draggables[this.lastActiveRoot].location[1] * 1000) / 1000,
				false
			);
		}
	}

	

	drawFrame()
	{
		this.updateRootSetterValues();

		this.wilsonHidden.setUniforms({
			worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
			worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY]
		});

		this.wilsonHidden.drawFrame();



		const pixelData = this.wilsonHidden.readPixels();

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
			7000 / (
				brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .96)]
				+ brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .98)]
			),
			30
		);

		this.pastBrightnessScales.push(brightnessScale);

		const denom = this.pastBrightnessScales.length;

		if (denom > 10)
		{
			this.pastBrightnessScales.shift();
		}

		brightnessScale = 0;

		for (let i = 0; i < this.pastBrightnessScales.length; i++)
		{
			brightnessScale += this.pastBrightnessScales[i];
		}

		brightnessScale = Math.max(brightnessScale / denom, .5);

		this.wilson.setUniforms({
			worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
			worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
			brightnessScale
		});

		this.wilson.drawFrame();
	}

	switchFullscreen()
	{
		this.resume();
	}

	async beforeSwitchFullscreen()
	{
		this.animationPaused = true;

		await sleep(33);
	}
}