import { ThurstonGeometry } from "../class.mjs";

export class BaseGeometry
{
	geodesicGlsl = "vec4 pos = startPos + t * rayDirectionVec;";

	fogGlsl = "return mix(color, fogColor, 1.0 - exp(-length(pos - cameraPos) * fogScaling));";

	updateTGlsl = "t += distance * stepFactor;";
		
	dotProduct(vec1, vec2)
	{
		return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2] + vec1[3] * vec2[3];
	}

	updateCameraPos(cameraPos, tangentVec, dt)
	{
		const newCameraPos = [...cameraPos];

		for (let i = 0; i < 4; i++)
		{
			newCameraPos[i] = newCameraPos[i] + dt * tangentVec[i];
		}
		
		return newCameraPos;
	}

	teleportCamera() {}

	getGeodesicDirection(pos1, pos2)
	{
		const dir = new Array(4);

		for (let i = 0; i < 4; i++)
		{
			dir[i] = pos2[i] - pos1[i];
		}

		const magnitude = ThurstonGeometry.magnitude(dir);

		return [ThurstonGeometry.normalize(dir), magnitude];
	}

	normalizeToMagnitude(vec, targetMag)
	{
		const mag = this.dotProduct(vec, vec);
		const scaleFactor = Math.sqrt(targetMag / mag);

		return [vec[0] * mag, vec[1] * mag, vec[2] * mag, vec[3] * mag];
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

	uniformGlsl;
	uniformNames;
	uniformData = {};
	updateUniforms() {}

	initUI() {}
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