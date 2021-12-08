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
	
	
	
	let image_size = 2000;
	
	let num_rows = null;
	let num_cols = null;
	
	let col_stagger = 25;
	
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
		num_rows = Math.floor(image_size / row_separation) - 1;
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
		
		
		
		draw_all_lines();
	}
	
	
	
	function draw_point(i, j)
	{
		let j_modified = i % 2 === 1 ? j * col_separation + col_stagger : j * col_separation;
		let i_modified = (i + 1) * row_separation;
		
		
		
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
		
		let i_1_modified = (i_1 + 1) * row_separation;
		let i_2_modified = (i_2 + 1) * row_separation;
		
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
		
		let i_1_modified = (i_1 + 1) * row_separation;
		let i_2_modified = (i_2 + 1) * row_separation;
		
		
		
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
	
	
	
	function draw_all_lines()
	{
		wilson.ctx.fillStyle = "rgb(255, 0, 0)";
		
		for (let i = 0; i < num_rows; i++)
		{
			for (let j = 0; j < num_cols; j++)
			{
				if ((j - i % 2) % 3 !== 0)
				{
					if (i % 2 === 0 && j % 3 === 1)
					{
						draw_line(i, j, i - 1, j - 1);
						draw_line(i, j, i, j + 1);
						draw_line(i, j, i + 1, j - 1);
					}
					
					else if (i % 2 === 1 && j % 3 === 2)
					{
						draw_line(i, j, i - 1, j);
						draw_line(i, j, i, j + 1);
						draw_line(i, j, i + 1, j);
					}
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
	}
	
	
	
	//Initializes the matching to the empty room.
	function init_matching()
	{
		for (let i = 0; i < num_rows; i++)
		{
			for (let j = 0; j < num_cols; j++)
			{
				let x = (j - num_cols / 2) / num_cols * 2;
				let y = -(i - num_rows / 2) / num_rows * 2;
				
				if ((j - i % 2) % 3 === 1)
				{
					let x_1 = x - .5 / num_cols * Math.sqrt(3) / 2;
					let y_1 = y + .5 / num_rows;
					
					if (x_1 >= 0 && y_1 > -x_1 * Math.sqrt(3) / 2)
					{
						matchings.push([i, j, i - 1, j - (i + 1) % 2]);
					}
					
					else
					{
						y_1 = y - .5 / num_rows;
						
						if (x_1 < 0 && y_1 > x_1 * Math.sqrt(3) / 2)
						{
							matchings.push([i, j, i + 1, j - (i + 1) % 2]);
						}
						
						else
						{
							x_1 = x + .5 / num_cols * Math.sqrt(3) / 2;
							y_1 = y + .5 / num_rows;
							matchings.push([i, j, i, j + 1]);
						}
					}
				}
			}
		}
		
		draw_matching();
	}
}()