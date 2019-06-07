//Handles the various settings' effects on the page.



var settings_body_done;

$(function()
{
	if (url_vars["theme"] == null)
	{
		url_vars["theme"] = 0;
	}
	
	if (url_vars["font"] == null)
	{
		url_vars["font"] = 0;
	}
	
	if (url_vars["contrast"] == null)
	{
		url_vars["contrast"] = 0;
	}

	if (url_vars["no_new_section"] == null)
	{
		url_vars["no_new_section"] = 0;
	}
	
	if (url_vars["link_animation"] == null)
	{
		url_vars["link_animation"] = 0;
	}
	
	if (url_vars["content_animation"] == null)
	{
		url_vars["content_animation"] = 0;
	}
	
	if (url_vars["banner_style"] == null)
	{
		url_vars["banner_style"] = 0;
	}
	
	
	
	if (url_vars["theme"] == 1)
	{
		url_vars["theme"] = 0;
		switch_theme_on_load();
	}
	
	if (url_vars["font"] == 1)
	{
		url_vars["font"] = 0;
		switch_font_on_load();
	}
	
	if (url_vars["contrast"] == 1)
	{
		url_vars["contrast"] = 0;
		switch_contrast_on_load();
	}

	if (url_vars["icon_style"] == 1)
	{
		url_vars["icon_style"] = 0;
		switch_icon_style_on_load();
	}

	if (url_vars["no_new_section"] == 1)
	{
		url_vars["no_new_section"] = 0;
		switch_new_section_on_load();
	}
	
	if (url_vars["link_animation"] == 1)
	{
		url_vars["link_animation"] = 0;
		switch_link_animation_on_load();
	}
	
	if (url_vars["content_animation"] == 1)
	{
		url_vars["content_animation"] = 0;
		switch_content_animation_on_load();
	}
	
	if (url_vars["banner_style"] == 1)
	{
		url_vars["banner_style"] = 0;
		switch_banner_style_on_load();
	}
	
	
	
	settings_body_done = 1;
});



//Changes the theme and animates elements.
function switch_theme()
{
	//Light to dark
	if (url_vars["theme"] == 0)
	{
		$("html").css("background-color", "rgb(24, 24, 24)");
		
		
		
		if (url_vars["contrast"] == 1)
		{
			
			$(".section-text").css("color", "rgb(208, 208, 208)");
			$(".body-text").css("color", "rgb(192, 192, 192)");
			$(".body-text .link").css("color", "rgb(192, 256, 192)");
			$(".song-lyrics").css("color", "rgb(192, 192, 192)");
			$(".image-link-subtext").css("color", "rgb(192, 192, 192)");
			
			$(".quote-text").css("color", "rgb(168, 168, 168");
			$(".quote-attribution").css("color", "rgb(210, 210, 210)");
			
			$(".footer-button, .text-button, .nav-button").css("border-color", "rgb(127, 127, 127)");
		}
		
		else
		{
			$(".section-text").css("color", "rgb(160, 160, 160)");
			
			$(".quote-text").css("color", "rgb(80, 80, 80)");
			$(".quote-attribution").css("color", "rgb(164, 164, 164)");
			
			$("head").append(`
				<style>
					.line-break
					{
						background: rgb(24,24,24);
						background: -moz-linear-gradient(left, rgb(24,24,24) 0%, rgb(92,92,92) 50%, rgb(24,24,24) 100%);
						background: -webkit-linear-gradient(left, rgb(24,24,24) 0%,rgb(92,92,92) 50%,rgb(24,24,24) 100%);
						background: linear-gradient(to right, rgb(24,24,24) 0%,rgb(92,92,92) 50%,rgb(24,24,24) 100%);
					}
					
					.text-box
					{
						background-color: rgb(24, 24, 24);
						color: rgb(127, 127, 127);
						border-color: rgb(64, 64, 64);
					}
					
					.text-box:focus
					{
						border-color: rgb(127, 127, 127);
						color: rgb(192, 192, 192);
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
	if (manual_dark_theme == 1)
	{
		url_vars["theme"] = 1 - url_vars["theme"];
		return;
	}
	
	switch_theme();
}



function switch_font()
{
	$("body").animate({opacity: 0}, 300, "swing");
	setTimeout(function()
	{
		switch_font_on_load();
		
		setTimeout(function()
		{
			$("body").animate({opacity: 1}, 300, "swing");
		});
	}, 300);
}

function switch_font_on_load()
{
	//Sans to serif
	if (url_vars["font"] == 0)
	{
		try {$("#font-button-text").html($("#font-button-text").html().replace("sans serif", "serif"));}
		catch(ex) {}
		
		url_vars["font"] = 1;
		
		write_url_vars();
		
		$("html").css("font-family", "'Gentium Book Basic', serif");
		$("html").css("font-size", "max(calc((13.2 / 12) * (1.5vmin + 1.5vmax) / 2), 13.2px)");
	}
	
	//Serif to sans
	else
	{
		try {$("#font-button-text").html($("#font-button-text").html().replace("serif", "sans serif"));}
		catch(ex) {}
		
		url_vars["font"] = 0;
		
		write_url_vars();
		
		$("html").css("font-family", "'Rubik', sans-serif");
		$("html").css("font-size", "max(calc((1.5vmin + 1.5vmax) / 2), 12px)");
	}
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
			$(".section-text").css("color", "rgb(208, 208, 208)");
			$(".body-text").css("color", "rgb(192, 192, 192)");
			$(".body-text .link").css("color", "rgb(192, 256, 192)");
			$(".song-lyrics").css("color", "rgb(192, 192, 192)");
			$(".image-link-subtext").css("color", "rgb(192, 192, 192)");
			
			$(".quote-text").css("color", "rgb(168, 168, 168");
			$(".quote-attribution").css("color", "rgb(210, 210, 210)");
			
			$(".footer-button, .text-button, .nav-button").css("border-color", "rgb(127, 127, 127)");
			
			$("head").append(`
				<style>
					.line-break
					{
						background: rgb(24,24,24);
						background: -moz-linear-gradient(left, rgb(24,24,24) 0%, rgb(140,140,140) 50%, rgb(24,24,24) 100%);
						background: -webkit-linear-gradient(left, rgb(24,24,24) 0%,rgb(140,140,140) 50%,rgb(24,24,24) 100%);
						background: linear-gradient(to right, rgb(24,24,24) 0%,rgb(140,140,140) 50%,rgb(24,24,24) 100%);
					}
					
					.scroll-button
					{
						border-color: rgb(64, 64, 64)
					}
					
					.text-box
					{
						border-color: rgb(127, 127, 127);
						background-color: rgb(24, 24, 24);
						color: rgb(192, 192, 192);
					}
					
					.text-box:focus
					{
						border-color: rgb(192, 192, 192);
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
			$(".section-text").css("color", "rgb(160, 160, 160)");
			$(".body-text").css("color", "rgb(127, 127, 127)");
			$(".body-text .link").css("color", "rgb(127, 192, 127)");
			$(".song-lyrics").css("color", "rgb(127, 127, 127)");
			$(".image-link-subtext").css("color", "rgb(127, 127, 127)");
			$(".text-button").css("color", "rgb(127, 127, 127)");
			
			$(".quote-text").css("color", "rgb(80, 80, 80");
			$(".quote-attribution").css("color", "rgb(164, 164, 164)");
			
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
	
	//Images to glyphs
	else
	{
		try {$("#new-section-button-text").html($("#new-section-button-text").html().replace("hidden", "shown"));}
		catch(ex) {}
		
		url_vars["no_new_section"] = 0;
		
		write_url_vars();
		
		//Similarly to the images and glyphs, we don't need to do anything in this case.
	}
}



function switch_link_animation()
{
	$("#link-animation-button-row").animate({opacity: 0}, 300, "swing");
	
	setTimeout(function()
	{
		switch_link_animation_on_load();
		$("#link-animation-button-row").animate({opacity: 1}, 300, "swing");
	}, 300);
}

function switch_link_animation_on_load()
{
	if (url_vars["link_animation"] == 0)
	{
		try {$("#link-animation-button-text").html($("#link-animation-button-text").html().replace("animated", "static"));}
		catch(ex) {}
		
		url_vars["link_animation"] = 1;
		
		console.log(url_vars);
		
		write_url_vars();
	}
	
	else
	{
		try {$("#link-animation-button-text").html($("#link-animation-button-text").html().replace("static", "animated"));}
		catch(ex) {}
		
		url_vars["link_animation"] = 0;
		
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