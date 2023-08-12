import { sitemap } from "/scripts/src/sitemap.mjs";

!async function()
{
	//The scripts we need to count are the site-wide scripts and the page-specific ones.
	
	let totalLines = 0;
	
	let filenames =
	[
		"animation.js",
		"banners.js",
		"browser.js",
		"complex-glsl.js",
		"components.js",
		"footer.js",
		"images.js",
		"lapsa.js",
		"layout.js",
		"main.js",
		"navigation.js",
		"page-load.js",
		"settings.js",
		"sitemap.js"
	];
	
	for (let i = 0; i < filenames.length; i++)
	{
		let response = await fetch(`/scripts/src/${filenames[i]}`);
		
		let data = await response.text();
		
		let numLines = data.split("\n").length;
		
		console.log(`${filenames[i]}: ${numLines}`);
		
		totalLines += numLines;
	}
	
	for (let key in sitemap)
	{
		let name = key.slice(key.lastIndexOf("/", key.length - 2) + 1, key.length - 1);
		
		let response = await fetch(`${key}scripts/${name}.js`);
		
		let data = await response.text();
		
		let numLines = data.split("\n").length;
		
		if (numLines === 1)
		{
			continue;
		}
		
		console.log(`${name}.js: ${numLines}`);
		
		totalLines += numLines;
	}
	
	console.log(`Grand total: ${totalLines}`);
}()