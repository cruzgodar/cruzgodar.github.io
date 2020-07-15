!function()
{
	"use strict";
	
	
	
	let background_color = 255;
	let opacity = 0;
	
	let initial_window_height = window_height;
	
	banner_done = false;
	scroll_button_done = false;
	let eclipse_done = false;
	
	let stage_bubbles_done = false;
	let stage_bubbles_pos = Infinity;
	
	let blinking_bubble_interval = null;
	
	setTimeout(function()
	{
		stage_bubbles_pos = document.querySelector(".stage-bubbles").offsetTop;
	}, 1000);
	
	
	
	setTimeout(adjust_for_settings, 500);
	
	
	
	//Make the eclipse image have a 1:1 aspect ratio.
	document.querySelector("#eclipse").style.height = document.querySelector("#eclipse").offsetWidth + "px";
	document.querySelector("#eclipse img").style.height = document.querySelector("#eclipse").offsetWidth + "px";
	
	window.addEventListener("resize", caligo_resize);
	temporary_handlers["resize"].push(caligo_resize);
	
	window.addEventListener("scroll", caligo_scroll);
	temporary_handlers["scroll"].push(caligo_scroll);
	
	setTimeout(caligo_resize, 500);
	setTimeout(caligo_resize, 1000);
	
	
	
	//We're coming back from another page, so let's not just snap the background color abruptly.
	if (scroll !== 0)
	{
		document.documentElement.classList.add("background-transition");
		
		caligo_scroll();
		
		setTimeout(function()
		{
			document.documentElement.classList.remove("background-transition");
		}, 450);
	}
	
	else
	{
		setTimeout(add_scroll_button, 7000);
	}
	
	
	
	
	
	function caligo_scroll()
	{
		if (scroll >= 0)
		{
			update_background(scroll);
			
			update_scroll_button(scroll);
			
			update_eclipse(scroll);
			
			update_stage_bubbles(scroll);
		}
	}
	
	
	
	function update_background(scroll)
	{
		background_color_changed = true;
		
		if (scroll === 0)
		{
			background_color_changed = false;
		}
		
		
		
		else if (scroll <= initial_window_height / 1.25)
		{
			background_color = .5 + .5 * Math.sin(Math.PI * Math.max(1 - 1.25 * scroll / initial_window_height, 0) - .5 * Math.PI);
			
			if (url_vars["theme"] === 1)
			{
				if (url_vars["dark_theme_color"] === 1)
				{
					background_color = 0;
				}
				
				else
				{
					background_color *= 24;
				}
			}
				
			else
			{
				background_color *= 255;
			}
			
			
			document.documentElement.style.backgroundColor = "rgb(" + background_color + ", " + background_color + ", " + background_color + ")";
			
			if (background_color === 0)
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
			document.documentElement.style.backgroundColor = "rgb(0, 0, 0)";
			banner_done = true;
		}
	}
	
	
	
	function update_scroll_button(scroll)
	{
		if (scroll <= initial_window_height / 3)
		{
			opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - 3 * scroll / initial_window_height, 0) - .5 * Math.PI);
			
			try {document.querySelector("#scroll-button").style.opacity = opacity;}
			catch(ex) {}
			
			if (opacity === 0)
			{
				try {document.querySelector("#scroll-button").remove();}
				catch(ex) {}
				
				scroll_button_done = true;
			}
			
			else
			{
				scroll_button_done = false;
			}
		}
		
		else if (scroll_button_done === false)
		{
			try {document.querySelector("#scroll-button").remove();}
			catch(ex) {}
			
			scroll_button_done = true;
		}
	}
	
	
	
	function update_eclipse(scroll)
	{
		if (scroll >= 4/5 * initial_window_height && scroll <= initial_window_height * 6/5)
		{
			opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - 3.5 * (scroll - (4/5 * initial_window_height)) / initial_window_height, 0) - .5 * Math.PI);
			
			document.querySelector("#eclipse").style.opacity = 1 - opacity;
			
			if (opacity === 1)
			{
				eclipse_done = true;
			}
			
			else
			{
				eclipse_done = false;
			}
		}
		
		else if (scroll >= 6/5 * window_height && eclipse_done === false)
		{
			document.querySelector("#eclipse").style.opacity = 1;
			
			eclipse_done = true;
		}
		
		else if (scroll <= 4/5 * window_height && eclipse_done === false)
		{
			document.querySelector("#eclipse").style.opacity = 0;
			
			eclipse_done = true;
		}
	}
	
	
	
	function update_stage_bubbles(scroll)
	{
		let num_lit_bubbles = 5;
		let blinking_bubble = 5;
		
		if (scroll > stage_bubbles_pos - 3*window_height/4 && stage_bubbles_done === false)
		{
			stage_bubbles_done = true;
			let bubbles = document.querySelectorAll(".stage-bubble span");
			let subtexts = document.querySelectorAll(".stage-bubble-subtext");
			
			setTimeout(function()
			{
				for (let i = 0; i <= num_lit_bubbles; i++)
				{
					bubbles[i].style.width = "100%";
					bubbles[i].style.height = "100%";
					subtexts[i].style.marginTop = "1vh";
				}
			}, 1200);
			
			setTimeout(function()
			{
				blinking_bubble_interval = setInterval(function()
				{
					if (url_vars["contrast"] === 1)
					{
						bubbles[blinking_bubble].style.backgroundColor = "rgb(192, 192, 192)";
					}
					
					else
					{
						bubbles[blinking_bubble].style.backgroundColor = "rgb(152, 152, 152)";
					}
					
					setTimeout(function()
					{
						bubbles[blinking_bubble].style.backgroundColor = "rgb(0, 0, 0)";
					}, 1200);
				}, 2400);
			}, 600);
		}
		
		
		
		else if (scroll < stage_bubbles_pos - 3*window_height/4 && stage_bubbles_done)
		{
			stage_bubbles_done = false;
			clearInterval(blinking_bubble_interval);
			
			let bubbles = document.querySelectorAll(".stage-bubble span");
			let subtexts = document.querySelectorAll(".stage-bubble-subtext");
			
			for (let i = 0; i <= num_lit_bubbles; i++)
			{
				bubbles[i].style.width = 0;
				bubbles[i].style.height = 0;
				
				if (layout_string === "default")
				{
					subtexts[i].style.marginTop = "calc(5vw + 1vh)";
				}
				
				else if (layout_string === "compact")
				{
					subtexts[i].style.marginTop = "calc(10vw + 1vh)";
				}
				
				else
				{
					subtexts[i].style.marginTop = "calc(5vw + 1vh)";
				}
			}
		}
	}
	
	
	
	function caligo_resize()
	{
		document.querySelector("#eclipse").style.height = document.querySelector("#eclipse").offsetWidth + "px";
		document.querySelector("#eclipse img").style.height = document.querySelector("#eclipse").offsetWidth + "px";
		
		stage_bubbles_pos = document.querySelector(".stage-bubbles").offsetTop;
	}
	
	
	
	function adjust_for_settings()
	{
		//Meet the jankiest solution ever. Putting things in the style files puts them at the top of the head, so even though they have !important, they're before the settings style, which ALSO has to have !important. It's a garbage fire.
		add_style(`
			#floating-footer-gradient
			{
				background: -moz-linear-gradient(top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%) !important;
				background: -webkit-linear-gradient(top, rgba(0,0,0,0) 0%,rgba(0,0,0,1) 100%) !important;
				background: linear-gradient(to bottom, rgba(0,0,0,0) 0%,rgba(0,0,0,1) 100%) !important;
			}
		`);
		
		
		
		if (url_vars["contrast"] === 1)
		{
			set_element_styles(".synopsis-text", "color", "rgb(192, 192, 192)");
			
			set_element_styles(".body-text", "color", "rgb(192, 192, 192)");
			
			if (url_vars["theme"] !== 1)
			{
				set_element_styles(".hook-text", "color", "rgb(120, 120, 120)");
			}
			
			
			
			document.querySelector("#email img").style.filter = "brightness(150%)";
			
			
			
			set_element_styles(".stage-bubble", "border-color", "rgb(192, 192, 192)");
			
			set_element_styles(".stage-bubble span", "background-color", "rgb(192, 192, 192)");
			
			
			
			add_style(`
				.line-break
				{
					background: -moz-linear-gradient(left, rgb(0,0,0) 0%, rgb(140,140,140) 50%, rgb(0,0,0) 100%);
					background: -webkit-linear-gradient(left, rgb(0,0,0) 0%,rgb(140,140,140) 50%,rgb(0,0,0) 100%);
					background: linear-gradient(to right, rgb(0,0,0) 0%,rgb(140,140,140) 50%,rgb(0,0,0) 100%);
				}
			`);
		}
		
		else
		{
			add_style(`
				.line-break
				{
					background: -moz-linear-gradient(left, rgb(0,0,0) 0%, rgb(92,92,92) 50%, rgb(0,0,0) 100%);
					background: -webkit-linear-gradient(left, rgb(0,0,0) 0%,rgb(92,92,92) 50%,rgb(0,0,0) 100%);
					background: linear-gradient(to right, rgb(0,0,0) 0%,rgb(92,92,92) 50%,rgb(0,0,0) 100%);
				}
			`);
			
			
			
			if (url_vars["theme"] === 1)
			{
				set_element_styles(".hook-text", "color", "rgb(120, 120, 120)");
			}
		}
	}
}()