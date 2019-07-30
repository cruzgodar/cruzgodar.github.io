let scroll = 0;
let banner_done = false;
let scroll_button_done = false;
let global_opacity = 0;

let banner_extension = "";

let scroll_button_exists = false;



window.addEventListener("scroll", scroll_update);
window.addEventListener("resize", scroll_update);



function load_banner()
{
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
		
			
		
		//Fetch the banner file. If that works, great! Set the background and fade in the page. If not, that means the html was cached but the banner was not (this is common on the homepage). In that case, we need to abort, so we remove the banner entirely.
		fetch(parent_folder + "banners/" + banner_name)
		
		.then(function(response)
		{
			add_style(`
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
			`, true);
			
			
			
			let img = new Image();
			
			img.onload = function()
			{
				document.documentElement.style.opacity = 1;
					
				
					
				//If the user just sits for three seconds after the banner has loaded, give them a hint in the form of a scroll button.
				if (scroll == 0)
				{
					setTimeout(add_scroll_button, 3000);
				}
			};
			
			img.src = parent_folder + "banners/" + banner_name;
		})
		
		.catch(function(error)
		{
			document.querySelector("#background-image").remove();
			document.querySelector("#banner-cover").remove();
			
			document.documentElement.style.opacity = 1;
			
			update_aos();
		});
	}
}



function scroll_update()
{
	scroll = window.pageYOffset;
	
	if (scroll >= 0)
	{
		if (url_vars["banner_style"] != 1)
		{
			if (scroll <= window_height)
			{
				global_opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - scroll / window_height, 0) - .5 * Math.PI);
				
				try {document.querySelector("#background-image").style.opacity = global_opacity;}
				catch(ex) {}
				
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
				//We need a try block here in case the user refreshes the page and it's way low down for some reason, even though scrollRestoration should be off.
				try {document.querySelector("#background-image").style.opacity = 0;}
				catch(ex) {}
				
				banner_done = true;
			}
		}
		
		
		
		if (scroll <= window_height/3)
		{
			global_opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - 3 * scroll / window_height, 0) - .5 * Math.PI);
			
			if (scroll_button_exists)
			{
				document.querySelector("#scroll-button").style.opacity = global_opacity;
			}
			
			if (global_opacity == 0)
			{
				if (scroll_button_exists)
				{
					document.querySelector("#scroll-button").remove();
					scroll_button_exists = false;
				}
				
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
				let elements = document.querySelectorAll(".name-text");
				
				for (let i = 0; i < elements.length; i++)
				{
					elements[i].style.opacity = 0;
				}
			}
			
			if (scroll_button_exists)
			{
				document.querySelector("#scroll-button").remove();
				scroll_button_exists = false;
			}
			
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
		
		//Gotta have a try block here in case the user loads a banner page then navigates to a non-banner page within 3 seconds.
		
		try
		{
			document.querySelector("#banner-cover").insertAdjacentHTML("beforebegin", `
				<div style="height: 100vh; display: flex; align-items: center; justify-content: center" data-aos="fade-down">
					<input type="image" id="scroll-button" src="/graphics/general-icons/${chevron_name}.png" alt="Scroll down" onclick="scroll_down()">
				</div>
			`);
			
			scroll_button_exists = true;
			
			document.querySelector("#banner-cover").remove();
		}
		
		catch(ex) {}
	}
}



let scroll_button_position = 0;
let scroll_button_time = 0;
let scroll_button_goal = 0;

//Triggered by pressing the scroll button.
function scroll_down()
{
	//This is relative to the top of the viewport, which is exactly what we want.
	scroll_button_goal = document.querySelector("#scroll-to").getBoundingClientRect().top;
	
	scroll_button_position = 0;
	scroll_button_time = 0;
	
	let refresh_id = setInterval(function()
	{
		scroll_step(window.scrollY, scroll_button_goal, 0);
		
		if (scroll_button_time >= 1000)
		{
			clearInterval(refresh_id);
		}
	}, 8);
}



function scroll_step()
{
	let step_distance = scroll_button_goal * .5 * (Math.sin((Math.PI * (scroll_button_time + 8) / 1000) - (Math.PI / 2)) - Math.sin((Math.PI * scroll_button_time / 1000) - (Math.PI / 2)));
	
	scroll_button_position += step_distance;
	scroll_button_time += 8;
	
	window.scrollTo(0, scroll_button_position);
}