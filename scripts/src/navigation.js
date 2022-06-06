"use strict";



Page.Navigation =
{
	currently_changing_page: false,

	last_page_scroll: 0,
	
	elements_to_remove: [],
	
	navigation_path: [],
	
	transition_type: 0,
	
	
	
	//Handles virtually all links.
	redirect: async function(url, in_new_tab = false, no_state_push = false, restore_scroll = false, no_fade_out = false)
	{
		if (this.currently_changing_page)
		{
			return;
		}
		
		//If we're going somewhere outside of the site, open it in a new tab and don't screw with the opacity.
		if (in_new_tab || url.indexOf(".") !== -1)
		{
			window.open(url, "_blank");
			return;
		}
		
		
		
		this.currently_changing_page = true;
		
		
		
		let temp = window.scrollY;
		
		
		
		Site.applet_process_id++;
		
		
		
		this.transition_type = this.get_transition_type(url);
		
		Page.url = url;
		
		Page.parent_folder = url.slice(0, url.length);
		
		
		
		//We need to record this in case we can't successfully load the next page and we need to return to the current one.
		let background_color = document.documentElement.style.backgroundColor;
		
		await Page.Unload.fade_out(no_fade_out, url);
		
		
		
		//Get the new data, fade out the page, and preload the next page's banner if it exists. When all of those things are successfully done, replace the current html with the new stuff.
		Promise.all([fetch(url + "index.html"), Page.Banner.load()])
		
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
			
			
			
			document.body.firstElementChild.insertAdjacentHTML("beforebegin", Page.Components.decode(`<div class="page" style="opacity: 0">${data}</div>${scripts_data}`));
			
			Page.Load.parse_script_tags();
			
			
			
			let display_url = url;
			
			if (DEBUG)
			{
				display_url = `/index-testing.html?page=${encodeURIComponent(url)}`;
			}
			
			//Record the page change in the url bar and in the browser history.
			if (!no_state_push)
			{
				history.pushState({url: url}, document.title, display_url + this.concat_url_vars());
			}
			
			else
			{
				history.replaceState({url: url}, document.title, display_url + this.concat_url_vars());
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
		
		
		
		Object.keys(Site.Settings.url_vars).forEach(key =>
		{
			if (Site.Settings.url_vars[key] !== 0 || (window.matchMedia("(prefers-color-scheme: dark)").matches && Site.Settings.url_vars["theme"] === 0 && key === "theme"))
			{
				if (DEBUG || found_first_key)
				{
					string += "&" + key + "=" + Site.Settings.url_vars[key];
				}
				
				else
				{
					string += "?" + key + "=" + Site.Settings.url_vars[key];
					
					found_first_key = true;
				}
			}
		});
		
		
		
		return string;
	},
	
	

	write_url_vars: function()
	{
		//Make the current state persist on refresh.
		let display_url = DEBUG ? `/index-testing.html?page=${encodeURIComponent(Page.url)}` : Page.url;
		
		history.replaceState({}, document.title, display_url + this.concat_url_vars());
	},
	
	
	
	//Figures out what type of transition to use to get to this url. Returns 1 for deeper, -1 for shallower, 2 for a sibling to the right, -2 for one to the left, and 0 for anything else.
	get_transition_type: function(url)
	{
		if (!(url in Site.sitemap) || url === Page.url)
		{
			return 0;
		}
		
		
		
		let parent = Page.url;
		
		while (parent !== "")
		{
			parent = Site.sitemap[parent].parent;
			
			if (url === parent)
			{
				return -1;
			}
		}
		
		
		
		parent = url;
		
		while (parent !== "")
		{
			parent = Site.sitemap[parent].parent;
			
			if (Page.url === parent)
			{
				return 1;
			}
		}
		
		
		
		if (Site.sitemap[url].parent === Site.sitemap[Page.url].parent)
		{
			let parent = Site.sitemap[url].parent;
			
			if (Site.sitemap[parent].children.indexOf(url) > Site.sitemap[parent].children.indexOf(Page.url))
			{
				return 2;
			}
			
			return -2;
		}
		
		
		
		return 0;
	}
};



Page.Unload =
{
	fade_out: function(no_fade_out, url)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (Site.force_dark_theme_pages.includes(url) && Site.Settings.url_vars["theme"] !== 1)
			{
				Site.Settings.revert_theme = 0;
				
				Site.Settings.forced_theme = true;
				
				Site.Settings.toggle("theme", false, true);
			}
			
			
			
			if (no_fade_out)
			{
				Page.element.style.opacity = 0;
				
				resolve();
				return;
			}
			
			
			
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
				if (Site.Settings.url_vars["content_animation"] !== 1)
				{
					let promise = null;
					
					if (Page.Navigation.transition_type === 1)
					{
						promise = Page.Animate.fade_up_out(Page.element, Site.page_animation_time);
						
						if (Page.banner_element !== null)
						{
							promise = Page.Animate.fade_up_out(Page.banner_element, Site.page_animation_time * 2);
						}
					}
					
					else if (Page.Navigation.transition_type === -1)
					{
						promise = Page.Animate.fade_down_out(Page.element, Site.page_animation_time);
						
						if (Page.banner_element !== null)
						{
							promise = Page.Animate.fade_down_out(Page.banner_element, Site.page_animation_time * 2);
						}
					}
					
					else if (Page.Navigation.transition_type === 2)
					{
						promise = Page.Animate.fade_left_out(Page.element, Site.page_animation_time);
						
						if (Page.banner_element !== null)
						{
							promise = Page.Animate.fade_left_out(Page.banner_element, Site.page_animation_time * 2);
						}
					}
					
					else if (Page.Navigation.transition_type === -2)
					{
						promise = Page.Animate.fade_right_out(Page.element, Site.page_animation_time);
						
						if (Page.banner_element !== null)
						{
							promise = Page.Animate.fade_right_out(Page.banner_element, Site.page_animation_time * 2);
						}
					}
					
					else
					{
						promise = Page.Animate.fade_out(Page.element, Site.page_animation_time);
						
						if (Page.banner_element !== null)
						{
							promise = Page.Animate.fade_out(Page.banner_element, Site.page_animation_time * 2);
						}
					}
					
					await promise;
				}	
				
				
				
				//If necessary, take the time to fade back to the default background color, whatever that is.
				if (Page.background_color_changed)
				{
					document.documentElement.classList.add("background-transition");
					document.body.classList.add("background-transition");
					
					if (Site.Settings.url_vars["theme"] === 1)
					{
						if (Site.Settings.url_vars["dark_theme_color"] === 1)
						{
							document.documentElement.style.backgroundColor = "rgb(0, 0, 0)";
							document.body.style.backgroundColor = "rgb(0, 0, 0)";
							
							anime({
								targets: Site.Settings.meta_theme_color_element,
								content: "#000000",
								duration: 500,
								easing: "cubicBezier(.42, 0, .58, 1)"
							});
						}
						
						else
						{
							document.documentElement.style.backgroundColor = "rgb(24, 24, 24)";
							document.body.style.backgroundColor = "rgb(24, 24, 24)";
							
							anime({
								targets: Site.Settings.meta_theme_color_element,
								content: "#161616",
								duration: 500,
								easing: "cubicBezier(.42, 0, .58, 1)"
							});
						}
					}
					
					else
					{
						document.documentElement.style.backgroundColor = "rgb(255, 255, 255)";
						document.body.style.backgroundColor = "rgb(255, 255, 255)";
						
						anime({
							targets: Site.Settings.meta_theme_color_element,
							content: "#ffffff",
							duration: 500,
							easing: "cubicBezier(.42, 0, .58, 1)"
						});
					}
					
					setTimeout(() =>
					{
						document.body.style.backgroundColor = "";
						
						document.documentElement.classList.remove("background-transition");
						document.body.classList.remove("background-transition");
					}, Site.background_color_animation_time);
				}
				
				resolve();
			}
		});
	}
};



Page.unload = function()
{
	//Remove JS so it's not executed twice.
	document.querySelectorAll("script, style.temporary-style, link.temporary-style").forEach(element => element.remove());
	
	
	
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
	
	
	
	Page.temporary_intervals.forEach(refresh_id => clearInterval(refresh_id));
	
	Page.temporary_intervals = [];
	
	
	
	Page.temporary_web_workers.forEach(web_worker => web_worker.terminate());
	
	Page.temporary_web_workers = [];
	
	
	
	//Remove everything that's not a script from the page element.
	Page.element.remove();
}