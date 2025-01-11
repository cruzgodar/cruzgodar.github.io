import anime from "../anime.js";
import { AnimationFrameApplet } from "./animationFrameApplet.js";
import { crossProduct, magnitude, normalize, scaleVector } from "./raymarchApplet.js";
import * as THREE from "/scripts/three.js";

export class ThreeApplet extends AnimationFrameApplet
{
	movingSpeed = .1;
	moveVelocity = [0, 0, 0];

	moveFriction = .96;
	moveStopThreshhold = .01;

	lastTimestamp = -1;

	theta = 0;
	phi = 0;
	fovFactor = 1;

	imageSize = 400;
	imageWidth = 400;
	imageHeight = 400;

	imagePlaneCenterPos = [];

	forwardVec = [];
	rightVec = [];
	upVec = [];

	cameraPos = [0, 0, 0];

	lockedOnOrigin = true;
	distanceFromOrigin = 1;

	renderer;
	scene;
	camera;



	constructor({
		canvas,
		lockedOnOrigin = true,
		cameraPos = [0, 0, 0],
	}) {
		super(canvas);

		this.lockedOnOrigin = lockedOnOrigin;
		this.cameraPos = cameraPos;
		this.distanceFromOrigin = magnitude(this.cameraPos);

		this.listenForKeysPressed(
			["w", "s", "a", "d", "q", "e", " ", "shift", "z"],
			(key, pressed) =>
			{
				if (key === "z")
				{
					const dummy = { t: 0 };
					const oldFovFactor = this.fovFactor;
					const newFovFactor = pressed ? .25 : 1;

					anime({
						targets: dummy,
						t: 1,
						duration: 250,
						easing: "easeOutQuad",
						update: () =>
						{
							this.fovFactor = (1 - dummy.t) * oldFovFactor + dummy.t * newFovFactor;
							this.camera.fov = 100 * this.fovFactor;
							this.camera.updateProjectionMatrix();

							this.needNewFrame = true;
						}
					});
				}
			}
		);

		const refreshId = setInterval(() =>
		{
			if (this?.wilson?.draggables?.container)
			{
				this.listenForNumTouches();

				clearInterval(refreshId);
			}
		}, 100);
	}



	initThree()
	{
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0x000000);

		this.camera = new THREE.PerspectiveCamera(100, 1, .01, 100);

		this.renderer = new THREE.WebGLRenderer({
			canvas: this.wilson.canvas,
			antialias: true,
			context: this.wilson.gl
		});

		this.renderer.setSize(this.imageSize, this.imageSize, false);

		this.ambientLight = new THREE.AmbientLight(0xffffff, .15);
		this.scene.add(this.ambientLight);

		this.renderer.useLegacyLights = true;
	}



	calculateVectors()
	{
		// // Here comes the serious math. Theta is the angle in the xy-plane and
		// // phi the angle down from the z-axis. We can use them get a normalized forward vector:
		this.forwardVec = [
			Math.cos(this.theta) * Math.sin(this.phi),
			Math.sin(this.theta) * Math.sin(this.phi),
			Math.cos(this.phi)
		];

		// Now the right vector needs to be constrained to the xy-plane,
		// since otherwise the image will appear tilted. For a vector (a, b, c),
		// the orthogonal plane that passes through the origin is ax + by + cz = 0,
		// so we want ax + by = 0. One solution is (b, -a), and that's the one that
		// goes to the "right" of the forward vector (when looking down).
		this.rightVec = normalize([this.forwardVec[1], -this.forwardVec[0], 0]);

		// Finally, the upward vector is the cross product of the previous two.
		this.upVec = crossProduct(this.rightVec, this.forwardVec);

		if (this.lockedOnOrigin)
		{
			this.cameraPos = scaleVector(
				-this.distanceFromOrigin,
				this.forwardVec
			);
		}

		this.camera.position.set(0, 0, 0);
		this.camera.up.set(...this.upVec);
		this.camera.lookAt(...this.forwardVec);
		this.camera.position.set(...this.cameraPos);
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

		if (!this.lockedOnOrigin &&
			(
				this.moveVelocity[0] !== 0
				|| this.moveVelocity[1] !== 0
				|| this.moveVelocity[2] !== 0
			)
		) {
			const tangentVec = [
				this.moveVelocity[0] * this.forwardVec[0]
					+ this.moveVelocity[1] * this.rightVec[0],
				this.moveVelocity[0] * this.forwardVec[1]
					+ this.moveVelocity[1] * this.rightVec[1],
				this.moveVelocity[0] * this.forwardVec[2]
					+ this.moveVelocity[1] * this.rightVec[2]
					+ this.moveVelocity[2]
			];

			this.cameraPos[0] += this.movingSpeed * tangentVec[0] * (timeElapsed / 6.944);
			this.cameraPos[1] += this.movingSpeed * tangentVec[1] * (timeElapsed / 6.944);
			this.cameraPos[2] += this.movingSpeed * tangentVec[2] * (timeElapsed / 6.944);

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



	async setLockedOnOrigin(value)
	{
		if (value && !this.lockedOnOrigin)
		{
			// Convert to spherical coordinates.
			const r = magnitude(this.cameraPos);
			const normalizedCameraPos = normalize(this.cameraPos);
			const phi = Math.acos(this.cameraPos[2] / r);
			let theta = Math.PI - Math.atan2(this.cameraPos[1], this.cameraPos[0]);
			if (theta > Math.PI)
			{
				theta -= 2 * Math.PI;
			}
			if (theta < -Math.PI)
			{
				theta += 2 * Math.PI;
			}

			const dummy = {
				r,
				theta: 2 * Math.PI - this.theta,
				phi: Math.PI - this.phi
			};

			if (dummy.theta > Math.PI)
			{
				dummy.theta -= 2 * Math.PI;
			}
			if (dummy.theta < -Math.PI)
			{
				dummy.theta += 2 * Math.PI;
			}

			await anime({
				targets: dummy,
				theta,
				phi,
				r: this.distanceFromOrigin,
				duration: 500,
				easing: "easeOutCubic",
				update: () =>
				{
					this.wilson.resizeWorld({
						centerX: dummy.theta,
						centerY: dummy.phi,
					});
					
					this.cameraPos = scaleVector(
						dummy.r,
						normalizedCameraPos
					);
					
					this.needNewFrame = true;
				}
			}).finished;
		}

		this.lockedOnOrigin = value;
		this.worldSize = this.lockedOnOrigin ? 2.5 : 1.5;

		this.wilson.resizeWorld({
			width: this.worldSize,
			height: this.worldSize,
			centerX: this.lockedOnOrigin ? this.theta : 2 * Math.PI - this.theta,
			centerY: this.lockedOnOrigin ? this.phi : Math.PI - this.phi,
			minY: 0.001 - this.worldSize / 2,
			maxY: Math.PI - 0.001 + this.worldSize / 2,
		});
	}
}