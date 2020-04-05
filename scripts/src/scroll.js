"use strict";



//Handles the button that drops down from the top of the screen and lets the user scroll to the top of the page.



let scroll_up_button_visible = false;



function set_up_scroll_up_button()
{
	let scroll_up_button_location_element = document.createElement("div");
	scroll_up_button_location_element.id = "scroll-up-button-location";
	
	document.body.insertBefore(scroll_up_button_location_element, document.body.firstChild);
	
	
	
	fit_scroll_up_button_to_window_width();
	
	window.addEventListener("resize", fit_scroll_up_button_to_window_width);
	temporary_handlers["resize"].push(fit_scroll_up_button_to_window_width);
	
	
	

	init_scroll_up_button_listeners_touch();
	init_scroll_up_button_listeners_no_touch();
	
	//We need to do this manually since the button comes in after page load. We also have to assume it's there and take it away for the same reason.
	if (currently_touch_device)
	{
		try {document.querySelector("#scroll-up-button").classList.remove("enable-hover");}
		catch(ex) {}
	}
}



//Properly place the button -- when there is a scroll bar, it will be uncentered otherwise. Unfortunately, there is no way to solve this with CSS, as far as I'm aware.
function fit_scroll_up_button_to_window_width()
{
	try {document.querySelector("#scroll-up-button-container").style.width = document.documentElement.clientWidth + "px";}
	catch(ex) {}
}



function init_scroll_up_button_listeners_no_touch()
{
	scroll_up_button_visible = false;
	
	document.querySelector("#scroll-up-button-location").addEventListener("mouseenter", function()
	{
		if (scroll_up_button_visible === false && window.scrollY !== 0)
		{
			let chevron_name = "chevron-up";
			
			if (url_vars["contrast"] === 1)
			{
				chevron_name += "-dark";
			}
			
			
			
			document.querySelector("#scroll-up-button-location").insertAdjacentHTML("afterend", `
				<div id="scroll-up-button-container">
					<div class="center-content" data-aos="fade-in" data-aos-duration="600">
						<input type="image" id="scroll-up-button" src="/graphics/general-icons/${chevron_name}.png" class="enable-hover" onclick="smooth_scroll_to('body')"></input>
					</div>
				</div>
			`);
			
			scroll_up_button_visible = true;
			
			fit_scroll_up_button_to_window_width();
		}
		
		
		
		setTimeout(function()
		{
			document.querySelector("#scroll-up-button-container").addEventListener("mouseleave", function()
			{
				if (scroll_up_button_visible)
				{
					remove_scroll_up_button();
				}
			});
		}, 100);
	});
}



function init_scroll_up_button_listeners_touch()
{
	scroll_up_button_visible = false;
	
	
	
	document.documentElement.addEventListener("touchend", scroll_up_button_process_touchend, false);
	temporary_handlers["touchend"].push(scroll_up_button_process_touchend);
	
	document.documentElement.addEventListener("touchstart", scroll_up_button_process_touchstart, false);
	temporary_handlers["touchstart"].push(scroll_up_button_process_touchstart);
}



function scroll_up_button_process_touchend()
{
	let target = document.elementFromPoint(last_touch_x, last_touch_y);
	
	
	
	if (document.querySelector("#scroll-up-button-location") === target)
	{
		if (scroll_up_button_visible === false && window.scrollY !== 0)
		{
			let chevron_name = "chevron-up";
			
			if (url_vars["contrast"] === 1)
			{
				chevron_name += "-dark";
			}
			
			
			
			document.querySelector("#scroll-up-button-location").insertAdjacentHTML("afterend", `
				<div id="scroll-up-button-container">
					<div class="center-content" data-aos="fade-in" data-aos-duration="600">
						<input type="image" id="scroll-up-button" src="/graphics/general-icons/${chevron_name}.png" onclick="smooth_scroll_to('body')"></input>
					</div>
				</div>
			`)
			
			scroll_up_button_visible = true;
			
			fit_scroll_up_button_to_window_width();
		}
	}
}



function scroll_up_button_process_touchstart(event)
{
	if (scroll_up_button_visible)
	{
		if (!(document.querySelector("#scroll-up-button-container").contains(event.target)))
		{
			remove_scroll_up_button();
		}
	}
}



function remove_scroll_up_button()
{
	document.querySelector("#scroll-up-button-container").classList.add("animated-opacity");
	document.querySelector("#scroll-up-button-container").style.opacity = 0;
	
	setTimeout(function()
	{
		document.querySelector("#scroll-up-button-container").remove();
		
		scroll_up_button_visible = false;
	}, 300);
}



function smooth_scroll_to(target_selector)
{
	document.querySelector(target_selector).scrollIntoView({behavior: "smooth"});
	
	if (scroll_up_button_visible)
	{
		remove_scroll_up_button();
	}
}