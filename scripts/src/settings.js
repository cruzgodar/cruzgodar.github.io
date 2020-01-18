"use strict";



//Handles the various settings' effects on the page. These functions typically add or remove a style tag that handles all the changes. Some settings, like the theme, require an animation.



function get_url_var(id)
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
}



let url_vars = 
{
	"theme": get_url_var("theme"),
	"dark_theme_color": get_url_var("dark_theme_color"),
	"contrast": get_url_var("contrast"),
	"text_size": get_url_var("text_size"),
	"font": get_url_var("font"),
	"comments": get_url_var("comments"),
	"content_animation": get_url_var("content_animation"),
	"banner_style": get_url_var("banner_style")
};

window.matchMedia("(prefers-color-scheme: dark)").addListener(function(e)
{
	if (e.matches && url_vars["theme"] !== 1)
	{
		switch_setting("theme");
	}
	
	else if (!e.matches && url_vars["theme"] === 1)
	{
		switch_setting("theme");
	}
});

if (window.matchMedia("(prefers-color-scheme: dark)").matches && url_vars["theme"] === null)
{
	url_vars["theme"] = 1;
}



let settings_texts =
{
	"theme": ["Theme: light", "Theme: dark"],
	"dark_theme_color": ["Dark theme color: dark gray", "Dark theme color: black"],
	"contrast": ["Contrast: normal", "Contrast: high"],
	"text_size": ["Text size: normal", "Text size: large"],
	"font": ["Font: always sans serif", "Font: serif on writing"],
	"comments": ["Comments: enabled", "Comments: disabled"],
	"content_animation": ["Content animation: enabled", "Content animation: disabled"],
	"banner_style": ["Banners: parallax", "Banners: simple"]
};



let dark_theme_background_color = "rgb(24, 24, 24)";
let dark_theme_background_color_rgba = "rgba(24, 24, 24, ";

if (url_vars["dark_theme_color"] === 1)
{
	dark_theme_background_color = "rgb(0, 0, 0)";
	dark_theme_background_color_rgba = "rgba(0, 0, 0, ";
}



function init_settings()
{
	for (let key in url_vars)
	{
		//These are double equals, and that's important, but I can't quite see why. Obviously the url_vars are stored as strings and I just didn't realize that when I first coded this, but this bit of code has refused to cooperate with any modifications I make. Who knows.
		if (url_vars[key] == null)
		{
			url_vars[key] = 0;
		}
		
		else if (url_vars[key] == 1)
		{
			url_vars[key] = 0;
			switch_setting(key, true);
		}
	}
	
	
	
	//This prevents things from flickering when we first load the site.
	
	let element = null;
	
	if (url_vars["theme"] === 1 && url_vars["contrast"] !== 1)
	{
		element = add_style(get_settings_style("dark"), false);
	}
	
	else if (url_vars["theme"] !== 1 && url_vars["contrast"] === 1)
	{
		element = add_style(get_settings_style("contrast"), false);
	}
	
	else if (url_vars["theme"] === 1 && url_vars["contrast"] === 1)
	{
		element = add_style(get_settings_style("dark_contrast"), false);
	}
	
	try {document.querySelector("#theme-contrast-adjust").remove();}
	catch(ex) {}
	
	try {element.id = "theme-contrast-adjust";}
	catch(ex) {}
}



let floating_settings_is_visible = false;

function show_floating_settings()
{	
	if (floating_settings_is_visible)
	{
		return;
	}
	
	
	
	floating_settings_is_visible = true;
	
	document.body.firstChild.insertAdjacentHTML("beforebegin", `<div id="floating-settings"></div>`);
	
	//I really don't like this.
	setTimeout(function()
	{
		document.querySelector("#floating-settings").style.opacity = 1;
		
		//Nontouch browsers don't do scroll snapping very well.
		if (!hasTouch())
		{
			document.querySelector("#floating-settings").style.scrollSnapType = "y proximity";
			
			document.documentElement.style.overflowY = "hidden";
			document.body.style.overflowY = "scroll";
			
			document.querySelector("#floating-settings").addEventListener("mouseenter", function()
			{
				document.documentElement.style.overflowY = "hidden";
				document.body.style.overflowY = "scroll";
			});
			
			document.querySelector("#floating-settings").addEventListener("mouseleave", function()
			{
				document.documentElement.style.overflowY = "scroll";
				document.body.style.overflowY = "hidden";
			});
		}
	}, 10);
	
	
	
	if (floating_footer_is_visible)
	{
		document.querySelector("#floating-footer").style.opacity = 0;
		
		floating_footer_is_visible = false;
		
		setTimeout(function()
		{
			document.querySelector("#floating-footer").style.display = "none";
			document.querySelector("#floating-footer-touch-target").style.display = "block";
		}, 300);
	}
	
	
	
	setTimeout(function()
	{
		//These aren't seen by set_up_aos(), so we'll do things the old-fashioned way.
		document.querySelector("#floating-settings").innerHTML = `
			<div class="floating-settings-page">
				<div id="theme-button-row" class="floating-settings-button-row">
					<div data-aos="zoom-out" data-aos-offset="0" data-aos-anchor="body">
						<input type="image" class="footer-button" src="/graphics/button-icons/moon.png" alt="Change Theme" onclick="switch_setting('theme')">
					</div>
					
					<div class="floating-settings-button-text-container" data-aos="fade-left" data-aos-delay="0" data-aos-anchor="body">
						<p id="theme-button-text" class="floating-settings-button-text"></p>
					</div>
				</div>
				
				<div id="dark-theme-color-button-row" class="floating-settings-button-row">
					<div data-aos="zoom-out" data-aos-delay="100" data-aos-anchor="body">
						<input type="image" class="footer-button" src="/graphics/button-icons/moon-stars.png" alt="Change Theme" onclick="switch_setting('dark_theme_color')">
					</div>
					
					<div class="floating-settings-button-text-container" data-aos="fade-left" data-aos-delay="100" data-aos-anchor="body">
						<p id="dark-theme-color-button-text" class="floating-settings-button-text"></p>
					</div>
				</div>
				
				<div id="contrast-button-row" class="floating-settings-button-row">
					<div data-aos="zoom-out" data-aos-delay="200" data-aos-anchor="body">
						<input type="image" class="footer-button" src="/graphics/button-icons/contrast.png" alt="Change Theme" onclick="switch_setting('contrast')">
					</div>
					
					<div class="floating-settings-button-text-container" data-aos="fade-left" data-aos-delay="200" data-aos-anchor="body">
						<p id="contrast-button-text" class="floating-settings-button-text"></p>
					</div>
				</div>
				
				<div id="text-size-button-row" class="floating-settings-button-row">
					<div data-aos="zoom-out" data-aos-delay="300" data-aos-anchor="body">
						<input type="image" class="footer-button" src="/graphics/button-icons/text-size.png" alt="Change Theme" onclick="switch_setting('text_size')">
					</div>
					
					<div class="floating-settings-button-text-container" data-aos="fade-left" data-aos-delay="300" data-aos-anchor="body">
						<p id="text-size-button-text" class="floating-settings-button-text"></p>
					</div>
				</div>
			</div>
			
			<div class="floating-settings-scroll-snap"></div>
			
			<div class="floating-settings-page">
				<div id="font-button-row" class="floating-settings-button-row">
					<div data-aos="zoom-out" data-aos-delay="400" data-aos-anchor="body">
						<input type="image" class="footer-button" src="/graphics/button-icons/font.png" alt="Change Theme" onclick="switch_setting('font')">
					</div>
					
					<div class="floating-settings-button-text-container" data-aos="fade-left" data-aos-delay="400" data-aos-anchor="body">
						<p id="font-button-text" class="floating-settings-button-text"></p>
					</div>
				</div>
				
				<div id="comments-button-row" class="floating-settings-button-row">
					<div data-aos="zoom-out" data-aos-delay="400" data-aos-anchor="body">
						<input type="image" class="footer-button" src="/graphics/button-icons/comment.png" alt="Change Theme" onclick="switch_setting('comments')">
					</div>
					
					<div class="floating-settings-button-text-container" data-aos="fade-left" data-aos-delay="400" data-aos-anchor="body">
						<p id="comments-button-text" class="floating-settings-button-text"></p>
					</div>
				</div>
				
				<div id="content-animation-button-row" class="floating-settings-button-row">
					<div data-aos="zoom-out" data-aos-delay="400" data-aos-anchor="body">
						<input type="image" class="footer-button" src="/graphics/button-icons/pop.png" alt="Change Theme" onclick="switch_setting('content_animation')">
					</div>
					
					<div class="floating-settings-button-text-container" data-aos="fade-left" data-aos-delay="400" data-aos-anchor="body">
						<p id="content-animation-button-text" class="floating-settings-button-text"></p>
					</div>
				</div>
				
				<div id="banner-style-button-row" class="floating-settings-button-row">
					<div data-aos="zoom-out" data-aos-delay="400" data-aos-anchor="body">
						<input type="image" class="footer-button" src="/graphics/button-icons/picture.png" alt="Change Theme" onclick="switch_setting('banner_style')">
					</div>
					
					<div class="floating-settings-button-text-container" data-aos="fade-left" data-aos-delay="400" data-aos-anchor="body">
						<p id="banner-style-button-text" class="floating-settings-button-text"></p>
					</div>
				</div>
				
				<div style="margin-top: -6px"></div>
			</div>
		`;
		
		let settings_query_strings = Object.keys(url_vars);
		
		for (let i = 0; i < settings_query_strings.length; i++)
		{
			document.querySelector("#" + settings_query_strings[i].replace(/_/g, "-") + "-button-text").textContent = settings_texts[settings_query_strings[i]][url_vars[settings_query_strings[i]]];
		}
	}, 100);
}



function hide_floating_settings()
{
	document.querySelector("#floating-settings").style.opacity = 0;
	
	document.documentElement.style.overflowY = "scroll";
	
	setTimeout(function()
	{
		document.querySelector("#floating-settings").remove();
		
		floating_settings_is_visible = false;
	}, 300);
}



if (hasTouch())
{
	document.documentElement.addEventListener("touchstart", function(e)
	{
		if (floating_settings_is_visible === false)
		{
			return;
		}
		
		if (!(document.querySelector("#floating-settings").contains(e.target)))
		{
			hide_floating_settings();
		}
	});
}

else
{
	document.documentElement.addEventListener("mousedown", function(e)
	{
		if (floating_settings_is_visible === false)
		{
			return;
		}
		
		if (!(document.querySelector("#floating-settings").contains(e.target)))
		{
			hide_floating_settings();
		}
	});
}





//Changes a setting.
function switch_setting(setting, no_animation = false)
{
	let element = null;
	
	if (no_animation === false && (setting === "theme" || setting === "dark_theme_color" || setting === "contrast"))
	{
		element = add_style(`
			html
			{
				transition: background-color .6s ease !important;
			}
			
			p, span, h1, h2, a, q, em, strong, dfn
			{
				transition: color .6s ease !important;
			}
			
			.text-box, .checkbox-container, .checkbox-container > input ~ .checkbox, .loading-spinner:after, #floating-footer-content, #floating-footer-button-background, .footer-button, .text-button, .nav-button
			{
				transition: background-color .6s ease, border-color .6s ease, color .6s ease !important;
			}
		`);
		
		
		
		//These elements have properties that cannot be animated. To get around this, we'll animate them out and then back in later. It's not perfect, but it's the best we can do with making 8 copies of each element and fading the correct one in as necessary.
		let difficult_elements = document.querySelectorAll(".line-break, #banner-gradient");
		
		for (let i = 0; i < difficult_elements.length; i++)
		{
			difficult_elements[i].classList.add("animated-opacity");
			
			difficult_elements[i].style.opacity = 0;
			
			setTimeout(function()
			{
				difficult_elements[i].style.opacity = 1;
				
				setTimeout(function()
				{
					difficult_elements[i].classList.remove("animated-opacity");
				}, 300);
			}, 600);
		}
		
		
		
		//These are pseudoelements. They cannot be selected by JS and therefore cannot be animated at all. Cool. The only option we have is to make them invisible in the css, and then later remove that style.
		let element_2 = add_style(`
			.loading-spinner:after
			{
				opacity: 0 !important;
			}
		`);
		
		setTimeout(function()
		{
			element_2.remove();
		}, 600);
	}
	
	
	
	if (setting === "theme")
	{
		switch_theme();
	}
	
	else if (setting === "dark_theme_color")
	{
		switch_dark_theme_color();
	}
	
	else if (setting === "contrast")
	{
		switch_contrast();
	}
	
	else if (setting === "text_size")
	{
		switch_text_size();
	}
	
	else if (setting === "font")
	{
		switch_font();
	}
	
	else if (setting === "comments")
	{
		switch_comments();
	}
	
	else if (setting === "content_animation")
	{
		switch_content_animation();
	}
	
	else if (setting === "banner_style")
	{
		switch_banner_style();
	}
	
	else
	{
		console.log("Unknown setting");
	}
	
	
	
	write_url_vars();
	
	
	
	if (no_animation === false && (setting === "theme" || setting === "dark_theme_color" || setting === "contrast"))
	{
		setTimeout(function()
		{
			element.remove();
		}, 600);
	}
}



//Changes the theme and animates elements.
function switch_theme()
{
	try {document.querySelector("#theme-button-row").style.opacity = 0;}
	catch(ex) {}
	
	
	
	//Light to dark
	if (url_vars["theme"] === 0)
	{
		if (!page_settings["manual_dark_theme"])
		{
			if (url_vars["dark_theme_color"] !== 1)
			{
				document.documentElement.style.backgroundColor = "rgb(24, 24, 24)";
			}
			
			else
			{
				document.documentElement.style.backgroundColor = "rgb(0, 0, 0)";
			}
		}
		
		
		
		if (url_vars["contrast"] === 1)
		{
			if (!page_settings["manual_dark_theme"])
			{
				animate_theme_contrast("dark_contrast");
			}
			
			
			
			setTimeout(function()
			{
				let element = add_style(get_settings_style("dark_contrast"), false);
				
				try {document.querySelector("#theme-contrast-adjust").remove();}
				catch(ex) {}
				
				try {element.id = "theme-contrast-adjust";}
				catch(ex) {}
				
				clear_weird_inline_styles();
			}, 600);
		}
		
		
		
		else
		{
			if (!page_settings["manual_dark_theme"])
			{
				animate_theme_contrast("dark");
			}
			
			
			
			setTimeout(function()
			{
				let element = add_style(get_settings_style("dark"), false);
				
				try {document.querySelector("#theme-contrast-adjust").remove();}
				catch(ex) {}
				
				try {element.id = "theme-contrast-adjust";}
				catch(ex) {}
				
				clear_weird_inline_styles();
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
		if (!page_settings["manual_dark_theme"])
		{
			document.documentElement.style.backgroundColor = "rgb(255, 255, 255)";
		}
		
		
		
		if (url_vars["contrast"] === 1)
		{
			if (!page_settings["manual_dark_theme"])
			{
				animate_theme_contrast("contrast");
			}
			
			
			
			setTimeout(function()
			{
				let element = add_style(get_settings_style("contrast"), false);
				
				try {document.querySelector("#theme-contrast-adjust").remove();}
				catch(ex) {}
				
				try {element.id = "theme-contrast-adjust";}
				catch(ex) {}
				
				clear_weird_inline_styles();
			}, 600);
		}
		
		
		
		else
		{
			if (!page_settings["manual_dark_theme"])
			{
				animate_theme_contrast("");
			}
			
			
			
			setTimeout(function()
			{
				try {document.querySelector("#theme-contrast-adjust").remove();}
				catch(ex) {}
				
				clear_weird_inline_styles();
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
}





function switch_dark_theme_color()
{
	try {document.querySelector("#dark-theme-color-button-row").style.opacity = 0;}
	catch(ex) {}
	
	
	
	if (url_vars["dark_theme_color"] === 0)
	{
		dark_theme_background_color = "rgb(0, 0, 0)";
		dark_theme_background_color_rgba = "rgba(0, 0, 0, ";
		
		if (url_vars["theme"] === 1)
		{
			document.documentElement.style.backgroundColor = "rgb(0, 0, 0)";
			
			if (url_vars["contrast"] == 1)
			{
				animate_theme_contrast("dark_contrast");
			}
			
			else
			{
				animate_theme_contrast("dark");
			}
		}
		
		
		
		setTimeout(function()
		{
			let element = null;
			
			if (url_vars["theme"] === 1)
			{
				if (url_vars["contrast"] === 1)
				{
					element = add_style(get_settings_style("dark_contrast"), false);
				}
				
				else
				{
					element = add_style(get_settings_style("dark"), false);
				}
			}
			
			else if (url_vars["contrast"] === 1)
			{
				element = add_style(get_settings_style("contrast"), false);
			}
			
			
			
			try {document.querySelector("#theme-contrast-adjust").remove();}
			catch(ex) {}
			
			try {element.id = "theme-contrast-adjust";}
			catch(ex) {}
			
			clear_weird_inline_styles();
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
		
		if (url_vars["theme"] === 1)
		{
			document.documentElement.style.backgroundColor = "rgb(24, 24, 24)";
			
			if (url_vars["contrast"] == 1)
			{
				animate_theme_contrast("dark_contrast");
			}
			
			else
			{
				animate_theme_contrast("dark");
			}
		}
		
		
		
		setTimeout(function()
		{
			let element = null;
			
			if (url_vars["theme"] === 1)
			{
				if (url_vars["contrast"] === 1)
				{
					element = add_style(get_settings_style("dark_contrast"), false);
				}
				
				else
				{
					element = add_style(get_settings_style("dark"), false);
				}
			}
			
			else if (url_vars["contrast"] === 1)
			{
				element = add_style(get_settings_style("contrast"), false);
			}
			
			
			
			try {document.querySelector("#theme-contrast-adjust").remove();}
			catch(ex) {}
			
			try {element.id = "theme-contrast-adjust";}
			catch(ex) {}
			
			clear_weird_inline_styles();
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
}





function switch_contrast()
{
	try {document.querySelector("#contrast-button-row").style.opacity = 0;}
	catch(ex) {}
	
	
	
	//Default to high
	if (url_vars["contrast"] === 0)
	{
		if (url_vars["theme"] === 1)
		{
			animate_theme_contrast("dark_contrast");
			
			
			
			setTimeout(function()
			{
				let element = add_style(get_settings_style("dark_contrast"), false);
				
				try {document.querySelector("#theme-contrast-adjust").remove();}
				catch(ex) {}
				
				try {element.id = "theme-contrast-adjust";}
				catch(ex) {}
				
				clear_weird_inline_styles();
			}, 600);
		}
		
		
		
		else
		{
			animate_theme_contrast("contrast");
			
			
			
			setTimeout(function()
			{
				let element = add_style(get_settings_style("contrast"), false);
				
				try {document.querySelector("#theme-contrast-adjust").remove();}
				catch(ex) {}
				
				try {element.id = "theme-contrast-adjust";}
				catch(ex) {}
				
				clear_weird_inline_styles();
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
		if (url_vars["theme"] === 1)
		{
			animate_theme_contrast("dark");
			
			
			
			setTimeout(function()
			{
				let element = add_style(get_settings_style("dark"), false);
				
				try {document.querySelector("#theme-contrast-adjust").remove();}
				catch(ex) {}
				
				try {element.id = "theme-contrast-adjust";}
				catch(ex) {}
				
				clear_weird_inline_styles();
			}, 600);
		}
		
		
		
		else
		{
			animate_theme_contrast("");
			
			
			
			setTimeout(function()
			{
				try {document.querySelector("#theme-contrast-adjust").remove();}
				catch(ex) {}
				
				clear_weird_inline_styles();
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
}





function switch_text_size()
{
	document.body.classList.add("animated-opacity");
	document.body.style.opacity = 0;
	
	
	
	//Normal to large
	if (url_vars["text_size"] === 0)
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
				
				@media (min-width: 1000px)
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
}





function switch_font()
{
	if (page_settings["writing_page"])
	{
		document.body.classList.add("animated-opacity");
		document.body.style.opacity = 0;
	}
	
	
	
	try {document.querySelector("#font-button-row").style.opacity = 0;}
	catch(ex) {}
	
	
	
	//Sans to serif
	if (url_vars["font"] === 0)
	{
		setTimeout(function()
		{
			if (page_settings["writing_page"])
			{
				set_element_styles(".body-text", "font-family", "'Gentium Book Basic', serif");
			}
			
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
			if (page_settings["writing_page"])
			{
				set_element_styles(".body-text", "font-family", "'Rubik', sans-serif");
			}
			
			try {document.querySelector("#font-button-text").textContent = settings_texts["font"][0];}
			catch(ex) {}
		}, 300);
		
		url_vars["font"] = 0;
	}
	
	
	
	if (page_settings["writing_page"])
	{
		setTimeout(function()
		{
			document.body.style.opacity = 1;
				
			setTimeout(function()
			{
				document.body.classList.remove("animated-opacity");
			}, 300);
		}, 300);
	}
	
	
	
	setTimeout(function()
	{
		try {document.querySelector("#font-button-row").style.opacity = 1;}
		catch(ex) {}
	}, 300);
}



function switch_comments()
{
	try {document.querySelector("#comments-button-row").style.opacity = 0;}
	catch(ex) {}
	
	
	
	if (url_vars["comments"] === 0)
	{
		if (page_settings["comments"])
		{
			//Unfortunately, we can't just use the animated-opacity class -- this needs !important.
			
			let element = document.querySelector("#disqus_thread");
			
			element.previousElementSibling.previousElementSibling.previousElementSibling.style.setProperty("transition", "opacity .3s ease-in-out", "important");
			element.previousElementSibling.previousElementSibling.style.setProperty("transition", "opacity .3s ease-in-out", "important");
			element.previousElementSibling.style.setProperty("transition", "opacity .3s ease-in-out", "important");
			element.style.setProperty("transition", "opacity .3s ease-in-out", "important");
			
			
			
			element.previousElementSibling.previousElementSibling.previousElementSibling.style.opacity = 0;
			element.previousElementSibling.previousElementSibling.style.opacity = 0;
			element.previousElementSibling.style.opacity = 0;
			element.style.opacity = 0;

			
			
			setTimeout(remove_disqus, 300);
		}
		
		
		
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
}





function switch_content_animation()
{
	if (url_vars["content_animation"] === 0)
	{
		//Here, we can just animate out the body as usual.	
		document.body.classList.add("animated-opacity");
		document.body.style.opacity = 0;
		
		setTimeout(function()
		{
			remove_animation();
			
			document.documentElement.classList.remove("animated-opacity");
			
			
			
			document.body.style.opacity = 1;
			
			setTimeout(function()
			{
				document.body.classList.remove("animated-opacity");
			}, 300);
		}, 300);
		
		
		
		setTimeout(function()
		{
			try {document.querySelector("#content-animation-button-text").textContent = settings_texts["content_animation"][1];}
			catch(ex) {}
		}, 300);
		
		url_vars["content_animation"] = 1;
	}
	
	
	
	else
	{
		//Here, though, trying to animate the body causes problems. A more elegant solution is to use the html element itself.
		url_vars["content_animation"] = 0;
		
		document.documentElement.classList.add("animated-opacity");
		
		
		
		//This is a little messy, but it's better than the alternative. Removing every single data-aos attribute is way too destructive to undo, so instead, we'll just refresh the page.
		last_page_scroll = window.scrollY;
		
		redirect(current_url, false, true, true);
	}
}





function switch_banner_style()
{
	document.body.classList.add("animated-opacity");
	document.body.style.opacity = 0;
	
	setTimeout(function()
	{
		if (url_vars["banner_style"] === 0)
		{
			try {document.querySelector("#banner-adjust").remove();}
			catch(ex) {}
			
			
			
			let element = add_style(`
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
			
			set_element_styles(".name-text", "opacity", 1);
			
			
			
			try {document.querySelector("#banner-style-button-text").textContent = settings_texts["banner_style"][1];}
			catch(ex) {}
			
			url_vars["banner_style"] = 1;
		}
		
		else
		{
			try {document.querySelector("#banner-adjust").remove();}
			catch(ex) {}
			
			try {document.querySelector("#banner-style-button-text").textContent = settings_texts["banner_style"][0];}
			catch(ex) {}
		
		
			
			url_vars["banner_style"] = 0;
			
			scroll_update(0);
		}
		
		
		
		document.body.style.opacity = 1;
		
		setTimeout(function()
		{
			document.body.classList.remove("animated-opacity");
		}, 300);
	}, 300);
}





function animate_theme_contrast(settings)
{
	if (settings === "")
	{
		set_element_styles(".heading-text, .date-text, .title-text", "color", "rgb(0, 0, 0)");
		
		set_element_styles(".section-text", "color", "rgb(96, 96, 96)");
		
		set_element_styles(".body-text, .body-text span, .song-lyrics, .image-link-subtext, .floating-settings-button-text", "color", "rgb(127, 127, 127)");
		
		set_element_styles(".body-text .link", "color", "rgb(127, 192, 127)");
		
		
		
		set_element_styles(".quote-text q", "color", "rgb(176, 176, 176)");
		
		set_element_styles(".quote-attribution", "color", "rgb(92, 92, 92)");
		
		
		
		set_element_styles(".text-box", "background-color", "rgb(255, 255, 255)");
		
		set_element_styles(".text-box", "color", "rgb(127, 127, 127)");
		
		set_element_styles(".text-box", "border-color", "rgb(192, 192, 192)");
		
		
		
		set_element_styles(".checkbox-container > input ~ .checkbox", "background-color", "rgb(255, 255, 255)");
		
		set_element_styles(".checkbox-container > input:checked ~ .checkbox", "background-color", "rgb(127, 127, 127)");
		
		
		
		set_element_styles("#floating-footer-content, #floating-footer-button-background", "background-color", "rgb(255, 255, 255)");
		
		
		
		set_element_styles(".footer-button, .text-button, .nav-button, .checkbox-container", "border-color", "rgb(127, 127, 127)");
	}
	
	
	
	else if (settings === "dark")
	{
		set_element_styles(".heading-text, .date-text, .title-text", "color", "rgb(255, 255, 255)");
		
		set_element_styles(".section-text", "color", "rgb(184, 184, 184)");
		
		set_element_styles(".body-text, .body-text span, .song-lyrics, .image-link-subtext, .floating-settings-button-text", "color", "rgb(152, 152, 152)");
		
		set_element_styles(".body-text .link", "color", "rgb(152, 216, 152)");
		
		
		
		set_element_styles(".quote-text q", "color", "rgb(104, 104, 104)");
		
		set_element_styles(".quote-attribution", "color", "rgb(188, 188, 188)");
		
		
		
		set_element_styles(".text-box", "background-color", dark_theme_background_color);
		
		set_element_styles(".text-box", "color", "rgb(152, 152, 152)");
		
		set_element_styles(".text-box", "border-color", "rgb(88, 88, 88)");
		
		
		
		set_element_styles(".checkbox-container > input ~ .checkbox", "background-color", dark_theme_background_color);
		
		set_element_styles(".checkbox-container > input:checked ~ .checkbox", "background-color", "rgb(152, 152, 152)");
		
		
		
		set_element_styles("#floating-footer-content, #floating-footer-button-background", "background-color", dark_theme_background_color);
		
		
		
		set_element_styles(".footer-button, .text-button, .nav-button", "border-color", "rgb(152, 152, 152)");
	}
	
	
	
	else if (settings === "contrast")
	{
		set_element_styles(".heading-text, .date-text, .title-text", "color", "rgb(0, 0, 0)");
		
		set_element_styles(".section-text", "color", "rgb(48, 48, 48)");
		
		set_element_styles(".body-text, .body-text span, .song-lyrics, .image-link-subtext, .floating-settings-button-text", "color", "rgb(64, 64, 64)");
		
		set_element_styles(".body-text .link", "color", "rgb(64, 128, 64)");
		
		
		
		set_element_styles(".quote-text q", "color", "rgb(88, 88, 88)");
		
		set_element_styles(".quote-attribution", "color", "rgb(46, 46, 46)");
		
		
		
		set_element_styles(".text-box", "background-color", "rgb(255, 255, 255)");
		
		set_element_styles(".text-box", "color", "rgb(64, 64, 64)");
		
		set_element_styles(".text-box", "border-color", "rgb(96, 96, 96)");
		
		
		
		set_element_styles(".checkbox-container > input ~ .checkbox", "background-color", "rgb(255, 255, 255)");
		
		set_element_styles(".checkbox-container > input:checked ~ .checkbox", "background-color", "rgb(64, 64, 64)");
		
		
		
		set_element_styles("#floating-footer-content, #floating-footer-button-background", "background-color", "rgb(255, 255, 255)");
		
		
		
		set_element_styles(".footer-button, .text-button, .nav-button", "border-color", "rgb(64, 64, 64)");
	}
	
	
	
	else if (settings === "dark_contrast")
	{
		set_element_styles(".heading-text, .date-text, .title-text", "color", "rgb(255, 255, 255)");
		
		set_element_styles(".section-text", "color", "rgb(232, 232, 232)");
		
		set_element_styles(".body-text, .body-text span, .song-lyrics, .image-link-subtext", "color", "rgb(216, 216, 216)");
		
		set_element_styles(".body-text .link", "color", "rgb(216, 255, 216)");
		
		set_element_styles(".floating-settings-button-text", "color", "rgb(64, 64, 64)");
		
		
		
		set_element_styles(".quote-text q", "color", "rgb(192, 192, 192)");
		
		set_element_styles(".quote-attribution", "color", "rgb(234, 234, 234)");
		
		
		
		set_element_styles(".text-box", "background-color", dark_theme_background_color);
		
		set_element_styles(".text-box", "color", "rgb(216, 216, 216)");
		
		set_element_styles(".text-box", "border-color", "rgb(152, 152, 152)");
		
		
		
		set_element_styles(".checkbox-container", "border-color", "rgb(216, 216, 216)");
		
		set_element_styles(".checkbox-container > input ~ .checkbox", "background-color", dark_theme_background_color);
		
		set_element_styles(".checkbox-container > input:checked ~ .checkbox", "background-color", "rgb(216, 216, 216)");
		
		
		
		set_element_styles("#floating-footer-content, #floating-footer-button-background", "background-color", dark_theme_background_color);
		
		
		
		set_element_styles(".footer-button, .text-button, .nav-button", "border-color", "rgb(152, 152, 152)");
	}
}



function clear_weird_inline_styles()
{
	set_element_styles(".checkbox-container > input ~ .checkbox", "background-color", "");
		
	set_element_styles(".checkbox-container > input:checked ~ .checkbox", "background-color", "");
	
	
	
	set_element_styles(".text-box", "background-color", "");
	
	set_element_styles(".text-box", "color", "");
	
	set_element_styles(".text-box", "border-color", "");
}





function get_settings_style(settings) 
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
			
			
			
			.loading-spinner:after
			{
				border: 2px solid rgb(152, 152, 152);
				border-color: rgb(152, 152, 152) transparent rgb(152, 152, 152) transparent;
			}
			
						
			
			#floating-footer-content, #floating-footer-button-background
			{
				background-color: ${dark_theme_background_color};
			}
			
			
			
			#banner-gradient, #floating-footer-gradient
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
			
			
			
			.loading-spinner:after
			{
				border: 2px solid rgb(64, 64, 64);
				border-color: rgb(64, 64, 64) transparent rgb(64, 64, 64) transparent;
			}
			
			
			
			.footer-button, .text-button, .nav-button, .checkbox-container
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
			
			
			
			.loading-spinner:after
			{
				border: 2px solid rgb(216, 216, 216);
				border-color: rgb(216, 216, 216) transparent rgb(216, 216, 216) transparent;
			}
			
			
			
			#floating-footer-content, #floating-footer-button-background
			{
				background-color: ${dark_theme_background_color};
			}
			
			
			
			#banner-gradient, #floating-footer-gradient
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