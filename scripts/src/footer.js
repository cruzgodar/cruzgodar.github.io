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
					<a class="focus-on-child" href="index.html?page=%2Fgallery%2F${url_vars_suffix}" tabindex="-1">
						<img onclick="Page.Navigation.redirect('/gallery/')" src="/gallery/cover.${Page.Images.file_extension}" alt="Gallery" tabindex="2"></img>
					</a>
					
					<div class="footer-image-link-subtext-container">
						<p>Gallery</p>
					</div>
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
					<a class="focus-on-child" href="index.html?page=%2Fapplets%2F${url_vars_suffix}" tabindex="-1">
						<img onclick="Page.Navigation.redirect('/applets/')" src="/applets/cover.${Page.Images.file_extension}" alt="Applets" tabindex="2"></img>
					</a>
					
					<div class="footer-image-link-subtext-container">
						<p>Applets</p>
					</div>
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
					<a href="/index.html?page=%2Fwriting%2F${url_vars_suffix}" tabindex="-1">
						<img onclick="Page.Navigation.redirect('/writing/')" src="/writing/cover.${Page.Images.file_extension}" alt="Writing" tabindex="2"></img>
					</a>
					
					<div class="footer-image-link-subtext-container">
						<p>Writing</p>
					</div>
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
					<a class="focus-on-child" href="/index.html?page=%2Fteaching%2F${url_vars_suffix}" tabindex="-1">
						<img onclick="Page.Navigation.redirect('/teaching/')" src="/teaching/cover.${Page.Images.file_extension}" alt="Teaching" tabindex="2"></img>
					</a>
					
					<div class="footer-image-link-subtext-container">
						<p>Teaching</p>
					</div>
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
					<a class="focus-on-child" href="/index.html?page=%2Fabout%2F${url_vars_suffix}" tabindex="-1">
						<img onclick="Page.Navigation.redirect('/about/')" src="/about/cover.${Page.Images.file_extension}" alt="About" tabindex="2"></img>
					</a>
					
					<div class="footer-image-link-subtext-container">
						<p>About</p>
					</div>
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
			Page.element.querySelectorAll("#gallery-link img, #applets-link img, #writing-link img, #teaching-link img, #about-link img").forEach(image_link =>
			{
				image_link.addEventListener("mouseenter", () =>
				{
					if (!(Site.Interaction.currently_touch_device))
					{
						image_link.parentNode.parentNode.lastElementChild.style.marginTop = "-32px";
						Page.Animate.change_opacity(image_link.parentNode.parentNode.lastElementChild.firstElementChild, 1, Site.opacity_animation_time);
					}
				});
				
				image_link.addEventListener("mouseleave", () =>
				{
					if (!(Site.Interaction.currently_touch_device))
					{
						image_link.parentNode.parentNode.lastElementChild.style.marginTop = 0;
						Page.Animate.change_opacity(image_link.parentNode.parentNode.lastElementChild.firstElementChild, 0, Site.opacity_animation_time);
					}
				});
			});
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
					<div id="debug-button" class="footer-menu-button focus-on-child" tabindex="103">
						<input type="image" class="footer-button" src="/graphics/button-icons/bug.png" alt="Debug" onclick="Page.Navigation.redirect('/debug/')" tabindex="-1">
					</div>
				`;
			}
			
			
			
			floating_footer_element.innerHTML = `
				<div class="footer-buttons">
					<div id="show-footer-menu-button" class="footer-menu-button focus-on-child" tabindex="100">
						<input type="image" class="footer-button" src="/graphics/button-icons/chevron.png" alt="Options" onclick="Page.Footer.Floating.show_menu()" tabindex="-1">
					</div>
					
					
					
					${debug_html}
					
					<div id="sitemap-button" class="footer-menu-button focus-on-child" tabindex="102">
						<input type="image" class="footer-button" src="/graphics/button-icons/sitemap.png" alt="Options" onclick="Page.Footer.Floating.show_image_links()" tabindex="-1">
					</div>
					
					<div id="settings-button" class="footer-menu-button focus-on-child" tabindex="101">
						<input type="image" class="footer-button" src="/graphics/button-icons/gear.png" alt="Options" onclick="Page.Footer.Floating.show_settings()" tabindex="-1">
					</div>
					
					
					
					<div id="floating-footer-gallery-link" class="image-link footer-menu-image-link" style="width: 39px; position: absolute; left: -40px; bottom: 6.25px">
						<a href="/gallery/" tabindex="-1">
							<img onclick="Page.Navigation.redirect('/gallery/')" src="/gallery/cover.${Page.Images.file_extension}" alt="Gallery" tabindex="1"></img>
						</a>
					</div>
					
					<div id="floating-footer-applets-link" class="image-link footer-menu-image-link" style="width: 39px; position: absolute; left: -40px; bottom: 55.25px">
						<a href="/applets/" tabindex="-1">
							<img onclick="Page.Navigation.redirect('/applets/')" src="/applets/cover.${Page.Images.file_extension}" alt="Applets" tabindex="1"></img>
						</a>
					</div>
					
					<div id="floating-footer-writing-link" class="image-link footer-menu-image-link" style="width: 39px; position: absolute; left: -40px; bottom: 104.25px">
						<a href="/writing/" tabindex="-1">
							<img onclick="Page.Navigation.redirect('/writing/')" src="/writing/cover.${Page.Images.file_extension}" alt="Writing" tabindex="1"></img>
						</a>
					</div>
					
					<div id="floating-footer-teaching-link" class="image-link footer-menu-image-link" style="width: 39px; position: absolute; left: -40px; bottom: 153.25px">
						<a href="/teaching/" tabindex="-1">
							<img onclick="Page.Navigation.redirect('/teaching/')" src="/teaching/cover.${Page.Images.file_extension}" alt="Teaching" tabindex="1"></img>
						</a>
					</div>
					
					<div id="floating-footer-about-link" class="image-link footer-menu-image-link" style="width: 39px; position: absolute; left: -40px; bottom: 202.25px">
						<a href="/about/" tabindex="-1">
							<img onclick="Page.Navigation.redirect('/about/')" src="/about/cover.${Page.Images.file_extension}" alt="Me" tabindex="1"></img>
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
				
				let elements = [this.show_footer_menu_button, this.settings_button, this.sitemap_button, this.gallery_link, this.applets_link, this.writing_link, this.teaching_link, this.about_link, this.theme_button, this.contrast_button, this.text_size_button, this.font_button, this.content_animation_button];
				
				if (DEBUG)
				{
					this.debug_button = floating_footer_element.querySelector("#debug-button");
					
					elements.push(this.debug_button);
				}
				
				elements.forEach(element => Page.Load.HoverEvents.add_with_scale(element, 1.1, true));
				
				elements.slice(1).forEach(element => element.style.opacity = 0);
				
				
				
				let links = [this.gallery_link, this.applets_link, this.writing_link, this.teaching_link, this.about_link];
				
				links.forEach(link => link.addEventListener("click", e => e.preventDefault()));
			}, Site.opacity_animation_time / 6);
			
			
			
			this.last_scroll = window.scrollY;
			
			this.current_offset = 6.25;
			
			this.is_visible = true;
			
			
			
			let bound_function = this.hide_menu.bind(this);
			
			document.body.addEventListener("touchstart", bound_function);
			document.body.addEventListener("touchmove", bound_function);
			document.body.addEventListener("mousedown", bound_function);
			
			bound_function = this.hide_image_links.bind(this);
			
			document.body.addEventListener("touchstart", bound_function);
			document.body.addEventListener("touchmove", bound_function);
			document.body.addEventListener("mousedown", bound_function);
			
			bound_function = this.hide_settings.bind(this);
			
			document.body.addEventListener("touchstart", bound_function);
			document.body.addEventListener("touchmove", bound_function);
			document.body.addEventListener("mousedown", bound_function);
		},
		
		
		
		show_menu: function()
		{
			this.settings_button.style.opacity = 1;
			this.settings_button.style.left = "10px";
			
			Page.Animate.change_opacity(this.show_footer_menu_button, 0, Site.opacity_animation_time);
			
			setTimeout(() =>
			{
				this.sitemap_button.style.opacity = 1;
				this.sitemap_button.style.left = "10px";
				
				if (DEBUG)
				{
					setTimeout(() =>
					{
						this.debug_button.style.opacity = 1;
						this.debug_button.style.left = "10px";
						
						this.menu_is_open = true;
					}, Site.opacity_animation_time / 6);
				}
				
				else
				{
					this.menu_is_open = true;
				}
			}, Site.opacity_animation_time / 6);
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
					this.settings_button.style.opacity = 0;
					this.sitemap_button.style.opacity = 0;
					
					if (DEBUG)
					{
						this.debug_button.style.opacity = 0;
					}
				}, Site.opacity_animation_time);
			}, Site.opacity_animation_time / 6);
		},
		
		
		
		show_image_links: function()
		{
			this.gallery_link.style.opacity = 1;
			this.gallery_link.style.left = "10px";
			
			Page.Animate.change_opacity(this.settings_button, 0, Site.opacity_animation_time);
			
			setTimeout(() =>
			{
				this.applets_link.style.opacity = 1;
				this.applets_link.style.left = "10px";
				
				Page.Animate.change_opacity(this.sitemap_button, 0, Site.opacity_animation_time);
				
				setTimeout(() =>
				{
					this.writing_link.style.opacity = 1;
					this.writing_link.style.left = "10px";
					
					if (DEBUG)
					{
						Page.Animate.change_opacity(this.debug_button, 0, Site.opacity_animation_time);
					}	
					
					setTimeout(() =>
					{
						this.teaching_link.style.opacity = 1;
						this.teaching_link.style.left = "10px";
						
						setTimeout(() =>
						{
							this.about_link.style.opacity = 1;
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
							
							setTimeout(() =>
							{
								this.gallery_link.style.opacity = 1;
								this.applets_link.style.opacity = 1;
								this.writing_link.style.opacity = 1;
								this.teaching_link.style.opacity = 1;
								this.about_link.style.opacity = 1;
							}, Site.opacity_animation_time);
						}, Site.opacity_animation_time / 6);
					}, Site.opacity_animation_time / 6);
				}, Site.opacity_animation_time / 6);
			}, Site.opacity_animation_time / 6);
		},
		
		
		
		show_settings: function()
		{
			this.theme_button.style.opacity = 1;
			this.theme_button.style.left = "10px";
			
			Page.Animate.change_opacity(this.settings_button, 0, Site.opacity_animation_time);
			
			setTimeout(() =>
			{
				this.contrast_button.style.opacity = 1;
				this.contrast_button.style.left = "10px";
			
				Page.Animate.change_opacity(this.sitemap_button, 0, Site.opacity_animation_time);
				
				setTimeout(() =>
				{
					this.text_size_button.style.opacity = 1;
					this.text_size_button.style.left = "10px";
				
					if (DEBUG)
					{
						Page.Animate.change_opacity(this.debug_button, 0, Site.opacity_animation_time);
					}
					
					setTimeout(() =>
					{
						this.font_button.style.opacity = 1;
						this.font_button.style.left = "10px";
						
						setTimeout(() =>
						{
							this.content_animation_button.style.opacity = 1;
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
							
							setTimeout(() =>
							{
								this.theme_button.style.opacity = 0;
								this.contrast_button.style.opacity = 0;
								this.text_size_button.style.opacity = 0;
								this.font_button.style.opacity = 0;
								this.content_animation_button.style.opacity = 0;
							}, Site.opacity_animation_time);
						}, Site.opacity_animation_time / 6);
					}, Site.opacity_animation_time / 6);
				}, Site.opacity_animation_time / 6);
			}, Site.opacity_animation_time / 6);
		},
		
		
		
		show_settings_text: function(text)
		{
			Page.element.querySelectorAll(".settings-text-container").forEach(element =>
			{
				Page.Animate.change_opacity_js(element, 0, 1.5 * Site.base_animation_time);
				Page.Animate.change_scale_js(element, .9, 1.5 * Site.base_animation_time);
			});
			
			
			
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
				Page.Animate.change_opacity_js(element, 1, 1.5 * Site.base_animation_time);
				Page.Animate.change_scale_js(element, 1, 1.5 * Site.base_animation_time);
				
				setTimeout(() =>
				{
					Page.Animate.change_opacity_js(element, 0, 1.5 * Site.base_animation_time);
					Page.Animate.change_scale_js(element, .9, 1.5 * Site.base_animation_time);
					
					setTimeout(() =>
					{
						element.remove();
					}, Site.base_animation_time * 2);
				}, Site.base_animation_time * 8);
			}, 10);
		}
	}
};