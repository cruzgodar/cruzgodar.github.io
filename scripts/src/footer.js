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
		
		
		
		if  (!("footer_exclusion" in Page.settings && Page.settings["footer_exclusion"] === "about"))
		{
			let element = document.createElement("div");
			
			Page.element.querySelector(".footer-image-links").appendChild(element);
			
			element.outerHTML = `
				<div id="about-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0">
					<a class="focus-on-child" href="/index.html?page=%2Fabout%2Fabout.html${url_vars_suffix}" tabindex="-1">
						<img onclick="Page.Navigation.redirect('/about/about.html')" src="/about/cover.${Page.Images.file_extension}" alt="About" tabindex="2"></img>
					</a>
					
					<p class="footer-image-link-subtext">About</p>
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
			let elements = Page.element.querySelectorAll("#gallery-link img, #applets-link img, #writing-link img, #teaching-link img, #about-link img");
			
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
		
		
		
		show_footer_menu_button: null,
		
		settings_button: null,
		sitemap_button: null,
		about_button: null,
		debug_button: null,
		
		gallery_link: null,
		applets_link: null,
		writing_link: null,
		teaching_link: null,
		about_link: null,
		
		theme_button: null,
		contrast_button: null,
		text_size_button: null,
		font_button: null,
		content_animation_button: null,
		
		
		
		//Initializes the floating footer.
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
					
					<div id="floating-footer-about-link" class="image-link footer-menu-image-link" style="width: 39px; position: absolute; left: -40px; bottom: 202.25px">
						<a href="/about/about.html" tabindex="-1">
							<img onclick="Page.Navigation.redirect('/about/about.html')" src="/about/cover.${Page.Images.file_extension}" alt="Me" tabindex="1"></img>
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
				this.show_footer_menu_button = floating_footer_element.querySelector("#show-footer-menu-button");
				this.show_footer_menu_button.style.bottom = "6.25px";
				
				this.settings_button = floating_footer_element.querySelector("#settings-button");
				this.sitemap_button = floating_footer_element.querySelector("#sitemap-button");
				this.about_button = floating_footer_element.querySelector("#about-button");
				
				this.gallery_link = floating_footer_element.querySelector("#floating-footer-gallery-link");
				this.applets_link = floating_footer_element.querySelector("#floating-footer-applets-link");
				this.writing_link = floating_footer_element.querySelector("#floating-footer-writing-link");
				this.teaching_link = floating_footer_element.querySelector("#floating-footer-teaching-link");
				this.about_link = floating_footer_element.querySelector("#floating-footer-about-link");
				
				this.theme_button = floating_footer_element.querySelector("#theme-button");
				this.contrast_button = floating_footer_element.querySelector("#contrast-button");
				this.text_size_button = floating_footer_element.querySelector("#text-size-button");
				this.font_button = floating_footer_element.querySelector("#font-button");
				this.content_animation_button = floating_footer_element.querySelector("#content-animation-button");
				
				let elements = [this.show_footer_menu_button, this.settings_button, this.sitemap_button, this.about_button, this.gallery_link, this.applets_link, this.writing_link, this.teaching_link, this.about_link, this.theme_button, this.contrast_button, this.text_size_button, this.font_button, this.content_animation_button];
				
				if (DEBUG)
				{
					this.debug_button = floating_footer_element.querySelector("#debug-button");
					
					elements.push(this.debug_button);
				}
				
				for (let i = 0; i < elements.length; i++)
				{
					Page.Load.HoverEvents.add_with_scale(elements[i], 1.1);
				}
			}, Site.opacity_animation_time / 6);
			
			
			
			this.last_scroll = window.scrollY;
			
			this.current_offset = 6.25;
			
			this.is_visible = true;
		},
		
		
		
		show_menu: function()
		{
			this.settings_button.style.left = "10px";
			
			Page.Animate.change_opacity(this.show_footer_menu_button, 0, Site.opacity_animation_time);
			
			setTimeout(() =>
			{
				this.sitemap_button.style.left = "10px";
				
				setTimeout(() =>
				{
					this.about_button.style.left = "10px";
					
					
					if (DEBUG)
					{
						setTimeout(() =>
						{
							this.debug_button.style.left = "10px";
							
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
			
			
			
			this.settings_button.style.left = "-40px";
			
			if (!this.image_links_is_open)
			{
				Page.Animate.change_opacity(this.show_footer_menu_button, 1, Site.opacity_animation_time);
			}
			
			setTimeout(() =>
			{
				this.sitemap_button.style.left = "-40px";
				
				setTimeout(() =>
				{
					this.about_button.style.left = "-40px";
					
					if (DEBUG)
					{
						setTimeout(() =>
						{
							this.debug_button.style.left = "-40px";
							
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
						Page.Animate.change_opacity(this.settings_button, 1, Site.opacity_animation_time);
						Page.Animate.change_opacity(this.sitemap_button, 1, Site.opacity_animation_time);
						Page.Animate.change_opacity(this.about_button, 1, Site.opacity_animation_time);
						
						if (DEBUG)
						{
							Page.Animate.change_opacity(this.debug_button, 1, Site.opacity_animation_time);
						}
					}, Site.opacity_animation_time);
				}, Site.opacity_animation_time / 6);
			}, Site.opacity_animation_time / 6);
		},
		
		
		
		show_image_links: function()
		{
			this.gallery_link.style.left = "10px";
			
			Page.Animate.change_opacity(this.settings_button, 0, Site.opacity_animation_time);
			
			setTimeout(() =>
			{
				this.applets_link.style.left = "10px";
				
				Page.Animate.change_opacity(this.sitemap_button, 0, Site.opacity_animation_time);
				
				setTimeout(() =>
				{
					this.writing_link.style.left = "10px";
					
					Page.Animate.change_opacity(this.about_button, 0, Site.opacity_animation_time);
					
					setTimeout(() =>
					{
						this.teaching_link.style.left = "10px";
						
						setTimeout(() =>
						{
							this.about_link.style.left = "10px";
							
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
			
			
			
			this.gallery_link.style.left = "-40px";
			
			setTimeout(() =>
			{
				this.applets_link.style.left = "-40px";
				
				//This one looks better with a slight delay.
				Page.Animate.change_opacity(this.show_footer_menu_button, 1, Site.opacity_animation_time);
				
				setTimeout(() =>
				{
					this.writing_link.style.left = "-40px";
					
					setTimeout(() =>
					{
						this.teaching_link.style.left = "-40px";
						
						setTimeout(() =>
						{
							this.about_link.style.left = "-40px";
							
							this.image_links_is_open = false;
						}, Site.opacity_animation_time / 6);
					}, Site.opacity_animation_time / 6);
				}, Site.opacity_animation_time / 6);
			}, Site.opacity_animation_time / 6);
		},
		
		
		
		show_settings: function()
		{
			this.theme_button.style.left = "10px";
			
			Page.Animate.change_opacity(this.settings_button, 0, Site.opacity_animation_time);
			
			setTimeout(() =>
			{
				this.contrast_button.style.left = "10px";
			
				Page.Animate.change_opacity(this.sitemap_button, 0, Site.opacity_animation_time);
				
				setTimeout(() =>
				{
					this.text_size_button.style.left = "10px";
				
					Page.Animate.change_opacity(this.about_button, 0, Site.opacity_animation_time);
					
					setTimeout(() =>
					{
						this.font_button.style.left = "10px";
						
						setTimeout(() =>
						{
							this.content_animation_button.style.left = "10px";
							
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
			
			
			
			this.theme_button.style.left = "-40px";
			
			Page.Animate.change_opacity(this.show_footer_menu_button, 1, Site.opacity_animation_time);
			
			setTimeout(() =>
			{
				this.contrast_button.style.left = "-40px";
				
				setTimeout(() =>
				{
					this.text_size_button.style.left = "-40px";
					
					setTimeout(() =>
					{
						this.font_button.style.left = "-40px";
						
						setTimeout(() =>
						{
							this.content_animation_button.style.left = "-40px";
							
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