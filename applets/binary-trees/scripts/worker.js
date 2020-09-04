"use strict";



onmessage = async function(e)
{
	root = e.data[0];
	branch_points = e.data[1];
	
	await draw_animated_binary_tree();
	
	postMessage(["done"]);
}



let root = [];
let branch_points = [];

let num_animated_iterations = 10;





function draw_animated_binary_tree()
{
	return new Promise(async function(resolve, reject)
	{
		let angles = [Math.atan2(branch_points[0][0] - root[0], branch_points[0][1] - root[1]), Math.atan2(branch_points[1][0] - root[0], branch_points[1][1] - root[1])];
		
		let angle_step = (angles[0] - angles[1]) / 2;
		
		
		
		let distances = [Math.sqrt((branch_points[0][0] - root[0])*(branch_points[0][0] - root[0]) + (branch_points[0][1] - root[1])*(branch_points[0][1] - root[1])), Math.sqrt((branch_points[1][0] - root[0])*(branch_points[1][0] - root[0]) + (branch_points[1][1] - root[1])*(branch_points[1][1] - root[1]))];
		
		let starting_points = [root];
		
		let scale = 1;
		
		
		
		for (let iteration = 0; iteration < num_animated_iterations; iteration++)
		{
			let new_starting_points = [];
			
			let new_angles = [];
			
			
			
			let line_width = 20 * scale + 1;
			
			let r = Math.sqrt(scale) * 139;
			let g = Math.sqrt(scale) * 69 + (1 - Math.sqrt(scale)) * 128;
			let b = Math.sqrt(scale) * 19;
			let color = `rgb(${r}, ${g}, ${b})`;
			
			
			
			for (let step = 0; step <= 100; step++)
			{
				for (let i = 0; i < starting_points.length; i++)
				{
					let start_x = starting_points[i][1];
					let start_y = starting_points[i][0];
					let end_x = (1 - step / 100) * start_x + (step / 100) * (starting_points[i][1] + distances[0] * scale * Math.cos(angles[2*i]));
					let end_y = (1 - step / 100) * start_y + (step / 100) * (starting_points[i][0] + distances[0] * scale * Math.sin(angles[2*i]));
					
					postMessage([start_x, start_y, end_x, end_y, color, line_width]);
					
					
					
					start_x = starting_points[i][1];
					start_y = starting_points[i][0];
					end_x = (1 - step / 100) * start_x + (step / 100) * (starting_points[i][1] + distances[1] * scale * Math.cos(angles[2*i + 1]));
					end_y = (1 - step / 100) * start_y + (step / 100) * (starting_points[i][0] + distances[1] * scale * Math.sin(angles[2*i + 1]));
					
					postMessage([start_x, start_y, end_x, end_y, color, line_width]);
				}
				
				
				
				await sleep(8);
			}
			
			
			
			for (let i = 0; i < starting_points.length; i++)
			{
				let start_x = starting_points[i][1];
				let start_y = starting_points[i][0];
				let end_x = starting_points[i][1] + distances[0] * scale * Math.cos(angles[2*i]);
				let end_y = starting_points[i][0] + distances[0] * scale * Math.sin(angles[2*i]);
				
				new_starting_points.push([end_y, end_x]);
				
				new_angles.push(angles[2*i] - angle_step);
				new_angles.push(angles[2*i] + angle_step);
				
				
				
				start_x = starting_points[i][1];
				start_y = starting_points[i][0];
				end_x = starting_points[i][1] + distances[1] * scale * Math.cos(angles[2*i + 1]);
				end_y = starting_points[i][0] + distances[1] * scale * Math.sin(angles[2*i + 1]);
				
				new_starting_points.push([end_y, end_x]);
				
				new_angles.push(angles[2*i + 1] - angle_step);
				new_angles.push(angles[2*i + 1] + angle_step);
			}
			
			
			
			starting_points = new_starting_points;
			
			angles = new_angles;
			
			scale *= .675;
		}
		
		
		
		resolve();
	});
}



function sleep(ms)
{
	return new Promise(function(resolve, reject)
	{
		setTimeout(resolve, ms);
	});
}