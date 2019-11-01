//Handles loading banners, displaying them, fading them out when the user scrolls, and everything to do with scroll buttons.



let scroll = 0;
let banner_done = false;
let scroll_button_done = false;

let banner_extension = "";
let banner_name = "";
let banner_path = "";

let scroll_button_exists = false;

let scroll_button_timeout = null;



//A list of every page that has a banner. ONLY to be used for preloading those banners. For everything else, use page_settings["banner_page"].
let banner_pages =
[
	"/home/home.html",
	
	"/bio/bio.html",
	
	"/blog/1/on-leaving-and-the-beginnings-of-things.html",
	"/blog/2/nach-heidelberg.html",
	"/blog/3/the-city-and-the-city.html",
	"/blog/4/a-taste-of-chaos.html",
	"/blog/5/halloween-in-january.html",
	"/blog/6/erinnerungen.html",
	"/blog/7/on-leaving-again-and-new-beginnings.html",
	
	"/writing/mist/mist.html",
	"/writing/desolation-point/desolation-point.html"
];

//Filled in with pages when banners are preloaded so the console isn't spammed and caches aren't needlessly checked.
let banner_pages_already_fetched = [];



window.addEventListener("scroll", function()
{
	scroll_update(0);
});



function load_banner()
{
	return new Promise(function(resolve, reject)
	{
		//Only do banner things if the banner things are in the standard places.
		if (!(banner_pages.includes(current_url)))
		{
			resolve();
		}
		
		
		
		else
		{
			//Set up the opacity cover.
			let color = 255;
			
			if (url_vars["theme"] == 1)
			{
				color = 24;
				
				if (url_vars["dark_theme_color"] == 1)
				{
					color = 0;
				}
			}
			
			
			
			//No, I don't understand why this has to be so complicated. Just setting the background color of opacity-cover doesn't work, and neither does using the normal temporary style. Who knows.
			try {document.querySelector("#opacity-cover-style").remove();}
			catch(ex) {}
			
			let element = add_style(`
				#opacity-cover
				{
					background-color: rgb(${color}, ${color}, ${color});
				}
			`, false);
			
			element.id = "opacity-cover-style";
			
			
			
			
			if (window_width / window_height < 1)
			{
				banner_name = "portrait." + banner_extension;
			}
			
			else
			{
				banner_name = "landscape." + banner_extension;
			}
			
				
			
			banner_path = "";
			
			if (current_url != "/home/home.html")
			{
				banner_path = parent_folder + "banners/";
			}
			
			else
			{
				let num_images = 20;
				let banner_index = Math.floor(Math.random() * num_images) + 1;
				banner_path = "/home/banners/" + banner_index + "/";
			}
			
			
			
			//Fetch the banner file. If that works, great! Set the background and fade in the page. If not, that means the html was cached but the banner was not (this is common on the homepage). In that case, we need to abort, so we remove the banner entirely.
			fetch(banner_path + banner_name)
			
			.then(function(response)
			{
				let img = new Image();
				
				img.onload = function()
				{
					scroll_button_timeout = setTimeout(add_scroll_button, 5000);
					
					resolve();
				};
				
				img.style.display = "hidden";
				img.style.opacity = 0;
				
				document.body.appendChild(img);
				
				setTimeout(function()
				{
					img.src = banner_path + banner_name;
				}, 20);
			})
			
			.catch(function(error)
			{
				document.querySelector("#banner").remove();
				document.querySelector("#opacity-cover").remove();
				document.querySelector("#banner-cover").remove();
				
				
				
				//Since all the elements have had their offsets changed dramatically, we need to update AOS.
				AOS.init({duration: 1200, once: false, offset: window_height / 4});
				
				//We resolve here because the page can still be loaded without the banner.
				resolve();
			});
		}
	});
}



function scroll_update(scroll_position_override)
{
	if (scroll_position_override == 0)
	{
		scroll = window.scrollY;
	}
	
	else
	{
		scroll = scroll_position_override;
		banner_done = false;
		scroll_button_done = false;
	}
	
	
	
	if (scroll >= 0)
	{
		if (url_vars["banner_style"] != 1)
		{
			if (scroll <= window_height)
			{
				let opacity = .5 - .5 * Math.sin(Math.PI * Math.max(1 - scroll / window_height, 0) - Math.PI / 2);
				
				try {document.querySelector("#opacity-cover").style.opacity = opacity;}
				catch(ex) {}
				
				if (opacity == 0)
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
				try {document.querySelector("#opacity-cover").style.opacity = 1;}
				catch(ex) {}
				
				banner_done = true;
			}
		}
		
		
		
		if (scroll <= window_height/3)
		{
			let opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - 3 * scroll / window_height, 0) - Math.PI / 2);
			
			if (scroll_button_exists)
			{
				document.querySelector("#scroll-button").style.opacity = opacity;
			}
			
			
			
			try
			{
				if (url_vars["banner_style"] != 1)
				{
					set_element_styles(".name-text", "opacity", opacity);
				}
			}
			
			catch(ex) {}
			
			
			
			if (opacity == 0)
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
		
		
		
		else if (scroll_button_timeout != null)
		{
			clearTimeout(scroll_button_timeout);
			scroll_button_timeout = null;
		}
		
		
		
		else if (scroll_button_done == false)
		{
			if (url_vars["banner_style"] != 1)
			{
				set_element_styles(".name-text", "opacity", 0);
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
			opacity = 0;
		}
	}
}



function add_scroll_button()
{
	let opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - 3 * scroll / window_height, 0) - Math.PI / 2);
	
	
	
	//Only add the scroll button if the user is still on the top of the page.
	if (scroll <= window_height / 3)
	{
		let chevron_name = "chevron-down";
		
		if (url_vars["contrast"] == 1)
		{
			chevron_name += "-dark";
		}
		
		
		
		//Gotta have a try block here in case the user loads a banner page then navigates to a non-banner page within 3 seconds.
		try
		{
			if (url_vars["content_animation"] == 1)
			{
				document.querySelector("#banner-cover").insertAdjacentHTML("beforebegin", `
					<div id="new-banner-cover">
						<input type="image" id="scroll-button" src="/graphics/general-icons/${chevron_name}.png" style="opacity: ${opacity}" alt="Scroll down" onclick="scroll_down()">
					</div>
				`);
			}
			
			else
			{
				document.querySelector("#banner-cover").insertAdjacentHTML("beforebegin", `
					<div id="new-banner-cover" data-aos="fade-down">
						<input type="image" id="scroll-button" src="/graphics/general-icons/${chevron_name}.png" style="opacity: ${opacity}" alt="Scroll down" onclick="scroll_down()">
					</div>
				`);
			}
			
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
	
	scroll_button_position = window.scrollY;
	scroll_button_time = 0;
	
	let refresh_id = setInterval(function()
	{
		scroll_step();
		
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