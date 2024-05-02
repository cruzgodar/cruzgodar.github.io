import { getMinGlslString } from "/scripts/applets/applet.js";
import { RaymarchApplet } from "/scripts/applets/raymarchApplet.js";
import { aspectRatio } from "/scripts/src/layout.js";
import { addTemporaryListener } from "/scripts/src/main.js";
import { Wilson } from "/scripts/wilson.js";

export class HopfFibration extends RaymarchApplet
{
	cameraPos = [2, 2, 2];
	theta = 3.7518;
	phi = 2.1482;

	// This is in addition to the north and south poles.
	numLatitudes = 3;
	numLongitudesPerLatitude = 15;


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

			uniform int imageSize;
			
			uniform float focalLength;
			
			const vec3 lightPos = vec3(50.0, 70.0, 100.0);
			const float lightBrightness = 2.5;
			
			const float clipDistance = 1000.0;
			const int maxMarches = 100;
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .2;
			


			float torusDistance(vec3 pos, vec3 center, vec3 normal, float radius)
			{
				vec3 movedPos = pos - center;

				float posNComponent = dot(movedPos, normal);

				return length(
					vec2(
						length(movedPos - posNComponent * normal) - radius,
						posNComponent
					)
				) - 0.1;
			}
			
			float distanceEstimator(vec3 pos)
			{
				${this.getDistanceEstimatorGlsl()}

				return minDistance;
			}
			
			vec3 getColor(vec3 pos)
			{
				return vec3(1.0, 0.0, 0.0);
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

				for (int iteration = 0; iteration < maxMarches; iteration++)
				{
					vec3 pos = startPos + t * rayDirectionVec;
					
					float distanceToScene = distanceEstimator(pos);
					
					epsilon = max(.0000006, 0.01 * t / min(float(imageSize), 500.0));
					
					if (distanceToScene < epsilon)
					{
						return computeShading(pos, iteration);
					}
					
					else if (t > clipDistance)
					{
						return fogColor;
					}
					
					t += distanceToScene;
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



		const boundFunction = () => this.changeResolution();
		addTemporaryListener({
			object: window,
			event: "resize",
			callback: boundFunction
		});



		this.resume();
	}



	getDistanceEstimatorGlsl()
	{
		let glsl = "";
		let index = 3;

		glsl += /* glsl */`
			float distance1 = torusDistance(pos, vec3(0), vec3(0, 0, 1), 1.0);
			float distance2 = torusDistance(pos, vec3(0), vec3(0, 1, 0), 1.0);
		`;

		glsl += /* glsl */`
			float minDistance = ${getMinGlslString("distance", 2)};
		`;

		return glsl;
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
		return 1.0;
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