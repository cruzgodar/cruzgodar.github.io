//Handles redirects and url variables. This script cannot be loaded in main.js, since that is async, and if the user is offline, they need access to cached scripts, which can only be accessed directly. We can't put this in the head, since then we lose access to redirect(), and by extension url variables.



if (!(window.location.href.includes("offline")))
{
	setInterval(function()
	{
		if (window.navigator.onLine == false)
		{
			try
			{
				for (key in url_vars)
				{
					if (key != "theme")
					{
						url_vars[key] = 0;
					}
				}
				
				redirect("/offline.html");
			}
			
			catch(ex)
			{
				window.location.href = "/offline.html";
			}
		}
	}, 500);
}



//To keep expected functionality (open in new tab, draggable links, etc.), all elements with calls to redirect() are wrapped in <a> tags. Presses of <a> tags (without .real-link) are ignored, but to extend the functionality of url variables to the times they are used, we need to target them all and add the url variables onto them.
$(function()
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
			
			$(this).attr("href", href + concat_url_vars(include_return_url));
		}
	});
});



//Handles virtually all links.
function redirect(url, in_new_tab, from_nonstandard_color)
{
	//Indicates whether we need to pause to change the background color. Example: the bottom of the Corona page.
	from_nonstandard_color = (typeof from_nonstandard_color != "undefined") ? from_nonstandard_color : false;
	
	in_new_tab = (typeof in_new_tab != "undefined") ? in_new_tab : false;
	
	
	
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
	
	
	
	//Act like a normal link, with no transitions, if the user wants that.
	if (url_vars["content_animation"] == 1)
	{
		window.location.href = url + concat_url_vars(include_return_url);
	}
	
	else
	{
		//Fade out the current page's content
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
					window.location.href = url + concat_url_vars(include_return_url);
				}, 450);
			}, 300);
		}
		
		//Finally, redirect to the new page.
		else
		{
			setTimeout(function()
			{
				window.location.href = url + concat_url_vars(include_return_url);
			}, 300);
		}
	}
}



//Returns a string of url vars that can be attached to any url.
function concat_url_vars(include_return_url)
{
	var first_var_written = false;
	var string = "";
	var key;
	var temp = "";
	
	for (var i = 0; i < Object.keys(url_vars).length; i++)
	{
		key = Object.keys(url_vars)[i];
		
		if (url_vars[key] == 1 || (window.matchMedia("(prefers-color-scheme: dark)").matches && url_vars["theme"] == 0 && key == "theme"))
		{
			if (first_var_written == false)
			{
				string += "?" + key + "=" + url_vars[key];
				first_var_written = true;
			}
			
			else
			{
				string += "&" + key + "=" + url_vars[key];
			}
		}
	}
	
	
	
	//If we're going to the settings page, we need to know where we came from so we can return there later. Just don't include any current url variables.
	if (include_return_url)
	{
		if (first_var_written == false)
		{
			string += "?return=" + encodeURIComponent(window.location.href.split("?", 1));
			first_var_written = true;
		}
		
		else
		{
			string += "&return=" + encodeURIComponent(window.location.href.split("?", 1));
		}
	}
	
	
	
	return string;
}

function write_url_vars()
{
	//Make state persist on refresh, unless it's the settings page, which will just clog up the history.
	if (!(window.location.href.includes("settings")))
	{
		history.replaceState({}, document.title, window.location.href.split("?", 1) + concat_url_vars(0));
	}
}