import { Applet } from "/scripts/src/applets.mjs";
import { aspectRatio } from "/scripts/src/layout.mjs";
import { addTemporaryListener } from "/scripts/src/main.mjs";
import { Wilson } from "/scripts/wilson.mjs";

export class ThurstonGeometry extends Applet
{
	resolution = 1000;

	aspectRatioX = 1;
	aspectRatioY = 1;

	cameraPos;

	normalVec;
	upVec;
	rightVec;
	forwardVec;

	//The first is +/- 1 for moving forward, and the second is for moving right.
	movingAmount = [0, 0];

	lastWorldCenterX;
	lastWorldCenterY;

	updateCameraPos;
	getNormalVec;
	getGammaPrime;
	getGammaDoublePrime;



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
		updateCameraPos, // (cameraPos: vec4) => newCameraPos
		getNormalVec,
		getGammaPrime,
		getGammaDoublePrime,
		distanceEstimatorGlsl,
		getColorGlsl,
		cameraPos,
		normalVec,
		upVec,
		rightVec,
		forwardVec
	})
	{
		this.updateCameraPos = updateCameraPos;
		this.getNormalVec = getNormalVec;
		this.getGammaPrime = getGammaPrime;
		this.getGammaDoublePrime = getGammaDoublePrime;

		this.cameraPos = cameraPos;
		this.normalVec = normalVec;
		this.upVec = upVec;
		this.rightVec = rightVec;
		this.forwardVec = forwardVec;

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
			
			const float clipDistance = 1000.0;
			const float epsilon = 0.00001;
			const int maxMarches = 100;
			const float stepFactor = .99;
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .07;
			const float fov = 1.0;
			const float radius = .9;



			float getBanding(float amount, float numBands)
			{
				return 1.0;// - floor(mod(amount * numBands, 2.0)) / 2.0;
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
				
				vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, 1.0) - pos);
				float dotProduct1 = dot(surfaceNormal, lightDirection1);

				vec4 lightDirection2 = normalize(vec4(-1.0, -1.0, -1.0, 1.0) - pos);
				float dotProduct2 = dot(surfaceNormal, lightDirection2);

				vec4 lightDirection3 = normalize(vec4(1.0, 1.0, 1.0, 0.0) - pos);
				float dotProduct3 = dot(surfaceNormal, lightDirection3);

				vec4 lightDirection4 = normalize(vec4(-1.0, -1.0, -1.0, 0.0) - pos);
				float dotProduct4 = dot(surfaceNormal, lightDirection4);

				float lightIntensity = lightBrightness * max(
					max(abs(dotProduct1), abs(dotProduct2)),
					max(abs(dotProduct3), abs(dotProduct4))
				);

				//The last factor adds ambient occlusion.
				vec3 color = getColor(pos) * lightIntensity * max((1.0 - float(iteration) / float(maxMarches)), 0.0);
				
				//Apply fog.
				return mix(color, fogColor, 1.0 - exp(-acos(dot(pos, cameraPos)) * fogScaling));
			}
			
			
			
			vec3 raymarch(vec4 rayDirectionVec)
			{
				vec3 finalColor = fogColor;
				
				float t = 0.0;
				
				float lastDistance = 1000.0;
				
				
				
				for (int iteration = 0; iteration < maxMarches; iteration++)
				{
					vec4 pos = cos(t) * cameraPos + sin(t) * rayDirectionVec;
					
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
		this.zoom.update(timeElapsed);

		this.calculateVectors(timeElapsed);
		this.correctVectors();

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

		this.wilson.render.drawFrame();



		if (!this.animationPaused)
		{
			window.requestAnimationFrame(this.drawFrame.bind(this));
		}
	}



	calculateVectors(timeElapsed, ignoreMovingForward = false)
	{
		//If there's been any rotation, it's simplest to handle that now.
		const rotationChangeX = (this.lastWorldCenterX - this.wilson.worldCenterX)
			* this.aspectRatioX;
		const rotationChangeY = (this.lastWorldCenterY - this.wilson.worldCenterY)
			* this.aspectRatioY;

		this.lastWorldCenterX = this.wilson.worldCenterX;
		this.lastWorldCenterY = this.wilson.worldCenterY;

		if (rotationChangeX)
		{
			const result = this.rotateVectors({
				vec1: this.forwardVec,
				vec2: this.rightVec,
				theta: -rotationChangeX
			});

			this.forwardVec = result[0];
			this.rightVec = result[1];
		}

		if (rotationChangeY)
		{
			const result = this.rotateVectors({
				vec1: this.forwardVec,
				vec2: this.upVec,
				theta: -rotationChangeY
			});

			this.forwardVec = result[0];
			this.upVec = result[1];
		}



		if (!this.movingAmount[0] && !this.movingAmount[1])
		{
			return;
		}

		const dt = timeElapsed / 1000;

		let tangentVec = (this.movingAmount[0] !== 0 && !ignoreMovingForward)
			? this.movingAmount[0] === 1
				? [...this.forwardVec]
				: [
					-this.forwardVec[0],
					-this.forwardVec[1],
					-this.forwardVec[2],
					-this.forwardVec[3]
				]
			: this.movingAmount[1] === 1
				? [...this.rightVec]
				: [
					-this.rightVec[0],
					-this.rightVec[1],
					-this.rightVec[2],
					-this.rightVec[3]
				];


		
		this.updateCameraPos(this.cameraPos, tangentVec, dt);

		//Get the tangent space to the manifold.
		this.normalVec = this.getNormalVec(this.cameraPos);
		
		//Now for the other vectors, using the magic of curvature.
		const curvature = this.getCurvature(this.cameraPos, tangentVec);

		//The magic formula is T' = curvature * N (although this N is opposite ours).
		tangentVec = ThurstonGeometry.normalize([
			tangentVec[0] - curvature * this.normalVec[0] * dt,
			tangentVec[1] - curvature * this.normalVec[1] * dt,
			tangentVec[2] - curvature * this.normalVec[2] * dt,
			tangentVec[3] - curvature * this.normalVec[3] * dt
		]);

		//Finally, we can add this back to our actual vector.
		if (this.movingAmount[0] !== 0 && !ignoreMovingForward)
		{
			this.forwardVec = [
				this.movingAmount[0] * tangentVec[0],
				this.movingAmount[0] * tangentVec[1],
				this.movingAmount[0] * tangentVec[2],
				this.movingAmount[0] * tangentVec[3]
			];

			const result = this.rotateVectors({
				vec1: this.forwardVec,
				vec2: this.rightVec,
				theta: Math.PI / 2
			});

			//Hey listen! This one's important. It's not result[1], even though that's
			//where the right vec lives in the matrix --- that's because we're rotating
			//the forward vec to find the right one.
			this.rightVec = result[0];
		}

		else
		{
			this.rightVec = [
				this.movingAmount[1] * tangentVec[0],
				this.movingAmount[1] * tangentVec[1],
				this.movingAmount[1] * tangentVec[2],
				this.movingAmount[1] * tangentVec[3]
			];

			const result = this.rotateVectors({
				vec1: this.forwardVec,
				vec2: this.rightVec,
				theta: -Math.PI / 2
			});

			this.forwardVec = result[1];
		}

		if (this.movingAmount[0] !== 0 && this.movingAmount[1] !== 0 && !ignoreMovingForward)
		{
			this.calculateVectors(timeElapsed, true);
		}
	}



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



	//This is a complicated one. What we want is to take a vector in R^4 and rotate it in the
	//plane orthogonal to *two* vectors. The first is the global normal vector, and the
	//second varies. What we'll do is convert our four vectors to the standard basis, rotate that,
	//and then convert back.
	rotateVectors({
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