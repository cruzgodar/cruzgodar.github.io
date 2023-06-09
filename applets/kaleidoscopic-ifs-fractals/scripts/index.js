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
	
	let wilson = new Wilson(Page.element.querySelector("#output-canvas"), options);
	
	wilson.render.initUniforms(["aspectRatioX", "aspectRatioY", "imageSize", "cameraPos", "imagePlaneCenterPos", "forwardVec", "rightVec", "upVec", "focalLength", "lightPos", "scaleCenter", "n1", "n2", "n3", "n4", "numNs", "rotationMatrix1", "rotationMatrix2"]);
	
	
	
	
	
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
	
	
	
	let theta = 3.2954;
	let phi = 1.9657;
	
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
	
	let numSierpinskiIterations = 24;
	
	const scale = 2.0;
	
	let imagePlaneCenterPos = [];
	
	let forwardVec = [];
	let rightVec = [];
	let upVec = [];
	
	let cameraPos = [2.1089, .41345, .95325];
	
	let polyhedronIndex = 0;
	
	let focalLength = 2;
	
	let lightPos = [[0, 0, 5], [5, 5, 5], [0, 0, 5]];
	
	let n1 = [[-.577350, 0, .816496],  [1, 0, 0], [.707107, 0, .707107]];
	let n2 = [[.288675, -.5, .816496], [0, 1, 0], [0, .707107, .707107]];
	let n3 = [[.288675, .5, .816496],  [0, 0, 1], [-.707107, 0, .707107]];
	let n4 = [[],                      [],        [0, -.707107, .707107]];
	
	let numNs = [3, 3, 4];
	
	let scaleCenter = [[0, 0, 1], [.577350, .577350, .577350], [0, 0, 1]];
	
	let rotationAngleX1 = 0;
	let rotationAngleY1 = 0;
	let rotationAngleZ1 = 0;
	let rotationAngleX2 = 0;
	let rotationAngleY2 = 0;
	let rotationAngleZ2 = 0;
	
	let rotationAngleX1Old = 0;
	let rotationAngleY1Old = 0;
	let rotationAngleZ1Old = 0;
	let rotationAngleX2Old = 0;
	let rotationAngleY2Old = 0;
	let rotationAngleZ2Old = 0;
	
	let rotationAngleX1Delta = 0;
	let rotationAngleY1Delta = 0;
	let rotationAngleZ1Delta = 0;
	let rotationAngleX2Delta = 0;
	let rotationAngleY2Delta = 0;
	let rotationAngleZ2Delta = 0;
	
	let parameterAnimationFrame = 0;
	
	
	
	let resolutionInputElement = Page.element.querySelector("#resolution-input");
	
	resolutionInputElement.addEventListener("input", changeResolution);
	
	
	
	let downloadButtonElement = Page.element.querySelector("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		wilson.downloadFrame("a-kaleidoscopic-ifs-fractal.png");
	});
	
	
	
	let polyhedronSelectorDropdownElement = Page.element.querySelector("#polyhedron-selector-dropdown");
	
	polyhedronSelectorDropdownElement.addEventListener("input", () =>
	{
		if (polyhedronSelectorDropdownElement.value === "tetrahedron")
		{
			changePolyhedron(0);
		}
		
		else if (polyhedronSelectorDropdownElement.value === "cube")
		{
			changePolyhedron(1);
		}
		
		else
		{
			changePolyhedron(2);
		}
	});
	
	
	
	let rotationAngleX1InputElement = Page.element.querySelector("#rotation-angle-x-1-input");
	let rotationAngleY1InputElement = Page.element.querySelector("#rotation-angle-y-1-input");
	let rotationAngleZ1InputElement = Page.element.querySelector("#rotation-angle-z-1-input");
	
	let rotationAngleX2InputElement = Page.element.querySelector("#rotation-angle-x-2-input");
	let rotationAngleY2InputElement = Page.element.querySelector("#rotation-angle-y-2-input");
	let rotationAngleZ2InputElement = Page.element.querySelector("#rotation-angle-z-2-input");
	
	let elements = [rotationAngleX1InputElement, rotationAngleY1InputElement, rotationAngleZ1InputElement, rotationAngleX2InputElement, rotationAngleY2InputElement, rotationAngleZ2InputElement];
	
	for (let i = 0; i < 6; i++)
	{
		elements[i].addEventListener("input", updateParameters);
	}
	
	
	
	let randomizeParametersButtonElement = Page.element.querySelector("#randomize-parameters-button");
	
	randomizeParametersButtonElement.addEventListener("click", randomizeParameters);
	
	
	
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
	wilson.gl.uniform3fv(wilson.uniforms["lightPos"], lightPos[polyhedronIndex]);
	wilson.gl.uniform3fv(wilson.uniforms["scaleCenter"], scaleCenter[polyhedronIndex]);
	
	wilson.gl.uniform3fv(wilson.uniforms["forwardVec"], forwardVec);
	wilson.gl.uniform3fv(wilson.uniforms["rightVec"], rightVec);
	wilson.gl.uniform3fv(wilson.uniforms["upVec"], upVec);
	
	wilson.gl.uniform1f(wilson.uniforms["focalLength"], focalLength);
	
	wilson.gl.uniform3fv(wilson.uniforms["n1"], n1[polyhedronIndex]);
	wilson.gl.uniform3fv(wilson.uniforms["n2"], n2[polyhedronIndex]);
	wilson.gl.uniform3fv(wilson.uniforms["n3"], n3[polyhedronIndex]);
	wilson.gl.uniform3fv(wilson.uniforms["n4"], n4[polyhedronIndex]);
	
	wilson.gl.uniform1i(wilson.uniforms["numNs"], numNs[polyhedronIndex]);
	
	wilson.gl.uniformMatrix3fv(wilson.uniforms["rotationMatrix1"], false, [1, 0, 0, 0, 1, 0, 0, 0, 1]);
	wilson.gl.uniformMatrix3fv(wilson.uniforms["rotationMatrix2"], false, [1, 0, 0, 0, 1, 0, 0, 0, 1]);
	
	
	
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
			cameraPos[0] += moveVelocity[0];
			cameraPos[1] += moveVelocity[1];
			cameraPos[2] += moveVelocity[2];
			
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
		//We'll find the closest vertex, scale everything by a factor of 2 centered on that vertex (so that we don't need to recalculate the vertices), and repeat.
		for (let iteration = 0; iteration < numSierpinskiIterations; iteration++)
		{
			//Fold space over on itself so that we can reference only the top vertex.
			let t1 = dotProduct([x, y, z], n1[polyhedronIndex]);
			
			if (t1 < 0)
			{
				x -= 2 * t1 * n1[polyhedronIndex][0];
				y -= 2 * t1 * n1[polyhedronIndex][1];
				z -= 2 * t1 * n1[polyhedronIndex][2];
			}
			
			let t2 = dotProduct([x, y, z], n2[polyhedronIndex]);
			
			if (t2 < 0)
			{
				x -= 2 * t2 * n2[polyhedronIndex][0];
				y -= 2 * t2 * n2[polyhedronIndex][1];
				z -= 2 * t2 * n2[polyhedronIndex][2];
			}
			
			let t3 = dotProduct([x, y, z], n3[polyhedronIndex]);
			
			if (t3 < 0)
			{
				x -= 2 * t3 * n3[polyhedronIndex][0];
				y -= 2 * t3 * n3[polyhedronIndex][1];
				z -= 2 * t3 * n3[polyhedronIndex][2];
			}
			
			if (numNs[polyhedronIndex] >= 4)
			{
				let t4 = dotProduct([x, y, z], n4[polyhedronIndex]);
				
				if (t4 < 0)
				{
					x -= 2 * t4 * n4[polyhedronIndex][0];
					y -= 2 * t4 * n4[polyhedronIndex][1];
					z -= 2 * t4 * n4[polyhedronIndex][2];
				}
			}
			
			
			
			//Apply the first rotation matrix.
			
			let tempX = x;
			let tempY = y;
			let tempZ = z;
			
			let matZ = [[Math.cos(rotationAngleZ1), -Math.sin(rotationAngleZ1), 0], [Math.sin(rotationAngleZ1), Math.cos(rotationAngleZ1), 0], [0, 0, 1]];
			let matY = [[Math.cos(rotationAngleY1), 0, -Math.sin(rotationAngleY1)], [0, 1, 0],[Math.sin(rotationAngleY1), 0, Math.cos(rotationAngleY1)]];
			let matX = [[1, 0, 0], [0, Math.cos(rotationAngleX1), -Math.sin(rotationAngleX1)], [0, Math.sin(rotationAngleX1), Math.cos(rotationAngleX1)]];
			
			let matTotal = matMul(matMul(matZ, matY), matX);
			
			x = matTotal[0][0] * tempX + matTotal[0][1] * tempY + matTotal[0][2] * tempZ;
			y = matTotal[1][0] * tempX + matTotal[1][1] * tempY + matTotal[1][2] * tempZ;
			z = matTotal[2][0] * tempX + matTotal[2][1] * tempY + matTotal[2][2] * tempZ;
			
			
			
			//This one takes a fair bit of thinking to get. What's happening here is that we're stretching from a vertex, but since we never scale the vertices, the four new ones are the four closest to the vertex we scaled from. Now (x, y, z) will get farther and farther away from the origin, but that makes sense -- we're really just zooming in on the tetrahedron.
			x = scale * x - (scale - 1) * scaleCenter[polyhedronIndex][0];
			y = scale * y - (scale - 1) * scaleCenter[polyhedronIndex][1];
			z = scale * z - (scale - 1) * scaleCenter[polyhedronIndex][2];
			
			
			
			//Apply the second rotation matrix.
			
			tempX = x;
			tempY = y;
			tempZ = z;
			
			matZ = [[Math.cos(rotationAngleZ2), -Math.sin(rotationAngleZ2), 0], [Math.sin(rotationAngleZ2), Math.cos(rotationAngleZ2), 0], [0, 0, 1]];
			matY = [[Math.cos(rotationAngleY2), 0, -Math.sin(rotationAngleY2)], [0, 1, 0],[Math.sin(rotationAngleY2), 0, Math.cos(rotationAngleY2)]];
			matX = [[1, 0, 0], [0, Math.cos(rotationAngleX2), -Math.sin(rotationAngleX2)], [0, Math.sin(rotationAngleX2), Math.cos(rotationAngleX2)]];
			
			matTotal = matMul(matMul(matZ, matY), matX);
			
			x = matTotal[0][0] * tempX + matTotal[0][1] * tempY + matTotal[0][2] * tempZ;
			y = matTotal[1][0] * tempX + matTotal[1][1] * tempY + matTotal[1][2] * tempZ;
			z = matTotal[2][0] * tempX + matTotal[2][1] * tempY + matTotal[2][2] * tempZ;
		}
		
		
		
		//So at this point we've scaled up by 2x a total of numIterations times. The final distance is therefore:
		return Math.sqrt(x*x + y*y + z*z) * Math.pow(scale, -numSierpinskiIterations);
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
	
	
	
	function randomizeParameters(animateChange = true)
	{
		if (currentlyAnimatingParameters)
		{
			return;
		}
		
		
		
		rotationAngleX1Old = rotationAngleX1;
		rotationAngleY1Old = rotationAngleY1;
		rotationAngleZ1Old = rotationAngleZ1;
		rotationAngleX2Old = rotationAngleX2;
		rotationAngleY2Old = rotationAngleY2;
		rotationAngleZ2Old = rotationAngleZ2;
		
		rotationAngleX1Delta = Math.random()*.375 - .1875 - rotationAngleX1Old;
		rotationAngleY1Delta = Math.random()*.375 - .1875 - rotationAngleY1Old;
		rotationAngleZ1Delta = Math.random()*.75 - .375 - rotationAngleZ1Old;
		rotationAngleX2Delta = Math.random()*.375 - .1875 - rotationAngleX2Old;
		rotationAngleY2Delta = Math.random()*.375 - .1875 - rotationAngleY2Old;
		rotationAngleZ2Delta = Math.random()*.75 - .375 - rotationAngleZ2Old;
		
		rotationAngleX1InputElement.value = Math.round((rotationAngleX1Old + rotationAngleX1Delta) * 1000000) / 1000000;
		rotationAngleY1InputElement.value = Math.round((rotationAngleY1Old + rotationAngleY1Delta) * 1000000) / 1000000;
		rotationAngleZ1InputElement.value = Math.round((rotationAngleZ1Old + rotationAngleZ1Delta) * 1000000) / 1000000;
		rotationAngleX2InputElement.value = Math.round((rotationAngleX2Old + rotationAngleX2Delta) * 1000000) / 1000000;
		rotationAngleY2InputElement.value = Math.round((rotationAngleY2Old + rotationAngleY2Delta) * 1000000) / 1000000;
		rotationAngleZ2InputElement.value = Math.round((rotationAngleZ2Old + rotationAngleZ2Delta) * 1000000) / 1000000;
		
		
		
		if (animateChange)
		{
			animateParameterChange();
		}
		
		else
		{
			rotationAngleX1 = rotationAngleX1Old + rotationAngleX1Delta;
			rotationAngleY1 = rotationAngleY1Old + rotationAngleY1Delta;
			rotationAngleZ1 = rotationAngleZ1Old + rotationAngleZ1Delta;
			rotationAngleX2 = rotationAngleX2Old + rotationAngleX2Delta;
			rotationAngleY2 = rotationAngleY2Old + rotationAngleY2Delta;
			rotationAngleZ2 = rotationAngleZ2Old + rotationAngleZ2Delta;
		}
	}
	
	
	
	function updateParameters()
	{
		rotationAngleX1Old = rotationAngleX1;
		rotationAngleY1Old = rotationAngleY1;
		rotationAngleZ1Old = rotationAngleZ1;
		rotationAngleX2Old = rotationAngleX2;
		rotationAngleY2Old = rotationAngleY2;
		rotationAngleZ2Old = rotationAngleZ2;
		
		rotationAngleX1Delta = (parseFloat(rotationAngleX1InputElement.value || 0) || 0) - rotationAngleX1Old;
		rotationAngleY1Delta = (parseFloat(rotationAngleY1InputElement.value || 0) || 0) - rotationAngleY1Old;
		rotationAngleZ1Delta = (parseFloat(rotationAngleZ1InputElement.value || 0) || 0) - rotationAngleZ1Old;
		rotationAngleX2Delta = (parseFloat(rotationAngleX2InputElement.value || 0) || 0) - rotationAngleX2Old;
		rotationAngleY2Delta = (parseFloat(rotationAngleY2InputElement.value || 0) || 0) - rotationAngleY2Old;
		rotationAngleZ2Delta = (parseFloat(rotationAngleZ2InputElement.value || 0) || 0) - rotationAngleZ2Old;
		
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
		
		rotationAngleX1 = rotationAngleX1Old + rotationAngleX1Delta * t;
		rotationAngleY1 = rotationAngleY1Old + rotationAngleY1Delta * t;
		rotationAngleZ1 = rotationAngleZ1Old + rotationAngleZ1Delta * t;
		rotationAngleX2 = rotationAngleX2Old + rotationAngleX2Delta * t;
		rotationAngleY2 = rotationAngleY2Old + rotationAngleY2Delta * t;
		rotationAngleZ2 = rotationAngleZ2Old + rotationAngleZ2Delta * t;
		
		
		
		let matZ = [[Math.cos(rotationAngleZ1), -Math.sin(rotationAngleZ1), 0], [Math.sin(rotationAngleZ1), Math.cos(rotationAngleZ1), 0], [0, 0, 1]];
		let matY = [[Math.cos(rotationAngleY1), 0, -Math.sin(rotationAngleY1)], [0, 1, 0],[Math.sin(rotationAngleY1), 0, Math.cos(rotationAngleY1)]];
		let matX = [[1, 0, 0], [0, Math.cos(rotationAngleX1), -Math.sin(rotationAngleX1)], [0, Math.sin(rotationAngleX1), Math.cos(rotationAngleX1)]];
		
		let matTotal = matMul(matMul(matZ, matY), matX);
		
		wilson.gl.uniformMatrix3fv(wilson.uniforms["rotationMatrix1"], false, [matTotal[0][0], matTotal[1][0], matTotal[2][0], matTotal[0][1], matTotal[1][1], matTotal[2][1], matTotal[0][2], matTotal[1][2], matTotal[2][2]]);
		
		
		
		matZ = [[Math.cos(rotationAngleZ2), -Math.sin(rotationAngleZ2), 0], [Math.sin(rotationAngleZ2), Math.cos(rotationAngleZ2), 0], [0, 0, 1]];
		matY = [[Math.cos(rotationAngleY2), 0, -Math.sin(rotationAngleY2)], [0, 1, 0],[Math.sin(rotationAngleY2), 0, Math.cos(rotationAngleY2)]];
		matX = [[1, 0, 0], [0, Math.cos(rotationAngleX2), -Math.sin(rotationAngleX2)], [0, Math.sin(rotationAngleX2), Math.cos(rotationAngleX2)]];
		
		matTotal = matMul(matMul(matZ, matY), matX);
		
		wilson.gl.uniformMatrix3fv(wilson.uniforms["rotationMatrix2"], false, [matTotal[0][0], matTotal[1][0], matTotal[2][0], matTotal[0][1], matTotal[1][1], matTotal[2][1], matTotal[0][2], matTotal[1][2], matTotal[2][2]]);
		
		
		
		parameterAnimationFrame++;
		
		if (parameterAnimationFrame === 121)
		{
			currentlyAnimatingParameters = false;
		}
	}
	
	
	
	function changePolyhedron(newPolyhedronIndex)
	{
		wilson.canvas.classList.add("animated-opacity");
		
		wilson.canvas.style.opacity = 0;
		
		setTimeout(() =>
		{
			polyhedronIndex = newPolyhedronIndex;
			
			
			
			wilson.gl.uniform3fv(wilson.uniforms["lightPos"], lightPos[polyhedronIndex]);
			
			wilson.gl.uniform3fv(wilson.uniforms["scaleCenter"], scaleCenter[polyhedronIndex]);
			
			wilson.gl.uniform3fv(wilson.uniforms["n1"], n1[polyhedronIndex]);
			wilson.gl.uniform3fv(wilson.uniforms["n2"], n2[polyhedronIndex]);
			wilson.gl.uniform3fv(wilson.uniforms["n3"], n3[polyhedronIndex]);
			wilson.gl.uniform3fv(wilson.uniforms["n4"], n4[polyhedronIndex]);
			
			wilson.gl.uniform1i(wilson.uniforms["numNs"], numNs[polyhedronIndex]);
			
			
			
			window.requestAnimationFrame(drawFrame);
			
			wilson.canvas.style.opacity = 1;
			
			setTimeout(() =>
			{
				wilson.canvas.classList.remove("animated-opacity");
			});
		}, Site.opacityAnimationTime);
	}
	}()