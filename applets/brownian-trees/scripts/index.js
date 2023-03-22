"use strict";

!async function()
{
	await Site.load_applet("brownian-trees");
	
	const applet = new BrownianTree(Page.element.querySelector("#output-canvas"));
	
	
	
	function run()
	{
		const resolution = parseInt(resolution_input_element.value || 1000);
		
		applet.run(resolution);
	}
	
	
	
	const generate_button_element = Page.element.querySelector("#generate-button");

	generate_button_element.addEventListener("click", run);
	
	
	
	const resolution_input_element = Page.element.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			run();
		}
	});
	
	
	
	const download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () => wilson.download_frame("a-brownian-tree.png"));
	
	
	
	Page.show();
}()