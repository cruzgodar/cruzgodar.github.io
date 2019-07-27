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
	
	try
	{
		$.getJSON(parent_folder + "images.json", function(image_data)
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
		});
	}
	
	catch(ex) {}
}