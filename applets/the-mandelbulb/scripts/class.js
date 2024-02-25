import anime from "/scripts/anime.js";
import { RaymarchApplet } from "/scripts/src/applets.js";
import { aspectRatio } from "/scripts/src/layout.js";
import { addTemporaryListener } from "/scripts/src/main.js";
import { Wilson } from "/scripts/wilson.js";

export class Mandelbulb extends RaymarchApplet
{
	theta = 4.6601;
	phi = 2.272;
	cameraPos = [0.0718, 1.6264, 1.4416];

	power = 8;
	c = [0, 0, 0];
	cOld = [0, 0, 0];
	cDelta = [0, 0, 0];
	maxIterations = 16;

	rotationAngleX = 0;
	rotationAngleY = 0;
	rotationAngleZ = 0;

	juliaProportion = 0;



	constructor({
		canvas,
	}) {
		super(canvas);

		const fragShaderSource = /* glsl */`
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
			
			
			
			uniform mat3 rotationMatrix;
			
			uniform float power;
			uniform vec3 c;
			uniform float juliaProportion;
			
			
			
			float distanceEstimator(vec3 pos)
			{
				vec3 z = pos;
				
				float r = length(z);
				float dr = 1.0;
				
				for (int iteration = 0; iteration < 100; iteration++)
				{
					if (r > 16.0 || iteration >= maxIterations)
					{
						break;
					}
					
					float theta = acos(z.z / r);
					
					float phi = atan(z.y, z.x);
					
					dr = pow(r, power - 1.0) * power * dr + 1.0;
					
					theta *= power;
					
					phi *= power;
					
					z = pow(r, power) * vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));
					
					z += mix(pos, c, juliaProportion);
					
					z = rotationMatrix * z;
					
					r = length(z);
				}
				
				
				
				return .5 * log(r) * r / dr;
			}
			
			
			
			vec3 getColor(vec3 pos)
			{
				vec3 z = pos;
				
				float r = length(z);
				float dr = 1.0;
				
				vec3 color = vec3(1.0, 1.0, 1.0);
				float colorScale = .5;
				
				for (int iteration = 0; iteration < 100; iteration++)
				{
					if (r > 16.0 || iteration >= maxIterations)
					{
						break;
					}
					
					float theta = acos(z.z / r);
					
					float phi = atan(z.y, z.x);
					
					dr = pow(r, power - 1.0) * power * dr + 1.0;
					
					theta *= power;
					
					phi *= power;
					
					z = pow(r, power) * vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));
					
					z += mix(pos, c, juliaProportion);
					
					z = rotationMatrix * z;
					
					r = length(z);
					
					color = mix(color, abs(z / r), colorScale);
					
					colorScale *= .5;
				}
				
				color /= max(max(color.x, color.y), color.z);
				
				
				
				return color;
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
				
				//int slowedDown = 0;
				
				
				
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
					
					//Uncomment to add aggressive understepping when close to the fractal boundary, which helps to prevent flickering but is a significant performance hit.
					/*
					else if (lastDistance / distance > .9999 && slowedDown == 0)
					{
						rayDirectionVec = normalize(startPos - cameraPos) * .125;
						
						slowedDown = 1;
					}
					
					else if (lastDistance / distance <= .9999 && slowedDown == 1)
					{
						rayDirectionVec = normalize(startPos - cameraPos) * .9;
						
						slowedDown = 0;
					}
					*/
					
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

			canvasWidth: 500,
			canvasHeight: 500,

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
			"power",
			"c",
			"juliaProportion",
			"rotationMatrix",
			"maxMarches",
			"stepFactor",
			"maxIterations"
		]);


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

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["power"],
			8
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms["c"],
			this.c
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["juliaProportion"],
			0
		);

		this.wilson.gl.uniformMatrix3fv(
			this.wilson.uniforms["rotationMatrix"],
			false,
			[1, 0, 0, 0, 1, 0, 0, 0, 1]
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



		const boundFunction = () => this.changeResolution();
		addTemporaryListener({
			object: window,
			event: "resize",
			callback: boundFunction
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
		this.moveUpdate(timeElapsed);

		
		
		this.wilson.worldCenterY = Math.min(
			Math.max(
				this.wilson.worldCenterY,
				-Math.PI + .01
			),
			-.01
		);
		
		this.theta = -this.wilson.worldCenterX;
		this.phi = -this.wilson.worldCenterY;



		this.wilson.render.drawFrame();



		if (!this.animationPaused)
		{
			window.requestAnimationFrame(this.drawFrame.bind(this));
		}
	}



	updateRotationMatrix()
	{
		const matZ = [
			[Math.cos(this.rotationAngleZ), -Math.sin(this.rotationAngleZ), 0],
			[Math.sin(this.rotationAngleZ), Math.cos(this.rotationAngleZ), 0],
			[0, 0, 1]
		];

		const matY = [
			[Math.cos(this.rotationAngleY), 0, -Math.sin(this.rotationAngleY)],
			[0, 1, 0],
			[Math.sin(this.rotationAngleY), 0, Math.cos(this.rotationAngleY)]
		];

		const matX = [
			[1, 0, 0],
			[0, Math.cos(this.rotationAngleX), -Math.sin(this.rotationAngleX)],
			[0, Math.sin(this.rotationAngleX), Math.cos(this.rotationAngleX)]
		];

		const matTotal = RaymarchApplet.matMul(RaymarchApplet.matMul(matZ, matY), matX);

		this.wilson.gl.uniformMatrix3fv(
			this.wilson.uniforms["rotationMatrix"],
			false,
			[
				matTotal[0][0],
				matTotal[1][0],
				matTotal[2][0],
				matTotal[0][1],
				matTotal[1][1],
				matTotal[2][1],
				matTotal[0][2],
				matTotal[1][2],
				matTotal[2][2]
			]
		);
	}



	distanceEstimator(x, y, z)
	{
		const mutableZ = [x, y, z];

		let r = 0.0;
		let dr = 1.0;

		for (let iteration = 0; iteration < this.maxIterations; iteration++)
		{
			r = Math.sqrt(RaymarchApplet.dotProduct(mutableZ, mutableZ));

			if (r > 16.0)
			{
				break;
			}

			let theta = Math.acos(mutableZ[2] / r);

			let phi = Math.atan2(mutableZ[1], mutableZ[0]);

			dr = Math.pow(r, this.power - 1.0) * this.power * dr + 1.0;

			theta *= this.power;

			phi *= this.power;

			const scaledR = Math.pow(r, this.power);

			mutableZ[0] = scaledR * Math.sin(theta) * Math.cos(phi)
				+ ((1 - this.juliaProportion) * x + this.juliaProportion * this.c[0]);

			mutableZ[1] = scaledR * Math.sin(theta) * Math.sin(phi)
				+ ((1 - this.juliaProportion) * y + this.juliaProportion * this.c[1]);

			mutableZ[2] = scaledR * Math.cos(theta)
				+ ((1 - this.juliaProportion) * z + this.juliaProportion * this.c[2]);



			// Apply the rotation matrix.

			const tempX = mutableZ[0];
			const tempY = mutableZ[1];
			const tempZ = mutableZ[2];

			const matZ = [
				[Math.cos(this.rotationAngleZ), -Math.sin(this.rotationAngleZ), 0],
				[Math.sin(this.rotationAngleZ), Math.cos(this.rotationAngleZ), 0],
				[0, 0, 1]
			];

			const matY = [
				[Math.cos(this.rotationAngleY), 0, -Math.sin(this.rotationAngleY)],
				[0, 1, 0],
				[Math.sin(this.rotationAngleY), 0, Math.cos(this.rotationAngleY)]
			];

			const matX = [
				[1, 0, 0],
				[0, Math.cos(this.rotationAngleX), -Math.sin(this.rotationAngleX)],
				[0, Math.sin(this.rotationAngleX), Math.cos(this.rotationAngleX)]
			];

			const matTotal = RaymarchApplet.matMul(RaymarchApplet.matMul(matZ, matY), matX);

			mutableZ[0] = matTotal[0][0] * tempX + matTotal[0][1] * tempY + matTotal[0][2] * tempZ;
			mutableZ[1] = matTotal[1][0] * tempX + matTotal[1][1] * tempY + matTotal[1][2] * tempZ;
			mutableZ[2] = matTotal[2][0] * tempX + matTotal[2][1] * tempY + matTotal[2][2] * tempZ;
		}



		return 0.5 * Math.log(r) * r / dr;
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



	switchBulb()
	{
		if (this.juliaProportion === 0)
		{
			this.wilson.gl.uniform3fv(this.wilson.uniforms["c"], this.c);
		}

		const dummy = { t: 0 };

		const oldJuliaProportion = this.juliaProportion;
		const newJuliaProportion = this.juliaProportion === 0 ? 1 : 0;

		anime({
			targets: dummy,
			t: 1,
			duration: 1000,
			easing: "easeOutSine",
			update: () =>
			{
				this.juliaProportion = (1 - dummy.t) * oldJuliaProportion
					+ dummy.t * newJuliaProportion;

				this.wilson.gl.uniform1f(
					this.wilson.uniforms["juliaProportion"],
					this.juliaProportion
				);
			}
		});
	}
}