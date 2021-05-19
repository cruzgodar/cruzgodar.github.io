!async function()
{
	"use strict";
	
	document.documentElement.style.backgroundColor = "rgb(0, 0, 0)";
	
	Page.background_color_changed = true;
	
	document.querySelector("#show-footer-menu-button").style.bottom = "-43.75px";
	
	setTimeout(() =>
	{
		document.querySelector("#flame-container").style.opacity = 1;
		
		document.querySelector("#flame-cover").style.height = 0;
		document.querySelector("#flame-gradient-space").style.height = 0;
		
		setTimeout(() =>
		{
			document.querySelector("#flame-gradient").style.opacity = 0;
			
			Page.Load.AOS.on_resize();
		}, 1000);
	}, 1000);
}()