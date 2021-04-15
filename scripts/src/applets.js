/*
	
	Applets: methods required by multiple applet pages.
	
		Canvases: methods to update and resize the output canvases
			
			set_up_resizer: initiallizes the code that lets canvases resize. Should be called by an applet page after to_resize, resize_callback, and true_fullscreen are set.
			
			switch_fullscreen: toggles between the default and fullscreen view for the current canvas.
			
			fullscreen_resize: run whenever the canvas is in the fullscreen view and the window is resized to update a few variables.
			
			fullscreen_scroll: run whenever the canvas is in the fullscreen view and the page is scrolled to update a few variables.
	
*/

let Applets =
{
	Canvases:
	{
		is_fullscreen: false,

		is_animating: false,

		//Set when an applet loads to makes its canvases automatically resize.
		to_resize: [],

		//True to fill the entire screen (which will strech the aspect ratio unless there's specific code to account for that), and false to letterbox.
		true_fullscreen: false,
		
		used_fullscreen_for_first_time: false,

		resize_callback: null,

		last_tap_time: 0,

		fullscreen_old_scroll: 0,
		fullscreen_locked_scroll: 0,
		
		
		
		set_up_resizer: function()
		{
			for (let i = 0; i < this.to_resize.length; i++)
			{
				this.to_resize[i].addEventListener("click", (e) =>
				{
					e.preventDefault();
					
					let time_diff = Date.now() - this.last_tap_time;
					
					if (time_diff < 300 && time_diff > 50)
					{
						this.switch_fullscreen();
					}
					
					this.last_tap_time = Date.now();
					
					document.body.style.userSelect = "none";
					document.body.style.WebkitUserSelect = "none";
					
					setTimeout(() =>
					{
						document.body.style.userSelect = "auto";
						document.body.style.WebkitUserSelect = "auto";
					}, 500);
				});
				
				
				
				this.to_resize[i].addEventListener("touchstart", (e) =>
				{
					e.preventDefault();
				});
				
				
				
				this.to_resize[i].addEventListener("touchend", (e) =>
				{
					e.preventDefault();
					
					let time_diff = Date.now() - this.last_tap_time;
					
					if (time_diff < 300 && time_diff > 50)
					{
						this.switch_fullscreen();
					}
					
					this.last_tap_time = Date.now();
					
					document.body.style.userSelect = "none";
					document.body.style.WebkitUserSelect = "none";
					
					setTimeout(() =>
					{
						document.body.style.userSelect = "auto";
						document.body.style.WebkitUserSelect = "auto";
					}, 500);
				});
			}
			
			
			
			if (this.used_fullscreen_for_first_time)
			{
				try
				{
					document.querySelector("#fullscreen-message").parentNode.previousElementSibling.remove();
					document.querySelector("#fullscreen-message").parentNode.remove();
					
					aos_resize();
				}
				
				catch(ex) {}
			}
			
			else if (currently_touch_device)
			{
				try
				{
					document.querySelector("#fullscreen-message p").textContent = "Double-tap canvas to enter fullscreen";
					
					aos_resize();
				}
				
				catch(ex) {}
			}
			
			
			window.addEventListener("resize", this.fullscreen_resize);
			temporary_handlers["resize"].push(this.fullscreen_resize);
			
			window.addEventListener("scroll", this.fullscreen_scroll);
			temporary_handlers["scroll"].push(this.fullscreen_scroll);
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
							
							aos_resize();
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
							
							aos_resize();
						}
						
						
						
						//One of these is for vertical aspect ratios and the other is for horizontal ones, but we add both in case the user resizes the window while in applet is fullscreen.
						
						document.querySelector(".applet-canvas-container").insertAdjacentHTML("beforebegin", `<div class="letterboxed-canvas-background no-floating-footer"></div>`);
						document.querySelector(".applet-canvas-container").insertAdjacentHTML("afterend", `<div class="letterboxed-canvas-background no-floating-footer"></div>`);
						
						document.querySelector(".applet-canvas-container").classList.add("black-background");
						document.querySelector(".applet-canvas-container").classList.add("no-floating-footer");
						
						
						
						this.fullscreen_resize();
					}
					
					
					
					document.body.style.opacity = 1;
					
					setTimeout(() =>
					{
						this.is_animating = false;
						
						this.fullscreen_resize();
					}, 300);
					
					
					
					let elements = document.querySelectorAll(".applet-canvas-container, .letterboxed-canvas-background");
					
					for (let i = 0; i < elements.length; i++)
					{
						elements[i].addEventListener("click", (e) =>
						{
							if (!this.is_fullscreen)
							{
								return;
							}
							
							e.preventDefault();
							
							let time_diff = Date.now() - this.last_tap_time;
							
							if (time_diff < 300 && time_diff > 50)
							{
								this.switch_fullscreen();
							}
							
							this.last_tap_time = Date.now();
							
							document.body.style.userSelect = "none";
							document.body.style.WebkitUserSelect = "none";
							
							setTimeout(() =>
							{
								document.body.style.userSelect = "auto";
								document.body.style.WebkitUserSelect = "auto";
							}, 500);
						});
						
						
						
						elements[i].addEventListener("touchstart", (e) =>
						{
							if (!this.is_fullscreen)
							{
								return;
							}
							
							e.preventDefault();
						});
						
						
						
						elements[i].addEventListener("touchend", (e) =>
						{
							if (!this.is_fullscreen)
							{
								return;
							}
							
							e.preventDefault();
							
							let time_diff = Date.now() - this.last_tap_time;
							
							if (time_diff < 300 && time_diff > 50)
							{
								this.switch_fullscreen();
							}
							
							this.last_tap_time = Date.now();
							
							document.body.style.userSelect = "none";
							document.body.style.WebkitUserSelect = "none";
							
							setTimeout(() =>
							{
								document.body.style.userSelect = "auto";
								document.body.style.WebkitUserSelect = "auto";
							}, 500);
						});
					}
					
					
					
					if (!this.used_fullscreen_for_first_time)
					{
						this.used_fullscreen_for_first_time = true;
						
						try
						{
							document.querySelector("#fullscreen-message").parentNode.previousElementSibling.remove();
							document.querySelector("#fullscreen-message").parentNode.remove();
							
							aos_resize();
						}
						
						catch(ex) {}
					}
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
					document.documentElement.style.overflowY = "visible";
					document.body.style.overflowY = "visible";
					
					
					
					window.scroll(0, this.fullscreen_old_scroll);
					
					
					
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
						
						
						
						aos_resize();
					}
					
					document.body.style.opacity = 1;
					
					setTimeout(() =>
					{
						this.is_animating = false;
					}, 300);
				}, 300);
			}
		},



		fullscreen_resize: function()
		{
			if (!this.is_fullscreen)
			{
				return;
			}
			
			
			
			if (aspect_ratio < 1 && !this.true_fullscreen)
			{
				window.scroll(0, window.scrollY + this.to_resize[0].getBoundingClientRect().top - (window_height - this.to_resize[0].offsetHeight) / 2 + 2);
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
				if (aspect_ratio < 1 && !this.true_fullscreen)
				{
					window.scroll(0, window.scrollY + this.to_resize[0].getBoundingClientRect().top - (window_height - this.to_resize[0].offsetHeight) / 2 + 2);
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



		fullscreen_scroll: function()
		{
			if (!this.is_fullscreen)
			{
				return;
			}
			
			window.scroll(0, this.fullscreen_locked_scroll);
		}
	}
}