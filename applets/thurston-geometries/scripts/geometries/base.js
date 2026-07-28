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

	// offset is [x, y, z] in eye coordinates (x right, y up, z back), in scene units.
	getOffsetFrame(pos, rightVec, upVec, forwardVec, offset)
	{
		const distance = Math.hypot(offset[0], offset[1], offset[2]);

		if (distance < 1e-9)
		{
			return [pos, forwardVec, rightVec, upVec];
		}

		// T(offset): the frame is geometry-orthonormal, so the geometry norm of this
		// equals the Euclidean norm of offset.
		const direction = this.normalize([0, 1, 2, 3].map(i =>
			offset[0] * rightVec[i] + offset[1] * upVec[i] - offset[2] * forwardVec[i]
		));

		const newPos = this.correctPosition(this.followGeodesic(pos, direction, distance));

		return this.correctFrame(newPos, forwardVec, rightVec, upVec);
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
		const correctedFrame = this.correctFrame(
			this.cameraPos,
			this.forwardVec,
			this.rightVec,
			this.upVec,
		);

		this.forwardVec = correctedFrame[1];
		this.rightVec = correctedFrame[2];
		this.upVec = correctedFrame[3];
	}

	// Not this.normalVec: that's the normal at this.cameraPos, and pos is frequently somewhere
	// else -- an eye offset half an IPD away from the head, say. Writing into fresh arrays
	// rather than the arguments matters for the same reason: the caller's frame is often the
	// one we're offsetting *from*, and it still has to be intact afterward.
	correctFrame(pos, forward, right, up)
	{
		const normalVec = this.getNormalVec(pos);

		const dotUp = this.dotProduct(normalVec, up);
		const dotRight = this.dotProduct(normalVec, right);
		const dotForward = this.dotProduct(normalVec, forward);

		const newUp = [];
		const newRight = [];
		const newForward = [];

		for (let i = 0; i < 4; i++)
		{
			newUp[i] = up[i] - dotUp * normalVec[i];
			newRight[i] = right[i] - dotRight * normalVec[i];
			newForward[i] = forward[i] - dotForward * normalVec[i];
		}

		return [
			pos,
			this.normalize(newForward),
			this.normalize(newRight),
			this.normalize(newUp)
		];
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
	xrScale = 1;

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