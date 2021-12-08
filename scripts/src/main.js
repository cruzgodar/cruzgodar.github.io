/*
	
	Page: one of the highest-level objects. Contains methods for loading and unloading the page, as well as all of the fundamental properties that various subobjects.
	
	Site: the other highest-level object. Contains properties and methods that extend beyond the current page.
		
		Fetch: methods for getting files.
	
*/

//

"use strict";



let DEBUG = false;



Page.scroll = 0;

/*
	Defaults:
	
	"title": "",
	
	"banner_page": false,
	"num_banners": 0,
	
	"title_page_text": "",
	"title_page_text_size": .1,
	
	"writing_page": false,
	"math_page": false,
	
	"small_margins_on_ultrawide": false,
	
	"manual_banner": false,
	"manual_dark_theme": false,
	
	"no_footer": false,
	"footer_exclusion": ""
*/

Page.settings = {};

Page.url = decodeURIComponent(Settings.get_url_var("page"));

Page.parent_folder = "/";



Page.temporary_handlers =
{
	"scroll": [],
	"resize": [],
	"wheel": [],
	
	"touchstart": [],
	"touchmove": [],
	"touchend": [],
	
	"mousedown": [],
	"mousemove": [],
	"mouseup": [],
	
	"keydown": []
}

Page.temporary_intervals = [];

Page.temporary_web_workers = [];

Page.background_color_changed = false;

//Sets a whole bunch of elements' styles at once.
Page.set_element_styles = function(query_string, property, value)
{
	let elements = document.querySelectorAll(query_string);
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].style.setProperty(property, value);
	}
}



let Site =
{
	scripts_loaded:
	{
		"mathjax": false,
		"complexjs": false,
		"glsl": false
	},
	
	last_pages: [],
	
	
	
	base_animation_time: 250,
	
	
	
	//Redirects to the chosen page and sets up all the miscellaneous things that make the site work.
	load: async function(url)
	{
		this.aos_separation_time = this.base_animation_time / 3;
		this.button_animation_time = this.base_animation_time / 2;
		this.opacity_animation_time = this.base_animation_time;
		this.background_color_animation_time = this.base_animation_time * 2;
		this.aos_animation_time = this.base_animation_time * 4;
		
		
		
		Page.Layout.window_width = window.innerWidth;
		Page.Layout.window_height = window.innerHeight;
		Page.Layout.aspect_ratio = Page.Layout.window_width / Page.Layout.window_height;
		
		window.addEventListener("resize", () =>
		{
			Page.Load.AOS.on_resize();
			
			Page.Layout.on_resize();
		});
		
		Page.Load.AOS.on_resize();
		
		
		
		setInterval(() =>
		{
			window.dispatchEvent(new Event("resize"));
		}, 5000);
		
		
		
		Browser.detect();
		
		
		
		Site.Interaction.set_up_listeners();
		
		
		
		window.addEventListener("scroll", () =>
		{
			Page.Banner.on_scroll(0);
		});
		
		
		
		if ("scrollRestoration" in history)
		{
			history.scrollRestoration = "manual";
		}
		
		
		
		//When in PWA form, disable text selection and drag-and-drop.
		if (window.matchMedia("(display-mode: standalone)").matches)
		{
			document.documentElement.style.WebkitUserSelect = "none";
			document.documentElement.style.userSelect = "none";
			document.documentElement.style.WebkitTouchCallout = "none";
			
			let elements = document.querySelectorAll("body *");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].setAttribute("draggable", "false");
			}
			
			
			
			
			//Also add a little extra spacing at the top of each page to keep content from feeling too close to the top of the screen.
			this.add_style(`
				#logo, .name-text-container, .empty-top
				{
					margin-top: 2vh;
				}
			`, false);
		}
		
		
		
		//Fade in the opacity when the user presses the back button.
		window.addEventListener("popstate", (e) =>
		{
			//Ew
			if (window.location.href.indexOf("#") !== -1)
			{
				return;
			}
			
			
			
			
			let index = Site.last_pages.length - 1;
			
			if (index !== -1 && Site.last_pages[index] !== Page.url)
			{
				Page.Navigation.redirect(Site.last_pages.pop(), false, true, true);
			}
			
			else
			{
				Page.Navigation.redirect("/home/home.html", false, true);
			}
		});
		
		
		
		if ("serviceWorker" in navigator)
		{
			window.addEventListener("load", () =>
			{
				navigator.serviceWorker.register("/service-worker.js");
			});
		}
		
		
		
		Page.Banner.ScrollButton.exists = false;
		
		
		
		AOS.init({duration: Site.aos_animation_time, once: true, offset: Math.min(100, Page.Layout.window_height / 10)});
		
		window.addEventListener("scroll", () =>
		{
			Page.Load.AOS.on_scroll();
		});
		
		window.addEventListener("resize", () =>
		{
			Page.Load.AOS.on_resize();
		});
		
		
		
		Site.Settings.set_up();
		
		
		
		Page.Images.check_webp_support()
		
		.then(() =>
		{
			//If it's not an html file, it shouldn't be anywhere near redirect().
			if (url.substring(url.lastIndexOf(".") + 1, url.length) !== "html")
			{
				//This should really be using history.replaceState(), but that doesn't update the page to make the file show for some reason.
				window.location.href = url;
			}
			
			else
			{
				Page.Navigation.redirect(url, false, true);
			}
		});
	},
	
	
	
	//Loads a script with the given source and returns a promise for when it completes.
	load_script: function(src, is_module = false)
	{
		return new Promise((resolve, reject) =>
		{
			const script = document.createElement("script");
			
			if (is_module)
			{
				script.setAttribute("type", "module");
			}
			
			document.body.appendChild(script);
			script.onload = resolve;
			script.onerror = reject;
			script.async = true;
			script.src = src;
		});
	},
	
	
	
	glsl_functions:
	{
		"main": "",
		// "gamma": "",
		"zeta": ""
	},
	
	load_glsl: function()
	{
		return new Promise(async (resolve, reject) =>
		{
			window.COMPLEX_GLSL = "";
			
			let filenames = Object.keys(this.glsl_functions);
			
			
			
			for (let i = 0; i < filenames.length; i++)
			{
				await new Promise(async (resolve, reject) =>
				{
					fetch(`/scripts/glsl/${filenames[i]}.frag`)
				
					.then(response => response.text())
					
					.then(text => this.glsl_functions[filenames[i]] = text)
					
					.then(() => resolve());
				});
			}
			
			
			
			//Join them all for now -- we'll replace this later
			for (let i = 0; i < filenames.length; i++)
			{
				window.COMPLEX_GLSL	+= this.glsl_functions[filenames[i]];
			}
			
			Site.scripts_loaded["glsl"] = true;
			
			resolve();
		});
	},
	
	
	
	//Adds a style tag to <head> with the given content. If temporary is true, it will be removed at the next page load. Returns the style element added.
	add_style: function(content, temporary = true, at_beginning_of_head = false)
	{
		let element = document.createElement("style");
		
		element.textContent = content;
		
		if (temporary)
		{
			element.classList.add("temporary-style");
		}
		
		
		
		if (at_beginning_of_head)
		{
			document.head.insertBefore(element, document.head.firstChild);
		}
		
		else
		{
			document.head.appendChild(element);
		}
		
		
		
		return element;
	},
	
	
	
	Fetch:
	{
		//A list of things that need to be fetched (for example, banners that need to be preloaded). The items at the start of the list get fetched first.
		queue: [],

		busy: false,
		
		
		
		//Gets the next item from the fetch queue.
		get_next_item_from_queue: function()
		{
			if (this.queue.length === 0 || this.busy)
			{
				return;
			}
			
			
			
			this.busy = true;
			
			console.log("Now fetching " + this.queue[0]);
			
			
			
			fetch(this.queue[0])
			
			.then(() =>
			{
				this.busy = false;
				
				this.queue.shift();
				
				this.get_next_item_from_queue();
			});
		}
	},
	
	
	
	Interaction:
	{
		//Whether this is a touchscreen device on the current page. It's assumed to be false on every page until a touchstart or touchmove event is detected, at which point it's set to true.
		currently_touch_device: (("ontouchstart" in window) ||
     (navigator.maxTouchPoints > 0) ||
     (navigator.msMaxTouchPoints > 0)),
		
		last_mousemove_event: 0,
		
		last_touch_x: 0,
		last_touch_y: 0,
		
		
		
		set_up_listeners: function()
		{
			let bound_function = this.handle_touch_event.bind(this);
			
			document.documentElement.addEventListener("touchstart", bound_function, false);
			document.documentElement.addEventListener("touchmove", bound_function, false);



			document.documentElement.addEventListener("mousemove", () =>
			{
				if (this.currently_touch_device)
				{
					let time_between_mousemoves = Date.now() - this.last_mousemove_event;
					
					this.last_mousemove_event = Date.now();
					
					//Checking if it's >= 3 kinda sucks, but it seems like touch devices like to fire two mousemoves in quick succession sometimes. They also like to make that delay exactly 33. Look, I hate this too, but it needs to be here.
					if (time_between_mousemoves >= 3 && time_between_mousemoves <= 50 && time_between_mousemoves !== 33)
					{
						this.currently_touch_device = false;
						
						
						
						if (!Page.Footer.Floating.is_visible)
						{
							Page.Footer.Floating.animate_in();
						}
					}
				}
			});



			//Click the focused element when the enter key is pressed.
			document.documentElement.addEventListener("keydown", (e) =>
			{
				if (e.keyCode === 13)
				{
					if (document.activeElement.classList.contains("click-on-child"))
					{
						document.activeElement.children[0].click();
					}
					
					else if (!(document.activeElement.tagName === "BUTTON" || (document.activeElement.tagName === "INPUT" && document.activeElement.getAttribute("type") !== "button")))
					{
						document.activeElement.click();
					}
				}
			});



			//Remove focus when moving the mouse or touching anything.
			document.documentElement.addEventListener("mousedown", () =>
			{
				if (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA")
				{
					document.activeElement.blur();
				}
			});
		},
		
		
		
		handle_touch_event: function(e)
		{
			this.last_touch_x = e.touches[0].clientX;
			this.last_touch_y = e.touches[0].clientY;
			
			if (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA")
			{
				document.activeElement.blur();
			}
			
			if (!this.currently_touch_device)
			{
				Page.Load.HoverEvents.remove();
				
				this.currently_touch_device = true;
			}
		}
	},
	
	
	
	Settings: Settings
};