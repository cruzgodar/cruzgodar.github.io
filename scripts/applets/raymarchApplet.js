import anime from "../anime.js";
import { addTemporaryListener } from "../src/main.js";
import { Wilson } from "../wilson.js";
import { AnimationFrameApplet } from "./animationFrameApplet.js";
import { getEqualPixelFullScreen, getFloatGlsl, getVectorGlsl } from "./applet.js";

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

export class RaymarchApplet extends AnimationFrameApplet
{
	movingSpeed = .1;
	moveVelocity = [0, 0, 0];

	moveFriction = .96;
	moveStopThreshhold = .01;

	lastTimestamp = -1;

	theta = 0;
	phi = 0;

	imageSize = 400;
	imageWidth = 400;
	imageHeight = 400;

	maxMarches = 128;
	maxShadowMarches = 128;
	maxReflectionMarches = 128;
	clipDistance = 1000;

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

	fogColor = [0, 0, 0];
	fogScaling = .05;
	stepFactor;
	epsilonScaling;
	minEpsilon;

	useShadows;
	useSoftShadows;
	useReflections;
	useBloom;

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

		distanceEstimatorGlsl,
		getColorGlsl,
		getReflectivityGlsl = "return 0.2;",
		getGeodesicGlsl = (pos, dir) => `${pos} + t * ${dir}`,
		addGlsl = "",

		uniforms = {},

		theta,
		phi,
		stepFactor = .95,
		epsilonScaling = 1.75,
		minEpsilon = .0000003,

		cameraPos = [0, 0, 0],
		lockedOnOrigin = true,

		lightPos = [50, 70, 100],
		lightBrightness = 1,
		useOppositeLight = false,
		oppositeLightBrightness = 0.5,
		ambientLight = 0.25,
		bloomPower = 1,

		useShadows = false,
		useSoftShadows = true,
		useReflections = false,
		useBloom = true,
	}) {
		super(canvas);

		this.uniforms = uniforms;
		this.theta = theta;
		this.phi = phi;
		this.stepFactor = stepFactor;
		this.epsilonScaling = epsilonScaling;
		this.minEpsilon = minEpsilon;
		
		this.cameraPos = cameraPos;
		this.lockedOnOrigin = lockedOnOrigin;

		this.lightPos = lightPos;
		this.lightBrightness = lightBrightness;
		this.useOppositeLight = useOppositeLight;
		this.oppositeLightBrightness = oppositeLightBrightness;
		this.ambientLight = ambientLight;
		this.bloomPower = bloomPower;

		this.useShadows = useShadows;
		this.useSoftShadows = useSoftShadows;
		this.useReflections = useReflections;
		this.useBloom = useBloom;
		
		this.listenForKeysPressed(
			["w", "s", "a", "d", "q", "e", " ", "shift", "z"],
			(key, pressed) =>
			{
				if (key === "z")
				{
					const dummy = { t: 0 };
					const oldFovFactor = this.fovFactor;
					const newFovFactor = pressed ? 4 : 1;

					const oldEpsilonScaling = this.epsilonScaling;
					const newEpsilonScaling = pressed
						? this.epsilonScaling * 4
						: this.epsilonScaling / 4;

					anime({
						targets: dummy,
						t: 1,
						duration: 250,
						easing: "easeOutCubic",
						update: () =>
						{
							this.fovFactor = (1 - dummy.t) * oldFovFactor
								+ dummy.t * newFovFactor;

							this.setEpsilonScaling(
								(1 - dummy.t) * oldEpsilonScaling
									+ dummy.t * newEpsilonScaling
							);

							this.needNewFrame = true;
						}
					});
				}
			}
		);

		this.distanceFromOrigin = RaymarchApplet.magnitude(this.cameraPos);

		const refreshId = setInterval(() =>
		{
			if (this?.wilson?.draggables?.container)
			{
				this.listenForNumTouches();

				clearInterval(refreshId);
			}
		}, 100);

		const fragShaderSource = this.createShader({
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

		this.initUniforms();

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


	// Creates a shader and sets the default argument values so that they persist by default.
	createShader({
		distanceEstimatorGlsl = this.distanceEstimatorGlsl,
		getColorGlsl = this.getColorGlsl,
		getReflectivityGlsl = this.getReflectivityGlsl,
		getGeodesicGlsl = this.getGeodesicGlsl,
		addGlsl = this.addGlsl,
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
			vec3 computeReflection(vec3 startPos, vec3 rayDirectionVec, int startIteration)
			{
				float t = 0.0;
				
				for (int iteration = 0; iteration < maxReflectionMarches; iteration++)
				{
					vec3 pos = ${getGeodesicGlsl("startPos", "rayDirectionVec")};;
					
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

		const shader = /* glsl */`
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
			uniform float epsilonScaling;
			uniform float minEpsilon;

			${uniformsGlsl}
			
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
					vec3 reflectedDirection = reflect(normalize(pos - cameraPos) * ${getFloatGlsl(this.stepFactor)}, surfaceNormal);

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
					vec3 pos = ${getGeodesicGlsl("cameraPos", "rayDirectionVec")};;
					
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
			
			
			
			void main(void)
			{
				vec3 finalColor = raymarch(
					imagePlaneCenterPos + rightVec * uv.x * aspectRatioX + upVec * uv.y / aspectRatioY
				);
				
				gl_FragColor = vec4(finalColor.xyz, 1.0);
			}
		`;

		if (window.DEBUG)
		{
			console.log(shader);
		}

		return shader;
	}



	initUniforms()
	{
		this.wilson.render.initUniforms([
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
			...Object.keys(this.uniforms),
		]);

		

		this.calculateVectors();

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.aspectRatioX,
			Math.max(this.imageWidth / this.imageHeight, 1)
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.aspectRatioY,
			Math.min(this.imageWidth / this.imageHeight, 1)
		);
		
		this.wilson.gl.uniform1i(
			this.wilson.uniforms.imageSize,
			this.imageSize
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms.cameraPos,
			this.cameraPos
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms.imagePlaneCenterPos,
			this.imagePlaneCenterPos
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms.forwardVec,
			this.forwardVec
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms.rightVec,
			this.rightVec
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms.upVec,
			this.upVec
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.epsilonScaling,
			this.epsilonScaling
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.minEpsilon,
			this.minEpsilon
		);

		for (const key in this.uniforms)
		{
			const value = this.uniforms[key];
			const uniformFunction = setUniformFunctions[value[0]];
			uniformFunction(this.wilson.gl, this.wilson.uniforms[key], value[1]);
		}
	}



	reloadShader({
		distanceEstimatorGlsl,
		getColorGlsl,
		getReflectivityGlsl,
		addGlsl
	} = {}) {
		this.wilson.render.shaderPrograms = [];
		this.wilson.render.loadNewShader(this.createShader({
			distanceEstimatorGlsl,
			getColorGlsl,
			getReflectivityGlsl,
			addGlsl,
		}));
		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]);

		this.initUniforms();

		this.needNewFrame = true;
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
		this.rightVec = RaymarchApplet.normalize([this.forwardVec[1], -this.forwardVec[0], 0]);

		// Finally, the upward vector is the cross product of the previous two.
		this.upVec = RaymarchApplet.crossProduct(this.rightVec, this.forwardVec);

		if (this.lockedOnOrigin)
		{
			this.cameraPos = RaymarchApplet.scaleVector(
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

		

		this.wilson.gl.uniform3fv(this.wilson.uniforms.cameraPos, this.cameraPos);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms.imagePlaneCenterPos,
			this.imagePlaneCenterPos
		);

		this.wilson.gl.uniform3fv(this.wilson.uniforms.forwardVec, this.forwardVec);
		this.wilson.gl.uniform3fv(this.wilson.uniforms.rightVec, this.rightVec);
		this.wilson.gl.uniform3fv(this.wilson.uniforms.upVec, this.upVec);
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

		this.wilson.render.drawFrame();
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
				? RaymarchApplet.scaleVector(
					RaymarchApplet.magnitude(this.forwardVec),
					RaymarchApplet.normalize([
						this.forwardVec[0],
						this.forwardVec[1],
						0
					]),
				)
				: this.forwardVec;

			const usableRightVec = this.lockZ !== undefined
				? RaymarchApplet.scaleVector(
					RaymarchApplet.magnitude(this.rightVec),
					RaymarchApplet.normalize([
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

		this.calculateVectors();

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

		if (this.wilson.fullscreen.currentlyFullscreen)
		{
			[this.imageWidth, this.imageHeight] = getEqualPixelFullScreen(this.imageSize);
		}

		else
		{
			this.imageWidth = this.imageSize;
			this.imageHeight = this.imageSize;
		}

		this.wilson.changeCanvasSize(this.imageWidth, this.imageHeight);



		this.wilson.gl.uniform1f(
			this.wilson.uniforms.aspectRatioX,
			Math.max(this.imageWidth / this.imageHeight, 1)
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.aspectRatioY,
			Math.min(this.imageWidth / this.imageHeight, 1)
		);

		this.wilson.gl.uniform1i(this.wilson.uniforms.imageSize, this.imageSize);



		this.needNewFrame = true;
	}



	setUniform(name, value)
	{
		this.uniforms[name][1] = value;

		const uniformFunction = setUniformFunctions[this.uniforms[name][0]];

		uniformFunction(this.wilson.gl, this.wilson.uniforms[name], value);
	}

	setEpsilonScaling(value)
	{
		this.epsilonScaling = value;

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.epsilonScaling,
			this.epsilonScaling
		);
	}

	setMinEpsilon(value)
	{
		this.minEpsilon = value;

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.minEpsilon,
			this.minEpsilon,
		);
	}

	async setLockedOnOrigin(value)
	{
		if (value && !this.lockedOnOrigin)
		{
			// Convert to spherical coordinates.
			const r = RaymarchApplet.magnitude(this.cameraPos);
			const normalizedCameraPos = RaymarchApplet.normalize(this.cameraPos);
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
					this.cameraPos = RaymarchApplet.scaleVector(
						dummy.r,
						normalizedCameraPos
					);
					
					this.needNewFrame = true;
				}
			}).finished;
		}

		this.lockedOnOrigin = value;
	}



	static magnitude(vec)
	{
		return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
	}



	static addVectors(vec1, vec2)
	{
		return [vec1[0] + vec2[0], vec1[1] + vec2[1], vec1[2] + vec2[2]];
	}

	static scaleVector(c, vec)
	{
		return [c * vec[0], c * vec[1], c * vec[2]];
	}



	static dotProduct(vec1, vec2)
	{
		return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2];
	}

	static dotProduct4(vec1, vec2)
	{
		return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2] + vec1[3] * vec2[3];
	}



	static crossProduct(vec1, vec2)
	{
		return [
			vec1[1] * vec2[2] - vec1[2] * vec2[1],
			vec1[2] * vec2[0] - vec1[0] * vec2[2],
			vec1[0] * vec2[1] - vec1[1] * vec2[0]
		];
	}



	static matMul(mat1, mat2)
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



	static qmul(x1, y1, z1, w1, x2, y2, z2, w2)
	{
		return [
			x1 * x2 - y1 * y2 - z1 * z1 - w1 * w2,
			x1 * y2 + y1 * x2 + z1 * w2 - w1 * z2,
			x1 * z2 - y1 * w2 + z1 * x2 + w1 * y2,
			x1 * w2 + y1 * z2 - z1 * y2 + w1 * x2
		];
	}



	static normalize(vec)
	{
		const magnitude = RaymarchApplet.magnitude(vec);

		return [vec[0] / magnitude, vec[1] / magnitude, vec[2] / magnitude];
	}



	static getRotationMatrix(thetaX, thetaY, thetaZ)
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

		return RaymarchApplet.matMul(RaymarchApplet.matMul(matZ, matY), matX);
	}

	static mat3TimesVector(mat, vec)
	{
		return [
			mat[0][0] * vec[0] + mat[0][1] * vec[1] + mat[0][2] * vec[2],
			mat[1][0] * vec[0] + mat[1][1] * vec[1] + mat[1][2] * vec[2],
			mat[2][0] * vec[0] + mat[2][1] * vec[1] + mat[2][2] * vec[2]
		];
	}
}