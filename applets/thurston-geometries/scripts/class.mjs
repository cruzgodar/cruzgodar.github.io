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

	//A story in three parts. This is the *frame*, a set of four orthonormal vectors that is
	//determined from the geodesic along which we travel. The first is the unit tangent vector,
	//the second the unit normal, and then the unit binormal and trinormals.
	orthonormalFrame = [[], [], [], []];

	//This is the second part: the camera's facing vectors. We can't just use the frame for
	//a few reasons: for one, when we switch from traveling forward to right, the binding from
	//frame to camera bearing changes. Instead, when we move position, we express the camera's
	//facing in the frame basis, move the frame, and then use the same basis coordinates
	//to express the new camera facing.
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
	getMovingSpeed;

	updateCameraPos;
	getNormalVec;
	getGammaPrime;
	getGammaDoublePrime;
	getGammaTriplePrime;



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
		getNormalVec,
		getGammaPrime,
		getGammaDoublePrime,
		getGammaTriplePrime,
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
		this.getNormalVec = getNormalVec;
		this.getGammaPrime = getGammaPrime;
		this.getGammaDoublePrime = getGammaDoublePrime;
		this.getGammaTriplePrime = getGammaTriplePrime;

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
		
		this.handleMoving(timeElapsed);
		this.correctVectors();
		this.handleRotating();

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
			this.rotatedRightVec
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
	handleMoving(timeElapsed)
	{
		if (!this.movingAmount[0] && !this.movingAmount[1])
		{
			return;
		}

		const dt = timeElapsed / 1000 * this.getMovingSpeed(this.cameraPos);

		let tangentVec = [...this.forwardVec];

		const curvature = this.getCurvature(this.cameraPos, tangentVec);

		//The magic formula is T' = curvature * N.
		tangentVec = ThurstonGeometry.normalize([
			tangentVec[0] + curvature * this.normalVec[0] * dt,
			tangentVec[1] + curvature * this.normalVec[1] * dt,
			tangentVec[2] + curvature * this.normalVec[2] * dt,
			tangentVec[3] + curvature * this.normalVec[3] * dt
		]);

		this.updateCameraPos(this.cameraPos, tangentVec, dt);

		const gammaDoublePrime = this.getGammaDoublePrime(this.cameraPos, tangentVec);
		const gammaTriplePrime = this.getGammaTriplePrime(this.cameraPos, tangentVec);

		this.forwardVec = [...tangentVec];

		this.normalVec = this.getNormalVec(this.cameraPos);

		console.log(this.cameraPos, this.normalVec);

		// if (
		// 	gammaTriplePrime[0]
		// 	|| gammaTriplePrime[1]
		// 	|| gammaTriplePrime[2]
		// 	|| gammaTriplePrime[3]
		// )
		// {
		// 	this.rightVec = ThurstonGeometry.normalize(
		// 		ThurstonGeometry.addVectors(
		// 			ThurstonGeometry.addVectors(
		// 				gammaTriplePrime,
		// 				ThurstonGeometry.scaleVector(
		// 					-ThurstonGeometry.dotProduct(gammaTriplePrime, this.forwardVec),
		// 					this.forwardVec
		// 				)
		// 			),
		// 			ThurstonGeometry.scaleVector(
		// 				-ThurstonGeometry.dotProduct(gammaTriplePrime, this.normalVec),
		// 				this.normalVec
		// 			)
		// 		)
		// 	);
		// }

		// this.upVec = ThurstonGeometry.crossProduct(this.forwardVec, this.normalVec, this.rightVec);
	}



	handleRotating()
	{
		this.rotatedForwardVec = [...this.forwardVec];
		this.rotatedRightVec = [...this.rightVec];
		this.rotatedUpVec = [...this.upVec];

		this.wilson.worldCenterY = Math.min(
			Math.max(this.wilson.worldCenterY, -Math.PI / 2 + .01),
			Math.PI / 2 - .01
		);

		const result = ThurstonGeometry.rotateVectors({
			vec1: this.rotatedForwardVec,
			vec2: this.rotatedRightVec,
			theta: this.wilson.worldCenterX
		});

		this.rotatedForwardVec = result[0];
		this.rotatedRightVec = result[1];

		const result2 = ThurstonGeometry.rotateVectors({
			vec1: this.rotatedForwardVec,
			vec2: this.rotatedUpVec,
			theta: this.wilson.worldCenterY
		});

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
		if (
			document.activeElement.tagName === "INPUT"
		)
		{
			return;
		}

		if (e.key === "w")
		{
			e.preventDefault();

			this.movingAmount[0] = 1;
		}

		else if (e.key === "s")
		{
			e.preventDefault();

			this.movingAmount[0] = -1;
		}

		if (e.key === "d")
		{
			e.preventDefault();
			
			this.movingAmount[1] = 1;
		}

		else if (e.key === "a")
		{
			e.preventDefault();
			
			this.movingAmount[1] = -1;
		}
	}



	handleKeyupEvent(e)
	{
		if (
			document.activeElement.tagName === "INPUT"
		)
		{
			return;
		}

		if (e.key === "w" || e.key === "s")
		{
			e.preventDefault();

			this.movingAmount[0] = 0;
		}

		if (e.key === "d" || e.key === "a")
		{
			e.preventDefault();
			
			this.movingAmount[1] = 0;
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



	//This is a complicated one. What we want is to take a vector in R^4 and rotate it in the
	//plane orthogonal to *two* vectors. The first is the global normal vector, and the
	//second varies. What we'll do is convert our four vectors to the standard basis, rotate that,
	//and then convert back.
	static rotateVectors({
		vec1,
		vec2,
		theta
	})
	{
		// const toStandardBasisMatrix = [
		// 	[fixedVec1[0], fixedVec2[0], rotateVec1[0], rotateVec2[0]],
		// 	[fixedVec1[1], fixedVec2[1], rotateVec1[1], rotateVec2[1]],
		// 	[fixedVec1[2], fixedVec2[2], rotateVec1[2], rotateVec2[2]],
		// 	[fixedVec1[3], fixedVec2[3], rotateVec1[3], rotateVec2[3]]
		// ];

		// const rotateMatrix = [
		// 	[1, 0, 0, 0],
		// 	[0, 1, 0, 0],
		// 	[0, 0, Math.cos(theta), -Math.sin(theta)],
		// 	[0, 0, Math.sin(theta), Math.cos(theta)]
		// ];
		//Now we return the final two columns of the product.
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

	static crossProduct(u, v, w)
	{
		return [
			u[1] * (v[2] * w[3] - v[3] * w[2])
			- u[2] * (v[1] * w[3] - v[3] * w[1])
			+ u[3] * (v[1] * w[2] - v[2] * w[1]),

			-u[0] * (v[2] * w[3] - v[3] * w[2])
			+ u[2] * (v[0] * w[3] - v[3] * w[0])
			- u[3] * (v[0] * w[2] - v[2] * w[0]),

			u[0] * (v[2] * w[3] - v[3] * w[2])
			- u[2] * (v[0] * w[3] - v[3] * w[0])
			+ u[3] * (v[0] * w[2] - v[2] * w[0]),

			-u[0] * (v[1] * w[2] - v[2] * w[1])
			+ u[1] * (v[0] * w[2] - v[2] * w[0])
			- u[2] * (v[0] * w[1] - v[1] * w[0])
		];
	}
}