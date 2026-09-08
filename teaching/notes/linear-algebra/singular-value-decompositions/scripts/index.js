import { eigendata, numPixels, numVectors, uAlphas } from "./data.js";
import { VSingularValues, VU, VW } from "./vData.js";
import { Slider } from "/scripts/components/sliders.js";
import { $ } from "/scripts/src/main.js";
import { WilsonCPU } from "/scripts/wilson.js";

export default async function()
{
	initValueWilson();

	await initEigenfaces();



	function initValueWilson()
	{
		const options = {
			canvasWidth: 400,

			verbose: window.DEBUG,
		};
		
		const wilson = new WilsonCPU($("#v-canvas"), options);

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

			wilson.drawFrame(imageData);
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

	async function initEigenfaces()
	{
		const numCols = numVectors;

		const options = {
			canvasWidth: 100,

			verbose: window.DEBUG,
		};
		
		const wilson = new WilsonCPU($("#eigenface-canvas"), options);

		const dataLength = wilson.canvasHeight * wilson.canvasWidth * 4;
		const rgbLength = numPixels * 3;

		// data.bin holds every eigenvector's RGB channels back to back as a flat
		// Float32Array; their constant alpha channels live in data.js.
		const response = await fetch(new URL("./data.bin", import.meta.url));
		const rgbData = new Float32Array(await response.arrayBuffer());

		const uVectors = new Array(numCols);

		for (let i = 0; i < numCols; i++)
		{
			uVectors[i] = rgbData.subarray(i * rgbLength, (i + 1) * rgbLength);
		}

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
	
				const uVector = new Array(rgbLength);
	
				for (let i = 0; i < rgbLength; i++)
				{
					uVector[i] = (1 - t) * uVectorFloor[i] + t * uVectorCeil[i];
				}
	
				drawEigenface(uVector);
	
				return;
			}
			
			drawTruncatedEigenface(indexSlider.value, depthSlider.value);
		}

		setTimeout(() => onSliderInput(), 100);
		
		// Takes a vector of RGB triples and draws it as an opaque RGBA image.
		function drawEigenface(vec)
		{
			let maxValue = 0;
			let minValue = 0;

			for (let i = 0; i < rgbLength; i++)
			{
				maxValue = Math.max(maxValue, vec[i]);
				minValue = Math.min(minValue, vec[i]);
			}

			const imageData = new Uint8ClampedArray(dataLength);

			for (let i = 0; i < numPixels; i++)
			{
				const index = 4 * i;

				imageData[index] = (vec[3 * i] - minValue) / (maxValue - minValue) * 255;
				imageData[index + 1] = (vec[3 * i + 1] - minValue) / (maxValue - minValue) * 255;
				imageData[index + 2] = (vec[3 * i + 2] - minValue) / (maxValue - minValue) * 255;
				imageData[index + 3] = 255;
			}

			wilson.drawFrame(imageData);
		}

		for (let i = 0; i < numCols; i++)
		{
			let totalSum = 0;

			for (let j = 0; j < rgbLength; j++)
			{
				totalSum += uVectors[i][j] * uVectors[i][j];
			}

			// The alpha channel is constant within each eigenvector and never
			// drawn, but it still contributes to the vector's magnitude.
			totalSum += numPixels * uAlphas[i] * uAlphas[i];

			uMagnitudes[i] = Math.sqrt(totalSum);
		}

		function drawTruncatedEigenface(index, depth = numCols)
		{
			const vec = new Array(rgbLength);

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

			for (let i = 0; i < rgbLength; i++)
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