//Initiate anamations when they're a third of the way up the screen. Also holds some other stuff that's required on page load.

var w = window,
d = document,
e = d.documentElement,
g = d.getElementsByTagName('body')[0],
y = w.innerHeight|| e.clientHeight|| g.clientHeight;

AOS.init({duration: 1200, once: true, offset: y/3});



if ("ontouchstart" in document)
{
    Y.one("body").removeClass("no-touch");
}