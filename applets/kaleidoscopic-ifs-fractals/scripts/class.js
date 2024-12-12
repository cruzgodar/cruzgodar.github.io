import { getVectorGlsl } from "/scripts/applets/applet.js";
import {
	dotProduct,
	getRotationMatrix,
	mat3TimesVector,
	RaymarchApplet
} from "/scripts/applets/raymarchApplet.js";
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
	],
	dodecahedron: [
		[0.809016, -0.5, 0.309017],
		[0.309017, 0.809016, -0.5],
		[-0.5, 0.309017, 0.809016],
		[0.809016, -0.5, 0.309017],
		[0.309017, 0.809016, -0.5],
		[-0.5, 0.309017, 0.809016],
		[0.809016, -0.5, 0.309017],
	]
};

const scaleCenters = {
	tetrahedron: [0, 0, 1],
	cube: [.577350, .577350, .577350],
	octahedron: [0, 0, 1],
	dodecahedron: [.577350, .577350, .577350]
};

const maxIterations = 56;

function getDistanceEstimatorGlsl(shape, useForGetColor = false)
{
	// Make the first letter uppercase.
	const variableName = shape[0].toUpperCase() + shape.slice(1);

	const numNs = ns[shape].length;

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

			${numNs >= 4 ? /* glsl */`
				float t4 = dot(pos, n4${variableName});
				
				if (t4 < 0.0)
				{
					pos -= 2.0 * t4 * n4${variableName};
					${useForGetColor ? "color = mix(color, color4, colorScale);" : ""}
				}
			` : ""}

			${numNs >= 5 ? /* glsl */`
				float t5 = dot(pos, n5${variableName});
				
				if (t5 < 0.0)
				{
					pos -= 2.0 * t5 * n5${variableName};
					${useForGetColor ? "color = mix(color, color5, colorScale);" : ""}
				}
			` : ""}

			${numNs >= 6 ? /* glsl */`
				float t6 = dot(pos, n6${variableName});
				
				if (t6 < 0.0)
				{
					pos -= 2.0 * t6 * n6${variableName};
					${useForGetColor ? "color = mix(color, color6, colorScale);" : ""}
				}
			` : ""}

			${numNs >= 7 ? /* glsl */`
				float t7 = dot(pos, n7${variableName});
				
				if (t7 < 0.0)
				{
					pos -= 2.0 * t7 * n7${variableName};
					${useForGetColor ? "color = mix(color, color7, colorScale);" : ""}
				}
			` : ""}
			
			//Scale the system -- this one takes me a fair bit of thinking to get. What's happening here is that we're stretching from a vertex, but since we never scale the vertices, the four new ones are the four closest to the vertex we scaled from. Now (x, y, z) will get farther and farther away from the origin, but that makes sense -- we're really just zooming in on the tetrahedron.
			pos = scale * pos - (scale - 1.0) * scaleCenter${variableName};
			
			pos = rotationMatrix * pos;

			${useForGetColor ? "colorScale *= .5;" : ""}
		}
		
		return ${useForGetColor ? "color" : "length(pos) * pow(1.0 / scale, float(maxIterations))"};
	`;
}

export class KaleidoscopicIFSFractal extends RaymarchApplet
{
	rotationAngleX = 0;
	rotationAngleY = 0;
	rotationAngleZ = 0;

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
			const vec3 color5 = vec3(0.5, 0.0, 1.0);
			const vec3 color6 = vec3(1.0, 0.5, 0.0);
			const vec3 color7 = vec3(0.0, 1.0, 1.0);
			
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

			const vec3 n1Dodecahedron = ${getVectorGlsl(ns.dodecahedron[0])};
			const vec3 n2Dodecahedron = ${getVectorGlsl(ns.dodecahedron[1])};
			const vec3 n3Dodecahedron = ${getVectorGlsl(ns.dodecahedron[2])};
			const vec3 n4Dodecahedron = ${getVectorGlsl(ns.dodecahedron[3])};
			const vec3 n5Dodecahedron = ${getVectorGlsl(ns.dodecahedron[4])};
			const vec3 n6Dodecahedron = ${getVectorGlsl(ns.dodecahedron[5])};
			const vec3 n7Dodecahedron = ${getVectorGlsl(ns.dodecahedron[6])};
			
			const vec3 scaleCenterDodecahedron = ${getVectorGlsl(scaleCenters.dodecahedron)};
		`;

		const distanceEstimatorGlsl = getDistanceEstimatorGlsl(shape);

		const getColorGlsl = getDistanceEstimatorGlsl(shape, true);

		const uniforms = {
			scale: ["float", 2],
			rotationMatrix: ["mat3", [[1, 0, 0], [0, 1, 0], [0, 0, 1]]],
		};

		super({
			canvas,
			distanceEstimatorGlsl,
			getColorGlsl,
			addGlsl,
			uniforms,
			theta: 0.2004,
			phi: 1.6538,
			cameraPos: [-2.03816, -0.526988, 0.30503],
			lightPos: [-50, -70, 100],
			lightBrightness: 1.25,
			epsilonScaling: .75,
			stepFactor: .6,
		});

		this.shape = shape;
	}



	distanceEstimator(x, y, z)
	{
		const scale = this.uniforms.scale[1];
		const shapeNs = ns[this.shape ?? "octahedron"];
		const scaleCenter = scaleCenters[this.shape ?? "octahedron"];
		const rotationMatrix = this.uniforms.rotationMatrix[1];

		// We'll find the closest vertex, scale everything by a factor of 2
		// centered on that vertex (so that we don't need to recalculate the vertices), and repeat.
		for (let iteration = 0; iteration < maxIterations; iteration++)
		{
			for (let i = 0; i < shapeNs.length; i++)
			{
				// Fold space over on itself so that we can reference only the top vertex.

				const t = dotProduct([x, y, z], shapeNs[i]);

				if (t < 0)
				{
					x -= 2 * t * shapeNs[i][0];
					y -= 2 * t * shapeNs[i][1];
					z -= 2 * t * shapeNs[i][2];
				}
			}

			// This one takes a fair bit of thinking to get. What's happening here is that
			// we're stretching from a vertex, but since we never scale the vertices,
			// the four new ones are the four closest to the vertex we scaled from.
			// Now (x, y, z) will get farther and farther away from the origin,
			// but that makes sense -- we're really just zooming in on the tetrahedron.
			x = scale * x - (scale - 1) * scaleCenter[0];
			y = scale * y - (scale - 1) * scaleCenter[1];
			z = scale * z - (scale - 1) * scaleCenter[2];

			[x, y, z] = mat3TimesVector(rotationMatrix, [x, y, z]);
		}

		// So at this point we've scaled up by 2x a total of numIterations times.
		// The final distance is therefore:
		return Math.sqrt(x * x + y * y + z * z)
			* Math.pow(scale, -maxIterations);
	}

	updateMatrices()
	{
		this.setUniform("rotationMatrix", getRotationMatrix(
			this.rotationAngleX,
			this.rotationAngleY,
			this.rotationAngleZ
		));

		this.needNewFrame = true;
	}

	// newAmounts is an array of the form [tetrahedronAmount, cubeAmount, octahedronAmount].
	async changePolyhedron(newShape)
	{
		await changeOpacity({
			element: this.canvas,
			opacity: 0,
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
		});
	}
}