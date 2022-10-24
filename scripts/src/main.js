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



Site.visted_homepage = false;



Site.scripts_loaded =
{
	"mathjax": false,
	"complexjs": false,
	"three": false,
	"lodash": false,
	"desmos": false,
	"glsl": 0
};



Site.page_lists =
{
	"/teaching/uo/251/notes":
	[
		"/teaching/uo/251/",
		
		"/teaching/uo/251/notes/0-algebra-and-trig-review/",
		"/teaching/uo/251/notes/1-intro-to-limits/",
		"/teaching/uo/251/notes/2-limit-rules/",
		"/teaching/uo/251/notes/3-continuity/",
		"/teaching/uo/251/notes/4-intro-to-derivatives/",
		"/teaching/uo/251/notes/5-derivative-rules/",
		"/teaching/uo/251/notes/6-applications-of-derivatives/",
		"/teaching/uo/251/notes/7-exp-log-and-trig-derivatives/",
		"/teaching/uo/251/notes/8-the-chain-rule/",
		"/teaching/uo/251/notes/9-the-inverse-function-theorem/",
		"/teaching/uo/251/notes/10-implicit-differentiation/",
		"/teaching/uo/251/notes/11-optimization/",
		"/teaching/uo/251/notes/12-l-hopitals-rule/",
		"/teaching/uo/251/notes/13-related-rates/",
		"/teaching/uo/251/notes/14-applied-optimization/",
		"/teaching/uo/251/notes/15-newtons-method/"
	],
	
	"/teaching/uo/252/notes":
	[
		"/teaching/uo/252/",
		
		"/teaching/uo/252/notes/0-calc-1-review/",
		"/teaching/uo/252/notes/1-riemann-sums/",
		"/teaching/uo/252/notes/2-integrals-intro/",
		"/teaching/uo/252/notes/3-antiderivatives/",
		"/teaching/uo/252/notes/4-ftoc/",
		"/teaching/uo/252/notes/5-simple-applications/",
		"/teaching/uo/252/notes/6-u-sub/",
		"/teaching/uo/252/notes/7-exp-and-log-integrals/",
		"/teaching/uo/252/notes/8-area-between-curves/",
		"/teaching/uo/252/notes/9-solids-of-revolution/",
		"/teaching/uo/252/notes/10-arc-length-and-surface-area/",
		"/teaching/uo/252/notes/11-physical-applications/",
		"/teaching/uo/252/notes/12-integration-by-parts/",
		"/teaching/uo/252/notes/13-trig-sub/",
		"/teaching/uo/252/notes/14-partial-fractions/",
		"/teaching/uo/252/notes/15-improper-integrals/",
		"/teaching/uo/252/notes/16-intro-to-des/"
	],
	
	"/teaching/uo/253/notes":
	[
		"/teaching/uo/253/",
		
		"/teaching/uo/253/notes/0-calc-2-review/",
		"/teaching/uo/253/notes/1-sequences/",
		"/teaching/uo/253/notes/2-series/",
		"/teaching/uo/253/notes/3-divergence-and-integral-tests/",
		"/teaching/uo/253/notes/4-comparison-tests/",
		"/teaching/uo/253/notes/5-alternating-series/",
		"/teaching/uo/253/notes/6-ratio-and-root-tests/",
		"/teaching/uo/253/notes/7-power-series/",
		"/teaching/uo/253/notes/8-properties-of-power-series/",
		"/teaching/uo/253/notes/9-taylor-series/",
		"/teaching/uo/253/notes/10-applications-of-taylor-series/",
		"/teaching/uo/253/notes/11-generating-functions/"
	],
	
	"/projects/wilson/guide":
	[
		"/projects/wilson/",
		
		"/projects/wilson/guide/1-getting-started/",
		"/projects/wilson/guide/2-draggables/",
		"/projects/wilson/guide/3-parallelizing/",
		"/projects/wilson/guide/4-hidden-canvases/",
		"/projects/wilson/guide/5-fullscreen/",
		"/projects/wilson/guide/6-interactivity/"
	],
	
	"/writing/caligo":
	[
		"/writing/caligo/",
		
		"/writing/caligo/chapters/p/",
		"/writing/caligo/chapters/1/",
		"/writing/caligo/chapters/2/",
		"/writing/caligo/chapters/3/",
		"/writing/caligo/chapters/4/",
		"/writing/caligo/chapters/5/",
		"/writing/caligo/chapters/6/",
		"/writing/caligo/chapters/7/",
		"/writing/caligo/chapters/8/",
		"/writing/caligo/chapters/9/",
		"/writing/caligo/chapters/10/",
		"/writing/caligo/chapters/i1/",
		"/writing/caligo/chapters/11/",
		"/writing/caligo/chapters/12/",
		"/writing/caligo/chapters/13/",
		"/writing/caligo/chapters/14/",
		"/writing/caligo/chapters/15/",
		"/writing/caligo/chapters/16/",
		"/writing/caligo/chapters/17/",
		"/writing/caligo/chapters/18/",
		"/writing/caligo/chapters/19/",
		"/writing/caligo/chapters/20/",
		"/writing/caligo/chapters/21/",
		"/writing/caligo/chapters/22/",
		"/writing/caligo/chapters/23/",
		"/writing/caligo/chapters/24/",
		"/writing/caligo/chapters/i2/",
		"/writing/caligo/chapters/25/",
		"/writing/caligo/chapters/26/",
		"/writing/caligo/chapters/27/",
		"/writing/caligo/chapters/28/",
		"/writing/caligo/chapters/29/",
		"/writing/caligo/chapters/30/",
		"/writing/caligo/chapters/31/",
		"/writing/caligo/chapters/32/",
		"/writing/caligo/chapters/33/",
		"/writing/caligo/chapters/34/",
		"/writing/caligo/chapters/i3/",
		"/writing/caligo/chapters/35/",
		"/writing/caligo/chapters/36/",
		"/writing/caligo/chapters/37/",
		"/writing/caligo/chapters/38/",
		"/writing/caligo/chapters/39/",
		"/writing/caligo/chapters/40/",
		"/writing/caligo/chapters/41/",
		"/writing/caligo/chapters/42/",
		"/writing/caligo/chapters/43/",
		"/writing/caligo/chapters/44/",
		"/writing/caligo/chapters/45/",
		"/writing/caligo/chapters/46/"
	]
};



Site.use_js_animation = false;

Site.base_animation_time = 250;

Site.navigation_animation_distance = 50;
	
	

Site.applet_process_id = 0;



const DESMOS_PURPLE = "#6600cc";
const DESMOS_BLUE = "#0087cc";
const DESMOS_RED = "#cc0000";
const DESMOS_BLACK = "#000000";
	
	
//Redirects to the chosen page and sets up all the miscellaneous things that make the site work.
Site.load = async function(url)
{
	Page.element = document.createElement("div");
	
	Page.element.classList.add("page");
	
	document.body.insertBefore(Page.element, document.body.firstChild);
	
	
	
	const browser_is_ios = Browser.is_ios();
	
	
	
	//Extremely gross, but I cannot find a better way to deal with the difference between the appearance of box shadows in WebKit vs Chrome.
	
	Site.add_style(`
		.image-link img, .footer-image-link img
		{
			box-shadow: 0px 0px 30px 0px rgba(0, 0, 0, .11);
		}

		.image-link-light img
		{
			box-shadow: 0px 0px 30px 0px rgba(0, 0, 0, .16);
		}
	`, false);
	
	Site.use_js_animation = browser_is_ios;
	
	
	
	if (Site.use_js_animation)
	{
		console.log("Using JS animation");
		
		this.button_animation_time = this.base_animation_time * .5;
		this.opacity_animation_time = this.base_animation_time * .8;
		this.page_animation_time = this.base_animation_time * .6;
		this.background_color_animation_time = this.base_animation_time * 2;
		
		Page.Animate.change_opacity = Page.Animate.change_opacity_js;
		Page.Animate.change_scale = Page.Animate.change_scale_js;
		Page.Animate.fade_left = Page.Animate.fade_left_js;
		
		Page.Animate.change_left_settings_button = Page.Animate.change_left_settings_button_js;
		Page.Animate.change_right_settings_button = Page.Animate.change_right_settings_button_js;
		
		Page.Animate.change_footer_image_link_text = Page.Animate.change_footer_image_link_text_js;
		
		Page.Animate.fade_up_in = Page.Animate.fade_up_in_js;
		Page.Animate.fade_up_out = Page.Animate.fade_up_out_js;
		Page.Animate.fade_down_in = Page.Animate.fade_down_in_js;
		Page.Animate.fade_down_out = Page.Animate.fade_down_out_js;
		Page.Animate.fade_left_in = Page.Animate.fade_left_in_js;
		Page.Animate.fade_left_out = Page.Animate.fade_left_out_js;
		Page.Animate.fade_right_in = Page.Animate.fade_right_in_js;
		Page.Animate.fade_right_out = Page.Animate.fade_right_out_js;
		Page.Animate.fade_in = Page.Animate.fade_in_js;
		Page.Animate.fade_out = Page.Animate.fade_out_js;
		
		Page.Animate.show_fade_up_section = Page.Animate.show_fade_up_section_js;
		Page.Animate.show_zoom_out_section = Page.Animate.show_zoom_out_section_js;
	}
	
	else
	{
		this.button_animation_time = this.base_animation_time * .45;
		this.opacity_animation_time = this.base_animation_time * .75;
		this.page_animation_time = this.base_animation_time * .6;
		this.background_color_animation_time = this.base_animation_time * 2;
		
		Page.Animate.change_opacity = Page.Animate.change_opacity_css;
		Page.Animate.change_scale = Page.Animate.change_scale_css;
		Page.Animate.fade_left = Page.Animate.fade_left_css;
		
		Page.Animate.change_footer_image_link_text = Page.Animate.change_footer_image_link_text_css;
		
		Page.Animate.change_left_settings_button = Page.Animate.change_left_settings_button_css;
		Page.Animate.change_right_settings_button = Page.Animate.change_right_settings_button_css;
		
		Page.Animate.fade_up_in = Page.Animate.fade_up_in_css;
		Page.Animate.fade_up_out = Page.Animate.fade_up_out_css;
		Page.Animate.fade_down_in = Page.Animate.fade_down_in_css;
		Page.Animate.fade_down_out = Page.Animate.fade_down_out_css;
		Page.Animate.fade_left_in = Page.Animate.fade_left_in_css;
		Page.Animate.fade_left_out = Page.Animate.fade_left_out_css;
		Page.Animate.fade_right_in = Page.Animate.fade_right_in_css;
		Page.Animate.fade_right_out = Page.Animate.fade_right_out_css;
		Page.Animate.fade_in = Page.Animate.fade_in_css;
		Page.Animate.fade_out = Page.Animate.fade_out_css;
		
		Page.Animate.show_fade_up_section = Page.Animate.show_fade_up_section_css;
		Page.Animate.show_zoom_out_section = Page.Animate.show_zoom_out_section_css;
	}
	
	
	
	Page.Layout.window_width = window.innerWidth;
	Page.Layout.window_height = window.innerHeight;
	Page.Layout.aspect_ratio = Page.Layout.window_width / Page.Layout.window_height;
	
	window.addEventListener("scroll", () =>
	{
		Page.Banner.on_scroll(0);
		
		window.requestAnimationFrame(Page.Load.lazy_load_scroll);
	});
	
	window.addEventListener("resize", () =>
	{
		Page.Layout.on_resize();
	});
	
	
	
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
		
		Page.Navigation.redirect(e.state.url, false, true, true);
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
	
	
	
	await Page.Images.check_webp_support();
	
	
	
	Page.Footer.Floating.load();
	
	
	
	//If it's not an html file, it shouldn't be anywhere near redirect().
	if (url.indexOf(".") !== -1)
	{
		//This should really be using history.replaceState(), but that doesn't update the page to make the file show for some reason.
		window.location.href = url;
	}
	
	else
	{
		Page.Navigation.redirect(url, false, true, false, true);
	}
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
			if (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA" && document.activeElement.tagName !== "SELECT")
			{
				document.activeElement.blur();
			}
			
			else if (document.activeElement.tagName !== "SELECT")
			{
				try {element.previousElementSibling.classList.remove("hover");}
				catch(ex) {}
			}
		});
	},
	
	
	
	handle_touch_event: function(e)
	{
		this.last_touch_x = e.touches[0].clientX;
		this.last_touch_y = e.touches[0].clientY;
		
		if (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA" && document.activeElement.tagName !== "SELECT")
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