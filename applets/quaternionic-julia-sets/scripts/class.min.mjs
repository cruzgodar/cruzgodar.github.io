import anime from"/scripts/anime.min.js";import{changeOpacity,opacityAnimationTime}from"/scripts/src/animation.min.mjs";import{RaymarchApplet}from"/scripts/src/applets.min.mjs";import{aspectRatio}from"/scripts/src/layout.min.mjs";import{Wilson}from"/scripts/wilson.min.mjs";class QuaternionicJuliaSet extends RaymarchApplet{switchBulbButtonElement=null;randomizeCButtonElement=null;cXInputElement=null;cYInputElement=null;cZInputElement=null;cameraPos=[-1.11619,-2.63802,1.67049];c=[-.54,-.25,-.668];lightPos=[-5,-5,5];juliaProportion=1;constructor(canvas,switchBulbButtonElement,randomizeCButtonElement,cXInputElement,cYInputElement,cZInputElement){super(canvas),this.switchBulbButtonElement=switchBulbButtonElement,this.randomizeCButtonElement=randomizeCButtonElement,this.cXInputElement=cXInputElement,this.cYInputElement=cYInputElement,this.cZInputElement=cZInputElement;var t={renderer:"gpu",shader:`
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatioX;
			uniform float aspectRatioY;
			
			uniform vec3 cameraPos;
			uniform vec3 imagePlaneCenterPos;
			uniform vec3 forwardVec;
			uniform vec3 rightVec;
			uniform vec3 upVec;
			
			uniform float focalLength;
			
			uniform vec3 lightPos;
			const float lightBrightness = 1.5;
			
			uniform int imageSize;
			
			uniform int maxIterations;
			
			
			
			const float clipDistance = 1000.0;
			uniform int maxMarches;
			uniform float stepFactor;
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .1;
			
			
			uniform vec3 c;
			uniform float juliaProportion;
			
			
			
			vec4 qmul(vec4 z, vec4 w)
			{
				return vec4(z.x*w.x - z.y*w.y - z.z*w.z - z.w*w.w, z.x*w.y + z.y*w.x + z.z*w.w - z.w*w.z, z.x*w.z - z.y*w.w + z.z*w.x + z.w*w.y, z.x*w.w + z.y*w.z - z.z*w.y + z.w*w.x);
			}
			
			
			float distanceEstimator(vec3 pos)
			{
				vec4 z = vec4(pos, 0.0);
				vec4 zPrime = vec4(1.0, 0.0, 0.0, 0.0);
				float r;
				
				for (int iteration = 0; iteration < 100; iteration++)
				{
					r = length(z);
					
					if (r > 16.0 || iteration >= maxIterations)
					{
						break;
					}
					
					zPrime = 2.0 * qmul(z, zPrime);
					
					z = qmul(z, z);
					
					z += mix(vec4(pos, 0.0), vec4(c, 0.0), juliaProportion);
				}
				
				
				r = length(z);
				return .5 * r * log(r) / length(zPrime);
			}
			
			
			
			vec3 getColor(vec3 pos)
			{
				vec4 z = vec4(pos, 0.0);
				vec4 zPrime = vec4(1.0, 0.0, 0.0, 0.0);
				float r;
				
				vec3 color = vec3(1.0, 1.0, 1.0);
				float colorScale = .5;
				
				for (int iteration = 0; iteration < 100; iteration++)
				{
					r = length(z);
					
					if (r > 16.0 || iteration >= maxIterations)
					{
						break;
					}
					
					zPrime = 2.0 * qmul(z, zPrime);
					
					z = qmul(z, z);
					
					z += mix(vec4(pos, 0.0), vec4(c, 0.0), juliaProportion);
					
					color = mix(color, abs(normalize(z.xyz)), colorScale);
					
					colorScale *= .5;
				}
				
				color /= max(max(color.x, color.y), color.z);
				
				return color;
			}
			
			
			
			vec3 getSurfaceNormal(vec3 pos)
			{
				float xStep1 = distanceEstimator(pos + vec3(.000001, 0.0, 0.0));
				float yStep1 = distanceEstimator(pos + vec3(0.0, .000001, 0.0));
				float zStep1 = distanceEstimator(pos + vec3(0.0, 0.0, .000001));
				
				float xStep2 = distanceEstimator(pos - vec3(.000001, 0.0, 0.0));
				float yStep2 = distanceEstimator(pos - vec3(0.0, .000001, 0.0));
				float zStep2 = distanceEstimator(pos - vec3(0.0, 0.0, .000001));
				
				return normalize(vec3(xStep1 - xStep2, yStep1 - yStep2, zStep1 - zStep2));
			}
			
			
			
			vec3 computeShading(vec3 pos, int iteration)
			{
				vec3 surfaceNormal = getSurfaceNormal(pos);
				
				vec3 lightDirection = normalize(lightPos - pos);
				
				float dotProduct = dot(surfaceNormal, lightDirection);
				
				float lightIntensity = lightBrightness * max(dotProduct, -.25 * dotProduct);
				
				//The last factor adds ambient occlusion.
				vec3 color = getColor(pos) * lightIntensity * max((1.0 - float(iteration) / float(maxMarches)), 0.0);
				
				
				
				//Apply fog.
				return mix(color, fogColor, 1.0 - exp(-distance(pos, cameraPos) * fogScaling));
			}
			
			
			
			vec3 raymarch(vec3 startPos)
			{
				//That factor of .9 is important -- without it, we're always stepping as far as possible, which results in artefacts and weirdness.
				vec3 rayDirectionVec = normalize(startPos - cameraPos) * .9 / stepFactor;
				
				vec3 finalColor = fogColor;
				
				float epsilon = 0.0;
				
				float t = 0.0;
				
				float lastDistance = 1000.0;
				
				//int slowedDown = 0;
				
				
				
				for (int iteration = 0; iteration < 1024; iteration++)
				{
					if (iteration == maxMarches)
					{
						break;
					}
					
					
					
					vec3 pos = startPos + t * rayDirectionVec;
					
					//This prevents overstepping, and is honestly a pretty clever fix.
					float distance = min(distanceEstimator(pos), lastDistance);
					lastDistance = distance;
					
					//This lowers the detail far away, which makes everything run nice and fast.
					epsilon = max(.0000006, .5 * t / float(imageSize));
					
					
					
					if (distance < epsilon)
					{
						finalColor = computeShading(pos, iteration);
						break;
					}
					
					//Uncomment to add aggressive understepping when close to the fractal boundary, which helps to prevent flickering but is a significant performance hit.
					/*
					else if (lastDistance / distance > .9999 && slowedDown == 0)
					{
						rayDirectionVec = normalize(startPos - cameraPos) * .125;
						
						slowedDown = 1;
					}
					
					else if (lastDistance / distance <= .9999 && slowedDown == 1)
					{
						rayDirectionVec = normalize(startPos - cameraPos) * .9;
						
						slowedDown = 0;
					}
					*/
					
					else if (t > clipDistance)
					{
						break;
					}
					
					
					
					t += distance;
				}
				
				
				
				return finalColor;
			}
			
			
			
			void main(void)
			{
				gl_FragColor = vec4(raymarch(imagePlaneCenterPos + rightVec * (uv.x) * aspectRatioX + upVec * (uv.y) / aspectRatioY), 1.0);
			}
		`,canvasWidth:400,canvasHeight:400,worldCenterX:-1.21557,worldCenterY:-2.10801,useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:()=>this.changeResolution(this.imageSize),mousedownCallback:this.onGrabCanvas.bind(this),touchstartCallback:this.onGrabCanvas.bind(this),mousedragCallback:this.onDragCanvas.bind(this),touchmoveCallback:this.onDragCanvas.bind(this),mouseupCallback:this.onReleaseCanvas.bind(this),touchendCallback:this.onReleaseCanvas.bind(this)};this.wilson=new Wilson(canvas,t),this.wilson.render.initUniforms(["aspectRatioX","aspectRatioY","imageSize","cameraPos","imagePlaneCenterPos","forwardVec","rightVec","upVec","focalLength","lightPos","c","juliaProportion","maxMarches","stepFactor","maxIterations"]),this.calculateVectors(),this.imageWidth>=this.imageHeight?(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,this.imageWidth/this.imageHeight),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,1)):(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,1),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,this.imageWidth/this.imageHeight)),this.wilson.gl.uniform1i(this.wilson.uniforms.imageSize,this.imageSize),this.wilson.gl.uniform3fv(this.wilson.uniforms.cameraPos,this.cameraPos),this.wilson.gl.uniform3fv(this.wilson.uniforms.imagePlaneCenterPos,this.imagePlaneCenterPos),this.wilson.gl.uniform3fv(this.wilson.uniforms.lightPos,this.lightPos),this.wilson.gl.uniform3fv(this.wilson.uniforms.forwardVec,this.forwardVec),this.wilson.gl.uniform3fv(this.wilson.uniforms.rightVec,this.rightVec),this.wilson.gl.uniform3fv(this.wilson.uniforms.upVec,this.upVec),this.wilson.gl.uniform1f(this.wilson.uniforms.focalLength,this.focalLength),this.wilson.gl.uniform3fv(this.wilson.uniforms.c,this.c),this.wilson.gl.uniform1f(this.wilson.uniforms.juliaProportion,1),this.wilson.gl.uniform1i(this.wilson.uniforms.maxMarches,this.maxMarches),this.wilson.gl.uniform1f(this.wilson.uniforms.stepFactor,1),this.wilson.gl.uniform1i(this.wilson.uniforms.maxIterations,this.maxIterations),window.requestAnimationFrame(this.drawFrame.bind(this))}drawFrame(timestamp){var t=timestamp-this.lastTimestamp;this.lastTimestamp=timestamp,0==t||(this.pan.update(t),this.zoom.update(t),this.moveUpdate(t),this.calculateVectors(),this.updateCameraParameters(),this.wilson.worldCenterY=Math.min(Math.max(this.wilson.worldCenterY,.01-Math.PI),-.01),this.theta=-this.wilson.worldCenterX,this.phi=-this.wilson.worldCenterY,this.wilson.render.drawFrame(),this.animationPaused)||window.requestAnimationFrame(this.drawFrame.bind(this))}distanceEstimator(x,y,z){let t=[x,y,z,0],i=[1,0,0,0],e=0;for(let o=0;o<this.maxIterations&&!(16<(e=Math.sqrt(RaymarchApplet.dotProduct4(t,t))));o++)(i=RaymarchApplet.qmul(...t,...i))[0]*=2,i[1]*=2,i[2]*=2,i[3]*=2,(t=RaymarchApplet.qmul(...t,...t))[0]+=(1-this.juliaProportion)*x+this.juliaProportion*this.c[0],t[1]+=(1-this.juliaProportion)*y+this.juliaProportion*this.c[1],t[2]+=(1-this.juliaProportion)*z+this.juliaProportion*this.c[2];return.5*Math.log(e)*e/Math.sqrt(RaymarchApplet.dotProduct4(i,i))}changeResolution(resolution){this.imageSize=resolution,this.wilson.fullscreen.currentlyFullscreen?1<=aspectRatio?(this.imageWidth=this.imageSize,this.imageHeight=Math.floor(this.imageSize/aspectRatio)):(this.imageWidth=Math.floor(this.imageSize*aspectRatio),this.imageHeight=this.imageSize):(this.imageWidth=this.imageSize,this.imageHeight=this.imageSize),this.wilson.changeCanvasSize(this.imageWidth,this.imageHeight),this.imageWidth>=this.imageHeight?(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,this.imageWidth/this.imageHeight),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,1)):(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,1),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,this.imageWidth/this.imageHeight)),this.wilson.gl.uniform1i(this.wilson.uniforms.imageSize,this.imageSize)}randomizeC(animateChange=!0){this.updateC([2*Math.random()-1,2*Math.random()-1,2*Math.random()-1,this.c[3]],animateChange)}updateC(newC,animateChange=!0){this.cXInputElement&&this.cYInputElement&&this.cZInputElement&&(this.cXInputElement.value=Math.round(1e6*newC[0])/1e6,this.cYInputElement.value=Math.round(1e6*newC[1])/1e6,this.cZInputElement.value=Math.round(1e6*newC[2])/1e6);const t={t:0},i=[...this.c];anime({targets:t,t:1,duration:1e3*animateChange+10,easing:"easeOutQuad",update:()=>{this.c[0]=(1-t.t)*i[0]+t.t*newC[0],this.c[1]=(1-t.t)*i[1]+t.t*newC[1],this.c[2]=(1-t.t)*i[2]+t.t*newC[2],this.wilson.gl.uniform3fv(this.wilson.uniforms.c,this.c)}})}switchBulb(){if(0===this.juliaProportion||1===this.juliaProportion){const t=this.juliaProportion,i=1-this.juliaProportion,e=(this.switchBulbButtonElement&&changeOpacity(this.switchBulbButtonElement,0).then(()=>{this.switchBulbButtonElement.textContent=0===t?"Switch to Mandelbrot Set":"Switch to Julia Set",changeOpacity(this.switchBulbButtonElement,1)}),0===this.juliaProportion?(this.wilson.gl.uniform3fv(this.wilson.uniforms.c,this.c),setTimeout(()=>{this.switchBulbButtonElement&&this.randomizeCButtonElement&&changeOpacity(this.randomizeCButtonElement,1)},opacityAnimationTime)):this.switchBulbButtonElement&&this.randomizeCButtonElement&&changeOpacity(this.randomizeCButtonElement,0),{t:0});anime({targets:e,t:1,duration:1e3,easing:"easeOutQuad",update:()=>{this.juliaProportion=(1-e.t)*t+e.t*i,this.wilson.gl.uniform1f(this.wilson.uniforms.juliaProportion,this.juliaProportion)}})}}}export{QuaternionicJuliaSet};