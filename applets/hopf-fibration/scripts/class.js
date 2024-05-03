import { getFloatGlsl, getMinGlslString, getVectorGlsl } from "/scripts/applets/applet.js";
import { RaymarchApplet } from "/scripts/applets/raymarchApplet.js";
import { aspectRatio } from "/scripts/src/layout.js";
import { addTemporaryListener } from "/scripts/src/main.js";
import { Wilson } from "/scripts/wilson.js";

function hsvToRgb(h, s, v)
{
	function f(n)
	{
		const k = (n + 6 * h) % 6;
		return v - v * s * Math.max(0, Math.min(k, Math.min(4 - k, 1)));
	}

	return [255 * f(5), 255 * f(3), 255 * f(1)];
}

export class HopfFibration extends RaymarchApplet
{
	cameraPos = [2, 2, 2];
	theta = 3.7518;
	phi = 2.1482;

	// This is in addition to the north and south poles.
	numLatitudes = 4;
	numLongitudesPerLatitude = 16;


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
			uniform float fiberThickness;
			
			uniform float focalLength;
			
			const vec3 lightPos = vec3(50.0, 70.0, 100.0);
			const float lightBrightness = 2.0;
			
			const float clipDistance = 1000.0;
			const int maxMarches = 100;
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .05;
			


			float torusDistance(vec3 pos, vec3 center, vec3 normal, float radius)
			{
				vec3 movedPos = pos - center;

				float posNComponent = dot(movedPos, normal);

				return length(
					vec2(
						length(movedPos - posNComponent * normal) - radius,
						posNComponent
					)
				) - fiberThickness;
			}
			
			float distanceEstimator(vec3 pos)
			{
				${this.getDistanceEstimatorGlsl()}

				return minDistance;
			}
			
			vec3 getColor(vec3 pos)
			{
				${this.getDistanceEstimatorGlsl()}

				${this.getGetColorGlsl()}
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
				
				float epsilon = .00001;
				
				float t = 0.0;

				for (int iteration = 0; iteration < maxMarches; iteration++)
				{
					vec3 pos = cameraPos + t * rayDirectionVec;
					
					float distanceToScene = distanceEstimator(pos);
					
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

		console.log(fragShaderSource);



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
			"fiberThickness",
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
			this.wilson.uniforms["fiberThickness"],
			.05
		);



		const boundFunction = () => this.changeResolution();
		addTemporaryListener({
			object: window,
			event: "resize",
			callback: boundFunction
		});



		this.resume();
	}

	// Point is a length-3 array containing xyz coordinates.
	// This returns [center, normal, radius].
	s2PointToCircle(point)
	{
		if (Math.abs(point[2]) === 1)
		{
			throw new Error("Don't pass the north pole to the projection function!");
		}

		const scalingFactor = 1 / Math.sqrt(2 * (point[2] + 1));

		// We start by choosing a point on the fiber
		// with maximum w component, which will help later.
		const p = [
			0,
			scalingFactor * point[0],
			scalingFactor * point[1],
			scalingFactor * (1 + point[2]),
		];

		// Next we'll look at the image of this point under the projection.
		const projectedP = [
			p[0] / (1 - p[3]),
			p[1] / (1 - p[3]),
			p[2] / (1 - p[3])
		];

		// Now we'll do the same for the antipode to p. Since we started with
		// a point with maximal w-coordinate, this is guaranteed to be antipodal on the output too.
		const projectedPAntipode = [
			-p[0] / (1 + p[3]),
			-p[1] / (1 + p[3]),
			-p[2] / (1 + p[3])
		];

		const center = [
			(projectedP[0] + projectedPAntipode[0]) / 2,
			(projectedP[1] + projectedPAntipode[1]) / 2,
			(projectedP[2] + projectedPAntipode[2]) / 2
		];

		// Now the radius is the distance between projectedP and center.
		const radius = Math.sqrt(
			(projectedP[0] - center[0]) ** 2
			+ (projectedP[1] - center[1]) ** 2
			+ (projectedP[2] - center[2]) ** 2
		);

		// To find the normal vector, we'll start by getting a third point on the circle
		// that's guaranteed to not be collinear with these two.
		const otherP = [
			scalingFactor * (1 + point[2]),
			-scalingFactor * point[1],
			scalingFactor * point[0],
			0
		];

		const projectedOtherP = [
			otherP[0] / (1 - otherP[3]),
			otherP[1] / (1 - otherP[3]),
			otherP[2] / (1 - otherP[3])
		];

		// Finally, we can get a normal vector by taking a cross product
		// of these two.
		const crossProduct = [
			projectedP[1] * projectedOtherP[2] - projectedP[2] * projectedOtherP[1],
			projectedP[2] * projectedOtherP[0] - projectedP[0] * projectedOtherP[2],
			projectedP[0] * projectedOtherP[1] - projectedP[1] * projectedOtherP[0]
		];

		const magnitude = Math.sqrt(
			crossProduct[0] * crossProduct[0]
			+ crossProduct[1] * crossProduct[1]
			+ crossProduct[2] * crossProduct[2]
		);

		const normal = [
			crossProduct[0] / magnitude,
			crossProduct[1] / magnitude,
			crossProduct[2] / magnitude
		];

		return [center, normal, radius];
	}

	getDistanceEstimatorGlsl()
	{
		let glsl = "";
		let index = 3;

		glsl += /* glsl */`
			float distance1 = torusDistance(pos, vec3(0.0, 0.0, 0.0), vec3(1.0, 0.0, 1.0), 1.0);
			float distance2 = length(pos.yz) - fiberThickness;
		`;

		for (let i = 0; i < this.numLatitudes; i++)
		{
			const phi = (i + 1) / (this.numLatitudes + 1) * Math.PI;

			for (let j = 0; j < this.numLongitudesPerLatitude; j++)
			{
				const theta = j / this.numLongitudesPerLatitude * 2 * Math.PI;

				const s2Point = [
					Math.sin(phi) * Math.cos(theta),
					Math.sin(phi) * Math.sin(theta),
					Math.cos(phi)
				];

				const [center, normal, radius] = this.s2PointToCircle(s2Point);

				glsl += /* glsl */`
					float distance${index} = torusDistance(pos, ${getVectorGlsl(center)}, ${getVectorGlsl(normal)}, ${getFloatGlsl(radius)});
				`;

				index++;
			}
		}

		glsl += /* glsl */`
			float minDistance = ${getMinGlslString("distance", index - 1)};
		`;

		return glsl;
	}

	getGetColorGlsl()
	{
		let glsl = "";
		let index = 3;

		const rgbTop = hsvToRgb(0, .5, 1);
		const rgbBottom = hsvToRgb(6 / 7, .5, 1);

		glsl += /* glsl */`
			if (minDistance == distance1) {return vec3(${rgbBottom[0] / 255}, ${rgbBottom[1] / 255}, ${rgbBottom[2] / 255});}
			if (minDistance == distance2) {return vec3(${rgbTop[0] / 255}, ${rgbTop[1] / 255}, ${rgbTop[2] / 255});}
		`;

		for (let i = 0; i < this.numLatitudes; i++)
		{
			const phi = (i + 1) / (this.numLatitudes + 1) * Math.PI;

			for (let j = 0; j < this.numLongitudesPerLatitude; j++)
			{
				const theta = j / this.numLongitudesPerLatitude * 2 * Math.PI;

				const rgb = hsvToRgb(
					phi / (Math.PI) * 6 / 7,
					Math.abs((theta % Math.PI) - Math.PI / 2) / (Math.PI / 2),
					1
				);

				glsl += /* glsl */`
					if (minDistance == distance${index}) {return vec3(${rgb[0] / 255}, ${rgb[1] / 255}, ${rgb[2] / 255});}
				`;

				index++;
			}
		}

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



		this.needNewFrame = true;
	}
}