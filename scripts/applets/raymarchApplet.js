import anime from "../anime.js";
import { addTemporaryListener } from "../src/main.js";
import { Wilson } from "../wilson.js";
import { AnimationFrameApplet } from "./animationFrameApplet.js";
import {
	getEqualPixelFullScreen,
	getFloatGlsl,
	getVectorGlsl
} from "./applet.js";

const setUniformFunctions = {
	int: (gl, location, value) => gl.uniform1i(location, value),
	float: (gl, location, value) => gl.uniform1f(location, value),
	vec2: (gl, location, value) => gl.uniform2fv(location, value),
	vec3: (gl, location, value) => gl.uniform3fv(location, value),
	vec4: (gl, location, value) => gl.uniform4fv(location, value),
	mat2: (gl, location, value) => gl.uniformMatrix2fv(location, false, [
		value[0][0], value[1][0],
		value[0][1], value[1][1]
	]),
	mat3: (gl, location, value) => gl.uniformMatrix3fv(location, false, [
		value[0][0], value[1][0], value[2][0],
		value[0][1], value[1][1], value[2][1],
		value[0][2], value[1][2], value[2][2]
	]),
	mat4: (gl, location, value) => gl.uniformMatrix4fv(location, false, [
		value[0][0], value[1][0], value[2][0], value[3][0],
		value[0][1], value[1][1], value[2][1], value[3][1],
		value[0][2], value[1][2], value[2][2], value[3][2],
		value[0][3], value[1][3], value[2][3], value[3][3]
	]),
};

export const edgeDetectShader = /* glsl */`
	precision highp float;
	
	varying vec2 uv;

	uniform sampler2D uTexture;

	uniform float stepSize;

	float getSampleLuminanceDelta(vec3 color, vec2 texCoord)
	{
		vec3 sample = texture2D(uTexture, texCoord).xyz;
		return 0.299 * abs(sample.x - color.x)
			+ 0.587 * abs(sample.y - color.y)
			+ 0.114 * abs(sample.z - color.z);
	}

	void main(void)
	{
		vec2 texCoord = (uv + vec2(1.0)) * 0.5;
		vec3 sample = texture2D(uTexture, texCoord).xyz;
		float sampleN = getSampleLuminanceDelta(sample, texCoord + vec2(0.0, stepSize));
		float sampleS = getSampleLuminanceDelta(sample, texCoord + vec2(0.0, -stepSize));
		float sampleE = getSampleLuminanceDelta(sample, texCoord + vec2(stepSize, 0.0));
		float sampleW = getSampleLuminanceDelta(sample, texCoord + vec2(-stepSize, 0.0));

		float luminance = max(
			max(sampleN, sampleS),
			max(sampleE, sampleW)
		);
		
		gl_FragColor = vec4(
			texture2D(uTexture, texCoord).xyz,
			luminance
		);
	}
`;

export class RaymarchApplet extends AnimationFrameApplet
{
	movingSpeed = .1;
	moveVelocity = [0, 0, 0];

	moveFriction = .96;
	moveStopThreshhold = .01;

	lastTimestamp = -1;

	theta = 0;
	phi = 0;

	imageSize = 500;
	imageWidth = 500;
	imageHeight = 500;

	maxMarches;
	maxShadowMarches;
	maxReflectionMarches;
	clipDistance;

	imagePlaneCenterPos = [];

	forwardVec = [];
	rightVec = [];
	upVec = [];

	cameraPos;
	lightPos;
	lightBrightness;
	useOppositeLight;
	oppositeLightBrightness;
	ambientLight;
	bloomPower;

	fogColor;
	fogScaling;
	stepFactor;
	epsilonScaling;
	minEpsilon;

	useShadows;
	useSoftShadows;
	useReflections;
	useBloom;
	useAntialiasing;
	useFor3DPrinting;

	uniforms = {};
	lockZ;

	speedFactor = 2;
	fovFactor = 1;

	lockedOnOrigin = false;
	distanceFromOrigin = 1;

	distanceEstimatorGlsl;
	getColorGlsl;
	getReflectivityGlsl;
	getGeodesicGlsl;
	addGlsl;



	constructor({
		canvas,
		shader,

		resolution = 500,

		distanceEstimatorGlsl,
		getColorGlsl,
		getReflectivityGlsl = "return 0.2;",
		getGeodesicGlsl = (pos, dir) => `${pos} + t * ${dir}`,
		addGlsl = "",

		uniforms = {},

		theta = 0,
		phi = Math.PI / 2,
		stepFactor = .95,
		epsilonScaling = 1.75,
		minEpsilon = .0000003,

		maxMarches = 128,
		maxShadowMarches = 128,
		maxReflectionMarches = 128,
		clipDistance = 1000,

		cameraPos = [0, 0, 0],
		lockedOnOrigin = true,
		lockZ,

		lightPos = [50, 70, 100],
		lightBrightness = 1,
		useOppositeLight = false,
		oppositeLightBrightness = 0.5,
		ambientLight = 0.25,
		bloomPower = 1,

		fogColor = [0, 0, 0],
		fogScaling = .05,

		useShadows = false,
		useSoftShadows = true,
		useReflections = false,
		useBloom = true,
		useAntialiasing = false,
		useFor3DPrinting = false,
	}) {
		super(canvas);

		this.imageSize = resolution;
		this.imageWidth = resolution;
		this.imageHeight = resolution;

		this.theta = theta;
		this.phi = phi;
		this.stepFactor = stepFactor;
		this.epsilonScaling = epsilonScaling;
		this.minEpsilon = minEpsilon;

		this.maxMarches = maxMarches;
		this.maxShadowMarches = maxShadowMarches;
		this.maxReflectionMarches = maxReflectionMarches;
		this.clipDistance = clipDistance;
		
		this.cameraPos = cameraPos;
		this.lockedOnOrigin = lockedOnOrigin;
		this.lockZ = lockZ;

		this.lightPos = lightPos;
		this.lightBrightness = lightBrightness;
		this.useOppositeLight = useOppositeLight;
		this.oppositeLightBrightness = oppositeLightBrightness;
		this.ambientLight = ambientLight;
		this.bloomPower = bloomPower;

		this.fogColor = fogColor;
		this.fogScaling = fogScaling;

		this.useShadows = useShadows;
		this.useSoftShadows = useSoftShadows;
		this.useReflections = useReflections;
		this.useBloom = useBloom;
		this.useAntialiasing = useAntialiasing;
		this.useFor3DPrinting = useFor3DPrinting;

		this.uniforms = {
			aspectRatioX: ["float", Math.max(this.imageWidth / this.imageHeight, 1)],
			aspectRatioY: ["float", Math.min(this.imageWidth / this.imageHeight, 1)],
			imageSize: ["int", this.imageSize],
			cameraPos: ["vec3", this.cameraPos],
			imagePlaneCenterPos: ["vec3", this.imagePlaneCenterPos],
			forwardVec: ["vec3", this.forwardVec],
			rightVec: ["vec3", this.rightVec],
			upVec: ["vec3", this.upVec],
			epsilonScaling: ["float", this.epsilonScaling],
			minEpsilon: ["float", this.minEpsilon],
			uvCenter: ["vec2", [0, 0]],
			uvScale: ["float", 1],
			...uniforms
		};
		
		this.listenForKeysPressed(
			["w", "s", "a", "d", "q", "e", " ", "shift", "z"],
			(key, pressed) =>
			{
				if (key === "z")
				{
					const dummy = { t: 0 };
					const oldFovFactor = this.fovFactor;
					const newFovFactor = pressed ? 4 : 1;

					const oldEpsilonScaling = this.uniforms.epsilonScaling[1];
					const newEpsilonScaling = pressed
						? this.uniforms.epsilonScaling[1] * 4
						: this.uniforms.epsilonScaling[1] / 4;

					anime({
						targets: dummy,
						t: 1,
						duration: 250,
						easing: "easeOutCubic",
						update: () =>
						{
							this.fovFactor = (1 - dummy.t) * oldFovFactor
								+ dummy.t * newFovFactor;

							this.setUniform(
								"epsilonScaling",
								(1 - dummy.t) * oldEpsilonScaling
									+ dummy.t * newEpsilonScaling
							);

							this.needNewFrame = true;
						}
					});
				}
			}
		);

		this.distanceFromOrigin = magnitude(this.cameraPos);

		const refreshId = setInterval(() =>
		{
			if (this?.wilson?.draggables?.container)
			{
				this.listenForNumTouches();

				clearInterval(refreshId);
			}
		}, 100);

		const fragShaderSource = shader ?? this.createShader({
			distanceEstimatorGlsl,
			getColorGlsl,
			getReflectivityGlsl,
			getGeodesicGlsl,
			addGlsl,
		});

		const options =
		{
			renderer: "gpu",

			shader: fragShaderSource,

			canvasWidth: this.imageWidth,
			canvasHeight: this.imageHeight,

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

		

		this.initUniforms(0);

		if (this.useAntialiasing)
		{
			this.wilson.render.loadNewShader(edgeDetectShader);

			this.wilson.render.initUniforms([
				"stepSize",
			], 1);



			const aaShaderSource = shader ?? this.createShader({
				distanceEstimatorGlsl,
				getColorGlsl,
				getReflectivityGlsl,
				getGeodesicGlsl,
				addGlsl,
				antialiasing: !addGlsl.includes("sampler2D")
			});

			this.wilson.render.loadNewShader(aaShaderSource);

			this.wilson.render.initUniforms([
				"stepSize",
			], 2);

			this.initUniforms(2);



			this.createTextures();
		}



		if (this.useFor3DPrinting)
		{
			this.make3DPrintable();
		}



		const boundFunction = () => this.changeResolution();
		addTemporaryListener({
			object: window,
			event: "resize",
			callback: boundFunction
		});

		this.resume();
	}

	onDragCanvas(x, y, xDelta, yDelta)
	{
		const sign = this.lockedOnOrigin ? -1 : 1;
		this.pan.onDragCanvas(x, y, sign * xDelta, sign * yDelta);
	}



	async make3DPrintable()
	{
		const resolution = 2000;
		this.setUniform("uvScale", 2.5);
		this.setUniform("epsilonScaling", 0.001);

		this.changeResolution(resolution);

		for (let i = 0; i < resolution; i++)
		{
			this.setUniform("uvCenter", [i / resolution - 0.5, 0]);
			this.downloadFrame(i.toString().padStart(4, "0"));
			await new Promise(resolve => setTimeout(resolve, 100));
		}
	}


	// Creates a shader and sets the default argument values so that they persist by default.
	createShader({
		distanceEstimatorGlsl = this.distanceEstimatorGlsl,
		getColorGlsl = this.getColorGlsl,
		getReflectivityGlsl = this.getReflectivityGlsl,
		getGeodesicGlsl = this.getGeodesicGlsl,
		addGlsl = this.addGlsl,
		antialiasing = false,
	}) {
		this.distanceEstimatorGlsl = distanceEstimatorGlsl;
		this.getColorGlsl = getColorGlsl;
		this.getReflectivityGlsl = getReflectivityGlsl;
		this.getGeodesicGlsl = getGeodesicGlsl;
		this.addGlsl = addGlsl;

		const computeShadowIntensityGlsl = this.useShadows && this.useSoftShadows ? /* glsl */`
			// Nearly identical to raymarching, but it only marches toward the light.
			float computeShadowIntensity(vec3 startPos, vec3 lightDirection)
			{
				vec3 rayDirectionVec = normalize(lightDirection) * .25;
				float softShadowFactor = 1.0;
				float t = 0.0;

				float lastDistanceToScene = 100000.0;

				for (int iteration = 0; iteration < maxShadowMarches; iteration++)
				{
					vec3 pos = ${getGeodesicGlsl("startPos", "rayDirectionVec")};
					
					// Use Sebastian Aaltonen's improvement to Inigo Quilez's soft shadow algorithm.
					float distanceToScene = distanceEstimator(pos);
					float y = distanceToScene * distanceToScene / (2.0 * lastDistanceToScene);
        			float d = sqrt(distanceToScene * distanceToScene - y * y);

					softShadowFactor = min(
						softShadowFactor,
						d / (max(t - y, 0.0) * 0.025) 
					);

					lastDistanceToScene = distanceToScene;

					float epsilon = max(t / (float(imageSize) * epsilonScaling), minEpsilon);

					if (t > clipDistance || length(pos - lightPos) < 0.2)
					{
						return clamp(softShadowFactor, maxShadowAmount, 1.0);
					}

					if (distanceToScene < epsilon)
					{
						return maxShadowAmount;
					}
					
					t += distanceToScene;
				}

				return clamp(softShadowFactor, maxShadowAmount, 1.0);
			}
		` : this.useShadows ? /* glsl */`
			// Nearly identical to raymarching, but it only marches toward the light.
			float computeShadowIntensity(vec3 startPos, vec3 lightDirection)
			{
				vec3 rayDirectionVec = normalize(lightDirection) * .25;
				float t = 0.0;

				for (int iteration = 0; iteration < maxShadowMarches; iteration++)
				{
					vec3 pos = ${getGeodesicGlsl("startPos", "rayDirectionVec")};
					
					float distanceToScene = distanceEstimator(pos);

					float epsilon = max(t / (float(imageSize) * epsilonScaling), minEpsilon);

					if (t > clipDistance)
					{
						return 1.0;
					}

					if (distanceToScene < epsilon)
					{
						return maxShadowAmount;
					}
					
					t += distanceToScene;
				}

				return 1.0;
			}
		` : "";

		const computeReflectionGlsl = this.useReflections ? /* glsl */`
			vec3 computeShadingWithoutReflection(
				vec3 pos,
				float epsilon,
				float correctionDistance,
				int iteration
			) {
				vec3 surfaceNormal = getSurfaceNormal(pos, epsilon);

				// This corrects the position so that it's exactly on the surface (we probably marched a little bit inside).
				pos -= surfaceNormal * correctionDistance;
				
				vec3 lightDirection = normalize(lightPos - pos);
				
				float dotProduct = dot(surfaceNormal, lightDirection);
				
				float lightIntensity = max(
					${this.useOppositeLight ? `lightBrightness * max(dotProduct, -${getFloatGlsl(this.oppositeLightBrightness)} * dotProduct)` : "lightBrightness * dotProduct"},
					${getFloatGlsl(this.ambientLight)}
				);

				vec3 color = getColor(pos)
					* lightIntensity
					* max((1.0 - float(iteration) / float(maxMarches)), 0.0);

				${this.useShadows ? /* glsl */`
					float shadowIntensity = computeShadowIntensity(pos, lightDirection);

					color *= shadowIntensity;
				` : ""}
				
				//Apply fog.
				return mix(color, fogColor, 1.0 - exp(-distance(pos, cameraPos) * fogScaling));
			}

			// Unlike in raymarch(), startPos is replacing cameraPos, and rayDirectionVec is precomputed.
			vec3 computeReflection(
				vec3 startPos,
				vec3 rayDirectionVec,
				int startIteration
			) {
				float t = 0.0;
				
				for (int iteration = 0; iteration < maxReflectionMarches; iteration++)
				{
					vec3 pos = ${getGeodesicGlsl("startPos", "rayDirectionVec")};
					
					float distanceToScene = distanceEstimator(pos);

					float epsilon = max(t / (float(imageSize) * epsilonScaling), minEpsilon);

					if (distanceToScene < epsilon)
					{
						return computeShadingWithoutReflection(
							pos,
							epsilon,
							distanceToScene - 2.0 * epsilon,
							iteration + startIteration
						);
					}
					
					else if (t > clipDistance)
					{
						return ${this.useBloom ? "mix(fogColor, vec3(1.0), computeBloom(rayDirectionVec))" : "fogColor"};
					}
					
					t += distanceToScene;
				}
				
				return ${this.useBloom ? "mix(fogColor, vec3(1.0), computeBloom(rayDirectionVec))" : "fogColor"};
			}
		` : "";

		const computeBloomGlsl = this.useBloom ? /* glsl */`
			float computeBloom(vec3 rayDirectionVec)
			{
				return pow(
					(3.0 - distance(
						normalize(rayDirectionVec),
						normalize(lightPos - cameraPos)
					)) / 2.99,
					${getFloatGlsl(20 / this.bloomPower)}
				);
			}
		` : "";

		const uniformsGlsl = Object.entries(this.uniforms).map(([key, value]) =>
		{
			return /* glsl */`uniform ${value[0]} ${key};`;
		}).join("\n");

		const mainFunctionGlsl = (() =>
		{
			if (this.useFor3DPrinting)
			{
				return /* glsl */`${""}
					void main(void)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);

						if (distanceEstimator(vec3(uv.x, uv.y, uvCenter.x) * uvScale) < epsilonScaling)
						{
							gl_FragColor = vec4(1.0);
						}
					}
				`;
			}

			if (antialiasing)
			{
				return /* glsl */`${""}
					vec3 raymarchHelper(vec2 uvAdjust)
					{
						return raymarch(
							imagePlaneCenterPos
								+ rightVec * (uvScale * (uv.x + uvAdjust.x) + uvCenter.x) * aspectRatioX
								+ upVec * (uvScale * (uv.y + uvAdjust.y) + uvCenter.y) / aspectRatioY
						);
					}
					
					void main(void)
					{
						vec2 texCoord = (uv + vec2(1.0)) * 0.5;
						vec4 sample = texture2D(uTexture, texCoord);
						
						if (sample.w > 0.15)
						{
							vec3 aaSample = (
								sample.xyz
								+ raymarchHelper(vec2(stepSize, 0.0))
								+ raymarchHelper(vec2(0.0, stepSize))
								+ raymarchHelper(vec2(-stepSize, 0.0))
								+ raymarchHelper(vec2(0.0, -stepSize))
							) / 5.0;
							
							gl_FragColor = vec4(aaSample, 1.0);
							return;
						}

						gl_FragColor = vec4(sample.xyz, 1.0);
					}
				`;
			}

			return /* glsl */`${""}
				void main(void)
				{
					vec3 finalColor = raymarch(
						imagePlaneCenterPos
							+ rightVec * (uvScale * uv.x + uvCenter.x) * aspectRatioX
							+ upVec * (uvScale * uv.y + uvCenter.y) / aspectRatioY
					);

					gl_FragColor = vec4(finalColor.xyz, 1.0);
				}
			`;
		})();

		const shader = /* glsl */`
			precision highp float;
			
			varying vec2 uv;

			${uniformsGlsl}

			${antialiasing ? /* glsl */`
				uniform sampler2D uTexture;
				uniform float stepSize;
			` : ""}
			
			const vec3 lightPos = ${getVectorGlsl(this.lightPos)};
			const float lightBrightness = ${getFloatGlsl(this.lightBrightness)};
			const float bloomPower = ${getFloatGlsl(this.bloomPower)};
			
			const float clipDistance = ${getFloatGlsl(this.clipDistance)};
			const int maxMarches = ${this.maxMarches};
			const int maxShadowMarches = ${this.maxShadowMarches};
			const int maxReflectionMarches = ${this.maxReflectionMarches};
			const vec3 fogColor = ${getVectorGlsl(this.fogColor)};
			const float fogScaling = ${getFloatGlsl(this.fogScaling)};
			const float maxShadowAmount = 0.5;

			${addGlsl}
			
			
			
			float distanceEstimator(vec3 pos)
			{
				${distanceEstimatorGlsl}
			}
			
			vec3 getColor(vec3 pos)
			{
				${getColorGlsl}
			}

			${this.useReflections ? /* glsl */`float getReflectivity(vec3 pos)
			{
				${getReflectivityGlsl}
			}` : ""}
			
			
			
			vec3 getSurfaceNormal(vec3 pos, float epsilon)
			{
				float xStep1 = distanceEstimator(pos + vec3(epsilon, 0.0, 0.0));
				float yStep1 = distanceEstimator(pos + vec3(0.0, epsilon, 0.0));
				float zStep1 = distanceEstimator(pos + vec3(0.0, 0.0, epsilon));
				
				float xStep2 = distanceEstimator(pos - vec3(epsilon, 0.0, 0.0));
				float yStep2 = distanceEstimator(pos - vec3(0.0, epsilon, 0.0));
				float zStep2 = distanceEstimator(pos - vec3(0.0, 0.0, epsilon));
				
				return normalize(vec3(xStep1 - xStep2, yStep1 - yStep2, zStep1 - zStep2));
			}

			${computeBloomGlsl}

			${computeShadowIntensityGlsl}

			${computeReflectionGlsl}
			
			vec3 computeShading(
				vec3 pos,
				float epsilon,
				float correctionDistance,
				int iteration
			) {
				vec3 surfaceNormal = getSurfaceNormal(pos, epsilon);

				// This corrects the position so that it's exactly on the surface (we probably marched a little bit inside).
				pos -= surfaceNormal * correctionDistance;
				
				vec3 lightDirection = normalize(lightPos - pos);
				
				float dotProduct = dot(surfaceNormal, lightDirection);
				
				float lightIntensity = max(
					${this.useOppositeLight ? `lightBrightness * max(dotProduct, -${getFloatGlsl(this.oppositeLightBrightness)} * dotProduct)` : "lightBrightness * dotProduct"},
					${getFloatGlsl(this.ambientLight)}
				);

				vec3 color = getColor(pos)
					* lightIntensity
					* max((1.0 - float(iteration) / float(maxMarches)), 0.0);

				${this.useShadows ? /* glsl */`
					float shadowIntensity = computeShadowIntensity(pos, lightDirection);

					color *= shadowIntensity;
				` : ""}

				${this.useReflections ? /* glsl */`
					vec3 reflectedDirection = reflect(
						normalize(pos - cameraPos) * ${getFloatGlsl(this.stepFactor)},
						surfaceNormal
					);

					color = mix(
						color,
						computeReflection(pos, reflectedDirection, iteration),
						getReflectivity(pos)
					);
				` : ""}
				
				//Apply fog.
				return mix(color, fogColor, 1.0 - exp(-distance(pos, cameraPos) * fogScaling));
			}


			
			vec3 raymarch(vec3 startPos)
			{
				vec3 rayDirectionVec = normalize(startPos - cameraPos) * ${getFloatGlsl(this.stepFactor)};
				
				float t = 0.0;
				
				for (int iteration = 0; iteration < maxMarches; iteration++)
				{
					vec3 pos = ${getGeodesicGlsl("cameraPos", "rayDirectionVec")};
					
					float distanceToScene = distanceEstimator(pos);

					float epsilon = max(t / (float(imageSize) * epsilonScaling), minEpsilon);
					
					if (distanceToScene < epsilon)
					{
						return computeShading(
							pos,
							epsilon,
							distanceToScene - 2.0 * epsilon,
							iteration
						);
					}
					
					else if (t > clipDistance)
					{
						return ${this.useBloom ? "mix(fogColor, vec3(1.0), computeBloom(rayDirectionVec))" : "fogColor"};
					}
					
					t += distanceToScene;
				}
				
				return ${this.useBloom ? "mix(fogColor, vec3(1.0), computeBloom(rayDirectionVec))" : "fogColor"};
			}
			
			
			
			${mainFunctionGlsl}
		`;

		if (window.DEBUG)
		{
			console.log(shader);
		}

		return shader;
	}



	initUniforms(programIndex)
	{
		const uniformList = [
			"aspectRatioX",
			"aspectRatioY",
			"imageSize",
			"cameraPos",
			"imagePlaneCenterPos",
			"forwardVec",
			"rightVec",
			"upVec",
			"epsilonScaling",
			"minEpsilon",
			"uvCenter",
			"uvScale",
			...Object.keys(this.uniforms),
		];

		this.wilson.render.initUniforms(uniformList, programIndex);

		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[programIndex]);

		for (const key in this.uniforms)
		{
			const value = this.uniforms[key];
			if (value[0].slice(0, 3) === "vec" && value[1].length === 0)
			{
				continue;
			}
			
			const uniformFunction = setUniformFunctions[value[0]];
			uniformFunction(this.wilson.gl, this.wilson.uniforms[key][programIndex], value[1]);
		}
	}



	reloadShader({
		distanceEstimatorGlsl,
		getColorGlsl,
		getReflectivityGlsl,
		addGlsl
	} = {}) {
		this.calculateVectors();

		this.wilson.render.shaderPrograms = [];
		this.wilson.render.loadNewShader(this.createShader({
			distanceEstimatorGlsl,
			getColorGlsl,
			getReflectivityGlsl,
			addGlsl,
		}));

		this.initUniforms(0);

		

		if (this.useAntialiasing)
		{
			this.wilson.render.loadNewShader(edgeDetectShader);

			this.wilson.render.initUniforms([
				"stepSize",
			], 1);



			const aaShaderSource = this.createShader({
				distanceEstimatorGlsl,
				getColorGlsl,
				getReflectivityGlsl,
				addGlsl,
				antialiasing: true
			});

			this.wilson.render.loadNewShader(aaShaderSource);

			this.initUniforms(2);

			this.wilson.render.initUniforms([
				"stepSize",
			], 2);



			this.createTextures();

			this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]);
		}

		this.needNewFrame = true;
	}



	createTextures()
	{
		this.wilson.render.framebuffers = [];

		this.wilson.render.createFramebufferTexturePair();
		this.wilson.render.createFramebufferTexturePair();

		this.wilson.gl.bindTexture(
			this.wilson.gl.TEXTURE_2D,
			this.wilson.render.framebuffers[0].texture
		);

		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, null);



		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]);

		this.wilson.gl.uniform1f(this.wilson.uniforms.stepSize[1], 1 / this.imageSize);



		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[2]);

		this.wilson.gl.uniform1f(this.wilson.uniforms.stepSize[2], 2 / (this.imageSize * 3));



		// Here and throughout, we need to end with this so that uniform
		// calls reference the right program.
		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]);
	}



	calculateVectors()
	{
		// Here comes the serious math. Theta is the angle in the xy-plane and
		// phi the angle down from the z-axis. We can use them get a normalized forward vector:

		this.forwardVec = [
			Math.cos(this.theta) * Math.sin(this.phi),
			Math.sin(this.theta) * Math.sin(this.phi),
			Math.cos(this.phi)
		];

		// Now the right vector needs to be constrained to the xy-plane,
		// since otherwise the image will appear tilted. For a vector (a, b, c),
		// the orthogonal plane that passes through the origin is ax + by + cz = 0,
		// so we want ax + by = 0. One solution is (b, -a), and that's the one that
		// goes to the "right" of the forward vector (when looking down).
		this.rightVec = normalize([this.forwardVec[1], -this.forwardVec[0], 0]);

		// Finally, the upward vector is the cross product of the previous two.
		this.upVec = crossProduct(this.rightVec, this.forwardVec);

		if (this.lockedOnOrigin)
		{
			this.cameraPos = scaleVector(
				-this.distanceFromOrigin,
				this.forwardVec
			);
		}

		

		this.speedFactor = Math.min(
			this.distanceEstimator(
				this.cameraPos[0],
				this.cameraPos[1],
				this.cameraPos[2]
			),
			.5
		) / 4;

		// The factor we divide by here sets the fov.
		this.forwardVec[0] *= this.speedFactor / 1.5;
		this.forwardVec[1] *= this.speedFactor / 1.5;
		this.forwardVec[2] *= this.speedFactor / 1.5;

		this.rightVec[0] *= this.speedFactor / (this.fovFactor);
		this.rightVec[1] *= this.speedFactor / (this.fovFactor);

		this.upVec[0] *= this.speedFactor / (this.fovFactor);
		this.upVec[1] *= this.speedFactor / (this.fovFactor);
		this.upVec[2] *= this.speedFactor / (this.fovFactor);

		const focalLengthFactor = 2;

		this.imagePlaneCenterPos = [
			this.cameraPos[0] + this.forwardVec[0] * focalLengthFactor,
			this.cameraPos[1] + this.forwardVec[1] * focalLengthFactor,
			this.cameraPos[2] + this.forwardVec[2] * focalLengthFactor
		];

		this.setUniform("cameraPos", this.cameraPos);
		this.setUniform("imagePlaneCenterPos", this.imagePlaneCenterPos);
		this.setUniform("forwardVec", this.forwardVec);
		this.setUniform("rightVec", this.rightVec);
		this.setUniform("upVec", this.upVec);
	}

	distanceEstimator()
	{
		throw new Error("Distance estimator not implemented!");
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

		if (this.wilson.worldCenterX < -Math.PI)
		{
			this.wilson.worldCenterX += 2 * Math.PI;
		}

		else if (this.wilson.worldCenterX > Math.PI)
		{
			this.wilson.worldCenterX -= 2 * Math.PI;
		}
		
		this.theta = -this.wilson.worldCenterX;
		this.phi = -this.wilson.worldCenterY;

		this.calculateVectors();



		if (this.useAntialiasing)
		{
			this.wilson.gl.bindFramebuffer(
				this.wilson.gl.FRAMEBUFFER,
				this.wilson.render.framebuffers[0].framebuffer
			);
		}

		this.wilson.render.drawFrame();

		if (this.useAntialiasing)
		{
			this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]);

			this.wilson.gl.bindTexture(
				this.wilson.gl.TEXTURE_2D,
				this.wilson.render.framebuffers[0].texture
			);

			this.wilson.gl.bindFramebuffer(
				this.wilson.gl.FRAMEBUFFER,
				this.wilson.render.framebuffers[1].framebuffer
			);

			this.wilson.render.drawFrame();



			this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[2]);

			this.wilson.gl.bindTexture(
				this.wilson.gl.TEXTURE_2D,
				this.wilson.render.framebuffers[1].texture
			);

			this.wilson.gl.bindFramebuffer(
				this.wilson.gl.FRAMEBUFFER,
				null
			);

			this.wilson.render.drawFrame();



			this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]);
		}
	}

	downloadFrame(filename)
	{
		this.drawFrame();
		this.wilson.downloadFrame(filename, false);
		// this.downloadMosaic(filename, 4);
	}

	async downloadMosaic(filename, size)
	{
		this.setUniform("uvScale", 1 / size);
		this.setUniform("imageSize", this.imageSize * size);

		const centerPoints = [];
		for (let i = 0; i < size; i++)
		{
			centerPoints.push(-1 + (1 + 2 * i) / size);
		}
		const canvases = [];

		for (let i = 0; i < size; i++)
		{
			canvases.push([]);

			for (let j = 0; j < size; j++)
			{
				canvases[i].push(document.createElement("canvas"));
				canvases[i][j].width = this.imageWidth;
				canvases[i][j].height = this.imageHeight;
			}
		}



		const combineCanvas = async () =>
		{
			const combinedCanvas = document.createElement("canvas");
			combinedCanvas.width = this.imageWidth * size;
			combinedCanvas.height = this.imageHeight * size;
			const combinedCtx = combinedCanvas.getContext("2d", { colorSpace: "display-p3" });

			for (let i = 0; i < size; i++)
			{
				for (let j = 0; j < size; j++)
				{
					combinedCtx.drawImage(
						canvases[i][j],
						i * this.imageWidth,
						j * this.imageHeight
					);
				}
			}

			combinedCtx.translate(0, this.imageSize * size);
			combinedCtx.scale(1, -1);

			combinedCtx.drawImage(
				combinedCanvas,
				0,
				0
			);

			combinedCanvas.toBlob((blob) =>
			{
				const link = document.createElement("a");
				link.href = URL.createObjectURL(blob);
				link.download = filename;
				link.click();
			});

			await new Promise(resolve => setTimeout(resolve, 100));

			this.setUniform("uvScale", 1);
			this.setUniform("uvCenter", [0, 0]);
			this.setUniform("imageSize", this.imageSize);
			this.needNewFrame = true;
		};



		let i = 0;
		let j = 0;

		const drawMosaicPart = async () =>
		{
			const ctx = canvases[i][j].getContext("2d", { colorSpace: "display-p3" });

			this.setUniform("uvCenter", [centerPoints[i], centerPoints[j]]);
			this.drawFrame();
			const imageData = new ImageData(
				new Uint8ClampedArray(this.wilson.render.getPixelData()),
				this.imageWidth,
				this.imageHeight
			);

			ctx.putImageData(imageData, 0, 0);

			await new Promise(resolve => setTimeout(resolve, 500));

			j++;
			if (j === size)
			{
				j = 0;
				i++;
			}

			if (i !== size)
			{
				requestAnimationFrame(drawMosaicPart);
			}

			else
			{
				combineCanvas();
			}
		};

		requestAnimationFrame(drawMosaicPart);
	}



	moveUpdate(timeElapsed)
	{
		if (this.keysPressed.w || this.numTouches === 2)
		{
			this.moveVelocity[0] = 1;
		}

		else if (this.keysPressed.s || this.numTouches === 3)
		{
			this.moveVelocity[0] = -1;
		}

		if (this.keysPressed.d)
		{
			this.moveVelocity[1] = 1;
		}

		else if (this.keysPressed.a)
		{
			this.moveVelocity[1] = -1;
		}

		if (this.keysPressed[" "])
		{
			this.moveVelocity[2] = 1;
		}

		else if (this.keysPressed.shift)
		{
			this.moveVelocity[2] = -1;
		}

		if (!this.lockedOnOrigin && (
			this.moveVelocity[0] !== 0
				|| this.moveVelocity[1] !== 0
				|| this.moveVelocity[2] !== 0
		)) {
			const usableForwardVec = this.lockZ !== undefined
				? scaleVector(
					magnitude(this.forwardVec),
					normalize([
						this.forwardVec[0],
						this.forwardVec[1],
						0
					]),
				)
				: this.forwardVec;

			const usableRightVec = this.lockZ !== undefined
				? scaleVector(
					magnitude(this.rightVec),
					normalize([
						this.rightVec[0],
						this.rightVec[1],
						0
					]),
				)
				: this.rightVec;

			const tangentVec = [
				this.moveVelocity[0] * usableForwardVec[0]
					+ this.moveVelocity[1] * usableRightVec[0],
				this.moveVelocity[0] * usableForwardVec[1]
					+ this.moveVelocity[1] * usableRightVec[1],
				this.moveVelocity[0] * usableForwardVec[2]
					+ this.moveVelocity[1] * usableRightVec[2]
					+ this.moveVelocity[2] * this.speedFactor / 1.5
			];

			this.cameraPos[0] += this.movingSpeed * tangentVec[0] * (timeElapsed / 6.944);
			this.cameraPos[1] += this.movingSpeed * tangentVec[1] * (timeElapsed / 6.944);
			this.cameraPos[2] = this.lockZ
				?? this.cameraPos[2] + this.movingSpeed * tangentVec[2] * (timeElapsed / 6.944);

			this.needNewFrame = true;
		}

		for (let i = 0; i < 3; i++)
		{
			this.moveVelocity[i] *= this.moveFriction ** (timeElapsed / 6.944);

			if (Math.abs(this.moveVelocity[i]) < this.moveStopThreshhold)
			{
				this.moveVelocity[i] = 0;
			}
		}
	}

	changeResolution(resolution = this.imageSize)
	{
		this.imageSize = Math.max(50, resolution);

		this.aspectRatio = this.wilson.fullscreen.currentlyFullscreen
			? window.innerWidth / window.innerHeight
			: this.nonFullscreenAspectRatio;

		[this.imageWidth, this.imageHeight] = getEqualPixelFullScreen(
			this.imageSize,
			this.aspectRatio
		);

		this.wilson.changeCanvasSize(this.imageWidth, this.imageHeight);

		this.setUniform("aspectRatioX", Math.max(this.aspectRatio, 1));
		this.setUniform("aspectRatioY", Math.min(this.aspectRatio, 1));
		this.setUniform("imageSize", this.imageSize);


		if (this.useAntialiasing)
		{
			this.createTextures();
		}

		this.needNewFrame = true;
	}



	setUniform(name, value)
	{
		this.uniforms[name][1] = value;

		const uniformFunction = setUniformFunctions[this.uniforms[name][0]];

		uniformFunction(this.wilson.gl, this.wilson.uniforms[name][0], value);

		if (this.useAntialiasing)
		{
			this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[2]);
			uniformFunction(this.wilson.gl, this.wilson.uniforms[name][2], value);

			this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]);
		}
	}

	animateUniform({
		name,
		value,
		duration = 1000
	}) {
		const dummy = { t: this.uniforms[name][1] };

		return anime({
			targets: dummy,
			t: value,
			duration,
			easing: "easeInOutQuart",
			update: () =>
			{
				this.setUniform(name, dummy.t);
				this.needNewFrame = true;
			}
		}).finished;
	}

	loopUniform({
		name,
		startValue,
		endValue,
		duration = 2000
	}) {
		const dummy = { t: 0 };

		return anime({
			targets: dummy,
			t: 1,
			duration,
			easing: "easeInOutQuad",
			loop: true,
			direction: "alternate",
			update: () =>
			{
				this.setUniform(name, startValue + (endValue - startValue) * dummy.t);
				this.needNewFrame = true;
			}
		});
	}



	async setLockedOnOrigin(value)
	{
		if (value && !this.lockedOnOrigin)
		{
			// Convert to spherical coordinates.
			const r = magnitude(this.cameraPos);
			const normalizedCameraPos = normalize(this.cameraPos);
			const phi = Math.PI - Math.acos(this.cameraPos[2] / r);
			let theta = Math.atan2(this.cameraPos[1], this.cameraPos[0]) + Math.PI;
			if (theta > Math.PI)
			{
				theta -= 2 * Math.PI;
			}

			const dummy = { r, theta: this.theta, phi: this.phi };

			await anime({
				targets: dummy,
				theta,
				phi,
				r: this.distanceFromOrigin,
				duration: 500,
				easing: "easeOutCubic",
				update: () =>
				{
					this.wilson.worldCenterX = -dummy.theta;
					this.wilson.worldCenterY = -dummy.phi;
					this.cameraPos = scaleVector(
						dummy.r,
						normalizedCameraPos
					);
					
					this.needNewFrame = true;
				}
			}).finished;
		}

		this.lockedOnOrigin = value;
	}
}



export function magnitude(vec)
{
	return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
}



export function addVectors(vec1, vec2)
{
	return [vec1[0] + vec2[0], vec1[1] + vec2[1], vec1[2] + vec2[2]];
}

export function scaleVector(c, vec)
{
	return [c * vec[0], c * vec[1], c * vec[2]];
}



export function dotProduct(vec1, vec2)
{
	return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2];
}

export function dotProduct4(vec1, vec2)
{
	return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2] + vec1[3] * vec2[3];
}



export function crossProduct(vec1, vec2)
{
	return [
		vec1[1] * vec2[2] - vec1[2] * vec2[1],
		vec1[2] * vec2[0] - vec1[0] * vec2[2],
		vec1[0] * vec2[1] - vec1[1] * vec2[0]
	];
}



export function matMul(mat1, mat2)
{
	return [
		[
			mat1[0][0] * mat2[0][0] + mat1[0][1] * mat2[1][0] + mat1[0][2] * mat2[2][0],
			mat1[0][0] * mat2[0][1] + mat1[0][1] * mat2[1][1] + mat1[0][2] * mat2[2][1],
			mat1[0][0] * mat2[0][2] + mat1[0][1] * mat2[1][2] + mat1[0][2] * mat2[2][2]
		],

		[
			mat1[1][0] * mat2[0][0] + mat1[1][1] * mat2[1][0] + mat1[1][2] * mat2[2][0],
			mat1[1][0] * mat2[0][1] + mat1[1][1] * mat2[1][1] + mat1[1][2] * mat2[2][1],
			mat1[1][0] * mat2[0][2] + mat1[1][1] * mat2[1][2] + mat1[1][2] * mat2[2][2]
		],

		[
			mat1[2][0] * mat2[0][0] + mat1[2][1] * mat2[1][0] + mat1[2][2] * mat2[2][0],
			mat1[2][0] * mat2[0][1] + mat1[2][1] * mat2[1][1] + mat1[2][2] * mat2[2][1],
			mat1[2][0] * mat2[0][2] + mat1[2][1] * mat2[1][2] + mat1[2][2] * mat2[2][2]
		]
	];
}



export function qmul(x1, y1, z1, w1, x2, y2, z2, w2)
{
	return [
		x1 * x2 - y1 * y2 - z1 * z1 - w1 * w2,
		x1 * y2 + y1 * x2 + z1 * w2 - w1 * z2,
		x1 * z2 - y1 * w2 + z1 * x2 + w1 * y2,
		x1 * w2 + y1 * z2 - z1 * y2 + w1 * x2
	];
}



export function normalize(vec)
{
	const mag = magnitude(vec);

	return [vec[0] / mag, vec[1] / mag, vec[2] / mag];
}



export function getRotationMatrix(thetaX, thetaY, thetaZ)
{
	const cX = Math.cos(thetaX);
	const sX = Math.sin(thetaX);
	const cY = Math.cos(thetaY);
	const sY = Math.sin(thetaY);
	const cZ = Math.cos(thetaZ);
	const sZ = Math.sin(thetaZ);

	const matZ = [
		[cZ, -sZ, 0],
		[sZ, cZ, 0],
		[0, 0, 1]
	];

	const matY = [
		[cY, 0, -sY],
		[0, 1, 0],
		[sY, 0, cY]
	];

	const matX = [
		[1, 0, 0],
		[0, cX, -sX],
		[0, sX, cX]
	];

	return matMul(matMul(matZ, matY), matX);
}

export function mat3TimesVector(mat, vec)
{
	return [
		mat[0][0] * vec[0] + mat[0][1] * vec[1] + mat[0][2] * vec[2],
		mat[1][0] * vec[0] + mat[1][1] * vec[1] + mat[1][2] * vec[2],
		mat[2][0] * vec[0] + mat[2][1] * vec[1] + mat[2][2] * vec[2]
	];
}