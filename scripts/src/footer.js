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
					<div class="line-break line-break-2-0 footer-line-break-big"></div>
					<div class="line-break line-break-0-1 footer-line-break-big"></div>
					<div class="line-break line-break-1-1 footer-line-break-big"></div>
					<div class="line-break line-break-2-1 footer-line-break-big"></div>
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
					<div class="line-break line-break-2-0 footer-line-break"></div>
					<div class="line-break line-break-0-1 footer-line-break"></div>
					<div class="line-break line-break-1-1 footer-line-break"></div>
					<div class="line-break line-break-2-1 footer-line-break"></div>
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
		
		
		
		document.querySelector(".footer-image-links").insertAdjacentHTML("afterend", `
			<div class="footer-buttons" style="position: relative">
				<div class="focus-on-child" data-aos="zoom-out" data-aos-delay="0" data-aos-offset="10" data-aos-once="false" style="position: absolute; bottom: 6.25px; left: 10px" tabindex="3">
					<input type="image" class="footer-button" src="/graphics/button-icons/gear.png" alt="Change Theme" onclick="Site.Settings.Floating.show()" tabindex="-1">
				</div>
				
				<div class="focus-on-child" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="10" data-aos-once="false" style="position: absolute; bottom: 6.25px; right: 10px" tabindex="3">
					<input type="image" class="footer-button" src="/graphics/button-icons/question.png" alt="About" onclick="Page.Navigation.redirect('/about/about.html')" tabindex="-1">
				</div>
			</div>
		`);
		
		
		
		//If the page isn't as tall as the screen (e.g. the 404 page), move the footer to the bottom of the page.
		if (document.body.clientHeight < Page.Layout.window_height)
		{
			document.querySelector("#spawn-footer").insertAdjacentHTML("beforebegin", `
				<div style="height: ${Page.Layout.window_height - document.body.clientHeight}px"></div>
			`);
		}
		
		
		
		this.Floating.load();
		
		
		
		setTimeout(() =>
		{
			try
			{
				let elements = document.querySelectorAll(".footer-button, .footer-image-link img");
				
				for (let i = 0; i < elements.length; i++)
				{
					Page.Load.HoverEvents.add(elements[i]);
				}
			}
			
			catch(ex) {}
		}, 100);
		
		
		
		//If we restored a scroll position that was supposed to be in the footer, we won't be able to properly restore that until now.
		if (Page.scroll > 0)
		{
			window.scrollTo(0, Page.scroll);
		}
	},
	
	
	
	Floating:
	{
		is_visible: false,
		
		height: 0,
		
		
		
		//Initializes the floating footer by copying specific parts of the normal footer.
		load: function()
		{
			let floating_footer_element = document.createElement("footer");
			floating_footer_element.id = "floating-footer";
			
			document.body.insertBefore(floating_footer_element, document.body.firstChild);
			
			
			
			floating_footer_element.innerHTML = `
				<div id="floating-footer-gradient"></div>
				
				<div id="floating-footer-content">
					<div id="floating-footer-bottom-margin"></div>
				</div>
			`;
			
			
			
			//We want all the footer image links, but we don't want the animations anchored to anything. We have a try block here in case this is being called from the homepage.
			try
			{
				let element = document.querySelector("#spawn-footer").parentNode.querySelector(".footer-image-links").cloneNode(true);
				
				for (let i = 0; i < element.children.length; i++)
				{
					element.children[i].removeAttribute("data-aos");
					element.children[i].removeAttribute("data-aos-anchor");
				}
				
				document.querySelector("#floating-footer-content").appendChild(element);
			}
			
			catch(ex) {}
			
			
			
			//Next, we want the footer buttons.
			let element = document.querySelector("#spawn-footer").parentNode.querySelector(".footer-buttons").cloneNode(true);
			
			for (let i = 0; i < element.children.length; i++)
			{
				element.children[i].removeAttribute("data-aos");
				element.children[i].removeAttribute("data-aos-anchor");
			}
			
			document.querySelector("#floating-footer-content").appendChild(element);
			
			
			
			//Finally, we need to cover the bottom with a very thin strip of white to fix a strange glitch where absolutely-positioned elements always have a transparent background.
			element = document.createElement("div");
			
			element.id = "floating-footer-button-background";
			
			document.querySelector("#floating-footer-content").appendChild(element);
			
			
			
			let bound_function = this.on_resize.bind(this);
			
			window.addEventListener("resize", bound_function);
			Page.temporary_handlers["resize"].push(bound_function);
			
			bound_function();
			
			
			
			let bound_function_2 = this.on_scroll.bind(this);
			
			window.addEventListener("scroll", bound_function_2);
			Page.temporary_handlers["scroll"].push(bound_function_2);
			
			
			
			document.querySelector("#floating-footer").style.display = "block";
			
			this.height = document.querySelector("#floating-footer-content").offsetHeight;
			
			document.querySelector("#floating-footer").style.display = "none";
			
			
			
			this.init_listeners_touch();
			this.init_listeners_no_touch();
		},



		//Properly size the floating footer -- when there is a scroll bar, the right button will clip into it. Unfortunately, there is no way to solve this with CSS, as far as I'm aware.
		on_resize: function()
		{
			document.querySelector("#floating-footer").style.width = document.documentElement.clientWidth + "px";
			
			try
			{
				document.querySelector("#floating-footer").style.display = "block";
				
				this.height = document.querySelector("#floating-footer-content").offsetHeight;
				
				document.querySelector("#floating-footer").style.display = "none";
			}
			
			catch(ex) {}
		},



		//Remove the trigger zone when we reach the actual footer so that we don't cause any problems, and hide the footer when scrolling so that it doesn't flicker weirdly.
		on_scroll: function()
		{
			if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight)
			{
				this.is_visible = false;
				
				document.querySelector("#floating-footer").style.opacity = 0;
				
				setTimeout(() =>
				{
					document.querySelector("#floating-footer").style.display = "none";
				}, 300);
			}
		},



		//When the touch target is moused over or tapped, show the footer and hide the touch target. When the mouse leaves the footer or there's a tap somewhere else, hide the footer and show the touch target again.

		init_listeners_no_touch: function()
		{
			this.is_visible = false;
			
			
			
			document.body.addEventListener("mousemove", (e) =>
			{
				let element = document.elementFromPoint(e.clientX, e.clientY);
				
				if (this.is_visible === false && e.clientY >= window.innerHeight - 75 && e.clientY >= window.innerHeight - this.height && !(window.innerHeight + window.pageYOffset >= document.body.offsetHeight) && element.classList.contains("no-floating-footer") === false)
				{
					this.is_visible = true;
					
					document.querySelector("#floating-footer").style.display = "block";
					
					setTimeout(() =>
					{
						document.querySelector("#floating-footer").style.opacity = 1;
					}, 20);
				}
				
				
				
				else if (this.is_visible && e.clientY < window.innerHeight - this.height - 20)
				{
					document.querySelector("#floating-footer").style.opacity = 0;
					
					this.is_visible = false;
					
					setTimeout(() =>
					{
						document.querySelector("#floating-footer").style.display = "none";
					}, 300);
				}
			});
		},
		
		

		init_listeners_touch: function()
		{
			this.is_visible = false;
			
			
			
			let bound_function = this.process_touchstart.bind(this);
			
			document.documentElement.addEventListener("touchstart", bound_function, false);
			Page.temporary_handlers["touchstart"].push(bound_function);
			
			let bound_function_2 = this.process_touchend.bind(this);
			
			document.documentElement.addEventListener("touchend", bound_function_2, false);
			Page.temporary_handlers["touchend"].push(bound_function_2);
		},



		process_touchend: function()
		{
			let element = document.elementFromPoint(Site.Interaction.last_touch_x, Site.Interaction.last_touch_y);
			
			if (this.is_visible === false && Site.Interaction.last_touch_y >= window.innerHeight - 75 && Site.Interaction.last_touch_y >= window.innerHeight - this.height && !(window.innerHeight + window.pageYOffset >= document.body.offsetHeight) && element.classList.contains("no-floating-footer") === false)
			{
				document.querySelector("#floating-footer").style.display = "block";
				
				this.is_visible = true;
				
				setTimeout(() =>
				{
					document.querySelector("#floating-footer").style.opacity = 1;
				}, 20);
			}
		},



		process_touchstart: function(event)
		{
			if (this.is_visible && Site.Interaction.last_touch_y < window.innerHeight - this.height - 20)
			{
				document.querySelector("#floating-footer").style.opacity = 0;
				
				this.is_visible = false;
				
				setTimeout(() =>
				{
					document.querySelector("#floating-footer").style.display = "none";
				}, 300);
			}
		}
	}
};