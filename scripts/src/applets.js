let canvas_is_fullscreen = false;

let canvas_is_animating = false;

//Set when an applet loads to makes its canvases automatically resize.
let applet_canvases_to_resize = [];

//True to fill the entire screen (which will strech the aspect ratio unless there's specific code to account for that, and false to letterbox.
let applet_canvas_true_fullscreen = false;

let applet_canvas_resize_callback = null;

let last_tap_time = 0;

let fullscreen_canvas_timeout_id = null;

let fullscreen_canvas_old_scroll = 0;



function set_up_canvas_resizer()
{
	for (let i = 0; i < applet_canvases_to_resize.length; i++)
	{
		applet_canvases_to_resize[i].addEventListener("click", function()
		{
			if (Date.now() - last_tap_time < 500)
			{
				switch_canvas_fullscreen();
			}
			
			last_tap_time = Date.now();
			
			document.body.style.userSelect = "none";
			document.body.style.WebkitUserSelect = "none";
			
			setTimeout(function()
			{
				document.body.style.userSelect = "auto";
				document.body.style.WebkitUserSelect = "auto";
			}, 500);
		});
	}
}



function switch_canvas_fullscreen()
{
	if (!canvas_is_fullscreen)
	{
		if (canvas_is_animating)
		{
			return;
		}
		
		
		
		canvas_is_fullscreen = true;
		
		canvas_is_animating = true;
		
		
		
		document.body.style.opacity = 0;
		
		setTimeout(function()
		{
			document.documentElement.style.overflowY = "hidden";
			document.body.style.overflowY = "hidden";
			
			fullscreen_canvas_old_scroll = window.scrollY;
			
			
			
			if (applet_canvas_true_fullscreen)
			{
				for (let i = 0; i < applet_canvases_to_resize.length; i++)
				{
					applet_canvases_to_resize[i].classList.add("true-fullscreen-canvas");
					
					try {applet_canvas_resize_callback();}
					catch(ex) {}
					
					aos_resize();
				}
				
				window.scroll(0, window.scrollY + applet_canvases_to_resize[0].getBoundingClientRect().top);
			}
			
			
			
			else
			{
				for (let i = 0; i < applet_canvases_to_resize.length; i++)
				{
					applet_canvases_to_resize[i].classList.add("letterboxed-fullscreen-canvas");
					
					try {applet_canvas_resize_callback();}
					catch(ex) {}
					
					aos_resize();
				}
				
				
				
				if (aspect_ratio < 1)
				{
					document.querySelector(".applet-canvas-container").insertAdjacentHTML("beforebegin", `<div class="letterboxed-canvas-background"></div>`);
					document.querySelector(".applet-canvas-container").insertAdjacentHTML("afterend", `<div class="letterboxed-canvas-background"></div>`);
					
					window.scroll(0, window.scrollY + applet_canvases_to_resize[0].getBoundingClientRect().top - (window_height - applet_canvases_to_resize[0].offsetHeight) / 2);
				}
				
				else
				{
					window.scroll(0, window.scrollY + applet_canvases_to_resize[0].getBoundingClientRect().top);
					
					document.querySelector(".applet-canvas-container").classList.add("black-background");
				}
			}
			
			
			
			document.body.style.opacity = 1;
			
			setTimeout(function()
			{
				canvas_is_animating = false;
			}, 300);
		}, 300);
	}
	
	
	
	else
	{
		if (canvas_is_animating)
		{
			return;
		}
		
		
		
		canvas_is_fullscreen = false;
		
		canvas_is_animating = true;
		
		
		
		document.body.style.opacity = 0;
		
		setTimeout(function()
		{
			document.documentElement.style.overflowY = "visible";
			document.body.style.overflowY = "visible";
			
			
			
			window.scroll(0, fullscreen_canvas_old_scroll);
			
			
			
			for (let i = 0; i < applet_canvases_to_resize.length; i++)
			{
				applet_canvases_to_resize[i].classList.remove("true-fullscreen-canvas");
				applet_canvases_to_resize[i].classList.remove("letterboxed-fullscreen-canvas");
				
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
				
				
				
				try {applet_canvas_resize_callback();}
				catch(ex) {}
				
				
				
				aos_resize();
			}
			
			document.body.style.opacity = 1;
			
			setTimeout(function()
			{
				canvas_is_animating = false;
			}, 300);
		}, 300);
	}
}