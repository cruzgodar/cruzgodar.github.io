import { showPage } from "/scripts/src/load-page.mjs"
!async function()
{
	"use strict";
	
	Site.loadStyle("/style/lapsa.min.css");
	await Site.loadScript("/scripts/lapsa.min.js");
	
	await Applet.load("quasi-fuchsian-groups");
	
	const applet = new QuasiFuchsianGroups($("#output-canvas"));
	
	document.head.querySelector("#theme-color-meta").setAttribute("content", "#181818");
	
	document.body.appendChild($("#lapsa-slide-container"));
	
	const canvasBundle = document.body.querySelector("#canvas-bundle");
	
	setTimeout(() =>
	{
		document.body.querySelectorAll(".wilson-draggable").forEach(element => element.classList.add("lapsa-interactable"));
	}, 500);
	
	
	
	const resolution = 1500;
	const maxDepth = 250;
	const maxPixelBrightness = 50;
	
	

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
						
						slide.appendChild(canvasBundle);
						
						applet.changeRecipe(0);
						applet.bakeCoefficients(1.75, -.3719, 1.8638, .2691);
						
						await applet.requestHighResFrame(resolution, maxDepth, maxPixelBrightness, 4);
						
						await changeOpacity(canvasBundle, 1, duration / 2);
						
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
						if (slide.contains(canvasBundle))
						{
							resolve();
							return;
						}
						
						await changeOpacity(canvasBundle, 0, duration / 2);
						
						slide.appendChild(canvasBundle);
						
						applet.changeRecipe(0);
						applet.bakeCoefficients(1, -2, 3, 2);
						
						
						await applet.requestHighResFrame(resolution, maxDepth, maxPixelBrightness, 4);
						
						await changeOpacity(canvasBundle, 1, duration / 2);
						
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
						if (slide.contains(canvasBundle))
						{
							resolve();
							return;
						}
						
						await changeOpacity(canvasBundle, 0, duration / 2);
						
						slide.appendChild(canvasBundle);
						
						applet.wilson.draggables.worldCoordinates = [[2, 0], [2, 0], [2, -2]];
						applet.wilson.draggables.onResize();
						
						applet.changeRecipe(0);
						applet.bakeCoefficients(2, 0, 2, 0);
						
						await applet.requestHighResFrame(resolution, maxDepth, maxPixelBrightness, 4);
						
						await changeOpacity(canvasBundle, 1, duration / 2);
						
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
						if (slide.contains(canvasBundle))
						{
							resolve();
							return;
						}
						
						await changeOpacity(canvasBundle, 0, duration / 2);
						
						slide.appendChild(canvasBundle);
						
						applet.wilson.draggables.worldCoordinates = [[2, 0], [2, 0], [2, -2]];
						applet.wilson.draggables.onResize();
						
						applet.changeRecipe(1);
						applet.bakeCoefficients(2, 0);
						
						await applet.requestHighResFrame(resolution, maxDepth, maxPixelBrightness, 4);
						
						await changeOpacity(canvasBundle, 1, duration / 2);
						
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
						if (slide.contains(canvasBundle))
						{
							resolve();
							return;
						}
						
						await changeOpacity(canvasBundle, 0, duration / 2);
						
						slide.appendChild(canvasBundle);
						
						applet.wilson.draggables.worldCoordinates = [[1.737, -0.224], [2.337, 0.987], [2.329, -1.673]];
						applet.wilson.draggables.onResize();
						
						applet.changeRecipe(2);
						applet.bakeCoefficients(1.737, -0.224, 2.337, 0.987, 2.329, -1.673);
						
						await applet.requestHighResFrame(resolution, maxDepth, maxPixelBrightness, 4);
						
						await changeOpacity(canvasBundle, 1, duration / 2);
						
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
						if (slide.contains(canvasBundle))
						{
							resolve();
							return;
						}
						
						await changeOpacity(canvasBundle, 0, duration / 2);
						
						slide.appendChild(canvasBundle);
						
						applet.wilson.draggables.worldCoordinates = [[2, 0], [2, 0], [2, -2]];
						applet.wilson.draggables.onResize();
						
						applet.changeRecipe(0);
						
						
						
						applet.resolutionSmall = 500;
						applet.resolutionLarge = 1500;
						applet.changeAspectRatio();
						
						
						
						let lastTimestamp = 0;
						
						let frame = 180;
						let start1X = 2;
						let start2X = 2;
						let start1Y = 0;
						let start2Y = 0;
						let end1X = 2;
						let end2X = 2;
						let end1Y = 0;
						let end2Y = 0;
						
						const animationFrame = (timestamp) =>
						{
							const timeElapsed = timestamp - lastTimestamp;
							
							lastTimestamp = timestamp;
							
							if (timeElapsed === 0)
							{
								return;
							}
							
							if (frame >= 180)
							{
								start1X = end1X;
								start2X = end2X;
								start1Y = end1Y;
								start2Y = end2Y;
								
								end1X = Math.random() * .15 + 1.95;
								end2X = Math.random() * .15 + 1.95;
								end1Y = Math.random() * 2 - 1;
								end2Y = Math.random() * 2 - 1;
								
								frame = -10;
							}
							
							if (frame >= 0)
							{	
								const t = (Math.sin(frame / 180 * Math.PI - Math.PI / 2) + 1) / 2;
								
								const x1 = (1 - t) * start1X + t * end1X;
								const y1 = (1 - t) * start1Y + t * end1Y;
								const x2 = (1 - t) * start2X + t * end2X;
								const y2 = (1 - t) * start2Y + t * end2Y;
								
								applet.wilson.draggables.worldCoordinates = [[x1, y1], [x2, y2], [2, -2]];
							}
							
							frame++;
							
							//Extremely gross and hard-coded --- I'll add a solution for this sort of thing eventually.
							if (lapsa.currentSlide === 17)
							{
								applet.onDragDraggable();
								
								window.requestAnimationFrame(animationFrame);
							}
						};
						
						window.requestAnimationFrame(animationFrame);
						
						
						
						await changeOpacity(canvasBundle, 1, duration / 2);
						
						resolve();
					});
				}
			}
		}
	};
	
	await applet.loadPromise;
	
	const lapsa = new Lapsa(options);
	
	document.body.querySelector("#help-link").addEventListener("click", () => lapsa.jumpToSlide(0));
	
	showPage();
	}()