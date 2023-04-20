"use strict";

!async function()
{
	await Site.load_applet("generalized-julia-sets");
	
	const switch_julia_mode_button_element = Page.element.querySelector("#switch-julia-mode-button");
	
	switch_julia_mode_button_element.style.opacity = 1;
	
	const applet = new GeneralizedJuliaSet(Page.element.querySelector("#output-canvas"), "cadd(cpow(z, 2.0), c)", switch_julia_mode_button_element);
	
	applet.load_promise.then(() => run());
	
	
	
	function run()
	{
		const generating_code = code_input_element.value || "cadd(cpow(z, 2.0), c)";
		
		const resolution = parseInt(resolution_input_element.value || 500);
		const exposure = parseFloat(exposure_input_element.value || 1);
		const num_iterations = parseInt(num_iterations_input_element.value || 200);
		
		applet.run(generating_code, resolution, exposure, num_iterations);
	}
	
	
	
	const code_input_element = Page.element.querySelector("#code-textarea");
	
	code_input_element.value = "cadd(cpow(z, 2.0), c)";
	
	code_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			e.preventDefault();
			
			use_new_code();
		}
	});
	
	
	
	const examples =
	{
		"mandelbrot": "cadd(cpow(z, 2.0), c)",
		"var-exp": "cadd(cpow(z, 4.0), c)",
		"trig": "csin(cmul(z, c))",
		"burning-ship": "cadd(cpow(vec2(abs(z.x), -abs(z.y)), 2.0), c)",
		"rational-map": "cadd(csub(cpow(z, 2.0), cmul(.05, cpow(z, -2.0))), c)",
		"mandelbrot-dust": "cadd(csub(cpow(z, 2.0), vec2(0.0, cmul(.05, cpow(z, -2.0).y))), c)"
	};
	
	const example_selector_dropdown_element = Page.element.querySelector("#example-selector-dropdown");
	
	example_selector_dropdown_element.addEventListener("input", () =>
	{
		if (example_selector_dropdown_element.value === "none")
		{
			return;
		}
		
		code_input_element.value = examples[example_selector_dropdown_element.value];
		
		run();
	});
	
	
	
	const resolution_input_element = Page.element.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("input", () =>
	{
		applet.resolution = parseInt(resolution_input_element.value || 500);
		
		applet.wilson.change_canvas_size(applet.resolution, applet.resolution);
		
		applet.draw_frame();
	});
	
	
	
	const exposure_input_element = Page.element.querySelector("#exposure-input");
	
	exposure_input_element.addEventListener("input", () =>
	{
		applet.exposure = parseFloat(exposure_input_element.value || 1);
		
		applet.draw_frame();
	});
	
	
	
	const num_iterations_input_element = Page.element.querySelector("#num-iterations-input");
	
	num_iterations_input_element.addEventListener("input", () =>
	{
		applet.num_iterations = parseInt(num_iterations_input_element.value || 200);
		
		applet.draw_frame();
	});
	
	
	
	const generate_button_element = Page.element.querySelector("#generate-button");
	
	generate_button_element.addEventListener("click", run);
	
	
	
	switch_julia_mode_button_element.addEventListener("click", () => applet.switch_julia_mode());
	
	
	
	const download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		applet.wilson.download_frame("a-generalized-julia-set.png");
	});
	
	
	
	Page.show();
}()