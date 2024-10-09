import { RaymarchApplet } from "/scripts/applets/raymarchApplet.js";

export class CurvedLight extends RaymarchApplet
{
	constructor({ canvas })
	{
		const distanceEstimatorGlsl = /* glsl */`
			return length(mod(pos, 2.0) - vec3(1.0, 1.0, 1.0)) - .5;
		`;

		const getColorGlsl = /* glsl */`
			return vec3(
				.25 + .75 * (.5 * (sin(floor(pos.x * .5) * 40.0) + 1.0)),
				.25 + .75 * (.5 * (sin(floor(pos.y * .5) * 57.0) + 1.0)),
				.25 + .75 * (.5 * (sin(floor(pos.z * .5) * 89.0) + 1.0))
			);
		`;

		const addGlsl = /* glsl */`
			float rand(vec2 co)
			{
				return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
			}

			vec3 geodesic(vec3 pos, vec3 dir, float t)
			{
				vec3 returnValue = vec3(0.0);
				vec3 p = normalize(cross(-dir, rightVec));
				vec3 q = normalize(cross(dir, p));

				if (c0 > 0.0)
				{
					returnValue += c0 * dir * t;
				}

				// Circle of radius r curving upward.
				if (c1 > 0.0)
				{
					float scaledT = t / radius;
					returnValue += c1 * radius * (p + cos(scaledT) * p + sin(scaledT) * dir);
				}

				// Helix with radius 1 and curvature.
				if (c2 > 0.0)
				{
					float scaledT = t / (curvature * ${Math.PI});
					returnValue += c2 * (
						dir * scaledT + (cos(curvature * scaledT) * p + sin(curvature * scaledT) * q) * (1.0 - 1.0 / (1.0 + scaledT))
					);
				}

				// Spiral with curvature.
				if (c3 > 0.0)
				{
					float scaledT = t / (curvature * 2.0 * ${Math.PI});
					returnValue += c3 * (
						dir * scaledT + scaledT * (cos(curvature * scaledT) * p + sin(curvature * scaledT) * q)
					);
				}

				// Square.
				if (c4 > 0.0)
				{
					float scaledT = t / radius;
					returnValue += c4 * radius * (
						dir * min(scaledT, 1.0)
						+ p * clamp(scaledT - 1.0, 0.0, 1.0)
						- dir * clamp(scaledT - 2.0, 0.0, 1.0)
						- p * clamp(scaledT - 3.0, 0.0, 1.0)
					);
				}

				// Fuzzed edges.
				if (c5 > 0.0)
				{
					returnValue += c5 * (dir + (0.1 * (rand(uv) - 0.5) * length(uv))) * t;
				}

				return pos + returnValue;
			}
		`;

		const uniforms = {
			radius: ["float", 5],
			curvature: ["float", 1],
			c0: ["float", 1],
			c1: ["float", 0],
			c2: ["float", 0],
			c3: ["float", 0],
			c4: ["float", 0],
			c5: ["float", 0],
		};

		super({
			canvas,
			distanceEstimatorGlsl,
			getColorGlsl,
			getGeodesicGlsl: (pos, dir) => `geodesic(${pos}, ${dir}, t)`,
			getReflectivityGlsl: "return 0.35;",
			addGlsl,
			uniforms,
			cameraPos: [2.0842, 2.0852, 2.0637],
			theta: 1.25 * Math.PI,
			phi: 2.1539,
			lightBrightness: 1.25,
			useOppositeLight: true,
			oppositeLightBrightness: 1,
			ambientLight: .25,
			useBloom: false,
			useReflections: true,
			lockedOnOrigin: false
		});
	}



	distanceEstimator()
	{
		return 1;
	}
}