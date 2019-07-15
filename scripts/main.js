//Included on every page. Sets up variables and runs browsers.js, footer.js, navigation.js, and settings.js.


var window_width, window_height;

var page_settings = 
{
	"banner_page": false,
	
	"manual_banner": false,
	"manual_dark_theme": false,
	
	"no_footer": false,
	"footer_exclusion": "",
	"footer_from_nonstandard_color": false
};

var page_settings_done = false;

var parent_folder = "/";

//Whether the browser supports WebP images or not. Given a boolean value when decided.
var supports_webp = null;



$(function()
{
	window_width = $(window).width();
	window_height = $(window).height();
	
	
	
	//Disable the default behavior of <a> tags -- that's only there for accessibility.
	$("body").on("click", "a:not(.real-link)", function(e)
	{
		e.preventDefault();
	});
	
	
	
	//When in PWA form, disable text selection, drag-and-drop, and the PWA button itself.
	if (window.matchMedia("(display-mode: standalone)").matches)
	{
		$("html").css("-webkit-user-select", "none");
		$("html").css("user-select", "none");
		$("html").css("-webkit-touch-callout", "none");
		$("*").attr("draggable", "false");
		
		$("head").append(`
			<style>
				#pwa-button
				{
					display: none;
					width: 0px;
					height: 0px;
				}
			</style>
		`);
		
		//Also add a little extra spacing at the top of each page to keep content from feeling too close to the top of the screen.
		try
		{
			$(".logo").css("margin-top", "2vh");
		}
		
		catch(ex) {}
		
		
		
		try
		{	
			$(".name-text").parent().css("margin-top", "2vh");
		}
		
		catch(ex) {}
		
		
		
		try
		{	
			$(".empty-top").css("margin-top", "2vh");
		}
		
		catch(ex) {}
	}
	
	
	
	//Ensure elements always animate 1/4 of the way up the screen, whatever size that screen is.
	$(window).resize(function()
	{
		window_width = $(window).width();
		window_height = $(window).height();
		
		if (url_vars["content_animation"] != 1)
		{
			AOS.init({offset: window_height/4});
		}
	});
	
	
	
	$.getScript("/scripts/modernizr-webp.js", function()
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
		});
	});
	
	
	
	var refresh_id = setInterval(function()
	{
		if (supports_webp != null && typeof insert_footer != "undefined" && typeof insert_images != "undefined" && typeof detect_offline != "undefined" && typeof gimp_edge != "undefined" && typeof set_links != "undefined" && typeof remove_hover_on_touch != "undefined")
		{
			clearInterval(refresh_id);
			
			redirect("/home.html");
		}
	}, 50);
});



function on_page_load()
{
	var refresh_id = setInterval(function()
	{
		if (page_settings_done)
		{
			clearInterval(refresh_id);
			
			page_settings_done = false;
			
			
	
			if (url_vars["content_animation"] == 1)
			{
				$("html").animate({opacity: 1});
			}
			
			else
			{
				if (page_settings["banner_page"])
				{
					load_banner();
				}
				
				else
				{
					$("html").animate({opacity: 1});
				}
			}
			
			
			
			//Start at the top of the page to prevent banner glitches.
			window.scrollTo(0, 0);
			
			
			
			if (url_vars["content_animation"] == 1)
			{
				//This attribute makes the content invisible until it's animated in, so if we're never going to do that, it has to go.
				$("body").find("*[data-aos]").removeAttr("data-aos");
			}
			
			else
			{
				if (page_settings["banner_page"])
				{
					AOS.init({duration: 1200, once: false, offset: window_height/4});
				}
				
				else
				{
					AOS.init({duration: 1200, once: true, offset: window_height/4});
				}
			}
			
			
			
			insert_footer();
			
			insert_images();
			
			detect_offline();
			
			gimp_edge();
			
			set_links();
			
			remove_hover_on_touch();
		}
	}, 50);
}