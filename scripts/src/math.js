// The import is only to utils, so this file is safe for e.g. slides to import

import { loadScript } from "./utils.js";

let loadingMathJaxPromise = null;

function typesetRemainingMathInBackground()
{
	// Delay to let scroll restoration (~1s) and scroll-save debounce settle.
	setTimeout(() =>
	{
		const BATCH_SIZE = 8;
		const doc = MathJax.startup.document;

		const pendingIds = [];

		for (const [id, item] of doc.lazyList.items)
		{
			if (item.lazyCompile || item.lazyTypeset)
			{
				pendingIds.push(id);
			}
		}

		if (pendingIds.length === 0)
		{
			return;
		}

		let index = 0;

		const scheduleIdle = window.requestIdleCallback
			? (fn) => requestIdleCallback(fn)
			: (fn) => setTimeout(fn, 10);

		function processBatch()
		{
			const end = Math.min(index + BATCH_SIZE, pendingIds.length);

			for (let i = index; i < end; i++)
			{
				const id = pendingIds[i];
				const item = doc.lazyList.get(id);

				if (item && (item.lazyCompile || item.lazyTypeset))
				{
					doc.lazySet.add(id);
				}
			}

			index = end;

			if (!doc.lazyIdle && doc.lazySet.size > 0)
			{
				doc.lazyIdle = true;
				doc.lazyProcessSet();
			}

			if (index < pendingIds.length)
			{
				scheduleIdle(processBatch);
			}
			else if (window.DEBUG)
			{
				console.log("Background MathJax typesetting complete");
			}
		}

		scheduleIdle(processBatch);
	}, 2000);
}

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

			typesetRemainingMathInBackground();

			loadingMathJaxPromise = null;
		})();

		return loadingMathJaxPromise;
	}

	const dropdowns = Array.from(document.body.querySelectorAll(".dropdown"));
	window.MathJax.startup.document.options.lazyAlwaysTypeset =
		dropdowns.length > 0 ? dropdowns : null;

	await window.MathJax.typesetPromise();

	typesetRemainingMathInBackground();
}