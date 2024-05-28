import { PlanePartitions } from "./class.js";

const absoluteMinAEntry = -5;

export function isValidABConfig({
	lambda,
	mu,
	nu,
	A,
	B
}) {
	if (!PlanePartitions.verifyPp(A) || !PlanePartitions.verifyPp(B))
	{
		return false;
	}

	while (lambda.length < nu[0])
	{
		lambda.push(0);
	}

	while (mu.length < nu.length)
	{
		mu.push(0);
	}

	// Elements of this are of the form [x, y, z, label], where a label of 0 is unlabeled.
	const boxes = [];

	let numNegativeARows = 0;
	let numNegativeACols = 0;

	while (A[numNegativeARows][0] === Infinity)
	{
		numNegativeARows++;
	}

	while (A[0][numNegativeACols] === Infinity)
	{
		numNegativeACols++;
	}

	if (A[numNegativeARows - 1][numNegativeACols - 1] !== Infinity)
	{
		throw new Error("Infinite part of A is not rectangular!");
	}

	for (let i = 0; i < A.length; i++)
	{
		for (let j = 0; j < A[i].length; j++)
		{
			const row = i - numNegativeARows;
			const col = j - numNegativeACols;

			if (row < 0 && col < 0)
			{
				continue;
			}

			const inNu = row >= 0 && row < nu.length && col >= 0 && col < nu[row];

			const lambdaTerm = col >= 0 ? lambda[col] : Infinity;
			const muTerm = row >= 0 ? mu[row] : Infinity;

			if (A[i][j] > Math.min(lambdaTerm, muTerm))
			{
				return false;
			}

			if (row >= 0 && col >= 0)
			{
				if (B[row][col] < 0)
				{
					return false;
				}

				if (inNu && B[row][col] > Math.max(lambdaTerm, muTerm))
				{
					return false;
				}

				if (!inNu && B[row][col] > Math.min(lambdaTerm, muTerm))
				{
					return false;
				}

				if (!inNu && A[i][j] !== -Infinity)
				{
					return false;
				}
			}

			else if (A[i][j] < 0)
			{
				return false;
			}



			const [maxAEntry, maxBEntry] = (() =>
			{
				if (row < 0)
				{
					return [lambda[col], 0];
				}
				
				if (col < 0)
				{
					return [mu[row], 0];
				}
				
				if (inNu)
				{
					return [
						Math.min(lambda[col], mu[row]),
						Math.max(lambda[col], mu[row])
					];
				}

				return [0, Math.min(lambda[col], mu[row])];
			})();

			const minEntry = inNu ? absoluteMinAEntry : 0;

			for (
				let k = minEntry;
				k < Math.max(maxAEntry, maxBEntry);
				k++
			) {
				const [region, label] = (() =>
				{
					if (row < 0)
					{
						return [1, 1];
					}

					if (col < 0)
					{
						return [1, 2];
					}

					if (k < 0)
					{
						return [1, 3];
					}
					
					if (inNu && k < Math.min(lambda[col], mu[row]))
					{
						return [3, 0];
					}

					if (!inNu)
					{
						return [2, 3];
					}

					if (k >= lambda[col])
					{
						return [2, 1];
					}

					if (k >= mu[row])
					{
						return [2, 2];
					}

					throw new Error("Region/label code is broken");
				})();

				const boxIsInA = A[i][j] <= k && k < maxAEntry;
				const boxIsInB = (row >= 0 && col >= 0)
					? B[row][col] <= k && k < maxBEntry
					: false;
				const boxCouldBeInB = (row >= 0 && col >= 0)
					? k < maxBEntry && k >= 0
					: false;

				if (region === 1 && boxIsInA)
				{
					boxes.push([row, col, k, label]);
				}

				else if (region === 2 && !boxIsInB && boxCouldBeInB)
				{
					boxes.push([row, col, k, label]);
				}

				else if (
					region === 3
					&& ((boxIsInA && !boxIsInB) || (!boxIsInA && boxIsInB))
				) {
					boxes.push([row, col, k, label]);
				}
			}
		}
	}



	const components = [];
	const unexplored = structuredClone(boxes);

	const directions = [
		[-1, 0, 0],
		[1, 0, 0],
		[0, -1, 0],
		[0, 1, 0],
		[0, 0, -1],
		[0, 0, 1]
	];
	
	while (unexplored.length !== 0)
	{
		let component = [];
		let active = [unexplored[0]];
		unexplored.splice(0, 1);

		while (active.length !== 0)
		{
			const nextActive = [];

			// Each element of active checks everything around it.
			active.forEach(activeBox =>
			{
				directions.forEach(direction =>
				{
					const adjacentBox = [
						activeBox[0] + direction[0],
						activeBox[1] + direction[1],
						activeBox[2] + direction[2]
					];

					const index = boxIsInArray(adjacentBox, unexplored);

					if (index !== -1)
					{
						nextActive.push(unexplored[index]);
						unexplored.splice(index, 1);
					}
				});
			});

			component = component.concat(active);
			active = nextActive;
		}

		components.push(component);
	}



	// Finally, determine if there's a label conflict.

	for (let i = 0; i < components.length; i++)
	{
		const labels = new Set(components[i].map(box => box[3]));
		
		labels.delete(0);

		if (labels.size > 1)
		{
			return false;
		}
	}

	return true;
}

function boxIsInArray(box, array)
{
	for (let i = 0; i < array.length; i++)
	{
		const element = array[i];

		if (
			element[0] === box[0]
			&& element[1] === box[1]
			&& element[2] === box[2]
		) {
			return i;
		}
	}

	return -1;
}



export function getMinimalABConfig({
	lambda,
	mu,
	nu,
	negativeWidth = 2
}) {
	while (lambda.length < nu[0])
	{
		lambda.push(0);
	}

	while (mu.length < nu.length)
	{
		mu.push(0);
	}

	const A = new Array(negativeWidth + mu.length);
	const B = new Array(mu.length);

	for (let i = 0; i < A.length; i++)
	{
		A[i] = new Array(negativeWidth + lambda.length);

		if (i >= negativeWidth)
		{
			B[i - negativeWidth] = new Array(lambda.length);
		}

		for (let j = 0; j < A[i].length; j++)
		{
			const row = i - negativeWidth;
			const col = j - negativeWidth;

			if (row < 0 && col < 0)
			{
				A[i][j] = Infinity;
				continue;
			}

			const inNu = row >= 0 && row < nu.length && col >= 0 && col < nu[row];

			const [maxAEntry, maxBEntry] = (() =>
			{
				if (row < 0)
				{
					return [lambda[col], 0];
				}
				
				if (col < 0)
				{
					return [mu[row], 0];
				}
				
				if (inNu)
				{
					return [
						Math.min(lambda[col], mu[row]),
						Math.max(lambda[col], mu[row])
					];
				}

				return [-Infinity, Math.min(lambda[col], mu[row])];
			})();

			A[i][j] = maxAEntry;

			if (row >= 0 && col >= 0)
			{
				B[row][col] = maxBEntry;
			}
		}
	}
	
	return [A, B];
}


// A and B must be of minimal weight (i.e. the entries at (i, j)
// are maximal).
export function iterateThroughEntries({
	lambda,
	mu,
	nu,
	A,
	B,
	i,
	j
}) {
	while (lambda.length < nu[0])
	{
		lambda.push(0);
	}

	while (mu.length < nu.length)
	{
		mu.push(0);
	}

	let numNegativeARows = 0;
	let numNegativeACols = 0;

	while (A[numNegativeARows][0] === Infinity)
	{
		numNegativeARows++;
	}

	while (A[0][numNegativeACols] === Infinity)
	{
		numNegativeACols++;
	}

	const row = i - numNegativeARows;
	const col = j - numNegativeACols;

	if (row < 0 && col < 0)
	{
		return;
	}

	const inNu = row >= 0 && row < nu.length && col >= 0 && col < nu[row];

	const cappedMaxAEntry = (row >= 0 && col >= 0 && !inNu)
		? -Infinity
		: Math.min(
			i === 0 ? lambda[col] : A[i - 1][j],
			j === 0 ? mu[row] : A[i][j - 1]
		);
	const cappedMinAEntry = Math.max(
		Math.max(
			i === A.length - 1 ? -Infinity : A[i + 1][j],
			j === A[0].length - 1 ? -Infinity : A[i][j + 1]
		),
		inNu ? absoluteMinAEntry : 0
	);

	const cappedMaxBEntry = row >= 0 && col >= 0
		? Math.min(
			row === 0 ? Infinity : B[row - 1][col],
			col === 0 ? Infinity : B[row][col - 1]
		)
		: Infinity;
	const cappedMinBEntry = row >= 0 && col >= 0
		? Math.max(
			row === B.length - 1 ? 0 : B[row + 1][col],
			col === B[0].length - 1 ? 0 : B[row][col + 1]
		)
		: Infinity;

	const newA = structuredClone(A);
	const newB = structuredClone(B);

	let outputString = "";

	if (cappedMaxAEntry === -Infinity)
	{
		for (
			let b = cappedMaxBEntry;
			b >= cappedMinBEntry;
			b--
		) {
			newB[row][col] = b;

			if (isValidABConfig({
				lambda,
				mu,
				nu,
				A: newA,
				B: newB
			})) {
				outputString = outputString + "* ";
			}

			else
			{
				outputString = outputString + "  ";
			}
		}
	}

	else if (cappedMaxBEntry === Infinity)
	{
		for (
			let a = cappedMaxAEntry;
			a >= cappedMinAEntry;
			a--
		) {
			newA[i][j] = a;

			if (isValidABConfig({
				lambda,
				mu,
				nu,
				A: newA,
				B: newB
			})) {
				outputString = outputString + (a === absoluteMinAEntry ? "v\n" : "*\n");
			}

			else
			{
				outputString = outputString + "\n";
			}
		}
	}

	else
	{
		for (
			let a = cappedMaxAEntry;
			a >= cappedMinAEntry;
			a--
		) {
			for (
				let b = cappedMaxBEntry;
				b >= cappedMinBEntry;
				b--
			) {
				newA[i][j] = a;
				newB[row][col] = b;

				if (isValidABConfig({
					lambda,
					mu,
					nu,
					A: newA,
					B: newB
				})) {
					outputString = outputString + (a === absoluteMinAEntry ? "v " : "* ");
				}

				else
				{
					outputString = outputString + "  ";
				}
			}

			outputString = outputString + "\n";
		}
	}

	return outputString;
}

export function printABConfig({ A, B })
{
	let outputString = "";

	let numNegativeARows = 0;
	let numNegativeACols = 0;

	while (A[numNegativeARows][0] === Infinity)
	{
		numNegativeARows++;
	}

	while (A[0][numNegativeACols] === Infinity)
	{
		numNegativeACols++;
	}

	let columnWidth = 2;

	for (let j = 0; j < A[0].length; j++)
	{
		for (let i = 0; i < A.length; i++)
		{
			const width = (() =>
			{
				if (Math.abs(A[i][j]) === Infinity)
				{
					return 1;
				}

				return `${A[i][j]}`.length;
			})();

			columnWidth = Math.max(columnWidth, width + 1);
		}
	}

	for (let i = 0; i < A.length; i++)
	{
		const row = i - numNegativeARows;

		for (let j = 0; j < A[i].length; j++)
		{
			const char = A[i][j] === Infinity
				? "^"
				: A[i][j] === -Infinity ? "v" : `${A[i][j]}`;
			
			const numSpaces = columnWidth - char.length;

			outputString += `${" ".repeat(numSpaces - 1)}${char} `;
		}

		if (row >= 0)
		{
			outputString += "  ";

			for (let col = 0; col < B[row].length; col++)
			{
				outputString += `${B[row][col]} `;
			}
		}

		outputString += "\n";
	}

	console.log(outputString);
}

export function testAllEntriesOfABConfig({
	lambda,
	mu,
	nu,
	A,
	B,
	onlyUnboundedBelow = false
}) {
	let numNegativeARows = 0;
	let numNegativeACols = 0;

	while (A[numNegativeARows][0] === Infinity)
	{
		numNegativeARows++;
	}

	while (A[0][numNegativeACols] === Infinity)
	{
		numNegativeACols++;
	}

	for (let i = 0; i < A.length; i++)
	{
		for (let j = 0; j < A.length; j++)
		{
			if (i < numNegativeARows && j < numNegativeACols)
			{
				continue;
			}

			const outputString = this.iterateThroughEntries({
				A,
				B,
				lambda,
				mu,
				nu,
				i,
				j,
			});

			if (!onlyUnboundedBelow)
			{
				console.log(i, j);
				console.log(outputString);
			}

			const row = i - numNegativeARows;
			const col = j - numNegativeACols;

			if (row >= 0 && col >= 0 && row < nu.length && col === nu[row] - 1)
			{
				nu[row]--;

				const newA = structuredClone(A);
				const newB = structuredClone(B);

				newA[i][j] = -Infinity;
				newB[row][col] = Math.min(lambda[col], mu[row]);

				if (onlyUnboundedBelow)
				{
					console.log(i, j);
					console.log(outputString);
				}

				console.log(
					this.iterateThroughEntries({
						A: newA,
						B: newB,
						lambda,
						mu,
						nu,
						i,
						j,
					})
				);

				nu[row]++;
			}
		}
	}
}

export function getArrayVersionOfABConfig({
	lambda,
	mu,
	nu,
	A,
	B
}) {
	let numNegativeARows = 0;
	let numNegativeACols = 0;

	while (A[numNegativeARows][0] === Infinity)
	{
		numNegativeARows++;
	}

	while (A[0][numNegativeACols] === Infinity)
	{
		numNegativeACols++;
	}

	const bigA = new Array(16);
	const bigB = new Array(16);

	for (let i = 0; i < 16; i++)
	{
		bigA[i] = new Array(16);
		bigB[i] = new Array(16);

		for (let j = 0; j < 16; j++)
		{
			const row = i - 8 + numNegativeARows;
			const col = j - 8 + numNegativeACols;

			if (row >= 0 && row < A.length && col >= 0 && col < A[row].length)
			{
				bigA[i][j] = Math.min(Math.max(A[row][col] + 8, 0), 16);
			}

			else
			{
				const lambdaEntry = (() =>
				{
					if (j - 8 < 0)
					{
						return Infinity;
					}

					if (j - 8 >= lambda.length)
					{
						return 0;
					}

					return lambda[j - 8];
				})();

				const muEntry = (() =>
				{
					if (i - 8 < 0)
					{
						return Infinity;
					}

					if (i - 8 >= mu.length)
					{
						return 0;
					}

					return mu[i - 8];
				})();

				const aEntry = (() =>
				{
					if (
						(i - 8 >= 0 && i - 8 < nu.length && j - 8 < nu[i - 8])
						|| i - 8 < 0
						|| j - 8 < 0
					) {
						return Math.min(lambdaEntry, muEntry);
					}

					return -Infinity;
				})();

				bigA[i][j] = Math.min(Math.max(aEntry + 8, 0), 16);
			}

			if (bigA[i][j] === 16)
			{
				bigA[i][j] = Infinity;
			}

			

			if (i < B.length && j < B[i].length)
			{
				bigB[i][j] = B[i][j];
			}

			else
			{
				bigB[i][j] = 0;
			}
		}
	}

	return [bigA, bigB];
}