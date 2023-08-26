import{Applet}from"/scripts/src/applets.min.mjs";import{getGlslBundle,loadGlsl}from"/scripts/src/complex-glsl.min.mjs";import{addTemporaryListener}from"/scripts/src/main.min.mjs";import{Wilson}from"/scripts/wilson.min.mjs";class ComplexMap extends Applet{loadPromise=null;generatingCode="";uniformCode="";aspectRatio=1;pastBrightnessScales=[];resolution=500;blackPoint=1;whitePoint=1;draggableCallback=null;lastTimestamp=-1;addIndicatorDraggable=!1;useSelectorMode=!1;totalBenchmarkTime=0;benchmarksLeft=0;benchmarkCycles=10;benchmarkResolution=4e3;constructor(e,i,o="",s=0,a=0,t=-.585,l=!1,r=null,n=!1){super(e);var h={renderer:"gpu",shader:"precision highp float; varying vec2 uv; void main(void) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }",canvasWidth:this.resolution,canvasHeight:this.resolution,useDraggables:!0,draggablesMousemoveCallback:this.onDragDraggable.bind(this),draggablesTouchmoveCallback:this.onDragDraggable.bind(this),useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:()=>this.changeAspectRatio(!0),mousedownCallback:this.onGrabCanvas.bind(this),touchstartCallback:this.onGrabCanvas.bind(this),mousedragCallback:this.onDragCanvas.bind(this),touchmoveCallback:this.onDragCanvas.bind(this),mouseupCallback:this.onReleaseCanvas.bind(this),touchendCallback:this.onReleaseCanvas.bind(this),wheelCallback:this.onWheelCanvas.bind(this),pinchCallback:this.onPinchCanvas.bind(this)};this.wilson=new Wilson(e,h);addTemporaryListener({object:window,event:"resize",callback:()=>this.changeAspectRatio(!0)}),this.loadPromise=new Promise(e=>{loadGlsl().then(()=>{this.run({generatingCode:i,uniformCode:o,worldCenterX:s,worldCenterY:a,zoomLevel:t,addIndicatorDraggable:l,draggableCallback:r,selectorMode:n}),e()})})}run({generatingCode:e,uniformCode:i="",worldCenterX:o=0,worldCenterY:s=0,zoomLevel:a=-.585,addIndicatorDraggable:t=!1,draggableCallback:l=null,selectorMode:r=!1}){this.generatingCode=e,this.uniformCode=i,this.zoom.level=a,this.wilson.worldWidth=3*Math.pow(2,this.zoom.level),this.wilson.worldHeight=this.wilson.worldWidth,this.wilson.worldCenterX=o,this.wilson.worldCenterY=s,this.addIndicatorDraggable=t,this.draggableCallback=l;let n="";r&&(n=`
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
			
			${i}
			
			
			
			${getGlslBundle(e)}
			
			
			
			vec3 hsv2rgb(vec3 c)
			{
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}
			
			
			
			//Returns f(z) for a polynomial f with given roots.
			vec2 f(vec2 z)
			{
				return ${e};
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
				
				
				
				${n}
				
				
				
				float modulus = length(imageZ);
				
				float h = atan(imageZ.y, imageZ.x) / 6.283;
				float s = clamp(1.0 / (1.0 + .01 * (modulus / whitePoint / whitePoint)), 0.0, 1.0);
				float v = clamp(1.0 / (1.0 + .01 / (modulus * blackPoint * blackPoint)), 0.0, 1.0);
				
				gl_FragColor = vec4(hsv2rgb(vec3(h, s, v)), 1.0);
			}
		`,this.wilson.render.shaderPrograms=[],this.wilson.render.loadNewShader(a),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]),this.wilson.render.initUniforms(["aspectRatio","worldCenterX","worldCenterY","worldSize","blackPoint","whitePoint","draggableArg"]),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatio,1),o=t||-1!==e.indexOf("draggableArg");o&&0===this.wilson.draggables.numDraggables?(this.wilson.draggables.add(.5,.5,!t),this.wilson.gl.uniform2f(this.wilson.uniforms.draggableArg,.5,.5)):o||0===this.wilson.draggables.numDraggables||(this.wilson.draggables.numDraggables--,this.wilson.draggables.draggables[0].remove(),this.wilson.draggables.draggables=[]),this.animationPaused||window.requestAnimationFrame(this.drawFrame.bind(this))}onGrabCanvas(a,t){var e;this.pan.onGrabCanvas(),this.zoom.onGrabCanvas(),this.useSelectorMode&&(this.run({generatingCode:this.generatingCode,uniformCode:this.uniformCode,worldCenterX:this.wilson.worldCenterX,worldCenterY:this.wilson.worldCenterY,zoomLevel:this.zoom.level,addIndicatorDraggable:this.forceAddDraggable,selectorMode:!0}),e=setTimeout(()=>{this.wilson.render.drawFrame();var e=this.wilson.utils.interpolate.worldToCanvas(a,t),i=new Uint8Array(4),e=(this.wilson.gl.readPixels(e[1],this.wilson.canvasHeight-e[0],1,1,this.wilson.gl.RGBA,this.wilson.gl.UNSIGNEDBYTE,i),i[0]-127+i[1]/256),i=i[2]-127+i[3]/256;let o="+",s=(t<0&&(o="-"),"+");i<0&&(s="-"),console.log(`${a} ${o} ${Math.abs(t)}i |---> ${e} ${s} ${Math.abs(i)}i`),this.run({generatingCode:this.generatingCode,uniformCode:this.uniformCode,worldCenterX:this.wilson.worldCenterX,worldCenterY:this.wilson.worldCenterY,zoomLevel:this.zoom.level,addIndicatorDraggable:this.forceAddDraggable,selectorMode:!1}),this.useSelectorMode=!1},20),this.timeoutIds.push(e))}onDragDraggable(e,i,o,s){this.draggableCallback&&this.draggableCallback(e,i,o,s),this.wilson.gl.uniform2f(this.wilson.uniforms.draggableArg,i,o)}drawFrame(e){var i=e-this.lastTimestamp;this.lastTimestamp=e,0==i||(this.pan.update(),this.zoom.update(),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatio,this.aspectRatio),this.wilson.gl.uniform1f(this.wilson.uniforms.worldCenterX,this.wilson.worldCenterX),this.wilson.gl.uniform1f(this.wilson.uniforms.worldCenterY,this.wilson.worldCenterY),this.wilson.gl.uniform1f(this.wilson.uniforms.worldSize,Math.min(this.wilson.worldHeight,this.wilson.worldWidth)/2),this.wilson.gl.uniform1f(this.wilson.uniforms.blackPoint,this.blackPoint),this.wilson.gl.uniform1f(this.wilson.uniforms.whitePoint,this.whitePoint),this.wilson.render.drawFrame(),this.animationPaused)||window.requestAnimationFrame(this.drawFrame.bind(this))}runBenchmark(){this.wilson.changeCanvasSize(this.benchmarkResolution,this.benchmarkResolution);var e=Date.now(),i=new Uint8Array(4);for(let e=0;e<this.benchmarkCycles;e++)this.wilson.render.drawFrame(),this.wilson.gl.readPixels(0,0,1,1,this.wilson.gl.RGBA,this.wilson.gl.UNSIGNEDBYTE,i);e=(Date.now()-e)/this.benchmarkCycles;console.log(`Finished benchmark --- average time to draw a ${this.benchmarkResolution}x${this.benchmarkResolution} frame is ${e}ms`),this.wilson.changeCanvasSize(this.resolution,this.resolution),this.wilson.render.drawFrame()}}export{ComplexMap};