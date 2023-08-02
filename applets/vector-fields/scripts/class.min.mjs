import{Applet}from"/scripts/src/applets.min.mjs";import{loadGlsl,getGlslBundle,doubleEncodingGlsl}from"/scripts/src/complex-glsl.min.mjs";class VectorField extends Applet{loadPromise=null;resolution=500;numParticles=0;maxParticles=5e3;aspectRatio=1;zoomLevel=.6515;fixedPointX=0;fixedPointY=0;dt=.0075;lifetime=100;lastTimestamp=-1;particles=[];freeParticleSlots=[];updateTexture=null;dimTexture=null;updateCanvas=null;dimCanvas=null;wilsonUpdate=null;wilsonDim=null;panVelocityX=0;panVelocityY=0;zoomVelocity=0;nextPanVelocityX=0;nextPanVelocityY=0;nextZoomVelocity=0;lastPanVelocitiesX=[];lastPanVelocitiesY=[];lastZoomVelocities=[];panFriction=.96;panVelocityStartThreshhold=25e-5;panVelocityStopThreshhold=25e-5;zoomFriction=.9;zoomVelocityStartThreshhold=.002;zoomVelocityStopThreshhold=.002;constructor(i){super(i),this.updateCanvas=this.createHiddenCanvas(),this.dimCanvas=this.createHiddenCanvas();this.wilsonUpdate=new Wilson(this.updateCanvas,{renderer:"gpu",shader:"precision highp float; varying vec2 uv; void main(void) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }",canvasWidth:100,canvasHeight:100}),this.wilsonUpdate.render.createFramebufferTexturePair(),this.wilsonUpdate.gl.bindTexture(this.wilsonUpdate.gl.TEXTURE_2D,this.wilsonUpdate.render.framebuffers[0].texture),this.wilsonUpdate.gl.bindFramebuffer(this.wilsonUpdate.gl.FRAMEBUFFER,null);var t={renderer:"gpu",shader:`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			void main(void)
			{
				vec3 v = texture2D(uTexture, (uv + vec2(1.0, 1.0)) / 2.0).xyz;
				
				gl_FragColor = vec4(v.x - 1.0 / 255.0, v.y, v.z, 1.0);
			}
		`,canvasWidth:this.resolution,canvasHeight:this.resolution},t=(this.wilsonDim=new Wilson(this.dimCanvas,t),this.wilsonDim.render.loadNewShader(`
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
		`,canvasWidth:this.resolution,canvasHeight:this.resolution,worldWidth:2*Math.PI,worldHeight:2*Math.PI,worldCenterX:0,worldCenterY:0,useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:this.generateNewField.bind(this),useDraggables:!0,draggablesMousemoveCallback:this.onDragDraggable.bind(this),draggablesTouchmoveCallback:this.onDragDraggable.bind(this),mousedownCallback:this.onGrabCanvas.bind(this),touchstartCallback:this.onGrabCanvas.bind(this),mousedragCallback:this.onDragCanvas.bind(this),touchmoveCallback:this.onDragCanvas.bind(this),mouseupCallback:this.onReleaseCanvas.bind(this),touchendCallback:this.onReleaseCanvas.bind(this),wheelCallback:this.onWheelCanvas.bind(this),pinchCallback:this.onPinchCanvas.bind(this)}),i=(this.wilson=new Wilson(i,t),this.wilson.render.initUniforms(["maxBrightness"]),this.wilson.gl.uniform1f(this.wilson.uniforms.maxBrightness,this.lifetime/255),this.wilson.render.createFramebufferTexturePair(this.wilson.gl.UNSIGNED_BYTE),this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D,this.wilson.render.framebuffers[0].texture),this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER,null),this.wilson.draggables.add(1,0),this.wilson.draggables.draggables[0].style.display="none",this.handleResizeEvent.bind(this));window.addEventListener("resize",i),this.handlers.push(window,"resize",i),this.loadPromise=new Promise(async(i,t)=>{await loadGlsl(),i()})}run(i,t=500,s=1e4,e=.0075,o=100,a=0,l=0,r=.6515){this.dt=e;var n=`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float dt;
			
			uniform vec2 draggableArg;
			
			
			
			${getGlslBundle(i)}
			
			${doubleEncodingGlsl}
			
			
			
			vec2 f(float x, float y)
			{
				return vec2${i};
			}
			
			
			
			void main(void)
			{
				vec4 sample = texture2D(uTexture, (uv + vec2(1.0, 1.0)) / 2.0);
				
				if (int(sample.z) == 0)
				{
					return;
				}
				
				vec2 d = f(sample.x, sample.y);
		`,h=`
				${n}
				
				gl_FragColor = encodeFloat(dt * d.x + sample.x);
			}
		`,d=`
				${n}
				
				gl_FragColor = encodeFloat(dt * d.y + sample.y);
			}
		`,w=`
				${n}
				
				gl_FragColor = encodeFloat((atan(d.y, d.x) + 3.14159265) / 6.28318531);
			}
		`,c=`
				${n}
				
				gl_FragColor = encodeFloat(1.0 - exp(-1.2 * (d.x * d.x + d.y * d.y)));
			}
		`,n=`
				${n}
				
				gl_FragColor = encodeFloat(1.0 - exp(-1.2 * .9 * (d.x * d.x + d.y * d.y)));
			}
		`;this.wilsonUpdate.render.shaderPrograms=[],this.wilsonUpdate.render.loadNewShader(h),this.wilsonUpdate.render.loadNewShader(d),this.wilsonUpdate.render.loadNewShader(w),this.wilsonUpdate.render.loadNewShader(c),this.wilsonUpdate.render.loadNewShader(n),this.wilsonUpdate.render.initUniforms(["dt","draggableArg"],0),this.wilsonUpdate.render.initUniforms(["dt","draggableArg"],1),this.wilsonUpdate.render.initUniforms(["dt","draggableArg"],2),this.wilsonUpdate.render.initUniforms(["dt","draggableArg"],3),this.wilsonUpdate.render.initUniforms(["dt","draggableArg"],4),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[0]),this.wilsonUpdate.gl.uniform1f(this.wilsonUpdate.uniforms.dt[0],this.dt),this.wilsonUpdate.gl.uniform2fv(this.wilsonUpdate.uniforms.draggableArg[0],this.wilson.draggables.worldCoordinates[0]),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[1]),this.wilsonUpdate.gl.uniform1f(this.wilsonUpdate.uniforms.dt[1],this.dt),this.wilsonUpdate.gl.uniform2fv(this.wilsonUpdate.uniforms.draggableArg[1],this.wilson.draggables.worldCoordinates[0]),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[2]),this.wilsonUpdate.gl.uniform1f(this.wilsonUpdate.uniforms.dt[2],this.dt),this.wilsonUpdate.gl.uniform2fv(this.wilsonUpdate.uniforms.draggableArg[2],this.wilson.draggables.worldCoordinates[0]),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[3]),this.wilsonUpdate.gl.uniform1f(this.wilsonUpdate.uniforms.dt[3],this.dt),this.wilsonUpdate.gl.uniform2fv(this.wilsonUpdate.uniforms.draggableArg[3],this.wilson.draggables.worldCoordinates[0]),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[4]),this.wilsonUpdate.gl.uniform1f(this.wilsonUpdate.uniforms.dt[4],this.dt),this.wilsonUpdate.gl.uniform2fv(this.wilsonUpdate.uniforms.draggableArg[4],this.wilson.draggables.worldCoordinates[0]),-1!==i.indexOf("draggableArg")?this.wilson.draggables.draggables[0].style.display="block":this.wilson.draggables.draggables[0].style.display="none",this.generateNewField(t,s,e,o,a,l,r)}generateNewField(i=this.resolution,t=this.maxParticles,s=this.dt,e=this.lifetime,o=this.wilson.worldCenterX,a=this.wilson.worldCenterY,l=this.zoomLevel){this.resolution=i,this.maxParticles=t,this.dt=s,this.lifetime=e,this.wilson.worldCenterX=o,this.wilson.worldCenterY=a,this.zoomLevel=l,this.wilson.gl.uniform1f(this.wilson.uniforms.maxBrightness,this.lifetime/255),this.numParticles=0;i=Math.ceil(Math.sqrt(t));this.wilsonUpdate.changeCanvasSize(i,i),this.changeAspectRatio(),this.particles=new Array(this.maxParticles),this.freeParticleSlots=new Array(this.maxParticles);for(let i=0;i<this.maxParticles;i++)this.particles[i]=[0,0,0],this.freeParticleSlots[i]=i;this.updateTexture=new Float32Array(this.wilsonUpdate.canvasWidth*this.wilsonUpdate.canvasHeight*4);for(let t=0;t<this.wilsonUpdate.canvasHeight;t++)for(let i=0;i<this.wilsonUpdate.canvasWidth;i++){var r=this.wilsonUpdate.canvasWidth*t+i;this.updateTexture[4*r]=0,this.updateTexture[4*r+1]=0,this.updateTexture[4*r+2]=0,this.updateTexture[4*r+3]=0}this.dimTexture=new Uint8Array(this.wilson.canvasWidth*this.wilson.canvasHeight*4);for(let t=0;t<this.wilson.canvasHeight;t++)for(let i=0;i<this.wilson.canvasWidth;i++){var n=this.wilson.canvasWidth*t+i;this.dimTexture[4*n]=0,this.dimTexture[4*n+1]=0,this.dimTexture[4*n+2]=0}window.requestAnimationFrame(this.drawFrame.bind(this))}resume(){this.animationPaused=!1,window.requestAnimationFrame(this.drawFrame.bind(this))}drawFrame(i){try{var t=i-this.lastTimestamp;if(this.lastTimestamp=i,0!=t){if(this.numParticles<this.maxParticles){var s=Math.min(Math.ceil(this.maxParticles/80),this.maxParticles-this.numParticles);for(let i=this.freeParticleSlots.length-s;i<this.freeParticleSlots.length;i++)this.createParticle(this.freeParticleSlots[i]);this.freeParticleSlots.splice(this.freeParticleSlots.length-s,s)}if(this.lastPanVelocitiesX.push(this.nextPanVelocityX),this.lastPanVelocitiesY.push(this.nextPanVelocityY),this.lastPanVelocitiesX.shift(),this.lastPanVelocitiesY.shift(),0!==this.nextPanVelocityX||0!==this.nextPanVelocityY){let i=-this.nextPanVelocityX,t=-this.nextPanVelocityY;Math.abs(i/this.wilson.worldWidth*this.wilson.canvasWidth)<1?i=0:this.nextPanVelocityX=0,Math.abs(t/this.wilson.worldHeight*this.wilson.canvasHeight)<1?t=0:this.nextPanVelocityY=0,0===i&&0===t||(this.panGrid(i,t),this.wilson.worldCenterY-=t,this.wilson.worldCenterX-=i)}else if(0!==this.panVelocityX||0!==this.panVelocityY){let i=-this.panVelocityX,t=-this.panVelocityY;Math.abs(i/this.wilson.worldWidth*this.wilson.canvasWidth)<1&&(i=0),Math.abs(t/this.wilson.worldHeight*this.wilson.canvasHeight)<1&&(t=0),this.panGrid(i,t),this.wilson.worldCenterY-=t,this.panVelocityY*=this.panFriction,this.wilson.worldCenterX-=i,this.panVelocityX*=this.panFriction,this.panVelocityX*this.panVelocityX+this.panVelocityY*this.panVelocityY<this.panVelocityStopThreshhold*this.panVelocityStopThreshhold&&(this.panVelocityX=0,this.panVelocityY=0)}this.lastZoomVelocities.push(this.nextZoomVelocity),this.lastZoomVelocities.shift(),0!==this.nextZoomVelocity&&(this.zoomCanvas(),this.zoomGrid(this.fixedPointX,this.fixedPointY,this.nextZoomVelocity),this.nextZoomVelocity=0),0!==this.zoomVelocity&&(this.zoomCanvas(this.fixedPointX,this.fixedPointY),this.zoomGrid(this.fixedPointX,this.fixedPointY,this.zoomVelocity),this.zoomLevel=Math.min(Math.max(this.zoomLevel+this.zoomVelocity,-3),3),this.zoomVelocity*=this.zoomFriction,Math.abs(this.zoomVelocity)<this.zoomVelocityStopThreshhold)&&(this.zoomVelocity=0),this.updateParticles(),this.drawField(),this.animationPaused||window.requestAnimationFrame(this.drawFrame.bind(this))}}catch(i){this.generateNewField()}}createParticle(i){this.particles[i][0]=this.wilson.worldCenterX+this.wilson.worldWidth*(Math.random()-.5),this.particles[i][1]=this.wilson.worldCenterY+this.wilson.worldHeight*(Math.random()-.5),this.particles[i][2]=Math.round(this.lifetime*(.5*Math.random()+.75)),this.numParticles++}destroyParticle(i){this.particles[i][2]=0,this.freeParticleSlots.push(i),this.numParticles--}updateParticles(){for(let t=0;t<this.wilsonUpdate.canvasHeight;t++)for(let i=0;i<this.wilsonUpdate.canvasWidth;i++){var s=this.wilsonUpdate.canvasWidth*t+i;s<this.particles.length&&this.particles[s][2]?(this.updateTexture[4*s]=this.particles[s][0],this.updateTexture[4*s+1]=this.particles[s][1],this.updateTexture[4*s+2]=1):this.updateTexture[4*s+2]=0}this.wilsonUpdate.gl.texImage2D(this.wilsonUpdate.gl.TEXTURE_2D,0,this.wilsonUpdate.gl.RGBA,this.wilsonUpdate.canvasWidth,this.wilsonUpdate.canvasHeight,0,this.wilsonUpdate.gl.RGBA,this.wilsonUpdate.gl.FLOAT,this.updateTexture),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[0]),this.wilsonUpdate.render.drawFrame();var e=new Float32Array(this.wilsonUpdate.render.getPixelData().buffer),o=(this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[1]),this.wilsonUpdate.render.drawFrame(),new Float32Array(this.wilsonUpdate.render.getPixelData().buffer)),a=(this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[2]),this.wilsonUpdate.render.drawFrame(),new Float32Array(this.wilsonUpdate.render.getPixelData().buffer)),l=(this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[3]),this.wilsonUpdate.render.drawFrame(),new Float32Array(this.wilsonUpdate.render.getPixelData().buffer)),r=(this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[4]),this.wilsonUpdate.render.drawFrame(),new Float32Array(this.wilsonUpdate.render.getPixelData().buffer));for(let t=0;t<this.wilsonUpdate.canvasHeight;t++)for(let i=0;i<this.wilsonUpdate.canvasWidth;i++){var n,h,d=this.wilsonUpdate.canvasWidth*t+i;d<this.particles.length&&this.particles[d][2]&&(this.particles[d][0]=e[d],this.particles[d][1]=o[d],h=Math.round((.5-(this.particles[d][1]-this.wilson.worldCenterY)/this.wilson.worldHeight)*this.wilson.canvasHeight),n=Math.round(((this.particles[d][0]-this.wilson.worldCenterX)/this.wilson.worldWidth+.5)*this.wilson.canvasWidth),0<=h&&h<this.wilson.canvasHeight&&0<=n&&n<this.wilson.canvasWidth&&(h=h*this.wilson.canvasWidth+n,this.dimTexture[4*h]=this.lifetime,this.dimTexture[4*h+1]=255*a[d],this.dimTexture[4*h+2]=255*Math.max(l[d],r[d]),this.particles[d][2]--,!(this.particles[d][2]<=0))||this.destroyParticle(d))}}drawField(){this.wilsonDim.gl.texImage2D(this.wilsonDim.gl.TEXTURE_2D,0,this.wilsonDim.gl.RGBA,this.wilsonDim.canvasWidth,this.wilsonDim.canvasHeight,0,this.wilsonDim.gl.RGBA,this.wilsonDim.gl.UNSIGNED_BYTE,this.dimTexture),this.wilsonDim.render.drawFrame(),this.dimTexture=this.wilsonDim.render.getPixelData(),this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D,0,this.wilson.gl.RGBA,this.wilson.canvasWidth,this.wilson.canvasHeight,0,this.wilson.gl.RGBA,this.wilson.gl.UNSIGNED_BYTE,this.dimTexture),this.wilson.render.drawFrame()}panGrid(i,t){this.wilsonDim.gl.useProgram(this.wilsonDim.render.shaderPrograms[1]),this.wilsonDim.gl.uniform2f(this.wilsonDim.uniforms.pan[1],i/this.wilson.worldWidth,-t/this.wilson.worldHeight),this.drawField(),this.wilsonDim.gl.useProgram(this.wilsonDim.render.shaderPrograms[0]),this.wilson.draggables.recalculateLocations()}zoomGrid(i,t,s){if(!(this.zoomLevel<=-3||3<=this.zoomLevel)){var e=Math.pow(2,s),i=(i-this.wilson.worldCenterX)/this.wilson.worldWidth+.5,t=(this.wilson.worldCenterY-t)/this.wilson.worldHeight+.5;if(this.wilsonDim.gl.useProgram(this.wilsonDim.render.shaderPrograms[2]),this.wilsonDim.gl.uniform1f(this.wilsonDim.uniforms.scale[2],e),this.wilsonDim.gl.uniform2f(this.wilsonDim.uniforms.fixedPoint[2],i,t),this.drawField(),this.wilsonDim.gl.useProgram(this.wilsonDim.render.shaderPrograms[0]),this.wilson.draggables.recalculateLocations(),0<s){var o=Math.pow(2,1.5*s);for(let i=0;i<this.particles.length;i++)this.particles[i][2]&&1<=i%o&&this.destroyParticle(i)}}}onDragDraggable(i,t,s,e){this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[0]),this.wilsonUpdate.gl.uniform2f(this.wilsonUpdate.uniforms.draggableArg[0],t,s),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[1]),this.wilsonUpdate.gl.uniform2f(this.wilsonUpdate.uniforms.draggableArg[1],t,s),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[2]),this.wilsonUpdate.gl.uniform2f(this.wilsonUpdate.uniforms.draggableArg[2],t,s),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[3]),this.wilsonUpdate.gl.uniform2f(this.wilsonUpdate.uniforms.draggableArg[3],t,s),this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[4]),this.wilsonUpdate.gl.uniform2f(this.wilsonUpdate.uniforms.draggableArg[4],t,s)}onGrabCanvas(i,t,s){this.panVelocityX=0,this.panVelocityY=0,this.zoomVelocity=0,this.lastPanVelocitiesX=[0,0,0,0],this.lastPanVelocitiesY=[0,0,0,0],this.lastZoomVelocities=[0,0,0,0]}onDragCanvas(i,t,s,e,o){this.nextPanVelocityX+=-s,this.nextPanVelocityY+=-e}onReleaseCanvas(i,t,s){let e=0;this.lastPanVelocitiesX.forEach((i,t)=>{Math.abs(i)>this.panVelocityX&&(this.panVelocityX=Math.abs(i),e=t)}),this.panVelocityX<this.panVelocityStartThreshhold?this.panVelocityX=0:this.panVelocityX=this.lastPanVelocitiesX[e],this.lastPanVelocitiesY.forEach((i,t)=>{Math.abs(i)>this.panVelocityY&&(this.panVelocityY=Math.abs(i),e=t)}),this.panVelocityY<this.panVelocityStartThreshhold?this.panVelocityY=0:this.panVelocityY=this.lastPanVelocitiesY[e],this.lastZoomVelocities.forEach((i,t)=>{Math.abs(i)>this.zoomVelocity&&(this.zoomVelocity=Math.abs(i),e=t)}),this.zoomVelocity<this.zoomVelocityStartThreshhold?this.zoomVelocity=0:this.zoomVelocity=this.lastZoomVelocities[e]}onWheelCanvas(i,t,s,e){this.fixedPointX=i,this.fixedPointY=t,Math.abs(s/100)<.3?(this.nextZoomVelocity=s/100,this.zoomLevel=Math.min(Math.max(this.zoomLevel+s/100,-3),3)):this.zoomVelocity+=.05*Math.sign(s)}onPinchCanvas(i,t,s,e){let o;o=1<=this.aspectRatio?s/this.wilson.worldWidth*10:s/this.wilson.worldHeight*10,this.zoomLevel=Math.min(Math.max(this.zoomLevel-o,-3),3),this.nextZoomVelocity=-o,this.fixedPointX=i,this.fixedPointY=t}zoomCanvas(){var i;1<=this.aspectRatio?(i=this.wilson.input.getZoomedWorldCenter(this.fixedPointX,this.fixedPointY,4*Math.pow(2,this.zoomLevel)*this.aspectRatio,4*Math.pow(2,this.zoomLevel)),this.wilson.worldWidth=4*Math.pow(2,this.zoomLevel)*this.aspectRatio,this.wilson.worldHeight=4*Math.pow(2,this.zoomLevel),this.wilson.worldCenterX=i[0],this.wilson.worldCenterY=i[1]):(i=this.wilson.input.getZoomedWorldCenter(this.fixedPointX,this.fixedPointY,4*Math.pow(2,this.zoomLevel),4*Math.pow(2,this.zoomLevel)/this.aspectRatio),this.wilson.worldWidth=4*Math.pow(2,this.zoomLevel),this.wilson.worldHeight=4*Math.pow(2,this.zoomLevel)/this.aspectRatio,this.wilson.worldCenterX=i[0],this.wilson.worldCenterY=i[1])}changeAspectRatio(){this.wilson.fullscreen.currentlyFullscreen?(this.aspectRatio=window.innerWidth/window.innerHeight,1<=this.aspectRatio?(this.wilson.changeCanvasSize(Math.ceil(this.resolution*this.aspectRatio),this.resolution),this.wilsonDim.changeCanvasSize(Math.ceil(this.resolution*this.aspectRatio),this.resolution),this.wilson.worldWidth=4*Math.pow(2,this.zoomLevel)*this.aspectRatio,this.wilson.worldHeight=4*Math.pow(2,this.zoomLevel)):(this.wilson.changeCanvasSize(this.resolution,Math.ceil(this.resolution/this.aspectRatio)),this.wilsonDim.changeCanvasSize(this.resolution,Math.ceil(this.resolution/this.aspectRatio)),this.wilson.worldWidth=4*Math.pow(2,this.zoomLevel),this.wilson.worldHeight=4*Math.pow(2,this.zoomLevel)/this.aspectRatio)):(this.aspectRatio=1,this.wilson.changeCanvasSize(this.resolution,this.resolution),this.wilsonDim.changeCanvasSize(this.resolution,this.resolution),this.wilson.worldWidth=4*Math.pow(2,this.zoomLevel),this.wilson.worldHeight=4*Math.pow(2,this.zoomLevel))}handleResizeEvent(){this.wilson.fullscreen.currentlyFullscreen&&this.generateNewField()}}export{VectorField};