import { A, eigendata, uVectors } from "./data.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { showPage } from "/scripts/src/loadPage.js";
import { $ } from "/scripts/src/main.js";
import { Wilson } from "/scripts/wilson.js";

export async function load()
{
	const options = {
		renderer: "cpu",
	
		canvasWidth: 162,
		canvasHeight: 200
	};
	
	const wilson = new Wilson($("#output-canvas"), options);

	new DownloadButton({
		element: $("#download-button"),
		wilson,
		filename: "eigenface.png"
	});

	showPage();
	
	async function parseImage(index)
	{
		return new Promise(resolve =>
		{
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

	const dataLength = wilson.canvasHeight * wilson.canvasWidth * 4;

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

	function plotEigenface(vec)
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

		const imageData = new ImageData(new Uint8ClampedArray(u), wilson.canvasWidth, wilson.canvasHeight);

		wilson.ctx.putImageData(imageData, 0, 0);
	}

	plotEigenface(uVectors[0]);
}