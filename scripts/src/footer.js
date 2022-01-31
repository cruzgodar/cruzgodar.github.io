/*
	
	Footer: methods for handling the footer at the bottom of the page.
		
		insert: creates the footer.
		
		Floating: methods for handling the floating footer.
			
			insert: creates the floating footer from the regular footer.
			
			fit_to_window_width: adjusts the width to fit the window.
			
			on_scroll: hides the footer when scrolling to the bottom of the page.
	
*/



"use strict";



Page.Footer =
{
	load: function()
	{
		let delay = Site.opacity_animation_time / 3;
		
		
		
		let url_vars_suffix = Page.Navigation.concat_url_vars();

		
		
		document.querySelector("#spawn-footer").insertAdjacentHTML("beforebegin", `
			<div style="position: relative">
				<div class="new-aos-section" data-aos="fade-in" data-aos-offset="0" style="position: absolute; bottom: 5px"></div>
			</div>
		`);
		
		
		
		if (!("footer_exclusion" in Page.settings && Page.settings["footer_exclusion"] !== ""))
		{
			document.querySelector("#spawn-footer").insertAdjacentHTML("afterend", `
				<nav class="footer-image-links footer-image-links-big"></nav>
			`);
		}
		
		else
		{
			document.querySelector("#spawn-footer").insertAdjacentHTML("afterend", `
				<nav class="footer-image-links"></nav>
			`);
		}
		
		
		
		if  (!("footer_exclusion" in Page.settings && Page.settings["footer_exclusion"] === "gallery"))
		{
			let element = document.createElement("div");
			
			document.querySelector(".footer-image-links").appendChild(element);
			
			element.outerHTML = `
				<div id="gallery-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0">
					<a class="focus-on-child" href="index.html?page=%2Fgallery%2Fgallery.html${url_vars_suffix}" tabindex="-1">
						<img onclick="Page.Navigation.redirect('/gallery/gallery.html')" src="/gallery/cover.${Page.Images.file_extension}" alt="Gallery" tabindex="2"></img>
					</a>
					
					<p class="footer-image-link-subtext">Gallery</p>
				</div>
			`;
			
			delay += Site.opacity_animation_time / 3;
		}
		
		
		
		if  (!("footer_exclusion" in Page.settings && Page.settings["footer_exclusion"] === "applets"))
		{
			let element = document.createElement("div");
			
			document.querySelector(".footer-image-links").appendChild(element);
			
			element.outerHTML = `
				<div id="applets-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0">
					<a class="focus-on-child" href="index.html?page=%2Fapplets%2Fapplets.html${url_vars_suffix}" tabindex="-1">
						<img onclick="Page.Navigation.redirect('/applets/applets.html')" src="/applets/cover.${Page.Images.file_extension}" alt="Applets" tabindex="2"></img>
					</a>
					
					<p class="footer-image-link-subtext">Applets</p>
				</div>
			`;
			
			delay += Site.opacity_animation_time / 3;
		}
				
				
		
		if (!("footer_exclusion" in Page.settings && Page.settings["footer_exclusion"] === "writing"))
		{
			let element = document.createElement("div");
			
			document.querySelector(".footer-image-links").appendChild(element);
			
			element.outerHTML = `
				<div id="writing-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0">
					<a href="/index.html?page=%2Fwriting%2Fwriting.html${url_vars_suffix}" tabindex="-1">
						<img onclick="Page.Navigation.redirect('/writing/writing.html')" src="/writing/cover.${Page.Images.file_extension}" alt="Writing" tabindex="2"></img>
					</a>
					
					<p class="footer-image-link-subtext">Writing</p>
				</div>
			`;
			
			delay += Site.opacity_animation_time / 3;
		}
		
		
		
		if  (!("footer_exclusion" in Page.settings && Page.settings["footer_exclusion"] === "teaching"))
		{
			let element = document.createElement("div");
			
			document.querySelector(".footer-image-links").appendChild(element);
			
			element.outerHTML = `
				<div id="teaching-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0">
					<a class="focus-on-child" href="/index.html?page=%2Fteaching%2Fteaching.html${url_vars_suffix}" tabindex="-1">
						<img onclick="Page.Navigation.redirect('/teaching/teaching.html')" src="/teaching/cover.${Page.Images.file_extension}" alt="Teaching" tabindex="2"></img>
					</a>
					
					<p class="footer-image-link-subtext">Teaching</p>
				</div>
			`;
			
			delay += Site.opacity_animation_time / 3;
		}
		
		
		
		if  (!("footer_exclusion" in Page.settings && Page.settings["footer_exclusion"] === "bio"))
		{
			let element = document.createElement("div");
			
			document.querySelector(".footer-image-links").appendChild(element);
			
			element.outerHTML = `
				<div id="bio-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0">
					<a class="focus-on-child" href="/index.html?page=%2Fbio%2Fbio.html${url_vars_suffix}" tabindex="-1">
						<img onclick="Page.Navigation.redirect('/bio/bio.html')" src="/bio/cover.${Page.Images.file_extension}" alt="Me" tabindex="2"></img>
					</a>
					
					<p class="footer-image-link-subtext">Me</p>
				</div>
			`;
			
			delay += Site.opacity_animation_time / 3;
		}
		
		
		
		//If the page isn't as tall as the screen (e.g. the 404 page), move the footer to the bottom of the page.
		if (document.body.clientHeight < Page.Layout.window_height)
		{
			document.querySelector("#spawn-footer").insertAdjacentHTML("beforebegin", `
				<div style="height: ${Page.Layout.window_height - document.body.clientHeight}px"></div>
			`);
		}
		
		
		
		setTimeout(() =>
		{
			let elements = document.querySelectorAll("#gallery-link, #applets-link, #writing-link, #teaching-link, #bio-link");
			
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].addEventListener("mouseenter", () =>
				{
					elements[i].lastElementChild.style.marginTop = "-32px";
					elements[i].lastElementChild.style.opacity = 1;
				});
				
				elements[i].addEventListener("mouseleave", () =>
				{
					elements[i].lastElementChild.style.marginTop = 0;
					elements[i].lastElementChild.style.opacity = 0;
				});
			}
		}, 10);
		
		
		
		this.Floating.load();
		
		
		
		//If we restored a scroll position that was supposed to be in the footer, we won't be able to properly restore that until now.
		if (Page.scroll > 0)
		{
			window.scrollTo(0, Page.scroll);
		}
	},
	
	
	
	Floating:
	{
		is_visible: false,
		
		last_scroll: -1,
		
		scroll_direction: 0,
		
		current_offset: -43.75,
		
		currently_animating: false,
		
		menu_is_open: false,
		
		image_links_is_open: false,
		
		settings_is_open: false,
		
		timeout_id_1: null,
		timeout_id_2: null,
		
		
		
		//Initializes the floating footer by copying specific parts of the normal footer.
		load: function()
		{
			let floating_footer_element = document.createElement("footer");
			floating_footer_element.id = "floating-footer";
			
			document.body.insertBefore(floating_footer_element, document.body.firstChild);
			
			
			
			let debug_html = "";
			
			if (DEBUG)
			{
				debug_html = `
					<div id="debug-button" class="footer-menu-button focus-on-child" tabindex="104">
						<input type="image" class="footer-button" src="/graphics/button-icons/bug.png" alt="Debug" onclick="Page.Navigation.redirect('/debug/debug.html')" tabindex="-1">
					</div>
				`;
			}
			
			
			
			floating_footer_element.innerHTML = `
				<div class="footer-buttons">
					<div id="show-footer-menu-button" class="footer-menu-button focus-on-child" tabindex="100">
						<input type="image" class="footer-button" src="/graphics/button-icons/chevron.png" alt="Options" onclick="Page.Footer.Floating.show_menu()" tabindex="-1">
					</div>
					
					
					
					${debug_html}
					
					<div id="about-button" class="footer-menu-button focus-on-child" tabindex="103">
						<input type="image" class="footer-button" src="/graphics/button-icons/question.png" alt="About" onclick="Page.Navigation.redirect('/about/about.html')" tabindex="-1">
					</div>
					
					<div id="sitemap-button" class="footer-menu-button focus-on-child" tabindex="102">
						<input type="image" class="footer-button" src="/graphics/button-icons/sitemap.png" alt="Options" onclick="Page.Footer.Floating.show_image_links()" tabindex="-1">
					</div>
					
					<div id="settings-button" class="footer-menu-button focus-on-child" tabindex="101">
						<input type="image" class="footer-button" src="/graphics/button-icons/gear.png" alt="Options" onclick="Page.Footer.Floating.show_settings()" tabindex="-1">
					</div>
					
					
					
					<div id="floating-footer-gallery-link" class="image-link footer-menu-image-link" style="width: 39px; position: absolute; left: -40px; bottom: 6.25px">
						<a href="/gallery/gallery.html" tabindex="-1">
							<img class="no-floating-footer" onclick="Page.Navigation.redirect('/gallery/gallery.html')" src="/gallery/cover.${Page.Images.file_extension}" alt="Gallery" tabindex="1"></img>
						</a>
					</div>
					
					<div id="floating-footer-applets-link" class="image-link footer-menu-image-link" style="width: 39px; position: absolute; left: -40px; bottom: 55.25px">
						<a href="/applets/applets.html" tabindex="-1">
							<img class="no-floating-footer" onclick="Page.Navigation.redirect('/applets/applets.html')" src="/applets/cover.${Page.Images.file_extension}" alt="Applets" tabindex="1"></img>
						</a>
					</div>
					
					<div id="floating-footer-writing-link" class="image-link footer-menu-image-link" style="width: 39px; position: absolute; left: -40px; bottom: 104.25px">
						<a href="/writing/writing.html" tabindex="-1">
							<img class="no-floating-footer" onclick="Page.Navigation.redirect('/writing/writing.html')" src="/writing/cover.${Page.Images.file_extension}" alt="Writing" tabindex="1"></img>
						</a>
					</div>
					
					<div id="floating-footer-teaching-link" class="image-link footer-menu-image-link" style="width: 39px; position: absolute; left: -40px; bottom: 153.25px">
						<a href="/teaching/teaching.html" tabindex="-1">
							<img class="no-floating-footer" onclick="Page.Navigation.redirect('/teaching/teaching.html')" src="/teaching/cover.${Page.Images.file_extension}" alt="Teaching" tabindex="1"></img>
						</a>
					</div>
					
					<div id="floating-footer-bio-link" class="image-link footer-menu-image-link" style="width: 39px; position: absolute; left: -40px; bottom: 202.25px">
						<a href="/bio/bio.html" tabindex="-1">
							<img class="no-floating-footer" onclick="Page.Navigation.redirect('/bio/bio.html')" src="/bio/cover.${Page.Images.file_extension}" alt="Me" tabindex="1"></img>
						</a>
					</div>
					
					
					
					<p id="settings-text" class="body-text" style="opacity: 0"></p>
					
					<div id="content-animation-button" class="footer-menu-button focus-on-child" tabindex="101">
						<input type="image" class="footer-button" src="/graphics/button-icons/pop.png" alt="Content animation" onclick="Site.Settings.toggle('content_animation')" tabindex="-1">
					</div>
					
					<div id="font-button" class="footer-menu-button focus-on-child" tabindex="101">
						<input type="image" class="footer-button" src="/graphics/button-icons/font.png" alt="Font" onclick="Site.Settings.toggle('font')" tabindex="-1">
					</div>
					
					<div id="text-size-button" class="footer-menu-button focus-on-child" tabindex="101">
						<input type="image" class="footer-button" src="/graphics/button-icons/text-size.png" alt="Text size" onclick="Site.Settings.toggle('text_size')" tabindex="-1">
					</div>
					
					<div id="contrast-button" class="footer-menu-button focus-on-child" tabindex="102">
						<input type="image" class="footer-button" src="/graphics/button-icons/contrast.png" alt="Contrast" onclick="Site.Settings.toggle('contrast')" tabindex="-1">
					</div>
					
					<div id="theme-button" class="footer-menu-button focus-on-child" tabindex="103">
						<input type="image" class="footer-button" src="/graphics/button-icons/moon.png" alt="About" onclick="Site.Settings.toggle('theme')" tabindex="-1">
					</div>
				</div>
			`;
			
			
			
			setTimeout(() =>
			{
				Page.Load.HoverEvents.add(document.querySelector("#floating-footer-gallery-link img"));
				Page.Load.HoverEvents.add(document.querySelector("#floating-footer-applets-link img"));
				Page.Load.HoverEvents.add(document.querySelector("#floating-footer-writing-link img"));
				Page.Load.HoverEvents.add(document.querySelector("#floating-footer-teaching-link img"));
				Page.Load.HoverEvents.add(document.querySelector("#floating-footer-bio-link img"));
			}, Site.opacity_animation_time / 6);
			
			
			
			this.last_scroll = window.scrollY;
			
			if (!Site.Interaction.currently_touch_device)
			{
				this.current_offset = 6.25;
				
				this.is_visible = true;
			}
			
			
			
			document.querySelector("#show-footer-menu-button").style.bottom = `${this.current_offset}px`;
			
			
			
			let bound_function = this.on_scroll.bind(this);
			
			window.addEventListener("scroll", bound_function);
			
			Page.temporary_handlers["scroll"].push(bound_function);
		},
		
		
		
		on_scroll: function()
		{
			if (!Site.Interaction.currently_touch_device || this.currently_animating || window.scrollY > document.body.scrollHeight - Page.Layout.window_height)
			{
				return;
			}
			
			
			
			
			if (this.last_scroll <= 0)
			{
				this.last_scroll = window.scrollY;
				
				return;
			}
			
			
			
			let new_scroll = window.scrollY;
			
			let scroll_delta = new_scroll - this.last_scroll;
			
			//Only restrict the speed if we're not near the bottom of the page, since there it's critical that we get the button all the way up.
			if (scroll_delta > 0 && window.scrollY > document.body.scrollHeight - Page.Layout.window_height - 150)
			{
				scroll_delta = -scroll_delta;
			}
			
			else
			{
				if (scroll_delta > 0)
				{
					scroll_delta = Math.max(2, Math.min(scroll_delta, 10))
				}
				
				else
				{
					scroll_delta = Math.max(-10, Math.min(scroll_delta, -2))
				}
			}
			
			//Interpolates from .15 at -43.75 to 1 at -18.75 to .15 at at 6.25.
			scroll_delta *= (Math.cos(2 * Math.PI * (this.current_offset + 43.75) / 50 + Math.PI) + 1.33) / 2.33;
			
			
			
			this.last_scroll = new_scroll;
			
			
			
			this.current_offset -= scroll_delta;
				
			if (this.current_offset < -43.75)
			{
				this.current_offset = -43.75;
				
				this.is_visible = false;
			}
			
			if (this.current_offset > 6.25)
			{
				this.current_offset = 6.25;
				
				this.is_visible = true;
			}
			
			
			
			document.querySelector("#show-footer-menu-button").style.bottom = `${this.current_offset}px`;
		},
		
		
		
		animate_in: function()
		{
			if (this.currently_animating)
			{
				return;
			}
			
			
			
			this.currently_animating = true;
			
			this.current_offset = 6.25;
			
			
			
			try
			{
				document.querySelector("#show-footer-menu-button").style.opacity = 0;
				
				document.querySelector("#show-footer-menu-button").style.transform = "scale(1.2)";
				
				document.querySelector("#show-footer-menu-button").style.bottom = "6.25px";
				
				
				
				setTimeout(() =>
				{
					document.querySelector("#show-footer-menu-button").style.transition = "opacity .6s ease-out, transform .6s ease-out";
					
					document.querySelector("#show-footer-menu-button").style.opacity = 1;
					
					document.querySelector("#show-footer-menu-button").style.transform = "scale(1)";
					
					this.is_visible = true;
					
					
					
					setTimeout(() =>
					{
						document.querySelector("#show-footer-menu-button").style.transition = "opacity .3s ease";
						
						this.current_offset = 6.25;
						
						this.last_scroll = -1;
						
						this.currently_animating = false;
					}, Site.opacity_animation_time * 2);
				}, 10);
			}
			
			catch(ex) {}
		},
		
		
		
		show_menu: function()
		{
			document.querySelector("#settings-button").style.left = "10px";
			
			document.querySelector("#show-footer-menu-button").style.opacity = 0;
			
			setTimeout(() =>
			{
				document.querySelector("#sitemap-button").style.left = "10px";
				
				setTimeout(() =>
				{
					document.querySelector("#about-button").style.left = "10px";
					
					
					if (DEBUG)
					{
						setTimeout(() =>
						{
							document.querySelector("#debug-button").style.left = "10px";
							
							this.menu_is_open = true;
						}, Site.opacity_animation_time / 6);
					}
					
					else
					{
						this.menu_is_open = true;
					}
				}, Site.opacity_animation_time / 6);
			}, Site.opacity_animation_time / 6);
			
			
			
			let bound_function = this.hide_menu.bind(this);
			
			document.documentElement.addEventListener("touchstart", bound_function);
			document.documentElement.addEventListener("touchmove", bound_function);
			document.documentElement.addEventListener("mousedown", bound_function);
			
			Page.temporary_handlers["touchstart"].push(bound_function);
			Page.temporary_handlers["touchmove"].push(bound_function);
			Page.temporary_handlers["mousedown"].push(bound_function);
		},
		
		
		
		hide_menu: function(e)
		{
			if (!this.menu_is_open)
			{
				return;
			}
			
			
			
			let x = 0;
			let y = 0;
			
			
			
			try
			{
				x = e.clientX;
				y = e.clientY;
			}
			
			catch(ex) {}
			
			
			
			try
			{
				x = e.touches[0].clientX;
				y = e.touches[0].clientY;
			}
			
			catch(ex) {}
			
			
			
			if (document.elementFromPoint(x, y).parentNode.classList.contains("footer-menu-button"))
			{
				return;
			}
			
			
			
			document.querySelector("#settings-button").style.left = "-40px";
			
			if (!this.image_links_is_open)
			{
				document.querySelector("#show-footer-menu-button").style.opacity = 1;
			}
			
			setTimeout(() =>
			{
				document.querySelector("#sitemap-button").style.left = "-40px";
				
				setTimeout(() =>
				{
					document.querySelector("#about-button").style.left = "-40px";
					
					
					if (DEBUG)
					{
						setTimeout(() =>
						{
							document.querySelector("#debug-button").style.left = "-40px";
							
							this.menu_is_open = false;
						}, Site.opacity_animation_time / 6);
					}
					
					else
					{
						this.menu_is_open = false;
					}
					
					setTimeout(() =>
					{
						//This is called when showing the image links, so we might need to reset the opacity.
						document.querySelector("#settings-button").style.opacity = 1;
						document.querySelector("#sitemap-button").style.opacity = 1;
						document.querySelector("#about-button").style.opacity = 1;
						
						if (DEBUG)
						{
							document.querySelector("#debug-button").style.opacity = 1;
						}
					}, Site.opacity_animation_time);
				}, Site.opacity_animation_time / 6);
			}, Site.opacity_animation_time / 6);
		},
		
		
		
		show_image_links: function()
		{
			document.querySelector("#floating-footer-gallery-link").style.left = "10px";
			
			document.querySelector("#settings-button").style.opacity = 0;
			
			setTimeout(() =>
			{
				document.querySelector("#floating-footer-applets-link").style.left = "10px";
				
				document.querySelector("#sitemap-button").style.opacity = 0;
				
				setTimeout(() =>
				{
					document.querySelector("#floating-footer-writing-link").style.left = "10px";
					
					document.querySelector("#about-button").style.opacity = 0;
					
					setTimeout(() =>
					{
						document.querySelector("#floating-footer-teaching-link").style.left = "10px";
						
						setTimeout(() =>
						{
							document.querySelector("#floating-footer-bio-link").style.left = "10px";
							
							this.image_links_is_open = true;
							
							setTimeout(() =>
							{
								this.hide_menu();
							}, Site.opacity_animation_time);
						}, Site.opacity_animation_time / 6);
					}, Site.opacity_animation_time / 6);
				}, Site.opacity_animation_time / 6);
			}, Site.opacity_animation_time / 6);
			
			
			
			let bound_function = this.hide_image_links.bind(this);
			
			document.documentElement.addEventListener("touchstart", bound_function);
			document.documentElement.addEventListener("touchmove", bound_function);
			document.documentElement.addEventListener("mousedown", bound_function);
			
			Page.temporary_handlers["touchstart"].push(bound_function);
			Page.temporary_handlers["touchmove"].push(bound_function);
			Page.temporary_handlers["mousedown"].push(bound_function);
		},
		
		
		
		hide_image_links: function(e)
		{
			if (!this.image_links_is_open)
			{
				return;
			}
			
			
			
			let x = 0;
			let y = 0;
			
			
			
			try
			{
				x = e.clientX;
				y = e.clientY;
			}
			
			catch(ex) {}
			
			
			
			try
			{
				x = e.touches[0].clientX;
				y = e.touches[0].clientY;
			}
			
			catch(ex) {}
			
			
			
			if (document.elementFromPoint(x, y).parentNode.parentNode.classList.contains("footer-menu-image-link"))
			{
				return;
			}
			
			
			
			document.querySelector("#floating-footer-gallery-link").style.left = "-40px";
			
			setTimeout(() =>
			{
				document.querySelector("#floating-footer-applets-link").style.left = "-40px";
				
				//This one looks better with a slight delay.
				document.querySelector("#show-footer-menu-button").style.opacity = 1;
				
				setTimeout(() =>
				{
					document.querySelector("#floating-footer-writing-link").style.left = "-40px";
					
					setTimeout(() =>
					{
						document.querySelector("#floating-footer-teaching-link").style.left = "-40px";
						
						setTimeout(() =>
						{
							document.querySelector("#floating-footer-bio-link").style.left = "-40px";
							
							this.image_links_is_open = false;
						}, Site.opacity_animation_time / 6);
					}, Site.opacity_animation_time / 6);
				}, Site.opacity_animation_time / 6);
			}, Site.opacity_animation_time / 6);
		},
		
		
		
		show_settings: function()
		{
			document.querySelector("#theme-button").style.left = "10px";
			
			document.querySelector("#settings-button").style.opacity = 0;
			
			setTimeout(() =>
			{
				document.querySelector("#contrast-button").style.left = "10px";
			
				document.querySelector("#sitemap-button").style.opacity = 0;
				
				setTimeout(() =>
				{
					document.querySelector("#text-size-button").style.left = "10px";
				
					document.querySelector("#about-button").style.opacity = 0;
					
					setTimeout(() =>
					{
						document.querySelector("#font-button").style.left = "10px";
						
						setTimeout(() =>
						{
							document.querySelector("#content-animation-button").style.left = "10px";
							
							this.settings_is_open = true;
							
							setTimeout(() =>
							{
								this.hide_menu();
							}, Site.opacity_animation_time);
						}, Site.opacity_animation_time / 6);
					}, Site.opacity_animation_time / 6);
				}, Site.opacity_animation_time / 6);
			}, Site.opacity_animation_time / 6);
			
			
			
			let bound_function = this.hide_settings.bind(this);
			
			document.documentElement.addEventListener("touchstart", bound_function);
			document.documentElement.addEventListener("touchmove", bound_function);
			document.documentElement.addEventListener("mousedown", bound_function);
			
			Page.temporary_handlers["touchstart"].push(bound_function);
			Page.temporary_handlers["touchmove"].push(bound_function);
			Page.temporary_handlers["mousedown"].push(bound_function);
		},
		
		
		
		hide_settings: function(e)
		{
			if (!this.settings_is_open)
			{
				return;
			}
			
			
			
			let x = 0;
			let y = 0;
			
			
			
			try
			{
				x = e.clientX;
				y = e.clientY;
			}
			
			catch(ex) {}
			
			
			
			try
			{
				x = e.touches[0].clientX;
				y = e.touches[0].clientY;
			}
			
			catch(ex) {}
			
			
			
			if (document.elementFromPoint(x, y).parentNode.classList.contains("footer-menu-button"))
			{
				return;
			}
			
			
			
			document.querySelector("#theme-button").style.left = "-40px";
			
			document.querySelector("#show-footer-menu-button").style.opacity = 1;
			
			setTimeout(() =>
			{
				document.querySelector("#contrast-button").style.left = "-40px";
				
				setTimeout(() =>
				{
					document.querySelector("#text-size-button").style.left = "-40px";
					
					setTimeout(() =>
					{
						document.querySelector("#font-button").style.left = "-40px";
						
						setTimeout(() =>
						{
							document.querySelector("#content-animation-button").style.left = "-40px";
							
							this.settings_is_open = false;
						}, Site.opacity_animation_time / 6);
					}, Site.opacity_animation_time / 6);
				}, Site.opacity_animation_time / 6);
			}, Site.opacity_animation_time / 6);
		},
		
		
		
		show_settings_text: function(text)
		{
			Page.set_element_styles(".settings-text-container", "opacity", "0");
			Page.set_element_styles(".settings-text-container", "transform", "scale(.9)");
			
			
			
			let element = document.createElement("div");
			
			element.classList.add("settings-text-container");
			
			document.body.appendChild(element);
			
			
			
			let element_2 = document.createElement("p");
			
			element_2.classList.add("settings-text");
			
			element_2.classList.add("body-text");
			
			element_2.textContent = text;
			
			element.appendChild(element_2);
			
			
			
			setTimeout(() =>
			{
				element.style.opacity = 1;
				
				element.style.transform = "scale(1.0)";
				
				setTimeout(() =>
				{
					element.style.opacity = 0;
					
					element.style.transform = "scale(.9)";
					
					setTimeout(() =>
					{
						element.remove();
					}, Site.opacity_animation_time * 2);
				}, Site.opacity_animation_time * 8);
			}, 10);
		}
	}
};