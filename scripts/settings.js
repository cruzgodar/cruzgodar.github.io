//Handles the various settings' effects on the page.



var settings_done;

var url_var_functions = {
	"animated":
	{
		"theme": switch_theme,
		"font": switch_font,
		"contrast": switch_contrast,
		"comments": switch_comments,
		"no_new_section": switch_new_section,
		"content_animation": switch_content_animation,
		"banner_style": switch_banner_style
	},
	
	"onload":
	{
		"theme": switch_theme_on_load,
		"font": switch_font_on_load,
		"contrast": switch_contrast_on_load,
		"comments": switch_comments_on_load,
		"no_new_section": switch_new_section_on_load,
		"content_animation": switch_content_animation_on_load,
		"banner_style": switch_banner_style_on_load
	}
};



function get_url_var(id)
{
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	
	for (var i = 0; i < vars.length; i++)
	{
		var pair = vars[i].split("=");
		
		if (pair[0] == id)
		{
			return pair[1];
		}
	}
	
	return null;
}

var url_vars = 
{
	"theme": get_url_var("theme"),
	"font": get_url_var("font"),
	"contrast": get_url_var("contrast"),
	"comments": get_url_var("comments"),
	"no_new_section": get_url_var("no_new_section"),
	"content_animation": get_url_var("content_animation"),
	"banner_style": get_url_var("banner_style")
};



if (window.matchMedia("(prefers-color-scheme: dark)").matches && url_vars["theme"] == null)
{
	url_vars["theme"] = 1;
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
		$("html").css("background-color", "rgb(24, 24, 24)");
		
		
		
		if (url_vars["contrast"] == 1)
		{
			$(".section-text").css("color", "rgb(232, 232, 232)");
			$(".body-text").css("color", "rgb(216, 216, 216)");
			$(".body-text .link").css("color", "rgb(216, 255, 216)");
			$(".song-lyrics").css("color", "rgb(216, 216, 216)");
			$(".image-link-subtext").css("color", "rgb(216, 216, 216)");
			
			$(".quote-text").css("color", "rgb(192, 192, 192");
			$(".quote-attribution").css("color", "rgb(234, 234, 234)");
			
			$(".footer-button, .text-button, .nav-button").css("border-color", "rgb(127, 127, 127)");
		}
		
		else
		{
			$(".section-text").css("color", "rgb(184, 184, 184)");
			$(".body-text").css("color", "rgb(152, 152, 152)");
			$(".body-text .link").css("color", "rgb(152, 216, 152)");
			$(".song-lyrics").css("color", "rgb(152, 152, 152)");
			$(".image-link-subtext").css("color", "rgb(152, 152, 152)");
			
			$(".quote-text").css("color", "rgb(104, 104, 104)");
			$(".quote-attribution").css("color", "rgb(188, 188, 188)");
			
			$("head").append(`
				<style>
					.line-break
					{
						background: rgb(24,24,24);
						background: -moz-linear-gradient(left, rgb(24,24,24) 0%, rgb(116,116,116) 50%, rgb(24,24,24) 100%);
						background: -webkit-linear-gradient(left, rgb(24,24,24) 0%,rgb(116,116,116) 50%,rgb(24,24,24) 100%);
						background: linear-gradient(to right, rgb(24,24,24) 0%,rgb(116,116,116) 50%,rgb(24,24,24) 100%);
					}
					
					.text-box
					{
						background-color: rgb(24, 24, 24);
						color: rgb(152, 152, 152);
						border-color: rgb(88, 88, 88);
					}
					
					.text-box:focus
					{
						border-color: rgb(152, 152, 152);
						color: rgb(216, 216, 216);
					}
				</style>
			`);
		}
		
		
		
		$(".heading-text").css("color", "rgb(255, 255, 255)");
		$(".date-text").css("color", "rgb(255, 255, 255)");
		
		$(".title-text").css("color", "rgb(255, 255, 255)");
		
		
		
		$("#theme-button-row").animate({opacity: 0}, 300, "swing");
		
		setTimeout(function()
		{
 			try {$("#theme-button-text").html($("#theme-button-text").html().replace("light", "dark"));}
 			catch(ex) {}
 			
			$("#theme-button-row").animate({opacity: 1}, 300, "swing");
		}, 300);
		
		url_vars["theme"] = 1;
		write_url_vars();
	}
	
	//Dark to light
	else
	{
		$("html").css("background-color", "rgb(255, 255, 255)");
		
		
		
		if (url_vars["contrast"] == 1)
		{
			$(".section-text").css("color", "rgb(48, 48, 48)");
			$(".body-text").css("color", "rgb(64, 64, 64)");
			$(".body-text .link").css("color", "rgb(64, 128, 64)");
			$(".song-lyrics").css("color", "rgb(64, 64, 64)");
			$(".image-link-subtext").css("color", "rgb(64, 64, 64)");
			$(".text-button").css("color", "rgb(64, 64, 64)");
			
			$(".quote-text").css("color", "rgb(88, 88, 88");
			$(".quote-attribution").css("color", "rgb(46, 46, 46)");
			
			$(".footer-button, .text-button, .nav-button").css("border-color", "rgb(64, 64, 64)");
		}
		
		else
		{
			$(".section-text").css("color", "rgb(96, 96, 96)");
			
			$(".quote-text").css("color", "rgb(176, 176, 176)");
			$(".quote-attribution").css("color", "rgb(92, 92, 92)");
		}
		
		
		
		$(".heading-text").css("color", "rgb(0, 0, 0)");
		$(".date-text").css("color", "rgb(0, 0, 0)");
		
		$(".title-text").css("color", "rgb(0, 0, 0)");
		
		$("#theme-button-row").animate({opacity: 0}, 300, "swing");
		
		setTimeout(function()
		{
			try {$("#theme-button-text").html($("#theme-button-text").html().replace("dark", "light"));}
			catch(ex) {}
			
			$("#theme-button-row").animate({opacity: 1}, 300, "swing");
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



function switch_contrast()
{
	$("#contrast-button-row").animate({opacity: 0}, 300, "swing");
	
	setTimeout(function()
	{
		switch_contrast_on_load();
		$("#contrast-button-row").animate({opacity: 1}, 300, "swing");
	}, 300);
}

function switch_contrast_on_load()
{
	//Default to high
	if (url_vars["contrast"] == 0)
	{
		try {$("#contrast-button-text").html($("#contrast-button-text").html().replace("normal", "high"));}
		catch(ex) {}
		
		url_vars["contrast"] = 1;
		
		write_url_vars();
		
		
		
		if (url_vars["theme"] == 1)
		{
			$(".section-text").css("color", "rgb(232, 232, 232)");
			$(".body-text").css("color", "rgb(216, 216, 216)");
			$(".body-text .link").css("color", "rgb(216, 255, 216)");
			$(".song-lyrics").css("color", "rgb(216, 216, 216)");
			$(".image-link-subtext").css("color", "rgb(216, 216, 216)");
			
			$(".quote-text").css("color", "rgb(192, 192, 192)");
			$(".quote-attribution").css("color", "rgb(234, 234, 234)");
			
			$(".footer-button, .text-button, .nav-button").css("border-color", "rgb(127, 127, 127)");
			
			$("head").append(`
				<style>
					.line-break
					{
						background: rgb(24,24,24);
						background: -moz-linear-gradient(left, rgb(24,24,24) 0%, rgb(164,164,164) 50%, rgb(24,24,24) 100%);
						background: -webkit-linear-gradient(left, rgb(24,24,24) 0%,rgb(164,164,164) 50%,rgb(24,24,24) 100%);
						background: linear-gradient(to right, rgb(24,24,24) 0%,rgb(164,164,164) 50%,rgb(24,24,24) 100%);
					}
					
					.scroll-button
					{
						border-color: rgb(88, 88, 88)
					}
					
					.text-box
					{
						border-color: rgb(152, 152, 152);
						background-color: rgb(24, 24, 24);
						color: rgb(216, 216, 216);
					}
					
					.text-box:focus
					{
						border-color: rgb(216, 216, 216);
						color: rgb(255, 255, 255);
					}
				</style>
			`);
		}
		
		else
		{
			$(".section-text").css("color", "rgb(48, 48, 48)");
			$(".body-text").css("color", "rgb(64, 64, 64)");
			$(".body-text .link").css("color", "rgb(64, 128, 64)");
			$(".song-lyrics").css("color", "rgb(64, 64, 64)");
			$(".image-link-subtext").css("color", "rgb(64, 64, 64)");
			$(".text-button").css("color", "rgb(64, 64, 64)");
			
			$(".quote-text").css("color", "rgb(88, 88, 88)");
			$(".quote-attribution").css("color", "rgb(46, 46, 46)");
			
			$(".footer-button, .text-button, .nav-button").css("border-color", "rgb(64, 64, 64)");
			
			$("head").append(`
				<style>
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
				</style>
			`);
			
			try
			{
				$(".nav-button").each(function(index, element)
				{
					$(this).attr("src", $(this).attr("src").replace("chevron-left", "chevron-left-dark").replace("chevron-right", "chevron-right-dark"));
				});
			}
			
			catch(ex) {}
		}
		
		
		
		$(".text-button").css("color", "rgb(64, 64, 64)");
	}
	
	//High to default
	else
	{
		try {$("#contrast-button-text").html($("#contrast-button-text").html().replace("high", "normal"));}
		catch(ex) {}
		
		url_vars["contrast"] = 0;
		
		write_url_vars();
		
		
		
		if (url_vars["theme"] == 1)
		{
			$(".section-text").css("color", "rgb(184, 184, 184)");
			$(".body-text").css("color", "rgb(152, 152, 152)");
			$(".body-text .link").css("color", "rgb(152, 216, 152)");
			$(".song-lyrics").css("color", "rgb(152, 152, 152)");
			$(".image-link-subtext").css("color", "rgb(152, 152, 152)");
			$(".text-button").css("color", "rgb(152, 152, 152)");
			
			$(".quote-text").css("color", "rgb(104, 104, 104");
			$(".quote-attribution").css("color", "rgb(188, 188, 188)");
			
			$(".footer-button, .text-button, .nav-button").css("border-color", "rgb(127, 127, 127)");
		}
		
		else
		{
			$(".section-text").css("color", "rgb(96, 96, 96)");
			$(".body-text").css("color", "rgb(127, 127, 127)");
			$(".body-text .link").css("color", "rgb(127, 192, 127)");
			$(".song-lyrics").css("color", "rgb(127, 127, 127)");
			$(".image-link-subtext").css("color", "rgb(127, 127, 127)");
			$(".text-button").css("color", "rgb(127, 127, 127)");
			
			$(".quote-text").css("color", "rgb(176, 176, 176");
			$(".quote-attribution").css("color", "rgb(92, 92, 92)");
			
			$(".footer-button, .text-button, .nav-button").css("border-color", "rgb(127, 127, 127)");
		}
	}
}



function switch_font()
{
	$("#font-button-row").animate({opacity: 0}, 300, "swing");
	setTimeout(function()
	{
		switch_font_on_load();
		
		setTimeout(function()
		{
			$("#font-button-row").animate({opacity: 1}, 300, "swing");
		});
	}, 300);
}

function switch_font_on_load()
{
	//Sans to serif
	if (url_vars["font"] == 0)
	{
		try {$("#font-button-text").html($("#font-button-text").html().replace("always sans serif", "serif on writing"));}
		catch(ex) {}
		
		url_vars["font"] = 1;
		
		write_url_vars();
		
		if (page_settings["writing_page"])
		{
			$(".body-text").css("font-family", "'PT Serif', serif");
		}
	}
	
	//Serif to sans
	else
	{
		try {$("#font-button-text").html($("#font-button-text").html().replace("serif on writing", "always sans serif"));}
		catch(ex) {}
		
		url_vars["font"] = 0;
		
		write_url_vars();
	}
}



function switch_comments()
{
	$("#comments-button-row").animate({opacity: 0}, 300, "swing");
	
	setTimeout(function()
	{
		switch_comments_on_load();
		$("#comments-button-row").animate({opacity: 1}, 300, "swing");
	}, 300);
}

function switch_comments_on_load()
{
	if (url_vars["comments"] == 0)
	{
		try {$("#comments-button-text").html($("#comments-button-text").html().replace("enabled", "disabled"));}
		catch(ex) {}
		
		try
		{
			$("#disqus_thread").prev().remove();
			$("#disqus_thread").prev().remove();
			$("#disqus_thread").prev().remove();
			$("#disqus_thread").remove();
		}
		catch(ex) {}
		
		url_vars["comments"] = 1;
		
		write_url_vars();
	}
	
	else
	{
		try {$("#comments-button-text").html($("#comments-button-text").html().replace("disabled", "enabled"));}
		catch(ex) {}
		
		url_vars["comments"] = 0;
		
		write_url_vars();
	}
}



function switch_new_section()
{
	$("#new-section-button-row").animate({opacity: 0}, 300, "swing");
	
	setTimeout(function()
	{
		switch_new_section_on_load();
		$("#new-section-button-row").animate({opacity: 1}, 300, "swing");
	}, 300);
}

function switch_new_section_on_load()
{
	//Hide
	if (url_vars["no_new_section"] == 0)
	{
		try {$("#new-section-button-text").html($("#new-section-button-text").html().replace("shown", "hidden"));}
		catch(ex) {}
		
		url_vars["no_new_section"] = 1;
		
		write_url_vars();
		
		try
		{
			$("#new-section").css("display", "none");
		}
		
		catch(ex) {}
	}
	
	else
	{
		try {$("#new-section-button-text").html($("#new-section-button-text").html().replace("hidden", "shown"));}
		catch(ex) {}
		
		url_vars["no_new_section"] = 0;
		
		write_url_vars();
	}
}



function switch_content_animation()
{
	$("#content-animation-button-row").animate({opacity: 0}, 300, "swing");
	
	setTimeout(function()
	{
		switch_content_animation_on_load();
		$("#content-animation-button-row").animate({opacity: 1}, 300, "swing");
	}, 300);
}

function switch_content_animation_on_load()
{
	if (url_vars["content_animation"] == 0)
	{
		try {$("#content-animation-button-text").html($("#content-animation-button-text").html().replace("animated", "static"));}
		catch(ex) {}
		
		url_vars["content_animation"] = 1;
		
		write_url_vars();
		
		//The actual removing of the data-aos attribute is handled in settings-head.js.
	}
	
	else
	{
		try {$("#content-animation-button-text").html($("#content-animation-button-text").html().replace("static", "animated"));}
		catch(ex) {}
		
		url_vars["content_animation"] = 0;
		
		write_url_vars();
	}
}



function switch_banner_style()
{
	$("#banner-style-button-row").animate({opacity: 0}, 300, "swing");
	
	setTimeout(function()
	{
		switch_banner_style_on_load();
		$("#banner-style-button-row").animate({opacity: 1}, 300, "swing");
	}, 300);
}

function switch_banner_style_on_load()
{
	if (url_vars["banner_style"] == 0)
	{
		try {$("#banner-style-button-text").html($("#banner-style-button-text").html().replace("parallax", "simple"));}
		catch(ex) {}
		
		url_vars["banner_style"] = 1;
		
		write_url_vars();
		
		try
		{
			$("#background-image").addClass("bad-banner");
		}
		
		catch(ex) {}
	}
	
	else
	{
		try {$("#banner-style-button-text").html($("#banner-style-button-text").html().replace("simple", "parallax"));}
		catch(ex) {}
		
		url_vars["banner_style"] = 0;
		
		write_url_vars();
	}
}