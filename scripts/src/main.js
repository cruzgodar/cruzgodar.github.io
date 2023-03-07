"use strict";



let DEBUG = false;


Page.element = null;
Page.last_element = null;

Page.ready_to_show = false;


Page.scroll = 0;

/*
	Defaults:
	
	"banner_page": false,
	"num_banners": 0,
	
	"manual_dark_theme": false,
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



Site.use_js_animation = false;

Site.base_animation_time = 250;

Site.navigation_animation_distance_vertical = Math.min(window.innerHeight / 20, 25);
Site.navigation_animation_distance_horizontal = Math.min(window.innerWidth / 20, 25);
	
	

Site.applet_process_id = 0;



let DESMOS_PURPLE = "#772fbf";
let DESMOS_BLUE = "#2f77bf";
let DESMOS_RED = "#bf2f2f";
let DESMOS_GREEN = "#2fbf2f";
let DESMOS_BLACK = "#000000";

/*
//Dark theme versions
DESMOS_PURPLE = "#60c000";
DESMOS_BLUE = "#c06000";
DESMOS_RED = "#00c0c0";
DESMOS_GREEN = "#c000c0";
DESMOS_BLACK = "#000000";
*/

	
	
//Redirects to the chosen page and sets up all the miscellaneous things that make the site work.
Site.load = async function(url)
{
	Page.element = document.createElement("div");
	
	Page.element.classList.add("page");
	
	document.body.insertBefore(Page.element, document.body.firstChild);
	
	
	
	const browser_is_ios = Browser.is_ios();
	
	Site.use_js_animation = browser_is_ios;
	
	
	
	if (Site.use_js_animation)
	{
		if (DEBUG)
		{
			console.log("Using JS animation");
		}
		
		this.button_animation_time = this.base_animation_time * .5;
		this.opacity_animation_time = this.base_animation_time * .8;
		this.page_animation_time = this.base_animation_time * .6;
		this.background_color_animation_time = this.base_animation_time * 2;
		
		Page.Animate.change_opacity = Page.Animate.change_opacity_js;
		Page.Animate.change_scale = Page.Animate.change_scale_js;
		Page.Animate.fade_left = Page.Animate.fade_left_js;
		
		Page.Animate.change_left_settings_button = Page.Animate.change_left_settings_button_js;
		Page.Animate.change_right_settings_button = Page.Animate.change_right_settings_button_js;
		
		Page.Animate.show_slide_shelf = Page.Animate.show_slide_shelf_js;
		Page.Animate.hide_slide_shelf = Page.Animate.hide_slide_shelf_js;
		
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
		
		Page.Animate.change_left_settings_button = Page.Animate.change_left_settings_button_css;
		Page.Animate.change_right_settings_button = Page.Animate.change_right_settings_button_css;
		
		Page.Animate.show_slide_shelf = Page.Animate.show_slide_shelf_js;
		Page.Animate.hide_slide_shelf = Page.Animate.hide_slide_shelf_js;
		
		Page.Animate.change_footer_image_link_text = Page.Animate.change_footer_image_link_text_css;
		
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
	
	
	
	Page.Layout.aspect_ratio = window.innerWidth / window.innerHeight;
	
	window.addEventListener("scroll", () =>
	{
		Page.Banner.on_scroll(0);
		
		window.requestAnimationFrame(Page.Load.lazy_load_scroll);
	});
	
	window.addEventListener("resize", () =>
	{
		Page.Layout.on_resize();
	});
	
	
	
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
	
	Page.Load.add_header();
	
	
	
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
};



//Loads a style with the given href.
Site.load_style = function(href)
{
	const style = document.createElement("link");
	
	style.setAttribute("rel", "stylesheet");
	style.setAttribute("type", "text/css");
	
	document.head.appendChild(style);
	
	style.setAttribute("href", href);
	
	return style;
};



//Adds a style tag to <head> with the given content. If temporary is true, it will be removed at the next page load. Returns the style element added.
Site.add_style = function(content, temporary = true, at_beginning_of_head = false)
{
	const element = document.createElement("style");
	
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