//Changes background image on mobile one the top is gone so that the user can't see the top banner at the bottom of the page.

$(function()
{
	$(window).scroll(function()
	{
		var w = window,
		d = document,
		e = d.documentElement,
		g = d.getElementsByTagName("body")[0],
		y = w.innerHeight|| e.clientHeight|| g.clientHeight;

		scroll = $(this).scrollTop();
		
		if (scroll >= 0)
		{
			$("#background-image").css("opacity", .5 + .5 * Math.sin(Math.PI * Math.max(1 - scroll / y, 0) - .5 * Math.PI));
			
			$(".scroll-button").css("opacity", .5 + .5 * Math.sin(Math.PI * Math.max(1 - 3 * scroll / y, 0) - .5 * Math.PI));
			
			$(".name-text").css("opacity", .5 + .5 * Math.sin(Math.PI * Math.max(1 - 3 * scroll / y, 0) - .5 * Math.PI));
		}
	});
	
	
	
	$(".scroll-button").click(function()
	{
		$([document.documentElement, document.body]).animate({scrollTop: $("#content").offset().top}, 900, "swing");
	});
	
	
	
	//Switch to the high-res banner when it's loaded.
	$("#full-res-loader").imagesLoaded(function()
	{
		$("#background-image").removeClass("banner-small");
		$("#background-image").addClass("banner");
		$("#background-image")[0].offsetHeight;
	});
});