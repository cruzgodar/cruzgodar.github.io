import { RaymarchingFundamentals } from "./class.js";

export class GroundAndSphere extends RaymarchingFundamentals
{
	constructor({ canvas })
	{
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
			
			const vec3 lightPos = vec3(5.0, 7.0, 10.0);
			const float lightBrightness = 1.0;
			const float maxShadowAmount = .25;
			uniform int imageSize;

			uniform float showSphereAmount;
			uniform float groundTextureAmount;
			uniform float fogAmount;
			uniform float ambientOcclusionAmount;
			uniform float pointLightAmount;
			uniform float ambientLightAmount;
			
			const float clipDistance = 1000.0;
			const int maxMarches = 256;
			const vec3 fogColor = vec3(0.6, 0.73, 0.87);
			const float fogScaling = .05;

			float rand(vec2 co)
			{
				return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
			}
			
			float distanceEstimatorGround(vec3 pos)
			{
				return abs(pos.z);
			}

			float distanceEstimatorSphere(vec3 pos)
			{
				return length(pos - vec3(0.0, 0.0, 1.0)) - showSphereAmount * 0.5;
			}
			
			float distanceEstimator(vec3 pos)
			{
				float distanceGround = distanceEstimatorGround(pos);
				float distanceSphere = distanceEstimatorSphere(pos);

				return min(distanceGround, distanceSphere);
			}
			
			vec3 getColor(vec3 pos)
			{
				float distanceGround = distanceEstimatorGround(pos);
				float distanceSphere = distanceEstimatorSphere(pos);

				float minDistance = min(distanceGround, distanceSphere);

				if (minDistance == distanceGround)
				{
					vec2 co = floor(pos.xy * 50.0);
					return vec3(0.5, 0.5, 0.5)
						* (1.0 + groundTextureAmount * .2 * (rand(co) - .5));
				}

				return vec3(0.5, 0.0, 1.0);
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

			// Nearly identical to raymarching, but it only marches toward the light.
			float computeShadowIntensity(vec3 startPos, vec3 lightDirection)
			{
				//That factor of .9 is important -- without it, we're always stepping as far as possible, which results in artefacts and weirdness.
				vec3 rayDirectionVec = normalize(lightDirection) * .95;
				
				float t = 0.0;

				for (int iteration = 0; iteration < maxMarches; iteration++)
				{
					vec3 pos = startPos + t * rayDirectionVec;
					
					float distanceToScene = distanceEstimator(pos);
					
					if (distanceToScene < 0.0)
					{
						return maxShadowAmount;
					}
					
					else if (t > clipDistance)
					{
						return 1.0;
					}
					
					t += distanceToScene;
				}

				return 1.0;
			}
			
			vec3 computeShading(vec3 pos, int iteration)
			{
				vec3 surfaceNormal = getSurfaceNormal(pos);
				
				vec3 lightDirection = normalize(lightPos - pos);
				
				float dotProduct = dot(surfaceNormal, lightDirection);
				
				float lightIntensity = max(lightBrightness * dotProduct * pointLightAmount, ambientLightAmount * .25);

				float shadowIntensity = computeShadowIntensity(pos, lightDirection);
				
				//The last factor adds ambient occlusion.
				vec3 color = getColor(pos)
					* lightIntensity
					* shadowIntensity
					* max((1.0 - ambientOcclusionAmount * float(iteration) / float(maxMarches)), 0.0);
				
				//Apply fog.
				return mix(color, fogColor, 1.0 - exp(-distance(pos, cameraPos) * fogScaling * fogAmount));
			}
			
			
			
			vec3 raymarch(vec3 startPos)
			{
				//That factor of .9 is important -- without it, we're always stepping as far as possible, which results in artefacts and weirdness.
				vec3 rayDirectionVec = normalize(startPos - cameraPos) * .95;
				
				float epsilon = .0000001;
				
				float t = 0.0;
				
				
				
				for (int iteration = 0; iteration < maxMarches; iteration++)
				{
					vec3 pos = startPos + t * rayDirectionVec;
					
					float distanceToScene = distanceEstimator(pos);
					
					//This lowers the detail far away, which makes everything run nice and fast.
					epsilon = max(.0000006, 1.0 * t / float(imageSize));
					
					
					
					if (distanceToScene < epsilon)
					{
						return computeShading(pos, iteration);
					}
					
					else if (t > clipDistance)
					{
						return fogColor;
					}
					
					
					
					t += distanceToScene;
				}
				
				return fogColor;
			}
			
			
			
			void main(void)
			{
				vec3 finalColor = raymarch(imagePlaneCenterPos + rightVec * uv.x * aspectRatioX + upVec * uv.y / aspectRatioY);
				
				gl_FragColor = vec4(finalColor.xyz, 1.0);
			}
		`;

		super({
			canvas,
			fragShaderSource,
			uniforms: [
				"showSphereAmount",
				"groundTextureAmount",
				"fogAmount",
				"ambientOcclusionAmount",
				"pointLightAmount",
				"ambientLightAmount",
			]
		});

		this.wilson.gl.uniform1f(this.wilson.uniforms.showSphereAmount, 1);
		this.wilson.gl.uniform1f(this.wilson.uniforms.groundTextureAmount, 1);
		this.wilson.gl.uniform1f(this.wilson.uniforms.fogAmount, 1);
		this.wilson.gl.uniform1f(this.wilson.uniforms.ambientOcclusionAmount, 1);
		this.wilson.gl.uniform1f(this.wilson.uniforms.pointLightAmount, 1);
		this.wilson.gl.uniform1f(this.wilson.uniforms.ambientLightAmount, 1);
	}
}