"use strict";



Site.force_dark_theme_pages =
[
	"/gallery/",
	"/slides/oral-exam/"
];



Site.Settings =
{
	url_vars: {},
	
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
		
		
		
		if (this.url_vars["theme"] == null)
		{
			this.url_vars["theme"] = 0;
		}
		
		else if (this.url_vars["theme"] == 1)
		{
			this.url_vars["theme"] = 0;
			this.toggle_theme(true);
		}
		
		
		
		if (this.url_vars["condensed_applets"] == null)
		{
			this.url_vars["condensed_applets"] = 0;
		}
		
		
		
		//This prevents things from flickering when we first load the site.
		
		let element = null;
		
		if (this.url_vars["theme"] === 1)
		{
			element = Site.add_style(this.dark_theme_style, false);
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
		
		
		
		if (this.revert_theme === 0)
		{
			this.revert_theme = -1;
			
			this.toggle_theme();
		}
		
		else if (Site.Settings.revert_theme === 1)
		{
			this.revert_theme = -1;
			
			this.toggle_theme();
		}
	},
	


	//Changes a setting.
	toggle_theme: function(no_animation = false)
	{
		if (this.url_vars["theme"] === 1 && Site.force_dark_theme_pages.includes(Page.url))
		{
			return;
		}
		
		
		
		let element = null;
		
		if (no_animation === false)
		{
			element = Site.add_style(`
				html, #header
				{
					transition: background-color ${Site.opacity_animation_time * 2 / 1000}s ease !important;
				}
				
				p, span, h1, h2, a, q, em, strong, dfn, #card-close-button
				{
					transition: color ${Site.opacity_animation_time * 2 / 1000}s ease !important;
				}
				
				 .text-box, .text-field, .checkbox-container, .checkbox-container > input ~ .checkbox, .radio-button-container, .radio-button-container > input ~ .radio-button, .loading-spinner:after, #floating-footer-content, #floating-footer-button-background, .footer-button, .text-button, .nav-button, .slider-container > input
				{
					transition: background-color ${Site.opacity_animation_time * 2 / 1000}s ease, border-color ${Site.opacity_animation_time * 2 / 1000}s ease, color ${Site.opacity_animation_time * 2 / 1000}s ease !important;
				}
				
				.tex-holder, .card
				{
					transition: background-color ${Site.opacity_animation_time * 2 / 1000}s ease, box-shadow ${Site.opacity_animation_time * 2 / 1000}s ease;
				}
				
				#header-logo img, #header-links a img
				{
					transition: filter ${Site.opacity_animation_time * 2 / 1000}s ease;
				}
			`);
		}
		
		
		
		//Light to dark
		if (this.url_vars["theme"] === 0)
		{
			setTimeout(() =>
			{
				const element = Site.add_style(this.dark_theme_style, false);
				
				try {document.querySelector("#theme-contrast-adjust").remove();}
				catch(ex) {}
				
				try {element.id = "theme-contrast-adjust";}
				catch(ex) {}
				
				this.clear_weird_inline_styles();
			}, Site.opacity_animation_time * 2);
			
			this.url_vars["theme"] = 1;
		}
		
		//Dark to light
		else
		{
			setTimeout(() =>
			{
				try {document.querySelector("#theme-contrast-adjust").remove();}
				catch(ex) {}
				
				this.clear_weird_inline_styles();
			}, Site.opacity_animation_time * 2);
			
			this.url_vars["theme"] = 0;
		}
		
		
		
		try {this.animate_theme(this.url_vars["theme"] === 1)}
		catch(ex) {}
		
		
		
		if (!no_animation)
		{
			anime({
				targets: this.meta_theme_color_element,
				content: this.url_vars["theme"] === 1 ? "#181818" : "#ffffff",
				duration: Site.opacity_animation_time * 2,
				easing: "cubicBezier(.25, .1, .25, 1)",
			});
		}
		
		else
		{
			this.meta_theme_color_element.setAttribute("content", this.url_vars["theme"] === 1 ? "#181818" : "#ffffff");
			
			document.querySelector(":root").style.setProperty("--invert", this.url_vars["theme"] === 1 ? 1 : 0);
		}
		
		
		
		if (!no_animation)
		{
			setTimeout(() =>
			{
				element.remove();
			}, Site.opacity_animation_time * 2);
		}
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



	animate_theme: function(dark = true)
	{
		if (!dark)
		{
			try
			{
				document.querySelector("#header").style.backgroundColor = "rgb(255, 255, 255)";
				
				document.querySelectorAll("#header-logo span, #header-links a span").forEach(element => element.style.color = "rgb(0, 0, 0)");
				
				document.querySelectorAll("#header-logo img, #header-links a img").forEach(element => element.style.filter = "invert(0)");
				
				const root_selector = document.querySelector(":root");
				
				let dummy = {t: 1};
				
				anime({
					targets: dummy,
					t: 0,
					duration: Site.opacity_animation_time * 2,
					easing: "cubicBezier(.25, .1, .25, 1)",
					update: () => root_selector.style.setProperty("--invert", dummy.t)
				});
			}
			
			catch(ex) {}
			
			
			
			document.documentElement.style.backgroundColor = "rgb(255, 255, 255)";
			
			Page.set_element_styles(".heading-text, .date-text, .title-text", "color", "rgb(0, 0, 0)");
			
			Page.set_element_styles(".section-text, .quote-attribution, #card-close-button", "color", "rgb(48, 48, 48)");
			
			Page.set_element_styles(".body-text, .body-text span, .body-text em, .body-text strong, .body-text dfn, .song-lyrics, .image-link-subtext, .floating-settings-button-text, .quote-text q, .text-box, .text-field", "color", "rgb(96, 96, 96)");
			
			Page.set_element_styles("a", "color", "rgb(127, 192, 127)");
			
			Page.set_element_styles(".text-box, .text-field, .checkbox-container > input ~ .checkbox, .radio-button-container > input ~ .radio-button", "background-color", "rgb(255, 255, 255)");
			
			Page.set_element_styles(".text-box, .text-field, .text-button, .checkbox-container, #output-canvas", "border-color", "rgb(96, 96, 96)");
			
			Page.set_element_styles(".checkbox-container > input:checked ~ .checkbox, .radio-button-container > input:checked ~ .radio-button", "background-color", "rgb(96, 96, 96)");
			
			
			
			try {document.querySelector("#slider-style").remove();}
			catch(ex) {}
			
			
			
			Page.element.querySelectorAll(".desmos-container").forEach(element => Page.Animate.change_opacity(element, 0, Site.opacity_animation_time));
			
			setTimeout(() =>
			{
				DESMOS_PURPLE = "#772fbf";
				DESMOS_BLUE = "#2f77bf";
				DESMOS_RED = "#bf2f2f";
				DESMOS_GREEN = "#2fbf2f";
				DESMOS_BLACK = "#000000";
				
				try {Page.Load.create_desmos_graphs(false);}
				catch(ex) {}
				
				Page.element.querySelectorAll(".desmos-container").forEach(element => Page.Animate.change_opacity(element, 1, Site.opacity_animation_time));
			}, Site.opacity_animation_time);
		}
		
		
		
		else
		{
			try
			{
				document.querySelector("#header").style.backgroundColor = "rgb(24, 24, 24)";
				
				document.querySelectorAll("#header-logo span, #header-links a span").forEach(element => element.style.color = "rgb(255, 255, 255)");
				
				document.querySelectorAll("#header-logo img, #header-links a img").forEach(element => element.style.filter = "invert(1)");
				
				const root_selector = document.querySelector(":root");
				
				let dummy = {t: 0};
				
				anime({
					targets: dummy,
					t: 1,
					duration: Site.opacity_animation_time * 2,
					easing: "cubicBezier(.25, .1, .25, 1)",
					update: () => root_selector.style.setProperty("--invert", dummy.t)
				});
			}
			
			catch(ex) {}
			
			
			
			document.documentElement.style.backgroundColor = "rgb(24, 24, 24)";
			
			Page.set_element_styles(".heading-text, .date-text, .title-text", "color", "rgb(255, 255, 255)");
			
			Page.set_element_styles(".section-text, .quote-attribution, #card-close-button", "color", "rgb(220, 220, 220)");
			
			Page.set_element_styles(".body-text, .body-text span, .body-text em, .body-text strong, .body-text dfn, .song-lyrics, .image-link-subtext, .floating-settings-button-text, .quote-text q, .text-box, .text-field", "color", "rgb(172, 172, 172)");
			
			Page.set_element_styles("a", "color", "rgb(144, 216, 144)");
			
			Page.set_element_styles(".text-box, .text-field, .checkbox-container > input ~ .checkbox, .radio-button-container > input ~ .radio-button", "background-color", "rgb(24, 24, 24)");
			
			Page.set_element_styles(".text-box, .text-field, .text-button, .checkbox-container, #output-canvas", "border-color", "rgb(172, 172, 172)");
			
			Page.set_element_styles(".checkbox-container > input:checked ~ .checkbox, .radio-button-container > input:checked ~ .radio-button", "background-color", "rgb(172, 172, 172)");
			
			
			
			Page.element.querySelectorAll(".desmos-container").forEach(element => Page.Animate.change_opacity(element, 0, Site.opacity_animation_time));
			
			setTimeout(() =>
			{
				DESMOS_PURPLE = "#60c000";
				DESMOS_BLUE = "#c06000";
				DESMOS_RED = "#00c0c0";
				DESMOS_GREEN = "#c000c0";
				DESMOS_BLACK = "#000000";
				
				try {Page.Load.create_desmos_graphs(true);}
				catch(ex) {}
				
				Page.element.querySelectorAll(".desmos-container").forEach(element => Page.Animate.change_opacity(element, 1, Site.opacity_animation_time));
			}, Site.opacity_animation_time);
			
			
			
			const element = Site.add_style(`
				.slider-container > input
				{
					background-color: rgb(127, 127, 127) !important;
				}

				.slider-container > input::-webkit-slider-thumb
				{
					background-color: rgb(172, 172, 172) !important;
				}

				.slider-container > input::-moz-slider-thumb
				{
					background-color: rgb(172, 172, 172) !important;
				}

				.slider-container > input:active
				{
					background-color: rgb(220, 220, 220) !important;
				}

				.slider-container > input:hover::-webkit-slider-thumb
				{
					background-color: rgb(220, 220, 220) !important;
				}

				.slider-container > input:hover::-moz-slider-thumb
				{
					background-color: rgb(220, 220, 220) !important;
				}

				.slider-container > input:active::-webkit-slider-thumb
				{
					background-color: rgb(255, 255, 255) !important;
				}

				.slider-container > input:active::-moz-slider-thumb
				{
					background-color: rgb(255, 255, 255) !important;
				}
			`, false);
			
			try {document.querySelector("#slider-style").remove();}
			catch(ex) {}
			
			try {element.id = "slider-style";}
			catch(ex) {}
		}
	},



	clear_weird_inline_styles: function()
	{
		Page.set_element_styles(".checkbox-container > input ~ .checkbox, .checkbox-container > input:checked ~ .checkbox, .radio-button-container > input ~ .radio-button, .radio-button-container > input:checked ~ .radio-button, .text-box, .text-field", "background-color", "");
		
		Page.set_element_styles(".text-box, .text-field", "color", "");
		
		Page.set_element_styles(".text-box, .text-field", "border-color", "");
	},
	
	
	
	dark_theme_style: `
		#header, .card
		{
			background-color: rgb(24, 24, 24);
		}
		
		#header-logo span, #header-links a span
		{
			color: rgb(255, 255, 255);
		}
		
		#header-logo.hover span, #header-links a.hover span
		{
			color: rgb(0, 0, 0) !important;
		}
		
		#header-logo img, #header-links a img
		{
			filter: invert(1);
		}
		
		#header-logo.hover img, #header-links a.hover imginput
		{
			filter: invert(0) !important;
		}
		
		
		
		.heading-text, .date-text, .title-text
		{
			color: rgb(255, 255, 255);
		}
		
		.section-text, .quote-attribution, #card-close-button
		{
			color: rgb(220, 220, 220);
		}
		
		.body-text, .body-text span, .song-lyrics, .image-link-subtext, .quote-text
		{
			color: rgb(172, 172, 172);
		}
		
		a
		{
			color: rgb(144, 216, 144);
		}
		
		
		
		.text-box, .text-field
		{
			background-color: rgb(24, 24, 24);
			color: rgb(172, 172, 172);
			border-color: rgb(172, 172, 172);
		}
		
		.text-box:focus, .text-field:focus
		{
			color: rgb(255, 255, 255);
			border-color: rgb(255, 255, 255);
		}
		
		
		
		.checkbox-container > input ~ .checkbox, .radio-button-container > input ~ .radio-button
		{
			background-color: rgb(24, 24, 24);
		}

		.checkbox-container > input:checked ~ .checkbox, .radio-button-container > input:checked ~ .radio-button
		{
			background-color: rgb(172, 172, 172);
		}
		
		.text-button, .checkbox-container, .output-canvas, .desmos-border
		{
			border-color: rgb(172, 172, 172);
		}
		
		
		
		.tex-holder
		{
			background-color: rgba(24, 24, 24, 0);
			
			box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 1);
		}
		
		.tex-holder.hover
		{
			box-shadow: 0px 0px 16px 2px rgba(0, 0, 0, 1);
		}
		
		.card
		{
			box-shadow: 0px 0px 16px 4px rgba(0, 0, 0, 1);
		}
		
		#card-close-button
		{
			background-color: rgb(24, 24, 24);
		}
		
		#card-close-button.hover
		{
			background-color: rgb(64, 64, 64);
		}
	`
};



Page.url = decodeURIComponent(Site.Settings.get_url_var("page")).replace("index.html", "").replace("src.html", "");

if (Page.url === "null")
{
	Page.url = "/home/";
}