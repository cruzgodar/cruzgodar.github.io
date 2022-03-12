"use strict";



Page.Footer =
{
	load: function()
	{
		let delay = Site.aos_separation_time;
		
		
		
		let url_vars_suffix = Page.Navigation.concat_url_vars();

		let first_link_string = " new-aos-section";
		
		
		
		if (!("footer_exclusion" in Page.settings && Page.settings["footer_exclusion"] !== ""))
		{
			Page.element.querySelector("#spawn-footer").insertAdjacentHTML("afterend", `
				<nav class="footer-image-links footer-image-links-big"></nav>
			`);
		}
		
		else
		{
			Page.element.querySelector("#spawn-footer").insertAdjacentHTML("afterend", `
				<nav class="footer-image-links"></nav>
			`);
		}
		
		
		
		if (!("footer_exclusion" in Page.settings && Page.settings["footer_exclusion"] === "gallery"))
		{
			let element = document.createElement("div");
			
			Page.element.querySelector(".footer-image-links").appendChild(element);
			
			element.outerHTML = `
				<div id="gallery-link" class="footer-image-link${first_link_string}" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0">
					<a class="focus-on-child" href="index.html?page=%2Fgallery%2Fgallery.html${url_vars_suffix}" tabindex="-1">
						<img onclick="Page.Navigation.redirect('/gallery/gallery.html')" src="/gallery/cover.${Page.Images.file_extension}" alt="Gallery" tabindex="2"></img>
					</a>
					
					<p class="footer-image-link-subtext">Gallery</p>
				</div>
			`;
			
			first_link_string = "";
			
			delay += Site.aos_separation_time;
		}
		
		
		
		if  (!("footer_exclusion" in Page.settings && Page.settings["footer_exclusion"] === "applets"))
		{
			let element = document.createElement("div");
			
			Page.element.querySelector(".footer-image-links").appendChild(element);
			
			element.outerHTML = `
				<div id="applets-link" class="footer-image-link${first_link_string}" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0">
					<a class="focus-on-child" href="index.html?page=%2Fapplets%2Fapplets.html${url_vars_suffix}" tabindex="-1">
						<img onclick="Page.Navigation.redirect('/applets/applets.html')" src="/applets/cover.${Page.Images.file_extension}" alt="Applets" tabindex="2"></img>
					</a>
					
					<p class="footer-image-link-subtext">Applets</p>
				</div>
			`;
			
			first_link_string = "";
			
			delay += Site.aos_separation_time;
		}
				
				
		
		if (!("footer_exclusion" in Page.settings && Page.settings["footer_exclusion"] === "writing"))
		{
			let element = document.createElement("div");
			
			Page.element.querySelector(".footer-image-links").appendChild(element);
			
			element.outerHTML = `
				<div id="writing-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0">
					<a href="/index.html?page=%2Fwriting%2Fwriting.html${url_vars_suffix}" tabindex="-1">
						<img onclick="Page.Navigation.redirect('/writing/writing.html')" src="/writing/cover.${Page.Images.file_extension}" alt="Writing" tabindex="2"></img>
					</a>
					
					<p class="footer-image-link-subtext">Writing</p>
				</div>
			`;
			
			delay += Site.aos_separation_time;
		}
		
		
		
		if  (!("footer_exclusion" in Page.settings && Page.settings["footer_exclusion"] === "teaching"))
		{
			let element = document.createElement("div");
			
			Page.element.querySelector(".footer-image-links").appendChild(element);
			
			element.outerHTML = `
				<div id="teaching-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0">
					<a class="focus-on-child" href="/index.html?page=%2Fteaching%2Fteaching.html${url_vars_suffix}" tabindex="-1">
						<img onclick="Page.Navigation.redirect('/teaching/teaching.html')" src="/teaching/cover.${Page.Images.file_extension}" alt="Teaching" tabindex="2"></img>
					</a>
					
					<p class="footer-image-link-subtext">Teaching</p>
				</div>
			`;
			
			delay += Site.aos_separation_time;
		}
		
		
		
		if  (!("footer_exclusion" in Page.settings && Page.settings["footer_exclusion"] === "bio"))
		{
			let element = document.createElement("div");
			
			Page.element.querySelector(".footer-image-links").appendChild(element);
			
			element.outerHTML = `
				<div id="bio-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0">
					<a class="focus-on-child" href="/index.html?page=%2Fbio%2Fbio.html${url_vars_suffix}" tabindex="-1">
						<img onclick="Page.Navigation.redirect('/bio/bio.html')" src="/bio/cover.${Page.Images.file_extension}" alt="Me" tabindex="2"></img>
					</a>
					
					<p class="footer-image-link-subtext">Me</p>
				</div>
			`;
			
			delay += Site.aos_separation_time;
		}
		
		
		
		//If the page isn't as tall as the screen (e.g. the 404 page), move the footer to the bottom of the page.
		if (Page.element.clientHeight < Page.Layout.window_height)
		{
			Page.element.querySelector("#spawn-footer").insertAdjacentHTML("beforebegin", `
				<div style="height: ${Page.Layout.window_height - document.body.clientHeight}px"></div>
			`);
		}
		
		
		
		setTimeout(() =>
		{
			let elements = Page.element.querySelectorAll("#gallery-link img, #applets-link img, #writing-link img, #teaching-link img, #bio-link img");
			
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].addEventListener("mouseenter", () =>
				{
					if (!(Site.Interaction.currently_touch_device))
					{
						elements[i].parentNode.parentNode.lastElementChild.style.marginTop = "-32px";
						elements[i].parentNode.parentNode.lastElementChild.style.opacity = 1;
					}
				});
				
				elements[i].addEventListener("mouseleave", () =>
				{
					if (!(Site.Interaction.currently_touch_device))
					{
						elements[i].parentNode.parentNode.lastElementChild.style.marginTop = 0;
						elements[i].parentNode.parentNode.lastElementChild.style.opacity = 0;
					}
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
			
			Page.element.insertBefore(floating_footer_element, Page.element.firstChild);
			
			
			
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
							<img onclick="Page.Navigation.redirect('/gallery/gallery.html')" src="/gallery/cover.${Page.Images.file_extension}" alt="Gallery" tabindex="1"></img>
						</a>
					</div>
					
					<div id="floating-footer-applets-link" class="image-link footer-menu-image-link" style="width: 39px; position: absolute; left: -40px; bottom: 55.25px">
						<a href="/applets/applets.html" tabindex="-1">
							<img onclick="Page.Navigation.redirect('/applets/applets.html')" src="/applets/cover.${Page.Images.file_extension}" alt="Applets" tabindex="1"></img>
						</a>
					</div>
					
					<div id="floating-footer-writing-link" class="image-link footer-menu-image-link" style="width: 39px; position: absolute; left: -40px; bottom: 104.25px">
						<a href="/writing/writing.html" tabindex="-1">
							<img onclick="Page.Navigation.redirect('/writing/writing.html')" src="/writing/cover.${Page.Images.file_extension}" alt="Writing" tabindex="1"></img>
						</a>
					</div>
					
					<div id="floating-footer-teaching-link" class="image-link footer-menu-image-link" style="width: 39px; position: absolute; left: -40px; bottom: 153.25px">
						<a href="/teaching/teaching.html" tabindex="-1">
							<img onclick="Page.Navigation.redirect('/teaching/teaching.html')" src="/teaching/cover.${Page.Images.file_extension}" alt="Teaching" tabindex="1"></img>
						</a>
					</div>
					
					<div id="floating-footer-bio-link" class="image-link footer-menu-image-link" style="width: 39px; position: absolute; left: -40px; bottom: 202.25px">
						<a href="/bio/bio.html" tabindex="-1">
							<img onclick="Page.Navigation.redirect('/bio/bio.html')" src="/bio/cover.${Page.Images.file_extension}" alt="Me" tabindex="1"></img>
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
				let elements = Page.element.querySelectorAll(".footer-menu-button, .footer-menu-image-link");
				
				for (let i = 0; i < elements.length; i++)
				{
					Page.Load.HoverEvents.add_with_scale(elements[i], 1.1);
				}
			}, Site.opacity_animation_time / 6);
			
			
			
			this.last_scroll = window.scrollY;
			
			if (!Site.Interaction.currently_touch_device)
			{
				this.current_offset = 6.25;
				
				this.is_visible = true;
			}
			
			
			
			Page.element.querySelector("#show-footer-menu-button").style.bottom = `${this.current_offset}px`;
			
			
			
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
			
			
			
			Page.element.querySelector("#show-footer-menu-button").style.bottom = `${this.current_offset}px`;
		},
		
		
		
		animate_in: function()
		{
			if (this.currently_animating)
			{
				return;
			}
			
			
			
			try
			{
				Page.element.querySelector("#show-footer-menu-button").style.opacity = 1;
				
				Page.element.querySelector("#show-footer-menu-button").style.transform = "scale(1)";
				
				Page.element.querySelector("#show-footer-menu-button").style.bottom = "6.25px";
				
				this.current_offset = 6.25;
						
				this.last_scroll = -1;
				
				this.currently_animating = false;
			}
			
			catch(ex) {}
		},
		
		
		
		show_menu: function()
		{
			Page.element.querySelector("#settings-button").style.left = "10px";
			
			Page.element.querySelector("#show-footer-menu-button").style.opacity = 0;
			
			setTimeout(() =>
			{
				Page.element.querySelector("#sitemap-button").style.left = "10px";
				
				setTimeout(() =>
				{
					Page.element.querySelector("#about-button").style.left = "10px";
					
					
					if (DEBUG)
					{
						setTimeout(() =>
						{
							Page.element.querySelector("#debug-button").style.left = "10px";
							
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
			
			
			
			Page.element.querySelector("#settings-button").style.left = "-40px";
			
			if (!this.image_links_is_open)
			{
				Page.element.querySelector("#show-footer-menu-button").style.opacity = 1;
			}
			
			setTimeout(() =>
			{
				Page.element.querySelector("#sitemap-button").style.left = "-40px";
				
				setTimeout(() =>
				{
					Page.element.querySelector("#about-button").style.left = "-40px";
					
					
					if (DEBUG)
					{
						setTimeout(() =>
						{
							Page.element.querySelector("#debug-button").style.left = "-40px";
							
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
						Page.element.querySelector("#settings-button").style.opacity = 1;
						Page.element.querySelector("#sitemap-button").style.opacity = 1;
						Page.element.querySelector("#about-button").style.opacity = 1;
						
						if (DEBUG)
						{
							Page.element.querySelector("#debug-button").style.opacity = 1;
						}
					}, Site.opacity_animation_time);
				}, Site.opacity_animation_time / 6);
			}, Site.opacity_animation_time / 6);
		},
		
		
		
		show_image_links: function()
		{
			Page.element.querySelector("#floating-footer-gallery-link").style.left = "10px";
			
			Page.element.querySelector("#settings-button").style.opacity = 0;
			
			setTimeout(() =>
			{
				Page.element.querySelector("#floating-footer-applets-link").style.left = "10px";
				
				Page.element.querySelector("#sitemap-button").style.opacity = 0;
				
				setTimeout(() =>
				{
					Page.element.querySelector("#floating-footer-writing-link").style.left = "10px";
					
					Page.element.querySelector("#about-button").style.opacity = 0;
					
					setTimeout(() =>
					{
						Page.element.querySelector("#floating-footer-teaching-link").style.left = "10px";
						
						setTimeout(() =>
						{
							Page.element.querySelector("#floating-footer-bio-link").style.left = "10px";
							
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
			
			
			
			Page.element.querySelector("#floating-footer-gallery-link").style.left = "-40px";
			
			setTimeout(() =>
			{
				Page.element.querySelector("#floating-footer-applets-link").style.left = "-40px";
				
				//This one looks better with a slight delay.
				Page.element.querySelector("#show-footer-menu-button").style.opacity = 1;
				
				setTimeout(() =>
				{
					Page.element.querySelector("#floating-footer-writing-link").style.left = "-40px";
					
					setTimeout(() =>
					{
						Page.element.querySelector("#floating-footer-teaching-link").style.left = "-40px";
						
						setTimeout(() =>
						{
							Page.element.querySelector("#floating-footer-bio-link").style.left = "-40px";
							
							this.image_links_is_open = false;
						}, Site.opacity_animation_time / 6);
					}, Site.opacity_animation_time / 6);
				}, Site.opacity_animation_time / 6);
			}, Site.opacity_animation_time / 6);
		},
		
		
		
		show_settings: function()
		{
			Page.element.querySelector("#theme-button").style.left = "10px";
			
			Page.element.querySelector("#settings-button").style.opacity = 0;
			
			setTimeout(() =>
			{
				Page.element.querySelector("#contrast-button").style.left = "10px";
			
				Page.element.querySelector("#sitemap-button").style.opacity = 0;
				
				setTimeout(() =>
				{
					Page.element.querySelector("#text-size-button").style.left = "10px";
				
					Page.element.querySelector("#about-button").style.opacity = 0;
					
					setTimeout(() =>
					{
						Page.element.querySelector("#font-button").style.left = "10px";
						
						setTimeout(() =>
						{
							Page.element.querySelector("#content-animation-button").style.left = "10px";
							
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
			
			
			
			Page.element.querySelector("#theme-button").style.left = "-40px";
			
			Page.element.querySelector("#show-footer-menu-button").style.opacity = 1;
			
			setTimeout(() =>
			{
				Page.element.querySelector("#contrast-button").style.left = "-40px";
				
				setTimeout(() =>
				{
					Page.element.querySelector("#text-size-button").style.left = "-40px";
					
					setTimeout(() =>
					{
						Page.element.querySelector("#font-button").style.left = "-40px";
						
						setTimeout(() =>
						{
							Page.element.querySelector("#content-animation-button").style.left = "-40px";
							
							this.settings_is_open = false;
						}, Site.opacity_animation_time / 6);
					}, Site.opacity_animation_time / 6);
				}, Site.opacity_animation_time / 6);
			}, Site.opacity_animation_time / 6);
		},
		
		
		
		show_settings_text: function(text)
		{
			let elements = Page.element.querySelectorAll(".settings-text-container");
			
			for (let i = 0; i < elements.length; i++)
			{
				Page.Animate.change_opacity(elements[i], 0, 1.5 * Site.base_animation_time);
				Page.Animate.change_scale(elements[i], .9, 1.5 * Site.base_animation_time);
			}
			
			
			
			let element = document.createElement("div");
			
			element.classList.add("settings-text-container");
			
			element.style.opacity = 0;
			element.style.transform = "scale(1.1)";
			
			Page.element.appendChild(element);
			
			
			
			let element_2 = document.createElement("p");
			
			element_2.classList.add("settings-text");
			
			element_2.classList.add("body-text");
			
			element_2.textContent = text;
			
			element.appendChild(element_2);
			
			
			
			setTimeout(() =>
			{
				Page.Animate.change_opacity(element, 1, 1.5 * Site.base_animation_time);
				Page.Animate.change_scale(element, 1, 1.5 * Site.base_animation_time);
				
				setTimeout(() =>
				{
					Page.Animate.change_opacity(element, 0, 1.5 * Site.base_animation_time);
					Page.Animate.change_scale(element, .9, 1.5 * Site.base_animation_time);
					
					setTimeout(() =>
					{
						element.remove();
					}, Site.opacity_animation_time * 2);
				}, Site.opacity_animation_time * 8);
			}, 10);
		}
	}
};