"use strict";



Page.Footer =
{
	load: function()
	{
		let url_vars_suffix = Page.Navigation.concat_url_vars();
		
		
		
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
		
		
		
		let footer_pages = ["gallery", "applets", "teaching", "writing", "about"];
		
		footer_pages.forEach(page =>
		{
			if (!("footer_exclusion" in Page.settings && Page.settings["footer_exclusion"] === page))
			{
				let element = document.createElement("div");
				
				Page.element.querySelector(".footer-image-links").appendChild(element);
				
				let title = page[0].toUpperCase() + page.slice(1);
				
				element.outerHTML = `
					<div id="${footer_pages}-link" class="footer-image-link">
						<a class="focus-on-child" href="index.html?page=%2F${page}%2F${url_vars_suffix}" tabindex="-1">
							<img onclick="Page.Navigation.redirect('/${page}/')" src="/${page}/cover.${Page.Images.file_extension}" alt="${title}" tabindex="2"></img>
						</a>
						
						<div class="footer-image-link-subtext-container">
							<p>${title}</p>
						</div>
					</div>
				`;
			}
		});
		
		
		
		//If the page isn't as tall as the screen (e.g. the 404 page), move the footer to the bottom of the page.
		if (Page.element.clientHeight < Page.Layout.window_height)
		{
			Page.element.querySelector("#spawn-footer").insertAdjacentHTML("beforebegin", `
				<div style="height: ${Page.Layout.window_height - document.body.clientHeight}px"></div>
			`);
		}
		
		
		
		let footer_image_links = null;
		let footer_subtexts = null;
		
		setTimeout(() =>
		{
			footer_image_links = Page.element.querySelectorAll(".footer-image-link img");
			footer_subtexts = Page.element.querySelectorAll(".footer-image-link-subtext-container");
			
			footer_image_links.forEach((element, index) =>
			{
				element.addEventListener("mouseenter", () =>
				{
					if (!(Site.Interaction.currently_touch_device))
					{
						footer_subtexts[index].style.marginTop = "-32px";
						Page.Animate.change_opacity(footer_subtexts[index].firstElementChild, 1, Site.opacity_animation_time);
					}
				});
				
				element.addEventListener("mouseleave", () =>
				{
					if (!(Site.Interaction.currently_touch_device))
					{
						footer_subtexts[index].style.marginTop = 0;
						Page.Animate.change_opacity(footer_subtexts[index].firstElementChild, 0, Site.opacity_animation_time);
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
		currently_animating: false,
		
		is_open: false,
		
		timeout_id_1: null,
		timeout_id_2: null,
		
		
		
		left_names: ["theme", "contrast", "font", "text-size", "content-animation"],
		left_effects: ["Site.Settings.toggle('theme')", "Site.Settings.toggle('contrast')", "Site.Settings.toggle('font')", "Site.Settings.toggle('text_size')", "Site.Settings.toggle('content_animation')"],
		right_names: ["gallery", "applets", "teaching", "writing", "about"],
		
		menu_button: null,
		left_buttons: null,
		right_buttons: null,
		
		
		
		//Initializes the floating footer.
		load: function()
		{
			let floating_footer_element = document.createElement("footer");
			floating_footer_element.id = "floating-footer";
			
			document.body.insertBefore(floating_footer_element, document.body.firstChild);
			
			
			
			if (DEBUG)
			{
				this.left_names.push("debug");
				this.left_effects.push("Page.Navigation.redirect('/debug/')");
			}
			
			
			
			let html = `
				<input id="menu-button" type="image" class="footer-button dont-close-floating-footer" src="/graphics/button-icons/menu.png" onclick="Page.Footer.Floating.show()" tabindex="-1">
			`;
			
			this.left_names.forEach((name, index) =>
			{
				html += `
					<input type="image" id="${name}-button" class="footer-button dont-close-floating-footer" style="bottom: ${10 + 49 * index}px" src="/graphics/button-icons/${name}.png" onclick="${this.left_effects[index]}" tabindex="-1">
				`;
			});
			
			this.right_names.forEach((name, index) =>
			{
				html += `
					<div id="floating-footer-${name}-link" class="image-link footer-menu-image-link" style="bottom: ${10 + 49 * index}px">
						<a href="/${name}/" tabindex="-1">
							<img class="dont-close-floating-footer" onclick="Page.Navigation.redirect('/${name}/')" src="/${name}/cover.${Page.Images.file_extension}" tabindex="1"></img>
						</a>
					</div>
				`;
			});
			
			
			floating_footer_element.innerHTML = html;
			
			
			
			setTimeout(() =>
			{
				this.menu_button = floating_footer_element.querySelector("#menu-button");
				this.left_buttons = floating_footer_element.querySelectorAll(".footer-button:not(#menu-button)");
				this.right_buttons = floating_footer_element.querySelectorAll(".footer-menu-image-link");
				
				
				
				Page.Load.HoverEvents.add_with_scale(this.menu_button, 1.1, true);
				
				this.left_buttons.forEach(element => Page.Load.HoverEvents.add_with_scale(element, 1.1, true));
				
				this.right_buttons.forEach(element =>
				{
					Page.Load.HoverEvents.add_with_scale(element, 1.1, true);
					
					element.firstElementChild.addEventListener("click", e => e.preventDefault());
				});
			}, Site.opacity_animation_time / 6);
			
			
			
			let bound_function = this.hide.bind(this);
			
			document.body.addEventListener("touchstart", bound_function);
			document.body.addEventListener("touchmove", bound_function);
			document.body.addEventListener("mousedown", bound_function);
		},
		
		
		
		show: function()
		{
			if (this.is_open)
			{
				return;
			}
			
			this.is_open = true;
			
			Page.Animate.change_opacity_js(this.menu_button, 0, Site.opacity_animation_time);
			
			this.left_buttons.forEach((element, index) =>
			{
				setTimeout(() =>
				{
					element.style.left = "10px";
					Page.Animate.change_opacity_js(element, 1, Site.opacity_animation_time, true);
				}, index * Site.opacity_animation_time / 6);
			});
			
			this.right_buttons.forEach((element, index) =>
			{
				setTimeout(() =>
				{
					element.style.right = "10px";
					Page.Animate.change_opacity_js(element, 1, Site.opacity_animation_time, true);
				}, index * Site.opacity_animation_time / 6);
			});
		},
		
		
		
		hide: function(e)
		{
			if (!this.is_open)
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
			
			
			
			if (document.elementFromPoint(x, y).classList.contains("dont-close-floating-footer"))
			{
				return;
			}
			
			
			this.is_open = false;
			
			Page.Animate.change_opacity_js(this.menu_button, 1, Site.opacity_animation_time);
			
			this.left_buttons.forEach((element, index) =>
			{
				setTimeout(() =>
				{
					element.style.left = "-40px";
					Page.Animate.change_opacity_js(element, 0, Site.opacity_animation_time, true);
				}, index * Site.opacity_animation_time / 6);
			});
			
			this.right_buttons.forEach((element, index) =>
			{
				setTimeout(() =>
				{
					element.style.right = "-40px";
					Page.Animate.change_opacity_js(element, 0, Site.opacity_animation_time, true);
				}, index * Site.opacity_animation_time / 6);
			});
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