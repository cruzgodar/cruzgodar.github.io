"use strict";

!async function()
{
	await Site.load_applet("hitomezashi-patterns");
	
	const applet = new HitomezashiPattern(Page.element.querySelector("#output-canvas"));
	
	
	
	function run()
	{
		const resolution = parseInt(resolution_input_element.value || 2000);
		const grid_size = parseInt(grid_size_input_element.value || 50);
		const row_prob = parseFloat(row_prob_input_element.value || .5);
		const col_prob = parseFloat(col_prob_input_element.value || .5);
		const do_draw_boundaries = draw_boundaries_checkbox_element.checked;
		const do_draw_regions = draw_regions_checkbox_element.checked;
		const maximum_speed = maximum_speed_checkbox_element.checked;
		
		applet.run(resolution, grid_size, row_prob, col_prob, do_draw_boundaries, do_draw_regions, maximum_speed);
	}
	
	
	
	const generate_button_element = Page.element.querySelector("#generate-button");

	generate_button_element.addEventListener("click", run);
	
	
	
	const resolution_input_element = Page.element.querySelector("#resolution-input");
	
	const grid_size_input_element = Page.element.querySelector("#grid-size-input");
	
	const row_prob_input_element = Page.element.querySelector("#row-prob-input");
	
	const col_prob_input_element = Page.element.querySelector("#col-prob-input");
	
	const draw_boundaries_checkbox_element = Page.element.querySelector("#toggle-draw-boundaries-checkbox");
	
	const draw_regions_checkbox_element = Page.element.querySelector("#toggle-draw-regions-checkbox");
	
	const maximum_speed_checkbox_element = Page.element.querySelector("#toggle-maximum-speed-checkbox");
	
	draw_boundaries_checkbox_element.checked = true;
	
	draw_regions_checkbox_element.checked = true;
	
	
	
	[resolution_input_element, grid_size_input_element, row_prob_input_element, col_prob_input_element].forEach(element =>
	{
		element.addEventListener("keydown", (e) =>
		{
			if (e.keyCode === 13)
			{
				run();
			}
		});
	});
	
	
	
	draw_boundaries_checkbox_element.addEventListener("input", () =>
	{
		if (!draw_boundaries_checkbox_element.checked && !draw_regions_checkbox_element.checked)
		{
			draw_regions_checkbox_element.checked = true;
		}
	});
	
	draw_regions_checkbox_element.addEventListener("input", () =>
	{
		if (!draw_boundaries_checkbox_element.checked && !draw_regions_checkbox_element.checked)
		{
			draw_boundaries_checkbox_element.checked = true;
		}
	});
	
	
	
	const download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		applet.wilson.download_frame("a-hitomezashi-pattern.png");
	});
	
	
	
	Page.show();
}()