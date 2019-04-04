var scroll = 0;
var banner_done = 0;
var scroll_button_done = 0;
var global_opacity = 0;



$(function()
{
	if (browser_detect.browser == "MS Edge")
	{
		$("#background-image").addClass("bad-banner");
	}
	
	
	
	AOS.init({duration: 1200, once: false, offset: y/4});
	
	
	
	//Fade in the low-res banner when it's loaded.
	$("#background-image").css("opacity", 0);
	$("#small-loader").imagesLoaded(function()
	{
		$("#background-image").animate({opacity: 1}, 300, "swing");
	});
	
	
	
	//Switch to the high-res banner when it's loaded.
	$("#full-res-loader").imagesLoaded(function()
	{
		$("#background-image").removeClass("banner-small");
		$("#background-image").addClass("banner");
		$("#background-image")[0].offsetHeight;
		
		//If the user just sits at the top of the page for 3 seconds without scrolling after the full background is loaded, give them a scroll button.
		if (scroll == 0)
		{
			setTimeout(add_scroll_button, 3000);
		}
	});
	
	
	
	$(window).scroll(function()
	{
		scroll_update();
	});
});



function scroll_update()
{
	scroll = $(window).scrollTop();
	
	if (scroll >= 0)
	{
		if (scroll <= y)
		{
			global_opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - scroll / y, 0) - .5 * Math.PI);
			$("#background-image").css("opacity", global_opacity);
			
			if (global_opacity == 0)
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
			global_opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - 3 * scroll / y, 0) - .5 * Math.PI);
			
			$(".scroll-button").css("opacity", global_opacity);
			
			if (global_opacity == 0)
			{
				$(".scroll-button").remove();
				scroll_button_done = 1;
			}
			
			else
			{
				scroll_button_done = 0;
			}
		}
		
		else if (scroll_button_done == 0)
		{
			$(".name-text").css("opacity", 0);
			
			$(".scroll-button").remove();
			
			scroll_button_done = 1;
		}
	}
}



function add_scroll_button()
{
	//Only add the scroll button if the user is still on the top of the page.
	if (scroll == 0)
	{
		$("#banner-cover").before("<div style='height: 100vh; display: flex; align-items: center; justify-content: center' data-aos='fade-down'><img class='scroll-button' src='/graphics/chevron.png' alt='Scroll down' onclick='scroll_down()'></img></div>");
		
		$("#banner-cover").remove();
	}
}



//Triggered by pressing the scroll button.
function scroll_down()
{
	$([document.documentElement, document.body]).animate({scrollTop: $("#content").offset().top}, 900, "swing");
}