import anime from "/scripts/anime.js";
import { getVectorGlsl } from "/scripts/applets/applet.js";
import { RaymarchApplet } from "/scripts/applets/raymarchApplet.js";

const nTetrahedron = [
	[-.577350, 0, .816496],
	[.288675, -.5, .816496],
	[.288675, .5, .816496]
];
const scaleCenterTetrahedron = [0, 0, 1];

const nCube = [
	[1, 0, 0],
	[0, 1, 0],
	[0, 0, 1]
];
const scaleCenterCube = [.577350, .577350, .577350];

const nOctahedron = [
	[.707107, 0, .707107],
	[0, .707107, .707107],
	[-.707107, 0, .707107],
	[0, -.707107, .707107]
];
const scaleCenterOctahedron = [0, 0, 1];

const maxIterations = 22;

// Shape is one of "Tetrahedron", "Cube", or "Octahedron".
function getDistanceEstimatorGlsl(shape, useForGetColor = false)
{
	return /* glsl */`
		${useForGetColor ? "vec3 color = vec3(1.0, 1.0, 1.0); float colorScale = .5;" : ""}
		//We'll find the closest vertex, scale everything by a factor of 2 centered on that vertex (so that we don't need to recalculate the vertices), and repeat.
		for (int iteration = 0; iteration < maxIterations; iteration++)
		{
			//Fold space over on itself so that we can reference only the top vertex.
			float t1 = dot(pos, n1${shape});
			
			if (t1 < 0.0)
			{
				pos -= 2.0 * t1 * n1${shape};
				${useForGetColor ? "color = mix(color, color1, colorScale);" : ""}
			}
			
			float t2 = dot(pos, n2${shape});
			
			if (t2 < 0.0)
			{
				pos -= 2.0 * t2 * n2${shape};
				${useForGetColor ? "color = mix(color, color2, colorScale);" : ""}
			}
			
			float t3 = dot(pos, n3${shape});
			
			if (t3 < 0.0)
			{
				pos -= 2.0 * t3 * n3${shape};
				${useForGetColor ? "color = mix(color, color3, colorScale);" : ""}
			}

			${shape === "Octahedron" ? /* glsl */`
				float t4 = dot(pos, n4${shape});
				
				if (t4 < 0.0)
				{
					pos -= 2.0 * t4 * n4${shape};
					${useForGetColor ? "color = mix(color, color4, colorScale);" : ""}
				}
			` : ""}
			
			pos = rotationMatrix1 * pos;
			
			//Scale the system -- this one takes me a fair bit of thinking to get. What's happening here is that we're stretching from a vertex, but since we never scale the vertices, the four new ones are the four closest to the vertex we scaled from. Now (x, y, z) will get farther and farther away from the origin, but that makes sense -- we're really just zooming in on the tetrahedron.
			pos = scale * pos - (scale - 1.0) * scaleCenter${shape};
			
			pos = rotationMatrix2 * pos;

			${useForGetColor ? "colorScale *= .5;" : ""}
		}
		
		return ${useForGetColor ? "color" : "length(pos) * pow(1.0/scale, float(maxIterations))"};
	`;
}

export class KaleidoscopicIFSFractal extends RaymarchApplet
{
	rotationAngleX1 = 0;
	rotationAngleY1 = 0;
	rotationAngleZ1 = 0;
	rotationAngleX2 = 0;
	rotationAngleY2 = 0;
	rotationAngleZ2 = 0;

	constructor({ canvas })
	{
		const addGlsl = /* glsl */`
			const int maxIterations = ${maxIterations};
			
			const vec3 color1 = vec3(1.0, 0.0, 0.0);
			const vec3 color2 = vec3(0.0, 1.0, 0.0);
			const vec3 color3 = vec3(0.0, 0.0, 1.0);
			const vec3 color4 = vec3(1.0, 1.0, 0.0);
			
			const vec3 n1Tetrahedron = ${getVectorGlsl(nTetrahedron[0])};
			const vec3 n2Tetrahedron = ${getVectorGlsl(nTetrahedron[1])};
			const vec3 n3Tetrahedron = ${getVectorGlsl(nTetrahedron[2])};
			const vec3 scaleCenterTetrahedron = ${getVectorGlsl(scaleCenterTetrahedron)};

			const vec3 n1Cube = ${getVectorGlsl(nCube[0])};
			const vec3 n2Cube = ${getVectorGlsl(nCube[1])};
			const vec3 n3Cube = ${getVectorGlsl(nCube[2])};
			const vec3 scaleCenterCube = ${getVectorGlsl(scaleCenterCube)};

			const vec3 n1Octahedron = ${getVectorGlsl(nOctahedron[0])};
			const vec3 n2Octahedron = ${getVectorGlsl(nOctahedron[1])};
			const vec3 n3Octahedron = ${getVectorGlsl(nOctahedron[2])};
			const vec3 n4Octahedron = ${getVectorGlsl(nOctahedron[3])};
			const vec3 scaleCenterOctahedron = ${getVectorGlsl(scaleCenterOctahedron)};

			float distanceEstimatorTetrahedron(vec3 pos)
			{
				${getDistanceEstimatorGlsl("Tetrahedron")}
			}

			float distanceEstimatorCube(vec3 pos)
			{
				${getDistanceEstimatorGlsl("Cube")}
			}

			float distanceEstimatorOctahedron(vec3 pos)
			{
				${getDistanceEstimatorGlsl("Octahedron")}
			}

			vec3 getColorTetrahedron(vec3 pos)
			{
				${getDistanceEstimatorGlsl("Tetrahedron", true)}
			}

			vec3 getColorCube(vec3 pos)
			{
				${getDistanceEstimatorGlsl("Cube", true)}
			}

			vec3 getColorOctahedron(vec3 pos)
			{
				${getDistanceEstimatorGlsl("Octahedron", true)}
			}
		`;

		const distanceEstimatorGlsl = /* glsl */`
			float distanceToScene = 0.0;

			if (tetrahedronAmount > 0.0)
			{
				distanceToScene += tetrahedronAmount * distanceEstimatorTetrahedron(pos);
			}

			if (cubeAmount > 0.0)
			{
				distanceToScene += cubeAmount * distanceEstimatorCube(pos);
			}

			if (octahedronAmount > 0.0)
			{
				distanceToScene += octahedronAmount * distanceEstimatorOctahedron(pos);
			}

			return distanceToScene;
		`;

		const getColorGlsl = /* glsl */`
			vec3 color = vec3(0.0, 0.0, 0.0);

			if (tetrahedronAmount > 0.0)
			{
				color += tetrahedronAmount * getColorTetrahedron(pos);
			}

			if (cubeAmount > 0.0)
			{
				color += cubeAmount * getColorCube(pos);
			}

			if (octahedronAmount > 0.0)
			{
				color += octahedronAmount * getColorOctahedron(pos);
			}

			return color;
		`;

		const uniforms = {
			tetrahedronAmount: ["float", 0],
			cubeAmount: ["float", 0],
			octahedronAmount: ["float", 1],
			scale: ["float", 2],
			rotationMatrix1: ["mat3", [1, 0, 0, 0, 1, 0, 0, 0, 1]],
			rotationMatrix2: ["mat3", [1, 0, 0, 0, 1, 0, 0, 0, 1]],
		};

		super({
			canvas,
			distanceEstimatorGlsl,
			getColorGlsl,
			addGlsl,
			uniforms,
			theta: 0.2004,
			phi: 1.6538,
			cameraPos: [-1.7346, -0.4485, 0.2596],
			lightPos: [-50, -70, 100],
			lightBrightness: 1.35,
			epsilonScaling: .75,
		});
	}



	distanceEstimatorSingular(x, y, z, ns, scaleCenter)
	{
		const scale = this.uniforms.scale[1];

		// We'll find the closest vertex, scale everything by a factor of 2
		// centered on that vertex (so that we don't need to recalculate the vertices), and repeat.
		for (let iteration = 0; iteration < maxIterations; iteration++)
		{
			// Fold space over on itself so that we can reference only the top vertex.
			const t1 = RaymarchApplet.dotProduct([x, y, z], ns[0]);

			if (t1 < 0)
			{
				x -= 2 * t1 * ns[0][0];
				y -= 2 * t1 * ns[0][1];
				z -= 2 * t1 * ns[0][2];
			}

			const t2 = RaymarchApplet.dotProduct([x, y, z], ns[1]);

			if (t2 < 0)
			{
				x -= 2 * t2 * ns[1][0];
				y -= 2 * t2 * ns[1][1];
				z -= 2 * t2 * ns[1][2];
			}

			const t3 = RaymarchApplet.dotProduct([x, y, z], ns[2]);

			if (t3 < 0)
			{
				x -= 2 * t3 * ns[2][0];
				y -= 2 * t3 * ns[2][1];
				z -= 2 * t3 * ns[2][2];
			}

			if (ns.length >= 4)
			{
				const t4 = RaymarchApplet.dotProduct([x, y, z], ns[3]);

				if (t4 < 0)
				{
					x -= 2 * t4 * ns[3][0];
					y -= 2 * t4 * ns[3][1];
					z -= 2 * t4 * ns[3][2];
				}
			}



			// Apply the first rotation matrix.

			let tempX = x;
			let tempY = y;
			let tempZ = z;

			let matZ = [
				[Math.cos(this.rotationAngleZ1), -Math.sin(this.rotationAngleZ1), 0],
				[Math.sin(this.rotationAngleZ1), Math.cos(this.rotationAngleZ1), 0],
				[0, 0, 1]
			];

			let matY = [
				[Math.cos(this.rotationAngleY1), 0, -Math.sin(this.rotationAngleY1)],
				[0, 1, 0],
				[Math.sin(this.rotationAngleY1), 0, Math.cos(this.rotationAngleY1)]
			];
			
			let matX = [
				[1, 0, 0],
				[0, Math.cos(this.rotationAngleX1), -Math.sin(this.rotationAngleX1)],
				[0, Math.sin(this.rotationAngleX1), Math.cos(this.rotationAngleX1)]
			];

			let matTotal = RaymarchApplet.matMul(RaymarchApplet.matMul(matZ, matY), matX);

			x = matTotal[0][0] * tempX + matTotal[0][1] * tempY + matTotal[0][2] * tempZ;
			y = matTotal[1][0] * tempX + matTotal[1][1] * tempY + matTotal[1][2] * tempZ;
			z = matTotal[2][0] * tempX + matTotal[2][1] * tempY + matTotal[2][2] * tempZ;



			// This one takes a fair bit of thinking to get. What's happening here is that
			// we're stretching from a vertex, but since we never scale the vertices,
			// the four new ones are the four closest to the vertex we scaled from.
			// Now (x, y, z) will get farther and farther away from the origin,
			// but that makes sense -- we're really just zooming in on the tetrahedron.
			x = scale * x - (scale - 1) * scaleCenter[0];
			y = scale * y - (scale - 1) * scaleCenter[1];
			z = scale * z - (scale - 1) * scaleCenter[2];



			// Apply the second rotation matrix.

			tempX = x;
			tempY = y;
			tempZ = z;

			matZ = [
				[Math.cos(this.rotationAngleZ2), -Math.sin(this.rotationAngleZ2), 0],
				[Math.sin(this.rotationAngleZ2), Math.cos(this.rotationAngleZ2), 0],
				[0, 0, 1]
			];

			matY = [
				[Math.cos(this.rotationAngleY2), 0, -Math.sin(this.rotationAngleY2)],
				[0, 1, 0],
				[Math.sin(this.rotationAngleY2), 0, Math.cos(this.rotationAngleY2)]
			];

			matX = [
				[1, 0, 0],
				[0, Math.cos(this.rotationAngleX2), -Math.sin(this.rotationAngleX2)],
				[0, Math.sin(this.rotationAngleX2), Math.cos(this.rotationAngleX2)]
			];

			matTotal = RaymarchApplet.matMul(RaymarchApplet.matMul(matZ, matY), matX);

			x = matTotal[0][0] * tempX + matTotal[0][1] * tempY + matTotal[0][2] * tempZ;
			y = matTotal[1][0] * tempX + matTotal[1][1] * tempY + matTotal[1][2] * tempZ;
			z = matTotal[2][0] * tempX + matTotal[2][1] * tempY + matTotal[2][2] * tempZ;
		}



		// So at this point we've scaled up by 2x a total of numIterations times.
		// The final distance is therefore:
		return Math.sqrt(x * x + y * y + z * z)
			* Math.pow(scale, -maxIterations);
	}

	distanceEstimator(x, y, z)
	{
		let distance = 0;

		const tetrahedronAmount = this.uniforms.tetrahedronAmount[1];
		const cubeAmount = this.uniforms.cubeAmount[1];
		const octahedronAmount = this.uniforms.octahedronAmount[1];

		if (tetrahedronAmount > 0)
		{
			distance += tetrahedronAmount
				* this.distanceEstimatorSingular(
					x,
					y,
					z,
					nTetrahedron,
					scaleCenterTetrahedron
				);
		}

		if (cubeAmount > 0)
		{
			distance += cubeAmount
				* this.distanceEstimatorSingular(
					x,
					y,
					z,
					nCube,
					scaleCenterCube
				);
		}

		if (octahedronAmount > 0)
		{
			distance += octahedronAmount
				* this.distanceEstimatorSingular(
					x,
					y,
					z,
					nOctahedron,
					scaleCenterOctahedron
				);
		}

		return distance;
	}


	updateMatrices()
	{
		let matZ = [
			[Math.cos(this.rotationAngleZ1), -Math.sin(this.rotationAngleZ1), 0],
			[Math.sin(this.rotationAngleZ1), Math.cos(this.rotationAngleZ1), 0],
			[0, 0, 1]
		];

		let matY = [
			[Math.cos(this.rotationAngleY1), 0, -Math.sin(this.rotationAngleY1)],
			[0, 1, 0],
			[Math.sin(this.rotationAngleY1), 0, Math.cos(this.rotationAngleY1)]
		];

		let matX = [
			[1, 0, 0],
			[0, Math.cos(this.rotationAngleX1), -Math.sin(this.rotationAngleX1)],
			[0, Math.sin(this.rotationAngleX1), Math.cos(this.rotationAngleX1)]
		];

		let matTotal = RaymarchApplet.matMul(RaymarchApplet.matMul(matZ, matY), matX);

		this.setUniform("rotationMatrix1", [
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



		matZ = [
			[Math.cos(this.rotationAngleZ2), -Math.sin(this.rotationAngleZ2), 0],
			[Math.sin(this.rotationAngleZ2), Math.cos(this.rotationAngleZ2), 0],
			[0, 0, 1]
		];

		matY = [
			[Math.cos(this.rotationAngleY2), 0, -Math.sin(this.rotationAngleY2)],
			[0, 1, 0],
			[Math.sin(this.rotationAngleY2), 0, Math.cos(this.rotationAngleY2)]
		];

		matX = [
			[1, 0, 0],
			[0, Math.cos(this.rotationAngleX2), -Math.sin(this.rotationAngleX2)],
			[0, Math.sin(this.rotationAngleX2), Math.cos(this.rotationAngleX2)]
		];

		matTotal = RaymarchApplet.matMul(RaymarchApplet.matMul(matZ, matY), matX);

		this.setUniform("rotationMatrix2", [
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



	// newAmounts is an array of the form [tetrahedronAmount, cubeAmount, octahedronAmount].
	async changePolyhedron(newAmounts, instant)
	{
		const oldAmounts = [
			this.uniforms.tetrahedronAmount[1],
			this.uniforms.cubeAmount[1],
			this.uniforms.octahedronAmount[1]
		];

		const dummy = { t: 0 };

		anime({
			targets: dummy,
			t: 1,
			duration: instant ? 0 : 1000,
			easing: "easeOutQuad",
			update: () =>
			{
				this.setUniform(
					"tetrahedronAmount",
					oldAmounts[0] * (1 - dummy.t) + newAmounts[0] * dummy.t
				);

				this.setUniform(
					"cubeAmount",
					oldAmounts[1] * (1 - dummy.t) + newAmounts[1] * dummy.t
				);

				this.setUniform(
					"octahedronAmount",
					oldAmounts[2] * (1 - dummy.t) + newAmounts[2] * dummy.t
				);

				this.needNewFrame = true;
			},
			complete: () =>
			{
				this.setUniform("tetrahedronAmount", newAmounts[0]);
				this.setUniform("cubeAmount", newAmounts[1]);
				this.setUniform("octahedronAmount", newAmounts[2]);

				this.needNewFrame = true;
			}
		});
	}
}