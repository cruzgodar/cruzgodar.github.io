let new_page_data = null;



//Fade in the opacity when the user presses the back button.
window.addEventListener("popstate", function(e)
{
	let previous_page = get_url_var("page");
		
	if (previous_page != null)
	{
		redirect(decodeURIComponent(previous_page), false, false, true);
	}
	
	else
	{
		redirect("/home.html", false, false, true);
	}
});



//To keep expected link functionality (open in new tab, draggable, etc.), all elements with calls to redirect() are wrapped in <a> tags. Presses of <a> tags (without .real-link) are ignored, but to extend the functionality of url variables to the times they are used, we need to target them all and add the url variables onto them. Also, now that the website is a single page app, we need to format them correctly, too, using the page variable.

function set_links()
{
	let links = document.querySelectorAll("a");
	
	for (let i = 0; i < links.length; i++)
	{
		let href = links[i].getAttribute("href");
		
		if (href.slice(0, 5) != "https" && href.slice(0, 4) != "data" && !(links[i].parentNode.classList.contains("footer-image-link")))
		{
			let include_return_url = false;
			
			if (href == "/settings.html")
			{
				include_return_url = true;
			}
			
			
			
			let vars = concat_url_vars(include_return_url);
			
			if (vars.indexOf("&") == -1)
			{
				vars = "";
			}
			
			else
			{
				vars = vars.substring(vars.indexOf("&"));
			}
			
			
			
			links[i].setAttribute("href", "/index.html?page=" + encodeURIComponent(href) + vars);
		}
	}
}



//Handles virtually all links.
function redirect(url, in_new_tab, from_nonstandard_color, no_state_push)
{
	new_page_data = null;
	
	let background_color = document.documentElement.style.backgroundColor;
	
	//Start getting the new page data immediately. If it succeeds, we won't have to fetch it again. If it fails, though, abort the mission.
	fetch(url)
	
	.then(response => response.text())
	
	.then(function(data)
	{
		new_page_data = data;
	})
	
	.catch(function(error)
	{
		console.log("Failed to load new page — reversing fade-out.");
		
		setTimeout(function()
		{
			document.documentElement.style.opacity = 1;
			document.documentElement.style.backgroundColor = background_color;
		}, 300);
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
	
	
	
	let include_return_url = false;
	
	if (url == "/settings.html")
	{
		include_return_url = true;
	}
	
	
	
	current_url = url;
	
	parent_folder = url.slice(0, url.lastIndexOf("/") + 1);
	
	
	
	document.documentElement.classList.remove("color-transition");
	
	
		
		
		
	//Act like a normal link, with no transitions, if the user wants that.
	if (url_vars["content_animation"] == 1)
	{
		load_html(url, include_return_url, no_state_push);
	}
		
	else
	{
		//Fade out the current page's content.
		document.documentElement.style.opacity = 0;
		
		//If necessary, take the time to fade back to the default background color, whatever that is.
		if (from_nonstandard_color)
		{
			setTimeout(function()
			{
				document.documentElement.classList.add("background-transition");
				document.body.classList.add("background-transition");
				
				if (url_vars["theme"] == 1)
				{
					if (url_vars["dark_theme_color"] == 1)
					{
						document.documentElement.style.backgroundColor = "rgb(0, 0, 0)";
						document.body.style.backgroundColor = "rgb(0, 0, 0)";
					}
					
					else
					{
						document.documentElement.style.backgroundColor = "rgb(24, 24, 24)";
						document.body.style.backgroundColor = "rgb(24, 24, 24)";
					}
				}
				
				else
				{
					document.documentElement.style.backgroundColor = "rgb(255, 255, 255)";
					document.body.style.backgroundColor = "rgb(255, 255, 255)";
				}
				
				setTimeout(function()
				{
					document.body.style.backgroundColor = "";
					
					document.documentElement.classList.remove("background-transition");
					document.body.classList.remove("background-transition");
					
					load_html(url, include_return_url, no_state_push);
				}, 450);
			}, 300);
		}
		
		//Finally, redirect to the new page and fade the content back in.
		else
		{
			setTimeout(function()
			{
				load_html(url, include_return_url, no_state_push);
			}, 300);
		}
	}
}



//Actually performs the swapping out of html data.
function load_html(url, include_return_url, no_state_push)
{
	//We got the data in time! Now we don't need to fetch it again.
	if (new_page_data != null)
	{
		on_page_unload();
		
		//Record the page change in the url bar and in the browser history.
		if (no_state_push == false)
		{
			history.pushState({}, document.title, "/index.html" + concat_url_vars(include_return_url));
		}
		
		else
		{
			history.pushState({}, document.title, "/index.html" + concat_url_vars(include_return_url));
		}
		
		document.body.innerHTML = new_page_data;
		parse_scripts();
	}
	
	//We didn't get it. We may never be able to, but we have to try again in case it's just that the connection is just really slow.
	else
	{
		fetch(url)
		
		.then(response => response.text())
		
		.then(function(data)
		{
			on_page_unload();
			
			//Record the page change in the url bar and in the browser history.
			if (no_state_push == false)
			{
				history.pushState({}, document.title, "/index.html" + concat_url_vars(include_return_url));
			}
			
			else
			{
				history.pushState({}, document.title, "/index.html" + concat_url_vars(include_return_url));
			}
			
			document.body.innerHTML = data;
			parse_scripts();
		});
		
		//There's no need to have a .catch here -- if the fetch fails, the first fetch will reverse the fading out.
	}
}



//Right, so this is a pain. One of those things jQuery makes really easy and that you might never notice otherwise is that when using $(element).html(data), any non-external script tags in data are automatically excuted. This is great, but it doesn't happen when using element.innerHTML. Weirdly enough, though, it works with element.appendChild. Therefore, we just need to get all our script tags, and for each one, make a new tag with identical contents, append it to the body, and delete the original script.
function parse_scripts()
{
	var scripts = document.querySelectorAll("script");
	
	for (let i = 0; i < scripts.length; i++)
	{
		let new_script = document.createElement("script");
		
		new_script.innerHTML = scripts[i].textContent;
		
		document.body.appendChild(new_script);
		
		scripts[i].remove();
	}
}



//Returns a string of url vars that can be attached to any url.
function concat_url_vars(include_return_url)
{
	let string = "?page=" + encodeURIComponent(current_url);
	let key = "";
	let temp = "";
	
	
	
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