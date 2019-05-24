//Handles the settings that must be applied before page load to avoid jarring effects.



function get_url_var(id)
{
	var svalue = location.search.match(new RegExp("[\?\&]" + id + "=([^\&]*)(\&?)","i"));
	return svalue ? svalue[1] : svalue;
}

var url_vars = {"theme": get_url_var("theme"), "font": get_url_var("font"), "text_contrast": get_url_var("text_contrast"), "no_new_section": get_url_var("no_new_section"), "link_animation": get_url_var("link_animation"), "content_animation": get_url_var("content_animation"), "banner_style": get_url_var("banner_style")};



if (url_vars["theme"] == 0)
{
	document.documentElement.style.backgroundColor = "rgb(255, 255, 255)";
}

else if (url_vars["theme"] == 1)
{
	document.documentElement.style.backgroundColor = "rgb(24, 24, 24)";
}



if (url_vars["font"] == 1)
{
	document.documentElement.style.fontFamily = "'Gentium Book Basic', serif";
	document.documentElement.style.fontSize = "max(calc((13.2 / 12) * (1.5vmin + 1.5vmax) / 2), 13.2px)";
}