!function()
{
	"use strict";
	
	
	
	let version_elements = Page.element.querySelectorAll(".minor-version, .medium-version, .major-version");
	
	
	
	Page.element.querySelector("#toggle-minor-versions-checkbox").addEventListener("click", () =>
	{
		if (Page.element.querySelector("#toggle-minor-versions-checkbox").checked)
		{
			version_elements.forEach(element => Page.Animate.change_opacity(element, 0, Site.opacity_animation_time));
			
			setTimeout(() =>
			{
				Page.set_element_styles(".minor-version", "display", "block");
				Page.set_element_styles(".minor-version", "position", "relative");
				Page.set_element_styles(".minor-version", "top", "0");
				
				setTimeout(() =>
				{
					version_elements.forEach(element => Page.Animate.change_opacity(element, 1, Site.opacity_animation_time));
					
					Page.Load.AOS.on_resize();
					Page.Load.AOS.on_scroll();
				}, 50);
			}, Site.opacity_animation_time);
		}
		
		else
		{
			version_elements.forEach(element => Page.Animate.change_opacity(element, 0, Site.opacity_animation_time));
			
			setTimeout(() =>
			{
				version_elements.forEach(element => Page.Animate.change_opacity(element, 1, Site.opacity_animation_time));
				
				Page.set_element_styles(".minor-version", "display", "none");
				
				setTimeout(() =>
				{
					Page.Load.AOS.on_resize();
					Page.Load.AOS.on_scroll();
				}, 50);
			}, Site.opacity_animation_time);
		}
	});
	
	
	
	Page.show();
	
	
	
	setTimeout(() =>
	{
		Page.Load.AOS.on_resize();
	}, 500);
}()