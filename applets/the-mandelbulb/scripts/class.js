import anime from "/scripts/anime.js";
import { RaymarchApplet } from "/scripts/applets/raymarchApplet.js";

export class Mandelbulb extends RaymarchApplet
{
	rotationAngleX = 0;
	rotationAngleY = 0;
	rotationAngleZ = 0;

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
				
				float theta = acos(z.z / r);
				
				float phi = atan(z.y, z.x);
				
				dr = pow(r, power - 1.0) * power * dr + 1.0;
				
				theta *= power;
				
				phi *= power;
				
				z = pow(r, power) * vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));
				
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
			
			for (int iteration = 0; iteration < 100; iteration++)
			{
				if (r > 16.0)
				{
					break;
				}
				
				float theta = acos(z.z / r);
				
				float phi = atan(z.y, z.x);
				
				dr = pow(r, power - 1.0) * power * dr + 1.0;
				
				theta *= power;
				
				phi *= power;
				
				z = pow(r, power) * vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));
				
				z += mix(pos, c, juliaProportion);
				
				z = rotationMatrix * z;
				
				r = length(z);
				
				color = mix(color, abs(z / r), colorScale);
				
				colorScale *= .5;
			}
			
			color /= max(max(color.x, color.y), color.z);
			
			return color;
		`;

		const uniforms = {
			power: ["float", 8],
			c: ["vec3", [0, 0, 0]],
			juliaProportion: ["float", 0],
			rotationMatrix: ["mat3", [1, 0, 0, 0, 1, 0, 0, 0, 1]],
		};

		super({
			canvas,
			distanceEstimatorGlsl,
			getColorGlsl,
			uniforms,
			theta: 4.6601,
			phi: 2.272,
			cameraPos: [0.0718, 1.6264, 1.4416],
			lightPos: [0, 0, 5],
			lightBrightness: 1,
		});
	}


	updateRotationMatrix()
	{
		const matZ = [
			[Math.cos(this.rotationAngleZ), -Math.sin(this.rotationAngleZ), 0],
			[Math.sin(this.rotationAngleZ), Math.cos(this.rotationAngleZ), 0],
			[0, 0, 1]
		];

		const matY = [
			[Math.cos(this.rotationAngleY), 0, -Math.sin(this.rotationAngleY)],
			[0, 1, 0],
			[Math.sin(this.rotationAngleY), 0, Math.cos(this.rotationAngleY)]
		];

		const matX = [
			[1, 0, 0],
			[0, Math.cos(this.rotationAngleX), -Math.sin(this.rotationAngleX)],
			[0, Math.sin(this.rotationAngleX), Math.cos(this.rotationAngleX)]
		];

		const matTotal = RaymarchApplet.matMul(RaymarchApplet.matMul(matZ, matY), matX);

		this.setUniform("rotationMatrix", [
			matTotal[0][0],
			matTotal[1][0],
			matTotal[2][0],
			matTotal[0][1],
			matTotal[1][1],
			matTotal[2][1],
			matTotal[0][2],
			matTotal[1][2],
			matTotal[2][2]
		]);
		
		this.needNewFrame = true;
	}



	distanceEstimator(x, y, z)
	{
		const mutableZ = [x, y, z];

		let r = 0.0;
		let dr = 1.0;

		const c = this.uniforms.c[1];
		const juliaProportion = this.uniforms.juliaProportion[1];
		const power = this.uniforms.power[1];

		for (let iteration = 0; iteration < 16; iteration++)
		{
			r = Math.sqrt(RaymarchApplet.dotProduct(mutableZ, mutableZ));

			if (r > 16.0)
			{
				break;
			}

			let theta = Math.acos(mutableZ[2] / r);

			let phi = Math.atan2(mutableZ[1], mutableZ[0]);

			dr = Math.pow(r, power - 1.0) * power * dr + 1.0;

			theta *= power;

			phi *= power;

			const scaledR = Math.pow(r, power);

			mutableZ[0] = scaledR * Math.sin(theta) * Math.cos(phi)
				+ ((1 - juliaProportion) * x + juliaProportion * c[0]);

			mutableZ[1] = scaledR * Math.sin(theta) * Math.sin(phi)
				+ ((1 - juliaProportion) * y + juliaProportion * c[1]);

			mutableZ[2] = scaledR * Math.cos(theta)
				+ ((1 - juliaProportion) * z + juliaProportion * c[2]);



			// Apply the rotation matrix.

			const tempX = mutableZ[0];
			const tempY = mutableZ[1];
			const tempZ = mutableZ[2];

			const matZ = [
				[Math.cos(this.rotationAngleZ), -Math.sin(this.rotationAngleZ), 0],
				[Math.sin(this.rotationAngleZ), Math.cos(this.rotationAngleZ), 0],
				[0, 0, 1]
			];

			const matY = [
				[Math.cos(this.rotationAngleY), 0, -Math.sin(this.rotationAngleY)],
				[0, 1, 0],
				[Math.sin(this.rotationAngleY), 0, Math.cos(this.rotationAngleY)]
			];

			const matX = [
				[1, 0, 0],
				[0, Math.cos(this.rotationAngleX), -Math.sin(this.rotationAngleX)],
				[0, Math.sin(this.rotationAngleX), Math.cos(this.rotationAngleX)]
			];

			const matTotal = RaymarchApplet.matMul(RaymarchApplet.matMul(matZ, matY), matX);

			mutableZ[0] = matTotal[0][0] * tempX + matTotal[0][1] * tempY + matTotal[0][2] * tempZ;
			mutableZ[1] = matTotal[1][0] * tempX + matTotal[1][1] * tempY + matTotal[1][2] * tempZ;
			mutableZ[2] = matTotal[2][0] * tempX + matTotal[2][1] * tempY + matTotal[2][2] * tempZ;
		}

		return 0.5 * Math.log(r) * r / dr;
	}

	switchBulb()
	{
		const dummy = { t: 0 };

		const oldJuliaProportion = this.uniforms.juliaProportion[1];
		const newJuliaProportion = this.uniforms.juliaProportion[1] === 0 ? 1 : 0;

		anime({
			targets: dummy,
			t: 1,
			duration: 1000,
			easing: "easeOutSine",
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