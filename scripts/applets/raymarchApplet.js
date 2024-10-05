import { AnimationFrameApplet } from "./animationFrameApplet.js";

export class RaymarchApplet extends AnimationFrameApplet
{
	movingSpeed = .1;
	moveVelocity = [0, 0, 0];

	moveFriction = .96;
	moveStopThreshhold = .01;



	distanceToScene = 1;

	lastTimestamp = -1;

	theta = 0;
	phi = 0;

	imageSize = 400;
	imageWidth = 400;
	imageHeight = 400;

	maxMarches = 100;

	imagePlaneCenterPos = [];

	forwardVec = [];
	rightVec = [];
	upVec = [];

	cameraPos = [0, 0, 0];
	lockZ;

	focalLength = 2;

	lockedOnOrigin = false;
	distanceFromOrigin = 1;



	constructor(canvas)
	{
		super(canvas);
		
		if (!this.lockedOnOrigin)
		{
			this.listenForKeysPressed(["w", "s", "a", "d", "q", "e", " ", "shift"]);
		}

		const refreshId = setInterval(() =>
		{
			if (this?.wilson?.draggables?.container)
			{
				this.listenForNumTouches();

				clearInterval(refreshId);
			}
		}, 100);
	}



	calculateVectors()
	{
		// Here comes the serious math. Theta is the angle in the xy-plane and
		// phi the angle down from the z-axis. We can use them get a normalized forward vector:
		const theta = this.lockedOnOrigin ? -this.theta : this.theta;
		const phi = this.lockedOnOrigin ? Math.PI - this.phi : this.phi;

		this.forwardVec = [
			Math.cos(theta) * Math.sin(phi),
			Math.sin(theta) * Math.sin(phi),
			Math.cos(phi)
		];

		// Now the right vector needs to be constrained to the xy-plane,
		// since otherwise the image will appear tilted. For a vector (a, b, c),
		// the orthogonal plane that passes through the origin is ax + by + cz = 0,
		// so we want ax + by = 0. One solution is (b, -a), and that's the one that
		// goes to the "right" of the forward vector (when looking down).
		this.rightVec = RaymarchApplet.normalize([this.forwardVec[1], -this.forwardVec[0], 0]);

		// Finally, the upward vector is the cross product of the previous two.
		this.upVec = RaymarchApplet.crossProduct(this.rightVec, this.forwardVec);

		if (this.lockedOnOrigin)
		{
			this.cameraPos = RaymarchApplet.scaleVector(
				-this.distanceFromOrigin,
				this.forwardVec
			);
		}

		

		this.distanceToScene = this.distanceEstimator(
			this.cameraPos[0],
			this.cameraPos[1],
			this.cameraPos[2]
		);



		this.focalLength = Math.min(this.distanceToScene, .5) / 2;

		// The factor we divide by here sets the fov.
		this.forwardVec[0] *= this.focalLength / 2;
		this.forwardVec[1] *= this.focalLength / 2;
		this.forwardVec[2] *= this.focalLength / 2;

		this.rightVec[0] *= this.focalLength / 2;
		this.rightVec[1] *= this.focalLength / 2;

		this.upVec[0] *= this.focalLength / 2;
		this.upVec[1] *= this.focalLength / 2;
		this.upVec[2] *= this.focalLength / 2;

		

		this.imagePlaneCenterPos = [
			this.cameraPos[0] + this.forwardVec[0],
			this.cameraPos[1] + this.forwardVec[1],
			this.cameraPos[2] + this.forwardVec[2]
		];

		

		this.wilson.gl.uniform3fv(this.wilson.uniforms["cameraPos"], this.cameraPos);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms["imagePlaneCenterPos"],
			this.imagePlaneCenterPos
		);

		this.wilson.gl.uniform3fv(this.wilson.uniforms["forwardVec"], this.forwardVec);
		this.wilson.gl.uniform3fv(this.wilson.uniforms["rightVec"], this.rightVec);
		this.wilson.gl.uniform3fv(this.wilson.uniforms["upVec"], this.upVec);

		this.wilson.gl.uniform1f(this.wilson.uniforms["focalLength"], this.focalLength);
	}



	moveUpdate(timeElapsed)
	{
		if (this.keysPressed.w || this.numTouches === 2)
		{
			this.moveVelocity[0] = 1;
		}

		else if (this.keysPressed.s || this.numTouches === 3)
		{
			this.moveVelocity[0] = -1;
		}

		if (this.keysPressed.d)
		{
			this.moveVelocity[1] = 1;
		}

		else if (this.keysPressed.a)
		{
			this.moveVelocity[1] = -1;
		}

		if (this.keysPressed[" "])
		{
			this.moveVelocity[2] = 1;
		}

		else if (this.keysPressed.shift)
		{
			this.moveVelocity[2] = -1;
		}

		if (!this.lockedOnOrigin && (
			this.moveVelocity[0] !== 0
				|| this.moveVelocity[1] !== 0
				|| this.moveVelocity[2] !== 0
		)) {
			const usableForwardVec = this.lockZ !== undefined
				? RaymarchApplet.scaleVector(
					RaymarchApplet.magnitude(this.forwardVec),
					RaymarchApplet.normalize([
						this.forwardVec[0],
						this.forwardVec[1],
						0
					]),
				)
				: this.forwardVec;

			const usableRightVec = this.lockZ !== undefined
				? RaymarchApplet.scaleVector(
					RaymarchApplet.magnitude(this.rightVec),
					RaymarchApplet.normalize([
						this.rightVec[0],
						this.rightVec[1],
						0
					]),
				)
				: this.rightVec;

			const tangentVec = [
				this.moveVelocity[0] * usableForwardVec[0]
					+ this.moveVelocity[1] * usableRightVec[0],
				this.moveVelocity[0] * usableForwardVec[1]
					+ this.moveVelocity[1] * usableRightVec[1],
				this.moveVelocity[0] * usableForwardVec[2]
					+ this.moveVelocity[1] * usableRightVec[2]
					+ this.moveVelocity[2] * this.focalLength / 2
			];

			this.cameraPos[0] += this.movingSpeed * tangentVec[0] * (timeElapsed / 6.944);
			this.cameraPos[1] += this.movingSpeed * tangentVec[1] * (timeElapsed / 6.944);
			this.cameraPos[2] = this.lockZ
				?? this.cameraPos[2] + this.movingSpeed * tangentVec[2] * (timeElapsed / 6.944);

			this.needNewFrame = true;
		}

		this.calculateVectors();

		for (let i = 0; i < 3; i++)
		{
			this.moveVelocity[i] *= this.moveFriction ** (timeElapsed / 6.944);

			if (Math.abs(this.moveVelocity[i]) < this.moveStopThreshhold)
			{
				this.moveVelocity[i] = 0;
			}
		}
	}



	static magnitude(vec)
	{
		return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
	}



	static addVectors(vec1, vec2)
	{
		return [vec1[0] + vec2[0], vec1[1] + vec2[1], vec1[2] + vec2[2]];
	}

	static scaleVector(c, vec)
	{
		return [c * vec[0], c * vec[1], c * vec[2]];
	}



	static dotProduct(vec1, vec2)
	{
		return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2];
	}

	static dotProduct4(vec1, vec2)
	{
		return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2] + vec1[3] * vec2[3];
	}



	static crossProduct(vec1, vec2)
	{
		return [
			vec1[1] * vec2[2] - vec1[2] * vec2[1],
			vec1[2] * vec2[0] - vec1[0] * vec2[2],
			vec1[0] * vec2[1] - vec1[1] * vec2[0]
		];
	}



	static matMul(mat1, mat2)
	{
		return [
			[
				mat1[0][0] * mat2[0][0] + mat1[0][1] * mat2[1][0] + mat1[0][2] * mat2[2][0],
				mat1[0][0] * mat2[0][1] + mat1[0][1] * mat2[1][1] + mat1[0][2] * mat2[2][1],
				mat1[0][0] * mat2[0][2] + mat1[0][1] * mat2[1][2] + mat1[0][2] * mat2[2][2]
			],

			[
				mat1[1][0] * mat2[0][0] + mat1[1][1] * mat2[1][0] + mat1[1][2] * mat2[2][0],
				mat1[1][0] * mat2[0][1] + mat1[1][1] * mat2[1][1] + mat1[1][2] * mat2[2][1],
				mat1[1][0] * mat2[0][2] + mat1[1][1] * mat2[1][2] + mat1[1][2] * mat2[2][2]
			],

			[
				mat1[2][0] * mat2[0][0] + mat1[2][1] * mat2[1][0] + mat1[2][2] * mat2[2][0],
				mat1[2][0] * mat2[0][1] + mat1[2][1] * mat2[1][1] + mat1[2][2] * mat2[2][1],
				mat1[2][0] * mat2[0][2] + mat1[2][1] * mat2[1][2] + mat1[2][2] * mat2[2][2]
			]
		];
	}



	static qmul(x1, y1, z1, w1, x2, y2, z2, w2)
	{
		return [
			x1 * x2 - y1 * y2 - z1 * z1 - w1 * w2,
			x1 * y2 + y1 * x2 + z1 * w2 - w1 * z2,
			x1 * z2 - y1 * w2 + z1 * x2 + w1 * y2,
			x1 * w2 + y1 * z2 - z1 * y2 + w1 * x2
		];
	}



	static normalize(vec)
	{
		const magnitude = RaymarchApplet.magnitude(vec);

		return [vec[0] / magnitude, vec[1] / magnitude, vec[2] / magnitude];
	}
}