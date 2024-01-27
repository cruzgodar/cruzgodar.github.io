import { PlanePartitions } from "/applets/plane-partitions/scripts/class.js";
import Lapsa from "/scripts/lapsa.js";
import { changeOpacity } from "/scripts/src/animation.js";

const applet = new PlanePartitions({
	canvas: document.body.querySelector("#output-canvas"),
	numbersCanvas: document.body.querySelector("#numbers-canvas"),
	useFullscreenButton: false
});

const canvasBundle = document.body.querySelector("#canvas-bundle");

document.body.querySelectorAll(".wilson-draggables-container")
	.forEach(element => element.classList.add("lapsa-interactable"));



const options =
{
	shelfIconPaths: "/graphics/lapsa-icons/",

	builds:
	{
		"title":
		{
			reset: async (slide, forward, duration) =>
			{
				if (slide.contains(canvasBundle))
				{
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
							applet.colorCubes(
								applet.arrays[0],
								[[i - j, j, k]],
								((hue + 2.5 * (5 - i - k)) % 21) / 21 * 6 / 7
							);
						}

						hue++;
					}
				}

				await changeOpacity(canvasBundle, 1, duration / 2);
			}
		},



		"young-diagram-example":
		{
			reset: async (slide, forward, duration) =>
			{
				if (slide.contains(canvasBundle))
				{
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
			}
		},



		"plane-partition-example":
		{
			reset: async (slide, forward, duration) =>
			{
				if (slide.contains(canvasBundle))
				{
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
			},



			0: async (slide, forward, duration = 600) =>
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
			},

			1: async (slide, forward, duration = 600) =>
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
			}
		},



		"hooks":
		{
			reset: async (slide, forward, duration) =>
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
			},



			0: async (slide, forward, duration = 600) =>
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
			}
		},



		"zigzag-paths":
		{
			reset: async (slide, forward, duration) =>
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
			},



			// Highlight the zigzag path.
			0: async (slide, forward, duration = 600) =>
			{
				applet.animationTime = duration;

				const cubes = [
					[4, 0, 4],
					[4, 1, 5],
					[3, 1, 5],
					[3, 2, 6],
					[3, 3, 7],
					[2, 3, 7],
					[2, 4, 8],
					[1, 4, 8]
				];

				if (forward)
				{
					for (let i = 0; i < cubes.length; i++)
					{
						setTimeout(
							() => applet.colorCubes(applet.arrays[0], [cubes[i]], 0),
							i * applet.animationTime / 2
						);
					}
				}

				else
				{
					await applet.uncolorCubes(applet.arrays[0], cubes);
				}
			},

			// Highlight the pivot.
			1: async (slide, forward, duration = 600) =>
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
			},


			2: async (slide, forward, duration = 600) =>
			{
				applet.animationTime = duration;

				const cubes = [
					[4, 0, 4],
					[4, 1, 5],
					[3, 1, 5],
					[3, 2, 6],
					[3, 3, 7],
					[2, 3, 7],
					[2, 4, 8],
					[1, 4, 8]
				];

				const targets = [
					[4, 0, 4],
					[3, 0, 5],
					[2, 0, 5],
					[1, 0, 6],
					[1, 1, 7],
					[1, 2, 7],
					[1, 3, 8],
					[1, 4, 8]
				];


				if (forward)
				{
					await applet.moveCubes(applet.arrays[0], cubes, applet.arrays[0], targets);
				}

				else
				{
					await applet.moveCubes(applet.arrays[0], targets, applet.arrays[0], cubes);
				}
			}
		},



		"hillman-grassl":
		{
			reset: async (slide, forward, duration) =>
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
			},



			0: async (slide, forward, duration = 600) =>
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
			},

			1: async (slide, forward, duration = 600) =>
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
			},

			2: async (slide, forward, duration = 600) =>
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
			},

			3: async (slide, forward, duration = 150) =>
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
			}
		},



		"pak":
		{
			reset: async (slide, forward, duration) =>
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
			},



			0: async (slide, forward, duration = 600) =>
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
			},

			1: async (slide, forward, duration = 600) =>
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
			},

			2: async (slide, forward, duration = 150) =>
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
			},

			3: async (slide, forward, duration = 600) =>
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
			},
		},



		"regions-example":
		{
			reset: async (slide, forward, duration) =>
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
			},

			// Highlight O.
			0: async (slide, forward, duration = 600) =>
			{
				applet.animationTime = duration;

				const cubes = [
					[0, 5, 0],
					[1, 6, 0],
					[2, 7, 0],
					[0, 2, 0],
					[1, 3, 0],
					[2, 4, 0],
					[3, 5, 0],
					[1, 0, 0],
					[2, 1, 0],
					[3, 2, 0],
					[4, 3, 0],
					[5, 4, 0],
					[3, 0, 0],
					[4, 1, 0],
					[5, 2, 0],
					[6, 3, 0],
					[6, 0, 0],
					[7, 1, 0]
				];

				if (forward)
				{
					await applet.colorCubes(applet.arrays[0], cubes, .6);
				}

				else
				{
					await applet.uncolorCubes(applet.arrays[0], cubes);
				}
			},

			// Highlight I.
			1: async (slide, forward, duration = 600) =>
			{
				applet.animationTime = duration;

				const cubes = [
					[0, 3, 0],
					[1, 4, 0],
					[2, 5, 0],
					[0, 1, 0],
					[1, 2, 0],
					[2, 3, 0],
					[3, 4, 0],
					[2, 0, 0],
					[3, 1, 0],
					[4, 2, 0],
					[5, 3, 0],
					[5, 0, 0],
					[6, 1, 0]
				];

				if (forward)
				{
					await applet.colorCubes(applet.arrays[0], cubes, .16);
				}

				else
				{
					await applet.uncolorCubes(applet.arrays[0], cubes);
				}
			},

			// Highlight A.
			2: async (slide, forward, duration = 600) =>
			{
				applet.animationTime = duration;

				const cubes = [
					[0, 4, 0],
					[1, 5, 0],
					[2, 6, 0],
					[4, 0, 0],
					[5, 1, 0],
					[6, 2, 0],
					[7, 0, 0]
				];


				if (forward)
				{
					await applet.colorCubes(applet.arrays[0], cubes, 0);
				}

				else
				{
					await applet.uncolorCubes(applet.arrays[0], cubes);
				}
			},

			// Highlight B.
			3: async (slide, forward, duration = 600) =>
			{
				applet.animationTime = duration;

				const cubes = [
					[0, 7, 0],
					[0, 6, 0],
					[1, 7, 0],
					[0, 0, 0],
					[1, 1, 0],
					[2, 2, 0],
					[3, 3, 0],
					[4, 4, 0]
				];

				if (forward)
				{
					await applet.colorCubes(applet.arrays[0], cubes, .33);
				}

				else
				{
					await applet.uncolorCubes(applet.arrays[0], cubes);
				}
			},
		},



		"sulzgruber":
		{
			reset: async (slide, forward, duration) =>
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
			},



			0: async (slide, forward, duration = 600) =>
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
			},

			1: async (slide, forward, duration = 600) =>
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
			},

			2: async (slide, forward, duration = 600) =>
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
			},

			3: async (slide, forward, duration = 150) =>
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
			}
		},



		"ps-rsk":
		{
			reset: async (slide, forward, duration) =>
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
			},



			1: async (slide, forward, duration = 300) =>
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
			},

			2: async (slide, forward, duration = 600) =>
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
			},

			3: async (slide, forward, duration = 400) =>
			{
				applet.animationTime = duration;

				if (forward)
				{
					await applet.runAlgorithm("rskInverse", 1);

					const cubes1 = [
						[0, 0, 0],
						[0, 1, 0],
						[0, 2, 0],
						[0, 3, 0],
						[1, 0, 1],
						[1, 1, 1],
						[1, 2, 2],
						[2, 0, 2]
					];
					
					const cubes2 = [
						[0, 0, 0],
						[0, 1, 0],
						[0, 2, 0],
						[0, 3, 0],
						[1, 0, 1],
						[1, 1, 2],
						[1, 2, 2],
						[2, 0, 2]
					];

					await applet.uncolorCubes(applet.arrays[1], cubes1);
					await applet.uncolorCubes(applet.arrays[2], cubes2);
				}

				else
				{
					await applet.runAlgorithm("rsk", 1);
				}
			},

			4: async (slide, forward, duration = 600) =>
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
			},

			5: async (slide, forward, duration = 600) =>
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
			},
		},



		"garver-patrias":
		{
			reset: async (slide, forward, duration) =>
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
			},
		},



		"garver-patrias-2":
		{
			reset: async (slide, forward, duration) =>
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
			},
		},



		"garver-patrias-3":
		{
			reset: async (slide, forward, duration) =>
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
			},
		},



		"garver-patrias-4":
		{
			reset: async (slide, forward, duration) =>
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
			},
		},



		"app":
		{
			reset: async (slide, forward, duration) =>
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
			},
		},
	}
};

new Lapsa(options);