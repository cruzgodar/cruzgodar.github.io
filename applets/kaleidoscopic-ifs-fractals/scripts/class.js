import { getVectorGlsl } from "/scripts/applets/applet.js";
import { RaymarchApplet } from "/scripts/applets/raymarchApplet.js";
import { changeOpacity } from "/scripts/src/animation.js";

const ns = {
	tetrahedron: [
		[-.577350, 0, .816496],
		[.288675, -.5, .816496],
		[.288675, .5, .816496]
	],
	cube: [
		[1, 0, 0],
		[0, 1, 0],
		[0, 0, 1]
	],
	octahedron: [
		[.707107, 0, .707107],
		[0, .707107, .707107],
		[-.707107, 0, .707107],
		[0, -.707107, .707107]
	]
};

const scaleCenters = {
	tetrahedron: [0, 0, 1],
	cube: [.577350, .577350, .577350],
	octahedron: [0, 0, 1]
};

const maxIterations = 48;

function getDistanceEstimatorGlsl(shape, useForGetColor = false)
{
	// Make the first letter uppercase.
	const variableName = shape[0].toUpperCase() + shape.slice(1);

	return /* glsl */`
		${useForGetColor ? "vec3 color = vec3(1.0, 1.0, 1.0); float colorScale = .5;" : ""}
		//We'll find the closest vertex, scale everything by a factor of 2 centered on that vertex (so that we don't need to recalculate the vertices), and repeat.
		for (int iteration = 0; iteration < maxIterations; iteration++)
		{
			//Fold space over on itself so that we can reference only the top vertex.
			float t1 = dot(pos, n1${variableName});
			
			if (t1 < 0.0)
			{
				pos -= 2.0 * t1 * n1${variableName};
				${useForGetColor ? "color = mix(color, color1, colorScale);" : ""}
			}
			
			float t2 = dot(pos, n2${variableName});
			
			if (t2 < 0.0)
			{
				pos -= 2.0 * t2 * n2${variableName};
				${useForGetColor ? "color = mix(color, color2, colorScale);" : ""}
			}
			
			float t3 = dot(pos, n3${variableName});
			
			if (t3 < 0.0)
			{
				pos -= 2.0 * t3 * n3${variableName};
				${useForGetColor ? "color = mix(color, color3, colorScale);" : ""}
			}

			${variableName === "Octahedron" ? /* glsl */`
				float t4 = dot(pos, n4${variableName});
				
				if (t4 < 0.0)
				{
					pos -= 2.0 * t4 * n4${variableName};
					${useForGetColor ? "color = mix(color, color4, colorScale);" : ""}
				}
			` : ""}
			
			pos = rotationMatrix1 * pos;
			
			//Scale the system -- this one takes me a fair bit of thinking to get. What's happening here is that we're stretching from a vertex, but since we never scale the vertices, the four new ones are the four closest to the vertex we scaled from. Now (x, y, z) will get farther and farther away from the origin, but that makes sense -- we're really just zooming in on the tetrahedron.
			pos = scale * pos - (scale - 1.0) * scaleCenter${variableName};
			
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

	shape = "octahedron";

	constructor({
		canvas,
		shape = "octahedron",
	}) {
		const addGlsl = /* glsl */`
			const int maxIterations = ${maxIterations};
			
			const vec3 color1 = vec3(1.0, 0.0, 0.0);
			const vec3 color2 = vec3(0.0, 1.0, 0.0);
			const vec3 color3 = vec3(0.0, 0.0, 1.0);
			const vec3 color4 = vec3(1.0, 1.0, 0.0);
			
			const vec3 n1Tetrahedron = ${getVectorGlsl(ns.tetrahedron[0])};
			const vec3 n2Tetrahedron = ${getVectorGlsl(ns.tetrahedron[1])};
			const vec3 n3Tetrahedron = ${getVectorGlsl(ns.tetrahedron[2])};
			const vec3 scaleCenterTetrahedron = ${getVectorGlsl(scaleCenters.tetrahedron)};

			const vec3 n1Cube = ${getVectorGlsl(ns.cube[0])};
			const vec3 n2Cube = ${getVectorGlsl(ns.cube[1])};
			const vec3 n3Cube = ${getVectorGlsl(ns.cube[2])};
			const vec3 scaleCenterCube = ${getVectorGlsl(scaleCenters.cube)};

			const vec3 n1Octahedron = ${getVectorGlsl(ns.octahedron[0])};
			const vec3 n2Octahedron = ${getVectorGlsl(ns.octahedron[1])};
			const vec3 n3Octahedron = ${getVectorGlsl(ns.octahedron[2])};
			const vec3 n4Octahedron = ${getVectorGlsl(ns.octahedron[3])};
			const vec3 scaleCenterOctahedron = ${getVectorGlsl(scaleCenters.octahedron)};
		`;

		const distanceEstimatorGlsl = getDistanceEstimatorGlsl(shape);

		const getColorGlsl = getDistanceEstimatorGlsl(shape, true);

		const uniforms = {
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
			lightBrightness: 1.25,
			epsilonScaling: .75,
		});

		this.shape = shape;
	}



	distanceEstimator(x, y, z)
	{
		const scale = this.uniforms.scale[1];
		const shapeNs = ns[this.shape ?? "octahedron"];
		const scaleCenter = scaleCenters[this.shape ?? "octahedron"];

		// We'll find the closest vertex, scale everything by a factor of 2
		// centered on that vertex (so that we don't need to recalculate the vertices), and repeat.
		for (let iteration = 0; iteration < maxIterations; iteration++)
		{
			// Fold space over on itself so that we can reference only the top vertex.
			const t1 = RaymarchApplet.dotProduct([x, y, z], shapeNs[0]);

			if (t1 < 0)
			{
				x -= 2 * t1 * shapeNs[0][0];
				y -= 2 * t1 * shapeNs[0][1];
				z -= 2 * t1 * shapeNs[0][2];
			}

			const t2 = RaymarchApplet.dotProduct([x, y, z], shapeNs[1]);

			if (t2 < 0)
			{
				x -= 2 * t2 * shapeNs[1][0];
				y -= 2 * t2 * shapeNs[1][1];
				z -= 2 * t2 * shapeNs[1][2];
			}

			const t3 = RaymarchApplet.dotProduct([x, y, z], shapeNs[2]);

			if (t3 < 0)
			{
				x -= 2 * t3 * shapeNs[2][0];
				y -= 2 * t3 * shapeNs[2][1];
				z -= 2 * t3 * shapeNs[2][2];
			}

			if (ns.length >= 4)
			{
				const t4 = RaymarchApplet.dotProduct([x, y, z], shapeNs[3]);

				if (t4 < 0)
				{
					x -= 2 * t4 * shapeNs[3][0];
					y -= 2 * t4 * shapeNs[3][1];
					z -= 2 * t4 * shapeNs[3][2];
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
	async changePolyhedron(newShape)
	{
		await changeOpacity({
			element: this.canvas,
			opacity: 0,
			duration: 250,
		});

		this.shape = newShape;
		const distanceEstimatorGlsl = getDistanceEstimatorGlsl(this.shape);
		const getColorGlsl = getDistanceEstimatorGlsl(this.shape, true);

		this.reloadShader({
			distanceEstimatorGlsl,
			getColorGlsl,
		});

		await changeOpacity({
			element: this.canvas,
			opacity: 1,
			duration: 250,
		});
	}
}