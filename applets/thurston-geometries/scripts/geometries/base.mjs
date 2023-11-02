import { ThurstonGeometry } from "../class.mjs";

export class BaseGeometry
{
	geodesicGlsl = "vec4 pos = cameraPos + t * rayDirectionVec;";

	fogGlsl = "return mix(color, fogColor, 1.0 - exp(-length(pos - cameraPos) * fogScaling));";
		
	customDotProduct(vec1, vec2)
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
}