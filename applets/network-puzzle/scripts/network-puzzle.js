!function()
{
	"use strict";
	
	
	
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
	
	
	
	let resolution = 1000;
	
	let puzzle_size = 20;
	
	let pixels_per_grid = resolution / puzzle_size;
	
	let connections = new Array(puzzle_size);
	
	connections.forEach(element => element = new Array(puzzle_size));
	
	
	
	let last_timestamp = -1;
	
	
	
	let resolution_input_element = Page.element.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("input", update_size);
	
	
	
	let puzzle_size_input_element = Page.element.querySelector("#puzzle-size-input");
	
	puzzle_size_input_element.addEventListener("input", update_size);
	
	
	
	let download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () => wilson.download_frame("a-network-puzzle.png"));
	
	
	
	wilson.ctx.fillStyle = "rgb(0, 0, 0)";
	wilson.ctx.fillRect(0, 0, resolution, resolution);
	
	window.requestAnimationFrame(draw_frame);
	
	Page.show();
	
	
	
	function draw_frame()
	{
		let time_elapsed = timestamp - last_timestamp;
		
		last_timestamp = timestamp;
		
		
		
		if (time_elapsed === 0)
		{
			return;
		}
		
		
		
		for (let i = 0; i < puzzle_size; i++)
		{
			for (let j = 0; j < puzzle_size; j++)
			{
				
			}
		}

		
		window.requestAnimationFrame(draw_frame);
	}
}()