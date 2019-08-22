//Handles the various settings' effects on the page.



let settings_done = false;



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
	"banner_style": get_url_var("banner_style"),
	"content_layout": get_url_var("content_layout")
};

if (window.matchMedia("(prefers-color-scheme: dark)").matches && url_vars["theme"] == null)
{
	url_vars["theme"] = 1;
}



let url_var_functions =
{
	"animated":
	{
		"theme": switch_theme,
		"dark_theme_color": switch_dark_theme_color,
		"contrast": switch_contrast,
		"text_size": switch_text_size,
		"font": switch_font,
		"writing_style": switch_writing_style,
		"comments": switch_comments,
		"content_animation": switch_content_animation,
		"banner_style": switch_banner_style,
		"content_layout": switch_content_layout
	},
	
	"onload":
	{
		"theme": switch_theme_on_load,
		"dark_theme_color": switch_dark_theme_color_on_load,
		"contrast": switch_contrast_on_load,
		"text_size": switch_text_size_on_load,
		"font": switch_font_on_load,
		"writing_style": switch_writing_style_on_load,
		"comments": switch_comments_on_load,
		"content_animation": switch_content_animation_on_load,
		"banner_style": switch_banner_style_on_load,
		"content_layout": switch_content_layout_on_load
	}
};



let dark_theme_background_color = "rgb(24, 24, 24)";

if (url_vars["dark_theme_color"] == 1)
{
	dark_theme_background_color = "rgb(0, 0, 0)";
}



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



function apply_settings()
{
	for (key in url_vars)
	{
		if (url_vars[key] == null)
		{
			url_vars[key] = 0;
		}
		
		url_vars[key] = !url_vars[key];
		url_var_functions["onload"][key]();
	}
	
	
	
	settings_done = true;
}



//Changes the theme and animates elements.
function switch_theme()
{
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
			let elements = document.querySelectorAll(".section-text");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(232, 232, 232)";
			}
			
			elements = document.querySelectorAll(".body-text, .song-lyrics, .image-link-subtext");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(216, 216, 216)";
			}
			
			elements = document.querySelectorAll(".body-text .link");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(216, 255, 216)";
			}
			
			
			
			elements = document.querySelectorAll(".quote-text");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(192, 192, 192)";
			}
			
			elements = document.querySelectorAll(".quote-attribution");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(234, 234, 234)";
			}
			
			
			
			elements = document.querySelectorAll(".footer-button, .text-button, .nav-button");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.borderColor = "rgb(127, 127, 127)";
			}
		}
		
		else
		{
			let elements = document.querySelectorAll(".section-text");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(184, 184, 184)";
			}
			
			elements = document.querySelectorAll(".body-text, song-lyrics, .image-link-subtext");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(152, 152, 152)";
			}
			
			elements = document.querySelectorAll(".body-text .link");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(152, 216, 152)";
			}
			
			
			
			elements = document.querySelectorAll(".quote-text");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(104, 104, 104)";
			}
			
			elements = document.querySelectorAll(".quote-attribution");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(188, 188, 188)";
			}
			
			
			
			
			add_style(`
				.line-break
				{
					background: ${dark_theme_background_color};
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
			`, true);
		}
		
		
		
		let elements = document.querySelectorAll(".heading-text, .date-text, .title-text");
		for (let i = 0; i < elements.length; i++)
		{
			elements[i].style.color = "rgb(255, 255, 255)";
		}
		
		
		
		try {document.querySelector("#theme-button-row").style.opacity = 0;}
		catch(ex) {}
		
		setTimeout(function()
		{
 			try {document.querySelector("#theme-button-text").textContent = document.querySelector("#theme-button-text").textContent.replace("light", "dark");}
 			catch(ex) {}
 			
			try {document.querySelector("#theme-button-row").style.opacity = 1;}
			catch(ex) {}
		}, 300);
		
		url_vars["theme"] = 1;
		write_url_vars();
	}
	
	
	
	//Dark to light
	else
	{
		document.documentElement.style.backgroundColor = "rgb(255, 255, 255)";
		
		
		
		if (url_vars["contrast"] == 1)
		{
			let elements = document.querySelectorAll(".section-text");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(48, 48, 48)";
			}
			
			elements = document.querySelectorAll(".body-text, .song-lyrics, .image-link-subtext, .text-button");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(64, 64, 64)";
			}
			
			elements = document.querySelectorAll(".body-text .link");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(64, 128, 64)";
			}
			
			
			
			elements = document.querySelectorAll(".quote-text");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(88, 88, 88)";
			}
			
			elements = document.querySelectorAll(".quote-attribution");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(46, 46, 46)";
			}
			
			
			
			elements = document.querySelectorAll(".footer-button, .text-button, .nav-button");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.borderColor = "rgb(64, 64, 64)";
			}
		}
		
		else
		{
			let elements = document.querySelectorAll(".section-text");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(96, 96, 96)";
			}
			
			
			
			elements = document.querySelectorAll(".quote-text");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(176, 176, 176)";
			}
			
			elements = document.querySelectorAll(".quote-attribution");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(92, 92, 92)";
			}
		}
		
		
		
		let elements = document.querySelectorAll(".heading-text, .date-text, .title-text");
		for (let i = 0; i < elements.length; i++)
		{
			elements[i].style.color = "rgb(0, 0, 0)";
		}
		
		try {document.querySelector("#theme-button-row").style.opacity = 0;}
		catch(ex) {}
		
		setTimeout(function()
		{
			try {document.querySelector("#theme-button-text").textContent = document.querySelector("#theme-button-text").textContent.replace("dark", "light");}
			catch(ex) {}
			
			try {document.querySelector("#theme-button-row").style.opacity = 1;}
			catch(ex) {}
		}, 300);
		
		url_vars["theme"] = 0;
		write_url_vars();
	}
}



//Changes the theme, but without any animation.
function switch_theme_on_load()
{
	if (page_settings["manual_dark_theme"])
	{
		url_vars["theme"] = 1 - url_vars["theme"];
		return;
	}
	
	switch_theme();
}



function switch_dark_theme_color()
{
	document.querySelector("#dark-theme-color-button-row").style.opacity = 0;
	switch_dark_theme_color_on_load();
	
	setTimeout(function()
	{
		document.querySelector("#dark-theme-color-button-row").style.opacity = 1;
	}, 300);
}

function switch_dark_theme_color_on_load()
{
	if (url_vars["dark_theme_color"] == 0)
	{
		setTimeout(function()
		{
			try {document.querySelector("#dark-theme-color-button-text").textContent = document.querySelector("#dark-theme-color-button-text").textContent.replace("dark gray", "black");}
			catch(ex) {}
		}, 300);
		
		url_vars["dark_theme_color"] = 1;
		
		write_url_vars();
		
		
		
		dark_theme_background_color = "rgb(0, 0, 0)";
		
		if (url_vars["theme"] == 1)
		{
			document.documentElement.style.backgroundColor = "rgb(0, 0, 0)";
		}
	}
	
	
	
	else
	{
		setTimeout(function()
		{
			try {document.querySelector("#dark-theme-color-button-text").textContent = document.querySelector("#dark-theme-color-button-text").textContent.replace("black", "dark gray");}
			catch(ex) {}
		}, 300);
		
		url_vars["dark_theme_color"] = 0;
		
		write_url_vars();
		
		
		dark_theme_background_color = "rgb(24, 24, 24)";
		
		if (url_vars["theme"] == 1)
		{
			document.documentElement.style.backgroundColor = "rgb(24, 24, 24)";
		}
	}
}



function switch_contrast()
{
	document.querySelector("#contrast-button-row").style.opacity = 0;
	
	setTimeout(function()
	{
		switch_contrast_on_load();
		document.querySelector("#contrast-button-row").style.opacity = 1;
	}, 300);
}

function switch_contrast_on_load()
{
	//Default to high
	if (url_vars["contrast"] == 0)
	{
		try {document.querySelector("#contrast-button-text").textContent = document.querySelector("#contrast-button-text").textContent.replace("normal", "high");}
		catch(ex) {}
		
		url_vars["contrast"] = 1;
		
		write_url_vars();
		
		
		
		if (url_vars["theme"] == 1)
		{
			let elements = document.querySelectorAll(".section-text");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(232, 232, 232)";
			}
			
			elements = document.querySelectorAll(".body-text, .song-lyrics, .image-link-subtext");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(216, 216, 216)";
			}
			
			elements = document.querySelectorAll(".body-text .link");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(216, 255, 216)";
			}
			
			
			
			elements = document.querySelectorAll(".quote-text");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(192, 192, 192)";
			}
			
			elements = document.querySelectorAll(".quote-attribution");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(234, 234, 234)";
			}
			
			
			
			elements = document.querySelectorAll(".footer-button, .text-button, .nav-button");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.borderColor = "rgb(127, 127, 127)";
			}
			
			
			
			add_style(`
				.line-break
				{
					background: ${dark_theme_background_color};
					background: -moz-linear-gradient(left, ${dark_theme_background_color} 0%, rgb(164,164,164) 50%, ${dark_theme_background_color} 100%);
					background: -webkit-linear-gradient(left, ${dark_theme_background_color} 0%,rgb(164,164,164) 50%,${dark_theme_background_color} 100%);
					background: linear-gradient(to right, ${dark_theme_background_color} 0%,rgb(164,164,164) 50%,${dark_theme_background_color} 100%);
				}
				
				.scroll-button
				{
					border-color: rgb(88, 88, 88)
				}
				
				.text-box
				{
					border-color: rgb(152, 152, 152);
					background-color: ${dark_theme_background_color};
					color: rgb(216, 216, 216);
				}
				
				.text-box:focus
				{
					border-color: rgb(216, 216, 216);
					color: rgb(255, 255, 255);
				}
			`, true);
		}
		
		else
		{
			let elements = document.querySelectorAll(".section-text");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(48, 48, 48)";
			}
			
			elements = document.querySelectorAll(".body-text, .song-lyrics, .image-link-subtext, .text-button");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(64, 64, 64)";
			}
			
			elements = document.querySelectorAll(".body-text .link");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(64, 128, 64)";
			}
			
			
			
			elements = document.querySelectorAll(".quote-text");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(88, 88, 88)";
			}
			
			elements = document.querySelectorAll(".quote-attribution");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(46, 46, 46)";
			}
			
			
			
			elements = document.querySelectorAll(".footer-button, .text-button, .nav-button");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.borderColor = "rgb(64, 64, 64)";
			}
			
			
			
			add_style(`
				.line-break
				{
					background: rgb(255,255,255);
					background: -moz-linear-gradient(left, rgb(255,255,255) 0%, rgb(120,120,120) 50%, rgb(255,255,255) 100%);
					background: -webkit-linear-gradient(left, rgb(255,255,255) 0%,rgb(120,120,120) 50%,rgb(255,255,255) 100%);
					background: linear-gradient(to right, rgb(255,255,255) 0%,rgb(120,120,120) 50%,rgb(255,255,255) 100%);
				}
				
				.scroll-button
				{
					border-color: rgb(64, 64, 64);
				}
				
				.text-box
				{
					border-color: rgb(127, 127, 127);
					color: rgb(64, 64, 64);
				}
				
				.text-box:focus
				{
					border-color: rgb(64, 64, 64);
					color: rgb(0, 0, 0);
				}
			`, true);
			
			
			
			elements = document.querySelectorAll(".nav-button");
			
			for (i = 0; i < elements.length; i++)
			{
				elements[i].setAttribute("src", elements[i].getAttribute("src").replace("chevron-left", "chevron-left-dark").replace("chevron-right", "chevron-right-dark"));
			}
		}
		
		
		
		let elements = document.querySelectorAll(".text-button");
		for (let i = 0; i < elements.length; i++)
		{
			elements[i].style.color = "rgb(64, 64, 64)";
		}
	}
	
	
	
	//High to default
	else
	{
		try {document.querySelector("#contrast-button-text").textContent = document.querySelector("#contrast-button-text").textContent.replace("high", "normal");}
		catch(ex) {}
		
		url_vars["contrast"] = 0;
		
		write_url_vars();
		
		
		
		if (url_vars["theme"] == 1)
		{
			let elements = document.querySelectorAll(".section-text");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(184, 184, 184)";
			}
			
			elements = document.querySelectorAll(".body-text, song-lyrics, .image-link-subtext");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(152, 152, 152)";
			}
			
			elements = document.querySelectorAll(".body-text .link");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(152, 216, 152)";
			}
			
			
			
			elements = document.querySelectorAll(".quote-text");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(104, 104, 104)";
			}
			
			elements = document.querySelectorAll(".quote-attribution");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(188, 188, 188)";
			}
			
			
			
			add_style(`
				.line-break
				{
					background: ${dark_theme_background_color};
					background: -moz-linear-gradient(left, ${dark_theme_background_color} 0%, rgb(116,116,116) 50%, ${dark_theme_background_color} 100%);
					background: -webkit-linear-gradient(left, ${dark_theme_background_color} 0%,rgb(116,116,116) 50%,${dark_theme_background_color} 100%);
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
			`, true);
			
			
			
			elements = document.querySelectorAll(".text-button");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(152, 152, 152)";
			}
			
			
			
			elements = document.querySelectorAll(".footer-button, .text-button, .nav-button");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.borderColor = "rgb(127, 127, 127)";
			}
		}
		
		else
		{
			let elements = document.querySelectorAll(".section-text");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(96, 96, 96)";
			}
			
			elements = document.querySelectorAll(".body-text, song-lyrics, .image-link-subtext");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(127, 127, 127)";
			}
			
			elements = document.querySelectorAll(".body-text .link");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(127, 192, 127)";
			}
			
			
			
			elements = document.querySelectorAll(".quote-text");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(176, 176, 176)";
			}
			
			elements = document.querySelectorAll(".quote-attribution");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(92, 92, 92)";
			}
			
			
			
			elements = document.querySelectorAll(".text-button");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.color = "rgb(127, 127, 127)";
			}
			
			
			
			elements = document.querySelectorAll(".footer-button, .text-button, .nav-button");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.borderColor = "rgb(127, 127, 127)";
			}
		}
	}
}



function switch_text_size()
{
	document.body.classList.add("animated-opacity");
	document.body.style.opacity = 0;
	
	setTimeout(function()
	{
		switch_text_size_on_load();
		
		if (url_vars["text_size"] == 1)
		{
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
			
			element.id = "text-size-increase";
		}
		
		document.body.style.opacity = 1;
		
		setTimeout(function()
		{
			document.body.classList.remove("animated-opacity");
		}, 300);
	}, 300);
}

function switch_text_size_on_load()
{
	//Normal to large
	if (url_vars["text_size"] == 0)
	{
		try {document.querySelector("#text-size-button-text").textContent = document.querySelector("#text-size-button-text").textContent.replace("normal", "large");}
		catch(ex) {}
		
		url_vars["text_size"] = 1;
		
		write_url_vars();
	}
	
	
	
	//Large to normal
	else
	{
		try {document.querySelector("#text-size-button-text").textContent = document.querySelector("#text-size-button-text").textContent.replace("large", "normal");}
		catch(ex) {}
		
		url_vars["text_size"] = 0;
		
		write_url_vars();
		
		try {document.querySelector("#text-size-increase").remove();}
		catch(ex) {}
	}
}



function switch_font()
{
	document.querySelector("#font-button-row").style.opacity = 0;
	
	setTimeout(function()
	{
		switch_font_on_load();
		
		document.querySelector("#font-button-row").style.opacity = 1;
	}, 300);
}

function switch_font_on_load()
{
	//Sans to serif
	if (url_vars["font"] == 0)
	{
		try {document.querySelector("#font-button-text").textContent = document.querySelector("#font-button-text").textContent.replace("always sans serif", "serif on writing");}
		catch(ex) {}
		
		url_vars["font"] = 1;
		
		write_url_vars();
		
		if (page_settings["writing_page"])
		{
			let elements = document.querySelectorAll(".body-text");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.fontFamily = "'Gentium Book Basic', serif";
			}
		}
	}
	
	
	
	//Serif to sans
	else
	{
		try {document.querySelector("#font-button-text").textContent = document.querySelector("#font-button-text").textContent.replace("serif on writing", "always sans serif");}
		catch(ex) {}
		
		url_vars["font"] = 0;
		
		write_url_vars();
	}
}



function switch_writing_style()
{
	document.querySelector("#writing-style-button-row").style.opacity = 0;
	
	setTimeout(function()
	{
		switch_writing_style_on_load();
		
		document.querySelector("#writing-style-button-row").style.opacity = 1;
	}, 300);
}

function switch_writing_style_on_load()
{
	//Double-spaced to indented
	if (url_vars["writing_style"] == 0)
	{
		try {document.querySelector("#writing-style-button-text").textContent = document.querySelector("#writing-style-button-text").textContent.replace("double-spaced", "single-spaced and indented");}
		catch(ex) {}
		
		url_vars["writing_style"] = 1;
		
		write_url_vars();
		
		if (page_settings["writing_page"])
		{
			//This is a fancy way of saying ("section br").remove(), but it ensures that <br> tags in places like song lyrics won't get removed.
			let elements = document.querySelectorAll("section div .body-text");
			for (let i = 0; i < elements.length; i++)
			{
				//The next element might not exist, so we have to be careful.
				try
				{
					let next_element = elements[i].parentNode.nextElementSibling;
					
					if (next_element.tagName.toLowerCase() == "br")
					{
						next_element.remove();
					}
				}
				
				catch(ex) {}
			}
			
			
			//Add an indent on every element except the first in the section.
			elements = document.querySelectorAll("section div:not(:first-child) .body-text");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].style.textIndent = "10pt";
			}
		}
	}
	
	
	
	//Indented to double-spaced
	else
	{
		try {document.querySelector("#writing-style-button-text").textContent = document.querySelector("#writing-style-button-text").textContent.replace("single-spaced and indented", "double-spaced");}
		catch(ex) {}
		
		url_vars["writing_style"] = 0;
		
		write_url_vars();
	}
}



function switch_comments()
{
	document.querySelector("#comments-button-row").style.opacity = 0;
	
	setTimeout(function()
	{
		switch_comments_on_load();
		document.querySelector("#comments-button-row").style.opacity = 1;
	}, 300);
}

function switch_comments_on_load()
{
	if (url_vars["comments"] == 0)
	{
		try {document.querySelector("#comments-button-text").textContent = document.querySelector("#comments-button-text").textContent.replace("enabled", "disabled");}
		catch(ex) {}
		
		try
		{
			document.querySelector("#disqus_thread").previousElementSibling.remove();
			document.querySelector("#disqus_thread").previousElementSibling.remove();
			document.querySelector("#disqus_thread").previousElementSibling.remove();
			document.querySelector("#disqus_thread").remove();
		}
		catch(ex) {}
		
		url_vars["comments"] = 1;
		
		write_url_vars();
	}
	
	
	
	else
	{
		try {document.querySelector("#comments-button-text").textContent = document.querySelector("#comments-button-text").textContent.replace("disabled", "enabled");}
		catch(ex) {}
		
		url_vars["comments"] = 0;
		
		write_url_vars();
	}
}



function switch_content_animation()
{
	document.querySelector("#content-animation-button-row").style.opacity = 0;
	
	setTimeout(function()
	{
		switch_content_animation_on_load();
		document.querySelector("#content-animation-button-row").style.opacity = 1;
	}, 300);
}

function switch_content_animation_on_load()
{
	if (url_vars["content_animation"] == 0)
	{
		try {document.querySelector("#content-animation-button-text").textContent = document.querySelector("#content-animation-button-text").textContent.replace("enabled", "disabled");}
		catch(ex) {}
		
		url_vars["content_animation"] = 1;
		
		write_url_vars();
		
		//This attribute makes the content invisible until it's animated in, so if we're never going to do that, it has to go.
		let elements = document.body.querySelectorAll("[data-aos]")
		for (let i = 0; i < elements.length; i++)
		{
			elements[i].removeAttribute("data-aos");
		}
		
		document.documentElement.classList.remove("animated-opacity");
	}
	
	
	
	else
	{
		try {document.querySelector("#content-animation-button-text").textContent = document.querySelector("#content-animation-button-text").textContent.replace("disabled", "enabled");}
		catch(ex) {}
		
		url_vars["content_animation"] = 0;
		
		write_url_vars();
		
		document.documentElement.classList.add("animated-opacity");
	}
}



function switch_banner_style()
{
	document.querySelector("#banner-style-button-row").style.opacity = 0;
	
	setTimeout(function()
	{
		switch_banner_style_on_load();
		document.querySelector("#banner-style-button-row").style.opacity = 1;
	}, 300);
}

function switch_banner_style_on_load()
{
	if (url_vars["banner_style"] == 0)
	{
		try {document.querySelector("#banner-style-button-text").textContent = document.querySelector("#banner-style-button-text").textContent.replace("parallax", "simple");}
		catch(ex) {}
		
		url_vars["banner_style"] = 1;
		
		write_url_vars();
		
		try
		{
			document.querySelector("#background-image").classList.add("bad-banner");
		}
		
		catch(ex) {}
	}
	
	else
	{
		try {document.querySelector("#banner-style-button-text").textContent = document.querySelector("#banner-style-button-text").textContent.replace("simple", "parallax");}
		catch(ex) {}
		
		url_vars["banner_style"] = 0;
		
		write_url_vars();
	}
}



function switch_content_layout()
{
	if (layout_string == "small-screen")
	{
		//Yes, we really should be using html here, bot body, but html has css on it on the settings page that gets in the way of that, and this is just way way easier.
		document.body.classList.add("animated-opacity");
		document.body.style.opacity = 0;
	}
	
	else
	{
		document.querySelector("#content-layout-button-row").style.opacity = 0;
	}
	
	
	
	setTimeout(function()
	{
		switch_content_layout_on_load();
		
		if (layout_string == "small-screen")
		{
			//Yes, we really should be using html here, bot body, but html has css on it on the settings page that gets in the way of that, and this is just way way easier.
			document.body.style.opacity = 1;
			
			setTimeout(function()
			{
				document.body.classList.remove("animated-opacity");
			}, 300);
		}
		
		else
		{
			document.querySelector("#content-layout-button-row").style.opacity = 1;
		}
	}, 300);
}

function switch_content_layout_on_load()
{
	if (url_vars["content_layout"] == 0)
	{
		try {document.querySelector("#content-layout-button-text").textContent = document.querySelector("#content-layout-button-text").textContent.replace(/automatic \(.+\)/, "always compact");}
		catch(ex) {}
		
		url_vars["content_layout"] = 1;
		
		write_url_vars();
		
		let elements = document.querySelectorAll("*");
		for (let i = 0; i < elements.length; i++)
		{
			elements[i].classList.add("layout-override");
		}
	}
	
	
	
	else
	{
		try {document.querySelector("#content-layout-button-text").textContent = document.querySelector("#content-layout-button-text").textContent.replace("always compact", `automatic (currently ${layout_string})`);}
		catch(ex) {}
		
		url_vars["content_layout"] = 0;
		
		write_url_vars();
		
		let elements = document.querySelectorAll("*");
		for (let i = 0; i < elements.length; i++)
		{
			elements[i].classList.remove("layout-override");
		}
	}
}