let new_page_data = null;



let last_page_scroll = 0;



//Fade in the opacity when the user presses the back button.
window.addEventListener("popstate", function(e)
{
	let previous_page = get_url_var("page");
		
	if (previous_page != null && decodeURIComponent(previous_page) != current_url)
	{
		redirect(decodeURIComponent(previous_page), false, true, true);
	}
	
	else
	{
		redirect("/home.html", false, true);
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
function redirect(url, in_new_tab = false, no_state_push = false, restore_scroll = false)
{
	//If we're going somewhere outside of the site, open it in a new tab and don't screw with the opacity.
	if (in_new_tab)
	{
		window.open(url, "_blank");
		return;
	}
	
	
	
	let temp = window.scrollY;
	
	
	
	let include_return_url = false;
	
	if (url == "/settings.html")
	{
		include_return_url = true;
	}
	
	
	
	current_url = url;
	
	parent_folder = url.slice(0, url.lastIndexOf("/") + 1);
	
	
	let background_color = document.documentElement.style.backgroundColor;
	
	document.documentElement.classList.remove("color-transition");
	
	
	
	
	
	//Get the new data and fade out the page. When both of those things are successfully done, replace the current html with the new stuff.
	Promise.all([fetch(url), fade_out(), load_banner()])
	
	
	
	.then(function(response)
	{
		return response[0].text();
	})
	
	
	
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
			history.replaceState({}, document.title, "/index.html" + concat_url_vars(include_return_url));
		}
		
		
		
		add_banner_style();
		
		document.body.innerHTML = data;
		
		
		
		if (restore_scroll)
		{
			window.scrollTo(0, last_page_scroll);
			scroll_update(last_page_scroll);
		}
		
		else
		{
			window.scrollTo(0, 0);
			scroll = 0;
		}
		
		last_page_scroll = temp;
		
		
		
		parse_scripts();
	})
	
	
	
	.catch(function(error)
	{
		console.log("Failed to load new page -- reversing fade-out.");
		
		
		
		if (background_color_changed)
		{
			setTimeout(function()
			{
				document.documentElement.classList.add("background-transition");
				document.body.classList.add("background-transition");
				
				document.documentElement.style.backgroundColor = background_color;
				document.body.style.backgroundColor = background_color;
				
				setTimeout(function()
				{
					document.documentElement.classList.remove("background-transition");
					document.body.classList.remove("background-transition");
					
					document.body.style.backgroundColor = "";
					
					setTimeout(function()
					{
						document.documentElement.style.opacity = 1;
					}, 300);
				}, 450);
			}, 750);
		}
		
		
		
		else
		{
			setTimeout(function()
			{
				document.documentElement.style.opacity = 1;
			}, 300);
		}
	});
}



function fade_out()
{
	return new Promise(function(resolve, reject)
	{
		//Act like a normal link, with no transitions, if the user wants that.
		if (url_vars["content_animation"] == 1)
		{
			if (background_color_changed)
			{
				if (url_vars["theme"] == 1)
				{
					if (url_vars["dark_theme_color"] == 1)
					{
						document.documentElement.style.backgroundColor = "rgb(0, 0, 0)";
					}
					
					else
					{
						document.documentElement.style.backgroundColor = "rgb(24, 24, 24)";
					}
				}
				
				else
				{
					document.documentElement.style.backgroundColor = "rgb(255, 255, 255)";
				}
			}
			
			resolve();
		}
			
		else
		{
			//Fade out the current page's content.
			document.documentElement.style.opacity = 0;
			
			//If necessary, take the time to fade back to the default background color, whatever that is.
			if (background_color_changed)
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
						
						resolve();
					}, 450);
				}, 300);
			}
			
			//Finally, redirect to the new page and fade the content back in.
			else
			{
				setTimeout(function()
				{
					resolve();
				}, 300);
			}
		}
	});
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
		history.replaceState({}, document.title, window.location.pathname + concat_url_vars(false));
	}
}