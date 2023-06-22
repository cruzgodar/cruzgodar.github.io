!function()
{
	"use strict";
	
	
	
	let fragShaderSource = `
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
	
	
	
	let options =
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
		
		switchFullscreenCallback: changeResolution,
		
		
		
		mousedownCallback: onGrabCanvas,
		touchstartCallback: onGrabCanvas,
		
		mousedragCallback: onDragCanvas,
		touchmoveCallback: onDragCanvas,
		
		mouseupCallback: onReleaseCanvas,
		touchendCallback: onReleaseCanvas
	};
	
	let wilson = new Wilson($("#output-canvas"), options);
	
	wilson.render.initUniforms(["aspectRatioX", "aspectRatioY", "imageSize", "cameraPos", "imagePlaneCenterPos", "forwardVec", "rightVec", "upVec", "focalLength", "lightPos", "drawSphere", "power", "c", "juliaProportion", "rotationMatrix", "maxMarches", "stepFactor", "maxIterations"]);
	
	
	
	
	let currentlyDrawing = false;
	let currentlyAnimatingParameters = false;
	
	let currentlyDragging = false;
	
	let drawStartTime = 0;
	
	let mouseX = 0;
	let mouseY = 0;
	
	let movingForwardKeyboard = false;
	let movingBackwardKeyboard = false;
	let movingRightKeyboard = false;
	let movingLeftKeyboard = false;
	
	let movingForwardTouch = false;
	let movingBackwardTouch = false;
	
	let wasMovingTouch = false;
	
	let movingSpeed = 0;
	
	
	
	let nextMoveVelocity = [0, 0, 0];
	
	let moveVelocity = [0, 0, 0];
	
	const moveFriction = .94;
	const moveVelocityStopThreshhold = .0005;
	
	
	
	let distanceToScene = 1;
	
	let lastTimestamp = -1;
	
	
	
	let theta = 4.6601;
	let phi = 2.272;
	
	let nextThetaVelocity = 0;
	let nextPhiVelocity = 0;
	
	let thetaVelocity = 0;
	let phiVelocity = 0;
	
	const panFriction = .94;
	const panVelocityStartThreshhold = .005;
	const panVelocityStopThreshhold = .0005;
	
	
	
	let imageSize = 500;
	let imageWidth = 500;
	let imageHeight = 500;
	
	let maxIterations = 4;
	
	let maxMarches = 100;
	
	let imagePlaneCenterPos = [];
	
	let forwardVec = [];
	let rightVec = [];
	let upVec = [];
	
	let cameraPos = [.0828, 2.17, 1.8925];
	
	let focalLength = 2;
	
	let lightPos = [0, 0, 5];
	
	let power = 8;
	let c = [0, 0, 0];
	let cOld = [0, 0, 0];
	let cDelta = [0, 0, 0];
	
	let rotationAngleX = 0;
	let rotationAngleY = 0;
	let rotationAngleZ = 0;
	
	let juliaProportion = 0;
	let movingPos = 1;
	
	let powerOld = 8;
	let powerDelta = 0;
	
	let juliaProportionOld = 0;
	let juliaProportionDelta = 0;
	
	let rotationAngleXOld = 0;
	let rotationAngleYOld = 0;
	let rotationAngleZOld = 0;
	let rotationAngleXDelta = 0;
	let rotationAngleYDelta = 0;
	let rotationAngleZDelta = 0;
	
	let parameterAnimationFrame = 0;
	
	
	
	let resolutionInputElement = $("#resolution-input");
	
	resolutionInputElement.addEventListener("input", changeResolution);
	
	
	
	let iterationsInputElement = $("#iterations-input");
	
	iterationsInputElement.addEventListener("input", () =>
	{
		maxIterations = parseInt(iterationsInputElement.value || 4);
		
		wilson.gl.uniform1i(wilson.uniforms["maxIterations"], maxIterations);
		
		window.requestAnimationFrame(drawFrame);
	});
	
	
	
	let viewDistanceInputElement = $("#view-distance-input");
	
	viewDistanceInputElement.addEventListener("input", () =>
	{
		maxMarches = Math.max(parseInt(viewDistanceInputElement.value || 100), 32);
		
		wilson.gl.uniform1i(wilson.uniforms["maxMarches"], maxMarches);
		
		window.requestAnimationFrame(drawFrame);
	});
	
	
	
	let downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		wilson.gl.uniform1i(wilson.uniforms["maxMarches"], 1024);
		wilson.gl.uniform1f(wilson.uniforms["stepFactor"], 12);
		
		
		
		if (juliaProportion === 0)
		{	
			wilson.downloadFrame("the-mandelbulb.png");
		}
		
		else
		{
			wilson.downloadFrame("a-juliabulb.png");
		}
		
		
		
		wilson.gl.uniform1i(wilson.uniforms["maxMarches"], maxMarches);
		wilson.gl.uniform1f(wilson.uniforms["stepFactor"], 1);
	});
	
	
	
	let rotationAngleXInputElement = $("#rotation-angle-x-input");
	let rotationAngleYInputElement = $("#rotation-angle-y-input");
	let rotationAngleZInputElement = $("#rotation-angle-z-input");
	
	let cXInputElement = $("#c-x-input");
	let cYInputElement = $("#c-y-input");
	let cZInputElement = $("#c-z-input");
	
	let powerInputElement = $("#power-input");
	
	let elements = [rotationAngleXInputElement, rotationAngleYInputElement, rotationAngleZInputElement, cXInputElement, cYInputElement, cZInputElement, powerInputElement];
	
	for (let i = 0; i < 7; i++)
	{
		elements[i].addEventListener("input", updateParameters);
	}
	
	
	
	let randomizeRotationButtonElement = $("#randomize-rotation-button");
	
	randomizeRotationButtonElement.style.opacity = 1;
	
	randomizeRotationButtonElement.addEventListener("click", randomizeRotation);
	
	
	
	let randomizeCButtonElement = $("#randomize-c-button");
	
	randomizeCButtonElement.style.opacity = 1;
	
	randomizeCButtonElement.addEventListener("click", randomizeC);
	
	
	
	let switchBulbButtonElement = $("#switch-bulb-button");
	
	switchBulbButtonElement.style.opacity = 1;
	
	switchBulbButtonElement.addEventListener("click", switchBulb);
	
	
	
	let switchMovementButtonElement = $("#switch-movement-button");
	
	switchMovementButtonElement.style.opacity = 0;
	
	switchMovementButtonElement.addEventListener("click", switchMovement);
	
	
	
	Page.Load.TextButtons.equalize();
	
	
	
	calculateVectors();
	
	
	
	if (imageWidth >= imageHeight)
	{
		wilson.gl.uniform1f(wilson.uniforms["aspectRatioX"], imageWidth / imageHeight);
		wilson.gl.uniform1f(wilson.uniforms["aspectRatioY"], 1);
	}
	
	else
	{
		wilson.gl.uniform1f(wilson.uniforms["aspectRatioX"], 1);
		wilson.gl.uniform1f(wilson.uniforms["aspectRatioY"], imageWidth / imageHeight);
	}
	
	wilson.gl.uniform1i(wilson.uniforms["imageSize"], imageSize);
	
	wilson.gl.uniform3fv(wilson.uniforms["cameraPos"], cameraPos);
	wilson.gl.uniform3fv(wilson.uniforms["imagePlaneCenterPos"], imagePlaneCenterPos);
	wilson.gl.uniform3fv(wilson.uniforms["lightPos"], lightPos);
	
	wilson.gl.uniform3fv(wilson.uniforms["forwardVec"], forwardVec);
	wilson.gl.uniform3fv(wilson.uniforms["rightVec"], rightVec);
	wilson.gl.uniform3fv(wilson.uniforms["upVec"], upVec);
	
	wilson.gl.uniform1f(wilson.uniforms["focalLength"], focalLength);
	
	wilson.gl.uniform1i(wilson.uniforms["drawSphere"], 0);
	
	wilson.gl.uniform1f(wilson.uniforms["power"], 8);
	wilson.gl.uniform3fv(wilson.uniforms["c"], c);
	wilson.gl.uniform1f(wilson.uniforms["juliaProportion"], 0);
	
	wilson.gl.uniformMatrix3fv(wilson.uniforms["rotationMatrix"], false, [1, 0, 0, 0, 1, 0, 0, 0, 1]);
	
	wilson.gl.uniform1i(wilson.uniforms["maxMarches"], maxMarches);
	wilson.gl.uniform1f(wilson.uniforms["stepFactor"], 1);
	wilson.gl.uniform1i(wilson.uniforms["maxIterations"], maxIterations);
	
	
	
	window.requestAnimationFrame(drawFrame);
	
	
	
	Page.show();
	
	
	
	function drawFrame(timestamp)
	{
		let timeElapsed = timestamp - lastTimestamp;
		
		lastTimestamp = timestamp;
		
		
		
		if (timeElapsed === 0)
		{
			return;
		}
		
		
		
		wilson.render.drawFrame();
		
		
		
		let needNewFrame = false;
		
		
		
		if (currentlyAnimatingParameters)
		{
			animateParameterChangeStep();
			
			needNewFrame = true;
		}
		
		
		
		
		
		
		
		if (movingForwardKeyboard || movingBackwardKeyboard || movingRightKeyboard || movingLeftKeyboard || movingForwardTouch || movingBackwardTouch)
		{
			updateCameraParameters();
			
			needNewFrame = true;
		}
		
		else if (timeElapsed >= 50)
		{
			nextThetaVelocity = 0;
			nextPhiVelocity = 0;
			
			thetaVelocity = 0;
			phiVelocity = 0;
			
			movingForwardTouch = false;
			movingBackwardTouch = false;
			
			moveVelocity[0] = 0;
			moveVelocity[1] = 0;
			moveVelocity[2] = 0;
			
			nextMoveVelocity[0] = 0;
			nextMoveVelocity[1] = 0;
			nextMoveVelocity[2] = 0;
		}
		
		
		
		if (thetaVelocity !== 0 || phiVelocity !== 0)
		{
			theta += thetaVelocity;
			phi += phiVelocity;
			
			
			
			if (theta >= 2 * Math.PI)
			{
				theta -= 2 * Math.PI;
			}
			
			else if (theta < 0)
			{
				theta += 2 * Math.PI;
			}
			
			
			
			if (phi > Math.PI - .01)
			{
				phi = Math.PI - .01;
			}
			
			else if (phi < .01)
			{
				phi = .01;
			}
			
			
			
			thetaVelocity *= panFriction;
			phiVelocity *= panFriction;
			
			if (Math.sqrt(thetaVelocity * thetaVelocity + phiVelocity * phiVelocity) < panVelocityStopThreshhold)
			{
				thetaVelocity = 0;
				phiVelocity = 0;
			}
			
			
			
			calculateVectors();
			
			needNewFrame = true;
		}
		
		if (moveVelocity[0] !== 0 || moveVelocity[1] !== 0 || moveVelocity[2] !== 0)
		{
			if (movingPos)
			{	
				cameraPos[0] += moveVelocity[0];
				cameraPos[1] += moveVelocity[1];
				cameraPos[2] += moveVelocity[2];
			}
			
			else
			{
				c[0] += moveVelocity[0];
				c[1] += moveVelocity[1];
				c[2] += moveVelocity[2];
				
				cXInputElement.value = Math.round((c[0]) * 1000000) / 1000000;
				cYInputElement.value = Math.round((c[1]) * 1000000) / 1000000;
				cZInputElement.value = Math.round((c[2]) * 1000000) / 1000000;
				
				wilson.gl.uniform3fv(wilson.uniforms["c"], c);
			}
			
			
			
			moveVelocity[0] *= moveFriction;
			moveVelocity[1] *= moveFriction;
			moveVelocity[2] *= moveFriction;
			
			if (Math.sqrt(moveVelocity[0] * moveVelocity[0] + moveVelocity[1] * moveVelocity[1] + moveVelocity[2] * moveVelocity[2]) < moveVelocityStopThreshhold * movingSpeed)
			{
				moveVelocity[0] = 0;
				moveVelocity[1] = 0;
				moveVelocity[2] = 0;
			}
			
			
			
			calculateVectors();
				
			needNewFrame = true;
		}
		
		
		
		if (needNewFrame)
		{
			window.requestAnimationFrame(drawFrame);
		}
	}
	
	
	
	function calculateVectors()
	{
		//Here comes the serious math. Theta is the angle in the xy-plane and phi the angle down from the z-axis. We can use them get a normalized forward vector:
		forwardVec = [Math.cos(theta) * Math.sin(phi), Math.sin(theta) * Math.sin(phi), Math.cos(phi)];
		
		//Now the right vector needs to be constrained to the xy-plane, since otherwise the image will appear tilted. For a vector (a, b, c), the orthogonal plane that passes through the origin is ax + by + cz = 0, so we want ax + by = 0. One solution is (b, -a), and that's the one that goes to the "right" of the forward vector (when looking down).
		rightVec = normalize([forwardVec[1], -forwardVec[0], 0]);
		
		//Finally, the upward vector is the cross product of the previous two.
		upVec = crossProduct(rightVec, forwardVec);
		
		
		
		distanceToScene = distanceEstimator(cameraPos[0], cameraPos[1], cameraPos[2]);
		
		
		
		focalLength = distanceToScene / 2;
		
		//The factor we divide by here sets the fov.
		rightVec[0] *= focalLength / 2;
		rightVec[1] *= focalLength / 2;
		
		upVec[0] *= focalLength / 2;
		upVec[1] *= focalLength / 2;
		upVec[2] *= focalLength / 2;
		
		
		
		imagePlaneCenterPos = [cameraPos[0] + focalLength * forwardVec[0], cameraPos[1] + focalLength * forwardVec[1], cameraPos[2] + focalLength * forwardVec[2]];
		
		
		
		wilson.gl.uniform3fv(wilson.uniforms["cameraPos"], cameraPos);
		wilson.gl.uniform3fv(wilson.uniforms["imagePlaneCenterPos"], imagePlaneCenterPos);
		
		wilson.gl.uniform3fv(wilson.uniforms["forwardVec"], forwardVec);
		wilson.gl.uniform3fv(wilson.uniforms["rightVec"], rightVec);
		wilson.gl.uniform3fv(wilson.uniforms["upVec"], upVec);
		
		wilson.gl.uniform1f(wilson.uniforms["focalLength"], focalLength);
	}
	
	
	
	function dotProduct(vec1, vec2)
	{
		return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2];
	}
	
	
	
	function crossProduct(vec1, vec2)
	{
		return [vec1[1] * vec2[2] - vec1[2] * vec2[1], vec1[2] * vec2[0] - vec1[0] * vec2[2], vec1[0] * vec2[1] - vec1[1] * vec2[0]];
	}
	
	
	
	function matMul(mat1, mat2)
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
	
	
	
	function normalize(vec)
	{
		let magnitude = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
		
		return [vec[0] / magnitude, vec[1] / magnitude, vec[2] / magnitude];
	}
	
	
	
	function distanceEstimator(x, y, z)
	{
		let mutableZ = [x, y, z];
		
		let r = 0.0;
		let dr = 1.0;
		
		for (let iteration = 0; iteration < maxIterations * 4; iteration++)
		{
			r = Math.sqrt(dotProduct(mutableZ, mutableZ));
			
			if (r > 16.0)
			{
				break;
			}
			
			let theta = Math.acos(mutableZ[2] / r);
			
			let phi = Math.atan2(mutableZ[1], mutableZ[0]);
			
			dr = Math.pow(r, power - 1.0) * power * dr + 1.0;
			
			theta = theta * power;
			
			phi = phi * power;
			
			let scaledR = Math.pow(r, power);
			
			mutableZ[0] = scaledR * Math.sin(theta) * Math.cos(phi) + ((1 - juliaProportion) * x + juliaProportion * c[0]);
			mutableZ[1] = scaledR * Math.sin(theta) * Math.sin(phi) + ((1 - juliaProportion) * y + juliaProportion * c[1]);
			mutableZ[2] = scaledR * Math.cos(theta) + ((1 - juliaProportion) * z + juliaProportion * c[2]);
			
			
			
			//Apply the rotation matrix.
			
			let tempX = mutableZ[0];
			let tempY = mutableZ[1];
			let tempZ = mutableZ[2];
			
			let matZ = [[Math.cos(rotationAngleZ), -Math.sin(rotationAngleZ), 0], [Math.sin(rotationAngleZ), Math.cos(rotationAngleZ), 0], [0, 0, 1]];
			let matY = [[Math.cos(rotationAngleY), 0, -Math.sin(rotationAngleY)], [0, 1, 0],[Math.sin(rotationAngleY), 0, Math.cos(rotationAngleY)]];
			let matX = [[1, 0, 0], [0, Math.cos(rotationAngleX), -Math.sin(rotationAngleX)], [0, Math.sin(rotationAngleX), Math.cos(rotationAngleX)]];
			
			let matTotal = matMul(matMul(matZ, matY), matX);
			
			mutableZ[0] = matTotal[0][0] * tempX + matTotal[0][1] * tempY + matTotal[0][2] * tempZ;
			mutableZ[1] = matTotal[1][0] * tempX + matTotal[1][1] * tempY + matTotal[1][2] * tempZ;
			mutableZ[2] = matTotal[2][0] * tempX + matTotal[2][1] * tempY + matTotal[2][2] * tempZ;
		}
		
		
		
		return 0.5 * Math.log(r) * r / dr;
	}
	
	
	
	function onGrabCanvas(x, y, event)
	{
		nextThetaVelocity = 0;
		nextPhiVelocity = 0;
		
		thetaVelocity = 0;
		phiVelocity = 0;
		
		
		
		if (event.type === "touchstart")
		{
			if (event.touches.length === 2)
			{
				movingForwardTouch = true;
				movingBackwardTouch = false;
				
				moveVelocity[0] = 0;
				moveVelocity[1] = 0;
				moveVelocity[2] = 0;
				
				nextMoveVelocity[0] = 0;
				nextMoveVelocity[1] = 0;
				nextMoveVelocity[2] = 0;
				
				window.requestAnimationFrame(drawFrame);
			}
			
			else if (event.touches.length === 3)
			{
				movingForwardTouch = false;
				movingBackwardTouch = true;
				
				moveVelocity[0] = 0;
				moveVelocity[1] = 0;
				moveVelocity[2] = 0;
				
				nextMoveVelocity[0] = 0;
				nextMoveVelocity[1] = 0;
				nextMoveVelocity[2] = 0;
				
				window.requestAnimationFrame(drawFrame);
			}
			
			else
			{
				movingForwardTouch = false;
				movingBackwardTouch = false;
			}
			
			wasMovingTouch = false;
		}
	}
	
	
	
	function onDragCanvas(x, y, xDelta, yDelta, event)
	{
		if (event.type === "touchmove" && wasMovingTouch)
		{
			wasMovingTouch = false;
			return;
		}
		
		
		
		theta += xDelta * Math.PI / 2;
		
		nextThetaVelocity = xDelta * Math.PI / 2;
		
		if (theta >= 2 * Math.PI)
		{
			theta -= 2 * Math.PI;
		}
		
		else if (theta < 0)
		{
			theta += 2 * Math.PI;
		}
		
		
		
		phi += yDelta * Math.PI / 2;
		
		nextPhiVelocity = yDelta * Math.PI / 2;
		
		if (phi > Math.PI - .01)
		{
			phi = Math.PI - .01;
		}
		
		else if (phi < .01)
		{
			phi = .01;
		}
		
		
		
		calculateVectors();
		
		window.requestAnimationFrame(drawFrame);
	}
	
	
	
	function onReleaseCanvas(x, y, event)
	{
		if (event.type === "touchend")
		{
			movingForwardTouch = false;
			movingBackwardTouch = false;
			
			wasMovingTouch = true;
			
			if (moveVelocity[0] === 0 && moveVelocity[1] === 0 && moveVelocity[2] === 0)
			{
				moveVelocity[0] = nextMoveVelocity[0];
				moveVelocity[1] = nextMoveVelocity[1];
				moveVelocity[2] = nextMoveVelocity[2];
				
				nextMoveVelocity[0] = 0;
				nextMoveVelocity[1] = 0;
				nextMoveVelocity[2] = 0;
			}
		}
		
		if (((event.type === "touchend" && event.touches,length === 0) || event.type === "mouseup") && (Math.sqrt(nextThetaVelocity * nextThetaVelocity + nextPhiVelocity * nextPhiVelocity) >= panVelocityStartThreshhold))
		{
			thetaVelocity = nextThetaVelocity;
			phiVelocity = nextPhiVelocity;
		}
	}
	
	
	
	function handleKeydownEvent(e)
	{
		if (document.activeElement.tagName === "INPUT" || !(e.keyCode === 87 || e.keyCode === 83 || e.keyCode === 68 || e.keyCode === 65))
		{
			return;
		}
		
		
		
		nextMoveVelocity = [0, 0, 0];
		moveVelocity = [0, 0, 0];
		
		
		
		//W
		if (e.keyCode === 87)
		{
			movingForwardKeyboard = true;
		}
		
		//S
		else if (e.keyCode === 83)
		{
			movingBackwardKeyboard = true;
		}
		
		//D
		if (e.keyCode === 68)
		{
			movingRightKeyboard = true;
		}
		
		//A
		else if (e.keyCode === 65)
		{
			movingLeftKeyboard = true;
		}
		
		
		
		window.requestAnimationFrame(drawFrame);
	}
	
	
	
	function handleKeyupEvent(e)
	{
		if (document.activeElement.tagName === "INPUT" || !(e.keyCode === 87 || e.keyCode === 83 || e.keyCode === 68 || e.keyCode === 65))
		{
			return;
		}
		
		
		
		if (moveVelocity[0] === 0 && moveVelocity[1] === 0 && moveVelocity[2] === 0)
		{
			moveVelocity[0] = nextMoveVelocity[0];
			moveVelocity[1] = nextMoveVelocity[1];
			moveVelocity[2] = nextMoveVelocity[2];
			
			nextMoveVelocity[0] = 0;
			nextMoveVelocity[1] = 0;
			nextMoveVelocity[2] = 0;
		}
		
		
		
		//W
		if (e.keyCode === 87)
		{
			movingForwardKeyboard = false;
		}
		
		//S
		else if (e.keyCode === 83)
		{
			movingBackwardKeyboard = false;
		}
		
		//D
		if (e.keyCode === 68)
		{
			movingRightKeyboard = false;
		}
		
		//A
		else if (e.keyCode === 65)
		{
			movingLeftKeyboard = false;
		}
	}
	
	
	
	document.documentElement.addEventListener("keydown", handleKeydownEvent);
	Page.temporaryHandlers["keydown"].push(handleKeydownEvent);
	
	document.documentElement.addEventListener("keyup", handleKeyupEvent);
	Page.temporaryHandlers["keydown"].push(handleKeyupEvent);
	
	
	
	function updateCameraParameters()
	{
		movingSpeed = Math.min(Math.max(.000001, distanceToScene / 20), .02);
		
		
		
		if (movingPos)
		{
			let oldCameraPos = [...cameraPos];
			
			
			
			if (movingForwardKeyboard || movingForwardTouch)
			{
				cameraPos[0] += movingSpeed * forwardVec[0];
				cameraPos[1] += movingSpeed * forwardVec[1];
				cameraPos[2] += movingSpeed * forwardVec[2];
			}
			
			else if (movingBackwardKeyboard || movingBackwardTouch)
			{
				cameraPos[0] -= movingSpeed * forwardVec[0];
				cameraPos[1] -= movingSpeed * forwardVec[1];
				cameraPos[2] -= movingSpeed * forwardVec[2];
			}
			
			
			
			if (movingRightKeyboard)
			{
				cameraPos[0] += movingSpeed * rightVec[0] / focalLength;
				cameraPos[1] += movingSpeed * rightVec[1] / focalLength;
				cameraPos[2] += movingSpeed * rightVec[2] / focalLength;
			}
			
			else if (movingLeftKeyboard)
			{
				cameraPos[0] -= movingSpeed * rightVec[0] / focalLength;
				cameraPos[1] -= movingSpeed * rightVec[1] / focalLength;
				cameraPos[2] -= movingSpeed * rightVec[2] / focalLength;
			}	
			
			
			
			nextMoveVelocity[0] = cameraPos[0] - oldCameraPos[0];
			nextMoveVelocity[1] = cameraPos[1] - oldCameraPos[1];
			nextMoveVelocity[2] = cameraPos[2] - oldCameraPos[2];
		}
		
		
		
		else
		{
			let oldC = [...c];
			
			if (movingForwardKeyboard || movingForwardTouch)
			{
				c[0] += .5 * movingSpeed * forwardVec[0];
				c[1] += .5 * movingSpeed * forwardVec[1];
				c[2] += .5 * movingSpeed * forwardVec[2];
			}
			
			else if (movingBackwardKeyboard || movingBackwardTouch)
			{
				c[0] -= .5 * movingSpeed * forwardVec[0];
				c[1] -= .5 * movingSpeed * forwardVec[1];
				c[2] -= .5 * movingSpeed * forwardVec[2];
			}
			
			
			
			if (movingRightKeyboard)
			{
				c[0] += .5 * movingSpeed * rightVec[0] / focalLength;
				c[1] += .5 * movingSpeed * rightVec[1] / focalLength;
				c[2] += .5 * movingSpeed * rightVec[2] / focalLength;
			}
			
			else if (movingLeftKeyboard)
			{
				c[0] -= .5 * movingSpeed * rightVec[0] / focalLength;
				c[1] -= .5 * movingSpeed * rightVec[1] / focalLength;
				c[2] -= .5 * movingSpeed * rightVec[2] / focalLength;
			}
			
			
			
			cXInputElement.value = Math.round((c[0]) * 1000000) / 1000000;
			cYInputElement.value = Math.round((c[1]) * 1000000) / 1000000;
			cZInputElement.value = Math.round((c[2]) * 1000000) / 1000000;
			
			
			
			wilson.gl.uniform3fv(wilson.uniforms["c"], c);
			
			
			
			nextMoveVelocity[0] = c[0] - oldC[0];
			nextMoveVelocity[1] = c[1] - oldC[1];
			nextMoveVelocity[2] = c[2] - oldC[2];
		}
		
		
		
		calculateVectors();
	}
	
	
	
	function changeResolution()
	{
		imageSize = Math.max(100, parseInt(resolutionInputElement.value || 500));
		
		
		
		if (wilson.fullscreen.currentlyFullscreen)
		{
			if (Page.Layout.aspectRatio >= 1)
			{
				imageWidth = imageSize;
				imageHeight = Math.floor(imageSize / Page.Layout.aspectRatio);
			}
			
			else
			{
				imageWidth = Math.floor(imageSize * Page.Layout.aspectRatio);
				imageHeight = imageSize;
			}
		}
		
		else
		{
			imageWidth = imageSize;
			imageHeight = imageSize;
		}
		
		
		
		wilson.changeCanvasSize(imageWidth, imageHeight);
		
		
		
		if (imageWidth >= imageHeight)
		{
			wilson.gl.uniform1f(wilson.uniforms["aspectRatioX"], imageWidth / imageHeight);
			wilson.gl.uniform1f(wilson.uniforms["aspectRatioY"], 1);
		}
		
		else
		{
			wilson.gl.uniform1f(wilson.uniforms["aspectRatioX"], 1);
			wilson.gl.uniform1f(wilson.uniforms["aspectRatioY"], imageWidth / imageHeight);
		}
		
		wilson.gl.uniform1i(wilson.uniforms["imageSize"], imageSize);
		
		
		
		window.requestAnimationFrame(drawFrame);
	}
	
	
	
	function randomizeRotation(animateChange = true)
	{
		if (currentlyAnimatingParameters)
		{
			return;
		}
		
		
		
		rotationAngleXOld = rotationAngleX;
		rotationAngleYOld = rotationAngleY;
		rotationAngleZOld = rotationAngleZ;
		
		rotationAngleXDelta = Math.random()*2 - 1 - rotationAngleXOld;
		rotationAngleYDelta = Math.random()*2 - 1 - rotationAngleYOld;
		rotationAngleZDelta = Math.random()*2 - 1 - rotationAngleZOld;
		
		rotationAngleXInputElement.value = Math.round((rotationAngleXOld + rotationAngleXDelta) * 1000000) / 1000000;
		rotationAngleYInputElement.value = Math.round((rotationAngleYOld + rotationAngleYDelta) * 1000000) / 1000000;
		rotationAngleZInputElement.value = Math.round((rotationAngleZOld + rotationAngleZDelta) * 1000000) / 1000000;
		
		
		
		cOld[0] = c[0];
		cOld[1] = c[1];
		cOld[2] = c[2];
		
		cDelta[0] = 0;
		cDelta[1] = 0;
		cDelta[2] = 0;
		
		
		
		juliaProportionOld = juliaProportion;
		juliaProportionDelta = 0;
		
		powerOld = power;
		powerDelta = 0;
		
		
		
		if (animateChange)
		{
			animateParameterChange();
		}
		
		else
		{
			rotationAngleX = rotationAngleXOld + rotationAngleXDelta;
			rotationAngleY = rotationAngleYOld + rotationAngleYDelta;
			rotationAngleZ = rotationAngleZOld + rotationAngleZDelta;
		}
	}
	
	
	
	function randomizeC(animateChange = true)
	{
		if (currentlyAnimatingParameters)
		{
			return;
		}
		
		
		
		rotationAngleXOld = rotationAngleX;
		rotationAngleYOld = rotationAngleY;
		rotationAngleZOld = rotationAngleZ;
		
		rotationAngleXDelta = 0;
		rotationAngleYDelta = 0;
		rotationAngleZDelta = 0;
		
		
		
		cOld[0] = c[0];
		cOld[1] = c[1];
		cOld[2] = c[2];
		
		cDelta[0] = Math.random()*1.5 - .75 - cOld[0];
		cDelta[1] = Math.random()*1.5 - .75 - cOld[1];
		cDelta[2] = Math.random()*1.5 - .75 - cOld[2];
		
		cXInputElement.value = Math.round((cOld[0] + cDelta[0]) * 1000000) / 1000000;
		cYInputElement.value = Math.round((cOld[1] + cDelta[1]) * 1000000) / 1000000;
		cZInputElement.value = Math.round((cOld[2] + cDelta[2]) * 1000000) / 1000000;
		
		
		
		juliaProportionOld = juliaProportion;
		juliaProportionDelta = 0;
		
		powerOld = power;
		powerDelta = 0;
		
		
		
		if (animateChange)
		{
			animateParameterChange();
		}
		
		else
		{
			c[0] = cOld[0] + cDelta[0];
			c[1] = cOld[1] + cDelta[1];
			c[2] = cOld[2] + cDelta[2];
		}
	}
	
	
	
	function updateParameters()
	{
		rotationAngleXOld = rotationAngleX;
		rotationAngleYOld = rotationAngleY;
		rotationAngleZOld = rotationAngleZ;
		
		rotationAngleXDelta = (parseFloat(rotationAngleXInputElement.value || 0) || 0) - rotationAngleXOld;
		rotationAngleYDelta = (parseFloat(rotationAngleYInputElement.value || 0) || 0) - rotationAngleYOld;
		rotationAngleZDelta = (parseFloat(rotationAngleZInputElement.value || 0) || 0) - rotationAngleZOld;
		
		
		
		cOld[0] = c[0];
		cOld[1] = c[1];
		cOld[2] = c[2];
		
		cDelta[0] = (parseFloat(cXInputElement.value || 0) || 0) - cOld[0];
		cDelta[1] = (parseFloat(cYInputElement.value || 0) || 0) - cOld[1];
		cDelta[2] = (parseFloat(cZInputElement.value || 0) || 0) - cOld[2];
		
		
		
		powerOld = power;
		powerDelta = (parseFloat(powerInputElement.value || 0) || 0) - powerOld;
		
		
		
		juliaProportionOld = juliaProportion;
		juliaProportionDelta = 0;
		
		
		
		animateParameterChange();
	}
	
	
	
	function animateParameterChange()
	{
		if (!currentlyAnimatingParameters)
		{
			currentlyAnimatingParameters = true;
			
			parameterAnimationFrame = 0;
			
			window.requestAnimationFrame(drawFrame);
		}
	}
	
	
	
	function animateParameterChangeStep()
	{
		let t = .5 * Math.sin(Math.PI * parameterAnimationFrame / 120 - Math.PI / 2) + .5;
		
		rotationAngleX = rotationAngleXOld + rotationAngleXDelta * t;
		rotationAngleY = rotationAngleYOld + rotationAngleYDelta * t;
		rotationAngleZ = rotationAngleZOld + rotationAngleZDelta * t;
		
		
		
		let matZ = [[Math.cos(rotationAngleZ), -Math.sin(rotationAngleZ), 0], [Math.sin(rotationAngleZ), Math.cos(rotationAngleZ), 0], [0, 0, 1]];
		let matY = [[Math.cos(rotationAngleY), 0, -Math.sin(rotationAngleY)], [0, 1, 0],[Math.sin(rotationAngleY), 0, Math.cos(rotationAngleY)]];
		let matX = [[1, 0, 0], [0, Math.cos(rotationAngleX), -Math.sin(rotationAngleX)], [0, Math.sin(rotationAngleX), Math.cos(rotationAngleX)]];
		
		let matTotal = matMul(matMul(matZ, matY), matX);
		
		wilson.gl.uniformMatrix3fv(wilson.uniforms["rotationMatrix"], false, [matTotal[0][0], matTotal[1][0], matTotal[2][0], matTotal[0][1], matTotal[1][1], matTotal[2][1], matTotal[0][2], matTotal[1][2], matTotal[2][2]]);
		
		
		
		c[0] = cOld[0] + cDelta[0] * t;
		c[1] = cOld[1] + cDelta[1] * t;
		c[2] = cOld[2] + cDelta[2] * t;
		
		wilson.gl.uniform3fv(wilson.uniforms["c"], c);
		
		
		
		power = powerOld + powerDelta * t;
		
		wilson.gl.uniform1f(wilson.uniforms["power"], power);
		
		
		
		juliaProportion = juliaProportionOld + juliaProportionDelta * t;
		
		wilson.gl.uniform1f(wilson.uniforms["juliaProportion"], juliaProportion);
		
		
		
		parameterAnimationFrame++;
		
		if (parameterAnimationFrame === 121)
		{
			currentlyAnimatingParameters = false;
		}
	}
	
	
	
	function switchBulb()
	{
		if (currentlyAnimatingParameters)
		{
			return;
		}
		
		
		
		Page.Animate.changeOpacity(switchBulbButtonElement, 0, Site.opacityAnimationTime);
		
		setTimeout(() =>
		{
			if (juliaProportionOld === 0)
			{
				switchBulbButtonElement.textContent = "Switch to Mandelbulb";
			}
			
			else
			{
				switchBulbButtonElement.textContent = "Switch to Juliabulb";
			}
			
			Page.Load.TextButtons.equalize();
			
			Page.Animate.changeOpacity(switchBulbButtonElement, 1, Site.opacityAnimationTime);
		}, Site.opacityAnimationTime);
		
		
		
		if (juliaProportion === 0)
		{
			wilson.gl.uniform3fv(wilson.uniforms["c"], c);
			
			if (!movingPos)
			{
				wilson.gl.uniform1i(wilson.uniforms["drawSphere"], 1);
			}
			
			setTimeout(() =>
			{
				Page.Animate.changeOpacity(switchMovementButtonElement, 1, Site.opacityAnimationTime);
			}, Site.opacityAnimationTime);
		}
		
		else
		{
			movingPos = true;
			
			wilson.gl.uniform1i(wilson.uniforms["drawSphere"], 0);
			
			Page.Animate.changeOpacity(switchMovementButtonElement, 0, Site.opacityAnimationTime);
		}
		
		
		
		juliaProportionOld = juliaProportion;
		juliaProportionDelta = 1 - 2*juliaProportionOld;
		
		powerOld = power;
		powerDelta = 0;
		
		rotationAngleXOld = rotationAngleX;
		rotationAngleYOld = rotationAngleY;
		rotationAngleZOld = rotationAngleZ;
		
		rotationAngleXDelta = 0;
		rotationAngleYDelta = 0;
		rotationAngleZDelta = 0;
		
		cOld[0] = c[0];
		cOld[1] = c[1];
		cOld[2] = c[2];
		
		cDelta[0] = 0;
		cDelta[1] = 0;
		cDelta[2] = 0;
		
		animateParameterChange();
	}
	
	
	
	function switchMovement()
	{
		movingPos = !movingPos;
		
		
		
		Page.Animate.changeOpacity(switchMovementButtonElement, 0, Site.opacityAnimationTime);
		
		setTimeout(() =>
		{
			if (movingPos)
			{
				switchMovementButtonElement.textContent = "Change Juliabulb";
			}
			
			else
			{
				switchMovementButtonElement.textContent = "Move Camera";
			}
			
			Page.Load.TextButtons.equalize();
			
			Page.Animate.changeOpacity(switchMovementButtonElement, 1, Site.opacityAnimationTime);
		}, Site.opacityAnimationTime);
		
		
		
		if (movingPos)
		{
			wilson.gl.uniform1i(wilson.uniforms["drawSphere"], 0);
		}
		
		else
		{
			wilson.gl.uniform1i(wilson.uniforms["drawSphere"], 1);
		}
	}
	}()