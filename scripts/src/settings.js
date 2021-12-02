"use strict";



//Handles the various settings' effects on the page. These functions typically add or remove a style tag that handles all the changes. Some settings, like the theme, require an animation.



let Settings =
{
	url_vars: {},
	
	texts:
	{
		"theme": ["Theme: light", "Theme: dark"],
		"dark_theme_color": ["Dark theme color: dark gray", "Dark theme color: black"],
		"contrast": ["Contrast: normal", "Contrast: high"],
		"text_size": ["Text size: normal", "Text size: large"],
		"font": ["Font: always sans serif", "Font: serif on writing"],
		"content_animation": ["Content animation: enabled", "Content animation: disabled"]
	},
	
	dark_theme_background_color: "rgb(24, 24, 24)",
	dark_theme_background_color_rgba: "rgba(24, 24, 24, ",
	
	gradient_suffix: "-0-0",
	
	
	
	get_url_var: function(id)
	{
		let query = window.location.search.substring(1);
		let vars = query.split("&");
		
		let pair = [];
		
		for (let i = 0; i < vars.length; i++)
		{
			pair = vars[i].split("=");
			
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
			"dark_theme_color": this.get_url_var("dark_theme_color"),
			"contrast": this.get_url_var("contrast"),
			"text_size": this.get_url_var("text_size"),
			"font": this.get_url_var("font"),
			"content_animation": this.get_url_var("content_animation"),
			"title_pages_seen": this.get_url_var("title_pages_seen")
		};
		
		
		
		window.matchMedia("(prefers-color-scheme: dark)").addListener((e) =>
		{
			if (e.matches && this.url_vars["theme"] !== 1)
			{
				this.toggle_theme();
			}
			
			else if (!e.matches && this.url_vars["theme"] === 1)
			{
				this.toggle_theme();
				
				if (this.url_vars["dark_theme_color"] === 1)
				{
					setTimeout(() =>
					{
						this.toggle_dark_theme_color();
					}, Site.opacity_animation_time * 2);
				}
			}
		});

		if (window.matchMedia("(prefers-color-scheme: dark)").matches && this.url_vars["theme"] === null)
		{
			this.url_vars["theme"] = 1;
		}
		
		if (this.url_vars["dark_theme_color"] === 1)
		{
			this.dark_theme_background_color = "rgb(0, 0, 0)";
			this.dark_theme_background_color_rgba = "rgba(0, 0, 0, ";
		}
		
		
		
		for (let key in this.url_vars)
		{
			//These are double equals, and that's important, but I can't quite see why. Obviously the this.url_vars are stored as strings and I just didn't realize that when I first coded this, but this bit of code has refused to cooperate with any modifications I make. Who knows.
			if (this.url_vars[key] == null)
			{
				this.url_vars[key] = 0;
			}
			
			else if (this.url_vars[key] == 1)
			{
				this.url_vars[key] = 0;
				this.toggle(key, true);
			}
		}
		
		
		
		//This prevents things from flickering when we first load the site.
		
		let element = null;
		
		if (this.url_vars["theme"] === 1 && this.url_vars["contrast"] !== 1)
		{
			element = Site.add_style(this.get_settings_style("dark"), false);
		}
		
		else if (this.url_vars["theme"] !== 1 && this.url_vars["contrast"] === 1)
		{
			element = Site.add_style(this.get_settings_style("contrast"), false);
		}
		
		else if (this.url_vars["theme"] === 1 && this.url_vars["contrast"] === 1)
		{
			element = Site.add_style(this.get_settings_style("dark_contrast"), false);
		}
		
		try {document.querySelector("#theme-contrast-adjust").remove();}
		catch(ex) {}
		
		try {element.id = "theme-contrast-adjust";}
		catch(ex) {}
	},
	
	
	
	meta_theme_color_refresh_id: null,
	meta_theme_color_animation_step: 0,
	meta_theme_color_element: document.querySelector("#theme-color-meta"),
	
	animate_meta_theme_color: function(old_brightness, new_brightness, num_steps = 45)
	{
		try {clearInterval(this.meta_theme_color_refresh_id);}
		catch(ex) {}
		
		this.meta_theme_color_animation_step = 0;
		
		this.meta_theme_color_refresh_id = setInterval(() =>
		{
			this.meta_theme_color_animation_step++;
			
			let brightness = (1 - this.meta_theme_color_animation_step / num_steps) * old_brightness + (this.meta_theme_color_animation_step / num_steps) * new_brightness;
			
			this.meta_theme_color_element.setAttribute("content", `rgb(${brightness}, ${brightness}, ${brightness})`);
			
			if (this.meta_theme_color_animation_step === num_steps)
			{
				try {clearInterval(this.meta_theme_color_refresh_id);}
				catch(ex) {}
			}
		}, 10);
	},
	


	//Changes a setting.
	toggle: function(setting, no_animation = false)
	{
		let element = null;
		
		if (no_animation === false && (setting === "theme" || setting === "dark_theme_color" || setting === "contrast"))
		{
			element = Site.add_style(`
				html
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
			if (this.url_vars["theme"] === 1 && this.url_vars["dark_theme_color"] !== 1)
			{
				this.toggle_dark_theme_color();
				
				//document.querySelector("#theme-color-meta").setAttribute("content", "#000000");
				this.animate_meta_theme_color(24, 0);
				
				if (!no_animation)
				{
					setTimeout(() =>
					{
						try {Page.Footer.Floating.show_settings_text("Theme: black");}
						catch(ex) {}
					}, Site.opacity_animation_time * 2);
				}
			}
			
			else if (this.url_vars["theme"] === 1 && this.url_vars["dark_theme_color"] === 1)
			{
				this.toggle_theme();
				
				if (!no_animation)
				{
					setTimeout(() =>
					{
						this.toggle_dark_theme_color();
						
						try {Page.Footer.Floating.show_settings_text("Theme: light");}
				 		catch(ex) {}
					}, Site.opacity_animation_time * 2);
				}
			}
			
			else
			{
				this.toggle_theme();
				
				if (!no_animation)
				{
					setTimeout(() =>
					{
						try {Page.Footer.Floating.show_settings_text("Theme: dark");}
						catch(ex) {}
					}, Site.opacity_animation_time * 2);
				}
			}
		}
		
		else if (setting === "dark_theme_color")
		{
			this.toggle_dark_theme_color();
		}
		
		else if (setting === "contrast")
		{
			this.toggle_contrast();
		}
		
		else if (setting === "text_size")
		{
			this.toggle_text_size();
		}
		
		else if (setting === "font")
		{
			this.toggle_font();
		}
		
		else if (setting === "content_animation")
		{
			this.toggle_content_animation();
		}
		
		else
		{
			console.log("Unknown setting");
		}
		
		
		
		Page.Navigation.write_url_vars();
		
		
		
		if (no_animation === false && (setting === "theme" || setting === "dark_theme_color" || setting === "contrast"))
		{
			setTimeout(() =>
			{
				element.remove();
			}, Site.opacity_animation_time * 2);
		}
	},



	//Changes the theme and animates elements.
	toggle_theme: function()
	{
		//Light to dark
		if (this.url_vars["theme"] === 0)
		{
			if (!("manual_dark_theme" in Page.settings && Page.settings["manual_dark_theme"]))
			{
				if (this.url_vars["dark_theme_color"] !== 1)
				{
					document.documentElement.style.backgroundColor = "rgb(24, 24, 24)";
					
					this.animate_meta_theme_color(255, 24);
				}
				
				else
				{
					document.documentElement.style.backgroundColor = "rgb(0, 0, 0)";
					
					this.animate_meta_theme_color(24, 0);
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
					let element = Site.add_style(this.get_settings_style("dark_contrast"), false);
					
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
					let element = Site.add_style(this.get_settings_style("dark"), false);
					
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
				
				this.animate_meta_theme_color(0, 255);
			}
			
			
			
			if (this.url_vars["contrast"] === 1)
			{
				if (!Page.settings["manual_dark_theme"])
				{
					this.animate_theme_contrast("contrast");
				}
				
				
				
				setTimeout(() =>
				{
					let element = Site.add_style(this.get_settings_style("contrast"), false);
					
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



	toggle_dark_theme_color: function()
	{
		if (this.url_vars["dark_theme_color"] === 0)
		{
			this.dark_theme_background_color = "rgb(0, 0, 0)";
			this.dark_theme_background_color_rgba = "rgba(0, 0, 0, ";
			
			if (this.url_vars["theme"] === 1)
			{
				document.documentElement.style.backgroundColor = "rgb(0, 0, 0)";
				
				if (this.url_vars["contrast"] == 1)
				{
					this.animate_theme_contrast("dark_contrast");
				}
				
				else
				{
					this.animate_theme_contrast("dark");
				}
			}
			
			
			
			setTimeout(() =>
			{
				let element = null;
				
				if (this.url_vars["theme"] === 1)
				{
					if (this.url_vars["contrast"] === 1)
					{
						element = Site.add_style(this.get_settings_style("dark_contrast"), false);
					}
					
					else
					{
						element = Site.add_style(this.get_settings_style("dark"), false);
					}
				}
				
				else if (this.url_vars["contrast"] === 1)
				{
					element = Site.add_style(this.get_settings_style("contrast"), false);
				}
				
				
				
				try {document.querySelector("#theme-contrast-adjust").remove();}
				catch(ex) {}
				
				try {element.id = "theme-contrast-adjust";}
				catch(ex) {}
				
				this.clear_weird_inline_styles();
			}, Site.opacity_animation_time * 2);
			
			
			
			this.url_vars["dark_theme_color"] = 1;
		}
		
		
		
		else
		{
			this.dark_theme_background_color = "rgb(24, 24, 24)";
			this.dark_theme_background_color_rgba = "rgba(24, 24, 24, ";
			
			if (this.url_vars["theme"] === 1)
			{
				document.documentElement.style.backgroundColor = "rgb(24, 24, 24)";
				
				if (this.url_vars["contrast"] == 1)
				{
					this.animate_theme_contrast("dark_contrast");
				}
				
				else
				{
					this.animate_theme_contrast("dark");
				}
			}
			
			
			
			setTimeout(() =>
			{
				let element = null;
				
				if (this.url_vars["theme"] === 1)
				{
					if (this.url_vars["contrast"] === 1)
					{
						element = Site.add_style(this.get_settings_style("dark_contrast"), false);
					}
					
					else
					{
						element = Site.add_style(this.get_settings_style("dark"), false);
					}
				}
				
				else if (this.url_vars["contrast"] === 1)
				{
					element = Site.add_style(this.get_settings_style("contrast"), false);
				}
				
				
				
				try {document.querySelector("#theme-contrast-adjust").remove();}
				catch(ex) {}
				
				try {element.id = "theme-contrast-adjust";}
				catch(ex) {}
				
				this.clear_weird_inline_styles();
			}, Site.opacity_animation_time * 2);
			
			
			
			this.url_vars["dark_theme_color"] = 0;
		}
	},



	toggle_contrast: function()
	{
		//Default to high
		if (this.url_vars["contrast"] === 0)
		{
			if (this.url_vars["theme"] === 1)
			{
				this.animate_theme_contrast("dark_contrast");
				
				
				
				setTimeout(() =>
				{
					let element = Site.add_style(this.get_settings_style("dark_contrast"), false);
					
					try {document.querySelector("#theme-contrast-adjust").remove();}
					catch(ex) {}
					
					try {element.id = "theme-contrast-adjust";}
					catch(ex) {}
					
					this.clear_weird_inline_styles();
				}, Site.opacity_animation_time * 2);
			}
			
			
			
			else
			{
				this.animate_theme_contrast("contrast");
				
				
				
				setTimeout(() =>
				{
					let element = Site.add_style(this.get_settings_style("contrast"), false);
					
					try {document.querySelector("#theme-contrast-adjust").remove();}
					catch(ex) {}
					
					try {element.id = "theme-contrast-adjust";}
					catch(ex) {}
					
					this.clear_weird_inline_styles();
				}, Site.opacity_animation_time * 2);
			}
			
			
			
			setTimeout(() =>
			{
				try {Page.Footer.Floating.show_settings_text("Contrast: high");}
				catch(ex) {}
			}, Site.opacity_animation_time * 2 + 50);
			
			this.url_vars["contrast"] = 1;
		}
		
		
		
		//High to default
		else
		{
			if (this.url_vars["theme"] === 1)
			{
				this.animate_theme_contrast("dark");
				
				
				
				setTimeout(() =>
				{
					let element = Site.add_style(this.get_settings_style("dark"), false);
					
					try {document.querySelector("#theme-contrast-adjust").remove();}
					catch(ex) {}
					
					try {element.id = "theme-contrast-adjust";}
					catch(ex) {}
					
					this.clear_weird_inline_styles();
				}, Site.opacity_animation_time * 2);
			}
			
			
			
			else
			{
				this.animate_theme_contrast("");
				
				
				
				setTimeout(() =>
				{
					try {document.querySelector("#theme-contrast-adjust").remove();}
					catch(ex) {}
					
					this.clear_weird_inline_styles();
				}, Site.opacity_animation_time * 2);
			}
			
			
			
			setTimeout(() =>
			{
				try {Page.Footer.Floating.show_settings_text("Contrast: normal");}
				catch(ex) {}
			}, Site.opacity_animation_time * 2 + 50);
			
			this.url_vars["contrast"] = 0;
		}
	},



	toggle_text_size: function()
	{
		document.body.classList.add("animated-opacity");
		document.body.style.opacity = 0;
		
		
		
		//Normal to large
		if (this.url_vars["text_size"] === 0)
		{
			setTimeout(() =>
			{
				try {document.querySelector("#text-size-adjust").remove();}
				catch(ex) {}
				
				let element = Site.add_style(`
					html
					{
						font-size: 18px;
					}
					
					@media (min-width: 1000px)
					{
						html
						{
							font-size: 22px;
						}
					}
				`, false);
				
				element.id = "text-size-adjust";
				
				
				
				setTimeout(() =>
				{
					try {Page.Footer.Floating.show_settings_text("Text size: large");}
				 	catch(ex) {}
				}, Site.opacity_animation_time);
			}, Site.opacity_animation_time);
				
			this.url_vars["text_size"] = 1;
		}
			
		else
		{
			setTimeout(() =>
			{
				try {document.querySelector("#text-size-adjust").remove();}
				catch(ex) {}
				
				
				
				setTimeout(() =>
				{
					try {Page.Footer.Floating.show_settings_text("Text size: normal");}
				 	catch(ex) {}
				}, Site.opacity_animation_time);
			}, Site.opacity_animation_time);
				
			this.url_vars["text_size"] = 0;
		}
		
		
		
		setTimeout(() =>
		{
			setTimeout(() =>
			{
				document.body.style.opacity = 1; //???
			}, 50);
		}, Site.opacity_animation_time);
	},



	toggle_font: function()
	{
		if ("writing_page" in Page.settings && Page.settings["writing_page"])
		{
			document.body.style.opacity = 0;
		}
		
		
		
		//Sans to serif
		if (this.url_vars["font"] === 0)
		{
			setTimeout(() =>
			{
				if ("writing_page" in Page.settings && Page.settings["writing_page"])
				{
					Page.set_element_styles(".body-text, .heading-text", "font-family", "'Gentium Book Basic', serif");
				}
				
				
				
				try {Page.Footer.Floating.show_settings_text("Font: serif on writing");}
			 	catch(ex) {}
			}, Site.opacity_animation_time);
			
			this.url_vars["font"] = 1;
		}
		
		
		
		//Serif to sans
		else
		{
			setTimeout(() =>
			{
				if ("writing_page" in Page.settings && Page.settings["writing_page"])
				{
					Page.set_element_styles(".body-text, .heading-text", "font-family", "'Rubik', sans-serif");
				}
				
				
				
				try {Page.Footer.Floating.show_settings_text("Font: always sans serif");}
		 		catch(ex) {}
			}, Site.opacity_animation_time);
			
			this.url_vars["font"] = 0;
		}
		
		
		
		if ("writing_page" in Page.settings && Page.settings["writing_page"])
		{
			setTimeout(() =>
			{
				setTimeout(() =>
				{
					document.body.style.opacity = 1;
					
					Page.Load.AOS.on_resize();
				}, 50);
			}, Site.opacity_animation_time);
		}
	},



	toggle_content_animation: function()
	{
		if (this.url_vars["content_animation"] === 0)
		{
			//Here, we can just animate out the body as usual.	
			document.body.style.opacity = 0;
			
			setTimeout(() =>
			{
				this.remove_animation();
				
				document.body.classList.add("animated-opacity");
			
				setTimeout(() =>
				{
					document.body.style.opacity = 1;
					
					setTimeout(() =>
					{
						document.body.classList.remove("animated-opacity");
					}, Site.opacity_animation_time);
				}, 50);
			}, Site.opacity_animation_time);
			
			
			
			setTimeout(() =>
			{
				try {Page.Footer.Floating.show_settings_text("Content animation: disabled");}
		 		catch(ex) {}
		 	}, Site.opacity_animation_time * 2);
		 	
		 	
			
			this.url_vars["content_animation"] = 1;
		}
		
		
		
		else
		{
			this.url_vars["content_animation"] = 0;
			
			document.body.classList.add("animated-opacity");
			
			
			
			//This is a little messy, but it's better than the alternative. Removing every single data-aos attribute is way too destructive to undo, so instead, we'll just refresh the page.
			Page.Navigation.last_page_scroll = window.scrollY;
			
			Page.Navigation.redirect(Page.url, false, true, true);
		}
	},



	set_img_button_contrast: function()
	{
		let elements = document.querySelectorAll(".nav-button, .scroll-button");
		
		for (let i = 0; i < elements.length; i++)
		{
			elements[i].setAttribute("src", elements[i].getAttribute("src").replace("chevron-left", "chevron-left-dark").replace("chevron-right", "chevron-right-dark").replace("chevron-down", "chevron-down-dark"));
		}
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
			let element = Site.add_style(`
				.body-text, .nav-buttons, .line-break
				{
					width: 50vw;
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



	remove_animation: function()
	{
		let elements = document.body.querySelectorAll("[data-aos]")
		
		for (let i = 0; i < elements.length; i++)
		{
			elements[i].removeAttribute("data-aos");
		}
	},



	animate_theme_contrast: function(settings)
	{
		let new_gradient_suffix = "-0-0";
		
		if (settings === "")
		{
			Page.set_element_styles(".heading-text, .date-text, .title-text", "color", "rgb(0, 0, 0)");
			
			Page.set_element_styles(".section-text", "color", "rgb(96, 96, 96)");
			
			Page.set_element_styles(".body-text, .body-text span, .song-lyrics, .image-link-subtext, .floating-settings-button-text", "color", "rgb(127, 127, 127)");
			
			Page.set_element_styles(".body-text .link", "color", "rgb(127, 192, 127)");
			
			
			
			Page.set_element_styles(".quote-text q", "color", "rgb(176, 176, 176)");
			
			Page.set_element_styles(".quote-attribution", "color", "rgb(92, 92, 92)");
			
			
			
			Page.set_element_styles(".text-box", "background-color", "rgb(255, 255, 255)");
			
			Page.set_element_styles(".text-box", "color", "rgb(127, 127, 127)");
			
			Page.set_element_styles(".text-box", "border-color", "rgb(192, 192, 192)");
			
			
			
			Page.set_element_styles(".text-field", "background-color", "rgb(255, 255, 255)");
			
			Page.set_element_styles(".text-field", "color", "rgb(127, 127, 127)");
			
			Page.set_element_styles(".text-field", "border-color", "rgb(192, 192, 192)");
			
			
			
			Page.set_element_styles(".checkbox-container > input ~ .checkbox", "background-color", "rgb(255, 255, 255)");
			
			Page.set_element_styles(".checkbox-container > input:checked ~ .checkbox", "background-color", "rgb(127, 127, 127)");
			
			
			
			Page.set_element_styles(".radio-button-container > input ~ .radio-button", "background-color", "rgb(255, 255, 255)");
			
			Page.set_element_styles(".radio-button-container > input:checked ~ .radio-button", "background-color", "rgb(127, 127, 127)");
			
			
			
			try {document.querySelector("#slider-style").remove();}
			catch(ex) {}
			
			
			
			Page.set_element_styles("#floating-footer-content, #floating-footer-button-background", "background-color", "rgb(255, 255, 255)");
			
			
			
			Page.set_element_styles(".footer-button, .text-button, .nav-button, .checkbox-container, #output-canvas", "border-color", "rgb(127, 127, 127)");
		}
		
		
		
		else if (settings === "dark")
		{
			Page.set_element_styles(".heading-text, .date-text, .title-text", "color", "rgb(255, 255, 255)");
			
			Page.set_element_styles(".section-text", "color", "rgb(184, 184, 184)");
			
			Page.set_element_styles(".body-text, .body-text span, .song-lyrics, .image-link-subtext, .floating-settings-button-text", "color", "rgb(152, 152, 152)");
			
			Page.set_element_styles(".body-text .link", "color", "rgb(152, 216, 152)");
			
			
			
			Page.set_element_styles(".quote-text q", "color", "rgb(104, 104, 104)");
			
			Page.set_element_styles(".quote-attribution", "color", "rgb(188, 188, 188)");
			
			
			
			Page.set_element_styles(".text-box", "background-color", this.dark_theme_background_color);
			
			Page.set_element_styles(".text-box", "color", "rgb(152, 152, 152)");
			
			Page.set_element_styles(".text-box", "border-color", "rgb(88, 88, 88)");
			
			
			
			Page.set_element_styles(".text-field", "background-color", this.dark_theme_background_color);
			
			Page.set_element_styles(".text-field", "color", "rgb(152, 152, 152)");
			
			Page.set_element_styles(".text-field", "border-color", "rgb(88, 88, 88)");
			
			
			
			Page.set_element_styles(".checkbox-container > input ~ .checkbox", "background-color", this.dark_theme_background_color);
			
			Page.set_element_styles(".checkbox-container > input:checked ~ .checkbox", "background-color", "rgb(152, 152, 152)");
			
			
			
			Page.set_element_styles(".radio-button-container > input ~ .radio-button", "background-color", this.dark_theme_background_color);
			
			Page.set_element_styles(".radio-button-container > input:checked ~ .radio-button", "background-color", "rgb(152, 152, 152)");
			
			
			
			let element = Site.add_style(`
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
		
		
		
		else if (settings === "contrast")
		{
			Page.set_element_styles(".heading-text, .date-text, .title-text", "color", "rgb(0, 0, 0)");
			
			Page.set_element_styles(".section-text", "color", "rgb(48, 48, 48)");
			
			Page.set_element_styles(".body-text, .body-text span, .song-lyrics, .image-link-subtext, .floating-settings-button-text", "color", "rgb(64, 64, 64)");
			
			Page.set_element_styles(".body-text .link", "color", "rgb(64, 128, 64)");
			
			
			
			Page.set_element_styles(".quote-text q", "color", "rgb(88, 88, 88)");
			
			Page.set_element_styles(".quote-attribution", "color", "rgb(46, 46, 46)");
			
			
			
			Page.set_element_styles(".text-box", "background-color", "rgb(255, 255, 255)");
			
			Page.set_element_styles(".text-box", "color", "rgb(64, 64, 64)");
			
			Page.set_element_styles(".text-box", "border-color", "rgb(96, 96, 96)");
			
			
			
			Page.set_element_styles(".text-field", "background-color", "rgb(255, 255, 255)");
			
			Page.set_element_styles(".text-field", "color", "rgb(64, 64, 64)");
			
			Page.set_element_styles(".text-field", "border-color", "rgb(96, 96, 96)");
			
			
			
			Page.set_element_styles(".checkbox-container > input ~ .checkbox", "background-color", "rgb(255, 255, 255)");
			
			Page.set_element_styles(".checkbox-container > input:checked ~ .checkbox", "background-color", "rgb(64, 64, 64)");
			
			
			
			Page.set_element_styles(".radio-button-container > input ~ .radio-button", "background-color", "rgb(255, 255, 255)");
			
			Page.set_element_styles(".radio-button-container > input:checked ~ .radio-button", "background-color", "rgb(64, 64, 64)");
			
			
			
			let element = Site.add_style(`
				.slider-container > input
				{
					background-color: rgb(100, 100, 100) !important;
				}

				.slider-container > input::-webkit-slider-thumb
				{
					background-color: rgb(80, 80, 80) !important;
				}

				.slider-container > input::-moz-slider-thumb
				{
					background-color: rgb(80, 80, 80) !important;
				}

				.slider-container > input:active
				{
					background-color: rgb(64, 64, 64) !important;
				}

				.slider-container > input:hover::-webkit-slider-thumb
				{
					background-color: rgb(56, 56, 56) !important;
				}

				.slider-container > input:hover::-moz-slider-thumb
				{
					background-color: rgb(56, 56, 56) !important;
				}

				.slider-container > input:active::-webkit-slider-thumb
				{
					background-color: rgb(0, 0, 0) !important;
				}

				.slider-container > input:active::-moz-slider-thumb
				{
					background-color: rgb(0, 0, 0) !important;
				}
			`, false);
			
			try {document.querySelector("#slider-style").remove();}
			catch(ex) {}
			
			try {element.id = "slider-style";}
			catch(ex) {}
			
			
			
			Page.set_element_styles("#floating-footer-content, #floating-footer-button-background", "background-color", "rgb(255, 255, 255)");
			
			
			
			Page.set_element_styles(".footer-button, .text-button, .nav-button, #output-canvas", "border-color", "rgb(64, 64, 64)");
			
			
			
			new_gradient_suffix = `-0-1`;
		}
		
		
		
		else if (settings === "dark_contrast")
		{
			Page.set_element_styles(".heading-text, .date-text, .title-text", "color", "rgb(255, 255, 255)");
			
			Page.set_element_styles(".section-text", "color", "rgb(232, 232, 232)");
			
			Page.set_element_styles(".body-text, .body-text span, .song-lyrics, .image-link-subtext", "color", "rgb(216, 216, 216)");
			
			Page.set_element_styles(".body-text .link", "color", "rgb(216, 255, 216)");
			
			Page.set_element_styles(".floating-settings-button-text", "color", "rgb(64, 64, 64)");
			
			
			
			Page.set_element_styles(".quote-text q", "color", "rgb(192, 192, 192)");
			
			Page.set_element_styles(".quote-attribution", "color", "rgb(234, 234, 234)");
			
			
			
			Page.set_element_styles(".text-box", "background-color", this.dark_theme_background_color);
			
			Page.set_element_styles(".text-box", "color", "rgb(216, 216, 216)");
			
			Page.set_element_styles(".text-box", "border-color", "rgb(152, 152, 152)");
			
			
			
			Page.set_element_styles(".text-field", "background-color", this.dark_theme_background_color);
			
			Page.set_element_styles(".text-field", "color", "rgb(216, 216, 216)");
			
			Page.set_element_styles(".text-field", "border-color", "rgb(152, 152, 152)");
			
			
			
			Page.set_element_styles(".checkbox-container", "border-color", "rgb(216, 216, 216)");
			
			Page.set_element_styles(".checkbox-container > input ~ .checkbox", "background-color", this.dark_theme_background_color);
			
			Page.set_element_styles(".checkbox-container > input:checked ~ .checkbox", "background-color", "rgb(216, 216, 216)");
			
			
			
			Page.set_element_styles(".radio-button-container", "border-color", "rgb(216, 216, 216)");
			
			Page.set_element_styles(".radio-button-container > input ~ .radio-button", "background-color", this.dark_theme_background_color);
			
			Page.set_element_styles(".radio-button-container > input:checked ~ .radio-button", "background-color", "rgb(216, 216, 216)");
			
			
			
			//Page.set_element_styles(".slider-container > input", "background-color", "rgb(180, 180, 180)");
			
			let element = Site.add_style(`
				.slider-container > input
				{
					background-color: rgb(180, 180, 180) !important;
				}

				.slider-container > input::-webkit-slider-thumb
				{
					background-color: rgb(200, 200, 200) !important;
				}

				.slider-container > input::-moz-slider-thumb
				{
					background-color: rgb(200, 200, 200) !important;
				}

				.slider-container > input:active
				{
					background-color: rgb(216, 216, 216) !important;
				}

				.slider-container > input:hover::-webkit-slider-thumb
				{
					background-color: rgb(224, 224, 224) !important;
				}

				.slider-container > input:hover::-moz-slider-thumb
				{
					background-color: rgb(224, 224, 224) !important;
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
			
			
			
			Page.set_element_styles("#floating-footer-content, #floating-footer-button-background", "background-color", this.dark_theme_background_color);
			
			
			
			Page.set_element_styles(".footer-button, .text-button, .nav-button, #output-canvas", "border-color", "rgb(152, 152, 152)");
			
			
			
			new_gradient_suffix = `-1-1`;
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
	},



	get_settings_style: function(settings) 
	{
		if (settings === "dark")
		{
			return `
				.heading-text, .date-text, .title-text
				{
					color: rgb(255, 255, 255);
				}
				
				.section-text
				{
					color: rgb(184, 184, 184);
				}
				
				.body-text, .body-text span, .song-lyrics, .image-link-subtext
				{
					color: rgb(152, 152, 152);
				}
				
				.body-text .link
				{
					color: rgb(152, 216, 152);
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
		
		
		
		else if (settings === "contrast")
		{
			return `
				.heading-text, .date-text, .title-text
				{
					color: rgb(0, 0, 0);
				}
				
				.section-text
				{
					color: rgb(48, 48, 48);
				}
				
				.body-text, .body-text span, .song-lyrics, .image-link-subtext, .text-button
				{
					color: rgb(64, 64, 64);
				}
				
				.settings-text
				{
					color: rgb(64, 64, 64) !important;
				}
				
				.body-text .link
				{
					color: rgb(64, 128, 64);
				}
				
				.floating-settings-button-text
				{
					color: rgb(64, 64, 64);
				}
				
				
				
				.quote-text
				{
					color: rgb(88, 88, 88);
				}
				
				.quote-attribution
				{
					color: rgb(46, 46, 46);
				}
				
				
				
				.text-box
				{
					background-color: rgb(255, 255, 255);
					color: rgb(64, 64, 64);
					border-color: rgb(96, 96, 96);
				}
				
				.text-box:focus
				{
					border-color: rgb(48, 48, 48);
					color: rgb(0, 0, 0);
				}
				
				
				
				.text-field
				{
					background-color: rgb(255, 255, 255);
					color: rgb(64, 64, 64);
					border-color: rgb(96, 96, 96);
				}
				
				.text-field:focus
				{
					border-color: rgb(48, 48, 48);
					color: rgb(0, 0, 0);
				}
				
				

				.checkbox-container > input:checked ~ .checkbox
				{
					background-color: rgb(64, 64, 64);
				}
				
				
				
				.radio-button-container > input:checked ~ .radio-button
				{
					background-color: rgb(64, 64, 64);
				}
				
				
				
				.loading-spinner:after
				{
					border: 2px solid rgb(64, 64, 64);
					border-color: rgb(64, 64, 64) transparent rgb(64, 64, 64) transparent;
				}
				
				
				
				.footer-button, .text-button, .nav-button, .checkbox-container, #output-canvas
				{
					border-color: rgb(64, 64, 64);
				}
			`;
		}
		
		
		
		else if (settings === "dark_contrast")
		{
			return `
				.heading-text, .date-text, .title-text
				{
					color: rgb(255, 255, 255);
				}
				
				.section-text
				{
					color: rgb(232, 232, 232);
				}
				
				.body-text, .body-text span, .song-lyrics, .image-link-subtext
				{
					color: rgb(216, 216, 216);
				}
				
				.settings-text
				{
					color: rgb(64, 64, 64) !important;
				}
				
				.body-text .link
				{
					color: rgb(216, 255, 216);
				}
				
				.floating-settings-button-text
				{
					color: rgb(64, 64, 64);
				}
				
				
				
				.quote-text
				{
					color: rgb(192, 192, 192);
				}
				
				.quote-attribution
				{
					color: rgb(234, 234, 234);
				}
				
				
				
				.text-box
				{
					background-color: ${this.dark_theme_background_color};
					color: rgb(216, 216, 216);
					border-color: rgb(152, 152, 152);
				}
				
				.text-box:focus
				{
					border-color: rgb(216, 216, 216);
					color: rgb(255, 255, 255);
				}
				
				
				
				.text-field
				{
					background-color: ${this.dark_theme_background_color};
					color: rgb(216, 216, 216);
					border-color: rgb(152, 152, 152);
				}
				
				.text-field:focus
				{
					border-color: rgb(216, 216, 216);
					color: rgb(255, 255, 255);
				}
				
				
				
				.checkbox-container
				{
					border-color: rgb(216, 216, 216);
				}
				
				.checkbox-container > input ~ .checkbox
				{
					background-color: ${this.dark_theme_background_color};
				}

				.checkbox-container > input:checked ~ .checkbox
				{
					background-color: rgb(216, 216, 216);
				}
				
				
				
				.radio-button-container
				{
					border-color: rgb(216, 216, 216);
				}
				
				.radio-button-container > input ~ .radio-button
				{
					background-color: ${this.dark_theme_background_color};
				}

				.radio-button-container > input:checked ~ .radio-button
				{
					background-color: rgb(216, 216, 216);
				}
				
				
				
				.loading-spinner:after
				{
					border: 2px solid rgb(216, 216, 216);
					border-color: rgb(216, 216, 216) transparent rgb(216, 216, 216) transparent;
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
						
				
				
				.footer-button, .text-button, .nav-button, #output-canvas
				{
					border-color: rgb(152, 152, 152);
				}
				
				.line-break-1-1
				{
					opacity: 1;
				}
			`;
		}
	}
};