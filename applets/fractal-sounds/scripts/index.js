"use strict";

!async function()
{
	await Site.load_applet("fractal-sounds");
	
	const applet = new FractalSounds(Page.element.querySelector("#output-canvas"), Page.element.querySelector("#line-drawer-canvas"));
	
	applet.load_promise.then(() => run());
	
	
	
	function run()
	{
		const glsl_code = examples[fractal_selector_dropdown_element.value][0];
		const js_code = examples[fractal_selector_dropdown_element.value][1];
		const resolution = parseInt(resolution_input_element.value || 500);
		const exposure = parseFloat(exposure_input_element.value || 1);
		const num_iterations = parseInt(num_iterations_input_element.value || 200);
		
		applet.run(glsl_code, js_code, resolution, exposure, num_iterations);
	}
	
	
	
	const examples = 
	{
		"mandelbrot": ["cmul(z, z) + c", (x, y, a, b) => [x*x - y*y + a, 2*x*y + b]],
		"sfx": ["cmul(z, dot(z, z)) - cmul(z, c*c)", (x, y, a, b) => [x*x*x + x*y*y - x*a*a + y*b*b, x*x*y - x*b*b + y*y*y - y*a*a]],
		"burning-ship": ["-vec2(z.x * z.x - z.y * z.y, 2.0 * abs(z.x * z.y)) + c", (x, y, a, b) => [-(x*x - y*y) + a, -(2 * Math.abs(x * y)) + b]],
		"feather": ["cdiv(cmul(cmul(z, z), z), ONE + z*z) + c", (x, y, a, b) => [a + (x*x*x*x*x + x*x*x*(1 - 3*y*y) + 3*x*x*y*y*y - 3*x*y*y - y*y*y*y*y) / (x*x*x*x + 2*x*x + y*y*y*y + 1), b + (y*(3*x*x*x*x - x*x*x*y - x*x*(y*y - 3) + 3*x*y*y*y - y*y)) / (x*x*x*x + 2*x*x + y*y*y*y + 1)]],
		"duffing": ["vec2(z.y, -c.y * z.x + c.x * z.y - z.y * z.y * z.y)", (x, y, a, b) => [y, -b*x + a*y - y*y*y]],
		"ikeda": ["vec2(1.0 + c.x * (z.x * cos(.4 - 6.0 / (1.0 + dot(z, z))) - z.y * sin(.4 - 6.0 / (1.0 + dot(z, z)))), c.y * (z.x * sin(.4 - 6.0 / (1.0 + dot(z, z))) + z.y * cos(.4 - 6.0 / (1.0 + dot(z, z)))))", (x, y, a, b) => [1.0 + a * (x * Math.cos(.4 - 6.0 / (1.0 + x*x + y*y)) - y * Math.sin(.4 - 6.0 / (1.0 + x*x + y*y))), b * (x * Math.sin(.4 - 6.0 / (1.0 + x*x + y*y)) + y * Math.cos(.4 - 6.0 / (1.0 + x*x + y*y)))]]
	};
	
	const fractal_selector_dropdown_element = Page.element.querySelector("#fractal-selector-dropdown");
	
	fractal_selector_dropdown_element.addEventListener("input", run);
	
	

	const resolution_input_element = Page.element.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("input", () =>
	{
		applet.resolution = parseInt(resolution_input_element.value || 500);
		
		applet.change_aspect_ratio();
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
	
	
	
	const download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		applet.wilson.download_frame("a-sound-fractal.png");
	});
	
	
	
	Page.show();
}()