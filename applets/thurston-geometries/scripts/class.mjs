import { RaymarchApplet } from "/scripts/src/applets.mjs";
import { aspectRatio } from "/scripts/src/layout.mjs";
import { addTemporaryListener, loadScript } from "/scripts/src/main.mjs";
import { Wilson } from "/scripts/wilson.mjs";

export class ThurstonGeometry extends RaymarchApplet
{
	theta = 4.6601;
	phi = 2.272;
	cameraPos = [.0828, 2.17, 1.8925];

	onManifoldPos = [0, 0, 0, 1];

	globalNormalVec = [0, 0, 0, 1];
	globalForwardVec = [1, 0, 0, 0];
	globalRightVec = [0, 1, 0, 0];
	globalUpVec = [0, 0, 1, 0];

	//The first is +/- 1 for moving forward, and the second is for moving right.
	movingAmount = [0, 0];

	lastWorldCenterX;
	lastWorldCenterY;



	constructor({
		canvas,
	})
	{
		super(canvas);

		const fragShaderSource = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatioX;
			uniform float aspectRatioY;
			
			uniform vec3 cameraPos;
			uniform vec3 imagePlaneCenterPos;
			uniform vec3 forwardVec;
			uniform vec3 rightVec;
			uniform vec3 upVec;
			
			uniform float focalLength;
			
			uniform vec3 lightPos;
			const float lightBrightness = 1.5;
			
			uniform int imageSize;
			
			uniform int maxIterations;
			
			const float clipDistance = 1000.0;
			uniform int maxMarches;
			uniform float stepFactor;
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .1;

			uniform vec3 onSpherePos;
			uniform vec3 globalForwardVec;
			uniform vec3 globalRightVec;
			uniform vec3 globalNormalVec;
			
			
			
			float distanceEstimator(vec3 pos)
			{
				float distance1 = length(pos) - 1.0;
				float distance2 = length(pos - onSpherePos) - .05;
				float distance3 = length(pos - onSpherePos - globalForwardVec / 4.0) - .05;
				float distance4 = length(pos - onSpherePos - globalRightVec / 4.0) - .05;
				float distance5 = length(pos - onSpherePos - globalNormalVec / 4.0) - .05;

				float minDistance = min(min(min(min(distance1, distance2), distance3), distance4), distance5);

				return minDistance;
			}
			
			
			
			vec3 getColor(vec3 pos)
			{
				float distance1 = length(pos) - 1.0;
				float distance2 = length(pos - onSpherePos) - .05;
				float distance3 = length(pos - onSpherePos - globalForwardVec / 4.0) - .05;
				float distance4 = length(pos - onSpherePos - globalRightVec / 4.0) - .05;
				float distance5 = length(pos - onSpherePos - globalNormalVec / 4.0) - .05;
				
				float minDistance = min(min(min(min(distance1, distance2), distance3), distance4), distance5);

				if (minDistance == distance1)
				{
					return vec3(1.0, 1.0, 1.0);
				}

				if (minDistance == distance2)
				{
					return vec3(.75, .75, .75);
				}

				if (minDistance == distance3)
				{
					return vec3(1.0, 0.0, 0.0);
				}

				if (minDistance == distance4)
				{
					return vec3(0.0, 1.0, 0.0);
				}

				if (minDistance == distance5)
				{
					return vec3(0.0, 0.0, 1.0);
				}
			}
			
			
			
			vec3 getSurfaceNormal(vec3 pos)
			{
				float xStep1 = distanceEstimator(pos + vec3(.000001, 0.0, 0.0));
				float yStep1 = distanceEstimator(pos + vec3(0.0, .000001, 0.0));
				float zStep1 = distanceEstimator(pos + vec3(0.0, 0.0, .000001));
				
				float xStep2 = distanceEstimator(pos - vec3(.000001, 0.0, 0.0));
				float yStep2 = distanceEstimator(pos - vec3(0.0, .000001, 0.0));
				float zStep2 = distanceEstimator(pos - vec3(0.0, 0.0, .000001));
				
				return normalize(vec3(xStep1 - xStep2, yStep1 - yStep2, zStep1 - zStep2));
			}
			
			
			
			vec3 computeShading(vec3 pos, int iteration)
			{
				vec3 surfaceNormal = getSurfaceNormal(pos);
				
				vec3 lightDirection = normalize(lightPos - pos);
				
				float dotProduct = dot(surfaceNormal, lightDirection);
				
				float lightIntensity = lightBrightness * max(dotProduct, -.25 * dotProduct);
				
				//The last factor adds ambient occlusion.
				vec3 color = getColor(pos) * lightIntensity * max((1.0 - float(iteration) / float(maxMarches)), 0.0);
				
				
				
				//Apply fog.
				return mix(color, fogColor, 1.0 - exp(-distance(pos, cameraPos) * fogScaling));
			}
			
			
			
			vec3 raymarch(vec3 startPos)
			{
				//That factor of .9 is important -- without it, we're always stepping as far as possible, which results in artefacts and weirdness.
				vec3 rayDirectionVec = normalize(startPos - cameraPos) * .9 / stepFactor;
				
				vec3 finalColor = fogColor;
				
				float epsilon = 0.0;
				
				float t = 0.0;
				
				float lastDistance = 1000.0;
				
				
				
				for (int iteration = 0; iteration < 1024; iteration++)
				{
					if (iteration == maxMarches)
					{
						break;
					}
					
					
					
					vec3 pos = startPos + t * rayDirectionVec;
					
					//This prevents overstepping, and is honestly a pretty clever fix.
					float distance = min(distanceEstimator(pos), lastDistance);
					lastDistance = distance;
					
					//This lowers the detail far away, which makes everything run nice and fast.
					epsilon = max(.0000006, .5 * t / float(imageSize));
					
					
					
					if (distance < epsilon)
					{
						finalColor = computeShading(pos, iteration);
						break;
					}
					
					else if (t > clipDistance)
					{
						break;
					}
					
					
					
					t += distance;
				}
				
				
				
				return finalColor;
			}
			
			
			
			void main(void)
			{
				gl_FragColor = vec4(raymarch(imagePlaneCenterPos + rightVec * uv.x * aspectRatioX + upVec * uv.y / aspectRatioY), 1.0);
			}
		`;



		const options =
		{
			renderer: "gpu",

			shader: fragShaderSource,

			canvasWidth: 1000,
			canvasHeight: 1000,

			worldCenterX: -4.6601,
			worldCenterY: -2.272,



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

		this.wilson.render.initUniforms([
			"aspectRatioX",
			"aspectRatioY",
			"imageSize",
			"cameraPos",
			"imagePlaneCenterPos",
			"forwardVec",
			"rightVec",
			"upVec",
			"focalLength",
			"lightPos",
			"maxMarches",
			"stepFactor",
			"maxIterations",

			"onSpherePos",
			"globalForwardVec",
			"globalRightVec",
			"globalNormalVec"
		]);

		this.lastWorldCenterX = this.wilson.worldCenterX;


		this.calculateVectors();



		if (this.imageWidth >= this.imageHeight)
		{
			this.wilson.gl.uniform1f(
				this.wilson.uniforms["aspectRatioX"],
				this.imageWidth / this.imageHeight
			);

			this.wilson.gl.uniform1f(
				this.wilson.uniforms["aspectRatioY"],
				1
			);
		}

		else
		{
			this.wilson.gl.uniform1f(
				this.wilson.uniforms["aspectRatioX"],
				1
			);

			this.wilson.gl.uniform1f(
				this.wilson.uniforms["aspectRatioY"],
				this.imageWidth / this.imageHeight
			);
		}

		this.wilson.gl.uniform1i(
			this.wilson.uniforms["imageSize"],
			this.imageSize
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms["cameraPos"],
			this.cameraPos
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms["imagePlaneCenterPos"],
			this.imagePlaneCenterPos
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms["lightPos"],
			this.lightPos
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms["forwardVec"],
			this.forwardVec
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms["rightVec"],
			this.rightVec
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms["upVec"],
			this.upVec
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["focalLength"],
			this.focalLength
		);

		this.wilson.gl.uniform1i(
			this.wilson.uniforms["maxMarches"],
			this.maxMarches
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["stepFactor"],
			1
		);

		this.wilson.gl.uniform1i(
			this.wilson.uniforms["maxIterations"],
			this.maxIterations
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms["onSpherePos"],
			[0, 0, 0]
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms["globalForwardVec"],
			[0, 0, 0]
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms["globalRightVec"],
			[0, 0, 0]
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms["globalNormalVec"],
			[0, 0, 0]
		);



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



		loadScript("/scripts/math.min.js")
			.then(() =>
			{
				// eslint-disable-next-line no-undef
				this.math = math;
			});



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

		this.calculateGlobalVectors(timeElapsed);

		this.calculateVectors();
		this.updateCameraParameters();

		
		console.log(...this.onManifoldPos.map(x => Math.round(x * 1000) / 1000));
		// console.log(...this.globalNormalVec.map(x => Math.round(x * 100) / 100));
		// console.log(...this.globalUpVec.map(x => Math.round(x * 100) / 100));
		// console.log(...this.globalRightVec.map(x => Math.round(x * 100) / 100));
		// console.log(...this.globalForwardVec.map(x => Math.round(x * 100) / 100));

		// this.wilson.gl.uniform3fv(
		// 	this.wilson.uniforms["onSpherePos"],
		// 	this.onSpherePos
		// );

		// this.wilson.gl.uniform3fv(
		// 	this.wilson.uniforms["globalForwardVec"],
		// 	this.globalForwardVec
		// );

		// this.wilson.gl.uniform3fv(
		// 	this.wilson.uniforms["globalRightVec"],
		// 	this.globalRightVec
		// );

		// this.wilson.gl.uniform3fv(
		// 	this.wilson.uniforms["globalNormalVec"],
		// 	this.globalNormalVec
		// );

		

		this.wilson.render.drawFrame();



		if (!this.animationPaused)
		{
			window.requestAnimationFrame(this.drawFrame.bind(this));
		}
	}



	distanceEstimator(x, y, z, w)
	{
		return Math.sqrt(x * x + y * y + z * z + w * w) - .5;
	}



	calculateGlobalVectors(timeElapsed, ignoreMovingForward = false)
	{
		//If there's been any rotation, it's simplest to handle that now.
		const rotationChangeX = this.lastWorldCenterX - this.wilson.worldCenterX;
		const rotationChangeY = this.lastWorldCenterY - this.wilson.worldCenterY;

		this.lastWorldCenterX = this.wilson.worldCenterX;
		this.lastWorldCenterY = this.wilson.worldCenterY;

		// idk
		// if (rotationChangeX)
		// {
		// 	this.globalForwardVec = this.rotateAboutNormal(this.globalForwardVec, rotationChangeX);
		// 	this.globalRightVec = this.rotateAboutNormal(this.globalForwardVec, Math.PI / 2);
		// }

		// if (rotationChangeY)
		// {
		// 	this.globalForwardVec = this.rotateAboutNormal(this.globalForwardVec, rotationChangeY);
		// 	this.globalRightVec = this.rotateAboutNormal(this.globalForwardVec, Math.PI / 2);
		// }



		if (!this.movingAmount[0] && !this.movingAmount[1])
		{
			return;
		}

		const dt = timeElapsed / 10000;

		let tangentVec = (this.movingAmount[0] !== 0 && !ignoreMovingForward)
			? this.movingAmount[0] === 1
				? [...this.globalForwardVec]
				: [
					-this.globalForwardVec[0],
					-this.globalForwardVec[1],
					-this.globalForwardVec[2],
					-this.globalForwardVec[3]
				]
			: this.movingAmount[1] === 1
				? [...this.globalRightVec]
				: [
					-this.globalRightVec[0],
					-this.globalRightVec[1],
					-this.globalRightVec[2],
					-this.globalRightVec[3]
				];



		//The first order of business is to update the position.
		for (let i = 0; i < 4; i++)
		{
			//This will change with the geometry.
			this.onManifoldPos[i] =
				Math.cos(dt) * this.onManifoldPos[i]
				+ Math.sin(dt) * tangentVec[i];
		}
		
		
		//Since we're only doing a linear approximation, this position won't be exactly
		//on the manifold. Therefore, we'll do a quick correction to get it back.
		this.correctManifoldPos();

		

		//Now we get the tangent space to the manifold. Here, the function is x^2+y^2+z^2+w^2=1,
		//so its gradient is (2x, 2y, 2z, 2w).
		
		this.globalNormalVec = ThurstonGeometry.normalize([
			this.onManifoldPos[0],
			this.onManifoldPos[1],
			this.onManifoldPos[2],
			this.onManifoldPos[3]
		]);
		
		//Now for the other vectors, using the magic of curvature.
		const curvature = this.getCurvature(this.onManifoldPos, tangentVec);

		//The magic formula is T' = curvature * N (although this N is opposite ours).
		tangentVec = ThurstonGeometry.normalize([
			tangentVec[0] - curvature * this.globalNormalVec[0] * dt,
			tangentVec[1] - curvature * this.globalNormalVec[1] * dt,
			tangentVec[2] - curvature * this.globalNormalVec[2] * dt,
			tangentVec[3] - curvature * this.globalNormalVec[3] * dt
		]);

		//Finally, we can add this back to our actual vector.
		if (this.movingAmount[0] !== 0 && !ignoreMovingForward)
		{
			this.globalForwardVec = [
				this.movingAmount[0] * tangentVec[0],
				this.movingAmount[0] * tangentVec[1],
				this.movingAmount[0] * tangentVec[2],
				this.movingAmount[0] * tangentVec[3]
			];

			const result = this.rotateAboutVectors({
				fixedVec1: this.globalNormalVec,
				fixedVec2: this.globalUpVec,
				rotateVec1: this.globalForwardVec,
				rotateVec2: this.globalRightVec,
				theta: Math.PI / 2
			});

			//Hey listen! This one's important. It's not result[1], even though that's
			//where the right vec lives in the matrix --- that's because we're rotating
			//the forward vec to find the right one.
			this.globalRightVec = result[0];
		}

		else
		{
			this.globalRightVec = [
				this.movingAmount[1] * tangentVec[0],
				this.movingAmount[1] * tangentVec[1],
				this.movingAmount[1] * tangentVec[2],
				this.movingAmount[1] * tangentVec[3]
			];

			const result = this.rotateAboutVectors({
				fixedVec1: this.globalNormalVec,
				fixedVec2: this.globalUpVec,
				rotateVec1: this.globalForwardVec,
				rotateVec2: this.globalRightVec,
				theta: -Math.PI / 2
			});

			this.globalForwardVec = result[1];
		}

		if (this.movingAmount[0] !== 0 && this.movingAmount[1] !== 0 && !ignoreMovingForward)
		{
			this.calculateGlobalVectors(timeElapsed, true);
		}
	}



	correctManifoldPos()
	{
		//Here, we just want the magnitude to be equal to 1 (this will be more complicated
		//for other manifolds).
		const magnitude = ThurstonGeometry.magnitude(this.onManifoldPos);

		this.onManifoldPos[0] /= magnitude;
		this.onManifoldPos[1] /= magnitude;
		this.onManifoldPos[2] /= magnitude;
		this.onManifoldPos[3] /= magnitude;
	}



	getCurvature(pos, dir)
	{
		//gamma = cos(t)*pos + sin(t)*dir
		//gamma' = -sin(t)*pos + cos(t)*dir
		//gamma'' = -cos(t)*pos - sin(t)*dir
		//All of these are evaluated at t=0.

		const gammaPrime = [...dir];
		const gammaDoublePrime = [-pos[0], -pos[1], -pos[2], -pos[3]];

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
	rotateAboutVectors({
		fixedVec1,
		fixedVec2,
		rotateVec1,
		rotateVec2,
		theta
	})
	{
		//Construct the matrix to convert to the standard basis.
		const toStandardBasisMatrix = [
			[fixedVec1[0], fixedVec2[0], rotateVec1[0], rotateVec2[0]],
			[fixedVec1[1], fixedVec2[1], rotateVec1[1], rotateVec2[1]],
			[fixedVec1[2], fixedVec2[2], rotateVec1[2], rotateVec2[2]],
			[fixedVec1[3], fixedVec2[3], rotateVec1[3], rotateVec2[3]]
		];

		const rotateMatrix = [
			[1, 0, 0, 0],
			[0, 1, 0, 0],
			[0, 0, Math.cos(theta), -Math.sin(theta)],
			[0, 0, Math.sin(theta), Math.cos(theta)]
		];

		const finalMatrix = this.math.multiply(
			this.math.multiply(this.math.inv(toStandardBasisMatrix), rotateMatrix),
			toStandardBasisMatrix
		);

		return [
			[finalMatrix[0][2], finalMatrix[1][2], finalMatrix[2][2], finalMatrix[3][2]],
			[finalMatrix[0][3], finalMatrix[1][3], finalMatrix[2][3], finalMatrix[3][3]]
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

		if (e.key === "ArrowUp")
		{
			e.preventDefault();

			this.movingAmount[0] = 1;
		}

		else if (e.key === "ArrowDown")
		{
			e.preventDefault();

			this.movingAmount[0] = -1;
		}

		if (e.key === "ArrowRight")
		{
			e.preventDefault();
			
			this.movingAmount[1] = 1;
		}

		else if (e.key === "ArrowLeft")
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

		if (e.key === "ArrowUp" || e.key === "ArrowDown")
		{
			e.preventDefault();

			this.movingAmount[0] = 0;
		}

		if (e.key === "ArrowRight" || e.key === "ArrowLeft")
		{
			e.preventDefault();
			
			this.movingAmount[1] = 0;
		}
	}



	changeResolution(resolution = this.imageSize)
	{
		this.imageSize = resolution;



		if (this.wilson.fullscreen.currentlyFullscreen)
		{
			if (aspectRatio >= 1)
			{
				this.imageWidth = this.imageSize;
				this.imageHeight = Math.floor(this.imageSize / aspectRatio);
			}

			else
			{
				this.imageWidth = Math.floor(this.imageSize * aspectRatio);
				this.imageHeight = this.imageSize;
			}
		}

		else
		{
			this.imageWidth = this.imageSize;
			this.imageHeight = this.imageSize;
		}



		this.wilson.changeCanvasSize(this.imageWidth, this.imageHeight);



		if (this.imageWidth >= this.imageHeight)
		{
			this.wilson.gl.uniform1f(
				this.wilson.uniforms["aspectRatioX"],
				this.imageWidth / this.imageHeight
			);

			this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatioY"], 1);
		}

		else
		{
			this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatioX"], 1);

			this.wilson.gl.uniform1f(
				this.wilson.uniforms["aspectRatioY"],
				this.imageWidth / this.imageHeight
			);
		}

		this.wilson.gl.uniform1i(this.wilson.uniforms["imageSize"], this.imageSize);
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