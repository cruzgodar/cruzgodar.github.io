!function()
{
	"use strict";
	
	setTimeout(() =>
	{
		let element = $("[data-image-id='webwork']");
		
		element.parentNode.setAttribute("href", "https://webwork.uoregon.edu/webwork2/Math252-23113/");
		
		element.parentNode.setAttribute("onclick", "Page.Navigation.redirect('https://webwork.uoregon.edu/webwork2/Math252-23113/', true)");
	}, 100);
	
	
	
	Page.show();
}()