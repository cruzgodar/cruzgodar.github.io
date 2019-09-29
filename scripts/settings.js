//Handles the various settings' effects on the page. These functions typically add or remove a style tag that handles all the changes. Some settings, like the theme, require an animation.



function get_url_var(id)
{
	let query = window.location.search.substring(1);
	let vars = query.split("&");
	
	let pair = [];
	
	for (let i = 0; i < vars.length; i++)
	{
		pair = vars[i].split("=");
		
		if (pair[0] == id)
		{
			return pair[1];
		}
	}
	
	return null;
}



let url_vars = 
{
	"theme": get_url_var("theme"),
	"dark_theme_color": get_url_var("dark_theme_color"),
	"contrast": get_url_var("contrast"),
	"text_size": get_url_var("text_size"),
	"font": get_url_var("font"),
	"writing_style": get_url_var("writing_style"),
	"comments": get_url_var("comments"),
	"content_animation": get_url_var("content_animation"),
	"banner_style": get_url_var("banner_style")
};

if (window.matchMedia("(prefers-color-scheme: dark)").matches && url_vars["theme"] == null)
{
	url_vars["theme"] = 1;
}



let url_var_functions =
{
	"theme": switch_theme,
	"dark_theme_color": switch_dark_theme_color,
	"contrast": switch_contrast,
	"text_size": switch_text_size,
	"font": switch_font,
	"writing_style": switch_writing_style,
	"comments": switch_comments,
	"content_animation": switch_content_animation,
	"banner_style": switch_banner_style
};



let settings_texts =
{
	"theme": ["Theme: light", "Theme: dark"],
	"dark_theme_color": ["Dark theme color: dark gray", "Dark theme color: black"],
	"contrast": ["Contrast: normal", "Contrast: high"],
	"text_size": ["Text size: normal", "Text size: large"],
	"font": ["Font: always sans serif", "Font: serif on writing"],
	"writing_style": ["Text on writing pages: double-spaced", "Text on writing pages: single-spaced and indented"],
	"comments": ["Comments: enabled", "Comments: disabled"],
	"content_animation": ["Content animation: enabled", "Content animation: disabled"],
	"banner_style": ["Banners: parallax", "Banners: simple"]
};



let dark_theme_background_color = "rgb(24, 24, 24)";
let dark_theme_background_color_rgba = "rgba(24, 24, 24, ";

if (url_vars["dark_theme_color"] == 1)
{
	dark_theme_background_color = "rgb(0, 0, 0)";
	dark_theme_background_color_rgba = "rgba(0, 0, 0, ";
}



function init_settings()
{
	for (key in url_vars)
	{
		if (url_vars[key] == null)
		{
			url_vars[key] = 0;
		}
		
		else if (url_vars[key] == 1)
		{
			url_vars[key] = 0;
			url_var_functions[key]();
		}
	}
}





//Changes the theme and animates elements.
function switch_theme()
{
	try {document.querySelector("#theme-button-row").style.opacity = 0;}
	catch(ex) {}
	
	
	
	//Light to dark
	if (url_vars["theme"] == 0)
	{
		if (url_vars["dark_theme_color"] != 1)
		{
			document.documentElement.style.backgroundColor = "rgb(24, 24, 24)";
		}
		
		else
		{
			document.documentElement.style.backgroundColor = "rgb(0, 0, 0)";
		}
		
		
		
		if (url_vars["contrast"] == 1)
		{
			set_element_styles(".heading-text", "color", "rgb(255, 255, 255)");
			
			set_element_styles(".body-text", "color", "rgb(216, 216, 216)");
			
			set_element_styles(".text-button", "color", "rgb(64, 64, 64)");
			
			set_element_styles(".footer-button, .text-button", "border-color", "rgb(127, 127, 127)");
			
			
			
			setTimeout(function()
			{
				let element = add_style(get_settings_style("dark_contrast"), false);
				
				try {document.querySelector("#theme-contrast-adjust").remove();}
				catch(ex) {}
				
				try {element.id = "theme-contrast-adjust";}
				catch(ex) {}
			}, 600);
		}
		
		
		
		else
		{
			set_element_styles(".heading-text", "color", "rgb(255, 255, 255)");
			
			set_element_styles(".body-text", "color", "rgb(152, 152, 152)");
			
			set_element_styles(".text-button", "color", "rgb(127, 127, 127)");
			
			set_element_styles(".footer-button, .text-button", "border-color", "rgb(127, 127, 127)");
			
			
			
			setTimeout(function()
			{
				let element = add_style(get_settings_style("dark"), false);
				
				try {document.querySelector("#theme-contrast-adjust").remove();}
				catch(ex) {}
				
				try {element.id = "theme-contrast-adjust";}
				catch(ex) {}
			}, 600);
		}
		
		
		
		try {document.querySelector("#theme-button-row").style.opacity = 0;}
		catch(ex) {}
		
		setTimeout(function()
		{
 			try {document.querySelector("#theme-button-text").textContent = settings_texts["theme"][1];}
 			catch(ex) {}
		}, 300);
		
		url_vars["theme"] = 1;
	}
	
	
	
	//Dark to light
	else
	{
		document.documentElement.style.backgroundColor = "rgb(255, 255, 255)";
		
		
		
		if (url_vars["contrast"] == 1)
		{
			set_element_styles(".heading-text", "color", "rgb(0, 0, 0)");
			
			set_element_styles(".body-text", "color", "rgb(64, 64, 64)");
			
			set_element_styles(".text-button", "color", "rgb(64, 64, 64)");
			
			set_element_styles(".footer-button, .text-button", "border-color", "rgb(64, 64, 64)");
			
			
			
			setTimeout(function()
			{
				let element = add_style(get_settings_style("contrast"), false);
				
				try {document.querySelector("#theme-contrast-adjust").remove();}
				catch(ex) {}
				
				try {element.id = "theme-contrast-adjust";}
				catch(ex) {}
			}, 600);
		}
		
		
		
		else
		{
			set_element_styles(".heading-text", "color", "rgb(0, 0, 0)");
			
			set_element_styles(".body-text", "color", "rgb(127, 127, 127)");
			
			set_element_styles(".text-button", "color", "rgb(127, 127, 127)");
			
			set_element_styles(".footer-button, .text-button", "border-color", "rgb(127, 127, 127)");
			
			
			
			setTimeout(function()
			{
				try {document.querySelector("#theme-contrast-adjust").remove();}
				catch(ex) {}
			}, 600);
		}
		
		
		
		setTimeout(function()
		{
			try {document.querySelector("#theme-button-text").textContent = settings_texts["theme"][0];}
			catch(ex) {}
		}, 300);
		
		url_vars["theme"] = 0;
	}
	
	
	
	setTimeout(function()
	{
		try {document.querySelector("#theme-button-row").style.opacity = 1;}
		catch(ex) {}
	}, 300);
	
	write_url_vars();
}





function switch_dark_theme_color()
{
	try {document.querySelector("#dark-theme-color-button-row").style.opacity = 0;}
	catch(ex) {}
	
	
	
	if (url_vars["dark_theme_color"] == 0)
	{
		dark_theme_background_color = "rgb(0, 0, 0)";
		dark_theme_background_color_rgba = "rgba(0, 0, 0, ";
		
		if (url_vars["theme"] == 1)
		{
			document.documentElement.style.backgroundColor = "rgb(0, 0, 0)";
		}
		
		
		
		setTimeout(function()
		{
			let element = null;
			
			if (url_vars["theme"] == 1)
			{
				if (url_vars["contrast"] == 1)
				{
					element = add_style(get_settings_style("dark_contrast"), false);
				}
				
				else
				{
					element = add_style(get_settings_style("dark"), false);
				}
			}
			
			else if (url_vars["contrast"] == 1)
			{
				element = add_style(get_settings_style("contrast"), false);
			}
			
			
			
			try {document.querySelector("#theme-contrast-adjust").remove();}
			catch(ex) {}
			
			try {element.id = "theme-contrast-adjust";}
			catch(ex) {}
		}, 600);
		
		
		
		setTimeout(function()
		{
			try {document.querySelector("#dark-theme-color-button-text").textContent = settings_texts["dark_theme_color"][1];}
			catch(ex) {}
		}, 300);
		
		url_vars["dark_theme_color"] = 1;
	}
	
	
	
	else
	{
		dark_theme_background_color = "rgb(24, 24, 24)";
		dark_theme_background_color_rgba = "rgba(24, 24, 24, ";
		
		if (url_vars["theme"] == 1)
		{
			document.documentElement.style.backgroundColor = "rgb(24, 24, 24)";
		}
		
		
		
		setTimeout(function()
		{
			let element = null;
			
			if (url_vars["theme"] == 1)
			{
				if (url_vars["contrast"] == 1)
				{
					element = add_style(get_settings_style("dark_contrast"), false);
				}
				
				else
				{
					element = add_style(get_settings_style("dark"), false);
				}
			}
			
			else if (url_vars["contrast"] == 1)
			{
				element = add_style(get_settings_style("contrast"), false);
			}
			
			
			
			try {document.querySelector("#theme-contrast-adjust").remove();}
			catch(ex) {}
			
			try {element.id = "theme-contrast-adjust";}
			catch(ex) {}
		}, 600);
		
		
		
		setTimeout(function()
		{
			try {document.querySelector("#dark-theme-color-button-text").textContent = settings_texts["dark_theme_color"][0];}
			catch(ex) {}
		}, 300);
		
		url_vars["dark_theme_color"] = 0;
	}
	
	
	
	setTimeout(function()
	{
		try {document.querySelector("#dark-theme-color-button-row").style.opacity = 1;}
		catch(ex) {}
	}, 300);
	
	write_url_vars();
}





function switch_contrast()
{
	try {document.querySelector("#contrast-button-row").style.opacity = 0;}
	catch(ex) {}
	
	
	
	//Default to high
	if (url_vars["contrast"] == 0)
	{
		if (url_vars["theme"] == 1)
		{
			set_element_styles(".heading-text", "color", "rgb(255, 255, 255)");
			
			set_element_styles(".body-text", "color", "rgb(216, 216, 216)");
			
			set_element_styles(".text-button", "color", "rgb(64, 64, 64)");
			
			set_element_styles(".footer-button, .text-button", "border-color", "rgb(127, 127, 127)");
			
			
			
			setTimeout(function()
			{
				let element = add_style(get_settings_style("dark_contrast"), false);
				
				try {document.querySelector("#theme-contrast-adjust").remove();}
				catch(ex) {}
				
				try {element.id = "theme-contrast-adjust";}
				catch(ex) {}
			}, 600);
		}
		
		
		
		else
		{
			set_element_styles(".heading-text", "color", "rgb(0, 0, 0)");
			
			set_element_styles(".body-text", "color", "rgb(64, 64, 64)");
			
			set_element_styles(".text-button", "color", "rgb(64, 64, 64)");
			
			set_element_styles(".footer-button, .text-button", "border-color", "rgb(64, 64, 64)");
			
			
			
			setTimeout(function()
			{
				let element = add_style(get_settings_style("contrast"), false);
				
				try {document.querySelector("#theme-contrast-adjust").remove();}
				catch(ex) {}
				
				try {element.id = "theme-contrast-adjust";}
				catch(ex) {}
			}, 600);
		}
		
		
		setTimeout(function()
		{
			try {document.querySelector("#contrast-button-text").textContent = settings_texts["contrast"][1];}
			catch(ex) {}
		}, 300);
		
		url_vars["contrast"] = 1;
	}
	
	
	
	//High to default
	else
	{
		if (url_vars["theme"] == 1)
		{
			set_element_styles(".heading-text", "color", "rgb(255, 255, 255)");
			
			set_element_styles(".body-text", "color", "rgb(152, 152, 152)");
			
			set_element_styles(".text-button", "color", "rgb(127, 127, 127)");
			
			set_element_styles(".footer-button, .text-button", "border-color", "rgb(127, 127, 127)");
			
			
			
			setTimeout(function()
			{
				let element = add_style(get_settings_style("dark"), false);
				
				try {document.querySelector("#theme-contrast-adjust").remove();}
				catch(ex) {}
				
				try {element.id = "theme-contrast-adjust";}
				catch(ex) {}
			}, 600);
		}
		
		
		
		else
		{
			set_element_styles(".heading-text", "color", "rgb(0, 0, 0)");
			
			set_element_styles(".body-text", "color", "rgb(127, 127, 127)");
			
			set_element_styles(".text-button", "color", "rgb(127, 127, 127)");
			
			set_element_styles(".footer-button, .text-button", "border-color", "rgb(127, 127, 127)");
			
			
			
			setTimeout(function()
			{
				try {document.querySelector("#theme-contrast-adjust").remove();}
				catch(ex) {}
			}, 600);
		}
		
		
		
		setTimeout(function()
		{
			try {document.querySelector("#contrast-button-text").textContent = settings_texts["contrast"][0];}
			catch(ex) {}
		}, 300);
		
		url_vars["contrast"] = 0;
	}
	
	
	
	setTimeout(function()
	{
		try {document.querySelector("#contrast-button-row").style.opacity = 1;}
		catch(ex) {}
	}, 300);
	
	write_url_vars();
}





function switch_text_size()
{
	document.body.classList.add("animated-opacity");
	document.body.style.opacity = 0;
	
	
	
	//Normal to large
	if (url_vars["text_size"] == 0)
	{
		setTimeout(function()
		{
			try {document.querySelector("#text-size-adjust").remove();}
			catch(ex) {}
			
			let element = add_style(`
				html
				{
					font-size: 18px;
				}
				
				@media screen and (min-width: 1000px)
				{
					html
					{
						font-size: 22px;
					}
				}
			`, false);
			
			element.id = "text-size-adjust";
			
			
			
			try {document.querySelector("#text-size-button-text").textContent = settings_texts["text_size"][1];}
			catch(ex) {}
		}, 300);
			
		url_vars["text_size"] = 1;
	}
		
	else
	{
		setTimeout(function()
		{
			try {document.querySelector("#text-size-adjust").remove();}
			catch(ex) {}
			
			
			
			try {document.querySelector("#text-size-button-text").textContent = settings_texts["text_size"][0];}
			catch(ex) {}
		}, 300);
			
		url_vars["text_size"] = 0;
	}
	
	
	
	setTimeout(function()
	{
		document.body.style.opacity = 1;
			
		setTimeout(function()
		{
			document.body.classList.remove("animated-opacity");
		}, 300);
	}, 300);
	
	write_url_vars();
}





function switch_font()
{
	try {document.querySelector("#font-button-row").style.opacity = 0;}
	catch(ex) {}
	
	
	
	//Sans to serif
	if (url_vars["font"] == 0)
	{
		setTimeout(function()
		{
			try {document.querySelector("#font-button-text").textContent = settings_texts["font"][1];}
			catch(ex) {}
		}, 300);
		
		url_vars["font"] = 1;
	}
	
	
	
	//Serif to sans
	else
	{
		setTimeout(function()
		{
			try {document.querySelector("#font-button-text").textContent = settings_texts["font"][0];}
			catch(ex) {}
		}, 300);
		
		url_vars["font"] = 0;
	}
	
	
	
	setTimeout(function()
	{
		try {document.querySelector("#font-button-row").style.opacity = 1;}
		catch(ex) {}
	}, 300);
	
	write_url_vars();
}





function switch_writing_style()
{
	try {document.querySelector("#writing-style-button-row").style.opacity = 0;}
	catch(ex) {}
	
	
	
	//Double-spaced to indented
	if (url_vars["writing_style"] == 0)
	{
		setTimeout(function()
		{
			try {document.querySelector("#writing-style-button-text").textContent = settings_texts["writing_style"][1]}
			catch(ex) {}
		}, 300);
		
		url_vars["writing_style"] = 1;
	}
	
	
	
	//Indented to double-spaced
	else
	{
		setTimeout(function()
		{
			try {document.querySelector("#writing-style-button-text").textContent = settings_texts["writing_style"][0];}
			catch(ex) {}
		}, 300);
		
		url_vars["writing_style"] = 0;
	}
	
	
	
	setTimeout(function()
	{
		try {document.querySelector("#writing-style-button-row").style.opacity = 1;}
		catch(ex) {}
	}, 300);
	
	write_url_vars();
}





function switch_comments()
{
	try {document.querySelector("#comments-button-row").style.opacity = 0;}
	catch(ex) {}
	
	
	
	if (url_vars["comments"] == 0)
	{
		setTimeout(function()
		{
			try {document.querySelector("#comments-button-text").textContent = settings_texts["comments"][1];}
			catch(ex) {}
		}, 300);
		
		url_vars["comments"] = 1;
	}
	
	
	
	else
	{
		setTimeout(function()
		{
			try {document.querySelector("#comments-button-text").textContent = settings_texts["comments"][0];}
			catch(ex) {}
		}, 300);
		
		url_vars["comments"] = 0;
	}
	
	
	
	setTimeout(function()
	{
		try {document.querySelector("#comments-button-row").style.opacity = 1;}
		catch(ex) {}
	}, 300);
	
	write_url_vars();
}





function switch_content_animation()
{
	try {document.querySelector("#content-animation-button-row").style.opacity = 0;}
	catch(ex) {}
	
	
	
	if (url_vars["content_animation"] == 0)
	{
		document.documentElement.classList.remove("animated-opacity");
		
		
		
		setTimeout(function()
		{
			try {document.querySelector("#content-animation-button-text").textContent = settings_texts["content_animation"][1];}
			catch(ex) {}
		}, 300);
		
		url_vars["content_animation"] = 1;
	}
	
	
	
	else
	{
		document.documentElement.classList.add("animated-opacity");
		
		
		
		setTimeout(function()
		{
			try {document.querySelector("#content-animation-button-text").textContent = settings_texts["content_animation"][0];}
			catch(ex) {}
		}, 300);
		
		url_vars["content_animation"] = 0;
	}
	
	
	
	setTimeout(function()
	{
		try {document.querySelector("#content-animation-button-row").style.opacity = 1;}
		catch(ex) {}
	}, 300);
	
	write_url_vars();
}





function switch_banner_style()
{
	try {document.querySelector("#banner-style-button-row").style.opacity = 0;}
	catch(ex) {}
	
	
	
	if (url_vars["banner_style"] == 0)
	{
		try {document.querySelector("#banner-adjust").remove();}
		catch(ex) {}
		
		
		
		let element = add_style(`
			.banner:before
			{
				position: absolute !important;
			}
			
			.banner:after
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
		
		
		
		setTimeout(function()
		{
			try {document.querySelector("#banner-style-button-text").textContent = settings_texts["banner_style"][1];}
			catch(ex) {}
		}, 300);
		
		url_vars["banner_style"] = 1;
	}
	
	else
	{
		try {document.querySelector("#banner-adjust").remove();}
		catch(ex) {}
		
		
		
		setTimeout(function()
		{
			try {document.querySelector("#banner-style-button-text").textContent = settings_texts["banner_style"][0];}
			catch(ex) {}
		}, 300);
		
		url_vars["banner_style"] = 0;
	}
	
	
	
	setTimeout(function()
	{
		try {document.querySelector("#banner-style-button-row").style.opacity = 1;}
		catch(ex) {}
	}, 300);
	
	write_url_vars();
}





function get_settings_style(settings) 
{
	if (settings == "dark")
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
			
			.body-text, .song-lyrics, .image-link-subtext
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
				background: -moz-linear-gradient(left, ${dark_theme_background_color} 0%, rgb(116,116,116) 50%, ${dark_theme_background_color} 100%);
				background: -webkit-linear-gradient(left, ${dark_theme_background_color} 0%,rgb(116,116,116) 50%,${dark_theme_background_color}) 100%);
				background: linear-gradient(to right, ${dark_theme_background_color} 0%,rgb(116,116,116) 50%,${dark_theme_background_color} 100%);
			}
			
			.text-box
			{
				background-color: ${dark_theme_background_color};
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
				background-color: ${dark_theme_background_color};
			}

			.checkbox-container > input:checked ~ .checkbox
			{
				background-color: rgb(152, 152, 152);
			}
			
			
			
			#floating-footer-content, #floating-footer-button-background
			{
				background-color: ${dark_theme_background_color};
			}
			
			
			
			#banner:after, #floating-footer-gradient
			{
				background: -moz-linear-gradient(top, ${dark_theme_background_color_rgba}0) 0%, ${dark_theme_background_color_rgba}1) 100%) !important;
				background: -webkit-linear-gradient(top, ${dark_theme_background_color_rgba}0) 0%,${dark_theme_background_color_rgba}1) 100%) !important;
				background: linear-gradient(to bottom, ${dark_theme_background_color_rgba}0) 0%,${dark_theme_background_color_rgba}1) 100%) !important;
			}
			
			
			
			.footer-button, .text-button, .nav-button, .checkbox-container
			{
				border-color: rgb(152, 152, 152);
			}
		`;
	}
	
	
	
	else if (settings == "contrast")
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
			
			.body-text, .song-lyrics, .image-link-subtext, .text-button
			{
				color: rgb(64, 64, 64);
			}
			
			.body-text .link
			{
				color: rgb(64, 128, 64);
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
				color: rgb(152, 152, 152);
				border-color: rgb(88, 88, 88);
			}
			
			.text-box:focus
			{
				border-color: rgb(152, 152, 152);
				color: rgb(216, 216, 216);
			}
			
			

			.checkbox-container > input:checked ~ .checkbox
			{
				background-color: rgb(64, 64, 64);
			}
			
			
			
			.footer-button, .text-button, .nav-button, .checkbox-container
			{
				border-color: rgb(64, 64, 64);
			}
		`;
	}
	
	
	
	else if (settings == "dark_contrast")
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
			
			.body-text, .song-lyrics, .image-link-subtext
			{
				color: rgb(216, 216, 216);
			}
			
			.body-text .link
			{
				color: rgb(216, 255, 216);
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
				background: ${dark_theme_background_color};
				background: -moz-linear-gradient(left, ${dark_theme_background_color} 0%, rgb(164,164,164) 50%, ${dark_theme_background_color} 100%);
				background: -webkit-linear-gradient(left, ${dark_theme_background_color} 0%,rgb(164,164,164) 50%,${dark_theme_background_color}) 100%);
				background: linear-gradient(to right, ${dark_theme_background_color} 0%,rgb(164,164,164) 50%,${dark_theme_background_color} 100%);
			}
			
			.text-box
			{
				background-color: ${dark_theme_background_color};
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
				background-color: ${dark_theme_background_color};
			}

			.checkbox-container > input:checked ~ .checkbox
			{
				background-color: rgb(216, 216, 216);
			}
			
			
			
			#floating-footer-content, #floating-footer-button-background
			{
				background-color: ${dark_theme_background_color};
			}
			
			
			
			#banner:after, #floating-footer-gradient
			{
				background: -moz-linear-gradient(top, ${dark_theme_background_color_rgba}0) 0%, ${dark_theme_background_color_rgba}1) 100%) !important;
				background: -webkit-linear-gradient(top, ${dark_theme_background_color_rgba}0) 0%,${dark_theme_background_color_rgba}1) 100%) !important;
				background: linear-gradient(to bottom, ${dark_theme_background_color_rgba}0) 0%,${dark_theme_background_color_rgba}1) 100%) !important;
			}
					
			
			
			.footer-button, .text-button, .nav-button
			{
				border-color: rgb(152, 152, 152);
			}
		`;
	}
}