//Included on every page. Sets up variables and runs browsers.js, footer.js, navigation.js, and settings.js.


var window_width, window_height;

var page_settings = {};

var page_settings_done = false;

var current_url = "/";
var parent_folder = "/";

//Whether the browser supports WebP images or not. Given a boolean value when decided.
var supports_webp = null;

//Whether Disqus has been loaded for the first time or not. We need to use a different function if it's not the first time.
var loaded_disqus = false;



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
			<style class="permanent-style">
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
});



//Waits for everything to load, then redirects to the chosen page. Any page that calls this should never be able to be accessed again without unloading the page.
function entry_point(url)
{
	var refresh_id = setInterval(function()
	{
		if (supports_webp != null && typeof redirect != "undefined" && typeof fade_in != "undefined" && typeof update_aos != "undefined" && typeof bind_handlers != "undefined" && typeof insert_footer != "undefined" && typeof insert_images != "undefined" && typeof apply_settings != "undefined" && typeof gimp_edge != "undefined" && typeof set_links != "undefined" && typeof remove_hover_on_touch != "undefined" && typeof load_disqus != "undefined")
		{
			clearInterval(refresh_id);
			
			redirect(url, false, false, true);
		}
	}, 50);
}



function update_aos()
{
	AOS.disable;
	
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
		
		AOS.refreshHard();
	}
}



function on_page_load()
{
	var refresh_id = setInterval(function()
	{
		if (page_settings_done)
		{
			clearInterval(refresh_id);
			
			page_settings_done = false;
			
			
			
			//Start at the top of the page to prevent banner glitches.
			window.scrollTo(0, 0);
			
			//Set the page title.
			$("title").html(page_settings["title"]);
			
			$("html, body").removeClass("no-scroll");
			
			
			
			//Add paragraph indent if necessary.
			if (page_settings["writing_page"])
			{
				$(".body-text").css("text-indent", "10pt");
			}
			
			
			
			fade_in();
			
			update_aos();
			
			bind_handlers();
			
			insert_footer();
			
			insert_images();
			
			apply_settings();
			
			gimp_edge();
			
			set_links();
			
			remove_hover_on_touch();
			
			
			
			if (url_vars["comments"] != 1 && page_settings["comments"])
			{
				load_disqus();
			}
		}
	}, 50);
}



function on_page_unload()
{
	//Remove any css and js that's no longer needed to prevent memory leaks.
	$("style:not(.permanent-style)").remove();
	$("head script:not(.permanent-script)").remove();
	
	
	
	//Unbind everything transient from the window (that was bound with jQuery. This is the reason it's currently impossible to remove AOS's handlers).
	$(window).off(".temp-handler");
}



function fade_in()
{
	if (url_vars["content_animation"] == 1)
	{
		$("html").animate({opacity: 1});
		
		if (page_settings["banner_page"])
		{
			load_banner();
		}
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
}



function bind_handlers()
{
	//Ensure elements always animate 1/4 of the way up the screen, whatever size that screen is.
	$(window).resize(function()
	{
		window_width = $(window).width();
		window_height = $(window).height();
		
		update_aos();
	});
}