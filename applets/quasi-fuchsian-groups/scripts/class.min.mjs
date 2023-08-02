import{Applet}from"/scripts/src/applets.min.mjs";class QuasiFuchsianGroups extends Applet{loadPromise=null;wilsonHidden=null;resolutionSmall=400;resolutionLarge=1200;imageSize=this.resolutionSmall;imageWidth=this.resolutionSmall;imageHeight=this.resolutionSmall;boxSize=4;webWorker=null;lastTimestamp=-1;t=[[2,0],[2,0]];coefficients=[[[0,0],[0,0],[0,0],[0,0]],[[0,0],[0,0],[0,0],[0,0]],[],[]];drawAnotherFrame=!1;needToRestart=!0;maxDepth=200;maxPixelBrightness=50;x=0;y=0;brightness=null;image=null;constructor(e){super(e);var i={renderer:"gpu",shader:`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float textureStep;
			
			
			
			void main(void)
			{
				//remove isolated pixels.
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				
				float brightness =
					texture2D(uTexture, center + vec2(textureStep, 0.0)).z +
					texture2D(uTexture, center - vec2(textureStep, 0.0)).z +
					texture2D(uTexture, center + vec2(0.0, textureStep)).z +
					texture2D(uTexture, center - vec2(0.0, textureStep)).z +
					texture2D(uTexture, center + vec2(textureStep, textureStep)).z +
					texture2D(uTexture, center + vec2(textureStep, -textureStep)).z +
					texture2D(uTexture, center + vec2(-textureStep, textureStep)).z +
					texture2D(uTexture, center + vec2(-textureStep, -textureStep)).z;
				
				if (brightness < 0.1)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
					
					return;
				}
				
				
				gl_FragColor = vec4(0.0, 0.0, texture2D(uTexture, center).z, 1.0);
			}
		`,canvasWidth:this.resolutionSmall,canvasHeight:this.resolutionSmall,worldWidth:1,worldHeight:4,worldCenterX:2,worldCenterY:0,useDraggables:!0,draggablesMousedownCallback:this.onGrabDraggable.bind(this),draggablesTouchstartCallback:this.onGrabDraggable.bind(this),draggablesMousemoveCallback:this.onDragDraggable.bind(this),draggablesTouchmoveCallback:this.onDragDraggable.bind(this),draggablesMouseupCallback:this.onReleaseDraggable.bind(this),draggablesTouchendCallback:this.onReleaseDraggable.bind(this),useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:this.changeAspectRatio.bind(this)};this.wilson=new Wilson(e,i),this.wilson.render.loadNewShader(`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float textureStep;
			
			
			
			void main(void)
			{
				//Dilate the pixels to make a thicker line.
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				
				float brightness =
					max(max(max(texture2D(uTexture, center + vec2(textureStep, 0.0)).z,
					texture2D(uTexture, center - vec2(textureStep, 0.0)).z),
					max(texture2D(uTexture, center + vec2(0.0, textureStep)).z,
					texture2D(uTexture, center - vec2(0.0, textureStep)).z)),
					
					max(max(texture2D(uTexture, center + vec2(textureStep, textureStep)).z,
					texture2D(uTexture, center + vec2(textureStep, -textureStep)).z),
					max(texture2D(uTexture, center + vec2(-textureStep, textureStep)).z,
					texture2D(uTexture, center + vec2(-textureStep, -textureStep)).z)));
					
				brightness = max(brightness, texture2D(uTexture, center).z);
				
				gl_FragColor = vec4(0.0, 0.0, brightness, 1.0);
			}
		`),this.wilson.render.loadNewShader(`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			void main(void)
			{
				//Dilate the pixels to make a thicker line.
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				
				vec2 z = 3.0 * uv;
				vec3 color = 1.5 * normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				
				gl_FragColor = vec4(color * texture2D(uTexture, center).z, 1.0);
			}
		`),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]),this.wilson.render.initUniforms(["textureStep"],0),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]),this.wilson.render.initUniforms(["textureStep"],1),this.wilson.render.createFramebufferTexturePair(),this.wilson.render.createFramebufferTexturePair(this.wilson.gl.UNSIGNED_BYTE),this.image=new Float32Array(this.imageWidth*this.imageHeight*4),this.regenerateHueAndBrightness(),this.loadPromise=new Promise(async(e,i)=>{Site.scriptsLoaded.complexjs||(await Site.loadScript("/scripts/complex.min.js"),Site.scriptsLoaded.complexjs=!0),this.initDraggables(),this.changeRecipe(0),e()})}grandmaCoefficients(e=this.wilson.draggables.worldCoordinates[0][0],i=this.wilson.draggables.worldCoordinates[0][1],t=this.wilson.draggables.worldCoordinates[1][0],s=this.wilson.draggables.worldCoordinates[1][1]){var e=new Complex(e,i),i=new Complex(t,s),t=e.mul(i),s=e.mul(e).add(i.mul(i)),s=t.mul(t).sub(s.mul(4)),t=(0<s.arg()?t.sub(s.sqrt()):t.add(s.sqrt())).div(2),s=t.sub(2).mul(i).div(i.mul(t).sub(e.mul(2)).add(t.mul(new Complex([0,2])))),a=e.div(2),h=e.mul(t).sub(i.mul(2)).add(new Complex([0,4])).div(t.mul(2).add(4).mul(s)),e=e.mul(t).sub(i.mul(2)).sub(new Complex([0,4])).mul(s).div(t.mul(2).sub(4)),s=i.sub(new Complex([0,2])).div(2),t=i.div(2),i=i.add(new Complex([0,2])).div(2);this.coefficients[0][0][0]=a.re,this.coefficients[0][0][1]=a.im,this.coefficients[0][1][0]=h.re,this.coefficients[0][1][1]=h.im,this.coefficients[0][2][0]=e.re,this.coefficients[0][2][1]=e.im,this.coefficients[0][3][0]=a.re,this.coefficients[0][3][1]=a.im,this.coefficients[1][0][0]=s.re,this.coefficients[1][0][1]=s.im,this.coefficients[1][1][0]=t.re,this.coefficients[1][1][1]=t.im,this.coefficients[1][2][0]=t.re,this.coefficients[1][2][1]=t.im,this.coefficients[1][3][0]=i.re,this.coefficients[1][3][1]=i.im;for(let e=0;e<2;e++){var r=this.coefficients[e][0][0],o=this.coefficients[e][0][1],n=this.coefficients[e][1][0],l=this.coefficients[e][1][1],g=this.coefficients[e][2][0],c=this.coefficients[e][2][1],m=this.coefficients[e][3][0],u=this.coefficients[e][3][1];this.coefficients[e+2]=[[m,u],[-n,-l],[-g,-c],[r,o]]}}rileyCoefficients(e=this.wilson.draggables.worldCoordinates[0][0],i=this.wilson.draggables.worldCoordinates[0][1]){this.coefficients[0][0][0]=1,this.coefficients[0][0][1]=0,this.coefficients[0][1][0]=0,this.coefficients[0][1][1]=0,this.coefficients[0][2][0]=e,this.coefficients[0][2][1]=i,this.coefficients[0][3][0]=1,this.coefficients[0][3][1]=0,this.coefficients[1][0][0]=1,this.coefficients[1][0][1]=0,this.coefficients[1][1][0]=2,this.coefficients[1][1][1]=0,this.coefficients[1][2][0]=0,this.coefficients[1][2][1]=0,this.coefficients[1][3][0]=1;for(let e=this.coefficients[1][3][1]=0;e<2;e++){var t=this.coefficients[e][0][0],s=this.coefficients[e][0][1],a=this.coefficients[e][1][0],h=this.coefficients[e][1][1],r=this.coefficients[e][2][0],o=this.coefficients[e][2][1],n=this.coefficients[e][3][0],l=this.coefficients[e][3][1];this.coefficients[e+2]=[[n,l],[-a,-h],[-r,-o],[t,s]]}}grandmaSpecialCoefficients(e=this.wilson.draggables.worldCoordinates[0][0],i=this.wilson.draggables.worldCoordinates[0][1],t=this.wilson.draggables.worldCoordinates[1][0],s=this.wilson.draggables.worldCoordinates[1][1],a=this.wilson.draggables.worldCoordinates[2][0],h=this.wilson.draggables.worldCoordinates[2][1]){var e=new Complex(e,i),i=new Complex(t,s),t=new Complex(a,h),s=new Complex(0,1),a=new Complex(2,0),h=e.mul(e).add(i.mul(i)).add(t.mul(t)).sub(e.mul(i).mul(t)).sub(2),a=a.sub(h).sqrt(),r=h.add(s.mul(a).mul(h.add(2).sqrt())).abs(),h=h.add(2).sqrt().mul(2<=r?1:-1),r=t.sub(2).mul(i.add(h)).div(i.mul(t).sub(e.mul(2)).add(s.mul(a).mul(t))),h=e.div(2),o=e.mul(t).sub(i.mul(2)).add(s.mul(a).mul(2)).div(r.mul(t.mul(2).add(4))),n=r.mul(e.mul(t).sub(i.mul(2)).sub(s.mul(2).mul(a))).div(t.mul(2).sub(4)),l=i.sub(s.mul(a)).div(2),g=i.mul(t).sub(e.mul(2)).add(s.mul(a).mul(t)).div(r.mul(t.mul(2).add(4))),e=i.mul(t).sub(e.mul(2)).sub(s.mul(a).mul(t)).mul(r).div(t.mul(2).sub(4)),r=i.add(s.mul(a)).div(2);this.coefficients[0][0][0]=h.re,this.coefficients[0][0][1]=h.im,this.coefficients[0][1][0]=o.re,this.coefficients[0][1][1]=o.im,this.coefficients[0][2][0]=n.re,this.coefficients[0][2][1]=n.im,this.coefficients[0][3][0]=h.re,this.coefficients[0][3][1]=h.im,this.coefficients[1][0][0]=l.re,this.coefficients[1][0][1]=l.im,this.coefficients[1][1][0]=g.re,this.coefficients[1][1][1]=g.im,this.coefficients[1][2][0]=e.re,this.coefficients[1][2][1]=e.im,this.coefficients[1][3][0]=r.re,this.coefficients[1][3][1]=r.im;for(let e=0;e<2;e++){var c=this.coefficients[e][0][0],m=this.coefficients[e][0][1],u=this.coefficients[e][1][0],d=this.coefficients[e][1][1],f=this.coefficients[e][2][0],x=this.coefficients[e][2][1],w=this.coefficients[e][3][0],b=this.coefficients[e][3][1];this.coefficients[e+2]=[[w,b],[-u,-d],[-f,-x],[c,m]]}}bakeCoefficients=this.grandmaCoefficients;changeRecipe(e){0===e?(this.bakeCoefficients=this.grandmaCoefficients,this.wilson.draggables.draggables[1].style.display="block",this.wilson.draggables.draggables[2].style.display="none"):1===e?(this.bakeCoefficients=this.rileyCoefficients,this.wilson.draggables.draggables[1].style.display="none",this.wilson.draggables.draggables[2].style.display="none"):2===e&&(this.bakeCoefficients=this.grandmaSpecialCoefficients,this.wilson.draggables.draggables[1].style.display="block",this.wilson.draggables.draggables[2].style.display="block")}drawFrame(e){var i=e-this.lastTimestamp;if(this.lastTimestamp=e,0!=i){this.bakeCoefficients();for(let e=0;e<4;e++)this.searchStep(0,0,e,-1,-1,1);let t=0;for(let e=0;e<this.brightness.length;e++)t=Math.max(t,this.brightness[e]);for(let i=0;i<this.imageHeight;i++)for(let e=0;e<this.imageWidth;e++){var s=i*this.imageWidth+e;this.image[4*s]=0,this.image[4*s+1]=1,this.image[4*s+2]=Math.pow(this.brightness[s]/t,.15),this.image[4*s+3]=1}this.renderShaderStack()}}renderShaderStack(){this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]),this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D,this.wilson.render.framebuffers[0].texture),this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER,null),this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D,0,this.wilson.gl.RGBA,this.imageWidth,this.imageHeight,0,this.wilson.gl.RGBA,this.wilson.gl.FLOAT,this.image),this.wilson.render.drawFrame(),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]),this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D,this.wilson.render.framebuffers[1].texture);var i=1e3<=this.imageSize?1:0;for(let e=0;e<i;e++){const t=this.wilson.render.getPixelData();this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D,0,this.wilson.gl.RGBA,this.imageWidth,this.imageHeight,0,this.wilson.gl.RGBA,this.wilson.gl.UNSIGNED_BYTE,t),this.wilson.render.drawFrame()}this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[2]),this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D,this.wilson.render.framebuffers[1].texture);const t=this.wilson.render.getPixelData();this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D,0,this.wilson.gl.RGBA,this.imageWidth,this.imageHeight,0,this.wilson.gl.RGBA,this.wilson.gl.UNSIGNED_BYTE,t),this.wilson.render.drawFrame()}searchStep(i,t,s,e,a,h){if(h!==this.maxDepth)for(let e=3;e<6;e++){this.x=i,this.y=t;var r=(s+e)%4,o=(this.applyTransformation(r),this.imageWidth>=this.imageHeight?Math.floor((-this.y+this.boxSize/2)/this.boxSize*this.imageHeight):Math.floor((-this.y*(this.imageWidth/this.imageHeight)+this.boxSize/2)/this.boxSize*this.imageHeight)),n=this.imageWidth>=this.imageHeight?Math.floor((this.x/(this.imageWidth/this.imageHeight)+this.boxSize/2)/this.boxSize*this.imageWidth):Math.floor((this.x+this.boxSize/2)/this.boxSize*this.imageWidth);if(0<=o&&o<this.imageHeight&&0<=n&&n<this.imageWidth){if(this.brightness[this.imageWidth*o+n]===this.maxPixelBrightness)continue;(10<h||this.imageSize!==this.resolutionSmall)&&this.brightness[this.imageWidth*o+n]++}this.searchStep(this.x,this.y,r,o,n,h+1)}}applyTransformation(e){var i=this.coefficients[e][0][0],t=this.coefficients[e][0][1],s=this.coefficients[e][1][0],a=this.coefficients[e][1][1],h=this.coefficients[e][2][0],r=this.coefficients[e][2][1],o=this.coefficients[e][3][0],e=this.coefficients[e][3][1],s=i*this.x-t*this.y+s,i=i*this.y+t*this.x+a,t=h*this.x-r*this.y+o,a=h*this.y+r*this.x+e,o=i*t-s*a,h=t*t+a*a;this.x=(s*t+i*a)/h,this.y=o/h}initDraggables(){this.wilson.draggables.add(2,0),this.wilson.draggables.add(2,0),this.wilson.draggables.add(2,-2),window.requestAnimationFrame(this.drawFrame.bind(this))}onGrabDraggable(e,i,t,s){this.imageSize=this.resolutionSmall,this.wilson.fullscreen.currentlyFullscreen?1<=Page.Layout.aspectRatio?(this.imageWidth=Math.floor(this.imageSize*Page.Layout.aspectRatio),this.imageHeight=this.imageSize):(this.imageWidth=this.imageSize,this.imageHeight=Math.floor(this.imageSize/Page.Layout.aspectRatio)):(this.imageWidth=this.imageSize,this.imageHeight=this.imageSize),this.maxDepth=200,this.maxPixelBrightness=50,this.wilson.changeCanvasSize(this.imageWidth,this.imageHeight),this.regenerateHueAndBrightness(),window.requestAnimationFrame(this.drawFrame.bind(this))}onReleaseDraggable(e,i,t,s){this.imageSize=this.resolutionLarge,this.wilson.fullscreen.currentlyFullscreen?1<=Page.Layout.aspectRatio?(this.imageWidth=Math.floor(this.imageSize*Page.Layout.aspectRatio),this.imageHeight=this.imageSize):(this.imageWidth=this.imageSize,this.imageHeight=Math.floor(this.imageSize/Page.Layout.aspectRatio)):(this.imageWidth=this.imageSize,this.imageHeight=this.imageSize),this.maxDepth=200,this.maxPixelBrightness=50,this.wilson.changeCanvasSize(this.imageWidth,this.imageHeight),this.regenerateHueAndBrightness(),window.requestAnimationFrame(this.drawFrame.bind(this))}onDragDraggable(e,i,t,s){for(let i=0;i<this.imageHeight;i++)for(let e=0;e<this.imageWidth;e++)this.brightness[this.imageWidth*i+e]=0;window.requestAnimationFrame(this.drawFrame.bind(this))}requestHighResFrame(t,s,a,h=this.boxSize){return new Promise((i,e)=>{this.imageSize=t,this.maxDepth=s,this.maxPixelBrightness=a,this.boxSize=h,this.wilson.fullscreen.currentlyFullscreen?1<=Page.Layout.aspectRatio?(this.imageWidth=Math.floor(this.imageSize*Page.Layout.aspectRatio),this.imageHeight=this.imageSize):(this.imageWidth=this.imageSize,this.imageHeight=Math.floor(this.imageSize/Page.Layout.aspectRatio)):(this.imageWidth=this.imageSize,this.imageHeight=this.imageSize),this.regenerateHueAndBrightness();try{this.webWorker.terminate()}catch(e){}this.webWorker=new Worker(`/applets/quasi-fuchsian-groups/scripts/worker.${DEBUG?"":"min."}js`),this.workers.push(this.webWorker),this.webWorker.onmessage=e=>{this.brightness=e.data[0],this.wilson.changeCanvasSize(this.imageWidth,this.imageHeight);for(let i=0;i<this.imageHeight;i++)for(let e=0;e<this.imageWidth;e++){var t=i*this.imageWidth+e;this.image[4*t]=0,this.image[4*t+1]=0,this.image[4*t+2]=this.brightness[t],this.image[4*t+3]=0}this.renderShaderStack(),i()},this.webWorker.postMessage([this.imageWidth,this.imageHeight,this.maxDepth,this.maxPixelBrightness,this.boxSize,this.coefficients])})}regenerateHueAndBrightness(){this.brightness=new Float32Array(this.imageWidth*this.imageHeight),this.image=new Float32Array(this.imageWidth*this.imageHeight*4),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]),this.wilson.gl.uniform1f(this.wilson.uniforms.textureStep[0],1/this.imageSize),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]),this.wilson.gl.uniform1f(this.wilson.uniforms.textureStep[1],1/this.imageSize);for(let i=0;i<this.imageHeight;i++)for(let e=0;e<this.imageWidth;e++)this.brightness[this.imageWidth*i+e]=0}changeAspectRatio(){this.imageSize=this.resolutionSmall,this.wilson.fullscreen.currentlyFullscreen?1<=Page.Layout.aspectRatio?(this.imageWidth=Math.floor(this.imageSize*Page.Layout.aspectRatio),this.imageHeight=this.imageSize):(this.imageWidth=this.imageSize,this.imageHeight=Math.floor(this.imageSize/Page.Layout.aspectRatio)):(this.imageWidth=this.imageSize,this.imageHeight=this.imageSize),this.wilson.changeCanvasSize(this.imageWidth,this.imageHeight),this.regenerateHueAndBrightness(),window.requestAnimationFrame(this.drawFrame.bind(this))}}export{QuasiFuchsianGroups};