!async function()
{
	"use strict";
	
	document.documentElement.style.backgroundColor = "rgb(0, 0, 0)";
	
	Page.background_color_changed = true;
	
	Page.show()
	
	.then(() =>
	{
		anime({
			targets: Site.Settings.meta_theme_color_element,
			content: "#000000",
			duration: 500,
			easing: "cubicBezier(.42, 0, .58, 1)"
		});
		
		Page.element.querySelector("#spawn-footer").previousElementSibling.remove();
		
		Page.element.querySelector("#hidden").style.display = "block";
		
		Page.element.querySelector("#flame-gradient-container").style.opacity = 1;
		
		setTimeout(() =>
		{
			Page.element.querySelector("#flame-container").style.opacity = 1;
			
			Page.element.querySelector("#flame-cover").style.height = 0;
			Page.element.querySelector("#flame-gradient-space").style.height = 0;
			
			setTimeout(() =>
			{
				Page.Load.AOS.on_resize();
			}, 1000);
		}, 1000);
	});			
}()