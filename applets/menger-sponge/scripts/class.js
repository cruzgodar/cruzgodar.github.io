import { Applet } from "/scripts/applets/applet.js";
import { RaymarchApplet } from "/scripts/applets/raymarchApplet.js";
import { addTemporaryListener } from "/scripts/src/main.js";
import { Wilson } from "/scripts/wilson.js";

const changeColorGlsl = /* glsl */`
	vec3 colorAdd = abs(mutablePos / effectiveScale);
	color = normalize(color + colorAdd * colorScale);
	colorScale *= 0.5;
`;

function getDistanceEstimatorGlsl(useForGetColor = false)
{
	// We're very interested in minimizing the number of distances we compute.
	// By taking the absolute value of pos, we limit ourselves to the first octant,
	// and then we can arrange for the xyz values to be in ascending order with some
	// cheeky min and max business. That ensures that the nearest edge block is the one
	// with scale center at (0, 1, 1).
	return /* glsl */`
		vec3 mutablePos = abs(pos);
		float maxAbsPos = max(max(mutablePos.x, mutablePos.y), mutablePos.z);
		float minAbsPos = min(min(mutablePos.x, mutablePos.y), mutablePos.z);
		float sumAbsPos = mutablePos.x + mutablePos.y + mutablePos.z;
		mutablePos = vec3(minAbsPos, sumAbsPos - minAbsPos - maxAbsPos, maxAbsPos);

		${useForGetColor ? "vec3 color = vec3(0.25); float colorScale = 0.5;" : ""}

		float totalDistance;
		vec3 totalScale = vec3(1.0, 1.0, 1.0);
		float effectiveScale;

		float invScale = 1.0 / scale;
		float cornerFactor = 2.0 * scale / (separation * scale - 1.0);
		float edgeFactor = 2.0 * scale / (scale - 1.0);

		vec3 cornerScaleCenter = (cornerFactor - 1.0) * vec3(
			(1.0 + separation * scale) / (1.0 + 2.0 * scale - separation * scale)
		);
		vec3 edgeScaleCenter = vec3(0.0, edgeFactor - 1.0, edgeFactor - 1.0);

		float cornerRadius = 0.5 * (separation - invScale);
		float cornerCenter = 0.5 * (separation + invScale);

		float edgeLongRadius = invScale;
		float edgeShortRadius = 0.5 * (1.0 - invScale);
		float edgeCenter = 0.5 * (1.0 + invScale);

		for (int iteration = 0; iteration < maxIterations; iteration++)
		{
			if (iteration == iterations)
			{
				break;
			}

			float distanceToCornerX = abs(mutablePos.x - cornerCenter) - cornerRadius;
			float distanceToCornerY = abs(mutablePos.y - cornerCenter) - cornerRadius;
			float distanceToCornerZ = abs(mutablePos.z - cornerCenter) - cornerRadius;
			float distanceToCorner = max(distanceToCornerX, max(distanceToCornerY, distanceToCornerZ));
			
			float distanceToEdgeX = abs(mutablePos.x) - edgeLongRadius;
			float distanceToEdgeY = abs(mutablePos.y - edgeCenter) - edgeShortRadius;
			float distanceToEdgeZ = abs(mutablePos.z - edgeCenter) - edgeShortRadius;
			float distanceToEdge = max(distanceToEdgeX, max(distanceToEdgeY, distanceToEdgeZ));

			if (distanceToCorner < distanceToEdge)
			{
				totalDistance = distanceToCorner;

				if (distanceToCornerX > max(distanceToCornerY, distanceToCornerZ))
				{
					effectiveScale = totalScale.x;
				}

				else if (distanceToCornerY > max(distanceToCornerX, distanceToCornerZ))
				{
					effectiveScale = totalScale.y;
				}

				else
				{
					effectiveScale = totalScale.z;
				}

				// Scale all directions by 2s/(s-1) from (1, 1, 1) * separation.
				mutablePos = cornerFactor * mutablePos - cornerScaleCenter;

				totalScale *= cornerFactor;
			}

			else
			{
				totalDistance = distanceToEdge;
				
				if (distanceToEdgeX > max(distanceToEdgeY, distanceToEdgeZ))
				{
					effectiveScale = totalScale.x;
				}

				else if (distanceToEdgeY > max(distanceToEdgeX, distanceToEdgeZ))
				{
					effectiveScale = totalScale.y;
				}

				else
				{
					effectiveScale = totalScale.z;
				}

				// Scale x by s and y and z by 2s/(s-1) from (0, 1, 1). The second term is equal to
				mutablePos = vec3(1.0 / edgeLongRadius, edgeFactor, edgeFactor) * mutablePos - edgeScaleCenter;

				totalScale *= vec3(1.0 / edgeLongRadius, edgeFactor, edgeFactor);
			}

			${useForGetColor ? changeColorGlsl : ""}

			mutablePos = abs(mutablePos);
			maxAbsPos = max(max(mutablePos.x, mutablePos.y), mutablePos.z);
			minAbsPos = min(min(mutablePos.x, mutablePos.y), mutablePos.z);
			sumAbsPos = mutablePos.x + mutablePos.y + mutablePos.z;
			mutablePos = vec3(minAbsPos, sumAbsPos - minAbsPos - maxAbsPos, maxAbsPos);
		}
		
		${useForGetColor ? "if (totalDistance < 0.0) {return vec3(1.0, 0.0, 0.0);} return abs(color);" : "return totalDistance / effectiveScale;"}
	`;
}


export class MengerSponge extends RaymarchApplet
{
	iterations = 16;
	scale = 3;
	separation = 1;

	cameraPos = [2.0160, 1.3095, 1.3729];
	theta = 3.7518;
	phi = 2.1482;



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
			const float lightBrightness = 2.5;
			
			uniform int imageSize;
			
			
			
			const float clipDistance = 1000.0;
			const int maxMarches = 110;
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .05;
			const int maxIterations = 32;
			
			uniform int iterations;
			uniform float scale;
			const float separation = 1.0;
			

			
			float distanceEstimator(vec3 pos)
			{
				${getDistanceEstimatorGlsl()}
			}
			
			
			
			vec3 getColor(vec3 pos)
			{
				${getDistanceEstimatorGlsl(true)}
			}
			
			
			
			vec3 getSurfaceNormal(vec3 pos)
			{
				float xStep1 = distanceEstimator(pos + vec3(.00001, 0.0, 0.0));
				float yStep1 = distanceEstimator(pos + vec3(0.0, .00001, 0.0));
				float zStep1 = distanceEstimator(pos + vec3(0.0, 0.0, .00001));
				
				float xStep2 = distanceEstimator(pos - vec3(.00001, 0.0, 0.0));
				float yStep2 = distanceEstimator(pos - vec3(0.0, .00001, 0.0));
				float zStep2 = distanceEstimator(pos - vec3(0.0, 0.0, .00001));
				
				return normalize(vec3(xStep1 - xStep2, yStep1 - yStep2, zStep1 - zStep2));
			}
			
			
			
			vec3 computeShading(vec3 pos, int iteration)
			{
				vec3 surfaceNormal = getSurfaceNormal(pos);
				
				vec3 lightDirection = normalize(lightPos - pos);
				
				float dotProduct = dot(surfaceNormal, lightDirection);
				
				float lightIntensity = lightBrightness * abs(dotProduct);
				
				//The last factor adds ambient occlusion.
				vec3 color = getColor(pos) * lightIntensity * max((1.0 - float(iteration) / float(maxMarches)), 0.0);
				
				
				
				//Apply fog.
				return mix(color, fogColor, 1.0 - exp(-distance(pos, cameraPos) * fogScaling));
			}
			
			
			
			vec3 raymarch(vec3 startPos)
			{
				vec3 rayDirectionVec = normalize(startPos - cameraPos) * .5;
				
				float epsilon;
				
				float t = 0.0;
				float oldT = 0.0;
				vec3 oldPos = startPos;
				
				// This lets us stop a march early if it passes throughthe plane between the corner and the edge.
				float boundaryX = 1.0 / scale;
				
				for (int iteration = 0; iteration < maxMarches; iteration++)
				{
					vec3 pos = cameraPos + t * rayDirectionVec;
					
					float distance = distanceEstimator(pos);
					
					//This lowers the detail far away, which makes everything run nice and fast.
					epsilon = max(.0000006, 0.01 * scale * scale * scale * t / min(float(imageSize), 500.0));
					
					if (distance < epsilon)
					{
						return computeShading(pos, iteration);
					}
					
					else if (t > clipDistance)
					{
						return fogColor;
					}
					
					
					oldT = t;
					oldPos = pos;
					
					t += distance;
				}
				
				return fogColor;
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
			"iterations",
			"scale",
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

		this.wilson.gl.uniform1i(
			this.wilson.uniforms["iterations"],
			this.iterations
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["scale"],
			this.scale
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
		const totalScale = [1, 1, 1];
		let effectiveScale;

		const invScale = 1 / this.scale;
		const cornerFactor = 2 * this.scale / (this.separation * this.scale - 1);
		const edgeFactor = 2 * this.scale / (this.scale - 1);

		const cornerScaleCenter = [
			(cornerFactor - 1) * (
				(1 + this.separation * this.scale) / (1 + 2 * this.scale
				- this.separation * this.scale)
			),

			(cornerFactor - 1) * (
				(1 + this.separation * this.scale) / (1 + 2 * this.scale
				- this.separation * this.scale)
			),

			(cornerFactor - 1) * (
				(1 + this.separation * this.scale) / (1 + 2 * this.scale
				- this.separation * this.scale)
			)
		];
		
		const edgeScaleCenter = [0, edgeFactor - 1, edgeFactor - 1];

		const cornerRadius = 0.5 * (this.separation - invScale);
		const cornerCenter = 0.5 * (this.separation + invScale);

		const edgeRadius = 0.5 * (1 - invScale);
		const edgeCenter = 0.5 * (1 + invScale);

		for (let iteration = 0; iteration < this.iterations; iteration++)
		{
			const distanceToCornerX = Math.abs(mutablePos[0] - cornerCenter) - cornerRadius;
			const distanceToCornerY = Math.abs(mutablePos[1] - cornerCenter) - cornerRadius;
			const distanceToCornerZ = Math.abs(mutablePos[2] - cornerCenter) - cornerRadius;
			const distanceToCorner = Math.max(
				distanceToCornerX,
				Math.max(distanceToCornerY, distanceToCornerZ)
			);
			
			const distanceToEdgeX = mutablePos[0] - invScale;
			const distanceToEdgeY = Math.abs(mutablePos[1] - edgeCenter) - edgeRadius;
			const distanceToEdgeZ = Math.abs(mutablePos[2] - edgeCenter) - edgeRadius;
			const distanceToEdge = Math.max(
				distanceToEdgeX,
				Math.max(distanceToEdgeY, distanceToEdgeZ)
			);

			if (distanceToCorner < distanceToEdge)
			{
				totalDistance = distanceToCorner;

				if (distanceToCornerX > Math.max(distanceToCornerY, distanceToCornerZ))
				{
					effectiveScale = totalScale[0];
				}

				else if (distanceToCornerY > Math.max(distanceToCornerX, distanceToCornerZ))
				{
					effectiveScale = totalScale[1];
				}

				else
				{
					effectiveScale = totalScale[2];
				}

				// Scale all directions by 2s/(s-1) from (1, 1, 1) * separation.
				mutablePos = [
					cornerFactor * mutablePos[0] - cornerScaleCenter[0],
					cornerFactor * mutablePos[1] - cornerScaleCenter[1],
					cornerFactor * mutablePos[2] - cornerScaleCenter[2]
				];

				totalScale[0] *= cornerFactor;
				totalScale[1] *= cornerFactor;
				totalScale[2] *= cornerFactor;
			}

			else
			{
				totalDistance = distanceToEdge;
				
				if (distanceToEdgeX > Math.max(distanceToEdgeY, distanceToEdgeZ))
				{
					effectiveScale = totalScale[0];
				}

				else if (distanceToEdgeY > Math.max(distanceToEdgeX, distanceToEdgeZ))
				{
					effectiveScale = totalScale[1];
				}

				else
				{
					effectiveScale = totalScale[2];
				}

				mutablePos = [
					this.scale * mutablePos[0] - edgeScaleCenter[0],
					edgeFactor * mutablePos[1] - edgeScaleCenter[1],
					edgeFactor * mutablePos[2] - edgeScaleCenter[2]
				];

				totalScale[0] *= this.scale;
				totalScale[1] *= edgeFactor;
				totalScale[2] *= edgeFactor;
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
		
		return Math.abs(totalDistance) / effectiveScale;
	}



	changeResolution(resolution = this.imageSize)
	{
		this.imageSize = Math.max(100, resolution);

		if (this.wilson.fullscreen.currentlyFullscreen)
		{
			[this.imageWidth, this.imageHeight] = Applet.getEqualPixelFullScreen(this.imageSize);
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