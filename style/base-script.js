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