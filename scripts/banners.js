let scroll = 0;
let banner_done = false;
let scroll_button_done = false;
let global_opacity = 0;

let banner_extension = "";



$(function()
{
	$(window).on("scroll", function()
	{
		scroll_update();
	});
	
	$(window).on("resize", function()
	{
		scroll_update();
	});
});



function load_banner()
{
	if (supports_webp)
	{
		banner_extension = "webp";
	}
	
	else
	{
		banner_extension = "jpg";
	}
	
	
	
	//Only do banner things if the banner things are in the standard places.
	if (page_settings["manual_banner"] != true)
	{
		let banner_name = "";
		
		if (window_width / window_height < 10/16 || window_width <= 800)
		{
			banner_name = "portrait." + banner_extension;
		}
		
		else
		{
			banner_name = "landscape." + banner_extension;
		}
		
			
		
		//Fetch the banner file. If that works, great! Set the background and fade in the page. If not, that means the html was cached but the banner was not (this is common on the homepage). In that case, we need to abort, so we go back to the safety of the previous page.
		$.get(parent_folder + "banners/" + banner_name)
		
		.done(function()
		{
			$("head").append(`
				<style class="temporary-style">
					.banner:before
					{
						background: url("${parent_folder}banners/landscape.${banner_extension}") no-repeat center center;
						-webkit-background-size: cover;
						background-size: cover;
					}
					
					@media screen and (max-aspect-ratio: 10/16), (max-width: 800px)
					{
						.banner:before
						{
							background: url("${parent_folder}banners/portrait.${banner_extension}") no-repeat center center;
							-webkit-background-size: cover;
							background-size: cover;
						}
					}
				</style>
			`);
			
			
			
			if (url_vars["content_animation"] != 1)
			{
				$("html").animate({opacity: 1}, 300, "swing");
			}
			
			else
			{
				$("html").css("opacity", 1);
			}
				
			
				
			//If the user just sits for three seconds after the banner has loaded, give them a hint in the form of a scroll button.
			if (scroll == 0)
			{
				setTimeout(add_scroll_button, 3000);
			}
		})
		
		.fail(function()
		{
			$("#background-image, #banner-cover").remove();
			
			if (url_vars["content_animation"] != 1)
			{
				$("html").animate({opacity: 1}, 300, "swing");
			}
			
			else
			{
				$("html").css("opacity", 1);
			}
			
			update_aos();
		});
	}
}



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
					banner_done = true;
				}
				
				else
				{
					banner_done = false;
				}
			}
			
			else if (banner_done == false)
			{
				$("#background-image").css("opacity", 0);
				banner_done = true;
			}
		}
		
		
		
		if (scroll <= window_height/3)
		{
			global_opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - 3 * scroll / window_height, 0) - .5 * Math.PI);
			
			$(".scroll-button").css("opacity", global_opacity);
			
			if (global_opacity == 0)
			{
				$(".scroll-button").remove();
				scroll_button_done = true;
			}
			
			else
			{
				scroll_button_done = false;
			}
		}
		
		else if (scroll_button_done == false)
		{
			if (url_vars["banner_style"] != 1)
			{
				$(".name-text").css("opacity", 0);
			}
			
			$(".scroll-button").remove();
			
			scroll_button_done = true;
		}
		
		//This shouldn't be required, but it fixes a weird flickering glitch with the name text.
		else
		{
			global_opacity = 0;
		}
	}
}



function add_scroll_button()
{
	//Only add the scroll button if the user is still on the top of the page.
	if (scroll == 0)
	{
		let chevron_name = "chevron-down";
		
		if (url_vars["contrast"] == 1)
		{
			chevron_name += "-dark";
		}
		
		$("#banner-cover").before(`
			<div style="height: 100vh; display: flex; align-items: center; justify-content: center" data-aos="fade-down">
				<input type="image" class="scroll-button" src="/graphics/general-icons/${chevron_name}.png" alt="Scroll down" onclick="scroll_down()">
			</div>
		`);
		
		$("#banner-cover").remove();
	}
}



//Triggered by pressing the scroll button.
function scroll_down()
{
	$("html, body").animate({scrollTop: $("#scroll-to").offset().top}, 1200, "swing");
}



function scroll_step(progress, goal)
{
	$("html, body").scrollTop()
}