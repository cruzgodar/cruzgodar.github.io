import anime from "/scripts/anime.js";
import { Applet } from "/scripts/applets/applet.js";
import { RaymarchApplet } from "/scripts/applets/raymarchApplet.js";
import { addTemporaryListener } from "/scripts/src/main.js";
import { Wilson } from "/scripts/wilson.js";

export class RaymarchingFundamentals extends RaymarchApplet
{
	cameraPos = [1, 1, 1];
	theta = 1.25 * Math.PI;
	phi = Math.PI / 2;
	lockZ = 1;

	objectRotation = 0;
	objectFloat = 0;



	constructor({ canvas, fragShaderSource, uniforms })
	{
		super(canvas);

		const options =
		{
			renderer: "gpu",

			shader: fragShaderSource,

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

		this.wilson.render.initUniforms([
			"aspectRatioX",
			"aspectRatioY",
			"imageSize",
			"cameraPos",
			"imagePlaneCenterPos",
			"forwardVec",
			"rightVec",
			"upVec",
			"distanceToScene",
			"objectRotation",
			"objectFloat",
			...uniforms
		]);

		

		this.calculateVectors();
		
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
		
		this.wilson.gl.uniform1i(
			this.wilson.uniforms.imageSize,
			this.imageSize
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms.cameraPos,
			this.cameraPos
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms.imagePlaneCenterPos,
			this.imagePlaneCenterPos
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms.forwardVec,
			this.forwardVec
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms.rightVec,
			this.rightVec
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms.upVec,
			this.upVec
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.distanceToScene,
			this.distanceToScene
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.objectRotation,
			this.objectRotation
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.objectFloat,
			this.objectFloat
		);



		const boundFunction = () => this.changeResolution();
		addTemporaryListener({
			object: window,
			event: "resize",
			callback: boundFunction
		});



		this.resume();
	}

	updateRotationAndFloat()
	{
		this.objectRotation += .003;
		this.wilson.gl.uniform1f(this.wilson.uniforms.objectRotation, this.objectRotation);

		this.objectFloat = .1 * Math.sin(3 * this.objectRotation);
		this.wilson.gl.uniform1f(this.wilson.uniforms.objectFloat, this.objectFloat);

		this.needNewFrame = true;
	}

	prepareFrame(timeElapsed)
	{
		this.pan.update(timeElapsed);
		this.zoom.update(timeElapsed);
		this.moveUpdate(timeElapsed);
		this.updateRotationAndFloat();
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

		this.wilson.render.drawFrame();
	}



	distanceEstimator()
	{
		return 1;
	}



	changeResolution(resolution = this.imageSize)
	{
		this.imageSize = Math.max(100, resolution);

		if (this.wilson.fullscreen.currentlyFullscreen)
		{
			[this.imageWidth, this.imageHeight] = Applet.getEqualPixelFullScreen(this.imageSize);
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

		this.wilson.gl.uniform1i(this.wilson.uniforms.imageSize, this.imageSize);



		this.needNewFrame = true;
	}

	animateUniform({
		name,
		oldValue = this[name],
		value,
		duration = 250
	}) {
		const dummy = { t: oldValue };

		return anime({
			targets: dummy,
			t: value,
			duration,
			easing: "easeInOutQuart",
			update: () =>
			{
				this[name] = dummy.t;
				this.wilson.gl.uniform1f(this.wilson.uniforms[name], this[name]);
				this.needNewFrame = true;
			}
		}).finished;
	}

	loopUniform({
		name,
		startValue,
		endValue,
		duration = 2000
	}) {
		const dummy = { t: 0 };

		return anime({
			targets: dummy,
			t: 1,
			duration,
			easing: "easeInOutQuad",
			loop: true,
			direction: "alternate",
			update: () =>
			{
				const uniformValue = startValue + (endValue - startValue) * dummy.t;
				this.wilson.gl.uniform1f(this.wilson.uniforms[name], uniformValue);
				this.needNewFrame = true;
			}
		});
	}
}