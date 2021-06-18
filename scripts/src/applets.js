/*	
	
	Applets: methods required by multiple applet pages.
	
		Canvases: methods to update and resize the output canvases
			
			set_up_resizer: initiallizes the code that lets canvases resize. Should be called by an applet page after to_resize, resize_callback, and true_fullscreen are set.
			
			switch_fullscreen: toggles between the default and fullscreen view for the current canvas.
			
			fullscreen_on_resize: run whenever the canvas is in the fullscreen view and the window is resized to update a few variables.
			
			fullscreen_on_scroll: run whenever the canvas is in the fullscreen view and the page is scrolled to update a few variables.
	
*/



"use strict";



//This goes here because it's first to be included.
let Page = {};



Page.Applets =
{
	Canvases:
	{
		is_fullscreen: false,

		is_animating: false,

		//Set when an applet loads to makes its canvases automatically resize.
		to_resize: [],

		//True to fill the entire screen (which will strech the aspect ratio unless there's specific code to account for that), and false to letterbox.
		true_fullscreen: false,

		resize_callback: null,

		last_tap_time: 0,

		fullscreen_old_scroll: 0,
		fullscreen_locked_scroll: 0,
		
		old_footer_button_offset: 0,
		
		
		
		set_up_resizer: function()
		{
			let element = document.createElement("input");
			
			element.type = "image";
			element.id = "enter-fullscreen-button";
			element.src = "/graphics/general-icons/enter-fullscreen.png";
			element.alt = "Enter Fullscreen";
			element.setAttribute("onclick", "Page.Applets.Canvases.switch_fullscreen()");
			element.setAttribute("tabindex", "-1");
			
			document.querySelector("#output-canvas-container").appendChild(element);
			
			Page.Load.HoverEvents.add(element);
			
			element.addEventListener("touchend", () =>
			{
				Page.Applets.Canvases.switch_fullscreen();
			});
			
			
			
			window.addEventListener("resize", this.fullscreen_on_resize);
			Page.temporary_handlers["resize"].push(this.fullscreen_on_resize);
			
			window.addEventListener("scroll", this.fullscreen_on_scroll);
			Page.temporary_handlers["scroll"].push(this.fullscreen_on_scroll);
			
			let bound_function = this.handle_keypress_event.bind(this);
			document.documentElement.addEventListener("keydown", bound_function);
			Page.temporary_handlers["keydown"].push(this.fullscreen_on_scroll);
		},



		switch_fullscreen: function()
		{
			if (!this.is_fullscreen)
			{
				if (this.is_animating)
				{
					return;
				}
				
				
				
				this.is_fullscreen = true;
				
				this.is_animating = true;
				
				
				
				document.body.style.opacity = 0;
				
				setTimeout(() =>
				{
					document.querySelector("#output-canvas-container").classList.add("fullscreen");
					
					
					
					try {document.querySelector("#enter-fullscreen-button").remove();}
					catch(ex) {}
					
					
					
					let element = document.createElement("input");
					
					element.type = "image";
					element.id = "exit-fullscreen-button";
					element.src = "/graphics/general-icons/exit-fullscreen.png";
					element.alt = "Exit Fullscreen";
					element.setAttribute("onclick", "Page.Applets.Canvases.switch_fullscreen()");
					element.setAttribute("tabindex", "-1");
					
					document.body.appendChild(element);
					
					Page.Load.HoverEvents.add(element);
					
					element.addEventListener("touchend", () =>
					{
						Page.Applets.Canvases.switch_fullscreen();
					});
					
					
					
					this.old_footer_button_offset = Page.Footer.Floating.current_offset;
					
					Page.Footer.Floating.current_offset = -43.75;
					
					document.querySelector("#show-footer-menu-button").style.bottom = "-43.75px";
					
					
					
					document.documentElement.style.overflowY = "hidden";
					document.body.style.overflowY = "hidden";
					
					
					
					this.fullscreen_old_scroll = window.scrollY;
					
					
					
					if (this.true_fullscreen)
					{
						for (let i = 0; i < this.to_resize.length; i++)
						{
							this.to_resize[i].classList.add("true-fullscreen-canvas");
							
							//We do this to accomodate weirdly-set-up applets like the ones with draggable inputs, since they rely on their canvas container to keep the content below flowing properly.
							document.querySelector(".applet-canvas-container").classList.add("black-background");
							
							try {this.resize_callback();}
							catch(ex) {}
							
							Page.Load.AOS.on_resize();
						}
						
						window.scroll(0, window.scrollY + this.to_resize[0].getBoundingClientRect().top + 2);
						
						this.fullscreen_locked_scroll = window.scrollY;
					}
					
					
					
					else
					{
						for (let i = 0; i < this.to_resize.length; i++)
						{
							this.to_resize[i].classList.add("letterboxed-fullscreen-canvas");
							
							try {this.resize_callback();}
							catch(ex) {}
							
							Page.Load.AOS.on_resize();
						}
						
						
						
						//One of these is for vertical aspect ratios and the other is for horizontal ones, but we add both in case the user resizes the window while in applet is fullscreen.
						
						document.querySelector(".applet-canvas-container").insertAdjacentHTML("beforebegin", `<div class="letterboxed-canvas-background no-floating-footer"></div>`);
						document.querySelector(".applet-canvas-container").insertAdjacentHTML("afterend", `<div class="letterboxed-canvas-background no-floating-footer"></div>`);
						
						document.querySelector(".applet-canvas-container").classList.add("black-background");
						document.querySelector(".applet-canvas-container").classList.add("no-floating-footer");
						
						
						
						this.fullscreen_on_resize();
					}
					
					
					
					document.body.style.opacity = 1;
					
					setTimeout(() =>
					{
						this.is_animating = false;
						
						this.fullscreen_on_resize();
					}, 300);
				}, 300);
			}
			
			
			
			else
			{
				if (this.is_animating)
				{
					return;
				}
				
				
				
				this.is_fullscreen = false;
				
				this.is_animating = true;
				
				
				
				document.body.style.opacity = 0;
				
				setTimeout(() =>
				{
					document.querySelector("#output-canvas-container").classList.remove("fullscreen");
					
					
					
					document.documentElement.style.overflowY = "visible";
					document.body.style.overflowY = "visible";
					
					
					
					window.scroll(0, this.fullscreen_old_scroll);
					
					
					
					try {document.querySelector("#exit-fullscreen-button").remove();}
					catch(ex) {}
					
					
					
					let element = document.createElement("input");
					
					element.type = "image";
					element.id = "enter-fullscreen-button";
					element.src = "/graphics/general-icons/enter-fullscreen.png";
					element.alt = "Enter Fullscreen";
					element.setAttribute("onclick", "Page.Applets.Canvases.switch_fullscreen()");
					element.setAttribute("tabindex", "-1");
					
					document.querySelector("#output-canvas-container").appendChild(element);
					
					Page.Load.HoverEvents.add(element);
					
					element.addEventListener("touchend", () =>
					{
						Page.Applets.Canvases.switch_fullscreen();
					});
					
					
					
					Page.Footer.Floating.current_offset = this.old_footer_button_offset;
					
					document.querySelector("#show-footer-menu-button").style.bottom = this.old_footer_button_offset + "px";
					
					
					
					for (let i = 0; i < this.to_resize.length; i++)
					{
						this.to_resize[i].classList.remove("true-fullscreen-canvas");
						this.to_resize[i].classList.remove("letterboxed-fullscreen-canvas");
						
						document.querySelector(".applet-canvas-container").classList.remove("black-background");
						
						try
						{
							let elements = document.querySelectorAll(".letterboxed-canvas-background");
							
							for (let i = 0; i < elements.length; i++)
							{
								elements[i].remove();
							}
						}
						
						catch(ex) {}
						
						
						
						try {this.resize_callback();}
						catch(ex) {}
						
						
						
						Page.Load.AOS.on_resize();
					}
					
					document.body.style.opacity = 1;
					
					setTimeout(() =>
					{
						this.is_animating = false;
					}, 300);
				}, 300);
			}
		},



		fullscreen_on_resize: function()
		{
			if (!this.is_fullscreen)
			{
				return;
			}
			
			
			
			if (Page.Layout.aspect_ratio < 1 && !this.true_fullscreen)
			{
				window.scroll(0, window.scrollY + this.to_resize[0].getBoundingClientRect().top - (Page.Layout.window_height - this.to_resize[0].offsetHeight) / 2 + 2);
			}
			
			else
			{
				window.scroll(0, window.scrollY + this.to_resize[0].getBoundingClientRect().top + 2);
			}
			
			this.fullscreen_locked_scroll = window.scrollY;
			
			
			
			try {this.resize_callback();}
			catch(ex) {}
			
			
			
			setTimeout(() =>
			{
				if (Page.Layout.aspect_ratio < 1 && !this.true_fullscreen)
				{
					window.scroll(0, window.scrollY + this.to_resize[0].getBoundingClientRect().top - (Page.Layout.window_height - this.to_resize[0].offsetHeight) / 2 + 2);
				}
				
				else
				{
					window.scroll(0, window.scrollY + this.to_resize[0].getBoundingClientRect().top + 2);
				}
				
				this.fullscreen_locked_scroll = window.scrollY;
				
				
				
				try {this.resize_callback();}
				catch(ex) {}
			}, 500);
		},



		fullscreen_on_scroll: function()
		{
			if (!this.is_fullscreen)
			{
				return;
			}
			
			window.scroll(0, this.fullscreen_locked_scroll);
		},
		
		
		
		handle_keypress_event: function(e)
		{
			if (e.keyCode === 27 && this.is_fullscreen)
			{
				this.switch_fullscreen();
			}
		}
	}
};