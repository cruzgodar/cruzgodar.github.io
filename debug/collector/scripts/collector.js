!function()
{
	"use strict";
	
	
	
	let collect_js_button_element = Page.element.querySelector("#collect-js-button");
	
	collect_js_button_element.addEventListener("click", async () =>
	{
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
			"settings.js",
			"sitemap.js"
		];
		
		let bundle = "";
		
		for (let i = 0; i < filenames.length; i++)
		{
			let response = await fetch(`/scripts/src/${filenames[i]}`);
			
			let data = await response.text();
			
			bundle += data;
			bundle += "\n\n";
		}
		
		let element = document.createElement("textarea");
		
		//element.style.display = "hidden";
		Page.element.appendChild(element);
		
		element.textContent = bundle;
		
		element.focus();
		
		setTimeout(() =>
		{
			element.select();
			document.execCommand("copy");
			//element.remove();
			
			console.log("Copied JS to clipboard!");
		}, 100);
	});
	
	
	
	let collect_css_button_element = Page.element.querySelector("#collect-css-button");
	
	collect_css_button_element.addEventListener("click", async () =>
	{
		let filenames =
		[
			"applets.css",
			"banners.css",
			"buttons-and-boxes.css",
			"header-and-footer.css",
			"image-links.css",
			"main.css",
			"notes.css",
			"progress.css",
			"writing.css"
		];
		
		let bundle = "";
		
		for (let i = 0; i < filenames.length; i++)
		{
			let response = await fetch(`/style/src/${filenames[i]}`);
			
			let data = await response.text();
			
			bundle += data;
			bundle += "\n\n";
		}
		
		let element = document.createElement("textarea");
		
		//element.style.display = "hidden";
		Page.element.appendChild(element);
		
		element.textContent = bundle;
		
		element.focus();
		
		setTimeout(() =>
		{
			element.select();
			document.execCommand("copy");
			//element.remove();
			
			console.log("Copied CSS to clipboard!");
		}, 100);
	});
	
	Page.show();
}()