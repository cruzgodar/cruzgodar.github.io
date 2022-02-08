!function()
{
	"use strict";
	
	
	let resolution = 2000;
	let diamond_size = 20;
	
	let use_smooth_colors = true;
	
	//As a fraction of domino size
	let margin_size = .05;
	
	let aztec_diamond = [];
	let new_diamond = [];
	
	let hue = [];
	let new_hue = [];
	
	let age = [];
	let new_age = [];
	
	let current_diamond_size = 1;
	let frame = 0;
	let frames_per_animation_step = 1;
	let draw_diamond_with_holes = true;
	
	let last_timestamp = -1;
	
	let starting_process_id = null;
	
	
	
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

	generate_button_element.addEventListener("click", draw_domino_shuffling);
	
	
	
	let resolution_input_element = document.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			draw_domino_shuffling();
		}
	});
	
	
	
	let diamond_size_input_element = document.querySelector("#diamond-size-input");
	
	diamond_size_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			draw_domino_shuffling();
		}
	});
	
	
	
	let use_smooth_colors_checkbox_element = document.querySelector("#use-smooth-colors-checkbox");
	
	use_smooth_colors_checkbox_element.checked = true;
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("an-aztec-diamond.png");
	});
	
	
	
	function draw_domino_shuffling()
	{
		starting_process_id = Site.applet_process_id;
		
		
		
		resolution = parseInt(resolution_input_element.value || 2000);
		
		wilson.change_canvas_size(resolution, resolution);
		
		diamond_size = parseInt(diamond_size_input_element.value || 20) + 1;
		
		frames_per_animation_step = Math.ceil(100 / diamond_size);
		
		if (diamond_size > 30)
		{
			draw_diamond_with_holes = false;
		}
		
		else
		{
			draw_diamond_with_holes = true;
		}
		
		use_smooth_colors = use_smooth_colors_checkbox_element.checked;
		
		
		
		aztec_diamond = new Array(diamond_size * 2);
		new_diamond = new Array(diamond_size * 2);
		
		age = new Array(diamond_size * 2);
		new_age = new Array(diamond_size * 2);
		
		hue = new Array(diamond_size * 2);
		new_hue = new Array(diamond_size * 2);
		
		for (let i = 0; i < diamond_size * 2; i++)
		{
			aztec_diamond[i] = new Array(diamond_size * 2);
			new_diamond[i] = new Array(diamond_size * 2);
			
			age[i] = new Array(diamond_size * 2);
			new_age[i] = new Array(diamond_size * 2);
			
			hue[i] = new Array(diamond_size * 2);
			new_hue[i] = new Array(diamond_size * 2);
			
			for (let j = 0; j < diamond_size * 2; j++)
			{
				aztec_diamond[i][j] = 0;
				age[i][j] = 0;
				hue[i][j] = 0;
			}
		}
		
		//Initialize the size 1 diamond.
		if (Math.random() < .5)
		{
			//Horizontal
			aztec_diamond[diamond_size - 1][diamond_size - 1] = -1;
			aztec_diamond[diamond_size][diamond_size - 1] = 1;
			
			age[diamond_size - 1][diamond_size - 1] = 1;
			age[diamond_size][diamond_size - 1] = 1;
			
			if (use_smooth_colors)
			{
				hue[diamond_size - 1][diamond_size - 1] = .75 - Math.atan2(-.5, -.5) / (2 * Math.PI);
				hue[diamond_size][diamond_size - 1] = .75 - Math.atan2(.5, -.5) / (2 * Math.PI);
			}
			
			else
			{
				hue[diamond_size - 1][diamond_size - 1] = 0;
				hue[diamond_size][diamond_size - 1] = .5;
			}
		}
		
		else
		{
			//Vertical
			aztec_diamond[diamond_size - 1][diamond_size - 1] = -2;
			aztec_diamond[diamond_size - 1][diamond_size] = 2;
			
			age[diamond_size - 1][diamond_size - 1] = 1;
			age[diamond_size - 1][diamond_size] = 1;
			
			if (use_smooth_colors)
			{
				hue[diamond_size - 1][diamond_size - 1] = .75 - Math.atan2(-.5, -.5) / (2 * Math.PI);
				hue[diamond_size - 1][diamond_size] = .75 - Math.atan2(-.5, .5) / (2 * Math.PI);
			}
			
			else
			{
				hue[diamond_size - 1][diamond_size - 1] = .25;
				hue[diamond_size - 1][diamond_size] = .75;
			}
		}
		
		
		
		current_diamond_size = 1;
		
		frame = frames_per_animation_step - 1;
		
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
		
		
		
		frame++;
		
		if (frame === frames_per_animation_step)
		{
			frame = 0;
			
			move_dominos();
			
			fill_spaces();
			
			wilson.ctx.fillStyle = "rgb(0, 0, 0)";
			wilson.ctx.fillRect(0, 0, resolution, resolution);
			
			draw_diamond();
		}
		
		
			
		if (starting_process_id !== Site.applet_process_id)
		{
			console.log("Terminated applet process");
			
			return;
		}
		
		
		
		if (frame === 0 && current_diamond_size === diamond_size - 1)
		{
			wilson.ctx.fillStyle = "rgb(0, 0, 0)";
			wilson.ctx.fillRect(0, 0, resolution, resolution);
			
			draw_diamond();
			
			return;
		}
		
		else
		{
			window.requestAnimationFrame(draw_frame);
		}
	}
	
	
	
	function draw_diamond()
	{
		for (let i = -current_diamond_size; i < current_diamond_size; i++)
		{
			for (let j = -current_diamond_size; j < current_diamond_size; j++)
			{
				let row = i + diamond_size;
				let col = j + diamond_size;
				
				if (aztec_diamond[row][col] !== 0)
				{
					if (Math.abs(aztec_diamond[row][col]) === 1)
					{
						draw_domino(row, col, true);
					}
					
					else
					{
						draw_domino(row, col, false);
					}
				}
			}
		}
	}
	
	
	
	function draw_domino(row, col, is_horizontal)
	{
		let h = hue[row][col];
		
		let s = 1 - .8 * Math.pow((age[row][col] - 1) / current_diamond_size, 4);
		
		let rgb = wilson.utils.hsv_to_rgb(h, s, 1);
		
		wilson.ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
		
		
		
		let x = resolution * (.1 + (col + margin_size) / (diamond_size * 2) * .8);
		let y = resolution * (.1 + (row + margin_size) / (diamond_size * 2) * .8);
		
		if (is_horizontal)
		{
			wilson.ctx.fillRect(x, y, resolution * (2 - 2 * margin_size) / (diamond_size * 2) * .8, resolution * (1 - 2 * margin_size) / (diamond_size * 2) * .8);
		}
		
		else
		{
			wilson.ctx.fillRect(x, y, resolution * (1 - 2 * margin_size) / (diamond_size * 2) * .8, resolution * (2 - 2 * margin_size) / (diamond_size * 2) * .8);
		}
	}
	
	
	
	function move_dominos()
	{
		for (let i = 0; i < diamond_size * 2; i++)
		{
			for (let j = 0; j < diamond_size * 2; j++)
			{
				new_diamond[i][j] = 0;
				new_age[i][j] = 0;
				new_hue[i][j] = 0;
			}
		}
		
		
		
		//First deal with cancellations.
		for (let i = 0; i < 2 * diamond_size; i++)
		{
			for (let j = 0; j < 2 * diamond_size; j++)
			{
				if (aztec_diamond[i][j] !== 0)
				{
					if (Math.abs(aztec_diamond[i][j]) === 1)
					{
						//If there's something there already, delete it.
						if (aztec_diamond[i + aztec_diamond[i][j]][j] === -aztec_diamond[i][j])
						{
							aztec_diamond[i + aztec_diamond[i][j]][j] = 0;
							aztec_diamond[i][j] = 0;
						}
					}
					
					else
					{
						//If there's something there already, delete it.
						if (aztec_diamond[i][j + Math.sign(aztec_diamond[i][j])] === -aztec_diamond[i][j])
						{
							aztec_diamond[i][j + Math.sign(aztec_diamond[i][j])] = 0;
							aztec_diamond[i][j] = 0;
						}
					}
				}
			}
		}
		
		
		
		//Now it's safe to move the dominos that can move.
		for (let i = 0; i < 2 * diamond_size; i++)
		{
			for (let j = 0; j < 2 * diamond_size; j++)
			{
				if (aztec_diamond[i][j] !== 0)
				{
					if (Math.abs(aztec_diamond[i][j]) === 1)
					{
						new_diamond[i + aztec_diamond[i][j]][j] = aztec_diamond[i][j];
						new_age[i + aztec_diamond[i][j]][j] = age[i][j];
						new_hue[i + aztec_diamond[i][j]][j] = hue[i][j];
					}
					
					else
					{
						new_diamond[i][j + Math.sign(aztec_diamond[i][j])] = aztec_diamond[i][j];
						new_age[i][j + Math.sign(aztec_diamond[i][j])] = age[i][j];
						new_hue[i][j + Math.sign(aztec_diamond[i][j])] = hue[i][j];
					}
				}
			}
		}
		
		
		
		
		for (let i = 0; i < diamond_size * 2; i++)
		{
			for (let j = 0; j < diamond_size * 2; j++)
			{
				aztec_diamond[i][j] = new_diamond[i][j];
				age[i][j] = new_age[i][j];
				hue[i][j] = new_hue[i][j];
			}
		}
		
		current_diamond_size++;
	}
		
	
	
	function fill_spaces()
	{
		//Now the diamond has a bunch of 2x2 holes in it, and we need to fill them with two parallel dominos each.
		for (let i = -current_diamond_size; i < current_diamond_size; i++)
		{
			for (let j = -current_diamond_size; j < current_diamond_size; j++)
			{
				if (Math.abs(i + .5) + Math.abs(j + .5) <= current_diamond_size && Math.abs(i + 1.5) + Math.abs(j + .5) <= current_diamond_size && Math.abs(i + .5) + Math.abs(j + 1.5) <= current_diamond_size && Math.abs(i + 1.5) + Math.abs(j + 1.5) <= current_diamond_size)
				{
					let row = i + diamond_size;
					let col = j + diamond_size;
					
					//The extra checks are needed because we only record the top/bottom square of a domino.
					if (aztec_diamond[row][col] === 0 && aztec_diamond[row + 1][col] === 0 && aztec_diamond[row][col + 1] === 0 && aztec_diamond[row + 1][col + 1] === 0 && Math.abs(aztec_diamond[row - 1][col]) !== 2 && Math.abs(aztec_diamond[row - 1][col + 1]) !== 2 && Math.abs(aztec_diamond[row][col - 1]) !== 1 && Math.abs(aztec_diamond[row + 1][col - 1]) !== 1)
					{
						fill_space(row, col);
					}
				}
			}
		}
	}
	
	
	
	function fill_space(row, col)
	{
		if (Math.random() < .5)
		{
			//Horizontal
			aztec_diamond[row][col] = -1;
			aztec_diamond[row + 1][col] = 1;
			
			age[row][col] = current_diamond_size;
			age[row + 1][col] = current_diamond_size;
			
			if (use_smooth_colors)
			{
				hue[row][col] = .75 - Math.atan2(row + .5 - diamond_size, col + .5 - diamond_size) / (2 * Math.PI);
				hue[row + 1][col] = .75 - Math.atan2(row + 1.5 - diamond_size, col + .5 - diamond_size) / (2 * Math.PI);
			}
			
			else
			{
				hue[row][col] = 0;
				hue[row + 1][col] = .5;
			}
		}
		
		else
		{
			//Vertical
			aztec_diamond[row][col] = -2;
			aztec_diamond[row][col + 1] = 2;
			
			age[row][col] = current_diamond_size;
			age[row][col + 1] = current_diamond_size;
			
			if (use_smooth_colors)
			{
				hue[row][col] = .75 - Math.atan2(row + .5 - diamond_size, col + .5 - diamond_size) / (2 * Math.PI);
				hue[row][col + 1] = .75 - Math.atan2(row + .5 - diamond_size, col + 1.5 - diamond_size) / (2 * Math.PI);
			}
			
			else
			{
				hue[row][col] = .25;
				hue[row][col + 1] = .75;
			}
		}
	}
}()