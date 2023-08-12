import { Applet } from "/scripts/src/applets.mjs";
import { addTemporaryListener } from "/scripts/src/main.mjs";

export class LyapunovFractal extends Applet
{
	wilsonHidden = null;
	
	
	
	aspectRatio = 1;
	
	numIterations = 100;
	
	pastBrightnessScales = [];
	
	resolution = 500;
	resolutionHidden = 100;
	
	lastTimestamp = -1;
	
	
	
	constructor(canvas)
	{
		super(canvas);
		
		this.pan.minX = 0;
		this.pan.maxX = 4;
		this.pan.minY = 0;
		this.pan.maxY = 4;
		
		const hiddenCanvas = this.createHiddenCanvas();
		
		const tempShader = "precision highp float; varying vec2 uv; void main(void) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }";
		
		const options =
		{
			renderer: "gpu",
			
			shader: tempShader,
			
			canvasWidth: 500,
			canvasHeight: 500,
			
			worldWidth: 4,
			worldHeight: 4,
			worldCenterX: 2,
			worldCenterY: 2,
			
			
			
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
			
			shader: tempShader,
			
			canvasWidth: 100,
			canvasHeight: 100
		};
		
		this.wilson = new Wilson(canvas, options);
		
		this.wilsonHidden = new Wilson(hiddenCanvas, optionsHidden);
		
		this.zoom.init();
		
		const boundFunction = () => this.changeAspectRatio(true);
		addTemporaryListener({
			object: window,
			event: "resize",
			callback: boundFunction
		});
	}
	
	
	
	run(generatingString)
	{
		let generatingCode = [];
		
		for (let i = 0; i < generatingString.length; i++)
		{
			if (generatingString[i] === "B")
			{
				generatingCode.push(1);
			}
			
			else
			{
				generatingCode.push(0);
			}
		}
		
		
		
		const fragShaderSource = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform float worldCenterX;
			uniform float worldCenterY;
			uniform float worldSize;
			
			uniform float brightnessScale;
			
			uniform int seq[12];
			
			
			
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
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				
				
				
				float x = .5;
				
				float lambda = 0.0;
				
				vec3 color = vec3(0.0, 0.0, 0.0);
				
				for (int iteration = 0; iteration < ${Math.floor(250 / generatingString.length)}; iteration++)
				{
					for (int index = 0; index < ${generatingString.length}; index++)
					{
						if (seq[index] == 0)
						{
							x = z.x * x * (1.0 - x);
							
							color.x += abs(z.x) / 40.0;
						}
						
						else
						{
							x = z.y * x * (1.0 - x);
							
							color.y += abs(z.y) / 40.0;
						}
						
						lambda += log(abs(1.0 - 2.0*x));
						
						color.z = -lambda / 100.0;
					}
				}
				
				lambda /= 10000.0;
				
				if (lambda <= 0.0)
				{
					gl_FragColor = vec4(-lambda / brightnessScale * color, 1.0);
					
					return;
				}
			}
		`;
		
		this.wilson.render.shaderPrograms = [];
		this.wilson.render.loadNewShader(fragShaderSource);
		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]);
		this.wilson.render.initUniforms(["aspectRatio", "worldCenterX", "worldCenterY", "worldSize", "brightnessScale", "seq"]);
		this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatio"], 1);
		
		this.wilsonHidden.render.shaderPrograms = [];
		this.wilsonHidden.render.loadNewShader(fragShaderSource);
		this.wilsonHidden.gl.useProgram(this.wilsonHidden.render.shaderPrograms[0]);
		this.wilsonHidden.render.initUniforms(["aspectRatio", "worldCenterX", "worldCenterY", "worldSize", "brightnessScale", "seq"]);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["aspectRatio"], 1);
		
		
		
		this.pastBrightnessScales = [];
		
		this.zoom.init();
		
		this.wilson.gl.uniform1iv(this.wilson.uniforms["seq"], generatingCode);
		this.wilsonHidden.gl.uniform1iv(this.wilsonHidden.uniforms["seq"], generatingCode);
		
		
		
		window.requestAnimationFrame(this.drawFrame.bind(this));
	}
	


	drawFrame(timestamp)
	{
		let timeElapsed = timestamp - this.lastTimestamp;
		
		this.lastTimestamp = timestamp;
		
		if (timeElapsed === 0)
		{
			return;
		}
		
		
		
		this.pan.update();
		this.zoom.update();
		
		
		
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["aspectRatio"], this.aspectRatio);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["worldCenterX"], this.wilson.worldCenterX);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["worldCenterY"], this.wilson.worldCenterY);
		
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["worldSize"], Math.min(this.wilson.worldHeight, this.wilson.worldWidth) / 2);
		
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["brightnessScale"], 20);
		
		this.wilsonHidden.render.drawFrame();
		
		
		
		const pixelData = this.wilsonHidden.render.getPixelData();
		
		let brightnesses = new Array(this.resolutionHidden * this.resolutionHidden);
		
		for (let i = 0; i < this.resolutionHidden * this.resolutionHidden; i++)
		{
			brightnesses[i] = pixelData[4 * i] + pixelData[4 * i + 1] + pixelData[4 * i + 2];
		}
		
		brightnesses.sort((a, b) => a - b);
		
		let brightnessScale = (brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .96)] + brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .98)]) / 255 * 6;
		
		this.pastBrightnessScales.push(brightnessScale);
		
		let denom = this.pastBrightnessScales.length;
		
		if (denom > 10)
		{
			this.pastBrightnessScales.shift();
		}
		
		brightnessScale = Math.max(this.pastBrightnessScales.reduce((a, b) => a + b) / denom, .5);
		
		
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatio"], this.aspectRatio);
		this.wilson.gl.uniform1f(this.wilson.uniforms["worldCenterX"], this.wilson.worldCenterX);
		this.wilson.gl.uniform1f(this.wilson.uniforms["worldCenterY"], this.wilson.worldCenterY);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["worldSize"], Math.min(this.wilson.worldHeight, this.wilson.worldWidth) / 2);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["brightnessScale"], brightnessScale);
		
		this.wilson.render.drawFrame();
		
		
		
		if (!this.animationPaused)
		{
			window.requestAnimationFrame(this.drawFrame.bind(this));
		}
	}
}