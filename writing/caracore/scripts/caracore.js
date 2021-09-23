!async function()
{
	"use strict";
	
	document.documentElement.style.backgroundColor = "rgb(0, 0, 0)";
	
	if (Site.Settings.url_vars["theme"] !== 1)
	{
		Site.Settings.animate_meta_theme_color(255, 0);
	}
	
	else if (Site.Settings.url_vars["theme"] === 0 && Site.Settings.url_vars["dark_theme_color"] === 0)
	{
		Site.Settings.animate_meta_theme_color(24, 0);
	}
	
	Page.background_color_changed = true;
	
	document.querySelector("#hidden").style.display = "block";
	
	document.querySelector("#spawn-footer").previousElementSibling.remove();
	
	
	
	setTimeout(() =>
	{
		document.querySelector("#flame-container").style.opacity = 1;
		
		document.querySelector("#flame-cover").style.height = 0;
		document.querySelector("#flame-gradient-space").style.height = 0;
		
		setTimeout(() =>
		{
			document.querySelector("#flame-gradient").style.opacity = 0;
			
			Page.Load.AOS.on_resize();
			
			setTimeout(() =>
			{
				try {document.querySelector("#show-footer-menu-button-opacity-adjust").remove();}
				catch(ex) {}
			}, 2000);
		}, 1000);
	}, 1000);
}()