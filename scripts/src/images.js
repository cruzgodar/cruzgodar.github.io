"use strict";



Page.Images =
{
	//Whether the browser supports WebP images or not. Given a boolean value when decided.
	webp_support: null,
	
	file_extension: "",



	//Uses Modernizr to determine if WebP works or not. Returns a promise for when it's done.
	check_webp_support: function()
	{
		return new Promise((resolve, reject) =>
		{
			Site.load_script("/scripts/modernizr-webp.min.js")
			
			.then(() =>
			{
				Modernizr.on("webp", (result) =>
				{
					if (result)
					{
						this.webp_support = true;
						this.file_extension = "webp";
					}
					
					else
					{
						this.webp_support = false;
						this.file_extension = "jpg";
					}
					
					resolve();
				});
			})
			
			.catch((error) =>
			{
				console.error("Could not load Modernizr");
				
				this.webp_support = false;
				this.file_extension = "jpg";
				
				resolve();
			});
		});
	},
	
	
	
	add_extensions: function()
	{
		Page.element.querySelectorAll(".check-webp").forEach(image => image.setAttribute("data-src", image.getAttribute("data-src") + this.file_extension));
	}
};