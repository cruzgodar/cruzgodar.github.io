import { Applet } from "/scripts/applets/applet.js";
import { loadScript } from "/scripts/src/main.js";
import { WilsonCPU } from "/scripts/wilson.js";

/*
export default function()
{
	const numImages = 8;
	const imageWidth = 500;
	const imageHeight = 500;

	const options = {
		renderer: "cpu",
	
		canvasWidth: imageWidth,
		canvasHeight: imageHeight
	};
	
	const wilson = new Wilson($("#output-canvas"), options);

	const dataLength = wilson.canvasHeight * wilson.canvasWidth * 4;

	const uMagnitudes = new Array(numImages);

	new DownloadButton({
		element: $("#download-button"),
		wilson,
		filename: "eigenface.png"
	});

	const eigenfaceCheckbox = new Checkbox({
		element: $("#eigenface-checkbox"),
		name: "Show eigenface",
		onInput: onSliderInput
	});
	
	const indexSlider = new Slider({
		element: $("#index-slider"),
		name: "Face",
		value: 0,
		min: 0,
		max: 20,
		onInput: onSliderInput
	});

	const depthSlider = new Slider({
		element: $("#depth-slider"),
		name: "Depth",
		value: 1,
		min: 1,
		max: 21,
		onInput: onSliderInput
	});

	showPage();

	function onSliderInput()
	{
		if (eigenfaceCheckbox.checked)
		{
			const uVectorFloor = uVectors[Math.floor(indexSlider.value)];
			const uVectorCeil = uVectors[Math.ceil(indexSlider.value)];
			const t = indexSlider.value - Math.floor(indexSlider.value);

			const uVector = new Array(dataLength);

			for (let i = 0; i < dataLength; i++)
			{
				uVector[i] = (1 - t) * uVectorFloor[i] + t * uVectorCeil[i];
			}

			drawEigenface(uVector);

			return;
		}

		drawTruncatedEigenface(indexSlider.value, depthSlider.value);
	}

	setTimeout(() => onSliderInput(), 100);
	
	// eslint-disable-next-line no-unused-vars
	async function parseImage(index)
	{
		return new Promise(resolve =>
		{
			const data = [];

			const img = new Image(wilson.canvasWidth, wilson.canvasHeight);
		
			img.onload = () =>
			{
				wilson.ctx.drawImage(img, 0, 0);

				data.push(
					Array.from(
						wilson.ctx.getImageData(0, 0, wilson.canvasWidth, wilson.canvasHeight).data
					)
				);

				resolve();
			};

			img.src = `images/${index}.jpeg`;
		});
	}

	// eslint-disable-next-line no-unused-vars
	function computeATA()
	{
		const output = new Array(21);

		for (let i = 0; i < 21; i++)
		{
			output[i] = new Array(21);

			for (let j = 0; j < 21; j++)
			{
				let total = 0;

				for (let k = 0; k < dataLength; k++)
				{
					total += A[i][k] * A[j][k];
				}

				output[i][j] = total;
			}
		}

		console.log(output);
	}

	// eslint-disable-next-line no-unused-vars
	function computeUVectors()
	{
		const outputs = [];

		for (let i = 0; i < 21; i++)
		{
			const v = eigendata[i][1];

			outputs[i] = new Array(dataLength);

			for (let j = 0; j < dataLength; j++)
			{
				outputs[i][j] = 0;

				for (let k = 0; k < 21; k++)
				{
					outputs[i][j] += A[k][j] * v[k];
				}
			}
		}

		console.log(outputs);
	}

	function drawEigenface(vec)
	{
		const u = [...vec];

		let maxValue = 0;
		let minValue = 0;

		for (let i = 0; i < u.length; i += 4)
		{
			maxValue = Math.max(maxValue, u[i]);
			maxValue = Math.max(maxValue, u[i + 1]);
			maxValue = Math.max(maxValue, u[i + 2]);

			minValue = Math.min(minValue, u[i]);
			minValue = Math.min(minValue, u[i + 1]);
			minValue = Math.min(minValue, u[i + 2]);
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
			wilson.canvasWidth,
			wilson.canvasHeight
		);

		wilson.ctx.putImageData(imageData, 0, 0);
	}

	for (let i = 0; i < 21; i++)
	{
		let totalSum = 0;

		for (let j = 0; j < dataLength; j++)
		{
			totalSum += uVectors[i][j] * uVectors[i][j];
		}

		uMagnitudes[i] = Math.sqrt(totalSum);
	}

	function drawTruncatedEigenface(index, depth = 21)
	{
		const vec = new Array(dataLength);

		const svdCoefficients = new Array(21);

		for (let i = 0; i < 21; i++)
		{
			const floor = Math.floor(index);

			// All the eigenvectors have length 21 as output by sage.
			svdCoefficients[i] = (1 - (index - floor))
				* Math.sqrt(eigendata[i][0])
				* eigendata[i][1][floor] / 21;

			if (index < 20)
			{
				svdCoefficients[i] += (index - floor)
					* Math.sqrt(eigendata[i][0])
					* eigendata[i][1][floor + 1] / 21;
			}
		}

		// The coefficients are the roots of the eigenvalues times
		// the entries of the eigenvectors.

		for (let i = 0; i < dataLength; i++)
		{
			vec[i] = 0;

			for (let j = 0; j < Math.floor(depth); j++)
			{
				vec[i] += svdCoefficients[j] * uVectors[j][i] / uMagnitudes[j];
			}

			// If depth is a float, we partially add the last bit.
			if (depth < 20)
			{
				const j = Math.floor(depth);
				vec[i] += (depth - j) * svdCoefficients[j] * uVectors[j][i] / uMagnitudes[j];
			}
		}

		drawEigenface(vec);
	}
}
*/

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

		// this.uMagnitudes = new Array(this.numImages);

		// for (let i = 0; i < this.numImages; i++)
		// {
		// 	let totalSum = 0;

		// 	for (let j = 0; j < this.dataLength; j++)
		// 	{
		// 		totalSum += this.U[i][j] * this.U[i][j];
		// 	}

		// 	this.uMagnitudes[i] = Math.sqrt(totalSum);
		// }



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

		console.log(this.U, this.S, this.V);

		const vec = new Array(this.dataLength).fill(0);
		const floorDepth = Math.floor(depth);

		for (let i = 0; i < floorDepth; i++)
		{
			const singularValue = this.S[i];

			for (let j = 0; j < this.dataLength; j++)
			{
				vec[j] += singularValue
					* this.U[i][j]
					* this.V[i][floorIndex]
					* (1 - (index - floorIndex));
			}

			console.log(i, floorIndex,this.V[i][floorIndex]);
		}
		

		if (floorDepth < depth)
		{
			const i = floorDepth;

			const singularValue = this.S[i];

			for (let j = 0; j < this.dataLength; j++)
			{
				vec[j] += singularValue
					* this.U[i][j]
					* this.V[i][floorIndex]
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
						* this.V[i][ceilIndex]
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
						* this.V[i][ceilIndex]
						* (depth - floorDepth)
						* (1 - (ceilIndex - index));
				}
			}
		}

		

		this.drawNormalizedImage(vec);
	}
}