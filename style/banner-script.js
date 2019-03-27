var banner_done = 0;
var scroll_button_done = 0;

$(function()
{
	AOS.init({duration: 1200, once: false, offset: y/3});
	
	$(window).scroll(function()
	{
		scroll_update();
	});
	
	scroll_update();
	
	
	
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



function scroll_update()
{
	var scroll = $(window).scrollTop();
	var opacity = 0;
	
	if (scroll >= 0)
	{
		if (scroll <= y)
		{
			opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - scroll / y, 0) - .5 * Math.PI);
			$("#background-image").css("opacity", opacity);
			
			if (opacity == 0)
			{
				banner_done = 1;
			}
			
			else
			{
				banner_done = 0;
			}
		}
		
		else if (banner_done == 0)
		{
			$("#background-image").css("opacity", 0);
			banner_done = 1;
		}
		
		
		
		if (scroll <= y/3)
		{
			opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - 3 * scroll / y, 0) - .5 * Math.PI);
			
			$(".scroll-button").css("opacity", opacity);
			
			$(".name-text").css("opacity", opacity);
			
			if (opacity == 0)
			{
				scroll_button_done = 1;
			}
			
			else
			{
				scroll_button_done = 0;
			}
		}
		
		else if (scroll_button_done == 0)
		{
			$(".scroll-button").css("opacity", 0);
			
			$(".name-text").css("opacity", 0);
			
			scroll_button_done = 1;
		}
	}
}