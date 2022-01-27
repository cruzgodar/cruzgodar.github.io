!function()
{
	"use strict";
	
	
	
	let grid_size = 20;
	let pixels_per_row = 0;
	
	let resolution = 3000;
	
	let num_colors = 3;
	
	let y_offset = 0;
	
	let parities = [];
	let coordinates = [];
	let colors = [];
	
	let last_timestamp = -1;
	
	let current_row = 0;
	let current_pixel = 0;
	
	
	
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
	
	
	
	let triangle_size_input_element = document.querySelector("#triangle-size-input");
	
	triangle_size_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			draw_pascals_triangle();
		}
	});
	
	
	
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
		grid_size = parseInt(triangle_size_input_element.value || 20);
		
		pixels_per_row = Math.round(resolution / (grid_size + 2));
		
		num_colors = parseInt(num_colors_input_element.value || 3);
		
		y_offset = (1 - Math.sqrt(3) / 2) * resolution / 2;
		
		current_row = 0;
		current_pixel = 0;
		
		
		
		parities = new Array(grid_size);
		colors = new Array(grid_size);
		
		for (let i = 0; i < grid_size; i++)
		{
			parities[i] = new Array(grid_size);
			colors[i] = new Array(grid_size);
		}
		
		parities[0][0] = 1;
		colors[0][0] = wilson.utils.hsv_to_rgb(1 / num_colors, 1, 1);
		
		
		
		coordinates = new Array(grid_size);
		
		for (let i = 0; i < grid_size; i++)
		{
			coordinates[i] = new Array(grid_size);
		}
		
		
		
		for (let i = 1; i < grid_size; i++)
		{
			parities[i][0] = 1;
			parities[i][i] = 1;
			
			colors[i][0] = [...colors[0][0]];
			colors[i][i] = [...colors[0][0]];
			
			for (let j = 1; j < i; j++)
			{
				parities[i][j] = (parities[i - 1][j - 1] + parities[i - 1][j]) % num_colors;
				
				colors[i][j] = wilson.utils.hsv_to_rgb(parities[i][j] / num_colors, 1, 1);
			}
		}
		
		
		
		for (let i = 0; i < grid_size; i++)
		{
			for (let j = 0; j <= i; j++)
			{
				coordinates[i][j] = get_coordinates(i, j);
			}
		}
		
		
		
		wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		wilson.ctx.fillRect(0, 0, resolution, resolution);
		
		wilson.ctx.lineWidth = 5;
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function draw_frame(timestamp)
	{
		let time_elapsed = timestamp - last_timestamp;
		
		last_timestamp = timestamp;
		
		if (time_elapsed === 0)
		{
			return;
		}
		
		
		
		for (let i = 0; i < 10; i++)
		{
			let old_t = current_pixel / pixels_per_row;
			let new_t = (current_pixel + 2) / pixels_per_row;
			
			
			
			for (let col = 0; col <= current_row; col++)
			{
				wilson.ctx.strokeStyle = `rgb(${colors[current_row][col][0] * (1 - old_t) + colors[current_row + 1][col][0] * old_t}, ${colors[current_row][col][1] * (1 - old_t) + colors[current_row + 1][col][1] * old_t}, ${colors[current_row][col][2] * (1 - old_t) + colors[current_row + 1][col][2] * old_t})`;
				
				wilson.ctx.beginPath();
				wilson.ctx.moveTo(coordinates[current_row][col][0] * (1 - old_t) + coordinates[current_row + 1][col][0] * old_t, coordinates[current_row][col][1] * (1 - old_t) + coordinates[current_row + 1][col][1] * old_t);
				wilson.ctx.lineTo(coordinates[current_row][col][0] * (1 - new_t) + coordinates[current_row + 1][col][0] * new_t, coordinates[current_row][col][1] * (1 - new_t) + coordinates[current_row + 1][col][1] * new_t);
				wilson.ctx.stroke();
				
				
				
				wilson.ctx.strokeStyle = `rgb(${colors[current_row][col][0] * (1 - old_t) + colors[current_row + 1][col + 1][0] * old_t}, ${colors[current_row][col][1] * (1 - old_t) + colors[current_row + 1][col + 1][1] * old_t}, ${colors[current_row][col][2] * (1 - old_t) + colors[current_row + 1][col + 1][2] * old_t})`;
				
				wilson.ctx.beginPath();
				wilson.ctx.moveTo(coordinates[current_row][col][0] * (1 - old_t) + coordinates[current_row + 1][col + 1][0] * old_t, coordinates[current_row][col][1] * (1 - old_t) + coordinates[current_row + 1][col + 1][1] * old_t);
				wilson.ctx.lineTo(coordinates[current_row][col][0] * (1 - new_t) + coordinates[current_row + 1][col + 1][0] * new_t, coordinates[current_row][col][1] * (1 - new_t) + coordinates[current_row + 1][col + 1][1] * new_t);
				wilson.ctx.stroke();
			}
			
			
			
			current_pixel++;
			
			if (current_pixel === pixels_per_row - 1)
			{
				current_pixel = 0;
				current_row++;
			}
			
			if (current_row === grid_size - 1)
			{
				return;
			}
		}
		
		
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function get_coordinates(row, col)
	{
		let center_x = (col - Math.floor(row / 2)) * resolution / (grid_size + 2) + resolution / 2;
		
		if (row % 2 === 1)
		{
			center_x -= .5 * resolution / (grid_size + 2);
		}
		
		let center_y = (row + 1) * Math.sqrt(3) / 2 * resolution / (grid_size + 2) + y_offset;
		
		return [center_x, center_y];
		
		let rgb = wilson.utils.hsv_to_rgb(parities[row][col] / num_colors, 1, 1);
		
		wilson.ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
		wilson.ctx.fillRect(center_x, center_y, 10, 10);
	}
}()