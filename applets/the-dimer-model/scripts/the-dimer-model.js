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
	
	let wilson = new Wilson(document.querySelector("#output-canvas"), options);
	
	
	
	let image_size = 100;
	
	let graph_separation = 5;
	
	const row_stretch = Math.sqrt(3);
	
	
	
	let generate_button_element = document.querySelector("#generate-button");

	generate_button_element.addEventListener("click", draw_hex_graph);
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("an-abelian-sandpile.png");
	});
	
	
	
	function draw_hex_graph()
	{
		wilson.change_canvas_size(image_size, image_size);
		
		
		
		wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		wilson.ctx.fillRect(0, 0, image_size, image_size);
		
		wilson.ctx.fillStyle = "rgb(255, 255, 255)";
		
		
		let odd_row = false;
		
		
		for (let i = graph_separation; i <= image_size - graph_separation; i += graph_separation)
		{
			if (odd_row)
			{
				for (let j = image_size / 2 - i; j <= image_size / 2 + i; j += graph_separation)
				{
					wilson.ctx.fillRect(j, i, 1, 1);
				}
			}
			
			else
			{
				for (let j = image_size / 2 - i * row_stretch; j <= image_size / 2 + i * row_stretch; j += graph_separation)
				{
					wilson.ctx.fillRect(j, i, 1, 1);
				}
			}
			
			odd_row = !odd_row;
		}
	}
}()