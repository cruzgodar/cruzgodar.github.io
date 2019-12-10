"use strict";



//Tests support for WebP and replaces all images with it when possible. Otherwise, loads all images as jpg or png.



function insert_images()
{
	currently_fetching = true;
	
	
	
	let images = document.querySelectorAll(".check-webp");
	
	let image_type = supports_webp ? "webp" : "non-webp";
	
	let num_images_fetched = 0;
	
	
	
	fetch(parent_folder + "images.json")
	
	.then(response => response.json())
	
	.then(function(image_data)
	{
		for (let i = 0; i < images.length; i++)
		{
			let src = image_data[images[i].getAttribute("id")][image_type];
			
			if (src.slice(0, 5) == "https")
			{
				images[i].setAttribute("src", src);
			}
			
			else
			{
				images[i].setAttribute("src", parent_folder + src);
			}
			
			
			
			images[i].onload = function()
			{
				num_images_fetched++;
				
				console.log(num_images_fetched + " of " + images.length + " fetched.");
				
				if (num_images_fetched == images.length)
				{
					currently_fetching = false;
					
					fetch_item_from_queue();
				}
			};
		}
	})
	
	.catch(function(error)
	{
		console.error("Could not load images.json");
	});
}



//Uses Modernizr to determine if WebP works or not. Returns a promise for when it's done.
function check_webp()
{
	return new Promise(function(resolve, reject)
	{
		load_script("/scripts/modernizr-webp.min.js")
		
		.then(function()
		{
			Modernizr.on("webp", function(result)
			{
				if (result)
				{
					supports_webp = true;
					banner_extension = "webp";
				}
				
				else
				{
					supports_webp = false;
					banner_extension = "jpg";
				}
				
				resolve();
			});
		})
		
		.catch(function(error)
		{
			console.error("Could not load Modernizr");
			
			supports_webp = false;
			banner_extension = "jpg";
			
			resolve();
		});
	});
}