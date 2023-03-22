"use strict";

!async function()
{
	await Site.load_applet("complex-maps");
	await Site.load_applet("complex-tori");
	
	const ec_applet = new EllipticCurve(Page.element.querySelector("#ec-plot-canvas"));
	
	Page.set_element_styles(".wilson-applet-canvas-container", "margin-top", "0", true);
	Page.set_element_styles(".wilson-applet-canvas-container", "margin-bottom", "0", true);
	
	
	
	function run()
	{
		/*
		wilson_g2.draggables.world_coordinates[0] = [g2, g3];
		wilson_g2.draggables.recalculate_locations();
		*/
		
		const g2 = parseInt(g2_slider_element.value || 5000) / 1000 - 5;
		const g3 = parseInt(g3_slider_element.value || 5000) / 1000 - 5;
		
		g2_slider_value_element.textContent = Math.round(g2 * 1000) / 1000;
		g3_slider_value_element.textContent = Math.round(g3 * 1000) / 1000;
		
		ec_applet.run(g2, g3);
	}
	
	
	
	const resolution_input_element = Page.element.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("input", () =>
	{
		const resolution = parseInt(resolution_input_element.value || 500);
		
		ec_applet.change_resolution(resolution);
	});
	
	
	
	const g2_slider_element = Page.element.querySelector("#g2-slider");
	g2_slider_element.addEventListener("input", run);
	
	const g2_slider_value_element = Page.element.querySelector("#g2-slider-value");
	g2_slider_value_element.textContent = "-2";
	
	
	
	const g3_slider_element = Page.element.querySelector("#g3-slider");
	g3_slider_element.addEventListener("input", run);
	
	const g3_slider_value_element = Page.element.querySelector("#g3-slider-value");
	g3_slider_value_element.textContent = "0";
	
	
	
	const download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		/* wilson_wp.download_frame("wp.png"); */
	});
	
	
	
	Page.show();
}()