import { extrudedCubeDE, roomSphereDE } from "./distanceEstimators.js";
import { RaymarchApplet } from "/scripts/applets/raymarchApplet.js";

export class GroundAndSphere extends RaymarchApplet
{
	constructor({ canvas })
	{
		const shader = /* glsl */`
			precision highp float;
			
			varying vec2 uv;

			uniform float aspectRatioX;
			uniform float aspectRatioY;
			uniform int imageSize;
			uniform vec3 cameraPos;
			uniform vec3 imagePlaneCenterPos;
			uniform vec3 forwardVec;
			uniform vec3 rightVec;
			uniform vec3 upVec;
			uniform float epsilonScaling;
			uniform float minEpsilon;


			uniform float showSphereAmount;
			uniform float groundTextureAmount;
			uniform float fogAmount;
			uniform float pointLightAmount;
			uniform float ambientLightAmount;
			uniform float shadowAmount;
			uniform float softShadowAmount;
			uniform float reflectivityAmount;
			uniform float showRoomsAmount;
			uniform float modPosAmount;
			uniform float sphereWeight;
			uniform float extrudedCubeWeight;
			uniform float extrudedCubeSeparation;
			
			const vec3 lightPos = vec3(50, 70, 100);
			const float lightBrightness = float(1);
			const float bloomPower = float(1);
			
			const float clipDistance = float(1000);
			const int maxMarches = 192;
			const int maxShadowMarches = 128;
			const int maxReflectionMarches = 128;
			const vec3 fogColor = vec3(0.6, 0.73, 0.87);
			const float fogScaling = 0.1;
			const float maxShadowAmount = 0.5;

			
			
			float rand(vec2 co)
			{
				return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
			}

			${roomSphereDE[0]}
			${roomSphereDE[1]}
			
			${extrudedCubeDE[0]}
			${extrudedCubeDE[1]}

			float distanceEstimatorGround(vec3 pos)
			{
				return abs(pos.z);
			}

			float distanceEstimatorObject(vec3 pos)
			{
				float distanceObject = 0.0;

				if (sphereWeight > 0.0)
				{
					distanceObject += sphereWeight * distanceEstimatorRoomSphere(pos);
				}

				if (extrudedCubeWeight > 0.0)
				{
					distanceObject += extrudedCubeWeight * distanceEstimatorExtrudedCube(pos);
				}
				
				return distanceObject;
			}

			vec3 getColorObject(vec3 pos)
			{
				vec3 color = vec3(0.0, 0.0, 0.0);

				if (sphereWeight > 0.0)
				{
					color += sphereWeight * getColorRoomSphere(pos);
				}

				if (extrudedCubeWeight > 0.0)
				{
					color += extrudedCubeWeight * getColorExtrudedCube(pos);
				}

				return color;
			}
		
			float distanceEstimator(vec3 pos)
			{
				float distanceGround = distanceEstimatorGround(pos);
				float distanceObject = distanceEstimatorObject(pos);

				return min(distanceGround, distanceObject);
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
						* (1.0 + groundTextureAmount * .2 * (rand(co) - .5));
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
				return mix(
					0.0,
					pow(
						(3.0 - distance(
							normalize(rayDirectionVec),
							normalize(lightPos - cameraPos)
						)) / 2.99,
						float(20)
					),
					pointLightAmount
				);
			}



			// Nearly identical to raymarching, but it only marches toward the light.
			float computeShadowIntensity(vec3 startPos, vec3 lightDirection)
			{
				vec3 rayDirectionVec = normalize(lightDirection) * .25;
				float softShadowFactor = 1.0;
				float t = 0.0;

				float lastDistanceToScene = 100000.0;

				for (int iteration = 0; iteration < maxShadowMarches; iteration++)
				{
					vec3 pos = startPos + t * rayDirectionVec;
					
					// Use Sebastian Aaltonen's improvement to Inigo Quilez's soft shadow algorithm.
					float distanceToScene = distanceEstimator(pos);
					float y = distanceToScene * distanceToScene / (2.0 * lastDistanceToScene);
        			float d = sqrt(distanceToScene * distanceToScene - y * y);

					softShadowFactor = min(
						softShadowFactor,
						d / (max(t - y, 0.0) * 0.025) 
					);

					lastDistanceToScene = distanceToScene;

					float epsilon = max(t / (float(imageSize) * epsilonScaling), minEpsilon);

					if (t > clipDistance || length(pos - lightPos) < 0.2)
					{
						return mix(
							1.0,
							clamp(softShadowFactor, maxShadowAmount, 1.0),
							softShadowAmount
						);
					}

					if (distanceToScene < epsilon)
					{
						return maxShadowAmount;
					}
					
					t += distanceToScene;
				}

				return mix(
					1.0,
					clamp(softShadowFactor, maxShadowAmount, 1.0),
					softShadowAmount
				);
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
					0.25 * ambientLightAmount
				);

				vec3 color = getColor(pos)
					* lightIntensity
					* max((1.0 - float(iteration) / float(maxMarches)), 0.0);

				
					float shadowIntensity = mix(
						1.0,
						computeShadowIntensity(pos, lightDirection),
						shadowAmount
					);

					color *= shadowIntensity;
				
				
				//Apply fog.
				return mix(color, fogColor, 1.0 - exp(-distance(pos, cameraPos) * fogScaling * fogAmount));
			}

			// Unlike in raymarch(), startPos is replacing cameraPos, and rayDirectionVec is precomputed.
			vec3 computeReflection(vec3 startPos, vec3 rayDirectionVec, int startIteration)
			{
				float t = 0.0;
				
				for (int iteration = 0; iteration < maxReflectionMarches; iteration++)
				{
					vec3 pos = startPos + t * rayDirectionVec;;
					
					float distanceToScene = distanceEstimator(pos);

					float epsilon = max(t / (float(imageSize) * epsilonScaling), minEpsilon);

					if (distanceToScene < epsilon)
					{
						return computeShadingWithoutReflection(
							pos,
							epsilon,
							distanceToScene - 2.0 * epsilon,
							iteration + startIteration
						);
					}
					
					else if (t > clipDistance)
					{
						return mix(fogColor, vec3(1.0), computeBloom(rayDirectionVec));
					}
					
					t += distanceToScene;
				}
				
				return mix(fogColor, vec3(1.0), computeBloom(rayDirectionVec));
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
					0.25 * ambientLightAmount
				);

				vec3 color = getColor(pos)
					* lightIntensity
					* max((1.0 - float(iteration) / float(maxMarches)), 0.0);

				
					float shadowIntensity = mix(
						1.0,
						computeShadowIntensity(pos, lightDirection),
						shadowAmount
					);

					color *= shadowIntensity;
				

				
					vec3 reflectedDirection = reflect(normalize(pos - cameraPos) * 0.95, surfaceNormal);

					color = mix(
						color,
						computeReflection(pos, reflectedDirection, iteration),
						mix(
							0.0,
							getReflectivity(pos),
							reflectivityAmount
						)
					);
				
				
				//Apply fog.
				return mix(color, fogColor, 1.0 - exp(-distance(pos, cameraPos) * fogScaling * fogAmount));
			}


			
			vec3 raymarch(vec3 startPos)
			{
				vec3 rayDirectionVec = normalize(startPos - cameraPos) * 0.95;
				
				float t = 0.0;
				
				for (int iteration = 0; iteration < maxMarches; iteration++)
				{
					vec3 pos = cameraPos + t * rayDirectionVec;;
					
					float distanceToScene = distanceEstimator(pos);

					float epsilon = max(t / (float(imageSize) * epsilonScaling), minEpsilon);
					
					if (distanceToScene < epsilon)
					{
						return computeShading(
							pos,
							epsilon,
							distanceToScene - 2.0 * epsilon,
							iteration
						);
					}
					
					else if (t > clipDistance)
					{
						return mix(fogColor, vec3(1.0), computeBloom(rayDirectionVec));
					}
					
					t += distanceToScene;
				}
				
				return mix(fogColor, vec3(1.0), computeBloom(rayDirectionVec));
			}
			
			
			
			void main(void)
			{
				vec3 finalColor = raymarch(
					imagePlaneCenterPos + rightVec * uv.x * aspectRatioX + upVec * uv.y / aspectRatioY
				);
				
				gl_FragColor = vec4(finalColor.xyz, 1.0);
			}
		`;

		const uniforms = {
			showSphereAmount: ["float", 1],
			groundTextureAmount: ["float", 1],
			fogAmount: ["float", 1],
			pointLightAmount: ["float", 1],
			ambientLightAmount: ["float", 1],
			shadowAmount: ["float", 0],
			softShadowAmount: ["float", 1],
			reflectivityAmount: ["float", 0],
			modPosAmount: ["float", 1],
			showRoomsAmount: ["float", 1],

			sphereWeight: ["float", 0],
			extrudedCubeWeight: ["float", 1],
			extrudedCubeSeparation: ["float", 1.5],
		};

		super({
			canvas,
			shader,
			uniforms,
			cameraPos: [-0.6568, 1.2449, 1],
			theta: -1.2209,
			phi: 1.7904,
			fogScaling: 0.075,
			lockedOnOrigin: false,
			lockZ: 1,
		});
	}

	distanceEstimator()
	{
		return 1;
	}
}