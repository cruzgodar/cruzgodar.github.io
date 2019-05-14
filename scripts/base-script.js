//Included on every page. Sets up variables and runs browsers.js, footer.js, navigation.js, and settings.js.



var w = window,
d = document,
e = d.documentElement,
g = d.getElementsByTagName("body")[0],
y = w.innerHeight|| e.clientHeight|| g.clientHeight;

//Used by dark-theme.js to only affect links once the footer is there.
var footer_loaded = 0;

//Used by weird pages like Corona if they want to work dark theme out on their own.
var manual_dark_theme = 0;

var url_vars = {};



$(function()
{	
	//Start at the top of the page to prevent banner glitches. I don't understand why, but this is the only working method I've found to reset scroll on load.
	$([document.documentElement, document.body]).animate({scrollTop: 0});
	
	
	
	AOS.init({duration: 1200, once: true, offset: y/4});
	
	
	
	//Fade in the opacity when the user presses the back button.
	window.addEventListener("pageshow", function(event)
	{
		var historyTraversal = event.persisted || 
			(typeof window.performance != "undefined" && 
			window.performance.navigation.type === 2);
		
		if (historyTraversal)
		{
			if (url_vars["link_animation"] == 1)
			{
				$("html").css("opacity", 1);
			}
			
			else
			{
				setTimeout(function()
				{
					$("html").animate({opacity: 1}, 300, "swing");
				}, 300);
			}
		}
	});
	
	
	
	//Ensure elements always animate 1/4 of the way up the screen, whatever size that screen is.
	$(window).resize(function()
	{
		w = window,
		d = document,
		e = d.documentElement,
		g = d.getElementsByTagName("body")[0],
		y = w.innerHeight|| e.clientHeight|| g.clientHeight;
		
		AOS.init({offset: y/4});
	});
	
	
	
	$.getScript("/scripts/browsers.js");
	
	$.getScript("/scripts/footer.js");
	
	$.getScript("/scripts/navigation.js", function()
	{
		url_vars = {"theme": get_url_var("theme"), "font": get_url_var("font"), "text_contrast": get_url_var("text_contrast"), "icon_style": get_url_var("icon_style"), "no_new_section": get_url_var("no_new_section"), "link_animation": get_url_var("link_animation"), "content_animation": get_url_var("content_animation"), "banner_style": get_url_var("banner_style")};
		
		$.getScript("/scripts/settings.js");
	});
});