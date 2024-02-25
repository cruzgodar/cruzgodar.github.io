import { Applet } from "../../../scripts/applets/applet.js";
import { Wilson } from "/scripts/wilson.js";

export class EllipticCurve extends Applet
{
	resolution = 500;

	g2 = -2;
	g3 = 0;

	lastTimestamp = -1;



	constructor({ canvas })
	{
		super(canvas);

		const fragShaderSource = /* glsl */`
			precision highp float;
			
			varying vec2 uv;
			
			uniform float step;
			
			uniform float g2Arg;
			uniform float g3Arg;
			
			const int maxIterations = 200;
			
			
			
			float f(vec2 z)
			{
				return z.y * z.y   -   z.x * z.x * z.x   -   g2Arg * z.x   -   g3Arg;
			}
			
			
			
			void main(void)
			{
				float threshhold = 4.0 * 1000.0;
				
				vec2 z = uv * 4.0;
				
				
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				
				
				
				for (int i = 0; i < maxIterations; i++)
				{
					float score = abs(f(z)) / threshhold;
					
					if (score < 1.0)
					{
						float adjacentScore = (abs(f(z + vec2(step, 0.0))) + abs(f(z - vec2(step, 0.0))) + abs(f(z + vec2(0.0, step))) + abs(f(z - vec2(0.0, step)))) / threshhold;
						
						if (adjacentScore >= 6.0)
						{
							gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
							
							return;
						}
					}
					
					threshhold /= 1.25;
				}
			}
		`;



		const fragShaderSource2 = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float textureStep;
			
			
			
			void main(void)
			{
				//Dilate the pixels to make a thicker line.
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				
				float state = (4.0 * texture2D(uTexture, center).y +
				
					texture2D(uTexture, center + vec2(textureStep, 0.0)).y +
					texture2D(uTexture, center - vec2(textureStep, 0.0)).y +
					texture2D(uTexture, center + vec2(0.0, textureStep)).y +
					texture2D(uTexture, center - vec2(0.0, textureStep)).y +
					
					texture2D(uTexture, center + vec2(textureStep, textureStep)).y +
					texture2D(uTexture, center + vec2(textureStep, -textureStep)).y +
					texture2D(uTexture, center + vec2(-textureStep, textureStep)).y +
					texture2D(uTexture, center + vec2(-textureStep, -textureStep)).y
				) / 2.0;
				
				gl_FragColor = vec4(state, state, state, 1.0);
			}
		`;

		const options =
		{
			renderer: "gpu",

			shader: fragShaderSource,

			canvasWidth: this.resolution,
			canvasHeight: this.resolution,

			worldWidth: 8,
			worldHeight: 8,
			worldCenterX: 0,
			worldCenterY: 0
		};


		this.wilson = new Wilson(canvas, options);

		this.wilson.render.initUniforms(["step", "g2Arg", "g3Arg"]);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["step"],
			this.wilson.worldWidth / this.resolution
		);

		this.wilson.render.loadNewShader(fragShaderSource2);

		this.wilson.render.initUniforms(["textureStep"]);

		this.wilson.gl.uniform1f(this.wilson.uniforms["textureStep"], 1 / this.resolution);

		this.wilson.render.createFramebufferTexturePair();

		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, null);



		window.requestAnimationFrame(this.drawFrame.bind(this));
	}



	run({ g2, g3 })
	{
		this.g2 = g2;
		this.g3 = g3;

		window.requestAnimationFrame(this.drawFrame.bind(this));
	}



	drawFrame(timestamp)
	{
		const timeElapsed = timestamp - this.lastTimestamp;

		this.lastTimestamp = timestamp;



		if (timeElapsed === 0)
		{
			return;
		}



		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]);

		this.wilson.gl.uniform1f(this.wilson.uniforms["g2Arg"], this.g2);

		this.wilson.gl.uniform1f(this.wilson.uniforms["g3Arg"], this.g3);

		this.wilson.render.drawFrame();



		const pixels = this.wilson.render.getPixelData();

		const endpoints = [];

		const width = this.resolution;

		const maxInterpolationDistance = this.wilson.canvasWidth;

		// This means a 5x5 square will be searched around each endpoint...
		const isolationSearchRadius = 2;

		for (
			let i = isolationSearchRadius;
			i < this.wilson.canvasHeight - isolationSearchRadius;
			i++
		) {
			for (let j = isolationSearchRadius; j < width - isolationSearchRadius; j++)
			{
				const index = width * i + j;

				if (pixels[4 * index] !== 0)
				{
					// This is the sum of a radius 3 square centered at this pixel.
					const closeTotal =
						pixels[4 * (index - 1)]
						+ pixels[4 * (index + 1)]
						+ pixels[4 * (index - width)]
						+ pixels[4 * (index + width)]
						+ pixels[4 * (index - 1 - width)]
						+ pixels[4 * (index + 1 - width)]
						+ pixels[4 * (index - 1 + width)]
						+ pixels[4 * (index + 1 + width)];

					if (closeTotal <= 255)
					{
						const farTotal =
							pixels[4 * (index - 2 * width - 2)]
							+ pixels[4 * (index - 2 * width - 1)]
							+ pixels[4 * (index - 2 * width)]
							+ pixels[4 * (index - 2 * width + 1)]
							+ pixels[4 * (index - 2 * width + 2)]
							+ pixels[4 * (index + 2 * width - 2)]
							+ pixels[4 * (index + 2 * width - 1)]
							+ pixels[4 * (index + 2 * width)]
							+ pixels[4 * (index + 2 * width + 1)]
							+ pixels[4 * (index + 2 * width + 2)]
							+ pixels[4 * (index - width - 2)]
							+ pixels[4 * (index - 2)]
							+ pixels[4 * (index + width - 2)]
							+ pixels[4 * (index - width + 2)]
							+ pixels[4 * (index + 2)]
							+ pixels[4 * (index + width + 2)];

						// This is an endpoint. Now we'll check to see if it's isolated,
						// which means it's connected to only at most two other pixels.
						if (farTotal === 0)
						{
							endpoints.push([i, j, true]);
						}

						else
						{
							endpoints.push([i, j, false]);
						}
					}
				}
			}
		}



		// Connect every endpoint to the nearest other endpoint within a given radius.
		for (let i = 0; i < endpoints.length; i++)
		{
			if (
				endpoints[i][0] < this.wilson.canvasWidth / 20
				|| endpoints[i][1] < this.wilson.canvasHeight / 20
				|| endpoints[i][0] > 19 * this.wilson.canvasWidth / 20
				|| endpoints[i][1] > 19 * this.wilson.canvasHeight / 20
			) {
				continue;
			}

			let minOpenJ = -1;
			let minOpenDistance = maxInterpolationDistance;

			if ( !(endpoints[i][2]) )
			{
				minOpenDistance = maxInterpolationDistance / 20;
			}



			for (let j = 0; j < endpoints.length; j++)
			{
				if (j === i)
				{
					continue;
				}



				const distance = Math.sqrt(
					(endpoints[i][0] - endpoints[j][0])
						* (endpoints[i][0] - endpoints[j][0])
					+ (endpoints[i][1] - endpoints[j][1])
						* (endpoints[i][1] - endpoints[j][1])
				);

				if (distance < minOpenDistance && distance >= 2)
				{
					// Only connect here if there are no white points in that general direction.
					// General direction here means a 3x3 square centered at the shifted coordinate
					// that doesn't intersect the endpoint itself.
					let rowMovement = (endpoints[j][0] - endpoints[i][0]) / distance * 1.414214;
					let colMovement = (endpoints[j][1] - endpoints[i][1]) / distance * 1.414214;

					rowMovement = Math.sign(rowMovement) * Math.floor(Math.abs(rowMovement));
					colMovement = Math.sign(colMovement) * Math.floor(Math.abs(colMovement));



					let test = 0;

					if (rowMovement === 0)
					{
						let index = width * (endpoints[i][0] + rowMovement)
							+ (endpoints[i][1] + colMovement);
						test += pixels[4 * index];

						index = width * (endpoints[i][0] + rowMovement + 1)
							+ (endpoints[i][1] + colMovement);
						test += pixels[4 * index];

						index = width * (endpoints[i][0] + rowMovement - 1)
							+ (endpoints[i][1] + colMovement);
						test += pixels[4 * index];
					}

					else if (colMovement === 0)
					{
						let index = width * (endpoints[i][0] + rowMovement)
							+ (endpoints[i][1] + colMovement);
						test += pixels[4 * index];

						index = width * (endpoints[i][0] + rowMovement)
							+ (endpoints[i][1] + colMovement + 1);
						test += pixels[4 * index];

						index = width * (endpoints[i][0] + rowMovement)
							+ (endpoints[i][1] + colMovement - 1);
						test += pixels[4 * index];
					}

					else
					{
						let index = width * (endpoints[i][0] + rowMovement)
							+ (endpoints[i][1] + colMovement);
						test += pixels[4 * index];

						index = width * (endpoints[i][0]) + (endpoints[i][1] + colMovement);
						test += pixels[4 * index];

						index = width * (endpoints[i][0] + rowMovement) + (endpoints[i][1]);
						test += pixels[4 * index];
					}



					if (test === 0)
					{
						minOpenJ = j;
						minOpenDistance = distance;
					}
				}
			}

			if (minOpenJ !== -1)
			{
				// Interpolate between the two points.
				for (let k = 1; k < 2 * minOpenDistance; k++)
				{
					const t = k / (2 * minOpenDistance);

					const row = Math.round((1 - t) * endpoints[i][0] + t * endpoints[minOpenJ][0]);
					const col = Math.round((1 - t) * endpoints[i][1] + t * endpoints[minOpenJ][1]);

					const index = width * row + col;

					pixels[4 * index] = 0;
					pixels[4 * index + 1] = 255;
					pixels[4 * index + 2] = 0;
				}
			}
		}



		this.wilson.gl.texImage2D(
			this.wilson.gl.TEXTURE_2D,
			0,
			this.wilson.gl.RGBA,
			this.wilson.canvasWidth,
			this.wilson.canvasHeight,
			0,
			this.wilson.gl.RGBA,
			this.wilson.gl.UNSIGNED_BYTE,
			pixels
		);

		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]);

		this.wilson.render.drawFrame(pixels);
	}



	changeResolution(resolution)
	{
		this.resolution = resolution;

		this.wilson.changeCanvasSize(this.resolution, this.resolution);

		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["step"],
			this.wilson.worldWidth / this.resolution
		);

		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]);

		this.wilson.gl.uniform1f(this.wilson.uniforms["textureStep"], 1 / this.resolution);

		window.requestAnimationFrame(this.drawFrame.bind(this));
	}
}