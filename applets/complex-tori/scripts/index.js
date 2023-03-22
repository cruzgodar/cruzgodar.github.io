"use strict";

!async function()
{
	let g2 = -2;
	let g3 = 0;
	
	
	
	await Site.load_applet("complex-maps");
	await Site.load_applet("complex-tori");
	
	const ec_applet = new EllipticCurve(Page.element.querySelector("#ec-plot-canvas"));
	
	
	
	const uniform_code = "uniform float g2_arg; uniform float g3_arg;";
	
	const wp_applet = new ComplexMap(Page.element.querySelector("#wp-canvas"), "wp(z, inverse_g2_g3(g2_arg, g3_arg))", uniform_code);
	wp_applet.load_promise.then(() => wp_applet.wilson.render.init_uniforms(["g2_arg", "g3_arg"]));
	
	const wpprime_applet = new ComplexMap(Page.element.querySelector("#wpprime-canvas"), "wpprime(z, inverse_g2_g3(g2_arg, g3_arg))", uniform_code);
	wpprime_applet.load_promise.then(() => wpprime_applet.wilson.render.init_uniforms(["g2_arg", "g3_arg"]));
	
	const kleinj_applet = new ComplexMap(Page.element.querySelector("#kleinj-canvas"), "kleinJ(z)", "", 0, 1);
	
	const g2_applet = new ComplexMap(Page.element.querySelector("#g2-canvas"), "kleinj_from_g2_g3(z.x, z.y) * ONE", uniform_code, 0, 0, -.585, true, on_drag_draggable);
	g2_applet.load_promise.then(() =>
	{
		g2_applet.wilson.render.init_uniforms(["g2_arg", "g3_arg"]);
		
		run();
	});
	
	
	
	Page.set_element_styles(".wilson-applet-canvas-container", "margin-top", "0", true);
	Page.set_element_styles(".wilson-applet-canvas-container", "margin-bottom", "0", true);
	
	
	
	function run()
	{
		ec_applet.run(g2, g3);
		
		wp_applet.wilson.gl.uniform1f(wp_applet.wilson.uniforms["g2_arg"], g2);
		wp_applet.wilson.gl.uniform1f(wp_applet.wilson.uniforms["g3_arg"], g3);
		wp_applet.draw_frame();
		
		wpprime_applet.wilson.gl.uniform1f(wpprime_applet.wilson.uniforms["g2_arg"], g2);
		wpprime_applet.wilson.gl.uniform1f(wpprime_applet.wilson.uniforms["g3_arg"], g3);
		wpprime_applet.draw_frame();
		
		g2_applet.wilson.gl.uniform1f(g2_applet.wilson.uniforms["g2_arg"], g2);
		g2_applet.wilson.gl.uniform1f(g2_applet.wilson.uniforms["g3_arg"], g3);
		g2_applet.draw_frame();
	}
	
	
	
	const resolution_input_element = Page.element.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("input", () =>
	{
		const resolution = parseInt(resolution_input_element.value || 500);
		
		ec_applet.change_resolution(resolution);
		
		wp_applet.wilson.change_canvas_size(resolution, resolution);
		wpprime_applet.wilson.change_canvas_size(resolution, resolution);
		kleinj_applet.wilson.change_canvas_size(resolution, resolution);
		g2_applet.wilson.change_canvas_size(resolution, resolution);
		
		run();
	});
	
	
	
	const g2_slider_element = Page.element.querySelector("#g2-slider");
	g2_slider_element.addEventListener("input", () =>
	{
		g2 = parseInt(g2_slider_element.value || 5000) / 1000 - 5;
		g2_slider_value_element.textContent = Math.round(g2 * 1000) / 1000;
		
		g2_applet.wilson.draggables.world_coordinates[0][0] = g2;
		
		g2_applet.wilson.draggables.recalculate_locations();
		
		run();
	});
	
	const g2_slider_value_element = Page.element.querySelector("#g2-slider-value");
	g2_slider_value_element.textContent = "-2";
	
	
	
	const g3_slider_element = Page.element.querySelector("#g3-slider");
	g3_slider_element.addEventListener("input", () =>
	{
		g3 = parseInt(g3_slider_element.value || 5000) / 1000 - 5;
		g3_slider_value_element.textContent = Math.round(g3 * 1000) / 1000;
		
		g2_applet.wilson.draggables.world_coordinates[0][1] = g3;
		
		g2_applet.wilson.draggables.recalculate_locations();
		
		run();
	});
	
	const g3_slider_value_element = Page.element.querySelector("#g3-slider-value");
	g3_slider_value_element.textContent = "0";
	
	
	
	function on_drag_draggable(active_draggable, x, y, event)
	{
		g2 = x;
		g3 = y;
		
		g2_slider_value_element.textContent = Math.round(g2 * 1000) / 1000;
		g3_slider_value_element.textContent = Math.round(g3 * 1000) / 1000;
		
		run();
	}
	
	
	
	const download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () => wp_applet.wilson.download_frame("wp.png"));
	
	
	
	Page.show();
}()