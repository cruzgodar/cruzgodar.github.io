
export class BaseGeometry
{
	geodesicGlsl = "vec4 pos = startPos + t * rayDirectionVec;";

	dotProductGlsl = "return dot(v, w);";

	normalizeGlsl = "return normalize(dir);";

	fogGlsl = "return mix(color, fogColor, 1.0 - exp(-length(pos - cameraPos) * fogScaling));";

	updateTGlsl = "t += distance * stepFactor;";
		
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
		const newPos = [...pos];

		for (let i = 0; i < 4; i++)
		{
			newPos[i] = newPos[i] + t * dir[i];
		}
		
		return newPos;
	}

	teleportCamera() {}

	// Given two points on the manifold, find the vector in the tangent space to pos1
	// that points to pos2. In general, this takes a third argument that is the distance
	// between pos1 and pos2
	getGeodesicDirection(pos1, pos2)
	{
		// For now, just take the vector joining the two in R^4,
		// project it into the tangent space, and normalize it.
		const dir = [pos2[0] - pos1[0], pos2[1] - pos1[1], pos2[2] - pos1[2], pos2[3] - pos1[3]];

		return this.normalize(dir);
	}

	//Gets the distance from pos1 to pos2 along the geodesic in the direction of dir.
	getGeodesicDistance(pos1, pos2)
	{
		const difference = [
			pos2[0] - pos1[0],
			pos2[1] - pos1[1],
			pos2[2] - pos1[2],
			pos2[3] - pos1[3]
		];

		return Math.sqrt(this.dotProduct(difference, difference));
	}

	getNormalVec()
	{
		//f = w - 1.
		return [0, 0, 0, 1];
	}

	getGammaPrime(_pos, dir)
	{
		//gamma = pos + t*dir
		//gamma' = dir
		//gamma'' = 0
		//All of these are evaluated at t=0.
		return [...dir];
	}

	getGammaDoublePrime()
	{
		return [0, 0, 0, 0];
	}

	getGammaTriplePrime()
	{
		return [0, 0, 0, 0];
	}

	gammaTriplePrimeIsLinearlyIndependent = false;

	//Surprisingly necessary -- this corrects the frame so that no vector looks in the normal
	//direction at all.
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

	getMovingSpeed()
	{
		return 3;
	}

	distanceEstimatorGlsl;
	getColorGlsl;
	lightGlsl;
	functionGlsl;
	raymarchSetupGlsl;

	cameraPos;
	normalVec;
	upVec;
	rightVec;
	forwardVec;
	currentMovementVec;

	uniformGlsl;
	uniformNames;
	uniformData = {};
	updateUniforms() {}

	initUI() {}

	uiElementsUsed = "";
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