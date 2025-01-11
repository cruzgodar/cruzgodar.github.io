import { getVectorGlsl } from "/scripts/applets/applet.js";
import {
	dotProduct,
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
	],
	icosahedron: [
		[0, 1, 0],
		[-0.5, -0.309017, 0.809016],
		[0.5, -0.309017, 0.809016],
		[-0.809016, 0.5, 0.309017],
		[0.809016, 0.5, 0.309017],
		[0, 1, 0],
	]
};

const scaleCenters = {
	tetrahedron: [0, 0, 1],
	cube: [.577350, .577350, .577350],
	octahedron: [0, 0, 1],
	dodecahedron: [.577350, .577350, .577350],
	icosahedron: [0, 0.525731, 0.850651]
};

function getDistanceEstimatorGlsl(shape, useForGetColor = false)
{
	// Make the first letter uppercase.
	const variableName = shape.charAt(0).toUpperCase() + shape.slice(1);

	const numNs = ns[shape].length;

	const loopInternals = Array(numNs).fill(0).map((_, i) =>
	{
		if (useForGetColor)
		{
			// Reflect along perpendicular bisector planes to the edges connected to
			// the scale center vertex so that we can compute only the distance
			// to that single vertex.

			return /* glsl */`
				float t${i} = dot(pos, n${i}${variableName});
				
				if (t${i} < 0.0)
				{
					pos -= 2.0 * t${i} * n${i}${variableName};
					color = mix(color, color${i}, colorScale);
				}
			`;
		}

		return /* glsl */`
			float t${i} = dot(pos, n${i}${variableName});
			
			if (t${i} < 0.0)
			{
				pos -= 2.0 * t${i} * n${i}${variableName};
			}
		`;
	}).join("\n");

	return /* glsl */`
		${useForGetColor ? "vec3 color = vec3(1.0, 1.0, 1.0); float colorScale = .5;" : ""}
		//We'll find the closest vertex, scale everything by a factor of 2 centered on that vertex (so that we don't need to recalculate the vertices), and repeat.
		for (int iteration = 0; iteration < 72; iteration++)
		{
			if (iteration >= numIterations)
			{
				break;
			}

			${loopInternals}
			
			//Scale the system -- this one takes me a fair bit of thinking to get. What's happening here is that we're stretching from a vertex, but since we never scale the vertices, the four new ones are the four closest to the vertex we scaled from. Now (x, y, z) will get farther and farther away from the origin, but that makes sense -- we're really just zooming in on the tetrahedron.
			pos = scale * pos - (scale - 1.0) * scaleCenter${variableName};
			
			pos = rotationMatrix * pos;

			${useForGetColor ? "colorScale *= .5;" : ""}
		}
		
		return ${useForGetColor ? "color" : "length(pos) * pow(1.0 / scale, float(numIterations))"};
	`;
}

export class KaleidoscopicIFSFractals extends RaymarchApplet
{
	shape = "octahedron";

	constructor({
		canvas,
		shape = "octahedron",
	}) {
		const constantsGlsl = [];

		for (const key in ns)
		{
			const uppercaseKey = key.charAt(0).toUpperCase() + key.slice(1);

			const glsl = Array(ns[key].length).fill(0).map((_, i) =>
			{
				return /* glsl */`
					const vec3 n${i}${uppercaseKey} = ${getVectorGlsl(ns[key][i])};
				`;
			}).join("\n")
			+ /* glsl */`
				const vec3 scaleCenter${uppercaseKey} = ${getVectorGlsl(scaleCenters[key])};
			`;

			constantsGlsl.push(glsl);
		}

		const addGlsl = /* glsl */`
			const vec3 color0 = vec3(1.0, 0.0, 0.0);
			const vec3 color1 = vec3(0.0, 1.0, 0.0);
			const vec3 color2 = vec3(0.0, 0.0, 1.0);
			const vec3 color3 = vec3(1.0, 1.0, 0.0);
			const vec3 color4 = color0;
			const vec3 color5 = color1;
			const vec3 color6 = color2;
			const vec3 color7 = color3;
			const vec3 color8 = color0;
			const vec3 color9 = color1;
			
			${constantsGlsl.join("\n")}
		`;

		const distanceEstimatorGlsl = getDistanceEstimatorGlsl(shape);

		const getColorGlsl = getDistanceEstimatorGlsl(shape, true);

		const uniformsGlsl = /* glsl */`
			uniform float scale;
			uniform mat3 rotationMatrix;
			uniform int numIterations;
		`;

		const uniforms = {
			scale: 2,
			rotationMatrix: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
			numIterations: 56
		};

		super({
			canvas,
			distanceEstimatorGlsl,
			getColorGlsl,
			uniformsGlsl,
			addGlsl,
			uniforms,
			theta: 0.2004,
			phi: 1.6538,
			cameraPos: [-2.03816, -0.526988, 0.30503],
			lightPos: [-50, -70, 100],
			lightBrightness: 1.25,
			epsilonScaling: 1,
			stepFactor: .6,
		});

		this.shape = shape;
	}



	distanceEstimator(x, y, z)
	{
		const shapeNs = ns[this.shape ?? "octahedron"];
		const scaleCenter = scaleCenters[this.shape ?? "octahedron"];

		// We'll find the closest vertex, scale everything by a factor of 2
		// centered on that vertex (so that we don't need to recalculate the vertices), and repeat.
		for (let iteration = 0; iteration < this.uniforms.numIterations; iteration++)
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
			x = this.uniforms.scale * x - (this.uniforms.scale - 1) * scaleCenter[0];
			y = this.uniforms.scale * y - (this.uniforms.scale - 1) * scaleCenter[1];
			z = this.uniforms.scale * z - (this.uniforms.scale - 1) * scaleCenter[2];

			[x, y, z] = mat3TimesVector(this.uniforms.rotationMatrix, [x, y, z]);
		}

		// So at this point we've scaled up by 2x a total of numIterations times.
		// The final distance is therefore:
		return Math.sqrt(x * x + y * y + z * z)
			* Math.pow(this.uniforms.scale, -this.uniforms.numIterations);
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