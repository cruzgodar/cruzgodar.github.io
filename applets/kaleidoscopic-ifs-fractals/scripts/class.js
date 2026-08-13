import { getFloatGlsl, getVectorGlsl } from "/scripts/applets/applet.js";
import {
	dotProduct,
	getRotationMatrix,
	mat3TimesVector,
	RaymarchApplet
} from "/scripts/applets/raymarchApplet.js";
import { changeOpacity } from "/scripts/src/animation.js";
import { clamp } from "/scripts/src/utils.js";

const minScale = 1.125;
const minScaleEpsilon = .00003;
const maxScaleEpsilon = .0000003;

// The fraction of the estimate we're willing to give up in exchange for stopping the orbit
// early. See getDistanceEstimatorGlsl -- this is a *relative* tolerance, so it's independent
// of epsilon, and it has to stay well under it, since the surface normal finite-differences
// the estimator at a spacing of epsilon and divides by epsilon squared.
const bailoutTolerance = .001;

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

	const scaleCenterNorm = Math.hypot(...scaleCenters[shape]);

	// Every iteration folds (reflections through planes at the origin), scales by `scale`,
	// translates by -(scale - 1) * scaleCenter, and rotates. Folds and rotations preserve
	// length, so the translation is the only thing that pulls |pos| away from pure scaling:
	//
	//     scale * |pos| - (scale - 1) * |scaleCenter|
	//         <= |newPos| <= scale * |pos| + (scale - 1) * |scaleCenter|
	//
	// The estimate at iteration k is |pos| / scale^k, so one iteration can only move it by
	// (scale - 1) * |scaleCenter| / scale^(k + 1), and *all* the remaining ones together by
	//
	//     sum over j > k of (scale - 1) * |scaleCenter| / scale^j  =  |scaleCenter| / scale^k
	//
	// which is |scaleCenter| / |pos| as a fraction of the estimate itself. So once the orbit
	// escapes past |scaleCenter| / bailoutTolerance, the entire rest of the orbit can't change
	// the estimate by more than bailoutTolerance of its value, and we can quit right there.
	// Points on the fractal have bounded orbits and never trigger this, which is exactly the
	// behavior we want: full iteration count on the surface, an early out everywhere else.
	const bailoutGlsl = useForGetColor ? "" : /* glsl */`
		if (dot(pos, pos) > ${getFloatGlsl((scaleCenterNorm / bailoutTolerance) ** 2)})
		{
			// Subtracting the bound makes this a guaranteed *under*estimate. Sphere tracing
			// tolerates undershooting -- it just costs an extra step -- but overshooting
			// marches through the surface, which is what a raw early return would risk.
			return (length(pos) - ${getFloatGlsl(scaleCenterNorm)})
				* pow(1.0 / scale, float(iteration + 1));
		}
	`;

	const loopInternals = Array(numNs).fill(0).map((_, i) =>
	{
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
		for (int iteration = 0; iteration < ${useForGetColor ? 8 : 72}; iteration++)
		{
			int maxIterations = 72;
			if (iteration >= numIterations)
			{
				break;
			}

			${loopInternals}
			
			//Scale the system -- this one takes me a fair bit of thinking to get. What's happening here is that we're stretching from a vertex, but since we never scale the vertices, the four new ones are the four closest to the vertex we scaled from. Now (x, y, z) will get farther and farther away from the origin, but that makes sense -- we're really just zooming in on the tetrahedron.
			pos = scale * pos - (scale - 1.0) * scaleCenter${variableName};
			
			pos = rotationMatrix * pos;

			${useForGetColor ? "float r = length(pos); color = mix(color, abs(pos.yxz / r), colorScale); colorScale *= .2;" : ""}

			${bailoutGlsl}
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
		epsilonScalingFactor = 0.6,
		minEpsilon,
		theta = 0.2004,
		phi = 1.6538,
		resolution = 1000,
		xrFramebufferScaleSlider,
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

		const addGlsl = constantsGlsl.join("\n");

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
			numIterations: 12
		};

		super({
			canvas,
			resolution,
			distanceEstimatorGlsl,
			getColorGlsl,
			uniformsGlsl,
			addGlsl,
			uniforms,
			theta,
			phi,
			sceneOrigin: [-2.702, -0.731, 0.347],
			lightPos: [-50, -70, 100],
			lightBrightness: 1.4,
			epsilonScalingFactor,
			minEpsilon,
			overstepFactor: 1.1,
			xrFramebufferScaleSlider
		});

		this.shape = shape;
	}



	changeScale(scale)
	{
		// Exponentially interpolate from minScaleEpsilon to maxScaleEpsilon.
		const power = (scale - minScale) / (2 - minScale)
			* Math.log10(minScaleEpsilon / maxScaleEpsilon);

		// Interpolate from 44 at 8/3 to 56 at 2.
		const numIterations = Math.floor(
			44 - (56 - 44) * (scale - 8 / 3) / (8 / 3 - 2)
		);

		this.setUniforms({
			scale,
			minEpsilon: minScaleEpsilon / Math.pow(10, power),
			numIterations,
		});
	}

	changeRotationAngles(x, y, z)
	{
		this.setUniforms({
			rotationMatrix: getRotationMatrix(x, y, z)
		});
	}



	drawFrame()
	{
		super.drawFrame();

		const distance = this.distanceEstimator(
			this.sceneOrigin[0],
			this.sceneOrigin[1],
			this.sceneOrigin[2]
		);

		// Interpolates from 0 at scale 2 to 3 at scale 1.125.
		const scaleFactor = (1 / (this.uniforms.scale - 1) - 1) * 2 / 7;

		const numIterations = clamp(
			Math.floor(
				14 - Math.log(distance) * 2
			),
			14,
			24
		)
			+ Math.round(scaleFactor * 28);

		if (this.uniforms.numIterations === numIterations)
		{
			return;
		}

		this.setUniforms({ numIterations });
	}



	distanceEstimator(x, y, z)
	{
		const shapeNs = ns[this.shape ?? "octahedron"];
		const scaleCenter = scaleCenters[this.shape ?? "octahedron"];
		const scaleCenterNorm = Math.hypot(...scaleCenter);

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

			// Same escape bailout as the shader -- see getDistanceEstimatorGlsl.
			const r = Math.sqrt(x * x + y * y + z * z);

			if (r > scaleCenterNorm / bailoutTolerance)
			{
				return (r - scaleCenterNorm)
					* Math.pow(this.uniforms.scale, -(iteration + 1));
			}
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