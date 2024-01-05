import { Applet } from "/scripts/src/applets.mjs";
import { aspectRatio } from "/scripts/src/layout.mjs";
import { addTemporaryListener } from "/scripts/src/main.mjs";
import { Wilson } from "/scripts/wilson.mjs";

export class ThurstonGeometry extends Applet
{
	resolution = 500;

	aspectRatioX = 1;
	aspectRatioY = 1;

	fov = 1.15;

	geometryData;

	//Finally, we handle the rotation of the camera --- we can't bake this in, since otherwise
	//the holonomy of the 2-sphere bites us. We'll allow rotating left and right to affect the
	//base vectors, but rotating up and down affects these only,
	//which finally get passed to the shader.
	rotatedForwardVec;
	rotatedUpVec;

	//Moving forward/back, right/left, and up/down
	movingAmount = [0, 0, 0];
	rollingAmount = 0;

	keysPressed = {
		"w": false,
		"a": false,
		"s": false,
		"d": false,
		" ": false,
		"Shift": false,
		"e": false,
		"q": false,
	};

	numTouches = 0;

	movingSubsteps = 4;



	constructor({
		canvas,
	})
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

		const boundFunction2 = this.handleKeydownEvent.bind(this);
		addTemporaryListener({
			object: document.documentElement,
			event: "keydown",
			callback: boundFunction2
		});

		const boundFunction3 = this.handleKeyupEvent.bind(this);
		addTemporaryListener({
			object: document.documentElement,
			event: "keyup",
			callback: boundFunction3
		});

		const boundFunction4 = this.handleTouchEvent.bind(this);
		addTemporaryListener({
			object: canvas.parentNode.nextElementSibling,
			event: "touchstart",
			callback: boundFunction4
		});
		addTemporaryListener({
			object: canvas.parentNode.nextElementSibling,
			event: "touchend",
			callback: boundFunction4
		});
	}



	run(geometryData)
	{
		this.geometryData = geometryData;

		const fragShaderSource = `
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

			const float lightBrightness = 1.0;
			
			const float epsilon = 0.00001;
			const int maxMarches = 100;
			const float stepFactor = .99;
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .07;
			uniform float fov;

			${this.geometryData.uniformGlsl ?? ""}

			${this.geometryData.functionGlsl ?? ""}



			float geometryDot(vec4 v, vec4 w)
			{
				${this.geometryData.dotProductGlsl}
			}

			vec4 geometryNormalize(vec4 dir)
			{
				${this.geometryData.normalizeGlsl}
			}



			float getBanding(float amount, float numBands)
			{
				return 1.0 - floor(mod(amount * numBands, 2.0)) / 2.0;
			}
			
			
			
			float distanceEstimator(vec4 pos)
			{
				${this.geometryData.distanceEstimatorGlsl}
			}
			
			vec3 getColor(vec4 pos, vec3 globalColor)
			{
				${this.geometryData.getColorGlsl}
			}
			
			
			
			vec4 getSurfaceNormal(vec4 pos)
			{
				float xStep1 = distanceEstimator(pos + vec4(epsilon, 0.0, 0.0, 0.0));
				float yStep1 = distanceEstimator(pos + vec4(0.0, epsilon, 0.0, 0.0));
				float zStep1 = distanceEstimator(pos + vec4(0.0, 0.0, epsilon, 0.0));
				float wStep1 = distanceEstimator(pos + vec4(0.0, 0.0, 0.0, epsilon));
				
				float xStep2 = distanceEstimator(pos - vec4(epsilon, 0.0, 0.0, 0.0));
				float yStep2 = distanceEstimator(pos - vec4(0.0, epsilon, 0.0, 0.0));
				float zStep2 = distanceEstimator(pos - vec4(0.0, 0.0, epsilon, 0.0));
				float wStep2 = distanceEstimator(pos - vec4(0.0, 0.0, 0.0, epsilon));
				
				return normalize(vec4(
					xStep1 - xStep2,
					yStep1 - yStep2,
					zStep1 - zStep2,
					wStep1 - wStep2
				));
			}
			
			
			
			vec3 computeShading(vec4 pos, int iteration, vec3 globalColor, float totalT)
			{
				vec4 surfaceNormal = getSurfaceNormal(pos);
				
				${this.geometryData.lightGlsl}

				//The last factor adds ambient occlusion.
				vec3 color = getColor(pos, globalColor)
					* lightIntensity
					* max((1.0 - float(iteration) / float(maxMarches)), 0.0);

				//Apply fog.
				${this.geometryData.fogGlsl}
			}
			
			
			
			vec3 raymarch(vec4 rayDirectionVec)
			{
				vec3 finalColor = fogColor;
				
				float t = 0.0;
				float totalT = 0.0;

				vec4 startPos = cameraPos;

				vec3 globalColor = vec3(0.0, 0.0, 0.0);

				${this.geometryData.raymarchSetupGlsl ?? ""}
				
				for (int iteration = 0; iteration < maxMarches; iteration++)
				{
					${this.geometryData.geodesicGlsl}
					
					float distance = distanceEstimator(pos);
					
					if (distance < epsilon)
					{
						finalColor = computeShading(pos, iteration, globalColor, totalT);
						break;
					}

					${this.geometryData.updateTGlsl}
				}
				
				return finalColor;
			}
			
			
			
			void main(void)
			{
				gl_FragColor = vec4(
					raymarch(
						geometryNormalize(
							forwardVec
							+ rightVec * uv.x * aspectRatioX * fov
							+ upVec * uv.y / aspectRatioY * fov
						)
					),
					1.0
				);
			}
		`;

		

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
			"forwardVec",
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
			this.fov
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



		window.requestAnimationFrame(this.drawFrame.bind(this));
	}



	drawFrame(timestamp)
	{
		const timeElapsed = timestamp - this.lastTimestamp;

		this.lastTimestamp = timestamp;

		if (timeElapsed === 0)
		{
			return;
		}

		this.geometryData.teleportCamera(this.rotatedForwardVec, this.recomputeRotation.bind(this));

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

		else if (this.keysPressed.Shift)
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



		const totalMovingAmount = this.movingAmount[0] !== 0
			+ this.movingAmount[1] !== 0
			+ this.movingAmount[2] !== 0;

		if (totalMovingAmount)
		{
			const speedAdjust = 1 / totalMovingAmount;

			if (this.movingAmount[0])
			{
				this.handleMoving(
					[Math.sign(this.movingAmount[0]), 0, 0],
					timeElapsed * speedAdjust * Math.abs(this.movingAmount[0])
				);

				this.geometryData.correctVectors();
			}

			if (this.movingAmount[1])
			{
				this.handleMoving(
					[0, Math.sign(this.movingAmount[1]), 0],
					timeElapsed * speedAdjust * Math.abs(this.movingAmount[1])
				);

				this.geometryData.correctVectors();
			}

			if (this.movingAmount[2])
			{
				this.handleMoving(
					[0, 0, Math.sign(this.movingAmount[2])],
					timeElapsed * speedAdjust * Math.abs(this.movingAmount[2])
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

		this.geometryData.correctVectors();

		this.handleRotating();

		if (this.rollingAmount)
		{
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

			this.rollingAmount *= ThurstonGeometry.rollingFriction ** (timeElapsed / 6.944);

			if (Math.abs(this.rollingAmount) < ThurstonGeometry.rollingStopThreshhold)
			{
				this.rollingAmount = 0;
			}
		}



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
			this.rotatedUpVec
		);
		
		this.wilson.gl.uniform4fv(
			this.wilson.uniforms["rightVec"],
			this.geometryData.rightVec
		);
			
		this.wilson.gl.uniform4fv(
			this.wilson.uniforms["forwardVec"],
			this.rotatedForwardVec
		);

		this.wilson.render.drawFrame();



		if (!this.animationPaused)
		{
			window.requestAnimationFrame(this.drawFrame.bind(this));
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
				* this.geometryData.getMovingSpeed(this.geometryData.cameraPos);



			//The magic formula is T' = curvature * N.
			// const curvature = this.getCurvature(this.geometryData.cameraPos, tangentVec);

			const newCameraPos = this.geometryData.followGeodesic(
				this.geometryData.cameraPos,
				tangentVec,
				dt
			);

			this.geometryData.cameraPos = newCameraPos;

			this.geometryData.normalVec = this.geometryData.getNormalVec(
				this.geometryData.cameraPos
			);
		}
	}



	parallelTransport(newCameraPos, vecToTransport)
	{
		const dt = 1;

		//In the terminology of Schild's ladder,
		//A = this.geometryData.cameraPos, and we need to find X_0.
		const x0 = this.geometryData.followGeodesic(
			this.geometryData.cameraPos,
			vecToTransport,
			dt
		);

		//Now we need to construct a geodesic between x0 and the updated cameraPosition.
		const magnitude = this.geometryData.getGeodesicDistance(x0, newCameraPos);
		const dir = this.geometryData.getGeodesicDirection(x0, newCameraPos, magnitude);

		//Now find the point halfway there.
		const p = this.geometryData.followGeodesic(x0, dir, magnitude / 2);

		//Construct a geodesic between the original camera position and this point.
		const magnitude2 = this.geometryData.getGeodesicDistance(this.geometryData.cameraPos, p);

		const dir2 = this.geometryData.getGeodesicDirection(
			this.geometryData.cameraPos,
			p,
			magnitude2
		);

		//Follow that twice as far.
		const x1 = this.geometryData.followGeodesic(
			this.geometryData.cameraPos,
			dir2,
			magnitude2 * 2
		);

		//Now at long last, construct the geodesic from te new camera position to this point.
		const magnitude3 = this.geometryData.getGeodesicDistance(newCameraPos, x1);

		const dir3 = this.geometryData.getGeodesicDirection(newCameraPos, x1, magnitude3);

		return dir3;
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



	handleRotating()
	{
		this.wilson.worldCenterY = Math.min(
			Math.max(this.wilson.worldCenterY, -Math.PI / 2 + .01),
			Math.PI / 2 - .01
		);

		const result = ThurstonGeometry.rotateVectors(
			this.geometryData.forwardVec,
			this.geometryData.rightVec,
			this.wilson.worldCenterX
		);

		//Left/right rotation is allowed to be baked in to the underlying vectors.

		this.geometryData.forwardVec = result[0];
		this.geometryData.rightVec = result[1];

		this.wilson.worldCenterX = 0;

		const result2 = ThurstonGeometry.rotateVectors(
			this.geometryData.forwardVec,
			this.geometryData.upVec,
			this.wilson.worldCenterY
		);

		// this.wilson.worldCenterY = 0;

		this.rotatedForwardVec = result2[0];
		this.rotatedUpVec = result2[1];

		// this.geometryData.forwardVec = result2[0];
		// this.geometryData.upVec = result2[1];
	}



	getCurvature(pos, dir)
	{
		const normalizedDir = ThurstonGeometry.normalize(dir);

		const gammaPrime = this.geometryData.getGammaPrime(pos, normalizedDir);
		const gammaDoublePrime = this.geometryData.getGammaDoublePrime(pos, normalizedDir);

		const dotProduct = ThurstonGeometry.dotProduct(gammaPrime, gammaDoublePrime);
		const gammaPrimeMag = ThurstonGeometry.magnitude(gammaPrime);
		const gammaDoublePrimeMag = ThurstonGeometry.magnitude(gammaDoublePrime);

		return Math.sqrt((gammaPrimeMag * gammaDoublePrimeMag) ** 2 - dotProduct ** 2)
			/ (gammaPrimeMag ** 3);
	}



	handleKeydownEvent(e)
	{
		const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

		if (Object.prototype.hasOwnProperty.call(this.keysPressed, key))
		{
			e.preventDefault();

			this.keysPressed[key] = true;
		}
	}



	handleKeyupEvent(e)
	{
		const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

		if (Object.prototype.hasOwnProperty.call(this.keysPressed, key))
		{
			e.preventDefault();

			this.keysPressed[key] = false;
		}
	}



	handleTouchEvent(e)
	{
		this.numTouches = e.touches.length;
	}



	changeResolution(resolution = this.resolution)
	{
		this.resolution = resolution;

		let imageWidth, imageHeight;

		if (this.wilson.fullscreen.currentlyFullscreen)
		{
			imageWidth = Math.min(this.resolution, Math.floor(this.resolution * aspectRatio));
			imageHeight = Math.min(this.resolution, Math.floor(this.resolution / aspectRatio));

			this.wilson.worldWidth = Math.max(2, 2 * aspectRatio);
			this.wilson.worldHeight = Math.max(2, 2 / aspectRatio);
		}

		else
		{
			imageWidth = this.resolution;
			imageHeight = this.resolution;
		}



		this.wilson.changeCanvasSize(imageWidth, imageHeight);



		if (imageWidth >= imageHeight)
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