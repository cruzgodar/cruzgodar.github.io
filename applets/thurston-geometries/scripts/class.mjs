import { Applet } from "/scripts/src/applets.mjs";
import { aspectRatio } from "/scripts/src/layout.mjs";
import { addTemporaryListener } from "/scripts/src/main.mjs";
import { Wilson } from "/scripts/wilson.mjs";

export class ThurstonGeometry extends Applet
{
	resolution = 1000;

	focalLength = .1;
	maxMarches = 100;

	cameraPos = [0, 0, 0, -1];

	normalVec = [0, 0, 0, -1];
	upVec = [0, 0, 1, 0];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];

	//The first is +/- 1 for moving forward, and the second is for moving right.
	movingAmount = [0, 0];
	movingSpeed = 0;

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
			
			uniform vec4 cameraPos;
			uniform vec4 normalVec;
			uniform vec4 upVec;
			uniform vec4 rightVec;
			uniform vec4 forwardVec;
			
			uniform float focalLength;
			
			const float lightBrightness = 1.0;
			
			uniform int resolution;
			
			const float clipDistance = 1000.0;
			const float epsilon = 0.00001;
			uniform int maxMarches;
			uniform float stepFactor;
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .07;
			const float fov = .75;
			const float radius = .3;



			float getBanding(float amount, float numBands)
			{
				return 1.0 - floor(mod(amount * numBands, 2.0)) / 2.0;
			}
			
			
			
			float distanceEstimator(vec4 pos)
			{
				float distance1 = acos(pos.x) - radius;
				float distance2 = acos(-pos.x) - radius;
				float distance3 = acos(pos.y) - radius;
				float distance4 = acos(-pos.y) - radius;
				float distance5 = acos(pos.z) - radius;
				float distance6 = acos(-pos.z) - radius;
				float distance7 = acos(pos.w) - radius;

				float minDistance = min(
					min(
						min(distance1, distance2),
						min(distance3, distance4)
					),
					min(
						min(distance5, distance6),
						distance7
					)
				);

				return minDistance;
			}
			
			vec3 getColor(vec4 pos)
			{
				float distance1 = acos(pos.x) - radius;
				float distance2 = acos(-pos.x) - radius;
				float distance3 = acos(pos.y) - radius;
				float distance4 = acos(-pos.y) - radius;
				float distance5 = acos(pos.z) - radius;
				float distance6 = acos(-pos.z) - radius;
				float distance7 = acos(pos.w) - radius;

				float minDistance = min(
					min(
						min(distance1, distance2),
						min(distance3, distance4)
					),
					min(
						min(distance5, distance6),
						distance7
					)
				);

				if (minDistance == distance1)
				{
					return vec3(1.0, 0.0, 0.0) * getBanding(pos.y + pos.z + pos.w, 10.0);
				}

				if (minDistance == distance2)
				{
					return vec3(0.0, 1.0, 1.0) * getBanding(pos.y + pos.z + pos.w, 10.0);
				}

				if (minDistance == distance3)
				{
					return vec3(0.0, 1.0, 0.0) * getBanding(pos.x + pos.z + pos.w, 10.0);
				}

				if (minDistance == distance4)
				{
					return vec3(1.0, 0.0, 1.0) * getBanding(pos.x + pos.z + pos.w, 10.0);
				}

				if (minDistance == distance5)
				{
					return vec3(0.0, 0.0, 1.0) * getBanding(pos.x + pos.y + pos.w, 10.0);
				}

				if (minDistance == distance6)
				{
					return vec3(1.0, 1.0, 0.0) * getBanding(pos.x + pos.y + pos.w, 10.0);
				}

				if (minDistance == distance7)
				{
					return vec3(1.0, 1.0, 1.0) * getBanding(pos.x + pos.y + pos.z, 10.0);
				}
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
				
				
				
				for (int iteration = 0; iteration < 1024; iteration++)
				{
					if (iteration == maxMarches)
					{
						break;
					}
					
					
					
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
					
					t += distance;
				}
				
				return finalColor;
			}
			
			
			
			void main(void)
			{
				gl_FragColor = vec4(raymarch(normalize(forwardVec * focalLength + rightVec * uv.x * aspectRatioX * focalLength * fov + upVec * uv.y / aspectRatioY * focalLength * fov)), 1.0);
			}
		`;



		const options =
		{
			renderer: "gpu",

			shader: fragShaderSource,

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

		this.wilson.render.initUniforms([
			"aspectRatioX",
			"aspectRatioY",
			"resolution",

			"cameraPos",
			"normalVec",
			"upVec",
			"rightVec",
			"forwardVec",

			"focalLength",
			"maxMarches",
			"stepFactor",
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



		const distanceToScene = this.distanceEstimator(...this.cameraPos);

		this.movingSpeed = distanceToScene;

		this.pan.update(timeElapsed);
		this.zoom.update(timeElapsed);

		this.calculateVectors(timeElapsed);
		this.correctVectors();
		

		
		this.focalLength = distanceToScene / 2;



		this.wilson.gl.uniform1f(
			this.wilson.uniforms["focalLength"],
			this.focalLength
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

		this.wilson.render.drawFrame();



		if (!this.animationPaused)
		{
			window.requestAnimationFrame(this.drawFrame.bind(this));
		}
	}



	distanceEstimator(x, y, z, w)
	{
		return Math.min(
			Math.min(
				Math.min(Math.acos(x) - .1, Math.acos(-x) - .1),
				Math.min(Math.acos(y) - .1, Math.acos(-y) - .1)
			),
			Math.min(Math.acos(z) - .1, Math.acos(-z) - .1)
		);
	}



	calculateVectors(timeElapsed, ignoreMovingForward = false)
	{
		//If there's been any rotation, it's simplest to handle that now.
		const rotationChangeX = this.lastWorldCenterX - this.wilson.worldCenterX;
		const rotationChangeY = this.lastWorldCenterY - this.wilson.worldCenterY;

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



		//The first order of business is to update the position.
		for (let i = 0; i < 4; i++)
		{
			//This will change with the geometry.
			this.cameraPos[i] =
				Math.cos(dt) * this.cameraPos[i]
				+ Math.sin(dt) * tangentVec[i];
		}
		
		
		//Since we're only doing a linear approximation, this position won't be exactly
		//on the manifold. Therefore, we'll do a quick correction to get it back.
		this.correctCameraPos();

		

		//Now we get the tangent space to the manifold. Here, the function is x^2+y^2+z^2+w^2=1,
		//so its gradient is (2x, 2y, 2z, 2w).
		
		this.normalVec = ThurstonGeometry.normalize([
			this.cameraPos[0],
			this.cameraPos[1],
			this.cameraPos[2],
			this.cameraPos[3]
		]);
		
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



	correctCameraPos()
	{
		//Here, we just want the magnitude to be equal to 1 (this will be more complicated
		//for other manifolds).
		const magnitude = ThurstonGeometry.magnitude(this.cameraPos);

		this.cameraPos[0] /= magnitude;
		this.cameraPos[1] /= magnitude;
		this.cameraPos[2] /= magnitude;
		this.cameraPos[3] /= magnitude;
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
	rotateVectors({
		vec1,
		vec2,
		theta
	})
	{
		//Construct the matrix to convert to the standard basis.
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

		// const finalMatrix = this.math.multiply(toStandardBasisMatrix, rotateMatrix);

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
			if (aspectRatio >= 1)
			{
				imageWidth = this.resolution;
				imageHeight = Math.floor(this.resolution / aspectRatio);
			}

			else
			{
				imageWidth = Math.floor(this.resolution * aspectRatio);
				imageHeight = this.resolution;
			}
		}

		else
		{
			imageWidth = this.resolution;
			imageHeight = this.resolution;
		}



		this.wilson.changeCanvasSize(imageWidth, imageHeight);



		if (imageWidth >= imageHeight)
		{
			this.wilson.gl.uniform1f(
				this.wilson.uniforms["aspectRatioX"],
				imageWidth / imageHeight
			);

			this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatioY"], 1);
		}

		else
		{
			this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatioX"], 1);

			this.wilson.gl.uniform1f(
				this.wilson.uniforms["aspectRatioY"],
				imageWidth / imageHeight
			);
		}

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