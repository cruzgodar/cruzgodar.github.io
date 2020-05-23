!function()
{
	"use strict";
	
	

	let ctx = document.querySelector("#output-canvas").getContext("2d", {alpha: false});
	
	let web_worker = null;



	document.querySelector("#generate-button").addEventListener("click", request_julia_mosaic);
	
	let elements = document.querySelectorAll("#a-input, #b-input, #dim-input");
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].addEventListener("keydown", function(e)
		{
			if (e.keyCode === 13)
			{
				request_julia_mosaic();
			}
		});
	}
	
	document.querySelector("#download-button").addEventListener("click", prepare_download);



	function prepare_download()
	{
		let link = document.createElement("a");
		
		link.download = "julia-set-mosaic.png";
		
		link.href = document.querySelector("#output-canvas").toDataURL();
		
		link.click();
		
		link.remove();
	}



	function request_julia_mosaic()
	{
		let julia_size = parseInt(document.querySelector("#julia-size-input").value) || 20;
		let num_julias = parseInt(document.querySelector("#num-julias-input").value) || 50;
		
		if (julia_size < 20)
		{
			julia_size = 20;
		}
		
		let image_size = num_julias * julia_size;
		
		
		
		let a = -.75 - 1.5;
		let b = 1.5;
		
		let row = 0;
		let col = 0;
		
		document.querySelector("#output-canvas").setAttribute("width", image_size);
		document.querySelector("#output-canvas").setAttribute("height", image_size);
		
		
		
		try {web_worker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			web_worker = new Worker("/applets/julia-set-mosaic/scripts/worker.js");
		}
		
		else
		{
			web_worker = new Worker("/applets/julia-set-mosaic/scripts/worker.min.js");
		}
		
		temporary_web_workers.push(web_worker);
		
		
		
		web_worker.onmessage = function(e)
		{
			let img_data = ctx.getImageData(julia_size * col, julia_size * row, julia_size, julia_size);
			let data = img_data.data;
			
			for (let i = 0; i < julia_size; i++)
			{
				for (let j = 0; j < julia_size; j++)
				{
					let brightness = e.data[0][i][j];
					 
					//The index in the array of rgba values
					let index = (4 * i * julia_size) + (4 * j);
					
					data[index] = 0;
					data[index + 1] = brightness;
					data[index + 2] = brightness;
					data[index + 3] = 255; //No transparency.
				}
			}
			
			ctx.putImageData(img_data, julia_size * col, julia_size * row);
			
			
			
			col++;
			
			if (col === num_julias)
			{
				col = 0;
				a = -.75 - 1.5;
				
				row++;
				b -= 3 / num_julias;
			}
			
			else
			{
				a += 3 / num_julias;
			}
			
			if (row !== num_julias)
			{
				web_worker.postMessage([a, b, julia_size, 100]);
			}
		}
		
		
		
		web_worker.postMessage([a, b, julia_size, 100]);
	}
}()