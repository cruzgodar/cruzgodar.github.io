!function()
{
	"use strict";
	
	
	
	setTimeout(() =>
	{
		Page.Load.AOS.on_resize();
	}, 50);
	
	
	
	Page.element.querySelector("#toggle-minor-versions-checkbox").addEventListener("click", function()
	{
		if (Page.element.querySelector("#toggle-minor-versions-checkbox").checked)
		{
			Page.set_element_styles(".minor-version, .medium-version, .major-version", "opacity", 0);
			
			setTimeout(() =>
			{
				Page.set_element_styles(".minor-version", "display", "block");
				
				setTimeout(() =>
				{
					Page.set_element_styles(".minor-version, .medium-version, .major-version", "opacity", 1);
					
					Page.Load.AOS.on_resize();
				}, 50);
			}, Site.opacity_animation_time);
		}
		
		else
		{
			Page.set_element_styles(".minor-version, .medium-version, .major-version", "opacity", 0);
			
			setTimeout(() =>
			{
				Page.set_element_styles(".medium-version, .major-version", "opacity", 1);
				Page.set_element_styles(".minor-version", "display", "none");
				
				setTimeout(() =>
				{
					Page.Load.AOS.on_resize();
				}, 50);
			}, Site.opacity_animation_time);
		}
	});
}()