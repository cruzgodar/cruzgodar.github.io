!async function()
{
	"use strict";
	
	Site.load_style("/style/lapsa.min.css");
	await Site.load_script("/scripts/lapsa.min.js");
	
	await Site.load_applet("quasi-fuchsian-groups");
	
	const applet = new QuasiFuchsianGroups(Page.element.querySelector("#output-canvas"));
	
	document.head.querySelector("#theme-color-meta").setAttribute("content", "#181818");
	
	document.body.appendChild(Page.element.querySelector("#lapsa-slide-container"));
	
	const canvas_bundle = document.body.querySelector("#canvas-bundle");
	
	document.body.querySelectorAll(".wilson-draggables-container").forEach(element => element.classList.add("lapsa-interactable"));
	
	
	
	const resolution = 1000;
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
						
						applet.bake_coefficients(1.75, -.3719, 1.8638, .2691);
						
						await applet.request_high_res_frame(resolution, max_depth, max_pixel_brightness, 4);
						
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