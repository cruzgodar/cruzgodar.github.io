import anime from "/scripts/anime.js";
import { Applet, getVectorGlsl } from "/scripts/applets/applet.js";
import { RaymarchApplet } from "/scripts/applets/raymarchApplet.js";
import { addTemporaryListener } from "/scripts/src/main.js";
import { Wilson } from "/scripts/wilson.js";

export class KaleidoscopicIFSFractal extends RaymarchApplet
{
	numSierpinskiIterations = 24;

	scale = 2.0;
	
	startingCameraPos = [
		[0.7752, 1.3176, 0.5478],
		[1.1748, 1.1675, 1.1673],
		[-1.7346, -0.4485, 0.2596]
	];

	startingAngle = [
		[4.1804, 1.8147],
		[3.9036, 2.2196],
		[0.2004, 1.6538]
	];

	cameraPos = [...this.startingCameraPos[2]];
	theta = this.startingAngle[2][0];
	phi = this.startingAngle[2][1];

	tetrahedronAmount = 0;
	cubeAmount = 0;
	octahedronAmount = 1;

	nTetrahedron = [
		[-.577350, 0, .816496],
		[.288675, -.5, .816496],
		[.288675, .5, .816496]
	];
	scaleCenterTetrahedron = [0, 0, 1];
	lightPosTetrahedron = [0, 0, 5];

	nCube = [
		[1, 0, 0],
		[0, 1, 0],
		[0, 0, 1]
	];
	scaleCenterCube = [.577350, .577350, .577350];
	lightPosCube = [5, 5, 5];

	nOctahedron = [
		[.707107, 0, .707107],
		[0, .707107, .707107],
		[-.707107, 0, .707107],
		[0, -.707107, .707107]
	];
	scaleCenterOctahedron = [0, 0, 1];
	lightPosOctahedron = [0, 0, 5];

	rotationAngleX1 = 0;
	rotationAngleY1 = 0;
	rotationAngleZ1 = 0;
	rotationAngleX2 = 0;
	rotationAngleY2 = 0;
	rotationAngleZ2 = 0;



	constructor({ canvas })
	{
		super(canvas);

		const fragShaderSource = /* glsl */`
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatioX;
			uniform float aspectRatioY;
			
			uniform vec3 cameraPos;
			uniform vec3 imagePlaneCenterPos;
			uniform vec3 forwardVec;
			uniform vec3 rightVec;
			uniform vec3 upVec;
			
			uniform float distanceToScene;
			
			const float lightBrightness = 2.0;
			
			uniform int imageSize;
			
			
			
			const float clipDistance = 1000.0;
			const int maxMarches = 32;
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .05;
			const int maxIterations = 24;
			
			
			
			const vec3 color1 = vec3(1.0, 0.0, 0.0);
			const vec3 color2 = vec3(0.0, 1.0, 0.0);
			const vec3 color3 = vec3(0.0, 0.0, 1.0);
			const vec3 color4 = vec3(1.0, 1.0, 0.0);
			
			
			
			const vec3 n1Tetrahedron = ${getVectorGlsl(this.nTetrahedron[0])};
			const vec3 n2Tetrahedron = ${getVectorGlsl(this.nTetrahedron[1])};
			const vec3 n3Tetrahedron = ${getVectorGlsl(this.nTetrahedron[2])};
			const vec3 scaleCenterTetrahedron = ${getVectorGlsl(this.scaleCenterTetrahedron)};
			const vec3 lightPosTetrahedron = ${getVectorGlsl(this.lightPosTetrahedron)};

			const vec3 n1Cube = ${getVectorGlsl(this.nCube[0])};
			const vec3 n2Cube = ${getVectorGlsl(this.nCube[1])};
			const vec3 n3Cube = ${getVectorGlsl(this.nCube[2])};
			const vec3 scaleCenterCube = ${getVectorGlsl(this.scaleCenterCube)};
			const vec3 lightPosCube = ${getVectorGlsl(this.lightPosCube)};

			const vec3 n1Octahedron = ${getVectorGlsl(this.nOctahedron[0])};
			const vec3 n2Octahedron = ${getVectorGlsl(this.nOctahedron[1])};
			const vec3 n3Octahedron = ${getVectorGlsl(this.nOctahedron[2])};
			const vec3 n4Octahedron = ${getVectorGlsl(this.nOctahedron[3])};
			const vec3 scaleCenterOctahedron = ${getVectorGlsl(this.scaleCenterOctahedron)};
			const vec3 lightPosOctahedron = ${getVectorGlsl(this.lightPosOctahedron)};

			uniform float tetrahedronAmount;
			uniform float cubeAmount;
			uniform float octahedronAmount;
			
			uniform float scale;
			
			uniform mat3 rotationMatrix1;
			uniform mat3 rotationMatrix2;
			
			
			
			float distanceEstimatorTetrahedron(vec3 pos)
			{
				vec3 mutablePos = pos;
				
				//We'll find the closest vertex, scale everything by a factor of 2 centered on that vertex (so that we don't need to recalculate the vertices), and repeat.
				for (int iteration = 0; iteration < maxIterations; iteration++)
				{
					//Fold space over on itself so that we can reference only the top vertex.
					float t1 = dot(mutablePos, n1Tetrahedron);
					
					if (t1 < 0.0)
					{
						mutablePos -= 2.0 * t1 * n1Tetrahedron;
					}
					
					float t2 = dot(mutablePos, n2Tetrahedron);
					
					if (t2 < 0.0)
					{
						mutablePos -= 2.0 * t2 * n2Tetrahedron;
					}
					
					float t3 = dot(mutablePos, n3Tetrahedron);
					
					if (t3 < 0.0)
					{
						mutablePos -= 2.0 * t3 * n3Tetrahedron;
					}
					
					
					
					mutablePos = rotationMatrix1 * mutablePos;
					
					//Scale the system -- this one takes me a fair bit of thinking to get. What's happening here is that we're stretching from a vertex, but since we never scale the vertices, the four new ones are the four closest to the vertex we scaled from. Now (x, y, z) will get farther and farther away from the origin, but that makes sense -- we're really just zooming in on the tetrahedron.
					mutablePos = scale * mutablePos - (scale - 1.0) * scaleCenterTetrahedron;
					
					mutablePos = rotationMatrix2 * mutablePos;
				}
				
				return length(mutablePos) * pow(1.0/scale, float(maxIterations));
			}

			float distanceEstimatorCube(vec3 pos)
			{
				vec3 mutablePos = pos;
				
				//We'll find the closest vertex, scale everything by a factor of 2 centered on that vertex (so that we don't need to recalculate the vertices), and repeat.
				for (int iteration = 0; iteration < maxIterations; iteration++)
				{
					//Fold space over on itself so that we can reference only the top vertex.
					float t1 = dot(mutablePos, n1Cube);
					
					if (t1 < 0.0)
					{
						mutablePos -= 2.0 * t1 * n1Cube;
					}
					
					float t2 = dot(mutablePos, n2Cube);
					
					if (t2 < 0.0)
					{
						mutablePos -= 2.0 * t2 * n2Cube;
					}
					
					float t3 = dot(mutablePos, n3Cube);
					
					if (t3 < 0.0)
					{
						mutablePos -= 2.0 * t3 * n3Cube;
					}
					
					
					
					mutablePos = rotationMatrix1 * mutablePos;
					
					//Scale the system -- this one takes me a fair bit of thinking to get. What's happening here is that we're stretching from a vertex, but since we never scale the vertices, the four new ones are the four closest to the vertex we scaled from. Now (x, y, z) will get farther and farther away from the origin, but that makes sense -- we're really just zooming in on the tetrahedron.
					mutablePos = scale * mutablePos - (scale - 1.0) * scaleCenterCube;
					
					mutablePos = rotationMatrix2 * mutablePos;
				}
				
				return length(mutablePos) * pow(1.0/scale, float(maxIterations));
			}

			float distanceEstimatorOctahedron(vec3 pos)
			{
				vec3 mutablePos = pos;
				
				//We'll find the closest vertex, scale everything by a factor of 2 centered on that vertex (so that we don't need to recalculate the vertices), and repeat.
				for (int iteration = 0; iteration < maxIterations; iteration++)
				{
					//Fold space over on itself so that we can reference only the top vertex.
					float t1 = dot(mutablePos, n1Octahedron);
					
					if (t1 < 0.0)
					{
						mutablePos -= 2.0 * t1 * n1Octahedron;
					}
					
					float t2 = dot(mutablePos, n2Octahedron);
					
					if (t2 < 0.0)
					{
						mutablePos -= 2.0 * t2 * n2Octahedron;
					}
					
					float t3 = dot(mutablePos, n3Octahedron);
					
					if (t3 < 0.0)
					{
						mutablePos -= 2.0 * t3 * n3Octahedron;
					}

					float t4 = dot(mutablePos, n4Octahedron);
					
					if (t4 < 0.0)
					{
						mutablePos -= 2.0 * t4 * n4Octahedron;
					}
					
					
					
					mutablePos = rotationMatrix1 * mutablePos;
					
					//Scale the system -- this one takes me a fair bit of thinking to get. What's happening here is that we're stretching from a vertex, but since we never scale the vertices, the four new ones are the four closest to the vertex we scaled from. Now (x, y, z) will get farther and farther away from the origin, but that makes sense -- we're really just zooming in on the tetrahedron.
					mutablePos = scale * mutablePos - (scale - 1.0) * scaleCenterOctahedron;
					
					mutablePos = rotationMatrix2 * mutablePos;
				}
				
				return length(mutablePos) * pow(1.0/scale, float(maxIterations));
			}

			float distanceEstimator(vec3 pos)
			{
				float distance = 0.0;

				if (tetrahedronAmount > 0.0)
				{
					distance += tetrahedronAmount * distanceEstimatorTetrahedron(pos);
				}

				if (cubeAmount > 0.0)
				{
					distance += cubeAmount * distanceEstimatorCube(pos);
				}

				if (octahedronAmount > 0.0)
				{
					distance += octahedronAmount * distanceEstimatorOctahedron(pos);
				}

				return distance;
			}
			
			
			
			vec3 getColorTetrahedron(vec3 pos)
			{
				vec3 mutablePos = pos;

				vec3 color = vec3(1.0, 1.0, 1.0);
				float colorScale = .5;
				
				//We'll find the closest vertex, scale everything by a factor of 2 centered on that vertex (so that we don't need to recalculate the vertices), and repeat.
				for (int iteration = 0; iteration < maxIterations; iteration++)
				{
					//Fold space over on itself so that we can reference only the top vertex.
					float t1 = dot(mutablePos, n1Tetrahedron);
					
					if (t1 < 0.0)
					{
						mutablePos -= 2.0 * t1 * n1Tetrahedron;
						color = mix(color, color1, colorScale);
					}
					
					float t2 = dot(mutablePos, n2Tetrahedron);
					
					if (t2 < 0.0)
					{
						mutablePos -= 2.0 * t2 * n2Tetrahedron;
						color = mix(color, color2, colorScale);
					}
					
					float t3 = dot(mutablePos, n3Tetrahedron);
					
					if (t3 < 0.0)
					{
						mutablePos -= 2.0 * t3 * n3Tetrahedron;
						color = mix(color, color3, colorScale);
					}
					
					
					
					mutablePos = rotationMatrix1 * mutablePos;
					
					//Scale the system -- this one takes me a fair bit of thinking to get. What's happening here is that we're stretching from a vertex, but since we never scale the vertices, the four new ones are the four closest to the vertex we scaled from. Now (x, y, z) will get farther and farther away from the origin, but that makes sense -- we're really just zooming in on the tetrahedron.
					mutablePos = scale * mutablePos - (scale - 1.0) * scaleCenterTetrahedron;
					
					mutablePos = rotationMatrix2 * mutablePos;
					colorScale *= .5;
				}
				
				return color;
			}

			vec3 getColorCube(vec3 pos)
			{
				vec3 mutablePos = pos;

				vec3 color = vec3(1.0, 1.0, 1.0);
				float colorScale = .5;
				
				//We'll find the closest vertex, scale everything by a factor of 2 centered on that vertex (so that we don't need to recalculate the vertices), and repeat.
				for (int iteration = 0; iteration < maxIterations; iteration++)
				{
					//Fold space over on itself so that we can reference only the top vertex.
					float t1 = dot(mutablePos, n1Cube);
					
					if (t1 < 0.0)
					{
						mutablePos -= 2.0 * t1 * n1Cube;
						color = mix(color, color1, colorScale);
					}
					
					float t2 = dot(mutablePos, n2Cube);
					
					if (t2 < 0.0)
					{
						mutablePos -= 2.0 * t2 * n2Cube;
						color = mix(color, color2, colorScale);
					}
					
					float t3 = dot(mutablePos, n3Cube);
					
					if (t3 < 0.0)
					{
						mutablePos -= 2.0 * t3 * n3Cube;
						color = mix(color, color3, colorScale);
					}
					
					
					
					mutablePos = rotationMatrix1 * mutablePos;
					
					//Scale the system -- this one takes me a fair bit of thinking to get. What's happening here is that we're stretching from a vertex, but since we never scale the vertices, the four new ones are the four closest to the vertex we scaled from. Now (x, y, z) will get farther and farther away from the origin, but that makes sense -- we're really just zooming in on the tetrahedron.
					mutablePos = scale * mutablePos - (scale - 1.0) * scaleCenterCube;
					
					mutablePos = rotationMatrix2 * mutablePos;
					
					colorScale *= .5;
				}
				
				return color;
			}

			vec3 getColorOctahedron(vec3 pos)
			{
				vec3 mutablePos = pos;

				vec3 color = vec3(1.0, 1.0, 1.0);
				float colorScale = .5;
				
				//We'll find the closest vertex, scale everything by a factor of 2 centered on that vertex (so that we don't need to recalculate the vertices), and repeat.
				for (int iteration = 0; iteration < maxIterations; iteration++)
				{
					//Fold space over on itself so that we can reference only the top vertex.
					float t1 = dot(mutablePos, n1Octahedron);
					
					if (t1 < 0.0)
					{
						mutablePos -= 2.0 * t1 * n1Octahedron;
						color = mix(color, color1, colorScale);
					}
					
					float t2 = dot(mutablePos, n2Octahedron);
					
					if (t2 < 0.0)
					{
						mutablePos -= 2.0 * t2 * n2Octahedron;
						color = mix(color, color2, colorScale);
					}
					
					float t3 = dot(mutablePos, n3Octahedron);
					
					if (t3 < 0.0)
					{
						mutablePos -= 2.0 * t3 * n3Octahedron;
						color = mix(color, color3, colorScale);
					}

					float t4 = dot(mutablePos, n4Octahedron);
					
					if (t4 < 0.0)
					{
						mutablePos -= 2.0 * t4 * n4Octahedron;
						color = mix(color, color4, colorScale);
					}
					
					
					
					mutablePos = rotationMatrix1 * mutablePos;
					
					//Scale the system -- this one takes me a fair bit of thinking to get. What's happening here is that we're stretching from a vertex, but since we never scale the vertices, the four new ones are the four closest to the vertex we scaled from. Now (x, y, z) will get farther and farther away from the origin, but that makes sense -- we're really just zooming in on the tetrahedron.
					mutablePos = scale * mutablePos - (scale - 1.0) * scaleCenterOctahedron;
					
					mutablePos = rotationMatrix2 * mutablePos;

					colorScale *= .5;
				}
				
				return color;
			}

			vec3 getColor(vec3 pos)
			{
				vec3 color = vec3(0.0, 0.0, 0.0);

				if (tetrahedronAmount > 0.0)
				{
					color += tetrahedronAmount * getColorTetrahedron(pos);
				}

				if (cubeAmount > 0.0)
				{
					color += cubeAmount * getColorCube(pos);
				}

				if (octahedronAmount > 0.0)
				{
					color += octahedronAmount * getColorOctahedron(pos);
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

			vec3 getLightPos()
			{
				vec3 lightPos = vec3(0.0);

				if (tetrahedronAmount > 0.0)
				{
					lightPos += tetrahedronAmount * lightPosTetrahedron;
				}

				if (cubeAmount > 0.0)
				{
					lightPos += cubeAmount * lightPosCube;
				}

				if (octahedronAmount > 0.0)
				{
					lightPos += octahedronAmount * lightPosOctahedron;
				}

				return lightPos;
			}
			
			
			
			vec3 computeShading(vec3 pos, int iteration)
			{
				vec3 surfaceNormal = getSurfaceNormal(pos);
				
				vec3 lightDirection = normalize(getLightPos() - pos);
				
				float dotProduct = dot(surfaceNormal, lightDirection);
				
				float lightIntensity = lightBrightness * max(dotProduct, -.4 * dotProduct);
				
				//The last factor adds ambient occlusion.
				vec3 color = getColor(pos) * lightIntensity * max((1.0 - float(iteration) / float(maxMarches)), 0.0);
				
				
				
				//Apply fog.
				return mix(color, fogColor, 1.0 - exp(-distance(pos, cameraPos) * fogScaling));
			}
			
			
			
			vec3 raymarch(vec3 startPos)
			{
				//That factor of .9 is important -- without it, we're always stepping as far as possible, which results in artefacts and weirdness.
				vec3 rayDirectionVec = normalize(startPos - cameraPos) * .9;
				
				float epsilon = .0000001;
				
				float t = 0.0;
				
				
				
				for (int iteration = 0; iteration < maxMarches; iteration++)
				{
					vec3 pos = cameraPos + t * rayDirectionVec;
					
					float distance = distanceEstimator(pos);
					
					//This lowers the detail far away, which makes everything run nice and fast.
					epsilon = max(.0000006, 3.0 * t / float(imageSize));
					
					
					
					if (distance < epsilon)
					{
						return computeShading(pos, iteration);
					}
					
					else if (t > clipDistance)
					{
						return fogColor;
					}
					
					t += distance;
				}
				
				return fogColor;
			}
			
			
			
			void main(void)
			{
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

			worldCenterX: -.2391,
			worldCenterY: -1.6925,
		


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

		this.wilson.render.initUniforms([
			"aspectRatioX",
			"aspectRatioY",
			"imageSize",
			"cameraPos",
			"imagePlaneCenterPos",
			"forwardVec",
			"rightVec",
			"upVec",
			"distanceToScene",
			"tetrahedronAmount",
			"cubeAmount",
			"octahedronAmount",
			"scale",
			"rotationMatrix1",
			"rotationMatrix2"
		]);

		

		this.calculateVectors();
		
		if (this.imageWidth >= this.imageHeight)
		{
			this.wilson.gl.uniform1f(
				this.wilson.uniforms["aspectRatioX"],
				this.imageWidth / this.imageHeight
			);

			this.wilson.gl.uniform1f(
				this.wilson.uniforms["aspectRatioY"],
				1
			);
		}

		else
		{
			this.wilson.gl.uniform1f(
				this.wilson.uniforms["aspectRatioX"],
				1
			);

			this.wilson.gl.uniform1f(
				this.wilson.uniforms["aspectRatioY"],
				this.imageWidth / this.imageHeight
			);
		}
		
		this.wilson.gl.uniform1i(
			this.wilson.uniforms["imageSize"],
			this.imageSize
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms["cameraPos"],
			this.cameraPos
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms["imagePlaneCenterPos"],
			this.imagePlaneCenterPos
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms["forwardVec"],
			this.forwardVec
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms["rightVec"],
			this.rightVec
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms["upVec"],
			this.upVec
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["distanceToScene"],
			this.distanceToScene
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["tetrahedronAmount"],
			this.tetrahedronAmount
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["cubeAmount"],
			this.cubeAmount
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["octahedronAmount"],
			this.octahedronAmount
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["scale"],
			this.scale
		);

		this.wilson.gl.uniformMatrix3fv(
			this.wilson.uniforms["rotationMatrix1"],
			false,
			[1, 0, 0, 0, 1, 0, 0, 0, 1]
		);

		this.wilson.gl.uniformMatrix3fv(
			this.wilson.uniforms["rotationMatrix2"],
			false,
			[1, 0, 0, 0, 1, 0, 0, 0, 1]
		);



		const boundFunction = () => this.changeResolution();
		addTemporaryListener({
			object: window,
			event: "resize",
			callback: boundFunction
		});



		this.resume();
	}



	prepareFrame(timeElapsed)
	{
		this.pan.update(timeElapsed);
		this.zoom.update(timeElapsed);
		this.moveUpdate(timeElapsed);
	}

	drawFrame()
	{
		this.wilson.worldCenterY = Math.min(
			Math.max(
				this.wilson.worldCenterY,
				-Math.PI + .01
			),
			-.01
		);
		
		this.theta = -this.wilson.worldCenterX;
		this.phi = -this.wilson.worldCenterY;

		this.wilson.render.drawFrame();
	}



	distanceEstimatorSingular(x, y, z, ns, scaleCenter)
	{
		// We'll find the closest vertex, scale everything by a factor of 2
		// centered on that vertex (so that we don't need to recalculate the vertices), and repeat.
		for (let iteration = 0; iteration < this.numSierpinskiIterations; iteration++)
		{
			// Fold space over on itself so that we can reference only the top vertex.
			const t1 = RaymarchApplet.dotProduct([x, y, z], ns[0]);

			if (t1 < 0)
			{
				x -= 2 * t1 * ns[0][0];
				y -= 2 * t1 * ns[0][1];
				z -= 2 * t1 * ns[0][2];
			}

			const t2 = RaymarchApplet.dotProduct([x, y, z], ns[1]);

			if (t2 < 0)
			{
				x -= 2 * t2 * ns[1][0];
				y -= 2 * t2 * ns[1][1];
				z -= 2 * t2 * ns[1][2];
			}

			const t3 = RaymarchApplet.dotProduct([x, y, z], ns[2]);

			if (t3 < 0)
			{
				x -= 2 * t3 * ns[2][0];
				y -= 2 * t3 * ns[2][1];
				z -= 2 * t3 * ns[2][2];
			}

			if (ns.length >= 4)
			{
				const t4 = RaymarchApplet.dotProduct([x, y, z], ns[3]);

				if (t4 < 0)
				{
					x -= 2 * t4 * ns[3][0];
					y -= 2 * t4 * ns[3][1];
					z -= 2 * t4 * ns[3][2];
				}
			}



			// Apply the first rotation matrix.

			let tempX = x;
			let tempY = y;
			let tempZ = z;

			let matZ = [
				[Math.cos(this.rotationAngleZ1), -Math.sin(this.rotationAngleZ1), 0],
				[Math.sin(this.rotationAngleZ1), Math.cos(this.rotationAngleZ1), 0],
				[0, 0, 1]
			];

			let matY = [
				[Math.cos(this.rotationAngleY1), 0, -Math.sin(this.rotationAngleY1)],
				[0, 1, 0],
				[Math.sin(this.rotationAngleY1), 0, Math.cos(this.rotationAngleY1)]
			];
			
			let matX = [
				[1, 0, 0],
				[0, Math.cos(this.rotationAngleX1), -Math.sin(this.rotationAngleX1)],
				[0, Math.sin(this.rotationAngleX1), Math.cos(this.rotationAngleX1)]
			];

			let matTotal = RaymarchApplet.matMul(RaymarchApplet.matMul(matZ, matY), matX);

			x = matTotal[0][0] * tempX + matTotal[0][1] * tempY + matTotal[0][2] * tempZ;
			y = matTotal[1][0] * tempX + matTotal[1][1] * tempY + matTotal[1][2] * tempZ;
			z = matTotal[2][0] * tempX + matTotal[2][1] * tempY + matTotal[2][2] * tempZ;



			// This one takes a fair bit of thinking to get. What's happening here is that
			// we're stretching from a vertex, but since we never scale the vertices,
			// the four new ones are the four closest to the vertex we scaled from.
			// Now (x, y, z) will get farther and farther away from the origin,
			// but that makes sense -- we're really just zooming in on the tetrahedron.
			x = this.scale * x - (this.scale - 1) * scaleCenter[0];
			y = this.scale * y - (this.scale - 1) * scaleCenter[1];
			z = this.scale * z - (this.scale - 1) * scaleCenter[2];



			// Apply the second rotation matrix.

			tempX = x;
			tempY = y;
			tempZ = z;

			matZ = [
				[Math.cos(this.rotationAngleZ2), -Math.sin(this.rotationAngleZ2), 0],
				[Math.sin(this.rotationAngleZ2), Math.cos(this.rotationAngleZ2), 0],
				[0, 0, 1]
			];

			matY = [
				[Math.cos(this.rotationAngleY2), 0, -Math.sin(this.rotationAngleY2)],
				[0, 1, 0],
				[Math.sin(this.rotationAngleY2), 0, Math.cos(this.rotationAngleY2)]
			];

			matX = [
				[1, 0, 0],
				[0, Math.cos(this.rotationAngleX2), -Math.sin(this.rotationAngleX2)],
				[0, Math.sin(this.rotationAngleX2), Math.cos(this.rotationAngleX2)]
			];

			matTotal = RaymarchApplet.matMul(RaymarchApplet.matMul(matZ, matY), matX);

			x = matTotal[0][0] * tempX + matTotal[0][1] * tempY + matTotal[0][2] * tempZ;
			y = matTotal[1][0] * tempX + matTotal[1][1] * tempY + matTotal[1][2] * tempZ;
			z = matTotal[2][0] * tempX + matTotal[2][1] * tempY + matTotal[2][2] * tempZ;
		}



		// So at this point we've scaled up by 2x a total of numIterations times.
		// The final distance is therefore:
		return Math.sqrt(x * x + y * y + z * z)
			* Math.pow(this.scale, -this.numSierpinskiIterations);
	}

	distanceEstimator(x, y, z)
	{
		let distance = 0;

		if (this.tetrahedronAmount > 0)
		{
			distance += this.tetrahedronAmount
				* this.distanceEstimatorSingular(
					x,
					y,
					z,
					this.nTetrahedron,
					this.scaleCenterTetrahedron
				);
		}

		if (this.cubeAmount > 0)
		{
			distance += this.cubeAmount
				* this.distanceEstimatorSingular(
					x,
					y,
					z,
					this.nCube,
					this.scaleCenterCube
				);
		}

		if (this.octahedronAmount > 0)
		{
			distance += this.octahedronAmount
				* this.distanceEstimatorSingular(
					x,
					y,
					z,
					this.nOctahedron,
					this.scaleCenterOctahedron
				);
		}

		return distance;
	}



	changeResolution(resolution = this.imageSize)
	{
		this.imageSize = Math.max(100, resolution);

		if (this.wilson.fullscreen.currentlyFullscreen)
		{
			[this.imageWidth, this.imageHeight] = Applet.getEqualPixelFullScreen(this.imageSize);
		}

		else
		{
			this.imageWidth = this.imageSize;
			this.imageHeight = this.imageSize;
		}



		this.wilson.changeCanvasSize(this.imageWidth, this.imageHeight);



		if (this.imageWidth >= this.imageHeight)
		{
			this.wilson.gl.uniform1f(
				this.wilson.uniforms["aspectRatioX"],
				this.imageWidth / this.imageHeight
			);

			this.wilson.gl.uniform1f(
				this.wilson.uniforms["aspectRatioY"],
				1
			);
		}

		else
		{
			this.wilson.gl.uniform1f(
				this.wilson.uniforms["aspectRatioX"],
				1
			);

			this.wilson.gl.uniform1f(
				this.wilson.uniforms["aspectRatioY"],
				this.imageWidth / this.imageHeight
			);
		}

		this.wilson.gl.uniform1i(this.wilson.uniforms["imageSize"], this.imageSize);



		this.needNewFrame = true;
	}



	updateParameters(
		newRotationAngleX1,
		newRotationAngleY1,
		newRotationAngleZ1,
		newRotationAngleX2,
		newRotationAngleY2,
		newRotationAngleZ2
	) {
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
		let matZ = [
			[Math.cos(this.rotationAngleZ1), -Math.sin(this.rotationAngleZ1), 0],
			[Math.sin(this.rotationAngleZ1), Math.cos(this.rotationAngleZ1), 0],
			[0, 0, 1]
		];

		let matY = [
			[Math.cos(this.rotationAngleY1), 0, -Math.sin(this.rotationAngleY1)],
			[0, 1, 0],
			[Math.sin(this.rotationAngleY1), 0, Math.cos(this.rotationAngleY1)]
		];

		let matX = [
			[1, 0, 0],
			[0, Math.cos(this.rotationAngleX1), -Math.sin(this.rotationAngleX1)],
			[0, Math.sin(this.rotationAngleX1), Math.cos(this.rotationAngleX1)]
		];

		let matTotal = RaymarchApplet.matMul(RaymarchApplet.matMul(matZ, matY), matX);

		this.wilson.gl.uniformMatrix3fv(
			this.wilson.uniforms["rotationMatrix1"],
			false,
			[
				matTotal[0][0],
				matTotal[1][0],
				matTotal[2][0],
				matTotal[0][1],
				matTotal[1][1],
				matTotal[2][1],
				matTotal[0][2],
				matTotal[1][2],
				matTotal[2][2]
			]
		);



		matZ = [
			[Math.cos(this.rotationAngleZ2), -Math.sin(this.rotationAngleZ2), 0],
			[Math.sin(this.rotationAngleZ2), Math.cos(this.rotationAngleZ2), 0],
			[0, 0, 1]
		];

		matY = [
			[Math.cos(this.rotationAngleY2), 0, -Math.sin(this.rotationAngleY2)],
			[0, 1, 0],
			[Math.sin(this.rotationAngleY2), 0, Math.cos(this.rotationAngleY2)]
		];

		matX = [
			[1, 0, 0],
			[0, Math.cos(this.rotationAngleX2), -Math.sin(this.rotationAngleX2)],
			[0, Math.sin(this.rotationAngleX2), Math.cos(this.rotationAngleX2)]
		];

		matTotal = RaymarchApplet.matMul(RaymarchApplet.matMul(matZ, matY), matX);

		this.wilson.gl.uniformMatrix3fv(
			this.wilson.uniforms["rotationMatrix2"],
			false,
			[
				matTotal[0][0],
				matTotal[1][0],
				matTotal[2][0],
				matTotal[0][1],
				matTotal[1][1],
				matTotal[2][1],
				matTotal[0][2],
				matTotal[1][2],
				matTotal[2][2]
			]
		);

		this.needNewFrame = true;
	}



	// newAmounts is an array of the form [tetrahedronAmount, cubeAmount, octahedronAmount].
	async changePolyhedron(newAmounts, instant)
	{
		const oldAmounts = [
			this.tetrahedronAmount,
			this.cubeAmount,
			this.octahedronAmount
		];

		const dummy = { t: 0 };

		anime({
			targets: dummy,
			t: 1,
			duration: instant ? 0 : 1000,
			easing: "easeOutQuad",
			update: () =>
			{
				this.tetrahedronAmount = oldAmounts[0] * (1 - dummy.t) + newAmounts[0] * dummy.t;
				this.cubeAmount = oldAmounts[1] * (1 - dummy.t) + newAmounts[1] * dummy.t;
				this.octahedronAmount = oldAmounts[2] * (1 - dummy.t) + newAmounts[2] * dummy.t;

				this.wilson.gl.uniform1f(
					this.wilson.uniforms["tetrahedronAmount"],
					this.tetrahedronAmount
				);

				this.wilson.gl.uniform1f(
					this.wilson.uniforms["cubeAmount"],
					this.cubeAmount
				);

				this.wilson.gl.uniform1f(
					this.wilson.uniforms["octahedronAmount"],
					this.octahedronAmount
				);

				this.needNewFrame = true;
			},
			complete: () =>
			{
				this.tetrahedronAmount = newAmounts[0];
				this.cubeAmount = newAmounts[1];
				this.octahedronAmount = newAmounts[2];

				this.wilson.gl.uniform1f(
					this.wilson.uniforms["tetrahedronAmount"],
					this.tetrahedronAmount
				);

				this.wilson.gl.uniform1f(
					this.wilson.uniforms["cubeAmount"],
					this.cubeAmount
				);

				this.wilson.gl.uniform1f(
					this.wilson.uniforms["octahedronAmount"],
					this.octahedronAmount
				);

				this.needNewFrame = true;
			}
		});
	}
}