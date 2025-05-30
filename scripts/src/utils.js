import anime from "../anime.js";

export function sleep(ms)
{
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function clamp(value, min, max)
{
	return Math.min(Math.max(value, min), max);
}

export function downloadFile(filename)
{
	const link = document.createElement("a");
	link.href = filename;
	link.download = filename.slice(filename.lastIndexOf("/") + 1);
	document.body.appendChild(link);
	link.click();
	link.remove();
}

export async function asyncFetch(url)
{
	return new Promise((resolve, reject) =>
	{
		const fetcher = new Worker("/scripts/src/asyncFetcher.js");

		fetcher.postMessage([url]);

		fetcher.onmessage = (e) =>
		{
			resolve(e.data[0]);
		};

		fetcher.onerror = reject;
	});
}

export async function animate(
	update,
	duration,
	easing = "easeOutQuad",
) {
	const dummy = { t: 0 };
	
	await anime({
		targets: dummy,
		t: 1,
		duration,
		easing,
		update: () => update(dummy.t),
		complete: () => update(1),
	}).finished;
}