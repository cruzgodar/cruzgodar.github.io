!function()
{
	"use strict";
	
	
	
	let background_color = 255;
	let opacity = 0;
	
	let initial_window_height = Page.Layout.window_height;
	
	Page.Banner.done_loading = false;
	Page.Banner.ScrollButton.done_loading = false;
	let eclipse_done = false;
	
	
	
	setTimeout(adjust_for_settings, 500);
	
	
	
	//Make the eclipse image have a 1:1 aspect ratio.
	Page.element.querySelector("#eclipse").style.height = Page.element.querySelector("#eclipse").offsetWidth + "px";
	Page.element.querySelector("#eclipse img").style.height = Page.element.querySelector("#eclipse").offsetWidth + "px";
	
	Page.element.querySelector("#prologue-link").addEventListener("click", show_prereaders);
	
	window.addEventListener("resize", caligo_resize);
	Page.temporary_handlers["resize"].push(caligo_resize);
	
	window.addEventListener("scroll", caligo_scroll);
	Page.temporary_handlers["scroll"].push(caligo_scroll);
	
	setTimeout(caligo_resize, 500);
	setTimeout(caligo_resize, 1000);
	
	
	
	//We're coming back from another page, so let's not just snap the background color abruptly.
	if (scroll !== 0)
	{
		document.documentElement.classList.add("background-transition");
		
		caligo_scroll();
		
		setTimeout(() =>
		{
			document.documentElement.classList.remove("background-transition");
		}, Site.background_color_animation_time);
	}
	
	setTimeout(Page.Banner.ScrollButton.insert, 7000);
	
	
	
	
	function show_prereaders()
	{
		document.body.style.opacity = 0;
		
		setTimeout(() =>
		{
			let element = document.createElement("div");
			
			element.classList.add("caligo-black-background");
			
			element.addEventListener("touchstart", function(e)
			{
				e.preventDefault();
			});
			
			element.addEventListener("touchend", function(e)
			{
				e.preventDefault();
			});
			
			
			
			document.body.appendChild(element);
			
			
			
			element.appendChild(document.createElement("div"));
			
			
			
			document.documentElement.style.overflowY = "hidden";
			document.body.style.overflowY = "hidden";
			
			document.body.style.userSelect = "none";
			document.body.style.WebkitUserSelect = "none";
			
			
			
			window.scroll(0, Page.scroll + element.getBoundingClientRect().top + Page.Layout.window_height / 2 + 2);
			
			
			
			document.body.style.opacity = 1;
			
			
			
			setTimeout(() =>
			{
				element.firstChild.insertAdjacentHTML("afterend", `
					<div style="height: 70vh"></div>
					
					<div class="new-aos-section" data-aos="fade-up">
						<p class="synopsis-text" style="text-align: center; font-size: 125%; width: 90vw">Caligo is dedicated to its prereaders.</p>
					</div>
					
					<div style="height: 3vh"></div>
					
					<div data-aos="fade-up" data-aos-delay="100">
						<p class="synopsis-text" style="text-align: center; font-size: 125%; width: 90vw">Nick</p>
					</div>
					
					<div style="height: 1vh"></div>
					
					<div data-aos="fade-up" data-aos-delay="200">
						<p class="synopsis-text" style="text-align: center; font-size: 125%; width: 90vw">Joel</p>
					</div>
					
					<div style="height: 1vh"></div>
					
					<div data-aos="fade-up" data-aos-delay="300">
						<p class="synopsis-text" style="text-align: center; font-size: 125%; width: 90vw">Aly</p>
					</div>
					
					<div style="height: 1vh"></div>
					
					<div data-aos="fade-up" data-aos-delay="400">
						<p class="synopsis-text" style="text-align: center; font-size: 125%; width: 90vw">Renee</p>
					</div>
					
					<div style="height: 1vh"></div>
					
					<div data-aos="fade-up" data-aos-delay="500">
						<p class="synopsis-text" style="text-align: center; font-size: 125%; width: 90vw">Delilah</p>
					</div>
					
					<div style="height: 1vh"></div>
					
					<div data-aos="fade-up" data-aos-delay="600">
						<p class="synopsis-text" style="text-align: center; font-size: 125%; width: 90vw">and my Mom and Dad</p>
					</div>
				`);
				
				setTimeout(() =>
				{
					Page.Load.AOS.load();
					Page.Load.AOS.show_section(12);
					
					setTimeout(show_lyrics, 4000);
				}, 100);
			}, Site.opacity_animation_time * 2);
		}, Site.opacity_animation_time);
	}
	
	
	
	function show_lyrics()
	{
		document.body.style.opacity = 0;
		
		setTimeout(() =>
		{
			let element = document.createElement("div");
			
			element.classList.add("caligo-black-background");
			
			element.addEventListener("touchstart", (e) =>
			{
				e.preventDefault();
			});
			
			element.addEventListener("touchend", (e) =>
			{
				e.preventDefault();
			});
			
			
			
			document.body.appendChild(element);
			
			
			
			element.appendChild(document.createElement("div"));
			
			
			
			document.documentElement.style.overflowY = "hidden";
			document.body.style.overflowY = "hidden";
			
			document.body.style.userSelect = "none";
			document.body.style.WebkitUserSelect = "none";
			
			
			
			window.scroll(0, Page.scroll + element.getBoundingClientRect().top + Page.Layout.window_height / 2 + 2);
			
			
			
			document.body.style.opacity = 1;
			
			
			
			setTimeout(() =>
			{
				element.firstChild.insertAdjacentHTML("afterend", `
					<div style="height: 70vh"></div>
					
					<div class="new-aos-section" data-aos="fade-up">
						<p class="synopsis-text" style="text-align: center; font-size: 125%; width: 90vw"><em>And I walked up from the shoreline</em></p>
					</div>
					
					<div data-aos="fade-up" data-aos-delay="100">
						<p class="synopsis-text" style="text-align: center; font-size: 125%; width: 90vw"><em>To a city shining bright</em></p>
					</div>
					
					<div data-aos="fade-up" data-aos-delay="200">
						<p class="synopsis-text" style="text-align: center; font-size: 125%; width: 90vw"><em>And I walked the streets of that lovely place</em></p>
					</div>
					
					<div data-aos="fade-up" data-aos-delay="300">
						<p class="synopsis-text" style="text-align: center; font-size: 125%; width: 90vw"><em>&#x2019;Til the coming of the night</em></p>
					</div>
					
					<br>
					
					<div data-aos="fade-up" data-aos-delay="400">
						<p class="synopsis-text" style="text-align: center; font-size: 125%; width: 90vw">Blitzen Trapper, <em>Across the River</em></p>
					</div>
				`);
				
				setTimeout(() =>
				{
					Page.Load.AOS.load();
					Page.Load.AOS.show_section(13);
					
					setTimeout(() =>
					{
						document.body.style.opacity = 0;
						
						setTimeout(() =>
						{
							document.documentElement.style.overflowY = "visible";
							document.body.style.overflowY = "visible";
							
							document.body.style.userSelect = "auto";
							document.body.style.WebkitUserSelect = "auto";
							
							
							
							Page.Navigation.redirect("/writing/caligo/chapters/p.html");
						}, Site.background_color_animation_time * 2);
					}, 4000);
				}, 50);
			}, Site.opacity_animation_time * 2);
		}, Site.opacity_animation_time);
	}
	
	
	
	function caligo_scroll()
	{
		if (Page.scroll >= 0)
		{
			update_background();
			
			update_scroll_button();
			
			update_eclipse();
		}
	}
	
	
	
	function update_background()
	{
		Page.background_color_changed = true;
		
		if (Page.scroll === 0)
		{
			Page.background_color_changed = false;
		}
		
		
		
		else if (Page.scroll <= initial_window_height / 1.25)
		{
			background_color = .5 + .5 * Math.sin(Math.PI * Math.max(1 - 1.25 * Page.scroll / initial_window_height, 0) - .5 * Math.PI);
			
			if (Site.Settings.url_vars["theme"] === 1)
			{
				if (Site.Settings.url_vars["dark_theme_color"] === 1)
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
			
			
			document.documentElement.style.backgroundColor = `rgb(${background_color}, ${background_color}, ${background_color})`;
			
			Site.Settings.meta_theme_color_element.setAttribute("content", `rgb(${background_color}, ${background_color}, ${background_color})`);
			
			if (background_color === 0)
			{
				Page.Banner.done_loading = true;
			}
			
			else
			{
				Page.Banner.done_loading = false;
			}
		}
		
		else if (Page.Banner.done_loading === false)
		{
			document.documentElement.style.backgroundColor = "rgb(0, 0, 0)";
			Page.Banner.done_loading = true;
		}
	}
	
	
	
	function update_scroll_button()
	{
		if (Page.scroll <= initial_window_height / 3)
		{
			opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - 3 * Page.scroll / initial_window_height, 0) - .5 * Math.PI);
			
			try {Page.element.querySelector("#scroll-button").style.opacity = opacity;}
			catch(ex) {}
			
			if (opacity === 0)
			{
				try {Page.element.querySelector("#scroll-button").remove();}
				catch(ex) {}
				
				Page.Banner.ScrollButton.done_loading = true;
			}
			
			else
			{
				Page.Banner.ScrollButton.done_loading = false;
			}
		}
		
		else if (Page.Banner.ScrollButton.done_loading === false)
		{
			try {Page.element.querySelector("#scroll-button").remove();}
			catch(ex) {}
			
			Page.Banner.ScrollButton.done_loading = true;
		}
	}
	
	
	
	function update_eclipse()
	{
		if (Page.scroll >= 4/5 * initial_window_height && Page.scroll <= initial_window_height * 6/5)
		{
			opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - 3.5 * (Page.scroll - (4/5 * initial_window_height)) / initial_window_height, 0) - .5 * Math.PI);
			
			Page.element.querySelector("#eclipse").style.opacity = 1 - opacity;
			
			if (opacity === 1)
			{
				eclipse_done = true;
			}
			
			else
			{
				eclipse_done = false;
			}
		}
		
		else if (scroll >= 6/5 * initial_window_height && eclipse_done === false)
		{
			Page.element.querySelector("#eclipse").style.opacity = 1;
			
			eclipse_done = true;
		}
		
		else if (scroll <= 4/5 * initial_window_height && eclipse_done === false)
		{
			Page.element.querySelector("#eclipse").style.opacity = 0;
			
			eclipse_done = true;
		}
	}
	
	
	
	function caligo_resize()
	{
		Page.element.querySelector("#eclipse").style.height = Page.element.querySelector("#eclipse").offsetWidth + "px";
		Page.element.querySelector("#eclipse img").style.height = Page.element.querySelector("#eclipse").offsetWidth + "px";
		
		
		
		let max_width = 0;
		
		let elements = Page.element.querySelectorAll(".chapter-link a");
		
		for (let i = 0; i < elements.length; i++)
		{
			let width = elements[i].offsetWidth;
			
			if (width > max_width)
			{
				max_width = width;
			}
		}
		
		elements = Page.element.querySelectorAll(".chapter-link");
		
		for (let i = 0; i < elements.length; i++)
		{
			elements[i].style.width = max_width + "px";
		}
	}
	
	
	
	function adjust_for_settings()
	{
		//Meet the jankiest solution ever. Putting things in the style files puts them at the top of the head, so even though they have !important, they're before the settings style, which ALSO has to have !important. It's a garbage fire.
		Site.add_style(`
			#floating-footer-gradient
			{
				background: -moz-linear-gradient(top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%) !important;
				background: -webkit-linear-gradient(top, rgba(0,0,0,0) 0%,rgba(0,0,0,1) 100%) !important;
				background: linear-gradient(to bottom, rgba(0,0,0,0) 0%,rgba(0,0,0,1) 100%) !important;
			}
		`);
		
		
		
		if (Site.Settings.url_vars["contrast"] === 1)
		{
			Page.set_element_styles(".synopsis-text", "color", "rgb(192, 192, 192)");
			
			Page.set_element_styles(".body-text", "color", "rgb(192, 192, 192)");
			
			if (Site.Settings.url_vars["theme"] !== 1)
			{
				Page.set_element_styles(".hook-text", "color", "rgb(120, 120, 120)");
			}
			
			
			
			Page.element.querySelector("#email img").style.filter = "brightness(150%)";
			
			
			
			Page.set_element_styles(".stage-bubble", "border-color", "rgb(192, 192, 192)");
			
			Page.set_element_styles(".stage-bubble span", "background-color", "rgb(192, 192, 192)");
			
			
			
			Site.add_style(`
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
			Site.add_style(`
				.line-break
				{
					background: -moz-linear-gradient(left, rgb(0,0,0) 0%, rgb(92,92,92) 50%, rgb(0,0,0) 100%);
					background: -webkit-linear-gradient(left, rgb(0,0,0) 0%,rgb(92,92,92) 50%,rgb(0,0,0) 100%);
					background: linear-gradient(to right, rgb(0,0,0) 0%,rgb(92,92,92) 50%,rgb(0,0,0) 100%);
				}
			`);
			
			
			
			if (Site.Settings.url_vars["theme"] === 1)
			{
				Page.set_element_styles(".hook-text", "color", "rgb(120, 120, 120)");
			}
		}
	}
}()