import anime from "/scripts/anime.js";
import { dotProduct4, qmul, RaymarchApplet } from "/scripts/applets/raymarchApplet.js";

export class QuaternionicJuliaSet extends RaymarchApplet
{
	constructor({ canvas })
	{
		const distanceEstimatorGlsl = /* glsl */`
			vec4 z = vec4(pos, 0.0);
			vec4 zPrime = vec4(1.0, 0.0, 0.0, 0.0);
			float r;
			
			for (int iteration = 0; iteration < 16; iteration++)
			{
				r = length(z);
				
				if (r > 16.0)
				{
					break;
				}
				
				zPrime = 2.0 * qmul(z, zPrime);
				
				z = qmul(z, z);
				
				z += mix(vec4(pos, 0.0), vec4(c, 0.0), juliaProportion);
			}
			
			
			r = length(z);
			return .5 * r * log(r) / length(zPrime);
		`;

		const getColorGlsl = /* glsl */`
			vec4 z = vec4(pos, 0.0);
			vec4 zPrime = vec4(1.0, 0.0, 0.0, 0.0);
			float r;
			
			vec3 color = vec3(1.0, 1.0, 1.0);
			float colorScale = .5;
			
			for (int iteration = 0; iteration < 16; iteration++)
			{
				r = length(z);
				
				if (r > 16.0)
				{
					break;
				}
				
				zPrime = 2.0 * qmul(z, zPrime);
				
				z = qmul(z, z);
				
				z += mix(vec4(pos, 0.0), vec4(c, 0.0), juliaProportion);
				
				color = mix(color, abs(normalize(z.xyz)), colorScale);
				
				colorScale *= .5;
			}
			
			color /= max(max(color.x, color.y), color.z);
			
			return color;
		`;

		const addGlsl = /* glsl */`
			vec4 qmul(vec4 z, vec4 w)
			{
				return vec4(z.x*w.x - z.y*w.y - z.z*w.z - z.w*w.w, z.x*w.y + z.y*w.x + z.z*w.w - z.w*w.z, z.x*w.z - z.y*w.w + z.z*w.x + z.w*w.y, z.x*w.w + z.y*w.z - z.z*w.y + z.w*w.x);
			}
		`;

		const uniforms = {
			c: ["vec3", [-.54, -.25, -.668]],
			juliaProportion: ["float", 1],
		};

		super({
			canvas,
			distanceEstimatorGlsl,
			getColorGlsl,
			addGlsl,
			uniforms,
			stepFactor: .75,
			theta: 1.3094,
			phi: 1.9975,
			cameraPos: [-0.6265, -2.3421, 1.1022],
			lightPos: [-5, -5, 5],
			lightBrightness: 1.25,
		});
	}

	distanceEstimator(x, y, z)
	{
		const c = this.uniforms.c[1];
		const juliaProportion = this.uniforms.juliaProportion[1];

		let mutableZ = [x, y, z, 0];
		let zPrime = [1.0, 0.0, 0.0, 0.0];

		let r = 0.0;

		for (let iteration = 0; iteration < 16; iteration++)
		{
			r = Math.sqrt(dotProduct4(mutableZ, mutableZ));

			if (r > 16.0)
			{
				break;
			}

			zPrime = qmul(...mutableZ, ...zPrime);
			zPrime[0] *= 2;
			zPrime[1] *= 2;
			zPrime[2] *= 2;
			zPrime[3] *= 2;

			mutableZ = qmul(...mutableZ, ...mutableZ);

			mutableZ[0] += ((1 - juliaProportion) * x + juliaProportion * c[0]);
			mutableZ[1] += ((1 - juliaProportion) * y + juliaProportion * c[1]);
			mutableZ[2] += ((1 - juliaProportion) * z + juliaProportion * c[2]);
		}

		return 0.5 * Math.log(r) * r / Math.sqrt(dotProduct4(zPrime, zPrime));
	}



	switchBulb()
	{
		const juliaProportion = this.uniforms.juliaProportion[1];

		if (Math.floor(juliaProportion) !== juliaProportion)
		{
			return;
		}

		const oldJuliaProportion = juliaProportion;
		const newJuliaProportion = 1 - juliaProportion;

		const dummy = { t: 0 };

		anime({
			targets: dummy,
			t: 1,
			duration: 1000,
			easing: "easeOutQuad",
			update: () =>
			{
				this.setUniform(
					"juliaProportion",
					(1 - dummy.t) * oldJuliaProportion + dummy.t * newJuliaProportion
				);

				this.needNewFrame = true;
			}
		});
	}
}