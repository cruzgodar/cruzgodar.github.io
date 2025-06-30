import {
	dotProduct,
	magnitude,
	mat3TimesVector,
	RaymarchApplet
} from "/scripts/applets/raymarchApplet.js";
import { animate, clamp } from "/scripts/src/utils.js";

const minRadius2 = 0.1;
const fixedRadius2 = 1;
const foldingLimit = 1;
const numIterations = 32;

function sphereFold(z, dz)
{
	const r2 = dotProduct(z, z);

	if (r2 < minRadius2)
	{
		const temp = fixedRadius2 / minRadius2;
		z[0] *= temp;
		z[1] *= temp;
		z[2] *= temp;
		dz *= temp;
	}

	else if (r2 < fixedRadius2)
	{
		const temp = fixedRadius2 / r2;
		z[0] *= temp;
		z[1] *= temp;
		z[2] *= temp;
		dz *= temp;
	}

	return dz;
}

function boxFold(z)
{
	z[0] = clamp(z[0], -foldingLimit, foldingLimit) * 2 - z[0];
	z[1] = clamp(z[1], -foldingLimit, foldingLimit) * 2 - z[1];
	z[2] = clamp(z[2], -foldingLimit, foldingLimit) * 2 - z[2];
}


export class Mandelbox extends RaymarchApplet
{
	constructor({
		canvas,
	}) {
		const addGlsl = /* glsl */`
			const float minRadius2 = 0.01;
			const float fixedRadius2 = 0.5;
			const float foldingLimit = 1.0;


			void sphereFold(inout vec3 z, inout float dz)
			{
				float r2 = dot(z, z);

				if (r2 < minRadius2)
				{ 
					// linear inner scaling
					float temp = fixedRadius2 / minRadius2;
					z *= temp;
					dz *= temp;
				}

				else if (r2 < fixedRadius2)
				{ 
					// this is the actual sphere inversion
					float temp = fixedRadius2 / r2;
					z *= temp;
					dz *= temp;
				}
			}

			void boxFold(inout vec3 z)
			{
				z = clamp(z, -foldingLimit, foldingLimit) * 2.0 - z;
			}
		`;

		const distanceEstimatorGlsl = /* glsl */`
			pos = pos * (scale > 0.0 ? (scale + 1.0) / (scale - 1.0) : 1.0);
			vec3 initialPos = mix(pos, c, juliaProportion);

			float dr = 1.0;

			for (int iteration = 0; iteration < ${numIterations}; iteration++)
			{
				boxFold(pos);
				sphereFold(pos, dr);

				pos = scale * pos + initialPos;
				dr = dr * abs(scale) + 1.0;

				pos = rotationMatrix * pos;
			}

			return length(pos) / abs(dr);
		`;

		const getColorGlsl = /* glsl */`
			pos = pos * (scale > 0.0 ? (scale + 1.0) / (scale - 1.0) : 1.0);
			vec3 initialPos = mix(pos, c, juliaProportion);

			float dr = 1.0;

			vec3 color = vec3(1.0, 1.0, 1.0);
			float colorScale = .5;

			for (int iteration = 0; iteration < ${numIterations}; iteration++)
			{
				boxFold(pos);
				sphereFold(pos, dr);

				pos = scale * pos + initialPos;
				dr = dr * abs(scale) + 1.0;

				color = mix(color, abs(normalize(pos)), colorScale);
				colorScale *= .5;

				pos = rotationMatrix * pos;
			}
			
			color /= max(max(color.x, color.y), color.z);
			
			return color;
		`;

		const uniformsGlsl = /* glsl */`
			uniform float scale;
			uniform vec3 c;
			uniform float juliaProportion;
			uniform mat3 rotationMatrix;
		`;

		const uniforms = {
			scale: 2,
			c: [0, 0, 0],
			juliaProportion: 0,
			rotationMatrix: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
		};

		super({
			canvas,
			resolution: 500,
			addGlsl,
			distanceEstimatorGlsl,
			getColorGlsl,
			uniformsGlsl,
			uniforms,
			theta: 4.6601,
			phi: 2.272,
			cameraPos: [4, 0, 0],
			lightPos: [-10, 0, 15],
			fogScaling: 0.025,
			lightBrightness: 1.1,
			stepFactor: 0.9,
			minEpsilon: .000005,
		});
	}

	distanceEstimator(x, y, z)
	{
		const scale = this.uniforms.scale;
		const c = this.uniforms.c;
		const juliaProportion = this.uniforms.juliaProportion;
		const rotationMatrix = this.uniforms.rotationMatrix;

		const scaleAdjust = scale > 0 ? (scale + 1) / (scale - 1) : 1;
		x = x * scaleAdjust;
		y = y * scaleAdjust;
		z = z * scaleAdjust;

		const initialPos = [
			(1 - juliaProportion) * x + juliaProportion * c[0],
			(1 - juliaProportion) * y + juliaProportion * c[1],
			(1 - juliaProportion) * z + juliaProportion * c[2],
		];

		let pos = [x, y, z];
		let dr = 1;

		for (let iteration = 0; iteration < numIterations; iteration++)
		{
			boxFold(pos);
			dr = sphereFold(pos, dr);

			pos[0] = scale * pos[0] + initialPos[0];
			pos[1] = scale * pos[1] + initialPos[1];
			pos[2] = scale * pos[2] + initialPos[2];

			dr = dr * Math.abs(scale) + 1;

			// Apply the rotation matrix.
			pos = mat3TimesVector(rotationMatrix, pos);
		}

		return magnitude(pos) / Math.abs(dr);
	}

	switchBox(instant)
	{
		const oldJuliaProportion = this.uniforms.juliaProportion;
		const newJuliaProportion = this.uniforms.juliaProportion === 0 ? 1 : 0;

		animate((t) => {
			this.setUniforms({
				juliaProportion:
					(1 - t) * oldJuliaProportion + t * newJuliaProportion
			});

			this.needNewFrame = true;
		}, instant ? 0 : 650, "easeOutQuad");
	}
}