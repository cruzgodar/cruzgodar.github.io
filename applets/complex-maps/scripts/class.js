import { getGlslBundle, loadGlsl } from "../../../scripts/src/complexGlsl.js";
import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { tempShader } from "/scripts/applets/applet.js";
import { WilsonGPU } from "/scripts/wilson.js";

export class ComplexMaps extends AnimationFrameApplet
{
	loadPromise;

	generatingCode = "";
	uniformCode = "";

	resolution = 500;

	blackPoint = 1;
	whitePoint = 1;

	draggableCallback;

	addIndicatorDraggable = false;
	useSelectorMode = false;



	constructor({
		canvas,
		generatingCode,
		uniformCode = "",
		worldWidth = 4,
		worldHeight,
		worldCenterX = 0,
		worldCenterY = 0,
		addIndicatorDraggable = false,
		draggableCallback = () => {},
		selectorMode = false
	}) {
		super(canvas);

		const options =
		{
			shader: tempShader,

			canvasWidth: this.resolution,

			worldWidth,
			worldHeight,
			worldCenterX: 0,
			worldCenterY: 0,

			minWorldWidth: 0.00002,
			maxWorldWidth: 100,
			minWorldHeight: 0.00002,
			maxWorldHeight: 100,

			onResizeCanvas: () => this.needNewFrame = true,

			draggableOptions: {
				draggables: {
					draggableArg: [1, 1],
				},
				callbacks: {
					drag: this.onDragDraggable.bind(this),
				}
			},

			interactionOptions: {
				useForPanAndZoom: true,
				onPanAndZoom: () => this.needNewFrame = true,
				callbacks: {
					mousedown: this.onGrabCanvas.bind(this),
					touchstart: this.onGrabCanvas.bind(this),
				},
			},

			fullscreenOptions: {
				fillScreen: true,
				useFullscreenButton: true,
				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			}
		};

		this.wilson = new WilsonGPU(canvas, options);

		this.wilson.draggables.draggableArg.element.style.display = "none";

		this.loadPromise = new Promise(resolve =>
		{
			loadGlsl()
				.then(() =>
				{
					this.run({
						generatingCode,
						uniformCode,
						worldWidth,
						worldHeight,
						worldCenterX,
						worldCenterY,
						addIndicatorDraggable,
						draggableCallback,
						selectorMode
					});

					resolve();
				});
		});
	}



	run({
		generatingCode = this.generatingCode,
		uniformCode = this.uniformCode,
		worldWidth,
		worldHeight,
		worldCenterX,
		worldCenterY,
		addIndicatorDraggable = this.addIndicatorDraggable,
		draggableCallback = this.draggableCallback,
		selectorMode = false
	}) {
		this.generatingCode = generatingCode;
		this.uniformCode = uniformCode;

		this.wilson.resizeWorld({
			width: worldWidth,
			height: worldHeight,
			centerX: worldCenterX,
			centerY: worldCenterY,
		});

		this.addIndicatorDraggable = addIndicatorDraggable;
		this.draggableCallback = draggableCallback;

		const needDraggable = generatingCode.indexOf("draggableArg") !== -1;

		const selectorModeString = selectorMode
			? /* glsl */`
				imageZ.x += 127.0;
				imageZ.y += 127.0;
				
				float whole1 = floor(imageZ.x);
				float whole2 = floor(imageZ.y);
				
				float fract1 = (imageZ.x - whole1);
				float fract2 = (imageZ.y - whole2);
				
				gl_FragColor = vec4(whole1 / 256.0, fract1, whole2 / 256.0, fract2);
				
				return;
			`
			: "";



		const shader = /* glsl */`
			precision highp float;
			
			varying vec2 uv;

			uniform vec2 worldSize;
			uniform vec2 worldCenter;
			
			uniform float blackPoint;
			uniform float whitePoint;
			
			${needDraggable ? "uniform vec2 draggableArg;" : ""}
			
			${uniformCode}
			
			${getGlslBundle(generatingCode)}
			
			vec3 hsv2rgb(vec3 c)
			{
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}
			
			vec2 f(vec2 z)
			{
				return ${generatingCode};
			}
			
			void main(void)
			{
				vec2 z = uv * worldSize * 0.5 + worldCenter;
				
				vec2 imageZ = f(z);
				
				${selectorModeString}
				
				float modulus = length(imageZ);
				
				float h = atan(imageZ.y, imageZ.x) / 6.283;
				float s = clamp(1.0 / (1.0 + .01 * (modulus / whitePoint / whitePoint)), 0.0, 1.0);
				float v = clamp(1.0 / (1.0 + .01 / (modulus * blackPoint * blackPoint)), 0.0, 1.0);
				
				gl_FragColor = vec4(hsv2rgb(vec3(h, s, v)), 1.0);
			}
		`;

		this.wilson.loadShader({
			source: shader,
			uniforms: {
				worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
				worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
				blackPoint: this.blackPoint,
				whitePoint: this.whitePoint,
				...(needDraggable ? {
					draggableArg: this.wilson.draggables.draggableArg.location
				} : {}),
			},
		});

		this.wilson.draggables.draggableArg.element.style.display =
			(needDraggable || addIndicatorDraggable) ? "block" : "none";
		
		this.resume();

		this.needNewFrame = true;
	}



	onGrabCanvas({ x, y })
	{
		if (this.useSelectorMode)
		{
			this.run({
				selectorMode: true
			});

			const timeoutId = setTimeout(() =>
			{
				this.wilson.drawFrame();

				const coordinates = this.wilson.interpolateWorldToCanvas([x, y]);

				const pixel = this.wilson.readPixels({
					row: this.wilson.canvasHeight - coordinates[0],
					col: coordinates[1],
					width: 1,
					height: 1,
				});

				const zX = (pixel[0] - 127) + pixel[1] / 256;
				const zY = (pixel[2] - 127) + pixel[3] / 256;



				const plus1 = (y < 0) ? "-" : "+";
				const plus2 = (zY < 0) ? "-" : "+";

				console.log(`${x} ${plus1} ${Math.abs(y)}i |---> ${zX} ${plus2} ${Math.abs(zY)}i`);

				this.run({
					selectorMode: false
				});

				this.useSelectorMode = false;
			}, 20);

			this.timeoutIds.push(timeoutId);
		}
	}



	onDragDraggable({ x, y })
	{
		this.draggableCallback({ x, y });

		this.wilson.setUniforms({ draggableArg: [x, y] });

		this.needNewFrame = true;
	}

	drawFrame()
	{
		this.wilson.setUniforms({
			worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
			worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
		});

		this.wilson.drawFrame();
	}
}