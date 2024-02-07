export class BaseGeometry
{
	geodesicGlsl = /* glsl */`
		vec4 pos = startPos + t * rayDirectionVec;
	`;

	dotProductGlsl = /* glsl */`
		return dot(v, w);
	`;

	normalizeGlsl = /* glsl */`
		return normalize(dir);
	`;

	fogGlsl = /* glsl */`
		return mix(color, fogColor, 1.0 - exp(-length(pos - cameraPos) * fogScaling));
	`;

	updateTGlsl = /* glsl */`
		lastTIncrease = distance * stepFactor;
		
		t += lastTIncrease;
	`;

	maxMarches = "200";
	maxT = "50.0";
	ambientOcclusionDenominator = "100.0";
	stepFactor = "0.99";
		
	dotProduct(vec1, vec2)
	{
		return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2] + vec1[3] * vec2[3];
	}

	normalize(vec)
	{
		const magnitude = Math.sqrt(this.dotProduct(vec, vec));

		return [vec[0] / magnitude, vec[1] / magnitude, vec[2] / magnitude, vec[3] / magnitude];
	}

	followGeodesic(pos, dir, t)
	{
		return [
			pos[0] + t * dir[0],
			pos[1] + t * dir[1],
			pos[2] + t * dir[2],
			pos[3] + t * dir[3]
		];
	}

	teleportCamera() {}

	getNormalVec()
	{
		// f = w - 1.
		return [0, 0, 0, 1];
	}

	correctPosition(pos)
	{
		return pos;
	}

	// Surprisingly necessary -- this corrects the frame so that no vector looks in the normal
	// direction at all.
	correctVectors()
	{
		const dotUp = this.dotProduct(
			this.normalVec,
			this.upVec
		);

		const dotRight = this.dotProduct(
			this.normalVec,
			this.rightVec
		);

		const dotForward = this.dotProduct(
			this.normalVec,
			this.forwardVec
		);

		for (let i = 0; i < 4; i++)
		{
			this.upVec[i] -= dotUp * this.normalVec[i];
			this.rightVec[i] -= dotRight * this.normalVec[i];
			this.forwardVec[i] -= dotForward * this.normalVec[i];
		}

		this.upVec = this.normalize(this.upVec);
		this.rightVec = this.normalize(this.rightVec);
		this.forwardVec = this.normalize(this.forwardVec);
	}

	distanceEstimatorGlsl;
	getColorGlsl;
	lightGlsl;
	functionGlsl;
	raymarchSetupGlsl;
	finalTeleportationGlsl;

	// A somewhat hacky workaround: SL(2, R) needs to keep track of more than a single vec4
	// of position data, so when this is set to true, every function that takes in position
	// now also takes a float called fiber.
	usesFiberComponent = false;

	cameraPos;
	normalVec;
	upVec;
	rightVec;
	forwardVec;

	// When true, refuses rolling and panning, and rotates the camera to always look at the origin.
	lockedOnOrigin = false;

	// When true, passes an upVec of 0, effectively making the render 1D.
	render1D = false;

	// Called every time a frame is drawn. To be set by the code
	// instantiating the class to know when to update things.
	drawFrameCallback() {}

	movingSpeed = 1;

	aspectRatio;
	fov;

	uniformGlsl;
	uniformNames;
	uniformData = {};
	updateUniforms() {}

	initUI() {}

	uiElementsUsed = "";

	sliderValues = {
		wallThickness: 0,
		fiberThickness: 0,
		gluingAngle: 0
	};
}


/*
	Produces strings like
 	min(
		min(
			min(distance1, distance2),
			min(distance3, distance4)
		),
		min(
			min(distance5, distance6),
			distance7
		)
	);
 */
export function getMinGlslString(varName, numVars, functionName = "min")
{
	const numLayers = Math.ceil(Math.log2(numVars));

	let strings = new Array(numVars);

	for (let i = 0; i < numVars; i++)
	{
		strings[i] = `${varName}${i + 1}`;
	}

	for (let i = 0; i < numLayers; i++)
	{
		const newStrings = new Array(Math.ceil(strings.length / 2));

		for (let j = 0; j < strings.length; j += 2)
		{
			newStrings[j / 2] = `${functionName}(${strings[j]}, ${strings[j + 1]})`;
		}

		if (strings.length % 2 === 1)
		{
			newStrings[newStrings.length - 1] = strings[strings.length - 1];
		}

		strings = newStrings;
	}

	return strings[0];
}

export function getMaxGlslString(varName, numVars)
{
	return getMinGlslString(varName, numVars, "max");
}

export function getColorGlslString(varName, minVarName, colors)
{
	let colorGlsl = "";

	for (let i = 0; i < colors.length; i++)
	{
		colorGlsl += `if (${minVarName} == ${varName}${i + 1}) { return vec3(${colors[i][0] / 255}, ${colors[i][1] / 255}, ${colors[i][2] / 255}); }
		`;
	}

	return colorGlsl;
}

export function getFloatGlsl(float)
{
	if (typeof float === "string" || float !== Math.floor(float))
	{
		return float;
	}

	return `float(${float})`;
}

export function getVectorGlsl(vector)
{
	if (vector.length === 2)
	{
		return `vec2(${vector[0]}, ${vector[1]})`;
	}

	if (vector.length === 3)
	{
		return `vec3(${vector[0]}, ${vector[1]}, ${vector[2]})`;
	}

	if (vector.length === 4)
	{
		return `vec4(${vector[0]}, ${vector[1]}, ${vector[2]}, ${vector[3]})`;
	}

	console.error("Invalid vector length!");
	return "";
}

export function getMatrixGlsl(matrix)
{
	if (matrix.length === 2)
	{
		return `mat2(
			${matrix[0][0]}, ${matrix[1][0]},
			${matrix[0][1]}, ${matrix[1][1]}
		)`;
	}

	if (matrix.length === 3)
	{
		return `mat3(
			${matrix[0][0]}, ${matrix[1][0]}, ${matrix[2][0]},
			${matrix[0][1]}, ${matrix[1][1]}, ${matrix[2][1]},
			${matrix[0][2]}, ${matrix[1][2]}, ${matrix[2][2]}
		)`;
	}

	if (matrix.length === 4)
	{
		return `mat4(
			${matrix[0][0]}, ${matrix[1][0]}, ${matrix[2][0]}, ${matrix[3][0]},
			${matrix[0][1]}, ${matrix[1][1]}, ${matrix[2][1]}, ${matrix[3][1]},
			${matrix[0][2]}, ${matrix[1][2]}, ${matrix[2][2]}, ${matrix[3][2]},
			${matrix[0][3]}, ${matrix[1][3]}, ${matrix[2][3]}, ${matrix[3][3]}
		)`;
	}

	console.error("Invalid matrix shape!");
	return "";
}