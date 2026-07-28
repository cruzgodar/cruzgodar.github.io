import anime from "../anime.js";
import { animate, sleep } from "../src/utils.js";
import { WilsonGPU } from "../wilson.js";
import { AnimationFrameApplet } from "./animationFrameApplet.js";
import {
	tempShader
} from "./applet.js";
import { createShader } from "./createShader.js";

export class RaymarchApplet extends AnimationFrameApplet
{
	movingSpeed = .1;
	moveVelocity = [0, 0, 0];

	moveFriction = .96;
	moveStopThreshhold = .01;

	lastTimestamp = -1;

	theta = 0;
	phi = 0;
	worldSize = 2.5;

	resolution = 500;

	fpsCap;
	timeSinceLastFrame = Infinity;

	maxMarches;
	maxShadowMarches;
	maxReflectionMarches;
	clipDistance;

	projectionMatrix = new Float32Array(16);
	cameraToWorld = new Float32Array(16);
	worldScale = 1;

	clipNear = 0.1;
	clipFar = 1000;

	forwardVec = [0, 0, 0];
	rightVec = [0, 0, 0];
	upVec = [0, 0, 0];

	// This controls the amount of fish-eye and is a delicate balance.
	// Changing it also requires upating the camera position.
	focalLengthFactor;

	sceneOrigin; // Formerly cameraPos
	defaultSceneOrigin;

	lightPos;
	lightBrightness;
	useOppositeLight;
	oppositeLightBrightness;
	ambientLight;
	bloomPower;

	fogColor;
	fogScaling;
	stepFactor;
	epsilonScaling;
	minEpsilon;

	useShadows;
	useSoftShadows;
	useReflections;
	useBloom;
	useFor3DPrinting;

	uniforms = {};
	lockZ;

	speedFactor = 2;
	fovFactor = 1;

	moveForwardScale = 1;
	moveRightScale = 1;

	lockedOnOrigin;
	distanceFromOrigin = 1;

	distanceEstimatorGlsl;
	getColorGlsl;
	uniformsGlsl;
	getReflectivityGlsl;
	getGeodesicGlsl;
	addGlsl;

	xrCameraToWorld = new Float32Array(16);
	xrRayOrigin = [0, 0, 0];
	headPos = [0, 0, 0];
	headToScene = new Float32Array(16);

	xrSceneOriginBeforeXR;
	xrThetaBeforeXR;
	xrInitialZHeight;



	constructor({
		canvas,
		shader,

		resolution = 500,

		distanceEstimatorGlsl,
		getColorGlsl,
		uniformsGlsl = "",
		getReflectivityGlsl = "return 0.2;",
		getGeodesicGlsl = (pos, dir) => `${pos} + t * ${dir}`,
		addGlsl = "",

		uniforms = {},

		theta = 0,
		phi = Math.PI / 2,
		stepFactor = .99,
		epsilonScaling = 1.25,
		minEpsilon = .0000003,

		maxMarches = 128,
		maxShadowMarches = 128,
		maxReflectionMarches = 128,
		clipDistance = 1000,
		
		focalLengthFactor = 2.5,
		sceneOrigin = [0, 0, 0],
		lockedOnOrigin = true,
		lockZ,

		lightPos = [50, 70, 100],
		lightBrightness = 1,
		useOppositeLight = true,
		oppositeLightBrightness = 0.5,
		ambientLight = 0.25,
		bloomPower = 1,

		fogColor = [0, 0, 0],
		fogScaling = .05,

		useShadows = false,
		useSoftShadows = true,
		useReflections = false,
		useBloom = true,
		useFor3DPrinting = false,

		xrInitialZHeight = 0.75,
	}) {
		super(canvas);

		this.resolution = resolution;

		this.theta = theta;
		this.phi = phi;
		this.stepFactor = stepFactor;
		this.epsilonScaling = epsilonScaling;
		this.minEpsilon = minEpsilon;

		this.maxMarches = maxMarches;
		this.maxShadowMarches = maxShadowMarches;
		this.maxReflectionMarches = maxReflectionMarches;
		this.clipDistance = clipDistance;
		
		this.focalLengthFactor = focalLengthFactor;
		this.sceneOrigin = sceneOrigin;
		this.defaultSceneOrigin = [...this.sceneOrigin];
		this.lockedOnOrigin = lockedOnOrigin;
		this.worldSize = this.lockedOnOrigin ? 2.5 : 1.5;
		this.lockZ = lockZ;

		this.lightPos = lightPos;
		this.lightBrightness = lightBrightness;
		this.useOppositeLight = useOppositeLight;
		this.oppositeLightBrightness = oppositeLightBrightness;
		this.ambientLight = ambientLight;
		this.bloomPower = bloomPower;

		this.fogColor = fogColor;
		this.fogScaling = fogScaling;

		this.useShadows = useShadows;
		this.useSoftShadows = useSoftShadows;
		this.useReflections = useReflections;
		this.useBloom = useBloom;
		this.useFor3DPrinting = useFor3DPrinting;

		this.xrInitialZHeight = xrInitialZHeight;

		this.uniformsGlsl = /* glsl */`
			uniform mat4 projectionMatrix;
			uniform mat4 cameraToWorld;
			uniform vec3 rayOrigin;

			uniform float resolution;
			uniform float epsilonScaling;
			uniform float minEpsilon;
			uniform vec2 uvCenter;
			uniform float uvScale;
			${uniformsGlsl}
		`;

		this.uniforms = {
			...(this.useFor3DPrinting
				? {}
				: {
					projectionMatrix: this.projectionMatrix,
					cameraToWorld: this.cameraToWorld,
					rayOrigin: [0, 0, 0],
					resolution: this.resolution,
					minEpsilon: this.minEpsilon,
				}
			),
			
			epsilonScaling: this.epsilonScaling,
			
			uvCenter: [0, 0],
			uvScale: 1,
			...uniforms
		};
		
		this.listenForKeysPressed(
			["w", "s", "a", "d", "q", "e", " ", "shift", "z", "c"],
			(key, pressed) =>
			{
				if (key === "z")
				{
					const oldFactor = pressed ? 1 : 4;
					const newFactor = pressed ? 4 : 1;

					animate((t) =>
					{
						this.fovFactor = (1 - t) * oldFactor
							+ t * newFactor;

						this.setUniforms({
							epsilonScaling: this.epsilonScaling *
								((1 - t) * oldFactor + t * newFactor)
						});

						this.needNewFrame = true;
					}, 250, "easeOutCubic");
				}
			}
		);

		this.distanceFromOrigin = magnitude(this.sceneOrigin);

		const useableShader = shader ?? this.createShader({
			distanceEstimatorGlsl,
			getColorGlsl,
			getReflectivityGlsl,
			getGeodesicGlsl,
			addGlsl,
		});

		const options =
		{
			shader: tempShader,

			canvasWidth: this.resolution,

			// This lets us use the world size as an aspect ratio.
			worldWidth: this.worldSize,
			worldHeight: this.worldSize,

			worldCenterX: this.lockedOnOrigin
				? this.theta
				: 2 * Math.PI - this.theta,

			worldCenterY: this.lockedOnOrigin
				? this.phi
				: Math.PI - this.phi,

			minWorldY: 0.001 - this.worldSize / 2,
			maxWorldY: Math.PI - 0.001 + this.worldSize / 2,

			useResetButton: true,
			resetButtonIconPath: "/graphics/general-icons/reset.png",
			onReset: this.onReset.bind(this),

			onResizeCanvas: this.onResizeCanvas.bind(this),

			useXR: true,
			useXRButton: true,
			xrButtonIconPath: "/graphics/general-icons/xr.png",
			xrTargetFrameRate: 72,
			xrViewportScale: 0.5,

			onEnterXR: this.onEnterXR.bind(this),
			onXRFrameStart: this.onXRFrameStart.bind(this),
			renderXRFrame: this.renderXRFrame.bind(this),
			onExitXR: this.onExitXR.bind(this),

			interactionOptions: {
				useForPanAndZoom: true,
				disallowZooming: true,
				onPanAndZoom: () =>
				{
					this.calculateVectors();
					this.needNewFrame = true;
				},
				callbacks: {
					touchstart: this.onTouchStart.bind(this),
					touchend: this.onTouchEnd.bind(this),
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

			verbose: window.DEBUG
		};

		this.wilson = new WilsonGPU(canvas, options);

		this.wilson.loadShader({
			id: "draw",
			shader: useableShader,
			uniforms: this.uniforms
		});



		if (this.useFor3DPrinting)
		{
			this.make3DPrintable();
		}

		this.needNewFrame = true;

		this.resume();
	}

	switchFullscreen()
	{
		this.resume();
	}

	async beforeSwitchFullscreen()
	{
		this.pause();

		await sleep(33);
	}



	async make3DPrintable()
	{
		const preview = true;

		const resolution = 1500;
		this.setUniforms({
			uvScale: 3,
			uvCenter: [0, 0],
			epsilonScaling: 0.0015,
		});

		this.wilson.resizeCanvas({ width: resolution });

		this.drawFrame();

		await sleep(1000);

		for (let i = 1; i <= resolution; i++)
		{
			this.setUniforms({
				uvCenter: [2 * i / resolution - 1, 0],
			});
			this.drawFrame();
			!preview && this.wilson.downloadFrame(i.toString().padStart(4, "0"), false);
			await sleep(preview ? 0 : 150);
		}
	}


	// Creates a shader and sets the default argument values so that they persist by default.
	createShader({
		distanceEstimatorGlsl = this.distanceEstimatorGlsl,
		getColorGlsl = this.getColorGlsl,
		getReflectivityGlsl = this.getReflectivityGlsl,
		getGeodesicGlsl = this.getGeodesicGlsl,
		addGlsl = this.addGlsl,
		includeDepthData = false,
	}) {
		this.distanceEstimatorGlsl = distanceEstimatorGlsl;
		this.getColorGlsl = getColorGlsl;
		this.getReflectivityGlsl = getReflectivityGlsl;
		this.getGeodesicGlsl = getGeodesicGlsl;
		this.addGlsl = addGlsl;

		return createShader({
			distanceEstimatorGlsl,
			getColorGlsl,
			getReflectivityGlsl,
			getGeodesicGlsl,
			addGlsl,
			includeDepthData,

			useShadows: this.useShadows,
			useSoftShadows: this.useSoftShadows,
			useReflections: this.useReflections,
			useOppositeLight: this.useOppositeLight,
			oppositeLightBrightness: this.oppositeLightBrightness,
			ambientLight: this.ambientLight,
			useBloom: this.useBloom,
			bloomPower: this.bloomPower,
			stepFactor: this.stepFactor,
			useFor3DPrinting: this.useFor3DPrinting,

			uniformsGlsl: this.uniformsGlsl,
			lightPos: this.lightPos,
			lightBrightness: this.lightBrightness,
			clipDistance: this.clipDistance,
			maxMarches: this.maxMarches,
			maxShadowMarches: this.maxShadowMarches,
			maxReflectionMarches: this.maxReflectionMarches,
			fogColor: this.fogColor,
			fogScaling: this.fogScaling
		});
	}



	reloadShader({
		distanceEstimatorGlsl,
		getColorGlsl,
		getReflectivityGlsl,
		addGlsl,
		includeDepthData
	} = {}) {
		this.wilson.loadShader({
			id: "draw",
			shader: this.createShader({
				distanceEstimatorGlsl,
				getColorGlsl,
				getReflectivityGlsl,
				addGlsl,
				includeDepthData,
			}),
			uniforms: this.uniforms,
		});

		this.calculateVectors();

		this.needNewFrame = true;
	}



	setUniforms(uniforms)
	{
		this.uniforms = {
			...this.uniforms,
			...uniforms
		};

		this.wilson.setUniforms(uniforms, "draw");

		this.needNewFrame = true;
	}



	calculateVectors()
	{
		if (this.useFor3DPrinting)
		{
			return;
		}

		const inXR = this.wilson.inXR;

		// Without a headset, all of the camera orientation is ours to compute.
		if (!inXR)
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
			this.rightVec = normalize([this.forwardVec[1], -this.forwardVec[0], 0]);

			// Finally, the upward vector is the cross product of the previous two.
			this.upVec = crossProduct(this.rightVec, this.forwardVec);

			// This also can't be allowed to run in XR since it would try to keep the camera
			// locked in place.
			if (this.lockedOnOrigin)
			{
				this.sceneOrigin = scaleVector(
					-this.distanceFromOrigin,
					this.forwardVec
				);
			}
		}

		// The camera is the head in XR.
		const cameraPos = inXR ? this.headPos : this.sceneOrigin;

		this.speedFactor = Math.min(
			this.distanceEstimator(cameraPos[0], cameraPos[1], cameraPos[2]),
			.5
		) / 4;

		// The camera basis stays orthonormal instead of also encoding the fov,
		// which lives in the projection matrix now. These only scale movement,
		// which used to ride along on the magnitudes.
		this.moveForwardScale = this.speedFactor / 1.5;
		this.moveRightScale = this.speedFactor / this.fovFactor;


		// Everything past this point is going to be handed to us by a headset if there is one.
		if (inXR)
		{
			this.needNewFrame = false;
			return;
		}



		// focalLengthFactor and fovFactor combine into one focal length. The two aspect
		// terms are the old aspectRatio uniform.
		const focalLength = this.focalLengthFactor * this.fovFactor / 1.5;
		const aspectRatioX = this.wilson.worldWidth / this.worldSize;
		const aspectRatioY = this.wilson.worldHeight / this.worldSize;

		this.projectionMatrix = new Float32Array([
			focalLength / aspectRatioX, 0, 0, 0,
			0, focalLength / aspectRatioY, 0, 0,
			0, 0, (this.clipFar + this.clipNear) / (this.clipNear - this.clipFar), -1,
			0, 0, 2 * this.clipFar * this.clipNear / (this.clipNear - this.clipFar), 0
		]);

		// Translation is zero: cameraToWorld maps the eye into the space centered on the
		// camera, and sceneOrigin places that space in the scene. In XR the headset
		// supplies the translation instead, and worldScale converts it from meters.
		this.cameraToWorld = new Float32Array([
			this.rightVec[0], this.rightVec[1], this.rightVec[2], 0,
			this.upVec[0], this.upVec[1], this.upVec[2], 0,
			-this.forwardVec[0], -this.forwardVec[1], -this.forwardVec[2], 0,
			0, 0, 0, 1
		]);
		


		this.setUniforms({
			projectionMatrix: this.projectionMatrix,
			cameraToWorld: this.cameraToWorld,

			// No accounting for the head position here -- that's only in XR.
			rayOrigin: this.sceneOrigin,
		});

		this.needNewFrame = false;
	}



	distanceEstimator()
	{
		throw new Error("Distance estimator not implemented!");
	}



	prepareFrame(timeElapsed)
	{
		this.touchDelay = Math.max(0, this.touchDelay - timeElapsed);

		this.moveUpdate(timeElapsed);

		this.timeSinceLastFrame += timeElapsed;
	}



	onEnterXR()
	{
		this.pause();

		this.xrSceneOriginBeforeXR = [...this.sceneOrigin];
		this.xrThetaBeforeXR = this.theta;
		this.lockedOnOrigin = false;

		this.theta = 0;
		this.sceneOrigin = [-this.distanceFromOrigin, 0, this.xrInitialZHeight];
	}

	onExitXR()
	{
		this.sceneOrigin = this.xrSceneOriginBeforeXR;
		this.theta = this.xrThetaBeforeXR;

		this.wilson.setUniform("resolution", this.resolution, "draw");
		this.calculateVectors();
		this.resume();
	}

	onXRFrameStart({ deltaTime, pose })
	{
		xrToScene(pose.transform.matrix, this.headToScene);

		this.headPos[0] = this.sceneOrigin[0] + this.headToScene[12] * this.worldScale;
		this.headPos[1] = this.sceneOrigin[1] + this.headToScene[13] * this.worldScale;
		this.headPos[2] = this.sceneOrigin[2] + this.headToScene[14] * this.worldScale;

		// The head replaces theta and phi as the movement basis, so w/a/s/d moves
		// where the user is looking.
		this.forwardVec = normalize([
			-this.headToScene[8],
			-this.headToScene[9],
			-this.headToScene[10]
		]);

		// Constrained to the xy-plane like the desktop path, but here the user really
		// can look straight up, where that construction degenerates.
		const horizontal = Math.hypot(this.forwardVec[0], this.forwardVec[1]);

		if (horizontal > 0.001)
		{
			this.rightVec = normalize([this.forwardVec[1], -this.forwardVec[0], 0]);
			this.upVec = crossProduct(this.rightVec, this.forwardVec);
		}

		// Get input from potentially both controllers,
		// taking the larger absolute thumbstick values...
		const controller1 = this.wilson.getXRController("right");
		const controller2 = this.wilson.getXRController("left");

		const thumbstickY1 = controller1?.thumbstick?.[1] ?? 0;
		const thumbstickY2 = controller2?.thumbstick?.[1] ?? 0;
		const thumbstickY = Math.abs(thumbstickY1) > Math.abs(thumbstickY2)
			? thumbstickY1
			: thumbstickY2;

		const thumbstickX1 = controller1?.thumbstick?.[0] ?? 0;
		const thumbstickX2 = controller2?.thumbstick?.[0] ?? 0;
		const thumbstickX = Math.abs(thumbstickX1) > Math.abs(thumbstickX2)
			? thumbstickX1
			: thumbstickX2;

		const trigger = controller1.buttons.trigger.pressed || controller2.buttons.trigger.pressed;
		const squeeze = controller1.buttons.squeeze.pressed || controller2.buttons.squeeze.pressed;

		// ...but only apply those thumbstick values if they're larger than the current velocity,
		// so that interia can still take effect.
		if (Math.abs(thumbstickY) >= Math.abs(this.moveVelocity[0]))
		{
			this.moveVelocity[0] = thumbstickY;
		}

		if (Math.abs(thumbstickX) >= Math.abs(this.moveVelocity[1]))
		{
			this.moveVelocity[1] = thumbstickX;
		}

		if (trigger)
		{
			this.moveVelocity[2] = 1;
		}

		else if (squeeze)
		{
			this.moveVelocity[2] = -1;
		}

		this.calculateVectors();

		this.prepareFrame(deltaTime);
	}



	onReset()
	{
		const duration = 350;

		const oldCameraPos = [...this.sceneOrigin];

		animate((t) =>
		{
			this.sceneOrigin = [
				(1 - t) * oldCameraPos[0] + t * this.defaultSceneOrigin[0],
				(1 - t) * oldCameraPos[1] + t * this.defaultSceneOrigin[1],
				(1 - t) * oldCameraPos[2] + t * this.defaultSceneOrigin[2]
			];

			this.needNewFrame = true;
		}, duration, "easeInOutQuad");
	}

	drawFrame()
	{
		if (this.wilson.worldCenterX < -Math.PI || this.wilson.worldCenterX >= 3 * Math.PI)
		{
			this.wilson.resizeWorld({
				centerX: this.wilson.worldCenterX % (2 * Math.PI)
			});
		}

		this.theta = this.lockedOnOrigin
			? this.wilson.worldCenterX
			: 2 * Math.PI - this.wilson.worldCenterX;
		this.phi = this.lockedOnOrigin
			? this.wilson.worldCenterY
			: Math.PI - this.wilson.worldCenterY;

		this.calculateVectors();

		if (this.fpsCap)
		{
			if (this.timeSinceLastFrame >= 1000 / this.fpsCap)
			{
				this.timeSinceLastFrame = 0;
				this.wilson.drawFrame();
			}
		}

		else
		{
			this.wilson.drawFrame();
		}
	}



	renderXRFrame({ projectionMatrix, cameraToWorld, viewport })
	{
		xrToScene(cameraToWorld, this.xrCameraToWorld);

		this.xrRayOrigin[0] = this.sceneOrigin[0] + this.xrCameraToWorld[12] * this.worldScale;
		this.xrRayOrigin[1] = this.sceneOrigin[1] + this.xrCameraToWorld[13] * this.worldScale;
		this.xrRayOrigin[2] = this.sceneOrigin[2] + this.xrCameraToWorld[14] * this.worldScale;

		// These get set manually instead of with this.setUniforms to avoid unnecessary overhead.
		this.wilson.setUniform("projectionMatrix", projectionMatrix, "draw");
		this.wilson.setUniform("cameraToWorld", this.xrCameraToWorld, "draw");
		this.wilson.setUniform("rayOrigin", this.xrRayOrigin, "draw");

		// Ensure epsilon scaling is done with the per-eye resolution.
		this.wilson.setUniform(
			"resolution",
			Math.min(Math.sqrt(viewport.width * viewport.height), 1000),
			"draw"
		);

		this.wilson.drawFrame();
	}



	downloadHighResFrame(filename, resolution = this.resolution)
	{
		this.wilson.downloadHighResFrame(
			filename,
			resolution,
			{
				resolution: Math.min(resolution, 4096)
			}
		);
	}

	async downloadBokehFrame()
	{
		const resolution = 2048;

		this.reloadShader({
			includeDepthData: true
		});

		const { pixels } = await this.wilson.readHighResPixels({
			resolution,
			uniforms: {
				resolution
			},
			format: "float"
		});

		this.downloadBokehFrameFromPixels({
			pixels,
			resolution,
			clipDistance: this.clipDistance
		});

		this.reloadShader({
			includeDepthData: false
		});

		this.drawFrame();
	}


	touchDelay = 0;
	numTouches = 0;

	onTouchStart({ event })
	{
		if (this.numTouches <= 1 && event.touches.length === 2)
		{
			this.numTouches = 2;
			this.touchDelay = 100;
		}

		else if (this.numTouches <= 2 && event.touches.length === 3)
		{
			this.numTouches = 3;
		}

		else
		{
			this.numTouches = 0;
		}
	}

	onTouchEnd({ event })
	{
		if (event.touches.length < 2)
		{
			this.numTouches = 0;
		}
	}

	moveUpdate(timeElapsed)
	{
		if (this.touchDelay === 0)
		{
			if (this.numTouches === 2)
			{
				this.moveVelocity[0] = 1;
			}

			else if (this.numTouches === 3)
			{
				this.moveVelocity[0] = -1;
			}
		}



		if (this.keysPressed.w || this.numTouches === 2)
		{
			this.moveVelocity[0] = 1;
		}

		else if (this.keysPressed.s || this.numTouches === 3)
		{
			this.moveVelocity[0] = -1;
		}

		if (this.keysPressed.d)
		{
			this.moveVelocity[1] = 1;
		}

		else if (this.keysPressed.a)
		{
			this.moveVelocity[1] = -1;
		}

		if (this.keysPressed[" "])
		{
			this.moveVelocity[2] = 1;
		}

		else if (this.keysPressed.shift)
		{
			this.moveVelocity[2] = -1;
		}

		const movingSpeed = (this.keysPressed.c ? 0.05 : 1) * this.movingSpeed;

		if (!this.lockedOnOrigin && (
			this.moveVelocity[0] !== 0
				|| this.moveVelocity[1] !== 0
				|| this.moveVelocity[2] !== 0
		)) {
			const usableForwardVec = scaleVector(
				this.moveForwardScale,
				this.lockZ !== undefined
					? normalize([this.forwardVec[0], this.forwardVec[1], 0])
					: this.forwardVec
			);

			const usableRightVec = scaleVector(
				this.moveRightScale,
				this.lockZ !== undefined
					? normalize([this.rightVec[0], this.rightVec[1], 0])
					: this.rightVec
			);

			const tangentVec = [
				this.moveVelocity[0] * usableForwardVec[0]
					+ this.moveVelocity[1] * usableRightVec[0],
				this.moveVelocity[0] * usableForwardVec[1]
					+ this.moveVelocity[1] * usableRightVec[1],
				this.moveVelocity[0] * usableForwardVec[2]
					+ this.moveVelocity[1] * usableRightVec[2]
					+ this.moveVelocity[2] * this.speedFactor / 1.5
			];

			this.sceneOrigin[0] += movingSpeed * tangentVec[0] * (timeElapsed / 6.944);
			this.sceneOrigin[1] += movingSpeed * tangentVec[1] * (timeElapsed / 6.944);
			this.sceneOrigin[2] = this.lockZ
				?? this.sceneOrigin[2] + movingSpeed * tangentVec[2] * (timeElapsed / 6.944);
			
			if (!this.wilson.inXR)
			{
				this.wilson.showResetButton();
			}

			this.needNewFrame = true;
		}

		for (let i = 0; i < 3; i++)
		{
			this.moveVelocity[i] *= this.moveFriction ** (timeElapsed / 6.944);

			if (Math.abs(this.moveVelocity[i]) < this.moveStopThreshhold)
			{
				this.moveVelocity[i] = 0;
			}
		}
	}

	onResizeCanvas()
	{
		if (this.useFor3DPrinting)
		{
			return;
		}

		this.resolution = Math.sqrt(this.wilson.canvasWidth * this.wilson.canvasHeight);

		this.wilson.resizeWorld({
			minY: 0.001 - this.wilson.worldHeight / 2,
			maxY: Math.PI - 0.001 + this.wilson.worldHeight / 2,
		});

		this.setUniforms({
			resolution: this.resolution
		});

		this.needNewFrame = true;
	}

	

	animateUniform({
		name,
		value,
		duration = 1000
	}) {
		const oldUniformValue = this.uniforms[name];

		animate((t) =>
		{
			this.setUniforms({ [name]: t * value + (1 - t) * oldUniformValue });
			this.needNewFrame = true;
		}, duration, "easeInOutQuart");
	}

	loopUniform({
		name,
		startValue,
		endValue,
		duration = 2000
	}) {
		const dummy = { t: 0 };

		return anime({
			targets: dummy,
			t: 1,
			duration,
			easing: "easeInOutQuad",
			loop: true,
			direction: "alternate",
			update: () =>
			{
				this.setUniforms({ [name]: startValue + (endValue - startValue) * dummy.t });
				this.needNewFrame = true;
			}
		});
	}



	async setLockedOnOrigin(value)
	{
		if (value && !this.lockedOnOrigin)
		{
			// Convert to spherical coordinates.
			const r = magnitude(this.sceneOrigin);
			const normalizedCameraPos = normalize(this.sceneOrigin);
			const phi = Math.acos(this.sceneOrigin[2] / r);
			let theta = Math.PI - Math.atan2(this.sceneOrigin[1], this.sceneOrigin[0]);
			if (theta > Math.PI)
			{
				theta -= 2 * Math.PI;
			}
			if (theta < -Math.PI)
			{
				theta += 2 * Math.PI;
			}

			const dummy = {
				r,
				theta: 2 * Math.PI - this.theta,
				phi: Math.PI - this.phi
			};

			if (dummy.theta > Math.PI)
			{
				dummy.theta -= 2 * Math.PI;
			}
			if (dummy.theta < -Math.PI)
			{
				dummy.theta += 2 * Math.PI;
			}

			await anime({
				targets: dummy,
				theta,
				phi,
				r: this.distanceFromOrigin,
				duration: 500,
				easing: "easeOutCubic",
				update: () =>
				{
					this.wilson.resizeWorld({
						centerX: dummy.theta,
						centerY: dummy.phi,
						showResetButton: false,
					});
					
					this.sceneOrigin = scaleVector(
						dummy.r,
						normalizedCameraPos
					);
					
					this.needNewFrame = true;
				}
			}).finished;
		}

		this.worldSize = value ? 2.5 : 1.5;

		this.wilson.resizeWorld({
			width: this.worldSize,
			height: this.worldSize,
			centerX: value ? this.theta : 2 * Math.PI - this.theta,
			centerY: value ? this.phi : Math.PI - this.phi,
			minY: 0.001 - this.worldSize / 2,
			maxY: Math.PI - 0.001 + this.worldSize / 2,
			showResetButton: false,
		});

		if (this.lockedOnOrigin !== value)
		{
			this.wilson.setCurrentStateAsDefault();
			this.defaultSceneOrigin = [...this.sceneOrigin];
		}

		this.lockedOnOrigin = value;
	}
}



export function magnitude(vec)
{
	return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
}



export function addVectors(vec1, vec2)
{
	return [vec1[0] + vec2[0], vec1[1] + vec2[1], vec1[2] + vec2[2]];
}

export function scaleVector(c, vec)
{
	return [c * vec[0], c * vec[1], c * vec[2]];
}



export function dotProduct(vec1, vec2)
{
	return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2];
}

export function dotProduct4(vec1, vec2)
{
	return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2] + vec1[3] * vec2[3];
}



export function crossProduct(vec1, vec2)
{
	return [
		vec1[1] * vec2[2] - vec1[2] * vec2[1],
		vec1[2] * vec2[0] - vec1[0] * vec2[2],
		vec1[0] * vec2[1] - vec1[1] * vec2[0]
	];
}



export function matMul(mat1, mat2)
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



export function qmul(x1, y1, z1, w1, x2, y2, z2, w2)
{
	return [
		x1 * x2 - y1 * y2 - z1 * z1 - w1 * w2,
		x1 * y2 + y1 * x2 + z1 * w2 - w1 * z2,
		x1 * z2 - y1 * w2 + z1 * x2 + w1 * y2,
		x1 * w2 + y1 * z2 - z1 * y2 + w1 * x2
	];
}



export function normalize(vec)
{
	const mag = magnitude(vec);

	return [vec[0] / mag, vec[1] / mag, vec[2] / mag];
}



export function getRotationMatrix(thetaX, thetaY, thetaZ)
{
	const cX = Math.cos(thetaX);
	const sX = Math.sin(thetaX);
	const cY = Math.cos(thetaY);
	const sY = Math.sin(thetaY);
	const cZ = Math.cos(thetaZ);
	const sZ = Math.sin(thetaZ);

	const matZ = [
		[cZ, -sZ, 0],
		[sZ, cZ, 0],
		[0, 0, 1]
	];

	const matY = [
		[cY, 0, -sY],
		[0, 1, 0],
		[sY, 0, cY]
	];

	const matX = [
		[1, 0, 0],
		[0, cX, -sX],
		[0, sX, cX]
	];

	return matMul(matMul(matZ, matY), matX);
}

export function mat3TimesVector(mat, vec)
{
	return [
		mat[0][0] * vec[0] + mat[0][1] * vec[1] + mat[0][2] * vec[2],
		mat[1][0] * vec[0] + mat[1][1] * vec[1] + mat[1][2] * vec[2],
		mat[2][0] * vec[0] + mat[2][1] * vec[1] + mat[2][2] * vec[2]
	];
}

// Converts WebXR's y-up internal coorindate system to RaymarchApplet's z-up one;
// i.e. columns (x, y, z) → (−z, −x, y).
function xrToScene(matrix, out)
{
	for (let column = 0; column < 4; column++)
	{
		const i = 4 * column;

		out[i] = -matrix[i + 2];
		out[i + 1] = -matrix[i];
		out[i + 2] =  matrix[i + 1];
		out[i + 3] =  matrix[i + 3];
	}

	return out;
}