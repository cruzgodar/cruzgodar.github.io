export class Applet
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
		
		Applet.current.push(this);
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
		
		console.log(`Destroyed an applet of type ${this.constructor.name}`)
	}
	
	
	
	listenToInputElements(elements, run)
	{
		elements.forEach(element =>
		{
			element.addEventListener("keydown", (e) =>
			{
				if (e.keyCode === 13)
				{
					e.preventDefault();
					run();
				}
			});
		});
	}
	
	
	
	uncapEverything = false;
	
	//Adds a friendly cap on these inputs: if a higher number is entered, the whole thing turns red and a the label turns into a modal with an option to remove the limit.
	setInputCaps(elements, caps)
	{
		elements.forEach((element, index) =>
		{
			const cap = caps[index];
			
			
			
			//Find the words on the last line.
			const words = element.nextElementSibling.innerHTML.split(" ");
			
			const wordElement = document.createElement("p");
			wordElement.classList.add("body-text");
			wordElement.style.position = "fixed";
			wordElement.style.opacity = 0;
			wordElement.style.top = "-100vh";
			wordElement.style.width = "fit-content";
			wordElement.textContent = "";
			Page.element.appendChild(wordElement);
			
			
			
			let startIndex = 0;
			
			for (let i = 0; i < words.length; i++)
			{
				wordElement.textContent = `${wordElement.textContent}${i === startIndex ? "" : " "}${words[i]}`;
				
				const width = wordElement.getBoundingClientRect().width;
				
				if (width >= 100)
				{
					startIndex = i;
					i--;
					wordElement.textContent = "";
				}
			}
			
			wordElement.remove();
			
			element.nextElementSibling.innerHTML = `<span>${words.slice(0, startIndex).join(" ")}</span>${startIndex !== 0 ? " " : ""}<span style="white-space: nowrap">${words.slice(startIndex).join(" ")}<span class="triangle">&#x25BC;</span></span>`;
			
			
			element.addEventListener("input", () =>
			{
				const value = parseFloat(element.value);
				
				if (value > cap && !this.uncapEverything)
				{
					element.value = cap;
					
					element.parentNode.classList.add("capped-input");
				}
				
				else
				{
					element.parentNode.classList.remove("capped-input");
				}
			});
			
			element.nextElementSibling.addEventListener("click", () =>
			{
				if (element.parentNode.classList.contains("capped-input"))
				{
					this.hideCapDialogs();
					
					this.showCapDialog(element);
				}
			});
		});
		
		
		
		const listener = (e) =>
		{
			if (!(e.target.classList.contains("keep-dialog-open")))
			{
				this.hideCapDialogs();
			}
		};
		
		const boundFunction = listener.bind(this);
		document.documentElement.addEventListener("pointerdown", boundFunction);
		this.handlers.push([document.documentElement, "pointerdown", boundFunction]);
	}
	
	showCapDialog(element)
	{
		const dialog = document.createElement("div");
		
		dialog.classList.add("input-cap-dialog");
		dialog.classList.add("keep-dialog-open");
		
		dialog.style.opacity = 0;
		dialog.style.transform = "scale(1)";
		
		dialog.innerHTML = `Higher values than this may take an extremely long time to compute, cause substantial lag, or crash the tab or entire browser. Only continue if you know what you&#x2019;re doing!
		<div class="checkbox-row keep-dialog-open">
			<div class="checkbox-container click-on-child keep-dialog-open">
				<input type="checkbox" class="uncap-inputs-checkbox keep-dialog-open"/>
				<div class="checkbox keep-dialog-open"></div>
			</div>
			<div style="margin-left: 10px" class="keep-dialog-open">
				<p class="body-text checkbox-subtext keep-dialog-open">Uncap all inputs</p>
			</div>
		</div>`;
		
		Page.element.appendChild(dialog);
		
		
		
		const boundFunction = () => this.updateCapDialogLocation(element, dialog);
		window.addEventListener("resize", boundFunction);
		this.handlers.push([window, "resize", boundFunction]);
		boundFunction();
		
		dialog.style.transform = "scale(.95)";
		
		
		
		setTimeout(() =>
		{
			const checkboxElement = dialog.querySelector(".uncap-inputs-checkbox");
			
			checkboxElement.checked = this.uncapEverything;
			
			checkboxElement.addEventListener("input", () =>
			{
				this.uncapEverything = checkboxElement.checked;
				
				if (this.uncapEverything)
				{
					$$(".capped-input").forEach(cappedInputElement => cappedInputElement.classList.remove("capped-input"));
				}
			});
			
			Page.Load.HoverEvents.addWithScale(checkboxElement.parentNode, 1.1);
			
			anime({
				targets: dialog,
				opacity: 1,
				scale: 1,
				duration: 250,
				easing: "easeOutQuad"
			});
		}, 16);
	}
	
	hideCapDialogs()
	{
		try
		{
			const dialogs = $$(".input-cap-dialog");
			
			anime({
				targets: dialogs,
				opacity: 0,
				scale: .95,
				duration: 250,
				easing: "easeOutQuad",
				complete: () =>
				{
					dialogs.forEach(dialog => dialog.remove())
				}
			});
		}
		
		catch(ex) {}
	}
	
	updateCapDialogLocation(element, dialog)
	{
		try
		{
			const rect = element.nextElementSibling.getBoundingClientRect();
			const dialogRect = dialog.getBoundingClientRect();
			
			dialog.style.top = `${window.scrollY + rect.top + rect.height + 4}px`;
			
			dialog.style.left = `${Math.min(Math.max(rect.left - (dialogRect.width + 12 - rect.width) / 2, 12), window.innerWidth - 12 - dialogRect.width)}px`;
		}
		
		catch(ex) {}
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
	
	
	onGrabCanvas(x, y, event)
	{
		this.pan.onGrabCanvas();
		this.zoom.onGrabCanvas();
	}
	
	
	
	onDragCanvas(x, y, xDelta, yDelta, event)
	{
		this.pan.onDragCanvas(x, y, xDelta, yDelta);
	}
	
	
	
	onReleaseCanvas(x, y, event)
	{
		this.pan.onReleaseCanvas();
		this.zoom.onReleaseCanvas();
	}
	
	
	
	onWheelCanvas(x, y, scrollAmount, event)
	{
		this.zoom.onWheelCanvas(x, y, scrollAmount);
	}
	
	
	
	onPinchCanvas(x, y, touchDistanceDelta, event)
	{
		this.zoom.onPinchCanvas(x, y, touchDistanceDelta);
	}
	
	
	
	changeAspectRatio(useZoomLevel = false, wilsons = [this.wilson])
	{
		wilsons.forEach(wilson =>
		{
			if (wilson.fullscreen.currentlyFullscreen)
			{
				this.aspectRatio = window.innerWidth / window.innerHeight;
				
				if (this.aspectRatio >= 1)
				{
					wilson.changeCanvasSize(this.resolution, Math.floor(this.resolution / this.aspectRatio));
					
					if (useZoomLevel)
					{
						wilson.worldWidth = 3 * Math.pow(2, this.zoom.level) * this.aspectRatio;
						wilson.worldHeight = 3 * Math.pow(2, this.zoom.level);
					}
				}
				
				else
				{
					wilson.changeCanvasSize(Math.floor(this.resolution * this.aspectRatio), this.resolution);
					
					if (useZoomLevel)
					{
						wilson.worldWidth = 3 * Math.pow(2, this.zoom.level);
						wilson.worldHeight = 3 * Math.pow(2, this.zoom.level) / this.aspectRatio;
					}
				}
			}
			
			else
			{
				this.aspectRatio = 1;
				
				wilson.changeCanvasSize(this.resolution, this.resolution);
				
				if (useZoomLevel)
				{
					wilson.worldWidth = 3 * Math.pow(2, this.zoom.level);
					wilson.worldHeight = 3 * Math.pow(2, this.zoom.level);
				}
			}
		});
		
		if (useZoomLevel)
		{
			this.zoom.clamp();
		}
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
			this.level = Math.log2(Math.min(this.parent.wilson.worldWidth, this.parent.wilson.worldHeight) / 3);
		},
		
		clamp: function()
		{
			const aspectRatio = this.parent.wilson.worldWidth / this.parent.wilson.worldHeight;
			
			if (this.parent.wilson.worldWidth > this.parent.pan.maxX - this.parent.pan.minX)
			{
				this.parent.wilson.worldWidth = this.parent.pan.maxX - this.parent.pan.minX;
				
				this.parent.wilson.worldHeight = this.parent.wilson.worldWidth / aspectRatio;
				
				this.level = Math.log2(Math.min(this.parent.wilson.worldWidth, this.parent.wilson.worldHeight) / 3);
			}
			
			if (this.parent.wilson.worldHeight > this.parent.pan.maxY - this.parent.pan.minY)
			{
				this.parent.wilson.worldHeight = this.parent.pan.maxY - this.parent.pan.minY;
				
				this.parent.wilson.worldWidth = this.parent.wilson.worldHeight * aspectRatio;
				
				this.level = Math.log2(Math.min(this.parent.wilson.worldWidth, this.parent.wilson.worldHeight) / 3);
			}
			
			this.level = Math.max(this.level, this.minLevel);

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
			
			this.clamp();
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
				
				this.zoomCanvas();
				
				this.velocity *= this.friction;
			}
			
			try {this.parent.wilson.draggables.recalculateLocations()}
			catch(ex) {}
		}
	}
	
	
	
	static current = [];
		
	
	
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