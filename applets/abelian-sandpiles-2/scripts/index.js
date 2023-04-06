"use strict";

!async function()
{
	await Site.load_applet("abelian-sandpiles-2");
	
	const applet = new AbelianSandpile(Page.element.querySelector("#output-canvas"));
	
	
	
	function run()
	{
		const num_grains = parseInt(num_grains_input_element.value || 10000);
		const computations_per_frame = parseInt(computations_per_frame_input_element.value || 25);
		
		applet.run(num_grains, computations_per_frame);
	}
	
	
	
	const num_grains_input_element = Page.element.querySelector("#num-grains-input");
	const computations_per_frame_input_element = Page.element.querySelector("#computations-per-frame-input");
	
	
	
	const generate_button_element = Page.element.querySelector("#generate-button");
	
	generate_button_element.addEventListener("click", run);
	
	
	
	const download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () => applet.wilson.download_frame("a-gravner-griffeath-snowflake.png"));
	
	
	
	Page.show();
}()