!function()
{
	"use strict";
	
	
	let resolution = 2000;
	let diamond_size = 20;
	
	//As a fraction of domino size
	let margin_size = .05;
	
	let aztec_diamond = [];
	let new_diamond = [];
	let hues = [];
	let new_hues = [];
	
	let current_diamond_size = 1;
	let frame = 0;
	let frames_per_animation_step = 1;
	
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
		
		
		
		aztec_diamond = new Array(diamond_size * 2);
		new_diamond = new Array(diamond_size * 2);
		hues = new Array(diamond_size * 2);
		new_hues = new Array(diamond_size * 2);
		
		for (let i = 0; i < diamond_size * 2; i++)
		{
			aztec_diamond[i] = new Array(diamond_size * 2);
			new_diamond[i] = new Array(diamond_size * 2);
			hues[i] = new Array(diamond_size * 2);
			new_hues[i] = new Array(diamond_size * 2);
			
			for (let j = 0; j < diamond_size * 2; j++)
			{
				aztec_diamond[i][j] = 0;
				hues[i][j] = 0;
			}
		}
		
		//Initialize the size 1 diamond.
		if (Math.random() < .5)
		{
			//Horizontal
			aztec_diamond[diamond_size - 1][diamond_size - 1] = -1;
			aztec_diamond[diamond_size][diamond_size - 1] = 1;
		}
		
		else
		{
			//Vertical
			aztec_diamond[diamond_size - 1][diamond_size - 1] = -2;
			aztec_diamond[diamond_size - 1][diamond_size] = 2;
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
			wilson.ctx.fillStyle = "rgb(0, 0, 0)";
			wilson.ctx.fillRect(0, 0, resolution, resolution);
			
			draw_diamond();
		}
		
		else if (frame === 2 * frames_per_animation_step)
		{
			frame = 0;
			
			move_dominos();
			
			wilson.ctx.fillStyle = "rgb(0, 0, 0)";
			wilson.ctx.fillRect(0, 0, resolution, resolution);
			
			draw_diamond();
			
			fill_spaces();
		}
		
		
			
		if (starting_process_id !== Site.applet_process_id)
		{
			console.log("Terminated applet process");
			
			return;
		}
		
		if (current_diamond_size < diamond_size - 1)
		{
			window.requestAnimationFrame(draw_frame);
		}
		
		else
		{
			wilson.ctx.fillStyle = "rgb(0, 0, 0)";
			wilson.ctx.fillRect(0, 0, resolution, resolution);
			
			draw_diamond();
		}
	}
	
	
	
	function draw_diamond()
	{
		for (let i = 0; i < 2 * diamond_size; i++)
		{
			for (let j = 0; j < 2 * diamond_size; j++)
			{
				if (aztec_diamond[i][j] !== 0)
				{
					if (Math.abs(aztec_diamond[i][j]) === 1)
					{
						draw_domino(i, j, true);
					}
					
					else
					{
						draw_domino(i, j, false);
					}
				}
			}
		}
	}
	
	
	
	function draw_domino(row, col, is_horizontal)
	{
		let rgb = wilson.utils.hsv_to_rgb(hues[row][col], 1, 1);
		
		wilson.ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
		
		
		
		/*
		//Color based on direction
		if (aztec_diamond[row][col] === -1)
		{
			wilson.ctx.fillStyle = "rgb(255, 0, 0)";
		}
		
		else if (aztec_diamond[row][col] === 2)
		{
			wilson.ctx.fillStyle = "rgb(255, 255, 0)";
		}
		
		else if (aztec_diamond[row][col] === 1)
		{
			wilson.ctx.fillStyle = "rgb(0, 255, 0)";
		}
		
		else if (aztec_diamond[row][col] === -2)
		{
			wilson.ctx.fillStyle = "rgb(0, 0, 255)";
		}
		*/
		
		
		
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
				new_hues[i][j] = 0;
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
						new_hues[i + aztec_diamond[i][j]][j] = hues[i][j];
					}
					
					else
					{
						new_diamond[i][j + Math.sign(aztec_diamond[i][j])] = aztec_diamond[i][j];
						new_hues[i][j + Math.sign(aztec_diamond[i][j])] = hues[i][j];
					}
				}
			}
		}
		
		
		
		
		for (let i = 0; i < diamond_size * 2; i++)
		{
			for (let j = 0; j < diamond_size * 2; j++)
			{
				aztec_diamond[i][j] = new_diamond[i][j];
				hues[i][j] = new_hues[i][j];
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
			
			hues[row][col] = (current_diamond_size - 1) / (diamond_size - 1) * 6/7;
			hues[row + 1][col] = (current_diamond_size - 1) / (diamond_size - 1) * 6/7;
		}
		
		else
		{
			//Vertical
			aztec_diamond[row][col] = -2;
			aztec_diamond[row][col + 1] = 2;
			
			hues[row][col] = (current_diamond_size - 1) / (diamond_size - 1) * 6/7;
			hues[row][col + 1] = (current_diamond_size - 1) / (diamond_size - 1) * 6/7;
		}
	}
}()