//Changes background image on mobile one the top is gone so that the user can't see the top banner at the bottom of the page.

$(function()
{
	$(window).scroll(function ()
	{
		var w = window,
		d = document,
		e = d.documentElement,
		g = d.getElementsByTagName('body')[0],
		y = w.innerHeight|| e.clientHeight|| g.clientHeight;

		if ($(this).scrollTop() > y)
		{
			document.getElementById("background-image").className = "banner-white";
		}

		else
		{
			document.getElementById("background-image").className = "banner";
		}
	});
});