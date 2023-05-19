"use strict";

!async function()
{
	await Site.load_applet("quasi-fuchsian-groups");
	
	const applet = new QuasiFuchsianGroups(Page.element.querySelector("#output-canvas"));
	
	
	
	const resolution_input_element = Page.element.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("input", () =>
	{
		applet.resolution_small = parseInt(resolution_input_element.value || 300);
		applet.resolution_large = parseInt(resolution_input_element.value || 300) * 3;
		
		applet.change_aspect_ratio();
	});
	
	
	
	const high_resolution_input_element = Page.element.querySelector("#high-resolution-input");
	
	const max_depth_input_element = Page.element.querySelector("#max-depth-input");
	
	const max_pixel_brightness_input_element = Page.element.querySelector("#max-pixel-brightness-input");
	
	const generate_button_element = Page.element.querySelector("#generate-button");
	
	generate_button_element.addEventListener("click", async () =>
	{
		const image_size = parseInt(high_resolution_input_element.value || 1000);
		const max_depth = parseInt(max_depth_input_element.value || 250);
		const max_pixel_brightness = parseInt(max_pixel_brightness_input_element.value || 50);
		
		await applet.request_high_res_frame(image_size, max_depth, max_pixel_brightness);
		
		applet.wilson.download_frame("a-quasi-fuchsian-group.png");
	});
	
	
	
	Page.show();
}()