!async function()
{
	await Site.load_applet("double-pendulum-fractal");
	
	const applet = new DoublePendulumFractal(Page.element.querySelector("#output-canvas"), Page.element.querySelector("#pendulum-canvas"));
	
	
	
	function run()
	{
		const resolution = parseInt(resolution_input_element.value || 1000);
		
		applet.run(resolution);
	}
	
	
	
	const resolution_input_element = Page.element.querySelector("#resolution-input");
	
	
	
	const generate_button_element = Page.element.querySelector("#generate-button");
	
	generate_button_element.addEventListener("click", run);
	
	
	
	const switch_pendulum_canvas_button_element = Page.element.querySelector("#switch-pendulum-canvas-button");
	
	switch_pendulum_canvas_button_element.addEventListener("click", () =>
	{
		if (applet.drawing_fractal)
		{
			applet.drawing_fractal = false;
			
			Page.Animate.change_opacity(switch_pendulum_canvas_button_element, 0, Site.opacity_animation_time)
			
			.then(() =>
			{
				switch_pendulum_canvas_button_element.textContent = "Return to Fractal";
				
				Page.Animate.change_opacity(switch_pendulum_canvas_button_element, 1, Site.opacity_animation_time);
			});
		}
		
		else
		{
			applet.drawing_fractal = true;
			
			//What the actual fuck
			applet.hide_pendulum_drawer_canvas();
			
			
			
			Page.Animate.change_opacity(switch_pendulum_canvas_button_element, 0, Site.opacity_animation_time)
			
			.then(() =>
			{
				switch_pendulum_canvas_button_element.textContent = "Pick Pendulum";
				
				Page.Animate.change_opacity(switch_pendulum_canvas_button_element, 1, Site.opacity_animation_time);
			});
		}
	});
	
	
	
	const download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () => applet.wilson.download_frame("the-double-pendulum-fractal.png"));
	
	
	
	Page.show();
}()