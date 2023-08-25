import anime from"/scripts/anime.js";import{Applet}from"/scripts/src/applets.min.mjs";import{getGlslBundle,loadGlsl}from"/scripts/src/complex-glsl.min.mjs";import{addTemporaryListener}from"/scripts/src/main.min.mjs";import{Wilson}from"/scripts/wilson.min.mjs";class NewtonsMethodExtended extends Applet{loadPromise=null;wilsonHidden=null;a=[1,0];c=[0,0];aspectRatio=1;numIterations=100;pastBrightnessScales=[];resolution=500;resolutionHidden=100;derivativePrecision=6;lastTimestamp=-1;colors=null;constructor(i){super(i);var s="precision highp float; varying vec2 uv; void main(void) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }",e={renderer:"gpu",shader:s,canvasWidth:500,canvasHeight:500,worldWidth:32,worldHeight:32,worldCenterX:0,worldCenterY:0,useDraggables:!0,draggablesMousemoveCallback:this.onDragDraggable.bind(this),draggablesTouchmoveCallback:this.onDragDraggable.bind(this),useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:()=>this.changeAspectRatio(!0),mousedownCallback:this.onGrabCanvas.bind(this),touchstartCallback:this.onGrabCanvas.bind(this),mousedragCallback:this.onDragCanvas.bind(this),touchmoveCallback:this.onDragCanvas.bind(this),mouseupCallback:this.onReleaseCanvas.bind(this),touchendCallback:this.onReleaseCanvas.bind(this),wheelCallback:this.onWheelCanvas.bind(this),pinchCallback:this.onPinchCanvas.bind(this)},s={renderer:"gpu",shader:s,canvasWidth:this.resolutionHidden,canvasHeight:this.resolutionHidden},i=(this.wilson=new Wilson(i,e),this.wilson.render.initUniforms(["aspectRatio","derivativePrecision","worldCenterX","worldCenterY","worldSize","colors","a","c","brightnessScale"]),this.createHiddenCanvas());i.classList.remove("hidden-canvas"),i.classList.add("output-canvas"),this.wilsonHidden=new Wilson(i,s),this.wilsonHidden.render.initUniforms(["aspectRatio","derivativePrecision","worldCenterX","worldCenterY","worldSize","colors","a","c","brightnessScale"]);let t=this.wilson.draggables.add(1,0);t.classList.add("a-marker"),(t=this.wilson.draggables.add(0,0)).classList.add("c-marker");addTemporaryListener({object:window,event:"resize",callback:()=>this.changeAspectRatio(!0)}),this.loadPromise=loadGlsl()}run(i){i=`
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform float worldCenterX;
			uniform float worldCenterY;
			uniform float worldSize;
			
			uniform float derivativePrecision;
			
			
			uniform vec3 colors[4];
			
			uniform vec2 a;
			uniform vec2 c;
			
			uniform float brightnessScale;
			
			const float threshhold = .01;
			
			
			
			${getGlslBundle(i)}
			
			
			
			//Returns f(z) for a polynomial f with given roots.
			vec2 f(vec2 z)
			{
				return ${i};
			}
			
			
			
			//Approximates f'(z) for a polynomial f with given roots.
			vec2 cderiv(vec2 z)
			{
				return derivativePrecision * (f(z + vec2(1.0 / (2.0*derivativePrecision), 0.0)) - f(z - vec2(1.0 / (2.0*derivativePrecision), 0.0)));
			}
			
			
			
			void main(void)
			{
				vec2 z;
				vec2 lastZ = vec2(0.0, 0.0);
				vec2 oldZ = vec2(0.0, 0.0);
				
				if (aspectRatio >= 1.0)
				{
					z = vec2(uv.x * aspectRatio * worldSize + worldCenterX, uv.y * worldSize + worldCenterY);
				}
				
				else
				{
					z = vec2(uv.x * worldSize + worldCenterX, uv.y / aspectRatio * worldSize + worldCenterY);
				}
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				
				
				
				for (int iteration = 0; iteration < 200; iteration++)
				{
					vec2 temp = cmul(cmul(f(z), cinv(cderiv(z))), a) + c;
					
					oldZ = lastZ;
					
					lastZ = z;
					
					z -= temp;
					
					
					
					//If we're slowing down, it's reasonably safe to assume that we're near a root.
					
					float d0 = length(lastZ - z);
					
					if (d0 < threshhold)
					{
						float d1 = length(oldZ - lastZ);
						
						float brightnessAdjust = (log(threshhold) - log(d0)) / (log(d1) - log(d0));
						
						float brightness = 1.0 - (float(iteration) - brightnessAdjust) / brightnessScale;
						
						//Round to a square grid so that basin colors are consistent.
						vec2 theoreticalRoot = floor(z / (threshhold / 3.0)) * threshhold / 3.0;
						
						float c0 = sin(theoreticalRoot.x * 7.239846) + cos(theoreticalRoot.x * 2.945387) + 2.0;
						
						float c1 = sin(theoreticalRoot.y * 5.918445) + cos(theoreticalRoot.y * .987235) + 2.0;
						
						float c2 = sin((theoreticalRoot.x + theoreticalRoot.y) * 1.023974) + cos((theoreticalRoot.x + theoreticalRoot.y) * 9.130874) + 2.0;
						
						float c3 = sin((theoreticalRoot.x - theoreticalRoot.y) * 3.258342) + cos((theoreticalRoot.x - theoreticalRoot.y) * 4.20957) + 2.0;
						
						//Pick an interpolated color between the 4 that we chose earlier.
						gl_FragColor = vec4((c0 * colors[0] + c1 * colors[1] + c2 * colors[2] + c3 * colors[3]) / (c0 + c1 + c2 + c3) * brightness, 1.0);
						
						return;
					}
				}
			}
		`;this.wilson.render.shaderPrograms=[],this.wilson.render.loadNewShader(i),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]),this.wilson.render.initUniforms(["aspectRatio","derivativePrecision","worldCenterX","worldCenterY","worldSize","colors","a","c","brightnessScale"]),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatio,1),this.wilson.gl.uniform1f(this.wilson.uniforms.derivativePrecision,this.derivativePrecision),this.wilsonHidden.render.shaderPrograms=[],this.wilsonHidden.render.loadNewShader(i),this.wilsonHidden.gl.useProgram(this.wilsonHidden.render.shaderPrograms[0]),this.wilsonHidden.render.initUniforms(["aspectRatio","derivativePrecision","worldCenterX","worldCenterY","worldSize","colors","a","c","brightnessScale"]),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.aspectRatio,1),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.derivativePrecision,this.derivativePrecision),this.wilson.worldCenterX=0,this.wilson.worldCenterY=0,this.wilson.worldWidth=32,this.wilson.worldHeight=32,this.zoom.init(),this.pastBrightnessScales=[],this.a=[1,0],this.c=[0,0],this.colors=this.generateNewPalette(),this.wilson.gl.uniform3fv(this.wilson.uniforms.colors,this.colors),this.wilsonHidden.gl.uniform3fv(this.wilsonHidden.uniforms.colors,this.colors),window.requestAnimationFrame(this.drawFrame.bind(this))}generateNewPalette(){var i=new Array(12);let e=0;var t=[];for(let s=0;s<4;s++){e=Math.random()*(1-2*s*.1);for(let i=0;i<s;i++)e>t[i]&&(e+=.2);t[s]=e-.1,t.sort();var o=this.wilson.utils.hsvToRgb(e,.25*Math.random()+.75,.25*Math.random()+.75);i[3*s]=o[0]/255,i[3*s+1]=o[1]/255,i[3*s+2]=o[2]/255}return i}animatePaletteChange(){const s={t:0},e=[...this.colors],t=this.generateNewPalette();anime({targets:s,t:1,duration:1e3,easing:"easeOutQuad",update:()=>{for(let i=0;i<12;i++)this.colors[i]=(1-s.t)*e[i]+s.t*t[i],this.wilson.gl.uniform3fv(this.wilson.uniforms.colors,this.colors),this.wilsonHidden.gl.uniform3fv(this.wilsonHidden.uniforms.colors,this.colors)}})}onDragDraggable(i,s,e){0===i?this.a=[s,e]:this.c=[s,e]}drawFrame(i){var s=i-this.lastTimestamp;if(this.lastTimestamp=i,0!=s){this.pan.update(),this.zoom.update(),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.aspectRatio,this.aspectRatio),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.worldCenterX,this.wilson.worldCenterX),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.worldCenterY,this.wilson.worldCenterY),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.worldSize,Math.min(this.wilson.worldHeight,this.wilson.worldWidth)/2),this.wilsonHidden.gl.uniform2fv(this.wilsonHidden.uniforms.a,this.a),this.wilsonHidden.gl.uniform2f(this.wilsonHidden.uniforms.c,this.c[0]/10,this.c[1]/10),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.brightnessScale,30),this.wilsonHidden.render.drawFrame();var e=this.wilsonHidden.render.getPixelData(),t=new Array(this.resolutionHidden*this.resolutionHidden);for(let i=0;i<this.resolutionHidden*this.resolutionHidden;i++)t[i]=Math.max(Math.max(e[4*i],e[4*i+1]),e[4*i+2]);t.sort((i,s)=>i-s);i=Math.min(1e4/(t[Math.floor(this.resolutionHidden*this.resolutionHidden*.96)]+t[Math.floor(this.resolutionHidden*this.resolutionHidden*.98)]),200),s=(this.pastBrightnessScales.push(i),this.pastBrightnessScales.length);10<s&&this.pastBrightnessScales.shift(),i=Math.max(this.pastBrightnessScales.reduce((i,s)=>i+s)/s,.5),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatio,this.aspectRatio),this.wilson.gl.uniform1f(this.wilson.uniforms.worldCenterX,this.wilson.worldCenterX),this.wilson.gl.uniform1f(this.wilson.uniforms.worldCenterY,this.wilson.worldCenterY),this.wilson.gl.uniform1f(this.wilson.uniforms.worldSize,Math.min(this.wilson.worldHeight,this.wilson.worldWidth)/2),this.wilson.gl.uniform2fv(this.wilson.uniforms.a,this.a),this.wilson.gl.uniform2f(this.wilson.uniforms.c,this.c[0]/10,this.c[1]/10),this.wilson.gl.uniform1f(this.wilson.uniforms.brightnessScale,i),this.wilson.render.drawFrame(),this.animationPaused||window.requestAnimationFrame(this.drawFrame.bind(this))}}}export{NewtonsMethodExtended};