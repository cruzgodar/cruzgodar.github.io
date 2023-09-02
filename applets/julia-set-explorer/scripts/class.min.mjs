import{changeOpacity}from"/scripts/src/animation.min.mjs";import{Applet}from"/scripts/src/applets.min.mjs";import{doubleEmulationGlsl,loadGlsl}from"/scripts/src/complex-glsl.min.mjs";import{addTemporaryListener}from"/scripts/src/main.min.mjs";import{Wilson}from"/scripts/wilson.min.mjs";class JuliaSet extends Applet{wilsonHidden=null;juliaMode=0;aspectRatio=1;numIterations=100;useDoublePrecision=!1;doublePrecision=!1;switchJuliaModeButtonElement=null;doublePrecisionZoomThreshhold=-16;pastBrightnessScales=[];a=0;b=1;resolution=1e3;resolutionHidden=100;lastTimestamp=-1;constructor({canvas,switchJuliaModeButtonElement}){super(canvas),this.pan.minX=-2.75,this.pan.maxX=1.25,this.pan.minY=-2,this.pan.maxY=2,this.switchJuliaModeButtonElement=switchJuliaModeButtonElement,loadGlsl().then(()=>this.run({canvas:canvas}))}run({canvas}){var e=`
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform vec2 worldCenterX;
			uniform vec2 worldCenterY;
			uniform float worldSize;
			
			uniform float a;
			uniform float b;
			uniform int numIterations;
			uniform float brightnessScale;
			
			
			
			void main(void)
			{
				vec2 z;
				
				if (aspectRatio >= 1.0)
				{
					z = vec2(uv.x * aspectRatio * worldSize + worldCenterX.x, uv.y * worldSize + worldCenterY.x);
				}
				
				else
				{
					z = vec2(uv.x * worldSize + worldCenterX.x, uv.y / aspectRatio * worldSize + worldCenterY.x);
				}
				
				vec2 c = z;
				
				vec3 color = normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				
				float brightness = exp(-length(z));
				
				
				
				for (int iteration = 0; iteration < 3001; iteration++)
				{
					if (iteration == numIterations)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						return;
					}
					
					if (length(z) >= 4.0)
					{
						break;
					}
					
					z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
					
					brightness += exp(-length(z));
				}
				
				
				gl_FragColor = vec4(brightness / brightnessScale * color, 1.0);
			}
		`,i=`
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform vec2 worldCenterX;
			uniform vec2 worldCenterY;
			uniform float worldSize;
			
			uniform float a;
			uniform float b;
			uniform int numIterations;
			uniform float brightnessScale;
			
			
			
			void main(void)
			{
				vec2 z;
				
				if (aspectRatio >= 1.0)
				{
					z = vec2(uv.x * aspectRatio * worldSize + worldCenterX.x, uv.y * worldSize + worldCenterY.x);
				}
				
				else
				{
					z = vec2(uv.x * worldSize + worldCenterX.x, uv.y / aspectRatio * worldSize + worldCenterY.x);
				}
				
				vec2 c = vec2(a, b);
				
				vec3 color = normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				
				float brightness = exp(-length(z));
				
				
				
				for (int iteration = 0; iteration < 3001; iteration++)
				{
					if (iteration == numIterations)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						return;
					}
					
					if (length(z) >= 4.0)
					{
						break;
					}
					
					z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
					
					brightness += exp(-length(z));
				}
				
				
				gl_FragColor = vec4(brightness / brightnessScale * color, 1.0);
			}
		`,t=`
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform vec2 worldCenterX;
			uniform vec2 worldCenterY;
			uniform float worldSize;
			
			uniform float a;
			uniform float b;
			uniform int numIterations;
			uniform float brightnessScale;
			
			
			
			void main(void)
			{
				vec2 z;
				
				if (aspectRatio >= 1.0)
				{
					z = vec2(uv.x * aspectRatio * worldSize + worldCenterX.x, uv.y * worldSize + worldCenterY.x);
				}
				
				else
				{
					z = vec2(uv.x * worldSize + worldCenterX.x, uv.y / aspectRatio * worldSize + worldCenterY.x);
				}
				
				vec2 c = z;
				
				vec3 color = normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				
				float brightness = exp(-length(z));
				
				
				
				bool broken = false;
				
				for (int iteration = 0; iteration < 3001; iteration++)
				{
					if (iteration == numIterations)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						
						broken = true;
						
						break;
					}
					
					if (length(z) >= 4.0)
					{
						break;
					}
					
					z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
					
					brightness += exp(-length(z));
				}
				
				
				
				if (!broken)
				{
					gl_FragColor = vec4(.5 * brightness / brightnessScale * color, 1.0);
				}
				
				
				
				z = vec2(uv.x * aspectRatio * 2.0, uv.y * 2.0);
				
				color = normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				
				brightness = exp(-length(z));
				
				broken = false;
				
				c = vec2(a, b);
				
				for (int iteration = 0; iteration < 3001; iteration++)
				{
					if (iteration == numIterations)
					{
						gl_FragColor.xyz /= 4.0;
						
						broken = true;
						
						break;
					}
					
					if (length(z) >= 4.0)
					{
						break;
					}
					
					z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
					
					brightness += exp(-length(z));
				}
				
				if (!broken)
				{
					gl_FragColor += vec4(brightness / brightnessScale * color, 0.0);
				}
			}
		`,o=`
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform vec2 worldCenterX;
			uniform vec2 worldCenterY;
			uniform float worldSize;
			
			uniform float a;
			uniform float b;
			uniform int numIterations;
			uniform float brightnessScale;
			
			
			
			${doubleEmulationGlsl}
			
			
			
			void main(void)
			{
				vec4 z;
				
				if (aspectRatio >= 1.0)
				{
					z = dcAdd(dcMul(vec4(uv.x * aspectRatio, 0.0, uv.y, 0.0), vec2(worldSize, 0.0)), vec4(worldCenterX, worldCenterY));
				}
				
				else
				{
					z = dcAdd(dcMul(vec4(uv.x, 0.0, uv.y / aspectRatio, 0.0), vec2(worldSize, 0.0)), vec4(worldCenterX, worldCenterY));
				}
				
				vec4 c = z;
				
				vec3 color = normalize(vec3(abs(z.x + z.z) / 2.0, abs(z.x) / 2.0, abs(z.z) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				
				float brightness = exp(-length(z));
				
				for (int iteration = 0; iteration < 3001; iteration++)
				{
					if (iteration == numIterations)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						return;
					}
					
					if (length(z) >= 4.0)
					{
						break;
					}
					
					z = dcAdd(dcMul(z, z), c);
					
					brightness += exp(-length(z));
				}
				
				gl_FragColor = vec4(brightness / brightnessScale * color, 1.0);
			}
		`,n=`
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform vec2 worldCenterX;
			uniform vec2 worldCenterY;
			uniform float worldSize;
			
			uniform float a;
			uniform float b;
			uniform int numIterations;
			uniform float brightnessScale;
			
			
			
			${doubleEmulationGlsl}
			
			
			
			void main(void)
			{
				vec4 z;
				
				if (aspectRatio >= 1.0)
				{
					z = dcAdd(dcMul(vec4(uv.x * aspectRatio, 0.0, uv.y, 0.0), vec2(worldSize, 0.0)), vec4(worldCenterX, worldCenterY));
				}
				
				else
				{
					z = dcAdd(dcMul(vec4(uv.x, 0.0, uv.y / aspectRatio, 0.0), vec2(worldSize, 0.0)), vec4(worldCenterX, worldCenterY));
				}
				
				vec4 c = vec4(a, 0.0, b, 0.0);
				
				vec3 color = normalize(vec3(abs(z.x + z.z) / 2.0, abs(z.x) / 2.0, abs(z.z) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				
				float brightness = exp(-length(z));
				
				
				
				for (int iteration = 0; iteration < 3001; iteration++)
				{
					if (iteration == numIterations)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						return;
					}
					
					if (length(z) >= 4.0)
					{
						break;
					}
					
					z = dcAdd(dcMul(z, z), c);
					
					brightness += exp(-length(z));
				}
				
				
				gl_FragColor = vec4(brightness / brightnessScale * color, 1.0);
			}
		`,s=`
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform vec2 worldCenterX;
			uniform vec2 worldCenterY;
			uniform float worldSize;
			
			uniform float a;
			uniform float b;
			uniform int numIterations;
			uniform float brightnessScale;
			
			
			
			${doubleEmulationGlsl}
			
			
			
			void main(void)
			{
				vec4 z;
				
				if (aspectRatio >= 1.0)
				{
					z = dcAdd(dcMul(vec4(uv.x * aspectRatio, 0.0, uv.y, 0.0), vec2(worldSize, 0.0)), vec4(worldCenterX, worldCenterY));
				}
				
				else
				{
					z = dcAdd(dcMul(vec4(uv.x, 0.0, uv.y / aspectRatio, 0.0), vec2(worldSize, 0.0)), vec4(worldCenterX, worldCenterY));
				}
				
				vec4 c = z;
				
				vec3 color = normalize(vec3(abs(z.x + z.z) / 2.0, abs(z.x) / 2.0, abs(z.z) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				
				float brightness = exp(-length(z));
				
				
				
				bool broken = false;
				
				for (int iteration = 0; iteration < 3001; iteration++)
				{
					if (iteration == numIterations)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						
						broken = true;
						
						break;
					}
					
					if (length(z) >= 4.0)
					{
						break;
					}
					
					z = dcAdd(dcMul(z, z), c);
					
					brightness += exp(-length(z));
				}
				
				
				
				if (!broken)
				{
					gl_FragColor = vec4(.5 * brightness / brightnessScale * color, 1.0);
				}
				
				
				
				z = c;
				
				c = vec4(a, 0.0, b, 0.0);
				
				color = normalize(vec3(abs(z.x + z.z) / 2.0, abs(z.x) / 2.0, abs(z.z) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				
				brightness = exp(-length(z));
				
				broken = false;
				
				for (int iteration = 0; iteration < 3001; iteration++)
				{
					if (iteration == numIterations)
					{
						gl_FragColor.xyz /= 4.0;
						
						broken = true;
						
						break;
					}
					
					if (length(z) >= 4.0)
					{
						break;
					}
					
					z = dcAdd(dcMul(z, z), c);
					
					brightness += exp(-length(z));
				}
				
				if (!broken)
				{
					gl_FragColor += vec4(brightness / brightnessScale * color, 0.0);
				}
			}
		`,r={renderer:"gpu",shader:e,canvasWidth:1e3,canvasHeight:1e3,worldWidth:4,worldHeight:4,worldCenterX:-.75,worldCenterY:0,useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:()=>this.changeAspectRatio(!0),mousedownCallback:this.onGrabCanvas.bind(this),touchstartCallback:this.onGrabCanvas.bind(this),mousemoveCallback:this.onHoverCanvas.bind(this),mousedragCallback:this.onDragCanvas.bind(this),touchmoveCallback:this.onDragCanvas.bind(this),mouseupCallback:this.onReleaseCanvas.bind(this),touchendCallback:this.onReleaseCanvas.bind(this),wheelCallback:this.onWheelCanvas.bind(this),pinchCallback:this.onPinchCanvas.bind(this)},e={renderer:"gpu",shader:e,canvasWidth:100,canvasHeight:100};this.wilson=new Wilson(canvas,r),this.wilson.render.loadNewShader(i),this.wilson.render.loadNewShader(t),this.wilson.render.loadNewShader(o),this.wilson.render.loadNewShader(n),this.wilson.render.loadNewShader(s);for(let a=0;a<6;a++)this.wilson.render.initUniforms(["aspectRatio","worldCenterX","worldCenterY","worldSize","a","b","numIterations","brightnessScale"],a);r=this.createHiddenCanvas();this.wilsonHidden=new Wilson(r,e),this.wilsonHidden.render.loadNewShader(i),this.wilsonHidden.render.loadNewShader(t),this.wilsonHidden.render.loadNewShader(o),this.wilsonHidden.render.loadNewShader(n),this.wilsonHidden.render.loadNewShader(s);for(let l=0;l<6;l++)this.wilsonHidden.render.initUniforms(["aspectRatio","worldCenterX","worldCenterY","worldSize","a","b","numIterations","brightnessScale"],l);this.zoom.init(),window.requestAnimationFrame(this.drawFrame.bind(this));addTemporaryListener({object:window,event:"resize",callback:()=>this.changeAspectRatio(!0)})}toggleUseDoublePrecision(){this.useDoublePrecision=!this.useDoublePrecision,this.zoomCanvas()}toggleDoublePrecision(){this.doublePrecision=!this.doublePrecision,this.doublePrecision?this.wilson.canvas.style.borderColor="rgb(127, 0, 0)":this.wilson.canvas.style.borderColor="rgb(127, 127, 127)"}advanceJuliaMode(){0===this.juliaMode?(this.juliaMode=2,this.a=0,this.b=0,this.pastBrightnessScales=[],this.switchJuliaModeButtonElement&&changeOpacity(this.switchJuliaModeButtonElement,0).then(()=>{this.switchJuliaModeButtonElement.textContent="Return to Mandelbrot"})):1===this.juliaMode&&(this.juliaMode=0,this.wilson.worldCenterX=-.75,this.wilson.worldCenterY=0,this.wilson.worldWidth=4,this.wilson.worldHeight=4,this.pan.minX=-2.75,this.pan.maxX=1.25,this.pan.minY=-2,this.pan.maxY=2,this.zoom.init(),this.pastBrightnessScales=[],this.switchJuliaModeButtonElement)&&changeOpacity(this.switchJuliaModeButtonElement,0).then(()=>{this.switchJuliaModeButtonElement.textContent="Pick Julia Set",changeOpacity(this.switchJuliaModeButtonElement,1)})}onGrabCanvas(x,y,event){this.pan.onGrabCanvas(),this.zoom.onGrabCanvas(),2===this.juliaMode&&"mousedown"===event.type&&(this.juliaMode=1,this.wilson.worldCenterX=0,this.wilson.worldCenterY=0,this.wilson.worldWidth=4,this.wilson.worldHeight=4,this.pan.minX=-2,this.pan.maxX=2,this.pan.minY=-2,this.pan.maxY=2,this.zoom.init(),this.pastBrightnessScales=[],this.switchJuliaModeButtonElement)&&changeOpacity(this.switchJuliaModeButtonElement,1)}onDragCanvas(x,y,xDelta,yDelta,event){2===this.juliaMode&&"touchmove"===event.type?(this.a=x,this.b=y):this.pan.onDragCanvas(x,y,xDelta,yDelta)}onHoverCanvas(x,y,xDelta,yDelta,event){2===this.juliaMode&&"mousemove"===event.type&&(this.a=x,this.b=y)}onReleaseCanvas(x,y,event){2===this.juliaMode&&"touchend"===event.type?(this.juliaMode=1,this.wilson.worldCenterX=0,this.wilson.worldCenterY=0,this.wilson.worldWidth=4,this.wilson.worldHeight=4,this.pan.minX=-2,this.pan.maxX=2,this.pan.minY=-2,this.pan.maxY=2,this.zoom.init(),this.pastBrightnessScales=[],this.switchJuliaModeButtonElement&&changeOpacity(this.switchJuliaModeButtonElement,1)):(this.pan.onReleaseCanvas(),this.zoom.onReleaseCanvas())}onWheelCanvas(x,y,scrollAmount){2!==this.juliaMode&&this.zoom.onWheelCanvas(x,y,scrollAmount)}onPinchCanvas(x,y,touchDistanceDelta){2!==this.juliaMode&&this.zoom.onPinchCanvas(x,y,touchDistanceDelta)}drawFrame(timestamp){var i=timestamp-this.lastTimestamp;if(this.lastTimestamp=timestamp,0!=i){this.pan.update(),this.zoom.update(),(!this.doublePrecision&&this.zoom.level<this.doublePrecisionZoomThreshhold&&this.useDoublePrecision||this.doublePrecision&&(this.zoom.level>this.doublePrecisionZoomThreshhold||!this.useDoublePrecision))&&this.toggleDoublePrecision();var i=Applet.doubleToDf(this.wilson.worldCenterX),t=Applet.doubleToDf(this.wilson.worldCenterY),o=this.juliaMode+3*this.doublePrecision,n=(this.numIterations=30*-this.zoom.level+200,this.wilsonHidden.gl.useProgram(this.wilsonHidden.render.shaderPrograms[o]),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.aspectRatio[o],1),this.wilsonHidden.gl.uniform2fv(this.wilsonHidden.uniforms.worldCenterX[o],i),this.wilsonHidden.gl.uniform2fv(this.wilsonHidden.uniforms.worldCenterY[o],t),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.worldSize[o],Math.min(this.wilson.worldHeight,this.wilson.worldWidth)/2),this.wilsonHidden.gl.uniform1i(this.wilsonHidden.uniforms.numIterations[o],this.numIterations),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.a[o],this.a),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.b[o],this.b),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.brightnessScale[o],20*(Math.abs(this.zoom.level)+1)),this.wilsonHidden.render.drawFrame(),this.wilsonHidden.render.getPixelData()),s=new Array(this.resolutionHidden*this.resolutionHidden);for(let e=0;e<this.resolutionHidden*this.resolutionHidden;e++)s[e]=n[4*e]+n[4*e+1]+n[4*e+2];s.sort((a,b)=>a-b);var r=(s[Math.floor(this.resolutionHidden*this.resolutionHidden*.96)]+s[Math.floor(this.resolutionHidden*this.resolutionHidden*.98)])/255*15*(Math.abs(this.zoom.level/2)+1),a=(this.pastBrightnessScales.push(r),this.pastBrightnessScales.length);10<a&&this.pastBrightnessScales.shift(),r=Math.max(this.pastBrightnessScales.reduce((a,b)=>a+b)/a,.5),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[o]),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatio[o],this.aspectRatio),this.wilson.gl.uniform2fv(this.wilson.uniforms.worldCenterX[o],i),this.wilson.gl.uniform2fv(this.wilson.uniforms.worldCenterY[o],t),this.wilson.gl.uniform1f(this.wilson.uniforms.worldSize[o],Math.min(this.wilson.worldHeight,this.wilson.worldWidth)/2),this.wilson.gl.uniform1i(this.wilson.uniforms.numIterations[o],this.numIterations),this.wilson.gl.uniform1f(this.wilson.uniforms.a[o],this.a),this.wilson.gl.uniform1f(this.wilson.uniforms.b[o],this.b),this.wilson.gl.uniform1f(this.wilson.uniforms.brightnessScale[o],r),this.wilson.render.drawFrame(),this.animationPaused||window.requestAnimationFrame(this.drawFrame.bind(this))}}}export{JuliaSet};