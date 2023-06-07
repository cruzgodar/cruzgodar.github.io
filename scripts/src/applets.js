class Applet
{
	canvas;
	wilson;
	
	//Temporary things that should be destroyed when calling Applet.destroy.
	
	workers = [];
	timeout_ids = [];
	refresh_ids = [];
	//Every entry is a length-3 array, e.g. [window, "scroll", listener_function]
	handlers = [];
	hidden_canvases = [];
	
	animation_paused = false;
	
	
	
	constructor(canvas)
	{
		this.canvas = canvas;
		
		Page.current_applets.push(this);
	}
	
	
	
	pause()
	{
		this.animation_paused = true;
	}
	
	
	
	resume()
	{
		this.animation_paused = false;
	}
	
	
	
	destroy()
	{
		this.animation_paused = true;
		
		this.workers.forEach(worker =>
		{
			try {worker.terminate()}
			catch(ex) {}
		});
		
		this.timeout_ids.forEach(timeout_id =>
		{
			try {clearTimeout(timeout_id)}
			catch(ex) {}
		});
		
		this.refresh_ids.forEach(refresh_id =>
		{
			try {clearTimeout(refresh_id)}
			catch(ex) {}
		});
		
		this.handlers.forEach(handler =>
		{
			try {handler[0].removeEventListener(handler[1], handler[2])}
			catch(ex) {}
		});
		
		this.hidden_canvases.forEach(hidden_canvas =>
		{
			try {hidden_canvas.remove()}
			catch(ex) {}
		});
		
		if (DEBUG)
		{
			console.log(`Destroyed an applet of type ${this.constructor.name}`)
		}
	}
	
	
	
	pause_when_offscreen()
	{
		const on_scroll = () =>
		{
			const rect = this.canvas.getBoundingClientRect(); 
			const top = rect.top;
			const height = rect.height;
			
			if (top >= -height && top < window.innerHeight)
			{
				this.resume();
			}
			
			else
			{
				this.pause();
			}
		};
		
		window.addEventListener("scroll", on_scroll);
		this.handlers.push([window, "scroll", on_scroll]);
		
		on_scroll();
	}
}



Page.current_applets = [];

Site.loaded_applets = [];



Site.load_applet = function(id)
{
	return new Promise(async (resolve, reject) =>
	{
		if (Site.loaded_applets.includes(id))
		{
			if (DEBUG)
			{
				console.log(`Refusing to load duplicate ${id}`);
			}
		}
		
		else
		{
			if (DEBUG)
			{
				console.log(`Loading ${id}`);
			}
			
			await Site.load_script(`/applets/${id}/scripts/class.${DEBUG ? "" : "min."}js`);
			
			Site.loaded_applets.push(id);
		}
		
		resolve();
	});
};