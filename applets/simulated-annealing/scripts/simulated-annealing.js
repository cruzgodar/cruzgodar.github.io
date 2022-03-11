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
	
	

	let generate_button_element = Page.element.querySelector("#generate-button");

	generate_button_element.addEventListener("click", request_annealing_graph);
	
	
	
	let num_nodes_input_element = Page.element.querySelector("#num-nodes-input");
	
	num_nodes_input_element.addEventListener("keydown", function(e)
	{
		if (e.keyCode === 13)
		{
			request_annealing_graph();
		}
	});
	
	
	
	let download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("simulated-annealing.png");
	});
	
	
	let maximum_speed_checkbox_element = Page.element.querySelector("#toggle-maximum-speed-checkbox");
	
	
	function request_annealing_graph()
	{
		let num_nodes = parseInt(num_nodes_input_element.value || 20);
		let maximum_speed = maximum_speed_checkbox_element.checked;
		
		let resolution = 1000;
		
		
		
		wilson.change_canvas_size(resolution, resolution);
		
		wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		wilson.ctx.fillRect(0, 0, resolution, resolution);
		
		
		
		try {web_worker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			web_worker = new Worker("/applets/simulated-annealing/scripts/worker.js");
		}
		
		else
		{
			web_worker = new Worker("/applets/simulated-annealing/scripts/worker.min.js");
		}
		
		Page.temporary_web_workers.push(web_worker);
		
		
		
		web_worker.onmessage = function(e)
		{
			//A circle with arguments (x, y, r, color).
			if (e.data[0] === 0)
			{
				wilson.ctx.fillStyle = e.data[4];
				
				wilson.ctx.beginPath();
				wilson.ctx.moveTo(e.data[1], e.data[2]);
				wilson.ctx.arc(e.data[1], e.data[2], e.data[3], 0, 2 * Math.PI, false);
				wilson.ctx.fill();
			}
			
			//A line with arguments (x_1, y_1, x_2, y_2, color).
			else if (e.data[0] === 1)
			{
				wilson.ctx.strokeStyle = e.data[5];
				
				wilson.ctx.beginPath();
				wilson.ctx.moveTo(e.data[1], e.data[2]);
				wilson.ctx.lineTo(e.data[3], e.data[4]);
				wilson.ctx.stroke();
			}
			
			else
			{
				wilson.ctx.fillStyle = "rgb(0, 0, 0)";
				wilson.ctx.fillRect(0, 0, resolution, resolution);
			}
		}
		
		
		
		web_worker.postMessage([resolution, num_nodes, maximum_speed]);
	}
}()