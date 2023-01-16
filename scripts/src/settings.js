"use strict";



Site.force_dark_theme_pages =
[
	"/gallery/"
];



Site.Settings =
{
	url_vars: {},
	
	texts:
	{
		"theme": ["Theme: light", "Theme: dark"],
		"content_animation": ["Animation: enabled", "Animation: disabled"],
		"condensed_applets": ["Applets: normal", "Applets: condensed"]
	},
	
	dark_theme_background_color: "rgb(24, 24, 24)",
	dark_theme_background_color_rgba: "rgba(24, 24, 24, ",
	
	gradient_suffix: "-0-0",
	
	//Set to either 0 or 1 if a page has forced a theme and it needs to change back.
	revert_theme: -1,
	forced_theme: false,
	
	
	
	get_url_var: function(id)
	{
		const query = window.location.search.substring(1);
		const vars = query.split("&");
		
		for (let i = 0; i < vars.length; i++)
		{
			let pair = vars[i].split("=");
			
			if (pair[0] === id)
			{
				return pair[1];
			}
		}
		
		return null;
	},
	
	
	
	set_up: function()
	{
		this.url_vars =
		{
			"theme": this.get_url_var("theme"),
			"content_animation": this.get_url_var("content_animation"),
			"condensed_applets": this.get_url_var("condensed_applets")
		};
		
		
		
		window.matchMedia("(prefers-color-scheme: dark)").addListener((e) =>
		{
			if (this.revert_theme !== -1)
			{
				return;
			}
			
			
			
			if ((e.matches && this.url_vars["theme"] !== 1) || (!e.matches && this.url_vars["theme"] === 1))
			{
				this.toggle_theme();
			}
		});

		if (window.matchMedia("(prefers-color-scheme: dark)").matches && this.url_vars["theme"] === null)
		{
			this.url_vars["theme"] = 1;
		}
		
		
		
		for (let key in this.url_vars)
		{
			//These are double equals, and that's important, but I can't quite see why. Obviously the url vars are stored as strings and I just didn't realize that when I first coded this, but this bit of code has refused to cooperate with any modifications I make. Who knows.
			if (this.url_vars[key] == null)
			{
				this.url_vars[key] = 0;
			}
			
			else if (this.url_vars[key] == 1)
			{
				if (key === "condensed_applets")
				{
					this.url_vars[key] = 1;
				}
				
				else
				{
					this.url_vars[key] = 0;
					this.toggle(key, true);
				}	
			}
		}
		
		
		
		//This prevents things from flickering when we first load the site.
		
		let element = null;
		
		if (this.url_vars["theme"] === 1)
		{
			element = Site.add_style(this.get_settings_style("dark"), false);
		}
		
		try {document.querySelector("#theme-contrast-adjust").remove();}
		catch(ex) {}
		
		try {element.id = "theme-contrast-adjust";}
		catch(ex) {}
	},
	
	
	
	meta_theme_color_element: document.querySelector("#theme-color-meta"),
	
	
	
	handle_theme_revert: function()
	{
		if (Site.Settings.forced_theme)
		{
			Site.Settings.forced_theme = false;
			return;
		}
		
		
		
		if (this.url_vars["content_animation"] === 1)
		{
			if (this.revert_theme === 0)
			{
				this.revert_theme = -1;
				
				this.url_vars["dark_theme_color"] = 1;
				
				this.toggle("theme", true, true);
			}
			
			else if (Site.Settings.revert_theme === 1)
			{
				this.revert_theme = -1;
				
				this.toggle("theme", true, true);
			}
		}
		
		else
		{
			if (this.revert_theme === 0)
			{
				this.revert_theme = -1;
				
				this.url_vars["dark_theme_color"] = 1;
				
				this.toggle("theme", false, true);
			}
			
			else if (Site.Settings.revert_theme === 1)
			{
				this.revert_theme = -1;
				
				this.toggle("theme", false, true);
			}
		}
	},
	


	//Changes a setting.
	toggle: function(setting, no_animation = false, no_settings_text = false)
	{
		let element = null;
		
		if (no_animation === false && (setting === "theme" || setting === "dark_theme_color" || setting === "contrast"))
		{
			element = Site.add_style(`
				html, #header
				{
					transition: background-color ${Site.opacity_animation_time * 2 / 1000}s ease !important;
				}
				
				p, span, h1, h2, a, q, em, strong, dfn
				{
					transition: color ${Site.opacity_animation_time * 2 / 1000}s ease !important;
				}
				
				 .text-box, .text-field, .checkbox-container, .checkbox-container > input ~ .checkbox, .radio-button-container, .radio-button-container > input ~ .radio-button, .loading-spinner:after, #floating-footer-content, #floating-footer-button-background, .footer-button, .text-button, .nav-button, .slider-container > input
				{
					transition: background-color ${Site.opacity_animation_time * 2 / 1000}s ease, border-color ${Site.opacity_animation_time * 2 / 1000}s ease, color ${Site.opacity_animation_time * 2 / 1000}s ease !important;
				}
				
				.line-break
				{
					transition: ${Site.opacity_animation_time * 2 / 1000}s ease !important;
				}
			`);
		}
		
		
		
		if (setting === "theme")
		{
			if (this.url_vars["theme"] === 1)
			{
				this.toggle_theme(no_settings_text);
				
				if (!no_animation)
				{
					anime({
						targets: this.meta_theme_color_element,
						content: "#ffffff",
						duration: 500,
						easing: "cubicBezier(.42, 0, .58, 1)"
					});
				}
				
				else
				{
					this.meta_theme_color_element.setAttribute("content", "rgb(255, 255, 255)");
				}
			}
			
			else
			{
				this.toggle_theme(no_settings_text);
				
				if (!no_animation)
				{
					anime({
						targets: this.meta_theme_color_element,
						content: "#161616",
						duration: 500,
						easing: "cubicBezier(.42, 0, .58, 1)"
					});
				}
				
				else
				{
					this.meta_theme_color_element.setAttribute("content", "rgb(24, 24, 24)");
				}
			}
		}
		
		else if (setting === "content_animation")
		{
			this.toggle_content_animation(no_settings_text);
		}
		
		else if (setting === "condensed_applets")
		{
			
		}
		
		else
		{
			console.log("Unknown setting");
		}
		
		
		
		Page.Navigation.write_url_vars();
		
		
		
		if (!no_animation && setting === "theme")
		{
			setTimeout(() =>
			{
				element.remove();
			}, Site.opacity_animation_time * 2);
		}
	},



	//Changes the theme and animates elements.
	toggle_theme: function(no_settings_text)
	{
		//Light to dark
		if (this.url_vars["theme"] === 0)
		{
			if (!("manual_dark_theme" in Page.settings && Page.settings["manual_dark_theme"]))
			{
				if (this.url_vars["dark_theme_color"] !== 1)
				{
					document.documentElement.style.backgroundColor = "rgb(24, 24, 24)";
				}
				
				else
				{
					document.documentElement.style.backgroundColor = "rgb(0, 0, 0)";
				}
			}
			
			
			
			if (this.url_vars["contrast"] === 1)
			{
				if (!Page.settings["manual_dark_theme"])
				{
					this.animate_theme_contrast("dark_contrast");
				}
				
				
				
				setTimeout(() =>
				{
					const element = Site.add_style(this.get_settings_style("dark_contrast"), false);
					
					try {document.querySelector("#theme-contrast-adjust").remove();}
					catch(ex) {}
					
					try {element.id = "theme-contrast-adjust";}
					catch(ex) {}
					
					this.clear_weird_inline_styles();
				}, Site.opacity_animation_time * 2);
			}
			
			
			
			else
			{
				if (!("manual_dark_theme" in Page.settings && Page.settings["manual_dark_theme"]))
				{
					this.animate_theme_contrast("dark");
				}
				
				
				
				setTimeout(() =>
				{
					const element = Site.add_style(this.get_settings_style("dark"), false);
					
					try {document.querySelector("#theme-contrast-adjust").remove();}
					catch(ex) {}
					
					try {element.id = "theme-contrast-adjust";}
					catch(ex) {}
					
					this.clear_weird_inline_styles();
				}, Site.opacity_animation_time * 2);
			}
			
			
			
			this.url_vars["theme"] = 1;
		}
		
		
		
		//Dark to light
		else
		{
			if (!("manual_dark_theme" in Page.settings && Page.settings["manual_dark_theme"]))
			{
				document.documentElement.style.backgroundColor = "rgb(255, 255, 255)";
			}
			
			
			
			if (this.url_vars["contrast"] === 1)
			{
				if (!Page.settings["manual_dark_theme"])
				{
					this.animate_theme_contrast("contrast");
				}
				
				
				
				setTimeout(() =>
				{
					const element = Site.add_style(this.get_settings_style("contrast"), false);
					
					try {document.querySelector("#theme-contrast-adjust").remove();}
					catch(ex) {}
					
					try {element.id = "theme-contrast-adjust";}
					catch(ex) {}
					
					this.clear_weird_inline_styles();
				}, Site.opacity_animation_time * 2);
			}
			
			
			
			else
			{
				if (!("manual_dark_theme" in Page.settings && Page.settings["manual_dark_theme"]))
				{
					this.animate_theme_contrast("");
				}
				
				
				
				setTimeout(() =>
				{
					try {document.querySelector("#theme-contrast-adjust").remove();}
					catch(ex) {}
					
					this.clear_weird_inline_styles();
				}, Site.opacity_animation_time * 2);
			}
			
			
			
			this.url_vars["theme"] = 0;
		}
	},



	toggle_content_animation: function(no_settings_text)
	{
		if (this.url_vars["content_animation"] === 0)
		{
			if (!no_settings_text)
			{
				try {Page.Footer.Floating.show_settings_text("Animation: disabled");}
		 		catch(ex) {}
		 	}
			
			this.url_vars["content_animation"] = 1;
			
			Site.button_animation_time = 0;
			Site.opacity_animation_time = 0;
			Site.page_animation_time = 0;
			Site.background_color_animation_time = 0;
		}
		
		
		
		else
		{
			if (!no_settings_text)
			{
				try {Page.Footer.Floating.show_settings_text("Animation: enabled");}
		 		catch(ex) {}
		 	}
			
			this.url_vars["content_animation"] = 0;
			
			if (Site.use_js_animation)
			{
				Site.button_animation_time = Site.base_animation_time * .5;
				Site.opacity_animation_time = Site.base_animation_time * .8;
				Site.page_animation_time = Site.base_animation_time * .6;
				Site.background_color_animation_time = Site.base_animation_time * 2;
			}
			
			else
			{
				Site.button_animation_time = Site.base_animation_time * .45;
				Site.opacity_animation_time = Site.base_animation_time * .75;
				Site.page_animation_time = Site.base_animation_time * .6;
				Site.background_color_animation_time = Site.base_animation_time * 2;
			}
		}
	},



	set_img_button_contrast: function()
	{
		Page.element.querySelectorAll(".scroll-button").forEach(element => element.setAttribute("src", element.getAttribute("src").replace("chevron-left", "chevron-left-dark").replace("chevron-right", "chevron-right-dark").replace("chevron-down", "chevron-down-dark")));
	},



	set_writing_page_font: function()
	{
		Page.set_element_styles(".body-text, .heading-text", "font-family", "'Gentium Book Basic', serif");
	},



	reduce_page_margins: function()
	{
		try {document.querySelector("#ultrawide-margin-adjust").remove();}
		catch(ex) {}
		
		
		
		//When in ultrawide mode, shrink the margins to 50%.
		if (Page.Layout.layout_string === "ultrawide")
		{
			const element = Site.add_style(`
				.body-text, .nav-buttons
				{
					width: 50vw;
				}
				
				.line-break
				{
					width: 50vw;
					left: 25vw;
				}
				
				.body-text.narrow
				{
					width: 40vw;
				}
				
				pre code
				{
					width: calc(50vw - 24px);
				}
			`);
			
			element.id = "ultrawide-margin-adjust";
		}	
	},
	
	
	
	condense_applet: function()
	{
		Site.add_style(`
			p:not(.text-box-subtext, .checkbox-subtext, .radio-button-subtext, .slider-subtext), h1, h2, header, footer, br
			{
				display: none;
			}
			
			section:first-of-type
			{
				margin-top: 0 !important;
				margin-bottom: 0 !important;
			}
			
			body
			{
				margin-top: -5vh;
			}

			#canvas-landscape
			{
				flex-direction: column !important;
			}

			#canvas-landscape-left, #canvas-landscape-middle, #canvas-landscape-right
			{
				width: 80% !important;
			}
		`);
		
		try {Page.element.querySelector("#download-button").parentNode.parentNode.style.display = "none"}
		catch(ex) {}
	},



	animate_theme_contrast: function(settings)
	{
		let new_gradient_suffix = "-0-0";
		
		if (settings === "")
		{
			try
			{
				document.querySelector("#header-theme-button").classList.remove("active");
				
				document.querySelector("#header").style.backgroundColor = "rgb(255, 255, 255)";
				
				document.querySelectorAll("#header-logo span, #header-links a").forEach(element => element.style.color = "rgb(64, 64, 64)");
			}
			
			catch(ex) {}
			
			
			
			Page.set_element_styles(".heading-text, .date-text, .title-text", "color", "rgb(0, 0, 0)");
			
			Page.set_element_styles(".section-text", "color", "rgb(48, 48, 48)");
			
			Page.set_element_styles(".body-text, .body-text span, .song-lyrics, .image-link-subtext, .floating-settings-button-text", "color", "rgb(96, 96, 96)");
			
			Page.set_element_styles(".body-text .link", "color", "rgb(96, 144, 96)");
			
			
			
			Page.set_element_styles(".quote-text q", "color", "rgb(96, 96, 96)");
			
			Page.set_element_styles(".quote-attribution", "color", "rgb(48, 48, 48)");
			
			
			
			Page.set_element_styles(".text-box", "background-color", "rgb(255, 255, 255)");
			
			Page.set_element_styles(".text-box", "color", "rgb(96, 96, 96)");
			
			Page.set_element_styles(".text-box", "border-color", "rgb(192, 192, 192)");
			
			
			
			Page.set_element_styles(".text-field", "background-color", "rgb(255, 255, 255)");
			
			Page.set_element_styles(".text-field", "color", "rgb(96, 96, 96)");
			
			Page.set_element_styles(".text-field", "border-color", "rgb(192, 192, 192)");
			
			
			
			Page.set_element_styles(".checkbox-container > input ~ .checkbox", "background-color", "rgb(255, 255, 255)");
			
			Page.set_element_styles(".checkbox-container > input:checked ~ .checkbox", "background-color", "rgb(96, 96, 96)");
			
			
			
			Page.set_element_styles(".radio-button-container > input ~ .radio-button", "background-color", "rgb(255, 255, 255)");
			
			Page.set_element_styles(".radio-button-container > input:checked ~ .radio-button", "background-color", "rgb(96, 96, 96)");
			
			
			
			try {document.querySelector("#slider-style").remove();}
			catch(ex) {}
			
			
			
			Page.set_element_styles("#floating-footer-content, #floating-footer-button-background", "background-color", "rgb(255, 255, 255)");
			
			
			
			Page.set_element_styles(".footer-button, .text-button, .nav-button, .checkbox-container, #output-canvas", "border-color", "rgb(127, 127, 127)");
			
			
			
			Page.set_element_styles(".iframe-clipper", "border-color", "rgb(255, 255, 255)");
		}
		
		
		
		else if (settings === "dark")
		{
			try
			{
				document.querySelector("#header-theme-button").classList.add("active");
				
				document.querySelector("#header").style.backgroundColor = "rgb(24, 24, 24)";
				
				document.querySelectorAll("#header-logo:not(.hover) span, #header-links a:not(.hover)").forEach(element => element.style.color = "rgb(192, 192, 192)");
			}
			
			catch(ex) {}
			
			
			
			Page.set_element_styles(".heading-text, .date-text, .title-text", "color", "rgb(255, 255, 255)");
			
			Page.set_element_styles(".section-text", "color", "rgb(232, 232, 232)");
			
			Page.set_element_styles(".body-text, .body-text span, .song-lyrics, .image-link-subtext, .floating-settings-button-text", "color", "rgb(184, 184, 184)");
			
			Page.set_element_styles(".body-text .link", "color", "rgb(184, 255, 184)");
			
			
			
			Page.set_element_styles(".quote-text q", "color", "rgb(184, 184, 184)");
			
			Page.set_element_styles(".quote-attribution", "color", "rgb(232, 232, 232)");
			
			
			
			Page.set_element_styles(".text-box", "background-color", this.dark_theme_background_color);
			
			Page.set_element_styles(".text-box", "color", "rgb(184, 184, 184)");
			
			Page.set_element_styles(".text-box", "border-color", "rgb(88, 88, 88)");
			
			
			
			Page.set_element_styles(".text-field", "background-color", this.dark_theme_background_color);
			
			Page.set_element_styles(".text-field", "color", "rgb(184, 184, 184)");
			
			Page.set_element_styles(".text-field", "border-color", "rgb(88, 88, 88)");
			
			
			
			Page.set_element_styles(".checkbox-container > input ~ .checkbox", "background-color", this.dark_theme_background_color);
			
			Page.set_element_styles(".checkbox-container > input:checked ~ .checkbox", "background-color", "rgb(184, 184, 184)");
			
			
			
			Page.set_element_styles(".radio-button-container > input ~ .radio-button", "background-color", this.dark_theme_background_color);
			
			Page.set_element_styles(".radio-button-container > input:checked ~ .radio-button", "background-color", "rgb(184, 184, 184)");
			
			
			
			Page.set_element_styles(".iframe-clipper", "border-color", this.dark_theme_background_color);
			
			
			
			const element = Site.add_style(`
				.slider-container > input
				{
					background-color: rgb(80, 80, 80) !important;
				}

				.slider-container > input::-webkit-slider-thumb
				{
					background-color: rgb(127, 127, 127) !important;
				}

				.slider-container > input::-moz-slider-thumb
				{
					background-color: rgb(127, 127, 127) !important;
				}

				.slider-container > input:active
				{
					background-color: rgb(144, 144, 144) !important;
				}

				.slider-container > input:hover::-webkit-slider-thumb
				{
					background-color: rgb(168, 168, 168) !important;
				}

				.slider-container > input:hover::-moz-slider-thumb
				{
					background-color: rgb(168, 168, 168) !important;
				}

				.slider-container > input:active::-webkit-slider-thumb
				{
					background-color: rgb(216, 216, 216) !important;
				}

				.slider-container > input:active::-moz-slider-thumb
				{
					background-color: rgb(216, 216, 216) !important;
				}
			`, false);
			
			try {document.querySelector("#slider-style").remove();}
			catch(ex) {}
			
			try {element.id = "slider-style";}
			catch(ex) {}
				
			
			
			
			Page.set_element_styles("#floating-footer-content, #floating-footer-button-background", "background-color", this.dark_theme_background_color);
			
			
			
			Page.set_element_styles(".footer-button, .text-button, .nav-button, #output-canvas", "border-color", "rgb(152, 152, 152)");
			
			
			
			new_gradient_suffix = `-1-0`;
		}
		
		//These elements have properties that cannot be animated. To get around this, every elemnt has 6 copies of itself -- one for each combination of theme and contrast. Here, we animate the new one in and the old one out.
		Page.set_element_styles(`.line-break${this.gradient_suffix}`, "opacity", 0);
		Page.set_element_styles(`.line-break${new_gradient_suffix}`, "opacity", 1);
		
		this.gradient_suffix = new_gradient_suffix;
	},



	clear_weird_inline_styles: function()
	{
		Page.set_element_styles(".checkbox-container > input ~ .checkbox", "background-color", "");
			
		Page.set_element_styles(".checkbox-container > input:checked ~ .checkbox", "background-color", "");
		
		
		
		Page.set_element_styles(".radio-button-container > input ~ .radio-button", "background-color", "");
			
		Page.set_element_styles(".radio-button-container > input:checked ~ .radio-button", "background-color", "");
		
		
		
		Page.set_element_styles(".text-box", "background-color", "");
		
		Page.set_element_styles(".text-box", "color", "");
		
		Page.set_element_styles(".text-box", "border-color", "");
		
		
		
		Page.set_element_styles(".text-field", "background-color", "");
		
		Page.set_element_styles(".text-field", "color", "");
		
		Page.set_element_styles(".text-field", "border-color", "");
		
		
		
		Page.set_element_styles(".iframe-clipper", "border-color", "");
		
		
		
		document.querySelectorAll("#header-logo span, #header-links a").forEach(element => element.style.color = "");
	},



	get_settings_style: function(settings) 
	{
		if (settings === "dark")
		{
			return `
				#header
				{
					background-color: rgb(24, 24, 24);
				}
				
				#header-logo span, #header-links a
				{
					color: rgb(192, 192, 192);
				}
				
				#header-logo.hover span, #header-links a.hover, #header-logo.active span, #header-links a.active
				{
					color: rgb(64, 64, 64);
				}
				
				
				
				.heading-text, .date-text, .title-text
				{
					color: rgb(255, 255, 255);
				}
				
				.section-text
				{
					color: rgb(224, 224, 224);
				}
				
				.body-text, .body-text span, .song-lyrics, .image-link-subtext
				{
					color: rgb(192, 192, 192);
				}
				
				.body-text .link
				{
					color: rgb(192, 255, 192);
				}
				
				
				
				.quote-text
				{
					color: rgb(104, 104, 104);
				}
				
				.quote-attribution
				{
					color: rgb(188, 188, 188);
				}
				
				
				
				.text-box
				{
					background-color: ${this.dark_theme_background_color};
					color: rgb(152, 152, 152);
					border-color: rgb(88, 88, 88);
				}
				
				.text-box:focus
				{
					border-color: rgb(152, 152, 152);
					color: rgb(216, 216, 216);
				}
				
				
				
				.text-field
				{
					background-color: ${this.dark_theme_background_color};
					color: rgb(152, 152, 152);
					border-color: rgb(88, 88, 88);
				}
				
				.text-field:focus
				{
					border-color: rgb(152, 152, 152);
					color: rgb(216, 216, 216);
				}
				
				
				
				.checkbox-container > input ~ .checkbox
				{
					background-color: ${this.dark_theme_background_color};
				}

				.checkbox-container > input:checked ~ .checkbox
				{
					background-color: rgb(152, 152, 152);
				}
				
				
				
				.radio-button-container > input ~ .radio-button
				{
					background-color: ${this.dark_theme_background_color};
				}

				.radio-button-container > input:checked ~ .radio-button
				{
					background-color: rgb(152, 152, 152);
				}
				
				
				
				.iframe-clipper
				{
					border-color: ${this.dark_theme_background_color};
				}
				
				
				
				.loading-spinner:after
				{
					border: 2px solid rgb(152, 152, 152);
					border-color: rgb(152, 152, 152) transparent rgb(152, 152, 152) transparent;
				}
				
							
				
				#floating-footer-content, #floating-footer-button-background
				{
					background-color: ${this.dark_theme_background_color};
				}
				
				
				
				#banner-gradient, #floating-footer-gradient
				{
					background: -moz-linear-gradient(top, ${this.dark_theme_background_color_rgba}0) 0%, ${this.dark_theme_background_color_rgba}1) 100%) !important;
					background: -webkit-linear-gradient(top, ${this.dark_theme_background_color_rgba}0) 0%,${this.dark_theme_background_color_rgba}1) 100%) !important;
					background: linear-gradient(to bottom, ${this.dark_theme_background_color_rgba}0) 0%,${this.dark_theme_background_color_rgba}1) 100%) !important;
				}
				
				
				
				.footer-button, .text-button, .nav-button, .checkbox-container, #output-canvas
				{
					border-color: rgb(152, 152, 152);
				}
				
				
				
				.line-break-1-0
				{
					opacity: 1;
				}
			`;
		}
	}
};



Page.url = decodeURIComponent(Site.Settings.get_url_var("page")).replace("index.html", "");

if (Page.url === "null")
{
	Page.url = "/home/";
}