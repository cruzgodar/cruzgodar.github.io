!async function()
{
	"use strict";
	
	Site.load_style("/style/lapsa.min.css");
	await Site.load_script("/scripts/lapsa.min.js");
	
	await Site.load_applet("quasi-fuchsian-groups");
	
	const applet = new QuasiFuchsianGroups(Page.element.querySelector("#output-canvas"));
	
	document.head.querySelector("#theme-color-meta").setAttribute("content", "#181818");
	
	document.body.appendChild(Page.element.querySelector("#background"));
	document.body.appendChild(Page.element.querySelector("#lapsa-slide-container"));
	
	const canvas_bundle = document.body.querySelector("#canvas-bundle");
	
	setTimeout(() =>
	{
		document.body.querySelectorAll(".wilson-draggables-container, .wilson-draggable").forEach(element => element.classList.add("lapsa-interactable"));
	}, 500);
	
	
	
	const resolution = 1500;
	const max_depth = 250;
	const max_pixel_brightness = 50;
	
	

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
						if (slide.contains(canvas_bundle))
						{
							resolve();
							return;
						}
						
						await Page.Animate.change_opacity(canvas_bundle, 0, duration / 2);
						
						slide.appendChild(canvas_bundle);
						
						applet.change_recipe(0);
						applet.bake_coefficients(1.75, -.3719, 1.8638, .2691);
						
						await applet.request_high_res_frame(resolution, max_depth, max_pixel_brightness, 4);
						
						await Page.Animate.change_opacity(canvas_bundle, 1, duration / 2);
						
						resolve();
					});
				}
			},
			
			
			
			"untamed":
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
						
						slide.appendChild(canvas_bundle);
						
						applet.change_recipe(0);
						applet.bake_coefficients(1, -2, 3, 2);
						
						
						await applet.request_high_res_frame(resolution, max_depth, max_pixel_brightness, 4);
						
						await Page.Animate.change_opacity(canvas_bundle, 1, duration / 2);
						
						resolve();
					});
				}
			},
			
			
			
			"grandmas-recipe":
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
						
						slide.appendChild(canvas_bundle);
						
						applet.wilson.draggables.world_coordinates = [[2, 0], [2, 0], [2, -2]];
						applet.wilson.draggables.on_resize();
						
						applet.change_recipe(0);
						applet.bake_coefficients(2, 0, 2, 0);
						
						await applet.request_high_res_frame(resolution, max_depth, max_pixel_brightness, 4);
						
						await Page.Animate.change_opacity(canvas_bundle, 1, duration / 2);
						
						resolve();
					});
				}
			},
			
			
			
			"rileys-recipe":
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
						
						slide.appendChild(canvas_bundle);
						
						applet.wilson.draggables.world_coordinates = [[2, 0], [2, 0], [2, -2]];
						applet.wilson.draggables.on_resize();
						
						applet.change_recipe(1);
						applet.bake_coefficients(2, 0);
						
						await applet.request_high_res_frame(resolution, max_depth, max_pixel_brightness, 4);
						
						await Page.Animate.change_opacity(canvas_bundle, 1, duration / 2);
						
						resolve();
					});
				}
			},
			
			
			
			"special-recipe":
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
						
						slide.appendChild(canvas_bundle);
						
						applet.wilson.draggables.world_coordinates = [[1.737, -0.224], [2.337, 0.987], [2.329, -1.673]];
						applet.wilson.draggables.on_resize();
						
						applet.change_recipe(2);
						applet.bake_coefficients(1.737, -0.224, 2.337, 0.987, 2.329, -1.673);
						
						await applet.request_high_res_frame(resolution, max_depth, max_pixel_brightness, 4);
						
						await Page.Animate.change_opacity(canvas_bundle, 1, duration / 2);
						
						resolve();
					});
				}
			},
			
			
			
			"animation":
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
						
						slide.appendChild(canvas_bundle);
						
						applet.wilson.draggables.world_coordinates = [[2, 0], [2, 0], [2, -2]];
						applet.wilson.draggables.on_resize();
						
						applet.change_recipe(0);
						
						
						
						applet.resolution_small = 500;
						applet.resolution_large = 1500;
						applet.change_aspect_ratio();
						
						
						
						let last_timestamp = 0;
						
						let frame = 180;
						let start_1_x = 2;
						let start_2_x = 2;
						let start_1_y = 0;
						let start_2_y = 0;
						let end_1_x = 2;
						let end_2_x = 2;
						let end_1_y = 0;
						let end_2_y = 0;
						
						const animation_frame = (timestamp) =>
						{
							const time_elapsed = timestamp - last_timestamp;
							
							last_timestamp = timestamp;
							
							if (time_elapsed === 0)
							{
								return;
							}
							
							if (frame >= 180)
							{
								start_1_x = end_1_x;
								start_2_x = end_2_x;
								start_1_y = end_1_y;
								start_2_y = end_2_y;
								
								end_1_x = Math.random() * .15 + 1.95;
								end_2_x = Math.random() * .15 + 1.95;
								end_1_y = Math.random() * 2 - 1;
								end_2_y = Math.random() * 2 - 1;
								
								frame = -30;
							}
							
							if (frame >= 0)
							{	
								const t = (Math.sin(frame / 180 * Math.PI - Math.PI / 2) + 1) / 2;
								
								const x1 = (1 - t) * start_1_x + t * end_1_x;
								const y1 = (1 - t) * start_1_y + t * end_1_y;
								const x2 = (1 - t) * start_2_x + t * end_2_x;
								const y2 = (1 - t) * start_2_y + t * end_2_y;
								
								applet.wilson.draggables.world_coordinates = [[x1, y1], [x2, y2], [2, -2]];
							}
							
							frame++;
							
							//Extremely gross and hard-coded --- I'll add a solution for this sort of thing eventually.
							if (lapsa.currentSlide === 18)
							{
								applet.on_drag_draggable();
								
								window.requestAnimationFrame(animation_frame);
							}
						};
						
						window.requestAnimationFrame(animation_frame);
						
						
						
						await Page.Animate.change_opacity(canvas_bundle, 1, duration / 2);
						
						resolve();
					});
				}
			}
		}
	};
	
	await applet.load_promise;
	
	const lapsa = new Lapsa(options);
	
	document.body.querySelector("#help-link").addEventListener("click", () => lapsa.jumpToSlide(0));
	
	Page.show();
}()