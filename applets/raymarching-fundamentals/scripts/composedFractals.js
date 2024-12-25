import {
	extrudedCubeDE,
	kIFSCubeDE,
	mandelbulbDE,
	mengerSpongeDE,
	qJuliaDE
} from "./distanceEstimators.js";
import { getRotationMatrix, RaymarchApplet } from "/scripts/applets/raymarchApplet.js";

export class ComposedFractals extends RaymarchApplet
{
	sphereWeight = 0;

	extrudedCubeWeight = 1;
	extrudedCubeSeparation = 1.5;

	mengerSpongeWeight = 0;
	mengerSpongeScale = 3;

	includeRotationMatrix = false;

	constructor({
		canvas,
		useShadows = false,
		useReflections = false,
		includeSphere = false,
		includeExtrudedCube = false,
		includeMengerSponge = false,
		includeKIFS = false,
		includeMandelbulb = false,
		includeQJulia = false,
	}) {
		const addGlsl = /* glsl */`
			const vec3 color1 = vec3(1.0, 0.0, 0.0);
			const vec3 color2 = vec3(0.0, 1.0, 0.0);
			const vec3 color3 = vec3(0.0, 0.0, 1.0);

			const vec3 n1Tetrahedron = vec3(-.577350, 0, .816496);
			const vec3 n2Tetrahedron = vec3(.288675, -.5, .816496);
			const vec3 n3Tetrahedron = vec3(.288675, .5, .816496);
			const vec3 scaleCenterTetrahedron = vec3(0.0, 0.0, 1.0);

			float rand(vec2 co)
			{
				co += vec2(${Math.random()}, ${Math.random()});

				return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
			}

			vec4 qmul(vec4 z, vec4 w)
			{
				return vec4(z.x*w.x - z.y*w.y - z.z*w.z - z.w*w.w, z.x*w.y + z.y*w.x + z.z*w.w - z.w*w.z, z.x*w.z - z.y*w.w + z.z*w.x + z.w*w.y, z.x*w.w + z.y*w.z - z.z*w.y + z.w*w.x);
			}

			${includeSphere ? /* glsl */`
				float distanceEstimatorRoomSphere(vec3 pos)
				{
					vec3 modPos = mod(pos, 2.0);
					return 1.25 - length(modPos - vec3(1.0, 1.0, 1.0));
				}

				vec3 getColorRoomSphere(vec3 pos)
				{
					return vec3(0.5, 0.0, 1.0);
				}
			` : ""}

			${includeExtrudedCube ? /* glsl */`
				${extrudedCubeDE[0]}
				${extrudedCubeDE[1]}
			` : ""}

			${includeMengerSponge ? /* glsl */`
				${mengerSpongeDE[0]}
				${mengerSpongeDE[1]}
			` : ""}

			${includeKIFS ? /* glsl */`
				${kIFSCubeDE[0]}
				${kIFSCubeDE[1]}
			` : ""}

			${includeMandelbulb ? /* glsl */`
				${mandelbulbDE[0]}
				${mandelbulbDE[1]}
			` : ""}

			${includeQJulia ? /* glsl */`
				${qJuliaDE[0]}
				${qJuliaDE[1]}
			` : ""}

			float distanceEstimatorGround(vec3 pos)
			{
				return abs(pos.z);
			}

			float distanceEstimatorObject(vec3 pos)
			{
				float distanceObject = 0.0;

				float c = cos(objectRotation);
				float s = sin(objectRotation);
				vec3 rotatedPos = mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0) * (pos + vec3(0.0, 0.0, objectFloat));
				
				${includeSphere ? /* glsl */`
					if (sphereWeight > 0.0)
					{
						distanceObject += sphereWeight * distanceEstimatorRoomSphere(pos);
					}
				` : ""}

				${includeExtrudedCube ? /* glsl */`
					if (extrudedCubeWeight > 0.0)
					{
						distanceObject += extrudedCubeWeight * distanceEstimatorExtrudedCube(rotatedPos);
					}
				` : ""}

				${includeMengerSponge ? /* glsl */`
					if (mengerSpongeWeight > 0.0)
					{
						distanceObject += mengerSpongeWeight * distanceEstimatorMengerSponge(rotatedPos);
					}
				` : ""}

				${includeKIFS ? /* glsl */`
					if (kIFSWeight > 0.0)
					{
						distanceObject += kIFSWeight * distanceEstimatorKIFS(rotatedPos);
					}
				` : ""}

				${includeMandelbulb ? /* glsl */`
					if (mandelbulbWeight > 0.0)
					{
						distanceObject += mandelbulbWeight * distanceEstimatorMandelbulb(rotatedPos);
					}
				` : ""}

				${includeQJulia ? /* glsl */`
					if (qJuliaWeight > 0.0)
					{
						distanceObject += qJuliaWeight * distanceEstimatorQJulia(rotatedPos);
					}
				` : ""}
				
				return distanceObject;
			}

			vec3 getColorObject(vec3 pos)
			{
				vec3 color = vec3(0.0, 0.0, 0.0);

				float c = cos(objectRotation);
				float s = sin(objectRotation);
				vec3 rotatedPos = mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0) * (pos + vec3(0.0, 0.0, objectFloat));

				${includeSphere ? /* glsl */`
					if (sphereWeight > 0.0)
					{
						color += sphereWeight * getColorRoomSphere(pos);
					}
				` : ""}

				${includeExtrudedCube ? /* glsl */`
					if (extrudedCubeWeight > 0.0)
					{
						color += extrudedCubeWeight * getColorExtrudedCube(rotatedPos);
					}
				` : ""}

				${includeMengerSponge ? /* glsl */`
					if (mengerSpongeWeight > 0.0)
					{
						color += mengerSpongeWeight * getColorMengerSponge(rotatedPos);
					}
				` : ""}

				${includeKIFS ? /* glsl */`
					if (kIFSWeight > 0.0)
					{
						color += kIFSWeight * getColorKIFS(rotatedPos);
					}
				` : ""}

				${includeMandelbulb ? /* glsl */`
					if (mandelbulbWeight > 0.0)
					{
						color += mandelbulbWeight * getColorMandelbulb(rotatedPos);
					}
				` : ""}

				${includeQJulia ? /* glsl */`
					if (qJuliaWeight > 0.0)
					{
						color += qJuliaWeight * getColorQJulia(rotatedPos);
					}
				` : ""}

				return color;
			}
		`;

		const distanceEstimatorGlsl = /* glsl */`
			float distanceGround = distanceEstimatorGround(pos);
			float distanceObject = distanceEstimatorObject(pos);

			return min(distanceGround, distanceObject);
		`;

		const getColorGlsl = /* glsl */`
			float distanceGround = distanceEstimatorGround(pos);
			float distanceObject = distanceEstimatorObject(pos);

			float minDistance = min(distanceGround, distanceObject);

			if (minDistance == distanceGround)
			{
				vec2 co = floor(pos.xy * 50.0);
				return vec3(0.5, 0.5, 0.5)
					* (1.0 + .2 * (rand(co) - .5));
			}

			if (minDistance == distanceObject)
			{
				return getColorObject(pos);
			}
		`;

		const getReflectivityGlsl = /* glsl */`
			float distanceGround = distanceEstimatorGround(pos);
			float distanceObject = distanceEstimatorObject(pos);

			float minDistance = min(distanceGround, distanceObject);

			if (minDistance == distanceGround)
			{
				return .05;
			}

			if (minDistance == distanceObject)
			{
				return 0.15;
			}
		`;

		const uniformsGlsl = /* glsl */`
			uniform float objectRotation;
			uniform float objectFloat;
			uniform float sphereWeight;
			uniform float extrudedCubeWeight;
			uniform float extrudedCubeSeparation;
			uniform float mengerSpongeWeight;
			uniform float mengerSpongeScale;
			uniform mat3 rotationMatrix;
			uniform float kIFSWeight;
			uniform float mandelbulbWeight;
			uniform float qJuliaWeight;
		`;

		const includeRotationMatrix = includeMengerSponge
			|| includeKIFS
			|| includeMandelbulb
			|| includeQJulia;

		const uniforms = {
			objectRotation: 0,
			objectFloat: 0,

			...(includeSphere ? { sphereWeight: 1 } : {}),

			...(includeExtrudedCube ? { extrudedCubeWeight: 0, extrudedCubeSeparation: 1.5 } : {}),

			...(includeMengerSponge ? { mengerSpongeWeight: 0, mengerSpongeScale: 3 } : {}),
			
			...(includeRotationMatrix ? { rotationMatrix: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] } : {}),

			...(includeKIFS ? { kIFSWeight: 0 } : {}),

			...(includeMandelbulb ? { mandelbulbWeight: 0 } : {}),

			...(includeQJulia ? { qJuliaWeight: 0 } : {}),
		};

		super({
			canvas,
			distanceEstimatorGlsl,
			getColorGlsl,
			getReflectivityGlsl,
			addGlsl,
			uniformsGlsl,
			uniforms,
			maxMarches: 192,
			cameraPos: [1, 1, 1],
			theta: 1.25 * Math.PI,
			phi: Math.PI / 2,
			lockedOnOrigin: false,
			lockZ: 1,
			fogColor: [0.6, 0.73, 0.87],
			fogScaling: 0.075,
			epsilonScaling: 0.9,
			useShadows,
			useReflections
		});

		this.includeRotationMatrix = includeRotationMatrix;
	}

	distanceEstimator()
	{
		return 1;
	}

	updateRotationAndFloat()
	{
		this.setUniforms({
			objectRotation: this.uniforms.objectRotation + .003,
			objectFloat: .1 * Math.sin(3 * this.uniforms.objectRotation),
			...(this.includeRotationMatrix ? {
				rotationMatrix: getRotationMatrix(
					(Math.sin(3 * this.uniforms.objectRotation + 1.013) + 1) / 6,
					(Math.sin(2 * this.uniforms.objectRotation) + 1) / 6,
					(Math.sin(5 * this.uniforms.objectRotation + .53) + 1) / 6,
				),
			} : {}),
		});

		this.needNewFrame = true;
	}

	prepareFrame(timeElapsed)
	{
		this.moveUpdate(timeElapsed);
		this.updateRotationAndFloat();
	}
}