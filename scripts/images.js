//Tests support for WebP and replaces all images with it when possible. Otherwise, loads all images as jpg or png.



function insert_images()
{
	let images = document.querySelectorAll(".check-webp");
	
	
	let image_type = supports_webp ? "webp" : "non-webp";
	
	
	
	fetch(parent_folder + "images.json")
	
	.then(response => response.json())
	
	.then(function(image_data)
	{
		let src = "";
		
		for (let i = 0; i < images.length; i++)
		{
			src = image_data[images[i].getAttribute("id")][image_type];
			
			if (src.slice(0, 5) == "https")
			{
				images[i].setAttribute("src", src);
			}
			
			else
			{
				images[i].setAttribute("src", parent_folder + src);
			}
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