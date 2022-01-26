!function()
{
	"use strict";
	
	
	
	let grid_size = 20;
	
	let resolution = 3000;
	
	let num_colors = 3;
	
	let parities = new Array(grid_size);
	
	for (let i = 0; i < grid_size; i++)
	{
		parities[i] = new Array(grid_size);
	}
	
	parities[0][0] = 1;
	
	
	
	let options =
	{
		renderer: "cpu",
		
		canvas_width: 3000,
		canvas_height: 3000,
		
		
		
		use_fullscreen: true,
	
		use_fullscreen_button: true,
		
		enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
		exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png"
	};
	
	let wilson = new Wilson(document.querySelector("#output-canvas"), options);
	

	
	let generate_button_element = document.querySelector("#generate-button");

	generate_button_element.addEventListener("click", draw_pascals_triangle);
	
	
	
	let num_colors_input_element = document.querySelector("#num-colors-input");
	
	num_colors_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			draw_pascals_triangle();
		}
	});
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("pascals-triangle.png");
	});
	
	
	
	function draw_pascals_triangle()
	{
		num_colors = parseInt(num_colors_input_element.value || 3);
		
		
		
		wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		wilson.ctx.fillRect(0, 0, resolution, resolution);
		
		
		
		draw_hexagon(0, 0);
		
		for (let i = 1; i < grid_size; i++)
		{
			parities[i][0] = 1;
			parities[i][i] = 1;
			
			for (let j = 1; j < i; j++)
			{
				parities[i][j] = (parities[i - 1][j - 1] + parities[i - 1][j]) % num_colors;
			}
		}
		
		
		
		for (let i = 0; i < grid_size; i++)
		{
			for (let j = 0; j <= i; j++)
			{
				draw_hexagon(i, j);
			}
		}
	}
	
	
	
	function draw_hexagon(row, col)
	{
		let center_x = (col - Math.floor(row / 2)) * resolution / (grid_size + 2) + resolution / 2;
		
		if (row % 2 === 1)
		{
			center_x -= .5 * resolution / (grid_size + 2);
		}
		
		let center_y = (row + 1) * Math.sqrt(3) / 2 * resolution / (grid_size + 2);
		
		
		
		let rgb = wilson.utils.hsv_to_rgb(parities[row][col] / num_colors, 1, 1);
		
		wilson.ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
		wilson.ctx.fillRect(center_x, center_y, 10, 10);
	}
}()