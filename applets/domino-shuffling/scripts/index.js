!async function()
{
	"use strict";
	
	await Site.load_applet("domino-shuffling");
	
	const applet = new DominoShuffling(Page.element.querySelector("#output-canvas"));
	
	
	
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
	
	
	
	const diamond_size_input_element = Page.element.querySelector("#diamond-size-input");
	
	diamond_size_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			run();
		}
	});
	
	
	
	const use_smooth_colors_checkbox_element = Page.element.querySelector("#use-smooth-colors-checkbox");
	use_smooth_colors_checkbox_element.checked = true;
	
	
	
	const download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		applet.wilson.download_frame("an-aztec-diamond.png");
	});



	function run()
	{
		const resolution = parseInt(resolution_input_element.value || 2000);
		const diamond_size = parseInt(diamond_size_input_element.value || 20) + 1;
		const use_smooth_colors = use_smooth_colors_checkbox_element.checked;
		
		applet.run(resolution, diamond_size, use_smooth_colors);
	}
	
	
	
	Page.show();
}()