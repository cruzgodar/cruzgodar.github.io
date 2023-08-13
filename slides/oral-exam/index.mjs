import { Lapsa } from "/scripts/lapsa.js";
import { PlanePartitions } from "/applets/plane-partitions/scripts/class.mjs";
import { changeOpacity } from "/scripts/animation.mjs";

const applet = new PlanePartitions(document.body.querySelector("#output-canvas"), document.body.querySelector("#numbers-canvas"), false);

const canvasBundle = document.body.querySelector("#canvas-bundle");

document.body.querySelectorAll(".wilson-draggables-container").forEach(element => element.classList.add("lapsa-interactable"));



const options =
{
	shelfIconPaths: "/graphics/lapsa-icons/",
	
	builds:
	{
		"title":
		{
			reset: (slide, forward, duration) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					if (slide.contains(canvasBundle))
					{
						resolve();
						return;
					}
					
					await changeOpacity(canvasBundle, 0, duration / 2);
					
					applet.animationTime = 0;
					
					slide.appendChild(canvasBundle);
					
					applet.wilsonNumbers.draggables.onResize();
					
					const planePartition = [
						[6, 5, 4, 3, 2, 1],
						[5, 4, 3, 2, 1, 0],
						[4, 3, 2, 1, 0, 0],
						[3, 2, 1, 0, 0, 0],
						[2, 1, 0, 0, 0, 0],
						[1, 0, 0, 0, 0, 0]
					];
					
					for (let i = applet.arrays.length - 1; i >= 0; i--)
					{
						await applet.removeArray(0);
					}
					
					await applet.addNewArray(0, planePartition, false, false);
					
					if (!applet.inExactHexView)
					{
						await applet.showHexView();
					}
					
					
					
					let hue = 0;
					
					for (let i = 0; i < 6; i++)
					{
						for (let j = 0; j <= i; j++)
						{
							for (let k = 0; k < 6 - i; k++)
							{
								applet.colorCubes(applet.arrays[0], [[i - j, j, k]], ((hue + 2.5*(5 - i - k)) % 21) / 21 * 6/7);
							}
							
							hue++;
						}
					}
					
					await changeOpacity(canvasBundle, 1, duration / 2);
					
					resolve();
				});
			}
		},
		
		
		
		"young-diagram-example":
		{
			reset: (slide, forward, duration) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					if (slide.contains(canvasBundle))
					{
						resolve();
						return;
					}
					
					await changeOpacity(canvasBundle, 0, duration / 2);
					
					applet.animationTime = 0;
					
					slide.appendChild(canvasBundle);
					
					applet.wilsonNumbers.draggables.onResize();
					
					const planePartition = [
						[1, 1, 1, 1, 1],
						[1, 1, 1, 0, 0],
						[1, 1, 0, 0, 0],
						[1, 1, 0, 0, 0],
						[1, 0, 0, 0, 0]
					];
					
					applet.animationTime = duration;
					
					for (let i = applet.arrays.length - 1; i >= 0; i--)
					{
						await applet.removeArray(0);
					}
					
					await applet.addNewArray(0, planePartition, false, false);
					
					await applet.hideFloor();
					
					if (!applet.in2dView)
					{
						await applet.show2dView();
					}
					
					await changeOpacity(canvasBundle, 1, duration / 2);
					
					resolve();
				});
			}
		},
		
		
		
		"plane-partition-example":
		{
			reset: (slide, forward, duration) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					if (slide.contains(canvasBundle))
					{
						resolve();
						return;
					}
					
					await changeOpacity(canvasBundle, 0, duration / 2);
					
					applet.animationTime = 0;
					
					slide.appendChild(canvasBundle);
					
					applet.wilsonNumbers.draggables.onResize();
					
					const planePartition = [
						[6, 4, 3, 1, 1],
						[4, 3, 2, 0, 0],
						[3, 2, 0, 0, 0],
						[2, 1, 0, 0, 0],
						[1, 0, 0, 0, 0]
					];
					
					for (let i = applet.arrays.length - 1; i >= 0; i--)
					{
						await applet.removeArray(0);
					}
					
					await applet.addNewArray(0, planePartition, false, false);
					
					if (!applet.in2dView)
					{
						await applet.show2dView();
					}
					
					await changeOpacity(canvasBundle, 1, duration / 2);
					
					resolve();
				});
			},
			
			
			
			0: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					applet.animationTime = duration;
					
					if (forward)
					{
						await applet.showHexView();
					}
					
					else
					{
						await applet.show2dView();
					}
					
					resolve();
				});
			},
				
			1: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					applet.animationTime = duration;
					
					if (forward)
					{
						await applet.show2dView();
					}
					
					else
					{
						await applet.showHexView();
					}
					
					resolve();
				});
			}
		},
		
		
		
		"hooks":
		{
			reset: (slide, forward, duration) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					await changeOpacity(canvasBundle, 0, duration / 2);
					
					slide.appendChild(canvasBundle);
					
					applet.wilsonNumbers.draggables.onResize();
					
					const rpp =
					[
						[0, 2, 2, 4],
						[1, 2, 3, 0],
						[1, 3, 3, 0],
						[2, 3, 0, 0],
					];
					
					applet.animationTime = 0;
					
					for (let i = applet.arrays.length - 1; i >= 0; i--)
					{
						await applet.removeArray(0);
					}
					
					
					
					const array = await applet.addNewArray(0, rpp, false, false);
					
					applet.removeOutsideFloor(array);
					
					if (!applet.in2dView)
					{
						await applet.show2dView();
					}
					
					
					
					if (!forward)
					{
						await options.builds.hooks[0](slide, true, 0);
					}
					
					await changeOpacity(canvasBundle, 1, duration / 2);
					
					resolve();
				});
			},
			
			
			
			0: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					applet.animationTime = duration;
					
					const cubes = [[3, 0, 1], [2, 0, 0], [1, 0, 0], [1, 1, 1], [1, 2, 2]];
					
					if (forward)
					{
						await applet.colorCubes(applet.arrays[0], cubes, .75);
					}
					
					else
					{
						await applet.uncolorCubes(applet.arrays[0], cubes);
					}
					
					resolve();
				});
			}
		},
		
		
		
		"zigzag-paths":
		{
			reset: (slide, forward, duration) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					await changeOpacity(canvasBundle, 0, duration / 2);
					
					slide.appendChild(canvasBundle);
					
					applet.wilsonNumbers.draggables.onResize();
					
					const rpp =
					[
						[0, 0, 2, 3, 3],
						[1, 1, 3, 6, 9],
						[1, 2, 4, 8, 9],
						[2, 6, 7, 8, 9],
						[5, 6, 8, 8, 9]	
					];
					
					applet.animationTime = 0;
					
					for (let i = applet.arrays.length - 1; i >= 0; i--)
					{
						await applet.removeArray(0);
					}
					
					await applet.addNewArray(0, rpp, false, false);
					
					if (!applet.in2dView)
					{
						await applet.show2dView();
					}
					
					
					
					if (!forward)
					{
						await options.builds["zigzag-paths"][0](slide, true, 0);
						await options.builds["zigzag-paths"][1](slide, true, 0);
						await options.builds["zigzag-paths"][2](slide, true, 0);
					}
					
					await changeOpacity(canvasBundle, 1, duration / 2);
					
					resolve();
				});
			},
			
			
			
			//Highlight the zigzag path.
			0: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					applet.animationTime = duration;
					
					const cubes = [[4, 0, 4], [4, 1, 5], [3, 1, 5], [3, 2, 6], [3, 3, 7], [2, 3, 7], [2, 4, 8], [1, 4, 8]];
					
					if (forward)
					{
						for (let i = 0; i < cubes.length; i++)
						{
							setTimeout(() => applet.colorCubes(applet.arrays[0], [cubes[i]], 0), i * applet.animationTime / 2);
						}
					}
					
					else
					{
						await applet.uncolorCubes(applet.arrays[0], cubes);
					}
					
					resolve();
				});
			},
			
			//Highlight the pivot.
			1: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					applet.animationTime = duration;
					
					const cubes = [[1, 0, 0]];
					
					if (forward)
					{
						await applet.colorCubes(applet.arrays[0], cubes, .6);
					}
					
					else
					{
						await applet.uncolorCubes(applet.arrays[0], cubes);
					}
					
					resolve();
				});
			},
			
			
			2: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					applet.animationTime = duration;
					
					const cubes = [[4, 0, 4], [4, 1, 5], [3, 1, 5], [3, 2, 6], [3, 3, 7], [2, 3, 7], [2, 4, 8], [1, 4, 8]];
					
					const targets = [[4, 0, 4], [3, 0, 5], [2, 0, 5], [1, 0, 6], [1, 1, 7], [1, 2, 7], [1, 3, 8], [1, 4, 8]];
					
					if (forward)
					{
						await applet.moveCubes(applet.arrays[0], cubes, applet.arrays[0], targets);
					}
					
					else
					{
						await applet.moveCubes(applet.arrays[0], targets, applet.arrays[0], cubes);
					}
					
					resolve();
				});
			}
		},
		
		
		
		"hillman-grassl":
		{
			reset: (slide, forward, duration) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					await changeOpacity(canvasBundle, 0, duration / 2);
					
					slide.appendChild(canvasBundle);
					
					applet.wilsonNumbers.draggables.onResize();
					
					const rpp =
					[
						[6, 6, 6, 2],
						[4, 2, 2, 0],
						[2, 1, 0, 0],
						[1, 1, 0, 0]
					];
					
					applet.animationTime = 0;
					
					for (let i = applet.arrays.length - 1; i >= 0; i--)
					{
						await applet.removeArray(0);
					}
					
					await applet.addNewArray(0, rpp, false, false);
					
					if (!applet.inExactHexView)
					{
						await applet.showHexView();
					}
					
					await changeOpacity(canvasBundle, 1, duration / 2);
					
					resolve();
				});
			},
			
			
			
			0: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						applet.animationTime = duration;
						
						await applet.runAlgorithm("hillmanGrassl", 0);
					}
					
					else
					{
						applet.animationTime = duration / 6;
						
						await applet.runAlgorithm("hillmanGrasslInverse", 0);
					}
					
					resolve();
				});
			},
			
			1: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					applet.animationTime = duration;
					
					if (forward)
					{
						await applet.show2dView();
					}
					
					else
					{
						await applet.showHexView();
					}
					
					resolve();
				});
			},
			
			2: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					applet.animationTime = duration;
					
					if (forward)
					{
						await applet.showHexView();
					}
					
					else
					{
						await applet.show2dView();
					}
					
					resolve();
				});
			},
				
			3: (slide, forward, duration = 150) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						applet.animationTime = duration;
						
						await applet.runAlgorithm("hillmanGrasslInverse", 0);
					}
					
					else
					{
						applet.animationTime = duration / 3;
						
						await applet.runAlgorithm("hillmanGrassl", 0);
					}
					
					resolve();
				});
			}
		},
		
		
		
		"pak":
		{
			reset: (slide, forward, duration) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					await changeOpacity(canvasBundle, 0, duration / 2);
					
					slide.appendChild(canvasBundle);
					
					applet.wilsonNumbers.draggables.onResize();
					
					const rpp =
					[
						[6, 6, 6, 2],
						[4, 2, 2, 0],
						[2, 1, 0, 0],
						[1, 1, 0, 0]
					];
					
					applet.animationTime = 0;
					
					for (let i = applet.arrays.length - 1; i >= 0; i--)
					{
						await applet.removeArray(0);
					}
					
					await applet.addNewArray(0, rpp, false, false);
					
					if (!applet.inExactHexView)
					{
						await applet.showHexView();
					}
					
					await changeOpacity(canvasBundle, 1, duration / 2);
					
					resolve();
				});
			},
			
			
			
			0: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					applet.animationTime = duration;
					
					if (forward)
					{
						await applet.show2dView();
					}
					
					else
					{
						await applet.showHexView();
					}
					
					resolve();
				});
			},
			
			1: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						applet.animationTime = duration;
						
						await applet.runAlgorithm("pak", 0);
					}
					
					else
					{
						applet.animationTime = duration / 6;
						
						await applet.runAlgorithm("pakInverse", 0);
					}
					
					resolve();
				});
			},
				
			2: (slide, forward, duration = 150) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						applet.animationTime = duration;
						
						await applet.runAlgorithm("pakInverse", 0);
					}
					
					else
					{
						applet.animationTime = duration / 3;
						
						await applet.runAlgorithm("pak", 0);
					}
					
					resolve();
				});
			},
			
			3: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					applet.animationTime = duration;
					
					if (forward)
					{
						await applet.showHexView();
					}
					
					else
					{
						await applet.show2dView();
					}
					
					resolve();
				});
			},
		},
		
		
		
		"regions-example":
		{
			reset: (slide, forward, duration) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					await changeOpacity(canvasBundle, 0, duration / 2);
					
					applet.animationTime = 0;
					
					slide.appendChild(canvasBundle);
					
					applet.wilsonNumbers.draggables.onResize();
					
					const planePartition = [
						[1, 1, 1, 1, 1, 1, 1, 1],
						[1, 1, 1, 1, 1, 1, 1, 1],
						[1, 1, 1, 1, 1, 1, 1, 1],
						[1, 1, 1, 1, 1, 1, 0, 0],
						[1, 1, 1, 1, 1, 0, 0, 0],
						[1, 1, 1, 1, 1, 0, 0, 0],
						[1, 1, 1, 1, 0, 0, 0, 0],
						[1, 1, 0, 0, 0, 0, 0, 0]
					];
					
					applet.animationTime = duration;
					
					for (let i = applet.arrays.length - 1; i >= 0; i--)
					{
						await applet.removeArray(0);
					}
					
					await applet.addNewArray(0, planePartition, false, false);
					
					await applet.hideFloor();
					
					if (!applet.in2dView)
					{
						await applet.show2dView();
					}
					
					if (!forward)
					{
						await options.builds["regions-example"][0](slide, true, 0);
						await options.builds["regions-example"][1](slide, true, 0);
						await options.builds["regions-example"][2](slide, true, 0);
						await options.builds["regions-example"][3](slide, true, 0);
					}
					
					await changeOpacity(canvasBundle, 1, duration / 2);
					
					resolve();
				});
			},
			
			//Highlight O.
			0: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					applet.animationTime = duration;
					
					const cubes = [[0, 5, 0], [1, 6, 0], [2, 7, 0], [0, 2, 0], [1, 3, 0], [2, 4, 0], [3, 5, 0], [1, 0, 0], [2, 1, 0], [3, 2, 0], [4, 3, 0], [5, 4, 0], [3, 0, 0], [4, 1, 0], [5, 2, 0], [6, 3, 0], [6, 0, 0], [7, 1, 0]];
					
					if (forward)
					{
						await applet.colorCubes(applet.arrays[0], cubes, .6);
					}
					
					else
					{
						await applet.uncolorCubes(applet.arrays[0], cubes);
					}
					
					resolve();
				});
			},
			
			//Highlight I.
			1: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					applet.animationTime = duration;
					
					const cubes = [[0, 3, 0], [1, 4, 0], [2, 5, 0], [0, 1, 0], [1, 2, 0], [2, 3, 0], [3, 4, 0], [2, 0, 0], [3, 1, 0], [4, 2, 0], [5, 3, 0], [5, 0, 0], [6, 1, 0]];
					
					if (forward)
					{
						await applet.colorCubes(applet.arrays[0], cubes, .16);
					}
					
					else
					{
						await applet.uncolorCubes(applet.arrays[0], cubes);
					}
					
					resolve();
				});
			},
			
			//Highlight A.
			2: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					applet.animationTime = duration;
					
					const cubes = [[0, 4, 0], [1, 5, 0], [2, 6, 0], [4, 0, 0], [5, 1, 0], [6, 2, 0], [7, 0, 0]];
					
					if (forward)
					{
						await applet.colorCubes(applet.arrays[0], cubes, 0);
					}
					
					else
					{
						await applet.uncolorCubes(applet.arrays[0], cubes);
					}
					
					resolve();
				});
			},
			
			//Highlight B.
			3: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					applet.animationTime = duration;
					
					const cubes = [[0, 7, 0], [0, 6, 0], [1, 7, 0], [0, 0, 0], [1, 1, 0], [2, 2, 0], [3, 3, 0], [4, 4, 0]];
					
					if (forward)
					{
						await applet.colorCubes(applet.arrays[0], cubes, .33);
					}
					
					else
					{
						await applet.uncolorCubes(applet.arrays[0], cubes);
					}
					
					resolve();
				});
			},
		},
		
		
		
		"sulzgruber":
		{
			reset: (slide, forward, duration) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					await changeOpacity(canvasBundle, 0, duration / 2);
					
					slide.appendChild(canvasBundle);
					
					applet.wilsonNumbers.draggables.onResize();
					
					const rpp =
					[
						[6, 6, 6, 2],
						[4, 2, 2, 0],
						[2, 1, 0, 0],
						[1, 1, 0, 0]
					];
					
					applet.animationTime = 0;
					
					for (let i = applet.arrays.length - 1; i >= 0; i--)
					{
						await applet.removeArray(0);
					}
					
					await applet.addNewArray(0, rpp, false, false);
					
					if (!applet.inExactHexView)
					{
						await applet.showHexView();
					}
					
					await changeOpacity(canvasBundle, 1, duration / 2);
					
					resolve();
				});
			},
			
			
			
			0: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						applet.animationTime = duration;
						
						await applet.runAlgorithm("sulzgruber", 0);
					}
					
					else
					{
						applet.animationTime = duration / 6;
						
						await applet.runAlgorithm("sulzgruberInverse", 0);
					}
					
					resolve();
				});
			},
			
			1: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					applet.animationTime = duration;
					
					if (forward)
					{
						await applet.show2dView();
					}
					
					else
					{
						await applet.showHexView();
					}
					
					resolve();
				});
			},
			
			2: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					applet.animationTime = duration;
					
					if (forward)
					{
						await applet.showHexView();
					}
					
					else
					{
						await applet.show2dView();
					}
					
					resolve();
				});
			},
				
			3: (slide, forward, duration = 150) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						applet.animationTime = duration;
						
						await applet.runAlgorithm("sulzgruberInverse", 0);
					}
					
					else
					{
						applet.animationTime = duration / 3;
						
						await applet.runAlgorithm("sulzgruber", 0);
					}
					
					resolve();
				});
			}
		},
		
		
		
		"ps-rsk":
		{
			reset: (slide, forward, duration) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					await changeOpacity(canvasBundle, 0, duration / 2);
					
					slide.appendChild(canvasBundle);
					
					applet.wilsonNumbers.draggables.onResize();
					
					const rpp =
					[
						[4, 4, 4],
						[4, 3, 2],
						[4, 1, 1]
					];
					
					const rpp2 =
					[
						[4, 4, 4],
						[4, 3, 2],
						[4, 1, 1]
					];
					
					applet.animationTime = 0;
					
					for (let i = applet.arrays.length - 1; i >= 0; i--)
					{
						await applet.removeArray(0);
					}
					
					await applet.addNewArray(0, rpp, false, false);
					
					await applet.addNewArray(1, rpp2, false, false);
					
					if (!applet.inExactHexView)
					{
						await applet.showHexView();
					}
					
					if (!forward)
					{
						await options.builds["ps-rsk"][1](slide, true, 0);
						await options.builds["ps-rsk"][2](slide, true, 0);
						await options.builds["ps-rsk"][3](slide, true, 0);
						await options.builds["ps-rsk"][4](slide, true, 0);
						await options.builds["ps-rsk"][5](slide, true, 0);
					}
					
					await changeOpacity(canvasBundle, 1, duration / 2);
					
					resolve();
				});
			},
			
			
			
			1: (slide, forward, duration = 300) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						applet.animationTime = duration;
						
						await applet.showHexView();
						
						await applet.runAlgorithm("sulzgruber", 1);
						
						await applet.show2dView();
					}
					
					else
					{
						applet.animationTime = duration / 3;
						
						await applet.showHexView();
						
						await applet.runAlgorithm("sulzgruberInverse", 1);
					}
					
					resolve();
				});
			},
			
			2: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					applet.animationTime = duration;
					
					if (forward)
					{
						await applet.removeArray(1);
						
						const tableau =
						[
							[1, 1, 2],
							[0, 1, 0],
							[3, 0, 0]
						];
						
						await applet.addNewArray(1, tableau, false, false);
					}
					
					else
					{
						await applet.removeArray(1);
						
						const tableau =
						[
							[0, 0, 3],
							[0, 1, 0],
							[2, 1, 1]
						];
						
						await applet.addNewArray(1, tableau, false, false);
					}
					
					resolve();
				});
			},
			
			3: (slide, forward, duration = 400) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					applet.animationTime = duration;
					
					if (forward)
					{
						await applet.runAlgorithm("rskInverse", 1);
						
						const cubes1 = [[0, 0, 0], [0, 1, 0], [0, 2, 0], [0, 3, 0], [1, 0, 1], [1, 1, 1], [1, 2, 2], [2, 0, 2]];
						const cubes2 = [[0, 0, 0], [0, 1, 0], [0, 2, 0], [0, 3, 0], [1, 0, 1], [1, 1, 2], [1, 2, 2], [2, 0, 2]];
						
						await applet.uncolorCubes(applet.arrays[1], cubes1);
						await applet.uncolorCubes(applet.arrays[2], cubes2);
					}
					
					else
					{
						await applet.runAlgorithm("rsk", 1);
					}
					
					resolve();
				});
			},
			
			4: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					applet.animationTime = duration;
					
					const cubes0 = [[0, 1, 3], [1, 2, 1]];
					const cubes1 = [[0, 0, 0], [0, 1, 0], [0, 2, 0], [0, 3, 0], [1, 0, 1], [1, 1, 1]];
					
					if (forward)
					{
						await applet.colorCubes(applet.arrays[0], cubes0, 0);
						await applet.colorCubes(applet.arrays[1], cubes1, 0);
					}
					
					else
					{
						await applet.uncolorCubes(applet.arrays[0], cubes0);
						await applet.uncolorCubes(applet.arrays[1], cubes1);
					}
					
					resolve();
				});
			},
			
			5: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					applet.animationTime = duration;
					
					const cubes0 = [[2, 0, 3]];
					const cubes2 = [[0, 0, 0], [0, 1, 0], [0, 2, 0], [0, 3, 0]];
					
					if (forward)
					{
						await applet.colorCubes(applet.arrays[0], cubes0, .6);
						await applet.colorCubes(applet.arrays[2], cubes2, .6);
					}
					
					else
					{
						await applet.uncolorCubes(applet.arrays[0], cubes0);
						await applet.uncolorCubes(applet.arrays[2], cubes2);
					}
					
					resolve();
				});
			},
		},
		
		
		
		"garver-patrias":
		{
			reset: (slide, forward, duration) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					await changeOpacity(canvasBundle, 0, duration / 2);
					
					slide.appendChild(canvasBundle);
					
					applet.wilsonNumbers.draggables.onResize();
					
					const rpp =
					[
						[1, 2, 3],
						[4, 5, 6],
						[7, 8, 9]
					];
					
					applet.animationTime = 0;
					
					for (let i = applet.arrays.length - 1; i >= 0; i--)
					{
						await applet.removeArray(0);
					}
					
					await applet.addNewArray(0, rpp, false, false);
					
					if (!applet.in2dView)
					{
						await applet.show2dView();
					}
					
					await changeOpacity(canvasBundle, 1, duration / 2);
					
					resolve();
				});
			},
		},
		
		
		
		"garver-patrias-2":
		{
			reset: (slide, forward, duration) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					await changeOpacity(canvasBundle, 0, duration / 2);
					
					slide.appendChild(canvasBundle);
					
					applet.wilsonNumbers.draggables.onResize();
					
					const rpp =
					[
						[1, 0, 1],
						[1, 2, 0],
						[0, 0, 1]
					];
					
					applet.animationTime = 0;
					
					for (let i = applet.arrays.length - 1; i >= 0; i--)
					{
						await applet.removeArray(0);
					}
					
					await applet.addNewArray(0, rpp, false, false);
					
					if (!applet.in2dView)
					{
						await applet.show2dView();
					}
					
					await changeOpacity(canvasBundle, 1, duration / 2);
					
					resolve();
				});
			},
		},
		
		
		
		"garver-patrias-3":
		{
			reset: (slide, forward, duration) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					await changeOpacity(canvasBundle, 0, duration / 2);
					
					slide.appendChild(canvasBundle);
					
					applet.wilsonNumbers.draggables.onResize();
					
					const rpp =
					[
						[1, 0, 1],
						[1, 2, 0],
						[0, 0, 1]
					];
					
					applet.animationTime = 0;
					
					for (let i = applet.arrays.length - 1; i >= 0; i--)
					{
						await applet.removeArray(0);
					}
					
					await applet.addNewArray(0, rpp, false, false);
					
					if (!applet.in2dView)
					{
						await applet.show2dView();
					}
					
					await changeOpacity(canvasBundle, 1, duration / 2);
					
					resolve();
				});
			},
		},
		
		
		
		"garver-patrias-4":
		{
			reset: (slide, forward, duration) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					await changeOpacity(canvasBundle, 0, duration / 2);
					
					slide.appendChild(canvasBundle);
					
					applet.wilsonNumbers.draggables.onResize();
					
					const rpp =
					[
						[0, 1, 2],
						[0, 1, 4],
						[2, 4, 5]
					];
					
					applet.animationTime = 0;
					
					for (let i = applet.arrays.length - 1; i >= 0; i--)
					{
						await applet.removeArray(0);
					}
					
					await applet.addNewArray(0, rpp, false, false);
					
					if (!applet.in2dView)
					{
						await applet.show2dView();
					}
					
					await changeOpacity(canvasBundle, 1, duration / 2);
					
					resolve();
				});
			},
		},
		
		
		
		"app":
		{
			reset: (slide, forward, duration) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					await changeOpacity(canvasBundle, 0, duration / 2);
					
					slide.appendChild(canvasBundle);
					
					applet.wilsonNumbers.draggables.onResize();
					
					const app =
					[
						[Infinity, Infinity, Infinity, 9, 5],
						[Infinity, Infinity, 5,        4, 1],
						[6,        4,        4,        3, 0],
						[6,        3,        2,        1, 0],
						[4,        1,        1,        0, 0],
					];
					
					applet.animationTime = 0;
					
					for (let i = applet.arrays.length - 1; i >= 0; i--)
					{
						await applet.removeArray(0);
					}
					
					await applet.addNewArray(0, app, false, false);
					
					if (!applet.in2dView)
					{
						await applet.show2dView();
					}
					
					await changeOpacity(canvasBundle, 1, duration / 2);
					
					resolve();
				});
			},
		},
	}
};

applet.loadPromise.then(() =>
{
	const lapsa = new Lapsa(options);
});