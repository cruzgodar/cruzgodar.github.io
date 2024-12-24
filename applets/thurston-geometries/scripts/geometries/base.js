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
		lastTIncrease = distanceToScene * stepFactor;
		
		t += lastTIncrease;
	`;

	getNormalVecGlsl = /* glsl */`
		return vec4(0.0, 0.0, 0.0, 1.0);
	`;

	// Given pos, move it -correctionDistance in the direction of surfaceNormal.
	correctPosGlsl = /* glsl */`
		pos -= surfaceNormal * correctionDistance;
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

	getNearestCenter()
	{
		return [...this.cameraPos];
	}

	getNearestCorner()
	{
		return [...this.cameraPos];
	}

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

	handleMovingCallback() {}

	movingSpeed = 1;

	aspectRatio;
	ignoreAspectRatio = false;
	
	fov;

	uniformGlsl;
	uniformNames;
	getUpdatedUniforms() {}

	wallThicknessData;
	maxClipDistance = 5;
	doClipBrightening = false;

	uiElementsUsed = "";

	sliderValues = {
		sceneTransition: 0,
		wallThickness: 0,
		clipDistance: 0,
		fiberThickness: 0
	};
}