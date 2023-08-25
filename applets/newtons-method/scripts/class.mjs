import anime from "/scripts/anime.js";
import { changeOpacity } from "/scripts/src/animation.mjs";
import { Applet } from "/scripts/src/applets.mjs";
import { addTemporaryListener } from "/scripts/src/main.mjs";
import { Wilson } from "/scripts/wilson.mjs";

export class NewtonsMethod extends Applet
{
	wilsonHidden = null;
	
	rootSetterElement = null;
	rootAInputElement = null;
	rootBInputElement = null;
	colorSetterElement = null;
	
	a = [1, 0];
	c = [0, 0];
	
	colors = [];
	
	currentRoots = [];
	
	lastActiveRoot = 0;
	
	numRoots = 0;
	
	aspectRatio = 1;
	
	numIterations = 100;
	
	pastBrightnessScales = [];
	
	resolution = 500;
	resolutionHidden = 100;
	
	lastTimestamp = -1;
	
	
	
	constructor(canvas, rootSetterElement, rootAInputElement, rootBInputElement, colorSetterElement)
	{
		super(canvas);
		
		this.rootSetterElement = rootSetterElement;
		this.rootAInputElement = rootAInputElement;
		this.rootBInputElement = rootBInputElement;
		this.colorSetterElement = colorSetterElement;
		
		const hiddenCanvas = this.createHiddenCanvas();
		
		
		
		const fragShaderSource = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform float worldCenterX;
			uniform float worldCenterY;
			uniform float worldSize;
			
			uniform int numRoots;
			
			uniform vec2 roots[11];
			
			uniform vec3 colors[11];
			
			uniform vec2 a;
			uniform vec2 c;
			
			uniform float brightnessScale;
			
			const float derivativePrecision = 6.0;
			
			const float threshhold = .05;
			
			
			
			//Returns z1 * z2.
			vec2 cmul(vec2 z1, vec2 z2)
			{
				return vec2(z1.x * z2.x - z1.y * z2.y, z1.x * z2.y + z1.y * z2.x);
			}
			
			
			
			//Returns 1/z.
			vec2 cinv(vec2 z)
			{
				float magnitude = z.x*z.x + z.y*z.y;
				
				return vec2(z.x / magnitude, -z.y / magnitude);
			}
			
			
			
			//Returns f(z) for a polynomial f with given roots.
			vec2 cpoly(vec2 z)
			{
				vec2 result = vec2(1.0, 0.0);
				
				for (int i = 0; i <= 11; i++)
				{
					if (i == numRoots)
					{
						return result;
					}
					
					result = cmul(result, z - roots[i]);
				}
			}
			
			
			
			//Approximates f'(z) for a polynomial f with given roots.
			vec2 cderiv(vec2 z)
			{
				return derivativePrecision * (cpoly(z + vec2(1.0 / (2.0*derivativePrecision), 0.0)) - cpoly(z - vec2(1.0 / (2.0*derivativePrecision), 0.0)));
			}
			
			
			
			void main(void)
			{
				vec2 z;
				vec2 lastZ = vec2(0.0, 0.0);
				
				if (aspectRatio >= 1.0)
				{
					z = vec2(uv.x * aspectRatio * worldSize + worldCenterX, uv.y * worldSize + worldCenterY);
				}
				
				else
				{
					z = vec2(uv.x * worldSize + worldCenterX, uv.y / aspectRatio * worldSize + worldCenterY);
				}
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				
				
				
				for (int iteration = 0; iteration < 100; iteration++)
				{
					vec2 temp = cmul(cmul(cpoly(z), cinv(cderiv(z))), a) + c;
					
					lastZ = z;
					
					z -= temp;
					
					
					
					for (int i = 0; i <= 11; i++)
					{
						if (i == numRoots)
						{
							break;
						}
						
						float d0 = length(z - roots[i]);
						
						if (d0 < threshhold)
						{
							float d1 = length(lastZ - roots[i]);
							
							float brightnessAdjust = (log(threshhold) - log(d0)) / (log(d1) - log(d0));
							
							float brightness = 1.0 - (float(iteration) - brightnessAdjust) / brightnessScale;
							
							gl_FragColor = vec4(colors[i] * brightness, 1.0);
							
							return;
						}
					}
				}
			}
		`;
	


		const options =
		{
			renderer: "gpu",
			
			shader: fragShaderSource,
			
			canvasWidth: 500,
			canvasHeight: 500,
			
			worldWidth: 3,
			worldHeight: 3,
			worldCenterX: 0,
			worldCenterY: 0,
			
			
			
			useDraggables: true,
			
			draggablesMousemoveCallback: this.onDragDraggable.bind(this),
			draggablesTouchmoveCallback: this.onDragDraggable.bind(this),
			
			draggablesMouseupCallback: this.onReleaseDraggable.bind(this),
			draggablesTouchendCallback: this.onReleaseDraggable.bind(this),
			
			
			
			useFullscreen: true,
			
			trueFullscreen: true,
		
			useFullscreenButton: true,
			
			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			
			switchFullscreenCallback: () => this.changeAspectRatio(true),
			
			
			
			mousedownCallback: this.onGrabCanvas.bind(this),
			touchstartCallback: this.onGrabCanvas.bind(this),
			
			mousedragCallback: this.onDragCanvas.bind(this),
			touchmoveCallback: this.onDragCanvas.bind(this),
			
			mouseupCallback: this.onReleaseCanvas.bind(this),
			touchendCallback: this.onReleaseCanvas.bind(this),
			
			wheelCallback: this.onWheelCanvas.bind(this),
			pinchCallback: this.onPinchCanvas.bind(this)
		};
		
		const optionsHidden =
		{
			renderer: "gpu",
			
			shader: fragShaderSource,
			
			canvasWidth: this.resolutionHidden,
			canvasHeight: this.resolutionHidden
		};
		
		
		
		this.wilson = new Wilson(canvas, options);

		this.wilson.render.initUniforms(["aspectRatio", "worldCenterX", "worldCenterY", "worldSize", "numRoots", "roots", "colors", "a", "c", "brightnessScale"]);
		
		
		
		this.wilsonHidden = new Wilson(hiddenCanvas, optionsHidden);
		
		this.wilsonHidden.render.initUniforms(["aspectRatio", "worldCenterX", "worldCenterY", "worldSize", "numRoots", "roots", "colors", "a", "c", "brightnessScale"]);
		
		
		
		const boundFunction = () => this.changeAspectRatio(true);
		addTemporaryListener({
			object: window,
			event: "resize",
			callback: boundFunction
		});
		
		
		
		let element = this.wilson.draggables.add(1, 0);
		
		element.classList.add("a-marker");
		
		element = this.wilson.draggables.add(0, 0);
		
		element.classList.add("c-marker");
		
		
		
		this.addRoot();
		this.addRoot();
		this.addRoot();
		
		this.spreadRoots(true);
		
		
		
		this.zoom.init();
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatio"], 1);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["aspectRatio"], 1);
		
		this.colors = [216/255, 1/255, 42/255,   255/255, 139/255, 56/255,   249/255, 239/255, 20/255,   27/255, 181/255, 61/255,   0/255, 86/255, 195/255,   154/255, 82/255, 164/255,   32/255, 32/255, 32/255,   155/255, 92/255, 15/255,   182/255, 228/255, 254/255,   250/255, 195/255, 218/255,   255/255, 255/255, 255/255];
		
		this.wilson.gl.uniform3fv(this.wilson.uniforms["colors"], this.colors);
		this.wilsonHidden.gl.uniform3fv(this.wilsonHidden.uniforms["colors"], this.colors);
		
		window.requestAnimationFrame(this.drawFrame.bind(this));
	}
	
	
	
	addRoot()
	{
		if (this.numRoots === 11)
		{
			return;
		}
		
		
		
		const x = Math.random() * 3 - 1.5;
		const y = Math.random() * 3 - 1.5;
		
		this.wilson.draggables.add(x, y);
		
		this.currentRoots.push(x);
		this.currentRoots.push(y);
		
		this.numRoots++;
	}
	
	
	
	removeRoot()
	{
		if (this.numRoots === 1)
		{
			return;
		}
		
		
		this.numRoots--;
		
		this.currentRoots.pop();
		this.currentRoots.pop();
		
		this.wilson.draggables.draggables[this.numRoots + 2].remove();
		
		this.wilson.draggables.draggables.pop();
		this.wilson.draggables.worldCoordinates.pop();
		
		this.wilson.draggables.numDraggables--;
	}
	
	
	
	spreadRoots(noAnimation = false, randomize = false)
	{
		const oldRoots = [...this.currentRoots];
		const newRoots = new Array(2 * this.numRoots);
		
		for (let i = 0; i < this.numRoots; i++)
		{
			const mag = 1 + randomize * .75 * Math.random();
			
			newRoots[2 * i] = mag * Math.cos(2 * Math.PI * i / this.numRoots);
			newRoots[2 * i + 1] = mag * Math.sin(2 * Math.PI * i / this.numRoots);
		}
		
		const dummy = {t: 0};
		
		anime({
			targets: dummy,
			t: 1,
			duration: 1000 * !noAnimation,
			easing: "easeInOutQuad",
			update: () =>
			{
				for (let i = 0; i < this.numRoots; i++)
				{
					this.currentRoots[2 * i] = (1 - dummy.t) * oldRoots[2 * i] + dummy.t * newRoots[2 * i];
					this.currentRoots[2 * i + 1] = (1 - dummy.t) * oldRoots[2 * i + 1] + dummy.t * newRoots[2 * i + 1];
					
					this.wilson.draggables.worldCoordinates[i + 2] = [this.currentRoots[2 * i], this.currentRoots[2 * i + 1]];
				}
			},
			complete: () =>
			{
				for (let i = 0; i < this.numRoots; i++)
				{
					this.currentRoots[2 * i] = newRoots[2 * i];
					this.currentRoots[2 * i + 1] = newRoots[2 * i + 1];
					
					this.wilson.draggables.worldCoordinates[i + 2] = [this.currentRoots[2 * i], this.currentRoots[2 * i + 1]];
				}
			}
		});
	}
	
	
	
	setRoot(x, y)
	{
		if (this.lastActiveRoot === 0)
		{
			this.a[0] = x;
			this.a[1] = y;
			
			this.wilson.draggables.worldCoordinates[0] = [this.a[0], this.a[1]];
		}
		
		
		
		else if (this.lastActiveRoot === 1)
		{
			this.c[0] = x;
			this.c[1] = y;
			
			this.wilson.draggables.worldCoordinates[1] = [this.c[0], this.c[1]];
		}
		
		
		
		else
		{
			this.currentRoots[2 * (this.lastActiveRoot - 2)] = x;
			this.currentRoots[2 * (this.lastActiveRoot - 2) + 1] = y;
			
			this.wilson.draggables.worldCoordinates[this.lastActiveRoot - 2] = [this.currentRoots[2 * (this.lastActiveRoot - 2)], this.currentRoots[2 * (this.lastActiveRoot - 2) + 1]];
		}
		
		
		
		this.wilson.draggables.recalculateLocations();
	}
	
	
	
	setColor(hex)
	{
		if (this.lastActiveRoot < 2)
		{
			return;
		}
		
		const index = this.lastActiveRoot - 2;
			
		const result = this.hexToRgb(hex);
		
		const r = result.r / 255;
		const g = result.g / 255;
		const b = result.b / 255;
		
		result.r = this.colors[3 * index];
		result.g = this.colors[3 * index + 1];
		result.b = this.colors[3 * index + 2];
		
		anime({
			targets: result,
			r: r,
			g: g,
			b: b,
			easing: "easeInOutQuad",
			duration: 250,
			update: () =>
			{
				this.colors[3 * index] = result.r;
				this.colors[3 * index + 1] = result.g;
				this.colors[3 * index + 2] = result.b;
				
				this.wilson.gl.uniform3fv(this.wilson.uniforms["colors"], this.colors);
				this.wilsonHidden.gl.uniform3fv(this.wilsonHidden.uniforms["colors"], this.colors);
			}
		});
	}
	
	
	
	onDragDraggable(activeDraggable, x, y)
	{
		if (activeDraggable === 0)
		{
			this.a = [x, y];
		}
		
		else if (activeDraggable === 1)
		{
			this.c = [x, y];
		}
		
		else
		{
			this.currentRoots[2 * (activeDraggable - 2)] = x;
			this.currentRoots[2 * (activeDraggable - 2) + 1] = y;
		}
	}
	
	
	
	async onReleaseDraggable(activeDraggable)
	{
		this.lastActiveRoot = activeDraggable;
		
		if (this.rootSetterElement && this.colorSetterElement)
		{
			await Promise.all([
				changeOpacity(this.rootSetterElement, 0),
				changeOpacity(this.colorSetterElement, 0)
			]);
			
			if (this.lastActiveRoot === 0)
			{
				this.rootAInputElement.value = Math.round(this.a[0] * 1000) / 1000;
				this.rootBInputElement.value = Math.round(this.a[1] * 1000) / 1000;
			}
			
			else if (this.lastActiveRoot === 1)
			{
				this.rootAInputElement.value = Math.round(this.c[0] * 1000) / 10000;
				this.rootBInputElement.value = Math.round(this.c[1] * 1000) / 10000;
			}
			
			else
			{
				const index = this.lastActiveRoot - 2;
				
				this.rootAInputElement.value = Math.round(this.currentRoots[2 * index] * 1000) / 1000;
				this.rootBInputElement.value = Math.round(this.currentRoots[2 * index + 1] * 1000) / 1000;
				
				this.colorSetterElement.value = this.rgbToHex(this.colors[3 * index] * 255, this.colors[3 * index + 1] * 255, this.colors[3 * index + 2] * 255);
			}
			
			changeOpacity(this.rootSetterElement, 1);
			changeOpacity(this.colorSetterElement, 1);
		}
	}



	drawFrame(timestamp)
	{
		const timeElapsed = timestamp - this.lastTimestamp;
		
		this.lastTimestamp = timestamp;
		
		if (timeElapsed === 0)
		{
			return;
		}
		
		
		
		this.wilson.draggables.recalculateLocations();
		
		this.pan.update();
		this.zoom.update();
		
		
		
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["aspectRatio"], this.aspectRatio);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["worldCenterX"], this.wilson.worldCenterX);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["worldCenterY"], this.wilson.worldCenterY);
		
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["worldSize"], Math.min(this.wilson.worldHeight, this.wilson.worldWidth) / 2);
		
		this.wilsonHidden.gl.uniform1i(this.wilsonHidden.uniforms["numRoots"], this.numRoots);
		
		this.wilsonHidden.gl.uniform2fv(this.wilsonHidden.uniforms["roots"], this.currentRoots);
		
		this.wilsonHidden.gl.uniform2fv(this.wilsonHidden.uniforms["a"], this.a);
		this.wilsonHidden.gl.uniform2f(this.wilsonHidden.uniforms["c"], this.c[0] / 10, this.c[1] / 10);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["brightnessScale"], 30);
		
		this.wilsonHidden.render.drawFrame();
		
		
		
		const pixelData = this.wilsonHidden.render.getPixelData();
		
		const brightnesses = new Array(this.resolutionHidden * this.resolutionHidden);
		
		for (let i = 0; i < this.resolutionHidden * this.resolutionHidden; i++)
		{
			brightnesses[i] = Math.max(Math.max(pixelData[4 * i], pixelData[4 * i + 1]), pixelData[4 * i + 2]);
		}
		
		brightnesses.sort((a, b) => a - b);
		
		let brightnessScale = Math.min(10000 / (brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .96)] + brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .98)]), 200);
		
		this.pastBrightnessScales.push(brightnessScale);
		
		const denom = this.pastBrightnessScales.length;
		
		if (denom > 10)
		{
			this.pastBrightnessScales.shift();
		}
		
		brightnessScale = Math.max(this.pastBrightnessScales.reduce((a, b) => a + b) / denom, .5);
		
		
		
		
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatio"], this.aspectRatio);
		this.wilson.gl.uniform1f(this.wilson.uniforms["worldCenterX"], this.wilson.worldCenterX);
		this.wilson.gl.uniform1f(this.wilson.uniforms["worldCenterY"], this.wilson.worldCenterY);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["worldSize"], Math.min(this.wilson.worldHeight, this.wilson.worldWidth) / 2);
		
		this.wilson.gl.uniform1i(this.wilson.uniforms["numRoots"], this.numRoots);
		
		this.wilson.gl.uniform2fv(this.wilson.uniforms["roots"], this.currentRoots);
		
		this.wilson.gl.uniform2fv(this.wilson.uniforms["a"], this.a);
		this.wilson.gl.uniform2f(this.wilson.uniforms["c"], this.c[0] / 10, this.c[1] / 10);
		this.wilson.gl.uniform1f(this.wilson.uniforms["brightnessScale"], brightnessScale);
		
		this.wilson.render.drawFrame();
		
		
		
		if (!this.animationPaused)
		{
			window.requestAnimationFrame(this.drawFrame.bind(this));
		}
	}
	
	
	
	hexToRgb(hex)
	{
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}
	
	componentToHex(c)
	{
		const hex = Math.floor(c).toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}

	rgbToHex(r, g, b)
	{
		return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
	}
}