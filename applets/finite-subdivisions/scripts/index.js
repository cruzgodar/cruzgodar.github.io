"use strict";

!async function()
{
	await Site.load_applet("finite-subdivisions");
	
	const applet = new FiniteSubdivision(Page.element.querySelector("#output-canvas"));
	
	
	
	function run()
	{
		const num_vertices = parseInt(num_vertices_input_element.value || 6);
		const num_iterations = parseInt(num_iterations_input_element.value || 5);
		const maximum_speed = maximum_speed_checkbox_element.checked;
		
		applet.run(num_vertices, num_iterations, maximum_speed);
	}
	

	
	const generate_button_element = Page.element.querySelector("#generate-button");

	generate_button_element.addEventListener("click", run);
	
	
	
	const num_vertices_input_element = Page.element.querySelector("#num-vertices-input");
	
	num_vertices_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			run();
		}
	});
	
	
	
	const num_iterations_input_element = Page.element.querySelector("#num-iterations-input");
	
	num_iterations_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			run();
		}
	});
	
	
	
	const maximum_speed_checkbox_element = Page.element.querySelector("#toggle-maximum-speed-checkbox");
	
	
	
	const download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () => applet.wilson.download_frame("a-finite-subdivision.png"));
	
	
	
	Page.show();
}()