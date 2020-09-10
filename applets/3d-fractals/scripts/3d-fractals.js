!function()
{
	"use strict";
	
	
	
	let ctx = document.querySelector("#output-canvas").getContext("2d", {alpha: false});
	
	
	
	let image_size = 500;
	
	let image = [];
	
	for (let i = 0; i < image_size; i++)
	{
		image.push([]);
		
		for (let j = 0; j < image_size; j++)
		{
			image[i].push([0, 0, 0]);
		}
	}
	
	
	
	let camera_pos = [0, 0, -1];
	let image_plane_right_vec = [1, 0, 0];
	let image_plane_up_vec = [0, 1, 0];
	let image_plane_forward_vec = [0, 0, 1];
	
	let max_iterations = 32;
	let epsilon = .01;
	
	
	
	document.querySelector("#output-canvas").setAttribute("width", image_size);
	document.querySelector("#output-canvas").setAttribute("height", image_size);
	
	document.querySelector("#generate-button").addEventListener("click", draw_frame);
	
	document.querySelector("#download-button").addEventListener("click", prepare_download);
	
	
	
	
	
	function draw_frame()
	{
		for (let row = 0; row < image_size; row++)
		{
			for (let col = 0; col < image_size; col++)
			{
				//(u, v) gives local coordinates on the image plane (-1 <= u, v <= 1)
				let u = col / image_size * 2 - 1;
				let v = 1 - row / image_size * 2;
				
				//(x, y, z) gives global coordinates.
				let start_x = camera_pos[0] + image_plane_right_vec[0] * u + image_plane_up_vec[0] * v;
				let start_y = camera_pos[1] + image_plane_right_vec[1] * u + image_plane_up_vec[1] * v;
				let start_z = camera_pos[2] + image_plane_right_vec[2] * u + image_plane_up_vec[2] * v;
				
				//We start this at sky color.
				let color = 1;
				
				//The coefficient on the march direction vector.
				let t = 0;
				
				for (let i = 0; i < max_iterations; i++)
				{
					let x = start_x + t * image_plane_forward_vec[0];
					let y = start_y + t * image_plane_forward_vec[1];
					let z = start_z + t * image_plane_forward_vec[2];
					
					//Get the distance to the scene.
					let distance = DE_sphere(x, y, z);
					
					if (distance < epsilon)
					{
						color = 0;
						break;
					}
					
					t += distance;
				}
				
				ctx.fillStyle = `rgb(${color * 255}, ${color * 255}, ${color * 255})`;
				ctx.fillRect(col, row, 1, 1);
			}
		}
	}
	
	
	
	function DE_sphere(x, y, z)
	{
		return Math.sqrt(x*x + y*y + z*z) - .5;
	}
	
	
	
	function prepare_download()
	{
		let link = document.createElement("a");
		
		link.download = "gravner-griffeath-snowflakes.png";
		
		link.href = document.querySelector("#output-canvas").toDataURL();
		
		link.click();
		
		link.remove();
	}
}()