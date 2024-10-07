import { RaymarchingFundamentals } from "./class.js";
import { extrudedCubeDE } from "./distanceEstimators.js";

export class Fractals extends RaymarchingFundamentals
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
			
			const vec3 lightPos = vec3(50.0, 70.0, 100.0);
			// The minimum distance between the light direction and a sky direction.
			const float bloomPower = 0.11;

			const float lightBrightness = 1.0;
			const float maxShadowAmount = .5;
			uniform int imageSize;
			uniform float objectRotation;
			uniform float objectFloat;

			uniform float shadowAmount;
			uniform float reflectivityAmount;

			uniform float extrudedCubeSeparation;
			uniform float extrudedCubeWeight;
			
			const float clipDistance = 1000.0;
			const int maxMarches = 256;
			const int maxShadowMarches = 128;
			const int maxReflectionMarches = 256;
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

			${extrudedCubeDE[0]}

			float distanceEstimatorObject(vec3 pos)
			{
				float distanceObject = 0.0;

				float c = cos(objectRotation);
				float s = sin(objectRotation);
				vec3 rotatedPos = mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0) * (pos + vec3(0.0, 0.0, objectFloat));

				if (extrudedCubeWeight > 0.0)
				{
					distanceObject += extrudedCubeWeight * distanceEstimatorExtrudedCube(rotatedPos);
				}
				
				return distanceObject;
			}
			
			float distanceEstimator(vec3 pos)
			{
				float distanceGround = distanceEstimatorGround(pos);
				float distanceObject = distanceEstimatorObject(pos);

				return min(distanceGround, distanceObject);
			}

			${extrudedCubeDE[1]}

			vec3 getColorObject(vec3 pos)
			{
				vec3 color = vec3(0.0, 0.0, 0.0);

				float c = cos(objectRotation);
				float s = sin(objectRotation);
				vec3 rotatedPos = mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0) * (pos + vec3(0.0, 0.0, objectFloat));

				if (extrudedCubeWeight > 0.0)
				{
					color += extrudedCubeWeight * getColorExtrudedCube(rotatedPos);
				}

				return color;
			}
			
			vec3 getColor(vec3 pos)
			{
				float distanceGround = distanceEstimatorGround(pos);
				float distanceObject = distanceEstimatorObject(pos);

				float minDistance = min(distanceGround, distanceObject);

				if (minDistance == distanceGround)
				{
					vec2 co = floor(pos.xy * 50.0);
					return vec3(0.5, 0.5, 0.5)
						* (1.0 + .2 * (rand(co) - .5));
				}

				if (minDistance == distanceObject)
				{
					return getColorObject(pos);
				}
			}

			float getReflectivity(vec3 pos)
			{
				float distanceGround = distanceEstimatorGround(pos);
				float distanceObject = distanceEstimatorObject(pos);

				float minDistance = min(distanceGround, distanceObject);

				if (minDistance == distanceGround)
				{
					return .05;
				}

				if (minDistance == distanceObject)
				{
					return 0.15;
				}
			}
			
			
			
			vec3 getSurfaceNormal(vec3 pos, float epsilon)
			{
				float xStep1 = distanceEstimator(pos + vec3(epsilon, 0.0, 0.0));
				float yStep1 = distanceEstimator(pos + vec3(0.0, epsilon, 0.0));
				float zStep1 = distanceEstimator(pos + vec3(0.0, 0.0, epsilon));
				
				float xStep2 = distanceEstimator(pos - vec3(epsilon, 0.0, 0.0));
				float yStep2 = distanceEstimator(pos - vec3(0.0, epsilon, 0.0));
				float zStep2 = distanceEstimator(pos - vec3(0.0, 0.0, epsilon));
				
				return normalize(vec3(xStep1 - xStep2, yStep1 - yStep2, zStep1 - zStep2));
			}

			float computeBloom(vec3 rayDirectionVec)
			{
				return max(
					1.0,
					pow(
						1.0 / distance(
							normalize(rayDirectionVec),
							normalize(lightPos - cameraPos)
						),
						bloomPower
					)
				);
			}

			

			// Nearly identical to raymarching, but it only marches toward the light.
			float computeShadowIntensity(vec3 startPos, vec3 lightDirection)
			{
				//That factor of .9 is important -- without it, we're always stepping as far as possible, which results in artefacts and weirdness.
				vec3 rayDirectionVec = normalize(lightDirection) * .95;

				float softShadowFactor = 100.0;
				
				float t = 0.01;
				float epsilon = 0.0;

				for (int iteration = 0; iteration < maxShadowMarches; iteration++)
				{
					vec3 pos = startPos + t * rayDirectionVec;
					
					float distanceToScene = distanceEstimator(pos);
					epsilon = max(.0000006, 1.0 * t / float(imageSize));

					softShadowFactor = min(softShadowFactor, max(distanceToScene, 0.0) / t * 20.0);

					if (t > clipDistance || length(pos - lightPos) < 0.2)
					{
						return clamp(softShadowFactor, maxShadowAmount, 1.0);
					}

					if (distanceToScene < epsilon)
					{
						return maxShadowAmount;
					}
					
					t += distanceToScene;
				}

				return clamp(softShadowFactor, maxShadowAmount, 1.0);
			}



			vec3 computeShadingWithoutReflection(
				vec3 pos,
				float epsilon,
				float correctionDistance,
				int iteration
			) {
				vec3 surfaceNormal = getSurfaceNormal(pos, epsilon);

				// This corrects the position so that it's exactly on the surface (we probably marched a little bit inside).
				pos -= surfaceNormal * correctionDistance;
				
				vec3 lightDirection = normalize(lightPos - pos);
				
				float dotProduct = dot(surfaceNormal, lightDirection);
				
				float lightIntensity = max(
					lightBrightness * dotProduct,
					.25
				);

				float shadowIntensity = mix(1.0, computeShadowIntensity(pos, lightDirection), shadowAmount);
				
				//The last factor adds ambient occlusion.
				vec3 color = getColor(pos)
					* lightIntensity
					* shadowIntensity
					* max((1.0 - float(iteration) / float(maxMarches)), 0.0);
				
				//Apply fog.
				return mix(color, fogColor, 1.0 - exp(-distance(pos, cameraPos) * fogScaling));
			}

			// Unlike in raymarch(), startPos is replacing cameraPos, and rayDirectionVec is precomputed.
			vec3 computeReflection(vec3 startPos, vec3 rayDirectionVec, int startIteration)
			{
				float epsilon = 0.0;
				float t = .0001;
				
				for (int iteration = 0; iteration < maxReflectionMarches; iteration++)
				{
					vec3 pos = startPos + t * rayDirectionVec;
					
					float distanceToScene = distanceEstimator(pos);
					epsilon = max(.0000006, 1.0 * t / float(imageSize));

					if (distanceToScene < epsilon)
					{
						return computeShadingWithoutReflection(
							pos,
							epsilon,
							distanceToScene,
							iteration + startIteration
						);
					}
					
					else if (t > clipDistance)
					{
						return fogColor * computeBloom(rayDirectionVec);
					}
					
					t += distanceToScene;
				}
				
				return fogColor * computeBloom(rayDirectionVec);
			}


			
			vec3 computeShading(
				vec3 pos,
				float epsilon,
				float correctionDistance,
				int iteration
			) {
				vec3 surfaceNormal = getSurfaceNormal(pos, epsilon);

				// This corrects the position so that it's exactly on the surface (we probably marched a little bit inside).
				pos -= surfaceNormal * correctionDistance;
				
				vec3 lightDirection = normalize(lightPos - pos);
				
				float dotProduct = dot(surfaceNormal, lightDirection);
				
				float lightIntensity = max(
					lightBrightness * dotProduct,
					.25
				);

				float shadowIntensity = 1.0;

				if (shadowAmount >= 0.0)
				{
					shadowIntensity = mix(1.0, computeShadowIntensity(pos, lightDirection), shadowAmount);
				}
				
				//The last factor adds ambient occlusion.
				vec3 color = getColor(pos)
					* lightIntensity
					* shadowIntensity
					* max((1.0 - float(iteration) / float(maxMarches)), 0.0);

				vec3 reflectedDirection = reflect(normalize(pos - cameraPos) * .95, surfaceNormal);
				if (reflectivityAmount > 0.0)
				{
					color = mix(
						color,
						computeReflection(pos, reflectedDirection, iteration),
						getReflectivity(pos) * reflectivityAmount
					);
				}
				
				//Apply fog.
				return mix(color, fogColor, 1.0 - exp(-distance(pos, cameraPos) * fogScaling));
			}


			
			vec3 raymarch(vec3 startPos)
			{
				//That factor of .9 is important -- without it, we're always stepping as far as possible, which results in artefacts and weirdness.
				vec3 rayDirectionVec = normalize(startPos - cameraPos) * .95;
				
				float epsilon = 0.0;
				float t = 0.0;
				
				for (int iteration = 0; iteration < maxMarches; iteration++)
				{
					vec3 pos = cameraPos + t * rayDirectionVec;
					
					float distanceToScene = distanceEstimator(pos);
					
					//This lowers the detail far away, which makes everything run nice and fast.
					epsilon = max(.0000006, 1.0 * t / float(imageSize));
					
					if (distanceToScene < epsilon)
					{
						return computeShading(
							pos,
							epsilon,
							distanceToScene,
							iteration
						);
					}
					
					else if (t > clipDistance)
					{
						return fogColor * computeBloom(rayDirectionVec);
					}
					
					t += distanceToScene;
				}
				
				return fogColor * computeBloom(rayDirectionVec);
			}
			
			
			
			void main(void)
			{
				vec3 finalColor = raymarch(
					imagePlaneCenterPos + rightVec * uv.x * aspectRatioX + upVec * uv.y / aspectRatioY
				);
				
				gl_FragColor = vec4(finalColor.xyz, 1.0);
			}
		`;

		console.log(fragShaderSource);

		super({
			canvas,
			fragShaderSource,
			uniforms: [
				"shadowAmount",
				"reflectivityAmount",

				"extrudedCubeSeparation",
				"extrudedCubeWeight",
			]
		});

		this.wilson.gl.uniform1f(this.wilson.uniforms.shadowAmount, 1);
		this.wilson.gl.uniform1f(this.wilson.uniforms.reflectivityAmount, 0);

		this.wilson.gl.uniform1f(this.wilson.uniforms.extrudedCubeWeight, 1);
		this.wilson.gl.uniform1f(this.wilson.uniforms.extrudedCubeSeparation, 2);
	}
}