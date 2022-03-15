!async function()
{
	"use strict";
	
	Page.element.documentElement.style.backgroundColor = "rgb(0, 0, 0)";
	
	if (Site.Settings.url_vars["theme"] !== 1)
	{
		Site.Settings.animate_meta_theme_color(255, 0);
	}
	
	else if (Site.Settings.url_vars["theme"] === 0 && Site.Settings.url_vars["dark_theme_color"] === 0)
	{
		Site.Settings.animate_meta_theme_color(24, 0);
	}
	
	Page.background_color_changed = true;
	
	Page.element.querySelector("#hidden").style.display = "block";
	
	Page.element.querySelector("#spawn-footer").previousElementSibling.remove();
	
	
	
	setTimeout(() =>
	{
		Page.element.querySelector("#flame-container").style.opacity = 1;
		
		Page.element.querySelector("#flame-cover").style.height = 0;
		Page.element.querySelector("#flame-gradient-space").style.height = 0;
		
		setTimeout(() =>
		{
			Page.element.querySelector("#flame-gradient").style.opacity = 0;
			
			Page.Load.AOS.on_resize();
			
			setTimeout(() =>
			{
				try {Page.element.querySelector("#show-footer-menu-button-opacity-adjust").remove();}
				catch(ex) {}
			}, 2000);
		}, 1000);
	}, 1000);
	
	
	
	Page.show();
}()