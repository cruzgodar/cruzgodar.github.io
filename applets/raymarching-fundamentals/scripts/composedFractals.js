import { extrudedCubeDE, kIFSCubeDE, mengerSpongeDE } from "./distanceEstimators.js";
import { getRotationMatrix, RaymarchApplet } from "/scripts/applets/raymarchApplet.js";

export class ComposedFractals extends RaymarchApplet
{
	sphereWeight = 0;

	extrudedCubeWeight = 1;
	extrudedCubeSeparation = 1.5;

	mengerSpongeWeight = 0;
	mengerSpongeScale = 3;

	constructor({
		canvas,
		useShadows = false,
		useReflections = false,
		includeSphere = false,
		includeExtrudedCube = false,
		includeMengerSponge = false,
		includeKIFS = false
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
				return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
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

		const uniforms = {
			objectRotation: ["float", 0],
			objectFloat: ["float", 0],

			sphereWeight: ["float", 1],

			extrudedCubeWeight: ["float", 0],
			extrudedCubeSeparation: ["float", 1.5],

			mengerSpongeWeight: ["float", 0],
			mengerSpongeScale: ["float", 3],
			rotationMatrix: ["mat3", [[1, 0, 0], [0, 1, 0], [0, 0, 1]]],

			kIFSWeight: ["float", 0],
		};

		super({
			canvas,
			distanceEstimatorGlsl,
			getColorGlsl,
			getReflectivityGlsl,
			addGlsl,
			uniforms,
			maxMarches: 192,
			cameraPos: [1, 1, 1],
			theta: 1.25 * Math.PI,
			phi: 2.1539,
			lockedOnOrigin: false,
			lockZ: 1,
			fogColor: [0.6, 0.73, 0.87],
			fogScaling: 0.075,
			epsilonScaling: 0.75,
			useShadows,
			useReflections
		});
	}

	distanceEstimator()
	{
		return 1;
	}

	updateRotationAndFloat()
	{
		this.setUniform(
			"objectRotation",
			this.uniforms.objectRotation[1] + .003
		);

		this.setUniform(
			"objectFloat",
			.1 * Math.sin(3 * this.uniforms.objectRotation[1])
		);

		this.setUniform("rotationMatrix", getRotationMatrix(
			(Math.sin(3 * this.uniforms.objectRotation[1] + 1.013) + 1) / 6,
			(Math.sin(2 * this.uniforms.objectRotation[1]) + 1) / 6,
			(Math.sin(5 * this.uniforms.objectRotation[1] + .53) + 1) / 6,
		));

		this.needNewFrame = true;
	}

	prepareFrame(timeElapsed)
	{
		this.pan.update(timeElapsed);
		this.zoom.update(timeElapsed);
		this.moveUpdate(timeElapsed);
		this.updateRotationAndFloat();
	}
}