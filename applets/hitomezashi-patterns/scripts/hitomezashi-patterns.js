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
	
	
	
	let resolution = null;
	let grid_size = null;
	let row_prob = null;
	let col_prob = null;
	
	let pattern_rows = [];
	let pattern_cols = [];
	
	
	
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
		
		wilson.ctx.strokeStyle = "rgb(255, 255, 255)";
		
		
		
		//These are 0 if there is not a row/col in that position, and 1 if there is.
		pattern_rows = new Array(grid_size + 1);
		pattern_cols = new Array(grid_size + 1);
		
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
		
		
		
		draw_hitomezashi_pattern();
	}
	
	
	
	function draw_hitomezashi_pattern()
	{
		//Draw the boundary.
		wilson.ctx.beginPath();
		wilson.ctx.moveTo(resolution / (grid_size + 2), resolution / (grid_size + 2));
		wilson.ctx.lineTo((resolution / (grid_size + 2)) * (grid_size + 1), resolution / (grid_size + 2));
		wilson.ctx.lineTo((resolution / (grid_size + 2)) * (grid_size + 1), (resolution / (grid_size + 2)) * (grid_size + 1));
		wilson.ctx.lineTo(resolution / (grid_size + 2), (resolution / (grid_size + 2)) * (grid_size + 1));
		wilson.ctx.lineTo(resolution / (grid_size + 2), resolution / (grid_size + 2));
		wilson.ctx.stroke();
		
		
		
		for (let i = 0; i < grid_size + 1; i++)
		{
			for (let j = 0; j < grid_size; j++)
			{
				if (pattern_rows[i][j])
				{			
					wilson.ctx.beginPath();
					wilson.ctx.moveTo((resolution / (grid_size + 2)) * (j + 1), (resolution / (grid_size + 2)) * (i + 1));
					wilson.ctx.lineTo((resolution / (grid_size + 2)) * (j + 2), (resolution / (grid_size + 2)) * (i + 1));
					wilson.ctx.stroke();
				}
			}
		}
		
		
		
		for (let i = 0; i < grid_size; i++)
		{
			for (let j = 0; j < grid_size + 1; j++)
			{
				if (pattern_cols[i][j])
				{			
					wilson.ctx.beginPath();
					wilson.ctx.moveTo((resolution / (grid_size + 2)) * (j + 1), (resolution / (grid_size + 2)) * (i + 1));
					wilson.ctx.lineTo((resolution / (grid_size + 2)) * (j + 1), (resolution / (grid_size + 2)) * (i + 2));
					wilson.ctx.stroke();
				}
			}
		}
	}
}()