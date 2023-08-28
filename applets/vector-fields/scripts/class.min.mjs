import{Applet}from"/scripts/src/applets.min.mjs";import{doubleEncodingGlsl,getGlslBundle,loadGlsl}from"/scripts/src/complex-glsl.min.mjs";import{addTemporaryListener}from"/scripts/src/main.min.mjs";import{Wilson}from"/scripts/wilson.min.mjs";class VectorField extends Applet{loadPromise=null;resolution=500;numParticles=0;maxParticles=5e3;aspectRatio=1;zoomLevel=.6515;fixedPointX=0;fixedPointY=0;dt=.0075;lifetime=100;lastTimestamp=-1;particles=[];freeParticleSlots=[];updateTexture=null;dimTexture=null;updateCanvas=null;dimCanvas=null;wilsonUpdate=null;wilsonDim=null;panVelocityX=0;panVelocityY=0;zoomVelocity=0;nextPanVelocityX=0;nextPanVelocityY=0;nextZoomVelocity=0;lastPanVelocitiesX=[];lastPanVelocitiesY=[];lastZoomVelocities=[];panFriction=.96;panVelocityStartThreshhold=25e-5;panVelocityStopThreshhold=25e-5;zoomFriction=.9;zoomVelocityStartThreshhold=.002;zoomVelocityStopThreshhold=.002;constructor(canvas){super(canvas),this.updateCanvas=this.createHiddenCanvas(),this.dimCanvas=this.createHiddenCanvas();this.wilsonUpdate=new Wilson(this.updateCanvas,{renderer:"gpu",shader:"precision highp float; varying vec2 uv; void main(void) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }",canvasWidth:100,canvasHeight:100}),this.wilsonUpdate.render.createFramebufferTexturePair(),this.wilsonUpdate.gl.bindTexture(this.wilsonUpdate.gl.TEXTURE_2D,this.wilsonUpdate.render.framebuffers[0].texture),this.wilsonUpdate.gl.bindFramebuffer(this.wilsonUpdate.gl.FRAMEBUFFER,null);var optionsDim={renderer:"gpu",shader:`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			void main(void)
			{
				vec3 v = texture2D(uTexture, (uv + vec2(1.0, 1.0)) / 2.0).xyz;
				
				gl_FragColor = vec4(v.x - 1.0 / 255.0, v.y, v.z, 1.0);
			}
		`,canvasWidth:this.resolution,canvasHeight:this.resolution},optionsDim=(this.wilsonDim=new Wilson(this.dimCanvas,optionsDim),this.wilsonDim.render.loadNewShader(`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform vec2 pan;
			
			void main(void)
			{
				vec2 texCoord = (uv + vec2(1.0, 1.0)) / 2.0 - pan;
				
				if (texCoord.x >= 0.0 && texCoord.x < 1.0 && texCoord.y >= 0.0 && texCoord.y < 1.0)
				{
					vec3 v = texture2D(uTexture, texCoord).xyz;
					
					gl_FragColor = vec4(v.x, v.y, v.z, 1.0);
					
					return;
				}
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			}
		`),this.wilsonDim.render.initUniforms(["pan"],1),this.wilsonDim.gl.useProgram(this.wilsonDim.render.shaderPrograms[0]),this.wilsonDim.render.loadNewShader(`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float scale;
			uniform vec2 fixedPoint;
			
			void main(void)
			{
				vec2 texCoord = ((uv + vec2(1.0, 1.0)) / 2.0 - fixedPoint) * scale + fixedPoint;
				
				if (texCoord.x >= 0.0 && texCoord.x < 1.0 && texCoord.y >= 0.0 && texCoord.y < 1.0)
				{
					vec3 v = texture2D(uTexture, texCoord).xyz;
					
					gl_FragColor = vec4(v.x / 1.06, v.y, v.z, 1.0);
					
					return;
				}
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			}
		`),this.wilsonDim.render.initUniforms(["scale","fixedPoint"],2),this.wilsonDim.gl.useProgram(this.wilsonDim.render.shaderPrograms[0]),this.wilsonDim.render.createFramebufferTexturePair(this.wilsonDim.gl.UNSIGNED_BYTE),this.wilsonDim.gl.bindTexture(this.wilsonDim.gl.TEXTURE_2D,this.wilsonDim.render.framebuffers[0].texture),this.wilsonDim.gl.bindFramebuffer(this.wilsonDim.gl.FRAMEBUFFER,null),this.dimTexture=new Uint8Array(this.resolution*this.resolution*4),{renderer:"gpu",shader:`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float maxBrightness;
			
			vec3 hsv2rgb(vec3 c)
			{
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}
			
			void main(void)
			{
				vec3 v = texture2D(uTexture, (vec2(1.0 + uv.x, 1.0 - uv.y)) / 2.0).xyz;
				
				gl_FragColor = vec4(hsv2rgb(vec3(v.y, v.z, v.x / maxBrightness)), 1.0);
			}
		`,canvasWidth:this.resolution,canvasHeight:this.resolution,worldWidth:2*Math.PI,worldHeight:2*Math.PI,worldCenterX:0,worldCenterY:0,useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:this.generateNewField.bind(this),useDraggables:!0,draggablesMousemoveCallback:this.onDragDraggable.bind(this),draggablesTouchmoveCallback:this.onDragDraggable.bind(this),mousedownCallback:this.onGrabCanvas.bind(this),touchstartCallback:this.onGrabCanvas.bind(this),mousedragCallback:this.onDragCanvas.bind(this),touchmoveCallback:this.onDragCanvas.bind(this),mouseupCallback:this.onReleaseCanvas.bind(this),touchendCallback:this.onReleaseCanvas.bind(this),wheelCallback:this.onWheelCanvas.bind(this),pinchCallback:this.onPinchCanvas.bind(this)}),canvas=(this.wilson=new Wilson(canvas,optionsDim),this.wilson.render.initUniforms(["maxBrightness"]),this.wilson.gl.uniform1f(this.wilson.uniforms.maxBrightness,this.lifetime/255),this.wilson.render.createFramebufferTexturePair(this.wilson.gl.UNSIGNED_BYTE),this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D,this.wilson.render.framebuffers[0].texture),this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER,null),this.wilson.draggables.add(1,0),this.wilson.draggables.draggables[0].style.display="none",this.handleResizeEvent.bind(this));addTemporaryListener({object:window,event:"resize",callback:canvas}),this.loadPromise=loadGlsl()}run({generatingCode,resolution=500,maxParticles=1e4,dt=.0075,lifetime=100,worldCenterX=0,worldCenterY=0,zoomLevel=.6515}){this.dt=dt;var fragShaderSourceUpdateBase=`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float dt;
			
			uniform vec2 draggableArg;
			
			
			
			${getGlslBundle(generatingCode)}
			
			${doubleEncodingGlsl}
			
			
			
			vec2 f(float x, float y)
			{
				return vec2${generatingCode};
			}
			
			
			
			void main(void)
			{
				vec4 sample = texture2D(uTexture, (uv + vec2(1.0, 1.0)) / 2.0);
				
				if (int(sample.z) == 0)
				{
					return;
				}
				
				vec2 d = f(sample.x, sample.y);
		`,fragShaderSourceUpdateX=`
				${fragShaderSourceUpdateBase}
				
				gl_FragColor = encodeFloat(dt * d.x + sample.x);
			}
		`,fragShaderSourceUpdateY=`
				${fragShaderSourceUpdateBase}
				
				gl_FragColor = encodeFloat(dt * d.y + sample.y);
			}
		`,fragShaderSourceUpdateH=`
				${fragShaderSourceUpdateBase}
				
				gl_FragColor = encodeFloat((atan(d.y, d.x) + 3.14159265) / 6.28318531);
			}
		`,fragShaderSourceUpdateS=`
				${fragShaderSourceUpdateBase}
				
				gl_FragColor = encodeFloat(1.0 - exp(-1.2 * (d.x * d.x + d.y * d.y)));
			}
		`,fragShaderSourceUpdateBase=`
				${fragShaderSourceUpdateBase}
				
				gl_FragColor = encodeFloat(1.0 - exp(-1.2 * .9 * (d.x * d.x + d.y * d.y)));
			}
		`;this.wilsonUpdate.render.shaderPrograms=[],this.wilsonUpdate.render.loadNewShader(fragShaderSourceUpdateX),this.wilsonUpdate.render.loadNewShader(fragShaderSourceUpdateY),this.wilsonUpdate.render.loadNewShader(fragShaderSourceUpdateH),this.wilsonUpdate.render.loadNewShader(fragShaderSourceUpdateS),this.wilsonUpdate.render.loadNewShader(fragShaderSourceUpdateBase),this.wilsonUpdate.render.initUniforms(["dt","draggableArg"],0),this.wilsonUpdate.render.initUniforms(["dt","draggableArg"],1),this.wilsonUpdate.render.initUniforms(["dt","draggableArg"],2),this.wilsonUpdate.render.initUniforms(["dt","draggableArg"],3),this.wilsonUpdate.render.initUniforms(["dt","draggableArg"],4),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[0]),this.wilsonUpdate.gl.uniform1f(this.wilsonUpdate.uniforms.dt[0],this.dt),this.wilsonUpdate.gl.uniform2fv(this.wilsonUpdate.uniforms.draggableArg[0],this.wilson.draggables.worldCoordinates[0]),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[1]),this.wilsonUpdate.gl.uniform1f(this.wilsonUpdate.uniforms.dt[1],this.dt),this.wilsonUpdate.gl.uniform2fv(this.wilsonUpdate.uniforms.draggableArg[1],this.wilson.draggables.worldCoordinates[0]),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[2]),this.wilsonUpdate.gl.uniform1f(this.wilsonUpdate.uniforms.dt[2],this.dt),this.wilsonUpdate.gl.uniform2fv(this.wilsonUpdate.uniforms.draggableArg[2],this.wilson.draggables.worldCoordinates[0]),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[3]),this.wilsonUpdate.gl.uniform1f(this.wilsonUpdate.uniforms.dt[3],this.dt),this.wilsonUpdate.gl.uniform2fv(this.wilsonUpdate.uniforms.draggableArg[3],this.wilson.draggables.worldCoordinates[0]),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[4]),this.wilsonUpdate.gl.uniform1f(this.wilsonUpdate.uniforms.dt[4],this.dt),this.wilsonUpdate.gl.uniform2fv(this.wilsonUpdate.uniforms.draggableArg[4],this.wilson.draggables.worldCoordinates[0]),-1!==generatingCode.indexOf("draggableArg")?this.wilson.draggables.draggables[0].style.display="block":this.wilson.draggables.draggables[0].style.display="none",this.generateNewField(resolution,maxParticles,dt,lifetime,worldCenterX,worldCenterY,zoomLevel)}generateNewField(resolution=this.resolution,maxParticles=this.maxParticles,dt=this.dt,lifetime=this.lifetime,worldCenterX=this.wilson.worldCenterX,worldCenterY=this.wilson.worldCenterY,zoomLevel=this.zoomLevel){this.resolution=resolution,this.maxParticles=maxParticles,this.dt=dt,this.lifetime=lifetime,this.wilson.worldCenterX=worldCenterX,this.wilson.worldCenterY=worldCenterY,this.zoomLevel=zoomLevel,this.wilson.gl.uniform1f(this.wilson.uniforms.maxBrightness,this.lifetime/255),this.numParticles=0;resolution=Math.ceil(Math.sqrt(maxParticles));this.wilsonUpdate.changeCanvasSize(resolution,resolution),this.changeAspectRatio(),this.particles=new Array(this.maxParticles),this.freeParticleSlots=new Array(this.maxParticles);for(let i=0;i<this.maxParticles;i++)this.particles[i]=[0,0,0],this.freeParticleSlots[i]=i;this.updateTexture=new Float32Array(this.wilsonUpdate.canvasWidth*this.wilsonUpdate.canvasHeight*4);for(let i=0;i<this.wilsonUpdate.canvasHeight;i++)for(let j=0;j<this.wilsonUpdate.canvasWidth;j++){var index=this.wilsonUpdate.canvasWidth*i+j;this.updateTexture[4*index]=0,this.updateTexture[4*index+1]=0,this.updateTexture[4*index+2]=0,this.updateTexture[4*index+3]=0}this.dimTexture=new Uint8Array(this.wilson.canvasWidth*this.wilson.canvasHeight*4);for(let i=0;i<this.wilson.canvasHeight;i++)for(let j=0;j<this.wilson.canvasWidth;j++){const index=this.wilson.canvasWidth*i+j;this.dimTexture[4*index]=0,this.dimTexture[4*index+1]=0,this.dimTexture[4*index+2]=0}window.requestAnimationFrame(this.drawFrame.bind(this))}resume(){this.animationPaused=!1,window.requestAnimationFrame(this.drawFrame.bind(this))}drawFrame(timestamp){try{var timeElapsed=timestamp-this.lastTimestamp;if(this.lastTimestamp=timestamp,0!=timeElapsed){if(this.numParticles<this.maxParticles){var numToAdd=Math.min(Math.ceil(this.maxParticles/80),this.maxParticles-this.numParticles);for(let i=this.freeParticleSlots.length-numToAdd;i<this.freeParticleSlots.length;i++)this.createParticle(this.freeParticleSlots[i]);this.freeParticleSlots.splice(this.freeParticleSlots.length-numToAdd,numToAdd)}if(this.lastPanVelocitiesX.push(this.nextPanVelocityX),this.lastPanVelocitiesY.push(this.nextPanVelocityY),this.lastPanVelocitiesX.shift(),this.lastPanVelocitiesY.shift(),0!==this.nextPanVelocityX||0!==this.nextPanVelocityY){let xDelta=-this.nextPanVelocityX,yDelta=-this.nextPanVelocityY;Math.abs(xDelta/this.wilson.worldWidth*this.wilson.canvasWidth)<1?xDelta=0:this.nextPanVelocityX=0,Math.abs(yDelta/this.wilson.worldHeight*this.wilson.canvasHeight)<1?yDelta=0:this.nextPanVelocityY=0,0===xDelta&&0===yDelta||(this.panGrid(xDelta,yDelta),this.wilson.worldCenterY-=yDelta,this.wilson.worldCenterX-=xDelta)}else if(0!==this.panVelocityX||0!==this.panVelocityY){let xDelta=-this.panVelocityX,yDelta=-this.panVelocityY;Math.abs(xDelta/this.wilson.worldWidth*this.wilson.canvasWidth)<1&&(xDelta=0),Math.abs(yDelta/this.wilson.worldHeight*this.wilson.canvasHeight)<1&&(yDelta=0),this.panGrid(xDelta,yDelta),this.wilson.worldCenterY-=yDelta,this.panVelocityY*=this.panFriction,this.wilson.worldCenterX-=xDelta,this.panVelocityX*=this.panFriction,this.panVelocityX*this.panVelocityX+this.panVelocityY*this.panVelocityY<this.panVelocityStopThreshhold*this.panVelocityStopThreshhold&&(this.panVelocityX=0,this.panVelocityY=0)}this.lastZoomVelocities.push(this.nextZoomVelocity),this.lastZoomVelocities.shift(),0!==this.nextZoomVelocity&&(this.zoomCanvas(),this.zoomGrid(this.fixedPointX,this.fixedPointY,this.nextZoomVelocity),this.nextZoomVelocity=0),0!==this.zoomVelocity&&(this.zoomCanvas(this.fixedPointX,this.fixedPointY),this.zoomGrid(this.fixedPointX,this.fixedPointY,this.zoomVelocity),this.zoomLevel=Math.min(Math.max(this.zoomLevel+this.zoomVelocity,-3),3),this.zoomVelocity*=this.zoomFriction,Math.abs(this.zoomVelocity)<this.zoomVelocityStopThreshhold)&&(this.zoomVelocity=0),this.updateParticles(),this.drawField(),this.animationPaused||window.requestAnimationFrame(this.drawFrame.bind(this))}}catch(ex){this.generateNewField()}}createParticle(index){this.particles[index][0]=this.wilson.worldCenterX+this.wilson.worldWidth*(Math.random()-.5),this.particles[index][1]=this.wilson.worldCenterY+this.wilson.worldHeight*(Math.random()-.5),this.particles[index][2]=Math.round(this.lifetime*(.5*Math.random()+.75)),this.numParticles++}destroyParticle(index){this.particles[index][2]=0,this.freeParticleSlots.push(index),this.numParticles--}updateParticles(){for(let i=0;i<this.wilsonUpdate.canvasHeight;i++)for(let j=0;j<this.wilsonUpdate.canvasWidth;j++){var index=this.wilsonUpdate.canvasWidth*i+j;index<this.particles.length&&this.particles[index][2]?(this.updateTexture[4*index]=this.particles[index][0],this.updateTexture[4*index+1]=this.particles[index][1],this.updateTexture[4*index+2]=1):this.updateTexture[4*index+2]=0}this.wilsonUpdate.gl.texImage2D(this.wilsonUpdate.gl.TEXTURE_2D,0,this.wilsonUpdate.gl.RGBA,this.wilsonUpdate.canvasWidth,this.wilsonUpdate.canvasHeight,0,this.wilsonUpdate.gl.RGBA,this.wilsonUpdate.gl.FLOAT,this.updateTexture),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[0]),this.wilsonUpdate.render.drawFrame();var col,row,floatsX=new Float32Array(this.wilsonUpdate.render.getPixelData().buffer),floatsY=(this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[1]),this.wilsonUpdate.render.drawFrame(),new Float32Array(this.wilsonUpdate.render.getPixelData().buffer)),floatsH=(this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[2]),this.wilsonUpdate.render.drawFrame(),new Float32Array(this.wilsonUpdate.render.getPixelData().buffer)),floatsS=(this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[3]),this.wilsonUpdate.render.drawFrame(),new Float32Array(this.wilsonUpdate.render.getPixelData().buffer)),floatsS2=(this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[4]),this.wilsonUpdate.render.drawFrame(),new Float32Array(this.wilsonUpdate.render.getPixelData().buffer));for(let i=0;i<this.wilsonUpdate.canvasHeight;i++)for(let j=0;j<this.wilsonUpdate.canvasWidth;j++){const index=this.wilsonUpdate.canvasWidth*i+j;index<this.particles.length&&this.particles[index][2]&&(this.particles[index][0]=floatsX[index],this.particles[index][1]=floatsY[index],row=Math.round((.5-(this.particles[index][1]-this.wilson.worldCenterY)/this.wilson.worldHeight)*this.wilson.canvasHeight),col=Math.round(((this.particles[index][0]-this.wilson.worldCenterX)/this.wilson.worldWidth+.5)*this.wilson.canvasWidth),0<=row&&row<this.wilson.canvasHeight&&0<=col&&col<this.wilson.canvasWidth&&(row=row*this.wilson.canvasWidth+col,this.dimTexture[4*row]=this.lifetime,this.dimTexture[4*row+1]=255*floatsH[index],this.dimTexture[4*row+2]=255*Math.max(floatsS[index],floatsS2[index]),this.particles[index][2]--,!(this.particles[index][2]<=0))||this.destroyParticle(index))}}drawField(){this.wilsonDim.gl.texImage2D(this.wilsonDim.gl.TEXTURE_2D,0,this.wilsonDim.gl.RGBA,this.wilsonDim.canvasWidth,this.wilsonDim.canvasHeight,0,this.wilsonDim.gl.RGBA,this.wilsonDim.gl.UNSIGNED_BYTE,this.dimTexture),this.wilsonDim.render.drawFrame(),this.dimTexture=this.wilsonDim.render.getPixelData(),this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D,0,this.wilson.gl.RGBA,this.wilson.canvasWidth,this.wilson.canvasHeight,0,this.wilson.gl.RGBA,this.wilson.gl.UNSIGNED_BYTE,this.dimTexture),this.wilson.render.drawFrame()}panGrid(xDelta,yDelta){this.wilsonDim.gl.useProgram(this.wilsonDim.render.shaderPrograms[1]),this.wilsonDim.gl.uniform2f(this.wilsonDim.uniforms.pan[1],xDelta/this.wilson.worldWidth,-yDelta/this.wilson.worldHeight),this.drawField(),this.wilsonDim.gl.useProgram(this.wilsonDim.render.shaderPrograms[0]),this.wilson.draggables.recalculateLocations()}zoomGrid(fixedPointX,fixedPointY,zoomDelta){if(!(this.zoomLevel<=-3||3<=this.zoomLevel)){var scale=Math.pow(2,zoomDelta),fixedPointX=(fixedPointX-this.wilson.worldCenterX)/this.wilson.worldWidth+.5,fixedPointY=(this.wilson.worldCenterY-fixedPointY)/this.wilson.worldHeight+.5;if(this.wilsonDim.gl.useProgram(this.wilsonDim.render.shaderPrograms[2]),this.wilsonDim.gl.uniform1f(this.wilsonDim.uniforms.scale[2],scale),this.wilsonDim.gl.uniform2f(this.wilsonDim.uniforms.fixedPoint[2],fixedPointX,fixedPointY),this.drawField(),this.wilsonDim.gl.useProgram(this.wilsonDim.render.shaderPrograms[0]),this.wilson.draggables.recalculateLocations(),0<zoomDelta){var chance=Math.pow(2,1.5*zoomDelta);for(let i=0;i<this.particles.length;i++)this.particles[i][2]&&1<=i%chance&&this.destroyParticle(i)}}}onDragDraggable(activeDraggable,x,y){this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[0]),this.wilsonUpdate.gl.uniform2f(this.wilsonUpdate.uniforms.draggableArg[0],x,y),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[1]),this.wilsonUpdate.gl.uniform2f(this.wilsonUpdate.uniforms.draggableArg[1],x,y),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[2]),this.wilsonUpdate.gl.uniform2f(this.wilsonUpdate.uniforms.draggableArg[2],x,y),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[3]),this.wilsonUpdate.gl.uniform2f(this.wilsonUpdate.uniforms.draggableArg[3],x,y),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[4]),this.wilsonUpdate.gl.uniform2f(this.wilsonUpdate.uniforms.draggableArg[4],x,y)}onGrabCanvas(){this.panVelocityX=0,this.panVelocityY=0,this.zoomVelocity=0,this.lastPanVelocitiesX=[0,0,0,0],this.lastPanVelocitiesY=[0,0,0,0],this.lastZoomVelocities=[0,0,0,0]}onDragCanvas(x,y,xDelta,yDelta){this.nextPanVelocityX+=-xDelta,this.nextPanVelocityY+=-yDelta}onReleaseCanvas(){let maxIndex=0;this.lastPanVelocitiesX.forEach((velocity,index)=>{Math.abs(velocity)>this.panVelocityX&&(this.panVelocityX=Math.abs(velocity),maxIndex=index)}),this.panVelocityX<this.panVelocityStartThreshhold?this.panVelocityX=0:this.panVelocityX=this.lastPanVelocitiesX[maxIndex],this.lastPanVelocitiesY.forEach((velocity,index)=>{Math.abs(velocity)>this.panVelocityY&&(this.panVelocityY=Math.abs(velocity),maxIndex=index)}),this.panVelocityY<this.panVelocityStartThreshhold?this.panVelocityY=0:this.panVelocityY=this.lastPanVelocitiesY[maxIndex],this.lastZoomVelocities.forEach((velocity,index)=>{Math.abs(velocity)>this.zoomVelocity&&(this.zoomVelocity=Math.abs(velocity),maxIndex=index)}),this.zoomVelocity<this.zoomVelocityStartThreshhold?this.zoomVelocity=0:this.zoomVelocity=this.lastZoomVelocities[maxIndex]}onWheelCanvas(x,y,scrollAmount){this.fixedPointX=x,this.fixedPointY=y,Math.abs(scrollAmount/100)<.3?(this.nextZoomVelocity=scrollAmount/100,this.zoomLevel=Math.min(Math.max(this.zoomLevel+scrollAmount/100,-3),3)):this.zoomVelocity+=.05*Math.sign(scrollAmount)}onPinchCanvas(x,y,touchDistanceDelta){let zoomDelta;zoomDelta=1<=this.aspectRatio?touchDistanceDelta/this.wilson.worldWidth*10:touchDistanceDelta/this.wilson.worldHeight*10,this.zoomLevel=Math.min(Math.max(this.zoomLevel-zoomDelta,-3),3),this.nextZoomVelocity=-zoomDelta,this.fixedPointX=x,this.fixedPointY=y}zoomCanvas(){if(1<=this.aspectRatio){var newWorldCenter=this.wilson.input.getZoomedWorldCenter(this.fixedPointX,this.fixedPointY,4*Math.pow(2,this.zoomLevel)*this.aspectRatio,4*Math.pow(2,this.zoomLevel));this.wilson.worldWidth=4*Math.pow(2,this.zoomLevel)*this.aspectRatio,this.wilson.worldHeight=4*Math.pow(2,this.zoomLevel),this.wilson.worldCenterX=newWorldCenter[0],this.wilson.worldCenterY=newWorldCenter[1]}else{const newWorldCenter=this.wilson.input.getZoomedWorldCenter(this.fixedPointX,this.fixedPointY,4*Math.pow(2,this.zoomLevel),4*Math.pow(2,this.zoomLevel)/this.aspectRatio);this.wilson.worldWidth=4*Math.pow(2,this.zoomLevel),this.wilson.worldHeight=4*Math.pow(2,this.zoomLevel)/this.aspectRatio,this.wilson.worldCenterX=newWorldCenter[0],this.wilson.worldCenterY=newWorldCenter[1]}}changeAspectRatio(){this.wilson.fullscreen.currentlyFullscreen?(this.aspectRatio=window.innerWidth/window.innerHeight,1<=this.aspectRatio?(this.wilson.changeCanvasSize(Math.ceil(this.resolution*this.aspectRatio),this.resolution),this.wilsonDim.changeCanvasSize(Math.ceil(this.resolution*this.aspectRatio),this.resolution),this.wilson.worldWidth=4*Math.pow(2,this.zoomLevel)*this.aspectRatio,this.wilson.worldHeight=4*Math.pow(2,this.zoomLevel)):(this.wilson.changeCanvasSize(this.resolution,Math.ceil(this.resolution/this.aspectRatio)),this.wilsonDim.changeCanvasSize(this.resolution,Math.ceil(this.resolution/this.aspectRatio)),this.wilson.worldWidth=4*Math.pow(2,this.zoomLevel),this.wilson.worldHeight=4*Math.pow(2,this.zoomLevel)/this.aspectRatio)):(this.aspectRatio=1,this.wilson.changeCanvasSize(this.resolution,this.resolution),this.wilsonDim.changeCanvasSize(this.resolution,this.resolution),this.wilson.worldWidth=4*Math.pow(2,this.zoomLevel),this.wilson.worldHeight=4*Math.pow(2,this.zoomLevel))}handleResizeEvent(){this.wilson.fullscreen.currentlyFullscreen&&this.generateNewField()}}export{VectorField};