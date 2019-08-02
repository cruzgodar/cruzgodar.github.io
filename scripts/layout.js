let old_layout = "";



window.addEventListener("resize", function()
{
	window_width = window.innerWidth;
	window_height = window.innerHeight;
	
	
	old_layout = layout_string;
	
	if (window_width / window_height < 10/16 || window_width <= 800)
	{
		layout_string = "small-screen";
	}
	
	else
	{
		layout_string = "compact";
	}
	
	
	
	if (layout_string != old_layout && url_vars["content_layout"] != 1)
	{
		try {document.querySelector("#content-layout-button-text").textContent = `Content layout: automatic (currently ${layout_string})`;}
		catch(ex) {}
	}
	
	
	
	update_aos();
});