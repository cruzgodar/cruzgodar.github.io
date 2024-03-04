import { writeStateFromAscii } from "./writeStateFromArray.js";

export function gliderGun(gridSize)
{
	gridSize = Math.max(gridSize, 50);

	const state = new Uint8Array(gridSize * gridSize);

	writeStateFromAscii(state, gridSize, `
..... ..... ..... ..... ....o ..... ..... .
..... ..... ..... ..... ..o.o ..... ..... .
..... ..... ..oo. ..... oo... ..... ....o o
..... ..... .o... o.... oo... ..... ....o o
oo... ..... o.... .o... oo... ..... ..... .
oo... ..... o...o .oo.. ..o.o ..... ..... .
..... ..... o.... .o... ....o ..... ..... .
..... ..... .o... o.... ..... ..... ..... .
..... ..... ..oo. ..... ..... ..... ..... .
`);

	return [state, gridSize];
}