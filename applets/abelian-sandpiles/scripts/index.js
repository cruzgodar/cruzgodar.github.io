"use strict";

!async function()
{
	await Site.load_applet("abelian-sandpiles");
	
	const applet = new AbelianSandpile(Page.element.querySelector("#output-canvas"));
	
	
	
	function run()
	{
		const num_grains = parseInt(num_grains_input_element.value || 10000);
		const maximum_speed = maximum_speed_checkbox_element.checked;
		
		applet.run(num_grains, maximum_speed);
	}
	
	
	
	const generate_button_element = Page.element.querySelector("#generate-button");

	generate_button_element.addEventListener("click", run);
	
	
	
	const num_grains_input_element = Page.element.querySelector("#num-grains-input");
	
	num_grains_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			run();
		}
	});
	
	
	
	const maximum_speed_checkbox_element = Page.element.querySelector("#toggle-maximum-speed-checkbox");
	
	
	
	const download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () => applet.wilson.download_frame("an-abelian-sandpile.png"));
	
	
	
	Page.show();
}()