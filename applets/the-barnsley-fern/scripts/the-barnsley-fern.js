!function()
{
	"use strict";
	
	
	
	let grid_size = null;
	
	let ctx = document.querySelector("#fern-graph").getContext("2d");
	
	const transformation_coefficients =
	[
		[0, 0, 0, .16, 0, 0],
		[.85, .04, -.04, .85, 0, 1.6],
		[.2, -.26, .23, .22, 0, 1.6],
		[-.15, .28, .26, .24, 0, .44]
	];
	
	let fern_graph = [];

	

	let current_x = 0;
	let current_y = 0;

	const min_x = -6;
	const max_x = 6;
	const min_y = -1;
	const max_y = 11;
	
	
	
	adjust_for_settings();
	
	
	
	document.querySelector("#generate-button").addEventListener("click", draw_fern_graph);
	
	document.querySelector("#num-iterations-input").addEventListener("keydown", function(e)
	{
		if (e.keyCode === 13)
		{
			draw_fern_graph();
		}
	});
	
	document.querySelector("#download-button").addEventListener("click", prepare_download);
	
	
	
	function draw_fern_graph()
	{
		let num_iterations = parseInt(document.querySelector("#num-iterations-input").value || 10000);
		let maximum_speed = document.querySelector("#toggle-maximum-speed-checkbox").checked;
		
		grid_size = Math.floor(Math.sqrt(num_iterations / 10));
		
		
		
		document.querySelector("#fern-graph").setAttribute("width", grid_size);
		document.querySelector("#fern-graph").setAttribute("height", grid_size);
		
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, 0, grid_size, grid_size);
		
			
		
		fern_graph = [];
		
		for (let i = 0; i < grid_size; i++)
		{
			fern_graph[i] = [];
			
			for (let j = 0; j < grid_size; j++)
			{
				fern_graph[i][j] = 0;
			}
		}
		
		
		
		for (let iteration = 0; iteration < num_iterations; iteration++)
		{
			let rand = Math.random();
			
			let index = 3;
			
			if (rand < .01)
			{
				index = 0;
			}
			
			else if (rand < .86)
			{
				index = 1;
			}
			
			else if (rand < .93)
			{
				index = 2;
			}
			
			affine_transformation(index);
			
			
			
			if (current_x >= max_x || current_x <= min_x || current_y >= max_y || current_y <= min_y)
			{
				continue;
			}
			
			
			
			//This scales col to [0, 1].
			let col = (current_x - min_x) / (max_x - min_x);
			
			col = Math.floor(grid_size * col);
			
			//This scales row to [0, 1].
			let row = (current_y - min_y) / (max_y - min_y);
			
			row = Math.floor(grid_size * (1 - row));
			
			fern_graph[row][col]++;
		}
		
		
		
		let img_data = ctx.getImageData(0, 0, grid_size, grid_size);
		let data = img_data.data;
		
		for (let i = 0; i < grid_size; i++)
		{
			for (let j = 0; j < grid_size; j++)
			{
				//The index in the array of rgba values
				let index = (4 * i * grid_size) + (4 * j);
				
				data[index] = 0;
				data[index + 1] = fern_graph[i][j];
				data[index + 2] = 0;
				data[index + 3] = 255; //No transparency.
			}
		}
		
		ctx.putImageData(img_data, 0, 0);
	}



	function affine_transformation(index)
	{
		let temp = transformation_coefficients[index][0] * current_x + transformation_coefficients[index][1] * current_y + transformation_coefficients[index][4];
		
		current_y = transformation_coefficients[index][2] * current_x + transformation_coefficients[index][3] * current_y + transformation_coefficients[index][5];
		
		current_x = temp;
	}
	
	
	
	function prepare_download()
	{
		let link = document.createElement("a");
		
		link.download = "the-barnsley-fern.png";
		
		link.href = document.querySelector("#fern-graph").toDataURL();
		
		link.click();
		
		link.remove();
	}



	function adjust_for_settings()
	{
		if (url_vars["contrast"] === 1)
		{
			if (url_vars["theme"] === 1)
			{
				document.querySelector("#fern-graph").style.borderColor = "rgb(192, 192, 192)";
			}
			
			else
			{
				document.querySelector("#fern-graph").style.borderColor = "rgb(64, 64, 64)";
			}
		}
	}
}()