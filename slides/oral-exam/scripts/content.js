const APPLET_VERSION = false;

const canvas_bundle = document.body.querySelector("#canvas-bundle");

const rects = [];

const lapsa_options =
{
	shelfIconPaths: ["/graphics/lapsa-icons/up-2.png", "/graphics/lapsa-icons/up-1.png", "/graphics/lapsa-icons/table.png", "/graphics/lapsa-icons/down-1.png", "/graphics/lapsa-icons/down-2.png"],
	
	startingSlide: 1,
	
	builds:
	{
		"title":
		{
			reset: (slide, forward, duration) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					if (slide.contains(canvas_bundle))
					{
						resolve();
						return;
					}
					
					await Page.Animate.change_opacity(canvas_bundle, 0, duration / 2);
					
					animation_time = 0;
					
					slide.appendChild(canvas_bundle);
					
					wilson_numbers.draggables.on_resize();
					
					let plane_partition = [
						[6, 5, 4, 3, 2, 1],
						[5, 4, 3, 2, 1, 0],
						[4, 3, 2, 1, 0, 0],
						[3, 2, 1, 0, 0, 0],
						[2, 1, 0, 0, 0, 0],
						[1, 0, 0, 0, 0, 0]
					];
					
					for (let i = arrays.length - 1; i >= 0; i--)
					{
						await remove_array(0);
					}
					
					await add_new_array(0, plane_partition, false, false);
					
					if (!in_exact_hex_view)
					{
						await show_hex_view();
					}
					
					
					
					let hue = 0;
					
					for (let i = 0; i < 6; i++)
					{
						for (let j = 0; j <= i; j++)
						{
							for (let k = 0; k < 6 - i; k++)
							{
								color_cubes(arrays[0], [[i - j, j, k]], ((hue + 2.5*(5 - i - k)) % 21) / 21 * 6/7);
							}
							
							hue++;
						}
					}
					
					await Page.Animate.change_opacity(canvas_bundle, 1, duration / 2);
					
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
					if (slide.contains(canvas_bundle))
					{
						resolve();
						return;
					}
					
					await Page.Animate.change_opacity(canvas_bundle, 0, duration / 2);
					
					animation_time = 0;
					
					slide.appendChild(canvas_bundle);
					
					wilson_numbers.draggables.on_resize();
					
					let plane_partition = [
						[1, 1, 1, 1, 1],
						[1, 1, 1, 0, 0],
						[1, 1, 0, 0, 0],
						[1, 1, 0, 0, 0],
						[1, 0, 0, 0, 0]
					];
					
					animation_time = duration;
					
					for (let i = arrays.length - 1; i >= 0; i--)
					{
						await remove_array(0);
					}
					
					await add_new_array(0, plane_partition, false, false);
					
					await hide_floor();
					
					if (!in_2d_view)
					{
						await show_2d_view();
					}
					
					await Page.Animate.change_opacity(canvas_bundle, 1, duration / 2);
					
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
					if (slide.contains(canvas_bundle))
					{
						resolve();
						return;
					}
					
					await Page.Animate.change_opacity(canvas_bundle, 0, duration / 2);
					
					animation_time = 0;
					
					slide.appendChild(canvas_bundle);
					
					wilson_numbers.draggables.on_resize();
					
					let plane_partition = [
						[6, 4, 3, 1, 1],
						[4, 3, 2, 0, 0],
						[3, 2, 0, 0, 0],
						[2, 1, 0, 0, 0],
						[1, 0, 0, 0, 0]
					];
					
					for (let i = arrays.length - 1; i >= 0; i--)
					{
						await remove_array(0);
					}
					
					await add_new_array(0, plane_partition, false, false);
					
					if (!in_2d_view)
					{
						await show_2d_view();
					}
					
					await Page.Animate.change_opacity(canvas_bundle, 1, duration / 2);
					
					resolve();
				});
			},
			
			
			
			0: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					animation_time = duration;
					
					if (forward)
					{
						await show_hex_view();
					}
					
					else
					{
						await show_2d_view();
					}
					
					resolve();
				});
			},
				
			1: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					animation_time = duration;
					
					if (forward)
					{
						await show_2d_view();
					}
					
					else
					{
						await show_hex_view();
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
					await Page.Animate.change_opacity(canvas_bundle, 0, duration / 2);
					
					slide.appendChild(canvas_bundle);
					
					wilson_numbers.draggables.on_resize();
					
					const rpp =
					[
						[0, 2, 2, 4],
						[1, 2, 3, 0],
						[1, 3, 3, 0],
						[2, 3, 0, 0],
					];
					
					animation_time = 0;
					
					for (let i = arrays.length - 1; i >= 0; i--)
					{
						await remove_array(0);
					}
					
					
					
					await add_new_array(0, rpp, false, false);
					
					if (!in_2d_view)
					{
						await show_2d_view();
					}
					
					
					
					if (!forward)
					{
						await lapsa_options.builds.hooks[0](slide, true, 0);
					}
					
					await Page.Animate.change_opacity(canvas_bundle, 1, duration / 2);
					
					resolve();
				});
			},
			
			
			
			0: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					console.log("hi!");
					
					animation_time = duration;
					
					const cubes = [[3, 0, 1], [2, 0, 0], [1, 0, 0], [1, 1, 1], [1, 2, 2]];
					
					if (forward)
					{
						await color_cubes(arrays[0], cubes, .75);
					}
					
					else
					{
						await uncolor_cubes(arrays[0], cubes);
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
					await Page.Animate.change_opacity(canvas_bundle, 0, duration / 2);
					
					slide.appendChild(canvas_bundle);
					
					wilson_numbers.draggables.on_resize();
					
					const rpp =
					[
						[0, 0, 2, 3, 3],
						[1, 1, 3, 6, 9],
						[1, 2, 4, 8, 9],
						[2, 6, 7, 8, 9],
						[5, 6, 8, 8, 9]	
					];
					
					animation_time = 0;
					
					for (let i = arrays.length - 1; i >= 0; i--)
					{
						await remove_array(0);
					}
					
					await add_new_array(0, rpp, false, false);
					
					if (!in_2d_view)
					{
						await show_2d_view();
					}
					
					
					
					if (!forward)
					{
						await lapsa_options.builds["zigzag-paths"][0](slide, true, 0);
						await lapsa_options.builds["zigzag-paths"][1](slide, true, 0);
						await lapsa_options.builds["zigzag-paths"][2](slide, true, 0);
					}
					
					await Page.Animate.change_opacity(canvas_bundle, 1, duration / 2);
					
					resolve();
				});
			},
			
			
			
			//Highlight the zigzag path.
			0: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					animation_time = duration;
					
					const cubes = [[4, 0, 4], [4, 1, 5], [3, 1, 5], [3, 2, 6], [3, 3, 7], [2, 3, 7], [2, 4, 8], [1, 4, 8]];
					
					if (forward)
					{
						for (let i = 0; i < cubes.length; i++)
						{
							setTimeout(() => color_cubes(arrays[0], [cubes[i]], 0), i * animation_time / 2);
						}
					}
					
					else
					{
						await uncolor_cubes(arrays[0], cubes);
					}
					
					resolve();
				});
			},
			
			//Highlight the pivot.
			1: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					animation_time = duration;
					
					const cubes = [[1, 0, 0]];
					
					if (forward)
					{
						await color_cubes(arrays[0], cubes, .6);
					}
					
					else
					{
						await uncolor_cubes(arrays[0], cubes);
					}
					
					resolve();
				});
			},
			
			
			2: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					animation_time = duration;
					
					const cubes = [[4, 0, 4], [4, 1, 5], [3, 1, 5], [3, 2, 6], [3, 3, 7], [2, 3, 7], [2, 4, 8], [1, 4, 8]];
					
					const targets = [[4, 0, 4], [3, 0, 5], [2, 0, 5], [1, 0, 6], [1, 1, 7], [1, 2, 7], [1, 3, 8], [1, 4, 8]];
					
					if (forward)
					{
						await move_cubes(arrays[0], cubes, arrays[0], targets);
					}
					
					else
					{
						await move_cubes(arrays[0], targets, arrays[0], cubes);
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
					await Page.Animate.change_opacity(canvas_bundle, 0, duration / 2);
					
					slide.appendChild(canvas_bundle);
					
					wilson_numbers.draggables.on_resize();
					
					const rpp =
					[
						[6, 6, 6, 2],
						[4, 2, 2, 0],
						[2, 1, 0, 0],
						[1, 1, 0, 0]
					];
					
					animation_time = 0;
					
					for (let i = arrays.length - 1; i >= 0; i--)
					{
						await remove_array(0);
					}
					
					await add_new_array(0, rpp, false, false);
					
					if (!in_exact_hex_view)
					{
						await show_hex_view();
					}
					
					await Page.Animate.change_opacity(canvas_bundle, 1, duration / 2);
					
					resolve();
				});
			},
			
			
			
			0: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						animation_time = duration;
						
						await run_algorithm("hillman_grassl", 0);
					}
					
					else
					{
						animation_time = duration / 6;
						
						await run_algorithm("hillman_grassl_inverse", 0);
					}
					
					resolve();
				});
			},
			
			1: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					animation_time = duration;
					
					if (forward)
					{
						await show_2d_view();
					}
					
					else
					{
						await show_hex_view();
					}
					
					resolve();
				});
			},
			
			2: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					animation_time = duration;
					
					if (forward)
					{
						await show_hex_view();
					}
					
					else
					{
						await show_2d_view();
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
						animation_time = duration;
						
						await run_algorithm("hillman_grassl_inverse", 0);
					}
					
					else
					{
						animation_time = duration / 3;
						
						await run_algorithm("hillman_grassl", 0);
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
					await Page.Animate.change_opacity(canvas_bundle, 0, duration / 2);
					
					slide.appendChild(canvas_bundle);
					
					wilson_numbers.draggables.on_resize();
					
					const rpp =
					[
						[6, 6, 6, 2],
						[4, 2, 2, 0],
						[2, 1, 0, 0],
						[1, 1, 0, 0]
					];
					
					animation_time = 0;
					
					for (let i = arrays.length - 1; i >= 0; i--)
					{
						await remove_array(0);
					}
					
					await add_new_array(0, rpp, false, false);
					
					if (!in_exact_hex_view)
					{
						await show_hex_view();
					}
					
					await Page.Animate.change_opacity(canvas_bundle, 1, duration / 2);
					
					resolve();
				});
			},
			
			
			
			0: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					animation_time = duration;
					
					if (forward)
					{
						await show_2d_view();
					}
					
					else
					{
						await show_hex_view();
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
						animation_time = duration;
						
						await run_algorithm("pak", 0);
					}
					
					else
					{
						animation_time = duration / 6;
						
						await run_algorithm("pak_inverse", 0);
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
						animation_time = duration;
						
						await run_algorithm("pak_inverse", 0);
					}
					
					else
					{
						animation_time = duration / 3;
						
						await run_algorithm("pak", 0);
					}
					
					resolve();
				});
			},
			
			3: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					animation_time = duration;
					
					if (forward)
					{
						await show_hex_view();
					}
					
					else
					{
						await show_2d_view();
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
					await Page.Animate.change_opacity(canvas_bundle, 0, duration / 2);
					
					animation_time = 0;
					
					slide.appendChild(canvas_bundle);
					
					wilson_numbers.draggables.on_resize();
					
					let plane_partition = [
						[1, 1, 1, 1, 1, 1, 1, 1],
						[1, 1, 1, 1, 1, 1, 1, 1],
						[1, 1, 1, 1, 1, 1, 1, 1],
						[1, 1, 1, 1, 1, 1, 0, 0],
						[1, 1, 1, 1, 1, 0, 0, 0],
						[1, 1, 1, 1, 1, 0, 0, 0],
						[1, 1, 1, 1, 0, 0, 0, 0],
						[1, 1, 0, 0, 0, 0, 0, 0]
					];
					
					animation_time = duration;
					
					for (let i = arrays.length - 1; i >= 0; i--)
					{
						await remove_array(0);
					}
					
					await add_new_array(0, plane_partition, false, false);
					
					await hide_floor();
					
					if (!in_2d_view)
					{
						await show_2d_view();
					}
					
					if (!forward)
					{
						await lapsa_options.builds["regions-example"][0](slide, true, 0);
						await lapsa_options.builds["regions-example"][1](slide, true, 0);
						await lapsa_options.builds["regions-example"][2](slide, true, 0);
						await lapsa_options.builds["regions-example"][3](slide, true, 0);
					}
					
					await Page.Animate.change_opacity(canvas_bundle, 1, duration / 2);
					
					resolve();
				});
			},
			
			//Highlight O.
			0: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					animation_time = duration;
					
					const cubes = [[0, 5, 0], [1, 6, 0], [2, 7, 0], [0, 2, 0], [1, 3, 0], [2, 4, 0], [3, 5, 0], [1, 0, 0], [2, 1, 0], [3, 2, 0], [4, 3, 0], [5, 4, 0], [3, 0, 0], [4, 1, 0], [5, 2, 0], [6, 3, 0], [6, 0, 0], [7, 1, 0]];
					
					if (forward)
					{
						await color_cubes(arrays[0], cubes, .6);
					}
					
					else
					{
						await uncolor_cubes(arrays[0], cubes);
					}
					
					resolve();
				});
			},
			
			//Highlight I.
			1: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					animation_time = duration;
					
					const cubes = [[0, 3, 0], [1, 4, 0], [2, 5, 0], [0, 1, 0], [1, 2, 0], [2, 3, 0], [3, 4, 0], [2, 0, 0], [3, 1, 0], [4, 2, 0], [5, 3, 0], [5, 0, 0], [6, 1, 0]];
					
					if (forward)
					{
						await color_cubes(arrays[0], cubes, .16);
					}
					
					else
					{
						await uncolor_cubes(arrays[0], cubes);
					}
					
					resolve();
				});
			},
			
			//Highlight A.
			2: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					animation_time = duration;
					
					const cubes = [[0, 4, 0], [1, 5, 0], [2, 6, 0], [4, 0, 0], [5, 1, 0], [6, 2, 0], [7, 0, 0]];
					
					if (forward)
					{
						await color_cubes(arrays[0], cubes, 0);
					}
					
					else
					{
						await uncolor_cubes(arrays[0], cubes);
					}
					
					resolve();
				});
			},
			
			//Highlight B.
			3: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					animation_time = duration;
					
					const cubes = [[0, 7, 0], [0, 6, 0], [1, 7, 0], [0, 0, 0], [1, 1, 0], [2, 2, 0], [3, 3, 0], [4, 4, 0]];
					
					if (forward)
					{
						await color_cubes(arrays[0], cubes, .33);
					}
					
					else
					{
						await uncolor_cubes(arrays[0], cubes);
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
					await Page.Animate.change_opacity(canvas_bundle, 0, duration / 2);
					
					slide.appendChild(canvas_bundle);
					
					wilson_numbers.draggables.on_resize();
					
					const rpp =
					[
						[6, 6, 6, 2],
						[4, 2, 2, 0],
						[2, 1, 0, 0],
						[1, 1, 0, 0]
					];
					
					animation_time = 0;
					
					for (let i = arrays.length - 1; i >= 0; i--)
					{
						await remove_array(0);
					}
					
					await add_new_array(0, rpp, false, false);
					
					if (!in_exact_hex_view)
					{
						await show_hex_view();
					}
					
					await Page.Animate.change_opacity(canvas_bundle, 1, duration / 2);
					
					resolve();
				});
			},
			
			
			
			0: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						animation_time = duration;
						
						await run_algorithm("sulzgruber", 0);
					}
					
					else
					{
						animation_time = duration / 6;
						
						await run_algorithm("sulzgruber_inverse", 0);
					}
					
					resolve();
				});
			},
			
			1: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					animation_time = duration;
					
					if (forward)
					{
						await show_2d_view();
					}
					
					else
					{
						await show_hex_view();
					}
					
					resolve();
				});
			},
			
			2: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					animation_time = duration;
					
					if (forward)
					{
						await show_hex_view();
					}
					
					else
					{
						await show_2d_view();
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
						animation_time = duration;
						
						await run_algorithm("sulzgruber_inverse", 0);
					}
					
					else
					{
						animation_time = duration / 3;
						
						await run_algorithm("sulzgruber", 0);
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
					await Page.Animate.change_opacity(canvas_bundle, 0, duration / 2);
					
					slide.appendChild(canvas_bundle);
					
					wilson_numbers.draggables.on_resize();
					
					const rpp =
					[
						[4, 4, 4],
						[4, 3, 2],
						[4, 1, 1]
					];
					
					const rpp_2 =
					[
						[4, 4, 4],
						[4, 3, 2],
						[4, 1, 1]
					];
					
					animation_time = 0;
					
					for (let i = arrays.length - 1; i >= 0; i--)
					{
						await remove_array(0);
					}
					
					await add_new_array(0, rpp, false, false);
					
					await add_new_array(1, rpp_2, false, false);
					
					if (!in_exact_hex_view)
					{
						await show_hex_view();
					}
					
					if (!forward)
					{
						await lapsa_options.builds["ps-rsk"][1](slide, true, 0);
						await lapsa_options.builds["ps-rsk"][2](slide, true, 0);
						await lapsa_options.builds["ps-rsk"][3](slide, true, 0);
						await lapsa_options.builds["ps-rsk"][4](slide, true, 0);
						await lapsa_options.builds["ps-rsk"][5](slide, true, 0);
					}
					
					await Page.Animate.change_opacity(canvas_bundle, 1, duration / 2);
					
					resolve();
				});
			},
			
			
			
			1: (slide, forward, duration = 300) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						animation_time = duration;
						
						await show_hex_view();
						
						await run_algorithm("sulzgruber", 1);
						
						await show_2d_view();
					}
					
					else
					{
						animation_time = duration / 3;
						
						await show_hex_view();
						
						await run_algorithm("sulzgruber_inverse", 1);
					}
					
					resolve();
				});
			},
			
			2: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					animation_time = duration;
					
					if (forward)
					{
						await remove_array(1);
						
						const tableau =
						[
							[1, 1, 2],
							[0, 1, 0],
							[3, 0, 0]
						];
						
						await add_new_array(1, tableau, false, false);
					}
					
					else
					{
						await remove_array(1);
						
						const tableau =
						[
							[0, 0, 3],
							[0, 1, 0],
							[2, 1, 1]
						];
						
						await add_new_array(1, tableau, false, false);
					}
					
					resolve();
				});
			},
			
			3: (slide, forward, duration = 400) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					animation_time = duration;
					
					if (forward)
					{
						await run_algorithm("rsk_inverse", 1);
						
						const cubes_1 = [[0, 0, 0], [0, 1, 0], [0, 2, 0], [0, 3, 0], [1, 0, 1], [1, 1, 1], [1, 2, 2], [2, 0, 2]];
						const cubes_2 = [[0, 0, 0], [0, 1, 0], [0, 2, 0], [0, 3, 0], [1, 0, 1], [1, 1, 2], [1, 2, 2], [2, 0, 2]];
						
						await uncolor_cubes(arrays[1], cubes_1);
						await uncolor_cubes(arrays[2], cubes_2);
					}
					
					else
					{
						await run_algorithm("rsk", 1);
					}
					
					resolve();
				});
			},
			
			4: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					animation_time = duration;
					
					const cubes_0 = [[0, 1, 3], [1, 2, 1]];
					const cubes_1 = [[0, 0, 0], [0, 1, 0], [0, 2, 0], [0, 3, 0], [1, 0, 1], [1, 1, 1]];
					
					if (forward)
					{
						await color_cubes(arrays[0], cubes_0, 0);
						await color_cubes(arrays[1], cubes_1, 0);
					}
					
					else
					{
						await uncolor_cubes(arrays[0], cubes_0);
						await uncolor_cubes(arrays[1], cubes_1);
					}
					
					resolve();
				});
			},
			
			5: (slide, forward, duration = 600) =>
			{
				return new Promise(async (resolve, reject) =>
				{
					animation_time = duration;
					
					const cubes_0 = [[2, 0, 3]];
					const cubes_2 = [[0, 0, 0], [0, 1, 0], [0, 2, 0], [0, 3, 0]];
					
					if (forward)
					{
						await color_cubes(arrays[0], cubes_0, .6);
						await color_cubes(arrays[2], cubes_2, .6);
					}
					
					else
					{
						await uncolor_cubes(arrays[0], cubes_0);
						await uncolor_cubes(arrays[2], cubes_2);
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
					await Page.Animate.change_opacity(canvas_bundle, 0, duration / 2);
					
					slide.appendChild(canvas_bundle);
					
					wilson_numbers.draggables.on_resize();
					
					const rpp =
					[
						[1, 2, 3],
						[4, 5, 6],
						[7, 8, 9]
					];
					
					animation_time = 0;
					
					for (let i = arrays.length - 1; i >= 0; i--)
					{
						await remove_array(0);
					}
					
					await add_new_array(0, rpp, false, false);
					
					if (!in_2d_view)
					{
						await show_2d_view();
					}
					
					await Page.Animate.change_opacity(canvas_bundle, 1, duration / 2);
					
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
					await Page.Animate.change_opacity(canvas_bundle, 0, duration / 2);
					
					slide.appendChild(canvas_bundle);
					
					wilson_numbers.draggables.on_resize();
					
					const rpp =
					[
						[1, 0, 1],
						[1, 2, 0],
						[0, 0, 1]
					];
					
					animation_time = 0;
					
					for (let i = arrays.length - 1; i >= 0; i--)
					{
						await remove_array(0);
					}
					
					await add_new_array(0, rpp, false, false);
					
					if (!in_2d_view)
					{
						await show_2d_view();
					}
					
					await Page.Animate.change_opacity(canvas_bundle, 1, duration / 2);
					
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
					await Page.Animate.change_opacity(canvas_bundle, 0, duration / 2);
					
					slide.appendChild(canvas_bundle);
					
					wilson_numbers.draggables.on_resize();
					
					const rpp =
					[
						[1, 0, 1],
						[1, 2, 0],
						[0, 0, 1]
					];
					
					animation_time = 0;
					
					for (let i = arrays.length - 1; i >= 0; i--)
					{
						await remove_array(0);
					}
					
					await add_new_array(0, rpp, false, false);
					
					if (!in_2d_view)
					{
						await show_2d_view();
					}
					
					await Page.Animate.change_opacity(canvas_bundle, 1, duration / 2);
					
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
					await Page.Animate.change_opacity(canvas_bundle, 0, duration / 2);
					
					slide.appendChild(canvas_bundle);
					
					wilson_numbers.draggables.on_resize();
					
					const rpp =
					[
						[0, 1, 2],
						[0, 1, 4],
						[2, 4, 5]
					];
					
					animation_time = 0;
					
					for (let i = arrays.length - 1; i >= 0; i--)
					{
						await remove_array(0);
					}
					
					await add_new_array(0, rpp, false, false);
					
					if (!in_2d_view)
					{
						await show_2d_view();
					}
					
					await Page.Animate.change_opacity(canvas_bundle, 1, duration / 2);
					
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
					await Page.Animate.change_opacity(canvas_bundle, 0, duration / 2);
					
					slide.appendChild(canvas_bundle);
					
					wilson_numbers.draggables.on_resize();
					
					const app =
					[
						[Infinity, Infinity, Infinity, 9, 5],
						[Infinity, Infinity, 5,        4, 1],
						[6,        4,        4,        3, 0],
						[6,        3,        2,        1, 0],
						[4,        1,        1,        0, 0],
					];
					
					animation_time = 0;
					
					for (let i = arrays.length - 1; i >= 0; i--)
					{
						await remove_array(0);
					}
					
					await add_new_array(0, app, false, false);
					
					if (!in_2d_view)
					{
						await show_2d_view();
					}
					
					await Page.Animate.change_opacity(canvas_bundle, 1, duration / 2);
					
					resolve();
				});
			},
		},
	}
};

let lapsa;

setTimeout(() =>
{
	lapsa = new Lapsa(lapsa_options);
	
	document.body.querySelector("#help-link").addEventListener("click", () => lapsa.jumpToSlide(0));
	
	document.body.querySelector(".slide").addEventListener("click", () =>
	{
		document.documentElement.webkitRequestFullscreen();
		document.documentElement.requestFullscreen();
	});
}, 500);