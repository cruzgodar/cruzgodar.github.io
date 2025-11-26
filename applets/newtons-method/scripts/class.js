import { getFloatWgsl, hsvToRgb, rgbToHex } from "../../../scripts/applets/applet.js";
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

	roots = [
		[0, 0],
		[0, 0],
		[0, 0],
		[0, 0],
		[0, 0],
		[0, 0],
		[0, 0],
		[0, 0],
	];

	colors = [
		[216 / 255, 1 / 255, 42 / 255],
		[255 / 255, 139 / 255,56 / 255],
		[249 / 255, 239 / 255, 20 / 255],
		[27 / 255, 181 / 255, 61 / 255],
		[0 / 255, 86 / 255, 195 / 255],
		[154 / 255, 82 / 255, 164 / 255],
		[32 / 255, 32 / 255, 32 / 255],
		[155 / 255, 92 / 255, 15 / 255],
	];

	lastActiveRoot = "0";

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

		const hiddenCanvas = this.createHiddenCanvas(false);

		this.randomizeColors(false);

		const shader = /* wgsl */`
			struct Uniforms
			{
				worldCenter: vec2f,
				worldSize: vec2f,
				numRoots: u32,
				roots: array<vec3f, 8>, // Can't use vec2f in arrays
				colors: array<vec3f, 8>,
				a: vec2f,
				brightnessScale: f32,
				secantProportion: f32,
			}
			
			@group(0) @binding(0) var<uniform> uniforms: Uniforms;
			@group(0) @binding(1) var outputTex: texture_storage_2d<rgba16float, write>;

			const derivativePrecision = ${getFloatWgsl(derivativePrecision)};
			const threshold = 0.001;
			
			@compute @workgroup_size(8, 8)
			fn main(@builtin(global_invocation_id) globalId: vec3u)
			{
				let dimensions = textureDimensions(outputTex);
				let coords = vec2u(globalId.xy);
				
				if (coords.x >= dimensions.x || coords.y >= dimensions.y)
				{
					return;
				}
				
				// Convert pixel coordinates to complex plane [-2, 2]
				let uv = (vec2f(coords) + vec2f(0.5)) / vec2f(dimensions);
				var z = (uv - 0.5) * uniforms.worldSize + uniforms.worldCenter; // Map [0, 1] to [-2, 2]

				var lastZ = vec2f(0.0, 0.0);

				for (var i = 0u; i < 200u; i++)
				{
					let temp = cmul(
						mix(
							cmul(f(z), cinv(fPrime(z))),
							cmul(f(z), cmul(z - lastZ, cinv(f(z) - f(lastZ)))),
							uniforms.secantProportion
						),
						uniforms.a + vec2f(1.0, 0.0)
					);

					lastZ = z;
					z -= temp;

					for (var j = 0u; j < uniforms.numRoots; j++)
					{
						let d0 = length(z - uniforms.roots[j].xy);

						if (d0 < threshold)
						{
							let d1 = length(lastZ - uniforms.roots[j].xy);
			
							let brightnessAdjust = (log(threshold) - log(d0)) / (log(d1) - log(d0));
							
							let brightness = 1 - (f32(i) - brightnessAdjust) / uniforms.brightnessScale;

							textureStore(outputTex, coords, vec4f(uniforms.colors[j] * brightness, 1.0));

							return;
						}
					}
				}

				textureStore(outputTex, coords, vec4f(0.0, 0.0, 0.0, 1.0));
			}

			fn cmul(z1: vec2f, z2: vec2f) -> vec2f
			{
				return vec2f(z1.x * z2.x - z1.y * z2.y, z1.x * z2.y + z1.y * z2.x);
			}

			fn cinv(z: vec2f) -> vec2f
			{
				let magnitude = z.x * z.x + z.y * z.y;
				return vec2f(z.x / magnitude, -z.y / magnitude);
			}

			fn f(z: vec2f) -> vec2f
			{
				var result = vec2f(1.0, 0.0);

				for (var i = 0u; i < uniforms.numRoots; i++)
				{
					result = cmul(result, z - uniforms.roots[i].xy);
				}

				return result;
			}

			fn fPrime(z: vec2f) -> vec2f
			{
				return 1.0 / 12.0 * derivativePrecision * (
					-f(z + vec2f(2.0 / derivativePrecision, 0.0))
					+ 8.0 * f(z + vec2f(1.0 / derivativePrecision, 0.0))
					- 8.0 * f(z - vec2f(1.0 / derivativePrecision, 0.0))
					+ f(z - vec2f(2.0 / derivativePrecision, 0.0))
				);
			}
		`;

		

		const options = {
			shader,

			uniforms: {
				worldCenter: [0, 0],
				worldSize: [2, 2],
				
				numRoots: this.numRoots,
				
				roots: this.roots,
				colors: this.colors,
				
				a: [0, 0],
				
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
					a: [0, 0],
					0: [0, 0],
					1: [0, 0],
					2: [0, 0],
					3: [0, 0],
					4: [0, 0],
					5: [0, 0],
					6: [0, 0],
					7: [0, 0],
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
			this.wilson.draggables[i].element.style.display = "none";
		}

		this.spreadRoots({ doAnimation: false });

		if (this.colorSetterElement)
		{
			setTimeout(() =>
			{
				const color = this.colors[0];

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

		this.wilson.setDraggables({ [this.numRoots]: farAway });

		this.wilson.draggables[this.numRoots].element.style.opacity = 0;
		this.wilson.draggables[this.numRoots].element.style.display = "block";

		this.roots[this.numRoots] = [...this.wilson.draggables[this.numRoots].location];

		this.wilson.setUniforms({
			roots: this.roots
		});

		this.wilsonHidden.setUniforms({
			roots: this.roots
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
				[this.numRoots - 1]: [x, y]
			},
			easing: "cubicBezier(0, 1, 0.5, 1)",
			duration: 1000
		})
			.then(() =>
			{
				this.wilson.setCurrentStateAsDefault();
			});

		changeOpacity({
			element: this.wilson.draggables[this.numRoots - 1].element,
			opacity: 1,
			duration: 1000
		});

		this.onReleaseDraggable({ id: `${this.numRoots - 1}` });

		this.needNewFrame = true;
	}



	async removeRoot()
	{
		if (this.numRoots === 1)
		{
			return;
		}

		this.numRoots--;

		this.onReleaseDraggable({ id: `${this.numRoots}` });

		const [x, y] = this.wilson.draggables[this.numRoots].location;

		const magnitude = Math.sqrt(x * x + y * y);
		const farAway = [ x / magnitude * 1000, y / magnitude * 1000 ];

		changeOpacity({
			element: this.wilson.draggables[this.numRoots].element,
			opacity: 0,
			duration: 1000
		});

		await this.moveRoots({
			newRoots: {
				[this.numRoots]: farAway
			},
			easing: "cubicBezier(1, 0, 1, 0.5)",
			duration: 1000
		});

		this.wilson.draggables[this.numRoots].element.style.display = "none";

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

			newRoots[i] = [
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

				this.roots[id] = location;
			}

			this.wilson.setUniforms({ roots: this.roots });
			this.wilsonHidden.setUniforms({ roots: this.roots });

			this.needNewFrame = true;
		}, doAnimation ? duration : 0, easing);
	}



	setRoot(x, y)
	{
		this.wilson.setDraggables({ [this.lastActiveRoot]: [x, y] });

		if (this.lastActiveRoot === "a")
		{
			this.a = [x, y];

			this.wilson.setUniforms({ a: this.a });
			this.wilsonHidden.setUniforms({ a: this.a });
		}

		else
		{
			this.roots[this.lastActiveRoot] = [x, y];

			this.wilson.setUniforms({ roots: this.roots });
			this.wilsonHidden.setUniforms({ roots: this.roots });
		}

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
					colors: this.colors
				});

				this.wilsonHidden.setUniforms({
					colors: this.colors
				});

				this.needNewFrame = true;
			},
			complete: () =>
			{
				this.colors[root][0] = r;
				this.colors[root][1] = g;
				this.colors[root][2] = b;

				this.wilson.setUniforms({
					colors: this.colors
				});

				this.wilsonHidden.setUniforms({
					colors: this.colors
				});

				this.needNewFrame = true;
			}
		});
	}

	randomizeColors(animate = true)
	{
		for (let i = 0; i < this.numRoots; i++)
		{
			const color = hsvToRgb(
				(Math.random() * 0.55 + 0.525) % 1,
				0.2 * Math.random() + 0.3,
				0.2 * Math.random() + 0.8,
			);

			this.setColor({
				rgb: color,
				root: i,
				animate
			});
		}
	}

	onDragDraggable({ id, x, y })
	{
		if (id === "a")
		{
			this.a = [x, y];

			this.wilson.setUniforms({ a: this.a });
			this.wilsonHidden.setUniforms({ a: this.a });
		}

		else
		{
			this.roots[id] = [x, y];

			this.wilson.setUniforms({ roots: this.roots });
			this.wilsonHidden.setUniforms({ roots: this.roots });
		}

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

	

	async drawFrame()
	{
		this.updateRootSetterValues();

		this.wilsonHidden.setUniforms({
			worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
			worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY]
		});


		this.wilsonHidden.drawFrame();
		const pixelData = await this.wilsonHidden.readPixels();

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

		console.log(brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .96)]
				+ brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .98)]);

		let brightnessScale = Math.min(
			2 / (
				brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .96)]
				+ brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .98)]
			),
			35
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