import { Applet } from "/scripts/applets/applet.js";
import { loadScript } from "/scripts/src/main.js";
import { WilsonCPU } from "/scripts/wilson.js";

export class SingularValueDecompositions extends Applet
{
	numImages;
	imageData = [];
	dataLength;
	U;
	S;
	V;
	uMagnitudes;
	loadPromise;

	constructor({ canvas })
	{
		super(canvas);

		const options = {
			renderer: "cpu",

			canvasWidth: 500,
		};

		this.wilson = new WilsonCPU(canvas, options);

		this.loadPromise = loadScript("/scripts/numeric.min.js");
	}



	async run({ files })
	{
		await this.loadPromise;

		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		this.imageData = [];

		let width = 0;
		let height = 0;

		for (const file of files)
		{
			await new Promise(resolve =>
			{
				const reader = new FileReader();
				
				reader.onload = (e) =>
				{
					const img = new Image();

					img.onload = () =>
					{
						width = Math.max(width, img.width);
						height = Math.max(height, img.height);

						resolve();
					};

					img.src = e.target.result;
				};

				reader.readAsDataURL(file);
			});
		}

		canvas.width = width;
		canvas.height = height;

		for (const file of files)
		{
			await new Promise(resolve =>
			{
				const reader = new FileReader();
				
				reader.onload = (e) =>
				{
					const img = new Image();

					img.onload = () =>
					{
						ctx.clearRect(0, 0, width, height);

						ctx.drawImage(
							img,
							(width - img.width) / 2,
							(height - img.height) / 2,
						);

						const imageData = ctx.getImageData(0, 0, width, height);

						this.imageData.push(imageData.data);

						resolve();
					};

					img.src = e.target.result;
				};

				reader.readAsDataURL(file);
			});
		}

		this.dataLength = width * height * 4;
		this.numImages = files.length;



		// eslint-disable-next-line no-undef
		const { U, S, V } = numeric.svd(numeric.transpose(this.imageData));
		// eslint-disable-next-line no-undef
		this.U = numeric.transpose(U);
		this.S = S;
		this.V = V;



		this.wilson.canvas.style.aspectRatio = `${width} / ${height}`;
		this.wilson.resizeCanvas({ width });

		this.drawTruncatedEigenimage(0, 1);
	}

	drawNormalizedImage(uVec)
	{
		const u = [...uVec];

		let maxValue = 0;
		let minValue = 0;

		for (let i = 0; i < u.length; i += 4)
		{
			maxValue = Math.max(maxValue, u[i], u[i + 1], u[i + 2]);
			minValue = Math.min(minValue, u[i], u[i + 1], u[i + 2]);
		}

		for (let i = 0; i < u.length; i += 4)
		{
			u[i] = (u[i] - minValue) / (maxValue - minValue) * 255;
			u[i + 1] = (u[i + 1] - minValue) / (maxValue - minValue) * 255;
			u[i + 2] = (u[i + 2] - minValue) / (maxValue - minValue) * 255;
			u[i + 3] = 255;
		}

		const imageData = new ImageData(
			new Uint8ClampedArray(u),
			this.wilson.canvasWidth,
			this.wilson.canvasHeight
		);

		this.wilson.ctx.putImageData(imageData, 0, 0);
	}

	drawTruncatedEigenimage(index, depth = this.numImages)
	{
		const floorIndex = Math.floor(index);
		const ceilIndex = Math.ceil(index);

		const vec = new Array(this.dataLength).fill(0);
		const floorDepth = Math.floor(depth);

		for (let i = 0; i < floorDepth; i++)
		{
			const singularValue = this.S[i];

			for (let j = 0; j < this.dataLength; j++)
			{
				vec[j] += singularValue
					* this.U[i][j]
					* this.V[floorIndex][i]
					* (1 - (index - floorIndex));
			}
		}
		

		if (floorDepth < depth)
		{
			const i = floorDepth;

			const singularValue = this.S[i];

			for (let j = 0; j < this.dataLength; j++)
			{
				vec[j] += singularValue
					* this.U[i][j]
					* this.V[floorIndex][i]
					* (depth - floorDepth)
					* (1 - (index - floorIndex));
			}
		}

		

		if (floorIndex !== ceilIndex)
		{
			for (let i = 0; i < floorDepth; i++)
			{
				const singularValue = this.S[i];

				for (let j = 0; j < this.dataLength; j++)
				{
					vec[j] += singularValue
						* this.U[i][j]
						* this.V[ceilIndex][i]
						* (1 - (ceilIndex - index));
				}
			}

			if (floorDepth < depth)
			{
				const i = floorDepth;

				const singularValue = this.S[i];

				for (let j = 0; j < this.dataLength; j++)
				{
					vec[j] += singularValue
						* this.U[i][j]
						* this.V[ceilIndex][i]
						* (depth - floorDepth)
						* (1 - (ceilIndex - index));
				}
			}
		}

		

		this.drawNormalizedImage(vec);
	}
}