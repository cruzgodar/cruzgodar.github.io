import{Applet}from"/scripts/src/applets.min.mjs";import{Wilson}from"/scripts/wilson.min.mjs";class EllipticCurve extends Applet{resolution=500;g2=-2;g3=0;lastTimestamp=-1;constructor(canvas){super(canvas);var options={renderer:"gpu",shader:`
			precision highp float;
			
			varying vec2 uv;
			
			uniform float step;
			
			uniform float g2Arg;
			uniform float g3Arg;
			
			const int maxIterations = 200;
			
			
			
			float f(vec2 z)
			{
				return z.y * z.y   -   z.x * z.x * z.x   -   g2Arg * z.x   -   g3Arg;
			}
			
			
			
			void main(void)
			{
				float threshhold = 4.0 * 1000.0;
				
				vec2 z = uv * 4.0;
				
				
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				
				
				
				for (int i = 0; i < maxIterations; i++)
				{
					float score = abs(f(z)) / threshhold;
					
					if (score < 1.0)
					{
						float adjacentScore = (abs(f(z + vec2(step, 0.0))) + abs(f(z - vec2(step, 0.0))) + abs(f(z + vec2(0.0, step))) + abs(f(z - vec2(0.0, step)))) / threshhold;
						
						if (adjacentScore >= 6.0)
						{
							gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
							
							return;
						}
					}
					
					threshhold /= 1.25;
				}
			}
		`,canvasWidth:this.resolution,canvasHeight:this.resolution,worldWidth:8,worldHeight:8,worldCenterX:0,worldCenterY:0};this.wilson=new Wilson(canvas,options),this.wilson.render.initUniforms(["step","g2Arg","g3Arg"]),this.wilson.gl.uniform1f(this.wilson.uniforms.step,this.wilson.worldWidth/this.resolution),this.wilson.render.loadNewShader(`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float textureStep;
			
			
			
			void main(void)
			{
				//Dilate the pixels to make a thicker line.
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				
				float state = (4.0 * texture2D(uTexture, center).y +
				
					texture2D(uTexture, center + vec2(textureStep, 0.0)).y +
					texture2D(uTexture, center - vec2(textureStep, 0.0)).y +
					texture2D(uTexture, center + vec2(0.0, textureStep)).y +
					texture2D(uTexture, center - vec2(0.0, textureStep)).y +
					
					texture2D(uTexture, center + vec2(textureStep, textureStep)).y +
					texture2D(uTexture, center + vec2(textureStep, -textureStep)).y +
					texture2D(uTexture, center + vec2(-textureStep, textureStep)).y +
					texture2D(uTexture, center + vec2(-textureStep, -textureStep)).y
				) / 2.0;
				
				gl_FragColor = vec4(state, state, state, 1.0);
			}
		`),this.wilson.render.initUniforms(["textureStep"]),this.wilson.gl.uniform1f(this.wilson.uniforms.textureStep,1/this.resolution),this.wilson.render.createFramebufferTexturePair(),this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER,null),window.requestAnimationFrame(this.drawFrame.bind(this))}run({g2,g3}){this.g2=g2,this.g3=g3,window.requestAnimationFrame(this.drawFrame.bind(this))}drawFrame(timestamp){var timeElapsed=timestamp-this.lastTimestamp;if(this.lastTimestamp=timestamp,0!=timeElapsed){this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]),this.wilson.gl.uniform1f(this.wilson.uniforms.g2Arg,this.g2),this.wilson.gl.uniform1f(this.wilson.uniforms.g3Arg,this.g3),this.wilson.render.drawFrame();var pixels=this.wilson.render.getPixelData(),endpoints=[],width=this.resolution,maxInterpolationDistance=this.wilson.canvasWidth;for(let i=2;i<this.wilson.canvasHeight-2;i++)for(let j=2;j<width-2;j++){var index=width*i+j;0!==pixels[4*index]&&pixels[4*(index-1)]+pixels[4*(index+1)]+pixels[4*(index-width)]+pixels[4*(index+width)]+pixels[4*(index-1-width)]+pixels[4*(index+1-width)]+pixels[4*(index-1+width)]+pixels[4*(index+1+width)]<=255&&(index=pixels[4*(index-2*width-2)]+pixels[4*(index-2*width-1)]+pixels[4*(index-2*width)]+pixels[4*(index-2*width+1)]+pixels[4*(index-2*width+2)]+pixels[4*(index+2*width-2)]+pixels[4*(index+2*width-1)]+pixels[4*(index+2*width)]+pixels[4*(index+2*width+1)]+pixels[4*(index+2*width+2)]+pixels[4*(index-width-2)]+pixels[4*(index-2)]+pixels[4*(index+width-2)]+pixels[4*(index-width+2)]+pixels[4*(index+2)]+pixels[4*(index+width+2)],endpoints.push(0===index?[i,j,!0]:[i,j,!1]))}for(let i=0;i<endpoints.length;i++)if(!(endpoints[i][0]<this.wilson.canvasWidth/20||endpoints[i][1]<this.wilson.canvasHeight/20||endpoints[i][0]>19*this.wilson.canvasWidth/20||endpoints[i][1]>19*this.wilson.canvasHeight/20)){let minOpenJ=-1,minOpenDistance=maxInterpolationDistance;endpoints[i][2]||(minOpenDistance=maxInterpolationDistance/20);for(let j=0;j<endpoints.length;j++)if(j!==i){var distance=Math.sqrt((endpoints[i][0]-endpoints[j][0])*(endpoints[i][0]-endpoints[j][0])+(endpoints[i][1]-endpoints[j][1])*(endpoints[i][1]-endpoints[j][1]));if(distance<minOpenDistance&&2<=distance){var rowMovement=(endpoints[j][0]-endpoints[i][0])/distance*1.414214,colMovement=(endpoints[j][1]-endpoints[i][1])/distance*1.414214,rowMovement=Math.sign(rowMovement)*Math.floor(Math.abs(rowMovement)),colMovement=Math.sign(colMovement)*Math.floor(Math.abs(colMovement));let test=0;if(0==rowMovement){let index=width*(endpoints[i][0]+rowMovement)+(endpoints[i][1]+colMovement);test+=pixels[4*index],index=width*(endpoints[i][0]+rowMovement+1)+(endpoints[i][1]+colMovement),test+=pixels[4*index],index=width*(endpoints[i][0]+rowMovement-1)+(endpoints[i][1]+colMovement),test+=pixels[4*index]}else if(0==colMovement){let index=width*(endpoints[i][0]+rowMovement)+(endpoints[i][1]+colMovement);test+=pixels[4*index],index=width*(endpoints[i][0]+rowMovement)+(endpoints[i][1]+colMovement+1),test+=pixels[4*index],index=width*(endpoints[i][0]+rowMovement)+(endpoints[i][1]+colMovement-1),test+=pixels[4*index]}else{let index=width*(endpoints[i][0]+rowMovement)+(endpoints[i][1]+colMovement);test+=pixels[4*index],index=width*endpoints[i][0]+(endpoints[i][1]+colMovement),test+=pixels[4*index],index=width*(endpoints[i][0]+rowMovement)+endpoints[i][1],test+=pixels[4*index]}0===test&&(minOpenJ=j,minOpenDistance=distance)}}if(-1!==minOpenJ)for(let k=1;k<2*minOpenDistance;k++){var t=k/(2*minOpenDistance);const index=width*Math.round((1-t)*endpoints[i][0]+t*endpoints[minOpenJ][0])+Math.round((1-t)*endpoints[i][1]+t*endpoints[minOpenJ][1]);pixels[4*index]=0,pixels[4*index+1]=255,pixels[4*index+2]=0}}this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D,0,this.wilson.gl.RGBA,this.wilson.canvasWidth,this.wilson.canvasHeight,0,this.wilson.gl.RGBA,this.wilson.gl.UNSIGNED_BYTE,pixels),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]),this.wilson.render.drawFrame(pixels)}}changeResolution(resolution){this.resolution=resolution,this.wilson.changeCanvasSize(this.resolution,this.resolution),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]),this.wilson.gl.uniform1f(this.wilson.uniforms.step,this.wilson.worldWidth/this.resolution),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]),this.wilson.gl.uniform1f(this.wilson.uniforms.textureStep,1/this.resolution),window.requestAnimationFrame(this.drawFrame.bind(this))}}export{EllipticCurve};