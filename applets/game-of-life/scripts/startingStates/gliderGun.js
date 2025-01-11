import { writeStateFromAscii } from "./writeStateFromArray.js";

export function gliderGun(gridSize)
{
	gridSize = Math.max(gridSize, 50);

	const state = new Uint8Array(gridSize * gridSize);

	const ascii = `
		..... ..... ..... ..... ....o ..... ..... .
		..... ..... ..... ..... ..o.o ..... ..... .
		..... ..... ..oo. ..... oo... ..... ....o o
		..... ..... .o... o.... oo... ..... ....o o
		oo... ..... o.... .o... oo... ..... ..... .
		oo... ..... o...o .oo.. ..o.o ..... ..... .
		..... ..... o.... .o... ....o ..... ..... .
		..... ..... .o... o.... ..... ..... ..... .
		..... ..... ..oo. ..... ..... ..... ..... .
	`;

	writeStateFromAscii({
		state,
		gridSize,
		ascii
	});

	return [state, gridSize];
}