"use strict";

!async function()
{
	await Site.load_applet("snowflakes");
	
	const applet = new GravnerGriffeathSnowflake(Page.element.querySelector("#output-canvas"));
	
	
	
	function run()
	{
		/*
		const generating_code = code_textarea_element.value;
		const resolution = parseInt(resolution_input_element.value || 500);
		const max_particles = Math.max(parseInt(max_particles_input_element.value || 5000), 100)
		const dt = parseFloat(speed_input_element.value || 1) / 75;
		*/
		
		applet.run();
	}
	
	
	
	const generate_button_element = Page.element.querySelector("#generate-button");
	
	generate_button_element.addEventListener("click", run);
	
	
	
	const download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () => applet.wilson.download_frame("a-vector-field.png"));
	
	
	
	Page.show();
}()