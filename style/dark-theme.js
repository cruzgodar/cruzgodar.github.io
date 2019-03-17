//Changes the theme and animates elements.
function switch_theme()
{
	//Light to dark
	if (current_theme == 0)
	{
		$("body").css("background-color", "rgb(24, 24, 24)");
		
		$(".heading-text").css("color", "rgb(255, 255, 255)");
		$(".date-text").css("color", "rgb(255, 255, 255)");
		$(".section-text").css("color", "rgb(164, 164, 164)");
		
		//index.html
		$(".quote-text").css("color", "rgb(80, 80, 80)");
		$(".quote-attribution").css("color", "rgb(164, 164, 164)");
		$(".title-text").css("color", "rgb(255, 255, 255)");
		
		$(".line-break-dark").css("opacity", "1");
		
		current_theme = 1;
		
		//Make all linked pages have dark theme.
		$("a").each(function()
		{
			$(this).attr("href", $(this).attr("href").replace("?dark=1", "") + "?dark=1");
		});
		
		history.replaceState({}, document.title, window.location.href.replace("?dark=1", "") + "?dark=1");
	}
	
	//Dark to light
	else
	{
		$("body").css("background-color", "rgb(255, 255, 255)");
		
		$(".heading-text").css("color", "rgb(0, 0, 0)");
		$(".date-text").css("color", "rgb(0, 0, 0)");
		$(".section-text").css("color", "rgb(92, 92, 92)");
		
		//index.html
		$(".quote-text").css("color", "rgb(176, 176, 176)");
		$(".quote-attribution").css("color", "rgb(92, 92, 92)");
		$(".title-text").css("color", "rgb(0, 0, 0)");
		
		$(".line-break-dark").css("opacity", "0");
		
		current_theme = 0;
		
		//Make all linked pages have light theme.
		$("a").each(function()
		{
			$(this).attr("href", $(this).attr("href").replace("?dark=1", ""));
		});
		
		//Make state persist on refresh.
		history.replaceState({}, document.title, window.location.href.replace("?dark=1", ""));
	}
}



//Changes the theme, but without any animation.
function switch_theme_on_load()
{
	$("body, .heading-text, .date-text, .section-text, .quote-text, .quote-attribution, .title-text, .line-break-dark, .image-link-border").addClass("no-transition");
	switch_theme();
	$("body, .heading-text, .date-text, .section-text, .quote-text, .quote-attribution, .title-text, .line-break-dark, .image-link-border")[0].offsetHeight; //Trigger a reflow, flushing the CSS changes
	$("body, .heading-text, .date-text, .section-text, .quote-text, .quote-attribution, .title-text, .line-break-dark, .image-link-border").removeClass("no-transition");
}



function get_url_var(id)
{
	var svalue = location.search.match(new RegExp("[\?\&]" + id + "=([^\&]*)(\&?)","i"));
	return svalue ? svalue[1] : svalue;
}




var current_theme = get_url_var("dark");

if (current_theme == 1)
{
	current_theme = 0;
	switch_theme_on_load();
}
	
else
{
	current_theme = 0;
}