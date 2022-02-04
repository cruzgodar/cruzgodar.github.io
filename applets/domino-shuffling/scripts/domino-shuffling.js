!function()
{
	"use strict";
	
	
	let resolution = 2000;
	let diamond_size = 20;
	
	//As a fraction of domino size
	let margin_size = .05;
	
	let aztec_diamond = [];
	let new_diamond = [];
	
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
		
		diamond_size = parseInt(diamond_size_input_element.value || 20);
		
		
		
		aztec_diamond = new Array(diamond_size * 2);
		new_diamond = new Array(diamond_size * 2);
		
		for (let i = 0; i < diamond_size * 2; i++)
		{
			aztec_diamond[i] = new Array(diamond_size * 2);
			new_diamond[i] = new Array(diamond_size * 2);
			
			for (let j = 0; j < diamond_size * 2; j++)
			{
				aztec_diamond[i][j] = 0;
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
		
		
		
		wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		wilson.ctx.fillRect(0, 0, resolution, resolution);
		
		draw_diamond();
		
		update_diamond();
		
		
		
		wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		wilson.ctx.fillRect(0, 0, resolution, resolution);
		
		draw_diamond();
		
		
		
		if (starting_process_id !== Site.applet_process_id)
		{
			console.log("Terminated applet process");
			
			return;
		}
		
		//window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function draw_diamond()
	{
		wilson.ctx.fillStyle = "rgb(255, 255, 255)";
		
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
						draw_domino(i + 1, j, false);
					}
				}
			}
		}
	}
	
	
	
	function draw_domino(row, col, is_horizontal)
	{
		let x = resolution / (diamond_size * 2) * (col + margin_size);
		let y = resolution / (diamond_size * 2) * (diamond_size * 2 - 1 - (row + margin_size));
		
		if (is_horizontal)
		{
			wilson.ctx.fillRect(x, y, resolution / (diamond_size * 2) * (2 - 2 * margin_size), resolution / (diamond_size * 2) * (1 - 2 * margin_size));
		}
		
		else
		{
			wilson.ctx.fillRect(x, y, resolution / (diamond_size * 2) * (1 - 2 * margin_size), resolution / (diamond_size * 2) * (2 - 2 * margin_size));
		}
	}
	
	
	
	function update_diamond()
	{
		for (let i = 0; i < diamond_size * 2; i++)
		{
			for (let j = 0; j < diamond_size * 2; j++)
			{
				new_diamond[i][j] = 0;
			}
		}
		
		
		
		for (let i = 0; i < 2 * diamond_size; i++)
		{
			for (let j = 0; j < 2 * diamond_size; j++)
			{
				if (aztec_diamond[i][j] !== 0)
				{
					if (Math.abs(aztec_diamond[i][j]) === 1)
					{
						if (new_diamond[i + aztec_diamond[i][j]][j] === 0)
						{
							new_diamond[i + aztec_diamond[i][j]][j] = aztec_diamond[i][j];
						}
						
						//If there's something there already, delete it.
						else
						{
							new_diamond[i + aztec_diamond[i][j]][j] = 0;
						}
					}
					
					else
					{
						if (new_diamond[i][j + Math.sign(aztec_diamond[i][j])] === 0)
						{
							new_diamond[i][j + Math.sign(aztec_diamond[i][j])] = aztec_diamond[i][j];
						}
						
						//If there's something there already, delete it.
						else
						{
							new_diamond[i][j + Math.sign(aztec_diamond[i][j])] = 0;
						}
					}
				}
			}
		}
		
		
		
		for (let i = 0; i < diamond_size * 2; i++)
		{
			for (let j = 0; j < diamond_size * 2; j++)
			{
				aztec_diamond[i][j] = new_diamond[i][j];
			}
		}
	}
}()