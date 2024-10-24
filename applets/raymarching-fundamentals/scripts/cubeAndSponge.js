import { extrudedCubeDE, mengerSpongeDE } from "./distanceEstimators.js";
import { RaymarchApplet } from "/scripts/applets/raymarchApplet.js";

export class CubeAndSponge extends RaymarchApplet
{
	sphereWeight = 0;

	extrudedCubeWeight = 1;
	extrudedCubeSeparation = 1.5;

	mengerSpongeWeight = 0;
	mengerSpongeScale = 3;

	constructor({
		canvas,
		useShadows = false,
		useReflections = false
	}) {
		const addGlsl = /* glsl */`
			float rand(vec2 co)
			{
				return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
			}

			${extrudedCubeDE[0]}
			${mengerSpongeDE[0]}

			${extrudedCubeDE[1]}
			${mengerSpongeDE[1]}

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

				if (extrudedCubeWeight > 0.0)
				{
					distanceObject += extrudedCubeWeight * distanceEstimatorExtrudedCube(rotatedPos);
				}
				
				if (mengerSpongeWeight > 0.0)
				{
					distanceObject += mengerSpongeWeight * distanceEstimatorMengerSponge(rotatedPos);
				}
				
				return distanceObject;
			}

			vec3 getColorObject(vec3 pos)
			{
				vec3 color = vec3(0.0, 0.0, 0.0);

				float c = cos(objectRotation);
				float s = sin(objectRotation);
				vec3 rotatedPos = mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0) * (pos + vec3(0.0, 0.0, objectFloat));

				if (extrudedCubeWeight > 0.0)
				{
					color += extrudedCubeWeight * getColorExtrudedCube(rotatedPos);
				}

				if (mengerSpongeWeight > 0.0)
				{
					color += mengerSpongeWeight * getColorMengerSponge(rotatedPos);
				}

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

			sphereWeight: ["float", 0],

			extrudedCubeWeight: ["float", 1],
			extrudedCubeSeparation: ["float", 1.5],

			mengerSpongeWeight: ["float", 0],
			mengerSpongeScale: ["float", 3],
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