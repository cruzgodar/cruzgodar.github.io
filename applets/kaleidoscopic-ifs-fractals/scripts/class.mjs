import { Applet } from "/scripts/src/applets.mjs"
import { aspectRatio } from "/scripts/src/layout.mjs";

export class KaleidoscopicIFSFractal extends Applet
{
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
	
	moveFriction = .94;
	moveVelocityStopThreshhold = .0005;
	
	
	
	distanceToScene = 1;
	
	lastTimestamp = -1;
	
	
	
	theta = 3.2954;
	phi = 1.9657;
	
	nextThetaVelocity = 0;
	nextPhiVelocity = 0;
	
	thetaVelocity = 0;
	phiVelocity = 0;
	
	panFriction = .94;
	panVelocityStartThreshhold = .005;
	panVelocityStopThreshhold = .0005;
	
	
	
	imageSize = 500;
	imageWidth = 500;
	imageHeight = 500;
	
	numSierpinskiIterations = 24;
	
	scale = 2.0;
	
	imagePlaneCenterPos = [];
	
	forwardVec = [];
	rightVec = [];
	upVec = [];
	
	cameraPos = [2.1089, .41345, .95325];
	
	polyhedronIndex = 0;
	
	focalLength = 2;
	
	lightPos = [[0, 0, 5], [5, 5, 5], [0, 0, 5]];
	
	n1 = [[-.577350, 0, .816496],  [1, 0, 0], [.707107, 0, .707107]];
	n2 = [[.288675, -.5, .816496], [0, 1, 0], [0, .707107, .707107]];
	n3 = [[.288675, .5, .816496],  [0, 0, 1], [-.707107, 0, .707107]];
	n4 = [[],                      [],        [0, -.707107, .707107]];
	
	numNs = [3, 3, 4];
	
	scaleCenter = [[0, 0, 1], [.577350, .577350, .577350], [0, 0, 1]];
	
	rotationAngleX1 = 0;
	rotationAngleY1 = 0;
	rotationAngleZ1 = 0;
	rotationAngleX2 = 0;
	rotationAngleY2 = 0;
	rotationAngleZ2 = 0;
	
	rotationAngleX1Old = 0;
	rotationAngleY1Old = 0;
	rotationAngleZ1Old = 0;
	rotationAngleX2Old = 0;
	rotationAngleY2Old = 0;
	rotationAngleZ2Old = 0;
	
	rotationAngleX1Delta = 0;
	rotationAngleY1Delta = 0;
	rotationAngleZ1Delta = 0;
	rotationAngleX2Delta = 0;
	rotationAngleY2Delta = 0;
	rotationAngleZ2Delta = 0;
	
	parameterAnimationFrame = 0;
	
	
	
	constructor(canvas)
	{
		super(canvas);
		
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
			const float lightBrightness = 2.0;
			
			uniform int imageSize;
			
			
			
			const float clipDistance = 1000.0;
			const int maxMarches = 32;
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .2;
			const int maxIterations = 24;
			
			
			
			const vec3 color1 = vec3(1.0, 0.0, 0.0);
			const vec3 color2 = vec3(0.0, 1.0, 0.0);
			const vec3 color3 = vec3(0.0, 0.0, 1.0);
			const vec3 color4 = vec3(1.0, 1.0, 0.0);
			
			
			
			uniform vec3 scaleCenter;
			
			uniform int numNs;
			
			uniform vec3 n1;
			uniform vec3 n2;
			uniform vec3 n3;
			uniform vec3 n4;
			
			
			
			const float scale = 2.0;
			
			
			
			uniform mat3 rotationMatrix1;
			uniform mat3 rotationMatrix2;
			
			
			
			float distanceEstimator(vec3 pos)
			{
				vec3 mutablePos = pos;
				
				//We'll find the closest vertex, scale everything by a factor of 2 centered on that vertex (so that we don't need to recalculate the vertices), and repeat.
				for (int iteration = 0; iteration < maxIterations; iteration++)
				{
					//Fold space over on itself so that we can reference only the top vertex.
					float t1 = dot(mutablePos, n1);
					
					if (t1 < 0.0)
					{
						mutablePos -= 2.0 * t1 * n1;
					}
					
					float t2 = dot(mutablePos, n2);
					
					if (t2 < 0.0)
					{
						mutablePos -= 2.0 * t2 * n2;
					}
					
					float t3 = dot(mutablePos, n3);
					
					if (t3 < 0.0)
					{
						mutablePos -= 2.0 * t3 * n3;
					}
					
					if (numNs >= 4)
					{
						float t4 = dot(mutablePos, n4);
						
						if (t4 < 0.0)
						{
							mutablePos -= 2.0 * t4 * n4;
						}
					}
					
					
					
					mutablePos = rotationMatrix1 * mutablePos;
					
					//Scale the system -- this one takes me a fair bit of thinking to get. What's happening here is that we're stretching from a vertex, but since we never scale the vertices, the four new ones are the four closest to the vertex we scaled from. Now (x, y, z) will get farther and farther away from the origin, but that makes sense -- we're really just zooming in on the tetrahedron.
					mutablePos = scale * mutablePos - (scale - 1.0) * scaleCenter;
					
					mutablePos = rotationMatrix2 * mutablePos;
				}
				
				return length(mutablePos) * pow(1.0/scale, float(maxIterations));
			}
			
			
			
			vec3 getColor(vec3 pos)
			{
				vec3 mutablePos = pos;
				
				vec3 color = vec3(1.0, 1.0, 1.0);
				float colorScale = .5;
				
				
				
				//We'll find the closest vertex, scale everything by a factor of 2 centered on that vertex (so that we don't need to recalculate the vertices), and repeat.
				for (int iteration = 0; iteration < maxIterations; iteration++)
				{
					//Fold space over on itself so that we can reference only the top vertex.
					float t1 = dot(mutablePos, n1);
					
					if (t1 < 0.0)
					{
						mutablePos -= 2.0 * t1 * n1;
						
						color = mix(color, color1, colorScale);
					}
					
					float t2 = dot(mutablePos, n2);
					
					if (t2 < 0.0)
					{
						mutablePos -= 2.0 * t2 * n2;
						
						color = mix(color, color2, colorScale);
					}
					
					float t3 = dot(mutablePos, n3);
					
					if (t3 < 0.0)
					{
						mutablePos -= 2.0 * t3 * n3;
						
						color = mix(color, color3, colorScale);
					}
					
					if (numNs >= 4)
					{
						float t4 = dot(mutablePos, n4);
						
						if (t4 < 0.0)
						{
							mutablePos -= 2.0 * t4 * n4;
							
							color = mix(color, color4, colorScale);
						}
					}
					
					
					
					mutablePos = rotationMatrix1 * mutablePos;
					
					//Scale the system -- this one takes me a fair bit of thinking to get. What's happening here is that we're stretching from a vertex, but since we never scale the vertices, the four new ones are the four closest to the vertex we scaled from. Now (x, y, z) will get farther and farther away from the origin, but that makes sense -- we're really just zooming in on the tetrahedron.
					mutablePos = scale * mutablePos - (scale - 1.0) * scaleCenter;
					
					mutablePos = rotationMatrix2 * mutablePos;
					
					colorScale *= .5;
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
				vec3 rayDirectionVec = normalize(startPos - cameraPos) * .9;
				
				vec3 finalColor = fogColor;
				
				float epsilon = .0000001;
				
				float t = 0.0;
				
				
				
				for (int iteration = 0; iteration < maxMarches; iteration++)
				{
					vec3 pos = startPos + t * rayDirectionVec;
					
					float distance = distanceEstimator(pos);
					
					//This lowers the detail far away, which makes everything run nice and fast.
					epsilon = max(.0000006, 3.0 * t / float(imageSize));
					
					
					
					if (distance < epsilon)
					{
						finalColor = computeShading(pos, iteration);
						break;
					}
					
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
					
				vec3 finalColor = raymarch(imagePlaneCenterPos + rightVec * uv.x * aspectRatioX + upVec * uv.y / aspectRatioY);
				
				gl_FragColor = vec4(finalColor.xyz, 1.0);
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
			
			switchFullscreenCallback: this.changeResolution.bind(this),
			
			
			
			mousedownCallback: this.onGrabCanvas.bind(this),
			touchstartCallback: this.onGrabCanvas.bind(this),
			
			mousedragCallback: this.onDragCanvas.bind(this),
			touchmoveCallback: this.onDragCanvas.bind(this),
			
			mouseupCallback: this.onReleaseCanvas.bind(this),
			touchendCallback: this.onReleaseCanvas.bind(this)
		};
		
		this.wilson = new Wilson(canvas, options);
		
		this.wilson.render.initUniforms(["aspectRatioX", "aspectRatioY", "imageSize", "cameraPos", "imagePlaneCenterPos", "forwardVec", "rightVec", "upVec", "focalLength", "lightPos", "scaleCenter", "n1", "n2", "n3", "n4", "numNs", "rotationMatrix1", "rotationMatrix2"]);
		
		
		
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
		this.wilson.gl.uniform3fv(this.wilson.uniforms["lightPos"], this.lightPos[this.polyhedronIndex]);
		this.wilson.gl.uniform3fv(this.wilson.uniforms["scaleCenter"], this.scaleCenter[this.polyhedronIndex]);

		this.wilson.gl.uniform3fv(this.wilson.uniforms["forwardVec"], this.forwardVec);
		this.wilson.gl.uniform3fv(this.wilson.uniforms["rightVec"], this.rightVec);
		this.wilson.gl.uniform3fv(this.wilson.uniforms["upVec"], this.upVec);

		this.wilson.gl.uniform1f(this.wilson.uniforms["focalLength"], this.focalLength);

		this.wilson.gl.uniform3fv(this.wilson.uniforms["n1"], this.n1[this.polyhedronIndex]);
		this.wilson.gl.uniform3fv(this.wilson.uniforms["n2"], this.n2[this.polyhedronIndex]);
		this.wilson.gl.uniform3fv(this.wilson.uniforms["n3"], this.n3[this.polyhedronIndex]);
		this.wilson.gl.uniform3fv(this.wilson.uniforms["n4"], this.n4[this.polyhedronIndex]);

		this.wilson.gl.uniform1i(this.wilson.uniforms["numNs"], this.numNs[this.polyhedronIndex]);

		this.wilson.gl.uniformMatrix3fv(this.wilson.uniforms["rotationMatrix1"], false, [1, 0, 0, 0, 1, 0, 0, 0, 1]);
		this.wilson.gl.uniformMatrix3fv(this.wilson.uniforms["rotationMatrix2"], false, [1, 0, 0, 0, 1, 0, 0, 0, 1]);
		
		
		
		const boundFunction = this.handleKeydownEvent.bind(this);
		document.documentElement.addEventListener("keydown", boundFunction);
		this.handlers.push([document.documentElement, "keydown", boundFunction]);
		
		const boundFunction2 = this.handleKeyupEvent.bind(this);
		document.documentElement.addEventListener("keyup", boundFunction2);
		this.handlers.push([document.documentElement, "keyup", boundFunction2]);
		
		const boundFunction3 = () =>
		{
			this.changeResolution();
		};
		window.addEventListener("resize", boundFunction3);
		this.handlers.push([window, "resize", boundFunction3]);



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
		
		
		
		let needNewFrame = false;
		
		
		
		if (this.movingForwardKeyboard || this.movingBackwardKeyboard || this.movingRightKeyboard || this.movingLeftKeyboard || this.movingForwardTouch || this.movingBackwardTouch)
		{
			this.updateCameraParameters();
			
			needNewFrame = true;
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
			
			needNewFrame = true;
		}
		
		if (this.moveVelocity[0] !== 0 || this.moveVelocity[1] !== 0 || this.moveVelocity[2] !== 0)
		{
			this.cameraPos[0] += this.moveVelocity[0];
			this.cameraPos[1] += this.moveVelocity[1];
			this.cameraPos[2] += this.moveVelocity[2];
			
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
				
			needNewFrame = true;
		}
		
		
		
		if (needNewFrame)
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
	
	
	
	normalize(vec)
	{
		const magnitude = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
		
		return [vec[0] / magnitude, vec[1] / magnitude, vec[2] / magnitude];
	}
	
	
	
	distanceEstimator(x, y, z)
	{
		//We'll find the closest vertex, scale everything by a factor of 2 centered on that vertex (so that we don't need to recalculate the vertices), and repeat.
		for (let iteration = 0; iteration < this.numSierpinskiIterations; iteration++)
		{
			//Fold space over on itself so that we can reference only the top vertex.
			const t1 = this.dotProduct([x, y, z], this.n1[this.polyhedronIndex]);
			
			if (t1 < 0)
			{
				x -= 2 * t1 * this.n1[this.polyhedronIndex][0];
				y -= 2 * t1 * this.n1[this.polyhedronIndex][1];
				z -= 2 * t1 * this.n1[this.polyhedronIndex][2];
			}
			
			const t2 = this.dotProduct([x, y, z], this.n2[this.polyhedronIndex]);
			
			if (t2 < 0)
			{
				x -= 2 * t2 * this.n2[this.polyhedronIndex][0];
				y -= 2 * t2 * this.n2[this.polyhedronIndex][1];
				z -= 2 * t2 * this.n2[this.polyhedronIndex][2];
			}
			
			const t3 = this.dotProduct([x, y, z], this.n3[this.polyhedronIndex]);
			
			if (t3 < 0)
			{
				x -= 2 * t3 * this.n3[this.polyhedronIndex][0];
				y -= 2 * t3 * this.n3[this.polyhedronIndex][1];
				z -= 2 * t3 * this.n3[this.polyhedronIndex][2];
			}
			
			if (this.numNs[this.polyhedronIndex] >= 4)
			{
				const t4 = this.dotProduct([x, y, z], this.n4[this.polyhedronIndex]);
				
				if (t4 < 0)
				{
					x -= 2 * t4 * this.n4[this.polyhedronIndex][0];
					y -= 2 * t4 * this.n4[this.polyhedronIndex][1];
					z -= 2 * t4 * this.n4[this.polyhedronIndex][2];
				}
			}
			
			
			
			//Apply the first rotation matrix.
			
			let tempX = x;
			let tempY = y;
			let tempZ = z;
			
			let matZ = [[Math.cos(this.rotationAngleZ1), -Math.sin(this.rotationAngleZ1), 0], [Math.sin(this.rotationAngleZ1), Math.cos(this.rotationAngleZ1), 0], [0, 0, 1]];
			let matY = [[Math.cos(this.rotationAngleY1), 0, -Math.sin(this.rotationAngleY1)], [0, 1, 0],[Math.sin(this.rotationAngleY1), 0, Math.cos(this.rotationAngleY1)]];
			let matX = [[1, 0, 0], [0, Math.cos(this.rotationAngleX1), -Math.sin(this.rotationAngleX1)], [0, Math.sin(this.rotationAngleX1), Math.cos(this.rotationAngleX1)]];
			
			let matTotal = this.matMul(this.matMul(matZ, matY), matX);
			
			x = matTotal[0][0] * tempX + matTotal[0][1] * tempY + matTotal[0][2] * tempZ;
			y = matTotal[1][0] * tempX + matTotal[1][1] * tempY + matTotal[1][2] * tempZ;
			z = matTotal[2][0] * tempX + matTotal[2][1] * tempY + matTotal[2][2] * tempZ;
			
			
			
			//This one takes a fair bit of thinking to get. What's happening here is that we're stretching from a vertex, but since we never scale the vertices, the four new ones are the four closest to the vertex we scaled from. Now (x, y, z) will get farther and farther away from the origin, but that makes sense -- we're really just zooming in on the tetrahedron.
			x = this.scale * x - (this.scale - 1) * this.scaleCenter[this.polyhedronIndex][0];
			y = this.scale * y - (this.scale - 1) * this.scaleCenter[this.polyhedronIndex][1];
			z = this.scale * z - (this.scale - 1) * this.scaleCenter[this.polyhedronIndex][2];
			
			
			
			//Apply the second rotation matrix.
			
			tempX = x;
			tempY = y;
			tempZ = z;
			
			matZ = [[Math.cos(this.rotationAngleZ2), -Math.sin(this.rotationAngleZ2), 0], [Math.sin(this.rotationAngleZ2), Math.cos(this.rotationAngleZ2), 0], [0, 0, 1]];
			matY = [[Math.cos(this.rotationAngleY2), 0, -Math.sin(this.rotationAngleY2)], [0, 1, 0],[Math.sin(this.rotationAngleY2), 0, Math.cos(this.rotationAngleY2)]];
			matX = [[1, 0, 0], [0, Math.cos(this.rotationAngleX2), -Math.sin(this.rotationAngleX2)], [0, Math.sin(this.rotationAngleX2), Math.cos(this.rotationAngleX2)]];
			
			matTotal = this.matMul(this.matMul(matZ, matY), matX);
			
			x = matTotal[0][0] * tempX + matTotal[0][1] * tempY + matTotal[0][2] * tempZ;
			y = matTotal[1][0] * tempX + matTotal[1][1] * tempY + matTotal[1][2] * tempZ;
			z = matTotal[2][0] * tempX + matTotal[2][1] * tempY + matTotal[2][2] * tempZ;
		}
		
		
		
		//So at this point we've scaled up by 2x a total of numIterations times. The final distance is therefore:
		return Math.sqrt(x*x + y*y + z*z) * Math.pow(this.scale, -this.numSierpinskiIterations);
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
				
				window.requestAnimationFrame(this.drawFrame.bind(this));
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
				
				window.requestAnimationFrame(this.drawFrame.bind(this));
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
		
		window.requestAnimationFrame(this.drawFrame.bind(this));
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
		
		
		
		window.requestAnimationFrame(this.drawFrame.bind(this));
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
		
		
		
		this.calculateVectors();
	}
	
	
	
	changeResolution(resolution = this.imageSize)
	{
		this.imageSize = Math.max(100, resolution);
		
		
		
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
		
		
		
		window.requestAnimationFrame(this.drawFrame.bind(this));
	}
	
	
	
	updateParameters(newRotationAngleX1, newRotationAngleY1, newRotationAngleZ1, newRotationAngleX2, newRotationAngleY2, newRotationAngleZ2)
	{
		const target = this;
		
		anime({
			targets: target,
			rotationAngleX1: newRotationAngleX1,
			rotationAngleY1: newRotationAngleY1,
			rotationAngleZ1: newRotationAngleZ1,
			rotationAngleX2: newRotationAngleX2,
			rotationAngleY2: newRotationAngleY2,
			rotationAngleZ2: newRotationAngleZ2,
			duration: 1000,
			easing: "easeOutQuad",
			update: target.updateMatrices.bind(target)
		});
	}
	
	
	
	updateMatrices()
	{
		let matZ = [[Math.cos(this.rotationAngleZ1), -Math.sin(this.rotationAngleZ1), 0], [Math.sin(this.rotationAngleZ1), Math.cos(this.rotationAngleZ1), 0], [0, 0, 1]];
		let matY = [[Math.cos(this.rotationAngleY1), 0, -Math.sin(this.rotationAngleY1)], [0, 1, 0],[Math.sin(this.rotationAngleY1), 0, Math.cos(this.rotationAngleY1)]];
		let matX = [[1, 0, 0], [0, Math.cos(this.rotationAngleX1), -Math.sin(this.rotationAngleX1)], [0, Math.sin(this.rotationAngleX1), Math.cos(this.rotationAngleX1)]];
		
		let matTotal = this.matMul(this.matMul(matZ, matY), matX);
		
		this.wilson.gl.uniformMatrix3fv(this.wilson.uniforms["rotationMatrix1"], false, [matTotal[0][0], matTotal[1][0], matTotal[2][0], matTotal[0][1], matTotal[1][1], matTotal[2][1], matTotal[0][2], matTotal[1][2], matTotal[2][2]]);
		
		
		
		matZ = [[Math.cos(this.rotationAngleZ2), -Math.sin(this.rotationAngleZ2), 0], [Math.sin(this.rotationAngleZ2), Math.cos(this.rotationAngleZ2), 0], [0, 0, 1]];
		matY = [[Math.cos(this.rotationAngleY2), 0, -Math.sin(this.rotationAngleY2)], [0, 1, 0],[Math.sin(this.rotationAngleY2), 0, Math.cos(this.rotationAngleY2)]];
		matX = [[1, 0, 0], [0, Math.cos(this.rotationAngleX2), -Math.sin(this.rotationAngleX2)], [0, Math.sin(this.rotationAngleX2), Math.cos(this.rotationAngleX2)]];
		
		matTotal = this.matMul(this.matMul(matZ, matY), matX);
		
		this.wilson.gl.uniformMatrix3fv(this.wilson.uniforms["rotationMatrix2"], false, [matTotal[0][0], matTotal[1][0], matTotal[2][0], matTotal[0][1], matTotal[1][1], matTotal[2][1], matTotal[0][2], matTotal[1][2], matTotal[2][2]]);
		
		window.requestAnimationFrame(this.drawFrame.bind(this));
	}
	
	
	
	async changePolyhedron(newPolyhedronIndex)
	{
		await changeOpacity(this.wilson.canvas, 0, Site.opacityAnimationTime);
		
		this.polyhedronIndex = newPolyhedronIndex;
		
		this.wilson.gl.uniform3fv(this.wilson.uniforms["lightPos"], this.lightPos[this.polyhedronIndex]);
		
		this.wilson.gl.uniform3fv(this.wilson.uniforms["scaleCenter"], this.scaleCenter[this.polyhedronIndex]);
		
		this.wilson.gl.uniform3fv(this.wilson.uniforms["n1"], this.n1[this.polyhedronIndex]);
		this.wilson.gl.uniform3fv(this.wilson.uniforms["n2"], this.n2[this.polyhedronIndex]);
		this.wilson.gl.uniform3fv(this.wilson.uniforms["n3"], this.n3[this.polyhedronIndex]);
		this.wilson.gl.uniform3fv(this.wilson.uniforms["n4"], this.n4[this.polyhedronIndex]);
		
		this.wilson.gl.uniform1i(this.wilson.uniforms["numNs"], this.numNs[this.polyhedronIndex]);
		
		window.requestAnimationFrame(this.drawFrame.bind(this));
		
		changeOpacity(this.wilson.canvas, 1, Site.opacityAnimationTime);
	}
}