import{Applet}from"/scripts/src/applets.min.mjs";import{aspectRatio}from"/scripts/src/layout.min.mjs";import{addTemporaryWorker,loadScript}from"/scripts/src/main.min.mjs";import{Wilson}from"/scripts/wilson.min.mjs";class QuasiFuchsianGroups extends Applet{wilsonHidden=null;resolutionSmall=400;resolutionLarge=1200;imageSize=this.resolutionSmall;imageWidth=this.resolutionSmall;imageHeight=this.resolutionSmall;boxSize=4;webWorker=null;lastTimestamp=-1;t=[[2,0],[2,0]];coefficients=[[[0,0],[0,0],[0,0],[0,0]],[[0,0],[0,0],[0,0],[0,0]],[],[]];drawAnotherFrame=!1;needToRestart=!0;maxDepth=200;maxPixelBrightness=50;x=0;y=0;brightness=null;image=null;Complex;constructor(canvas){super(canvas);var options={renderer:"gpu",shader:`
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
		`,canvasWidth:this.resolutionSmall,canvasHeight:this.resolutionSmall,worldWidth:1,worldHeight:4,worldCenterX:2,worldCenterY:0,useDraggables:!0,draggablesMousedownCallback:this.onGrabDraggable.bind(this),draggablesTouchstartCallback:this.onGrabDraggable.bind(this),draggablesMousemoveCallback:this.onDragDraggable.bind(this),draggablesTouchmoveCallback:this.onDragDraggable.bind(this),draggablesMouseupCallback:this.onReleaseDraggable.bind(this),draggablesTouchendCallback:this.onReleaseDraggable.bind(this),useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:this.changeAspectRatio.bind(this)};this.wilson=new Wilson(canvas,options),this.wilson.render.loadNewShader(`
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
		`),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]),this.wilson.render.initUniforms(["textureStep"],0),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]),this.wilson.render.initUniforms(["textureStep"],1),this.wilson.render.createFramebufferTexturePair(),this.wilson.render.createFramebufferTexturePair(this.wilson.gl.UNSIGNED_BYTE),this.image=new Float32Array(this.imageWidth*this.imageHeight*4),this.regenerateHueAndBrightness(),loadScript("/scripts/complex.min.js").then(()=>{this.Complex=Complex,this.initDraggables(),this.changeRecipe(0)})}grandmaCoefficients(x1=this.wilson.draggables.worldCoordinates[0][0],y1=this.wilson.draggables.worldCoordinates[0][1],x2=this.wilson.draggables.worldCoordinates[1][0],y2=this.wilson.draggables.worldCoordinates[1][1]){var x1=new this.Complex(x1,y1),y1=new this.Complex(x2,y2),x2=x1.mul(y1),y2=x1.mul(x1).add(y1.mul(y1)),y2=x2.mul(x2).sub(y2.mul(4)),x2=(0<y2.arg()?x2.sub(y2.sqrt()):x2.add(y2.sqrt())).div(2),y2=x2.sub(2).mul(y1).div(y1.mul(x2).sub(x1.mul(2)).add(x2.mul(new this.Complex([0,2])))),c1=x1.div(2),c2=x1.mul(x2).sub(y1.mul(2)).add(new this.Complex([0,4])).div(x2.mul(2).add(4).mul(y2)),x1=x1.mul(x2).sub(y1.mul(2)).sub(new this.Complex([0,4])).mul(y2).div(x2.mul(2).sub(4)),y2=y1.sub(new this.Complex([0,2])).div(2),x2=y1.div(2),y1=y1.add(new this.Complex([0,2])).div(2);this.coefficients[0][0][0]=c1.re,this.coefficients[0][0][1]=c1.im,this.coefficients[0][1][0]=c2.re,this.coefficients[0][1][1]=c2.im,this.coefficients[0][2][0]=x1.re,this.coefficients[0][2][1]=x1.im,this.coefficients[0][3][0]=c1.re,this.coefficients[0][3][1]=c1.im,this.coefficients[1][0][0]=y2.re,this.coefficients[1][0][1]=y2.im,this.coefficients[1][1][0]=x2.re,this.coefficients[1][1][1]=x2.im,this.coefficients[1][2][0]=x2.re,this.coefficients[1][2][1]=x2.im,this.coefficients[1][3][0]=y1.re,this.coefficients[1][3][1]=y1.im;for(let i=0;i<2;i++){var ax=this.coefficients[i][0][0],ay=this.coefficients[i][0][1],bx=this.coefficients[i][1][0],by=this.coefficients[i][1][1],cx=this.coefficients[i][2][0],cy=this.coefficients[i][2][1],dx=this.coefficients[i][3][0],dy=this.coefficients[i][3][1];this.coefficients[i+2]=[[dx,dy],[-bx,-by],[-cx,-cy],[ax,ay]]}}rileyCoefficients(x1=this.wilson.draggables.worldCoordinates[0][0],y1=this.wilson.draggables.worldCoordinates[0][1]){this.coefficients[0][0][0]=1,this.coefficients[0][0][1]=0,this.coefficients[0][1][0]=0,this.coefficients[0][1][1]=0,this.coefficients[0][2][0]=x1,this.coefficients[0][2][1]=y1,this.coefficients[0][3][0]=1,this.coefficients[0][3][1]=0,this.coefficients[1][0][0]=1,this.coefficients[1][0][1]=0,this.coefficients[1][1][0]=2,this.coefficients[1][1][1]=0,this.coefficients[1][2][0]=0,this.coefficients[1][2][1]=0,this.coefficients[1][3][0]=1;for(let i=this.coefficients[1][3][1]=0;i<2;i++){var ax=this.coefficients[i][0][0],ay=this.coefficients[i][0][1],bx=this.coefficients[i][1][0],by=this.coefficients[i][1][1],cx=this.coefficients[i][2][0],cy=this.coefficients[i][2][1],dx=this.coefficients[i][3][0],dy=this.coefficients[i][3][1];this.coefficients[i+2]=[[dx,dy],[-bx,-by],[-cx,-cy],[ax,ay]]}}grandmaSpecialCoefficients(x1=this.wilson.draggables.worldCoordinates[0][0],y1=this.wilson.draggables.worldCoordinates[0][1],x2=this.wilson.draggables.worldCoordinates[1][0],y2=this.wilson.draggables.worldCoordinates[1][1],x3=this.wilson.draggables.worldCoordinates[2][0],y3=this.wilson.draggables.worldCoordinates[2][1]){var x1=new this.Complex(x1,y1),y1=new this.Complex(x2,y2),x2=new this.Complex(x3,y3),y2=new this.Complex(0,1),x3=new this.Complex(2,0),y3=x1.mul(x1).add(y1.mul(y1)).add(x2.mul(x2)).sub(x1.mul(y1).mul(x2)).sub(2),x3=x3.sub(y3).sqrt(),mag=y3.add(y2.mul(x3).mul(y3.add(2).sqrt())).abs(),y3=y3.add(2).sqrt().mul(2<=mag?1:-1),mag=x2.sub(2).mul(y1.add(y3)).div(y1.mul(x2).sub(x1.mul(2)).add(y2.mul(x3).mul(x2))),y3=x1.div(2),c2=x1.mul(x2).sub(y1.mul(2)).add(y2.mul(x3).mul(2)).div(mag.mul(x2.mul(2).add(4))),c3=mag.mul(x1.mul(x2).sub(y1.mul(2)).sub(y2.mul(2).mul(x3))).div(x2.mul(2).sub(4)),c4=y1.sub(y2.mul(x3)).div(2),c5=y1.mul(x2).sub(x1.mul(2)).add(y2.mul(x3).mul(x2)).div(mag.mul(x2.mul(2).add(4))),x1=y1.mul(x2).sub(x1.mul(2)).sub(y2.mul(x3).mul(x2)).mul(mag).div(x2.mul(2).sub(4)),mag=y1.add(y2.mul(x3)).div(2);this.coefficients[0][0][0]=y3.re,this.coefficients[0][0][1]=y3.im,this.coefficients[0][1][0]=c2.re,this.coefficients[0][1][1]=c2.im,this.coefficients[0][2][0]=c3.re,this.coefficients[0][2][1]=c3.im,this.coefficients[0][3][0]=y3.re,this.coefficients[0][3][1]=y3.im,this.coefficients[1][0][0]=c4.re,this.coefficients[1][0][1]=c4.im,this.coefficients[1][1][0]=c5.re,this.coefficients[1][1][1]=c5.im,this.coefficients[1][2][0]=x1.re,this.coefficients[1][2][1]=x1.im,this.coefficients[1][3][0]=mag.re,this.coefficients[1][3][1]=mag.im;for(let i=0;i<2;i++){var ax=this.coefficients[i][0][0],ay=this.coefficients[i][0][1],bx=this.coefficients[i][1][0],by=this.coefficients[i][1][1],cx=this.coefficients[i][2][0],cy=this.coefficients[i][2][1],dx=this.coefficients[i][3][0],dy=this.coefficients[i][3][1];this.coefficients[i+2]=[[dx,dy],[-bx,-by],[-cx,-cy],[ax,ay]]}}bakeCoefficients=this.grandmaCoefficients;changeRecipe(index){0===index?(this.bakeCoefficients=this.grandmaCoefficients,this.wilson.draggables.draggables[1].style.display="block",this.wilson.draggables.draggables[2].style.display="none"):1===index?(this.bakeCoefficients=this.rileyCoefficients,this.wilson.draggables.draggables[1].style.display="none",this.wilson.draggables.draggables[2].style.display="none"):2===index&&(this.bakeCoefficients=this.grandmaSpecialCoefficients,this.wilson.draggables.draggables[1].style.display="block",this.wilson.draggables.draggables[2].style.display="block")}drawFrame(timestamp){var timeElapsed=timestamp-this.lastTimestamp;if(this.lastTimestamp=timestamp,0!=timeElapsed){this.bakeCoefficients();for(let i=0;i<4;i++)this.searchStep(0,0,i,-1,-1,1);let maxBrightness=0;for(let i=0;i<this.brightness.length;i++)maxBrightness=Math.max(maxBrightness,this.brightness[i]);for(let i=0;i<this.imageHeight;i++)for(let j=0;j<this.imageWidth;j++){var index=i*this.imageWidth+j;this.image[4*index]=0,this.image[4*index+1]=1,this.image[4*index+2]=Math.pow(this.brightness[index]/maxBrightness,.15),this.image[4*index+3]=1}this.renderShaderStack()}}renderShaderStack(){this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]),this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D,this.wilson.render.framebuffers[0].texture),this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER,null),this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D,0,this.wilson.gl.RGBA,this.imageWidth,this.imageHeight,0,this.wilson.gl.RGBA,this.wilson.gl.FLOAT,this.image),this.wilson.render.drawFrame(),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]),this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D,this.wilson.render.framebuffers[1].texture);var numDilations=1e3<=this.imageSize?1:0;for(let i=0;i<numDilations;i++){const pixelData=this.wilson.render.getPixelData();this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D,0,this.wilson.gl.RGBA,this.imageWidth,this.imageHeight,0,this.wilson.gl.RGBA,this.wilson.gl.UNSIGNED_BYTE,pixelData),this.wilson.render.drawFrame()}this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[2]),this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D,this.wilson.render.framebuffers[1].texture);const pixelData=this.wilson.render.getPixelData();this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D,0,this.wilson.gl.RGBA,this.imageWidth,this.imageHeight,0,this.wilson.gl.RGBA,this.wilson.gl.UNSIGNED_BYTE,pixelData),this.wilson.render.drawFrame()}searchStep(startX,startY,lastTransformationIndex,lastRow,lastCol,depth){if(depth!==this.maxDepth)for(let i=3;i<6;i++){this.x=startX,this.y=startY;var transformationIndex=(lastTransformationIndex+i)%4,row=(this.applyTransformation(transformationIndex),this.imageWidth>=this.imageHeight?Math.floor((-this.y+this.boxSize/2)/this.boxSize*this.imageHeight):Math.floor((-this.y*(this.imageWidth/this.imageHeight)+this.boxSize/2)/this.boxSize*this.imageHeight)),col=this.imageWidth>=this.imageHeight?Math.floor((this.x/(this.imageWidth/this.imageHeight)+this.boxSize/2)/this.boxSize*this.imageWidth):Math.floor((this.x+this.boxSize/2)/this.boxSize*this.imageWidth);if(0<=row&&row<this.imageHeight&&0<=col&&col<this.imageWidth){if(this.brightness[this.imageWidth*row+col]===this.maxPixelBrightness)continue;(10<depth||this.imageSize!==this.resolutionSmall)&&this.brightness[this.imageWidth*row+col]++}this.searchStep(this.x,this.y,transformationIndex,row,col,depth+1)}}applyTransformation(index){var ax=this.coefficients[index][0][0],ay=this.coefficients[index][0][1],bx=this.coefficients[index][1][0],by=this.coefficients[index][1][1],cx=this.coefficients[index][2][0],cy=this.coefficients[index][2][1],dx=this.coefficients[index][3][0],index=this.coefficients[index][3][1],bx=ax*this.x-ay*this.y+bx,ax=ax*this.y+ay*this.x+by,ay=cx*this.x-cy*this.y+dx,by=cx*this.y+cy*this.x+index,dx=ax*ay-bx*by,cx=ay*ay+by*by;this.x=(bx*ay+ax*by)/cx,this.y=dx/cx}initDraggables(){this.wilson.draggables.add(2,0),this.wilson.draggables.add(2,0),this.wilson.draggables.add(2,-2),window.requestAnimationFrame(this.drawFrame.bind(this))}onGrabDraggable(){this.imageSize=this.resolutionSmall,this.wilson.fullscreen.currentlyFullscreen?1<=aspectRatio?(this.imageWidth=Math.floor(this.imageSize*aspectRatio),this.imageHeight=this.imageSize):(this.imageWidth=this.imageSize,this.imageHeight=Math.floor(this.imageSize/aspectRatio)):(this.imageWidth=this.imageSize,this.imageHeight=this.imageSize),this.maxDepth=200,this.maxPixelBrightness=50,this.wilson.changeCanvasSize(this.imageWidth,this.imageHeight),this.regenerateHueAndBrightness(),window.requestAnimationFrame(this.drawFrame.bind(this))}onReleaseDraggable(){this.imageSize=this.resolutionLarge,this.wilson.fullscreen.currentlyFullscreen?1<=aspectRatio?(this.imageWidth=Math.floor(this.imageSize*aspectRatio),this.imageHeight=this.imageSize):(this.imageWidth=this.imageSize,this.imageHeight=Math.floor(this.imageSize/aspectRatio)):(this.imageWidth=this.imageSize,this.imageHeight=this.imageSize),this.maxDepth=200,this.maxPixelBrightness=50,this.wilson.changeCanvasSize(this.imageWidth,this.imageHeight),this.regenerateHueAndBrightness(),window.requestAnimationFrame(this.drawFrame.bind(this))}onDragDraggable(){for(let i=0;i<this.imageHeight;i++)for(let j=0;j<this.imageWidth;j++)this.brightness[this.imageWidth*i+j]=0;window.requestAnimationFrame(this.drawFrame.bind(this))}async requestHighResFrame(imageSize,maxDepth,maxPixelBrightness,boxSize=this.boxSize){this.imageSize=imageSize,this.maxDepth=maxDepth,this.maxPixelBrightness=maxPixelBrightness,this.boxSize=boxSize,this.wilson.fullscreen.currentlyFullscreen?1<=aspectRatio?(this.imageWidth=Math.floor(this.imageSize*aspectRatio),this.imageHeight=this.imageSize):(this.imageWidth=this.imageSize,this.imageHeight=Math.floor(this.imageSize/aspectRatio)):(this.imageWidth=this.imageSize,this.imageHeight=this.imageSize),this.regenerateHueAndBrightness(),this.webWorker=addTemporaryWorker("/applets/quasi-fuchsian-groups/scripts/worker.js");imageSize=new Promise(resolve=>{this.webWorker.onmessage=e=>{this.brightness=e.data[0],this.wilson.changeCanvasSize(this.imageWidth,this.imageHeight);for(let i=0;i<this.imageHeight;i++)for(let j=0;j<this.imageWidth;j++){var index=i*this.imageWidth+j;this.image[4*index]=0,this.image[4*index+1]=0,this.image[4*index+2]=this.brightness[index],this.image[4*index+3]=0}this.renderShaderStack(),resolve()}});this.webWorker.postMessage([this.imageWidth,this.imageHeight,this.maxDepth,this.maxPixelBrightness,this.boxSize,this.coefficients]),await imageSize}regenerateHueAndBrightness(){this.brightness=new Float32Array(this.imageWidth*this.imageHeight),this.image=new Float32Array(this.imageWidth*this.imageHeight*4),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]),this.wilson.gl.uniform1f(this.wilson.uniforms.textureStep[0],1/this.imageSize),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]),this.wilson.gl.uniform1f(this.wilson.uniforms.textureStep[1],1/this.imageSize);for(let i=0;i<this.imageHeight;i++)for(let j=0;j<this.imageWidth;j++)this.brightness[this.imageWidth*i+j]=0}changeAspectRatio(){this.imageSize=this.resolutionSmall,this.wilson.fullscreen.currentlyFullscreen?1<=aspectRatio?(this.imageWidth=Math.floor(this.imageSize*aspectRatio),this.imageHeight=this.imageSize):(this.imageWidth=this.imageSize,this.imageHeight=Math.floor(this.imageSize/aspectRatio)):(this.imageWidth=this.imageSize,this.imageHeight=this.imageSize),this.wilson.changeCanvasSize(this.imageWidth,this.imageHeight),this.regenerateHueAndBrightness(),window.requestAnimationFrame(this.drawFrame.bind(this))}}export{QuasiFuchsianGroups};