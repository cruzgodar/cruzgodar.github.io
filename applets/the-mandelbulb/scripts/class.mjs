import { Applet } from "/scripts/src/applets.mjs";
import { aspectRatio } from "/scripts/src/layout.mjs";
import { addTemporaryListener } from "/scripts/src/main.mjs";
import { Wilson } from "/scripts/wilson.mjs";

export class Mandelbulb extends Applet
{
	cXInputElement = null;
	cYInputElement = null;
	cZInputElement = null;

	rotationAngleXInputElement = null;
	rotationAngleYInputElement = null;
	rotationAngleZInputElement = null;

	currentlyDrawing = false;
	currentlyAnimatingParameters = false;
	
	currentlyDragging = false;
	
	drawStartTime = 0;
	
	mouseX = 0;
	mouseY = 0;
	
	movingForwardKeyboard = false;
	movingBackwardKeyboard = false;
	movingRightKeyboard = false;
	movingLeftKeyboard = false;
	
	movingForwardTouch = false;
	movingBackwardTouch = false;
	
	wasMovingTouch = false;
	
	movingSpeed = 0;
	
	
	
	nextMoveVelocity = [0, 0, 0];
	
	moveVelocity = [0, 0, 0];
	
	moveFriction = .91;
	moveVelocityStopThreshhold = .0005;
	
	
	
	distanceToScene = 1;
	
	lastTimestamp = -1;
	
	
	
	theta = 4.6601;
	phi = 2.272;
	
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
	
	cameraPos = [.0828, 2.17, 1.8925];
	
	focalLength = 2;
	
	lightPos = [0, 0, 5];
	
	power = 8;
	c = [0, 0, 0];
	cOld = [0, 0, 0];
	cDelta = [0, 0, 0];
	
	rotationAngleX = 0;
	rotationAngleY = 0;
	rotationAngleZ = 0;
	
	juliaProportion = 0;
	movingPos = 1;



	constructor(canvas, cXInputElement, cYInputElement, cZInputElement, rotationAngleXInputElement, rotationAngleYInputElement, rotationAngleZInputElement)
	{
		super(canvas);

		this.cXInputElement = cXInputElement;
		this.cYInputElement = cYInputElement;
		this.cZInputElement = cZInputElement;

		this.rotationAngleXInputElement = rotationAngleXInputElement;
		this.rotationAngleYInputElement = rotationAngleYInputElement;
		this.rotationAngleZInputElement = rotationAngleZInputElement;

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
			
			
			
			uniform mat3 rotationMatrix;
			
			uniform float power;
			uniform vec3 c;
			uniform float juliaProportion;
			
			
			
			float distanceEstimator(vec3 pos)
			{
				vec3 z = pos;
				
				float r = length(z);
				float dr = 1.0;
				
				for (int iteration = 0; iteration < 100; iteration++)
				{
					if (r > 16.0 || iteration >= maxIterations)
					{
						break;
					}
					
					float theta = acos(z.z / r);
					
					float phi = atan(z.y, z.x);
					
					dr = pow(r, power - 1.0) * power * dr + 1.0;
					
					theta *= power;
					
					phi *= power;
					
					z = pow(r, power) * vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));
					
					z += mix(pos, c, juliaProportion);
					
					z = rotationMatrix * z;
					
					r = length(z);
				}
				
				
				
				float distance1 = .5 * log(r) * r / dr;
				float distance2 = length(pos - c) - .05;
				
				
				
				if (distance2 < distance1 && drawSphere == 1)
				{
					return distance2;
				}
				
				
				
				return distance1;
			}
			
			
			
			vec3 getColor(vec3 pos)
			{
				vec3 z = pos;
				
				float r = length(z);
				float dr = 1.0;
				
				vec3 color = vec3(1.0, 1.0, 1.0);
				float colorScale = .5;
				
				for (int iteration = 0; iteration < 100; iteration++)
				{
					if (r > 16.0 || iteration >= maxIterations)
					{
						break;
					}
					
					float theta = acos(z.z / r);
					
					float phi = atan(z.y, z.x);
					
					dr = pow(r, power - 1.0) * power * dr + 1.0;
					
					theta *= power;
					
					phi *= power;
					
					z = pow(r, power) * vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));
					
					z += mix(pos, c, juliaProportion);
					
					z = rotationMatrix * z;
					
					r = length(z);
					
					color = mix(color, abs(z / r), colorScale);
					
					colorScale *= .5;
				}
				
				color /= max(max(color.x, color.y), color.z);
				
				
				
				float distance1 = .5 * log(r) * r / dr;
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
				
				gl_FragColor = vec4(raymarch(imagePlaneCenterPos + rightVec * uv.x * aspectRatioX + upVec * uv.y / aspectRatioY), 1.0);
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
			
			switchFullscreenCallback: () => this.changeResolution(),
			
			
			
			mousedownCallback: this.onGrabCanvas.bind(this),
			touchstartCallback: this.onGrabCanvas.bind(this),
			
			mousedragCallback: this.onDragCanvas.bind(this),
			touchmoveCallback: this.onDragCanvas.bind(this),
			
			mouseupCallback: this.onReleaseCanvas.bind(this),
			touchendCallback: this.onReleaseCanvas.bind(this)
		};
		
		this.wilson = new Wilson(canvas, options);
		
		this.wilson.render.initUniforms(["aspectRatioX", "aspectRatioY", "imageSize", "cameraPos", "imagePlaneCenterPos", "forwardVec", "rightVec", "upVec", "focalLength", "lightPos", "drawSphere", "power", "c", "juliaProportion", "rotationMatrix", "maxMarches", "stepFactor", "maxIterations"]);


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
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["power"], 8);
		this.wilson.gl.uniform3fv(this.wilson.uniforms["c"], this.c);
		this.wilson.gl.uniform1f(this.wilson.uniforms["juliaProportion"], 0);
		
		this.wilson.gl.uniformMatrix3fv(this.wilson.uniforms["rotationMatrix"], false, [1, 0, 0, 0, 1, 0, 0, 0, 1]);
		
		this.wilson.gl.uniform1i(this.wilson.uniforms["maxMarches"], this.maxMarches);
		this.wilson.gl.uniform1f(this.wilson.uniforms["stepFactor"], 1);
		this.wilson.gl.uniform1i(this.wilson.uniforms["maxIterations"], this.maxIterations);



		const boundFunction = this.handleKeydownEvent.bind(this);
		addTemporaryListener({
			object: document.documentElement,
			event: "keydown",
			callback: boundFunction
		});
		
		const boundFunction2 = this.handleKeyupEvent.bind(this);
		addTemporaryListener({
			object: document.documentElement,
			event: "keyup",
			callback: boundFunction2
		});

		const boundFunction3 = () => this.changeResolution();
		addTemporaryListener({
			object: window,
			event: "resize",
			callback: boundFunction3
		});
		
		
		
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


		
		if (this.movingForwardKeyboard || this.movingBackwardKeyboard || this.movingRightKeyboard || this.movingLeftKeyboard || this.movingForwardTouch || this.movingBackwardTouch)
		{
			this.updateCameraParameters();
		}
		
		else if (timeElapsed >= 50)
		{
			this.nextThetaVelocity = 0;
			this.nextPhiVelocity = 0;
			
			this.thetaVelocity = 0;
			this.phiVelocity = 0;
			
			this.movingForwardTouch = false;
			this.movingBackwardTouch = false;
			
			this.moveVelocity[0] = 0;
			this.moveVelocity[1] = 0;
			this.moveVelocity[2] = 0;
			
			this.nextMoveVelocity[0] = 0;
			this.nextMoveVelocity[1] = 0;
			this.nextMoveVelocity[2] = 0;
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
		
		if (this.moveVelocity[0] !== 0 || this.moveVelocity[1] !== 0 || this.moveVelocity[2] !== 0)
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
				
				try
				{
					this.cXInputElement.value = Math.round((c[0]) * 1000000) / 1000000;
					this.cYInputElement.value = Math.round((c[1]) * 1000000) / 1000000;
					this.cZInputElement.value = Math.round((c[2]) * 1000000) / 1000000;
				}

				catch(ex) {}
				
				this.wilson.gl.uniform3fv(this.wilson.uniforms["c"], this.c);
			}
			
			
			
			this.moveVelocity[0] *= this.moveFriction;
			this.moveVelocity[1] *= this.moveFriction;
			this.moveVelocity[2] *= this.moveFriction;
			
			if (this.moveVelocity[0] * this.moveVelocity[0] + this.moveVelocity[1] * this.moveVelocity[1] + this.moveVelocity[2] * this.moveVelocity[2] < this.moveVelocityStopThreshhold * this.movingSpeed * this.moveVelocityStopThreshhold * this.movingSpeed)
			{
				this.moveVelocity[0] = 0;
				this.moveVelocity[1] = 0;
				this.moveVelocity[2] = 0;
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
		
		
		
		this.distanceToScene =this.distanceEstimator(this.cameraPos[0], this.cameraPos[1], this.cameraPos[2]);
		
		
		
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
	
	
	
	crossProduct(vec1, vec2)
	{
		return [vec1[1] * vec2[2] - vec1[2] * vec2[1], vec1[2] * vec2[0] - vec1[0] * vec2[2], vec1[0] * vec2[1] - vec1[1] * vec2[0]];
	}
	
	
	
	matMul(mat1, mat2)
	{
		return [
			[mat1[0][0]*mat2[0][0] + mat1[0][1]*mat2[1][0] + mat1[0][2]*mat2[2][0],
			mat1[0][0]*mat2[0][1] + mat1[0][1]*mat2[1][1] + mat1[0][2]*mat2[2][1],
			mat1[0][0]*mat2[0][2] + mat1[0][1]*mat2[1][2] + mat1[0][2]*mat2[2][2]],
			
			[mat1[1][0]*mat2[0][0] + mat1[1][1]*mat2[1][0] + mat1[1][2]*mat2[2][0],
			mat1[1][0]*mat2[0][1] + mat1[1][1]*mat2[1][1] + mat1[1][2]*mat2[2][1],
			mat1[1][0]*mat2[0][2] + mat1[1][1]*mat2[1][2] + mat1[1][2]*mat2[2][2]],
			
			[mat1[2][0]*mat2[0][0] + mat1[2][1]*mat2[1][0] + mat1[2][2]*mat2[2][0],
			mat1[2][0]*mat2[0][1] + mat1[2][1]*mat2[1][1] + mat1[2][2]*mat2[2][1],
			mat1[2][0]*mat2[0][2] + mat1[2][1]*mat2[1][2] + mat1[2][2]*mat2[2][2]]
		];
	}



	updateRotationMatrix()
	{
		const matZ = [[Math.cos(this.rotationAngleZ), -Math.sin(this.rotationAngleZ), 0], [Math.sin(this.rotationAngleZ), Math.cos(this.rotationAngleZ), 0], [0, 0, 1]];
		const matY = [[Math.cos(this.rotationAngleY), 0, -Math.sin(this.rotationAngleY)], [0, 1, 0],[Math.sin(this.rotationAngleY), 0, Math.cos(this.rotationAngleY)]];
		const matX = [[1, 0, 0], [0, Math.cos(this.rotationAngleX), -Math.sin(this.rotationAngleX)], [0, Math.sin(this.rotationAngleX), Math.cos(this.rotationAngleX)]];
		
		const matTotal = this.matMul(this.matMul(matZ, matY), matX);

		this.wilson.gl.uniformMatrix3fv(this.wilson.uniforms["rotationMatrix"], false, [matTotal[0][0], matTotal[1][0], matTotal[2][0], matTotal[0][1], matTotal[1][1], matTotal[2][1], matTotal[0][2], matTotal[1][2], matTotal[2][2]]);
	}
	
	
	
	normalize(vec)
	{
		const magnitude = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
		
		return [vec[0] / magnitude, vec[1] / magnitude, vec[2] / magnitude];
	}
	
	
	
	distanceEstimator(x, y, z)
	{
		const mutableZ = [x, y, z];
		
		let r = 0.0;
		let dr = 1.0;
		
		for (let iteration = 0; iteration < this.maxIterations * 4; iteration++)
		{
			r = Math.sqrt(this.dotProduct(mutableZ, mutableZ));
			
			if (r > 16.0)
			{
				break;
			}
			
			let theta = Math.acos(mutableZ[2] / r);
			
			let phi = Math.atan2(mutableZ[1], mutableZ[0]);
			
			dr = Math.pow(r, this.power - 1.0) * this.power * dr + 1.0;
			
			theta = theta * this.power;
			
			phi = phi * this.power;
			
			const scaledR = Math.pow(r, this.power);
			
			mutableZ[0] = scaledR * Math.sin(this.theta) * Math.cos(this.phi) + ((1 - this.juliaProportion) * x + this.juliaProportion * this.c[0]);
			mutableZ[1] = scaledR * Math.sin(this.theta) * Math.sin(this.phi) + ((1 - this.juliaProportion) * y + this.juliaProportion * this.c[1]);
			mutableZ[2] = scaledR * Math.cos(this.theta) + ((1 - this.juliaProportion) * z + this.juliaProportion * this.c[2]);
			
			
			
			//Apply the rotation matrix.
			
			const tempX = mutableZ[0];
			const tempY = mutableZ[1];
			const tempZ = mutableZ[2];
			
			const matZ = [[Math.cos(this.rotationAngleZ), -Math.sin(this.rotationAngleZ), 0], [Math.sin(this.rotationAngleZ), Math.cos(this.rotationAngleZ), 0], [0, 0, 1]];
			const matY = [[Math.cos(this.rotationAngleY), 0, -Math.sin(this.rotationAngleY)], [0, 1, 0],[Math.sin(this.rotationAngleY), 0, Math.cos(this.rotationAngleY)]];
			const matX = [[1, 0, 0], [0, Math.cos(this.rotationAngleX), -Math.sin(this.rotationAngleX)], [0, Math.sin(this.rotationAngleX), Math.cos(this.rotationAngleX)]];
			
			const matTotal = this.matMul(this.matMul(matZ, matY), matX);
			
			mutableZ[0] = matTotal[0][0] * tempX + matTotal[0][1] * tempY + matTotal[0][2] * tempZ;
			mutableZ[1] = matTotal[1][0] * tempX + matTotal[1][1] * tempY + matTotal[1][2] * tempZ;
			mutableZ[2] = matTotal[2][0] * tempX + matTotal[2][1] * tempY + matTotal[2][2] * tempZ;
		}
		
		
		
		return 0.5 * Math.log(r) * r / dr;
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
				
				this.nextMoveVelocity[0] = 0;
				this.nextMoveVelocity[1] = 0;
				this.nextMoveVelocity[2] = 0;
			}
			
			else if (event.touches.length === 3)
			{
				this.movingForwardTouch = false;
				this.movingBackwardTouch = true;
				
				this.moveVelocity[0] = 0;
				this.moveVelocity[1] = 0;
				this.moveVelocity[2] = 0;
				
				this.nextMoveVelocity[0] = 0;
				this.nextMoveVelocity[1] = 0;
				this.nextMoveVelocity[2] = 0;
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
				
				this.nextMoveVelocity[0] = 0;
				this.nextMoveVelocity[1] = 0;
				this.nextMoveVelocity[2] = 0;
			}
		}
		
		if (((event.type === "touchend" && event.touches,length === 0) || event.type === "mouseup") && (this.nextThetaVelocity * this.nextThetaVelocity + this.nextPhiVelocity * this.nextPhiVelocity >= this.panVelocityStartThreshhold * this.panVelocityStartThreshhold))
		{
			this.thetaVelocity = this.nextThetaVelocity;
			this.phiVelocity = this.nextPhiVelocity;
		}
	}
	
	
	
	handleKeydownEvent(e)
	{
		if (document.activeElement.tagName === "INPUT" || !(e.keyCode === 87 || e.keyCode === 83 || e.keyCode === 68 || e.keyCode === 65))
		{
			return;
		}
		
		
		
		this.nextMoveVelocity = [0, 0, 0];
		this.moveVelocity = [0, 0, 0];
		
		
		
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
	}
	
	
	
	handleKeyupEvent(e)
	{
		if (document.activeElement.tagName === "INPUT" || !(e.keyCode === 87 || e.keyCode === 83 || e.keyCode === 68 || e.keyCode === 65))
		{
			return;
		}
		
		
		
		if (this.moveVelocity[0] === 0 && this.moveVelocity[1] === 0 && this.moveVelocity[2] === 0)
		{
			this.moveVelocity[0] = this.nextMoveVelocity[0];
			this.moveVelocity[1] = this.nextMoveVelocity[1];
			this.moveVelocity[2] = this.nextMoveVelocity[2];
			
			this.nextMoveVelocity[0] = 0;
			this.nextMoveVelocity[1] = 0;
			this.nextMoveVelocity[2] = 0;
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
			
			
			
			try
			{
				cXInputElement.value = Math.round((this.c[0]) * 1000000) / 1000000;
				cYInputElement.value = Math.round((this.c[1]) * 1000000) / 1000000;
				cZInputElement.value = Math.round((this.c[2]) * 1000000) / 1000000;
			}

			catch(ex) {}
			
			
			
			this.wilson.gl.uniform3fv(this.wilson.uniforms["c"], this.c);
			
			
			
			this.nextMoveVelocity[0] = this.c[0] - oldC[0];
			this.nextMoveVelocity[1] = this.c[1] - oldC[1];
			this.nextMoveVelocity[2] = this.c[2] - oldC[2];
		}
		
		
		
		this.calculateVectors();
	}
	
	
	
	changeResolution(resolution = this.imageSize)
	{
		this.imageSize = resolution;
		
		
		
		if (this.wilson.fullscreen.currentlyFullscreen)
		{
			if (aspectRatio >= 1)
			{
				this.imageWidth = this.imageSize;
				this.imageHeight = Math.floor(this.imageSize / aspectRatio);
			}
			
			else
			{
				this.imageWidth = Math.floor(this.imageSize * aspectRatio);
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
	
	
	
	randomizeRotation(animateChange = true)
	{
		const dummy = {t: 0};

		const xOld = this.rotationAngleX;
		const yOld = this.rotationAngleY;
		const zOld = this.rotationAngleZ;
		const xNew = Math.random()*2 - 1;
		const yNew = Math.random()*2 - 1;
		const zNew = Math.random()*2 - 1;

		try
		{
			this.rotationAngleXInputElement.value = Math.round(xNew * 1000000) / 1000000;
			this.rotationAngleYInputElement.value = Math.round(yNew * 1000000) / 1000000;
			this.rotationAngleZInputElement.value = Math.round(zNew * 1000000) / 1000000;
		}

		catch(ex) {}

		anime({
			targets: dummy,
			t: 1,
			duration: 1000 * animateChange + 10,
			easing: "easeOutSine",
			update: () =>
			{
				this.rotationAngleX = (1 - dummy.t) * xOld + dummy.t * xNew;
				this.rotationAngleY = (1 - dummy.t) * yOld + dummy.t * yNew;
				this.rotationAngleZ = (1 - dummy.t) * zOld + dummy.t * zNew;

				this.updateRotationMatrix();
			}
		});
	}
	
	
	
	randomizeC(animateChange = true)
	{
		const dummy = {t: 0};

		const xOld = this.c[0];
		const yOld = this.c[1];
		const zOld = this.c[2];
		const xNew = Math.random()*1.5 - .75;
		const yNew = Math.random()*1.5 - .75;
		const zNew = Math.random()*1.5 - .75;

		try
		{
			this.cXInputElement.value = Math.round(xNew * 1000000) / 1000000;
			this.cYInputElement.value = Math.round(yNew * 1000000) / 1000000;
			this.cZInputElement.value = Math.round(zNew * 1000000) / 1000000;
		}

		catch(ex) {}

		anime({
			targets: dummy,
			t: 1,
			duration: 1000 * animateChange + 10,
			easing: "easeOutSine",
			update: () =>
			{
				this.c[0] = (1 - dummy.t) * xOld + dummy.t * xNew;
				this.c[1] = (1 - dummy.t) * yOld + dummy.t * yNew;
				this.c[2] = (1 - dummy.t) * zOld + dummy.t * zNew;

				this.wilson.gl.uniform3fv(this.wilson.uniforms["c"], this.c);
			}
		});
	}
	
	
	
	switchBulb()
	{
		if (this.juliaProportion === 0)
		{
			this.wilson.gl.uniform3fv(this.wilson.uniforms["c"], this.c);
			
			if (!this.movingPos)
			{
				this.wilson.gl.uniform1i(this.wilson.uniforms["drawSphere"], 1);
			}
		}
		
		else
		{
			this.movingPos = true;
			
			this.wilson.gl.uniform1i(this.wilson.uniforms["drawSphere"], 0);
		}

		const dummy = {t: 0};

		const oldJuliaProportion = this.juliaProportion;
		const newJuliaProportion = this.juliaProportion === 0 ? 1 : 0;

		anime({
			targets: dummy,
			t: 1,
			duration: 1000,
			easing: "easeOutSine",
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