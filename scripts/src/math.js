// The import is only to utils, so this file is safe for e.g. slides to import

import { loadScript } from "./utils.js";

export async function typesetMath()
{
	if (window.MathJax === undefined)
	{
		window.MathJax = {
			loader:
			{
				load: ["[tex]/texhtml"],

				paths:
				{
					"mathjax-newcm": "/scripts/mathjax/mathjax-newcm-font"
				}
			},

			tex:
			{
				inlineMath: { "[+]": [["$", "$"]] },
				allowTexHTML: true,
				packages: { "[+]": ["texhtml"] },
			},

			output:
			{
				displayOverflow: "overflow",
				linebreaks:
				{
					inline: false,
				}
			}
		};
		
		await loadScript("/scripts/mathjax/tex-svg.js");

		return;
	}

	await window.MathJax.typesetPromise();
}