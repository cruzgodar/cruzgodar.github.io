import{Applet}from"/scripts/src/applets.min.mjs";import{Wilson}from"/scripts/wilson.min.mjs";class EllipticCurve extends Applet{resolution=500;g2=-2;g3=0;lastTimestamp=-1;constructor({canvas}){super(canvas);var t={renderer:"gpu",shader:`
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
		`,canvasWidth:this.resolution,canvasHeight:this.resolution,worldWidth:8,worldHeight:8,worldCenterX:0,worldCenterY:0};this.wilson=new Wilson(canvas,t),this.wilson.render.initUniforms(["step","g2Arg","g3Arg"]),this.wilson.gl.uniform1f(this.wilson.uniforms.step,this.wilson.worldWidth/this.resolution),this.wilson.render.loadNewShader(`
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
		`),this.wilson.render.initUniforms(["textureStep"]),this.wilson.gl.uniform1f(this.wilson.uniforms.textureStep,1/this.resolution),this.wilson.render.createFramebufferTexturePair(),this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER,null),window.requestAnimationFrame(this.drawFrame.bind(this))}run({g2,g3}){this.g2=g2,this.g3=g3,window.requestAnimationFrame(this.drawFrame.bind(this))}drawFrame(timestamp){var t=timestamp-this.lastTimestamp;if(this.lastTimestamp=timestamp,0!=t){this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]),this.wilson.gl.uniform1f(this.wilson.uniforms.g2Arg,this.g2),this.wilson.gl.uniform1f(this.wilson.uniforms.g3Arg,this.g3),this.wilson.render.drawFrame();var o=this.wilson.render.getPixelData(),n=[],a=this.resolution,l=this.wilson.canvasWidth;for(let e=2;e<this.wilson.canvasHeight-2;e++)for(let t=2;t<a-2;t++){var i=a*e+t;0!==o[4*i]&&o[4*(i-1)]+o[4*(i+1)]+o[4*(i-a)]+o[4*(i+a)]+o[4*(i-1-a)]+o[4*(i+1-a)]+o[4*(i-1+a)]+o[4*(i+1+a)]<=255&&(i=o[4*(i-2*a-2)]+o[4*(i-2*a-1)]+o[4*(i-2*a)]+o[4*(i-2*a+1)]+o[4*(i-2*a+2)]+o[4*(i+2*a-2)]+o[4*(i+2*a-1)]+o[4*(i+2*a)]+o[4*(i+2*a+1)]+o[4*(i+2*a+2)]+o[4*(i-a-2)]+o[4*(i-2)]+o[4*(i+a-2)]+o[4*(i-a+2)]+o[4*(i+2)]+o[4*(i+a+2)],n.push(0===i?[e,t,!0]:[e,t,!1]))}for(let r=0;r<n.length;r++)if(!(n[r][0]<this.wilson.canvasWidth/20||n[r][1]<this.wilson.canvasHeight/20||n[r][0]>19*this.wilson.canvasWidth/20||n[r][1]>19*this.wilson.canvasHeight/20)){let e=-1,i=l;n[r][2]||(i=l/20);for(let s=0;s<n.length;s++)if(s!==r){var h=Math.sqrt((n[r][0]-n[s][0])*(n[r][0]-n[s][0])+(n[r][1]-n[s][1])*(n[r][1]-n[s][1]));if(h<i&&2<=h){var u,g,m=(n[s][0]-n[r][0])/h*1.414214,w=(n[s][1]-n[r][1])/h*1.414214,m=Math.sign(m)*Math.floor(Math.abs(m)),w=Math.sign(w)*Math.floor(Math.abs(w));let t=0;0==m?(u=a*(n[r][0]+m)+(n[r][1]+w),t+=o[4*u],u=a*(n[r][0]+m+1)+(n[r][1]+w),t+=o[4*u],u=a*(n[r][0]+m-1)+(n[r][1]+w),t+=o[4*u]):0==w?(u=a*(n[r][0]+m)+(n[r][1]+w),t+=o[4*u],u=a*(n[r][0]+m)+(n[r][1]+w+1),t+=o[4*u],u=a*(n[r][0]+m)+(n[r][1]+w-1),t+=o[4*u]):(g=a*(n[r][0]+m)+(n[r][1]+w),t+=o[4*g],g=a*n[r][0]+(n[r][1]+w),t+=o[4*g],g=a*(n[r][0]+m)+n[r][1],t+=o[4*g]),0===t&&(e=s,i=h)}}if(-1!==e)for(let t=1;t<2*i;t++){var c=t/(2*i),c=a*Math.round((1-c)*n[r][0]+c*n[e][0])+Math.round((1-c)*n[r][1]+c*n[e][1]);o[4*c]=0,o[4*c+1]=255,o[4*c+2]=0}}this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D,0,this.wilson.gl.RGBA,this.wilson.canvasWidth,this.wilson.canvasHeight,0,this.wilson.gl.RGBA,this.wilson.gl.UNSIGNED_BYTE,o),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]),this.wilson.render.drawFrame(o)}}changeResolution(resolution){this.resolution=resolution,this.wilson.changeCanvasSize(this.resolution,this.resolution),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]),this.wilson.gl.uniform1f(this.wilson.uniforms.step,this.wilson.worldWidth/this.resolution),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]),this.wilson.gl.uniform1f(this.wilson.uniforms.textureStep,1/this.resolution),window.requestAnimationFrame(this.drawFrame.bind(this))}}export{EllipticCurve};