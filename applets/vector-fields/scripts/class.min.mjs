import{Applet}from"/scripts/src/applets.min.mjs";import{doubleEncodingGlsl,getGlslBundle,loadGlsl}from"/scripts/src/complex-glsl.min.mjs";import{addTemporaryListener}from"/scripts/src/main.min.mjs";import{Wilson}from"/scripts/wilson.min.mjs";class VectorField extends Applet{loadPromise=null;resolution=500;numParticles=0;maxParticles=5e3;aspectRatio=1;zoomLevel=.6515;fixedPointX=0;fixedPointY=0;dt=.0075;lifetime=100;lastTimestamp=-1;particles=[];freeParticleSlots=[];updateTexture=null;dimTexture=null;updateCanvas=null;dimCanvas=null;wilsonUpdate=null;wilsonDim=null;panVelocityX=0;panVelocityY=0;zoomVelocity=0;nextPanVelocityX=0;nextPanVelocityY=0;nextZoomVelocity=0;lastPanVelocitiesX=[];lastPanVelocitiesY=[];lastZoomVelocities=[];panFriction=.96;panVelocityStartThreshhold=25e-5;panVelocityStopThreshhold=25e-5;zoomFriction=.9;zoomVelocityStartThreshhold=.002;zoomVelocityStopThreshhold=.002;constructor({canvas}){super(canvas),this.updateCanvas=this.createHiddenCanvas(),this.dimCanvas=this.createHiddenCanvas();this.wilsonUpdate=new Wilson(this.updateCanvas,{renderer:"gpu",shader:`
			precision highp float;
			varying vec2 uv;
			
			void main(void)
			{
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			}
		`,canvasWidth:100,canvasHeight:100}),this.wilsonUpdate.render.createFramebufferTexturePair(),this.wilsonUpdate.gl.bindTexture(this.wilsonUpdate.gl.TEXTURE_2D,this.wilsonUpdate.render.framebuffers[0].texture),this.wilsonUpdate.gl.bindFramebuffer(this.wilsonUpdate.gl.FRAMEBUFFER,null);var i={renderer:"gpu",shader:`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			void main(void)
			{
				vec3 v = texture2D(uTexture, (uv + vec2(1.0, 1.0)) / 2.0).xyz;
				
				gl_FragColor = vec4(v.x - 1.0 / 255.0, v.y, v.z, 1.0);
			}
		`,canvasWidth:this.resolution,canvasHeight:this.resolution},i=(this.wilsonDim=new Wilson(this.dimCanvas,i),this.wilsonDim.render.loadNewShader(`
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
		`,canvasWidth:this.resolution,canvasHeight:this.resolution,worldWidth:2*Math.PI,worldHeight:2*Math.PI,worldCenterX:0,worldCenterY:0,useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:this.generateNewField.bind(this),useDraggables:!0,draggablesMousemoveCallback:this.onDragDraggable.bind(this),draggablesTouchmoveCallback:this.onDragDraggable.bind(this),mousedownCallback:this.onGrabCanvas.bind(this),touchstartCallback:this.onGrabCanvas.bind(this),mousedragCallback:this.onDragCanvas.bind(this),touchmoveCallback:this.onDragCanvas.bind(this),mouseupCallback:this.onReleaseCanvas.bind(this),touchendCallback:this.onReleaseCanvas.bind(this),wheelCallback:this.onWheelCanvas.bind(this),pinchCallback:this.onPinchCanvas.bind(this)}),i=(this.wilson=new Wilson(canvas,i),this.wilson.render.initUniforms(["maxBrightness"]),this.wilson.gl.uniform1f(this.wilson.uniforms.maxBrightness,this.lifetime/255),this.wilson.render.createFramebufferTexturePair(this.wilson.gl.UNSIGNED_BYTE),this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D,this.wilson.render.framebuffers[0].texture),this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER,null),this.wilson.draggables.add(1,0),this.wilson.draggables.draggables[0].style.display="none",this.handleResizeEvent.bind(this));addTemporaryListener({object:window,event:"resize",callback:i}),this.loadPromise=loadGlsl()}run({generatingCode,resolution=500,maxParticles=1e4,dt=.0075,lifetime=100,worldCenterX=0,worldCenterY=0,zoomLevel=.6515}){this.dt=dt;var i=`
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
		`,t=`
				${i}
				
				gl_FragColor = encodeFloat(dt * d.x + sample.x);
			}
		`,e=`
				${i}
				
				gl_FragColor = encodeFloat(dt * d.y + sample.y);
			}
		`,s=`
				${i}
				
				gl_FragColor = encodeFloat((atan(d.y, d.x) + 3.14159265) / 6.28318531);
			}
		`,o=`
				${i}
				
				gl_FragColor = encodeFloat(1.0 - exp(-1.2 * (d.x * d.x + d.y * d.y)));
			}
		`,i=`
				${i}
				
				gl_FragColor = encodeFloat(1.0 - exp(-1.2 * .9 * (d.x * d.x + d.y * d.y)));
			}
		`;this.wilsonUpdate.render.shaderPrograms=[],this.wilsonUpdate.render.loadNewShader(t),this.wilsonUpdate.render.loadNewShader(e),this.wilsonUpdate.render.loadNewShader(s),this.wilsonUpdate.render.loadNewShader(o),this.wilsonUpdate.render.loadNewShader(i),this.wilsonUpdate.render.initUniforms(["dt","draggableArg"],0),this.wilsonUpdate.render.initUniforms(["dt","draggableArg"],1),this.wilsonUpdate.render.initUniforms(["dt","draggableArg"],2),this.wilsonUpdate.render.initUniforms(["dt","draggableArg"],3),this.wilsonUpdate.render.initUniforms(["dt","draggableArg"],4),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[0]),this.wilsonUpdate.gl.uniform1f(this.wilsonUpdate.uniforms.dt[0],this.dt),this.wilsonUpdate.gl.uniform2fv(this.wilsonUpdate.uniforms.draggableArg[0],this.wilson.draggables.worldCoordinates[0]),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[1]),this.wilsonUpdate.gl.uniform1f(this.wilsonUpdate.uniforms.dt[1],this.dt),this.wilsonUpdate.gl.uniform2fv(this.wilsonUpdate.uniforms.draggableArg[1],this.wilson.draggables.worldCoordinates[0]),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[2]),this.wilsonUpdate.gl.uniform1f(this.wilsonUpdate.uniforms.dt[2],this.dt),this.wilsonUpdate.gl.uniform2fv(this.wilsonUpdate.uniforms.draggableArg[2],this.wilson.draggables.worldCoordinates[0]),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[3]),this.wilsonUpdate.gl.uniform1f(this.wilsonUpdate.uniforms.dt[3],this.dt),this.wilsonUpdate.gl.uniform2fv(this.wilsonUpdate.uniforms.draggableArg[3],this.wilson.draggables.worldCoordinates[0]),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[4]),this.wilsonUpdate.gl.uniform1f(this.wilsonUpdate.uniforms.dt[4],this.dt),this.wilsonUpdate.gl.uniform2fv(this.wilsonUpdate.uniforms.draggableArg[4],this.wilson.draggables.worldCoordinates[0]),-1!==generatingCode.indexOf("draggableArg")?this.wilson.draggables.draggables[0].style.display="block":this.wilson.draggables.draggables[0].style.display="none",this.generateNewField({resolution:resolution,maxParticles:maxParticles,dt:dt,lifetime:lifetime,worldCenterX:worldCenterX,worldCenterY:worldCenterY,zoomLevel:zoomLevel})}generateNewField({resolution=this.resolution,maxParticles=this.maxParticles,dt=this.dt,lifetime=this.lifetime,worldCenterX=this.wilson.worldCenterX,worldCenterY=this.wilson.worldCenterY,zoomLevel=this.zoomLevel}){this.resolution=resolution,this.maxParticles=maxParticles,this.dt=dt,this.lifetime=lifetime,this.wilson.worldCenterX=worldCenterX,this.wilson.worldCenterY=worldCenterY,this.zoomLevel=zoomLevel,this.wilson.gl.uniform1f(this.wilson.uniforms.maxBrightness,this.lifetime/255),this.numParticles=0;var i=Math.ceil(Math.sqrt(maxParticles));this.wilsonUpdate.changeCanvasSize(i,i),this.changeAspectRatio(),this.particles=new Array(this.maxParticles),this.freeParticleSlots=new Array(this.maxParticles);for(let s=0;s<this.maxParticles;s++)this.particles[s]=[0,0,0],this.freeParticleSlots[s]=s;this.updateTexture=new Float32Array(this.wilsonUpdate.canvasWidth*this.wilsonUpdate.canvasHeight*4);for(let o=0;o<this.wilsonUpdate.canvasHeight;o++)for(let i=0;i<this.wilsonUpdate.canvasWidth;i++){var t=this.wilsonUpdate.canvasWidth*o+i;this.updateTexture[4*t]=0,this.updateTexture[4*t+1]=0,this.updateTexture[4*t+2]=0,this.updateTexture[4*t+3]=0}this.dimTexture=new Uint8Array(this.wilson.canvasWidth*this.wilson.canvasHeight*4);for(let a=0;a<this.wilson.canvasHeight;a++)for(let i=0;i<this.wilson.canvasWidth;i++){var e=this.wilson.canvasWidth*a+i;this.dimTexture[4*e]=0,this.dimTexture[4*e+1]=0,this.dimTexture[4*e+2]=0}window.requestAnimationFrame(this.drawFrame.bind(this))}resume(){this.animationPaused=!1,window.requestAnimationFrame(this.drawFrame.bind(this))}drawFrame(timestamp){try{var i=timestamp-this.lastTimestamp;if(this.lastTimestamp=timestamp,0!=i){if(this.numParticles<this.maxParticles){var t=Math.min(Math.ceil(this.maxParticles/80),this.maxParticles-this.numParticles);for(let i=this.freeParticleSlots.length-t;i<this.freeParticleSlots.length;i++)this.createParticle(this.freeParticleSlots[i]);this.freeParticleSlots.splice(this.freeParticleSlots.length-t,t)}if(this.lastPanVelocitiesX.push(this.nextPanVelocityX),this.lastPanVelocitiesY.push(this.nextPanVelocityY),this.lastPanVelocitiesX.shift(),this.lastPanVelocitiesY.shift(),0!==this.nextPanVelocityX||0!==this.nextPanVelocityY){let i=-this.nextPanVelocityX,t=-this.nextPanVelocityY;Math.abs(i/this.wilson.worldWidth*this.wilson.canvasWidth)<1?i=0:this.nextPanVelocityX=0,Math.abs(t/this.wilson.worldHeight*this.wilson.canvasHeight)<1?t=0:this.nextPanVelocityY=0,0===i&&0===t||(this.panGrid(i,t),this.wilson.worldCenterY-=t,this.wilson.worldCenterX-=i)}else if(0!==this.panVelocityX||0!==this.panVelocityY){let i=-this.panVelocityX,t=-this.panVelocityY;Math.abs(i/this.wilson.worldWidth*this.wilson.canvasWidth)<1&&(i=0),Math.abs(t/this.wilson.worldHeight*this.wilson.canvasHeight)<1&&(t=0),this.panGrid(i,t),this.wilson.worldCenterY-=t,this.panVelocityY*=this.panFriction,this.wilson.worldCenterX-=i,this.panVelocityX*=this.panFriction,this.panVelocityX**2+this.panVelocityY**2<this.panVelocityStopThreshhold**2&&(this.panVelocityX=0,this.panVelocityY=0)}this.lastZoomVelocities.push(this.nextZoomVelocity),this.lastZoomVelocities.shift(),0!==this.nextZoomVelocity&&(this.zoomCanvas(),this.zoomGrid(this.fixedPointX,this.fixedPointY,this.nextZoomVelocity),this.nextZoomVelocity=0),0!==this.zoomVelocity&&(this.zoomCanvas(this.fixedPointX,this.fixedPointY),this.zoomGrid(this.fixedPointX,this.fixedPointY,this.zoomVelocity),this.zoomLevel=Math.min(Math.max(this.zoomLevel+this.zoomVelocity,-3),3),this.zoomVelocity*=this.zoomFriction,Math.abs(this.zoomVelocity)<this.zoomVelocityStopThreshhold)&&(this.zoomVelocity=0),this.updateParticles(),this.drawField(),this.animationPaused||window.requestAnimationFrame(this.drawFrame.bind(this))}}catch(i){this.generateNewField()}}createParticle(index){this.particles[index][0]=this.wilson.worldCenterX+this.wilson.worldWidth*(Math.random()-.5),this.particles[index][1]=this.wilson.worldCenterY+this.wilson.worldHeight*(Math.random()-.5),this.particles[index][2]=Math.round(this.lifetime*(.5*Math.random()+.75)),this.numParticles++}destroyParticle(index){this.particles[index][2]=0,this.freeParticleSlots.push(index),this.numParticles--}updateParticles(){for(let d=0;d<this.wilsonUpdate.canvasHeight;d++)for(let i=0;i<this.wilsonUpdate.canvasWidth;i++){var t=this.wilsonUpdate.canvasWidth*d+i;t<this.particles.length&&this.particles[t][2]?(this.updateTexture[4*t]=this.particles[t][0],this.updateTexture[4*t+1]=this.particles[t][1],this.updateTexture[4*t+2]=1):this.updateTexture[4*t+2]=0}this.wilsonUpdate.gl.texImage2D(this.wilsonUpdate.gl.TEXTURE_2D,0,this.wilsonUpdate.gl.RGBA,this.wilsonUpdate.canvasWidth,this.wilsonUpdate.canvasHeight,0,this.wilsonUpdate.gl.RGBA,this.wilsonUpdate.gl.FLOAT,this.updateTexture),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[0]),this.wilsonUpdate.render.drawFrame();var e=new Float32Array(this.wilsonUpdate.render.getPixelData().buffer),s=(this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[1]),this.wilsonUpdate.render.drawFrame(),new Float32Array(this.wilsonUpdate.render.getPixelData().buffer)),o=(this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[2]),this.wilsonUpdate.render.drawFrame(),new Float32Array(this.wilsonUpdate.render.getPixelData().buffer)),a=(this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[3]),this.wilsonUpdate.render.drawFrame(),new Float32Array(this.wilsonUpdate.render.getPixelData().buffer)),l=(this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[4]),this.wilsonUpdate.render.drawFrame(),new Float32Array(this.wilsonUpdate.render.getPixelData().buffer));for(let w=0;w<this.wilsonUpdate.canvasHeight;w++)for(let i=0;i<this.wilsonUpdate.canvasWidth;i++){var r,n,h=this.wilsonUpdate.canvasWidth*w+i;h<this.particles.length&&this.particles[h][2]&&(this.particles[h][0]=e[h],this.particles[h][1]=s[h],n=Math.round((.5-(this.particles[h][1]-this.wilson.worldCenterY)/this.wilson.worldHeight)*this.wilson.canvasHeight),r=Math.round(((this.particles[h][0]-this.wilson.worldCenterX)/this.wilson.worldWidth+.5)*this.wilson.canvasWidth),0<=n&&n<this.wilson.canvasHeight&&0<=r&&r<this.wilson.canvasWidth&&(n=n*this.wilson.canvasWidth+r,this.dimTexture[4*n]=this.lifetime,this.dimTexture[4*n+1]=255*o[h],this.dimTexture[4*n+2]=255*Math.max(a[h],l[h]),this.particles[h][2]--,!(this.particles[h][2]<=0))||this.destroyParticle(h))}}drawField(){this.wilsonDim.gl.texImage2D(this.wilsonDim.gl.TEXTURE_2D,0,this.wilsonDim.gl.RGBA,this.wilsonDim.canvasWidth,this.wilsonDim.canvasHeight,0,this.wilsonDim.gl.RGBA,this.wilsonDim.gl.UNSIGNED_BYTE,this.dimTexture),this.wilsonDim.render.drawFrame(),this.dimTexture=this.wilsonDim.render.getPixelData(),this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D,0,this.wilson.gl.RGBA,this.wilson.canvasWidth,this.wilson.canvasHeight,0,this.wilson.gl.RGBA,this.wilson.gl.UNSIGNED_BYTE,this.dimTexture),this.wilson.render.drawFrame()}panGrid(xDelta,yDelta){this.wilsonDim.gl.useProgram(this.wilsonDim.render.shaderPrograms[1]),this.wilsonDim.gl.uniform2f(this.wilsonDim.uniforms.pan[1],xDelta/this.wilson.worldWidth,-yDelta/this.wilson.worldHeight),this.drawField(),this.wilsonDim.gl.useProgram(this.wilsonDim.render.shaderPrograms[0]),this.wilson.draggables.recalculateLocations()}zoomGrid(fixedPointX,fixedPointY,zoomDelta){if(!(this.zoomLevel<=-3||3<=this.zoomLevel)){var i=Math.pow(2,zoomDelta),t=(fixedPointX-this.wilson.worldCenterX)/this.wilson.worldWidth+.5,e=(this.wilson.worldCenterY-fixedPointY)/this.wilson.worldHeight+.5;if(this.wilsonDim.gl.useProgram(this.wilsonDim.render.shaderPrograms[2]),this.wilsonDim.gl.uniform1f(this.wilsonDim.uniforms.scale[2],i),this.wilsonDim.gl.uniform2f(this.wilsonDim.uniforms.fixedPoint[2],t,e),this.drawField(),this.wilsonDim.gl.useProgram(this.wilsonDim.render.shaderPrograms[0]),this.wilson.draggables.recalculateLocations(),0<zoomDelta){var s=Math.pow(2,1.5*zoomDelta);for(let i=0;i<this.particles.length;i++)this.particles[i][2]&&1<=i%s&&this.destroyParticle(i)}}}onDragDraggable(activeDraggable,x,y){this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[0]),this.wilsonUpdate.gl.uniform2f(this.wilsonUpdate.uniforms.draggableArg[0],x,y),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[1]),this.wilsonUpdate.gl.uniform2f(this.wilsonUpdate.uniforms.draggableArg[1],x,y),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[2]),this.wilsonUpdate.gl.uniform2f(this.wilsonUpdate.uniforms.draggableArg[2],x,y),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[3]),this.wilsonUpdate.gl.uniform2f(this.wilsonUpdate.uniforms.draggableArg[3],x,y),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[4]),this.wilsonUpdate.gl.uniform2f(this.wilsonUpdate.uniforms.draggableArg[4],x,y)}onGrabCanvas(){this.panVelocityX=0,this.panVelocityY=0,this.zoomVelocity=0,this.lastPanVelocitiesX=[0,0,0,0],this.lastPanVelocitiesY=[0,0,0,0],this.lastZoomVelocities=[0,0,0,0]}onDragCanvas(x,y,xDelta,yDelta){this.nextPanVelocityX+=-xDelta,this.nextPanVelocityY+=-yDelta}onReleaseCanvas(){let i=0;this.lastPanVelocitiesX.forEach((velocity,index)=>{Math.abs(velocity)>this.panVelocityX&&(this.panVelocityX=Math.abs(velocity),i=index)}),this.panVelocityX<this.panVelocityStartThreshhold?this.panVelocityX=0:this.panVelocityX=this.lastPanVelocitiesX[i],this.lastPanVelocitiesY.forEach((velocity,index)=>{Math.abs(velocity)>this.panVelocityY&&(this.panVelocityY=Math.abs(velocity),i=index)}),this.panVelocityY<this.panVelocityStartThreshhold?this.panVelocityY=0:this.panVelocityY=this.lastPanVelocitiesY[i],this.lastZoomVelocities.forEach((velocity,index)=>{Math.abs(velocity)>this.zoomVelocity&&(this.zoomVelocity=Math.abs(velocity),i=index)}),this.zoomVelocity<this.zoomVelocityStartThreshhold?this.zoomVelocity=0:this.zoomVelocity=this.lastZoomVelocities[i]}onWheelCanvas(x,y,scrollAmount){this.fixedPointX=x,this.fixedPointY=y,Math.abs(scrollAmount/100)<.3?(this.nextZoomVelocity=scrollAmount/100,this.zoomLevel=Math.min(Math.max(this.zoomLevel+scrollAmount/100,-3),3)):this.zoomVelocity+=.05*Math.sign(scrollAmount)}onPinchCanvas(x,y,touchDistanceDelta){let i;i=1<=this.aspectRatio?touchDistanceDelta/this.wilson.worldWidth*10:touchDistanceDelta/this.wilson.worldHeight*10,this.zoomLevel=Math.min(Math.max(this.zoomLevel-i,-3),3),this.nextZoomVelocity=-i,this.fixedPointX=x,this.fixedPointY=y}zoomCanvas(){var i;1<=this.aspectRatio?(i=this.wilson.input.getZoomedWorldCenter(this.fixedPointX,this.fixedPointY,4*Math.pow(2,this.zoomLevel)*this.aspectRatio,4*Math.pow(2,this.zoomLevel)),this.wilson.worldWidth=4*Math.pow(2,this.zoomLevel)*this.aspectRatio,this.wilson.worldHeight=4*Math.pow(2,this.zoomLevel),this.wilson.worldCenterX=i[0],this.wilson.worldCenterY=i[1]):(i=this.wilson.input.getZoomedWorldCenter(this.fixedPointX,this.fixedPointY,4*Math.pow(2,this.zoomLevel),4*Math.pow(2,this.zoomLevel)/this.aspectRatio),this.wilson.worldWidth=4*Math.pow(2,this.zoomLevel),this.wilson.worldHeight=4*Math.pow(2,this.zoomLevel)/this.aspectRatio,this.wilson.worldCenterX=i[0],this.wilson.worldCenterY=i[1])}changeAspectRatio(){this.wilson.fullscreen.currentlyFullscreen?(this.aspectRatio=window.innerWidth/window.innerHeight,1<=this.aspectRatio?(this.wilson.changeCanvasSize(Math.ceil(this.resolution*this.aspectRatio),this.resolution),this.wilsonDim.changeCanvasSize(Math.ceil(this.resolution*this.aspectRatio),this.resolution),this.wilson.worldWidth=4*Math.pow(2,this.zoomLevel)*this.aspectRatio,this.wilson.worldHeight=4*Math.pow(2,this.zoomLevel)):(this.wilson.changeCanvasSize(this.resolution,Math.ceil(this.resolution/this.aspectRatio)),this.wilsonDim.changeCanvasSize(this.resolution,Math.ceil(this.resolution/this.aspectRatio)),this.wilson.worldWidth=4*Math.pow(2,this.zoomLevel),this.wilson.worldHeight=4*Math.pow(2,this.zoomLevel)/this.aspectRatio)):(this.aspectRatio=1,this.wilson.changeCanvasSize(this.resolution,this.resolution),this.wilsonDim.changeCanvasSize(this.resolution,this.resolution),this.wilson.worldWidth=4*Math.pow(2,this.zoomLevel),this.wilson.worldHeight=4*Math.pow(2,this.zoomLevel))}handleResizeEvent(){this.wilson.fullscreen.currentlyFullscreen&&this.generateNewField()}}export{VectorField};