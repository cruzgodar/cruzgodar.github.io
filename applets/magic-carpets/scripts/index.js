"use strict";

!async function()
{
	await Site.load_applet("magic-carpets");
	
	const applet = new MagicCarpet(Page.element.querySelector("#output-canvas"));
	
	
	
	function run()
	{
		const grid_size = parseInt(grid_size_input_element.value || 6);
		const max_cage_size = parseInt(max_cage_size_input_element.value || 12);
		
		applet.run(grid_size, max_cage_size);
	}
	
	
	
	const generate_button_element = Page.element.querySelector("#generate-button");

	generate_button_element.addEventListener("click", run);
	
	
	
	const grid_size_input_element = Page.element.querySelector("#grid-size-input");
	
	grid_size_input_element.addEventListener("keydown", e =>
	{
		if (e.keyCode === 13)
		{
			run();
		}
	});
	
	
	
	const max_cage_size_input_element = Page.element.querySelector("#max-cage-size-input");
	
	max_cage_size_input_element.addEventListener("keydown", e =>
	{
		if (e.keyCode === 13)
		{
			run();
		}
	});
	
	
	
	const download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		applet.draw_grid(true);
		
		applet.wilson.download_frame("a-magic-carpet.png");
		
		applet.draw_grid(false);
	});
	
	
	
	Page.show();
}()