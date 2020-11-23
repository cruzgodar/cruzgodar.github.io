!function()
{
	"use strict";
	
	
	
	let ctx = document.querySelector("#output-canvas").getContext("2d", {alpha: false});
	
	let web_worker = null;
	
	let hues = [];
	let values = [];
	let num_writes = [];
	
	
	
	
	
	document.querySelector("#generate-button").addEventListener("click", request_kicked_rotator);
	
	let elements = document.querySelectorAll("#grid-size-input, #k-input, #orbit-separation-input");
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].addEventListener("keydown", function(e)
		{
			if (e.keyCode === 13)
			{
				request_kicked_rotator();
			}
		});
	}
	
	document.querySelector("#download-button").addEventListener("click", prepare_download);
	
	
	
	applet_canvases_to_resize = [document.querySelector("#output-canvas")];
	
	set_up_canvas_resizer();
	
	
	
	
	
	function request_kicked_rotator()
	{
		let grid_size = parseInt(document.querySelector("#grid-size-input").value || 500);
		
		let K = parseFloat(document.querySelector("#k-input").value || .75);
		
		let orbit_separation = parseInt(document.querySelector("#orbit-separation-input").value || 3);
		
		
		
		values = [];
		
		for (let i = 0; i < grid_size; i++)
		{
			values.push([]);
			
			for (let j = 0; j < grid_size; j++)
			{
				values[i].push(0);
			}
		}
		
		
		
		document.querySelector("#output-canvas").setAttribute("width", grid_size);
		document.querySelector("#output-canvas").setAttribute("height", grid_size);
		
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, 0, grid_size, grid_size);
		
		
		
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
		
		temporary_web_workers.push(web_worker);
		
		
		
		web_worker.onmessage = function(e)
		{
			let value_delta = e.data[0];
			let hue = e.data[1];
			
			for (let i = 0; i < grid_size; i++)
			{
				for (let j = 0; j < grid_size; j++)
				{
					if (value_delta[i][j] > values[i][j])
					{
						let rgb = HSVtoRGB(hue, 1, value_delta[i][j] / 255);
						
						ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
						
						ctx.fillRect(j, i, 1, 1);
						
						values[i][j] = value_delta[i][j];
					}
				}
			}
		}
		
		
		
		web_worker.postMessage([grid_size, K, orbit_separation]);
	}
	
	
	
	function HSVtoRGB(h, s, v)
	{
		let r, g, b, i, f, p, q, t;
		
		i = Math.floor(h * 6);
		f = h * 6 - i;
		p = v * (1 - s);
		q = v * (1 - f * s);
		t = v * (1 - (1 - f) * s);
		
		switch (i % 6)
		{
			case 0: r = v, g = t, b = p; break;
			case 1: r = q, g = v, b = p; break;
			case 2: r = p, g = v, b = t; break;
			case 3: r = p, g = q, b = v; break;
			case 4: r = t, g = p, b = v; break;
			case 5: r = v, g = p, b = q; break;
		}
	    
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}
	
	
	
	function prepare_download()
	{
		let link = document.createElement("a");
		
		link.download = "kicked-rotator.png";
		
		link.href = document.querySelector("#output-canvas").toDataURL();
		
		link.click();
		
		link.remove();
	}
}()