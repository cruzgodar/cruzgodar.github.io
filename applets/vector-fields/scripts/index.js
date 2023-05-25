"use strict";

!async function()
{
	await Site.load_applet("vector-fields");
	
	const applet = new VectorField(Page.element.querySelector("#output-canvas"));
	
	applet.load_promise.then(() => run());
	
	
	
	function run()
	{
		const generating_code = code_textarea_element.value;
		const resolution = parseInt(resolution_input_element.value || 500);
		const max_particles = Math.max(parseInt(max_particles_input_element.value || 10000), 100);
		const dt = parseFloat(speed_input_element.value || 1) / 150;
		const lifetime = Math.min(parseInt(lifetime_input_element.value || 100), 255);
		
		applet.run(generating_code, resolution, max_particles, dt, lifetime);
	}
	
	
	
	function generate_new_field()
	{
		const resolution = parseInt(resolution_input_element.value || 500);
		const max_particles = Math.max(parseInt(max_particles_input_element.value || 10000), 100);
		const dt = parseFloat(speed_input_element.value || 1) / 150;
		const lifetime = Math.min(parseInt(lifetime_input_element.value || 100), 255);
		
		applet.generate_new_field(resolution, max_particles, dt, lifetime);
	}
	
	
	
	const examples =
	{
		"none": "",
		"div": "(x, y)",
		"curl": "(-y, x)",
		"clockwork": "(sin(y), sin(x + PI))",
		"df": "(1.0, sin(y) / (x*x + 1.0))",
		"cross": "(sin(y / 2.5), tan(x / 2.5))",
		"draggables": "(draggable_arg.x * x, x + draggable_arg.y * y)"
	};
	
	const example_selector_dropdown_element = Page.element.querySelector("#example-selector-dropdown");
	
	example_selector_dropdown_element.addEventListener("input", () =>
	{
		if (example_selector_dropdown_element.value !== "none")
		{
			code_textarea_element.value = examples[example_selector_dropdown_element.value];
			
			run();
		}
	});
	
	
	
	const code_textarea_element = Page.element.querySelector("#code-textarea");
	
	code_textarea_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			e.preventDefault();
			
			run();
		}
	});
	
	
	
	const generate_button_element = Page.element.querySelector("#generate-button");
	
	generate_button_element.addEventListener("click", run);
	
	
	
	const resolution_input_element = Page.element.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("input", generate_new_field);
	
	
	
	const max_particles_input_element = Page.element.querySelector("#max-particles-input");
	
	max_particles_input_element.addEventListener("input", generate_new_field);
	
	
	
	const speed_input_element = Page.element.querySelector("#speed-input");
	
	speed_input_element.addEventListener("input", () =>
	{
		const dt = parseFloat(speed_input_element.value || 1) / 150;
		
		applet.wilson_update.gl.useProgram(applet.wilson_update.render.shader_programs[0]);
		applet.wilson_update.gl.uniform1f(applet.wilson_update.uniforms["dt"][0], dt);
		
		applet.wilson_update.gl.useProgram(applet.wilson_update.render.shader_programs[1]);
		applet.wilson_update.gl.uniform1f(applet.wilson_update.uniforms["dt"][1], dt);
		
		applet.wilson_update.gl.useProgram(applet.wilson_update.render.shader_programs[2]);
		applet.wilson_update.gl.uniform1f(applet.wilson_update.uniforms["dt"][2], dt);
		
		applet.wilson_update.gl.useProgram(applet.wilson_update.render.shader_programs[3]);
		applet.wilson_update.gl.uniform1f(applet.wilson_update.uniforms["dt"][3], dt);
	});
	
	
	
	const lifetime_input_element = Page.element.querySelector("#lifetime-input");
	
	lifetime_input_element.addEventListener("input", generate_new_field);
	
	
	
	const download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () => applet.wilson.download_frame("a-vector-field.png"));
	
	
	
	Page.show();
}()