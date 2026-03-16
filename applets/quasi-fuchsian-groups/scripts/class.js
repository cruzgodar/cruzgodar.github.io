import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { addTemporaryWorker } from "/scripts/src/main.js";
import { WilsonGPU } from "/scripts/wilson.js";

const boxSize = 4;

export class QuasiFuchsianGroups extends AnimationFrameApplet
{
	resolutionSmall = 500;
	resolutionLarge = 1500;

	webWorker;

	coefficients = [
		[[0, 0], [0, 0], [0, 0], [0, 0]],
		[[0, 0], [0, 0], [0, 0], [0, 0]],
		[],
		[]
	];

	maxDepth = 500;
	maxPixelBrightness = 200;

	x = 0;
	y = 0;

	brightness;
	image;



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

			worldWidth: 0.5,
			worldHeight: 4,
			worldCenterX: 2,
			worldCenterY: 0,

			useResetButton: true,
			resetButtonIconPath: "/graphics/general-icons/reset.png",

			onResizeCanvas: this.onResizeCanvas.bind(this),

			draggableOptions: {
				draggables: {
					ta: [2, 0],
					tb: [2, 0],
					tc: [2, -2]
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
			},

			verbose: window.DEBUG,
		};

		this.wilson = new WilsonGPU(canvas, options);



		this.resume();

		this.onResizeCanvas();

		this.changeRecipe("grandma");
	}



	grandmaCoefficients(
		p1 = this.wilson.draggables.ta.location,
		p2 = this.wilson.draggables.tb.location,
	) {
		// Use Grandma's recipe, candidate for the worst-named algorithm of the last two decades.
		const taX = p1[0];
		const taY = p1[1];
		const tbX = p2[0];
		const tbY = p2[1];

		// b = ta * tb
		const bX = taX * tbX - taY * tbY;
		const bY = taX * tbY + taY * tbX;

		// c = ta^2 + tb^2
		const cX = taX * taX - taY * taY + tbX * tbX - tbY * tbY;
		const cY = 2 * taX * taY + 2 * tbX * tbY;

		// discriminant = b^2 - 4c
		const discX = bX * bX - bY * bY - 4 * cX;
		const discY = 2 * bX * bY - 4 * cY;

		// sqrt(discriminant)
		const discR = Math.sqrt(Math.sqrt(discX * discX + discY * discY));
		const discTheta = Math.atan2(discY, discX) / 2;
		const sqrtDiscX = discR * Math.cos(discTheta);
		const sqrtDiscY = discR * Math.sin(discTheta);

		// tab = disc.arg() > 0 ? (b - sqrt(disc)) / 2 : (b + sqrt(disc)) / 2
		let tabX, tabY;

		if (Math.atan2(discY, discX) > 0)
		{
			tabX = (bX - sqrtDiscX) / 2;
			tabY = (bY - sqrtDiscY) / 2;
		}
		else
		{
			tabX = (bX + sqrtDiscX) / 2;
			tabY = (bY + sqrtDiscY) / 2;
		}

		// z0 = (tab - 2) * tb / (tb * tab - 2 * ta + tab * [0, 2])
		// numerator: (tab - 2) * tb
		const z0NumX = (tabX - 2) * tbX - tabY * tbY;
		const z0NumY = (tabX - 2) * tbY + tabY * tbX;

		// denominator: tb * tab - 2 * ta + tab * [0, 2]
		// tab * [0, 2] = [-2 * tabY, 2 * tabX]
		const z0DenX = tbX * tabX - tbY * tabY - 2 * taX - 2 * tabY;
		const z0DenY = tbX * tabY + tbY * tabX - 2 * taY + 2 * tabX;

		const z0D = z0DenX * z0DenX + z0DenY * z0DenY;
		const z0X = (z0NumX * z0DenX + z0NumY * z0DenY) / z0D;
		const z0Y = (z0NumY * z0DenX - z0NumX * z0DenY) / z0D;



		// c1 = ta / 2
		const c1X = taX / 2;
		const c1Y = taY / 2;

		// c2 = (ta * tab - 2 * tb + [0, 4]) / ((2 * tab + 4) * z0)
		// ta * tab
		const taTabX = taX * tabX - taY * tabY;
		const taTabY = taX * tabY + taY * tabX;

		const c2NumX = taTabX - 2 * tbX;
		const c2NumY = taTabY - 2 * tbY + 4;

		// (2 * tab + 4) * z0
		const c2DenAX = 2 * tabX + 4;
		const c2DenAY = 2 * tabY;
		const c2DenX = c2DenAX * z0X - c2DenAY * z0Y;
		const c2DenY = c2DenAX * z0Y + c2DenAY * z0X;

		const c2D = c2DenX * c2DenX + c2DenY * c2DenY;
		const c2X = (c2NumX * c2DenX + c2NumY * c2DenY) / c2D;
		const c2Y = (c2NumY * c2DenX - c2NumX * c2DenY) / c2D;

		// c3 = (ta * tab - 2 * tb - [0, 4]) * z0 / (2 * tab - 4)
		const c3NumAX = taTabX - 2 * tbX;
		const c3NumAY = taTabY - 2 * tbY - 4;

		const c3NumX = c3NumAX * z0X - c3NumAY * z0Y;
		const c3NumY = c3NumAX * z0Y + c3NumAY * z0X;

		const c3DenX = 2 * tabX - 4;
		const c3DenY = 2 * tabY;

		const c3D = c3DenX * c3DenX + c3DenY * c3DenY;
		const c3X = (c3NumX * c3DenX + c3NumY * c3DenY) / c3D;
		const c3Y = (c3NumY * c3DenX - c3NumX * c3DenY) / c3D;

		// c4 = (tb - [0, 2]) / 2
		const c4X = tbX / 2;
		const c4Y = (tbY - 2) / 2;

		// c5 = tb / 2
		const c5X = tbX / 2;
		const c5Y = tbY / 2;

		// c6 = (tb + [0, 2]) / 2
		const c6X = tbX / 2;
		const c6Y = (tbY + 2) / 2;

		this.coefficients[0][0][0] = c1X;
		this.coefficients[0][0][1] = c1Y;

		this.coefficients[0][1][0] = c2X;
		this.coefficients[0][1][1] = c2Y;

		this.coefficients[0][2][0] = c3X;
		this.coefficients[0][2][1] = c3Y;

		this.coefficients[0][3][0] = c1X;
		this.coefficients[0][3][1] = c1Y;

		this.coefficients[1][0][0] = c4X;
		this.coefficients[1][0][1] = c4Y;

		this.coefficients[1][1][0] = c5X;
		this.coefficients[1][1][1] = c5Y;

		this.coefficients[1][2][0] = c5X;
		this.coefficients[1][2][1] = c5Y;

		this.coefficients[1][3][0] = c6X;
		this.coefficients[1][3][1] = c6Y;



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
		const taX = p1[0];
		const taY = p1[1];
		const tbX = p2[0];
		const tbY = p2[1];
		const tabX = p3[0];
		const tabY = p3[1];

		// tc = ta^2 + tb^2 + tab^2 - ta * tb * tab - 2
		const taTbX = taX * tbX - taY * tbY;
		const taTbY = taX * tbY + taY * tbX;

		const tcX = taX * taX - taY * taY
			+ tbX * tbX - tbY * tbY
			+ tabX * tabX - tabY * tabY
			- (taTbX * tabX - taTbY * tabY)
			- 2;
		const tcY = 2 * taX * taY
			+ 2 * tbX * tbY
			+ 2 * tabX * tabY
			- (taTbX * tabY + taTbY * tabX);

		// Q = sqrt(2 - tc)
		const twoMinusTcX = 2 - tcX;
		const twoMinusTcY = -tcY;
		const qR = Math.sqrt(Math.sqrt(twoMinusTcX * twoMinusTcX + twoMinusTcY * twoMinusTcY));
		const qTheta = Math.atan2(twoMinusTcY, twoMinusTcX) / 2;
		const qX = qR * Math.cos(qTheta);
		const qY = qR * Math.sin(qTheta);

		// i * Q = [-qY, qX]

		// sqrt(tc + 2)
		const tcP2X = tcX + 2;
		const tcP2Y = tcY;
		const tcP2R = Math.sqrt(Math.sqrt(tcP2X * tcP2X + tcP2Y * tcP2Y));
		const tcP2Theta = Math.atan2(tcP2Y, tcP2X) / 2;
		const sqrtTcP2X = tcP2R * Math.cos(tcP2Theta);
		const sqrtTcP2Y = tcP2R * Math.sin(tcP2Theta);

		// mag = |tc + i * Q * sqrt(tc + 2)|
		// i * Q * sqrt(tc + 2)
		const iQSqrtX = -qY * sqrtTcP2X - qX * sqrtTcP2Y;
		const iQSqrtY = -qY * sqrtTcP2Y + qX * sqrtTcP2X;

		const mag = Math.sqrt(
			(tcX + iQSqrtX) * (tcX + iQSqrtX)
			+ (tcY + iQSqrtY) * (tcY + iQSqrtY)
		);

		// R = sqrt(tc + 2) * (mag >= 2 ? 1 : -1)
		const sign = mag >= 2 ? 1 : -1;
		const rX = sqrtTcP2X * sign;
		const rY = sqrtTcP2Y * sign;

		// z0 = (tab - 2) * (tb + R) / (tb * tab - 2 * ta + i * Q * tab)
		// numerator: (tab - 2) * (tb + R)
		const z0NumX = (tabX - 2) * (tbX + rX) - tabY * (tbY + rY);
		const z0NumY = (tabX - 2) * (tbY + rY) + tabY * (tbX + rX);

		// i * Q * tab = [-qY, qX] * [tabX, tabY]
		const iQTabX = -qY * tabX - qX * tabY;
		const iQTabY = -qY * tabY + qX * tabX;

		// denominator: tb * tab - 2 * ta + i * Q * tab
		const z0DenX = tbX * tabX - tbY * tabY - 2 * taX + iQTabX;
		const z0DenY = tbX * tabY + tbY * tabX - 2 * taY + iQTabY;

		const z0D = z0DenX * z0DenX + z0DenY * z0DenY;
		const z0X = (z0NumX * z0DenX + z0NumY * z0DenY) / z0D;
		const z0Y = (z0NumY * z0DenX - z0NumX * z0DenY) / z0D;



		// c1 = ta / 2
		const c1X = taX / 2;
		const c1Y = taY / 2;

		// ta * tab (reused below)
		const taTabX = taX * tabX - taY * tabY;
		const taTabY = taX * tabY + taY * tabX;

		// 2 * tab + 4 and 2 * tab - 4 (reused below)
		const tab2P4X = 2 * tabX + 4;
		const tab2P4Y = 2 * tabY;
		const tab2M4X = 2 * tabX - 4;
		const tab2M4Y = 2 * tabY;

		// c2 = (ta * tab - 2 * tb + 2 * i * Q) / (z0 * (2 * tab + 4))
		// i * Q * 2 = [-2 * qY, 2 * qX]
		const c2NumX = taTabX - 2 * tbX - 2 * qY;
		const c2NumY = taTabY - 2 * tbY + 2 * qX;

		const c2DenX = z0X * tab2P4X - z0Y * tab2P4Y;
		const c2DenY = z0X * tab2P4Y + z0Y * tab2P4X;

		const c2D = c2DenX * c2DenX + c2DenY * c2DenY;
		const c2X = (c2NumX * c2DenX + c2NumY * c2DenY) / c2D;
		const c2Y = (c2NumY * c2DenX - c2NumX * c2DenY) / c2D;

		// c3 = z0 * (ta * tab - 2 * tb - 2 * i * Q) / (2 * tab - 4)
		// -2 * i * Q = [2 * qY, -2 * qX]
		const c3AX = taTabX - 2 * tbX + 2 * qY;
		const c3AY = taTabY - 2 * tbY - 2 * qX;

		const c3NumX = z0X * c3AX - z0Y * c3AY;
		const c3NumY = z0X * c3AY + z0Y * c3AX;

		const c3D = tab2M4X * tab2M4X + tab2M4Y * tab2M4Y;
		const c3X = (c3NumX * tab2M4X + c3NumY * tab2M4Y) / c3D;
		const c3Y = (c3NumY * tab2M4X - c3NumX * tab2M4Y) / c3D;

		// c4 = (tb - i * Q) / 2
		// -i * Q = [qY, -qX]
		const c4X = (tbX + qY) / 2;
		const c4Y = (tbY - qX) / 2;

		// c5 = (tb * tab - 2 * ta + i * Q * tab) / (z0 * (2 * tab + 4))
		// tb * tab - 2 * ta + i * Q * tab = z0Den
		const c5NumX = z0DenX;
		const c5NumY = z0DenY;

		const c5D = c2DenX * c2DenX + c2DenY * c2DenY;
		const c5X = (c5NumX * c2DenX + c5NumY * c2DenY) / c5D;
		const c5Y = (c5NumY * c2DenX - c5NumX * c2DenY) / c5D;

		// c6 = (tb * tab - 2 * ta - i * Q * tab) * z0 / (2 * tab - 4)
		// -i * Q * tab = [qY * tabX + qX * tabY, qY * tabY - qX * tabX]
		const c6AX = tbX * tabX - tbY * tabY - 2 * taX + qY * tabX + qX * tabY;
		const c6AY = tbX * tabY + tbY * tabX - 2 * taY + qY * tabY - qX * tabX;

		const c6NumX = c6AX * z0X - c6AY * z0Y;
		const c6NumY = c6AX * z0Y + c6AY * z0X;

		const c6D = tab2M4X * tab2M4X + tab2M4Y * tab2M4Y;
		const c6X = (c6NumX * tab2M4X + c6NumY * tab2M4Y) / c6D;
		const c6Y = (c6NumY * tab2M4X - c6NumX * tab2M4Y) / c6D;

		// c7 = (tb + i * Q) / 2
		// i * Q = [-qY, qX]
		const c7X = (tbX - qY) / 2;
		const c7Y = (tbY + qX) / 2;



		this.coefficients[0][0][0] = c1X;
		this.coefficients[0][0][1] = c1Y;

		this.coefficients[0][1][0] = c2X;
		this.coefficients[0][1][1] = c2Y;

		this.coefficients[0][2][0] = c3X;
		this.coefficients[0][2][1] = c3Y;

		this.coefficients[0][3][0] = c1X;
		this.coefficients[0][3][1] = c1Y;

		this.coefficients[1][0][0] = c4X;
		this.coefficients[1][0][1] = c4Y;

		this.coefficients[1][1][0] = c5X;
		this.coefficients[1][1][1] = c5Y;

		this.coefficients[1][2][0] = c6X;
		this.coefficients[1][2][1] = c6Y;

		this.coefficients[1][3][0] = c7X;
		this.coefficients[1][3][1] = c7Y;



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
			this.wilson.draggables.tc.element.style.display = "none";
		}

		else if (recipe === "riley")
		{
			this.bakeCoefficients = this.rileyCoefficients;

			this.wilson.draggables.tb.element.style.display = "none";
			this.wilson.draggables.tc.element.style.display = "none";
		}

		else if (recipe === "grandmaSpecial")
		{
			this.bakeCoefficients = this.grandmaSpecialCoefficients;

			this.wilson.draggables.tb.element.style.display = "block";
			this.wilson.draggables.tc.element.style.display = "block";
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
				? Math.floor((-this.y + boxSize / 2) / boxSize * this.wilson.canvasHeight)
				: Math.floor(
					(
						-this.y * (this.wilson.canvasWidth / this.wilson.canvasHeight)
						+ boxSize / 2
					) / boxSize * this.wilson.canvasHeight
				);

			const col = this.wilson.canvasWidth >= this.wilson.canvasHeight
				? Math.floor(
					(
						this.x / (this.wilson.canvasWidth / this.wilson.canvasHeight)
						+ boxSize / 2
					) / boxSize * this.wilson.canvasWidth)
				: Math.floor((this.x + boxSize / 2) / boxSize * this.wilson.canvasWidth);

			if (
				row >= 0
				&& row < this.wilson.canvasHeight
				&& col >= 0
				&& col < this.wilson.canvasWidth
			) {
				if (
					this.brightness[this.wilson.canvasWidth * row + col] >= this.maxPixelBrightness
				) {
					continue;
				}

				if (depth > 10)
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

	releaseDraggableTimeoutId;

	onReleaseDraggable()
	{
		clearTimeout(this.releaseDraggableTimeoutId);

		this.releaseDraggableTimeoutId = setTimeout(() =>
		{
			this.wilson.resizeCanvas({
				width: this.resolutionLarge,
			});

			this.maxDepth = 500;
			this.maxPixelBrightness = 200;

			this.needNewFrame = true;
		}, 50);
	}

	onDragDraggable()
	{
		for (let i = 0; i < this.wilson.canvasHeight * this.wilson.canvasWidth; i++)
		{
			this.brightness[i] = 0;
		}

		this.needNewFrame = true;
	}



	async requestHighResFrame(resolution, maxDepth, maxPixelBrightness)
	{
		this.maxDepth = maxDepth;
		this.maxPixelBrightness = maxPixelBrightness;

		this.wilson.resizeCanvas({
			width: resolution
		});

		this.webWorker = addTemporaryWorker("/applets/quasi-fuchsian-groups/scripts/worker.js");

		const workerPromise = new Promise(resolve =>
		{
			this.webWorker.onmessage = e =>
			{
				this.brightness = e.data[0];

				for (let i = 0; i < this.wilson.canvasHeight * this.wilson.canvasWidth; i++)
				{
					this.image[4 * i] = 0;
					this.image[4 * i + 1] = 1;
					this.image[4 * i + 2] = this.brightness[i];
					this.image[4 * i + 3] = 1;
				}

				this.renderShaderStack();

				resolve();
			};
		});

		this.webWorker.postMessage([
			resolution,
			this.maxDepth,
			this.maxPixelBrightness,
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