
import { Applet, getMinGlslString, getVectorGlsl } from "/scripts/src/applets.js";
import { Wilson } from "/scripts/wilson.js";

export class VoronoiDiagram extends Applet
{
	lastTimestamp = -1;

	numPoints = 20;
	metric = 2;
	resolution = 1000;

	pointRadius;

	points;

	constructor({ canvas })
	{
		super(canvas);

		const fragShaderSource = /* glsl */`
			precision highp float;
			
			varying vec2 uv;
			
			void main(void)
			{
				gl_FragColor = vec4(0, 0, 0, 1);
			}
		`;

		const options =
		{
			renderer: "gpu",

			shader: fragShaderSource,

			canvasWidth: this.resolution,
			canvasHeight: this.resolution,

			useFullscreen: true,

			useFullscreenButton: true,

			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
		};

		this.wilson = new Wilson(this.canvas, options);
	}



	run({
		resolution = 500,
		numPoints = 20,
		metric = 2
	}) {
		this.resolution = resolution;
		this.numPoints = numPoints;
		this.metric = metric;

		this.wilson.changeCanvasSize(this.resolution, this.resolution);

		this.generatePoints();

		const metricGlsl = (() =>
		{
			if (this.metric === 1)
			{
				return /* glsl */`
					abs(p.x - q.x) + abs(p.y - q.y)
				`;
			}

			else if (this.metric === 2)
			{
				return /* glsl */`
					distance(p, q)
				`;
			}

			else
			{
				return /* glsl */`
					max(abs(p.x - q.x), abs(p.y - q.y))
				`;
			}
		})();

		const fragShaderSource = /* glsl */`
			precision highp float;
			
			varying vec2 uv;

			const float pointRadius = 0.01;
			const float blurRatio = 0.5;

	${this.points.map((point, index) =>
	{
		return /* glsl */`
			const vec2 point${index} = ${getVectorGlsl(point)};
		`;
	}).join("")}
			
			float metricDistance(vec2 p, vec2 q)
			{
				return ${metricGlsl};
			}

			float getMinDistanceToPoints(vec2 p)
			{
	${this.points.map((point, index) =>
	{
		return /* glsl */`
			float distance${index + 1} = metricDistance(p, point${index});
		`;
	}).join("")}

				return ${getMinGlslString("distance", this.numPoints)};
			}

			void main(void)
			{
				float minDistance = getMinDistanceToPoints(uv);

				if (minDistance < pointRadius)
				{
					gl_FragColor = vec4(1, 1, 1, 1);
					return;
				}

				if (minDistance < (1.0 + blurRatio) * pointRadius)
				{
					float t = 1.0 - (minDistance - pointRadius) / (blurRatio * pointRadius);

					gl_FragColor = vec4(t, t, t, 1);
					return;
				}

				gl_FragColor = vec4(0, 0, 0, 1);
			}
		`;

		this.wilson.render.shaderPrograms = [];
		this.wilson.render.loadNewShader(fragShaderSource);
		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]);



		window.requestAnimationFrame(this.drawFrame.bind(this));
	}

	generatePoints()
	{
		this.points = new Array(this.numPoints);

		for (let i = 0; i < this.numPoints; i++)
		{
			this.points[i] = [
				0.8 * (Math.random() - 0.5) * this.wilson.worldWidth,
				0.8 * (Math.random() - 0.5) * this.wilson.worldHeight,
			];
		}

		// Balance the points by repelling nearby ones.
		const forces = new Array(this.numPoints);
		const forceFactor = 0.1 / this.numPoints;

		for (let i = 0; i < this.numPoints; i++)
		{
			forces[i] = [0, 0];

			for (let j = 0; j < this.numPoints; j++)
			{
				if (j === i)
				{
					continue;
				}

				const distance2 =
					(this.points[j][0] - this.points[i][0]) ** 2
					+ (this.points[j][1] - this.points[i][1]) ** 2;
				
				forces[i][0] += (this.points[i][0] - this.points[j][0]) / distance2;
				forces[i][1] += (this.points[i][1] - this.points[j][1]) / distance2;
			}
		}

		for (let i = 0; i < this.numPoints; i++)
		{
			this.points[i][0] += forceFactor * forces[i][0];
			this.points[i][1] += forceFactor * forces[i][1];

			this.points[i][0] = Math.min(
				Math.max(
					this.points[i][0],
					-this.wilson.worldWidth / 2
				),
				this.wilson.worldWidth / 2
			);

			this.points[i][1] = Math.min(
				Math.max(
					this.points[i][1],
					-this.wilson.worldHeight / 2
				),
				this.wilson.worldHeight / 2
			);
		}
	}



	drawFrame(timestamp)
	{
		const timeElapsed = timestamp - this.lastTimestamp;

		this.lastTimestamp = timestamp;

		if (timeElapsed === 0)
		{
			return;
		}

		this.wilson.render.drawFrame();



		if (!this.animationPaused)
		{
			window.requestAnimationFrame(this.drawFrame.bind(this));
		}
	}
}