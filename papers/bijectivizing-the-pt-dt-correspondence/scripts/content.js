const APPLET_VERSION = false;

let canvas_bundle = Page.element.querySelector("#canvas-bundle");

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
					let cubes = [];
					
					if (forward)
					{
						cubes = [[0, 0, 0], [0, 1, 0], [0, 2, 0], [0, 3, 0]];
					}
					
					else
					{
						cubes = [[0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0]];
					}	
					
					await color_cubes(arrays[0], cubes, 0);
					
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
};