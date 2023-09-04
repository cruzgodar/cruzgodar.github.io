import{Applet}from"/scripts/src/applets.min.mjs";import{addTemporaryListener}from"/scripts/src/main.min.mjs";import{Wilson}from"/scripts/wilson.min.mjs";class LyapunovFractal extends Applet{wilsonHidden=null;aspectRatio=1;numIterations=100;pastBrightnessScales=[];resolution=500;resolutionHidden=100;lastTimestamp=-1;constructor(canvas){super(canvas),this.pan.minX=0,this.pan.maxX=4,this.pan.minY=0,this.pan.maxY=4;var i=this.createHiddenCanvas(),s=`
			precision highp float;
			varying vec2 uv;
			
			void main(void)
			{
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			}
		`,e={renderer:"gpu",shader:s,canvasWidth:500,canvasHeight:500,worldWidth:4,worldHeight:4,worldCenterX:2,worldCenterY:2,useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:()=>this.changeAspectRatio(!0),mousedownCallback:this.onGrabCanvas.bind(this),touchstartCallback:this.onGrabCanvas.bind(this),mousedragCallback:this.onDragCanvas.bind(this),touchmoveCallback:this.onDragCanvas.bind(this),mouseupCallback:this.onReleaseCanvas.bind(this),touchendCallback:this.onReleaseCanvas.bind(this),wheelCallback:this.onWheelCanvas.bind(this),pinchCallback:this.onPinchCanvas.bind(this)},s={renderer:"gpu",shader:s,canvasWidth:100,canvasHeight:100};this.wilson=new Wilson(canvas,e),this.wilsonHidden=new Wilson(i,s),this.zoom.init();addTemporaryListener({object:window,event:"resize",callback:()=>this.changeAspectRatio(!0)})}run({generatingString}){var i=[];for(let e=0;e<generatingString.length;e++)"B"===generatingString[e]?i.push(1):i.push(0);var s=`
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
				
				for (int iteration = 0; iteration < ${Math.floor(250/generatingString.length)}; iteration++)
				{
					for (int index = 0; index < ${generatingString.length}; index++)
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
		`;this.wilson.render.shaderPrograms=[],this.wilson.render.loadNewShader(s),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]),this.wilson.render.initUniforms(["aspectRatio","worldCenterX","worldCenterY","worldSize","brightnessScale","seq"]),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatio,1),this.wilsonHidden.render.shaderPrograms=[],this.wilsonHidden.render.loadNewShader(s),this.wilsonHidden.gl.useProgram(this.wilsonHidden.render.shaderPrograms[0]),this.wilsonHidden.render.initUniforms(["aspectRatio","worldCenterX","worldCenterY","worldSize","brightnessScale","seq"]),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.aspectRatio,1),this.pastBrightnessScales=[],this.zoom.init(),this.wilson.gl.uniform1iv(this.wilson.uniforms.seq,i),this.wilsonHidden.gl.uniform1iv(this.wilsonHidden.uniforms.seq,i),window.requestAnimationFrame(this.drawFrame.bind(this))}drawFrame(timestamp){var s=timestamp-this.lastTimestamp;if(this.lastTimestamp=timestamp,0!=s){this.pan.update(),this.zoom.update(),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.aspectRatio,this.aspectRatio),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.worldCenterX,this.wilson.worldCenterX),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.worldCenterY,this.wilson.worldCenterY),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.worldSize,Math.min(this.wilson.worldHeight,this.wilson.worldWidth)/2),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.brightnessScale,20),this.wilsonHidden.render.drawFrame();var e=this.wilsonHidden.render.getPixelData(),n=new Array(this.resolutionHidden*this.resolutionHidden);for(let i=0;i<this.resolutionHidden*this.resolutionHidden;i++)n[i]=e[4*i]+e[4*i+1]+e[4*i+2];n.sort((a,b)=>a-b);var s=(n[Math.floor(this.resolutionHidden*this.resolutionHidden*.96)]+n[Math.floor(this.resolutionHidden*this.resolutionHidden*.98)])/255*6,t=(this.pastBrightnessScales.push(s),this.pastBrightnessScales.length);10<t&&this.pastBrightnessScales.shift(),s=Math.max(this.pastBrightnessScales.reduce((a,b)=>a+b)/t,.5),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatio,this.aspectRatio),this.wilson.gl.uniform1f(this.wilson.uniforms.worldCenterX,this.wilson.worldCenterX),this.wilson.gl.uniform1f(this.wilson.uniforms.worldCenterY,this.wilson.worldCenterY),this.wilson.gl.uniform1f(this.wilson.uniforms.worldSize,Math.min(this.wilson.worldHeight,this.wilson.worldWidth)/2),this.wilson.gl.uniform1f(this.wilson.uniforms.brightnessScale,s),this.wilson.render.drawFrame(),this.animationPaused||window.requestAnimationFrame(this.drawFrame.bind(this))}}}export{LyapunovFractal};