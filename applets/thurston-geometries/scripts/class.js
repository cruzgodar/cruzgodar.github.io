import { Applet, getEqualPixelFullScreen, tempShader } from "../../../scripts/applets/applet.js";
import { createShader } from "./createShader.js";
import { SolRooms, SolSpheres } from "./geometries/sol.js";
import anime from "/scripts/anime.js";
import { aspectRatio } from "/scripts/src/layout.js";
import { $, addTemporaryListener } from "/scripts/src/main.js";
import { Wilson } from "/scripts/wilson.js";



const moveFriction = .96;
const moveStopThreshhold = .01;

const rollingFriction = .92;
const rollingStopThreshhold = .01;

export function rotateVectors(vec1, vec2, theta)
{
	const cosine = Math.cos(theta);
	const sine = Math.sin(theta);

	return [
		[
			vec1[0] * cosine + vec2[0] * sine,
			vec1[1] * cosine + vec2[1] * sine,
			vec1[2] * cosine + vec2[2] * sine,
			vec1[3] * cosine + vec2[3] * sine
		],
		[
			-vec1[0] * sine + vec2[0] * cosine,
			-vec1[1] * sine + vec2[1] * cosine,
			-vec1[2] * sine + vec2[2] * cosine,
			-vec1[3] * sine + vec2[3] * cosine
		],
	];
}

function addVectors(vec1, vec2)
{
	return [vec1[0] + vec2[0], vec1[1] + vec2[1], vec1[2] + vec2[2], vec1[3] + vec2[3]];
}

function scaleVector(c, vec)
{
	return [c * vec[0], c * vec[1], c * vec[2], c * vec[3]];
}

export function magnitude(vec)
{
	return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2] + vec[3] * vec[3]);
}

export function normalize(vec)
{
	const mag = magnitude(vec);

	return [vec[0] / mag, vec[1] / mag, vec[2] / mag, vec[3] / mag];
}

export function dotProduct(vec1, vec2)
{
	return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2] + vec1[3] * vec2[3];
}

export function mat4TimesVector(mat, vec)
{
	return [
		mat[0][0] * vec[0]
			+ mat[0][1] * vec[1]
			+ mat[0][2] * vec[2]
			+ mat[0][3] * vec[3],
		
		mat[1][0] * vec[0]
			+ mat[1][1] * vec[1]
			+ mat[1][2] * vec[2]
			+ mat[1][3] * vec[3],
		
		mat[2][0] * vec[0]
			+ mat[2][1] * vec[1]
			+ mat[2][2] * vec[2]
			+ mat[2][3] * vec[3],

		mat[3][0] * vec[0]
			+ mat[3][1] * vec[1]
			+ mat[3][2] * vec[2]
			+ mat[3][3] * vec[3]
	];
}



export class ThurstonGeometry extends Applet
{
	resolution = 500;

	aspectRatioX = 1;
	aspectRatioY = 1;

	fov = Math.tan(100 / 2 * Math.PI / 180);
	fovFactor = 1;

	geometryData;

	// Finally, we handle the rotation of the camera --- we can't bake this in, since otherwise
	// the holonomy of the 2-sphere bites us. We'll allow rotating left and right to affect the
	// base vectors, but rotating up and down affects these only,
	// which finally get passed to the shader.
	rotatedForwardVec;
	rotatedUpVec;
	
	// When false, up and down rotations are immediately baked in,
	// resulting in complete freedom of rotation at the cost of holonomy.
	restrictCamera = true;

	// Moving forward/back, right/left, and up/down
	movingAmount = [0, 0, 0];
	rollingAmount = 0;

	automoving = false;
	automovingDirection = () => [0, 0, 0, 0];
	automovingSpeed = 1;

	movingSubsteps = 1;

	needNewFrame = true;



	constructor({
		canvas,
	}) {
		super(canvas);

		const options =
		{
			renderer: "gpu",

			shader: tempShader,

			canvasWidth: this.resolution,
			canvasHeight: this.resolution,

			worldCenterX: 0,
			worldCenterY: 0,



			useFullscreen: true,

			trueFullscreen: true,

			useFullscreenButton: true,

			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",

			switchFullscreenCallback: () => this.changeResolution(),



			mousedownCallback: this.onGrabCanvas.bind(this),
			touchstartCallback: this.onGrabCanvas.bind(this),

			mousedragCallback: this.onDragCanvas.bind(this),
			touchmoveCallback: this.onDragCanvas.bind(this),

			mouseupCallback: this.onReleaseCanvas.bind(this),
			touchendCallback: this.onReleaseCanvas.bind(this)
		};

		this.wilson = new Wilson(canvas, options);



		const boundFunction = () => this.changeResolution();
		addTemporaryListener({
			object: window,
			event: "resize",
			callback: boundFunction
		});

		this.listenForKeysPressed(
			["w", "s", "a", "d", "q", "e", " ", "shift", "z"],
			(key, pressed) =>
			{
				if (key === "z")
				{
					const dummy = { t: 0 };
					const oldFovFactor = this.fovFactor;
					const newFovFactor = pressed ? .25 : 1;

					anime({
						targets: dummy,
						t: 1,
						duration: 250,
						easing: "easeOutCubic",
						update: () =>
						{
							this.fovFactor = oldFovFactor * (1 - dummy.t) + dummy.t * newFovFactor;

							this.needNewFrame = true;
						}
					});
				}
			});
		this.listenForNumTouches();
	}



	run(geometryData)
	{
		this.geometryData = geometryData;

		this.updateAutomaticMoving = () => {};
		this.movingAmount = [0, 0, 0];

		const posSignature = this.geometryData.usesFiberComponent
			? "vec4 pos, float fiber"
			: "vec4 pos";
		
		const addFiberArgument = this.geometryData.usesFiberComponent ? ", fiber" : "";

		const fragShaderSource = createShader({
			maxMarches: this.geometryData.maxMarches,
			maxT: this.geometryData.maxT,
			stepFactor: this.geometryData.stepFactor,
			uniformGlsl: this.geometryData.uniformGlsl ?? "",
			dotProductGlsl: this.geometryData.dotProductGlsl,
			normalizeGlsl: this.geometryData.normalizeGlsl,
			getNormalVecGlsl: this.geometryData.getNormalVecGlsl,
			functionGlsl: this.geometryData.functionGlsl ?? "",
			posSignature,
			distanceEstimatorGlsl: this.geometryData.distanceEstimatorGlsl,
			getColorGlsl: this.geometryData.getColorGlsl,
			addFiberArgument,
			lightGlsl: this.geometryData.lightGlsl,
			ambientOcclusionDenominator: this.geometryData.ambientOcclusionDenominator,
			doClipBrightening: this.geometryData.doClipBrightening,
			fogGlsl: this.geometryData.fogGlsl,
			raymarchSetupGlsl: this.geometryData.raymarchSetupGlsl ?? "",
			geodesicGlsl: this.geometryData.geodesicGlsl,
			correctPosGlsl: this.geometryData.correctPosGlsl,
			finalTeleportationGlsl: this.geometryData.finalTeleportationGlsl ?? "",
			updateTGlsl: this.geometryData.updateTGlsl,
		});

		setTimeout(() => window.dispatchEvent(new Event("resize")), 16);
		

		
		this.wilson.render.shaderPrograms = [];
		this.wilson.render.loadNewShader(fragShaderSource);
		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]);

		this.wilson.render.initUniforms([
			"aspectRatioX",
			"aspectRatioY",
			"resolution",
			"clipDistance",
			"fov",

			"cameraPos",
			"normalVec",
			"upVec",
			"rightVec",
			"forwardVec",
		].concat(this.geometryData.uniformNames ?? []));

		this.wilson.worldCenterX = 0;
		this.wilson.worldCenterY = 0;
		
		this.lastWorldCenterX = this.wilson.worldCenterX;
		this.lastWorldCenterY = this.wilson.worldCenterY;

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.aspectRatioX,
			1
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.aspectRatioY,
			1
		);

		this.wilson.gl.uniform1i(
			this.wilson.uniforms.resolution,
			this.resolution
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.fov,
			(this.geometryData.fov ?? this.fov) * this.fovFactor
		);

		this.wilson.gl.uniform4fv(
			this.wilson.uniforms.cameraPos,
			this.geometryData.cameraPos
		);

		this.wilson.gl.uniform4fv(
			this.wilson.uniforms.normalVec,
			this.geometryData.normalVec
		);

		this.wilson.gl.uniform4fv(
			this.wilson.uniforms.upVec,
			this.geometryData.upVec
		);
		
		this.wilson.gl.uniform4fv(
			this.wilson.uniforms.rightVec,
			this.geometryData.rightVec
		);
			
		this.wilson.gl.uniform4fv(
			this.wilson.uniforms.forwardVec,
			this.geometryData.forwardVec
		);

		this.resume();
	}

	resume()
	{
		this.needNewFrame = true;
		this.animationPaused = false;

		requestAnimationFrame(this.drawFrame.bind(this));
	}

	drawFrame(timestamp)
	{
		const timeElapsed = timestamp - this.lastTimestamp;

		this.lastTimestamp = timestamp;

		if (timeElapsed === 0)
		{
			return;
		}

		this.geometryData.teleportCamera(
			this.rotatedForwardVec,
			this.recomputeRotation.bind(this)
		);

		this.geometryData.updateUniforms(this.wilson.gl, this.wilson.uniforms);

		this.pan.update(timeElapsed);

		

		if (this.keysPressed.w || this.numTouches === 2)
		{
			this.movingAmount[0] = 1;
		}

		else if (this.keysPressed.s || this.numTouches >= 3)
		{
			this.movingAmount[0] = -1;
		}
		
		if (this.keysPressed.d)
		{
			this.movingAmount[1] = 1;
		}

		else if (this.keysPressed.a)
		{
			this.movingAmount[1] = -1;
		}

		if (this.keysPressed[" "])
		{
			this.movingAmount[2] = 1;
		}

		else if (this.keysPressed.shift)
		{
			this.movingAmount[2] = -1;
		}

		if (this.keysPressed.e)
		{
			this.rollingAmount = 1;
		}

		else if (this.keysPressed.q)
		{
			this.rollingAmount = -1;
		}

		this.updateAutomaticMoving(timeElapsed);

		

		const isMoving = this.movingAmount[0] !== 0
			|| this.movingAmount[1] !== 0
			|| this.movingAmount[2] !== 0;
		
		if (isMoving)
		{
			this.needNewFrame = true;

			if (this.movingAmount[0])
			{
				this.handleMoving(
					[Math.sign(this.movingAmount[0]), 0, 0],
					timeElapsed * Math.abs(this.movingAmount[0])
				);

				this.geometryData.correctVectors();
			}

			if (this.movingAmount[1])
			{
				this.handleMoving(
					[0, Math.sign(this.movingAmount[1]), 0],
					timeElapsed * Math.abs(this.movingAmount[1])
				);

				this.geometryData.correctVectors();
			}

			if (this.movingAmount[2] && !this.geometryData.render1D)
			{
				this.handleMoving(
					[0, 0, Math.sign(this.movingAmount[2])],
					timeElapsed * Math.abs(this.movingAmount[2])
				);
				
				this.geometryData.correctVectors();
			}
			
			for (let i = 0; i < 3; i++)
			{
				this.movingAmount[i] *= moveFriction ** (timeElapsed / 6.944);

				if (Math.abs(this.movingAmount[i]) < moveStopThreshhold)
				{
					this.movingAmount[i] = 0;
				}
			}
		}

		else
		{
			this.movingAmount = [0, 0, 0];
		}

		this.geometryData.correctVectors();

		this.handleRotating();

		this.handleRolling(timeElapsed);



		this.wilson.gl.uniform4fv(
			this.wilson.uniforms.cameraPos,
			this.geometryData.cameraPos
		);

		this.wilson.gl.uniform4fv(
			this.wilson.uniforms.normalVec,
			this.geometryData.normalVec
		);

		this.wilson.gl.uniform4fv(
			this.wilson.uniforms.upVec,
			this.geometryData.render1D ? [0, 0, 0, 0] : this.rotatedUpVec
		);
		
		this.wilson.gl.uniform4fv(
			this.wilson.uniforms.rightVec,
			this.geometryData.rightVec
		);
			
		this.wilson.gl.uniform4fv(
			this.wilson.uniforms.forwardVec,
			this.rotatedForwardVec
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.fov,
			(this.geometryData.fov ?? this.fov) * this.fovFactor
		);

		if (this.needNewFrame)
		{
			this.wilson.render.drawFrame();

			this.geometryData.drawFrameCallback();

			this.needNewFrame = false;
		}

		if (!this.animationPaused)
		{
			requestAnimationFrame(this.drawFrame.bind(this));
		}
	}


	/*
	 * Looking around can't be done relatively
	 * due to the holonomy of S^2, so we store the rotation from unrotated versions of the three
	 * facing vectors. But when moving, we need to *move* in the direction of the rotated vectors,
	 * while at the same time updating the *unrotated* vectors updated due to the curvature of the
	 * space.
	 */
	handleMoving(movingAmount, timeElapsed)
	{
		for (let i = 0; i < this.movingSubsteps; i++)
		{
			const forwardVecToUse = this.rotatedForwardVec;
			
			const tangentVec = this.geometryData.normalize([
				movingAmount[0] * forwardVecToUse[0]
					+ movingAmount[1] * this.geometryData.rightVec[0]
					+ movingAmount[2] * this.geometryData.upVec[0],
				
				movingAmount[0] * forwardVecToUse[1]
					+ movingAmount[1] * this.geometryData.rightVec[1]
					+ movingAmount[2] * this.geometryData.upVec[1],
				
				movingAmount[0] * forwardVecToUse[2]
					+ movingAmount[1] * this.geometryData.rightVec[2]
					+ movingAmount[2] * this.geometryData.upVec[2],
				
				movingAmount[0] * forwardVecToUse[3]
					+ movingAmount[1] * this.geometryData.rightVec[3]
					+ movingAmount[2] * this.geometryData.upVec[3],
			]);

			const dt = timeElapsed / (1000 * this.movingSubsteps)
				* this.geometryData.movingSpeed;

			if (this.automoving)
			{
				this.geometryData.cameraPos = this.geometryData.correctPosition(
					this.geometryData.followGeodesic(
						this.geometryData.cameraPos,
						this.automovingDirection(),
						this.automovingSpeed * dt
					)
				);
			}

			else
			{
				this.geometryData.cameraPos = this.geometryData.correctPosition(
					this.geometryData.followGeodesic(this.geometryData.cameraPos, tangentVec, dt)
				);
			}

			this.geometryData.normalVec = this.geometryData.getNormalVec(
				this.geometryData.cameraPos
			);

			this.geometryData.handleMovingCallback(movingAmount, timeElapsed);
		}
	}



	// When teleporting, we often have the issue that teleporting and rotating the forward vector
	// don't commute, and unfortunately, we want to teleport *then* rotate. To get around this,
	// we'll comute what the new rotation should be when teleporting.
	recomputeRotation(newRotatedForwardVec)
	{
		const normalizedForwardVec = scaleVector(
			1 / magnitude(this.geometryData.forwardVec),
			this.geometryData.forwardVec
		);

		const normalizedUpVec = scaleVector(
			1 / magnitude(this.geometryData.upVec),
			this.geometryData.upVec
		);

		// First, get a vector orthogonal to the forward vector.
		const orthogonalToForwardVec = addVectors(
			normalizedUpVec,
			scaleVector(
				-dotProduct(normalizedForwardVec, normalizedUpVec),
				normalizedForwardVec
			)
		);

		// The rotated forward vector is cos(t) forward + sin(t) up.
		// We'll dot this with the vector orthogonal to the forward one.
		const angle = Math.asin(
			dotProduct(newRotatedForwardVec, orthogonalToForwardVec)
			/ (dotProduct(this.geometryData.upVec, orthogonalToForwardVec))
		);
		
		this.wilson.worldCenterY = angle;

		this.handleRotating();
	}


	lastWorldCenterY = 0;

	handleRotating()
	{
		const sign = this.geometryData.lockedOnOrigin ? -1 : 1;

		if (this.geometryData.render1D)
		{
			this.wilson.worldCenterY = 0;
		}

		if (this.wilson.worldCenterX !== 0 || this.wilson.worldCenterY !== this.lastWorldCenterY)
		{
			this.needNewFrame = true;
		}

		this.lastWorldCenterY = this.wilson.worldCenterY;

		this.wilson.worldCenterY = Math.min(
			Math.max(this.wilson.worldCenterY, -Math.PI / 2 + .01),
			Math.PI / 2 - .01
		);

		const result = rotateVectors(
			this.geometryData.forwardVec,
			this.geometryData.rightVec,
			sign * this.wilson.worldCenterX
		);

		// Left/right rotation is allowed to be baked in to the underlying vectors.

		this.geometryData.forwardVec = result[0];
		this.geometryData.rightVec = result[1];

		this.wilson.worldCenterX = 0;

		const result2 = rotateVectors(
			this.geometryData.forwardVec,
			this.geometryData.upVec,
			sign * this.wilson.worldCenterY
		);

		this.rotatedForwardVec = result2[0];
		this.rotatedUpVec = result2[1];

		if (!this.restrictCamera)
		{
			this.wilson.worldCenterY = 0;

			this.geometryData.forwardVec = result2[0];
			this.geometryData.upVec = result2[1];
			this.rotatedForwardVec = result2[0];
			this.rotatedUpVec = result2[1];
		}

		if (this.geometryData.lockedOnOrigin)
		{
			this.geometryData.cameraPos = scaleVector(
				-2.5,
				this.rotatedForwardVec
			);

			this.geometryData.cameraPos[3] = 1;
		}
	}

	handleRolling(timeElapsed)
	{
		if (
			!this.rollingAmount
			|| this.geometryData.render1D
			|| this.automoving
		) {
			return;
		}
	
		this.needNewFrame = true;

		if (this.wilson.worldCenterY)
		{
			this.wilson.worldCenterY = 0;
			this.geometryData.upVec = [...this.rotatedUpVec];
			this.geometryData.forwardVec = [...this.rotatedForwardVec];
		}
		
		const angle = timeElapsed * this.rollingAmount * .0015;

		[this.geometryData.rightVec, this.geometryData.upVec] = rotateVectors(
			this.geometryData.rightVec,
			this.geometryData.upVec,
			angle
		);

		this.rotatedUpVec = [...this.geometryData.upVec];

		this.rollingAmount *= rollingFriction ** (timeElapsed / 6.944);

		if (Math.abs(this.rollingAmount) < rollingStopThreshhold)
		{
			this.rollingAmount = 0;
		}
	}

	changeResolution(resolution = this.resolution)
	{
		this.resolution = resolution;

		let imageWidth, imageHeight;

		if (this.wilson.fullscreen.currentlyFullscreen)
		{
			[imageWidth, imageHeight] = getEqualPixelFullScreen(resolution);

			this.wilson.worldWidth = Math.max(2, 2 * aspectRatio);
			this.wilson.worldHeight = Math.max(2, 2 / aspectRatio);
		}

		else if (this.geometryData?.aspectRatio)
		{
			imageWidth = Math.min(
				this.resolution,
				Math.floor(this.resolution * this.geometryData.aspectRatio)
			);

			imageHeight = Math.min(
				this.resolution,
				Math.floor(this.resolution / this.geometryData.aspectRatio)
			);

			if (this.geometryData.ignoreAspectRatio)
			{
				this.wilson.worldWidth = 2;
				this.wilson.worldHeight = 2;
			}

			else
			{
				this.wilson.worldWidth = 2 * Math.max(this.geometryData.aspectRatio, 1);
				this.wilson.worldHeight = 2 / Math.min(this.geometryData.aspectRatio, 1);
			}
		}

		else
		{
			imageWidth = this.resolution;
			imageHeight = this.resolution;
		}



		this.wilson.changeCanvasSize(imageWidth, imageHeight);



		if (this.geometryData?.ignoreAspectRatio)
		{
			this.aspectRatioX = 1;
			this.aspectRatioY = 1;
		}

		else if (imageWidth >= imageHeight)
		{
			this.aspectRatioX = imageWidth / imageHeight;
			this.aspectRatioY = 1;
		}

		else
		{
			this.aspectRatioX = 1;
			this.aspectRatioY = imageWidth / imageHeight;
		}

		this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX, this.aspectRatioX);
		this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY, this.aspectRatioY);

		this.wilson.gl.uniform1i(this.wilson.uniforms.resolution, this.resolution);

		this.needNewFrame = true;
	}

	moveForever({
		speed = 1,
		direction = () => [1, 0, 0, 0],
		rampStart = false,
	} = {}) {
		let totalTimeElapsed = 0;

		this.movingAmount = [0, 0, 0];
		this.automovingDirection = direction;
		this.automoving = true;
		this.automovingSpeed = speed;

		setTimeout(() =>
		{
			this.updateAutomaticMoving = (timeElapsed) =>
			{
				if (!this.automoving)
				{
					return;
				}

				totalTimeElapsed += timeElapsed;
				
				this.movingAmount = [speed, 0, 0];

				if (rampStart)
				{
					this.movingAmount[0] *= Math.min(totalTimeElapsed / 500, 1);
				}
			};
		}, 16);
	}



	async switchScene({
		newCameraPosOverride,
		duration = 500
	} = {}) {
		if (this.geometryData instanceof SolRooms)
		{
			await anime({
				targets: this.canvas,
				opacity: 0,
				duration: duration / 2,
				easing: "easeOutQuad"
			}).finished;

			const geometryData = new SolSpheres();
			geometryData.aspectRatio = this.geometryData.aspectRatio;
			this.run(geometryData);

			try { $("#wall-thickness-slider").parentNode.style.display = "none"; }
			// eslint-disable-next-line no-unused-vars
			catch(_ex) { /* Element doesn't exist */ }

			anime({
				targets: this.canvas,
				opacity: 1,
				duration: duration / 2,
				easing: "easeOutQuad",
			}).finished;

			return;
		}

		if (this.geometryData instanceof SolSpheres)
		{
			await anime({
				targets: this.canvas,
				opacity: 0,
				duration: duration / 2,
				easing: "easeOutQuad"
			}).finished;

			const geometryData = new SolRooms();
			geometryData.aspectRatio = this.geometryData.aspectRatio;
			geometryData.sliderValues.wallThickness = .3;
			this.run(geometryData);

			try { $("#wall-thickness-slider").parentNode.style.display = ""; }
			// eslint-disable-next-line no-unused-vars
			catch(_ex) { /* Element doesn't exist */ }

			anime({
				targets: this.canvas,
				opacity: 1,
				duration: duration / 2,
				easing: "easeOutQuad",
			}).finished;

			return;
		}

		const isRooms = this.geometryData.sliderValues.sceneTransition === 0;

		const oldSceneTransition = this.geometryData.sliderValues.sceneTransition;
		const newSceneTransition = isRooms ? 1 : 0;

		const newCameraPos = newCameraPosOverride ?? (
			newSceneTransition
				? this.geometryData.getNearestCorner()
				: this.geometryData.getNearestCenter()
		);

		this.moveCameraTo({
			newCameraPos,
			duration
		});

		const dummy = { t: 0 };

		anime({
			targets: dummy,
			t: 1,
			duration,
			easing: "easeInOutQuad",
			update: () =>
			{
				this.geometryData.sliderValues.sceneTransition =
					(1 - dummy.t) * oldSceneTransition + dummy.t * newSceneTransition;
			},
			complete: () =>
			{
				dummy.t = 1;

				this.geometryData.sliderValues.sceneTransition =
					(1 - dummy.t) * oldSceneTransition + dummy.t * newSceneTransition;
			}
		});
	}



	async moveCameraTo({
		newCameraPos,
		duration
	}) {
		const oldCameraPos = [...this.geometryData.cameraPos];

		const dummy = { t: 0 };
		let oldT = 0;
		
		// Extreme measures, but this ensures that the vectors don't desync while moving.
		const numSubSteps = 60;

		await anime({
			targets: dummy,
			t: 1,
			duration,
			easing: "easeInOutSine",
			update: () =>
			{
				for (let i = 0; i < numSubSteps; i++)
				{
					const t = oldT + (dummy.t - oldT) * i / numSubSteps;

					this.geometryData.cameraPos = this.geometryData.correctPosition(
						[
							(1 - t) * oldCameraPos[0] + t * newCameraPos[0],
							(1 - t) * oldCameraPos[1] + t * newCameraPos[1],
							(1 - t) * oldCameraPos[2] + t * newCameraPos[2],
							(1 - t) * oldCameraPos[3] + t * newCameraPos[3]
						]
					);

					this.geometryData.normalVec = this.geometryData.getNormalVec(
						this.geometryData.cameraPos
					);

					this.geometryData.correctVectors();

					this.handleRotating();
				}

				this.needNewFrame = true;

				oldT = dummy.t;
			},
			complete: () =>
			{
				this.geometryData.cameraPos = this.geometryData.correctPosition(newCameraPos);

				this.geometryData.normalVec = this.geometryData.getNormalVec(
					this.geometryData.cameraPos
				);

				this.geometryData.correctVectors();

				this.handleRotating();

				this.needNewFrame = true;
			}
		}).finished;
	}
}