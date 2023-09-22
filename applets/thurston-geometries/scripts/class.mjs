import { Applet } from "/scripts/src/applets.mjs";
import { aspectRatio } from "/scripts/src/layout.mjs";
import { addTemporaryListener } from "/scripts/src/main.mjs";
import { Wilson } from "/scripts/wilson.mjs";

export class ThurstonGeometry extends Applet
{
	resolution = 500;

	aspectRatioX = 1;
	aspectRatioY = 1;

	cameraPos;

	normalVec;
	upVec;
	rightVec;
	forwardVec;

	//Finally, we handle the rotation of the camera --- we can't bake this in, since otherwise
	//the holonomy of the sphere bites us. We'll allow rotating left and right to affect the
	//base vectors, but rotating up and down affects these only,
	//which finally get passed to the shader.
	rotatedForwardVec;
	rotatedUpVec;

	//Moving forward/back, right/left, and up/down
	movingAmount = [0, 0, 0];
	rollingAmount = 0;

	getMovingSpeed;

	updateCameraPos;
	getGeodesicDirection;
	
	getNormalVec;
	getGammaPrime;
	getGammaDoublePrime;
	getGammaTriplePrime;

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
	}



	run({
		updateCameraPos,
		getGeodesicDirection,
		getNormalVec,
		getGammaPrime,
		getGammaDoublePrime,
		getGammaTriplePrime,
		gammaTriplePrimeIsLinearlyIndependent,
		distanceEstimatorGlsl,
		geodesicGlsl,
		getColorGlsl,
		fogGlsl,
		lightGlsl,
		cameraPos,
		normalVec,
		upVec,
		rightVec,
		forwardVec,
		getMovingSpeed
	})
	{
		this.updateCameraPos = updateCameraPos;
		this.getGeodesicDirection = getGeodesicDirection;

		this.getNormalVec = getNormalVec;
		this.getGammaPrime = getGammaPrime;
		this.getGammaDoublePrime = getGammaDoublePrime;
		this.getGammaTriplePrime = getGammaTriplePrime;
		this.gammaTriplePrimeIsLinearlyIndependent = gammaTriplePrimeIsLinearlyIndependent;

		this.cameraPos = cameraPos;
		this.normalVec = normalVec;
		this.upVec = upVec;
		this.rightVec = rightVec;
		this.forwardVec = forwardVec;

		this.getMovingSpeed = getMovingSpeed;

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
			
			const float clipDistance = 10000.0;
			const float epsilon = 0.00001;
			const int maxMarches = 100;
			const float stepFactor = .99;
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .07;
			const float fov = 1.0;



			float sinh(float x)
			{
				return .5 * (exp(x) - exp(-x));
			}

			float cosh(float x)
			{
				return .5 * (exp(x) + exp(-x));
			}

			float acosh(float x)
			{
				return log(x + sqrt(x*x + 1.0));
			}



			float getBanding(float amount, float numBands)
			{
				return 1.0 - floor(mod(amount * numBands, 2.0)) / 2.0;
			}
			
			
			
			float distanceEstimator(vec4 pos)
			{
				${distanceEstimatorGlsl}
			}
			
			vec3 getColor(vec4 pos)
			{
				${getColorGlsl}
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
				
				return normalize(vec4(xStep1 - xStep2, yStep1 - yStep2, zStep1 - zStep2, wStep1 - wStep2));
			}
			
			
			
			vec3 computeShading(vec4 pos, int iteration)
			{
				vec4 surfaceNormal = getSurfaceNormal(pos);
				
				${lightGlsl}

				//The last factor adds ambient occlusion.
				vec3 color = getColor(pos) * lightIntensity * max((1.0 - float(iteration) / float(maxMarches)), 0.0);
				
				//Apply fog.
				${fogGlsl}
			}
			
			
			
			vec3 raymarch(vec4 rayDirectionVec)
			{
				vec3 finalColor = fogColor;
				
				float t = 0.0;
				
				float lastDistance = 1000.0;
				
				
				
				for (int iteration = 0; iteration < maxMarches; iteration++)
				{
					${geodesicGlsl}
					
					float distance = distanceEstimator(pos);
					
					if (distance < epsilon)
					{
						finalColor = computeShading(pos, iteration);
						break;
					}
					
					else if (t > clipDistance)
					{
						break;
					}
					
					t += distance * stepFactor;
				}
				
				return finalColor;
			}
			
			
			
			void main(void)
			{
				gl_FragColor = vec4(raymarch(normalize(forwardVec + rightVec * uv.x * aspectRatioX * fov + upVec * uv.y / aspectRatioY * fov)), 1.0);
			}
		`;

		

		this.wilson.render.shaderPrograms = [];
		this.wilson.render.loadNewShader(fragShaderSource);
		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]);

		this.wilson.render.initUniforms([
			"aspectRatioX",
			"aspectRatioY",
			"resolution",

			"cameraPos",
			"normalVec",
			"upVec",
			"rightVec",
			"forwardVec",
		]);

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

		this.wilson.gl.uniform4fv(
			this.wilson.uniforms["cameraPos"],
			this.cameraPos
		);

		this.wilson.gl.uniform4fv(
			this.wilson.uniforms["normalVec"],
			this.normalVec
		);

		this.wilson.gl.uniform4fv(
			this.wilson.uniforms["upVec"],
			this.upVec
		);
		
		this.wilson.gl.uniform4fv(
			this.wilson.uniforms["rightVec"],
			this.rightVec
		);
			
		this.wilson.gl.uniform4fv(
			this.wilson.uniforms["forwardVec"],
			this.forwardVec
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

		this.pan.update(timeElapsed);

		

		if (this.keysPressed.w)
		{
			this.movingAmount[0] = 1;
		}

		else if (this.keysPressed.s)
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

				this.correctVectors();
			}

			if (this.movingAmount[1])
			{
				this.handleMoving(
					[0, Math.sign(this.movingAmount[1]), 0],
					timeElapsed * speedAdjust * Math.abs(this.movingAmount[1])
				);

				this.correctVectors();
			}

			if (this.movingAmount[2])
			{
				this.handleMoving(
					[0, 0, Math.sign(this.movingAmount[2])],
					timeElapsed * speedAdjust * Math.abs(this.movingAmount[2])
				);
				this.correctVectors();
			}
			
			for (let i = 0; i < 3; i++)
			{
				this.movingAmount[i] *= ThurstonGeometry.moveFriction;

				if (Math.abs(this.movingAmount[i]) < ThurstonGeometry.moveStopThreshhold)
				{
					this.movingAmount[i] = 0;
				}
			}
		}

		

		this.handleRotating();

		if (this.rollingAmount)
		{
			if (this.wilson.worldCenterY)
			{
				this.wilson.worldCenterY = 0;
				this.upVec = [...this.rotatedUpVec];
				this.forwardVec = [...this.rotatedForwardVec];
			}
			
			const angle = timeElapsed * this.rollingAmount * .0015;

			[this.rightVec, this.upVec] = ThurstonGeometry.rotateVectors(
				this.rightVec,
				this.upVec,
				angle
			);

			this.rollingAmount *= ThurstonGeometry.rollingFriction;

			if (Math.abs(this.rollingAmount) < ThurstonGeometry.rollingStopThreshhold)
			{
				this.rollingAmount = 0;
			}
		}



		this.wilson.gl.uniform4fv(
			this.wilson.uniforms["cameraPos"],
			this.cameraPos
		);

		this.wilson.gl.uniform4fv(
			this.wilson.uniforms["normalVec"],
			this.normalVec
		);

		this.wilson.gl.uniform4fv(
			this.wilson.uniforms["upVec"],
			this.rotatedUpVec
		);
		
		this.wilson.gl.uniform4fv(
			this.wilson.uniforms["rightVec"],
			this.rightVec
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
	 * Probably the most complicated function here. Looking around can't be done relatively
	 * due to the holonomy of S^2, so we store its rotation from unrotated versions of the three
	 * facing vectors. But when moving, we need to *move* in the direction of the rotated vectors,
	 * while at the same time updating the *unrotated* vectors updated due to the curvature of the
	 * space.
     *
	 * So: here's the idea. Use the Frenet-Serret formula to compute the orthonormal frame
	 * at the camera position in the direction of motion, express all four *unrotated* vectors
	 * in that basis, then compute their derivatives with the other part of the formula.
	 */
	handleMoving(movingAmount, timeElapsed)
	{
		let tangentVec = ThurstonGeometry.normalize([
			movingAmount[0] * this.forwardVec[0]
				+ movingAmount[1] * this.rightVec[0]
				+ movingAmount[2] * this.upVec[0],
			
			movingAmount[0] * this.forwardVec[1]
				+ movingAmount[1] * this.rightVec[1]
				+ movingAmount[2] * this.upVec[1],
			
			movingAmount[0] * this.forwardVec[2]
				+ movingAmount[1] * this.rightVec[2]
				+ movingAmount[2] * this.upVec[2],
			
			movingAmount[0] * this.forwardVec[3]
				+ movingAmount[1] * this.rightVec[3]
				+ movingAmount[2] * this.upVec[3],
		]);

		const dt = timeElapsed / 1000 * this.getMovingSpeed(this.cameraPos);



		//The magic formula is T' = curvature * N.
		const curvature = this.getCurvature(this.cameraPos, tangentVec);

		const newCameraPos = this.updateCameraPos(this.cameraPos, tangentVec, dt);

		//The magic formula is T' = curvature * N.
		tangentVec = ThurstonGeometry.normalize([
			tangentVec[0] + curvature * this.normalVec[0] * dt,
			tangentVec[1] + curvature * this.normalVec[1] * dt,
			tangentVec[2] + curvature * this.normalVec[2] * dt,
			tangentVec[3] + curvature * this.normalVec[3] * dt
		]);

		

		if (this.gammaTriplePrimeIsLinearlyIndependent)
		{
			//idfk
		}

		this.cameraPos = newCameraPos;

		this.normalVec = this.getNormalVec(this.cameraPos);



		//Need to do rotation here rather than scale by -1.
		if (movingAmount[0] === 1)
		{
			this.forwardVec = [...tangentVec];
		}

		else if (movingAmount[0] === -1)
		{
			const result = ThurstonGeometry.rotateVectors(tangentVec, this.rightVec, Math.PI);
			this.forwardVec = result[0];
		}

		else if (movingAmount[1] === 1)
		{
			this.rightVec = [...tangentVec];
		}

		else if (movingAmount[1] === -1)
		{
			const result = ThurstonGeometry.rotateVectors(tangentVec, this.forwardVec, Math.PI);
			this.rightVec = result[0];
		}

		else if (movingAmount[2] === 1)
		{
			this.upVec = [...tangentVec];
		}

		else if (movingAmount[2] === -1)
		{
			const result = ThurstonGeometry.rotateVectors(tangentVec, this.forwardVec, Math.PI);
			this.upVec = result[0];
		}
	}



	parallelTransport(newCameraPos, vecToTransport)
	{
		//In the terminology of Schild's ladder, A = this.cameraPos, and we need to find X_0.
		const x0 = this.updateCameraPos(this.cameraPos, vecToTransport, 1);

		//Now we need to construct a geodesic between x0 and the updated cameraPosition.
		const [dir, magnitude] = this.getGeodesicDirection(x0, newCameraPos);

		//Now find the point halfway there.
		const p = this.updateCameraPos(x0, dir, magnitude / 2);

		//Construct a geodesic between the original camera position and this point.
		const [dir2, magnitude2] = this.getGeodesicDirection(this.cameraPos, p);

		//Follow that twice as far.
		const x1 = this.updateCameraPos(this.cameraPos, dir2, magnitude2 * 2);

		//Now at long last, construct the geodesic from te new camera position to this point.
		const [dir3] = this.getGeodesicDirection(newCameraPos, x1);

		return dir3;
	}



	handleRotating()
	{
		this.wilson.worldCenterY = Math.min(
			Math.max(this.wilson.worldCenterY, -Math.PI / 2 + .01),
			Math.PI / 2 - .01
		);

		const result = ThurstonGeometry.rotateVectors(
			this.forwardVec,
			this.rightVec,
			this.wilson.worldCenterX
		);

		//Left/right rotation is allowed to be baked in to the underlying vectors.

		this.forwardVec = result[0];
		this.rightVec = result[1];

		this.wilson.worldCenterX = 0;

		const result2 = ThurstonGeometry.rotateVectors(
			this.forwardVec,
			this.upVec,
			this.wilson.worldCenterY
		);

		this.rotatedForwardVec = result2[0];
		this.rotatedUpVec = result2[1];
	}



	//Surprisingly necessary -- this corrects the frame so that no vector looks in the normal
	//direction at all.
	correctVectors()
	{
		const dotUp = ThurstonGeometry.dotProduct(this.normalVec, this.upVec);
		const dotRight = ThurstonGeometry.dotProduct(this.normalVec, this.rightVec);
		const dotForward = ThurstonGeometry.dotProduct(this.normalVec, this.forwardVec);

		for (let i = 0; i < 4; i++)
		{
			this.upVec[i] -= dotUp * this.normalVec[i];

			this.rightVec[i] -= dotRight * this.normalVec[i];

			this.forwardVec[i] -= dotForward * this.normalVec[i];
		}

		this.upVec = ThurstonGeometry.normalize(this.upVec);
		this.rightVec = ThurstonGeometry.normalize(this.rightVec);
		this.forwardVec = ThurstonGeometry.normalize(this.forwardVec);
	}



	getCurvature(pos, dir)
	{
		const gammaPrime = this.getGammaPrime(pos, dir);
		const gammaDoublePrime = this.getGammaDoublePrime(pos, dir);

		const dotProduct = ThurstonGeometry.dotProduct(gammaPrime, gammaDoublePrime);
		const gammaPrimeMag = ThurstonGeometry.magnitude(gammaPrime);
		const gammaDoublePrimeMag = ThurstonGeometry.magnitude(gammaDoublePrime);

		return Math.sqrt((gammaPrimeMag * gammaDoublePrimeMag) ** 2 - dotProduct ** 2)
			/ (gammaPrimeMag ** 3);
	}



	handleKeydownEvent(e)
	{
		if (document.activeElement.tagName === "INPUT")
		{
			return;
		}

		const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

		if (Object.prototype.hasOwnProperty.call(this.keysPressed, key))
		{
			e.preventDefault();

			this.keysPressed[key] = true;
		}
	}



	handleKeyupEvent(e)
	{
		if (document.activeElement.tagName === "INPUT")
		{
			return;
		}

		const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

		if (Object.prototype.hasOwnProperty.call(this.keysPressed, key))
		{
			e.preventDefault();

			this.keysPressed[key] = false;
		}
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
		return [c * vec[0], c * vec[1], c * vec[2], c * vec[2]];
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
}