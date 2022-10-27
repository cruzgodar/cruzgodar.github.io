!async function()
{
	//The scripts we need to count are the site-wide scripts and the page-specific ones.
	
	let total_lines = 0;
	
	let filenames =
	[
		"animation.js",
		"banners.js",
		"browser.js",
		"complex-glsl.js",
		"components.js",
		"footer.js",
		"images.js",
		"layout.js",
		"main.js",
		"navigation.js",
		"page-load.js",
		"presentations.js",
		"settings.js",
		"sitemap.js"
	];
	
	for (let i = 0; i < filenames.length; i++)
	{
		let response = await fetch(`/scripts/src/${filenames[i]}`);
		
		let data = await response.text();
		
		let num_lines = data.split("\n").length;
		
		console.log(`${filenames[i]}: ${num_lines}`);
		
		total_lines += num_lines;
	}
	
	for (let key in Site.sitemap)
	{
		let name = key.slice(key.lastIndexOf("/", key.length - 2) + 1, key.length - 1);
		
		let response = await fetch(`${key}scripts/${name}.js`);
		
		let data = await response.text();
		
		let num_lines = data.split("\n").length;
		
		if (num_lines === 1)
		{
			continue;
		}
		
		console.log(`${name}.js: ${num_lines}`);
		
		total_lines += num_lines;
	}
	
	console.log(`Grand total: ${total_lines}`);
}()