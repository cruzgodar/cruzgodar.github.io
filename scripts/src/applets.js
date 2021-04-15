let Applets =
{
	used_fullscreen_for_first_time: false,
	
	canvas_is_fullscreen: false,

	canvas_is_animating: false,

	//Set when an applet loads to makes its canvases automatically resize.
	canvases_to_resize: [],

	//True to fill the entire screen (which will strech the aspect ratio unless there's specific code to account for that, and false to letterbox.
	canvas_true_fullscreen: false,

	canvas_resize_callback: null,

	last_tap_time: 0,

	fullscreen_canvas_old_scroll: 0,
	fullscreen_canvas_locked_scroll: 0,
	
	
	
	set_up_canvas_resizer: function()
	{
		for (let i = 0; i < this.canvases_to_resize.length; i++)
		{
			this.canvases_to_resize[i].addEventListener("click", (e) =>
			{
				e.preventDefault();
				
				let time_diff = Date.now() - this.last_tap_time;
				
				if (time_diff < 300 && time_diff > 50)
				{
					this.switch_canvas_fullscreen();
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
			
			
			
			this.canvases_to_resize[i].addEventListener("touchstart", (e) =>
			{
				e.preventDefault();
			});
			
			
			
			this.canvases_to_resize[i].addEventListener("touchend", (e) =>
			{
				e.preventDefault();
				
				let time_diff = Date.now() - this.last_tap_time;
				
				if (time_diff < 300 && time_diff > 50)
				{
					this.switch_canvas_fullscreen();
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
		
		
		window.addEventListener("resize", this.fullscreen_canvas_resize);
		temporary_handlers["resize"].push(this.fullscreen_canvas_resize);
		
		window.addEventListener("scroll", this.fullscreen_canvas_scroll);
		temporary_handlers["scroll"].push(this.fullscreen_canvas_scroll);
	},



	switch_canvas_fullscreen: function()
	{
		if (!this.canvas_is_fullscreen)
		{
			if (this.canvas_is_animating)
			{
				return;
			}
			
			
			
			this.canvas_is_fullscreen = true;
			
			this.canvas_is_animating = true;
			
			
			
			document.body.style.opacity = 0;
			
			setTimeout(() =>
			{
				document.documentElement.style.overflowY = "hidden";
				document.body.style.overflowY = "hidden";
				
				
				
				this.fullscreen_canvas_old_scroll = window.scrollY;
				
				
				
				if (this.canvas_true_fullscreen)
				{
					for (let i = 0; i < this.canvases_to_resize.length; i++)
					{
						this.canvases_to_resize[i].classList.add("true-fullscreen-canvas");
						
						//We do this to accomodate weirdly-set-up applets like the ones with draggable inputs, since they rely on their canvas container to keep the content below flowing properly.
						document.querySelector(".applet-canvas-container").classList.add("black-background");
						
						try {this.canvas_resize_callback();}
						catch(ex) {}
						
						aos_resize();
					}
					
					window.scroll(0, window.scrollY + this.canvases_to_resize[0].getBoundingClientRect().top + 2);
					
					this.fullscreen_canvas_locked_scroll = window.scrollY;
				}
				
				
				
				else
				{
					for (let i = 0; i < this.canvases_to_resize.length; i++)
					{
						this.canvases_to_resize[i].classList.add("letterboxed-fullscreen-canvas");
						
						try {this.canvas_resize_callback();}
						catch(ex) {}
						
						aos_resize();
					}
					
					
					
					//One of these is for vertical aspect ratios and the other is for horizontal ones, but we add both in case the user resizes the window while in applet is fullscreen.
					
					document.querySelector(".applet-canvas-container").insertAdjacentHTML("beforebegin", `<div class="letterboxed-canvas-background no-floating-footer"></div>`);
					document.querySelector(".applet-canvas-container").insertAdjacentHTML("afterend", `<div class="letterboxed-canvas-background no-floating-footer"></div>`);
					
					document.querySelector(".applet-canvas-container").classList.add("black-background");
					document.querySelector(".applet-canvas-container").classList.add("no-floating-footer");
					
					
					
					this.fullscreen_canvas_resize();
				}
				
				
				
				document.body.style.opacity = 1;
				
				setTimeout(() =>
				{
					this.canvas_is_animating = false;
					
					this.fullscreen_canvas_resize();
				}, 300);
				
				
				
				let elements = document.querySelectorAll(".applet-canvas-container, .letterboxed-canvas-background");
				
				for (let i = 0; i < elements.length; i++)
				{
					elements[i].addEventListener("click", (e) =>
					{
						if (!this.canvas_is_fullscreen)
						{
							return;
						}
						
						e.preventDefault();
						
						let time_diff = Date.now() - this.last_tap_time;
						
						if (time_diff < 300 && time_diff > 50)
						{
							this.switch_canvas_fullscreen();
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
						if (!this.canvas_is_fullscreen)
						{
							return;
						}
						
						e.preventDefault();
					});
					
					
					
					elements[i].addEventListener("touchend", (e) =>
					{
						if (!this.canvas_is_fullscreen)
						{
							return;
						}
						
						e.preventDefault();
						
						let time_diff = Date.now() - this.last_tap_time;
						
						if (time_diff < 300 && time_diff > 50)
						{
							this.switch_canvas_fullscreen();
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
			if (this.canvas_is_animating)
			{
				return;
			}
			
			
			
			this.canvas_is_fullscreen = false;
			
			this.canvas_is_animating = true;
			
			
			
			document.body.style.opacity = 0;
			
			setTimeout(() =>
			{
				document.documentElement.style.overflowY = "visible";
				document.body.style.overflowY = "visible";
				
				
				
				window.scroll(0, this.fullscreen_canvas_old_scroll);
				
				
				
				for (let i = 0; i < this.canvases_to_resize.length; i++)
				{
					this.canvases_to_resize[i].classList.remove("true-fullscreen-canvas");
					this.canvases_to_resize[i].classList.remove("letterboxed-fullscreen-canvas");
					
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
					
					
					
					try {this.canvas_resize_callback();}
					catch(ex) {}
					
					
					
					aos_resize();
				}
				
				document.body.style.opacity = 1;
				
				setTimeout(() =>
				{
					this.canvas_is_animating = false;
				}, 300);
			}, 300);
		}
	},



	fullscreen_canvas_resize: function()
	{
		if (!this.canvas_is_fullscreen)
		{
			return;
		}
		
		
		
		if (aspect_ratio < 1 && !this.canvas_true_fullscreen)
		{
			window.scroll(0, window.scrollY + this.canvases_to_resize[0].getBoundingClientRect().top - (window_height - this.canvases_to_resize[0].offsetHeight) / 2 + 2);
		}
		
		else
		{
			window.scroll(0, window.scrollY + this.canvases_to_resize[0].getBoundingClientRect().top + 2);
		}
		
		this.fullscreen_canvas_locked_scroll = window.scrollY;
		
		
		
		try {this.canvas_resize_callback();}
		catch(ex) {}
		
		
		
		setTimeout(() =>
		{
			if (aspect_ratio < 1 && !this.canvas_true_fullscreen)
			{
				window.scroll(0, window.scrollY + this.canvases_to_resize[0].getBoundingClientRect().top - (window_height - this.canvases_to_resize[0].offsetHeight) / 2 + 2);
			}
			
			else
			{
				window.scroll(0, window.scrollY + this.canvases_to_resize[0].getBoundingClientRect().top + 2);
			}
			
			this.fullscreen_canvas_locked_scroll = window.scrollY;
			
			
			
			try {this.canvas_resize_callback();}
			catch(ex) {}
		}, 500);
	},



	fullscreen_canvas_scroll: function()
	{
		if (!this.canvas_is_fullscreen)
		{
			return;
		}
		
		window.scroll(0, this.fullscreen_canvas_locked_scroll);
	},



	//Makes linked text buttons have the same width and height.
	equalize_text_buttons: function()
	{
		let elements = document.querySelectorAll(".text-button");
		
		for (let i = 0; i < elements.length; i++)
		{
			elements[i].parentNode.style.margin = "0 auto";
		}
		
		
		
		elements = document.querySelectorAll(".linked-text-button");
		
		let heights = [];
		
		let max_height = 0;
		
		let widths = [];
		
		let max_width = 0;
		
		
		
		for (let i = 0; i < elements.length; i++)
		{
			elements[i].style.height = "fit-content";
			elements[i].style.width = "fit-content";
			
			heights.push(elements[i].offsetHeight);
			
			if (heights[i] > max_height)
			{
				max_height = heights[i];
			}
			
			widths.push(elements[i].offsetWidth);
			
			if (widths[i] > max_width)
			{
				max_width = widths[i];
			}
		}
		
		
		
		for (let i = 0; i < elements.length; i++)
		{
			if (heights[i] < max_height)
			{
				elements[i].style.height = max_height + "px";
			}
			
			else
			{
				elements[i].style.height = "fit-content";
			}
			
			
			
			if (widths[i] < max_width)
			{
				elements[i].style.width = max_width + "px";
			}
			
			else
			{
				elements[i].style.width = "fit-content";
			}
		}
	}
}