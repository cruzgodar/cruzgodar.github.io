import{Applet}from"/scripts/src/applets.min.min.min.mjs";class DoublePendulumFractal extends Applet{resolution=1e3;dt=.01;drawnFractal=!1;pendulumCanvas=null;lastTimestamp=-1;drawingFractal=!0;wilsonPendulum=null;resolutionPendulum=2e3;lastTimestampPendulum=-1;pendulumCanvasVisible=0;theta1=0;theta2=0;p1=0;p2=0;frame=0;initialTheta1=0;initialTheta2=0;constructor(t,i){super(t),this.pendulumCanvas=i;i={renderer:"gpu",shader:`
			precision highp float;
			
			varying vec2 uv;
			
			
			
			void main(void)
			{
				gl_FragColor = vec4((uv + vec2(1.0, 1.0)) / 2.0, 0.5, 0.5);
				
				return;
			}
		`,canvasWidth:this.resolution,canvasHeight:this.resolution,useFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png"},this.wilson=new Wilson(t,i),this.wilson.render.loadNewShader(`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			const float dt = .01;
			
			
			
			void main(void)
			{
				vec4 state = (texture2D(uTexture, (uv + vec2(1.0, 1.0)) / 2.0) - vec4(.5, .5, .5, .5)) * (3.14159265358 * 2.0);
				
				float denom = 16.0 - 9.0 * cos(state.x - state.y) * cos(state.x - state.y);
				
				vec4 dState = vec4(6.0 * (2.0 * state.z - 3.0 * cos(state.x - state.y) * state.w) / denom, 6.0 * (8.0 * state.w - 3.0 * cos(state.x - state.y) * state.z) / denom, 0.0, 0.0);
				
				dState.z = -(dState.x * dState.y * sin(state.x - state.y) + 3.0 * sin(state.x)) / 2.0;
				
				dState.w = (dState.x * dState.y * sin(state.x - state.y) - sin(state.y)) / 2.0;
				
				
				
				state = ((dt * dState + state) / (3.14159265358 * 2.0)) + vec4(.5, .5, .5, .5);
				
				state.xy = fract(state.xy);
				
				gl_FragColor = state;
			}
		`),this.wilson.render.loadNewShader(`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			
			
			vec3 hsv2rgb(vec3 c)
			{
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}
			
			
			
			void main(void)
			{
				vec4 state = (texture2D(uTexture, (uv + vec2(1.0, 1.0)) / 2.0) - vec4(.5, .5, .5, .5));
				
				float h = atan(state.y, state.x) / 3.14159265258 + 1.0;
				
				float s = min((state.x * state.x + state.y * state.y) * 100.0, 1.0);
				
				float vAdd = .9 * (1.0 - 4.0 * ((uv.x * uv.x) / 4.0 + (uv.y * uv.y) / 4.0));
				
				float v = min(sqrt(state.z * state.z + state.w * state.w) + vAdd, 1.0);
				
				vec3 rgb = hsv2rgb(vec3(h, s, v));
				
				gl_FragColor = vec4(rgb, 1.0);
			}
		`),this.wilson.render.createFramebufferTexturePair(),this.wilson.render.createFramebufferTexturePair(),t={renderer:"cpu",canvasWidth:this.resolutionPendulum,canvasHeight:this.resolutionPendulum,mousemoveCallback:this.drawPreviewPendulum.bind(this),touchmoveCallback:this.drawPreviewPendulum.bind(this),mousedownCallback:this.startPendulumAnimation.bind(this),touchendCallback:this.startPendulumAnimation.bind(this)};this.wilsonPendulum=new Wilson(this.pendulumCanvas,t),this.wilsonPendulum.ctx.lineWidth=this.resolutionPendulum/100,this.wilsonPendulum.ctx.strokeStyle="rgb(127, 0, 255)",this.wilsonPendulum.ctx.fillStyle="rgb(0, 0, 0)",this.wilsonPendulum.draggables.container.addEventListener("mouseleave",()=>{(1===this.pendulumCanvasVisible||this.frame<3)&&(changeOpacity(this.pendulumCanvas,0,Site.buttonAnimationTime),this.pendulumCanvasVisible=0)})}run(t){this.drawnFractal=!1,this.drawingFractal=!0,this.resolution=t,this.wilson.changeCanvasSize(this.resolution,this.resolution),this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D,this.wilson.render.framebuffers[0].texture),this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D,0,this.wilson.gl.RGBA,this.wilson.canvasWidth,this.wilson.canvasHeight,0,this.wilson.gl.RGBA,this.wilson.gl.FLOAT,null),this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D,this.wilson.render.framebuffers[1].texture),this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D,0,this.wilson.gl.RGBA,this.wilson.canvasWidth,this.wilson.canvasHeight,0,this.wilson.gl.RGBA,this.wilson.gl.FLOAT,null),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]),this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D,this.wilson.render.framebuffers[0].texture),this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER,this.wilson.render.framebuffers[0].framebuffer),this.wilson.render.drawFrame(),window.requestAnimationFrame(this.drawFrame.bind(this)),this.drawnFractal=!0}drawFrame(t){var i=t-this.lastTimestamp;this.lastTimestamp=t,0!=i&&(this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]),this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER,this.wilson.render.framebuffers[1].framebuffer),this.wilson.render.drawFrame(),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[2]),this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D,this.wilson.render.framebuffers[1].texture),this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER,null),this.wilson.render.drawFrame(),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]),this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER,this.wilson.render.framebuffers[0].framebuffer),this.wilson.render.drawFrame(),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[2]),this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D,this.wilson.render.framebuffers[0].texture),this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER,null),this.wilson.render.drawFrame(),this.drawingFractal)&&!this.animationPaused&&window.requestAnimationFrame(this.drawFrame.bind(this))}drawPreviewPendulum(t,i,s,e,a){this.drawingFractal||(0===this.pendulumCanvasVisible&&this.showPendulumCanvasPreview(),2!==this.pendulumCanvasVisible&&(this.theta1=t*Math.PI,this.theta2=i*Math.PI,this.p1=0,this.p2=0,window.requestAnimationFrame(this.drawFramePendulum.bind(this))))}startPendulumAnimation(t,i,s){1===this.pendulumCanvasVisible&&(this.initialTheta1=this.theta1,this.initialTheta2=this.theta2,this.p1=0,this.p2=0,this.frame=0,this.showPendulumCanvas())}showPendulumCanvasPreview(){this.drawnFractal&&(this.drawingFractal=!1,changeOpacity(this.pendulumCanvas,.5,Site.buttonAnimationTime),this.pendulumCanvasVisible=1)}showPendulumCanvas(){this.drawnFractal&&(changeOpacity(this.pendulumCanvas,1,Site.buttonAnimationTime),this.pendulumCanvasVisible=2,window.requestAnimationFrame(this.drawFramePendulum.bind(this)))}hidePendulumDrawerCanvas(){this.drawnFractal&&(this.drawingFractal=!0,changeOpacity(this.pendulumCanvas,0,Site.buttonAnimationTime),this.pendulumCanvasVisible=0,window.requestAnimationFrame(this.drawFrame.bind(this)))}drawFramePendulum(t){var i,s,e,a=t-this.lastTimestampPendulum;this.lastTimestampPendulum=t,0!=a&&(this.frame++,this.wilsonPendulum.ctx.fillRect(0,0,this.resolutionPendulum,this.resolutionPendulum),t=this.theta1/Math.PI,a=this.theta2/Math.PI,s=this.p1/Math.PI,e=this.p2/Math.PI,i=Math.atan2(a,t)/Math.PI+1,t=Math.min(Math.min(50*(t*t+a*a),5*(1-Math.max(Math.abs(t),Math.abs(a)))),1),a=.9*((1-this.initialTheta1/(2*Math.PI))*(1-this.initialTheta1/(2*Math.PI))+(1-this.initialTheta2/(2*Math.PI))*(1-this.initialTheta2/(2*Math.PI)))*4,s=Math.min(Math.pow(s*s+e*e,.5)+a,1),e=this.wilsonPendulum.utils.hsvToRgb(i,t,s),this.wilsonPendulum.ctx.strokeStyle=`rgb(${e[0]}, ${e[1]}, ${e[2]})`,this.wilsonPendulum.ctx.beginPath(),this.wilsonPendulum.ctx.moveTo(this.resolutionPendulum/2,this.resolutionPendulum/2),this.wilsonPendulum.ctx.lineTo(this.resolutionPendulum/2+this.resolutionPendulum/6*Math.sin(this.theta1),this.resolutionPendulum/2+this.resolutionPendulum/6*Math.cos(this.theta1)),this.wilsonPendulum.ctx.stroke(),this.wilsonPendulum.ctx.beginPath(),this.wilsonPendulum.ctx.moveTo(this.resolutionPendulum/2+(this.resolutionPendulum/6-this.resolutionPendulum/200)*Math.sin(this.theta1),this.resolutionPendulum/2+(this.resolutionPendulum/6-this.resolutionPendulum/200)*Math.cos(this.theta1)),this.wilsonPendulum.ctx.lineTo(this.resolutionPendulum/2+this.resolutionPendulum/6*Math.sin(this.theta1)+this.resolutionPendulum/6*Math.sin(this.theta2),this.resolutionPendulum/2+this.resolutionPendulum/6*Math.cos(this.theta1)+this.resolutionPendulum/6*Math.cos(this.theta2)),this.wilsonPendulum.ctx.stroke(),2===this.pendulumCanvasVisible)&&(this.updateAngles(),window.requestAnimationFrame(this.drawFramePendulum.bind(this)))}updateAngles(){var t=6*(2*this.p1-3*Math.cos(this.theta1-this.theta2)*this.p2)/(16-9*Math.pow(Math.cos(this.theta1-this.theta2),2)),i=6*(8*this.p2-3*Math.cos(this.theta1-this.theta2)*this.p1)/(16-9*Math.pow(Math.cos(this.theta1-this.theta2),2)),s=-(t*i*Math.sin(this.theta1-this.theta2)+3*Math.sin(this.theta1))/2,e=(t*i*Math.sin(this.theta1-this.theta2)-Math.sin(this.theta2))/2;this.theta1+=t*this.dt*2.5,this.theta2+=i*this.dt*2.5,this.p1+=s*this.dt*2.5,this.p2+=e*this.dt*2.5,this.theta1>=Math.PI?this.theta1-=2*Math.PI:this.theta1<-Math.PI&&(this.theta1+=2*Math.PI),this.theta2>=Math.PI?this.theta2-=2*Math.PI:this.theta2<-Math.PI&&(this.theta2+=2*Math.PI)}}export{DoublePendulumFractal};