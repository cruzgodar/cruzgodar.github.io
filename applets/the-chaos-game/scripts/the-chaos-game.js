!function()
{
	"use strict";
	
	
	
	let grid_size = null;
	
	let ctx = document.querySelector("#output-canvas").getContext("2d", {alpha: false});
	
	let web_worker = null;
	
	let image = [];
	
	
	
	
	
	document.querySelector("#generate-button").addEventListener("click", request_chaos_game);
	
	let elements = document.querySelectorAll("#grid-size-input, #num-vertices-input");
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].addEventListener("keydown", function(e)
		{
			if (e.keyCode === 13)
			{
				request_chaos_game();
			}
		});
	}
	
	document.querySelector("#download-button").addEventListener("click", prepare_download);
	
	
	
	if (Browser.name === "Chrome" || Browser.name === "Opera")
	{
		alert_about_hardware_acceleration();
	}
	
	
	
	Applets.Canvases.to_resize = [document.querySelector("#output-canvas")];
	
	Applets.Canvases.true_fullscreen = false;
	
	Applets.Canvases.set_up_resizer();
	
	
	
	
	
	function request_chaos_game()
	{
		let num_vertices = parseInt(document.querySelector("#num-vertices-input").value || 3);
		
		grid_size = parseInt(document.querySelector("#grid-size-input").value || 1000);
		
		
		
		document.querySelector("#output-canvas").setAttribute("width", grid_size);
		document.querySelector("#output-canvas").setAttribute("height", grid_size);
		
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, 0, grid_size, grid_size);
		
		
		
		try {web_worker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			web_worker = new Worker("/applets/the-chaos-game/scripts/worker.js");
		}
		
		else
		{
			web_worker = new Worker("/applets/the-chaos-game/scripts/worker.min.js");
		}
		
		Page.temporary_web_workers.push(web_worker);
		
		
		
		web_worker.onmessage = function(e)
		{
			image = e.data[0];
			
			let img_data = ctx.getImageData(0, 0, grid_size, grid_size);
			let data = img_data.data;
			
			for (let i = 0; i < grid_size; i++)
			{
				for (let j = 0; j < grid_size; j++)
				{
					//The index in the array of rgba values
					let index = (4 * i * grid_size) + (4 * j);
					
					data[index] = image[i][j][0];
					data[index + 1] = image[i][j][1];
					data[index + 2] = image[i][j][2];
					data[index + 3] = 255; //No transparency.
				}
			}
			
			ctx.putImageData(img_data, 0, 0);
		}
		
		
		
		web_worker.postMessage([num_vertices, grid_size]);
	}
	
	
	
	function prepare_download()
	{
		let link = document.createElement("a");
		
		link.download = "the-chaos-game.png";
		
		link.href = document.querySelector("#output-canvas").toDataURL();
		
		link.click();
		
		link.remove();
	}
	
	
	
	function alert_about_hardware_acceleration()
	{
		let elements = document.querySelector("main").children;
		
		elements = elements[elements.length - 1].children;
		
		elements[elements.length - 1].insertAdjacentHTML("afterend", `
			<div data-aos="fade-up" style="margin-top: 10vh">
				<p class="body-text">
					Your browser treats canvases in a way that may make this applet stutter excessively. If this happens, try temporarily turning off hardware acceleration in the browser&#x2019;s settings.
				</p>
			</div>
		`);
		
		Page.Load.AOS.on_resize();
	}
}()