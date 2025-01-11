export async function godar1(index)
{
	// Figure out the shape of nu.
	let array = this.arrays[index];
	let planePartition = array.numbers;

	const nuRowLengths = new Array(2 * planePartition.length);
	const nuColLengths = new Array(2 * planePartition.length);

	for (let i = 0; i < planePartition.length; i++)
	{
		let j = 0;

		while (j < planePartition.length && planePartition[i][j] === Infinity)
		{
			j++;
		}

		nuRowLengths[i] = j;



		j = 0;

		while (j < planePartition.length && planePartition[j][i] === Infinity)
		{
			j++;
		}

		nuColLengths[i] = j;
	}

	for (let i = planePartition.length; i < 2 * planePartition.length; i++)
	{
		nuRowLengths[i] = 0;

		nuColLengths[i] = 0;
	}

	const rppSize = Math.max(nuRowLengths[0], nuColLengths[0]);



	const newArray = new Array(planePartition.length);

	for (let i = 0; i < planePartition.length; i++)
	{
		newArray[i] = new Array(planePartition.length);

		for (let j = 0; j < planePartition.length; j++)
		{
			if (planePartition[i][j] === Infinity)
			{
				newArray[i][j] = this.infiniteHeight;
			}

			else
			{
				newArray[i][j] = planePartition[i][j];
			}
		}
	}

	await this.addNewArray(index + 1, newArray);

	await new Promise(resolve => setTimeout(resolve, this.animationTime / 2));

	await this.removeArray(index);

	await new Promise(resolve => setTimeout(resolve, this.animationTime / 2));

	array = this.arrays[index];
	planePartition = array.numbers;



	let rightLegSize = 0;
	let bottomLegSize = 0;

	while (
		rightLegSize < planePartition.length
		&& planePartition[rightLegSize][planePartition.length - 1] !== 0
	) {
		rightLegSize++;
	}

	while (
		bottomLegSize < planePartition.length
		&& planePartition[planePartition.length - 1][bottomLegSize] !== 0
	) {
		bottomLegSize++;
	}



	await this.runAlgorithm("pak", index, true);

	await new Promise(resolve => setTimeout(resolve, this.animationTime * 2));

	array = this.arrays[index];
	planePartition = array.numbers;



	const legSize = Math.max(rightLegSize, bottomLegSize);

	const finiteArray = new Array(planePartition.length - legSize + 1);

	const cubesToDelete = [];

	for (let i = 0; i < finiteArray.length - 1; i++)
	{
		finiteArray[i] = new Array(finiteArray.length);

		for (let j = 0; j < finiteArray.length - 1; j++)
		{
			finiteArray[i][j] = planePartition[i][j];

			for (let k = 0; k < planePartition[i][j]; k++)
			{
				cubesToDelete.push([i, j, k]);
			}

			planePartition[i][j] = 0;
		}

		finiteArray[i][finiteArray.length - 1] = 0;
	}

	finiteArray[finiteArray.length - 1] = new Array(finiteArray.length);

	for (let j = 0; j < finiteArray.length; j++)
	{
		finiteArray[finiteArray.length - 1][j] = 0;
	}



	this.deleteCubes(array, cubesToDelete, true, true);

	await this.addNewArray(index, finiteArray);

	await new Promise(resolve => setTimeout(resolve, this.animationTime / 2));



	// Now we unPak the second array.

	await this.runAlgorithm("pakInverse", index, true);

	await new Promise(resolve => setTimeout(resolve, this.animationTime * 2));



	// We're now clear to pull apart the negative RPP from the finite part.n



	// In order for the bijection to actually be correct,
	// we need to make sure the rearrangement works the same way each time.
	// The easiest way to do this is to ensure that every hook length actually
	// in the APP has a *full* array of possible locations,
	// so that its index in that is correct.



	// Organize everything by hook length.
	const maxAppHookLength = 2 * planePartition.length
		- nuRowLengths[planePartition.length - 1]
		- nuColLengths[planePartition.length - 1];

	const maxRppHookLength = nuRowLengths[0] + nuColLengths[0];

	const appPivotsByHookLength = new Array(4 * planePartition.length);
	const rppPivotsByHookLength = new Array(maxRppHookLength);
	const ppPivotsByHookLength = new Array(4 * planePartition.length);

	for (let i = 0; i < 4 * planePartition.length; i++)
	{
		appPivotsByHookLength[i] = new Array();
	}

	for (let i = 0; i < maxRppHookLength; i++)
	{
		rppPivotsByHookLength[i] = new Array();
	}

	for (let i = 0; i < 4 * planePartition.length; i++)
	{
		ppPivotsByHookLength[i] = new Array();
	}

	let ppSize = 1;

	// If nu = (3, 1) and the APP given is 3x3, then its maximum
	// hook length is 5, and we need to check an 8x8 square.

	for (let i = 0; i < 2 * planePartition.length; i++)
	{
		for (let j = 0; j < 2 * planePartition.length; j++)
		{
			if (j >= nuRowLengths[i])
			{
				appPivotsByHookLength[i + j + 1 - nuRowLengths[i] - nuColLengths[j]]
					.push([i, j]);
			}

			else
			{
				// .unshift rather than .push makes the hooks move in the correct order.
				rppPivotsByHookLength[nuRowLengths[i] + nuColLengths[j] - i - j - 1]
					.unshift([rppSize - i - 1, rppSize - j - 1]);
			}

			ppPivotsByHookLength[i + j + 1].push([i, j]);
		}
	}



	const hookMap = new Array(2 * planePartition.length);

	for (let i = 0; i < 2 * planePartition.length; i++)
	{
		hookMap[i] = new Array(2 * planePartition.length);
	}

	for (let i = 1; i < maxAppHookLength; i++)
	{
		const coordinates = [];

		for (let j = 0; j < appPivotsByHookLength[i].length; j++)
		{
			const row = appPivotsByHookLength[i][j][0];
			const col = appPivotsByHookLength[i][j][1];

			if (
				row < planePartition.length - bottomLegSize
				&& col < planePartition.length - rightLegSize
			) {
				for (let k = 0; k < this.arrays[index].numbers[row][col]; k++)
				{
					coordinates.push([row, col, k]);
				}
			}

			if (j < ppPivotsByHookLength[i].length)
			{
				hookMap[row][col] = [1, ppPivotsByHookLength[i][j]];

				if (
					row < planePartition.length
					&& col < planePartition.length
					&& this.arrays[index].numbers[row][col] > 0
				) {
					ppSize = Math.max(
						Math.max(
							ppSize,
							ppPivotsByHookLength[i][j][0] + 1
						),
						ppPivotsByHookLength[i][j][1] + 1
					);
				}
			}

			else
			{
				hookMap[row][col] = [
					0,
					rppPivotsByHookLength[i][j - ppPivotsByHookLength[i].length]
				];
			}
		}

		if (coordinates.length !== 0)
		{
			this.colorCubes(
				this.arrays[index],
				coordinates,
				(i - 1) / (maxAppHookLength - 1) * 6 / 7
			);
		}
	}

	await new Promise(resolve => setTimeout(resolve, this.animationTime * 3));



	const rpp = new Array(rppSize);

	for (let i = 0; i < rppSize; i++)
	{
		rpp[i] = new Array(rppSize);

		for (let j = 0; j < rppSize; j++)
		{
			if (j < rppSize - nuRowLengths[rppSize - i - 1])
			{
				rpp[i][j] = Infinity;
			}

			else
			{
				rpp[i][j] = 0;
			}
		}
	}

	let rppArray;

	if (rppSize > 0)
	{
		rppArray = await this.addNewArray(index + 1, rpp);

		await new Promise(resolve => setTimeout(resolve, this.animationTime / 2));
	}



	const pp = new Array(ppSize);

	for (let i = 0; i < ppSize; i++)
	{
		pp[i] = new Array(ppSize);

		for (let j = 0; j < ppSize; j++)
		{
			pp[i][j] = 0;
		}
	}

	const ppArray = await this.addNewArray(index + 2, pp);



	for (let i = 0; i < planePartition.length - bottomLegSize; i++)
	{
		for (let j = nuRowLengths[i]; j < planePartition.length - rightLegSize; j++)
		{
			if (this.arrays[index].numbers[i][j] > 0)
			{
				const sourceCoordinates = [];
				const targetCoordinates = [];

				const targetRow = hookMap[i][j][1][0];
				const targetCol = hookMap[i][j][1][1];

				for (let k = 0; k < this.arrays[index].numbers[i][j]; k++)
				{
					sourceCoordinates.push([i, j, k]);
					targetCoordinates.push([targetRow, targetCol, k]);
				}

				if (hookMap[i][j][0] === 0)
				{
					await this.moveCubes(
						this.arrays[index],
						sourceCoordinates,
						rppArray,
						targetCoordinates
					);

					rpp[targetRow][targetCol] = this.arrays[index].numbers[i][j];
					this.arrays[index].numbers[i][j] = 0;
				}

				else
				{
					await this.moveCubes(
						this.arrays[index],
						sourceCoordinates,
						ppArray,
						targetCoordinates
					);

					pp[targetRow][targetCol] = this.arrays[index].numbers[i][j];
					this.arrays[index].numbers[i][j] = 0;
				}

				if (this.in2dView)
				{
					this.drawAll2dViewText();
				}
			}
		}
	}



	await new Promise(resolve => setTimeout(resolve, this.animationTime * 3));

	// Now it's time for the palindromic toggle.

	await this.runAlgorithm("pakInverse", index, true);

	if (rppSize > 0)
	{
		await this.runAlgorithm("hillmanGrasslInverse", index + 1, true);
	}
}



export async function godar1Inverse(index)
{
	const ppArray = this.arrays[index + 1];
	const pp = ppArray.numbers;

	const rppArray = this.arrays[index];
	const rpp = rppArray.numbers;

	const nuRowLengths = new Array(pp.length + 2 * rpp.length);
	const nuColLengths = new Array(pp.length + 2 * rpp.length);

	for (let i = 0; i < pp.length + 2 * rpp.length; i++)
	{
		nuRowLengths[i] = 0;
		nuColLengths[i] = 0;
	}

	// Figure out the shape of nu.
	for (let i = 0; i < rpp.length; i++)
	{
		let j = rpp.length - 1;

		while (j >= 0 && rpp[i][j] !== Infinity)
		{
			j--;
		}

		nuRowLengths[rpp.length - i - 1] = rpp.length - j - 1;



		j = rpp.length - 1;

		while (j >= 0 && rpp[j][i] !== Infinity)
		{
			j--;
		}

		nuColLengths[rpp.length - i - 1] = rpp.length - j - 1;
	}



	await this.runAlgorithm("pak", index, true);

	await new Promise(resolve => setTimeout(resolve, this.animationTime / 2));

	await this.runAlgorithm("pak", index + 1, true);



	await new Promise(resolve => setTimeout(resolve, this.animationTime * 3));



	// Uncolor everything.
	let coordinates = [];

	let numbers = this.arrays[index].numbers;

	for (let i = 0; i < numbers.length; i++)
	{
		for (let j = 0; j < numbers.length; j++)
		{
			if (numbers[i][j] !== Infinity)
			{
				for (let k = 0; k < numbers[i][j]; k++)
				{
					coordinates.push([i, j, k]);
				}
			}
		}
	}

	this.uncolorCubes(this.arrays[index], coordinates);



	coordinates = [];

	numbers = this.arrays[index + 1].numbers;

	for (let i = 0; i < numbers.length; i++)
	{
		for (let j = 0; j < numbers.length; j++)
		{
			if (numbers[i][j] !== Infinity)
			{
				for (let k = 0; k < numbers[i][j]; k++)
				{
					coordinates.push([i, j, k]);
				}
			}
		}
	}

	await this.uncolorCubes(this.arrays[index + 1], coordinates);



	// Organize everything by hook length. The largest the APP can be
	// is determined by the maximum hook in the plane partition --
	// we'll narrow this down later but it suffices for now.
	let appSize = Math.max(nuRowLengths[0], nuColLengths[0]) + 2 * pp.length - 1;
	const maxAppHookLength = 2 * appSize;
	const maxRppHookLength = nuRowLengths[0] + nuColLengths[0];
	const maxPpHookLength = 2 * pp.length;

	const appPivotsByHookLength = new Array(maxAppHookLength);
	const rppPivotsByHookLength = new Array(maxRppHookLength);
	const ppPivotsByHookLength = new Array(maxPpHookLength);

	for (let i = 0; i < maxAppHookLength; i++)
	{
		appPivotsByHookLength[i] = new Array();
	}

	for (let i = 0; i < maxRppHookLength; i++)
	{
		rppPivotsByHookLength[i] = new Array();
	}

	for (let i = 0; i < maxPpHookLength; i++)
	{
		ppPivotsByHookLength[i] = new Array(i);

		for (let j = 0; j < i; j++)
		{
			ppPivotsByHookLength[i][j] = -1;
		}
	}



	while (nuRowLengths.length < appSize)
	{
		nuRowLengths.push(0);
	}

	while (nuColLengths.length < appSize)
	{
		nuColLengths.push(0);
	}



	for (let i = 0; i < appSize; i++)
	{
		for (let j = 0; j < appSize; j++)
		{
			if (j >= nuRowLengths[i])
			{
				appPivotsByHookLength[i + j + 1 - nuRowLengths[i] - nuColLengths[j]]
					.push([i, j]);
			}

			else
			{
				// .unshift rather than .push makes the hooks move in the correct order.
				rppPivotsByHookLength[nuRowLengths[i] + nuColLengths[j] - i - j - 1]
					.unshift([rpp.length - i - 1, rpp.length - j - 1]);
			}



			if (i < pp.length && j < pp.length)
			{
				// We can't just use .push here -- there will be more hooks of any given length
				// that aren't included in the square.
				ppPivotsByHookLength[i + j + 1][i] = [i, j];
			}
		}
	}

	const ppHookMap = new Array(pp.length);

	for (let i = 0; i < pp.length; i++)
	{
		ppHookMap[i] = new Array(pp.length);
	}

	const rppHookMap = new Array(rpp.length);

	for (let i = 0; i < rpp.length; i++)
	{
		rppHookMap[i] = new Array(rpp.length);
	}



	appSize = 1;

	for (let i = 1; i < maxRppHookLength; i++)
	{
		const coordinates = [];

		for (let j = 0; j < rppPivotsByHookLength[i].length; j++)
		{
			const row = rppPivotsByHookLength[i][j][0];
			const col = rppPivotsByHookLength[i][j][1];

			for (let k = 0; k < this.arrays[index].numbers[row][col]; k++)
			{
				coordinates.push([row, col, k]);
			}

			rppHookMap[row][col] = appPivotsByHookLength[i][j + ppPivotsByHookLength[i].length];

			if (this.arrays[index].numbers[row][col] !== 0)
			{
				appSize = Math.max(
					Math.max(
						appSize,
						rppHookMap[row][col][0] + 1
					),
					rppHookMap[row][col][1] + 1
				);
			}
		}

		if (coordinates.length !== 0)
		{
			this.colorCubes(
				this.arrays[index],
				coordinates,
				(i - 1) / (maxRppHookLength - 1) * 6 / 7
			);
		}
	}



	for (let i = 1; i < maxPpHookLength; i++)
	{
		const coordinates = [];

		for (let j = 0; j < ppPivotsByHookLength[i].length; j++)
		{
			if (ppPivotsByHookLength[i][j] === -1)
			{
				continue;
			}

			const row = ppPivotsByHookLength[i][j][0];
			const col = ppPivotsByHookLength[i][j][1];

			for (let k = 0; k < this.arrays[index + 1].numbers[row][col]; k++)
			{
				coordinates.push([row, col, k]);
			}

			ppHookMap[row][col] = appPivotsByHookLength[i][j];

			if (this.arrays[index + 1].numbers[row][col] !== 0)
			{
				appSize = Math.max(
					Math.max(
						appSize,
						ppHookMap[row][col][0] + 1
					),
					ppHookMap[row][col][1] + 1
				);
			}
		}

		if (coordinates.length !== 0)
		{
			this.colorCubes(
				this.arrays[index + 1],
				coordinates,
				(i - 1) / (maxPpHookLength - 1) * 6 / 7
			);
		}
	}



	await new Promise(resolve => setTimeout(resolve, this.animationTime * 3));



	const app = new Array(appSize);

	for (let i = 0; i < appSize; i++)
	{
		app[i] = new Array(appSize);

		for (let j = 0; j < appSize; j++)
		{
			if (j < nuRowLengths[i])
			{
				app[i][j] = Infinity;
			}

			else
			{
				app[i][j] = 0;
			}
		}
	}

	const appArray = await this.addNewArray(index + 2, app);

	await new Promise(resolve => setTimeout(resolve, this.animationTime / 2));



	for (let i = 0; i < rpp.length; i++)
	{
		for (let j = 0; j < rpp.length; j++)
		{
			if (
				this.arrays[index].numbers[i][j] > 0
				&& this.arrays[index].numbers[i][j] !== Infinity
			) {
				const sourceCoordinates = [];
				const targetCoordinates = [];

				const targetRow = rppHookMap[i][j][0];
				const targetCol = rppHookMap[i][j][1];

				for (let k = 0; k < this.arrays[index].numbers[i][j]; k++)
				{
					sourceCoordinates.push([i, j, k]);
					targetCoordinates.push([targetRow, targetCol, k]);
				}

				await this.moveCubes(
					this.arrays[index],
					sourceCoordinates,
					appArray,
					targetCoordinates
				);

				app[targetRow][targetCol] = this.arrays[index].numbers[i][j];

				this.arrays[index].numbers[i][j] = 0;



				if (this.in2dView)
				{
					this.drawAll2dViewText();
				}
			}
		}
	}



	for (let i = 0; i < pp.length; i++)
	{
		for (let j = 0; j < pp.length; j++)
		{
			if (
				this.arrays[index + 1].numbers[i][j] > 0
				&& this.arrays[index + 1].numbers[i][j] !== Infinity
			) {
				const sourceCoordinates = [];
				const targetCoordinates = [];

				const targetRow = ppHookMap[i][j][0];
				const targetCol = ppHookMap[i][j][1];

				for (let k = 0; k < this.arrays[index + 1].numbers[i][j]; k++)
				{
					sourceCoordinates.push([i, j, k]);
					targetCoordinates.push([targetRow, targetCol, k]);
				}



				await this.moveCubes(
					this.arrays[index + 1],
					sourceCoordinates,
					appArray,
					targetCoordinates
				);

				app[targetRow][targetCol] = this.arrays[index + 1].numbers[i][j];
				this.arrays[index + 1].numbers[i][j] = 0;



				if (this.in2dView)
				{
					this.drawAll2dViewText();
				}
			}
		}
	}



	await this.removeArray(index);

	await new Promise(resolve => setTimeout(resolve, this.animationTime / 2));

	await this.removeArray(index);



	await new Promise(resolve => setTimeout(resolve, this.animationTime * 3));



	await this.runAlgorithm("pakInverse", index, true);

	await new Promise(resolve => setTimeout(resolve, this.animationTime));
}