import { VSingularValues, VU, VW } from "./data.js";
import { showPage } from "/scripts/src/loadPage.js";
import { $ } from "/scripts/src/main.js";
import { Slider } from "/scripts/src/sliders.js";
import { Wilson } from "/scripts/wilson.js";

export async function load()
{
	initValueWilson();

	initCompositeWilson();

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



	function initCompositeWilson()
	{
		const options = {
			renderer: "cpu",
		
			canvasWidth: 400,
			canvasHeight: 300
		};
		
		const wilson = new Wilson($("#composite-canvas"), options);

		const image = new Array(wilson.canvasHeight);

		for (let i = 0; i < wilson.canvasHeight; i++)
		{
			image[i] = new Array(wilson.canvasWidth);

			for (let j = 0; j < wilson.canvasWidth; j++)
			{
				image[i][j] = [0, 0, 0];
			}
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
		
		// eslint-disable-next-line no-unused-vars
		async function parseImage()
		{
			return new Promise(resolve =>
			{
				const img = new Image(wilson.canvasWidth, wilson.canvasHeight);
			
				img.onload = () =>
				{
					wilson.ctx.drawImage(img, 0, 0);

					const imageData = Array.from(
						wilson.ctx.getImageData(0, 0, wilson.canvasWidth, wilson.canvasHeight).data
					);

					const output = new Array(wilson.canvasHeight);

					for (let i = 0; i < wilson.canvasHeight; i++)
					{
						output[i] = new Array(wilson.canvasWidth);

						for (let j = 0; j < wilson.canvasWidth; j++)
						{
							output[i][j] = imageData[4 * (wilson.canvasWidth * i + j)];
						}
					}

					console.log(output);

					resolve();
				};

				img.src = `graphics/v.webp`;
			});
		}

		function drawImageFromArray(image)
		{
			const imageData = new Uint8ClampedArray(wilson.canvasWidth * wilson.canvasHeight * 4);

			for (let i = 0; i < wilson.canvasHeight; i++)
			{
				for (let j = 0; j < wilson.canvasWidth; j++)
				{
					const index = 4 * (wilson.canvasWidth * i + j);

					const rgb = wilson.utils.hsvToRgb(
						image[i][j][0] / 255,
						image[i][j][1] / 255,
						image[i][j][2] / 255
					);

					imageData[index] = rgb[0];
					imageData[index + 1] = rgb[1];
					imageData[index + 2] = rgb[2];
					imageData[index + 3] = 255;
				}
			}

			wilson.ctx.putImageData(
				new ImageData(imageData, wilson.canvasWidth, wilson.canvasHeight),
				0,
				0
			);
		}

		function drawTruncatedImage(hDepth = 200, sDepth = 200, vDepth = 200)
		{
			for (let i = 0; i < wilson.canvasHeight; i++)
			{
				for (let j = 0; j < wilson.canvasWidth; j++)
				{
					image[i][j] = [0, 0, 0];

					for (let term = 0; term < vDepth; term++)
					{
						image[i][j][2] += VSingularValues[term] * VU[i][term] * VW[j][term];
					}
				}
			}

			drawImageFromArray(image);
		}

		drawTruncatedImage();
	}
}