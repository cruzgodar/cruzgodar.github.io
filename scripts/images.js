//Tests support for WebP and replaces all images with it when possible. Otherwise, loads all images as jpg or png.



$(function()
{
	var images = $(".check-webp");
	
	var image_type;
	
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
		$.getJSON("images.json", function(image_data)
		{
			var i;
			
			for (i = 0; i < images.length; i++)
			{
				$(images[i]).attr("src", image_data[$(images[i]).attr("id")][image_type]);
			}
		});
	}
	
	catch(ex) {}
});