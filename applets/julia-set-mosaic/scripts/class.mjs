import { Applet } from "/scripts/src/applets.mjs"
import { addTemporaryListener } from "/scripts/src/main.mjs";

export class JuliaSetMosaic extends Applet
{
	wilsonHidden = null;
	
	aspectRatio = 1;
	
	numIterations = 100;
	
	exposure = 1;
	
	zoomLevel = 0;
	
	pastBrightnessScales = [];
	
	a = 0;
	b = 0;
	
	resolution = 500;
	resolutionHidden = 50;
	
	lastTimestamp = -1;
	
	
	
	constructor(canvas)
	{
		super(canvas);
		
		const hiddenCanvas = this.createHiddenCanvas();
		
		
		
		this.pan.minX = -2.75;
		this.pan.maxX = 1.25;
		this.pan.minY = -2;
		this.pan.maxY = 2;
		
		
		
		const tempShader = "precision highp float; varying vec2 uv; void main(void) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }";
		
		const options =
		{
			renderer: "gpu",
			
			shader: tempShader,
			
			canvasWidth: this.resolution,
			canvasHeight: this.resolution,
			
			worldCenterX: -.75,
			worldCenterY: 0,
			
			
			
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
		
		this.wilson = new Wilson(canvas, options);
		
		const optionsHidden =
		{
			renderer: "gpu",
			
			shader: tempShader,
			
			canvasWidth: this.resolutionHidden,
			canvasHeight: this.resolutionHidden
		};
		
		this.wilsonHidden = new Wilson(hiddenCanvas, optionsHidden);
		
		
		
		this.zoom.init();
		
		
		
		const boundFunction = () => this.changeAspectRatio(true);
		addTemporaryListener({
			object: window,
			event: "resize",
			callback: boundFunction
		});
	}
	
	
	
	run(resolution = 1000, setDensity = 10, exposure = 1, numIterations = 100)
	{
		this.resolution = resolution;
		
		this.wilson.changeCanvasSize(this.resolution, this.resolution);
		
		this.setDensity = setDensity;
		this.exposure = exposure;
		this.numIterations = numIterations;
		
		
		
		const fragShaderSource = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float setDensity;
			
			uniform float aspectRatio;
			
			uniform float worldCenterX;
			uniform float worldCenterY;
			uniform float worldSize;
			
			uniform float a;
			uniform float b;
			uniform float exposure;
			uniform int numIterations;
			uniform float brightnessScale;
			
			
			
			void main(void)
			{
				vec2 z;
				
				if (aspectRatio >= 1.0)
				{
					z = vec2(uv.x * aspectRatio * worldSize + worldCenterX, uv.y * worldSize + worldCenterY);
				}
				
				else
				{
					z = vec2(uv.x * worldSize + worldCenterX, uv.y / aspectRatio * worldSize + worldCenterY);
				}
				
				vec3 color = normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				float brightness = exp(-length(z));
				
				
				
				vec2 c = floor(z * setDensity) / setDensity;
				z = (mod(z, 1.0 / setDensity) * setDensity - vec2(.5, .5)) * 3.0;
				
				for (int iteration = 0; iteration < 3001; iteration++)
				{
					if (iteration == numIterations)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						return;
					}
					
					if (length(z) >= 1000.0)
					{
						break;
					}
					
					z = vec2(z.x * z.x - z.y * z.y + c.x, 2.0 * z.x * z.y + c.y);
					
					brightness += exp(-length(z));
				}
				
				
				gl_FragColor = vec4(brightness / brightnessScale * exposure * color, 1.0);
			}
		`;
		
		
		
		this.wilson.render.shaderPrograms = [];
		this.wilson.render.loadNewShader(fragShaderSource);
		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]);
		this.wilson.render.initUniforms(["setDensity", "aspectRatio", "worldCenterX", "worldCenterY", "worldSize", "a", "b", "exposure", "numIterations", "brightnessScale"]);
		this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatio"], 1);
		
		this.wilsonHidden.render.shaderPrograms = [];
		this.wilsonHidden.render.loadNewShader(fragShaderSource);
		this.wilsonHidden.gl.useProgram(this.wilsonHidden.render.shaderPrograms[0]);
		this.wilsonHidden.render.initUniforms(["setDensity", "aspectRatio", "worldCenterX", "worldCenterY", "worldSize", "a", "b", "exposure", "numIterations", "brightnessScale"]);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["aspectRatio"], 1);
		
		this.wilson.worldWidth = 4;
		this.wilson.worldHeight = 4;
		this.wilson.worldCenterX = -.75;
		this.wilson.worldCenterY = 0;
		
		this.juliaMode = 0;
		this.zoom.level = 0;
		
		this.pastBrightnessScales = [];
		
		
		
		//Render the inital frame.
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["aspectRatio"], 1);
		
		window.requestAnimationFrame(this.drawFrame.bind(this));
	}



	drawFrame(timestamp)
	{
		const timeElapsed = timestamp - this.lastTimestamp;
		
		this.lastTimestamp = timestamp;
		
		if (timeElapsed === 0)
		{
			return;
		}
		
		
		
		this.pan.update();
		this.zoom.update();
		
		
		
		this.numIterations = (-this.zoomLevel * 30) + 200;
		
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["setDensity"], this.setDensity);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["worldCenterX"], this.wilson.worldCenterX);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["worldCenterY"], this.wilson.worldCenterY);
		
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["worldSize"], Math.min(this.wilson.worldHeight, this.wilson.worldWidth) / 2);
		
		this.wilsonHidden.gl.uniform1i(this.wilsonHidden.uniforms["numIterations"], this.numIterations);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["exposure"], 1);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["a"], this.a);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["b"], this.b);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["brightnessScale"], 20 * (Math.abs(this.zoomLevel) + 1));
		
		this.wilsonHidden.render.drawFrame();
		
		
		
		const pixelData = this.wilsonHidden.render.getPixelData();
		
		let brightnesses = new Array(this.resolutionHidden * this.resolutionHidden);
		
		for (let i = 0; i < this.resolutionHidden * this.resolutionHidden; i++)
		{
			brightnesses[i] = pixelData[4 * i] + pixelData[4 * i + 1] + pixelData[4 * i + 2];
		}
		
		brightnesses.sort((a, b) => a - b);
		
		let brightnessScale = (brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .96)] + brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .98)]) / 255 * 15 * (Math.abs(this.zoomLevel / 2) + 1);
		
		this.pastBrightnessScales.push(brightnessScale);
		
		let denom = this.pastBrightnessScales.length;
		
		if (denom > 10)
		{
			this.pastBrightnessScales.shift();
		}
		
		brightnessScale = Math.max(this.pastBrightnessScales.reduce((a, b) => a + b) / denom, .5);
		
		
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["setDensity"], this.setDensity);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatio"], this.aspectRatio);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["worldCenterX"], this.wilson.worldCenterX);
		this.wilson.gl.uniform1f(this.wilson.uniforms["worldCenterY"], this.wilson.worldCenterY);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["worldSize"], Math.min(this.wilson.worldHeight, this.wilson.worldWidth) / 2);
		
		this.wilson.gl.uniform1i(this.wilson.uniforms["numIterations"], this.numIterations);
		this.wilson.gl.uniform1f(this.wilson.uniforms["exposure"], this.exposure);
		this.wilson.gl.uniform1f(this.wilson.uniforms["a"], this.a);
		this.wilson.gl.uniform1f(this.wilson.uniforms["b"], this.b);
		this.wilson.gl.uniform1f(this.wilson.uniforms["brightnessScale"], brightnessScale);
		
		this.wilson.render.drawFrame();
		
		
		
		if (!this.animationPaused)
		{
			window.requestAnimationFrame(this.drawFrame.bind(this));
		}
	}
}