import{showPage}from"/scripts/src/load-page.min.mjs";import{$,addTemporaryListener}from"/scripts/src/main.min.mjs";import{redirect}from"/scripts/src/navigation.min.mjs";import{Wilson}from"/scripts/wilson.min.mjs";function load(){var fragShaderSource=`
		precision highp float;
		
		varying vec2 uv;
		
		uniform float aspectRatio;
		
		uniform float worldCenterX;
		uniform float worldCenterY;
		uniform float worldSize;
		
		uniform float a;
		uniform float b;
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
			
			
			
			vec2 c = vec2(a, b);
			
			for (int iteration = 0; iteration < 100; iteration++)
			{
				if (iteration == 99)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
					return;
				}
				
				if (length(z) >= 10.0)
				{
					break;
				}
				
				z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
				
				brightness += exp(-length(z));
			}
			
			
			gl_FragColor = vec4(brightness / brightnessScale * color, 1.0);
		}
	`,options={renderer:"gpu",shader:fragShaderSource,canvasWidth:1e3,canvasHeight:1e3,worldWidth:4,worldHeight:4,worldCenterX:0,worldCenterY:0,useDraggables:!0,draggablesMousemoveCallback:onDrag,draggablesTouchmoveCallback:onDrag,useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:changeAspectRatio,mousedownCallback:onGrabCanvas,touchstartCallback:onGrabCanvas,mousedragCallback:onDragCanvas,touchmoveCallback:onDragCanvas,mouseupCallback:onReleaseCanvas,touchendCallback:onReleaseCanvas,wheelCallback:function(x,y,scrollAmount,event){fixedPointX=x,fixedPointY=y,Math.abs(scrollAmount/100)<.3?(zoomLevel+=scrollAmount/100,zoomLevel=Math.min(zoomLevel,1)):zoomVelocity+=.05*Math.sign(scrollAmount);zoomCanvas()},pinchCallback:function(x,y,touchDistanceDelta,event){nextZoomVelocity=1<=aspectRatio?(zoomLevel-=touchDistanceDelta/wilson.worldWidth*10,-touchDistanceDelta/wilson.worldWidth*10):(zoomLevel-=touchDistanceDelta/wilson.worldHeight*10,-touchDistanceDelta/wilson.worldHeight*10);zoomLevel=Math.min(zoomLevel,1),fixedPointX=x,fixedPointY=y,zoomCanvas()}},fragShaderSource={renderer:"gpu",shader:fragShaderSource,canvasWidth:100,canvasHeight:100};const wilson=new Wilson($("#output-canvas"),options);wilson.render.initUniforms(["aspectRatio","worldCenterX","worldCenterY","worldSize","a","b","brightnessScale"]);wilson.draggables.add(0,1);const wilsonHidden=new Wilson($("#hidden-canvas"),fragShaderSource);wilsonHidden.render.initUniforms(["aspectRatio","worldCenterX","worldCenterY","worldSize","a","b","brightnessScale"]),wilson.canvas.parentNode.parentNode.style.setProperty("margin-bottom",0,"important"),wilsonHidden.canvas.parentNode.parentNode.style.setProperty("margin-top",0,"important");let aspectRatio=1,zoomLevel=0,a=0,b=1,resolution=1e3;const resolutionHidden=100;let fixedPointX=0,fixedPointY=0,nextPanVelocityX=0,nextPanVelocityY=0,nextZoomVelocity=0,panVelocityX=0,panVelocityY=0,zoomVelocity=0;const panFriction=.96,panVelocityStartThreshhold=.005,panVelocityStopThreshhold=5e-4,zoomFriction=.93,zoomVelocityStartThreshhold=.01,zoomVelocityStopThreshhold=.001;let lastTimestamp=-1;const resolutionInputElement=$("#resolution-input");function onDrag(activeDraggable,x,y,event){a=x,b=y,window.requestAnimationFrame(drawJuliaSet)}function onGrabCanvas(x,y,event){panVelocityX=0,panVelocityY=0,zoomVelocity=0,nextPanVelocityX=0,nextPanVelocityY=0,nextZoomVelocity=0}function onDragCanvas(x,y,xDelta,yDelta,event){wilson.worldCenterX-=xDelta,wilson.worldCenterY-=yDelta,nextPanVelocityX=-xDelta,nextPanVelocityY=-yDelta,wilson.worldCenterX=Math.min(Math.max(wilson.worldCenterX,-2),2),wilson.worldCenterY=Math.min(Math.max(wilson.worldCenterY,-2),2),window.requestAnimationFrame(drawJuliaSet),wilson.draggables.recalculateLocations()}function onReleaseCanvas(x,y,event){Math.sqrt(nextPanVelocityX*nextPanVelocityX+nextPanVelocityY*nextPanVelocityY)>=panVelocityStartThreshhold*Math.min(wilson.worldWidth,wilson.worldHeight)&&(panVelocityX=nextPanVelocityX,panVelocityY=nextPanVelocityY),Math.abs(nextZoomVelocity)>=zoomVelocityStartThreshhold&&(zoomVelocity=nextZoomVelocity),window.requestAnimationFrame(drawJuliaSet)}function zoomCanvas(){if(1<=aspectRatio){var newWorldCenter=wilson.input.getZoomedWorldCenter(fixedPointX,fixedPointY,4*Math.pow(2,zoomLevel)*aspectRatio,4*Math.pow(2,zoomLevel));wilson.worldWidth=4*Math.pow(2,zoomLevel)*aspectRatio,wilson.worldHeight=4*Math.pow(2,zoomLevel),wilson.worldCenterX=newWorldCenter[0],wilson.worldCenterY=newWorldCenter[1]}else{const newWorldCenter=wilson.input.getZoomedWorldCenter(fixedPointX,fixedPointY,4*Math.pow(2,zoomLevel),4*Math.pow(2,zoomLevel)/aspectRatio);wilson.worldWidth=4*Math.pow(2,zoomLevel),wilson.worldHeight=4*Math.pow(2,zoomLevel)/aspectRatio,wilson.worldCenterX=newWorldCenter[0],wilson.worldCenterY=newWorldCenter[1]}window.requestAnimationFrame(drawJuliaSet),wilson.draggables.recalculateLocations()}function drawJuliaSet(timestamp){var timeElapsed=timestamp-lastTimestamp;if(lastTimestamp=timestamp,0!=timeElapsed){wilsonHidden.gl.uniform1f(wilsonHidden.uniforms.worldCenterX,wilson.worldCenterX),wilsonHidden.gl.uniform1f(wilsonHidden.uniforms.worldCenterY,wilson.worldCenterY),wilsonHidden.gl.uniform1f(wilsonHidden.uniforms.worldSize,Math.min(wilson.worldHeight,wilson.worldWidth)/2),wilsonHidden.gl.uniform1f(wilsonHidden.uniforms.a,a),wilsonHidden.gl.uniform1f(wilsonHidden.uniforms.b,b),wilsonHidden.gl.uniform1f(wilsonHidden.uniforms.brightnessScale,20),wilsonHidden.render.drawFrame();var pixelData=wilsonHidden.render.getPixelData(),brightnesses=new Array(resolutionHidden*resolutionHidden);for(let i=0;i<resolutionHidden*resolutionHidden;i++)brightnesses[i]=pixelData[4*i]+pixelData[4*i+1]+pixelData[4*i+2];brightnesses.sort((a,b)=>a-b);timestamp=brightnesses[Math.floor(resolutionHidden*resolutionHidden*.98)]/255*18,timestamp=Math.max(timestamp,.1);wilson.gl.uniform1f(wilson.uniforms.aspectRatio,aspectRatio),wilson.gl.uniform1f(wilson.uniforms.worldCenterX,wilson.worldCenterX),wilson.gl.uniform1f(wilson.uniforms.worldCenterY,wilson.worldCenterY),wilson.gl.uniform1f(wilson.uniforms.worldSize,Math.min(wilson.worldHeight,wilson.worldWidth)/2),wilson.gl.uniform1f(wilson.uniforms.a,a),wilson.gl.uniform1f(wilson.uniforms.b,b),wilson.gl.uniform1f(wilson.uniforms.brightnessScale,timestamp),wilson.render.drawFrame(),0===panVelocityX&&0===panVelocityY&&0===zoomVelocity||(wilson.worldCenterX+=panVelocityX,wilson.worldCenterY+=panVelocityY,wilson.worldCenterX=Math.min(Math.max(wilson.worldCenterX,-2),2),wilson.worldCenterY=Math.min(Math.max(wilson.worldCenterY,-2),2),panVelocityX*=panFriction,panVelocityY*=panFriction,Math.sqrt(panVelocityX*panVelocityX+panVelocityY*panVelocityY)<panVelocityStopThreshhold*Math.min(wilson.worldWidth,wilson.worldHeight)&&(panVelocityX=0,panVelocityY=0),zoomLevel+=zoomVelocity,zoomLevel=Math.min(zoomLevel,1),zoomCanvas(fixedPointX,fixedPointY),zoomVelocity*=zoomFriction,Math.abs(zoomVelocity)<zoomVelocityStopThreshhold&&(zoomVelocity=0),window.requestAnimationFrame(drawJuliaSet),wilson.draggables.recalculateLocations())}}function changeAspectRatio(){wilson.fullscreen.currentlyFullscreen?1<=(aspectRatio=window.innerWidth/window.innerHeight)?(wilson.changeCanvasSize(resolution,Math.floor(resolution/aspectRatio)),wilson.worldWidth=4*Math.pow(2,zoomLevel)*aspectRatio,wilson.worldHeight=4*Math.pow(2,zoomLevel)):(wilson.changeCanvasSize(Math.floor(resolution*aspectRatio),resolution),wilson.worldWidth=4*Math.pow(2,zoomLevel),wilson.worldHeight=4*Math.pow(2,zoomLevel)/aspectRatio):(aspectRatio=1,wilson.changeCanvasSize(resolution,resolution),wilson.worldWidth=4*Math.pow(2,zoomLevel),wilson.worldHeight=4*Math.pow(2,zoomLevel)),window.requestAnimationFrame(drawJuliaSet)}resolutionInputElement.addEventListener("input",()=>{resolution=parseInt(resolutionInputElement.value||1e3),wilson.changeCanvasSize(resolution,resolution)}),wilson.gl.uniform1f(wilson.uniforms.aspectRatio,1),wilsonHidden.gl.uniform1f(wilsonHidden.uniforms.aspectRatio,1),window.requestAnimationFrame(drawJuliaSet),addTemporaryListener({object:window,event:"resize",callback:changeAspectRatio}),$("#part-1-button").addEventListener("click",()=>{redirect({url:"/projects/wilson/guide/1-getting-started/"})}),$("#part-2-button").addEventListener("click",()=>{redirect({url:"/projects/wilson/guide/2-draggables/"})}),$("#part-3-button").addEventListener("click",()=>{redirect({url:"/projects/wilson/guide/3-parallelizing/"})}),$("#part-4-button").addEventListener("click",()=>{redirect({url:"/projects/wilson/guide/4-hidden-canvases/"})}),$("#part-5-button").addEventListener("click",()=>{redirect({url:"/projects/wilson/guide/5-fullscreen/"})}),$("#part-6-button").addEventListener("click",()=>{redirect({url:"/projects/wilson/guide/6-interactivity/"})}),$("#docs-button").addEventListener("click",()=>{redirect({url:"/projects/wilson/docs/"})}),$("#download-button").addEventListener("click",()=>{redirect({url:"https://github.com/cruzgodar/wilson/releases",inNewTab:!0})}),showPage()}export{load};