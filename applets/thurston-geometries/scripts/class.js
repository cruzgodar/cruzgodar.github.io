import { Applet } from "../../../scripts/applets/applet.js";
import { SolRooms, SolSpheres } from "./geometries/sol.js";
import anime from "/scripts/anime.js";
import { aspectRatio } from "/scripts/src/layout.js";
import { $, addTemporaryListener } from "/scripts/src/main.js";
import { Wilson } from "/scripts/wilson.js";

export const makeAnimation = false;
const animationInitialResolution = 38;
const animationResolution = 3840;
const animationAspectRatio = 16 / 9;

const animationWaitTime = 1000;
let animationFrame = -1;
const animationStartFrame = 0;

const animationMovingSpeed = 0.001;
const animationMovingDirection = [0.54025, 0.8415, 0, 0];

export class ThurstonGeometry extends Applet
{
	resolution = 500;

	aspectRatioX = 1;
	aspectRatioY = 1;

	fov = Math.tan(100 / 2 * Math.PI / 180);

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

		const tempShader = /* glsl */`
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

		this.listenForKeysPressed(["w", "s", "a", "d", "q", "e", " ", "shift"]);
		this.listenForNumTouches();
	}



	run(geometryData)
	{
		this.geometryData = geometryData;

		this.updateAutomaticMoving = () => {};
		this.movingAmount = [0, 0, 0];

		if (makeAnimation)
		{
			geometryData.aspectRatio = animationAspectRatio;
			this.changeResolution(animationInitialResolution);

			this.moveForever({
				speed: animationMovingSpeed,
				direction: () => animationMovingDirection,
				rampStart: false
			});
		}

		const posSignature = this.geometryData.usesFiberComponent
			? "vec4 pos, float fiber"
			: "vec4 pos";
		
		const addfiberArgument = this.geometryData.usesFiberComponent ? ", fiber" : "";

		const fragShaderSource = /* glsl */`
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatioX;
			uniform float aspectRatioY;
			
			uniform vec4 cameraPos;
			uniform vec4 normalVec;
			uniform vec4 upVec;
			uniform vec4 rightVec;
			uniform vec4 forwardVec;
			
			uniform int resolution;
			
			const float pi = ${Math.PI};
			const float epsilon = 0.00001;
			const int maxMarches = ${this.geometryData.maxMarches};
			const float maxT = ${this.geometryData.maxT};
			const float stepFactor = ${this.geometryData.stepFactor};
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .05;
			uniform float fov;

			${this.geometryData.uniformGlsl ?? ""}

			float geometryDot(vec4 v, vec4 w)
			{
				${this.geometryData.dotProductGlsl}
			}

			vec4 geometryNormalize(vec4 dir)
			{
				${this.geometryData.normalizeGlsl}
			}

			${this.geometryData.functionGlsl ?? ""}



			float getBanding(float amount, float numBands)
			{
				return 1.0 - floor(mod(abs(amount) * numBands, 2.0)) * 0.5;
			}

			vec3 hsv2rgb(vec3 c)
			{
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}
			
			
			
			float distanceEstimator(${posSignature})
			{
				${this.geometryData.distanceEstimatorGlsl}
			}
			
			vec3 getColor(${posSignature}, vec3 globalColor)
			{
				${this.geometryData.getColorGlsl}
			}
			
			
			
			vec4 getSurfaceNormal(${posSignature})
			{
				float xStep1 = distanceEstimator(pos + vec4(epsilon, 0.0, 0.0, 0.0)${addfiberArgument});
				float yStep1 = distanceEstimator(pos + vec4(0.0, epsilon, 0.0, 0.0)${addfiberArgument});
				float zStep1 = distanceEstimator(pos + vec4(0.0, 0.0, epsilon, 0.0)${addfiberArgument});
				float wStep1 = distanceEstimator(pos + vec4(0.0, 0.0, 0.0, epsilon)${addfiberArgument});
				
				float xStep2 = distanceEstimator(pos - vec4(epsilon, 0.0, 0.0, 0.0)${addfiberArgument});
				float yStep2 = distanceEstimator(pos - vec4(0.0, epsilon, 0.0, 0.0)${addfiberArgument});
				float zStep2 = distanceEstimator(pos - vec4(0.0, 0.0, epsilon, 0.0)${addfiberArgument});
				float wStep2 = distanceEstimator(pos - vec4(0.0, 0.0, 0.0, epsilon)${addfiberArgument});
				
				return normalize(vec4(
					xStep1 - xStep2,
					yStep1 - yStep2,
					zStep1 - zStep2,
					wStep1 - wStep2
				));
			}
			
			
			
			vec3 computeShading(${posSignature}, int iteration, vec3 globalColor, float totalT)
			{
				vec4 surfaceNormal = getSurfaceNormal(pos${addfiberArgument});
				
				${this.geometryData.lightGlsl}

				//The last factor adds ambient occlusion.
				vec3 color = getColor(pos${addfiberArgument}, globalColor)
					* lightIntensity
					* max(
						1.0 - float(iteration) / ${this.geometryData.ambientOcclusionDenominator},
						0.0)
					;

				//Apply fog.
				${this.geometryData.fogGlsl}
			}
			
			
			
			vec3 raymarch(float u, float v)
			{
				vec4 rayDirectionVec = geometryNormalize(
					forwardVec
					+ rightVec * u * aspectRatioX * fov
					+ upVec * v / aspectRatioY * fov
				);

				vec3 finalColor = fogColor;
				
				float t = 0.0;
				float totalT = 0.0;
				
				float lastTIncrease = 0.0;

				vec4 startPos = cameraPos;

				vec3 globalColor = vec3(0.0, 0.0, 0.0);

				${this.geometryData.raymarchSetupGlsl ?? ""}
				
				for (int iteration = 0; iteration < maxMarches; iteration++)
				{
					${this.geometryData.geodesicGlsl}
					
					float distanceToScene = distanceEstimator(pos${addfiberArgument});
					
					if (distanceToScene < epsilon)
					{
						${this.geometryData.finalTeleportationGlsl ?? ""}
						
						return computeShading(pos${addfiberArgument}, iteration, globalColor, totalT);
					}

					${this.geometryData.updateTGlsl}

					if (t > maxT || totalT > maxT)
					{
						return fogColor;
					}
				}
				
				return fogColor;
			}
			
			
			
			void main(void)
			{
				// float stepSize = 0.5 / 4000.0;

				// gl_FragColor = vec4(
				// 	.25 * (
				// 		raymarch(uv.x - stepSize, uv.y - stepSize)
				// 		+ raymarch(uv.x - stepSize, uv.y + stepSize)
				// 		+ raymarch(uv.x + stepSize, uv.y - stepSize)
				// 		+ raymarch(uv.x + stepSize, uv.y + stepSize)
				// 	),
				// 	1.0
				// );

				gl_FragColor = vec4(
					raymarch(uv.x, uv.y),
					1.0
				);
			}
		`;

		if (window.DEBUG)
		{
			console.log(fragShaderSource);
		}

		setTimeout(() => window.dispatchEvent(new Event("resize")), 16);
		

		
		this.wilson.render.shaderPrograms = [];
		this.wilson.render.loadNewShader(fragShaderSource);
		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]);

		this.wilson.render.initUniforms([
			"aspectRatioX",
			"aspectRatioY",
			"resolution",
			"fov",

			"cameraPos",
			"normalVec",
			"upVec",
			"rightVec",
			"forwardVec"
		].concat(this.geometryData.uniformNames ?? []));

		this.wilson.worldCenterX = 0;
		this.wilson.worldCenterY = 0;
		
		this.lastWorldCenterX = this.wilson.worldCenterX;
		this.lastWorldCenterY = this.wilson.worldCenterY;

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["aspectRatioX"],
			1
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["aspectRatioY"],
			1
		);

		this.wilson.gl.uniform1i(
			this.wilson.uniforms["resolution"],
			this.resolution
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["fov"],
			this.geometryData.fov ?? this.fov
		);

		this.wilson.gl.uniform4fv(
			this.wilson.uniforms["cameraPos"],
			this.geometryData.cameraPos
		);

		this.wilson.gl.uniform4fv(
			this.wilson.uniforms["normalVec"],
			this.geometryData.normalVec
		);

		this.wilson.gl.uniform4fv(
			this.wilson.uniforms["upVec"],
			this.geometryData.upVec
		);
		
		this.wilson.gl.uniform4fv(
			this.wilson.uniforms["rightVec"],
			this.geometryData.rightVec
		);
			
		this.wilson.gl.uniform4fv(
			this.wilson.uniforms["forwardVec"],
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
				this.movingAmount[i] *= ThurstonGeometry.moveFriction ** (timeElapsed / 6.944);

				if (Math.abs(this.movingAmount[i]) < ThurstonGeometry.moveStopThreshhold)
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
			this.wilson.uniforms["cameraPos"],
			this.geometryData.cameraPos
		);

		this.wilson.gl.uniform4fv(
			this.wilson.uniforms["normalVec"],
			this.geometryData.normalVec
		);

		this.wilson.gl.uniform4fv(
			this.wilson.uniforms["upVec"],
			this.geometryData.render1D ? [0, 0, 0, 0] : this.rotatedUpVec
		);
		
		this.wilson.gl.uniform4fv(
			this.wilson.uniforms["rightVec"],
			this.geometryData.rightVec
		);
			
		this.wilson.gl.uniform4fv(
			this.wilson.uniforms["forwardVec"],
			this.rotatedForwardVec
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["fov"],
			this.geometryData.fov ?? this.fov
		);

		if (this.needNewFrame)
		{
			this.wilson.render.drawFrame();

			this.geometryData.drawFrameCallback();

			this.needNewFrame = false;
		}

		if (!this.animationPaused)
		{
			if (makeAnimation)
			{
				if (animationFrame >= animationStartFrame && animationFrame >= 0)
				{
					this.canvas.toBlob(blob =>
					{
						const link = document.createElement("a");

						link.download = String(animationFrame).padStart(5, "0") + ".png";

						link.href = window.URL.createObjectURL(blob);

						link.click();

						link.remove();
					});

					setTimeout(
						() => requestAnimationFrame(this.drawFrame.bind(this)),
						animationWaitTime
					);
				}

				else
				{
					requestAnimationFrame(this.drawFrame.bind(this));

					console.log(animationFrame);
				}

				animationFrame++;

				if (animationFrame === animationStartFrame)
				{
					this.changeResolution(animationResolution);
				}
			}

			else
			{
				requestAnimationFrame(this.drawFrame.bind(this));
			}
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
						this.automovingSpeed * (makeAnimation ? 1 : dt)
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
		const normalizedForwardVec = ThurstonGeometry.scaleVector(
			1 / ThurstonGeometry.magnitude(this.geometryData.forwardVec),
			this.geometryData.forwardVec
		);

		const normalizedUpVec = ThurstonGeometry.scaleVector(
			1 / ThurstonGeometry.magnitude(this.geometryData.upVec),
			this.geometryData.upVec
		);

		// First, get a vector orthogonal to the forward vector.
		const orthogonalToForwardVec = ThurstonGeometry.addVectors(
			normalizedUpVec,
			ThurstonGeometry.scaleVector(
				-ThurstonGeometry.dotProduct(normalizedForwardVec, normalizedUpVec),
				normalizedForwardVec
			)
		);

		// The rotated forward vector is cos(t) forward + sin(t) up.
		// We'll dot this with the vector orthogonal to the forward one.
		const angle = Math.asin(
			ThurstonGeometry.dotProduct(newRotatedForwardVec, orthogonalToForwardVec)
			/ (ThurstonGeometry.dotProduct(this.geometryData.upVec, orthogonalToForwardVec))
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

		const result = ThurstonGeometry.rotateVectors(
			this.geometryData.forwardVec,
			this.geometryData.rightVec,
			sign * this.wilson.worldCenterX
		);

		// Left/right rotation is allowed to be baked in to the underlying vectors.

		this.geometryData.forwardVec = result[0];
		this.geometryData.rightVec = result[1];

		this.wilson.worldCenterX = 0;

		const result2 = ThurstonGeometry.rotateVectors(
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
			this.geometryData.cameraPos = ThurstonGeometry.scaleVector(
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

		[this.geometryData.rightVec, this.geometryData.upVec] = ThurstonGeometry.rotateVectors(
			this.geometryData.rightVec,
			this.geometryData.upVec,
			angle
		);

		this.rotatedUpVec = [...this.geometryData.upVec];

		this.rollingAmount *= ThurstonGeometry.rollingFriction ** (timeElapsed / 6.944);

		if (Math.abs(this.rollingAmount) < ThurstonGeometry.rollingStopThreshhold)
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
			[imageWidth, imageHeight] = Applet.getEqualPixelFullScreen(resolution);

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

		this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatioX"], this.aspectRatioX);
		this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatioY"], this.aspectRatioY);

		this.wilson.gl.uniform1i(this.wilson.uniforms["resolution"], this.resolution);

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
			catch(ex) { /* Element doesn't exist */ }

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
			catch(ex) { /* Element doesn't exist */ }

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

		await anime({
			targets: dummy,
			t: 1,
			duration,
			easing: "easeInOutSine",
			update: () =>
			{
				this.geometryData.cameraPos = this.geometryData.correctPosition(
					[
						(1 - dummy.t) * oldCameraPos[0] + dummy.t * newCameraPos[0],
						(1 - dummy.t) * oldCameraPos[1] + dummy.t * newCameraPos[1],
						(1 - dummy.t) * oldCameraPos[2] + dummy.t * newCameraPos[2],
						(1 - dummy.t) * oldCameraPos[3] + dummy.t * newCameraPos[3]
					]
				);

				this.geometryData.normalVec = this.geometryData.getNormalVec(
					this.geometryData.cameraPos
				);

				this.geometryData.correctVectors();

				this.needNewFrame = true;
			},
			complete: () =>
			{
				dummy.t = 1;
				this.geometryData.cameraPos = this.geometryData.correctPosition(
					[
						(1 - dummy.t) * oldCameraPos[0] + dummy.t * newCameraPos[0],
						(1 - dummy.t) * oldCameraPos[1] + dummy.t * newCameraPos[1],
						(1 - dummy.t) * oldCameraPos[2] + dummy.t * newCameraPos[2],
						(1 - dummy.t) * oldCameraPos[3] + dummy.t * newCameraPos[3]
					]
				);

				this.geometryData.normalVec = this.geometryData.getNormalVec(
					this.geometryData.cameraPos
				);

				this.geometryData.correctVectors();

				this.needNewFrame = true;
			}
		}).finished;
	}



	static moveFriction = .96;
	static moveStopThreshhold = .01;

	static rollingFriction = .92;
	static rollingStopThreshhold = .01;

	static rotateVectors(vec1, vec2, theta)
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

	static addVectors(vec1, vec2)
	{
		return [vec1[0] + vec2[0], vec1[1] + vec2[1], vec1[2] + vec2[2], vec1[3] + vec2[3]];
	}

	static scaleVector(c, vec)
	{
		return [c * vec[0], c * vec[1], c * vec[2], c * vec[3]];
	}

	static magnitude(vec)
	{
		return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2] + vec[3] * vec[3]);
	}

	static normalize(vec)
	{
		const mag = ThurstonGeometry.magnitude(vec);

		return [vec[0] / mag, vec[1] / mag, vec[2] / mag, vec[3] / mag];
	}

	static dotProduct(vec1, vec2)
	{
		return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2] + vec1[3] * vec2[3];
	}

	static crossProduct(vec1, vec2)
	{
		return [
			vec1[1] * vec2[2] - vec1[2] * vec2[1],
			vec1[2] * vec2[0] - vec1[0] * vec2[2],
			vec1[0] * vec2[1] - vec1[1] * vec2[0]
		];
	}

	static mat3TimesVector(mat, vec)
	{
		return [
			mat[0][0] * vec[0]
				+ mat[0][1] * vec[1]
				+ mat[0][2] * vec[2],
			
			mat[1][0] * vec[0]
				+ mat[1][1] * vec[1]
				+ mat[1][2] * vec[2],
			
			mat[2][0] * vec[0]
				+ mat[2][1] * vec[1]
				+ mat[2][2] * vec[2]
		];
	}

	static mat4TimesVector(mat, vec)
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
}