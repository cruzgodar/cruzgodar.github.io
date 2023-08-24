import{Applet}from"/scripts/src/applets.min.mjs";import{aspectRatio}from"/scripts/src/layout.min.mjs";import{addTemporaryWorker,loadScript}from"/scripts/src/main.min.mjs";import{Wilson}from"/scripts/wilson.min.mjs";class QuasiFuchsianGroups extends Applet{wilsonHidden=null;resolutionSmall=400;resolutionLarge=1200;imageSize=this.resolutionSmall;imageWidth=this.resolutionSmall;imageHeight=this.resolutionSmall;boxSize=4;webWorker=null;lastTimestamp=-1;t=[[2,0],[2,0]];coefficients=[[[0,0],[0,0],[0,0],[0,0]],[[0,0],[0,0],[0,0],[0,0]],[],[]];drawAnotherFrame=!1;needToRestart=!0;maxDepth=200;maxPixelBrightness=50;x=0;y=0;brightness=null;image=null;Complex;constructor(i){super(i);var e={renderer:"gpu",shader:`
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
		`,canvasWidth:this.resolutionSmall,canvasHeight:this.resolutionSmall,worldWidth:1,worldHeight:4,worldCenterX:2,worldCenterY:0,useDraggables:!0,draggablesMousedownCallback:this.onGrabDraggable.bind(this),draggablesTouchstartCallback:this.onGrabDraggable.bind(this),draggablesMousemoveCallback:this.onDragDraggable.bind(this),draggablesTouchmoveCallback:this.onDragDraggable.bind(this),draggablesMouseupCallback:this.onReleaseDraggable.bind(this),draggablesTouchendCallback:this.onReleaseDraggable.bind(this),useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:this.changeAspectRatio.bind(this)};this.wilson=new Wilson(i,e),this.wilson.render.loadNewShader(`
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
		`),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]),this.wilson.render.initUniforms(["textureStep"],0),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]),this.wilson.render.initUniforms(["textureStep"],1),this.wilson.render.createFramebufferTexturePair(),this.wilson.render.createFramebufferTexturePair(this.wilson.gl.UNSIGNED_BYTE),this.image=new Float32Array(this.imageWidth*this.imageHeight*4),this.regenerateHueAndBrightness(),loadScript("/scripts/complex.min.js").then(()=>{this.Complex=Complex,this.initDraggables(),this.changeRecipe(0)})}grandmaCoefficients(i=this.wilson.draggables.worldCoordinates[0][0],e=this.wilson.draggables.worldCoordinates[0][1],t=this.wilson.draggables.worldCoordinates[1][0],s=this.wilson.draggables.worldCoordinates[1][1]){var i=new this.Complex(i,e),e=new this.Complex(t,s),t=i.mul(e),s=i.mul(i).add(e.mul(e)),s=t.mul(t).sub(s.mul(4)),t=(0<s.arg()?t.sub(s.sqrt()):t.add(s.sqrt())).div(2),s=t.sub(2).mul(e).div(e.mul(t).sub(i.mul(2)).add(t.mul(new this.Complex([0,2])))),h=i.div(2),r=i.mul(t).sub(e.mul(2)).add(new this.Complex([0,4])).div(t.mul(2).add(4).mul(s)),i=i.mul(t).sub(e.mul(2)).sub(new this.Complex([0,4])).mul(s).div(t.mul(2).sub(4)),s=e.sub(new this.Complex([0,2])).div(2),t=e.div(2),e=e.add(new this.Complex([0,2])).div(2);this.coefficients[0][0][0]=h.re,this.coefficients[0][0][1]=h.im,this.coefficients[0][1][0]=r.re,this.coefficients[0][1][1]=r.im,this.coefficients[0][2][0]=i.re,this.coefficients[0][2][1]=i.im,this.coefficients[0][3][0]=h.re,this.coefficients[0][3][1]=h.im,this.coefficients[1][0][0]=s.re,this.coefficients[1][0][1]=s.im,this.coefficients[1][1][0]=t.re,this.coefficients[1][1][1]=t.im,this.coefficients[1][2][0]=t.re,this.coefficients[1][2][1]=t.im,this.coefficients[1][3][0]=e.re,this.coefficients[1][3][1]=e.im;for(let i=0;i<2;i++){var a=this.coefficients[i][0][0],o=this.coefficients[i][0][1],n=this.coefficients[i][1][0],l=this.coefficients[i][1][1],g=this.coefficients[i][2][0],c=this.coefficients[i][2][1],m=this.coefficients[i][3][0],u=this.coefficients[i][3][1];this.coefficients[i+2]=[[m,u],[-n,-l],[-g,-c],[a,o]]}}rileyCoefficients(i=this.wilson.draggables.worldCoordinates[0][0],e=this.wilson.draggables.worldCoordinates[0][1]){this.coefficients[0][0][0]=1,this.coefficients[0][0][1]=0,this.coefficients[0][1][0]=0,this.coefficients[0][1][1]=0,this.coefficients[0][2][0]=i,this.coefficients[0][2][1]=e,this.coefficients[0][3][0]=1,this.coefficients[0][3][1]=0,this.coefficients[1][0][0]=1,this.coefficients[1][0][1]=0,this.coefficients[1][1][0]=2,this.coefficients[1][1][1]=0,this.coefficients[1][2][0]=0,this.coefficients[1][2][1]=0,this.coefficients[1][3][0]=1;for(let i=this.coefficients[1][3][1]=0;i<2;i++){var t=this.coefficients[i][0][0],s=this.coefficients[i][0][1],h=this.coefficients[i][1][0],r=this.coefficients[i][1][1],a=this.coefficients[i][2][0],o=this.coefficients[i][2][1],n=this.coefficients[i][3][0],l=this.coefficients[i][3][1];this.coefficients[i+2]=[[n,l],[-h,-r],[-a,-o],[t,s]]}}grandmaSpecialCoefficients(i=this.wilson.draggables.worldCoordinates[0][0],e=this.wilson.draggables.worldCoordinates[0][1],t=this.wilson.draggables.worldCoordinates[1][0],s=this.wilson.draggables.worldCoordinates[1][1],h=this.wilson.draggables.worldCoordinates[2][0],r=this.wilson.draggables.worldCoordinates[2][1]){var i=new this.Complex(i,e),e=new this.Complex(t,s),t=new this.Complex(h,r),s=new this.Complex(0,1),h=new this.Complex(2,0),r=i.mul(i).add(e.mul(e)).add(t.mul(t)).sub(i.mul(e).mul(t)).sub(2),h=h.sub(r).sqrt(),a=r.add(s.mul(h).mul(r.add(2).sqrt())).abs(),r=r.add(2).sqrt().mul(2<=a?1:-1),a=t.sub(2).mul(e.add(r)).div(e.mul(t).sub(i.mul(2)).add(s.mul(h).mul(t))),r=i.div(2),o=i.mul(t).sub(e.mul(2)).add(s.mul(h).mul(2)).div(a.mul(t.mul(2).add(4))),n=a.mul(i.mul(t).sub(e.mul(2)).sub(s.mul(2).mul(h))).div(t.mul(2).sub(4)),l=e.sub(s.mul(h)).div(2),g=e.mul(t).sub(i.mul(2)).add(s.mul(h).mul(t)).div(a.mul(t.mul(2).add(4))),i=e.mul(t).sub(i.mul(2)).sub(s.mul(h).mul(t)).mul(a).div(t.mul(2).sub(4)),a=e.add(s.mul(h)).div(2);this.coefficients[0][0][0]=r.re,this.coefficients[0][0][1]=r.im,this.coefficients[0][1][0]=o.re,this.coefficients[0][1][1]=o.im,this.coefficients[0][2][0]=n.re,this.coefficients[0][2][1]=n.im,this.coefficients[0][3][0]=r.re,this.coefficients[0][3][1]=r.im,this.coefficients[1][0][0]=l.re,this.coefficients[1][0][1]=l.im,this.coefficients[1][1][0]=g.re,this.coefficients[1][1][1]=g.im,this.coefficients[1][2][0]=i.re,this.coefficients[1][2][1]=i.im,this.coefficients[1][3][0]=a.re,this.coefficients[1][3][1]=a.im;for(let i=0;i<2;i++){var c=this.coefficients[i][0][0],m=this.coefficients[i][0][1],u=this.coefficients[i][1][0],f=this.coefficients[i][1][1],d=this.coefficients[i][2][0],x=this.coefficients[i][2][1],w=this.coefficients[i][3][0],b=this.coefficients[i][3][1];this.coefficients[i+2]=[[w,b],[-u,-f],[-d,-x],[c,m]]}}bakeCoefficients=this.grandmaCoefficients;changeRecipe(i){0===i?(this.bakeCoefficients=this.grandmaCoefficients,this.wilson.draggables.draggables[1].style.display="block",this.wilson.draggables.draggables[2].style.display="none"):1===i?(this.bakeCoefficients=this.rileyCoefficients,this.wilson.draggables.draggables[1].style.display="none",this.wilson.draggables.draggables[2].style.display="none"):2===i&&(this.bakeCoefficients=this.grandmaSpecialCoefficients,this.wilson.draggables.draggables[1].style.display="block",this.wilson.draggables.draggables[2].style.display="block")}drawFrame(i){var e=i-this.lastTimestamp;if(this.lastTimestamp=i,0!=e){this.bakeCoefficients();for(let i=0;i<4;i++)this.searchStep(0,0,i,-1,-1,1);let t=0;for(let i=0;i<this.brightness.length;i++)t=Math.max(t,this.brightness[i]);for(let e=0;e<this.imageHeight;e++)for(let i=0;i<this.imageWidth;i++){var s=e*this.imageWidth+i;this.image[4*s]=0,this.image[4*s+1]=1,this.image[4*s+2]=Math.pow(this.brightness[s]/t,.15),this.image[4*s+3]=1}this.renderShaderStack()}}renderShaderStack(){this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]),this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D,this.wilson.render.framebuffers[0].texture),this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER,null),this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D,0,this.wilson.gl.RGBA,this.imageWidth,this.imageHeight,0,this.wilson.gl.RGBA,this.wilson.gl.FLOAT,this.image),this.wilson.render.drawFrame(),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]),this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D,this.wilson.render.framebuffers[1].texture);var e=1e3<=this.imageSize?1:0;for(let i=0;i<e;i++){const t=this.wilson.render.getPixelData();this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D,0,this.wilson.gl.RGBA,this.imageWidth,this.imageHeight,0,this.wilson.gl.RGBA,this.wilson.gl.UNSIGNED_BYTE,t),this.wilson.render.drawFrame()}this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[2]),this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D,this.wilson.render.framebuffers[1].texture);const t=this.wilson.render.getPixelData();this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D,0,this.wilson.gl.RGBA,this.imageWidth,this.imageHeight,0,this.wilson.gl.RGBA,this.wilson.gl.UNSIGNED_BYTE,t),this.wilson.render.drawFrame()}searchStep(e,t,s,i,h,r){if(r!==this.maxDepth)for(let i=3;i<6;i++){this.x=e,this.y=t;var a=(s+i)%4,o=(this.applyTransformation(a),this.imageWidth>=this.imageHeight?Math.floor((-this.y+this.boxSize/2)/this.boxSize*this.imageHeight):Math.floor((-this.y*(this.imageWidth/this.imageHeight)+this.boxSize/2)/this.boxSize*this.imageHeight)),n=this.imageWidth>=this.imageHeight?Math.floor((this.x/(this.imageWidth/this.imageHeight)+this.boxSize/2)/this.boxSize*this.imageWidth):Math.floor((this.x+this.boxSize/2)/this.boxSize*this.imageWidth);if(0<=o&&o<this.imageHeight&&0<=n&&n<this.imageWidth){if(this.brightness[this.imageWidth*o+n]===this.maxPixelBrightness)continue;(10<r||this.imageSize!==this.resolutionSmall)&&this.brightness[this.imageWidth*o+n]++}this.searchStep(this.x,this.y,a,o,n,r+1)}}applyTransformation(i){var e=this.coefficients[i][0][0],t=this.coefficients[i][0][1],s=this.coefficients[i][1][0],h=this.coefficients[i][1][1],r=this.coefficients[i][2][0],a=this.coefficients[i][2][1],o=this.coefficients[i][3][0],i=this.coefficients[i][3][1],s=e*this.x-t*this.y+s,e=e*this.y+t*this.x+h,t=r*this.x-a*this.y+o,h=r*this.y+a*this.x+i,o=e*t-s*h,r=t*t+h*h;this.x=(s*t+e*h)/r,this.y=o/r}initDraggables(){this.wilson.draggables.add(2,0),this.wilson.draggables.add(2,0),this.wilson.draggables.add(2,-2),window.requestAnimationFrame(this.drawFrame.bind(this))}onGrabDraggable(){this.imageSize=this.resolutionSmall,this.wilson.fullscreen.currentlyFullscreen?1<=aspectRatio?(this.imageWidth=Math.floor(this.imageSize*aspectRatio),this.imageHeight=this.imageSize):(this.imageWidth=this.imageSize,this.imageHeight=Math.floor(this.imageSize/aspectRatio)):(this.imageWidth=this.imageSize,this.imageHeight=this.imageSize),this.maxDepth=200,this.maxPixelBrightness=50,this.wilson.changeCanvasSize(this.imageWidth,this.imageHeight),this.regenerateHueAndBrightness(),window.requestAnimationFrame(this.drawFrame.bind(this))}onReleaseDraggable(){this.imageSize=this.resolutionLarge,this.wilson.fullscreen.currentlyFullscreen?1<=aspectRatio?(this.imageWidth=Math.floor(this.imageSize*aspectRatio),this.imageHeight=this.imageSize):(this.imageWidth=this.imageSize,this.imageHeight=Math.floor(this.imageSize/aspectRatio)):(this.imageWidth=this.imageSize,this.imageHeight=this.imageSize),this.maxDepth=200,this.maxPixelBrightness=50,this.wilson.changeCanvasSize(this.imageWidth,this.imageHeight),this.regenerateHueAndBrightness(),window.requestAnimationFrame(this.drawFrame.bind(this))}onDragDraggable(){for(let e=0;e<this.imageHeight;e++)for(let i=0;i<this.imageWidth;i++)this.brightness[this.imageWidth*e+i]=0;window.requestAnimationFrame(this.drawFrame.bind(this))}async requestHighResFrame(i,e,t,s=this.boxSize){this.imageSize=i,this.maxDepth=e,this.maxPixelBrightness=t,this.boxSize=s,this.wilson.fullscreen.currentlyFullscreen?1<=aspectRatio?(this.imageWidth=Math.floor(this.imageSize*aspectRatio),this.imageHeight=this.imageSize):(this.imageWidth=this.imageSize,this.imageHeight=Math.floor(this.imageSize/aspectRatio)):(this.imageWidth=this.imageSize,this.imageHeight=this.imageSize),this.regenerateHueAndBrightness(),this.webWorker=addTemporaryWorker("/applets/quasi-fuchsian-groups/scripts/worker.js");i=new Promise(e=>{this.webWorker.onmessage=i=>{this.brightness=i.data[0],this.wilson.changeCanvasSize(this.imageWidth,this.imageHeight);for(let e=0;e<this.imageHeight;e++)for(let i=0;i<this.imageWidth;i++){var t=e*this.imageWidth+i;this.image[4*t]=0,this.image[4*t+1]=0,this.image[4*t+2]=this.brightness[t],this.image[4*t+3]=0}this.renderShaderStack(),e()}});this.webWorker.postMessage([this.imageWidth,this.imageHeight,this.maxDepth,this.maxPixelBrightness,this.boxSize,this.coefficients]),await i}regenerateHueAndBrightness(){this.brightness=new Float32Array(this.imageWidth*this.imageHeight),this.image=new Float32Array(this.imageWidth*this.imageHeight*4),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]),this.wilson.gl.uniform1f(this.wilson.uniforms.textureStep[0],1/this.imageSize),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]),this.wilson.gl.uniform1f(this.wilson.uniforms.textureStep[1],1/this.imageSize);for(let e=0;e<this.imageHeight;e++)for(let i=0;i<this.imageWidth;i++)this.brightness[this.imageWidth*e+i]=0}changeAspectRatio(){this.imageSize=this.resolutionSmall,this.wilson.fullscreen.currentlyFullscreen?1<=aspectRatio?(this.imageWidth=Math.floor(this.imageSize*aspectRatio),this.imageHeight=this.imageSize):(this.imageWidth=this.imageSize,this.imageHeight=Math.floor(this.imageSize/aspectRatio)):(this.imageWidth=this.imageSize,this.imageHeight=this.imageSize),this.wilson.changeCanvasSize(this.imageWidth,this.imageHeight),this.regenerateHueAndBrightness(),window.requestAnimationFrame(this.drawFrame.bind(this))}}export{QuasiFuchsianGroups};