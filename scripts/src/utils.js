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