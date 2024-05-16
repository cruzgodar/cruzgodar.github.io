// Turns a block of numbers into an array.
export function parseArray(data)
{
	const splitData = data.split("\n");

	let numRows = splitData.length;

	const splitRows = new Array(splitData.length);

	for (let i = 0; i < splitRows.length; i++)
	{
		splitRows[i] = splitData[i].split(" ");

		for (let j = 0; j < splitRows[i].length; j++)
		{
			if (splitRows[i][j] === "")
			{
				splitRows[i].splice(j, 1);
				j--;
			}
		}
	}

	let numCols = splitRows[0].length;



	if (data.indexOf(">") === -1)
	{
		for (let i = 0; i < splitRows.length; i++)
		{
			splitRows[i].push("0");
		}

		numCols++;
	}

	if (data.indexOf("v") === -1)
	{
		splitRows.push(["0"]);

		numRows++;
	}

	const size = Math.max(numRows, numCols);

	const array = new Array(size);



	for (let i = 0; i < numRows; i++)
	{
		array[i] = new Array(size);

		for (let j = 0; j < splitRows[i].length; j++)
		{
			// A vertically upward leg.
			if (splitRows[i][j] === "^")
			{
				array[i][j] = Infinity;
			}

			// A leg pointing right or down.
			else if (splitRows[i][j] === ">")
			{
				array[i][j] = array[i][j - 1];
			}

			else if (splitRows[i][j] === "v")
			{
				array[i][j] = array[i - 1][j];
			}

			else
			{
				array[i][j] = parseInt(splitRows[i][j]);
			}
		}

		for (let j = splitRows[i].length; j < size; j++)
		{
			array[i][j] = 0;
		}
	}

	for (let i = numRows; i < size; i++)
	{
		array[i] = new Array(size);

		for (let j = 0; j < size; j++)
		{
			array[i][j] = 0;
		}
	}



	return array;
}



export function arrayToAscii(numbers)
{
	let numCharacters = 1;

	for (let i = 0; i < numbers.length; i++)
	{
		for (let j = 0; j < numbers.length; j++)
		{
			if (numbers[i][j] !== Infinity)
			{
				numCharacters = Math.max(numCharacters, `${numbers[i][j]}`.length);
			}
		}
	}

	numCharacters++;



	let text = "";

	for (let i = 0; i < numbers.length - 1; i++)
	{
		for (let j = 0; j < numbers.length - 1; j++)
		{
			if (numbers[i][j] === Infinity)
			{
				for (let k = 0; k < numCharacters - 1 - (j === 0); k++)
				{
					text += " ";
				}

				text += "^";
			}

			else
			{
				const len = `${numbers[i][j]}`.length;

				for (let k = 0; k < numCharacters - len - (j === 0); k++)
				{
					text += " ";
				}

				text += numbers[i][j];
			}
		}



		if (numbers[i][numbers.length - 1] !== 0)
		{
			for (let k = 0; k < numCharacters - 1; k++)
			{
				text += " ";
			}

			text += ">";
		}



		if (i !== numbers.length - 2)
		{
			text += "\n";
		}
	}



	if (numbers[numbers.length - 1][0] !== 0)
	{
		text += "\n";

		for (let j = 0; j < numbers.length - 1; j++)
		{
			if (numbers[numbers.length - 1][j] !== 0)
			{
				for (let k = 0; k < numCharacters - 1 - (j === 0); k++)
				{
					text += " ";
				}

				text += "v";
			}
		}
	}



	return text;
}



export function verifyPp(planePartition)
{
	for (let i = 0; i < planePartition.length - 1; i++)
	{
		for (let j = 0; j < planePartition[i].length - 1; j++)
		{
			if (
				planePartition[i][j] < planePartition[i + 1][j]
				|| planePartition[i][j] < planePartition[i][j + 1]
			) {
				return false;
			}
		}
	}

	return true;
}



export function verifySsyt(ssyt)
{
	for (let i = 0; i < ssyt.length - 1; i++)
	{
		for (let j = 0; j < ssyt[i].length - 1; j++)
		{
			if (
				(ssyt[i + 1][j] !== 0 && ssyt[i][j] >= ssyt[i + 1][j])
				|| (ssyt[i][j + 1] !== 0 && ssyt[i][j] > ssyt[i][j + 1])
			) {
				return false;
			}
		}
	}

	return true;
}