import { generateRandomPlanePartition, generateRandomTableau } from "./generateRandomData.js";
import { parseArray, verifyPp, verifySsyt } from "./parseAndVerify.js";

export async function runExample(index)
{
	if (index === 1 || index === 2)
	{
		while (this.arrays.length > 1)
		{
			await this.removeArray(1);
			await new Promise(resolve => setTimeout(resolve, this.animationTime / 2));
		}

		if (this.arrays.length === 0)
		{
			const planePartition = parseArray(
				generateRandomPlanePartition()
			);

			await this.addNewArray(this.arrays.length, planePartition);
		}

		else if (!verifyPp(this.arrays[0].numbers))
		{
			await this.removeArray(0);
			await new Promise(resolve => setTimeout(resolve, this.animationTime / 2));

			const planePartition = parseArray(
				generateRandomPlanePartition()
			);

			await this.addNewArray(this.arrays.length, planePartition);
		}



		if (index === 1)
		{
			await this.runAlgorithm("hillmanGrassl", 0);

			await new Promise(resolve => setTimeout(resolve, 3 * this.animationTime));

			await this.runAlgorithm("hillmanGrasslInverse", 0);
		}

		else
		{
			await this.runAlgorithm("pak", 0);

			await new Promise(resolve => setTimeout(resolve, 3 * this.animationTime));

			await this.showHexView();

			await new Promise(resolve => setTimeout(resolve, this.animationTime));

			await this.runAlgorithm("sulzgruberInverse", 0);
		}
	}



	else if (index === 3)
	{
		while (this.arrays.length > 0)
		{
			await this.removeArray(0);
			await new Promise(resolve => setTimeout(resolve, this.animationTime / 2));
		}

		await this.addNewArray(this.arrays.length, generateRandomTableau());



		await this.show2dView();

		await new Promise(resolve => setTimeout(resolve, this.animationTime));

		await this.runAlgorithm("rskInverse", 0);

		await new Promise(resolve => setTimeout(resolve, 3 * this.animationTime));

		await this.runAlgorithm("rsk", 0);
	}
}



export async function runAlgorithm(name, index, subAlgorithm = false)
{
	if (!subAlgorithm && this.currentlyRunningAlgorithm)
	{
		return;
	}

	this.currentlyRunningAlgorithm = true;



	const data = this.algorithmData[name];

	const numArrays = data.inputType.length;

	if (index > this.arrays.length - 1 || index < 0)
	{
		console.log(`No array at index ${index}!`);

		this.currentlyRunningAlgorithm = false;

		return;
	}

	else if (numArrays > 1 && index > this.arrays.length - numArrays)
	{
		console.log(`No array at index ${index + numArrays - 1}! (This algorithm needs ${numArrays} arrays)`);

		this.currentlyRunningAlgorithm = false;

		return;
	}



	for (let i = 0; i < numArrays; i++)
	{
		const type = data.inputType[i];

		if (type === "pp" && !verifyPp(this.arrays[index + i].numbers))
		{
			console.log(`Array at index ${index + i} is not a plane partition!`);

			this.currentlyRunningAlgorithm = false;

			return;
		}

		if (type === "ssyt" && !verifySsyt(this.arrays[index + i].numbers))
		{
			console.log(`Array at index ${index + i} is not an SSYT!`);

			this.currentlyRunningAlgorithm = false;

			return;
		}
	}



	if (numArrays > 1 && data.sameShape !== undefined && data.sameShape)
	{
		const rowLengths = new Array(numArrays);

		let maxNumRows = 0;

		for (let i = 0; i < numArrays; i++)
		{
			maxNumRows = Math.max(maxNumRows, this.arrays[index + i].numbers.length);
		}

		for (let i = 0; i < numArrays; i++)
		{
			rowLengths[i] = new Array(maxNumRows);

			for (let j = 0; j < maxNumRows; j++)
			{
				rowLengths[i][j] = 0;
			}

			for (let j = 0; j < this.arrays[index + i].numbers.length; j++)
			{
				let k = 0;

				while (
					k < this.arrays[index + i].numbers[j].length
					&& this.arrays[index + i].numbers[j][k] !== 0
				) {
					k++;
				}

				rowLengths[i][j] = k;
			}
		}



		for (let i = 1; i < numArrays; i++)
		{
			for (let j = 0; j < maxNumRows; j++)
			{
				if (rowLengths[i][j] !== rowLengths[0][j])
				{
					this.displayError("Arrays are not the same shape!");

					this.currentlyRunningAlgorithm = false;

					return;
				}
			}
		}
	}



	// Uncolor everything.
	for (let i = 0; i < numArrays; i++)
	{
		const coordinates = [];

		const numbers = this.arrays[index + i].numbers;

		for (let j = 0; j < numbers.length; j++)
		{
			for (let k = 0; k < numbers.length; k++)
			{
				if (numbers[j][k] !== Infinity)
				{
					for (let l = 0; l < numbers[j][k]; l++)
					{
						coordinates.push([j, k, l]);
					}
				}
			}
		}

		this.uncolorCubes(this.arrays[index + i], coordinates);
	}



	const boundFunction = data.method.bind(this);

	await boundFunction(index);



	if (!this.subAlgorithm)
	{
		this.currentlyRunningAlgorithm = false;
	}
}