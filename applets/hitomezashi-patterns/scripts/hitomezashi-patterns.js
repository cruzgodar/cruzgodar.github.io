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
	
	
	
	let do_draw_boundaries = true;
	let do_draw_regions = true;
	let maximum_speed = false;
	
	let resolution = null;
	let grid_size = null;
	let row_prob = null;
	let col_prob = null;
	
	let pattern_rows = [];
	let pattern_cols = [];
	let regions = [];
	let regions_ordered = [];
	let region_sizes = [];
	let num_regions = 0;
	let num_unique_region_sizes = 0;
	let cells_by_radius = [];
	
	let current_row = 1;
	let current_col = 1;
	let current_region = 0;
	
	let line_width = null;
	
	
	
	let generate_button_element = document.querySelector("#generate-button");

	generate_button_element.addEventListener("click", generate_hitomezashi_pattern);
	
	
	
	let resolution_input_element = document.querySelector("#resolution-input");
	
	let grid_size_input_element = document.querySelector("#grid-size-input");
	
	let row_prob_input_element = document.querySelector("#row-prob-input");
	
	let col_prob_input_element = document.querySelector("#col-prob-input");
	
	
	
	resolution_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			generate_hitomezashi_pattern();
		}
	});
	
	grid_size_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			generate_hitomezashi_pattern();
		}
	});
	
	row_prob_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			generate_hitomezashi_pattern();
		}
	});
	
	col_prob_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			generate_hitomezashi_pattern();
		}
	});
	
	
	
	let draw_boundaries_checkbox_element = document.querySelector("#toggle-draw-boundaries-checkbox");
	
	let draw_regions_checkbox_element = document.querySelector("#toggle-draw-regions-checkbox");
	
	let maximum_speed_checkbox_element = document.querySelector("#toggle-maximum-speed-checkbox");
	
	
	
	draw_boundaries_checkbox_element.checked = true;
	
	
	
	draw_boundaries_checkbox_element.addEventListener("input", () =>
	{
		if (!draw_boundaries_checkbox_element.checked && !draw_regions_checkbox_element.checked)
		{
			draw_regions_checkbox_element.checked = true;
		}
	});
	
	draw_regions_checkbox_element.addEventListener("input", () =>
	{
		if (!draw_boundaries_checkbox_element.checked && !draw_regions_checkbox_element.checked)
		{
			draw_boundaries_checkbox_element.checked = true;
		}
	});
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("a-hitomezashi-pattern.png");
	});
	
	
	
	function generate_hitomezashi_pattern()
	{
		resolution = parseInt(resolution_input_element.value || 2000);
		grid_size = parseInt(grid_size_input_element.value || 50);
		row_prob = parseFloat(row_prob_input_element.value || .5);
		col_prob = parseFloat(col_prob_input_element.value || .5);
		
		wilson.change_canvas_size(resolution, resolution);
		
		
		
		wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		wilson.ctx.fillRect(0, 0, resolution, resolution);
		
		wilson.ctx.strokeStyle = "rgb(127, 127, 127)";
		
		line_width = resolution / grid_size / 20;
		
		wilson.ctx.lineWidth = line_width;
		
		
		
		do_draw_boundaries = draw_boundaries_checkbox_element.checked;
		do_draw_regions = draw_regions_checkbox_element.checked;
		maximum_speed = maximum_speed_checkbox_element.checked;
		
		
		
		//These are 0 if there is not a row/col in that position, and 1 if there is.
		pattern_rows = new Array(grid_size + 1);
		pattern_cols = new Array(grid_size + 1);
		regions = new Array(grid_size);
		regions_ordered = [];
		region_sizes = [];
		num_regions = 0;
		cells_by_radius = new Array(grid_size + 1);
		
		for (let i = 0; i < grid_size + 1; i++)
		{
			pattern_rows[i] = new Array(grid_size + 1);
			pattern_cols[i] = new Array(grid_size + 1);
			
			for (let j = 0; j < grid_size + 1; j++)
			{
				pattern_rows[i][j] = 0;
				pattern_cols[i][j] = 0;
			}
		}
		
		for (let i = 0; i < grid_size; i++)
		{
			regions[i] = new Array(grid_size);
			
			for (let j = 0; j < grid_size; j++)
			{
				regions[i][j] = -1;
			}
		}
		
		for (let i = 0; i < grid_size + 1; i++)
		{
			cells_by_radius[i] = [];
		}
		
		
		
		let middle_row = Math.floor(grid_size / 2);
		
		for (let i = 0; i < grid_size; i++)
		{
			for (let j = 0; j < grid_size; j++)
			{
				cells_by_radius[Math.abs(i - middle_row) + Math.abs(j - middle_row)].push([i, j]);
			}
		}
		
		
		
		//Place the rows.
		for (let i = 0; i < grid_size + 1; i++)
		{
			let offset = 0;
			
			//Will this row be offset?
			if (Math.random() < row_prob)
			{
				offset = 1;
			}
			
			for (let j = offset; j < grid_size; j += 2)
			{
				pattern_rows[i][j] = 1;
			}
		}
		
		
		
		//Place the columns.
		for (let i = 0; i < grid_size + 1; i++)
		{
			let offset = 0;
			
			//Will this column be offset?
			if (Math.random() < col_prob)
			{
				offset = 1;
			}
			
			for (let j = offset; j < grid_size; j += 2)
			{
				pattern_cols[j][i] = 1;
			}
		}
		
		
		
		if (maximum_speed)
		{
			if (do_draw_boundaries)
			{
				draw_hitomezashi_pattern();
			}
			
			if (do_draw_regions)
			{
				identify_regions();
				
				draw_regions();
			}
		}
		
		
		
		else
		{
			if (do_draw_boundaries)
			{
				current_row = 1;
				current_col = 1;
				
				draw_hitomezashi_pattern_row_step();
			}
			
			else if (do_draw_regions)
			{
				identify_regions();
				
				current_region = 0;
				
				draw_regions_step();
			}
		}
	}
	
	
	
	function draw_hitomezashi_pattern()
	{
		//We don't include things on the boundary, since they don't play nice with the lines already drawn there.
		for (let i = 1; i < grid_size; i++)
		{
			for (let j = 0; j < grid_size; j++)
			{
				if (pattern_rows[i][j])
				{			
					wilson.ctx.beginPath();
					wilson.ctx.moveTo((resolution / grid_size) * j, (resolution / grid_size) * i);
					wilson.ctx.lineTo((resolution / grid_size) * (j + 1), (resolution / grid_size) * i);
					wilson.ctx.stroke();
				}
			}
		}
		
		
		
		for (let i = 0; i < grid_size; i++)
		{
			for (let j = 1; j < grid_size; j++)
			{
				if (pattern_cols[i][j])
				{			
					wilson.ctx.beginPath();
					wilson.ctx.moveTo((resolution / grid_size) * j, (resolution / grid_size) * i);
					wilson.ctx.lineTo((resolution / grid_size) * j, (resolution / grid_size) * (i + 1));
					wilson.ctx.stroke();
				}
			}
		}
	}
	
	
	
	function draw_hitomezashi_pattern_row_step()
	{
		for (let j = 0; j < grid_size; j++)
		{
			if (pattern_rows[current_row][j])
			{			
				wilson.ctx.beginPath();
				wilson.ctx.moveTo((resolution / grid_size) * j, (resolution / grid_size) * current_row);
				wilson.ctx.lineTo((resolution / grid_size) * (j + 1), (resolution / grid_size) * current_row);
				wilson.ctx.stroke();
			}
		}
		
		current_row++;
		
		if (current_row < grid_size)
		{
			window.requestAnimationFrame(draw_hitomezashi_pattern_row_step);
		}
		
		else
		{
			window.requestAnimationFrame(draw_hitomezashi_pattern_col_step);
		}
		
	}
	
	function draw_hitomezashi_pattern_col_step()
	{
		for (let i = 0; i < grid_size; i++)
		{
			if (pattern_cols[i][current_col])
			{			
				wilson.ctx.beginPath();
				wilson.ctx.moveTo((resolution / grid_size) * current_col, (resolution / grid_size) * i);
				wilson.ctx.lineTo((resolution / grid_size) * current_col, (resolution / grid_size) * (i + 1));
				wilson.ctx.stroke();
			}
		}
		
		current_col++;
		
		if (current_col < grid_size)
		{
			window.requestAnimationFrame(draw_hitomezashi_pattern_col_step);
		}
		
		else if (do_draw_regions)
		{
			identify_regions();
			
			current_region = 0;
			
			draw_regions_step();
		}
	}
	
	
	
	function identify_regions()
	{
		//This is kind of a mess, but we're just going to floodfill one region at a time and just constant colors that range from red in the top left to magenta in the bottom right. That's the goal at least.
		
		let start_row = 0;
		let start_col = 0;
		
		while (true)
		{
			let active_squares = [[start_row, start_col]];
			
			regions[start_row][start_col] = num_regions;
			
			regions_ordered.push([[start_row, start_col]]);
			
			
			
			while (active_squares.length !== 0)
			{
				let num_active_squares = active_squares.length;
				
				for (let i = 0; i < num_active_squares; i++)
				{
					let row = active_squares[i][0];
					let col = active_squares[i][1];
					
					if (row > 0 && regions[row - 1][col] === -1 && !(pattern_rows[row][col]))
					{
						active_squares.push([row - 1, col]);
						
						regions[row - 1][col] = num_regions;
						
						regions_ordered[num_regions].push([row - 1, col]);
					}
					
					if (row < grid_size - 1 && regions[row + 1][col] === -1 && !(pattern_rows[row + 1][col]))
					{
						active_squares.push([row + 1, col]);
						
						regions[row + 1][col] = num_regions;
						
						regions_ordered[num_regions].push([row + 1, col]);
					}
					
					if (col > 0 && regions[row][col - 1] === -1 && !(pattern_cols[row][col]))
					{
						active_squares.push([row, col - 1]);
						
						regions[row][col - 1] = num_regions;
						
						regions_ordered[num_regions].push([row, col - 1]);
					}
					
					if (col < grid_size - 1 && regions[row][col + 1] === -1 && !(pattern_cols[row][col + 1]))
					{
						active_squares.push([row, col + 1]);
						
						regions[row][col + 1] = num_regions;
						
						regions_ordered[num_regions].push([row, col + 1]);
					}
				}
				
				active_squares.splice(0, num_active_squares);
			}
			
			
			
			region_sizes.push(regions_ordered[num_regions].length);
			
			
			
			//Now search radially outward from the center for the next starting square.
			
			let found_new_start = false;
			
			for (let radius = 0; radius <= grid_size; radius++)
			{
				for (let i = 0; i < cells_by_radius[radius].length; i++)
				{
					let row = cells_by_radius[radius][i][0];
					let col = cells_by_radius[radius][i][1];
					
					if (regions[row][col] === -1)
					{
						start_row = row;
						start_col = col;
						
						found_new_start = true;
						
						break;
					}
				}
				
				if (found_new_start)
				{
					break;
				}
			}
			
			num_regions++;
			
			if (!found_new_start)
			{
				break;
			}
		}
		
		
		
		//Get unique values.
		region_sizes = [...new Set(region_sizes)];
		
		//Sort descending.
		region_sizes.sort((a, b) => b - a);
		
		num_unique_region_sizes = region_sizes.length;
	}
	
	
	
	function draw_regions()
	{
		wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		wilson.ctx.fillRect(0, 0, resolution, resolution);
		
		
		
		for (let i = 0; i < num_regions; i++)
		{
			let region_length = regions_ordered[i].length;
			
			//Cycle colors every grid_size regions (this is just an experimentally good value).
			let h = (i % (2 * grid_size)) / (2 * grid_size);
			
			//Color the largest regions darkest, but linearly according to the list of lengths, so that all the medium regions aren't extremely bright when there's a very large region.
			let v = Math.sqrt(region_sizes.indexOf(region_length) / (num_unique_region_sizes - 2));
			
			//Tone down the singletons -- otherwise they stand out way too much.
			if (region_length === 1)
			{
				v = .5;
			}
			
			let rgb = wilson.utils.hsv_to_rgb(h, 1, v);
			
			wilson.ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
			
			
			
			for (let j = 0; j < region_length; j++)
			{
				let row = regions_ordered[i][j][0];
				let col = regions_ordered[i][j][1];
				
				wilson.ctx.fillRect((resolution / grid_size) * col + line_width / 2, (resolution / grid_size) * row + line_width / 2, resolution / grid_size - line_width, resolution / grid_size - line_width);
			}
		}
	}
	
	
	
	function draw_regions_step()
	{
		for (let i = 0; i < Math.ceil(grid_size / 50); i++)
		{
			let region_length = regions_ordered[current_region].length;
			
			//Cycle colors every grid_size regions (this is just an experimentally good value).
			let h = (current_region % (2 * grid_size)) / (2 * grid_size);
			
			//Color the largest regions darkest, but linearly according to the list of lengths, so that all the medium regions aren't extremely bright when there's a very large region.
			let v = Math.sqrt(region_sizes.indexOf(region_length) / (num_unique_region_sizes - 2));
			
			//Tone down the singletons -- otherwise they stand out way too much.
			if (region_length === 1)
			{
				v = .5;
			}
			
			let rgb = wilson.utils.hsv_to_rgb(h, 1, v);
			
			
			
			wilson.ctx.fillStyle = "rgb(0, 0, 0)";
			
			for (let j = 0; j < region_length; j++)
			{
				let row = regions_ordered[current_region][j][0];
				let col = regions_ordered[current_region][j][1];
				
				wilson.ctx.fillRect((resolution / grid_size) * col, (resolution / grid_size) * row, resolution / grid_size, resolution / grid_size);
			}
			
			
			wilson.ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
			
			for (let j = 0; j < region_length; j++)
			{
				let row = regions_ordered[current_region][j][0];
				let col = regions_ordered[current_region][j][1];
				
				wilson.ctx.fillRect((resolution / grid_size) * col + line_width / 2, (resolution / grid_size) * row + line_width / 2, resolution / grid_size - line_width, resolution / grid_size - line_width);
			}
			
			
			
			current_region++;
			
			if (current_region === num_regions)
			{
				return;
			}
		}
		
		if (current_region < num_regions)
		{
			window.requestAnimationFrame(draw_regions_step);
		}
	}
}()