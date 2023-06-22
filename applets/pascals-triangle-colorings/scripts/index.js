!function()
{
	"use strict";
	
	
	
	let gridSize = 20;
	let pixelsPerRow = 0;
	let pixelsPerFrame = 10;
	let delayOnMeet = 0;
	
	let resolution = 2000;
	
	let numColors = 3;
	
	let yOffset = 0;
	
	let fillRegions = true;
	
	let parities = [];
	let coordinates = [];
	let colors = [];
	let isFinished = [];
	
	let lastTimestamp = -1;
	
	let activeNodes = [];
	
	let startingProcessId = null;
	
	
	
	let options =
	{
		renderer: "cpu",
		
		canvasWidth: 2000,
		canvasHeight: 2000,
		
		
		
		useFullscreen: true,
	
		useFullscreenButton: true,
		
		enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
		exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
	};
	
	let wilson = new Wilson($("#output-canvas"), options);
	

	
	let generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", drawPascalsTriangle);
	
	
	
	let resolutionInputElement = $("#resolution-input");
	
	resolutionInputElement.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			drawPascalsTriangle();
		}
	});
	
	
	
	let triangleSizeInputElement = $("#triangle-size-input");
	
	triangleSizeInputElement.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			drawPascalsTriangle();
		}
	});
	
	
	
	let numColorsInputElement = $("#num-colors-input");
	
	numColorsInputElement.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			drawPascalsTriangle();
		}
	});
	
	
	
	let downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		wilson.downloadFrame("a-pascals-triangle-coloring.png");
	});
	
	
	
	Page.show();
	
	
	
	function drawPascalsTriangle()
	{
		startingProcessId = Site.appletProcessId;
		
		
		
		resolution = parseInt(resolutionInputElement.value || 2000);
		
		wilson.changeCanvasSize(resolution, resolution);
		
		pixelsPerFrame = Math.ceil(resolution / 200);
		
		gridSize = parseInt(triangleSizeInputElement.value || 20);
		
		pixelsPerRow = Math.round(resolution / (gridSize + 2));
		
		delayOnMeet = 2 * pixelsPerRow;
		
		numColors = parseInt(numColorsInputElement.value || 3);
		
		yOffset = (1 - (Math.sqrt(3) / 2 * (gridSize + 1) / (gridSize + 2))) / 2 * resolution;
		
		activeNodes = [[0, 0, 0, 0]];
		
		
		
		parities = new Array(gridSize);
		colors = new Array(gridSize);
		isFinished = new Array(gridSize);
		
		for (let i = 0; i < gridSize; i++)
		{
			parities[i] = new Array(gridSize);
			colors[i] = new Array(gridSize);
			
			isFinished[i] = new Array(gridSize);
			
			for (let j = 0; j < gridSize; j++)
			{
				isFinished[i][j] = false;
			}
		}
		
		parities[0][0] = 1;
		colors[0][0] = wilson.utils.hsvToRgb(1 / numColors, 1, 1);
		
		
		
		coordinates = new Array(gridSize);
		
		for (let i = 0; i < gridSize; i++)
		{
			coordinates[i] = new Array(gridSize);
		}
		
		
		
		for (let i = 1; i < gridSize; i++)
		{
			parities[i][0] = 1;
			parities[i][i] = 1;
			
			colors[i][0] = [...colors[0][0]];
			colors[i][i] = [...colors[0][0]];
			
			for (let j = 1; j < i; j++)
			{
				parities[i][j] = (parities[i - 1][j - 1] + parities[i - 1][j]) % numColors;
				
				colors[i][j] = wilson.utils.hsvToRgb(parities[i][j] / numColors, 1, 1);
			}
		}
		
		
		
		for (let i = 0; i < gridSize; i++)
		{
			for (let j = 0; j <= i; j++)
			{
				coordinates[i][j] = getCoordinates(i, j);
			}
		}
		
		
		
		wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		wilson.ctx.fillRect(0, 0, resolution, resolution);
		
		wilson.ctx.lineWidth = Math.sqrt(pixelsPerRow / 150) * 10;
		
		window.requestAnimationFrame(drawFrame);
	}
	
	
	
	function drawFrame(timestamp)
	{
		let timeElapsed = timestamp - lastTimestamp;
		
		lastTimestamp = timestamp;
		
		if (timeElapsed === 0)
		{
			return;
		}
		
		
		
		for (let i = 0; i < pixelsPerFrame; i++)
		{
			for (let j = 0; j < activeNodes.length; j++)
			{
				if (activeNodes[j][3] !== 0)
				{
					activeNodes[j][3]--;
					
					continue;
				}
				
				
				
				drawLineSegments(j);
				
				
				
				activeNodes[j][2]++;
				
				if (activeNodes[j][2] === pixelsPerRow - 1)
				{
					if (activeNodes[j][0] !== gridSize - 2)
					{	
						if (!(isFinished[activeNodes[j][0] + 1][activeNodes[j][1]]))
						{
							let found = false;
							
							for (let k = 0; k < activeNodes.length; k++)
							{	
								if (activeNodes[k][0] === activeNodes[j][0] + 1 && activeNodes[k][1] === activeNodes[j][1])
								{
									found = true;
									
									activeNodes[k][3] += delayOnMeet;
									
									break;
								}
							}
							
							if (!found)
							{
								activeNodes.push([activeNodes[j][0] + 1, activeNodes[j][1], 0, 0]);
							}
						}
						
						
						
						if (!(isFinished[activeNodes[j][0] + 1][activeNodes[j][1] + 1]))
						{
							let found = false;
							
							for (let k = 0; k < activeNodes.length; k++)
							{	
								if (activeNodes[k][0] === activeNodes[j][0] + 1 && activeNodes[k][1] === activeNodes[j][1] + 1)
								{
									found = true;
									
									activeNodes[k][3] += delayOnMeet;
									
									break;
								}
							}
							
							if (!found && activeNodes[j][1] + 1 <= (activeNodes[j][0] + 1) / 2)
							{
								activeNodes.push([activeNodes[j][0] + 1, activeNodes[j][1] + 1, 0, 0]);
							}
						}
					}
					
					
					
					isFinished[activeNodes[j][0]][activeNodes[j][1]] = true;
					
					activeNodes.splice(j, 1);
				}
			}
		}
		
		
		
		if (startingProcessId !== Site.appletProcessId)
		{
			console.log("Terminated applet process");
			
			return;
		}
		
		if (activeNodes.length !== 0)
		{
			window.requestAnimationFrame(drawFrame);
		}
	}
	
	
	
	function getCoordinates(row, col)
	{
		let centerX = (col - Math.floor(row / 2)) * resolution / (gridSize + 2) + resolution / 2;
		
		if (row % 2 === 1)
		{
			centerX -= .5 * resolution / (gridSize + 2);
		}
		
		let centerY = (row + 1) * Math.sqrt(3) / 2 * resolution / (gridSize + 2) + yOffset;
		
		return [.8 * centerX + .1 * resolution, .8 * centerY + .1 * resolution];
	}
	
	
	
	function drawLineSegments(activeNodeIndex)
	{
		let oldT = activeNodes[activeNodeIndex][2] / pixelsPerRow;
		let newT = (activeNodes[activeNodeIndex][2] + 2) / pixelsPerRow;
		
		
		
		let row1 = activeNodes[activeNodeIndex][0];
		let col1 = activeNodes[activeNodeIndex][1];
		
		let row2 = row1 + 1;
		let col2 = col1;
		
		wilson.ctx.strokeStyle = `rgb(${colors[row1][col1][0] * (1 - oldT) + colors[row2][col2][0] * oldT}, ${colors[row1][col1][1] * (1 - oldT) + colors[row2][col2][1] * oldT}, ${colors[row1][col1][2] * (1 - oldT) + colors[row2][col2][2] * oldT})`;
		
		wilson.ctx.beginPath();
		wilson.ctx.moveTo(coordinates[row1][col1][0] * (1 - oldT) + coordinates[row2][col2][0] * oldT, coordinates[row1][col1][1] * (1 - oldT) + coordinates[row2][col2][1] * oldT);
		wilson.ctx.lineTo(coordinates[row1][col1][0] * (1 - newT) + coordinates[row2][col2][0] * newT, coordinates[row1][col1][1] * (1 - newT) + coordinates[row2][col2][1] * newT);
		wilson.ctx.stroke();
		
		
		
		col2++;
		
		wilson.ctx.strokeStyle = `rgb(${colors[row1][col1][0] * (1 - oldT) + colors[row2][col2][0] * oldT}, ${colors[row1][col1][1] * (1 - oldT) + colors[row2][col2][1] * oldT}, ${colors[row1][col1][2] * (1 - oldT) + colors[row2][col2][2] * oldT})`;
		
		wilson.ctx.beginPath();
		wilson.ctx.moveTo(coordinates[row1][col1][0] * (1 - oldT) + coordinates[row2][col2][0] * oldT, coordinates[row1][col1][1] * (1 - oldT) + coordinates[row2][col2][1] * oldT);
		wilson.ctx.lineTo(coordinates[row1][col1][0] * (1 - newT) + coordinates[row2][col2][0] * newT, coordinates[row1][col1][1] * (1 - newT) + coordinates[row2][col2][1] * newT);
		wilson.ctx.stroke();
		
		
		
		//The reflected ones. Note that by reflecting the right path from before, we get the reflected left path.
		
		col1 = row1 - col1;
		col2 = row2 - col2;
		
		wilson.ctx.strokeStyle = `rgb(${colors[row1][col1][0] * (1 - oldT) + colors[row2][col2][0] * oldT}, ${colors[row1][col1][1] * (1 - oldT) + colors[row2][col2][1] * oldT}, ${colors[row1][col1][2] * (1 - oldT) + colors[row2][col2][2] * oldT})`;
		
		wilson.ctx.beginPath();
		wilson.ctx.moveTo(coordinates[row1][col1][0] * (1 - oldT) + coordinates[row2][col2][0] * oldT, coordinates[row1][col1][1] * (1 - oldT) + coordinates[row2][col2][1] * oldT);
		wilson.ctx.lineTo(coordinates[row1][col1][0] * (1 - newT) + coordinates[row2][col2][0] * newT, coordinates[row1][col1][1] * (1 - newT) + coordinates[row2][col2][1] * newT);
		wilson.ctx.stroke();
		
		
		
		col2++;
		
		wilson.ctx.strokeStyle = `rgb(${colors[row1][col1][0] * (1 - oldT) + colors[row2][col2][0] * oldT}, ${colors[row1][col1][1] * (1 - oldT) + colors[row2][col2][1] * oldT}, ${colors[row1][col1][2] * (1 - oldT) + colors[row2][col2][2] * oldT})`;
		
		wilson.ctx.beginPath();
		wilson.ctx.moveTo(coordinates[row1][col1][0] * (1 - oldT) + coordinates[row2][col2][0] * oldT, coordinates[row1][col1][1] * (1 - oldT) + coordinates[row2][col2][1] * oldT);
		wilson.ctx.lineTo(coordinates[row1][col1][0] * (1 - newT) + coordinates[row2][col2][0] * newT, coordinates[row1][col1][1] * (1 - newT) + coordinates[row2][col2][1] * newT);
		wilson.ctx.stroke();
	}
	}()