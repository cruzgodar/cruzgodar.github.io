/*
	
	Page:
		
		...
		
		Navigation: methods for navigating between pages.
			
			redirect: loads a new page.
			
			fade_out: handles the process of fading out the opcaity, including edge cases like the background color being weird or the new page failing to load.
			
			concat_url_vars: returns a string of url variables that can be appended to any url.
			
			write_url_vars: does exactly that.
	
*/



"use strict";



Page.Navigation =
{
	currently_changing_page: false,

	last_page_scroll: 0,
	
	
	
	//Handles virtually all links.
	redirect: function(url, in_new_tab = false, no_state_push = false, restore_scroll = false)
	{
		if (this.currently_changing_page)
		{
			return;
		}
		
		
		
		
		//If we're going somewhere outside of the site, open it in a new tab and don't screw with the opacity.
		if (in_new_tab)
		{
			window.open(url, "_blank");
			return;
		}
		
		
		
		this.currently_changing_page = true;
		
		
		
		let temp = window.scrollY;
		
		
		
		current_url = url;
		
		parent_folder = url.slice(0, url.lastIndexOf("/") + 1);
		
		
		
		//We need to record this in case we can't successfully load the next page and we need to return to the current one.
		let background_color = document.documentElement.style.backgroundColor;
		
		
		
		
		
		//Get the new data, fade out the page, and preload the next page's banner if it exists. When all of those things are successfully done, replace the current html with the new stuff.
		
		//A note: we append a random string to the end of the url to prevent browser caching, which can all too often cause problems. However, this is only done for the raw HTML files, not anything larger like images, so it doesn't consume too much of the user's data.
		Promise.all([fetch(url), this.fade_out(), Banners.load()])
		
		
		
		.then(function(response)
		{
			if (!response[0].ok)
			{
				window.location.replace("/404.html");
			}
			
			else
			{
				return response[0].text();
			}
		})
		
		
		
		.then(function(data)
		{
			this.on_page_unload();
			
			//Record the page change in the url bar and in the browser history.
			if (no_state_push === false)
			{
				history.pushState({}, document.title, "/index.html" + this.concat_url_vars());
			}
			
			else
			{
				history.replaceState({}, document.title, "/index.html" + this.concat_url_vars());
			}
			
			
			
			document.body.innerHTML = data;
			
			
			
			if (restore_scroll)
			{
				window.scrollTo(0, this.last_page_scroll);
				scroll_update(this.last_page_scroll);
			}
			
			else
			{
				window.scrollTo(0, 0);
				scroll = 0;
			}
			
			this.last_page_scroll = temp;
			
			
			
			parse_script_tags();
		})
		
		
		
		.catch(function(error)
		{
			console.log("Failed to load new page -- reversing fade-out.");
			
			
			
			this.currently_changing_page = false;
			
			setTimeout(function()
			{
				if (background_color_changed === false)
				{
					document.body.style.opacity = 1;
				}
				
				
				
				else
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
								document.body.style.opacity = 1;
							}, 300);
						}, 450);
					}, 450);
				}
			}, 300);
		});
	},



	fade_out: function()
	{
		return new Promise(function(resolve, reject)
		{
			try
			{
				hide_floating_settings();
				
				
				
				document.querySelector("#floating-footer").style.opacity = 0;
				
				Footer.Floating.is_visible = false;
			}
			
			catch(ex) {}
			
			
			
			//Act like a normal link, with no transitions, if the user wants that.
			if (url_vars["content_animation"] === 1)
			{
				if (background_color_changed)
				{
					if (url_vars["theme"] === 1)
					{
						if (url_vars["dark_theme_color"] === 1)
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
				document.body.style.opacity = 0;
				
				setTimeout(function()
				{
					if (background_color_changed === false)
					{
						resolve();
					}
					
					
					
					//If necessary, take the time to fade back to the default background color, whatever that is.
					else
					{
						document.documentElement.classList.add("background-transition");
						document.body.classList.add("background-transition");
						
						if (url_vars["theme"] === 1)
						{
							if (url_vars["dark_theme_color"] === 1)
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
						}, 450);
						
						resolve();
					}
				}, 300);
			}
		});
	},
	
	
	
	on_page_unload: function()
	{
		//Remove any css and js that's no longer needed to prevent memory leaks.
		let elements = document.querySelectorAll("style.temporary-style, link.temporary-style, script.temporary-script");
		for (let i = 0; i < elements.length; i++)
		{
			elements[i].remove();
		}
		
		
		
		//Remove everything that's not a script from the body.
		elements = document.querySelectorAll("body > *:not(script)");
		for (let i = 0; i < elements.length; i++)
		{ 
			elements[i].remove();
		}
		
		
		
		//Unbind everything transient from the window and the html element.
		for (let key in temporary_handlers)
		{
			for (let j = 0; j < temporary_handlers[key].length; j++)
			{
				window.removeEventListener(key, temporary_handlers[key][j]);
				document.documentElement.removeEventListener(key, temporary_handlers[key][j]);
			}
		}
		
		
		
		//Clear any temporary intervals.
		for (let i = 0; i < temporary_intervals.length; i++)
		{
			clearInterval(temporary_intervals[i]);
		}
		
		temporary_intervals = [];
		
		
		
		//Terminate any temporary web workers.
		for (let i = 0; i < temporary_web_workers.length; i++)
		{
			temporary_web_workers[i].terminate();
		}
		
		temporary_web_workers = [];
	},



	//Returns a string of url vars that can be attached to any url.
	concat_url_vars: function()
	{
		let string = "?page=" + encodeURIComponent(current_url);
		let key = "";
		let temp = "";
		
		
		
		for (var i = 0; i < Object.keys(url_vars).length; i++)
		{
			key = Object.keys(url_vars)[i];
			
			if (url_vars[key] !== 0 || (window.matchMedia("(prefers-color-scheme: dark)").matches && url_vars["theme"] === 0 && key === "theme"))
			{
				string += "&" + key + "=" + url_vars[key];
			}
		}
		
		
		return string;
	},
	
	

	write_url_vars: function()
	{
		//Make the current state persist on refresh.
		history.replaceState({}, document.title, window.location.pathname + this.concat_url_vars());
	}
};