//Initiate anamations when they're a third of the way up the screen.
var w = window,
d = document,
e = d.documentElement,
g = d.getElementsByTagName("body")[0],
y = w.innerHeight|| e.clientHeight|| g.clientHeight;

AOS.init({duration: 1200, once: true, offset: y/4});



//Remove the .html ending from the url for that slightly cleaner look.
history.replaceState({}, document.title, window.location.href.replace("/index.html", ""));
history.replaceState({}, document.title, window.location.href.replace(".html", ""));



//Puts the footer in at the bottom of the page, omitting one link (whatever the current page is)
function insert_footer(omit)
{
	var current_theme = get_url_var("dark");
    var delay = 100;
    
    $("#spawn-footer").before('<div style="height: 30vh"></div> <div data-aos="fade-in" data-aos-duration="500" data-aos-offset="0" data-aos-anchor="#trigger-menu"> <div class="line-break"> <div class="line-break-dark" style="opacity: ' + current_theme + '"></div> </div> </div> <div style="height: 5vw"></div> <div class="menu-image-links"></div>');
    
    if (omit != "writing")
    {
        $(".menu-image-links").append('<div class="menu-image-link" data-aos="zoom-out" data-aos-delay="' + delay + '" data-aos-offset="0" data-aos-anchor="#trigger-menu"> <a href="/writing.html"> <img src="/graphics/writing.png" alt="Writing"/> </a> </div>');
        
        delay += 100;
    }
    
    if (omit != "blog")
    {
        $(".menu-image-links").append('<div class="menu-image-link" data-aos="zoom-out" data-aos-delay="' + delay + '" data-aos-offset="0" data-aos-anchor="#trigger-menu"> <a href="/blog.html"> <img src="/graphics/blog.png" alt="Blog"/> </a> </div>');
        
        delay += 100;
    }
    
    if (omit != "research")
    {
        $(".menu-image-links").append('<div class="menu-image-link image-link-light" data-aos="zoom-out" data-aos-delay="' + delay + '" data-aos-offset="0" data-aos-anchor="#trigger-menu"> <a href="/research.html"> <img src="/graphics/research.png" alt="Research"/> </a> </div>');
        
        delay += 100;
    }
    
    if (omit != "notes")
    {
        $(".menu-image-links").append('<div class="menu-image-link image-link-light" data-aos="zoom-out" data-aos-delay="' + delay + '" data-aos-offset="0" data-aos-anchor="#trigger-menu"> <a href="/notes.html"> <img src="/graphics/notes.png" alt="Notes"/> </a> </div>');
        
        delay += 100;
    }
    
    if (omit != "bio")
    {
        $(".menu-image-links").append('<div class="menu-image-link" data-aos="zoom-out" data-aos-delay="' + delay + '" data-aos-offset="0" data-aos-anchor="#trigger-menu"> <a href="/bio.html"> <img src="/graphics/me.png" alt="Me"/> </a> </div>');
        
        delay += 100;
    }
    
    $("#spawn-footer").before('<div style="height: 5vw"></div> <div id="trigger-menu"></div> <img id="theme-button" src="/graphics/moon.png" alt="Change Theme" onclick="switch_theme()" data-aos="zoom-out" data-aos-offset="0" data-aos-anchor="#trigger-menu"></img>');
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