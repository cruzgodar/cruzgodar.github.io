"use strict";



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
	
	"/writing/mist/mist.html",
	"/writing/desolation-point/desolation-point.html"
];

//A list of every page that has multiple banners. Again, this is ONLY to be used for preloading those banners. For everything else, use page_settings["num_banners"].
let multibanner_pages =
{
	"/home/home.html":
	{
		"current_banner": Math.floor(Math.random() * 16),
		"num_banners": 16
	}
};

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
			if (window_width / window_height < 1)
			{
				banner_name = "portrait." + banner_extension;
			}
			
			else
			{
				banner_name = "landscape." + banner_extension;
			}
			
				
			
			banner_path = "";
			
			if (!(multibanner_pages.hasOwnProperty(current_url)))
			{
				banner_path = parent_folder + "banners/";
			}
			
			else
			{
				multibanner_pages[current_url]["current_banner"]++;
				
				if (multibanner_pages[current_url]["current_banner"] === multibanner_pages[current_url]["num_banners"] + 1)
				{
					multibanner_pages[current_url]["current_banner"] = 1;
				}
				
				banner_path = parent_folder + "banners/" + multibanner_pages[current_url]["current_banner"] + "/";
			}
			
			
			
			//Fetch the banner file. If that works, great! Set the background and fade in the page. If not, that means the html was cached but the banner was not (this is common on the homepage). In that case, we need to abort, so we remove the banner entirely.
			fetch(banner_path + banner_name)
			
			.then(function(response)
			{
				let img = new Image();
				
				img.onload = function()
				{
					scroll_button_timeout = setTimeout(add_scroll_button, 2500);
					
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
				document.querySelector("#banner-cover").remove();
				
				
				
				//Since all the elements have had their offsets changed dramatically, we need to update AOS.
				AOS.init({duration: 1200, once: false, offset: 100});
				
				//We resolve here because the page can still be loaded without the banner.
				resolve();
			});
		}
	});
}



function scroll_update(scroll_position_override)
{
	if (scroll_position_override === 0)
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
		if (url_vars["banner_style"] !== 1)
		{
			if (scroll <= window_height)
			{
				let opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - scroll / window_height, 0) - Math.PI / 2);
				
				try {document.querySelector("#banner").style.opacity = opacity;}
				catch(ex) {}
				
				if (opacity === 0)
				{
					banner_done = true;
				}
				
				else
				{
					banner_done = false;
				}
			}
			
			else if (banner_done === false)
			{
				//We need a try block here in case the user refreshes the page and it's way low down for some reason, even though scrollRestoration should be off.
				try {document.querySelector("#banner").style.opacity = 0;}
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
				if (url_vars["banner_style"] !== 1)
				{
					set_element_styles(".name-text", "opacity", opacity);
				}
			}
			
			catch(ex) {}
			
			
			
			if (opacity === 0)
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
		
		
		
		else if (scroll_button_timeout !== null)
		{
			clearTimeout(scroll_button_timeout);
			scroll_button_timeout = null;
		}
		
		
		
		else if (scroll_button_done === false)
		{
			if (url_vars["banner_style"] !== 1)
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
	}
}



function add_scroll_button()
{
	let opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - 3 * scroll / window_height, 0) - Math.PI / 2);
	
	
	
	//Only add the scroll button if the user is still on the top of the page.
	if (scroll <= window_height / 3)
	{
		let chevron_name = "chevron-down";
		
		if (url_vars["contrast"] === 1)
		{
			chevron_name += "-dark";
		}
		
		
		
		//Gotta have a try block here in case the user loads a banner page then navigates to a non-banner page within 3 seconds.
		try
		{
			document.querySelector("#banner-cover").insertAdjacentHTML("beforebegin", `
				<div id="new-banner-cover" data-aos="fade-down">
					<input type="image" id="scroll-button" src="/graphics/general-icons/${chevron_name}.png" style="opacity: ${opacity}" alt="Scroll down" onclick="smooth_scroll_to(document.querySelector('#scroll-to'))">
				</div>
			`);
			
			scroll_button_exists = true;
			
			setTimeout(function()
			{
				try {add_hover_event(document.querySelector("#scroll-button"));}
				catch(ex) {}
			}, 100);
			
			document.querySelector("#banner-cover").remove();
		}
		
		catch(ex) {}
	}
}



function smooth_scroll_to(target_element)
{
	target_element.scrollIntoView({behavior: "smooth"});
}