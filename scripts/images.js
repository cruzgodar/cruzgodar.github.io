//Tests support for WebP and replaces all images with it when possible. Otherwise, loads all images as jpg or png.



function insert_images()
{
	let images = $(".check-webp");
	
	let image_type = "";
	
	if (supports_webp)
	{
		image_type = "webp";
	}
	
	else
	{
		image_type = "non-webp";
	}
	
	
	
	fetch(parent_folder + "images.json")
	
	.then(response => response.json())
	
	.then(function(image_data)
	{
		let src = "";
		
		for (let i = 0; i < images.length; i++)
		{
			src = image_data[$(images[i]).attr("id")][image_type];
			
			if (src.slice(0, 5) == "https")
			{
				$(images[i]).attr("src", src);
			}
			
			else
			{
				$(images[i]).attr("src", parent_folder + src);
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
				}
				
				else
				{
					supports_webp = false;
				}
				
				resolve();
			});
		})
		
		.catch(function(error)
		{
			console.error("Could not load Modernizr");
			supports_webp = false;
			
			resolve();
		});
	});
}