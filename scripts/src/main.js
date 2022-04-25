"use strict";



let DEBUG = false;


Page.element = null;
Page.last_element = null;

Page.ready_to_show = false;


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

Page.using_custom_script = true;

//Sets a whole bunch of elements' styles at once.
Page.set_element_styles = function(query_string, property, value, important = false)
{
	const priority_string = important ? "important" : "";
	
	Page.element.querySelectorAll(query_string).forEach(element => element.style.setProperty(property, value, priority_string));
}



Site.scripts_loaded =
{
	"mathjax": false,
	"complexjs": false,
	"three": false,
	"glsl": 0
};



Site.page_lists =
{
	"/teaching/uo/251/notes":
	[
		"/teaching/uo/251/251.html",
		
		"/teaching/uo/251/notes/0-algebra-and-trig-review/0-algebra-and-trig-review.html",
		"/teaching/uo/251/notes/1-intro-to-limits/1-intro-to-limits.html",
		"/teaching/uo/251/notes/2-limit-rules/2-limit-rules.html",
		"/teaching/uo/251/notes/3-continuity/3-continuity.html",
		"/teaching/uo/251/notes/4-intro-to-derivatives/4-intro-to-derivatives.html",
		"/teaching/uo/251/notes/5-derivative-rules/5-derivative-rules.html",
		"/teaching/uo/251/notes/6-applications-of-derivatives/6-applications-of-derivatives.html",
		"/teaching/uo/251/notes/7-exp-log-and-trig-derivatives/7-exp-log-and-trig-derivatives.html",
		"/teaching/uo/251/notes/8-the-chain-rule/8-the-chain-rule.html",
		"/teaching/uo/251/notes/9-implicit-differentiation/9-implicit-differentiation.html",
		"/teaching/uo/251/notes/10-linear-approximation/10-linear-approximation.html",
		"/teaching/uo/251/notes/11-optimization/11-optimization.html",
		"/teaching/uo/251/notes/12-derivatives-and-graphs/12-derivatives-and-graphs.html",
		"/teaching/uo/251/notes/13-l-hopitals-rule/13-l-hopitals-rule.html",
		"/teaching/uo/251/notes/14-related-rates/14-related-rates.html",
		"/teaching/uo/251/notes/15-applied-optimization/15-applied-optimization.html"
	],
	
	"/teaching/uo/252/notes":
	[
		"/teaching/uo/252/252.html",
		
		"/teaching/uo/252/notes/0-calc-1-review/0-calc-1-review.html",
		"/teaching/uo/252/notes/1-riemann-sums/1-riemann-sums.html",
		"/teaching/uo/252/notes/2-integrals-intro/2-integrals-intro.html",
		"/teaching/uo/252/notes/3-antiderivatives/3-antiderivatives.html",
		"/teaching/uo/252/notes/4-ftoc/4-ftoc.html",
		"/teaching/uo/252/notes/5-simple-applications/5-simple-applications.html",
		"/teaching/uo/252/notes/6-u-sub/6-u-sub.html",
		"/teaching/uo/252/notes/7-exp-and-log-integrals/7-exp-and-log-integrals.html",
		"/teaching/uo/252/notes/8-area-between-curves/8-area-between-curves.html",
		"/teaching/uo/252/notes/9-solids-of-revolution/9-solids-of-revolution.html",
		"/teaching/uo/252/notes/10-arc-length-and-surface-area/10-arc-length-and-surface-area.html",
		"/teaching/uo/252/notes/11-physical-applications/11-physical-applications.html",
		"/teaching/uo/252/notes/12-integration-by-parts/12-integration-by-parts.html",
		"/teaching/uo/252/notes/13-trig-sub/13-trig-sub.html",
		"/teaching/uo/252/notes/14-partial-fractions/14-partial-fractions.html",
		"/teaching/uo/252/notes/15-improper-integrals/15-improper-integrals.html",
		"/teaching/uo/252/notes/16-intro-to-des/16-intro-to-des.html"
	],
	
	"/projects/wilson/guide":
	[
		"/projects/wilson/wilson.html",
		
		"/projects/wilson/guide/1/getting-started.html",
		"/projects/wilson/guide/2/draggables.html",
		"/projects/wilson/guide/3/parallelizing.html",
		"/projects/wilson/guide/4/hidden-canvases.html",
		"/projects/wilson/guide/5/fullscreen.html",
		"/projects/wilson/guide/6/interactivity.html"
	]
};



Site.use_js_animation = false;

Site.base_animation_time = 250;
	
	
	
Site.applet_process_id = 0;
	
	
	
//Redirects to the chosen page and sets up all the miscellaneous things that make the site work.
Site.load = async function(url)
{
	Page.element = document.querySelector(".page");
	
	
	
	Site.use_js_animation = Browser.is_ios();
	
	
	
	if (Site.use_js_animation)
	{
		console.log("Using JS animation");
		
		this.aos_separation_time = this.base_animation_time / 5;
		this.button_animation_time = this.base_animation_time / 2;
		this.opacity_animation_time = this.base_animation_time * .8;
		this.background_color_animation_time = this.base_animation_time * 2;
		this.aos_animation_time = this.base_animation_time * 4;
		
		Page.Animate.change_opacity = Page.Animate.change_opacity_js;
		Page.Animate.change_scale = Page.Animate.change_scale_js;
		Page.Animate.fade_left = Page.Animate.fade_left_js;
		Page.Animate.show_fade_up_section = Page.Animate.show_fade_up_section_js;
		Page.Animate.show_zoom_out_section = Page.Animate.show_zoom_out_section_js;
	}
	
	else
	{
		this.aos_separation_time = this.base_animation_time / 5;
		this.button_animation_time = this.base_animation_time * .45;
		this.opacity_animation_time = this.base_animation_time * .75;
		this.background_color_animation_time = this.base_animation_time * 2;
		this.aos_animation_time = Math.ceil(this.base_animation_time * 3.25 / 50) * 50;
		
		AOS.init({duration: Site.aos_animation_time, once: true, offset: Math.min(100, Page.Layout.window_height / 10)});
		
		Page.Animate.change_opacity = Page.Animate.change_opacity_css;
		Page.Animate.change_scale = Page.Animate.change_scale_css;
		Page.Animate.fade_left = Page.Animate.fade_left_css;
		Page.Animate.show_fade_up_section = Page.Animate.show_fade_up_section_css;
		Page.Animate.show_zoom_out_section = Page.Animate.show_zoom_out_section_css;
	}
	
	
	
	Page.Layout.window_width = window.innerWidth;
	Page.Layout.window_height = window.innerHeight;
	Page.Layout.aspect_ratio = Page.Layout.window_width / Page.Layout.window_height;
	
	window.addEventListener("scroll", () =>
	{
		Page.Banner.on_scroll(0);
		
		window.requestAnimationFrame(Page.Load.AOS.on_scroll);
	});
	
	window.addEventListener("resize", () =>
	{
		window.requestAnimationFrame(Page.Load.AOS.on_resize);
		
		Page.Layout.on_resize();
	});
	
	Page.Load.AOS.on_resize();
	
	
	
	setInterval(() =>
	{
		window.dispatchEvent(new Event("resize"));
	}, 5000);
	
	
	
	Browser.detect();
	
	
	
	Site.Interaction.set_up_listeners();
	
	
	
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
		
		Page.element.querySelectorAll("body *").forEach(element => element.setAttribute("draggable", "false"));
		
		
		
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
		
		Page.Navigation.redirect(event.state.url, false, true, true);
	});
	
	
	
	if ("serviceWorker" in navigator)
	{
		window.addEventListener("load", () =>
		{
			navigator.serviceWorker.register("/service-worker.js");
		});
	}
	
	
	
	Page.Banner.ScrollButton.exists = false;
	
	
	
	Site.Settings.set_up();
	
	
	
	Page.Images.check_webp_support()
	
	.then(() =>
	{
		Page.Footer.Floating.load();
		
		
		
		//If it's not an html file, it shouldn't be anywhere near redirect().
		if (url.substring(url.lastIndexOf(".") + 1, url.length) !== "html")
		{
			//This should really be using history.replaceState(), but that doesn't update the page to make the file show for some reason.
			window.location.href = url;
		}
		
		else
		{
			Page.Navigation.redirect(url, false, true, false, true);
		}
	});
};



//Loads a script with the given source and returns a promise for when it completes.
Site.load_script = function(src, is_module = false)
{
	return new Promise((resolve, reject) =>
	{
		let script = document.createElement("script");
		
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
};



//Adds a style tag to <head> with the given content. If temporary is true, it will be removed at the next page load. Returns the style element added.
Site.add_style = function(content, temporary = true, at_beginning_of_head = false)
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
};



Site.Fetch =
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
};



Site.Interaction =
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
		const bound_function = this.handle_touch_event.bind(this);
		
		document.documentElement.addEventListener("touchstart", bound_function, false);
		document.documentElement.addEventListener("touchmove", bound_function, false);



		document.documentElement.addEventListener("mousemove", () =>
		{
			if (this.currently_touch_device)
			{
				const time_between_mousemoves = Date.now() - this.last_mousemove_event;
				
				this.last_mousemove_event = Date.now();
				
				//Checking if it's >= 3 kinda sucks, but it seems like touch devices like to fire two mousemoves in quick succession sometimes. They also like to make that delay exactly 33. Look, I hate this too, but it needs to be here.
				if (time_between_mousemoves >= 3 && time_between_mousemoves <= 50 && time_between_mousemoves !== 33)
				{
					this.currently_touch_device = false;
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
};