//Tests support for WebP and replaces all images with it when possible. Otherwise, loads all images as jpg or png.



$(function()
{
	$.getScript("/scripts/modernizr-webp.js", function()
	{
		var images = $(".check-webp");
		
		var image_type = "non-webp";
		
		Modernizr.on("webp", function(result)
		{
			if (result)
			{
				image_type = "webp";
				supports_webp = true;
			}
			
			else
			{
				image_type = "non-webp";
				supports_webp = false;
			}
		});
		
		$.getJSON("images.json", function(image_data)
		{
			var i;
			
			for (i = 0; i < images.length; i++)
			{
				$(images[i]).attr("src", image_data[$(images[i]).attr("id")][image_type]);
			}
		});
	});
});