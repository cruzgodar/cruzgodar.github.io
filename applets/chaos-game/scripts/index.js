"use strict";

!async function()
{
	await Site.load_applet("chaos-game");
	
	const applet = new ChaosGame(Page.element.querySelector("#output-canvas"));
	
	
	
	function run()
	{
		const resolution = parseInt(resolution_input_element.value || 1000);
		const num_vertices = parseInt(num_vertices_input_element.value || 5);
		
		applet.run(resolution, num_vertices);
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
	
	
	
	const num_vertices_input_element = Page.element.querySelector("#num-vertices-input");
	
	num_vertices_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			run();
		}
	});
	
	
	
	const download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () => applet.wilson.download_frame("a-chaos-game.png"));
	
	
	
	Page.show();
}()