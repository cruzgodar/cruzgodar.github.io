!function()
{
	let callbacks =
	{
		1: function()
		{
			let slide = Page.Presentation.get_current_slide();
		}
	};
	
	
	
	Page.Presentation.init(callbacks);
	
	Page.show();
	
	
	
	let options =
	{
		renderer: "cpu",
		
		canvas_width: 1000,
		canvas_height: 1000,
		
		
		
		use_fullscreen: true,
	
		use_fullscreen_button: true,
		
		enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
		exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png"
	};
	
	let wilson = new Wilson(Page.element.querySelector("#output-canvas"), options);
	
	wilson.ctx.fillStyle = "rgb(0, 0, 0)";
	wilson.ctx.fillRect(0, 0, 1000, 1000);
}()