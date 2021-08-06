!function()
{
	"use strict";
	
	
	
	document.querySelector("#guide-button").addEventListener("click", () =>
	{
		Page.Navigation.redirect("guide/guide.html");
	});
	
	document.querySelector("#docs-button").addEventListener("click", () =>
	{
		Page.Navigation.redirect("docs/docs.html");
	});
	
	
	
	window.addEventListener("resize", on_resize);
	Page.temporary_handlers["resize"].push(on_resize);
	
	
	
	function on_resize()
	{
		if (Page.Layout.layout_string !== "compact")
		{
			let distance_1 = document.querySelector("#guide-button").offsetTop;
			let distance_2 = document.querySelector("#docs-button").offsetTop;
			
			if (distance_1 - distance_2 > 0)
			{
				document.querySelector("#docs-button").style.marginTop = (distance_1 - distance_2) + "px";
			}
		}
		
		else
		{
			document.querySelector("#docs-button").style.marginTop = "";
		}
	}
}()