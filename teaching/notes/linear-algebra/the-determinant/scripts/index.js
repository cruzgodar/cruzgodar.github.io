import {
	createDesmosGraphs,
	desmosBlue,
	desmosBlue3d,
	desmosPurple,
	desmosPurple3d,
	desmosRed3d,
	setGetDesmosData
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			determinantScaling:
			{
				bounds: { xmin: -8, xmax: 8, ymin: -10, ymax: 6 },

				expressions:
				[
					{ latex: raw`x^2 + (y - 2)^2 \leq 1`, color: desmosPurple, secret: true },
					{ latex: raw`(2(x - 2) + (y + 4))^2 + (3(x - 2) - (y + 4))^2 \leq 25`, color: desmosBlue, secret: true }
				]
			},

			parallelepiped:
			{
				bounds: { xmin: -1, xmax: 6, ymin: -1, ymax: 6, zmin: -1, zmax: 6 },

				use3d: true,

				expressions:
				[
					{ latex: raw`a = (2, 1, 2)`, hidden: true },
					{ latex: raw`b = (1, 3, 1)`, hidden: true },
					{ latex: raw`c = (0, 1, 3)`, hidden: true },

					{ latex: raw`\triangle((0, 0, 0), a, b)`, color: desmosPurple3d },
					{ latex: raw`\triangle(a, b, a + b)`, color: desmosPurple3d },

					{ latex: raw`\triangle((0, 0, 0), c, b)`, color: desmosBlue3d },
					{ latex: raw`\triangle(c, b, c + b)`, color: desmosBlue3d },

					{ latex: raw`\triangle((0, 0, 0), a, c)`, color: desmosRed3d },
					{ latex: raw`\triangle(a, c, a + c)`, color: desmosRed3d },

					{ latex: raw`\triangle(a + b, a, a + c)`, color: desmosBlue3d },
					{ latex: raw`\triangle(a + b, a + b + c, a + c)`, color: desmosBlue3d },

					{ latex: raw`\triangle(b + a, b, b + c)`, color: desmosRed3d },
					{ latex: raw`\triangle(b + a, b + a + c, b + c)`, color: desmosRed3d },

					{ latex: raw`\triangle(c + a, c, c + b)`, color: desmosPurple3d },
					{ latex: raw`\triangle(c + a, c + b + a, c + b)`, color: desmosPurple3d },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();
}