////////////////////////////// BROWSERS //////////////////////////////
var browser_detect =
{
        init: function()
        {
            this.browser = this.searchString(this.dataBrowser) || "Other";
            this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "Unknown";
        },
        
        searchString: function(data)
        {
            for (var i = 0; i < data.length; i++)
            {
                var dataString = data[i].string;
                this.versionSearchString = data[i].subString;

                if (dataString.indexOf(data[i].subString) !== -1)
                {
                    return data[i].identity;
                }
            }
        },
        
        searchVersion: function (dataString)
        {
            var index = dataString.indexOf(this.versionSearchString);
            
            if (index === -1)
            {
                return;
            }
			
			
			
            var rv = dataString.indexOf("rv:");
            
            if (this.versionSearchString === "Trident" && rv !== -1)
            {
                return parseFloat(dataString.substring(rv + 3));
            }
            
            else
            {
                return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
            }
        },

        dataBrowser:
        [
            {string: navigator.userAgent, subString: "Edge", identity: "MS Edge"},
            {string: navigator.userAgent, subString: "MSIE", identity: "Explorer"},
            {string: navigator.userAgent, subString: "Trident", identity: "Explorer"},
            {string: navigator.userAgent, subString: "Firefox", identity: "Firefox"},
            {string: navigator.userAgent, subString: "Opera", identity: "Opera"},  
            {string: navigator.userAgent, subString: "OPR", identity: "Opera"},  

            {string: navigator.userAgent, subString: "Chrome", identity: "Chrome"}, 
            {string: navigator.userAgent, subString: "Safari", identity: "Safari"}       
        ]
    };
    
browser_detect.init();

var browser_name = browser_detect.browser;



////////////////////////////// FOOTER //////////////////////////////
//Used by dark-theme.js to only affect links once the footer is there.
var footer_loaded = 0;



//Puts the footer in at the bottom of the page, omitting one link (whatever the current page is)
function insert_footer(omit, no_theme_button)
{
    //Required to use this archaic default parameter method so IE doesn't crash before it can say that it's IE and get redirected somewhere else.
    no_theme_button = (typeof no_theme_button != "undefined") ? no_theme_button : 0;
    var delay = 100;
    
    $("#spawn-footer").before('<div style="height: 30vh"></div> <div data-aos="fade-in" data-aos-duration="500" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu"> <div class="line-break"> <div class="line-break-dark" style="opacity: ' + url_vars["theme"] + '"></div> </div> </div> <div style="height: 4vw"></div> <div class="menu-image-links"></div>');
    
    if (omit != "writing")
    {
        $(".menu-image-links").append('<div id="writing-link" class="menu-image-link" data-aos="zoom-out" data-aos-delay="' + delay + '" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu"> <img class="link" onclick="redirect(\'/writing.html\')" src="/graphics/image-links/writing-glyph.png" alt="Writing"></img> </div>');
        
        delay += 100;
    }
    
    if (omit != "blog")
    {
        $(".menu-image-links").append('<div id="blog-link" class="menu-image-link" data-aos="zoom-out" data-aos-delay="' + delay + '" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu"> <img class="link" onclick="redirect(\'/blog.html\')" src="/graphics/image-links/blog-glyph.png" alt="Blog"></img> </div>');
        
        delay += 100;
    }
    
    if (omit != "applets")
    {
        $(".menu-image-links").append('<div id="applets-link" class="menu-image-link" data-aos="zoom-out" data-aos-delay="' + delay + '" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu"> <img class="link" onclick="redirect(\'/applets.html\')" src="/graphics/image-links/applets-glyph.png" alt="Applets"></img> </div>');
        
        delay += 100;
    }
    
    if (omit != "research")
    {
        $(".menu-image-links").append('<div id="research-link" class="menu-image-link" data-aos="zoom-out" data-aos-delay="' + delay + '" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu"> <img class="link" onclick="redirect(\'/research.html\')" src="/graphics/image-links/research-glyph.png" alt="Research"></img> </div>');
        
        delay += 100;
    }
    
    if (omit != "notes")
    {
        $(".menu-image-links").append('<div id="notes-link" class="menu-image-link" data-aos="zoom-out" data-aos-delay="' + delay + '" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu"> <img class="link" onclick="redirect(\'/notes.html\')" src="/graphics/image-links/notes-glyph.png" alt="Notes"></img> </div>');
        
        delay += 100;
    }
    
    if (omit != "bio")
    {
        $(".menu-image-links").append('<div id="bio-link" class="menu-image-link" data-aos="zoom-out" data-aos-delay="' + delay + '" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu"> <img class="link" onclick="redirect(\'/bio.html\')" src="/graphics/image-links/me-glyph.png" alt="Me"></img> </div>');
        
        delay += 100;
    }
    
    $("#spawn-footer").before('<div id="trigger-menu"></div>');
    
    if (no_theme_button == 1)
    {
    	$("#spawn-footer").before('<div style="height: 4vw"></div>');
    }
    
    if (no_theme_button == 0)
    {
        $("#spawn-footer").before('<div style="height: calc(4vw - 45px); min-height: 0px"></div> <div style="display: flex; align-items: left; margin-bottom: 6px; justify-content: space-between"> <div data-aos="zoom-out" data-aos-offset="0" data-aos-once="false"> <img class="footer-button" style="margin-left: 10px" src="/graphics/button-icons/gear.png" alt="Change Theme" onclick="redirect(\'/settings.html\')"></img> </div> <div></div> </div>');
    }
    
    if (url_vars["content_animation"] == 1)
	{
		$(".line-break").parent().removeAttr("data-aos");
		$(".menu-image-link").removeAttr("data-aos");
		$(".footer-button").parent().removeAttr("data-aos");
	}
    
    footer_loaded = 1;
}



////////////////////////////// SETTINGS //////////////////////////////
function redirect(url)
{
	var include_return_url = 0;
	
	if (url == "/settings.html")
	{
		include_return_url = 1;
	}
	
	
	
	if (url_vars["link_animation"] == 1)
	{
		window.location.href = url + concat_url_vars(include_return_url);
	}
	
	else
	{
		$("body").animate({opacity: 0}, 300, "swing");
		
	    setTimeout(function()
	    {
	        window.location.href = url + concat_url_vars(include_return_url);
	    }, 300);
	}
}



var url_vars = {};



//Returns a string of url vars that can be attached to any url.
function concat_url_vars(include_return_url)
{
	var first_var_written = 0;
    var string = "";
    var key;
    var temp = "";
    
    for (var i = 0; i < Object.keys(url_vars).length; i++)
    {
    	key = Object.keys(url_vars)[i];
    	
    	//It's necessary to write theme=0 for the following reason: if a user with a system-wide dark theme enters and attempts to change to the light theme, and this function doesn't write theme=0, the next page loaded will see url_vars["theme"] = null, assume there's no preference, and use the system setting again.
    	if ((key != "theme" && url_vars[key] != 0) || (key == "theme"))
    	{
        	if (first_var_written == 0)
	        {
	            string += "?" + key + "=" + url_vars[key];
	            first_var_written = 1;
	        }
	        
	        else
	        {
	            string += "&" + key + "=" + url_vars[key];
	        }
	    }
    }
    
    
    
    //If we're going to the settings page, we need to know where we came from so we can return there later. Just don't include any current url variables.
    if (include_return_url == 1)
    {
    	if (first_var_written == 0)
	    {
	    	string += "?return=" + encodeURIComponent(window.location.href.split("?", 1));
	        first_var_written = 1;
	    }
	    
		else
		{
	    	string += "&return=" + encodeURIComponent(window.location.href.split("?", 1));
	    }
    }
    
    
    
    return string;
}

function write_url_vars()
{
	//Make state persist on refresh, unless it's the settings page, which will just clog up the history.
	if (!(window.location.href.includes("settings")))
	{
		history.replaceState({}, document.title, window.location.href.split("?", 1) + concat_url_vars(0));
	}
}



//Changes the theme and animates elements.
function switch_theme()
{
	//Light to dark
	if (url_vars["theme"] == 0)
	{
		$("html").css("background-color", "rgb(24, 24, 24)");
		
		$(".heading-text").css("color", "rgb(255, 255, 255)");
		$(".date-text").css("color", "rgb(255, 255, 255)");
		$(".section-text").css("color", "rgb(164, 164, 164)");
		
		//index.html
		$(".quote-text").css("color", "rgb(80, 80, 80)");
		$(".quote-attribution").css("color", "rgb(164, 164, 164)");
		$(".title-text").css("color", "rgb(255, 255, 255)");
		
		$(".text-box").addClass("text-box-dark");
		$(".text-box").css("background-color", "rgb(24, 24, 24)");
		
		$(".line-break-dark").css("opacity", "1");
		
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
		
		$(".heading-text").css("color", "rgb(0, 0, 0)");
		$(".date-text").css("color", "rgb(0, 0, 0)");
		$(".section-text").css("color", "rgb(92, 92, 92)");
		
		//index.html
		$(".quote-text").css("color", "rgb(176, 176, 176)");
		$(".quote-attribution").css("color", "rgb(92, 92, 92)");
		$(".title-text").css("color", "rgb(0, 0, 0)");
		
		$(".text-box").removeClass("text-box-dark");
		$(".text-box").css("background-color", "rgb(255, 255, 255)");
		
		$(".line-break-dark").css("opacity", "0");
		
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



var manual_dark_theme = 0;
//Changes the theme, but without any animation.
function switch_theme_on_load()
{
	if (manual_dark_theme == 1)
	{
		url_vars["theme"] = 1 - url_vars["theme"];
		return;
	}
	
	$("html, .heading-text, .date-text, .section-text, .quote-text, .quote-attribution, .title-text, .text-box, .line-break-dark").addClass("no-transition");
	switch_theme();
	$("html, .heading-text, .date-text, .section-text, .quote-text, .quote-attribution, .title-text, .text-box, .line-break-dark")[0].offsetHeight; //Trigger a reflow, flushing the CSS changes
	$("html, .heading-text, .date-text, .section-text, .quote-text, .quote-attribution, .title-text, .text-box, .line-break-dark").removeClass("no-transition");
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
    }
    
    //Serif to sans
    else
    {
        $("#font-button-text").html($("#font-button-text").html().replace("serif", "sans serif"));
        
        url_vars["font"] = 0;
        
        write_url_vars();
        
        $("html").css("font-family", "'Rubik', sans-serif");
    }
}



function switch_icon_style()
{
	$("#icon-button-row").animate({opacity: 0}, 300, "swing");
	
	setTimeout(function()
	{
		switch_icon_style_on_load();
		$("#icon-button-row").animate({opacity: 1}, 300, "swing");
	}, 300);
}

function switch_icon_style_on_load()
{
	//Glyphs to images
    if (url_vars["icon_style"] == 0)
	{
		try {$("#icon-button-text").html($("#icon-button-text").html().replace("glyphs", "latest subpages"));}
		catch(ex) {}
		
		url_vars["icon_style"] = 1;
		
        write_url_vars();
        
        try
        {
        	var refresh_id = setInterval(function()
			{
				if (footer_loaded == 1)
				{
					$("#writing-link img").attr("src", "/graphics/image-links/writing-image.png");
        			$("#blog-link img").attr("src", "/graphics/image-links/blog-image.png");
        			$("#applets-link img").attr("src", "/graphics/image-links/applets-image.png");
		        	$("#research-link img").attr("src", "/graphics/image-links/research-image.png");
		        	$("#notes-link img").attr("src", "/graphics/image-links/notes-image.png");
		        	$("#bio-link img").attr("src", "/graphics/image-links/me-image.png");
		        	
		        	$("#research-link").addClass("image-link-light");
		        	$("#notes-link").addClass("image-link-light");
					
					clearInterval(refresh_id);
				}
			}, 200);
        }
        
        catch(ex) {}
	}
	
	//Images to glyphs
	else
	{
		try {$("#icon-button-text").html($("#icon-button-text").html().replace("latest subpages", "glyphs"));}
		catch(ex) {}
		
		url_vars["icon_style"] = 0;
		
        write_url_vars();
        
        //We don't need to change any actual images because glyphs are the default and the only place this setting can be changed has no image links at all.
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
        
        try
        {
			$("body").find("*[data-aos]").removeAttr("data-aos");
        }
        
        catch(ex) {}
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



////////////////////////////// RUNTIME //////////////////////////////
var w = window,
d = document,
e = d.documentElement,
g = d.getElementsByTagName("body")[0],
y = w.innerHeight|| e.clientHeight|| g.clientHeight;



//Remove hover events on touchscreen devices.
function hasTouch()
{
    return "ontouchstart" in document.documentElement
           || navigator.maxTouchPoints > 0
           || navigator.msMaxTouchPoints > 0;
}

if (hasTouch())
{ // remove all :hover stylesheets
    try
    { // prevent exception on browsers not supporting DOM styleSheets properly
        for (var si in document.styleSheets)
        {
            var styleSheet = document.styleSheets[si];
            if (!styleSheet.rules) continue;

            for (var ri = styleSheet.rules.length - 1; ri >= 0; ri--)
            {
                if (!styleSheet.rules[ri].selectorText) continue;

                if (styleSheet.rules[ri].selectorText.match(':hover'))
                {
                    styleSheet.deleteRule(ri);
                }
            }
        }
    } catch (ex) {}
}



$(function()
{	
	//Start at the top of the page to prevent banner glitches. I don't understand why, but this is the only working method I've found to reset scroll on load.
	$([document.documentElement, document.body]).animate({scrollTop: 0});
	
	
	
	AOS.init({duration: 1200, once: true, offset: y/4});
	
	
	
	//Handle when the user uses the back button.
	window.addEventListener("pageshow", function(event)
	{
		var historyTraversal = event.persisted || 
			(typeof window.performance != "undefined" && 
			window.performance.navigation.type === 2);
		
		if (historyTraversal)
		{
	    	document.body.style.opacity = 1;
	    	scroll_update();
	    }
	});
	
	
	
	//Handle IE and Edge.
	if (browser_name == "MS Edge")
	{
	    $(".logo").before("<div class='body-text' style='text-align: center'><b>Microsoft Edge is not fully supported on this site. Using <a href='https://www.google.com/chrome/'>Chrome</a>, <a href='https://www.apple.com/safari/'>Safari</a>, <a href='https://www.mozilla.org/en-US/firefox/?v=a'>Firefox</a>, or <a href='https://www.opera.com/'>Opera</a> is highly recommended.<b></div> <div style='height: 5vh'></div>");
	}

	else if (browser_name == "Explorer")
	{
	    window.location.replace("/ie.html");
	}
	
	
	
	//Apply settings.
	url_vars = {"theme": get_url_var("theme"), "font": get_url_var("font"), "icon_style": get_url_var("icon_style"), "no_new_section": get_url_var("no_new_section"), "link_animation": get_url_var("link_animation"), "content_animation": get_url_var("content_animation"), "banner_style": get_url_var("banner_style")};

	if (url_vars["theme"] == null)
	{
	    url_vars["theme"] = 0;
	    
	    //Test for system-wide dark mode.
	    if ($("html").css("background-color") == "rgb(24, 24, 24)")
	    {
	    	url_vars["theme"] = 1;
	    }
	}
	
	//Remove the message from the css that the user has a system-wide dark theme.
	$("html").css("background-color", "rgba(0, 0, 0, 0)");
	
	
	
	if (url_vars["font"] == null)
	{
	    url_vars["font"] = 0;
	}

	if (url_vars["icon_style"] == null)
	{
	    url_vars["icon_style"] = 0;
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
});