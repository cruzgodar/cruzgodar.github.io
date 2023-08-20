import{changeOpacity}from"/scripts/src/animation.min.mjs";import{Applet}from"/scripts/src/applets.min.mjs";import{getGlslBundle,loadGlsl}from"/scripts/src/complex-glsl.min.mjs";import{$$,addTemporaryListener}from"/scripts/src/main.min.mjs";import{Wilson}from"/scripts/wilson.min.mjs";class FractalSounds extends Applet{loadPromise=null;wilsonHidden=null;wilsonJulia=null;juliaMode=0;aspectRatio=1;numIterations=200;exposure=1;zoomLevel=0;pastBrightnessScales=[];resolution=500;resolutionHidden=200;needToClear=!1;fixedPointX=0;fixedPointY=0;numTouches=0;moved=0;lastX=0;lastY=0;zoomingWithMouse=!1;lastTimestamp=-1;constructor(e,t){super(e),this.pan.minX=-3,this.pan.maxX=3,this.pan.minY=-3,this.pan.maxY=3;var i="precision highp float; varying vec2 uv; void main(void) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }",s={renderer:"gpu",shader:i,canvasWidth:this.resolution,canvasHeight:this.resolution,useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:this.switchFullscreen.bind(this)},e=(this.wilsonJulia=new Wilson(e,s),this.createHiddenCanvas()),s={renderer:"gpu",shader:i,canvasWidth:this.resolutionHidden,canvasHeight:this.resolutionHidden},i=(this.wilsonHidden=new Wilson(e,s),{renderer:"cpu",canvasWidth:this.resolution,canvasHeight:this.resolution,worldWidth:4,worldHeight:4,worldCenterX:0,worldCenterY:0,mousemoveCallback:this.onHoverCanvas.bind(this),mousedownCallback:this.onGrabCanvas.bind(this),touchstartCallback:this.onGrabCanvas.bind(this),mousedragCallback:this.onDragCanvas.bind(this),touchmoveCallback:this.onDragCanvas.bind(this),mouseupCallback:this.onReleaseCanvas.bind(this),touchendCallback:this.onReleaseCanvas.bind(this),wheelCallback:this.onWheelCanvas.bind(this),pinchCallback:this.onPinchCanvas.bind(this),useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!1}),e=(this.wilson=new Wilson(t,i),$$(".wilson-fullscreen-components-container"));e[0].style.setProperty("z-index",200,"important"),e[1].style.setProperty("z-index",300,"important"),this.wilson.ctx.lineWidth=40,this.zoom.init();addTemporaryListener({object:window,event:"resize",callback:()=>this.changeAspectRatio(!0,[this.wilson,this.wilsonJulia])}),this.loadPromise=loadGlsl()}run(e,t,i,s,o){this.currentFractalFunction=t,this.resolution=i,this.exposure=s,this.numIterations=o;t=`
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform float worldCenterX;
			uniform float worldCenterY;
			uniform float worldSize;
			
			uniform float exposure;
			uniform int numIterations;
			uniform float brightnessScale;
			
			const float hueMultiplier = 100.0;
			
			const vec3 color1 = vec3(1.0, 0.0, 0.0);
			const vec3 color2 = vec3(1.0, .4157, 0.0);
			const vec3 color3 = vec3(1.0, .8471, 0.0);
			const vec3 color4 = vec3(.7333, 1.0, 0.0);
			const vec3 color5 = vec3(.2980, 1.0, 0.0);
			const vec3 color6 = vec3(0.0, 1.0, .1137);
			const vec3 color7 = vec3(0.0, 1.0, .5490);
			const vec3 color8 = vec3(0.0, 1.0, .9647);
			const vec3 color9 = vec3(0.0, .6, 1.0);
			const vec3 color10 = vec3(0.0, .1804, 1.0);
			const vec3 color11 = vec3(.2471, 0.0, 1.0);
			const vec3 color12 = vec3(.6667, 0.0, 1.0);
			const vec3 color13 = vec3(1.0, 0.0, .8980);
			
			
			
			${getGlslBundle(e)}
			
			
			
			vec3 hsv2rgb(vec3 c)
			{
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}
			
			
			
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
				
				float brightness = exp(-max(length(z), .5));
				
				vec2 c = z;
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				
				
				
				vec2 lastZ1 = vec2(0.0, 0.0);
				vec2 lastZ2 = vec2(0.0, 0.0);
				vec2 lastZ3 = vec2(0.0, 0.0);
				vec2 lastZ4 = vec2(0.0, 0.0);
				vec2 lastZ5 = vec2(0.0, 0.0);
				vec2 lastZ6 = vec2(0.0, 0.0);
				vec2 lastZ7 = vec2(0.0, 0.0);
				vec2 lastZ8 = vec2(0.0, 0.0);
				vec2 lastZ9 = vec2(0.0, 0.0);
				vec2 lastZ10 = vec2(0.0, 0.0);
				vec2 lastZ11 = vec2(0.0, 0.0);
				vec2 lastZ12 = vec2(0.0, 0.0);
				vec2 lastZ13 = vec2(0.0, 0.0);
				
				float hue1 = 0.0;
				float hue2 = 0.0;
				float hue3 = 0.0;
				float hue4 = 0.0;
				float hue5 = 0.0;
				float hue6 = 0.0;
				float hue7 = 0.0;
				float hue8 = 0.0;
				float hue9 = 0.0;
				float hue10 = 0.0;
				float hue11 = 0.0;
				float hue12 = 0.0;
				float hue13 = 0.0;
				
				
				
				for (int iteration = 0; iteration < 3001; iteration++)
				{
					if (iteration == numIterations)
					{
						vec3 color = hue1 * color1 + hue2 * color2 + hue3 * color3 + hue4 * color4 + hue5 * color5 + hue6 * color6 + hue7 * color7 + hue8 * color8 + hue9 * color9 + hue10 * color10 + hue11 * color11 + hue12 * color12 + hue13 * color13;
						gl_FragColor = vec4(brightness / brightnessScale * exposure * normalize(color), 1.0);
						return;
					}
					
					if (length(z) >= 10.0)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						return;
					}
					
					lastZ13 = lastZ12;
					lastZ12 = lastZ11;
					lastZ11 = lastZ10;
					lastZ10 = lastZ9;
					lastZ9 = lastZ8;
					lastZ8 = lastZ7;
					lastZ7 = lastZ6;
					lastZ6 = lastZ5;
					lastZ5 = lastZ4;
					lastZ4 = lastZ3;
					lastZ3 = lastZ2;
					lastZ2 = lastZ1;
					lastZ1 = z;
					z = ${e};
					
					
					
					brightness += exp(-max(length(z), .5));
					
					hue1 += exp(-hueMultiplier * length(z - lastZ1));
					hue2 += exp(-hueMultiplier * length(z - lastZ2));
					hue3 += exp(-hueMultiplier * length(z - lastZ3));
					hue4 += exp(-hueMultiplier * length(z - lastZ4));
					hue5 += exp(-hueMultiplier * length(z - lastZ5));
					hue6 += exp(-hueMultiplier * length(z - lastZ6));
					hue7 += exp(-hueMultiplier * length(z - lastZ7));
					hue8 += exp(-hueMultiplier * length(z - lastZ8));
					hue9 += exp(-hueMultiplier * length(z - lastZ9));
					hue10 += exp(-hueMultiplier * length(z - lastZ10));
					hue11 += exp(-hueMultiplier * length(z - lastZ11));
					hue12 += exp(-hueMultiplier * length(z - lastZ12));
					hue13 += exp(-hueMultiplier * length(z - lastZ13));
				}
			}
		`;this.wilsonJulia.render.shaderPrograms=[],this.wilsonJulia.render.loadNewShader(t),this.wilsonJulia.gl.useProgram(this.wilsonJulia.render.shaderPrograms[0]),this.wilsonJulia.render.initUniforms(["juliaMode","aspectRatio","worldCenterX","worldCenterY","worldSize","a","b","numIterations","exposure","brightnessScale"],0),this.wilsonHidden.render.shaderPrograms=[],this.wilsonHidden.render.loadNewShader(t),this.wilsonHidden.gl.useProgram(this.wilsonHidden.render.shaderPrograms[0]),this.wilsonHidden.render.initUniforms(["juliaMode","aspectRatio","worldCenterX","worldCenterY","worldSize","a","b","numIterations","exposure","brightnessScale"],0),this.juliaMode=0,this.pastBrightnessScales=[],this.wilson.worldWidth=4,this.wilson.worldHeight=4,this.wilson.worldCenterX=0,this.wilson.worldCenterY=0,this.zoom.init(),this.wilsonJulia.gl.uniform1f(this.wilsonJulia.uniforms.aspectRatio[0],1),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.aspectRatio[0],1),window.requestAnimationFrame(this.drawFrame.bind(this))}onGrabCanvas(e,t,i){this.pan.onGrabCanvas(),this.zoom.onGrabCanvas(),this.wilson.canvas.style.opacity=1,"touchstart"===i.type?(this.numTouches=i.touches.length,1===this.numTouches?this.showOrbit(e,t):changeOpacity(this.wilson.canvas,0)):(this.moved=0,this.showOrbit(e,t))}onDragCanvas(e,t,i,s,o){"mousemove"===o.type||"touchmove"===o.type&&2<=this.numTouches?(this.pan.onDragCanvas(e,t,i,s),this.moved++,10<=this.moved&&this.wilson.ctx.clearRect(0,0,this.resolution,this.resolution)):this.showOrbit(e,t)}onHoverCanvas(e,t){this.showOrbit(e,t),this.moved=0}onReleaseCanvas(e,t,i){this.pan.onReleaseCanvas(),this.zoom.onReleaseCanvas(),"touchend"===i.type&&1===this.numTouches||this.moved<10?(this.playSound(e,t),setTimeout(()=>this.numTouches=0,50)):changeOpacity(this.wilson.canvas,0),this.moved=0}showOrbit(e,t){this.wilson.ctx.lineWidth=2,this.wilson.canvas.style.opacity=1,this.wilson.ctx.strokeStyle="rgb(255, 255, 255)",this.wilson.ctx.clearRect(0,0,this.resolution,this.resolution),this.wilson.ctx.beginPath();var i,s=this.wilson.utils.interpolate.worldToCanvas(e,t),o=(this.wilson.ctx.moveTo(s[1],s[0]),e),l=e,n=t;let a=this.currentFractalFunction(o,t,l,n);for(let e=o=0;e<300;e++){if(10<Math.abs(a[0])||10<Math.abs(a[1]))return;o=a[0],i=a[1],a=this.currentFractalFunction(o,i,l,n),s=this.wilson.utils.interpolate.worldToCanvas(o,i),this.wilson.ctx.lineTo(s[1],s[0])}this.wilson.ctx.stroke()}playSound(e,t){var i=new AudioContext,s=44100,o=Math.floor(3675);let l=e,n=t;var a=e,r=t;let h=this.currentFractalFunction(l,n,a,r),u=(l=0,n=0);var c=new Array(o),d=new Array(o),e=i.createBuffer(2,s,44100),w=e.getChannelData(0),m=e.getChannelData(1);for(let e=0;e<o;e++){if(100<Math.abs(h[0])||100<Math.abs(h[1]))return;Math.abs(h[0])>u&&(u=Math.abs(h[0])),Math.abs(h[1])>u&&(u=Math.abs(h[1])),c[e]=l,d[e]=n,l=h[0],n=h[1],h=this.currentFractalFunction(l,n,a,r)}for(let e=0;e<o;e++)c[e]/=u,d[e]/=u;for(let t=0;t<o-1;t++)for(let e=0;e<12;e++){var v=.5+.5*Math.sin(Math.PI*e/12-Math.PI/2);w[12*t+e]=(1-v)*(c[t]/2)+v*(c[t+1]/2),m[12*t+e]=(1-v)*(d[t]/2)+v*(d[t+1]/2)}t=i.createBufferSource(),t.buffer=e,s=i.createGain();t.connect(s),s.connect(i.destination),t.start(0),s.gain.exponentialRampToValueAtTime(1e-4,1)}drawFrame(e){var t=e-this.lastTimestamp;if(this.lastTimestamp=e,0!=t){this.pan.update(),this.zoom.update(),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.worldCenterX[0],this.wilson.worldCenterX),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.worldCenterY[0],this.wilson.worldCenterY),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.worldSize[0],Math.min(this.wilson.worldHeight,this.wilson.worldWidth)/2),this.wilsonHidden.gl.uniform1i(this.wilsonHidden.uniforms.numIterations[0],this.numIterations),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.exposure[0],1),this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.brightnessScale[0],20*(Math.abs(this.zoom.level)+1)),this.wilsonHidden.render.drawFrame();var i=this.wilsonHidden.render.getPixelData(),s=new Array(this.resolutionHidden*this.resolutionHidden);for(let e=0;e<this.resolutionHidden*this.resolutionHidden;e++)s[e]=i[4*e]+i[4*e+1]+i[4*e+2];s.sort((e,t)=>e-t);e=(s[Math.floor(this.resolutionHidden*this.resolutionHidden*.96)]+s[Math.floor(this.resolutionHidden*this.resolutionHidden*.98)])/255*15*(Math.abs(this.zoom.level/2)+1),t=(this.pastBrightnessScales.push(e),this.pastBrightnessScales.length);10<t&&this.pastBrightnessScales.shift(),e=Math.max(this.pastBrightnessScales.reduce((e,t)=>e+t)/t,.5),this.wilsonJulia.gl.uniform1f(this.wilsonJulia.uniforms.aspectRatio[0],this.aspectRatio),this.wilsonJulia.gl.uniform1f(this.wilsonJulia.uniforms.worldCenterX[0],this.wilson.worldCenterX),this.wilsonJulia.gl.uniform1f(this.wilsonJulia.uniforms.worldCenterY[0],this.wilson.worldCenterY),this.wilsonJulia.gl.uniform1f(this.wilsonJulia.uniforms.worldSize[0],Math.min(this.wilson.worldHeight,this.wilson.worldWidth)/2),this.wilsonJulia.gl.uniform1i(this.wilsonJulia.uniforms.numIterations[0],this.numIterations),this.wilsonJulia.gl.uniform1f(this.wilsonJulia.uniforms.exposure[0],this.exposure),this.wilsonJulia.gl.uniform1f(this.wilsonJulia.uniforms.brightnessScale[0],e),this.wilsonJulia.render.drawFrame(),this.animationPaused||window.requestAnimationFrame(this.drawFrame.bind(this))}}switchFullscreen(){document.body.querySelectorAll(".wilson-applet-canvas-container").forEach(e=>e.style.setProperty("background-color","rgba(0, 0, 0, 0)","important"));var e=document.body.querySelector(".wilson-exit-fullscreen-button");e&&e.style.setProperty("z-index","300","important"),this.wilson.fullscreen.switchFullscreen(),this.changeAspectRatio(!0,[this.wilson,this.wilsonJulia])}}export{FractalSounds};