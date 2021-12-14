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
	
	
	
	let image_size = 500;
	
	let hex_slope = Math.sqrt(3) / 3;
	
	let num_rows = null;
	let num_cols = null;
	
	let col_stagger = 3;
	
	let col_separation = col_stagger * 2;
	
	let row_separation = Math.round(col_stagger * Math.sqrt(3));
	
	
	
	let matchings = [];
	
	
	
	let generate_button_element = document.querySelector("#generate-button");

	generate_button_element.addEventListener("click", draw_frame);
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("an-abelian-sandpile.png");
	});
	
	
	
	function draw_frame()
	{
		num_rows = Math.floor(image_size / row_separation) + 1;
		num_cols = Math.floor(image_size / col_separation) + 1;
		
		if (num_rows % 2 === 0)
		{
			image_size += row_separation;
			num_rows++;
		}
		
		wilson.change_canvas_size(image_size, image_size);
		
		
		
		wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		wilson.ctx.fillRect(0, 0, image_size, image_size);
		
		wilson.ctx.fillStyle = "rgb(255, 255, 255)";
		
		wilson.ctx.strokeStyle = "rgb(255, 255, 255)";
		
		
		
		draw_hex_grid();
	}
	
	
	
	function get_matching_world_coordinates(i_1, j_1, i_2, j_2)
	{
		let j_1_modified = i_1 % 2 === 1 ? j_1 * col_separation + col_stagger : j_1 * col_separation;
		let j_2_modified = i_2 % 2 === 1 ? j_2 * col_separation + col_stagger : j_2 * col_separation;
		
		let i_1_modified = i_1 * row_separation;
		let i_2_modified = i_2 * row_separation;
		
		let middle_i = (i_1_modified + i_2_modified) / 2;
		let middle_j = (j_1_modified + j_2_modified) / 2;

		return [(middle_j - image_size / 2) / image_size * 2, (image_size / 2 - middle_i) / image_size * 2];
	}
	
	function draw_point(i, j)
	{
		let j_modified = i % 2 === 1 ? j * col_separation + col_stagger : j * col_separation;
		let i_modified = i * row_separation;
		
		
		
		wilson.ctx.beginPath();
		wilson.ctx.arc(j_modified, i_modified, 5, 0, 2 * Math.PI, false);
		wilson.ctx.fillStyle = "rgb(255, 0, 0)";
		wilson.ctx.fill();
	}
	
	function draw_line(i_1, j_1, i_2, j_2)
	{
		if (i_1 < 0 || j_1 < 0 || i_2 < 0 || j_2 < 0 || i_1 >= num_rows || i_2 >= num_rows || j_1 >= num_cols || j_2 >= num_cols)
		{
			return;
		}
		
		let j_1_modified = i_1 % 2 === 1 ? j_1 * col_separation + col_stagger : j_1 * col_separation;
		let j_2_modified = i_2 % 2 === 1 ? j_2 * col_separation + col_stagger : j_2 * col_separation;
		
		let i_1_modified = i_1 * row_separation;
		let i_2_modified = i_2 * row_separation;
		
		wilson.ctx.beginPath();
		wilson.ctx.moveTo(j_1_modified, i_1_modified);
		wilson.ctx.lineTo(j_2_modified, i_2_modified);
		wilson.ctx.stroke();
	}
	
	function draw_rhombus(i_1, j_1, i_2, j_2)
	{
		if (i_1 < 0 || j_1 < 0 || i_2 < 0 || j_2 < 0 || i_1 >= num_rows || i_2 >= num_rows || j_1 >= num_cols || j_2 >= num_cols)
		{
			return;
		}
		
		let j_1_modified = i_1 % 2 === 1 ? j_1 * col_separation + col_stagger : j_1 * col_separation;
		let j_2_modified = i_2 % 2 === 1 ? j_2 * col_separation + col_stagger : j_2 * col_separation;
		
		let i_1_modified = i_1 * row_separation;
		let i_2_modified = i_2 * row_separation;
		
		
		
		let forward_vec_i = i_2_modified - i_1_modified;
		let forward_vec_j = j_2_modified - j_1_modified;
		
		let ortho_vec_i = -forward_vec_j * Math.sqrt(3) / 2;
		let ortho_vec_j = forward_vec_i * Math.sqrt(3) / 2;
		
		let middle_i = (i_1_modified + i_2_modified) / 2;
		let middle_j = (j_1_modified + j_2_modified) / 2;
		
		
		
		let scaled_angle = (Math.atan2(forward_vec_i, forward_vec_j) + Math.PI) / (2 * Math.PI);
		
		let light = .75 * (1 - Math.min(Math.abs(scaled_angle - .25), Math.abs(1.75 - scaled_angle))) + .25;
		
		
		
		let region = new Path2D();
		region.moveTo(j_1_modified - forward_vec_j, i_1_modified - forward_vec_i);
		region.lineTo(middle_j + ortho_vec_j, middle_i + ortho_vec_i);
		region.lineTo(j_2_modified + forward_vec_j, i_2_modified + forward_vec_i);
		region.lineTo(middle_j - ortho_vec_j, middle_i - ortho_vec_i);
		region.lineTo(j_1_modified - forward_vec_j, i_1_modified - forward_vec_i);
		region.closePath();
		
		wilson.ctx.fillStyle = `rgb(${light * 255}, ${light * 255}, ${light * 255})`;
		wilson.ctx.fill(region);
	}
	
	
	
	function draw_hex_grid()
	{
		for (let i = 0; i < num_rows; i++)
		{
			for (let j = 0; j < num_cols; j++)
			{
				if (i % 2 === 0 && j % 3 === 0)
				{
					draw_line(i, j, i - 1, j - 1);
					draw_line(i, j, i, j + 1);
					draw_line(i, j, i + 1, j - 1);
				}
				
				else if (i % 2 === 1 && j % 3 === 1)
				{
					draw_line(i, j, i - 1, j);
					draw_line(i, j, i, j + 1);
					draw_line(i, j, i + 1, j);
				}
			}
		}
		
		init_matching();
	}
	
	
	
	function draw_matching()
	{
		wilson.ctx.strokeStyle = "rgb(127, 0, 255)";
		
		for (let i = 0; i < matchings.length; i++)
		{
			draw_rhombus(matchings[i][0], matchings[i][1], matchings[i][2], matchings[i][3]);
		}
		
		for (let i = 0; i < matchings.length; i++)
		{
			draw_line(matchings[i][0], matchings[i][1], matchings[i][2], matchings[i][3]);
		}
		
		wilson.ctx.fillStyle = "rgb(255, 0, 0)";
		
		for (let x = 0; x < 1; x += .0001)
		{
			let y = -x * hex_slope;
			
			let row = (1 - y) / 2 * image_size;
			let col = (x + 1) / 2 * image_size;
			
			wilson.ctx.fillRect(col, row, 1, 1);
		}
	}
	
	
	
	//Initializes the matching to the empty room.
	function init_matching()
	{
		for (let i = 0; i < num_rows; i++)
		{
			for (let j = 0; j < num_cols; j++)
			{
				if ((j - i % 2) % 3 === 1)
				{
					let [x, y] = get_matching_world_coordinates(i, j, i - 1, j - (i + 1) % 2);
					
					if (x >= 0 && y >= -x * hex_slope)
					{
						matchings.push([i, j, i + 1, j + i % 2]);
					}
					
					else
					{
						let [x, y] = get_matching_world_coordinates(i, j, i + 1, j - (i + 1) % 2);
						
						if (x < 0 && y >= x * hex_slope)
						{
							matchings.push([i, j, i - 1, j + i % 2]);
						}
						
						else
						{
							matchings.push([i, j, i, j - 1]);
						}
					}
				}
			}
		}
		
		draw_matching();
	}
}()