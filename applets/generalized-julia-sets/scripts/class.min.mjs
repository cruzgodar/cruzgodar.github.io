import{Applet}from"../../../scripts/src/applets.min.mjs";class GeneralizedJuliaSet extends Applet{loadPromise=null;generatingCode="cadd(cpow(z, 2.0), c)";wilsonHidden=null;switchJuliaModeButtonElement=null;juliaMode=0;aspectRatio=1;numIterations=200;exposure=1;pastBrightnessScales=[];a=0;b=0;resolution=500;resolutionHidden=50;lastTimestamp=-1;constructor(i,e,t=null){super(i),this.switchJuliaModeButtonElement=t;var t=this.createHiddenCanvas(),s="precision highp float; varying vec2 uv; void main(void) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }",n={renderer:"gpu",shader:s,canvasWidth:this.resolution,canvasHeight:this.resolution,useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:()=>this.changeAspectRatio(!0),mousedownCallback:this.onGrabCanvas.bind(this),touchstartCallback:this.onGrabCanvas.bind(this),mousemoveCallback:this.onHoverCanvas.bind(this),mousedragCallback:this.onDragCanvas.bind(this),touchmoveCallback:this.onDragCanvas.bind(this),mouseupCallback:this.onReleaseCanvas.bind(this),touchendCallback:this.onReleaseCanvas.bind(this),wheelCallback:this.onWheelCanvas.bind(this),pinchCallback:this.onPinchCanvas.bind(this)},i=(this.wilson=new Wilson(i,n),{renderer:"gpu",shader:s,canvasWidth:this.resolutionHidden,canvasHeight:this.resolutionHidden}),n=(this.wilsonHidden=new Wilson(t,i),()=>this.changeAspectRatio(!0));window.addEventListener("resize",n),this.handlers.push([window,"resize",n]),this.loadPromise=new Promise(async(i,e)=>{await Site.loadGLSL(),i()})}run(i="cpow(z, 2.0) + c",e=500,t=1,s=200){this.generatingCode=i,this.resolution=e,this.exposure=t,this.numIterations=s;e=`
			precision highp float;
			
			varying vec2 uv;
			
			uniform int juliaMode;
			
			uniform float aspectRatio;
			
			uniform float worldCenterX;
			uniform float worldCenterY;
			uniform float worldSize;
			
			uniform float a;
			uniform float b;
			uniform float exposure;
			uniform int numIterations;
			uniform float brightnessScale;
			
			
			
			${Site.getGLSLBundle(i)}
			
			
			
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
				
				
				
				if (juliaMode == 0)
				{
					vec2 c = z;
					
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
						
						z = ${i};
						
						brightness += exp(-length(z));
					}
					
					
					gl_FragColor = vec4(brightness / brightnessScale * exposure * color, 1.0);
				}
				
				
				
				else if (juliaMode == 1)
				{
					vec2 c = vec2(a, b);
					
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
						
						z = ${i};
						
						brightness += exp(-length(z));
					}
					
					
					gl_FragColor = vec4(brightness / brightnessScale * exposure * color, 1.0);
				}
				
				
				
				else
				{
					vec2 c = z;
					
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
						
						z = ${i};
						
						brightness += exp(-length(z));
					}
					
					
					
					if (!broken)
					{
						gl_FragColor = vec4(.5 * brightness / brightnessScale * exposure * color, 1.0);
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
						
						z = ${i};
						
						brightness += exp(-length(z));
					}
					
					if (!broken)
					{
						gl_FragColor += vec4(brightness / brightnessScale * exposure * color, 0.0);
					}
				}
			}
		`;this.wilson.render.shaderPrograms=[],this.wilson.render.loadNewShader(e),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]),this.wilson.render.initUniforms(["juliaMode","aspectRatio","worldCenterX","worldCenterY","worldSize","a","b","exposure","numIterations","brightnessScale"]),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatio,1),this.wilsonHidden.render.shaderPrograms=[],this.wilsonHidden.render.loadNewShader(e),this.wilsonHidden.gl.useProgram(this.wilsonHidden.render.shaderPrograms[0]),this.wilsonHidden.render.initUniforms(["juliaMode","aspectRatio","worldCenterX","worldCenterY","worldSize","a","b","exposure","numIterations","brightnessScale"]),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.aspectRatio,1),this.wilson.worldWidth=4,this.wilson.worldHeight=4,this.wilson.worldCenterX=0,this.wilson.worldCenterY=0,this.juliaMode=0,this.zoom.init(),this.pastBrightnessScales=[],this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.aspectRatio,1),window.requestAnimationFrame(this.drawFrame.bind(this))}switchJuliaMode(){try{Page.Animate.changeOpacity(this.switchJuliaModeButtonElement,0,Site.opacityAnimationTime),setTimeout(()=>{2===this.juliaMode?this.switchJuliaModeButtonElement.textContent="Return to Mandelbrot Set":0===this.juliaMode&&(this.switchJuliaModeButtonElement.textContent="Pick Julia Set",Page.Animate.changeOpacity(this.switchJuliaModeButtonElement,1,Site.opacityAnimationTime))},Site.opacityAnimationTime)}catch(i){}0===this.juliaMode?(this.juliaMode=2,this.a=0,this.b=0,this.pastBrightnessScales=[]):1===this.juliaMode&&(this.juliaMode=0,this.wilson.worldCenterX=0,this.wilson.worldCenterY=0,this.wilson.worldWidth=4,this.wilson.worldHeight=4,this.zoom.init(),this.pastBrightnessScales=[])}onGrabCanvas(i,e,t){if(this.pan.onGrabCanvas(),this.zoom.onGrabCanvas(),2===this.juliaMode&&"mousedown"===t.type){this.juliaMode=1,this.wilson.worldCenterX=0,this.wilson.worldCenterY=0,this.wilson.worldWidth=4,this.wilson.worldHeight=4,this.zoom.init(),this.pastBrightnessScales=[];try{Page.Animate.changeOpacity(this.switchJuliaModeButtonElement,1,Site.opacityAnimationTime)}catch(i){}}}onDragCanvas(i,e,t,s,n){2===this.juliaMode&&"touchmove"===n.type?(this.a=i,this.b=e):this.pan.onDragCanvas(i,e,t,s)}onHoverCanvas(i,e,t,s,n){2===this.juliaMode&&"mousemove"===n.type&&(this.a=i,this.b=e)}onReleaseCanvas(i,e,t){if(2===this.juliaMode&&"touchend"===t.type){this.juliaMode=1,this.wilson.worldCenterX=0,this.wilson.worldCenterY=0,this.wilson.worldWidth=4,this.wilson.worldHeight=4,this.zoom.init(),this.pastBrightnessScales=[];try{Page.Animate.changeOpacity(this.switchJuliaModeButtonElement,1,Site.opacityAnimationTime)}catch(i){}}else this.pan.onReleaseCanvas(),this.zoom.onReleaseCanvas()}onWheelCanvas(i,e,t,s){2!==this.juliaMode&&this.zoom.onWheelCanvas(i,e,t)}onPinchCanvas(i,e,t,s){2!==this.juliaMode&&this.zoom.onPinchCanvas(i,e,t)}drawFrame(i){var e=i-this.lastTimestamp;if(this.lastTimestamp=i,0!=e){this.pan.update(),this.zoom.update(),this.numIterations=30*-this.zoom.level+200,this.wilsonHidden.gl.uniform1i(this.wilsonHidden.uniforms.juliaMode,this.juliaMode),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.worldCenterX,this.wilson.worldCenterX),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.worldCenterY,this.wilson.worldCenterY),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.worldSize,Math.min(this.wilson.worldHeight,this.wilson.worldWidth)/2),this.wilsonHidden.gl.uniform1i(this.wilsonHidden.uniforms.numIterations,this.numIterations),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.exposure,1),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.a,this.a),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.b,this.b),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.brightnessScale,20*(Math.abs(this.zoom.level)+1)),this.wilsonHidden.render.drawFrame();var t=this.wilsonHidden.render.getPixelData(),s=new Array(this.resolutionHidden*this.resolutionHidden);for(let i=0;i<this.resolutionHidden*this.resolutionHidden;i++)s[i]=t[4*i]+t[4*i+1]+t[4*i+2];s.sort((i,e)=>i-e);i=(s[Math.floor(this.resolutionHidden*this.resolutionHidden*.96)]+s[Math.floor(this.resolutionHidden*this.resolutionHidden*.98)])/255*15*(Math.abs(this.zoom.level/2)+1),e=(this.pastBrightnessScales.push(i),this.pastBrightnessScales.length);10<e&&this.pastBrightnessScales.shift(),i=Math.max(this.pastBrightnessScales.reduce((i,e)=>i+e)/e,.5),this.wilson.gl.uniform1i(this.wilson.uniforms.juliaMode,this.juliaMode),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatio,this.aspectRatio),this.wilson.gl.uniform1f(this.wilson.uniforms.worldCenterX,this.wilson.worldCenterX),this.wilson.gl.uniform1f(this.wilson.uniforms.worldCenterY,this.wilson.worldCenterY),this.wilson.gl.uniform1f(this.wilson.uniforms.worldSize,Math.min(this.wilson.worldHeight,this.wilson.worldWidth)/2),this.wilson.gl.uniform1i(this.wilson.uniforms.numIterations,this.numIterations),this.wilson.gl.uniform1f(this.wilson.uniforms.exposure,this.exposure),this.wilson.gl.uniform1f(this.wilson.uniforms.a,this.a),this.wilson.gl.uniform1f(this.wilson.uniforms.b,this.b),this.wilson.gl.uniform1f(this.wilson.uniforms.brightnessScale,i),this.wilson.render.drawFrame(),this.animationPaused||window.requestAnimationFrame(this.drawFrame.bind(this))}}}export{GeneralizedJuliaSet};