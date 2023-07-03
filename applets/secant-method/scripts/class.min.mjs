import{Applet}from"../../../scripts/src/applets.min.mjs";class SecantMethod extends Applet{wilsonHidden=null;rootSetterElement=null;rootAInputElement=null;rootBInputElement=null;colorSetterElement=null;a=[1,0];c=[0,0];colors=[];currentRoots=[];lastActiveRoot=0;numRoots=0;aspectRatio=1;numIterations=100;pastBrightnessScales=[];resolution=500;resolutionHidden=100;lastTimestamp=-1;constructor(t,s,i,o,e){super(t),this.rootSetterElement=s,this.rootAInputElement=i,this.rootBInputElement=o,this.colorSetterElement=e;s=this.createHiddenCanvas(),i=`
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
					vec2 temp = cmul(cmul(cpoly(z), cmul(z - lastZ, cinv(cpoly(z) - cpoly(lastZ)))), a) + c;
					
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
		`,o={renderer:"gpu",shader:i,canvasWidth:500,canvasHeight:500,worldWidth:10,worldHeight:10,worldCenterX:0,worldCenterY:0,useDraggables:!0,draggablesMousemoveCallback:this.onDragDraggable.bind(this),draggablesTouchmoveCallback:this.onDragDraggable.bind(this),draggablesMouseupCallback:this.onReleaseDraggable.bind(this),draggablesTouchendCallback:this.onReleaseDraggable.bind(this),useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:()=>this.changeAspectRatio(!0),mousedownCallback:this.onGrabCanvas.bind(this),touchstartCallback:this.onGrabCanvas.bind(this),mousedragCallback:this.onDragCanvas.bind(this),touchmoveCallback:this.onDragCanvas.bind(this),mouseupCallback:this.onReleaseCanvas.bind(this),touchendCallback:this.onReleaseCanvas.bind(this),wheelCallback:this.onWheelCanvas.bind(this),pinchCallback:this.onPinchCanvas.bind(this)},e={renderer:"gpu",shader:i,canvasWidth:this.resolutionHidden,canvasHeight:this.resolutionHidden},this.wilson=new Wilson(t,o),this.wilson.render.initUniforms(["aspectRatio","worldCenterX","worldCenterY","worldSize","numRoots","roots","colors","a","c","brightnessScale"]),this.wilsonHidden=new Wilson(s,e),this.wilsonHidden.render.initUniforms(["aspectRatio","worldCenterX","worldCenterY","worldSize","numRoots","roots","colors","a","c","brightnessScale"]),i=()=>this.changeAspectRatio();window.addEventListener("resize",i),this.handlers.push(window,"resize",i);let n=this.wilson.draggables.add(1,0);n.classList.add("a-marker"),(n=this.wilson.draggables.add(0,0)).classList.add("c-marker"),this.addRoot(),this.addRoot(),this.addRoot(),this.spreadRoots(!0),this.zoom.init(),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatio,1),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.aspectRatio,1),this.colors=[216/255,1/255,42/255,1,139/255,56/255,249/255,239/255,20/255,27/255,181/255,61/255,0,86/255,195/255,154/255,82/255,164/255,32/255,32/255,32/255,155/255,92/255,15/255,182/255,228/255,254/255,250/255,195/255,218/255,1,1,1],this.wilson.gl.uniform3fv(this.wilson.uniforms.colors,this.colors),this.wilsonHidden.gl.uniform3fv(this.wilsonHidden.uniforms.colors,this.colors),window.requestAnimationFrame(this.drawFrame.bind(this))}addRoot(){var t,s;11!==this.numRoots&&(t=3*Math.random()-1.5,s=3*Math.random()-1.5,this.wilson.draggables.add(t,s),this.currentRoots.push(t),this.currentRoots.push(s),this.numRoots++)}removeRoot(){1!==this.numRoots&&(this.numRoots--,this.currentRoots.pop(),this.currentRoots.pop(),this.wilson.draggables.draggables[this.numRoots+2].remove(),this.wilson.draggables.draggables.pop(),this.wilson.draggables.worldCoordinates.pop(),this.wilson.draggables.numDraggables--)}spreadRoots(t=!1,s=!1){const i=[...this.currentRoots];let o=new Array(2*this.numRoots);for(let t=0;t<this.numRoots;t++){var e=1+.75*s*Math.random();o[2*t]=e*Math.cos(2*Math.PI*t/this.numRoots),o[2*t+1]=e*Math.sin(2*Math.PI*t/this.numRoots)}let n={t:0};anime({targets:n,t:1,duration:1e3*!t,easing:"easeInOutQuad",update:()=>{for(let t=0;t<this.numRoots;t++)this.currentRoots[2*t]=(1-n.t)*i[2*t]+n.t*o[2*t],this.currentRoots[2*t+1]=(1-n.t)*i[2*t+1]+n.t*o[2*t+1],this.wilson.draggables.worldCoordinates[t+2]=[this.currentRoots[2*t],this.currentRoots[2*t+1]]},complete:()=>{for(let t=0;t<this.numRoots;t++)this.currentRoots[2*t]=o[2*t],this.currentRoots[2*t+1]=o[2*t+1],this.wilson.draggables.worldCoordinates[t+2]=[this.currentRoots[2*t],this.currentRoots[2*t+1]]}})}setRoot(t,s){0===this.lastActiveRoot?(this.a[0]=t,this.a[1]=s,this.wilson.draggables.worldCoordinates[0]=[this.a[0],this.a[1]]):1===this.lastActiveRoot?(this.c[0]=t,this.c[1]=s,this.wilson.draggables.worldCoordinates[1]=[this.c[0],this.c[1]]):(this.currentRoots[2*(this.lastActiveRoot-2)]=t,this.currentRoots[2*(this.lastActiveRoot-2)+1]=s,this.wilson.draggables.worldCoordinates[this.lastActiveRoot-2]=[this.currentRoots[2*(this.lastActiveRoot-2)],this.currentRoots[2*(this.lastActiveRoot-2)+1]]),this.wilson.draggables.recalculateLocations()}setColor(t){if(!(this.lastActiveRoot<2)){const o=this.lastActiveRoot-2,e=this.hexToRgb(t);var t=e.r/255,s=e.g/255,i=e.b/255;e.r=this.colors[3*o],e.g=this.colors[3*o+1],e.b=this.colors[3*o+2],anime({targets:e,r:t,g:s,b:i,easing:"easeInOutQuad",duration:250,update:()=>{this.colors[3*o]=e.r,this.colors[3*o+1]=e.g,this.colors[3*o+2]=e.b,this.wilson.gl.uniform3fv(this.wilson.uniforms.colors,this.colors),this.wilsonHidden.gl.uniform3fv(this.wilsonHidden.uniforms.colors,this.colors)}})}}onDragDraggable(t,s,i,o){0===t?this.a=[s,i]:1===t?this.c=[s,i]:(this.currentRoots[2*(t-2)]=s,this.currentRoots[2*(t-2)+1]=i)}async onReleaseDraggable(t,s,i,o){this.lastActiveRoot=t;try{var e;Page.Animate.changeOpacity(this.rootSetterElement,0,Site.opacityAnimationTime),await Page.Animate.changeOpacity(this.colorSetterElement,0,Site.opacityAnimationTime),0===this.lastActiveRoot?(this.rootAInputElement.value=Math.round(1e3*this.a[0])/1e3,this.rootBInputElement.value=Math.round(1e3*this.a[1])/1e3):1===this.lastActiveRoot?(this.rootAInputElement.value=Math.round(1e3*this.c[0])/1e4,this.rootBInputElement.value=Math.round(1e3*this.c[1])/1e4):(e=this.lastActiveRoot-2,this.rootAInputElement.value=Math.round(1e3*this.currentRoots[2*e])/1e3,this.rootBInputElement.value=Math.round(1e3*this.currentRoots[2*e+1])/1e3,this.colorSetterElement.value=this.rgbToHex(255*this.colors[3*e],255*this.colors[3*e+1],255*this.colors[3*e+2])),Page.Animate.changeOpacity(this.rootSetterElement,1,Site.opacityAnimationTime),Page.Animate.changeOpacity(this.colorSetterElement,1,Site.opacityAnimationTime)}catch(t){}}drawFrame(t){var s=t-this.lastTimestamp;if(this.lastTimestamp=t,0!=s){this.wilson.draggables.recalculateLocations(),this.pan.update(),this.zoom.update(),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.aspectRatio,this.aspectRatio),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.worldCenterX,this.wilson.worldCenterX),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.worldCenterY,this.wilson.worldCenterY),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.worldSize,Math.min(this.wilson.worldHeight,this.wilson.worldWidth)/2),this.wilsonHidden.gl.uniform1i(this.wilsonHidden.uniforms.numRoots,this.numRoots),this.wilsonHidden.gl.uniform2fv(this.wilsonHidden.uniforms.roots,this.currentRoots),this.wilsonHidden.gl.uniform2fv(this.wilsonHidden.uniforms.a,this.a),this.wilsonHidden.gl.uniform2f(this.wilsonHidden.uniforms.c,this.c[0]/10,this.c[1]/10),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.brightnessScale,30),this.wilsonHidden.render.drawFrame();var i=this.wilsonHidden.render.getPixelData(),o=new Array(this.resolutionHidden*this.resolutionHidden);for(let t=0;t<this.resolutionHidden*this.resolutionHidden;t++)o[t]=Math.max(Math.max(i[4*t],i[4*t+1]),i[4*t+2]);o.sort((t,s)=>t-s);t=Math.min(1e4/(o[Math.floor(this.resolutionHidden*this.resolutionHidden*.96)]+o[Math.floor(this.resolutionHidden*this.resolutionHidden*.98)]),200),s=(this.pastBrightnessScales.push(t),this.pastBrightnessScales.length);10<s&&this.pastBrightnessScales.shift(),t=Math.max(this.pastBrightnessScales.reduce((t,s)=>t+s)/s,.5),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatio,this.aspectRatio),this.wilson.gl.uniform1f(this.wilson.uniforms.worldCenterX,this.wilson.worldCenterX),this.wilson.gl.uniform1f(this.wilson.uniforms.worldCenterY,this.wilson.worldCenterY),this.wilson.gl.uniform1f(this.wilson.uniforms.worldSize,Math.min(this.wilson.worldHeight,this.wilson.worldWidth)/2),this.wilson.gl.uniform1i(this.wilson.uniforms.numRoots,this.numRoots),this.wilson.gl.uniform2fv(this.wilson.uniforms.roots,this.currentRoots),this.wilson.gl.uniform2fv(this.wilson.uniforms.a,this.a),this.wilson.gl.uniform2f(this.wilson.uniforms.c,this.c[0]/10,this.c[1]/10),this.wilson.gl.uniform1f(this.wilson.uniforms.brightnessScale,t),this.wilson.render.drawFrame(),this.animationPaused||window.requestAnimationFrame(this.drawFrame.bind(this))}}hexToRgb(t){t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return t?{r:parseInt(t[1],16),g:parseInt(t[2],16),b:parseInt(t[3],16)}:null}componentToHex(t){t=Math.floor(t).toString(16);return 1==t.length?"0"+t:t}rgbToHex(t,s,i){return"#"+this.componentToHex(t)+this.componentToHex(s)+this.componentToHex(i)}}export{SecantMethod};