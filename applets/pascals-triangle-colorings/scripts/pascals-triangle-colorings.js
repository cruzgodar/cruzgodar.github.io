!function()
{
	"use strict";
	
	
	
	let grid_size = 20;
	let pixels_per_row = 0;
	let pixels_per_frame = 10;
	let delay_on_meet = 0;
	
	let resolution = 2000;
	
	let num_colors = 3;
	
	let y_offset = 0;
	
	let fill_regions = true;
	
	let parities = [];
	let coordinates = [];
	let colors = [];
	let is_finished = [];
	
	let last_timestamp = -1;
	
	let active_nodes = [];
	
	
	
	let options =
	{
		renderer: "cpu",
		
		canvas_width: 2000,
		canvas_height: 2000,
		
		
		
		use_fullscreen: true,
	
		use_fullscreen_button: true,
		
		enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
		exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png"
	};
	
	let wilson = new Wilson(document.querySelector("#output-canvas"), options);
	

	
	let generate_button_element = document.querySelector("#generate-button");

	generate_button_element.addEventListener("click", draw_pascals_triangle);
	
	
	
	let resolution_input_element = document.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			draw_pascals_triangle();
		}
	});
	
	
	
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
		wilson.download_frame("a-pascals-triangle-coloring.png");
	});
	
	
	
	function draw_pascals_triangle()
	{
		resolution = parseInt(resolution_input_element.value || 2000);
		
		wilson.change_canvas_size(resolution, resolution);
		
		pixels_per_frame = Math.ceil(resolution / 200);
		
		grid_size = parseInt(triangle_size_input_element.value || 20);
		
		pixels_per_row = Math.round(resolution / (grid_size + 2));
		
		delay_on_meet = 2 * pixels_per_row;
		
		num_colors = parseInt(num_colors_input_element.value || 3);
		
		y_offset = (1 - (Math.sqrt(3) / 2 * (grid_size + 1) / (grid_size + 2))) / 2 * resolution;
		
		active_nodes = [[0, 0, 0, 0]];
		
		
		
		parities = new Array(grid_size);
		colors = new Array(grid_size);
		is_finished = new Array(grid_size);
		
		for (let i = 0; i < grid_size; i++)
		{
			parities[i] = new Array(grid_size);
			colors[i] = new Array(grid_size);
			
			is_finished[i] = new Array(grid_size);
			
			for (let j = 0; j < grid_size; j++)
			{
				is_finished[i][j] = false;
			}
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
		
		wilson.ctx.lineWidth = Math.sqrt(pixels_per_row / 150) * 10;
		
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
		
		
		
		for (let i = 0; i < pixels_per_frame; i++)
		{
			for (let j = 0; j < active_nodes.length; j++)
			{
				if (active_nodes[j][3] !== 0)
				{
					active_nodes[j][3]--;
					
					continue;
				}
				
				
				
				let old_t = active_nodes[j][2] / pixels_per_row;
				let new_t = (active_nodes[j][2] + 2) / pixels_per_row;
				
				
				wilson.ctx.strokeStyle = `rgb(${colors[active_nodes[j][0]][active_nodes[j][1]][0] * (1 - old_t) + colors[active_nodes[j][0] + 1][active_nodes[j][1]][0] * old_t}, ${colors[active_nodes[j][0]][active_nodes[j][1]][1] * (1 - old_t) + colors[active_nodes[j][0] + 1][active_nodes[j][1]][1] * old_t}, ${colors[active_nodes[j][0]][active_nodes[j][1]][2] * (1 - old_t) + colors[active_nodes[j][0] + 1][active_nodes[j][1]][2] * old_t})`;
				
				wilson.ctx.beginPath();
				wilson.ctx.moveTo(coordinates[active_nodes[j][0]][active_nodes[j][1]][0] * (1 - old_t) + coordinates[active_nodes[j][0] + 1][active_nodes[j][1]][0] * old_t, coordinates[active_nodes[j][0]][active_nodes[j][1]][1] * (1 - old_t) + coordinates[active_nodes[j][0] + 1][active_nodes[j][1]][1] * old_t);
				wilson.ctx.lineTo(coordinates[active_nodes[j][0]][active_nodes[j][1]][0] * (1 - new_t) + coordinates[active_nodes[j][0] + 1][active_nodes[j][1]][0] * new_t, coordinates[active_nodes[j][0]][active_nodes[j][1]][1] * (1 - new_t) + coordinates[active_nodes[j][0] + 1][active_nodes[j][1]][1] * new_t);
				wilson.ctx.stroke();
				
				
				
				wilson.ctx.strokeStyle = `rgb(${colors[active_nodes[j][0]][active_nodes[j][1]][0] * (1 - old_t) + colors[active_nodes[j][0] + 1][active_nodes[j][1] + 1][0] * old_t}, ${colors[active_nodes[j][0]][active_nodes[j][1]][1] * (1 - old_t) + colors[active_nodes[j][0] + 1][active_nodes[j][1] + 1][1] * old_t}, ${colors[active_nodes[j][0]][active_nodes[j][1]][2] * (1 - old_t) + colors[active_nodes[j][0] + 1][active_nodes[j][1] + 1][2] * old_t})`;
				
				wilson.ctx.beginPath();
				wilson.ctx.moveTo(coordinates[active_nodes[j][0]][active_nodes[j][1]][0] * (1 - old_t) + coordinates[active_nodes[j][0] + 1][active_nodes[j][1] + 1][0] * old_t, coordinates[active_nodes[j][0]][active_nodes[j][1]][1] * (1 - old_t) + coordinates[active_nodes[j][0] + 1][active_nodes[j][1] + 1][1] * old_t);
				wilson.ctx.lineTo(coordinates[active_nodes[j][0]][active_nodes[j][1]][0] * (1 - new_t) + coordinates[active_nodes[j][0] + 1][active_nodes[j][1] + 1][0] * new_t, coordinates[active_nodes[j][0]][active_nodes[j][1]][1] * (1 - new_t) + coordinates[active_nodes[j][0] + 1][active_nodes[j][1] + 1][1] * new_t);
				wilson.ctx.stroke();
				
				
				
				active_nodes[j][2]++;
				
				if (active_nodes[j][2] === pixels_per_row - 1)
				{
					if (active_nodes[j][0] !== grid_size - 2)
					{	
						if (!(is_finished[active_nodes[j][0] + 1][active_nodes[j][1]]))
						{
							let found = false;
							
							for (let k = 0; k < active_nodes.length; k++)
							{	
								if (active_nodes[k][0] === active_nodes[j][0] + 1 && active_nodes[k][1] === active_nodes[j][1])
								{
									found = true;
									
									active_nodes[k][3] += delay_on_meet;
									
									break;
								}
							}
							
							if (!found)
							{
								active_nodes.push([active_nodes[j][0] + 1, active_nodes[j][1], 0, 0]);
							}
						}
						
						
						
						if (!(is_finished[active_nodes[j][0] + 1][active_nodes[j][1] + 1]))
						{
							let found = false;
							
							for (let k = 0; k < active_nodes.length; k++)
							{	
								if (active_nodes[k][0] === active_nodes[j][0] + 1 && active_nodes[k][1] === active_nodes[j][1] + 1)
								{
									found = true;
									
									active_nodes[k][3] += delay_on_meet;
									
									break;
								}
							}
							
							if (!found)
							{
								active_nodes.push([active_nodes[j][0] + 1, active_nodes[j][1] + 1, 0, 0]);
							}
						}
					}
					
					
					
					is_finished[active_nodes[j][0]][active_nodes[j][1]] = true;
					
					active_nodes.splice(j, 1);
				}
			}
		}
		
		
		
		if (active_nodes.length !== 0)
		{
			window.requestAnimationFrame(draw_frame);
		}
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
	}
}()