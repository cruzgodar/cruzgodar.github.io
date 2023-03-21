"use strict";

!async function()
{
	await Site.load_applet("barnsley-fern");
	
	const applet = new BarnsleyFern(Page.element.querySelector("#output-canvas"));
	
	
	
	function run()
	{
		const num_iterations = 1000 * parseInt(num_iterations_input_element.value || 10000);
		
		applet.run(num_iterations);
	}
	
	
	
	const generate_button_element = Page.element.querySelector("#generate-button");

	generate_button_element.addEventListener("click", run);
	
	
	
	const num_iterations_input_element = Page.element.querySelector("#num-iterations-input");
	
	num_iterations_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			run();
		}
	});
	
	
	
	const download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () => applet.wilson.download_frame("the-barnsley-fern.png"));
	
	
	
	Page.show();
}()