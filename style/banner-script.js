//Changes background image on mobile one the top is gone so that the user can't see the top banner at the bottom of the page.

$(function()
{
	$(window).scroll(function()
	{
		var w = window,
		d = document,
		e = d.documentElement,
		g = d.getElementsByTagName('body')[0],
		y = w.innerHeight|| e.clientHeight|| g.clientHeight;

		scroll = $(this).scrollTop();
		
		if (scroll > 0)
		{
			$(".banner").css("opacity", .5 + .5 * Math.sin(Math.PI * Math.max(1 - scroll / y, 0) - .5 * Math.PI));
		}
		
		
		
		if (scroll > 10)
		{
			//Fade out scroll button
			$(".scroll-button").stop();
			$(".scroll-button").animate({opacity: 0}, 200, "swing");
		}
		
		else
		{
			//Fade in scroll button
			$(".scroll-button").stop();
			$(".scroll-button").animate({opacity: 1}, 200, "swing");
		}
	});
	
	$('.scroll-button').click(function()
	{
		$([document.documentElement, document.body]).animate({scrollTop: $("#content").offset().top}, 600, "swing");
	});
});