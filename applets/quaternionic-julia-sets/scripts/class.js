import anime from "/scripts/anime.js";
import { Applet } from "/scripts/applets/applet.js";
import { RaymarchApplet } from "/scripts/applets/raymarchApplet.js";
import { Wilson } from "/scripts/wilson.js";

export class QuaternionicJuliaSet extends RaymarchApplet
{
	cameraPos = [-0.5881, -1.5735, 0.7451];
	theta = 1.3094;
	phi = 1.9975;
	c = [-.54, -.25, -.668];
	lightPos = [-5, -5, 5];

	juliaProportion = 1;
	maxIterations = 16;



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
			
			uniform float focalLength;
			
			uniform vec3 lightPos;
			const float lightBrightness = 1.5;
			
			uniform int imageSize;
			
			uniform int maxIterations;
			
			
			
			const float clipDistance = 1000.0;
			uniform int maxMarches;
			uniform float stepFactor;
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .05;
			
			
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
				gl_FragColor = vec4(raymarch(imagePlaneCenterPos + rightVec * (uv.x) * aspectRatioX + upVec * (uv.y) / aspectRatioY), 1.0);
			}
		`;



		const options =
		{
			renderer: "gpu",

			shader: fragShaderSource,

			canvasWidth: 400,
			canvasHeight: 400,

			worldCenterX: -this.theta,
			worldCenterY:  -this.phi,



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

		this.wilson.render.initUniforms([
			"aspectRatioX",
			"aspectRatioY",
			"imageSize",
			"cameraPos",
			"imagePlaneCenterPos",
			"forwardVec",
			"rightVec",
			"upVec",
			"focalLength",
			"lightPos",
			"c",
			"juliaProportion",
			"maxMarches",
			"stepFactor",
			"maxIterations",
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
			this.wilson.uniforms["lightPos"],
			this.lightPos
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
			this.wilson.uniforms["focalLength"],
			this.focalLength
		);

		this.wilson.gl.uniform3fv(
			this.wilson.uniforms["c"],
			this.c
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["juliaProportion"],
			1
		);

		this.wilson.gl.uniform1i(
			this.wilson.uniforms["maxMarches"],
			this.maxMarches
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["stepFactor"],
			1
		);
		
		this.wilson.gl.uniform1i(
			this.wilson.uniforms["maxIterations"],
			this.maxIterations
		);

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



	distanceEstimator(x, y, z)
	{
		let mutableZ = [x, y, z, 0];
		let zPrime = [1.0, 0.0, 0.0, 0.0];

		let r = 0.0;

		for (let iteration = 0; iteration < this.maxIterations; iteration++)
		{
			r = Math.sqrt(RaymarchApplet.dotProduct4(mutableZ, mutableZ));

			if (r > 16.0)
			{
				break;
			}

			zPrime = RaymarchApplet.qmul(...mutableZ, ...zPrime);
			zPrime[0] *= 2;
			zPrime[1] *= 2;
			zPrime[2] *= 2;
			zPrime[3] *= 2;



			mutableZ = RaymarchApplet.qmul(...mutableZ, ...mutableZ);

			mutableZ[0] += ((1 - this.juliaProportion) * x + this.juliaProportion * this.c[0]);
			mutableZ[1] += ((1 - this.juliaProportion) * y + this.juliaProportion * this.c[1]);
			mutableZ[2] += ((1 - this.juliaProportion) * z + this.juliaProportion * this.c[2]);
		}

		return 0.5 * Math.log(r) * r / Math.sqrt(RaymarchApplet.dotProduct4(zPrime, zPrime));
	}



	changeResolution(resolution)
	{
		this.imageSize = resolution;

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

			this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatioY"], 1);
		}

		else
		{
			this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatioX"], 1);

			this.wilson.gl.uniform1f(
				this.wilson.uniforms["aspectRatioY"],
				this.imageWidth / this.imageHeight
			);
		}

		this.wilson.gl.uniform1i(this.wilson.uniforms["imageSize"], this.imageSize);

		this.needNewFrame = true;
	}



	updateC(newC)
	{
		this.c = newC;

		this.wilson.gl.uniform3fv(this.wilson.uniforms["c"], this.c);

		this.needNewFrame = true;
	}



	switchBulb()
	{
		if (this.juliaProportion !== 0 && this.juliaProportion !== 1)
		{
			return;
		}

		const oldJuliaProportion = this.juliaProportion;
		const newJuliaProportion = 1 - this.juliaProportion;

		if (this.juliaProportion === 0)
		{
			this.wilson.gl.uniform3fv(this.wilson.uniforms["c"], this.c);
		}

		const dummy = { t: 0 };

		anime({
			targets: dummy,
			t: 1,
			duration: 1000,
			easing: "easeOutQuad",
			update: () =>
			{
				this.juliaProportion = (1 - dummy.t) * oldJuliaProportion
					+ dummy.t * newJuliaProportion;

				this.wilson.gl.uniform1f(
					this.wilson.uniforms["juliaProportion"],
					this.juliaProportion
				);

				this.needNewFrame = true;
			}
		});
	}
}