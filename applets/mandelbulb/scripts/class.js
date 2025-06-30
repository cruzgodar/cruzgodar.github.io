import anime from "/scripts/anime.js";
import {
	magnitude,
	mat3TimesVector,
	RaymarchApplet
} from "/scripts/applets/raymarchApplet.js";
import { animate } from "/scripts/src/utils.js";

export class Mandelbulb extends RaymarchApplet
{
	animeLoop;
	fountainFactor = 0;

	constructor({
		canvas,
	}) {
		const distanceEstimatorGlsl = /* glsl */`
			vec3 z = pos;
			
			float r = length(z);
			float dr = 1.0;
			
			for (int iteration = 0; iteration < 16; iteration++)
			{
				if (r > 16.0)
				{
					break;
				}
				
				float theta = acos(clamp(z.z / r, -1.0, 1.0));
				
				float phi = atan(z.y, z.x);
				
				dr = pow(r, power - 1.0) * power * dr + 1.0;
				
				theta = power * theta + fountainAmount;
				
				phi *= power;
				
				z = pow(r, power) * vec3(
					sin(theta) * cos(phi),
					sin(theta) * sin(phi),
					cos(theta)
				);
				
				z += mix(pos, c, juliaProportion);
				
				z = rotationMatrix * z;
				
				r = length(z);
			}
			
			return .5 * log(r) * r / dr;
		`;

		const getColorGlsl = /* glsl */`
			vec3 z = pos;
			
			float r = length(z);
			float dr = 1.0;
			
			vec3 color = vec3(1.0, 1.0, 1.0);
			float colorScale = .5;
			
			for (int iteration = 0; iteration < 8; iteration++)
			{
				if (r > 16.0)
				{
					break;
				}
				
				float theta = acos(z.z / r);
				
				float phi = atan(z.y, z.x);
				
				dr = pow(r, power - 1.0) * power * dr + 1.0;
				
				theta = power * theta + fountainAmount;
				
				phi *= power;
				
				z = pow(r, power) * vec3(
					sin(theta) * cos(phi),
					sin(theta) * sin(phi),
					cos(theta)
				);
				
				z += mix(pos, c, juliaProportion);
				
				z = rotationMatrix * z;
				
				r = length(z);
				
				color = mix(color, abs(z / r), colorScale);
				
				colorScale *= .5;
			}
			
			color /= max(max(color.x, color.y), color.z);
			
			return color;
		`;

		const uniformsGlsl = /* glsl */`
			uniform float power;
			uniform vec3 c;
			uniform float juliaProportion;
			uniform mat3 rotationMatrix;
			uniform float fountainAmount;
		`;

		const uniforms = {
			power: 8,
			c: [0, 0, 0],
			juliaProportion: 0,
			rotationMatrix: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
			fountainAmount: 0,
		};

		super({
			canvas,
			resolution: 400,
			distanceEstimatorGlsl,
			getColorGlsl,
			uniformsGlsl,
			uniforms,
			theta: 4.6601,
			phi: 2.272,
			cameraPos: [0.084365, 1.91102, 1.69388],
			lightPos: [-10, 0, 15],
			lightBrightness: 1.2,
		});
	}



	destroy()
	{
		super.destroy();

		if (this.animeLoop)
		{
			this.animeLoop.pause();
		}
	}



	distanceEstimator(x, y, z)
	{
		let mutableZ = [x, y, z];

		let r = 0.0;
		let dr = 1.0;

		const c = this.uniforms.c;
		const juliaProportion = this.uniforms.juliaProportion;
		const power = this.uniforms.power;
		const rotationMatrix = this.uniforms.rotationMatrix;
		const fountainAmount = this.uniforms.fountainAmount;

		for (let iteration = 0; iteration < 16; iteration++)
		{
			r = magnitude(mutableZ);

			if (r > 16.0)
			{
				break;
			}

			let theta = Math.acos(mutableZ[2] / r);

			let phi = Math.atan2(mutableZ[1], mutableZ[0]);

			dr = Math.pow(r, power - 1.0) * power * dr + 1.0;

			theta = theta * power + fountainAmount;

			phi *= power;

			const scaledR = Math.pow(r, power);

			mutableZ[0] = scaledR * Math.sin(theta) * Math.cos(phi)
				+ ((1 - juliaProportion) * x + juliaProportion * c[0]);

			mutableZ[1] = scaledR * Math.sin(theta) * Math.sin(phi)
				+ ((1 - juliaProportion) * y + juliaProportion * c[1]);

			mutableZ[2] = scaledR * Math.cos(theta)
				+ ((1 - juliaProportion) * z + juliaProportion * c[2]);

			// Apply the rotation matrix.
			mutableZ = mat3TimesVector(rotationMatrix, mutableZ);
		}

		return 0.5 * Math.log(r) * r / dr;
	}

	switchBulb(instant)
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

	async setFountainAnimation(enabled)
	{
		if (enabled)
		{
			const dummy = { t: 0 };

			this.animeLoop = anime({
				targets: dummy,
				t: -2 * Math.PI,
				duration: 3000,
				easing: "linear",
				loop: true,
				direction: "forward",
				update: () =>
				{
					this.setUniforms({
						fountainAmount: dummy.t * this.fountainFactor
					});
				},
			});

			animate((t) =>
			{
				this.fountainFactor = t;
			}, 1000);
		}

		else
		{
			this.animeLoop.pause();

			const startingFountainAmount = this.uniforms.fountainAmount * this.fountainFactor;

			animate((t) =>
			{
				this.setUniforms({
					fountainAmount: startingFountainAmount * (1 - t) - 2 * Math.PI * t
				});
			}, (startingFountainAmount + 2 * Math.PI) * 400, "easeOutQuad");
		}
	}
}