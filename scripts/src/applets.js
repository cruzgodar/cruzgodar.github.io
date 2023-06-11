class Applet
{
	canvas;
	wilson;
	
	//Temporary things that should be destroyed when calling Applet.destroy.
	
	workers = [];
	timeoutIds = [];
	refreshIds = [];
	//Every entry is a length-3 array, e.g. [window, "scroll", listenerFunction]
	handlers = [];
	
	animationPaused = false;
	
	
	
	constructor(canvas)
	{
		this.canvas = canvas;
		
		Page.currentApplets.push(this);
	}
	
	
	
	pause()
	{
		this.animationPaused = true;
	}
	
	
	
	resume()
	{
		this.animationPaused = false;
	}
	
	
	
	destroy()
	{
		this.animationPaused = true;
		
		this.workers.forEach(worker =>
		{
			try {worker.terminate()}
			catch(ex) {}
		});
		
		this.timeoutIds.forEach(timeoutId =>
		{
			try {clearTimeout(timeoutId)}
			catch(ex) {}
		});
		
		this.refreshIds.forEach(refreshId =>
		{
			try {clearTimeout(refreshId)}
			catch(ex) {}
		});
		
		this.handlers.forEach(handler =>
		{
			try {handler[0].removeEventListener(handler[1], handler[2])}
			catch(ex) {}
		});
		
		try {this.hiddenCanvasContainer.remove()}
		catch(ex) {}
		
		if (DEBUG)
		{
			console.log(`Destroyed an applet of type ${this.constructor.name}`)
		}
	}
	
	
	
	pauseWhenOffscreen()
	{
		const onScroll = () =>
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
		
		window.addEventListener("scroll", onScroll);
		this.handlers.push([window, "scroll", onScroll]);
		
		onScroll();
	}
	
	
	
	hiddenCanvasContainer = null;
	
	createHiddenCanvas()
	{
		const hiddenCanvas = document.createElement("canvas");
		hiddenCanvas.classList.add("hidden-canvas");
		
		if (this.hiddenCanvasContainer === null)
		{
			this.hiddenCanvasContainer = document.createElement("div");
			this.hiddenCanvasContainer.style.display = "none";
			Page.element.appendChild(this.hiddenCanvasContainer);
		}
		
		this.hiddenCanvasContainer.appendChild(hiddenCanvas);
		
		return hiddenCanvas;
	}
	
	
	
	//Turns expressions like 2(3x^2+1) into something equivalent to 2.0 * (3.0 * pow(x, 2.0) + 1.0).
	static parseNaturalGLSL(GLSL)
	{
		let newGLSL = GLSL.replaceAll(/\s/g, ""); //Remove spaces
		
		while (newGLSL.match(/([^\.0-9])([0-9]+)([^\.0-9])/g))
		{
			newGLSL = newGLSL.replaceAll(/([^\.0-9])([0-9]+)([^\.0-9])/g, (match, $1, $2, $3) => `${$1}${$2}.0${$3}`); //Convert ints to floats
		}
		
		newGLSL = newGLSL.replaceAll(/([^0-9])(\.[0-9])/g, (match, $1, $2) => `${$1}0${$2}`) //Lead decimals with zeros
		.replaceAll(/([0-9]\.)([^0-9])/g, (match, $1, $2) => `${$1}0${$2}`) //End decimals with zeros
		.replaceAll(/([0-9\)])([a-z\(])/g, (match, $1, $2) => `${$1} * ${$2}`); //Juxtaposition to multiplication
		
		while (newGLSL.match(/([xyz])([xyz])/g))
		{
			newGLSL = newGLSL.replaceAll(/([xyz])([xyz])/g, (match, $1, $2) => `${$1} * ${$2}`); //Particular juxtaposition to multiplication
		}
		
		return newGLSL.replaceAll(/([a-z0-9\.]+)\^([a-z0-9\.]+)/g, (match, $1, $2) => `pow(${$1}, ${$2})`); //Carats to power
	}
	
	
	
	static doubleToDf(d)
	{
		let df = new Float32Array(2);
		const split = (1 << 29) + 1;
		
		let a = d * split;
		let hi = a - (a - d);
		let lo = d - hi;
		
		df[0] = hi;
		df[1] = lo;
		
		return [df[0], df[1]];
	}
}



Page.currentApplets = [];

Site.loadedApplets = [];



Site.loadApplet = function(id)
{
	return new Promise(async (resolve, reject) =>
	{
		if (Site.loadedApplets.includes(id))
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
			
			await Site.loadScript(`/applets/${id}/scripts/class.${DEBUG ? "" : "min."}js`);
			
			Site.loadedApplets.push(id);
		}
		
		resolve();
	});
};