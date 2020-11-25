let canvas_is_small = true;

//Set when an applet loads to makes its canvases automatically resize.
let applet_canvases_to_resize = [];

let applet_canvas_resize_callback = null;

let max_canvas_size = null;

window.addEventListener("resize", function()
{
	max_canvas_size = Math.min(.8 * window_width, .8 * window_height);
});



function set_up_canvas_resizer()
{
	window.addEventListener("scroll", resize_canvas);
	temporary_handlers["scroll"].push(resize_canvas);
}



function resize_canvas()
{
	let amount_cut_off = applet_canvases_to_resize[0].getBoundingClientRect().top + max_canvas_size - window_height;
	
	
	
	if (amount_cut_off > max_canvas_size * .25 && canvas_is_small === false)
	{
		canvas_is_small = true;
		
		for (let i = 0; i < applet_canvases_to_resize.length; i++)
		{
			applet_canvases_to_resize[i].style.opacity = 0;
			
			setTimeout(function()
			{
				applet_canvases_to_resize[i].style.width = "40vmin";
				applet_canvases_to_resize[i].style.height = "40vmin";
				
				applet_canvases_to_resize[i].style.marginBottom = "40vmin";
				
				applet_canvases_to_resize[i].style.opacity = 1;
				
				try {applet_canvas_resize_callback();}
				catch(ex) {}
			}, 300);
		}
	}
	
	
	
	else if (amount_cut_off < max_canvas_size * .25 && canvas_is_small === true)
	{
		canvas_is_small = false;
		
		for (let i = 0; i < applet_canvases_to_resize.length; i++)
		{
			applet_canvases_to_resize[i].style.opacity = 0;
			
			setTimeout(function()
			{
				applet_canvases_to_resize[i].style.width = "80vmin";
				applet_canvases_to_resize[i].style.height = "80vmin";
				
				applet_canvases_to_resize[i].style.marginBottom = "0";
				
				applet_canvases_to_resize[i].style.opacity = 1;
				
				try {applet_canvas_resize_callback();}
				catch(ex) {}
			}, 300);
		}
	}
}