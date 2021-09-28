!function()
{
	"use strict";
	
	setTimeout(() =>
	{
		let element = document.querySelector("[data-image-id='office-hours']");
		
		element.parentNode.setAttribute("href", "https://uoregon.zoom.us/j/5334229656");
		
		element.setAttribute("onclick", "Page.Navigation.redirect('https://uoregon.zoom.us/j/5334229656', true)");
		
		
		
		element = document.querySelector("[data-image-id='webwork']");
		
		element.parentNode.setAttribute("href", "https://webwork.uoregon.edu/webwork2/Math112-13873/");
		
		element.setAttribute("onclick", "Page.Navigation.redirect('https://webwork.uoregon.edu/webwork2/Math112-13873/', true)");
	}, 1000);
}()