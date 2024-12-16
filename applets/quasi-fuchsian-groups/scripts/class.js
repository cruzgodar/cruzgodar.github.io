import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { aspectRatio } from "/scripts/src/layout.js";
import { addTemporaryWorker, loadScript } from "/scripts/src/main.js";
import { WilsonGPU } from "/scripts/wilson.js";

export class QuasiFuchsianGroups extends AnimationFrameApplet
{
	wilsonHidden;

	resolutionSmall = 400;
	resolutionLarge = 1200;

	boxSize = 4;

	webWorker;

	t = [[2, 0], [2, 0]];

	coefficients = [
		[[0, 0], [0, 0], [0, 0], [0, 0]],
		[[0, 0], [0, 0], [0, 0], [0, 0]],
		[],
		[]
	];

	drawAnotherFrame = false;
	needToRestart = true;

	maxDepth = 200;
	maxPixelBrightness = 50;

	x = 0;
	y = 0;

	brightness;
	image;

	Complex;



	constructor({ canvas })
	{
		super(canvas);



		const shaderTrim = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform vec2 stepSize;
			
			
			
			void main(void)
			{
				//remove isolated pixels.
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				
				float brightness =
					texture2D(uTexture, center + vec2(stepSize.x, 0.0)).z +
					texture2D(uTexture, center - vec2(stepSize.x, 0.0)).z +
					texture2D(uTexture, center + vec2(0.0, stepSize.y)).z +
					texture2D(uTexture, center - vec2(0.0, stepSize.y)).z +
					texture2D(uTexture, center + vec2(stepSize.x, stepSize.y)).z +
					texture2D(uTexture, center + vec2(stepSize.x, -stepSize.y)).z +
					texture2D(uTexture, center + vec2(-stepSize.x, stepSize.y)).z +
					texture2D(uTexture, center + vec2(-stepSize.x, -stepSize.y)).z;
				
				if (brightness < 0.1)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
					
					return;
				}
				
				
				gl_FragColor = vec4(0.0, 0.0, texture2D(uTexture, center).z, 1.0);
			}
		`;



		const shaderDilate = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform vec2 stepSize;
			
			
			
			void main(void)
			{
				//Dilate the pixels to make a thicker line.
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				
				float brightness =
					max(max(max(texture2D(uTexture, center + vec2(stepSize.x, 0.0)).z,
					texture2D(uTexture, center - vec2(stepSize.x, 0.0)).z),
					max(texture2D(uTexture, center + vec2(0.0, stepSize.y)).z,
					texture2D(uTexture, center - vec2(0.0, stepSize.y)).z)),
					
					max(max(texture2D(uTexture, center + vec2(stepSize.x, stepSize.y)).z,
					texture2D(uTexture, center + vec2(stepSize.x, -stepSize.y)).z),
					max(texture2D(uTexture, center + vec2(-stepSize.x, stepSize.y)).z,
					texture2D(uTexture, center + vec2(-stepSize.x, -stepSize.y)).z)));
					
				brightness = max(brightness, texture2D(uTexture, center).z);
				
				gl_FragColor = vec4(0.0, 0.0, brightness, 1.0);
			}
		`;



		const shaderColor = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;

			uniform vec2 aspectRatio;
			
			void main(void)
			{
				//Dilate the pixels to make a thicker line.
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				
				vec2 z = 3.0 * uv * aspectRatio;
				vec3 color = 1.5 * normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				
				gl_FragColor = vec4(color * texture2D(uTexture, center).z, 1.0);
			}
		`;



		const options =
		{
			shaders: {
				trim: shaderTrim,
				dilate: shaderDilate,
				color: shaderColor
			},

			uniforms: {
				trim: { stepSize: [1 / this.resolutionSmall, 1 / this.resolutionSmall] },
				dilate: { stepSize: [1 / this.resolutionSmall, 1 / this.resolutionSmall] },
				color: { aspectRatio: [1, 1] },
			},

			canvasWidth: this.resolutionSmall,

			worldWidth: 1,
			worldHeight: 4,
			worldCenterX: 2,
			worldCenterY: 0,

			onResizeCanvas: this.onResizeCanvas.bind(this),

			draggableOptions: {
				draggables: {
					ta: [2, 0],
					tb: [2, 0],
					tab: [2, -2]
				},
				callbacks: {
					grab: this.onGrabDraggable.bind(this),
					drag: this.onDragDraggable.bind(this),
					release: this.onReleaseDraggable.bind(this),
				}
			},

			fullscreenOptions: {
				fillScreen: true,
				useFullscreenButton: true,

				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			}
		};

		this.wilson = new WilsonGPU(canvas, options);



		loadScript("/scripts/complex.min.js")
			.then(() =>
			{
				// eslint-disable-next-line no-undef
				this.Complex = Complex;

				this.resume();

				this.onResizeCanvas();

				this.changeRecipe("grandma");

			});
	}



	grandmaCoefficients(
		p1 = this.wilson.draggables.ta.location,
		p2 = this.wilson.draggables.tb.location,
	) {
		// Use Grandma's recipe, canidate for the worst-named algorithm of the last two decades.
		const ta = new this.Complex(p1[0], p1[1]);
		const tb = new this.Complex(p2[0], p2[1]);

		const b = ta.mul(tb);

		const c = ta.mul(ta).add(tb.mul(tb));

		const discriminant = b.mul(b).sub(c.mul(4));

		const tab = discriminant.arg() > 0
			? b.sub(discriminant.sqrt()).div(2)
			: b.add(discriminant.sqrt()).div(2);

		const z0 = tab
			.sub(2)
			.mul(tb)
			.div(tb
				.mul(tab)
				.sub(ta.mul(2))
				.add(tab.mul(new this.Complex([0, 2])))
			);



		const c1 = ta.div(2);

		const c2 = ta
			.mul(tab)
			.sub(tb.mul(2))
			.add(new this.Complex([0, 4]))
			.div(tab.mul(2).add(4).mul(z0));

		const c3 = ta
			.mul(tab)
			.sub(tb.mul(2))
			.sub(new this.Complex([0, 4]))
			.mul(z0)
			.div(tab.mul(2).sub(4));

		const c4 = tb.sub(new this.Complex([0, 2])).div(2);
		const c5 = tb.div(2);
		const c6 = tb.add(new this.Complex([0, 2])).div(2);

		this.coefficients[0][0][0] = c1.re;
		this.coefficients[0][0][1] = c1.im;

		this.coefficients[0][1][0] = c2.re;
		this.coefficients[0][1][1] = c2.im;

		this.coefficients[0][2][0] = c3.re;
		this.coefficients[0][2][1] = c3.im;

		this.coefficients[0][3][0] = c1.re;
		this.coefficients[0][3][1] = c1.im;

		this.coefficients[1][0][0] = c4.re;
		this.coefficients[1][0][1] = c4.im;

		this.coefficients[1][1][0] = c5.re;
		this.coefficients[1][1][1] = c5.im;

		this.coefficients[1][2][0] = c5.re;
		this.coefficients[1][2][1] = c5.im;

		this.coefficients[1][3][0] = c6.re;
		this.coefficients[1][3][1] = c6.im;



		// This weirdness lets us do 3 - index to reference an inverse.
		for (let i = 0; i < 2; i++)
		{
			const ax = this.coefficients[i][0][0];
			const ay = this.coefficients[i][0][1];
			const bx = this.coefficients[i][1][0];
			const by = this.coefficients[i][1][1];
			const cx = this.coefficients[i][2][0];
			const cy = this.coefficients[i][2][1];
			const dx = this.coefficients[i][3][0];
			const dy = this.coefficients[i][3][1];

			this.coefficients[i + 2] = [[dx, dy], [-bx, -by], [-cx, -cy], [ax, ay]];
		}
	}



	rileyCoefficients(
		p = this.wilson.draggables.ta.location
	) {
		this.coefficients[0][0][0] = 1;
		this.coefficients[0][0][1] = 0;

		this.coefficients[0][1][0] = 0;
		this.coefficients[0][1][1] = 0;

		this.coefficients[0][2][0] = p[0];
		this.coefficients[0][2][1] = p[1];

		this.coefficients[0][3][0] = 1;
		this.coefficients[0][3][1] = 0;

		this.coefficients[1][0][0] = 1;
		this.coefficients[1][0][1] = 0;

		this.coefficients[1][1][0] = 2;
		this.coefficients[1][1][1] = 0;

		this.coefficients[1][2][0] = 0;
		this.coefficients[1][2][1] = 0;

		this.coefficients[1][3][0] = 1;
		this.coefficients[1][3][1] = 0;

		// This weirdness lets us do 3 - index to reference an inverse.
		for (let i = 0; i < 2; i++)
		{
			const ax = this.coefficients[i][0][0];
			const ay = this.coefficients[i][0][1];
			const bx = this.coefficients[i][1][0];
			const by = this.coefficients[i][1][1];
			const cx = this.coefficients[i][2][0];
			const cy = this.coefficients[i][2][1];
			const dx = this.coefficients[i][3][0];
			const dy = this.coefficients[i][3][1];

			this.coefficients[i + 2] = [[dx, dy], [-bx, -by], [-cx, -cy], [ax, ay]];
		}
	}



	grandmaSpecialCoefficients(
		p1 = this.wilson.draggables.ta.location,
		p2 = this.wilson.draggables.tb.location,
		p3 = this.wilson.draggables.tc.location
	) {
		const ta = new this.Complex(p1[0], p1[1]);
		const tb = new this.Complex(p2[0], p2[1]);
		const tab = new this.Complex(p3[0], p3[1]);
		const I = new this.Complex(0, 1);
		const TWO = new this.Complex(2, 0);

		const tc = ta.mul(ta).add(tb.mul(tb)).add(tab.mul(tab)).sub(ta.mul(tb).mul(tab)).sub(2);

		const Q = TWO.sub(tc).sqrt();

		const mag = tc.add(I.mul(Q).mul(tc.add(2).sqrt())).abs();

		const R = tc.add(2).sqrt().mul(mag >= 2 ? 1 : -1);

		const z0 = tab.sub(2).mul(tb.add(R)).div(tb.mul(tab).sub(ta.mul(2)).add(I.mul(Q).mul(tab)));



		const c1 = ta.div(2);
		const c2 = ta.mul(tab).sub(tb.mul(2)).add(I.mul(Q).mul(2)).div(z0.mul(tab.mul(2).add(4)));
		const c3 = z0.mul(ta.mul(tab).sub(tb.mul(2)).sub(I.mul(2).mul(Q))).div(tab.mul(2).sub(4));

		const c4 = tb.sub(I.mul(Q)).div(2);
		const c5 = tb.mul(tab).sub(ta.mul(2)).add(I.mul(Q).mul(tab)).div(z0.mul(tab.mul(2).add(4)));
		const c6 = tb.mul(tab).sub(ta.mul(2)).sub(I.mul(Q).mul(tab)).mul(z0).div(tab.mul(2).sub(4));
		const c7 = tb.add(I.mul(Q)).div(2);



		this.coefficients[0][0][0] = c1.re;
		this.coefficients[0][0][1] = c1.im;

		this.coefficients[0][1][0] = c2.re;
		this.coefficients[0][1][1] = c2.im;

		this.coefficients[0][2][0] = c3.re;
		this.coefficients[0][2][1] = c3.im;

		this.coefficients[0][3][0] = c1.re;
		this.coefficients[0][3][1] = c1.im;

		this.coefficients[1][0][0] = c4.re;
		this.coefficients[1][0][1] = c4.im;

		this.coefficients[1][1][0] = c5.re;
		this.coefficients[1][1][1] = c5.im;

		this.coefficients[1][2][0] = c6.re;
		this.coefficients[1][2][1] = c6.im;

		this.coefficients[1][3][0] = c7.re;
		this.coefficients[1][3][1] = c7.im;



		// This weirdness lets us do 3 - index to reference an inverse.
		for (let i = 0; i < 2; i++)
		{
			const ax = this.coefficients[i][0][0];
			const ay = this.coefficients[i][0][1];
			const bx = this.coefficients[i][1][0];
			const by = this.coefficients[i][1][1];
			const cx = this.coefficients[i][2][0];
			const cy = this.coefficients[i][2][1];
			const dx = this.coefficients[i][3][0];
			const dy = this.coefficients[i][3][1];

			this.coefficients[i + 2] = [[dx, dy], [-bx, -by], [-cx, -cy], [ax, ay]];
		}
	}



	bakeCoefficients = this.grandmaCoefficients;



	// recipe is "grandma", "riley", or "grandmaSpecial"
	changeRecipe(recipe)
	{
		if (recipe === "grandma")
		{
			this.bakeCoefficients = this.grandmaCoefficients;

			this.wilson.draggables.tb.element.style.display = "block";
			this.wilson.draggables.tab.element.style.display = "none";
		}

		else if (recipe === "riley")
		{
			this.bakeCoefficients = this.rileyCoefficients;

			this.wilson.draggables.tb.element.style.display = "none";
			this.wilson.draggables.tab.element.style.display = "none";
		}

		else if (recipe === "grandmaSpecial")
		{
			this.bakeCoefficients = this.grandmaSpecialCoefficients;

			this.wilson.draggables.tb.element.style.display = "block";
			this.wilson.draggables.tab.element.style.display = "block";
		}
	}



	drawFrame()
	{
		this.bakeCoefficients();

		for (let i = 0; i < 4; i++)
		{
			this.searchStep(0, 0, i, 1);
		}



		let maxBrightness = 0;

		for (let i = 0; i < this.brightness.length; i++)
		{
			maxBrightness = Math.max(maxBrightness, this.brightness[i]);
		}



		for (let i = 0; i < this.wilson.canvasHeight * this.wilson.canvasWidth; i++)
		{
			this.image[4 * i] = 0;
			this.image[4 * i + 1] = 1;
			this.image[4 * i + 2] = Math.pow(this.brightness[i] / maxBrightness, .15);
			this.image[4 * i + 3] = 1;
		}



		this.renderShaderStack();
	}



	renderShaderStack()
	{
		this.wilson.useShader("trim");
		this.wilson.useFramebuffer(null);
		this.wilson.useTexture("image");
		this.wilson.setTexture({
			id: "image",
			data: this.image
		});
		this.wilson.drawFrame();

		this.wilson.useShader("dilate");
		this.wilson.useTexture("dilated");

		const numDilations = this.wilson.canvasWidth * this.wilson.canvasHeight >= 1000000 ? 1 : 0;

		for (let i = 0; i < numDilations; i++)
		{
			const pixelData = this.wilson.readPixels();
			this.wilson.setTexture({
				id: "dilated",
				data: pixelData
			});
			this.wilson.drawFrame();
		}

		this.wilson.useShader("color");
		const pixelData = this.wilson.readPixels();
		this.wilson.setTexture({
			id: "dilated",
			data: pixelData
		});
		this.wilson.drawFrame();
	}



	searchStep(startX, startY, lastTransformationIndex, depth)
	{
		if (depth === this.maxDepth)
		{
			return;
		}

		for (let i = 3; i < 6; i++)
		{
			this.x = startX;
			this.y = startY;

			const transformationIndex = (lastTransformationIndex + i) % 4;

			this.applyTransformation(transformationIndex);



			const row = this.wilson.canvasWidth >= this.wilson.canvasHeight
				? Math.floor((-this.y + this.boxSize / 2) / this.boxSize * this.wilson.canvasHeight)
				: Math.floor(
					(
						-this.y * (this.wilson.canvasWidth / this.wilson.canvasHeight)
						+ this.boxSize / 2
					) / this.boxSize * this.wilson.canvasHeight
				);

			const col = this.wilson.canvasWidth >= this.wilson.canvasHeight
				? Math.floor(
					(
						this.x / (this.wilson.canvasWidth / this.wilson.canvasHeight)
						+ this.boxSize / 2
					) / this.boxSize * this.wilson.canvasWidth)
				: Math.floor((this.x + this.boxSize / 2) / this.boxSize * this.wilson.canvasWidth);



			if (
				row >= 0
				&& row < this.wilson.canvasHeight
				&& col >= 0
				&& col < this.wilson.canvasWidth
			) {
				if (
					this.brightness[this.wilson.canvasWidth * row + col] === this.maxPixelBrightness
				) {
					continue;
				}

				if (depth > 10 || this.imageSize !== this.resolutionSmall)
				{
					this.brightness[this.wilson.canvasWidth * row + col]++;
				}
			}



			this.searchStep(this.x, this.y, transformationIndex, depth + 1);
		}
	}



	applyTransformation(index)
	{
		const ax = this.coefficients[index][0][0];
		const ay = this.coefficients[index][0][1];
		const bx = this.coefficients[index][1][0];
		const by = this.coefficients[index][1][1];
		const cx = this.coefficients[index][2][0];
		const cy = this.coefficients[index][2][1];
		const dx = this.coefficients[index][3][0];
		const dy = this.coefficients[index][3][1];



		const numX = ax * this.x - ay * this.y + bx;
		const numY = ax * this.y + ay * this.x + by;

		const denX = cx * this.x - cy * this.y + dx;
		const denY = cx * this.y + cy * this.x + dy;

		const newX = numX * denX + numY * denY;
		const newY = numY * denX - numX * denY;

		const magnitude = denX * denX + denY * denY;

		this.x = newX / magnitude;
		this.y = newY / magnitude;
	}



	onGrabDraggable()
	{
		this.wilson.resizeCanvas({
			width: this.resolutionSmall,
		});

		this.maxDepth = 200;
		this.maxPixelBrightness = 50;

		this.needNewFrame = true;
	}

	onReleaseDraggable()
	{
		this.wilson.resizeCanvas({
			width: this.resolutionLarge,
		});

		this.maxDepth = 100;
		this.maxPixelBrightness = 200;

		this.needNewFrame = true;
	}

	onDragDraggable()
	{
		for (let i = 0; i < this.wilson.canvasHeight * this.wilson.canvasWidth; i++)
		{
			this.brightness[i] = 0;
		}

		this.needNewFrame = true;
	}



	async requestHighResFrame(imageSize, maxDepth, maxPixelBrightness, boxSize = this.boxSize)
	{
		this.imageSize = imageSize;
		this.maxDepth = maxDepth;
		this.maxPixelBrightness = maxPixelBrightness;
		this.boxSize = boxSize;



		if (this.wilson.fullscreen.currentlyFullscreen)
		{
			if (aspectRatio >= 1)
			{
				this.imageWidth = Math.floor(this.imageSize * aspectRatio);
				this.imageHeight = this.imageSize;
			}

			else
			{
				this.imageWidth = this.imageSize;
				this.imageHeight = Math.floor(this.imageSize / aspectRatio);
			}
		}

		else
		{
			this.imageWidth = this.imageSize;
			this.imageHeight = this.imageSize;
		}



		this.regenerateHueAndBrightness();



		this.webWorker = addTemporaryWorker("/applets/quasi-fuchsian-groups/scripts/worker.js");



		const workerPromise = new Promise(resolve =>
		{
			this.webWorker.onmessage = e =>
			{
				this.brightness = e.data[0];

				this.wilson.changeCanvasSize(this.imageWidth, this.imageHeight);

				for (let i = 0; i < this.imageHeight; i++)
				{
					for (let j = 0; j < this.imageWidth; j++)
					{
						const index = i * this.imageWidth + j;

						this.image[4 * index] = 0;
						this.image[4 * index + 1] = 0;
						this.image[4 * index + 2] = this.brightness[index];
						this.image[4 * index + 3] = 0;
					}
				}

				this.renderShaderStack();

				resolve();
			};
		});

		this.webWorker.postMessage([
			this.imageWidth,
			this.imageHeight,
			this.maxDepth,
			this.maxPixelBrightness,
			this.boxSize,
			this.coefficients
		]);

		await workerPromise;
	}



	onResizeCanvas()
	{
		this.wilson.createFramebufferTexturePair({
			id: "image",
			textureType: "float"
		});

		this.wilson.createFramebufferTexturePair({
			id: "dilated",
			textureType: "unsignedByte"
		});

		this.image = new Float32Array(this.wilson.canvasWidth * this.wilson.canvasHeight * 4);
		this.brightness = new Float32Array(this.wilson.canvasWidth * this.wilson.canvasHeight);

		this.wilson.setUniforms({
			stepSize: [1 / this.wilson.canvasWidth, 1 / this.wilson.canvasHeight]
		}, "trim");
		
		this.wilson.setUniforms({
			stepSize: [1 / this.wilson.canvasWidth, 1 / this.wilson.canvasHeight]
		}, "dilate");

		this.wilson.setUniforms({
			aspectRatio: [
				Math.max(this.wilson.canvasWidth / this.wilson.canvasHeight, 1),
				Math.max(this.wilson.canvasHeight / this.wilson.canvasWidth, 1)
			]
		}, "color");

		for (let i = 0; i < this.wilson.canvasWidth * this.wilson.canvasHeight; i++)
		{
			this.brightness[i] = 0;
		}

		this.needNewFrame = true;
	}
}