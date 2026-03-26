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
			const dropdowns = Array.from(document.body.querySelectorAll(".dropdown"));
			const lazyAlwaysTypeset = dropdowns.length > 0 ? dropdowns : null;

			window.MathJax = {
				loader:
				{
					load: ["[tex]/texhtml", "ui/lazy"],

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
				},

				options:
				{
					lazyAlwaysTypeset,
				}
			};

			await loadScript("/scripts/mathjax/tex-svg.js");
			await window.MathJax.startup.promise;

			loadingMathJaxPromise = null;
		})();

		return loadingMathJaxPromise;
	}

	const dropdowns = Array.from(document.body.querySelectorAll(".dropdown"));
	window.MathJax.startup.document.options.lazyAlwaysTypeset =
		dropdowns.length > 0 ? dropdowns : null;

	await window.MathJax.typesetPromise();
}