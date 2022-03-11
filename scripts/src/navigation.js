/*
	
	Page:
		
		...
		
		
		Navigation: methods for navigating between pages.
			
			redirect: loads a new page.
			
			concat_url_vars: returns a string of url variables that can be appended to any url.
			
			write_url_vars: does exactly that.
		
		Unload: methods for deconstructing the current page.
			
			fade_out: handles the process of fading out the opacity, including edge cases like the background color being weird or the new page failing to load.
	
*/



"use strict";



Page.Navigation =
{
	currently_changing_page: false,

	last_page_scroll: 0,
	
	elements_to_remove: [],
	
	
	
	//Handles virtually all links.
	redirect: function(url, in_new_tab = false, no_state_push = false, restore_scroll = false)
	{
		if (this.currently_changing_page)
		{
			return;
		}
		
		//If we're going somewhere outside of the site, open it in a new tab and don't screw with the opacity.
		if (in_new_tab || url.slice(url.length - 5) !== ".html")
		{
			window.open(url, "_blank");
			return;
		}
		
		
		
		this.currently_changing_page = true;
		
		
		
		let temp = window.scrollY;
		
		
		
		Site.applet_process_id++;
		
		
		
		if (!no_state_push)
		{
			Site.last_pages.push(Page.url);
		}
		
		Page.url = url;
		
		Page.parent_folder = url.slice(0, url.lastIndexOf("/") + 1);
		
		Page.loaded = false;
		
		
		
		//We need to record this in case we can't successfully load the next page and we need to return to the current one.
		let background_color = document.documentElement.style.backgroundColor;
		
		
		
		//Get the new data, fade out the page, and preload the next page's banner if it exists. When all of those things are successfully done, replace the current html with the new stuff.
		Promise.all([fetch(url), Page.Unload.fade_out(), Page.Banner.load()])
		
		
		.then((response) =>
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
			
		
		.then((data) =>
		{
			Page.unload();
			
			
			
			let index = data.indexOf("</head>");
			
			if (index !== -1)
			{
				data = data.slice(index + 7);
			}
			
			index = data.indexOf("<script>");
			
			let scripts_data = "";
			
			if (index !== -1)
			{
				scripts_data = data.slice(index);
				
				data = data.slice(0, index);
			}
			
			
			
			document.body.innerHTML = Page.Components.decode(`<div class="page">${data}</div>${scripts_data}`);
			
			Page.Load.parse_script_tags();
			
			
			
			//Record the page change in the url bar and in the browser history.
			if (!no_state_push)
			{
				history.pushState({}, document.title, url + this.concat_url_vars());
			}
			
			else
			{
				history.replaceState({}, document.title, url + this.concat_url_vars());
			}
			
			
			
			//Restore the ability to scroll in case it was removed.
			document.documentElement.style.overflowY = "visible";
			document.body.style.overflowY = "visible";
			
			document.body.style.userSelect = "auto";
			document.body.style.WebkitUserSelect = "auto";
			
			
			
			if (restore_scroll)
			{
				window.scrollTo(0, this.last_page_scroll);
				Page.Banner.on_scroll(this.last_page_scroll);
			}
			
			else
			{
				window.scrollTo(0, 0);
				Page.scroll = 0;
			}
			
			this.last_page_scroll = temp;
			
			
			
			if (Page.loaded)
			{
				Page.show();
			}
			
			else
			{
				Page.loaded = true;
			}
		})
		
		
		
		.catch((error) =>
		{
			console.error(error.message);
			
			console.log("Failed to load new page -- reversing fade-out.");
			
			
			
			this.currently_changing_page = false;
			
			setTimeout(() =>
			{
				if (!Page.background_color_changed)
				{
					Page.Animate.change_opacity(document.body, 1, Site.opacity_animation_time);
				}
				
				
				
				else
				{
					setTimeout(() =>
					{
						document.documentElement.classList.add("background-transition");
						document.body.classList.add("background-transition");
						
						document.documentElement.style.backgroundColor = background_color;
						document.body.style.backgroundColor = background_color;
						
						setTimeout(() =>
						{
							document.documentElement.classList.remove("background-transition");
							document.body.classList.remove("background-transition");
							
							document.body.style.backgroundColor = "";
							
							setTimeout(() =>
							{
								Page.Animate.change_opacity(document.body, 1, Site.opacity_animation_time);
							}, Site.opacity_animation_time);
						}, Site.background_color_animation_time);
					}, Site.background_color_animation_time);
				}
			}, Site.opacity_animation_time);
		});
	},



	//Returns a string of url vars that can be attached to any url.
	concat_url_vars: function()
	{
		let string = "";
		let key = "";
		let temp = "";
		
		let found_first_key = false;
		
		
		
		for (let i = 0; i < Object.keys(Site.Settings.url_vars).length; i++)
		{
			key = Object.keys(Site.Settings.url_vars)[i];
			
			if (Site.Settings.url_vars[key] !== 0 || (window.matchMedia("(prefers-color-scheme: dark)").matches && Site.Settings.url_vars["theme"] === 0 && key === "theme"))
			{
				if (found_first_key)
				{
					string += "&" + key + "=" + Site.Settings.url_vars[key];
				}
				
				else
				{
					string += "?" + key + "=" + Site.Settings.url_vars[key];
					
					found_first_key = true;
				}
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



Page.Unload =
{
	fade_out: function()
	{
		return new Promise((resolve, reject) =>
		{
			//Act like a normal link, with no transitions, if the user wants that.
			if (Site.Settings.url_vars["content_animation"] === 1)
			{
				if (Page.background_color_changed)
				{
					if (Site.Settings.url_vars["theme"] === 1)
					{
						if (Site.Settings.url_vars["dark_theme_color"] === 1)
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
				Page.Animate.change_opacity(document.body, 0, Site.opacity_animation_time)
				
				.then(() =>
				{
					if (Page.background_color_changed === false)
					{
						resolve();
					}
					
					
					
					//If necessary, take the time to fade back to the default background color, whatever that is.
					else
					{
						document.documentElement.classList.add("background-transition");
						document.body.classList.add("background-transition");
						
						if (Site.Settings.url_vars["theme"] === 1)
						{
							if (Site.Settings.url_vars["dark_theme_color"] === 1)
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
						
						setTimeout(() =>
						{
							document.body.style.backgroundColor = "";
							
							document.documentElement.classList.remove("background-transition");
							document.body.classList.remove("background-transition");
						}, Site.background_color_animation_time);
						
						resolve();
					}
				});
			}
		});
	}
};



Page.unload = function()
{
	//Remove JS so it's not executed twice.
	let elements = document.querySelectorAll("script, style.temporary-style, link.temporary-style");
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].remove();
	}
	
	//Clear temporary things.
	//Unbind everything transient from the window and the html element.
	for (let key in Page.temporary_handlers)
	{
		for (let j = 0; j < Page.temporary_handlers[key].length; j++)
		{
			window.removeEventListener(key, Page.temporary_handlers[key][j]);
			document.documentElement.removeEventListener(key, Page.temporary_handlers[key][j]);
		}
	}
	
	
	
	//Clear any temporary intervals.
	for (let i = 0; i < Page.temporary_intervals.length; i++)
	{
		clearInterval(Page.temporary_intervals[i]);
	}
	
	Page.temporary_intervals = [];
	
	
	
	//Terminate any temporary web workers.
	for (let i = 0; i < Page.temporary_web_workers.length; i++)
	{
		Page.temporary_web_workers[i].terminate();
	}
	
	Page.temporary_web_workers = [];
	
	
	
	
	//Remove everything that's not a script from the body.
	Page.element.remove();
}