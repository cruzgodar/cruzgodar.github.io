import { eigendata, uVectors } from "./data.js";
import { VSingularValues, VU, VW } from "./vData.js";
import { showPage } from "/scripts/src/loadPage.js";
import { $ } from "/scripts/src/main.js";
import { Slider } from "/scripts/src/sliders.js";
import { Wilson } from "/scripts/wilson.js";

export default function()
{
	initValueWilson();

	initEigenfaces();

	showPage();



	function initValueWilson()
	{
		const options = {
			renderer: "cpu",
		
			canvasWidth: 400,
			canvasHeight: 300
		};
		
		const wilson = new Wilson($("#v-canvas"), options);

		const image = new Array(wilson.canvasHeight);

		for (let i = 0; i < wilson.canvasHeight; i++)
		{
			image[i] = new Array(wilson.canvasWidth);
		}

		const depthSlider = new Slider({
			element: $("#depth-slider"),
			name: "Depth",
			value: 100,
			min: 1,
			max: 200,
			integer: true,
			logarithmic: true,
			onInput: onSliderInput
		});

		function onSliderInput()
		{
			drawTruncatedImage(depthSlider.value);
		}

		function drawImageFromArray(image)
		{
			const imageData = new Uint8ClampedArray(wilson.canvasWidth * wilson.canvasHeight * 4);

			for (let i = 0; i < wilson.canvasHeight; i++)
			{
				for (let j = 0; j < wilson.canvasWidth; j++)
				{
					const index = 4 * (wilson.canvasWidth * i + j);

					imageData[index] = image[i][j];
					imageData[index + 1] = image[i][j];
					imageData[index + 2] = image[i][j];
					imageData[index + 3] = 255;
				}
			}

			wilson.ctx.putImageData(
				new ImageData(imageData, wilson.canvasWidth, wilson.canvasHeight),
				0,
				0
			);
		}

		function drawTruncatedImage(depth = 200)
		{
			for (let i = 0; i < wilson.canvasHeight; i++)
			{
				for (let j = 0; j < wilson.canvasWidth; j++)
				{
					image[i][j] = 0;

					for (let term = 0; term < depth; term++)
					{
						image[i][j] += VSingularValues[term] * VU[i][term] * VW[j][term];
					}
				}
			}

			drawImageFromArray(image);
		}

		drawTruncatedImage();
	}

	function initEigenfaces()
	{
		const numCols = 44;

		const options = {
			renderer: "cpu",
		
			canvasWidth: 100,
			canvasHeight: 100
		};
		
		const wilson = new Wilson($("#eigenface-canvas"), options);

		const dataLength = wilson.canvasHeight * wilson.canvasWidth * 4;

		const uMagnitudes = new Array(numCols);
		
		const indexSlider = new Slider({
			element: $("#index-slider"),
			name: "Face",
			value: 0,
			min: 0,
			max: numCols - 1,
			onInput: onSliderInput
		});

		const depthSlider = new Slider({
			element: $("#depth-2-slider"),
			name: "Depth",
			value: 1,
			min: 1,
			max: numCols,
			onInput: onSliderInput
		});

		const drawEigenfaces = false;

		function onSliderInput()
		{
			if (drawEigenfaces)
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

		for (let i = 0; i < numCols; i++)
		{
			let totalSum = 0;

			for (let j = 0; j < dataLength; j++)
			{
				totalSum += uVectors[i][j] * uVectors[i][j];
			}

			uMagnitudes[i] = Math.sqrt(totalSum);
		}

		function drawTruncatedEigenface(index, depth = numCols)
		{
			const vec = new Array(dataLength);

			const svdCoefficients = new Array(numCols);

			const floor = Math.floor(index);

			for (let i = 0; i < numCols; i++)
			{
				// All the eigenvectors have length numCols as output by sage.
				svdCoefficients[i] = (1 - (index - floor))
					* Math.sqrt(eigendata[i][0])
					* eigendata[i][1][floor] / numCols;
				
				if (index < numCols - 1)
				{
					svdCoefficients[i] += (index - floor)
						* Math.sqrt(eigendata[i][0])
						* eigendata[i][1][floor + 1] / numCols;
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
				if (depth < numCols - 1)
				{
					const j = Math.floor(depth);
					vec[i] += (depth - j) * svdCoefficients[j] * uVectors[j][i] / uMagnitudes[j];
				}
			}

			drawEigenface(vec);
		}
	}
}