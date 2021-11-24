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
	
	
	
	let image_size = 1000;
	
	let num_rows = null;
	let num_cols = null;
	
	//Must be even
	let row_separation = 25;
	
	let column_separation = Math.round(row_separation * 2 * Math.sqrt(3));
	
	let column_stagger = Math.round(column_separation / 2);
	
	
	
	let generate_button_element = document.querySelector("#generate-button");

	generate_button_element.addEventListener("click", draw_hex_graph);
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("an-abelian-sandpile.png");
	});
	
	
	
	/*
		With this coordinate system, the neighbors of a point (i, j) are:
		(i - 2, j)
		(i + 2, j)
		
		(i + 1, j)
		(i - 1, j)
		
		if i % 2 === 0:
			(i + 1, j - 1)
			(i - 1, j - 1)
		
		else
			(i + 1, j + 1)
			(i - 1, j + 1)
	*/
	
	function draw_point(i, j)
	{
		let j_modified = i % 2 === 1 ? j * column_separation + column_stagger : j * column_separation;
		
		wilson.ctx.fillRect(j_modified, (i + 1) * row_separation, 1, 1);
	}
	
	
	
	function draw_hex_graph()
	{
		let num_rows = Math.floor(image_size / row_separation) - 1;
		let num_cols = Math.floor(image_size / column_separation) + 1;
		
		wilson.change_canvas_size(image_size, image_size);
		
		
		
		wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		wilson.ctx.fillRect(0, 0, image_size, image_size);
		
		wilson.ctx.fillStyle = "rgb(255, 255, 255)";
		
		
		
		let odd_row = false;
		
		
		
		for (let i = 0; i < num_rows; i++)
		{
			for (let j = 0; j < num_cols; j++)
			{
				draw_point(i, j);
			}
		}
	}
}()