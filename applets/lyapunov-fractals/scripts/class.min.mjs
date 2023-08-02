import{Applet}from"/scripts/src/applets.min.mjs";class LyapunovFractal extends Applet{wilsonHidden=null;aspectRatio=1;numIterations=100;pastBrightnessScales=[];resolution=500;resolutionHidden=100;lastTimestamp=-1;constructor(i){super(i),this.pan.minX=0,this.pan.maxX=4,this.pan.minY=0,this.pan.maxY=4;var s=this.createHiddenCanvas(),e="precision highp float; varying vec2 uv; void main(void) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }",n={renderer:"gpu",shader:e,canvasWidth:500,canvasHeight:500,worldWidth:4,worldHeight:4,worldCenterX:2,worldCenterY:2,useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:()=>this.changeAspectRatio(!0),mousedownCallback:this.onGrabCanvas.bind(this),touchstartCallback:this.onGrabCanvas.bind(this),mousedragCallback:this.onDragCanvas.bind(this),touchmoveCallback:this.onDragCanvas.bind(this),mouseupCallback:this.onReleaseCanvas.bind(this),touchendCallback:this.onReleaseCanvas.bind(this),wheelCallback:this.onWheelCanvas.bind(this),pinchCallback:this.onPinchCanvas.bind(this)},e={renderer:"gpu",shader:e,canvasWidth:100,canvasHeight:100},i=(this.wilson=new Wilson(i,n),this.wilsonHidden=new Wilson(s,e),this.zoom.init(),console.log(this.zoom.level),()=>this.changeAspectRatio(!0));window.addEventListener("resize",i),this.handlers.push([window,"resize",i])}run(s){var e=[];for(let i=0;i<s.length;i++)"B"===s[i]?e.push(1):e.push(0);var i=`
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform float worldCenterX;
			uniform float worldCenterY;
			uniform float worldSize;
			
			uniform float brightnessScale;
			
			uniform int seq[12];
			
			
			
			void main(void)
			{
				vec2 z;
				
				if (aspectRatio >= 1.0)
				{
					z = vec2(uv.x * aspectRatio * worldSize + worldCenterX, uv.y * worldSize + worldCenterY);
				}
				
				else
				{
					z = vec2(uv.x * worldSize + worldCenterX, uv.y / aspectRatio * worldSize + worldCenterY);
				}
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				
				
				
				float x = .5;
				
				float lambda = 0.0;
				
				vec3 color = vec3(0.0, 0.0, 0.0);
				
				for (int iteration = 0; iteration < ${Math.floor(250/s.length)}; iteration++)
				{
					for (int index = 0; index < ${s.length}; index++)
					{
						if (seq[index] == 0)
						{
							x = z.x * x * (1.0 - x);
							
							color.x += abs(z.x) / 40.0;
						}
						
						else
						{
							x = z.y * x * (1.0 - x);
							
							color.y += abs(z.y) / 40.0;
						}
						
						lambda += log(abs(1.0 - 2.0*x));
						
						color.z = -lambda / 100.0;
					}
				}
				
				lambda /= 10000.0;
				
				if (lambda <= 0.0)
				{
					gl_FragColor = vec4(-lambda / brightnessScale * color, 1.0);
					
					return;
				}
			}
		`;this.wilson.render.shaderPrograms=[],this.wilson.render.loadNewShader(i),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]),this.wilson.render.initUniforms(["aspectRatio","worldCenterX","worldCenterY","worldSize","brightnessScale","seq"]),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatio,1),this.wilsonHidden.render.shaderPrograms=[],this.wilsonHidden.render.loadNewShader(i),this.wilsonHidden.gl.useProgram(this.wilsonHidden.render.shaderPrograms[0]),this.wilsonHidden.render.initUniforms(["aspectRatio","worldCenterX","worldCenterY","worldSize","brightnessScale","seq"]),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.aspectRatio,1),this.pastBrightnessScales=[],this.zoom.init(),this.wilson.gl.uniform1iv(this.wilson.uniforms.seq,e),this.wilsonHidden.gl.uniform1iv(this.wilsonHidden.uniforms.seq,e),window.requestAnimationFrame(this.drawFrame.bind(this))}drawFrame(i){var s=i-this.lastTimestamp;if(this.lastTimestamp=i,0!=s){this.pan.update(),this.zoom.update(),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.aspectRatio,this.aspectRatio),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.worldCenterX,this.wilson.worldCenterX),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.worldCenterY,this.wilson.worldCenterY),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.worldSize,Math.min(this.wilson.worldHeight,this.wilson.worldWidth)/2),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.brightnessScale,20),this.wilsonHidden.render.drawFrame();var e=this.wilsonHidden.render.getPixelData(),n=new Array(this.resolutionHidden*this.resolutionHidden);for(let i=0;i<this.resolutionHidden*this.resolutionHidden;i++)n[i]=e[4*i]+e[4*i+1]+e[4*i+2];n.sort((i,s)=>i-s);i=(n[Math.floor(this.resolutionHidden*this.resolutionHidden*.96)]+n[Math.floor(this.resolutionHidden*this.resolutionHidden*.98)])/255*6,s=(this.pastBrightnessScales.push(i),this.pastBrightnessScales.length);10<s&&this.pastBrightnessScales.shift(),i=Math.max(this.pastBrightnessScales.reduce((i,s)=>i+s)/s,.5),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatio,this.aspectRatio),this.wilson.gl.uniform1f(this.wilson.uniforms.worldCenterX,this.wilson.worldCenterX),this.wilson.gl.uniform1f(this.wilson.uniforms.worldCenterY,this.wilson.worldCenterY),this.wilson.gl.uniform1f(this.wilson.uniforms.worldSize,Math.min(this.wilson.worldHeight,this.wilson.worldWidth)/2),this.wilson.gl.uniform1f(this.wilson.uniforms.brightnessScale,i),this.wilson.render.drawFrame(),this.animationPaused||window.requestAnimationFrame(this.drawFrame.bind(this))}}}export{LyapunovFractal};