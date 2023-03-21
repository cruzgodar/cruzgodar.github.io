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
	
	let wilson = new Wilson(Page.element.querySelector("#output-canvas"), options);
	
	
	
	let web_worker = null;
	
	let hues = [];
	let values = [];
	let num_writes = [];
	
	
	
	
	let generate_button_element = Page.element.querySelector("#generate-button");

	generate_button_element.addEventListener("click", request_kicked_rotator);
	
	
	
	let grid_size_input_element = Page.element.querySelector("#grid-size-input");
	
	let k_input_element = Page.element.querySelector("#k-input");
	
	let orbit_separation_input_element = Page.element.querySelector("#orbit-separation-input");
	
	
	
	grid_size_input_element.addEventListener("keydown", function(e)
	{
		if (e.keyCode === 13)
		{
			request_kicked_rotator();
		}
	});
	
	k_input_element.addEventListener("keydown", function(e)
	{
		if (e.keyCode === 13)
		{
			request_kicked_rotator();
		}
	});
	
	orbit_separation_input_element.addEventListener("keydown", function(e)
	{
		if (e.keyCode === 13)
		{
			request_kicked_rotator();
		}
	});
	
	
	
	let download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("a-kicked-rotator.png");
	});
	
	
	
	Page.show();
	
	
	
	function request_kicked_rotator()
	{
		let grid_size = parseInt(grid_size_input_element.value || 500);
		
		let K = parseFloat(k_input_element.value || .75);
		
		let orbit_separation = parseInt(orbit_separation_input_element.value || 3);
		
		
		
		values = new Array(grid_size * grid_size);
		
		for (let i = 0; i < grid_size; i++)
		{
			for (let j = 0; j < grid_size; j++)
			{
				values[grid_size * i + j] = 0;
			}
		}
		
		
		
		wilson.change_canvas_size(grid_size, grid_size);
		
		wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		wilson.ctx.fillRect(0, 0, grid_size, grid_size);
		
		
		
		try {web_worker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			web_worker = new Worker("/applets/the-kicked-rotator/scripts/worker.js");
		}
		
		else
		{
			web_worker = new Worker("/applets/the-kicked-rotator/scripts/worker.min.js");
		}
		
		Page.temporary_web_workers.push(web_worker);
		
		
		
		web_worker.onmessage = function(e)
		{
			let value_delta = e.data[0];
			let hue = e.data[1];
			
			for (let i = 0; i < grid_size; i++)
			{
				for (let j = 0; j < grid_size; j++)
				{
					if (value_delta[grid_size * i + j] > values[grid_size * i + j])
					{
						let rgb = wilson.utils.hsv_to_rgb(hue, 1, value_delta[grid_size * i + j] / 255);
						
						wilson.ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
						
						wilson.ctx.fillRect(j, i, 1, 1);
						
						values[grid_size * i + j] = value_delta[grid_size * i + j];
					}
				}
			}
		}
		
		
		
		web_worker.postMessage([grid_size, K, orbit_separation]);
	}
}()