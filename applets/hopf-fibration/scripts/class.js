import anime from "/scripts/anime.js";
import { getEqualPixelFullScreen, tempShader } from "/scripts/applets/applet.js";
import { magnitude } from "/scripts/applets/raymarchApplet.js";
import { ThreeApplet } from "/scripts/applets/threeApplet.js";
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
	s3P;
	s3V;

	compression;

	constructor({
		p,
		v,
		center,
		s3P,
		s3V,
		compression
	}) {
		super();

		this.p = p;
		this.v = v;
		this.center = center;
		this.s3P = s3P;
		this.s3V = s3V;

		this.compression = compression;
	}

	getPoint(t, optionalTarget = new THREE.Vector3())
	{
		const c = Math.cos(2 * Math.PI * t);
		const s = Math.sin(2 * Math.PI * t);

		const txProjected = c * this.p[0] + s * this.v[0] + this.center[0];
		const tyProjected = c * this.p[1] + s * this.v[1] + this.center[1];
		const tzProjected = c * this.p[2] + s * this.v[2] + this.center[2];

		const w = c * this.s3P[3] + s * this.s3V[3];
		const scalingFactor = Math.acos(w) / (Math.PI * Math.sqrt(1 - w * w));

		const txCompressed = scalingFactor * (c * this.s3P[0] + s * this.s3V[0]);
		const tyCompressed = scalingFactor * (c * this.s3P[1] + s * this.s3V[1]);
		const tzCompressed = scalingFactor * (c * this.s3P[2] + s * this.s3V[2]);

		const tx = (1 - this.compression) * txProjected + this.compression * txCompressed;
		const ty = (1 - this.compression) * tyProjected + this.compression * tyCompressed;
		const tz = (1 - this.compression) * tzProjected + this.compression * tzCompressed;

		return optionalTarget.set(tz, ty, tx);
	}
}



export class HopfFibration extends ThreeApplet
{
	theta = Math.PI / 2;
	phi = Math.PI / 2;

	movingSpeed = .01;
	imageSize = 1000;

	compression = 0;

	// This is in addition to the north and south poles.
	numLatitudes = 3;
	numLongitudesPerLatitude = 30;
	numLongitudesShown = 30;

	fibers = [];

	needDownload = false;


	constructor({ canvas })
	{
		super({
			canvas,
			cameraPos: [0, -4, 0]
		});

		const options =
		{
			renderer: "gpu",

			shader: tempShader,

			canvasWidth: this.imageSize,
			canvasHeight: this.imageSize,

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

		const pointLight = new THREE.PointLight(0xffffff, 1, 10000);
		pointLight.position.set(-750, -1000, 500);
		this.scene.add(pointLight);

		const pointLight2 = new THREE.PointLight(0xffffff, .5, 10000);
		pointLight2.position.set(750, 1000, 500);
		this.scene.add(pointLight2);

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

		const fiber = new Fiber({
			p: centerToProjectedP,
			v: right,
			center,
			s3P: p,
			s3V: otherP,
			compression: this.compression
		});

		const tubularSegments = 100;
		const radialSegments = 20;

		const fiberThickness = (1 - this.compression) * 0.05
			+ this.compression * (
				0.115 / Math.sqrt(this.numLatitudes * this.numLongitudesPerLatitude)
			);

		const saturation = .2 + .7 * Math.abs(
			((theta + Math.PI / 2) % Math.PI) - Math.PI / 2) / (Math.PI / 2
		);

		const rgb = hsvToRgb(
			phi / Math.PI,
			saturation,
			1
		);

		const geometry = new THREE.TubeGeometry(
			fiber,
			tubularSegments,
			fiberThickness,
			radialSegments,
			false
		);

		const material = new THREE.MeshStandardMaterial({
			color: new THREE.Color(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255)
		});

		material.transparent = true;

		const mesh = new THREE.Mesh(geometry, material);

		this.scene.add(mesh);

		return mesh;
	}

	createAllFibers()
	{
		this.fibers.forEach(fiber =>
		{
			fiber.geometry.dispose();
			fiber.material.dispose();
			this.scene.remove(fiber);
		});

		this.fibers = [];

		const halfFibersHidden = Math.floor(
			(this.numLongitudesPerLatitude - this.numLongitudesShown) / 2
		);

		for (let i = 0; i < this.numLatitudes; i++)
		{
			const phi = (i + 1) / (this.numLatitudes + 1) * Math.PI;

			for (let j = 0; j < this.numLongitudesPerLatitude; j++)
			{
				if (j < halfFibersHidden || j >= this.numLongitudesPerLatitude - halfFibersHidden)
				{
					continue;
				}

				const theta = (j + 0.5) / this.numLongitudesPerLatitude * 2 * Math.PI;

				const fiber = this.createFiber(theta, phi);

				this.fibers.push(fiber);
			}
		}

		this.needNewFrame = true;
	}

	async toggleCompression(instant)
	{
		const dummy = { t: 0 };

		const oldCompression = this.compression;
		const newCompression = this.compression === 0 ? 1 : 0;

		const cameraPosMag = Math.sqrt(
			this.cameraPos[0] ** 2
			+ this.cameraPos[1] ** 2
			+ this.cameraPos[2] ** 2
		);

		const scalingFactor = this.compression === 0 ? 1.32 / cameraPosMag : 4 / cameraPosMag;

		const oldCameraPos = [...this.cameraPos];
		const newCameraPos = [
			this.cameraPos[0] * scalingFactor,
			this.cameraPos[1] * scalingFactor,
			this.cameraPos[2] * scalingFactor
		];

		await anime({
			targets: dummy,
			t: 1,
			duration: instant ? 10 : 750,
			easing: "easeOutQuad",
			update: () =>
			{
				this.compression = (1 - dummy.t) * oldCompression + dummy.t * newCompression;

				this.cameraPos = [
					(1 - dummy.t) * oldCameraPos[0] + dummy.t * newCameraPos[0],
					(1 - dummy.t) * oldCameraPos[1] + dummy.t * newCameraPos[1],
					(1 - dummy.t) * oldCameraPos[2] + dummy.t * newCameraPos[2]
				];

				this.distanceFromOrigin = magnitude(this.cameraPos);

				this.createAllFibers();

				this.needNewFrame = true;
			}
		}).finished;
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

		if (this.wilson.worldCenterX < -Math.PI)
		{
			this.wilson.worldCenterX += 2 * Math.PI;
		}

		else if (this.wilson.worldCenterX > Math.PI)
		{
			this.wilson.worldCenterX -= 2 * Math.PI;
		}
		
		this.theta = -this.wilson.worldCenterX;
		this.phi = -this.wilson.worldCenterY;

		this.renderer.render(this.scene, this.camera);

		if (this.needDownload)
		{
			this.needDownload = false;

			this.wilson.canvas.toBlob(blob =>
			{
				const link = document.createElement("a");

				link.download = "the-hopf-fibration.png";

				link.href = window.URL.createObjectURL(blob);

				link.click();

				link.remove();
			});
		}
	}



	changeResolution(resolution = this.imageSize)
	{
		this.imageSize = Math.max(100, resolution);

		if (this.wilson.fullscreen.currentlyFullscreen)
		{
			[this.imageWidth, this.imageHeight] = getEqualPixelFullScreen(this.imageSize);
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
				this.wilson.uniforms.aspectRatioX,
				this.imageWidth / this.imageHeight
			);

			this.wilson.gl.uniform1f(
				this.wilson.uniforms.aspectRatioY,
				1
			);
		}

		else
		{
			this.wilson.gl.uniform1f(
				this.wilson.uniforms.aspectRatioX,
				1
			);

			this.wilson.gl.uniform1f(
				this.wilson.uniforms.aspectRatioY,
				this.imageWidth / this.imageHeight
			);
		}

		this.renderer.setSize(this.imageWidth, this.imageHeight, false);
		this.camera.aspect = this.imageWidth / this.imageHeight;
		this.camera.updateProjectionMatrix();

		this.needNewFrame = true;
	}
}