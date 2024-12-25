import { VectorFields } from "/applets/vector-fields/scripts/class.js";
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
					* (float(resolution) - 1.0) / float(resolution) 
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

		this.vectorFieldApplet = new VectorFields({
			canvas: hiddenCanvas,
			loopEdges: true,
		});

		this.vectorFieldApplet.drawFrameCallback = () =>
		{
			this.wilson.setTexture({
				id: "draw",
				data: this.vectorFieldApplet.wilson.readPixels()
			});

			this.needNewFrame = true;
		};
		
		this.runVectorField(vectorFieldGeneratingCode);

		this.onResizeCanvas();

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

		this.wilson.onSwitchFullscreen = this.switchFullscreen.bind(this);
		this.wilson.beforeSwitchFullscreen = this.beforeSwitchFullscreen.bind(this);

		this.wilsonForFullscreen = this.wilson;
	}

	runVectorField(generatingCode)
	{
		this.vectorFieldApplet.run({
			generatingCode,
			resolution: this.vectorFieldAppletResolution,
			maxParticles: 10000,
			dt: .003,
			lifetime: 150,
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

		this.wilson.createFramebufferTexturePair({
			id: "draw",
			width: this.vectorFieldAppletResolution,
			height: this.vectorFieldAppletResolution,
			textureType: "unsignedByte"
		});

		this.wilson.useTexture("draw");
		this.wilson.useFramebuffer(null);
	}

	distanceEstimator()
	{
		return 1.55 - 1;
	}

	switchFullscreen()
	{
		this.resume();
	}

	async beforeSwitchFullscreen()
	{
		this.pause();

		await new Promise(resolve => setTimeout(resolve, 16));
	}
}