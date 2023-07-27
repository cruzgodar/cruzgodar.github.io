import { Applet } from "../../../scripts/src/applets.mjs"

export class QuaternionicJuliaSet extends Applet
{
	currentlyDragging = false;
	
	movingForwardKeyboard = false;
	movingBackwardKeyboard = false;
	movingRightKeyboard = false;
	movingLeftKeyboard = false;
	
	movingSliceUpKeyboard = false;
	movingSliceDownKeyboard = false;
	
	movingForwardTouch = false;
	movingBackwardTouch = false;
	
	wasMovingTouch = false;
	
	movingSpeed = 0;
	
	switchBulbButtonElement = null;
	switchMovementButtonElement = null;
	randomizeCButtonElement = null;
	cXInputElement = null;
	cYInputElement = null;
	cZInputElement = null;
	cWInputElement = null;
	
	
	
	nextMoveVelocity = [0, 0, 0, 0];
	
	moveVelocity = [0, 0, 0, 0];
	
	moveFriction = .91;
	moveVelocityStopThreshhold = .0005;
	
	
	
	distanceToScene = 1;
	
	lastTimestamp = -1;
	
	
	
	theta = 1.21557;
	phi =  2.10801;
	
	nextThetaVelocity = 0;
	nextPhiVelocity = 0;
	
	thetaVelocity = 0;
	phiVelocity = 0;
	
	panFriction = .88;
	panVelocityStartThreshhold = .005;
	panVelocityStopThreshhold = .0005;
	
	
	
	imageSize = 500;
	imageWidth = 500;
	imageHeight = 500;
	
	maxIterations = 16;
	
	maxMarches = 100;
	
	imagePlaneCenterPos = [];
	
	forwardVec = [];
	rightVec = [];
	upVec = [];
	
	cameraPos = [-1.11619, -2.63802, 1.67049];
	
	focalLength = 2;
	
	lightPos = [-5, -5, 5];
	
	c = [-.54, -.25, -.668];
	
	kSlice = 0;
	
	juliaProportion = 1;
	movingPos = 0;
	
	
	
	constructor(canvas, switchBulbButtonElement, switchMovementButtonElement, randomizeCButtonElement, cXInputElement, cYInputElement, cZInputElement, cWInputElement)
	{
		super(canvas);
		
		
		
		this.switchBulbButtonElement = switchBulbButtonElement;
		this.switchMovementButtonElement = switchMovementButtonElement;
		this.randomizeCButtonElement = randomizeCButtonElement;
		this.cXInputElement = cXInputElement;
		this.cYInputElement = cYInputElement;
		this.cZInputElement = cZInputElement;
		this.cWInputElement = cWInputElement;
		
		
		
		const fragShaderSource = `
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
			
			uniform int drawSphere;
			
			uniform int maxIterations;
			
			
			
			const float clipDistance = 1000.0;
			uniform int maxMarches;
			uniform float stepFactor;
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .1;
			
			uniform float kSlice;
			
			
			uniform vec3 c;
			uniform float juliaProportion;
			
			
			
			vec4 qmul(vec4 z, vec4 w)
			{
				return vec4(z.x*w.x - z.y*w.y - z.z*w.z - z.w*w.w, z.x*w.y + z.y*w.x + z.z*w.w - z.w*w.z, z.x*w.z - z.y*w.w + z.z*w.x + z.w*w.y, z.x*w.w + z.y*w.z - z.z*w.y + z.w*w.x);
			}
			
			
			float distanceEstimator(vec3 pos)
			{
				vec4 z = vec4(pos, kSlice);
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
					
					z += mix(vec4(pos, kSlice), vec4(c, kSlice), juliaProportion);
				}
				
				
				r = length(z);
				float distance1 = .5 * r * log(r) / length(zPrime);
				float distance2 = length(pos - c) - .05;
				
				
				
				if (distance2 < distance1 && drawSphere == 1)
				{
					return distance2;
				}
				
				return distance1;
			}
			
			
			
			vec3 getColor(vec3 pos)
			{
				vec4 z = vec4(pos, kSlice);
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
					
					z += mix(vec4(pos, kSlice), vec4(c, kSlice), juliaProportion);
					
					color = mix(color, abs(normalize(z.xyz)), colorScale);
					
					colorScale *= .5;
				}
				
				color /= max(max(color.x, color.y), color.z);
				
				
				r = length(z);
				float distance1 = .5 * r * log(r) / length(zPrime);
				float distance2 = length(pos - c) - .05;
				
				
				
				if (distance2 < distance1 && drawSphere == 1)
				{
					color = vec3(1.0, 1.0, 1.0);
				}
				
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
				//Uncomment to use 2x antialiasing.
				//vec3 finalColor = (raymarch(imagePlaneCenterPos + rightVec * (uv.x * aspectRatio + .5 / float(imageSize)) + upVec * (uv.y + .5 / float(imageSize))) + raymarch(imagePlaneCenterPos + rightVec * (uv.x * aspectRatio + .5 / float(imageSize)) + upVec * (uv.y - .5 / float(imageSize))) + raymarch(imagePlaneCenterPos + rightVec * (uv.x * aspectRatio - .5 / float(imageSize)) + upVec * (uv.y + .5 / float(imageSize))) + raymarch(imagePlaneCenterPos + rightVec * (uv.x * aspectRatio - .5 / float(imageSize)) + upVec * (uv.y - .5 / float(imageSize)))) / 4.0;
				
				gl_FragColor = vec4(raymarch(imagePlaneCenterPos + rightVec * (uv.x) * aspectRatioX + upVec * (uv.y) / aspectRatioY), 1.0);
			}
		`;



		const options =
		{
			renderer: "gpu",
			
			shader: fragShaderSource,
			
			canvasWidth: 500,
			canvasHeight: 500,
			
			
			
			useFullscreen: true,
			
			trueFullscreen: true,

			useFullscreenButton: true,
			
			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			
			switchFullscreenCallback: () => this.changeResolution(this.imageSize),
			
			
			
			mousedownCallback: this.onGrabCanvas.bind(this),
			touchstartCallback: this.onGrabCanvas.bind(this),
			
			mousedragCallback: this.onDragCanvas.bind(this),
			touchmoveCallback: this.onDragCanvas.bind(this),
			
			mouseupCallback: this.onReleaseCanvas.bind(this),
			touchendCallback: this.onReleaseCanvas.bind(this)
		};

		this.wilson = new Wilson(canvas, options);

		this.wilson.render.initUniforms(["aspectRatioX", "aspectRatioY", "imageSize", "cameraPos", "imagePlaneCenterPos", "forwardVec", "rightVec", "upVec", "focalLength", "lightPos", "drawSphere", "c", "juliaProportion", "maxMarches", "stepFactor", "maxIterations", "kSlice"]);
		
		this.calculateVectors();
		
		
		
		if (this.imageWidth >= this.imageHeight)
		{
			this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatioX"], this.imageWidth / this.imageHeight);
			this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatioY"], 1);
		}
		
		else
		{
			this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatioX"], 1);
			this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatioY"], this.imageWidth / this.imageHeight);
		}
		
		this.wilson.gl.uniform1i(this.wilson.uniforms["imageSize"], this.imageSize);
		
		this.wilson.gl.uniform3fv(this.wilson.uniforms["cameraPos"], this.cameraPos);
		this.wilson.gl.uniform3fv(this.wilson.uniforms["imagePlaneCenterPos"], this.imagePlaneCenterPos);
		this.wilson.gl.uniform3fv(this.wilson.uniforms["lightPos"], this.lightPos);
		
		this.wilson.gl.uniform3fv(this.wilson.uniforms["forwardVec"], this.forwardVec);
		this.wilson.gl.uniform3fv(this.wilson.uniforms["rightVec"], this.rightVec);
		this.wilson.gl.uniform3fv(this.wilson.uniforms["upVec"], this.upVec);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["focalLength"], this.focalLength);
		
		this.wilson.gl.uniform1i(this.wilson.uniforms["drawSphere"], 0);
		
		this.wilson.gl.uniform3fv(this.wilson.uniforms["c"], this.c);
		this.wilson.gl.uniform1f(this.wilson.uniforms["juliaProportion"], 1);
		this.wilson.gl.uniform1f(this.wilson.uniforms["kSlice"], 0);
		
		this.wilson.gl.uniform1i(this.wilson.uniforms["maxMarches"], this.maxMarches);
		this.wilson.gl.uniform1f(this.wilson.uniforms["stepFactor"], 1);
		this.wilson.gl.uniform1i(this.wilson.uniforms["maxIterations"], this.maxIterations);
		
		
		
		const boundFunction = this.handleKeydownEvent.bind(this);
		document.documentElement.addEventListener("keydown", boundFunction);
		this.handlers.push([document.documentElement, "keydown", boundFunction]);
		
		const boundFunction2 = this.handleKeyupEvent.bind(this);
		document.documentElement.addEventListener("keyup", boundFunction2);
		this.handlers.push([document.documentElement, "keyup", boundFunction2]);
		
		
		
		window.requestAnimationFrame(this.drawFrame.bind(this));
	}
	
	
	
	drawFrame(timestamp)
	{
		const timeElapsed = timestamp - this.lastTimestamp;
		
		this.lastTimestamp = timestamp;
		
		if (timeElapsed === 0)
		{
			return;
		}
		
		
		
		this.wilson.render.drawFrame();
		
		
		
		if (this.movingForwardKeyboard || this.movingBackwardKeyboard || this.movingRightKeyboard || this.movingLeftKeyboard || this.movingForwardTouch || this.movingBackwardTouch || this.movingSliceUpKeyboard || this.movingSliceDownKeyboard)
		{
			this.updateCameraParameters();
		}
		
		if (this.thetaVelocity !== 0 || this.phiVelocity !== 0)
		{
			this.theta += this.thetaVelocity;
			this.phi += this.phiVelocity;
			
			
			
			if (this.theta >= 2 * Math.PI)
			{
				this.theta -= 2 * Math.PI;
			}
			
			else if (this.theta < 0)
			{
				this.theta += 2 * Math.PI;
			}
			
			
			
			if (this.phi > Math.PI - .01)
			{
				this.phi = Math.PI - .01;
			}
			
			else if (this.phi < .01)
			{
				this.phi = .01;
			}
			
			
			
			this.thetaVelocity *= this.panFriction;
			this.phiVelocity *= this.panFriction;
			
			if (this.thetaVelocity * this.thetaVelocity + this.phiVelocity * this.phiVelocity < this.panVelocityStopThreshhold * this.panVelocityStopThreshhold)
			{
				this.thetaVelocity = 0;
				this.phiVelocity = 0;
			}
			
			
			
			this.calculateVectors();
		}
		
		if (this.moveVelocity[0] !== 0 || this.moveVelocity[1] !== 0 || this.moveVelocity[2] !== 0 || this.moveVelocity[3] !== 0)
		{
			if (this.movingPos)
			{	
				this.cameraPos[0] += this.moveVelocity[0];
				this.cameraPos[1] += this.moveVelocity[1];
				this.cameraPos[2] += this.moveVelocity[2];
			}
			
			else
			{
				this.c[0] += this.moveVelocity[0];
				this.c[1] += this.moveVelocity[1];
				this.c[2] += this.moveVelocity[2];
				
				this.kSlice += this.moveVelocity[3];
				
				try
				{
					this.cXInputElement.value = Math.round((this.c[0]) * 1000000) / 1000000;
					this.cYInputElement.value = Math.round((this.c[1]) * 1000000) / 1000000;
					this.cZInputElement.value = Math.round((this.c[2]) * 1000000) / 1000000;
					
					this.cWInputElement.value = Math.round((this.kSlice) * 1000000) / 1000000;
				}
				
				catch(ex) {}
				
				this.wilson.gl.uniform3fv(this.wilson.uniforms["c"], this.c);
				
				this.wilson.gl.uniform1f(this.wilson.uniforms["kSlice"], this.kSlice);
			}
			
			
			
			this.moveVelocity[0] *= this.moveFriction;
			this.moveVelocity[1] *= this.moveFriction;
			this.moveVelocity[2] *= this.moveFriction;
			
			this.moveVelocity[3] *= this.moveFriction;
			
			if (this.moveVelocity[0] * this.moveVelocity[0] + this.moveVelocity[1] * this.moveVelocity[1] + this.moveVelocity[2] * this.moveVelocity[2] + this.moveVelocity[3] * this.moveVelocity[3] < this.moveVelocityStopThreshhold * this.movingSpeed * this.moveVelocityStopThreshhold * this.movingSpeed)
			{
				this.moveVelocity[0] = 0;
				this.moveVelocity[1] = 0;
				this.moveVelocity[2] = 0;
				
				this.moveVelocity[3] = 0;
			}
			
			
			
			this.calculateVectors();
		}
		
		
		
		if (!this.animationPaused)
		{
			window.requestAnimationFrame(this.drawFrame.bind(this));
		}
	}
	
	
	
	calculateVectors()
	{
		//Here comes the serious math. Theta is the angle in the xy-plane and phi the angle down from the z-axis. We can use them get a normalized forward vector:
		this.forwardVec = [Math.cos(this.theta) * Math.sin(this.phi), Math.sin(this.theta) * Math.sin(this.phi), Math.cos(this.phi)];
		
		//Now the right vector needs to be constrained to the xy-plane, since otherwise the image will appear tilted. For a vector (a, b, c), the orthogonal plane that passes through the origin is ax + by + cz = 0, so we want ax + by = 0. One solution is (b, -a), and that's the one that goes to the "right" of the forward vector (when looking down).
		this.rightVec = this.normalize([this.forwardVec[1], -this.forwardVec[0], 0]);
		
		//Finally, the upward vector is the cross product of the previous two.
		this.upVec = this.crossProduct(this.rightVec, this.forwardVec);
		
		
		
		this.distanceToScene = this.distanceEstimator(this.cameraPos[0], this.cameraPos[1], this.cameraPos[2]);
		
		
		
		this.focalLength = this.distanceToScene / 2;
		
		//The factor we divide by here sets the fov.
		this.rightVec[0] *= this.focalLength / 2;
		this.rightVec[1] *= this.focalLength / 2;
		
		this.upVec[0] *= this.focalLength / 2;
		this.upVec[1] *= this.focalLength / 2;
		this.upVec[2] *= this.focalLength / 2;
		
		
		
		this.imagePlaneCenterPos = [this.cameraPos[0] + this.focalLength * this.forwardVec[0], this.cameraPos[1] + this.focalLength * this.forwardVec[1], this.cameraPos[2] + this.focalLength * this.forwardVec[2]];
		
		
		
		this.wilson.gl.uniform3fv(this.wilson.uniforms["cameraPos"], this.cameraPos);
		this.wilson.gl.uniform3fv(this.wilson.uniforms["imagePlaneCenterPos"], this.imagePlaneCenterPos);
		
		this.wilson.gl.uniform3fv(this.wilson.uniforms["forwardVec"], this.forwardVec);
		this.wilson.gl.uniform3fv(this.wilson.uniforms["rightVec"], this.rightVec);
		this.wilson.gl.uniform3fv(this.wilson.uniforms["upVec"], this.upVec);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["focalLength"], this.focalLength);
	}
	
	
	
	dotProduct(vec1, vec2)
	{
		return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2];
	}
	
	dotProduct4(vec1, vec2)
	{
		return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2] + vec1[3] * vec2[3];
	}
	
	
	
	crossProduct(vec1, vec2)
	{
		return [vec1[1] * vec2[2] - vec1[2] * vec2[1], vec1[2] * vec2[0] - vec1[0] * vec2[2], vec1[0] * vec2[1] - vec1[1] * vec2[0]];
	}
	
	
	
	normalize(vec)
	{
		const magnitude = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
		
		return [vec[0] / magnitude, vec[1] / magnitude, vec[2] / magnitude];
	}
	
	
	
	qmul(x1, y1, z1, w1, x2, y2, z2, w2)
	{
		return [x1*x2 - y1*y2 - z1*z1 - w1*w2, x1*y2 + y1*x2 + z1*w2 - w1*z2, x1*z2 - y1*w2 + z1*x2 + w1*y2, x1*w2 + y1*z2 - z1*y2 + w1*x2];
	}
	
	
	
	distanceEstimator(x, y, z)
	{
		let mutableZ = [x, y, z, this.kSlice];
		let zPrime = [1.0, 0.0, 0.0, 0.0];
		
		let r = 0.0;
		
		for (let iteration = 0; iteration < this.maxIterations * 4; iteration++)
		{
			r = Math.sqrt(this.dotProduct4(mutableZ, mutableZ));
			
			if (r > 16.0)
			{
				break;
			}
			
			zPrime = this.qmul(...mutableZ, ...zPrime);
			zPrime[0] *= 2;
			zPrime[1] *= 2;
			zPrime[2] *= 2;
			zPrime[3] *= 2;
			
			
			
			mutableZ = this.qmul(...mutableZ, ...mutableZ);
			
			mutableZ[0] += ((1 - this.juliaProportion) * x + this.juliaProportion * this.c[0]);
			mutableZ[1] += ((1 - this.juliaProportion) * y + this.juliaProportion * this.c[1]);
			mutableZ[2] += ((1 - this.juliaProportion) * z + this.juliaProportion * this.c[2]);
			mutableZ[3] += this.kSlice;
		}
		
		return 0.5 * Math.log(r) * r / Math.sqrt(this.dotProduct4(zPrime, zPrime));
	}
	
	
	
	onGrabCanvas(x, y, event)
	{
		this.nextThetaVelocity = 0;
		this.nextPhiVelocity = 0;
		
		this.thetaVelocity = 0;
		this.phiVelocity = 0;
		
		
		
		if (event.type === "touchstart")
		{
			if (event.touches.length === 2)
			{
				this.movingForwardTouch = true;
				this.movingBackwardTouch = false;
				
				this.moveVelocity[0] = 0;
				this.moveVelocity[1] = 0;
				this.moveVelocity[2] = 0;
				
				this.moveVelocity[3] = 0;
				
				this.nextMoveVelocity[0] = 0;
				this.nextMoveVelocity[1] = 0;
				this.nextMoveVelocity[2] = 0;
				
				this.nextMoveVelocity[3] = 0;
			}
			
			else if (event.touches.length === 3)
			{
				this.movingForwardTouch = false;
				this.movingBackwardTouch = true;
				
				this.moveVelocity[0] = 0;
				this.moveVelocity[1] = 0;
				this.moveVelocity[2] = 0;
				
				this.moveVelocity[3] = 0;
				
				this.nextMoveVelocity[0] = 0;
				this.nextMoveVelocity[1] = 0;
				this.nextMoveVelocity[2] = 0;
				
				this.nextMoveVelocity[3] = 0;
			}
			
			else
			{
				this.movingForwardTouch = false;
				this.movingBackwardTouch = false;
			}
			
			this.wasMovingTouch = false;
		}
	}
	
	
	
	onDragCanvas(x, y, xDelta, yDelta, event)
	{
		if (event.type === "touchmove" && this.wasMovingTouch)
		{
			this.wasMovingTouch = false;
			return;
		}
		
		
		
		this.theta += xDelta * Math.PI / 2;
		
		this.nextThetaVelocity = xDelta * Math.PI / 2;
		
		if (this.theta >= 2 * Math.PI)
		{
			this.theta -= 2 * Math.PI;
		}
		
		else if (this.theta < 0)
		{
			this.theta += 2 * Math.PI;
		}
		
		
		
		this.phi += yDelta * Math.PI / 2;
		
		this.nextPhiVelocity = yDelta * Math.PI / 2;
		
		if (this.phi > Math.PI - .01)
		{
			this.phi = Math.PI - .01;
		}
		
		else if (this.phi < .01)
		{
			this.phi = .01;
		}
		
		
		
		this.calculateVectors();
	}
	
	
	
	onReleaseCanvas(x, y, event)
	{
		if (event.type === "touchend")
		{
			this.movingForwardTouch = false;
			this.movingBackwardTouch = false;
			
			this.wasMovingTouch = true;
			
			if (this.moveVelocity[0] === 0 && this.moveVelocity[1] === 0 && this.moveVelocity[2] === 0)
			{
				this.moveVelocity[0] = this.nextMoveVelocity[0];
				this.moveVelocity[1] = this.nextMoveVelocity[1];
				this.moveVelocity[2] = this.nextMoveVelocity[2];
				
				this.moveVelocity[3] = this.nextMoveVelocity[3];
				
				this.nextMoveVelocity[0] = 0;
				this.nextMoveVelocity[1] = 0;
				this.nextMoveVelocity[2] = 0;
				
				this.nextMoveVelocity[3] = 0;
			}
		}
		
		if (((event.type === "touchend" && event.touches.length === 0) || event.type === "mouseup") && (this.nextThetaVelocity * this.nextThetaVelocity + this.nextPhiVelocity * this.nextPhiVelocity >= this.panVelocityStartThreshhold * this.panVelocityStartThreshhold))
		{
			this.thetaVelocity = this.nextThetaVelocity;
			this.phiVelocity = this.nextPhiVelocity;
		}
	}
	
	
	
	handleKeydownEvent(e)
	{
		if (document.activeElement.tagName === "INPUT" || !(e.keyCode === 87 || e.keyCode === 83 || e.keyCode === 68 || e.keyCode === 65 || e.keyCode === 69 || e.keyCode === 81))
		{
			return;
		}
		
		
		
		this.nextMoveVelocity = [0, 0, 0, 0];
		this.moveVelocity = [0, 0, 0, 0];
		
		
		
		//W
		if (e.keyCode === 87)
		{
			this.movingForwardKeyboard = true;
		}
		
		//S
		else if (e.keyCode === 83)
		{
			this.movingBackwardKeyboard = true;
		}
		
		//D
		if (e.keyCode === 68)
		{
			this.movingRightKeyboard = true;
		}
		
		//A
		else if (e.keyCode === 65)
		{
			this.movingLeftKeyboard = true;
		}
		
		
		
		//E
		if (e.keyCode === 69)
		{
			this.movingSliceUpKeyboard = true;
		}
		
		//Q
		else if (e.keyCode === 81)
		{
			this.movingSliceDownKeyboard = true;
		}
	}
	
	
	
	handleKeyupEvent(e)
	{
		if (document.activeElement.tagName === "INPUT" || !(e.keyCode === 87 || e.keyCode === 83 || e.keyCode === 68 || e.keyCode === 65 || e.keyCode === 69 || e.keyCode === 81))
		{
			return;
		}
		
		
		
		if (this.moveVelocity[0] === 0 && this.moveVelocity[1] === 0 && this.moveVelocity[2] === 0 && this.moveVelocity[3] === 0)
		{
			this.moveVelocity[0] = this.nextMoveVelocity[0];
			this.moveVelocity[1] = this.nextMoveVelocity[1];
			this.moveVelocity[2] = this.nextMoveVelocity[2];
			
			this.moveVelocity[3] = this.nextMoveVelocity[3];
			
			this.nextMoveVelocity[0] = 0;
			this.nextMoveVelocity[1] = 0;
			this.nextMoveVelocity[2] = 0;
			
			this.nextMoveVelocity[3] = 0;
		}
		
		
		
		//W
		if (e.keyCode === 87)
		{
			this.movingForwardKeyboard = false;
		}
		
		//S
		else if (e.keyCode === 83)
		{
			this.movingBackwardKeyboard = false;
		}
		
		//D
		if (e.keyCode === 68)
		{
			this.movingRightKeyboard = false;
		}
		
		//A
		else if (e.keyCode === 65)
		{
			this.movingLeftKeyboard = false;
		}
		
		
		
		//E
		if (e.keyCode === 69)
		{
			this.movingSliceUpKeyboard = false;
		}
		
		//Q
		else if (e.keyCode === 81)
		{
			this.movingSliceDownKeyboard = false;
		}
	}
	
	
	
	updateCameraParameters()
	{
		this.movingSpeed = Math.min(Math.max(.000001, this.distanceToScene / 20), .02);
		
		
		
		if (this.movingPos)
		{
			const oldCameraPos = [...this.cameraPos];
			
			
			
			if (this.movingForwardKeyboard || this.movingForwardTouch)
			{
				this.cameraPos[0] += this.movingSpeed * this.forwardVec[0];
				this.cameraPos[1] += this.movingSpeed * this.forwardVec[1];
				this.cameraPos[2] += this.movingSpeed * this.forwardVec[2];
			}
			
			else if (this.movingBackwardKeyboard || this.movingBackwardTouch)
			{
				this.cameraPos[0] -= this.movingSpeed * this.forwardVec[0];
				this.cameraPos[1] -= this.movingSpeed * this.forwardVec[1];
				this.cameraPos[2] -= this.movingSpeed * this.forwardVec[2];
			}
			
			
			
			if (this.movingRightKeyboard)
			{
				this.cameraPos[0] += this.movingSpeed * this.rightVec[0] / this.focalLength;
				this.cameraPos[1] += this.movingSpeed * this.rightVec[1] / this.focalLength;
				this.cameraPos[2] += this.movingSpeed * this.rightVec[2] / this.focalLength;
			}
			
			else if (this.movingLeftKeyboard)
			{
				this.cameraPos[0] -= this.movingSpeed * this.rightVec[0] / this.focalLength;
				this.cameraPos[1] -= this.movingSpeed * this.rightVec[1] / this.focalLength;
				this.cameraPos[2] -= this.movingSpeed * this.rightVec[2] / this.focalLength;
			}
			
			
			
			this.nextMoveVelocity[0] = this.cameraPos[0] - oldCameraPos[0];
			this.nextMoveVelocity[1] = this.cameraPos[1] - oldCameraPos[1];
			this.nextMoveVelocity[2] = this.cameraPos[2] - oldCameraPos[2];
		}
		
		
		
		else
		{
			const oldC = [...this.c];
			const oldKSlice = this.kSlice;
			
			if (this.movingForwardKeyboard || this.movingForwardTouch)
			{
				this.c[0] += .5 * this.movingSpeed * this.forwardVec[0];
				this.c[1] += .5 * this.movingSpeed * this.forwardVec[1];
				this.c[2] += .5 * this.movingSpeed * this.forwardVec[2];
			}
			
			else if (this.movingBackwardKeyboard || this.movingBackwardTouch)
			{
				this.c[0] -= .5 * this.movingSpeed * this.forwardVec[0];
				this.c[1] -= .5 * this.movingSpeed * this.forwardVec[1];
				this.c[2] -= .5 * this.movingSpeed * this.forwardVec[2];
			}
			
			
			
			if (this.movingRightKeyboard)
			{
				this.c[0] += .5 * this.movingSpeed * this.rightVec[0] / this.focalLength;
				this.c[1] += .5 * this.movingSpeed * this.rightVec[1] / this.focalLength;
				this.c[2] += .5 * this.movingSpeed * this.rightVec[2] / this.focalLength;
			}
			
			else if (this.movingLeftKeyboard)
			{
				this.c[0] -= .5 * this.movingSpeed * this.rightVec[0] / this.focalLength;
				this.c[1] -= .5 * this.movingSpeed * this.rightVec[1] / this.focalLength;
				this.c[2] -= .5 * this.movingSpeed * this.rightVec[2] / this.focalLength;
			}
			
			
			
			if (this.movingSliceUpKeyboard)
			{
				this.kSlice += .5 * this.movingSpeed;
			}
			
			else if (this.movingSliceDownKeyboard)
			{
				this.kSlice -= .5 * this.movingSpeed;
			}
			
			
			
			try
			{
				this.cXInputElement.value = Math.round((this.c[0]) * 1000000) / 1000000;
				this.cYInputElement.value = Math.round((this.c[1]) * 1000000) / 1000000;
				this.cZInputElement.value = Math.round((this.c[2]) * 1000000) / 1000000;
				
				this.cWInputElement.value = Math.round((this.kSlice) * 1000000) / 1000000;
			}
			
			catch(ex) {}
			
			
			this.wilson.gl.uniform3fv(this.wilson.uniforms["c"], this.c);
			
			this.wilson.gl.uniform1f(this.wilson.uniforms["kSlice"], this.kSlice);
			
			
			
			this.nextMoveVelocity[0] = this.c[0] - oldC[0];
			this.nextMoveVelocity[1] = this.c[1] - oldC[1];
			this.nextMoveVelocity[2] = this.c[2] - oldC[2];
			
			this.nextMoveVelocity[3] = this.kSlice - oldKSlice;
		}
		
		
		
		this.calculateVectors();
	}
	
	
	
	changeResolution(resolution)
	{
		this.imageSize = resolution;
		
		if (this.wilson.fullscreen.currentlyFullscreen)
		{
			if (Page.Layout.aspectRatio >= 1)
			{
				this.imageWidth = this.imageSize;
				this.imageHeight = Math.floor(this.imageSize / Page.Layout.aspectRatio);
			}
			
			else
			{
				this.imageWidth = Math.floor(this.imageSize * Page.Layout.aspectRatio);
				this.imageHeight = this.imageSize;
			}
		}
		
		else
		{
			this.imageWidth = this.imageSize;
			this.imageHeight = this.imageSize;
		}
		
		
		
		this.wilson.changeCanvasSize(this.imageWidth, this.imageHeight);
		
		
		
		if (this.imageWidth >= this.imageHeight)
		{
			this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatioX"], this.imageWidth / this.imageHeight);
			this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatioY"], 1);
		}
		
		else
		{
			this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatioX"], 1);
			this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatioY"], this.imageWidth / this.imageHeight);
		}
		
		this.wilson.gl.uniform1i(this.wilson.uniforms["imageSize"], this.imageSize);
	}
	
	
	
	randomizeC(animateChange = true)
	{
		this.updateC([Math.random()*2 - 1, Math.random()*2 - 1, Math.random()*2 - 1, this.c[3]], animateChange);
	}
	
	
	
	updateC(newC, animateChange = true)
	{
		try
		{
			this.cXInputElement.value = Math.round(newC[0] * 1000000) / 1000000;
			this.cYInputElement.value = Math.round(newC[1] * 1000000) / 1000000;
			this.cZInputElement.value = Math.round(newC[2] * 1000000) / 1000000;
		}
		
		catch(ex) {}
		
		
		
		let dummy = {t: 0};
		
		const oldC = [...this.c];
		
		anime({
			targets: dummy,
			t: 1,
			duration: 1500 * animateChange + 10,
			easing: "easeOutQuad",
			update: () =>
			{
				this.c[0] = (1 - dummy.t) * oldC[0] + dummy.t * newC[0];
				this.c[1] = (1 - dummy.t) * oldC[1] + dummy.t * newC[1];
				this.c[2] = (1 - dummy.t) * oldC[2] + dummy.t * newC[2];
				
				this.wilson.gl.uniform3fv(this.wilson.uniforms["c"], this.c);
			}
		});
	}
	
	
	
	switchBulb()
	{
		if (this.juliaProportion !== 0 && this.juliaProportion !== 1)
		{
			return;
		}
		
		
		
		const oldJuliaProportion = this.juliaProportion;
		const newJuliaProportion = 1 - this.juliaProportion;
		
		try
		{
			changeOpacity(this.switchBulbButtonElement, 0, Site.opacityAnimationTime)
			
			setTimeout(() =>
			{
				if (oldJuliaProportion === 0)
				{
					this.switchBulbButtonElement.textContent = "Switch to Mandelbrot Set";
				}
				
				else
				{
					this.switchBulbButtonElement.textContent = "Switch to Julia Set";
				}
				
				changeOpacity(this.switchBulbButtonElement, 1, Site.opacityAnimationTime);
			}, Site.opacityAnimationTime);
		}
		
		catch(ex) {}
		
		
		
		if (this.juliaProportion === 0)
		{
			this.wilson.gl.uniform3fv(this.wilson.uniforms["c"], this.c);
			
			if (!this.movingPos)
			{
				this.wilson.gl.uniform1i(this.wilson.uniforms["drawSphere"], 1);
			}
			
			setTimeout(() =>
			{
				try
				{
					changeOpacity(this.switchMovementButtonElement, 1, Site.opacityAnimationTime);
					changeOpacity(this.randomizeCButtonElement, 1, Site.opacityAnimationTime);
				}
				
				catch(ex) {}
			}, Site.opacityAnimationTime);
		}
		
		else
		{
			this.movingPos = true;
			
			this.wilson.gl.uniform1i(this.wilson.uniforms["drawSphere"], 0);
			
			try
			{
				changeOpacity(this.switchMovementButtonElement, 0, Site.opacityAnimationTime);
				changeOpacity(this.randomizeCButtonElement, 0, Site.opacityAnimationTime);
			}
			
			catch(ex) {}
		}
		
		
		
		let dummy = {t: 0};
		
		anime({
			targets: dummy,
			t: 1,
			duration: 1500,
			easing: "easeOutQuad",
			update: () =>
			{
				this.juliaProportion = (1 - dummy.t) * oldJuliaProportion + dummy.t * newJuliaProportion;
				
				this.wilson.gl.uniform1f(this.wilson.uniforms["juliaProportion"], this.juliaProportion);
			}
		});
	}
	
	
	
	switchMovement()
	{
		this.movingPos = !this.movingPos;
		
		try
		{
			changeOpacity(this.switchMovementButtonElement, 0, Site.opacityAnimationTime);
			
			setTimeout(() =>
			{
				if (this.movingPos)
				{
					this.switchMovementButtonElement.textContent = "Change Julia Set";
				}
				
				else
				{
					this.switchMovementButtonElement.textContent = "Move Camera";
				}
				
				changeOpacity(this.switchMovementButtonElement, 1, Site.opacityAnimationTime);
			}, Site.opacityAnimationTime);
		}
		
		catch(ex) {}
		
		
		
		if (this.movingPos)
		{
			this.wilson.gl.uniform1i(this.wilson.uniforms["drawSphere"], 0);
		}
		
		else
		{
			this.wilson.gl.uniform1i(this.wilson.uniforms["drawSphere"], 1);
		}
	}
}