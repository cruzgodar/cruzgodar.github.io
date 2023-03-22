"use strict";

!async function()
{
	await Site.load_applet("complex-maps");
	
	const applet = new ComplexMap(Page.element.querySelector("#output-canvas"), "cexp(cinv(z))", 0, 0, -.585, false);
	
	
	
	function run()
	{
		const generating_code = code_input_element.value || "cexp(cinv(z))";
		
		applet.run(generating_code, 0, 0, -.585);
	}
	
	
	
	const code_input_element = Page.element.querySelector("#code-textarea");
	
	code_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			e.preventDefault();
			
			run();
		}
	});
	
	
	
	const generate_button_element = Page.element.querySelector("#generate-button");
	
	generate_button_element.addEventListener("click", run);
	
	
	
	const selector_mode_button_element = Page.element.querySelector("#selector-mode-button");
	
	selector_mode_button_element.addEventListener("click", () => applet.use_selector_mode = true);
	
	
	
	const benchmark_button_element = Page.element.querySelector("#benchmark-button");
	
	benchmark_button_element.addEventListener("click", () => applet.run_benchmark());
	
	
	
	if (!DEBUG)
	{
		Page.element.querySelector("#debug-buttons").remove();
	}
	
	
	
	const resolution_input_element = Page.element.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("input", () =>
	{
		applet.resolution = parseInt(resolution_input_element.value || 500);
		
		applet.wilson.change_canvas_size(applet.resolution, applet.resolution);
		
		applet.draw_frame();
	});
	
	
	
	const black_point_input_element = Page.element.querySelector("#black-point-input");
	
	black_point_input_element.addEventListener("input", () =>
	{
		applet.black_point = parseFloat(black_point_input_element.value || 1);
		
		applet.draw_frame();
	});
	
	
	
	const white_point_input_element = Page.element.querySelector("#white-point-input");
	
	white_point_input_element.addEventListener("input", () =>
	{
		applet.white_point = parseFloat(white_point_input_element.value || 1);
		
		applet.draw_frame();
	});
	
	
	
	const download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () => applet.wilson.download_frame("a-complex-map.png"));
	
	
	
	const examples =
	{
		"none": "",
		"trig": "csin(z)",
		"poles": "cinv(cmul(csub(cpow(z, 6.0), 1.0), csub(cpow(z, 3.0), 1.0)))",
		"es": "cexp(cinv(z))",
		"tet": "ctet(z, 100.0)",
		"lattices": "wp(z, draggable_arg)"
	};
	
	const example_selector_dropdown_element = Page.element.querySelector("#example-selector-dropdown");
	
	example_selector_dropdown_element.addEventListener("input", () =>
	{
		if (example_selector_dropdown_element.value !== "none")
		{
			code_input_element.value = examples[example_selector_dropdown_element.value];
			
			run();
		}
	});
	
	
	
	Page.show();
}()