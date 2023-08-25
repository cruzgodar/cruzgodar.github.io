"use strict";



onmessage = async (e) =>
{
	root = e.data[0];
	branchPoints = e.data[1];
	
	await drawAnimatedBinaryTree();
	
	postMessage(["done"]);
};



let root = [];
let branchPoints = [];

const numAnimatedIterations = 10;





async function drawAnimatedBinaryTree()
{
	let angles = [Math.atan2(branchPoints[0][0] - root[0], branchPoints[0][1] - root[1]), Math.atan2(branchPoints[1][0] - root[0], branchPoints[1][1] - root[1])];
	
	const angleStep = (angles[0] - angles[1]) / 2;
	
	
	
	const distances = [Math.sqrt((branchPoints[0][0] - root[0])*(branchPoints[0][0] - root[0]) + (branchPoints[0][1] - root[1])*(branchPoints[0][1] - root[1])), Math.sqrt((branchPoints[1][0] - root[0])*(branchPoints[1][0] - root[0]) + (branchPoints[1][1] - root[1])*(branchPoints[1][1] - root[1]))];
	
	let startingPoints = [root];
	
	let scale = 1;
	
	
	
	for (let iteration = 0; iteration < numAnimatedIterations; iteration++)
	{
		const newStartingPoints = [];
		
		const newAngles = [];
		
		
		
		const lineWidth = 20 * scale + 1;
		
		const r = Math.sqrt(scale) * 139;
		const g = Math.sqrt(scale) * 69 + (1 - Math.sqrt(scale)) * 128;
		const b = Math.sqrt(scale) * 19;
		const color = `rgb(${r}, ${g}, ${b})`;
		
		
		
		for (let step = 0; step <= 100; step++)
		{
			for (let i = 0; i < startingPoints.length; i++)
			{
				let startX = startingPoints[i][1];
				let startY = startingPoints[i][0];
				let endX = (1 - step / 100) * startX + (step / 100) * (startingPoints[i][1] + distances[0] * scale * Math.cos(angles[2*i]));
				let endY = (1 - step / 100) * startY + (step / 100) * (startingPoints[i][0] + distances[0] * scale * Math.sin(angles[2*i]));
				
				postMessage([startX, startY, endX, endY, color, lineWidth]);
				
				
				
				startX = startingPoints[i][1];
				startY = startingPoints[i][0];
				endX = (1 - step / 100) * startX + (step / 100) * (startingPoints[i][1] + distances[1] * scale * Math.cos(angles[2*i + 1]));
				endY = (1 - step / 100) * startY + (step / 100) * (startingPoints[i][0] + distances[1] * scale * Math.sin(angles[2*i + 1]));
				
				postMessage([startX, startY, endX, endY, color, lineWidth]);
			}
			
			
			
			await new Promise(resolve => setTimeout(resolve, 8));
		}
		
		
		
		for (let i = 0; i < startingPoints.length; i++)
		{
			let endX = startingPoints[i][1] + distances[0] * scale * Math.cos(angles[2*i]);
			let endY = startingPoints[i][0] + distances[0] * scale * Math.sin(angles[2*i]);
			
			newStartingPoints.push([endY, endX]);
			
			newAngles.push(angles[2*i] - angleStep);
			newAngles.push(angles[2*i] + angleStep);
			
			endX = startingPoints[i][1] + distances[1] * scale * Math.cos(angles[2*i + 1]);
			endY = startingPoints[i][0] + distances[1] * scale * Math.sin(angles[2*i + 1]);
			
			newStartingPoints.push([endY, endX]);
			
			newAngles.push(angles[2*i + 1] - angleStep);
			newAngles.push(angles[2*i + 1] + angleStep);
		}
		
		
		
		startingPoints = newStartingPoints;
		
		angles = newAngles;
		
		scale *= .675;
	}
}