"use strict";



Page.Images =
{
	//Whether the browser supports WebP images or not. Given a boolean value when decided.
	webpSupport: true,
	
	fileExtension: "webp",
	
	
	
	addExtensions: function()
	{
		Page.element.querySelectorAll(".check-webp").forEach(image => image.setAttribute("data-src", image.getAttribute("data-src") + this.fileExtension));
	}
};