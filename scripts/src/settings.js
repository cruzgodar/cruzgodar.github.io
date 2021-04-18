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
		"content_animation": ["Content animation: enabled", "Content animation: disabled"],
		"banner_style": ["Banners: parallax", "Banners: simple"]
	},
	
	dark_theme_background_color: "rgb(24, 24, 24)",
	dark_theme_background_color_rgba: "rgba(24, 24, 24, ",
	
	
	
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
			"banner_style": this.get_url_var("banner_style"),
			"title_pages_seen": this.get_url_var("title_pages_seen")
		};
		
		
		
		window.matchMedia("(prefers-color-scheme: dark)").addListener((e) =>
		{
			if (e.matches && this.url_vars["theme"] !== 1)
			{
				this.toggle_setting("theme");
			}
			
			else if (!e.matches && this.url_vars["theme"] === 1)
			{
				this.toggle_setting("theme");
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
				this.toggle_setting(key, true);
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
	


	//Changes a setting.
	toggle: function(setting, no_animation = false)
	{
		let element = null;
		
		if (no_animation === false && (setting === "theme" || setting === "dark_theme_color" || setting === "contrast"))
		{
			element = Site.add_style(`
				html
				{
					transition: background-color .6s ease !important;
				}
				
				p, span, h1, h2, a, q, em, strong, dfn
				{
					transition: color .6s ease !important;
				}
				
				.text-box, .checkbox-container, .checkbox-container > input ~ .checkbox, .radio-button-container, .radio-button-container > input ~ .radio-button, .loading-spinner:after, #floating-footer-content, #floating-footer-button-background, .footer-button, .text-button, .nav-button
				{
					transition: background-color .6s ease, border-color .6s ease, color .6s ease !important;
				}
			`);
			
			
			
			//These elements have properties that cannot be animated. To get around this, we'll animate them out and then back in later. It's not perfect, but it's the best we can do without making 8 copies of each element and fading the correct one in as necessary.
			let difficult_elements = document.querySelectorAll(".line-break, #banner-gradient");
			
			for (let i = 0; i < difficult_elements.length; i++)
			{
				difficult_elements[i].classList.add("animated-opacity");
				
				difficult_elements[i].style.opacity = 0;
				
				setTimeout(() =>
				{
					difficult_elements[i].style.opacity = 1;
					
					setTimeout(() =>
					{
						difficult_elements[i].classList.remove("animated-opacity");
					}, 300);
				}, 600);
			}
			
			
			
			//These are pseudoelements. They cannot be selected by JS and therefore cannot be animated at all. Cool. The only option we have is to make them invisible in the css, and then later remove that style.
			let element_2 = Site.add_style(`
				.loading-spinner:after
				{
					opacity: 0 !important;
				}
			`);
			
			setTimeout(() =>
			{
				element_2.remove();
			}, 600);
		}
		
		
		
		if (setting === "theme")
		{
			this.toggle_theme();
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
		
		else if (setting === "banner_style")
		{
			this.toggle_banner_style();
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
			}, 600);
		}
	},



	//Changes the theme and animates elements.
	toggle_theme: function()
	{
		try {document.querySelector("#theme-button-row").style.opacity = 0;}
		catch(ex) {}
		
		
		
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
					let element = Site.add_style(this.get_settings_style("dark_contrast"), false);
					
					try {document.querySelector("#theme-contrast-adjust").remove();}
					catch(ex) {}
					
					try {element.id = "theme-contrast-adjust";}
					catch(ex) {}
					
					this.clear_weird_inline_styles();
				}, 600);
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
				}, 600);
			}
			
			
			
			try {document.querySelector("#theme-button-row").style.opacity = 0;}
			catch(ex) {}
			
			setTimeout(() =>
			{
	 			try {document.querySelector("#theme-button-text").textContent = this.texts["theme"][1];}
	 			catch(ex) {}
			}, 300);
			
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
					let element = Site.add_style(this.get_settings_style("contrast"), false);
					
					try {document.querySelector("#theme-contrast-adjust").remove();}
					catch(ex) {}
					
					try {element.id = "theme-contrast-adjust";}
					catch(ex) {}
					
					this.clear_weird_inline_styles();
				}, 600);
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
				}, 600);
			}
			
			
			
			setTimeout(() =>
			{
				try {document.querySelector("#theme-button-text").textContent = this.texts["theme"][0];}
				catch(ex) {}
			}, 300);
			
			this.url_vars["theme"] = 0;
		}
		
		
		
		setTimeout(() =>
		{
			try
			{
				setTimeout(() =>
				{
					try {document.querySelector("#theme-button-row").style.opacity = 1;}
					catch(ex) {}
				}, 50);
			}
			
			catch(ex) {}
		}, 300);
	},



	toggle_dark_theme_color: function()
	{
		try {document.querySelector("#dark-theme-color-button-row").style.opacity = 0;}
		catch(ex) {}
		
		
		
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
			}, 600);
			
			
			
			setTimeout(() =>
			{
				try {document.querySelector("#dark-theme-color-button-text").textContent = this.texts["dark_theme_color"][1];}
				catch(ex) {}
			}, 300);
			
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
			}, 600);
			
			
			
			setTimeout(() =>
			{
				try {document.querySelector("#dark-theme-color-button-text").textContent = this.texts["dark_theme_color"][0];}
				catch(ex) {}
			}, 300);
			
			this.url_vars["dark_theme_color"] = 0;
		}
		
		
		
		setTimeout(() =>
		{
			try
			{
				setTimeout(() =>
				{
					document.querySelector("#dark-theme-color-button-row").style.opacity = 1;
				}, 50);
			}
			
			catch(ex) {}
		}, 300);
	},



	toggle_contrast: function()
	{
		try {document.querySelector("#contrast-button-row").style.opacity = 0;}
		catch(ex) {}
		
		
		
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
				}, 600);
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
				}, 600);
			}
			
			
			setTimeout(() =>
			{
				try {document.querySelector("#contrast-button-text").textContent = this.texts["contrast"][1];}
				catch(ex) {}
			}, 300);
			
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
				}, 600);
			}
			
			
			
			else
			{
				this.animate_theme_contrast("");
				
				
				
				setTimeout(() =>
				{
					try {document.querySelector("#theme-contrast-adjust").remove();}
					catch(ex) {}
					
					this.clear_weird_inline_styles();
				}, 600);
			}
			
			
			
			setTimeout(() =>
			{
				try {document.querySelector("#contrast-button-text").textContent = this.texts["contrast"][0];}
				catch(ex) {}
			}, 300);
			
			this.url_vars["contrast"] = 0;
		}
		
		
		
		setTimeout(() =>
		{
			try
			{
				setTimeout(() =>
				{
					document.querySelector("#contrast-button-row").style.opacity = 1;
				}, 50);
			}
			
			catch(ex) {}
		}, 300);
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
				
				
				
				try {document.querySelector("#text-size-button-text").textContent = this.texts["text_size"][1];}
				catch(ex) {}
			}, 300);
				
			this.url_vars["text_size"] = 1;
		}
			
		else
		{
			setTimeout(() =>
			{
				try {document.querySelector("#text-size-adjust").remove();}
				catch(ex) {}
				
				
				
				try {document.querySelector("#text-size-button-text").textContent = this.texts["text_size"][0];}
				catch(ex) {}
			}, 300);
				
			this.url_vars["text_size"] = 0;
		}
		
		
		
		setTimeout(() =>
		{
			setTimeout(() =>
			{
				document.body.style.opacity = 1;
			}, 50);
		}, 300);
	},



	toggle_font: function()
	{
		if ("writing_page" in Page.settings && Page.settings["writing_page"])
		{
			document.body.style.opacity = 0;
		}
		
		
		
		try {document.querySelector("#font-button-row").style.opacity = 0;}
		catch(ex) {}
		
		
		
		//Sans to serif
		if (this.url_vars["font"] === 0)
		{
			setTimeout(() =>
			{
				if ("writing_page" in Page.settings && Page.settings["writing_page"])
				{
					Page.set_element_styles(".body-text, .heading-text", "font-family", "'Gentium Book Basic', serif");
				}
				
				try {document.querySelector("#font-button-text").textContent = this.texts["font"][1];}
				catch(ex) {}
			}, 300);
			
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
				
				try {document.querySelector("#font-button-text").textContent = this.texts["font"][0];}
				catch(ex) {}
			}, 300);
			
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
			}, 300);
		}
		
		
		
		setTimeout(() =>
		{
			try
			{
				setTimeout(() =>
				{
					document.querySelector("#font-button-row").style.opacity = 1;
					
					Page.Load.AOS.on_resize();
				}, 50);
			}
			
			catch(ex) {}
		}, 300);
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
					}, 300);
				}, 50);
			}, 300);
			
			
			
			setTimeout(() =>
			{
				try {document.querySelector("#content-animation-button-text").textContent = this.texts["content_animation"][1];}
				catch(ex) {}
			}, 300);
			
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



	toggle_banner_style: function()
	{
		document.body.style.opacity = 0;
		
		setTimeout(() =>
		{
			if (this.url_vars["banner_style"] === 0)
			{
				try {document.querySelector("#banner-adjust").remove();}
				catch(ex) {}
				
				
				
				let element = Site.add_style(`
					#banner, .name-text-container
					{
						position: absolute !important;
					}
					
					#banner-gradient
					{
						content: "";
						position: absolute;
						
						width: 100vw;
						height: 30vh;
						margin-top: 70vh;
						
						background: -moz-linear-gradient(top, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%);
						background: -webkit-linear-gradient(top, rgba(255,255,255,0) 0%,rgba(255,255,255,1) 100%);
						background: linear-gradient(to bottom, rgba(255,255,255,0) 0%,rgba(255,255,255,1) 100%);
					}
				`, false);
				
				element.id = "banner-adjust";
				
				
				
				//If we don't do this, the banner will be stuck at whatever opacity it was at before.
				try {document.querySelector("#banner").style.opacity = 1;}
				catch(ex) {}
				
				Page.set_element_styles(".name-text", "opacity", 1);
				
				
				
				try {document.querySelector("#banner-style-button-text").textContent = this.texts["banner_style"][1];}
				catch(ex) {}
				
				this.url_vars["banner_style"] = 1;
			}
			
			
			
			else
			{
				try {document.querySelector("#banner-adjust").remove();}
				catch(ex) {}
				
				try {document.querySelector("#banner-style-button-text").textContent = this.texts["banner_style"][0];}
				catch(ex) {}
			
			
				
				this.url_vars["banner_style"] = 0;
				
				Page.Banner.on_scroll(window.scrollY);
			}
			
			
			
			setTimeout(() =>
			{
				document.body.style.opacity = 1;
			}, 50);
		}, 300);
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
			
			
			
			Page.set_element_styles(".checkbox-container > input ~ .checkbox", "background-color", "rgb(255, 255, 255)");
			
			Page.set_element_styles(".checkbox-container > input:checked ~ .checkbox", "background-color", "rgb(127, 127, 127)");
			
			
			
			Page.set_element_styles(".radio-button-container > input ~ .radio-button", "background-color", "rgb(255, 255, 255)");
			
			Page.set_element_styles(".radio-button-container > input:checked ~ .radio-button", "background-color", "rgb(127, 127, 127)");
			
			
			
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
			
			
			
			Page.set_element_styles(".checkbox-container > input ~ .checkbox", "background-color", this.dark_theme_background_color);
			
			Page.set_element_styles(".checkbox-container > input:checked ~ .checkbox", "background-color", "rgb(152, 152, 152)");
			
			
			
			Page.set_element_styles(".radio-button-container > input ~ .radio-button", "background-color", this.dark_theme_background_color);
			
			Page.set_element_styles(".radio-button-container > input:checked ~ .radio-button", "background-color", "rgb(152, 152, 152)");
			
			
			
			Page.set_element_styles("#floating-footer-content, #floating-footer-button-background", "background-color", this.dark_theme_background_color);
			
			
			
			Page.set_element_styles(".footer-button, .text-button, .nav-button, #output-canvas", "border-color", "rgb(152, 152, 152)");
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
			
			
			
			Page.set_element_styles(".checkbox-container > input ~ .checkbox", "background-color", "rgb(255, 255, 255)");
			
			Page.set_element_styles(".checkbox-container > input:checked ~ .checkbox", "background-color", "rgb(64, 64, 64)");
			
			
			
			Page.set_element_styles(".radio-button-container > input ~ .radio-button", "background-color", "rgb(255, 255, 255)");
			
			Page.set_element_styles(".radio-button-container > input:checked ~ .radio-button", "background-color", "rgb(64, 64, 64)");
			
			
			
			Page.set_element_styles("#floating-footer-content, #floating-footer-button-background", "background-color", "rgb(255, 255, 255)");
			
			
			
			Page.set_element_styles(".footer-button, .text-button, .nav-button, #output-canvas", "border-color", "rgb(64, 64, 64)");
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
			
			
			
			Page.set_element_styles(".checkbox-container", "border-color", "rgb(216, 216, 216)");
			
			Page.set_element_styles(".checkbox-container > input ~ .checkbox", "background-color", this.dark_theme_background_color);
			
			Page.set_element_styles(".checkbox-container > input:checked ~ .checkbox", "background-color", "rgb(216, 216, 216)");
			
			
			
			Page.set_element_styles(".radio-button-container", "border-color", "rgb(216, 216, 216)");
			
			Page.set_element_styles(".radio-button-container > input ~ .radio-button", "background-color", this.dark_theme_background_color);
			
			Page.set_element_styles(".radio-button-container > input:checked ~ .radio-button", "background-color", "rgb(216, 216, 216)");
			
			
			
			Page.set_element_styles("#floating-footer-content, #floating-footer-button-background", "background-color", this.dark_theme_background_color);
			
			
			
			Page.set_element_styles(".footer-button, .text-button, .nav-button, #output-canvas", "border-color", "rgb(152, 152, 152)");
		}
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
				
				
				
				.line-break
				{
					background: -moz-linear-gradient(left, ${this.dark_theme_background_color} 0%, rgb(116,116,116) 50%, ${this.dark_theme_background_color} 100%);
					background: -webkit-linear-gradient(left, ${this.dark_theme_background_color} 0%,rgb(116,116,116) 50%,${this.dark_theme_background_color}) 100%);
					background: linear-gradient(to right, ${this.dark_theme_background_color} 0%,rgb(116,116,116) 50%,${this.dark_theme_background_color} 100%);
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
				
				
				
				.line-break
				{
					background: rgb(255, 255, 255);
					background: -moz-linear-gradient(left, rgb(255, 255, 255) 0%, rgb(120,120,120) 50%, rgb(255, 255, 255) 100%);
					background: -webkit-linear-gradient(left, rgb(255, 255, 255) 0%,rgb(120,120,120) 50%,rgb(255, 255, 255)) 100%);
					background: linear-gradient(to right, rgb(255, 255, 255) 0%,rgb(120,120,120) 50%,rgb(255, 255, 255) 100%);
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
				
				
				
				.line-break
				{
					background: ${this.dark_theme_background_color};
					background: -moz-linear-gradient(left, ${this.dark_theme_background_color} 0%, rgb(164,164,164) 50%, ${this.dark_theme_background_color} 100%);
					background: -webkit-linear-gradient(left, ${this.dark_theme_background_color} 0%,rgb(164,164,164) 50%,${this.dark_theme_background_color}) 100%);
					background: linear-gradient(to right, ${this.dark_theme_background_color} 0%,rgb(164,164,164) 50%,${this.dark_theme_background_color} 100%);
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
			`;
		}
	},
	
	
	
	Floating:
	{
		visible: false,
		
		
		
		load: function()
		{
			document.documentElement.addEventListener("touchstart", (e) =>
			{
				if (!this.visible)
				{
					return;
				}
				
				if (!(document.querySelector("#floating-settings").contains(e.target)))
				{
					this.hide();
				}
			});

			document.documentElement.addEventListener("mousedown", (e) =>
			{
				if (!this.visible)
				{
					return;
				}
				
				if (!(document.querySelector("#floating-settings").contains(e.target)))
				{
					this.hide();
				}
			});
		},
		
		
		
		show: function()
		{	
			if (this.visible)
			{
				return;
			}
			
			
			
			this.visible = true;
			
			document.body.firstElementChild.insertAdjacentHTML("beforebegin", `
				<div id="floating-settings" tabindex="-1">
					<div class="floating-settings-page">
						<div id="theme-button-row" class="floating-settings-button-row"></div>
						<div id="dark-theme-color-button-row" class="floating-settings-button-row"></div>
						<div id="contrast-button-row" class="floating-settings-button-row"></div>
						<div id="text-size-button-row" class="floating-settings-button-row"></div>
						<div id="font-button-row" class="floating-settings-button-row"></div>
						<div id="content-animation-button-row" class="floating-settings-button-row"></div>
						<div id="banner-style-button-row" class="floating-settings-button-row"></div>
						<div style="margin-top: -17px"></div>
					</div>
				</div>
			`);
			
			
			
			//I really don't like this.
			setTimeout(() =>
			{
				document.querySelector("#floating-settings").style.opacity = 1;
				
				//Nontouch browsers don't do scroll snapping very well.
				if (!Site.Interaction.currently_touch_device)
				{
					document.documentElement.style.overflowY = "hidden";
					document.body.style.overflowY = "scroll";
					
					document.querySelector("#floating-settings").addEventListener("mouseenter", () =>
					{
						document.documentElement.style.overflowY = "hidden";
						document.body.style.overflowY = "scroll";
					});
					
					document.querySelector("#floating-settings").addEventListener("mouseleave", () =>
					{
						document.documentElement.style.overflowY = "scroll";
						document.body.style.overflowY = "hidden";
					});
				}
			}, 10);
			
			
			
			if (Page.Footer.Floating.is_visible)
			{
				document.querySelector("#floating-footer").style.opacity = 0;
				
				Page.Footer.Floating.is_visible = false;
				
				setTimeout(() =>
				{
					try
					{
						document.querySelector("#floating-footer").style.display = "none";
						document.querySelector("#floating-footer-touch-target").style.display = "block";
					}
					
					catch(ex) {}
				}, 300);
			}
			
			
			
			setTimeout(() =>
			{
				document.querySelector("#floating-settings").scrollTop = 0;
				
				
				
				let query_strings = Object.keys(Site.Settings.url_vars);
				
				
				
				//These aren't seen by set_up_aos(), so we'll do things the old-fashioned way.
				document.querySelector("#theme-button-row").innerHTML = `
					<div class="focus-on-child" data-aos="zoom-out" data-aos-anchor="body" tabindex="2">
						<input type="image" class="footer-button" src="/graphics/button-icons/moon.png" alt="Change Theme" onclick="Site.Settings.toggle('theme')" tabindex="-1">
					</div>
					
					<div class="floating-settings-button-text-container" data-aos="fade-left" data-aos-anchor="body">
						<p id="theme-button-text" class="floating-settings-button-text">
							${Site.Settings.texts[query_strings[0]][Site.Settings.url_vars[query_strings[0]]]}
						</p>
					</div>
				`;
				
				
				
				setTimeout(() =>
				{
					document.querySelector("#dark-theme-color-button-row").innerHTML = `
						<div class="focus-on-child" data-aos="zoom-out" data-aos-anchor="body" tabindex="2">
							<input type="image" class="footer-button" src="/graphics/button-icons/moon-stars.png" alt="Change Theme" onclick="Site.Settings.toggle('dark_theme_color')" tabindex="-1">
						</div>
						
						<div class="floating-settings-button-text-container" data-aos="fade-left" data-aos-anchor="body">
							<p id="dark-theme-color-button-text" class="floating-settings-button-text">
								${Site.Settings.texts[query_strings[1]][Site.Settings.url_vars[query_strings[1]]]}
							</p>
						</div>
					`;
				}, 100);
				
				
				
				setTimeout(() =>
				{
					document.querySelector("#contrast-button-row").innerHTML = `
						<div class="focus-on-child" data-aos="zoom-out" data-aos-anchor="body" tabindex="2">
							<input type="image" class="footer-button" src="/graphics/button-icons/contrast.png" alt="Change Theme" onclick="Site.Settings.toggle('contrast')" tabindex="-1">
						</div>
						
						<div class="floating-settings-button-text-container" data-aos="fade-left" data-aos-anchor="body">
							<p id="contrast-button-text" class="floating-settings-button-text">
								${Site.Settings.texts[query_strings[2]][Site.Settings.url_vars[query_strings[2]]]}
							</p>
						</div>
					`;
				}, 200);
				
				
				
				setTimeout(() =>
				{
					document.querySelector("#text-size-button-row").innerHTML = `
						<div class="focus-on-child" data-aos="zoom-out" data-aos-anchor="body" tabindex="2">
							<input type="image" class="footer-button" src="/graphics/button-icons/text-size.png" alt="Change Theme" onclick="Site.Settings.toggle('text_size')" tabindex="-1">
						</div>
						
						<div class="floating-settings-button-text-container" data-aos="fade-left" data-aos-anchor="body">
							<p id="text-size-button-text" class="floating-settings-button-text">
								${Site.Settings.texts[query_strings[3]][Site.Settings.url_vars[query_strings[3]]]}
							</p>
						</div>
					`;
				}, 300);
				
				
				
				setTimeout(() =>
				{
					document.querySelector("#font-button-row").innerHTML = `
						<div class="focus-on-child" data-aos="zoom-out" data-aos-anchor="body" tabindex="2">
							<input type="image" class="footer-button" src="/graphics/button-icons/font.png" alt="Change Theme" onclick="Site.Settings.toggle('font')" tabindex="-1">
						</div>
						
						<div class="floating-settings-button-text-container" data-aos="fade-left" data-aos-anchor="body">
							<p id="font-button-text" class="floating-settings-button-text">
								${Site.Settings.texts[query_strings[4]][Site.Settings.url_vars[query_strings[4]]]}
							</p>
						</div>
					`;
					
					
					
					document.querySelector("#content-animation-button-row").innerHTML = `
						<div class="focus-on-child" data-aos="zoom-out" data-aos-anchor="body" tabindex="2">
							<input type="image" class="footer-button" src="/graphics/button-icons/pop.png" alt="Change Theme" onclick="Site.Settings.toggle('content_animation')" tabindex="-1">
						</div>
						
						<div class="floating-settings-button-text-container" data-aos="fade-left" data-aos-anchor="body">
							<p id="content-animation-button-text" class="floating-settings-button-text">
								${Site.Settings.texts[query_strings[5]][Site.Settings.url_vars[query_strings[5]]]}
							</p>
						</div>
					`;
					
					
					
					document.querySelector("#banner-style-button-row").innerHTML = `
						<div class="focus-on-child" data-aos="zoom-out" data-aos-anchor="body" tabindex="2">
							<input type="image" class="footer-button" src="/graphics/button-icons/picture.png" alt="Change Theme" onclick="Site.Settings.toggle('banner_style')" tabindex="-1">
						</div>
						
						<div class="floating-settings-button-text-container" data-aos="fade-left" data-aos-anchor="body">
							<p id="banner-style-button-text" class="floating-settings-button-text">
								${Site.Settings.texts[query_strings[6]][Site.Settings.url_vars[query_strings[6]]]}
							</p>
						</div>
					`;
				}, 400);
				
				
				
				setTimeout(() =>
				{
					let elements = document.querySelectorAll(".floating-settings-button-row div .footer-button");
					
					for (let i = 0; i < elements.length; i++)
					{
						Page.Load.HoverEvents.add(elements[i]);
					}
					
					
					
					elements = document.querySelectorAll(".floating-settings-button-row .focus-on-child");
				
					for (let i = 0; i < elements.length; i++)
					{
						elements[i].addEventListener("focus", () =>
						{
							elements[i].children[0].focus();
						});
					}
					
					
					
					document.querySelector("#floating-settings").focus();
				}, 500);
			}, 100);
		},



		hide: function()
		{
			document.querySelector("#floating-settings").style.opacity = 0;
			
			document.documentElement.style.overflowY = "scroll";
			
			setTimeout(() =>
			{
				document.querySelector("#floating-settings").remove();
				
				this.visible = false;
			}, 300);
		}
	}
};