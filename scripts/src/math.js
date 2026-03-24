// The import is only to utils, so this file is safe for e.g. slides to import

import { loadScript } from "./utils.js";

let loadingMathJaxPromise = null;

export async function typesetMath()
{
	if (loadingMathJaxPromise)
	{
		return loadingMathJaxPromise;
	}

	if (window.MathJax === undefined)
	{
		loadingMathJaxPromise = (async () =>
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
			await window.MathJax.startup.promise;

			loadingMathJaxPromise = null;
		})();

		return loadingMathJaxPromise;
	}

	await window.MathJax.typesetPromise();
}