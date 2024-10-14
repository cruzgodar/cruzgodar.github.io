import { extrudedCubeDE, mengerSpongeDE } from "./distanceEstimators.js";
import { RaymarchApplet } from "/scripts/applets/raymarchApplet.js";

export class CubeAndSponge extends RaymarchApplet
{
	sphereWeight = 0;

	extrudedCubeWeight = 1;
	extrudedCubeSeparation = 1.5;

	mengerSpongeWeight = 0;
	mengerSpongeScale = 3;

	constructor({ canvas }) {
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
			useShadows: true,
		});
	}

	distanceEstimator()
	{
		return 1;
	}

	distanceEstimatorExtrudedCube(x, y, z)
	{
		const scale = this.uniforms.extrudedCubeScale[1];
		const separation = this.uniforms.extrudedCubeSeparation[1];

		const scaleCenter = (scale + 1)
			/ (scale - 1) * separation;

		let mutablePos = [
			Math.abs(x) * 3,
			Math.abs(y) * 3,
			Math.abs(z) * 3 - 2.5
		];

		let totalDistance = Math.max(
			Math.max(mutablePos[0], mutablePos[1]),
			mutablePos[2]
		) - 1;

		for (let iteration = 0; iteration < this.iterations; iteration++)
		{
			if (mutablePos[0] > Math.max(mutablePos[1], mutablePos[2]))
			{
				mutablePos = [
					scale * mutablePos[0]
						- (scale - 1) * scaleCenter,
					scale * mutablePos[1],
					scale * mutablePos[2]
				];
			}

			else if (mutablePos[1] > Math.max(mutablePos[0], mutablePos[2]))
			{
				mutablePos = [
					scale * mutablePos[0],
					scale * mutablePos[1]
						- (scale - 1) * scaleCenter,
					scale * mutablePos[2]
				];
			}

			else
			{
				mutablePos = [
					scale * mutablePos[0],
					scale * mutablePos[1],
					scale * mutablePos[2]
						- (scale - 1) * scaleCenter
				];
			}

			mutablePos = [
				Math.abs(mutablePos[0]),
				Math.abs(mutablePos[1]),
				Math.abs(mutablePos[2])
			];

			totalDistance = Math.min(
				totalDistance,
				(Math.max(Math.max(mutablePos[0], mutablePos[1]), mutablePos[2]) - 1)
					/ Math.pow(scale, iteration + 1)
			);
		}
		
		return Math.abs(totalDistance) / 3;
	}

	distanceEstimatorMengerSponge(x, y, z)
	{
		const scale = this.uniforms.mengerSpongeScale[1];

		let mutablePos = [
			Math.abs(x) * 3,
			Math.abs(y) * 3,
			Math.abs(z) * 3 - 2.5
		];

		let maxAbsPos = Math.max(Math.max(mutablePos[0], mutablePos[1]), mutablePos[2]);
		let minAbsPos = Math.min(Math.min(mutablePos[0], mutablePos[1]), mutablePos[2]);
		let sumAbsPos = mutablePos[0] + mutablePos[1] + mutablePos[2];
		mutablePos = [minAbsPos, sumAbsPos - minAbsPos - maxAbsPos, maxAbsPos];

		let totalDistance;
		const totalScale = [1, 1, 1];
		let effectiveScale;

		const invScale = 1 / scale;
		const cornerFactor = 2 * scale
			/ (1 * scale - 1);
		const edgeFactor = 2 * scale / (scale - 1);

		const cornerScaleCenter = [
			(cornerFactor - 1) * (
				(1 + 1 * scale) / (1 + 2 * scale
				- 1 * scale)
			),

			(cornerFactor - 1) * (
				(1 + 1 * scale) / (1 + 2 * scale
				- 1 * scale)
			),

			(cornerFactor - 1) * (
				(1 + 1 * scale) / (1 + 2 * scale
				- 1 * scale)
			)
		];
		
		const edgeScaleCenter = [0, edgeFactor - 1, edgeFactor - 1];

		const cornerRadius = 0.5 * (1 - invScale);
		const cornerCenter = 0.5 * (1 + invScale);

		const edgeRadius = 0.5 * (1 - invScale);
		const edgeCenter = 0.5 * (1 + invScale);

		for (let iteration = 0; iteration < 16; iteration++)
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
					scale * mutablePos[0] - edgeScaleCenter[0],
					edgeFactor * mutablePos[1] - edgeScaleCenter[1],
					edgeFactor * mutablePos[2] - edgeScaleCenter[2]
				];

				totalScale[0] *= scale;
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
		
		return Math.abs(totalDistance) / effectiveScale * 0.333333;
	}
}