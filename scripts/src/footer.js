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
		let delay = 100;
		
		
		
		let url_vars_suffix = Page.Navigation.concat_url_vars();

		
		
		document.querySelector("#spawn-footer").insertAdjacentHTML("beforebegin", `
			<div style="position: relative">
				<div class="new-aos-section" data-aos="fade-in" data-aos-offset="0" style="position: absolute; bottom: 5px"></div>
			</div>
		`);
		
		
		
		if (!("footer_exclusion" in Page.settings && Page.settings["footer_exclusion"] !== ""))
		{
			document.querySelector("#spawn-footer").insertAdjacentHTML("afterend", `
				<div data-aos="fade-in" data-aos-duration="500" data-aos-offset="0">
					<div class="line-break line-break-0-0 footer-line-break-big"></div>
					<div class="line-break line-break-1-0 footer-line-break-big"></div>
					<div class="line-break line-break-0-1 footer-line-break-big"></div>
					<div class="line-break line-break-1-1 footer-line-break-big"></div>
				</div>
				
				<div style="height: 3vw"></div>
				
				<nav class="footer-image-links footer-image-links-big"></nav>
			`);
		}
		
		else
		{
			document.querySelector("#spawn-footer").insertAdjacentHTML("afterend", `
				<div data-aos="fade-in" data-aos-duration="500" data-aos-offset="0">
					<div class="line-break line-break-0-0 footer-line-break"></div>
					<div class="line-break line-break-1-0 footer-line-break"></div>
					<div class="line-break line-break-0-1 footer-line-break"></div>
					<div class="line-break line-break-1-1 footer-line-break"></div>
				</div>
				
				<div style="height: 3vw"></div>
				
				<nav class="footer-image-links"></nav>
			`);
		}
				
				
		
		if (!("footer_exclusion" in Page.settings && Page.settings["footer_exclusion"] === "writing"))
		{
			let element = document.createElement("div");
			
			document.querySelector(".footer-image-links").appendChild(element);
			
			element.outerHTML = `
				<div id="writing-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0">
					<a href="/index.html?page=%2Fwriting%2Fwriting.html${url_vars_suffix}" tabindex="-1">
						<img onclick="Page.Navigation.redirect('/writing/writing.html')" src="/writing/cover.${Images.file_extension}" alt="Writing" tabindex="2"></img>
					</a>
				</div>
			`;
			
			delay += 100;
		}
		
		
		if  (!("footer_exclusion" in Page.settings && Page.settings["footer_exclusion"] === "teaching"))
		{
			let element = document.createElement("div");
			
			document.querySelector(".footer-image-links").appendChild(element);
			
			element.outerHTML = `
				<div id="teaching-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0">
					<a class="focus-on-child" href="/index.html?page=%2Fteaching%2Fteaching.html${url_vars_suffix}" tabindex="-1">
						<img onclick="Page.Navigation.redirect('/teaching/teaching.html')" src="/teaching/cover.${Images.file_extension}" alt="Teaching" tabindex="2"></img>
					</a>
				</div>
			`;
			
			delay += 100;
		}
		
		
		if  (!("footer_exclusion" in Page.settings && Page.settings["footer_exclusion"] === "applets"))
		{
			let element = document.createElement("div");
			
			document.querySelector(".footer-image-links").appendChild(element);
			
			element.outerHTML = `
				<div id="applets-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0">
					<a class="focus-on-child" href="index.html?page=%2Fapplets%2Fapplets.html${url_vars_suffix}" tabindex="-1">
						<img onclick="Page.Navigation.redirect('/applets/applets.html')" src="/applets/cover.${Images.file_extension}" alt="Applets" tabindex="2"></img>
					</a>
				</div>
			`;
			
			delay += 100;
		}
		
		if  (!("footer_exclusion" in Page.settings && Page.settings["footer_exclusion"] === "bio"))
		{
			let element = document.createElement("div");
			
			document.querySelector(".footer-image-links").appendChild(element);
			
			element.outerHTML = `
				<div id="bio-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0">
					<a class="focus-on-child" href="/index.html?page=%2Fbio%2Fbio.html${url_vars_suffix}" tabindex="-1">
						<img onclick="Page.Navigation.redirect('/bio/bio.html')" src="/bio/cover.${Images.file_extension}" alt="Me" tabindex="2"></img>
					</a>
				</div>
			`;
			
			delay += 100;
		}
		
		
		
		//If the page isn't as tall as the screen (e.g. the 404 page), move the footer to the bottom of the page.
		if (document.body.clientHeight < Page.Layout.window_height)
		{
			document.querySelector("#spawn-footer").insertAdjacentHTML("beforebegin", `
				<div style="height: ${Page.Layout.window_height - document.body.clientHeight}px"></div>
			`);
		}
		
		
		
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
		
		
		
		//Initializes the floating footer by copying specific parts of the normal footer.
		load: function()
		{
			let floating_footer_element = document.createElement("footer");
			floating_footer_element.id = "floating-footer";
			
			document.body.insertBefore(floating_footer_element, document.body.firstChild);
			
			
			
			floating_footer_element.innerHTML = `
				<div class="footer-buttons">
					<div id="expand-footer-button" class="focus-on-child" tabindex="100">
						<input type="image" class="footer-button" src="/graphics/button-icons/gear.png" alt="Settings" onclick="Site.Settings.Floating.show()" tabindex="-1">
					</div>
				</div>
			`;
			
			
			
			this.last_scroll = window.scrollY;
			
			if (!Site.Interaction.currently_touch_device)
			{
				this.current_offset = 6.25;
				
				this.is_visible = true;
			}
			
			document.querySelector("#expand-footer-button").style.bottom = `${this.current_offset}px`;
			
			
			
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
				scroll_delta = Math.max(-10, Math.min(scroll_delta, 10))
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
			
			
			
			document.querySelector("#expand-footer-button").style.bottom = `${this.current_offset}px`;
		},
		
		
		
		animate_in: function()
		{
			if (this.currently_animating)
			{
				return;
			}
			
			
			
			this.currently_animating = true;
			
			this.current_offset = 6.25;
			
			document.querySelector("#expand-footer-button").style.opacity = 0;
			
			document.querySelector("#expand-footer-button").style.transform = "scale(1.2)";
			
			document.querySelector("#expand-footer-button").style.bottom = "6.25px";
			
			
			
			setTimeout(() =>
			{
				document.querySelector("#expand-footer-button").style.setProperty("transition", "opacity .6s ease-out, transform .6s ease-out", "important");
				
				
				
				document.querySelector("#expand-footer-button").style.opacity = 1;
				
				document.querySelector("#expand-footer-button").style.transform = "scale(1)";
				
				this.is_visible = true;
				
				
				
				setTimeout(() =>
				{
					document.querySelector("#expand-footer-button").style.setProperty("transition", "");
					
					this.current_offset = 6.25;
					
					this.last_scroll = -1;
					
					this.currently_animating = false;
				}, 600);
			}, 10);
		}
	}
};