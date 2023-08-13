import{Applet}from"/scripts/src/applets.min.mjs";import{Wilson}from"/scripts/wilson.min.mjs";class EllipticCurve extends Applet{resolution=500;g2=-2;g3=0;lastTimestamp=-1;constructor(t){super(t);var e={renderer:"gpu",shader:`
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
		`,canvasWidth:this.resolution,canvasHeight:this.resolution,worldWidth:8,worldHeight:8,worldCenterX:0,worldCenterY:0};this.wilson=new Wilson(t,e),this.wilson.render.initUniforms(["step","g2Arg","g3Arg"]),this.wilson.gl.uniform1f(this.wilson.uniforms.step,this.wilson.worldWidth/this.resolution),this.wilson.render.loadNewShader(`
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
		`),this.wilson.render.initUniforms(["textureStep"]),this.wilson.gl.uniform1f(this.wilson.uniforms.textureStep,1/this.resolution),this.wilson.render.createFramebufferTexturePair(),this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER,null),window.requestAnimationFrame(this.drawFrame.bind(this))}run(t,e){this.g2=t,this.g3=e,window.requestAnimationFrame(this.drawFrame.bind(this))}drawFrame(t){var e=t-this.lastTimestamp;if(this.lastTimestamp=t,0!=e){this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]),this.wilson.gl.uniform1f(this.wilson.uniforms.g2Arg,this.g2),this.wilson.gl.uniform1f(this.wilson.uniforms.g3Arg,this.g3),this.wilson.render.drawFrame();var o=this.wilson.render.getPixelData(),n=[],l=this.resolution,a=this.wilson.canvasWidth;for(let e=2;e<this.wilson.canvasHeight-2;e++)for(let t=2;t<l-2;t++){var i=l*e+t;0!==o[4*i]&&o[4*(i-1)]+o[4*(i+1)]+o[4*(i-l)]+o[4*(i+l)]+o[4*(i-1-l)]+o[4*(i+1-l)]+o[4*(i-1+l)]+o[4*(i+1+l)]<=255&&(i=o[4*(i-2*l-2)]+o[4*(i-2*l-1)]+o[4*(i-2*l)]+o[4*(i-2*l+1)]+o[4*(i-2*l+2)]+o[4*(i+2*l-2)]+o[4*(i+2*l-1)]+o[4*(i+2*l)]+o[4*(i+2*l+1)]+o[4*(i+2*l+2)]+o[4*(i-l-2)]+o[4*(i-2)]+o[4*(i+l-2)]+o[4*(i-l+2)]+o[4*(i+2)]+o[4*(i+l+2)],n.push(0===i?[e,t,!0]:[e,t,!1]))}for(let s=0;s<n.length;s++)if(!(n[s][0]<this.wilson.canvasWidth/20||n[s][1]<this.wilson.canvasHeight/20||n[s][0]>19*this.wilson.canvasWidth/20||n[s][1]>19*this.wilson.canvasHeight/20)){let i=-1,r=a;n[s][2]||(r=a/20);for(let e=0;e<n.length;e++)if(e!==s){var h=Math.sqrt((n[s][0]-n[e][0])*(n[s][0]-n[e][0])+(n[s][1]-n[e][1])*(n[s][1]-n[e][1]));if(h<r&&2<=h){var u,g,w=(n[e][0]-n[s][0])/h*1.414214,c=(n[e][1]-n[s][1])/h*1.414214,w=Math.sign(w)*Math.floor(Math.abs(w)),c=Math.sign(c)*Math.floor(Math.abs(c));let t=0;0==w?(u=l*(n[s][0]+w)+(n[s][1]+c),t+=o[4*u],u=l*(n[s][0]+w+1)+(n[s][1]+c),t+=o[4*u],u=l*(n[s][0]+w-1)+(n[s][1]+c),t+=o[4*u]):0==c?(u=l*(n[s][0]+w)+(n[s][1]+c),t+=o[4*u],u=l*(n[s][0]+w)+(n[s][1]+c+1),t+=o[4*u],u=l*(n[s][0]+w)+(n[s][1]+c-1),t+=o[4*u]):(g=l*(n[s][0]+w)+(n[s][1]+c),t+=o[4*g],g=l*n[s][0]+(n[s][1]+c),t+=o[4*g],g=l*(n[s][0]+w)+n[s][1],t+=o[4*g]),0===t&&(i=e,r=h)}}if(-1!==i)for(let t=1;t<2*r;t++){var f=t/(2*r),f=l*Math.round((1-f)*n[s][0]+f*n[i][0])+Math.round((1-f)*n[s][1]+f*n[i][1]);o[4*f]=0,o[4*f+1]=255,o[4*f+2]=0}}this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D,0,this.wilson.gl.RGBA,this.wilson.canvasWidth,this.wilson.canvasHeight,0,this.wilson.gl.RGBA,this.wilson.gl.UNSIGNED_BYTE,o),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]),this.wilson.render.drawFrame(o)}}changeResolution(t){this.resolution=t,this.wilson.changeCanvasSize(this.resolution,this.resolution),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]),this.wilson.gl.uniform1f(this.wilson.uniforms.step,this.wilson.worldWidth/this.resolution),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]),this.wilson.gl.uniform1f(this.wilson.uniforms.textureStep,1/this.resolution),window.requestAnimationFrame(this.drawFrame.bind(this))}}export{EllipticCurve};