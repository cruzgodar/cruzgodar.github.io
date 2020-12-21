let canvas_is_fullscreen = false;

let canvas_is_animating = false;

//Set when an applet loads to makes its canvases automatically resize.
let applet_canvases_to_resize = [];

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
			
			fullscreen_canvas_old_scroll = window.scrollY;
			
			window.scroll(0, window.scrollY + applet_canvases_to_resize[0].getBoundingClientRect().top);
			
			for (let i = 0; i < applet_canvases_to_resize.length; i++)
			{
				applet_canvases_to_resize[i].classList.add("fullscreen-canvas");
				
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
			
			window.scroll(0, fullscreen_canvas_old_scroll);
			
			for (let i = 0; i < applet_canvases_to_resize.length; i++)
			{
				applet_canvases_to_resize[i].classList.remove("fullscreen-canvas");
				
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