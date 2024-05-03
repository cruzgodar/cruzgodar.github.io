import { getFloatGlsl, getMinGlslString, getVectorGlsl } from "/scripts/applets/applet.js";
import { ThreeApplet } from "/scripts/applets/threeApplet.js";
import { aspectRatio } from "/scripts/src/layout.js";
import { addTemporaryListener } from "/scripts/src/main.js";
import * as THREE from "/scripts/three.js";
import { Wilson } from "/scripts/wilson.js";

function hsvToRgb(h, s, v)
{
	function f(n)
	{
		const k = (n + 6 * h) % 6;
		return v - v * s * Math.max(0, Math.min(k, Math.min(4 - k, 1)));
	}

	return [255 * f(5), 255 * f(3), 255 * f(1)];
}

class Fiber extends THREE.Curve
{
	// Standard 3D point + vector + center for a parametric circle.
	p;
	v;
	center;

	// Used for the inverse exponential view.
	s3Point;

	constructor({
		p,
		v,
		center,
		s3Point
	}) {
		super();

		this.p = p;
		this.v = v;
		this.center = center;
		this.s3Point = s3Point;
	}

	getPoint(t, optionalTarget = new THREE.Vector3())
	{
		const c = Math.cos(2 * Math.PI * t);
		const s = Math.sin(2 * Math.PI * t);

		const tx = c * this.p[0] + s * this.v[0] + this.center[0];
		const ty = c * this.p[1] + s * this.v[1] + this.center[1];
		const tz = c * this.p[2] + s * this.v[2] + this.center[2];

		return optionalTarget.set(tx, ty, tz);
	}
}

export class HopfFibration extends ThreeApplet
{
	cameraPos = [2, 2, 2];
	theta = 3.7518;
	phi = 2.1482;

	movingSpeed = .025;

	// This is in addition to the north and south poles.
	numLatitudes = 4;
	numLongitudesPerLatitude = 16;

	fibers = [];


	constructor({ canvas })
	{
		super(canvas);

		const options =
		{
			renderer: "gpu",

			canvasWidth: 500,
			canvasHeight: 500,

			worldCenterX: -this.theta,
			worldCenterY: -this.phi,
		


			useFullscreen: true,

			trueFullscreen: true,

			useFullscreenButton: true,

			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",

			switchFullscreenCallback: this.changeResolution.bind(this),



			mousedownCallback: this.onGrabCanvas.bind(this),
			touchstartCallback: this.onGrabCanvas.bind(this),

			mousedragCallback: this.onDragCanvas.bind(this),
			touchmoveCallback: this.onDragCanvas.bind(this),

			mouseupCallback: this.onReleaseCanvas.bind(this),
			touchendCallback: this.onReleaseCanvas.bind(this)
		};

		this.wilson = new Wilson(canvas, options);

		this.initThree();

		const boundFunction = () => this.changeResolution();
		addTemporaryListener({
			object: window,
			event: "resize",
			callback: boundFunction
		});

		this.createAllFibers();

		this.resume();
	}

	createFiber(theta, phi)
	{
		const s2Point = [
			Math.sin(phi) * Math.cos(theta),
			Math.sin(phi) * Math.sin(theta),
			Math.cos(phi)
		];

		const scalingFactor = 1 / Math.sqrt(2 * (s2Point[2] + 1));

		// We start by choosing a point on the fiber
		// with maximum w component, which will help later.
		const p = [
			0,
			scalingFactor * s2Point[0],
			scalingFactor * s2Point[1],
			scalingFactor * (1 + s2Point[2]),
		];

		// Next we'll look at the image of this point under the projection.
		const projectedP = [
			p[0] / (1 - p[3]),
			p[1] / (1 - p[3]),
			p[2] / (1 - p[3])
		];

		// Now we'll do the same for the antipode to p. Since we started with
		// a point with maximal w-coordinate, this is guaranteed to be antipodal on the output too.
		const projectedPAntipode = [
			-p[0] / (1 + p[3]),
			-p[1] / (1 + p[3]),
			-p[2] / (1 + p[3])
		];

		const center = [
			(projectedP[0] + projectedPAntipode[0]) / 2,
			(projectedP[1] + projectedPAntipode[1]) / 2,
			(projectedP[2] + projectedPAntipode[2]) / 2
		];

		// Now the radius is the distance between projectedP and center.
		const radius = Math.sqrt(
			(projectedP[0] - center[0]) ** 2
			+ (projectedP[1] - center[1]) ** 2
			+ (projectedP[2] - center[2]) ** 2
		);

		// To find the normal vector, we'll start by getting a third point on the circle
		// that's guaranteed to not be collinear with these two.
		const otherP = [
			scalingFactor * (1 + s2Point[2]),
			-scalingFactor * s2Point[1],
			scalingFactor * s2Point[0],
			0
		];

		const projectedOtherP = [
			otherP[0] / (1 - otherP[3]),
			otherP[1] / (1 - otherP[3]),
			otherP[2] / (1 - otherP[3])
		];

		// What we need now is to take the component of this new point that's orthogonal
		// to the first point.
		const centerToProjectedP = [
			projectedP[0] - center[0],
			projectedP[1] - center[1],
			projectedP[2] - center[2]
		];

		const centerToProjectedOtherP = [
			projectedOtherP[0] - center[0],
			projectedOtherP[1] - center[1],
			projectedOtherP[2] - center[2]
		];

		const scalingFactor2 = (
			centerToProjectedOtherP[0] * centerToProjectedP[0]
			+ centerToProjectedOtherP[1] * centerToProjectedP[1]
			+ centerToProjectedOtherP[2] * centerToProjectedP[2]
		) / (
			centerToProjectedP[0] * centerToProjectedP[0]
			+ centerToProjectedP[1] * centerToProjectedP[1]
			+ centerToProjectedP[2] * centerToProjectedP[2]
		);

		const orthogonalVector = [
			centerToProjectedOtherP[0] - scalingFactor2 * centerToProjectedP[0],
			centerToProjectedOtherP[1] - scalingFactor2 * centerToProjectedP[1],
			centerToProjectedOtherP[2] - scalingFactor2 * centerToProjectedP[2]
		];

		const magnitude = Math.sqrt(
			orthogonalVector[0] ** 2
			+ orthogonalVector[1] ** 2
			+ orthogonalVector[2] ** 2
		);

		const right = [
			radius / magnitude * orthogonalVector[0],
			radius / magnitude * orthogonalVector[1],
			radius / magnitude * orthogonalVector[2]
		];

		const path = new Fiber({
			p: centerToProjectedP,
			v: right,
			center,
		});
		const tubularSegments = 100;
		const fiberThickness = 0.05;
		const radialSegments = 20;

		const rgb = hsvToRgb(
			phi / (Math.PI) * 6 / 7,
			Math.abs((theta % Math.PI) - Math.PI / 2) / (Math.PI / 2),
			1
		);

		const mesh = new THREE.Mesh(
			new THREE.TubeGeometry(
				path,
				tubularSegments,
				fiberThickness,
				radialSegments,
				false
			),
			new THREE.MeshStandardMaterial({
				color: new THREE.Color(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255)
			})
		);

		this.scene.add(mesh);

		return mesh;
	}

	createAllFibers()
	{
		for (let i = 0; i < this.numLatitudes; i++)
		{
			const phi = (i + 1) / (this.numLatitudes + 1) * Math.PI;

			for (let j = 0; j < this.numLongitudesPerLatitude; j++)
			{
				const theta = j / this.numLongitudesPerLatitude * 2 * Math.PI;

				const fiber = this.createFiber(theta, phi);

				this.fibers.push(fiber);
			}
		}
	}

	// Point is a length-3 array containing xyz coordinates.
	// This returns [center, normal, radius].
	s2PointToCircle(point)
	{
		if (Math.abs(point[2]) === 1)
		{
			throw new Error("Don't pass poles to the projection function!");
		}

		const scalingFactor = 1 / Math.sqrt(2 * (point[2] + 1));

		// We start by choosing a point on the fiber
		// with maximum w component, which will help later.
		const p = [
			0,
			scalingFactor * point[0],
			scalingFactor * point[1],
			scalingFactor * (1 + point[2]),
		];

		// Next we'll look at the image of this point under the projection.
		const projectedP = [
			p[0] / (1 - p[3]),
			p[1] / (1 - p[3]),
			p[2] / (1 - p[3])
		];

		// Now we'll do the same for the antipode to p. Since we started with
		// a point with maximal w-coordinate, this is guaranteed to be antipodal on the output too.
		const projectedPAntipode = [
			-p[0] / (1 + p[3]),
			-p[1] / (1 + p[3]),
			-p[2] / (1 + p[3])
		];

		const center = [
			(projectedP[0] + projectedPAntipode[0]) / 2,
			(projectedP[1] + projectedPAntipode[1]) / 2,
			(projectedP[2] + projectedPAntipode[2]) / 2
		];

		// Now the radius is the distance between projectedP and center.
		const radius = Math.sqrt(
			(projectedP[0] - center[0]) ** 2
			+ (projectedP[1] - center[1]) ** 2
			+ (projectedP[2] - center[2]) ** 2
		);

		// To find the normal vector, we'll start by getting a third point on the circle
		// that's guaranteed to not be collinear with these two.
		const otherP = [
			scalingFactor * (1 + point[2]),
			-scalingFactor * point[1],
			scalingFactor * point[0],
			0
		];

		const projectedOtherP = [
			otherP[0] / (1 - otherP[3]),
			otherP[1] / (1 - otherP[3]),
			otherP[2] / (1 - otherP[3])
		];

		// Finally, we can get a normal vector by taking a cross product
		// of these two.
		const crossProduct = [
			projectedP[1] * projectedOtherP[2] - projectedP[2] * projectedOtherP[1],
			projectedP[2] * projectedOtherP[0] - projectedP[0] * projectedOtherP[2],
			projectedP[0] * projectedOtherP[1] - projectedP[1] * projectedOtherP[0]
		];

		const magnitude = Math.sqrt(
			crossProduct[0] * crossProduct[0]
			+ crossProduct[1] * crossProduct[1]
			+ crossProduct[2] * crossProduct[2]
		);

		const normal = [
			crossProduct[0] / magnitude,
			crossProduct[1] / magnitude,
			crossProduct[2] / magnitude
		];

		return [center, normal, radius];
	}

	getDistanceEstimatorGlsl()
	{
		let glsl = "";
		let index = 3;

		glsl += /* glsl */`
			float distance1 = torusDistance(pos, vec3(0.0, 0.0, 0.0), vec3(1.0, 0.0, 1.0), 1.0);
			float distance2 = length(pos.yz) - fiberThickness;
		`;

		for (let i = 0; i < this.numLatitudes; i++)
		{
			const phi = (i + 1) / (this.numLatitudes + 1) * Math.PI;

			for (let j = 0; j < this.numLongitudesPerLatitude; j++)
			{
				const theta = j / this.numLongitudesPerLatitude * 2 * Math.PI;

				const s2Point = [
					Math.sin(phi) * Math.cos(theta),
					Math.sin(phi) * Math.sin(theta),
					Math.cos(phi)
				];

				const [center, normal, radius] = this.s2PointToCircle(s2Point);

				glsl += /* glsl */`
					float distance${index} = torusDistance(pos, ${getVectorGlsl(center)}, ${getVectorGlsl(normal)}, ${getFloatGlsl(radius)});
				`;

				index++;
			}
		}

		glsl += /* glsl */`
			float minDistance = ${getMinGlslString("distance", index - 1)};
		`;

		return glsl;
	}




	prepareFrame(timeElapsed)
	{
		this.pan.update(timeElapsed);
		this.zoom.update(timeElapsed);
		this.moveUpdate(timeElapsed);
	}

	drawFrame()
	{
		
		this.wilson.worldCenterY = Math.min(
			Math.max(
				this.wilson.worldCenterY,
				-Math.PI + .01
			),
			-.01
		);
		
		this.theta = -this.wilson.worldCenterX;
		this.phi = -this.wilson.worldCenterY;

		this.renderer.render(this.scene, this.camera);
		// this.wilson.render.drawFrame();
	}



	changeResolution(resolution = this.imageSize)
	{
		this.imageSize = Math.max(100, resolution);

		if (this.wilson.fullscreen.currentlyFullscreen)
		{
			if (aspectRatio >= 1)
			{
				this.imageWidth = this.imageSize;
				this.imageHeight = Math.floor(this.imageSize / aspectRatio);
			}

			else
			{
				this.imageWidth = Math.floor(this.imageSize * aspectRatio);
				this.imageHeight = this.imageSize;
			}
		}

		else
		{
			this.imageWidth = this.imageSize;
			this.imageHeight = this.imageSize;
		}



		this.wilson.changeCanvasSize(this.imageWidth, this.imageHeight);



		if (this.imageWidth >= this.imageHeight)
		{
			this.wilson.gl.uniform1f(
				this.wilson.uniforms["aspectRatioX"],
				this.imageWidth / this.imageHeight
			);

			this.wilson.gl.uniform1f(
				this.wilson.uniforms["aspectRatioY"],
				1
			);
		}

		else
		{
			this.wilson.gl.uniform1f(
				this.wilson.uniforms["aspectRatioX"],
				1
			);

			this.wilson.gl.uniform1f(
				this.wilson.uniforms["aspectRatioY"],
				this.imageWidth / this.imageHeight
			);
		}

		this.renderer.setSize(this.imageWidth, this.imageHeight, false);
		this.camera.aspect = this.imageWidth / this.imageHeight;
		this.camera.updateProjectionMatrix();

		this.needNewFrame = true;
	}
}