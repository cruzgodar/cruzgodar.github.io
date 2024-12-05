import { VectorField } from "/applets/vector-fields/scripts/class.js";
import { RaymarchApplet } from "/scripts/applets/raymarchApplet.js";

export class HairyBall extends RaymarchApplet
{
	vectorFieldAppletResolution;
	vectorFieldDilation;
	vectorFieldApplet;

	constructor({
		canvas,
		vectorFieldGeneratingCode = "(x, y)",
		vectorFieldAppletResolution = 500,
		vectorFieldDilation = 1
	}) {
		const distanceEstimatorGlsl = /* glsl */`
			return length(pos) - 1.0;
		`;

		const getColorGlsl = /* glsl */`
			// Convert to spherical coordinates.
			vec3 normalizedPos = normalize(pos);
			float phi = acos(normalizedPos.z);
			float theta = atan(normalizedPos.y, normalizedPos.x) + 3.14159265;
			return texture2D(
				uTexture,
				vec2(theta / 6.28318531, phi / 3.14159265)
					* (float(imageSize) - 1.0) / float(imageSize) 
			).xyz;
		`;

		const addGlsl = /* glsl */`
			uniform sampler2D uTexture;
		`;

		super({
			canvas,
			resolution: 1000,
			distanceEstimatorGlsl,
			getColorGlsl,
			addGlsl,
			theta: Math.PI,
			phi: Math.PI / 2,
			lockedOnOrigin: true,
			cameraPos: [2.25, 0, 0],
			lightBrightness: 0,
			ambientLight: 1.1,
			minEpsilon: .0025,
			useBloom: false,
		});



		this.vectorFieldAppletResolution = vectorFieldAppletResolution;
		this.vectorFieldDilation = vectorFieldDilation;

		const hiddenCanvas = this.createHiddenCanvas();

		// hiddenCanvas.style.display = "block";
		// hiddenCanvas.classList.remove("hidden-canvas");
		// hiddenCanvas.classList.add("output-canvas");
		// pageElement.appendChild(hiddenCanvas);

		this.vectorFieldApplet = new VectorField({
			canvas: hiddenCanvas,
			loopEdges: true,
		});

		this.vectorFieldApplet.drawFrameCallback = this.drawFrame.bind(this);

		this.vectorFieldApplet.loadPromise.then(() =>
		{
			this.runVectorField(vectorFieldGeneratingCode);
		});



		this.wilson.render.createFramebufferTexturePair(this.wilson.gl.UNSIGNED_BYTE);

		this.wilson.gl.texParameteri(
			this.wilson.gl.TEXTURE_2D,
			this.wilson.gl.TEXTURE_MAG_FILTER,
			this.wilson.gl.LINEAR
		);

		this.wilson.gl.texParameteri(
			this.wilson.gl.TEXTURE_2D,
			this.wilson.gl.TEXTURE_MIN_FILTER,
			this.wilson.gl.LINEAR
		);

		this.wilson.gl.bindTexture(
			this.wilson.gl.TEXTURE_2D,
			this.wilson.render.framebuffers[0].texture
		);

		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, null);
	}



	drawFrame()
	{
		const texture = this.vectorFieldApplet.wilson.render.getPixelData();

		this.wilson.gl.texImage2D(
			this.wilson.gl.TEXTURE_2D,
			0,
			this.wilson.gl.RGBA,
			this.vectorFieldApplet.wilson.canvasWidth,
			this.vectorFieldApplet.wilson.canvasHeight,
			0,
			this.wilson.gl.RGBA,
			this.wilson.gl.UNSIGNED_BYTE,
			texture
		);

		this.wilson.worldCenterY = Math.min(
			Math.max(
				this.wilson.worldCenterY,
				-Math.PI + .01
			),
			-.01
		);
		
		this.theta = -this.wilson.worldCenterX;
		this.phi = -this.wilson.worldCenterY;

		this.calculateVectors();

		this.wilson.render.drawFrame();
	}

	runVectorField(generatingCode)
	{
		this.vectorFieldApplet.run({
			generatingCode,
			resolution: this.vectorFieldAppletResolution,
			maxParticles: 10000,
			dt: .003,
			lifetime: 150,
			worldCenterX: 0,
			worldCenterY: 0,
			zoomLevel: .6515,
			particleDilation: this.vectorFieldDilation,
			appendGlsl: /* glsl */`
				vec3 c = vec3(
					cos(x) * cos(y * 0.5),
					sin(x) * cos(y * 0.5),
					sin(y * 0.5)
				);

				x = c.x;
				y = c.y;
				float z = c.z;
			`
		});
	}

	distanceEstimator()
	{
		return 1.55 - 1;
	}
}