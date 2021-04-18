!function()
{
	"use strict";
	
	
	
	setTimeout(() =>
	{
		Page.Load.AOS.on_resize();
	}, 50);
	
	
	
	document.querySelector("#toggle-minor-versions-checkbox").addEventListener("click", function()
	{
		if (document.querySelector("#toggle-minor-versions-checkbox").checked)
		{
			Site.set_element_styles(".minor-version, .medium-version, .major-version", "opacity", 0);
			
			setTimeout(function()
			{
				Site.set_element_styles(".minor-version", "display", "block");
				
				setTimeout(function()
				{
					Site.set_element_styles(".minor-version, .medium-version, .major-version", "opacity", 1);
					
					Page.Load.AOS.on_resize();
				}, 50);
			}, 300);
		}
		
		else
		{
			Site.set_element_styles(".minor-version, .medium-version, .major-version", "opacity", 0);
			
			setTimeout(function()
			{
				Site.set_element_styles(".medium-version, .major-version", "opacity", 1);
				Site.set_element_styles(".minor-version", "display", "none");
				
				setTimeout(() =>
				{
					Page.Load.AOS.on_resize();
				}, 50);
			}, 300);
		}
	});
}()