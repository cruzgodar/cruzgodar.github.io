// The import is only to utils, so this file is safe for e.g. slides to import

import { loadScript } from "./utils.js";

export async function typesetMath()
{
	if (window.MathJax === undefined)
	{
		window.MathJax = {
			tex:
			{
				inlineMath: { "[+]": [["$", "$"]] }
			},

			loader:
			{
				paths:
				{
					"mathjax-newcm": "/scripts/mathjax/mathjax-newcm-font"
				}
			}
		};
		
		await loadScript("/scripts/mathjax/tex-svg.js");

		return;
	}

	window.MathJax.typeset();
}