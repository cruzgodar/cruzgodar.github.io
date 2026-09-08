// One-off converter for the singular value decompositions page.
//
// The original scripts/data.js held `uVectors` --- 44 vectors of 40000
// full-precision decimals --- as a 35 MB JavaScript module. Three quarters of
// each vector is RGB data the page actually draws; the remaining quarter is the
// alpha channel, which is constant within each vector and never read as
// anything but a contribution to that vector's magnitude.
//
// This rewrites it as a flat Float32Array of RGB triples in data.bin, leaving
// data.js to hold only the 44 alphas and the (small) eigendata. Float32 is far
// more precision than a Uint8ClampedArray of pixels can show: reconstructed
// images differ from the float64 originals by under 2e-5 on the 0-255 scale.
//
// Run against a checkout of the original file, which is preserved in git
// history rather than in the working tree:
//
//     git show <rev>:$PAGE/scripts/data.js > /tmp/data.mjs
//     bun build/convert-svd-data.js /tmp/data.mjs
//
// where $PAGE is the page directory named below.

import { writeFileSync } from "fs";
import { pathToFileURL } from "url";

const pageDir = "teaching/notes/linear-algebra/singular-value-decompositions";

const inputPath = process.argv[2];

if (!inputPath)
{
	console.error("Usage: node build/convert-svd-data.js <path to original data.mjs>");
	process.exit(1);
}

const { eigendata, uVectors } = await import(pathToFileURL(inputPath).href);

const numVectors = uVectors.length;
const numChannels = uVectors[0].length;
const numPixels = numChannels / 4;

// Alpha is constant within each vector, so one value per vector is enough.
const uAlphas = uVectors.map(vector => vector[3]);

for (let i = 0; i < numVectors; i++)
{
	for (let j = 3; j < numChannels; j += 4)
	{
		if (uVectors[i][j] !== uAlphas[i])
		{
			throw new Error(`Vector ${i} has a non-constant alpha channel at ${j}`);
		}
	}
}

const rgb = new Float32Array(numVectors * numPixels * 3);

let k = 0;

for (let i = 0; i < numVectors; i++)
{
	for (let j = 0; j < numChannels; j += 4)
	{
		rgb[k++] = uVectors[i][j];
		rgb[k++] = uVectors[i][j + 1];
		rgb[k++] = uVectors[i][j + 2];
	}
}

writeFileSync(`${pageDir}/scripts/data.bin`, Buffer.from(rgb.buffer));

writeFileSync(`${pageDir}/scripts/data.js`, `// The eigenvector RGB data lives in data.bin as a flat Float32Array of
// ${numVectors} * ${numPixels} * 3 entries --- see build/convert-svd-data.js.

export const numVectors = ${numVectors};
export const numPixels = ${numPixels};

// One constant alpha channel value per eigenvector.
export const uAlphas = ${JSON.stringify(uAlphas)};

export const eigendata = ${JSON.stringify(eigendata)};
`);

console.log(`Wrote ${pageDir}/scripts/data.bin (${rgb.byteLength} bytes)`);
