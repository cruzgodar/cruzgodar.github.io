!function()
{
	"use strict";
	
	setTimeout(() =>
	{
		let element = Page.element.querySelector("[data-image-id='office-hours']");
		
		element.parentNode.setAttribute("href", "https://uoregon.zoom.us/j/5334229656");
		
		element.parentNode.setAttribute("onclick", "Page.Navigation.redirect('https://uoregon.zoom.us/j/5334229656', true)");
		
		
		
		element = Page.element.querySelector("[data-image-id='webwork']");
		
		element.parentNode.setAttribute("href", "https://webwork.uoregon.edu/webwork2/Math252-24030/");
		
		element.parentNode.setAttribute("onclick", "Page.Navigation.redirect('https://webwork.uoregon.edu/webwork2/Math252-24030/', true)");
	}, 100);
}()