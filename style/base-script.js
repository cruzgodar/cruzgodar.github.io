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

if (browser_name == "MS Edge")
{
    $(".logo").before("<div class='body-text' style='text-align: center'><b>Microsoft Edge is not fully supported on this site. Using <a href='https://www.google.com/chrome/'>Chrome</a>, <a href='https://www.apple.com/safari/'>Safari</a>, <a href='https://www.mozilla.org/en-US/firefox/?v=a'>Firefox</a>, or <a href='https://www.opera.com/'>Opera</a> is highly recommended.<b></div> <div style='height: 5vh'></div>");
}

else if (browser_name == "Explorer")
{
    window.location.replace("https://www.cruzgodar.com/ie.html");
}



var w = window,
d = document,
e = d.documentElement,
g = d.getElementsByTagName("body")[0],
y = w.innerHeight|| e.clientHeight|| g.clientHeight;

AOS.init({duration: 1200, once: true, offset: y/4});



//Used by dark-theme.js to only affect links once the footer is there.
var footer_loaded = 0;



//Remove the .html ending from the url for that slightly cleaner look.
history.replaceState({}, document.title, window.location.href.replace("/index.html", ""));
history.replaceState({}, document.title, window.location.href.replace(".html", ""));



//Puts the footer in at the bottom of the page, omitting one link (whatever the current page is)
function insert_footer(omit, no_theme_button)
{
    //Required to use this archaic default parameter method so IE doesn't crash before it can say that it's IE and get redirected somewhere else.
    no_theme_button = (typeof no_theme_button != "undefined") ? no_theme_button : 0;
    
	var current_theme = get_url_var("dark");
    var delay = 100;
    
    $("#spawn-footer").before('<div style="height: 30vh"></div> <div data-aos="fade-in" data-aos-duration="500" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu"> <div class="line-break"> <div class="line-break-dark" style="opacity: ' + current_theme + '"></div> </div> </div> <div style="height: 5vw"></div> <div class="menu-image-links"></div>');
    
    if (omit != "writing")
    {
        $(".menu-image-links").append('<div data-aos="zoom-out" data-aos-delay="' + delay + '" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu"> <a href="/writing.html"> <div class="menu-image-link" style="background-color: rgb(196, 244, 255)"> <img src="/graphics/writing.png"></img> </div> </a> </div>');
        
        delay += 100;
    }
    
    if (omit != "blog")
    {
        $(".menu-image-links").append('<div data-aos="zoom-out" data-aos-delay="' + delay + '" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu"> <a href="/blog.html"> <div class="menu-image-link" style="background-color: rgb(255, 224, 200)"> <img src="/graphics/blog.png"></img> </div> </a> </div>');
        
        delay += 100;
    }
    
    if (omit != "research")
    {
        $(".menu-image-links").append('<div data-aos="zoom-out" data-aos-delay="' + delay + '" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu"> <a href="/research.html"> <div class="menu-image-link" style="background-color: rgb(208, 200, 255)"> <img src="/graphics/research.png"></img> </div> </a> </div>');
        
        delay += 100;
    }
    
    if (omit != "notes")
    {
        $(".menu-image-links").append('<div data-aos="zoom-out" data-aos-delay="' + delay + '" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu"> <a href="/notes.html"> <div class="menu-image-link" style="background-color: rgb(198, 240, 198)"> <img src="/graphics/notes.png"></img> </div> </a> </div>');
        
        delay += 100;
    }
    
    if (omit != "bio")
    {
        $(".menu-image-links").append('<div data-aos="zoom-out" data-aos-delay="' + delay + '" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu"> <a href="/bio.html"> <div class="menu-image-link" style="background-color: rgb(224, 224, 224)"> <img src="/graphics/me.png"></img> </div> </a> </div>');
        
        delay += 100;
    }
    
    $("#spawn-footer").before('<div id="trigger-menu"></div> <div style="height: 5vw"></div>');
    
    if (no_theme_button == 0)
    {
        $("#spawn-footer").before('<div style="display: flex; align-items: left; margin-bottom: 6px; justify-content: space-between"> <div data-aos="zoom-out" data-aos-offset="0"> <img id="theme-button" src="/graphics/moon.png" alt="Change Theme" onclick="switch_theme()"></img> </div> <div></div> </div>');
    }
    
    
    
    footer_loaded = 1;
}



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