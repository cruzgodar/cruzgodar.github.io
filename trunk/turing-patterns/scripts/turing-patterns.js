!function()
{
	"use strict";
	
	
	
	let ctx = document.querySelector("#output-canvas").getContext("2d", {alpha: false});
	
	let web_worker = null;
	
	let image_size = 200;



	document.querySelector("#generate-button").addEventListener("click", request_turing_pattern);
	
	document.querySelector("#num-grains-input").addEventListener("keydown", function(e)
	{
		if (e.keyCode === 13)
		{
			request_turing_pattern();
		}
	});
	
	document.querySelector("#download-button").addEventListener("click", prepare_download);
	
	
	
	applet_canvases_to_resize = [document.querySelector("#output-canvas")];
	
	set_up_canvas_resizer();
	
	
	
	function request_turing_pattern()
	{
		image_size = 200;
		
		let D_a = 1;
		let D_b = 8;
		
		let alpha = 4.5;
		let beta = 20;
		
		console.log(D_a, D_b, alpha, beta);
		
		
		
		document.querySelector("#output-canvas").setAttribute("width", image_size);
		document.querySelector("#output-canvas").setAttribute("height", image_size);
		
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, 0, image_size, image_size);
		
		
		
		try {web_worker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			web_worker = new Worker("/applets/turing-patterns/scripts/worker.js");
		}
		
		else
		{
			web_worker = new Worker("/applets/turing-patterns/scripts/worker.min.js");
		}
		
		temporary_web_workers.push(web_worker);
		
		web_worker.onmessage = function(e)
		{
			let red_channel = e.data[0];
			let blue_channel = e.data[1];
			
			let img_data = ctx.getImageData(0, 0, image_size, image_size);
			let data = img_data.data;
			
			for (let i = 0; i < image_size; i++)
			{
				for (let j = 0; j < image_size; j++)
				{
					//The index in the array of rgba values
					let index = (4 * i * image_size) + (4 * j);
					
					data[index] = (red_channel[2 * i][2 * j] + red_channel[2 * i + 1][2 * j + 1]);
					data[index + 1] = 0;
					data[index + 2] = (blue_channel[2 * i][2 * j] + blue_channel[2 * i + 1][2 * j + 1]);
					data[index + 3] = 255; //No transparency.
				}
			}
			
			ctx.putImageData(img_data, 0, 0);
		}
		
		
		
		web_worker.postMessage([image_size * 2, D_a, D_b, alpha, beta]);
	}
	
	
	
	function prepare_download()
	{
		let link = document.createElement("a");
		
		link.download = "abelian-sandpiles.png";
		
		link.href = document.querySelector("#output-canvas").toDataURL();
		
		link.click();
		
		link.remove();
	}
}()