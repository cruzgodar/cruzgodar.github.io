import { A, eigendata, uVectors } from "./data.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { showPage } from "/scripts/src/loadPage.js";
import { $ } from "/scripts/src/main.js";
import { Slider } from "/scripts/src/sliders.js";
import { Wilson } from "/scripts/wilson.js";

export async function load()
{
	const options = {
		renderer: "cpu",
	
		canvasWidth: 162,
		canvasHeight: 200
	};
	
	const wilson = new Wilson($("#output-canvas"), options);

	const dataLength = wilson.canvasHeight * wilson.canvasWidth * 4;

	const uMagnitudes = new Array(21);

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
		integer: true,
		onInput: onSliderInput
	});

	const depthSlider = new Slider({
		element: $("#depth-slider"),
		name: "Depth",
		value: 1,
		min: 1,
		max: 21,
		integer: true,
		onInput: onSliderInput
	});

	showPage();

	function onSliderInput()
	{
		if (eigenfaceCheckbox.checked)
		{
			drawEigenface(uVectors[indexSlider.value]);
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
			// All the eigenvectors have length 21 as output by sage.
			svdCoefficients[i] = Math.sqrt(eigendata[i][0]) * eigendata[i][1][index] / 21;
		}

		// The coefficients are the roots of the eigenvalues times
		// the entries of the eigenvectors.

		for (let i = 0; i < dataLength; i++)
		{
			vec[i] = 0;

			for (let j = 0; j < depth; j++)
			{
				vec[i] += svdCoefficients[j] * uVectors[j][i] / uMagnitudes[j];
			}
		}

		drawEigenface(vec);
	}
}