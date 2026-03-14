import { loadScript } from "./main.js";

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