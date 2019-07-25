var new_page_data = null;
var get_failed = false;

var redirect_refresh_id;



//To keep expected link functionality (open in new tab, draggable, etc.), all elements with calls to redirect() are wrapped in <a> tags. Presses of <a> tags (without .real-link) are ignored, but to extend the functionality of url variables to the times they are used, we need to target them all and add the url variables onto them. Also, now that the website is a single page app, we need to format them correctly, too, using the page variable.

function set_links()
{
	var href;
	var include_return_url;
	
	$("a").each(function(index)
	{
		href = $(this).attr("href");
		
		if (href.slice(0, 5) != "https" && href.slice(0, 4) != "data")
		{
			if (href == "/settings.html")
			{
				include_return_url = true;
			}
			
			else
			{
				include_return_url = false;
			}
			
			
			
			var vars = concat_url_vars(include_return_url);
			
			if (vars.indexOf("&") == -1)
			{
				vars = "";
			}
			
			else
			{
				vars = vars.substring(vars.indexOf("&"));
			}
			
			
			
			$(this).attr("href", "/index.html?page=" + encodeURIComponent(href) + vars);
		}
	});
}



$(function()
{
	//Fade in the opacity when the user presses the back button.
	$(window).on("popstate", function(e)
	{
		var previous_page = get_url_var("page");
		
		if (previous_page != null)
		{
			redirect(decodeURIComponent(previous_page), false, false, true);
		}
		
		else
		{
			redirect("/home.html", false, false, true);
		}
	});
});



//Handles virtually all links.
function redirect(url, in_new_tab, from_nonstandard_color, no_state_push)
{
	new_page_data = null;
	get_failed = false;
	
	//Start getting the new page data immediately. If that fails, though, abort the mission.
	$.get(url, function(data)
	{
		new_page_data = data;
	})
	
	.fail(function()
	{
		clearInterval(redirect_refresh_id);
		get_failed = true;
		
		$("html").animate({opacity: 1}, 300, "swing");
	});
	
	
	
	//Indicates whether we need to pause to change the background color. Example: the bottom of the Corona page.
	from_nonstandard_color = (typeof from_nonstandard_color != "undefined") ? from_nonstandard_color : false;
	
	in_new_tab = (typeof in_new_tab != "undefined") ? in_new_tab : false;
	
	no_state_push = (typeof no_state_push != "undefined") ? no_state_push : false;
	
	
	
	//If we're going somewhere outside of the site, open it in a new tab and don't screw with the opacity.
	if (in_new_tab)
	{
		window.open(url, "_blank");
		return;
	}
	
	
	
	var include_return_url = false;
	
	if (url == "/settings.html")
	{
		include_return_url = true;
	}
	
	
	
	current_url = url;
	
	parent_folder = url.slice(0, url.lastIndexOf("/") + 1);
		
		
		
	//Act like a normal link, with no transitions, if the user wants that.
	if (url_vars["content_animation"] == 1)
	{
		try_to_load_html(include_return_url, no_state_push);
	}
		
	else
	{
		//Fade out the current page's content.
		$("html").animate({opacity: 0}, 300, "swing");
		
		//If necessary, take the time to fade back to the default background color, whatever that is.
		if (from_nonstandard_color)
		{
			setTimeout(function()
			{
				$("html, body").addClass("background-transition");
				
				if (url_vars["theme"] == 1)
				{
					$("html, body").css("background-color", "rgb(24, 24, 24)");
				}
				
				else
				{
					$("html, body").css("background-color", "rgb(255, 255, 255)");
				}
				
				setTimeout(function()
				{
					$("body").css("background-color", "");
					$("html, body").removeClass("background-transition");
					
					try_to_load_html(include_return_url, no_state_push);
				}, 450);
			}, 300);
		}
		
		//Finally, redirect to the new page and fade the content back in.
		else
		{
			setTimeout(function()
			{
				try_to_load_html(include_return_url, no_state_push);
			}, 300);
		}
	}
}



function try_to_load_html(include_return_url, no_state_push)
{
	if (get_failed == false)
	{
		redirect_refresh_id = setInterval(function()
		{
			if (new_page_data != null)
			{
				clearInterval(redirect_refresh_id);
				
				load_html(new_page_data, include_return_url, no_state_push);
			}
		}, 50);
	}
}



//Actually performs the swapping out of html data.
function load_html(data, include_return_url, no_state_push)
{
	on_page_unload();
	
	//Record the page change in the url bar and in the browser history.
	if (no_state_push == false)
	{
		history.pushState({}, document.title, "/index.html" + concat_url_vars(include_return_url));
	}
	
	$("body").html(data);
	
	on_page_load();
}



//Returns a string of url vars that can be attached to any url.
function concat_url_vars(include_return_url)
{
	var string = "?page=" + encodeURIComponent(current_url);
	var key;
	var temp = "";
	
	
	
	for (var i = 0; i < Object.keys(url_vars).length; i++)
	{
		key = Object.keys(url_vars)[i];
		
		if (url_vars[key] == 1 || (window.matchMedia("(prefers-color-scheme: dark)").matches && url_vars["theme"] == 0 && key == "theme"))
		{
			string += "&" + key + "=" + url_vars[key];
		}
	}
	
	
	
	//If we're going to the settings page, we need to know where we came from so we can return there later. Just don't include any current url variables.
	if (include_return_url)
	{
		string += "&return=" + get_url_var("page");
	}
	
	
	
	return string;
}

function write_url_vars()
{
	//Make state persist on refresh, unless it's the settings page, which will just clog up the history.
	if (!(window.location.href.includes("settings")))
	{
		history.replaceState({}, document.title, window.location.href.split("?", 1) + concat_url_vars(false));
	}
}