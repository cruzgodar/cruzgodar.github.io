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
		
		this.pan.parent = this;
		this.zoom.parent = this;
		
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
	
	
	
	pan =
	{
		parent: null,
		
		frame: 0,
		
		minX: -Infinity,
		maxX: Infinity,
		minY: -Infinity,
		maxY: Infinity,
		
		velocityX: 0,
		velocityY: 0,
		nextVelocityX: 0,
		nextVelocityY: 0,
		velocityListLength: 4,
		lastVelocitiesX: new Array(this.velocityListLength),
		lastVelocitiesY: new Array(this.velocityListLength),
		
		friction: .91,
		velocityStartThreshhold: .005,
		velocityStopThreshhold: .0005,
		
		clamp: function()
		{
			this.parent.wilson.worldCenterX = Math.min(Math.max(this.parent.wilson.worldCenterX, this.minX + this.parent.wilson.worldWidth / 2), this.maxX - this.parent.wilson.worldWidth / 2);
			this.parent.wilson.worldCenterY = Math.min(Math.max(this.parent.wilson.worldCenterY, this.minY + this.parent.wilson.worldHeight / 2), this.maxY - this.parent.wilson.worldHeight / 2);
		},
		
		onGrabCanvas: function()
		{
			this.velocityX = 0;
			this.velocityY = 0;
			
			for (let i = 0; i < this.velocityListLength; i++)
			{
				this.lastVelocitiesX[i] = 0;
				this.lastVelocitiesY[i] = 0;
			}
			
			this.frame = 0;
		},
		
		onDragCanvas: function(x, y, xDelta, yDelta)
		{
			this.parent.wilson.worldCenterX -= xDelta;
			this.parent.wilson.worldCenterY -= yDelta;
			
			this.clamp();
			
			this.nextVelocityX = -xDelta / this.parent.wilson.worldWidth;
			this.nextVelocityY = -yDelta / this.parent.wilson.worldHeight;
		},
		
		onReleaseCanvas: function()
		{
			//Find the max absolute value.
			for (let i = 0; i < this.velocityListLength; i++)
			{
				if (Math.abs(this.lastVelocitiesX[i]) > Math.abs(this.velocityX))
				{
					this.velocityX = this.lastVelocitiesX[i];
				}
				
				if (Math.abs(this.lastVelocitiesY[i]) > Math.abs(this.velocityY))
				{
					this.velocityY = this.lastVelocitiesY[i];
				}
			}
			
			const magnitude = this.velocityX * this.velocityX + this.velocityY * this.velocityY;
			
			if (magnitude < this.velocityStartThreshhold * this.velocityStartThreshhold)
			{
				this.velocityX = 0;
				this.velocityY = 0;
				this.nextVelocityX = 0;
				this.nextVelocityY = 0;
				
				for (let i = 0; i < this.velocityListLength; i++)
				{
					this.lastVelocitiesX[i] = 0;
					this.lastVelocitiesY[i] = 0;
				}
			}
		},
		
		//Call this in the drawFrame loop.
		update: function()
		{
			this.lastVelocitiesX[this.frame] = this.nextVelocityX;
			this.lastVelocitiesY[this.frame] = this.nextVelocityY;
			
			this.frame = (this.frame + 1) % this.velocityListLength;
			
			//This ensures that velocities don't get double-counted.
			this.nextVelocityX = 0;
			this.nextVelocityY = 0;
			
			const magnitude = this.velocityX * this.velocityX + this.velocityY * this.velocityY;
			
			if (magnitude < this.velocityStopThreshhold * this.velocityStopThreshhold)
			{
				this.velocityX = 0;
				this.velocityY = 0;
			}
			
			else
			{
				this.parent.wilson.worldCenterX += this.velocityX * this.parent.wilson.worldWidth;
				this.parent.wilson.worldCenterY += this.velocityY * this.parent.wilson.worldHeight;
				
				this.clamp();
				
				this.velocityX *= this.friction;
				this.velocityY *= this.friction;
			}
			
			try {this.parent.wilson.draggables.recalculateLocations()}
			catch(ex) {}
		}
	}
	
	
	
	zoom =
	{
		parent: null,
		frame: 0,
		
		pinchMultiplier: 9,
		
		level: 0,
		minLevel: -Infinity,
		
		fixedPointX: 0,
		fixedPointY: 0,
		
		velocity: 0,
		nextVelocity: 0,
		velocityListLength: 4,
		lastVelocities: new Array(this.velocityListLength),
		
		friction: .88,
		velocityStartThreshhold: .001,
		velocityStopThreshhold: .001,
		
		init: function()
		{
			this.level = Math.log2(Math.max(this.parent.wilson.worldWidth, this.parent.wilson.worldHeight) / 3);
		},
		
		clamp: function()
		{
			const width = Math.max(this.parent.pan.maxX - this.parent.pan.minX, this.parent.pan.maxY - this.parent.pan.minY);
			
			const maxLevel = Math.log2(width / 3);
			
			this.level = Math.min(Math.max(this.level, this.minLevel), maxLevel);
			
			this.parent.pan.clamp();
		},
		
		onGrabCanvas: function()
		{
			this.velocity = 0;
			
			for (let i = 0; i < this.velocityListLength; i++)
			{
				this.lastVelocities[i] = 0;
			}
			
			this.frame = 0;
		},
		
		onWheelCanvas: function(x, y, scrollAmount)
		{
			this.fixedPointX = x;
			this.fixedPointY = y;
			
			if (Math.abs(scrollAmount / 100) < .3)
			{
				this.level += scrollAmount / 100;
				this.clamp();
			}
			
			else
			{
				this.velocity += Math.sign(scrollAmount) * .085;
			}
			
			this.zoomCanvas();
		},
		
		onDragCanvas: function(x, y, xDelta, yDelta)
		{
			this.parent.wilson.worldCenterX -= xDelta;
			this.parent.wilson.worldCenterY -= yDelta;
			
			this.nextVelocityX = -xDelta / this.parent.wilson.worldWidth;
			this.nextVelocityY = -yDelta / this.parent.wilson.worldHeight;
		},
		
		onPinchCanvas: function(x, y, touchDistanceDelta, event)
		{
			if (this.parent.wilson.worldWidth >= this.parent.wilson.worldHeight)
			{
				this.level -= touchDistanceDelta / this.parent.wilson.worldWidth * this.pinchMultiplier;
				this.clamp();
				
				this.nextVelocity = -touchDistanceDelta / this.parent.wilson.worldWidth * this.pinchMultiplier;
			}
			
			else
			{
				this.level -= touchDistanceDelta / this.parent.wilson.worldHeight * this.pinchMultiplier;
				this.clamp();
				
				this.nextVelocity = -touchDistanceDelta / this.parent.wilson.worldHeight * this.pinchMultiplier;
			}
			
			this.fixedPointX = x;
			this.fixedPointY = y;
			
			this.zoomCanvas();
		},
		
		onReleaseCanvas: function()
		{
			//Find the max absolute value.
			for (let i = 0; i < this.velocityListLength; i++)
			{
				if (Math.abs(this.lastVelocities[i]) > Math.abs(this.velocity))
				{
					this.velocity = this.lastVelocities[i];
				}
			}
			
			if (Math.abs(this.velocity) < this.velocityStartThreshhold)
			{
				this.velocity = 0;
				this.nextVelocity = 0;
				
				for (let i = 0; i < this.velocityListLength; i++)
				{
					this.lastVelocities[i] = 0;
				}
			}
		},
		
		zoomCanvas: function()
		{
			const aspectRatio = this.parent.wilson.worldWidth / this.parent.wilson.worldHeight;
			
			if (aspectRatio >= 1)
			{
				const newWorldCenter = this.parent.wilson.input.getZoomedWorldCenter(this.fixedPointX, this.fixedPointY, 3 * Math.pow(2, this.level) * aspectRatio, 3 * Math.pow(2, this.level));
				
				this.parent.wilson.worldWidth = 3 * Math.pow(2, this.level) * aspectRatio;
				this.parent.wilson.worldHeight = 3 * Math.pow(2, this.level);
				
				this.parent.wilson.worldCenterX = newWorldCenter[0];
				this.parent.wilson.worldCenterY = newWorldCenter[1];
			}
			
			else
			{
				const newWorldCenter = this.parent.wilson.input.getZoomedWorldCenter(this.fixedPointX, this.fixedPointY, 3 * Math.pow(2, this.level), 3 * Math.pow(2, this.level) / aspectRatio);
				
				this.parent.wilson.worldWidth = 3 * Math.pow(2, this.level);
				this.parent.wilson.worldHeight = 3 * Math.pow(2, this.level) / aspectRatio;
				
				this.parent.wilson.worldCenterX = newWorldCenter[0];
				this.parent.wilson.worldCenterY = newWorldCenter[1];
			}
		},
		
		//Call this in the drawFrame loop.
		update: function()
		{
			this.lastVelocities[this.frame] = this.nextVelocity;
			
			this.frame = (this.frame + 1) % this.velocityListLength;
			
			//This ensures that velocities don't get double-counted.
			this.nextVelocity = 0;
			
			const magnitude = this.velocityX * this.velocityX + this.velocityY * this.velocityY;
			
			if (Math.abs(this.velocity) < this.velocityStopThreshhold)
			{
				this.velocity = 0;
			}
			
			else
			{
				this.level += this.velocity;
				this.clamp();
				
				this.zoomCanvas();
				
				this.velocity *= this.friction;
			}
			
			try {this.parent.wilson.draggables.recalculateLocations()}
			catch(ex) {}
		}
	}
	
	
	
	
		/*
		fixedPointX: 0;
		fixedPointY: 0;
		
		
		lastZoomVelocities = [0, 0, 0, 0];
		
		
		zoomVelocity = 0;
		
		panFriction = .95;
		panVelocityStartThreshhold = .005;
		panVelocityStopThreshhold = .0005;
		
		zoomFriction = .93;
		zoomVelocityStartThreshhold = .01;
		zoomVelocityStopThreshhold = .001;
		*/
	
	
	
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