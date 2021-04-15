/*
	
	Images: methods for handling inline page images.
		
		insert: loads all images from images.json and inserts the correct one (jpg or webp) into the page.
		
		check_webp_support: tests support for WebP.
	
*/



"use strict";



let Images =
{
	//Whether the browser supports WebP images or not. Given a boolean value when decided.
	webp_support: null,
	
	file_extension: "",
	
	
	
	insert: function()
	{
		return new Promise((resolve, reject) =>
		{
			currently_fetching = true;
			
			
			
			let images = document.querySelectorAll(".check-webp");
			
			let image_type = this.webp_support ? "webp" : "non-webp";
			
			let num_images_fetched = 0;
			
			
			
			fetch(parent_folder + "images.json")
			
			.then(response => response.json())
			
			.then((image_data) =>
			{
				for (let i = 0; i < images.length; i++)
				{
					let src = image_data[images[i].getAttribute("id")][image_type];
					
					if (src.slice(0, 5) === "https")
					{
						images[i].setAttribute("src", src);
					}
					
					else
					{
						images[i].setAttribute("src", parent_folder + src);
					}
					
					
					
					images[i].onload = () =>
					{
						num_images_fetched++;
						
						if (num_images_fetched === images.length)
						{
							console.log("Fetched " + images.length + " images on the page.");
							
							currently_fetching = false;
							
							fetch_item_from_queue();
							
							resolve();
						}
					};
				}
			})
			
			.catch((error) =>
			{
				console.error("Could not load images.json");
			});
		});
	},



	//Uses Modernizr to determine if WebP works or not. Returns a promise for when it's done.
	check_webp_support: function()
	{
		return new Promise((resolve, reject) =>
		{
			load_script("/scripts/modernizr-webp.min.js")
			
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
	}
};