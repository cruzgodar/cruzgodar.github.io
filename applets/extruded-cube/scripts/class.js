import { RaymarchApplet } from "/scripts/applets/raymarchApplet.js";

export class ExtrudedCube extends RaymarchApplet
{
	distanceFromOrigin = 15.5 * 1 / 2.5;

	constructor({
		canvas,
		xrFramebufferScaleSlider
	}) {
		const distanceEstimatorGlsl = /* glsl */`
			float scaleCenter = (scale + 1.0) / (scale - 1.0) * separation;

			pos = abs(pos);

			float totalDistance = (max(max(pos.x, pos.y), pos.z) - 1.0);

			for (int iteration = 0; iteration < maxIterations; iteration++)
			{
				if (iteration == iterations)
				{
					break;
				}

				if (pos.x > max(pos.y, pos.z))
				{
					pos = scale * pos - (scale - 1.0) * vec3(scaleCenter, 0.0, 0.0);
				}

				else if (pos.y > max(pos.x, pos.z))
				{
					pos = scale * pos - (scale - 1.0) * vec3(0.0, scaleCenter, 0.0);
				}

				else
				{
					pos = scale * pos - (scale - 1.0) * vec3(0.0, 0.0, scaleCenter);
				}

				pos = abs(pos);

				totalDistance = min(
					totalDistance,
					(max(max(pos.x, pos.y), pos.z) - 1.0)
						/ pow(scale, float(iteration + 1))
				);
			}
			
			return totalDistance;
		`;
			
		const getColorGlsl = /* glsl */`	
			vec3 color = vec3(0.25);

			float scaleCenter = (scale + 1.0) / (scale - 1.0) * separation;

			pos = abs(pos);

			for (int iteration = 0; iteration < 8; iteration++)
			{
				if (iteration == iterations)
				{
					break;
				}

				if (pos.x > max(pos.y, pos.z))
				{
					pos = scale * pos - (scale - 1.0) * vec3(scaleCenter, 0.0, 0.0);

					color += vec3(0.0, 0.75, 1.0) * pow(2.0, -float(iteration + 1));
				}

				else if (pos.y > max(pos.x, pos.z))
				{
					pos = scale * pos - (scale - 1.0) * vec3(0.0, scaleCenter, 0.0);

					color += vec3(0.75, 0.0, 1.0) * pow(2.0, -float(iteration + 1));
				}

				else
				{
					pos = scale * pos - (scale - 1.0) * vec3(0.0, 0.0, scaleCenter);

					color += vec3(0.0, 0.0, 1.0) * pow(2.0, -float(iteration + 1));
				}

				pos = abs(pos);
			}
			
			return color;
		`;

		const addGlsl = /* glsl */`
			const int maxIterations = 32;
		`;

		const uniformsGlsl = /* glsl */`
			uniform int iterations;
			uniform float scale;
			uniform float separation;
		`;

		const uniforms = {
			iterations: 16,
			scale: 2.5,
			separation: 1,
		};

		super({
			canvas,
			distanceEstimatorGlsl,
			getColorGlsl,
			addGlsl,
			uniformsGlsl,
			uniforms,
			sceneOrigin: [3.645, 3.603, 3.554],
			theta: 3.921,
			phi: 2.177,
			epsilonScalingFactor: 0,
			minEpsilon: .000005,
			lightBrightness: 1.8,
			overstepFactor: 1.25,
			xrFramebufferScaleSlider,

			coneMarchingScales: [16, 4],
			coneMarchingMaxMarches: [96, 48],
		});
	}

	distanceEstimator(x, y, z)
	{
		const scale = this.uniforms.scale;
		const separation = this.uniforms.separation;
		const iterations = this.uniforms.iterations;

		const scaleCenter = (scale + 1) / (scale - 1) * separation;

		let mutablePos = [
			Math.abs(x),
			Math.abs(y),
			Math.abs(z)
		];

		let totalDistance = Math.max(
			Math.max(mutablePos[0], mutablePos[1]),
			mutablePos[2]
		) - 1;

		for (let iteration = 0; iteration < iterations; iteration++)
		{
			if (mutablePos[0] > Math.max(mutablePos[1], mutablePos[2]))
			{
				mutablePos = [
					scale * mutablePos[0] - (scale - 1) * scaleCenter,
					scale * mutablePos[1],
					scale * mutablePos[2]
				];
			}

			else if (mutablePos[1] > Math.max(mutablePos[0], mutablePos[2]))
			{
				mutablePos = [
					scale * mutablePos[0],
					scale * mutablePos[1] - (scale - 1) * scaleCenter,
					scale * mutablePos[2]
				];
			}

			else
			{
				mutablePos = [
					scale * mutablePos[0],
					scale * mutablePos[1],
					scale * mutablePos[2] - (scale - 1) * scaleCenter
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
		
		return Math.abs(totalDistance);
	}
}