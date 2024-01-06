import { sliderValues } from "../index.mjs";
import { BaseGeometry, getMaxGlslString } from "./base.mjs";
import { $ } from "/scripts/src/main.mjs";

class H2xEGeometry extends BaseGeometry
{
	geodesicGlsl = `float h2Mag = sqrt(abs(
		rayDirectionVec.x * rayDirectionVec.x
		+ rayDirectionVec.y * rayDirectionVec.y
		- rayDirectionVec.z * rayDirectionVec.z
	));
	
	vec4 pos = vec4(
		cosh(h2Mag * t) * startPos.xyz + sinh(h2Mag * t) * rayDirectionVec.xyz / h2Mag,
		startPos.w + t * rayDirectionVec.w
	);`;

	dotProductGlsl = "return v.x * w.x + v.y * w.y - v.z * w.z + v.w * w.w;";

	normalizeGlsl = `float magnitude = sqrt(abs(geometryDot(dir, dir)));
	
	return dir / magnitude;`;

	fogGlsl = "return color;//mix(color, fogColor, 1.0 - exp(-totalT * fogScaling * 8.0));";

	functionGlsl = `float sinh(float x)
		{
			return .5 * (exp(x) - exp(-x));
		}

		float cosh(float x)
		{
			return .5 * (exp(x) + exp(-x));
		}

		float asinh(float x)
		{
			return log(x + sqrt(x*x + 1.0));
		}

		float acosh(float x)
		{
			return log(x + sqrt(x*x - 1.0));
		}

		// vec3 teleportPos(inout vec4 pos, inout vec4 startPos, inout vec4 rayDirectionVec, inout float t, inout float totalT)
		// {
		// 	float c = cos(gluingAngle);
		// 	float s = sin(gluingAngle);

		// 	vec4 teleportVec1 = vec4(1.0, 0.0, 0.0, 0.577350269);
		// 	mat4 teleportMat1 = mat4(
		// 		2.0, 0.0, 0.0, 1.73205081,
		// 		0.0, c, s, 0.0,
		// 		0.0, -s, c, 0.0,
		// 		1.73205081, 0.0, 0.0, 2.0
		// 	);

		// 	vec4 teleportVec2 = vec4(-1.0, 0.0, 0.0, 0.577350269);
		// 	mat4 teleportMat2 = mat4(
		// 		2.0, 0.0, 0.0, -1.73205081,
		// 		0.0, c, -s, 0.0,
		// 		0.0, s, c, 0.0,
		// 		-1.73205081, 0.0, 0.0, 2.0
		// 	);

		// 	vec4 teleportVec3 = vec4(0.0, 1.0, 0.0, 0.577350269);
		// 	mat4 teleportMat3 = mat4(
		// 		c, 0.0, s, 0.0,
		// 		0.0, 2.0, 0.0, 1.73205081,
		// 		-s, 0.0, c, 0.0,
		// 		0.0, 1.73205081, 0.0, 2.0
		// 	);

		// 	vec4 teleportVec4 = vec4(0.0, -1.0, 0.0, 0.577350269);
		// 	mat4 teleportMat4 = mat4(
		// 		c, 0.0, -s, 0.0,
		// 		0.0, 2.0, 0.0, -1.73205081,
		// 		s, 0.0, c, 0.0,
		// 		0.0, -1.73205081, 0.0, 2.0
		// 	);



		// 	if (dot(pos, teleportVec1) < 0.0)
		// 	{
		// 		pos = teleportMat1 * pos;

		// 		// !!!IMPORTANT!!! rayDirectionVec is the tangent vector from the *starting*
		// 		// position, not the current one, so we need to calculate that current
		// 		// position to teleport the vector correctly. The correct tangent vector
		// 		// is just the derivative of the geodesic at the current value of t.

		// 		rayDirectionVec = teleportMat1 * (sinh(t) * startPos + cosh(t) * rayDirectionVec);

		// 		startPos = pos;
				
		// 		totalT += t;
		// 		t = 0.0;

		// 		return vec3(1.0, 0.0, 0.0);
		// 	}

		// 	if (dot(pos, teleportVec2) < 0.0)
		// 	{
		// 		pos = teleportMat2 * pos;

		// 		rayDirectionVec = teleportMat2 * (sinh(t) * startPos + cosh(t) * rayDirectionVec);

		// 		startPos = pos;
				
		// 		totalT += t;
		// 		t = 0.0;

		// 		return vec3(-1.0, 0.0, 0.0);
		// 	}

		// 	if (dot(pos, teleportVec3) < 0.0)
		// 	{
		// 		pos = teleportMat3 * pos;

		// 		rayDirectionVec = teleportMat3 * (sinh(t) * startPos + cosh(t) * rayDirectionVec);

		// 		startPos = pos;
				
		// 		totalT += t;
		// 		t = 0.0;

		// 		return vec3(0.0, 1.0, 0.0);
		// 	}

		// 	if (dot(pos, teleportVec4) < 0.0)
		// 	{
		// 		pos = teleportMat4 * pos;

		// 		rayDirectionVec = teleportMat4 * (sinh(t) * startPos + cosh(t) * rayDirectionVec);

		// 		startPos = pos;
				
		// 		totalT += t;
		// 		t = 0.0;

		// 		return vec3(0.0, -1.0, 0.0);
		// 	}

		// 	return vec3(0.0, 0.0, 0.0);
		// }
	`;
	
	followGeodesic(pos, dir, t)
	{
		const h2Mag = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1] + dir[2] * dir[2]);
		
		const newPos = h2Mag === 0
			? [pos[0], pos[1], pos[2], pos[3] + t * dir[3]]
			: [
				Math.cosh(h2Mag * t) * pos[0] + Math.sinh(h2Mag * t) * dir[0] / h2Mag,
				Math.cosh(h2Mag * t) * pos[1] + Math.sinh(h2Mag * t) * dir[1] / h2Mag,
				Math.cosh(h2Mag * t) * pos[2] + Math.sinh(h2Mag * t) * dir[2] / h2Mag,
				pos[3] + t * dir[3]
			];
		
		//Since we're only doing a linear approximation, this position won't be exactly
		//on the manifold. Therefore, we'll do a quick correction to get it back.

		//Here, we want the H2 magnitude to be equal to -1.
		const magnitude = Math.sqrt(
			-newPos[0] * newPos[0]
			- newPos[1] * newPos[1]
			+ newPos[2] * newPos[2]
		);

		newPos[0] /= magnitude;
		newPos[1] /= magnitude;
		newPos[2] /= magnitude;

		return newPos;
	}

	getNormalVec(cameraPos)
	{
		//f = -1 + x^2 + y^2 - z^2.
		return this.normalize([
			-cameraPos[0],
			-cameraPos[1],
			cameraPos[2],
			0
		]);
	}

	correctVectors()
	{
		function h2DotProduct(vec1, vec2)
		{
			return vec1[0] * vec2[0] + vec1[1] * vec2[1] - vec1[2] * vec2[2];
		}

		// Here, we want this weirdo dot product to be 0.
		const dotUp = h2DotProduct(
			this.cameraPos,
			this.upVec
		);

		const dotRight = h2DotProduct(
			this.cameraPos,
			this.rightVec
		);

		const dotForward = h2DotProduct(
			this.cameraPos,
			this.forwardVec
		);

		for (let i = 0; i < 3; i++)
		{
			// The signature of the Lorentzian inner product means
			// we need to add these instead of subtracting them.
			this.upVec[i] += dotUp * this.cameraPos[i];
			this.rightVec[i] += dotRight * this.cameraPos[i];
			this.forwardVec[i] += dotForward * this.cameraPos[i];
		}

		this.upVec = this.normalize(this.upVec);
		this.rightVec = this.normalize(this.rightVec);
		this.forwardVec = this.normalize(this.forwardVec);
	}

	dotProduct(vec1, vec2)
	{
		return vec1[0] * vec2[0] + vec1[1] * vec2[1] - vec1[2] * vec2[2] + vec1[3] * vec2[3];
	}

	normalize(vec)
	{
		const magnitude = Math.sqrt(Math.abs(this.dotProduct(vec, vec)));

		return [vec[0] / magnitude, vec[1] / magnitude, vec[2] / magnitude, vec[3] / magnitude];
	}
}



export class H2xERooms extends H2xEGeometry
{
	static distances = `
		float spacing = 1.09;

		float distance1 = wallThickness - length(vec2(acosh(pos.x), mod(pos.w + spacing / 2.0, spacing) - spacing / 2.0));
	`;

	distanceEstimatorGlsl = `
		${H2xERooms.distances}

		float minDistance = ${getMaxGlslString("distance", 6)};

		return minDistance;
	`;

	getColorGlsl = `
		${H2xERooms.distances}

		float minDistance = ${getMaxGlslString("distance", 6)};

		float wColor = floor((pos.w + spacing / 2.0) / spacing);

		if (minDistance == distance1)
		{
			return vec3(
				.75 + .25 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 89.0) + 1.0))
			);
		}

		if (minDistance == distance2)
		{
			return vec3(
				.65 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.75 + .25 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 89.0) + 1.0))
			);
		}

		if (minDistance == distance3)
		{
			return vec3(
				.65 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.75 + .25 * (.5 * (sin(wColor * 17.0) + 1.0))
			);
		}

		if (minDistance == distance4)
		{
			return vec3(
				.75 + .25 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.75 + .25 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 17.0) + 1.0))
			);
		}

		if (minDistance == distance5)
		{
			return vec3(
				.75 + .25 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.75 + .25 * (.5 * (sin(wColor * 17.0) + 1.0))
			);
		}

		if (minDistance == distance6)
		{
			return vec3(
				.65 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.75 + .25 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.75 + .25 * (.5 * (sin(wColor * 17.0) + 1.0))
			);
		}
	`;

	lightGlsl = `
		// The cap of .05 fixes a very weird bug where the top and bottom of spheres had tiny dots of incorrect lighting.

		vec4 lightDirection1 = normalize(vec4(2.0, 2.0, 2.0, -3.0) - pos);
		float dotProduct1 = abs(dot(surfaceNormal, lightDirection1));

		float lightIntensity = 1.5 * lightBrightness * dotProduct1;
	`;

	cameraPos = [0, 0, -1, 0];
	normalVec = [0, 0, -1, 0];
	upVec = [0, 0, 0, 1];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];

	getMovingSpeed()
	{
		return 1;
	}

	uniformGlsl = "uniform float wallThickness;";
	uniformNames = ["wallThickness"];

	updateUniforms(gl, uniformList)
	{
		const wallThickness = .9557 - sliderValues.wallThickness / 10;

		gl.uniform1f(uniformList["wallThickness"], wallThickness);
	}

	uiElementsUsed = "#wall-thickness-slider";

	initUI()
	{
		const wallThicknessSlider = $("#wall-thickness-slider");
		const wallThicknessSliderValue = $("#wall-thickness-slider-value");

		wallThicknessSlider.min = -.45;
		wallThicknessSlider.max = .6;
		wallThicknessSlider.value = .6;
		wallThicknessSliderValue.textContent = .6;
		sliderValues.wallThickness = .6;
	}
}



export class H2xESpheres extends H2xEGeometry
{
	static distances = `
		float distance1 = length(vec2(acosh(pos.z), mod(pos.w + .785398, 1.570796) - .785398)) - .5;
	`;

	distanceEstimatorGlsl = `
		${H2xESpheres.distances}

		float minDistance = distance1;

		return minDistance;
	`;

	getColorGlsl = `
		${H2xESpheres.distances}

		float minDistance = distance1;

		float wColor = floor((pos.w + .785398) / 1.570796);

		if (minDistance == distance1)
		{
			return vec3(
				.75 + .25 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 89.0) + 1.0))
			);
		}

		// if (minDistance == distance2)
		// {
		// 	return vec3(
		// 		.65 * (.5 * (sin(wColor * 7.0) + 1.0)),
		// 		.75 + .25 * (.5 * (sin(wColor * 11.0) + 1.0)),
		// 		.65 * (.5 * (sin(wColor * 89.0) + 1.0))
		// 	);
		// }

		// if (minDistance == distance3)
		// {
		// 	return vec3(
		// 		.65 * (.5 * (sin(wColor * 7.0) + 1.0)),
		// 		.65 * (.5 * (sin(wColor * 11.0) + 1.0)),
		// 		.75 + .25 * (.5 * (sin(wColor * 17.0) + 1.0))
		// 	);
		// }

		// if (minDistance == distance4)
		// {
		// 	return vec3(
		// 		.75 + .25 * (.5 * (sin(wColor * 7.0) + 1.0)),
		// 		.75 + .25 * (.5 * (sin(wColor * 11.0) + 1.0)),
		// 		.65 * (.5 * (sin(wColor * 17.0) + 1.0))
		// 	);
		// }

		// if (minDistance == distance5)
		// {
		// 	return vec3(
		// 		.88 + .12 * (.5 * (sin(wColor * 7.0) + 1.0)),
		// 		.88 + .12 * (.5 * (sin(wColor * 11.0) + 1.0)),
		// 		.88 + .12 * (.5 * (sin(wColor * 17.0) + 1.0))
		// 	);
		// }
	`;

	lightGlsl = `
		// This is very weird, but it fixes an issue where the north and south poles
		// of spheres had dots of incorrect lighting.
		pos.xyz = normalize(pos.xyz) / 1.001;
		surfaceNormal = getSurfaceNormal(pos);
		
		vec4 lightDirection1 = normalize(vec4(0.0, 1.0, 0.0, 2.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(1.0, 0.0, -1.0, 1.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		float lightIntensity = 1.3 * lightBrightness * max(dotProduct1, dotProduct2);

		lightIntensity = 1.0;
	`;

	cameraPos = [0, 0, 1, 0];
	normalVec = [0, 0, -1, 0];
	upVec = [0, 0, 0, 1];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];

	getMovingSpeed()
	{
		return 1;
	}
}