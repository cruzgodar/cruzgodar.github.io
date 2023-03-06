"use strict";



Page.Images =
{
	//Whether the browser supports WebP images or not. Given a boolean value when decided.
	webp_support: true,
	
	file_extension: "webp",
	
	
	
	add_extensions: function()
	{
		Page.element.querySelectorAll(".check-webp").forEach(image => image.setAttribute("data-src", image.getAttribute("data-src") + this.file_extension));
	}
};