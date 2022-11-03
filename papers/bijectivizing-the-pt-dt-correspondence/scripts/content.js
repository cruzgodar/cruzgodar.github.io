const APPLET_VERSION = false;

let canvas_bundle = Page.element.querySelector("#canvas-bundle");

let rects = [];

let callbacks =
{
	"title":
	{
		callback: function(slide, forward)
		{
			return new Promise(async (resolve, reject) =>
			{
				slide.appendChild(canvas_bundle);
				
				let plane_partition = [
					[6, 5, 4, 3, 2, 1],
					[5, 4, 3, 2, 1, 0],
					[4, 3, 2, 1, 0, 0],
					[3, 2, 1, 0, 0, 0],
					[2, 1, 0, 0, 0, 0],
					[1, 0, 0, 0, 0, 0]
				];
				
				animation_time = 0;
				
				for (let i = arrays.length - 1; i >= 0; i--)
				{
					await remove_array(0);
				}
				
				await show_floor();
				
				await add_new_array(0, plane_partition);
				
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
							color_cubes(arrays[0], [[i - j, j, k]], hue / 21 * 6/7);
						}
						
						hue++;
					}
				}
				
				animation_time = 600;
				
				
				
				resolve();
			});
		}
	},
	
	
	
	"young-diagram-example":
	{
		callback: function(slide, forward)
		{
			return new Promise(async (resolve, reject) =>
			{
				slide.appendChild(canvas_bundle);
				
				let plane_partition = [
					[1, 1, 1, 1, 1],
					[1, 1, 1, 0, 0],
					[1, 1, 0, 0, 0],
					[1, 1, 0, 0, 0],
					[1, 0, 0, 0, 0]
				];
				
				animation_time = 0;
				
				for (let i = arrays.length - 1; i >= 0; i--)
				{
					await remove_array(0);
				}
				
				await hide_floor();
				
				await add_new_array(0, plane_partition);
				
				if (!in_2d_view)
				{
					await show_2d_view();
				}
				
				numbers_canvas_container_element.style.opacity = 0;
				
				animation_time = 600;
				
				
				
				resolve();
			});
		}
	},
	
	
	
	"plane-partition-example":
	{
		callback: function(slide, forward)
		{
			return new Promise(async (resolve, reject) =>
			{
				slide.appendChild(canvas_bundle);
				
				let plane_partition = [
					[6, 4, 3, 1, 1],
					[4, 3, 2, 0, 0],
					[3, 2, 0, 0, 0],
					[2, 1, 0, 0, 0],
					[1, 0, 0, 0, 0]
				];
				
				animation_time = 0;
				
				for (let i = arrays.length - 1; i >= 0; i--)
				{
					await remove_array(0);
				}
				
				await show_floor();
				
				await add_new_array(0, plane_partition);
				
				if (!in_2d_view)
				{
					await show_2d_view();
				}
				
				animation_time = 600;
				
				
				
				resolve();
			});
		},
		
		
		
		builds:
		[
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
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
			
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
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
		]
	},
	
	
	
	"app-example":
	{
		callback: function(slide, forward)
		{
			return new Promise(async (resolve, reject) =>
			{
				slide.appendChild(canvas_bundle);
				
				let plane_partition = [
					[Infinity, Infinity, Infinity, 1, 1],
					[Infinity, Infinity, 2, 0, 0],
					[3, 2, 0, 0, 0],
					[2, 1, 0, 0, 0],
					[1, 0, 0, 0, 0]
				];
				
				animation_time = 0;
				
				for (let i = arrays.length - 1; i >= 0; i--)
				{
					await remove_array(0);
				}
				
				await show_floor();
				
				await add_new_array(0, plane_partition);
				
				if (!in_2d_view)
				{
					await show_2d_view();
				}
				
				animation_time = 600;
				
				
				
				resolve();
			});
		},
		
		
		
		builds:
		[
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
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
			
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
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
		]
	},
	
	
	
	"rpp-example":
	{
		callback: function(slide, forward)
		{
			return new Promise(async (resolve, reject) =>
			{
				slide.appendChild(canvas_bundle);
				
				let rpp = [
					[1, 3, 4],
					[2, 5, 0],
					[3, 0, 0]
				];
				
				let app = [
					[Infinity, Infinity, 3],
					[Infinity, 5, 2],
					[4, 3, 1],
				];
				
				animation_time = 0;
				
				for (let i = arrays.length - 1; i >= 0; i--)
				{
					await remove_array(0);
				}
				
				await hide_floor();
				
				await add_new_array(0, rpp);
				await add_new_array(1, app);
				
				if (!in_2d_view)
				{
					await show_2d_view();
				}
				
				draw_all_2d_view_text();
				
				animation_time = 600;
				
				
				
				resolve();
			});
		},
	},
	
	
	
	"hooks":
	{
		callback: function(slide, forward)
		{
			return new Promise(async (resolve, reject) =>
			{
				slide.appendChild(canvas_bundle);
				
				let plane_partition = [
					[Infinity, Infinity, Infinity, Infinity, Infinity, 5],
					[Infinity, Infinity, 7, 7, 6, 5],
					[8, 8, 7, 7, 3, 2],
					[8, 7, 6, 4, 1, 1],
					[6, 6, 6, 3, 0, 0],
					[6, 3, 3, 2, 0, 0]
				];
				
				animation_time = 0;
				
				for (let i = arrays.length - 1; i >= 0; i--)
				{
					await remove_array(0);
				}
				
				await show_floor();
				
				await add_new_array(0, plane_partition);
				
				if (!in_2d_view)
				{
					await show_2d_view();
				}
				
				
				
				if (!forward)
				{
					await this.builds[3](slide, true);
				}
				
				animation_time = 600;
				
				
				
				resolve();
			});
		},
		
		
		
		builds:
		[
			() => {},
			() => {},
			() => {},
			
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					let pivot = [2, 3];
					let cubes = [];
					
					for (let j = 0; j <= pivot[1]; j++)
					{
						let height = arrays[0].numbers[pivot[0]][j];
						
						if (height !== Infinity)
						{
							cubes.push([pivot[0], j, height - 1]);
						}
					}
					
					for (let i = pivot[0] - 1; i >= 0; i--)
					{
						let height = arrays[0].numbers[i][pivot[1]];
						
						if (height !== Infinity)
						{
							cubes.push([i, pivot[1], height - 1]);
						}
					}
					
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
		]
	},
	
	
	
	"legos":
	{
		callback: function(slide, forward)
		{
			return new Promise(async (resolve, reject) =>
			{
				slide.appendChild(canvas_bundle);
				
				let plane_partition = [
					[1, 1],
					[1, 0]
				];
				
				let hooks = [
					[1, 0, 1, 1],
					[0, 0, 0, 0],
					[1, 0, 0, 1],
					[1, 0, 1, 1]
				];
				
				animation_time = 0;
				
				for (let i = arrays.length - 1; i >= 0; i--)
				{
					await remove_array(0);
				}
				
				await hide_floor();
				
				await add_new_array(0, plane_partition);
				await add_new_array(1, hooks);
				
				if (!in_2d_view)
				{
					await show_2d_view();
				}
				
				animation_time = 600;
				
				
				
				resolve();
			});
		}
	},
	
	
	
	"zigzag-paths":
	{
		callback: function(slide, forward)
		{
			return new Promise(async (resolve, reject) =>
			{
				slide.appendChild(canvas_bundle);
				
				let plane_partition = [
					[Infinity, Infinity, Infinity, Infinity, Infinity, 5],
					[Infinity, Infinity, 7, 7, 6, 5],
					[8, 8, 7, 7, 3, 2],
					[8, 7, 6, 4, 1, 1],
					[6, 6, 6, 3, 0, 0],
					[6, 3, 3, 2, 0, 0]
				];
				
				animation_time = 0;
				
				for (let i = arrays.length - 1; i >= 0; i--)
				{
					await remove_array(0);
				}
				
				await add_new_array(0, plane_partition);
				
				if (!in_2d_view)
				{
					await show_2d_view();
				}
				
				await show_floor();
				
				
				
				if (!forward)
				{
					await this.builds[2](slide, true);
					await this.builds[4](slide, true);
				}
				
				animation_time = 600;
				
				
				
				resolve();
			});
		},
		
		
		
		builds:
		[
			() => {},
			() => {},
			
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					animation_time = 300;
					
					let cubes = [[0, 5], [1, 5], [1, 4], [1, 3], [2, 3], [2, 2], [2, 1], [2, 0], [3, 0]];
					
					cubes = cubes.map(cube => [cube[0], cube[1], arrays[0].numbers[cube[0]][cube[1]] - 1]);
					
					if (forward)
					{
						for (let i = 0; i < cubes.length; i++)
						{
							await color_cubes(arrays[0], [cubes[i]], 0);
						}
					}
					
					else
					{
						await uncolor_cubes(arrays[0], cubes);
					}
					
					animation_time = 600;
					
					resolve();
				});
			},
			
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					let cubes = [[3, 5, arrays[0].numbers[3][5] - 1]];
					
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
			}
		]
	},
	
	
	
	"zigzag-paths-2":
	{
		callback: function(slide, forward)
		{
			return new Promise(async (resolve, reject) =>
			{
				slide.appendChild(canvas_bundle);
				
				let plane_partition = [
					[Infinity, Infinity, Infinity, Infinity, Infinity, 5],
					[Infinity, Infinity, 7, 7, 6, 5],
					[8, 8, 7, 7, 3, 2],
					[8, 7, 6, 4, 1, 1],
					[6, 6, 6, 3, 0, 0],
					[6, 3, 3, 2, 0, 0]
				];
				
				animation_time = 0;
				
				for (let i = arrays.length - 1; i >= 0; i--)
				{
					await remove_array(0);
				}
				
				await add_new_array(0, plane_partition);
				
				if (!in_2d_view)
				{
					await show_2d_view();
				}
				
				await show_floor();
				
				
				
				let cubes = [[0, 5], [1, 5], [1, 4], [1, 3], [2, 3], [2, 2], [2, 1], [2, 0], [3, 0]];
				
				cubes = cubes.map(cube => [cube[0], cube[1], arrays[0].numbers[cube[0]][cube[1]] - 1]);
				
				for (let i = 0; i < cubes.length; i++)
				{
					await color_cubes(arrays[0], [cubes[i]], 0);
				}
				
				cubes = [[3, 5, arrays[0].numbers[3][5] - 1]];
				
				await color_cubes(arrays[0], cubes, .6);
				
				
				
				if (!forward)
				{
					await this.builds[3](slide, true);
				}
				
				animation_time = 600;
				
				
				
				resolve();
			});
		},
		
		
		
		builds:
		[
			() => {},
			() => {},
			() => {},
			
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					let cubes = [[0, 5], [1, 5], [1, 4], [1, 3], [2, 3], [2, 2], [2, 1], [2, 0], [3, 0]];
					let targets = [[0, 5], [1, 5], [2, 5], [3, 5], [3, 4], [3, 3], [3, 2], [3, 1], [3, 0]];
					
					for (let i = 0; i < cubes.length; i++)
					{
						let height = arrays[0].numbers[cubes[i][0]][cubes[i][1]] - 1;
						
						cubes[i].push(height);
						targets[i].push(height);
					}
					
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
		]
	},
	
	
	
	"hillman-grassl":
	{
		callback: function(slide, forward)
		{
			return new Promise(async (resolve, reject) =>
			{
				slide.appendChild(canvas_bundle);
				
				let plane_partition = [
					[Infinity, Infinity, Infinity, 3],
					[Infinity, 6, 4, 3],
					[6, 6, 4, 2],
					[3, 1, 1, 0]
				];
				
				animation_time = 0;
				
				for (let i = arrays.length - 1; i >= 0; i--)
				{
					await remove_array(0);
				}
				
				await add_new_array(0, plane_partition);
				
				if (!in_2d_view)
				{
					await show_2d_view();
				}
				
				await show_floor();
				
				animation_time = 600;
				
				resolve();
			});
		},
		
		
		
		builds:
		[
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						await show_hex_view();
					}
					
					else
					{
						animation_time = 100;
						
						await show_2d_view();
						
						animation_time = 600;
					}
					
					resolve();
				});
			},
			
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						await run_algorithm("hillman_grassl", 0);
					}
					
					else
					{
						animation_time = 100;
						
						await run_algorithm("hillman_grassl_inverse", 0);
						
						animation_time = 600;
					}
					
					resolve();
				});
			},
			
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						animation_time = 300;
						
						await run_algorithm("hillman_grassl_inverse", 0);
						
						animation_time = 600;
					}
					
					else
					{
						animation_time = 100;
						
						await run_algorithm("hillman_grassl", 0);
						
						animation_time = 600;
					}
					
					resolve();
				});
			},
			
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						await show_2d_view();
					}
					
					else
					{
						animation_time = 100;
						
						await show_hex_view();
						
						animation_time = 600;
					}
					
					resolve();
				});
			}
		]
	},
	
	
	
	"bijection-structure":
	{
		callback: function(slide, forward)
		{
			return new Promise(async (resolve, reject) =>
			{
				slide.appendChild(canvas_bundle);
				
				let plane_partition = [];
				
				if (forward)
				{
					plane_partition = [
						[1, 1, 1, 1],
						[0, 0, 0, 0],
						[0, 0, 0, 0],
						[0, 0, 0, 0]
					];
				}
				
				else
				{
					plane_partition = [
						[1, 0, 0, 0],
						[1, 0, 0, 0],
						[1, 0, 0, 0],
						[1, 0, 0, 0]
					];
				}	
				
				
				
				animation_time = 0;
				
				for (let i = arrays.length - 1; i >= 0; i--)
				{
					await remove_array(0);
				}
				
				await add_new_array(0, plane_partition);
				
				if (!forward)
				{
					await color_cubes(arrays[0], [[3, 0, 0], [2, 0, 0], [1, 0, 0], [0, 0, 0]], 0);
				}
				
				if (!in_2d_view)
				{
					await show_2d_view();
				}
				
				await show_floor();
				
				numbers_canvas_container_element.style.opacity = 0;
				
				
				
				animation_time = 600;
				
				resolve();
			});
		},
		
		
		
		builds:
		[
			() => {},
			() => {},
			
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					let cubes = [[0, 0, 0], [0, 1, 0], [0, 2, 0], [0, 3, 0]];
					
					if (forward)
					{
						await color_cubes(arrays[0], cubes, 0);
					}
					
					else
					{
						await uncolor_cubes(arrays[0], cubes, 0);
					}	
					
					resolve();
				});
			},
			
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					let cubes = [[0, 0, 0], [0, 1, 0], [0, 2, 0], [0, 3, 0]];
					let targets = [[1, 0, 0], [1, 1, 0], [1, 2, 0], [0, 2, 0]];
					
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
			},
			
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					let cubes = [[1, 0, 0], [1, 1, 0], [1, 2, 0], [0, 2, 0]];
					let targets = [[2, 0, 0], [2, 1, 0], [1, 1, 0], [0, 1, 0]];
					
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
			},
			
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					let cubes = [[2, 0, 0], [2, 1, 0], [1, 1, 0], [0, 1, 0]];
					let targets = [[3, 0, 0], [2, 0, 0], [1, 0, 0], [0, 0, 0]];
					
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
		]
	},
	
	
	
	"n-quotients":
	{
		callback: function(slide, forward)
		{
			return new Promise(async (resolve, reject) =>
			{
				slide.appendChild(canvas_bundle);
				
				let plane_partition = [
					[Infinity, Infinity, Infinity, 0, 0],
					[Infinity, 0, 0, 0, 0],
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0]
				];
				
				
				
				animation_time = 0;
				
				for (let i = arrays.length - 1; i >= 0; i--)
				{
					await remove_array(0);
				}
				
				await add_new_array(0, plane_partition);
				
				if (!in_2d_view)
				{
					await show_2d_view();
				}
				
				await show_floor();
				
				numbers_canvas_container_element.style.opacity = 0;
				
				if (!forward)
				{
					rects = await draw_boundary(0, 2);
					
					await draw_n_quotient(0, 2, 1, rects);
				}
				
				
				
				animation_time = 600;
				
				resolve();
			});
		},
		
		
		
		builds:
		[
			() => {},
			
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						rects = await draw_boundary(0, 2);
					}
					
					else
					{
						await Page.Animate.change_opacity(numbers_canvas_container_element, 0, animation_time / 3);
					}
					
					resolve();
				});
			},
			
			() => {},
			
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						await draw_n_quotient(0, 2, 1, rects);
					}
					
					else
					{
						for (let k = 0; k < infinite_height; k++)
						{
							arrays[0].cubes[0][2][k] = add_cube(arrays[0], 2, k, 0, 0, 0, asymptote_lightness);
							arrays[0].cubes[1][0][k] = add_cube(arrays[0], 0, k, 1, 0, 0, asymptote_lightness);
						}
						
						let things_to_animate = [];
						
						arrays[0].cubes[0][2][0].material.forEach(material => things_to_animate.push(material));
						arrays[0].cubes[1][0][0].material.forEach(material => things_to_animate.push(material));
						
						anime({
							targets: things_to_animate,
							opacity: 1,
							duration: animation_time,
							easing: "easeOutQuad",
							complete: resolve
						});
						
						await Page.Animate.change_opacity(numbers_canvas_container_element, 0, animation_time / 3);
						
						rects = await draw_boundary(0, 2);
					}
					
					resolve();
				});
			},
		]
	},
	
	
	
	"n-quotients-2":
	{
		callback: function(slide, forward)
		{
			return new Promise(async (resolve, reject) =>
			{
				slide.appendChild(canvas_bundle);
				
				let plane_partition = [
					[Infinity, Infinity, Infinity, 0, 0, 0, 0],
					[Infinity, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0]
				];
				
				
				
				animation_time = 0;
				
				for (let i = arrays.length - 1; i >= 0; i--)
				{
					await remove_array(0);
				}
				
				await add_new_array(0, plane_partition);
				
				if (!in_2d_view)
				{
					await show_2d_view();
				}
				
				await show_floor();
				
				numbers_canvas_container_element.style.opacity = 0;
				
				if (!forward)
				{
					rects = await draw_boundary(0, 4);
					
					await draw_n_quotient(0, 4, 1, rects);
				}
				
				
				
				animation_time = 600;
				
				resolve();
			});
		},
		
		
		
		builds:
		[
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						rects = await draw_boundary(0, 4);
					}
					
					else
					{
						await Page.Animate.change_opacity(numbers_canvas_container_element, 0, animation_time / 3);
					}
					
					resolve();
				});
			},
			
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						await draw_n_quotient(0, 4, 1, rects);
					}
					
					else
					{
						for (let k = 0; k < infinite_height; k++)
						{
							arrays[0].cubes[0][1][k] = add_cube(arrays[0], 1, k, 0, 0, 0, asymptote_lightness);
							arrays[0].cubes[0][2][k] = add_cube(arrays[0], 2, k, 0, 0, 0, asymptote_lightness);
							arrays[0].cubes[1][0][k] = add_cube(arrays[0], 0, k, 1, 0, 0, asymptote_lightness);
						}
						
						let things_to_animate = [];
						
						//The animation looks nicer if we only animate in one cube per stack.
						arrays[0].cubes[0][1][0].material.forEach(material => things_to_animate.push(material));
						arrays[0].cubes[0][2][0].material.forEach(material => things_to_animate.push(material));
						arrays[0].cubes[1][0][0].material.forEach(material => things_to_animate.push(material));
						
						anime({
							targets: things_to_animate,
							opacity: 1,
							duration: animation_time / 2,
							easing: "easeOutQuad",
							complete: resolve
						});
						
						await Page.Animate.change_opacity(numbers_canvas_container_element, 0, animation_time / 3);
						
						rects = await draw_boundary(0, 4);
					}
					
					resolve();
				});
			},
		]
	},
	
	
	
	"the-bijection":
	{
		callback: function(slide, forward)
		{
			return new Promise(async (resolve, reject) =>
			{
				slide.appendChild(canvas_bundle);
				
				let plane_partition = [
					[Infinity, Infinity, Infinity, 3, 1],
					[Infinity, 5, 5, 2, 0],
					[5, 4, 1, 0, 0],
					[2, 0, 0, 0, 0],
					[0, 0, 0, 0, 0]
				];
				
				animation_time = 0;
				
				for (let i = arrays.length - 1; i >= 0; i--)
				{
					await remove_array(0);
				}
				
				await add_new_array(0, plane_partition);
				
				if (!in_exact_hex_view)
				{
					await show_hex_view();
				}
				
				await show_floor();
				
				animation_time = 600;
				
				resolve();
			});
		},
		
		
		
		builds:
		[
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						await run_algorithm("godar_1", 0);
					}
					
					else
					{
						animation_time = 50;
						
						await run_algorithm("godar_1_inverse", 0);
						
						animation_time = 600;
					}
					
					resolve();
				});
			},
			
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						animation_time = 300;
						
						await run_algorithm("godar_1_inverse", 0);
						
						animation_time = 600;
					}
					
					else
					{
						animation_time = 50;
						
						await run_algorithm("godar_1", 0);
						
						animation_time = 600;
					}
					
					resolve();
				});
			}
		]
	},
	
	
	
	"legs":
	{
		callback: function(slide, forward)
		{
			return new Promise(async (resolve, reject) =>
			{
				slide.appendChild(canvas_bundle);
				
				animation_time = 0;
				
				for (let i = arrays.length - 1; i >= 0; i--)
				{
					await remove_array(0);
				}
				
				if (!in_exact_hex_view)
				{
					await show_hex_view();
				}
				
				await show_floor();
				
				if (!forward)
				{
					await this.builds[1](slide, true);
				}
				
				animation_time = 600;
				
				resolve();
			});
		},
		
		
		
		builds:
		[
			() => {},
			
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						let plane_partition = [
							[12, 12, 12, 2, 2, 2, 2, 2, 2, 2, 2, 2],
							[12, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
							[4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
						];
						
						await add_new_array(0, plane_partition);
					}
					
					else
					{
						await remove_array(0);
					}
					
					resolve();
				});
			}
		]	
	},
	
	
	
	"toggles":
	{
		callback: function(slide, forward)
		{
			return new Promise(async (resolve, reject) =>
			{
				slide.appendChild(canvas_bundle);
				
				let plane_partition = [
					[Infinity, Infinity, Infinity, 3, 1],
					[Infinity, 5, 3, 2, 0],
					[5, 2, 2, 1, 0],
					[3, 2, 2, 0, 0],
					[0, 0, 0, 0, 0]
				];
				
				animation_time = 0;
				
				for (let i = arrays.length - 1; i >= 0; i--)
				{
					await remove_array(0);
				}
				
				await add_new_array(0, plane_partition);
				
				if (!in_2d_view)
				{
					await show_2d_view();
				}
				
				await show_floor();
				
				if (!forward)
				{
					await this.builds[1](slide, true);
				}
				
				animation_time = 600;
				
				resolve();
			});
		},
		
		
		
		builds:
		[
			() => {},
			() => {},
			
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						await color_cubes(arrays[0], [[1, 1, 4]], .75);
					}
					
					else
					{
						await uncolor_cubes(arrays[0], [[1, 1, 4]]);
					}
					
					resolve();
				});
			},
			
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						arrays[0].numbers[1][1] = 2;
						
						draw_all_2d_view_text();
					}
					
					else
					{
						arrays[0].numbers[1][1] = 5;
						
						draw_all_2d_view_text();
						
						await color_cubes(arrays[0], [[1, 1, 4]], .75);
					}
					
					resolve();
				});
			},
			
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						await color_cubes(arrays[0], [[2, 2, 1]], .75);
					}
					
					else
					{
						await uncolor_cubes(arrays[0], [[2, 2, 1]]);
					}
					
					resolve();
				});
			},
			
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						await uncolor_cubes(arrays[0], [[2, 2, 1]]);
					}
					
					else
					{
						await color_cubes(arrays[0], [[2, 2, 1]], .75);
					}
					
					resolve();
				});
			},
			
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						arrays[0].numbers[3][3] = 1;
						
						draw_all_2d_view_text();
					}
					
					else
					{
						arrays[0].numbers[3][3] = 0;
						
						draw_all_2d_view_text();
					}
					
					resolve();
				});
			},
		]	
	},
	
	
	
	
	"pak-sulzgruber":
	{
		callback: function(slide, forward)
		{
			return new Promise(async (resolve, reject) =>
			{
				slide.appendChild(canvas_bundle);
				
				let plane_partition = [
					[Infinity, Infinity, Infinity, 3, 1],
					[Infinity, 5, 3, 2, 0],
					[5, 2, 2, 1, 0],
					[3, 2, 2, 0, 0],
					[0, 0, 0, 0, 0]
				];
				
				animation_time = 0;
				
				for (let i = arrays.length - 1; i >= 0; i--)
				{
					await remove_array(0);
				}
				
				await add_new_array(0, plane_partition);
				
				if (!in_2d_view)
				{
					await show_2d_view();
				}
				
				await show_floor();
				
				animation_time = 600;
				
				resolve();
			});
		},
		
		
		
		builds:
		[
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						await run_algorithm("pak", 0);
					}
					
					else
					{
						animation_time = 50;
						
						await run_algorithm("pak_inverse", 0);
						
						animation_time = 600;
					}
					
					resolve();
				});
			},
			
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						animation_time = 300;
						
						await run_algorithm("pak_inverse", 0);
						
						animation_time = 600;
					}
					
					else
					{
						animation_time = 50;
						
						await run_algorithm("pak", 0);
						
						animation_time = 600;
					}
					
					resolve();
				});
			}
		]
	},
	
	
	
	"interlacing":
	{
		callback: function(slide, forward)
		{
			return new Promise(async (resolve, reject) =>
			{
				slide.appendChild(canvas_bundle);
				
				let plane_partition = [
					[9, 7, 6, 4, 4],
					[8, 6, 6, 4, 2],
					[8, 6, 5, 3, 1],
					[7, 5, 5, 2, 1],
					[2, 0, 0, 0, 0]
				];
				
				animation_time = 0;
				
				for (let i = arrays.length - 1; i >= 0; i--)
				{
					await remove_array(0);
				}
				
				await add_new_array(0, plane_partition);
				
				if (!in_2d_view)
				{
					await show_2d_view();
				}
				
				await show_floor();
				
				animation_time = 600;
				
				resolve();
			});
		},
		
		
		
		builds:
		[
			() => {},
			() => {},
			
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						color_cubes(arrays[0], [[0, 1, 6], [1, 2, 5], [2, 3, 2], [3, 4, 0]], .5);
						await color_cubes(arrays[0], [[0, 0, 8], [1, 1, 5], [2, 2, 4], [3, 3, 1]], .75);
					}
					
					else
					{
						uncolor_cubes(arrays[0], [[0, 1, 6], [1, 2, 5], [2, 3, 2], [3, 4, 0]]);
						await uncolor_cubes(arrays[0], [[0, 0, 8], [1, 1, 5], [2, 2, 4], [3, 3, 1]]);
					}
					
					resolve();
				});
			}
		]
	},
	
	
	
	"thanks":
	{
		callback: function(slide, forward)
		{
			return new Promise(async (resolve, reject) =>
			{
				slide.appendChild(canvas_bundle);
				
				let plane_partition = [
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					
					[1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1],
					[0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1],
					[0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1],
					[0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
					[0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1],
					
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
				];
				
				animation_time = 0;
				
				for (let i = arrays.length - 1; i >= 0; i--)
				{
					await remove_array(0);
				}
				
				await show_floor();
				
				await add_new_array(0, plane_partition);
				
				if (!in_exact_hex_view)
				{
					await show_hex_view();
				}
				
				animation_time = 600;
				
				
				
				resolve();
			});
		},
		
		
		
		builds:
		[
			function(slide, forward)
			{
				return new Promise(async (resolve, reject) =>
				{
					if (forward)
					{
						for (let i = 0; i < arrays[0].footprint; i++)
						{
							for (let j = 0; j < arrays[0].footprint; j++)
							{
								if (arrays[0].numbers[i][j] !== 0)
								{
									setTimeout(() => color_cubes(arrays[0], [[i, j, 0]], (.5 * ((i - 13) / 4) + .5 * (j / 28)) * 6/7), ((i - 13) + j) * 50);
								}
							}
						}
					}
					
					else
					{
						let cubes = [];
						
						for (let i = 0; i < arrays[0].footprint; i++)
						{
							for (let j = 0; j < arrays[0].footprint; j++)
							{
								if (arrays[0].numbers[i][j] !== 0)
								{
									cubes.push([i, j, 0]);
								}
							}
						}
						
						await uncolor_cubes(arrays[0], cubes);
					}
					
					resolve();
				});
			}
		]
	}
};