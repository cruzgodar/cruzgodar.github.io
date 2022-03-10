/*
	
	Page:
		
		...
		
		
		Banner: methods for loading banners, displaying them, fading them out when the user scrolls, and everything to do with scroll buttons.
		
			load: loads and displays the banner for the current page.
			
			on_scroll: run whenever the user scrolls to update banner and scroll button opacity.
			
			fetch_other_size_in_background: fetches the portrait orientation if the current one is landscape or landscape if the current one is portrait, so that changing the screen orientation can load the new banner immediately.
			
			fetch_other_page_banners_in_background: fetches the current orientation of every adjacent page's banner, so that load times are reduced.
			
			ScrollButton: methods for handling the button that appears after a few seconds in case the user doesn't know to scroll down.
			
				insert: creates and animates in the scroll button.
				
				animate_to: smoothly animates the screen to scroll to a given element.
	
*/



"use strict";



Page.Banner =
{
	done_loading: false,

	file_name: "",
	file_path: "",



	//A list of every page that has a banner. Only to be used for preloading those banners. For everything else, use page_settings["banner_page"].
	preloadable_pages:
	[
		"/home/home.html",
		
		"/bio/bio.html",
		
		"/writing/mist/mist.html",
		"/writing/desolation-point/desolation-point.html"
	],

	//A list of every page that has multiple banners. Again, this is ONLY to be used for preloading those banners. For everything else, use page_settings["num_banners"].
	multibanner_pages:
	{
		"/home/home.html":
		{
			"current_banner": Math.floor(Math.random() * 16),
			"num_banners": 16
		}
	},

	//Filled in with pages when banners are preloaded so the console isn't spammed and caches aren't needlessly checked.
	pages_already_fetched: [],



	load: function()
	{
		return new Promise((resolve, reject) =>
		{
			//Only do banner things if the banner things are in the standard places.
			if (!(this.preloadable_pages.includes(Page.url)))
			{
				resolve();
			}
			
			
			
			else
			{
				if (Page.Layout.aspect_ratio < 1)
				{
					this.file_name = "portrait." + Page.Images.file_extension;
				}
				
				else
				{
					this.file_name = "landscape." + Page.Images.file_extension;
				}
				
					
				
				this.file_path = "";
				
				if (!(this.multibanner_pages.hasOwnProperty(Page.url)))
				{
					this.file_path = Page.parent_folder + "banners/";
				}
				
				else
				{
					this.multibanner_pages[Page.url]["current_banner"]++;
					
					if (this.multibanner_pages[Page.url]["current_banner"] === this.multibanner_pages[Page.url]["num_banners"] + 1)
					{
						this.multibanner_pages[Page.url]["current_banner"] = 1;
					}
					
					this.file_path = Page.parent_folder + "banners/" + this.multibanner_pages[Page.url]["current_banner"] + "/";
				}
				
				
				
				//Fetch the banner file. If that works, great! Set the background and fade in the page. If not, that means the html was cached but the banner was not (this is common on the homepage). In that case, we need to abort, so we remove the banner entirely.
				fetch(this.file_path + this.file_name)
				
				.then((response) =>
				{
					let img = new Image();
					
					img.onload = () =>
					{
						this.ScrollButton.timeout_id = setTimeout(() =>
						{
							this.ScrollButton.insert();
						}, 2000);
						
						resolve();
					};
					
					img.style.display = "hidden";
					img.style.opacity = 0;
					
					document.body.appendChild(img);
					
					setTimeout(() =>
					{
						img.src = this.file_path + this.file_name;
					}, 20);
				})
				
				.catch((error) =>
				{
					document.querySelector("#banner").remove();
					document.querySelector("#banner-cover").remove();
					
					
					
					//We resolve here because the page can still be loaded without the banner.
					resolve();
				});
			}
		});
	},



	on_scroll: function(scroll_position_override)
	{
		if (scroll_position_override === 0)
		{
			Page.scroll = window.scrollY;
		}
		
		else
		{
			Page.scroll = scroll_position_override;
			this.done_loading = false;
			this.ScrollButton.done_loading = false;
		}
		
		
		
		if (Page.scroll >= 0)
		{
			if (Page.scroll <= Page.Layout.window_height)
			{
				let opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - Page.scroll / Page.Layout.window_height, 0) - Math.PI / 2);
				
				try {document.querySelector("#banner").style.opacity = opacity;}
				catch(ex) {}
				
				if (opacity === 0)
				{
					this.done_loading = true;
				}
				
				else
				{
					this.done_loading = false;
				}
			}
			
			else if (!this.done_loading)
			{
				//We need a try block here in case the user refreshes the page and it's way low down for some reason, even though scrollRestoration should be off.
				try {document.querySelector("#banner").style.opacity = 0;}
				catch(ex) {}
				
				this.done_loading = true;
			}
			
			
			
			if (Page.scroll <= Page.Layout.window_height/3)
			{
				let opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - 3 * Page.scroll / Page.Layout.window_height, 0) - Math.PI / 2);
				
				if (this.ScrollButton.exists)
				{
					try {document.querySelector("#scroll-button").style.opacity = opacity;}
					catch(ex) {}
				}
				
				
				
				try
				{
					Page.set_element_styles(".name-text", "opacity", opacity);
				}
				
				catch(ex) {}
				
				
				
				if (opacity === 0)
				{
					if (this.ScrollButton.exists)
					{
						document.querySelector("#scroll-button").remove();
						this.ScrollButton.exists = false;
					}
					
					this.ScrollButton.done_loading = true;
				}
				
				else
				{
					this.ScrollButton.done_loading = false;
				}
			}
			
			
			
			else if (this.ScrollButton.timeout_id !== null && Page.scroll <= 2*Page.Layout.window_height/3)
			{
				clearTimeout(this.ScrollButton.timeout_id);
				this.ScrollButton.timeout_id = null;
			}
			
			
			
			else if (this.ScrollButton.done_loading === false)
			{
				Page.set_element_styles(".name-text", "opacity", 0);
				
				if (this.ScrollButton.exists)
				{
					document.querySelector("#scroll-button").remove();
					this.ScrollButton.exists = false;
				}
				
				this.ScrollButton.done_loading = true;
			}
		}
	},
	
	
	
	//Fetches the other size of banner needed for the page, so that if the page is resized, there's no lag time.
	fetch_other_size_in_background: function()
	{
		if (this.file_name === "landscape.webp" || this.file_name === "landscape.jpg")
		{
			Site.Fetch.queue.push(this.file_path + "portrait." + Page.Images.file_extension);
			
			Site.Fetch.get_next_item_from_queue();
		}
		
		else
		{
			Site.Fetch.queue.push(this.file_path + "landscape." + Page.Images.file_extension);
			
			Site.Fetch.get_next_item_from_queue();
		}
	},



	//For every banner page linked to by the current page, this fetches that banner so that the waiting time between pages is minimized.
	fetch_other_page_banners_in_background: function()
	{
		let links = document.querySelectorAll("a");
		
		for (let i = 0; i < links.length; i++)
		{
			let href = links[i].getAttribute("href");
			
			if (this.preloadable_pages.includes(href) && !(this.pages_already_fetched.includes(href)))
			{
				if (!(this.multibanner_pages.hasOwnProperty(href)))
				{
					this.pages_already_fetched.push(href);
					
					Site.Fetch.queue.push(href.slice(0, href.lastIndexOf("/") + 1) + "banners/" + this.file_name);
					
					Site.Fetch.get_next_item_from_queue();
				}
				
				else
				{
					let next_index = this.multibanner_pages[href]["current_banner"] % (this.multibanner_pages[href]["current_banner"] + 1) + 1;
					
					Site.Fetch.queue.push(href.slice(0, href.lastIndexOf("/") + 1) + "banners/" + next_index + "/" + this.file_name);
					
					Site.Fetch.get_next_item_from_queue();
				}
			}
		}
	},


	
	ScrollButton:
	{
		done_loading: false,
		
		exists: false,

		timeout_id: null,
		
		
		
		insert: function()
		{
			let opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - 3 * Page.scroll / Page.Layout.window_height, 0) - Math.PI / 2);
			
			
			
			//Only add the scroll button if the user is still on the top of the page.
			if (Page.scroll <= Page.Layout.window_height / 3)
			{
				let chevron_name = "chevron-down";
				
				if (Site.Settings.url_vars["contrast"] === 1)
				{
					chevron_name += "-dark";
				}
				
				
				
				//Gotta have a try block here in case the user loads a banner page then navigates to a non-banner page within 3 seconds.
				try
				{
					document.querySelector("#banner-cover").insertAdjacentHTML("beforebegin", `
						<div id="new-banner-cover" data-aos="fade-down">
							<input type="image" id="scroll-button" src="/graphics/general-icons/${chevron_name}.png" style="opacity: ${opacity}" alt="Scroll down" onclick="Page.Banner.ScrollButton.animate_to(document.querySelector('#scroll-to'))">
						</div>
					`);
					
					this.exists = true;
					
					setTimeout(() =>
					{
						try {Page.Load.HoverEvents.add_with_scale(document.querySelector("#scroll-button"), 1.1);}
						catch(ex) {}
					}, 100);
					
					document.querySelector("#banner-cover").remove();
				}
				
				catch(ex) {}
			}
		},



		animate_to: function(target_element)
		{
			target_element.scrollIntoView({behavior: "smooth"});
		}
	}
};