import { VSingularValues, VU, VW } from "./vData.js";
import { showPage } from "/scripts/src/loadPage.js";
import { $ } from "/scripts/src/main.js";
import { Slider } from "/scripts/src/sliders.js";
import { Wilson } from "/scripts/wilson.js";

export async function load()
{
	initValueWilson();

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
}