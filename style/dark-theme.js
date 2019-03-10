//Changes the theme and animates elements unless no_animation = 1. Typically called without arguments.
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
	}
	
	
	
	if (storageAvailable("localStorage"))
	{
		localStorage.setItem("theme", current_theme);
	}
}



//Changes the theme, but without any transition duration.
function switch_theme_on_load()
{
	$("body, .heading-text, .date-text, .section-text, .quote-text, .quote-attribution, .title-text, .line-break-dark, .image-link-border").addClass("no-transition");
	switch_theme();
	$("body, .heading-text, .date-text, .section-text, .quote-text, .quote-attribution, .title-text, .line-break-dark, .image-link-border")[0].offsetHeight; //Trigger a reflow, flushing the CSS changes
	$("body, .heading-text, .date-text, .section-text, .quote-text, .quote-attribution, .title-text, .line-break-dark, .image-link-border").removeClass("no-transition");
}



function storageAvailable(type)
{
	try
	{
		var storage = window[type],
			x = "__storage_test__";
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	
	catch(e)
	{
		return e instanceof DOMException && (
			// everything except Firefox
			e.code === 22 ||
			// Firefox
			e.code === 1014 ||
			// test name field too, because code might not be present
			// everything except Firefox
			e.name === "QuotaExceededError" ||
			// Firefox
			e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
			// acknowledge QuotaExceededError only if there's something already stored
			storage.length !== 0;
    }
}



var current_theme = 0;

if (storageAvailable("localStorage"))
{
	current_theme = localStorage.getItem("theme");
	
	if (current_theme == 1)
	{
		current_theme = 0;
		switch_theme_on_load();
	}
	
	else
	{
		current_theme = 0;
		localStorage.setItem("theme", 0);
	}
}