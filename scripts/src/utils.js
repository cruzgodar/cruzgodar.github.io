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

export function downloadString(text, filename)
{
	const blob = new Blob([text], { type: "text/plain" });
	const url = URL.createObjectURL(blob);
	
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.click();
	
	URL.revokeObjectURL(url);
}

export async function asyncFetch(url)
{
	const response = await fetch(url);
	const text = await response.text();
	return text;
}

export async function animate(
	update,
	duration,
	easing = "easeOutQuad",
) {
	if (duration === 0)
	{
		update(1);
		return;
	}
	
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

export function fuzzySearch(query, names, threshold = 0.3)
{
	const results = [];
	const lowerQuery = query.toLowerCase();
	
	for (const name of names)
	{
		const score = calculateSimilarity(lowerQuery, name.toLowerCase());
		
		if (score >= threshold)
		{
			results.push({ name, score });
		}
	}
	
	// Sort by score (highest first)
	return results
		.sort((a, b) => b.score - a.score)
		.map(result => result.name);
}

function calculateSimilarity(query, target)
{
	// Handle exact matches
	if (query === target)
	{
		return 1.0;
	}
	
	// Handle empty strings
	if (query.length === 0 || target.length === 0)
	{
		return 0;
	}
	
	// Strong bias for starts-with matches
	if (target.startsWith(query))
	{
		return 0.95 + (0.05 * (query.length / target.length));
	}
	
	// Check for matches at word boundaries (after spaces)
	const words = target.split(" ");
	for (const word of words)
	{
		if (word.startsWith(query))
		{
			return 0.85 + (0.1 * (query.length / word.length));
		}
	}
	
	// Substring match (but not at start)
	if (target.includes(query))
	{
		return 0.6 + (0.2 * (query.length / target.length));
	}
	
	// Calculate positional character matching with heavy start bias
	let score = 0;
	let queryIndex = 0;
	
	for (let i = 0; i < target.length && queryIndex < query.length; i++)
	{
		if (target[i] === query[queryIndex])
		{
			// Give much higher weight to earlier matches
			const positionWeight = 1.0 - (i / target.length * 0.8);
			score += positionWeight;
			queryIndex++;
		}
	}
	
	// Normalize by query length
	return Math.min(score / query.length, 0.5); // Cap at 0.5 for non-substring matches
}

export function shuffleArray(array)
{
	for (let i = 0; i < array.length - 1; i++)
	{
		const j = Math.floor(Math.random() * (array.length - i - 1)) + i;

		const temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}

// Gets a random hue between 200-360 and 0-45.
export function getRandomNonGreenHue()
{
	return ((Math.random() * (160 + 45) + 200) % 360) / 360;
}

// Finds named properties in a (usually Desmos calculator) object.
export function searchProperties(obj, regex, seen = new WeakSet(), path = "")
{
	const results = [];

	if (obj === null || typeof obj !== "object")
	{
		return results;
	}

	if (seen.has(obj))
	{
		return results;
	}

	seen.add(obj);

	for (const key of Object.keys(obj))
	{
		const currentPath = path
			? `${path}.${key}`
			: key;

		if (regex.test(key))
		{
			results.push({ path: currentPath, key, value: obj[key] });
		}

		if (obj[key] !== null && typeof obj[key] === "object")
		{
			results.push(...searchProperties(obj[key], regex, seen, currentPath));
		}
	}

	return results;
}