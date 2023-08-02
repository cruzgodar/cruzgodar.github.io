import{Applet}from"/scripts/src/applets.min.mjs";import{loadGlsl,doubleEmulationGlsl}from"/scripts/src/complex-glsl.min.mjs";class JuliaSet extends Applet{loadPromise=null;wilsonHidden=null;juliaMode=0;aspectRatio=1;numIterations=100;useDoublePrecision=!1;doublePrecision=!1;switchJuliaModeButtonElement=null;doublePrecisionZoomThreshhold=-16;pastBrightnessScales=[];a=0;b=1;resolution=1e3;resolutionHidden=100;lastTimestamp=-1;constructor(h,e=null){super(h),this.pan.minX=-2.75,this.pan.maxX=1.25,this.pan.minY=-2,this.pan.maxY=2,this.switchJuliaModeButtonElement=e;const d=this.createHiddenCanvas();this.loadPromise=new Promise(async(e,i)=>{await loadGlsl();var t=`
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
			`,r=`
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
			`,l=`
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
			`,a={renderer:"gpu",shader:t,canvasWidth:1e3,canvasHeight:1e3,worldWidth:4,worldHeight:4,worldCenterX:-.75,worldCenterY:0,useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:()=>this.changeAspectRatio(!0),mousedownCallback:this.onGrabCanvas.bind(this),touchstartCallback:this.onGrabCanvas.bind(this),mousemoveCallback:this.onHoverCanvas.bind(this),mousedragCallback:this.onDragCanvas.bind(this),touchmoveCallback:this.onDragCanvas.bind(this),mouseupCallback:this.onReleaseCanvas.bind(this),touchendCallback:this.onReleaseCanvas.bind(this),wheelCallback:this.onWheelCanvas.bind(this),pinchCallback:this.onPinchCanvas.bind(this)},t={renderer:"gpu",shader:t,canvasWidth:100,canvasHeight:100};this.wilson=new Wilson(h,a),this.wilson.render.loadNewShader(o),this.wilson.render.loadNewShader(n),this.wilson.render.loadNewShader(s),this.wilson.render.loadNewShader(r),this.wilson.render.loadNewShader(l);for(let e=0;e<6;e++)this.wilson.render.initUniforms(["aspectRatio","worldCenterX","worldCenterY","worldSize","a","b","numIterations","brightnessScale"],e);this.wilsonHidden=new Wilson(d,t),this.wilsonHidden.render.loadNewShader(o),this.wilsonHidden.render.loadNewShader(n),this.wilsonHidden.render.loadNewShader(s),this.wilsonHidden.render.loadNewShader(r),this.wilsonHidden.render.loadNewShader(l);for(let e=0;e<6;e++)this.wilsonHidden.render.initUniforms(["aspectRatio","worldCenterX","worldCenterY","worldSize","a","b","numIterations","brightnessScale"],e);this.zoom.init(),window.requestAnimationFrame(this.drawFrame.bind(this));a=()=>this.changeAspectRatio(!0);window.addEventListener("resize",a),this.handlers.push([window,"resize",a])})}toggleUseDoublePrecision(){this.useDoublePrecision=!this.useDoublePrecision,this.zoomCanvas()}toggleDoublePrecision(){this.doublePrecision=!this.doublePrecision,this.doublePrecision?this.wilson.canvas.style.borderColor="rgb(127, 0, 0)":this.wilson.canvas.style.borderColor="rgb(127, 127, 127)"}advanceJuliaMode(){if(0===this.juliaMode){this.juliaMode=2,this.a=0,this.b=0,this.pastBrightnessScales=[];try{changeOpacity(this.switchJuliaModeButtonElement,0,Site.opacityAnimationTime).then(()=>{this.switchJuliaModeButtonElement.textContent="Return to Mandelbrot"})}catch(e){}}else if(1===this.juliaMode){this.juliaMode=0,this.wilson.worldCenterX=-.75,this.wilson.worldCenterY=0,this.wilson.worldWidth=4,this.wilson.worldHeight=4,this.pan.minX=-2.75,this.pan.maxX=1.25,this.pan.minY=-2,this.pan.maxY=2,this.zoom.init(),this.pastBrightnessScales=[];try{changeOpacity(this.switchJuliaModeButtonElement,0,Site.opacityAnimationTime).then(()=>{this.switchJuliaModeButtonElement.textContent="Pick Julia Set",changeOpacity(this.switchJuliaModeButtonElement,1,Site.opacityAnimationTime)})}catch(e){}}}onGrabCanvas(e,i,t){if(this.pan.onGrabCanvas(),this.zoom.onGrabCanvas(),2===this.juliaMode&&"mousedown"===t.type){this.juliaMode=1,this.wilson.worldCenterX=0,this.wilson.worldCenterY=0,this.wilson.worldWidth=4,this.wilson.worldHeight=4,this.pan.minX=-2,this.pan.maxX=2,this.pan.minY=-2,this.pan.maxY=2,this.zoom.init(),this.pastBrightnessScales=[];try{changeOpacity(this.switchJuliaModeButtonElement,1,Site.opacityAnimationTime)}catch(e){}}}onDragCanvas(e,i,t,o,n){2===this.juliaMode&&"touchmove"===n.type?(this.a=e,this.b=i):this.pan.onDragCanvas(e,i,t,o)}onHoverCanvas(e,i,t,o,n){2===this.juliaMode&&"mousemove"===n.type&&(this.a=e,this.b=i)}onReleaseCanvas(e,i,t){if(2===this.juliaMode&&"touchend"===t.type){this.juliaMode=1,this.wilson.worldCenterX=0,this.wilson.worldCenterY=0,this.wilson.worldWidth=4,this.wilson.worldHeight=4,this.pan.minX=-2,this.pan.maxX=2,this.pan.minY=-2,this.pan.maxY=2,this.zoom.init(),this.pastBrightnessScales=[];try{changeOpacity(this.switchJuliaModeButtonElement,1,Site.opacityAnimationTime)}catch(e){}}else this.pan.onReleaseCanvas(),this.zoom.onReleaseCanvas()}onWheelCanvas(e,i,t,o){2!==this.juliaMode&&this.zoom.onWheelCanvas(e,i,t)}onPinchCanvas(e,i,t,o){2!==this.juliaMode&&this.zoom.onPinchCanvas(e,i,t)}drawFrame(e){var i=e-this.lastTimestamp;if(this.lastTimestamp=e,0!=i){this.pan.update(),this.zoom.update(),(!this.doublePrecision&&this.zoom.level<this.doublePrecisionZoomThreshhold&&this.useDoublePrecision||this.doublePrecision&&(this.zoom.level>this.doublePrecisionZoomThreshhold||!this.useDoublePrecision))&&this.toggleDoublePrecision();var e=Applet.doubleToDf(this.wilson.worldCenterX),i=Applet.doubleToDf(this.wilson.worldCenterY),t=this.juliaMode+3*this.doublePrecision,o=(this.numIterations=30*-this.zoom.level+200,this.wilsonHidden.gl.useProgram(this.wilsonHidden.render.shaderPrograms[t]),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.aspectRatio[t],1),this.wilsonHidden.gl.uniform2fv(this.wilsonHidden.uniforms.worldCenterX[t],e),this.wilsonHidden.gl.uniform2fv(this.wilsonHidden.uniforms.worldCenterY[t],i),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.worldSize[t],Math.min(this.wilson.worldHeight,this.wilson.worldWidth)/2),this.wilsonHidden.gl.uniform1i(this.wilsonHidden.uniforms.numIterations[t],this.numIterations),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.a[t],this.a),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.b[t],this.b),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.brightnessScale[t],20*(Math.abs(this.zoom.level)+1)),this.wilsonHidden.render.drawFrame(),this.wilsonHidden.render.getPixelData()),n=new Array(this.resolutionHidden*this.resolutionHidden);for(let e=0;e<this.resolutionHidden*this.resolutionHidden;e++)n[e]=o[4*e]+o[4*e+1]+o[4*e+2];n.sort((e,i)=>e-i);var s=(n[Math.floor(this.resolutionHidden*this.resolutionHidden*.96)]+n[Math.floor(this.resolutionHidden*this.resolutionHidden*.98)])/255*15*(Math.abs(this.zoom.level/2)+1),r=(this.pastBrightnessScales.push(s),this.pastBrightnessScales.length);10<r&&this.pastBrightnessScales.shift(),s=Math.max(this.pastBrightnessScales.reduce((e,i)=>e+i)/r,.5),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[t]),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatio[t],this.aspectRatio),this.wilson.gl.uniform2fv(this.wilson.uniforms.worldCenterX[t],e),this.wilson.gl.uniform2fv(this.wilson.uniforms.worldCenterY[t],i),this.wilson.gl.uniform1f(this.wilson.uniforms.worldSize[t],Math.min(this.wilson.worldHeight,this.wilson.worldWidth)/2),this.wilson.gl.uniform1i(this.wilson.uniforms.numIterations[t],this.numIterations),this.wilson.gl.uniform1f(this.wilson.uniforms.a[t],this.a),this.wilson.gl.uniform1f(this.wilson.uniforms.b[t],this.b),this.wilson.gl.uniform1f(this.wilson.uniforms.brightnessScale[t],s),this.wilson.render.drawFrame(),this.animationPaused||window.requestAnimationFrame(this.drawFrame.bind(this))}}}export{JuliaSet};