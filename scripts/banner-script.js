var scroll = 0;
var banner_done = 0;
var scroll_button_done = 0;
var global_opacity = 0;
var small_loader_loaded = 0;

var banner_extension = "";



$(function()
{
	AOS.init({duration: 1200, once: false, offset: window_height/4});
	
	
	
	//Set up the banner classes. We have .banner and .banner-small, the latter a low-res version to improve loading speed. If possible, we use WebP, and we add a media query to switch to the portrait version whenever possible to avoid loading parts of the image that won't be displayed.
	var refresh_id = setInterval(function()
	{
		if (supports_webp != null)
		{
			clearInterval(refresh_id);
			
			if (supports_webp)
			{
				banner_extension = "webp";
			}
			
			else
			{
				banner_extension = "jpg";
			}
		
			
			
			$("head").append('<style> .banner:before { background: url("banners/landscape.' + banner_extension + '") no-repeat center center; -webkit-background-size: cover; -moz-background-size: cover; -o-background-size: cover; background-size: cover; } @media screen and (max-aspect-ratio: 10/16), (max-width: 800px) { .banner:before { background: url("banners/portrait.' + banner_extension + '") no-repeat center center; -webkit-background-size: cover; -moz-background-size: cover; -o-background-size: cover; background-size: cover; } } </style>');
			
			
			
			var banner_name;
			
			if ($(window).width() / $(window).height() < 10/16 || $(window).width() <= 800)
			{
				banner_name = "portrait." + banner_extension;
			}
			
			else
			{
				banner_name = "landscape." + banner_extension;
			}
			
			
			
			//Fade in once the banner has loaded.
			if (url_vars["link_animation"] == 1)
			{
				$("body").css("opacity", 1);
			}
			
			else
			{
				$("<img/>").attr("src", "banners/" + banner_name).on("load", function()
				{
					$(this).remove();
					$("body").animate({opacity: 1}, 300, "swing");
					
					//If the user just sits for three seconds after the banner has loaded, give them a hint in the form of a scroll button.
					if (scroll == 0)
					{
						setTimeout(add_scroll_button, 3000);
					}
				});
			}
		}
	}, 50);
	
	
	
	$(window).scroll(function()
	{
		scroll_update();
	});
	
	
	
	$(window).resize(function()
	{
		scroll_update();
	});
});



function scroll_update()
{
	scroll = $(window).scrollTop();
	
	if (scroll >= 0)
	{
		if (url_vars["banner_style"] != 1)
		{
			if (scroll <= window_height)
			{
				global_opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - scroll / window_height, 0) - .5 * Math.PI);
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
		}
		
		
		
		if (scroll <= window_height/3)
		{
			global_opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - 3 * scroll / window_height, 0) - .5 * Math.PI);
			
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
			if (url_vars["banner_style"] != 1)
			{
				$(".name-text").css("opacity", 0);
			}
			
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
		$("#banner-cover").before("<div style='height: 100vh; display: flex; align-items: center; justify-content: center' data-aos='fade-down'><img class='scroll-button' src='/graphics/general-icons/chevron-down.png' alt='Scroll down' onclick='scroll_down()'></img></div>");
		
		$("#banner-cover").remove();
	}
}



//Triggered by pressing the scroll button.
function scroll_down()
{
	$("html, body").animate({scrollTop: $("#content").offset().top}, 1200, "swing");
}