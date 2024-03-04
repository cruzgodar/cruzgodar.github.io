// Sets state from an ascii block with . for 0 and o for 1, e.g.
/*
ooo.o
o....
...oo
.oo.o
o.o.o
*/
// The state is allowed to start and end with newlines.
export function writeStateFromAscii({
	state,
	gridSize,
	ascii,
	startRow,
	startCol
}) {
	ascii = ascii.replaceAll(/[\t ]/g, "");

	const rows = ascii.split("\n").filter(row => row.length !== 0);

	const row = startRow ?? Math.floor(gridSize / 2) + Math.floor(rows.length / 2);
	const col = startCol ?? Math.floor(gridSize / 2) - Math.floor(rows[0].length / 2);

	for (let i = 0; i < rows.length; i++)
	{
		for (let j = 0; j < rows[i].length; j++)
		{
			if (rows[i][j] !== ".")
			{
				state[gridSize * (row - i) + (col + j)] = 1;
			}
		}
	}
}