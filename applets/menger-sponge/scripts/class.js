import { RaymarchApplet } from "/scripts/applets/raymarchApplet.js";
import { aspectRatio } from "/scripts/src/layout.js";
import { addTemporaryListener } from "/scripts/src/main.js";
import { Wilson } from "/scripts/wilson.js";

export class MengerSponge extends RaymarchApplet
{
	scale = 3;
	separation = 1;

	maxIterations = 2;

	cameraPos = [1.749, 1.75, 1.751];
	theta = 1.25 * Math.PI;
	phi = 2.1539;



	constructor({ canvas })
	{
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
			
			const vec3 lightPos = vec3(50.0, 70.0, 100.0);
			const float lightBrightness = 2.0;
			
			uniform int imageSize;
			
			
			
			const float clipDistance = 1000.0;
			const int maxMarches = 256;
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .2;
			const int maxIterations = ${this.maxIterations};
			
			uniform float scale;
			uniform float separation;
			

			
			float distanceEstimator(vec3 pos)
			{
				// We're very interested in minimizing the number of distances we compute.
				// By taking the absolute value of pos, we limit ourselves to the first octant,
				// and then we can arrange for the xyz values to be in ascending order with some
				// cheeky min and max business. That ensures that the nearest edge block is the one
				// with scale center at (0, 1, 1).

				vec3 mutablePos = abs(pos);
				float maxAbsPos = max(max(mutablePos.x, mutablePos.y), mutablePos.z);
				float minAbsPos = min(min(mutablePos.x, mutablePos.y), mutablePos.z);
				float sumAbsPos = mutablePos.x + mutablePos.y + mutablePos.z;
				mutablePos = vec3(minAbsPos, sumAbsPos - minAbsPos - maxAbsPos, maxAbsPos);

				float totalDistance;
				float totalScale = 1.0;

				// This awkwardness is because we want to avoid changing the scale on the final loop.
				float nextScale = 1.0;

				float invScale = 1.0 / scale;
				float factor = 2.0 * scale / (scale - 1.0);

				for (int iteration = 0; iteration < maxIterations; iteration++)
				{
					totalScale *= nextScale;

					float distanceToCorner = max(maxAbsPos - 1.0, invScale - minAbsPos);
					
					float distanceToEdgeShort = mutablePos.x - invScale;
					float distanceToEdgeLong = max(
						abs(mutablePos.y - 0.5 * (1.0 + invScale)) - 0.5 * (1.0 - invScale),
						abs(mutablePos.z - 0.5 * (1.0 + invScale)) - 0.5 * (1.0 - invScale)
					);
					float distanceToEdge = max(distanceToEdgeShort, distanceToEdgeLong);

					if (distanceToCorner < distanceToEdge)
					{
						totalDistance = distanceToCorner;

						// Scale all directions by 2s/(s-1) from (1, 1, 1).
						mutablePos = factor * mutablePos - (factor - 1.0) * vec3(1.0);

						nextScale = factor;
					}

					else
					{
						totalDistance = distanceToEdge;

						// Scale x by s and y and z by 2s/(s-1) from (0, 1, 1). The second term is equal to
						// vec3(scale - 1.0, factor - 1.0, factor - 1.0) * vec3(0.0, 1.0, 1.0).
						mutablePos = vec3(scale, factor, factor) * mutablePos
							- vec3(0.0, factor - 1.0, factor - 1.0);
						
						if (distanceToEdgeShort < distanceToEdgeLong)
						{
							nextScale = scale;
						}

						else
						{
							nextScale = factor;
						}
					}

					mutablePos = abs(mutablePos);
					maxAbsPos = max(max(mutablePos.x, mutablePos.y), mutablePos.z);
					minAbsPos = min(min(mutablePos.x, mutablePos.y), mutablePos.z);
					sumAbsPos = mutablePos.x + mutablePos.y + mutablePos.z;
					mutablePos = vec3(minAbsPos, sumAbsPos - minAbsPos - maxAbsPos, maxAbsPos);
				}
				
				return totalDistance / totalScale;
			}
			
			
			
			vec3 getColor(vec3 pos)
			{
				vec3 mutablePos = abs(pos);
				float maxAbsPos = max(max(mutablePos.x, mutablePos.y), mutablePos.z);
				float minAbsPos = min(min(mutablePos.x, mutablePos.y), mutablePos.z);
				float sumAbsPos = mutablePos.x + mutablePos.y + mutablePos.z;
				mutablePos = vec3(minAbsPos, sumAbsPos - minAbsPos - maxAbsPos, maxAbsPos);

				float totalDistance;

				float invScale = 1.0 / scale;

				for (int iteration = 0; iteration < maxIterations; iteration++)
				{
					float distanceToCorner = max(maxAbsPos - 1.0, invScale - minAbsPos);
					float distanceToEdge = max(
						mutablePos.x - invScale,
						max(
							abs(mutablePos.y - 0.5 * (1.0 + invScale)) - 0.5 * (1.0 - invScale),
							abs(mutablePos.z - 0.5 * (1.0 + invScale)) - 0.5 * (1.0 - invScale)
						)
					);

					if (distanceToCorner < distanceToEdge)
					{
						totalDistance = distanceToCorner;

						// Scale all directions by 2s/(s-1) from (1, 1, 1).
						float factor = 2.0 * scale / (scale - 1.0);
						mutablePos = factor * mutablePos - (factor - 1.0) * vec3(1.0);
					}

					else
					{
						totalDistance = distanceToEdge;

						// Scale x by s and y and z by 2s/(s-1) from (0, 1, 1).
						// The second term is equal to
						// vec3(scale - 1.0, factor - 1.0, factor - 1.0) * vec3(0.0, 1.0, 1.0).
						float factor = 2.0 * scale / (scale - 1.0);
						mutablePos = vec3(scale, factor, factor) * mutablePos
							- vec3(0.0, factor - 1.0, factor - 1.0);
					}

					mutablePos = abs(mutablePos);
					maxAbsPos = max(max(mutablePos.x, mutablePos.y), mutablePos.z);
					minAbsPos = min(min(mutablePos.x, mutablePos.y), mutablePos.z);
					sumAbsPos = mutablePos.x + mutablePos.y + mutablePos.z;
					mutablePos = vec3(minAbsPos, sumAbsPos - minAbsPos - maxAbsPos, maxAbsPos);
				}
				
				if (totalDistance < 0.0)
				{
					return vec3(1.0, 0.0, 0.0);
				}

				return vec3(1.0, 1.0, 1.0);
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
				
				float lightIntensity = lightBrightness * max(dotProduct, -.4 * dotProduct);
				
				//The last factor adds ambient occlusion.
				vec3 color = getColor(pos) * lightIntensity * max((1.0 - float(iteration) / float(64)), 0.0);
				
				
				
				//Apply fog.
				return mix(color, fogColor, 1.0 - exp(-distance(pos, cameraPos) * fogScaling));
			}
			
			
			
			vec3 raymarch(vec3 startPos)
			{
				//That factor of .9 is important -- without it, we're always stepping as far as possible, which results in artefacts and weirdness.
				vec3 rayDirectionVec = normalize(startPos - cameraPos) * .9;
				
				vec3 finalColor = fogColor;
				
				float epsilon = .0000001;
				
				float t = 0.0;
				
				
				
				for (int iteration = 0; iteration < maxMarches; iteration++)
				{
					vec3 pos = startPos + t * rayDirectionVec;
					
					float distance = distanceEstimator(pos);
					
					//This lowers the detail far away, which makes everything run nice and fast.
					epsilon = max(.0000006, 1.0 * t / float(imageSize));
					
					
					
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
				vec3 finalColor = raymarch(imagePlaneCenterPos + rightVec * uv.x * aspectRatioX + upVec * uv.y / aspectRatioY);
				
				gl_FragColor = vec4(finalColor.xyz, 1.0);
			}
		`;



		const options =
		{
			renderer: "gpu",

			shader: fragShaderSource,

			canvasWidth: 500,
			canvasHeight: 500,

			worldCenterX: -this.theta,
			worldCenterY: -this.phi,
		


			useFullscreen: true,

			trueFullscreen: true,

			useFullscreenButton: true,

			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",

			switchFullscreenCallback: this.changeResolution.bind(this),



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
			"scale",
			"separation"
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
			this.wilson.uniforms["scale"],
			this.scale
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["separation"],
			this.separation
		);



		const boundFunction = () => this.changeResolution();
		addTemporaryListener({
			object: window,
			event: "resize",
			callback: boundFunction
		});



		this.resume();
	}



	prepareFrame(timeElapsed)
	{
		this.pan.update(timeElapsed);
		this.zoom.update(timeElapsed);
		this.moveUpdate(timeElapsed);
	}

	drawFrame()
	{
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
	}



	distanceEstimator(x, y, z)
	{
		let mutablePos = [
			Math.abs(x),
			Math.abs(y),
			Math.abs(z)
		];

		let maxAbsPos = Math.max(Math.max(mutablePos[0], mutablePos[1]), mutablePos[2]);
		let minAbsPos = Math.min(Math.min(mutablePos[0], mutablePos[1]), mutablePos[2]);
		let sumAbsPos = mutablePos[0] + mutablePos[1] + mutablePos[2];
		mutablePos = [minAbsPos, sumAbsPos - minAbsPos - maxAbsPos, maxAbsPos];

		let totalDistance;
		let totalScale = 1;
		let nextScale = 1;

		const invScale = 1 / this.scale;
		const factor = 2 * this.scale / (this.scale - 1.0);

		for (let iteration = 0; iteration < this.maxIterations; iteration++)
		{
			totalScale *= nextScale;

			const distanceToCorner = Math.max(maxAbsPos - 1, invScale - minAbsPos);

			const distanceToEdgeShort = mutablePos[0] - invScale;
			const distanceToEdgeLong = Math.max(
				Math.abs(mutablePos[1] - 0.5 * (1 + invScale)) - 0.5 * (1 - invScale),
				Math.abs(mutablePos[2] - 0.5 * (1 + invScale)) - 0.5 * (1 - invScale)
			);

			const distanceToEdge = Math.max(distanceToEdgeShort, distanceToEdgeLong);

			if (distanceToCorner < distanceToEdge)
			{
				totalDistance = distanceToCorner;

				// Scale all directions by 2s/(s-1) from (1, 1, 1).
				mutablePos = [
					factor * mutablePos[0] - (factor - 1),
					factor * mutablePos[1] - (factor - 1),
					factor * mutablePos[2] - (factor - 1)
				];

				nextScale = factor;
			}

			else
			{
				totalDistance = distanceToEdge;

				// Scale x by s and y and z by 2s/(s-1) from (0, 1, 1).
				// The second term is equal to
				// vec3(scale - 1.0, factor - 1.0, factor - 1.0) * vec3(0.0, 1.0, 1.0).
				mutablePos = [
					this.scale * mutablePos[0],
					factor * mutablePos[1] - (factor - 1),
					factor * mutablePos[2] - (factor - 1)
				];

				if (distanceToEdgeShort < distanceToEdgeLong)
				{
					nextScale = this.scale;
				}

				else
				{
					nextScale = factor;
				}
			}

			mutablePos = [
				Math.abs(mutablePos[0]),
				Math.abs(mutablePos[1]),
				Math.abs(mutablePos[2])
			];

			maxAbsPos = Math.max(Math.max(mutablePos[0], mutablePos[1]), mutablePos[2]);
			minAbsPos = Math.min(Math.min(mutablePos[0], mutablePos[1]), mutablePos[2]);
			sumAbsPos = mutablePos[0] + mutablePos[1] + mutablePos[2];
			mutablePos = [minAbsPos, sumAbsPos - minAbsPos - maxAbsPos, maxAbsPos];
		}

		console.log(Math.abs(totalDistance) / totalScale);
		
		return Math.abs(totalDistance) / totalScale;
	}



	changeResolution(resolution = this.imageSize)
	{
		this.imageSize = Math.max(100, resolution);

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

		this.wilson.gl.uniform1i(this.wilson.uniforms["imageSize"], this.imageSize);



		this.needNewFrame = true;
	}
}