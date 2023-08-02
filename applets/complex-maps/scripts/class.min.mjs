import{Applet}from"/scripts/src/applets.min.mjs";import{loadGlsl,getGlslBundle}from"/scripts/src/complex-glsl.min.mjs";class ComplexMap extends Applet{loadPromise=null;generatingCode="";uniformCode="";aspectRatio=1;pastBrightnessScales=[];resolution=500;blackPoint=1;whitePoint=1;draggableCallback=null;lastTimestamp=-1;addIndicatorDraggable=!1;useSelectorMode=!1;totalBenchmarkTime=0;benchmarksLeft=0;benchmarkCycles=10;benchmarkResolution=4e3;constructor(i,s,t="",a=0,o=0,l=-.585,n=!1,r=null,h=!1){super(i);var e={renderer:"gpu",shader:"precision highp float; varying vec2 uv; void main(void) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }",canvasWidth:this.resolution,canvasHeight:this.resolution,useDraggables:!0,draggablesMousemoveCallback:this.onDragDraggable.bind(this),draggablesTouchmoveCallback:this.onDragDraggable.bind(this),useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:()=>this.changeAspectRatio(!0),mousedownCallback:this.onGrabCanvas.bind(this),touchstartCallback:this.onGrabCanvas.bind(this),mousedragCallback:this.onDragCanvas.bind(this),touchmoveCallback:this.onDragCanvas.bind(this),mouseupCallback:this.onReleaseCanvas.bind(this),touchendCallback:this.onReleaseCanvas.bind(this),wheelCallback:this.onWheelCanvas.bind(this),pinchCallback:this.onPinchCanvas.bind(this)},i=(this.wilson=new Wilson(i,e),()=>this.changeAspectRatio(!0));window.addEventListener("resize",i),this.handlers.push([window,"resize",i]),this.loadPromise=new Promise(async(i,e)=>{await loadGlsl(),this.run(s,t,a,o,l,n,r,h),i()})}run(i,e="",s=0,t=0,a=-.585,o=!1,l=null,n=!1){this.generatingCode=i,this.uniformCode=e,this.zoom.level=a,this.wilson.worldWidth=3*Math.pow(2,this.zoom.level),this.wilson.worldHeight=this.wilson.worldWidth,this.wilson.worldCenterX=s,this.wilson.worldCenterY=t,this.addIndicatorDraggable=o,this.draggableCallback=l;let r="";n&&(r=`
				imageZ.x += 127.0;
				imageZ.y += 127.0;
				
				float whole1 = floor(imageZ.x);
				float whole2 = floor(imageZ.y);
				
				float fract1 = (imageZ.x - whole1);
				float fract2 = (imageZ.y - whole2);
				
				gl_FragColor = vec4(whole1 / 256.0, fract1, whole2 / 256.0, fract2);
				
				return;
			`);a=`
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform float worldCenterX;
			uniform float worldCenterY;
			uniform float worldSize;
			
			uniform float blackPoint;
			uniform float whitePoint;
			
			uniform vec2 draggableArg;
			
			${e}
			
			
			
			${getGlslBundle(i)}
			
			
			
			vec3 hsv2rgb(vec3 c)
			{
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}
			
			
			
			//Returns f(z) for a polynomial f with given roots.
			vec2 f(vec2 z)
			{
				return ${i};
			}
			
			
			
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
				
				
				
				vec2 imageZ = f(z);
				
				
				
				${r}
				
				
				
				float modulus = length(imageZ);
				
				float h = atan(imageZ.y, imageZ.x) / 6.283;
				float s = clamp(1.0 / (1.0 + .01 * (modulus / whitePoint / whitePoint)), 0.0, 1.0);
				float v = clamp(1.0 / (1.0 + .01 / (modulus * blackPoint * blackPoint)), 0.0, 1.0);
				
				gl_FragColor = vec4(hsv2rgb(vec3(h, s, v)), 1.0);
			}
		`,this.wilson.render.shaderPrograms=[],this.wilson.render.loadNewShader(a),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]),this.wilson.render.initUniforms(["aspectRatio","worldCenterX","worldCenterY","worldSize","blackPoint","whitePoint","draggableArg"]),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatio,1),s=o||-1!==i.indexOf("draggableArg");s&&0===this.wilson.draggables.numDraggables?(this.wilson.draggables.add(.5,.5,!o),this.wilson.gl.uniform2f(this.wilson.uniforms.draggableArg,.5,.5)):s||0===this.wilson.draggables.numDraggables||(this.wilson.draggables.numDraggables--,this.wilson.draggables.draggables[0].remove(),this.wilson.draggables.draggables=[]),this.animationPaused||window.requestAnimationFrame(this.drawFrame.bind(this))}onGrabCanvas(a,o,i){var e;this.pan.onGrabCanvas(),this.zoom.onGrabCanvas(),this.useSelectorMode&&(this.run(this.generatingCode,this.uniformCode,this.wilson.worldCenterX,this.wilson.worldCenterY,this.zoom.level,this.forceAddDraggable,!0),e=setTimeout(()=>{this.wilson.render.drawFrame();var i=this.wilson.utils.interpolate.worldToCanvas(a,o),e=new Uint8Array(4),i=(this.wilson.gl.readPixels(i[1],this.wilson.canvasHeight-i[0],1,1,this.wilson.gl.RGBA,this.wilson.gl.UNSIGNEDBYTE,e),e[0]-127+e[1]/256),e=e[2]-127+e[3]/256;let s="+",t=(o<0&&(s="-"),"+");e<0&&(t="-"),console.log(`${a} ${s} ${Math.abs(o)}i |---> ${i} ${t} ${Math.abs(e)}i`),this.run(this.generatingCode,this.uniformCode,this.wilson.worldCenterX,this.wilson.worldCenterY,this.zoom.level,this.forceAddDraggable,!1),this.useSelectorMode=!1},20),this.timeoutIds.push(e))}onDragDraggable(i,e,s,t){try{this.draggableCallback(i,e,s,t)}catch(i){}this.wilson.gl.uniform2f(this.wilson.uniforms.draggableArg,e,s)}drawFrame(i){var e=i-this.lastTimestamp;this.lastTimestamp=i,0==e||(this.pan.update(),this.zoom.update(),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatio,this.aspectRatio),this.wilson.gl.uniform1f(this.wilson.uniforms.worldCenterX,this.wilson.worldCenterX),this.wilson.gl.uniform1f(this.wilson.uniforms.worldCenterY,this.wilson.worldCenterY),this.wilson.gl.uniform1f(this.wilson.uniforms.worldSize,Math.min(this.wilson.worldHeight,this.wilson.worldWidth)/2),this.wilson.gl.uniform1f(this.wilson.uniforms.blackPoint,this.blackPoint),this.wilson.gl.uniform1f(this.wilson.uniforms.whitePoint,this.whitePoint),this.wilson.render.drawFrame(),this.animationPaused)||window.requestAnimationFrame(this.drawFrame.bind(this))}runBenchmark(){this.wilson.changeCanvasSize(this.benchmarkResolution,this.benchmarkResolution);var i=Date.now(),e=new Uint8Array(4);for(let i=0;i<this.benchmarkCycles;i++)this.wilson.render.drawFrame(),this.wilson.gl.readPixels(0,0,1,1,this.wilson.gl.RGBA,this.wilson.gl.UNSIGNEDBYTE,e);i=(Date.now()-i)/this.benchmarkCycles;console.log(`Finished benchmark --- average time to draw a ${this.benchmarkResolution}x${this.benchmarkResolution} frame is ${i}ms`),this.wilson.changeCanvasSize(this.resolution,this.resolution),this.wilson.render.drawFrame()}}export{ComplexMap};