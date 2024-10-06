import { showPage } from "../../../scripts/src/loadPage.js";
import { GroundAndSphere } from "./groundAndSphere.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const applet = new GroundAndSphere({ canvas: $("#output-canvas") });

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "curved-light.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		minValue: 100,
		maxValue: 1000,
		onInput: changeResolution
	});

	const testCheckbox = new Checkbox({
		element: $("#test-checkbox"),
		name: "Test",
		onInput: test
	});

	showPage();

	function changeResolution()
	{
		applet.changeResolution(resolutionInput.value * siteSettings.resolutionMultiplier);
	}

	function test()
	{
		applet.toggleUniform({
			name: "modPosAmount",
			show: testCheckbox.checked,
			duration: 1000
		});

		setTimeout(() =>
		{
			applet.toggleUniform({
				name: "showRoomsAmount",
				show: !testCheckbox.checked,
				duration: 1000
			});
		}, 1000);
	}
}

`

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

			uniform float showSphereAmount;
			uniform float groundTextureAmount;
			uniform float fogAmount;
			uniform float ambientOcclusionAmount;
			uniform float pointLightAmount;
			uniform float ambientLightAmount;
			uniform float shadowAmount;
			uniform float softShadowAmount;
			uniform float reflectivityAmount;
			uniform float showRoomsAmount;
			uniform float modPosAmount;

			uniform float extrudedCubeSeparation;
			
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
				vec3 modPos = mix(pos, mod(pos + vec3(1.0, 1.0, 0.0), 2.0) - vec3(1.0, 1.0, 0.0), modPosAmount); 
				return length(modPos - vec3(0.0, 0.0, 1.0)) - showSphereAmount * 0.5;
			}

			float distanceEstimatorRoom(vec3 pos)
			{
				vec3 modPos = mix(pos, mod(pos, 2.0), modPosAmount); 
				return showSphereAmount * 1.25 - length(modPos - vec3(1.0, 1.0, 1.0));
			}

			
		float distanceEstimatorExtrudedCube(vec3 pos)
		{
			float scaleCenter = 2.0 * extrudedCubeSeparation;

			vec3 mutablePos = abs(pos - vec3(0.0, 0.0, 1.0));

			float totalDistance = (max(max(mutablePos.x, mutablePos.y), mutablePos.z) - 1.0);

			for (int iteration = 0; iteration < 16; iteration++)
			{
				if (mutablePos.x > max(mutablePos.y, mutablePos.z))
				{
					mutablePos = 3.0 * mutablePos - (3.0 - 1.0) * vec3(scaleCenter, 0.0, 0.0);
				}

				else if (mutablePos.y > max(mutablePos.x, mutablePos.z))
				{
					mutablePos = 3.0 * mutablePos - (3.0 - 1.0) * vec3(0.0, scaleCenter, 0.0);
				}

				else
				{
					mutablePos = 3.0 * mutablePos - (3.0 - 1.0) * vec3(0.0, 0.0, scaleCenter);
				}

				mutablePos = abs(mutablePos);

				totalDistance = min(
					totalDistance,
					(max(max(mutablePos.x, mutablePos.y), mutablePos.z) - 1.0)
						/ pow(3.0, float(iteration + 1))
				);
			}
			
			return totalDistance;
		}
	
			
			float distanceEstimator(vec3 pos)
			{
				float distance1 = distanceEstimatorGround(pos);
				float distance2 = mix(distanceEstimatorSphere(pos), distanceEstimatorRoom(pos), showRoomsAmount);
				float distance3 = distanceEstimatorExtrudedCube(pos);

				return min(min(distance1, distance2), distance3);
			}

			
		vec3 getColorExtrudedCube(vec3 pos)
		{
			vec3 color = vec3(0.25);

			float scaleCenter = 2.0 * extrudedCubeSeparation;

			vec3 mutablePos = abs(pos - vec3(0.0, 0.0, 1.0));

			for (int iteration = 0; iteration < 16; iteration++)
			{
				if (mutablePos.x > max(mutablePos.y, mutablePos.z))
				{
					mutablePos = 3.0 * mutablePos - (3.0 - 1.0) * vec3(scaleCenter, 0.0, 0.0);

					color += vec3(0.0, 0.75, 1.0) * pow(2.0, -float(iteration + 1));
				}

				else if (mutablePos.y > max(mutablePos.x, mutablePos.z))
				{
					mutablePos = 3.0 * mutablePos - (3.0 - 1.0) * vec3(0.0, scaleCenter, 0.0);

					color += vec3(0.75, 0.0, 1.0) * pow(2.0, -float(iteration + 1));
				}

				else
				{
					mutablePos = 3.0 * mutablePos - (3.0 - 1.0) * vec3(0.0, 0.0, scaleCenter);

					color += vec3(0.0, 0.0, 1.0) * pow(2.0, -float(iteration + 1));
				}

				mutablePos = abs(mutablePos);
			}
			
			return color;
		}
	
			
			vec3 getColor(vec3 pos)
			{
				float distance1 = distanceEstimatorGround(pos);
				float distance2 = mix(distanceEstimatorSphere(pos), distanceEstimatorRoom(pos), showRoomsAmount);
				float distance3 = distanceEstimatorExtrudedCube(pos);

				float minDistance = min(min(distance1, distance2), distance3);

				if (minDistance == distance1)
				{
					vec2 co = floor(pos.xy * 50.0);
					return vec3(0.5, 0.5, 0.5)
						* (1.0 + groundTextureAmount * .2 * (rand(co) - .5));
				}

				if (minDistance == distance2)
				{
					return vec3(0.5, 0.0, 1.0);
				}

				if (minDistance == distance3)
				{
					return getColorExtrudedCube(pos);
				}
			}

			float getReflectivity(vec3 pos)
			{
				float distance1 = distanceEstimatorGround(pos);
				float distance2 = mix(distanceEstimatorSphere(pos), distanceEstimatorRoom(pos), showRoomsAmount);

				float minDistance = min(min(distance1, distance2), distance3);

				if (minDistance == distance1)
				{
					return .05;
				}

				if (minDistance == distance2)
				{
					return 0.75;
				}

				if (minDistance == distance3)
				{
					return 0.5;
				}
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

			float computeBloom(vec3 rayDirectionVec)
			{
				float bloom = max(
					1.0,
					pow(
						1.0 / distance(
							normalize(rayDirectionVec),
							normalize(lightPos - cameraPos)
						),
						bloomPower
					)
				);

				return mix(
					1.0,
					bloom,
					pointLightAmount
				);
			}

			

			// Nearly identical to raymarching, but it only marches toward the light.
			float computeShadowIntensity(vec3 startPos, vec3 lightDirection)
			{
				//That factor of .9 is important -- without it, we're always stepping as far as possible, which results in artefacts and weirdness.
				vec3 rayDirectionVec = normalize(lightDirection) * .95;

				float softShadowFactor = 100.0;
				
				float t = 0.5;

				for (int iteration = 0; iteration < maxMarches; iteration++)
				{
					vec3 pos = startPos + t * rayDirectionVec;
					
					float distanceToScene = distanceEstimator(pos);
					softShadowFactor = mix(
						1.0,
						min(softShadowFactor, max(distanceToScene, 0.0) / t * 5.0),
						softShadowAmount
					);

					if (t > clipDistance || length(pos - lightPos) < pointLightAmount * 0.2)
					{
						return clamp(softShadowFactor, maxShadowAmount, 1.0);
					}

					if (distanceToScene < 0.01)
					{
						return maxShadowAmount;
					}
					
					t += distanceToScene;
				}

				return clamp(softShadowFactor, maxShadowAmount, 1.0);
			}



			vec3 computeShadingWithoutReflection(
				vec3 pos,
				float correctionDistance,
				int iteration,
				float bloomAmount
			) {
				vec3 surfaceNormal = getSurfaceNormal(pos);

				// This corrects the position so that it's exactly on the surface (we probably marched a little bit inside).
				pos -= surfaceNormal * correctionDistance;
				
				vec3 lightDirection = normalize(lightPos - pos);
				
				float dotProduct = dot(surfaceNormal, lightDirection);
				
				float lightIntensity = max(
					lightBrightness * dotProduct * pointLightAmount,
					ambientLightAmount * .25
				);

				float shadowIntensity = mix(1.0, computeShadowIntensity(pos, lightDirection), shadowAmount);
				
				//The last factor adds ambient occlusion.
				vec3 color = getColor(pos)
					* lightIntensity
					* shadowIntensity
					* max((1.0 - ambientOcclusionAmount * float(iteration) / float(maxMarches)), 0.0);
				
				//Apply fog.
				return mix(color, fogColor * bloomAmount, 1.0 - exp(-distance(pos, cameraPos) * fogScaling * fogAmount));
			}

			// Unlike in raymarch(), startPos is replacing cameraPos, and rayDirectionVec is precomputed.
			vec3 computeReflection(vec3 startPos, vec3 rayDirectionVec, int startIteration)
			{
				float epsilon = 0.0;
				float t = .05;
				
				for (int iteration = 0; iteration < maxMarches; iteration++)
				{
					vec3 pos = startPos + t * rayDirectionVec;
					
					float distanceToScene = distanceEstimator(pos);
					epsilon = max(.0000006, 10.0 * t / float(imageSize));

					if (distanceToScene < epsilon)
					{
						return computeShadingWithoutReflection(
							pos,
							distanceToScene - epsilon,
							iteration + startIteration,
							computeBloom(rayDirectionVec)
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
				float correctionDistance,
				int iteration,
				float bloomAmount
			) {
				vec3 surfaceNormal = getSurfaceNormal(pos);

				// This corrects the position so that it's exactly on the surface (we probably marched a little bit inside).
				pos -= surfaceNormal * correctionDistance;
				
				vec3 lightDirection = normalize(lightPos - pos);
				
				float dotProduct = dot(surfaceNormal, lightDirection);
				
				float lightIntensity = max(
					lightBrightness * dotProduct * pointLightAmount,
					ambientLightAmount * .25
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
					* max((1.0 - ambientOcclusionAmount * float(iteration) / float(maxMarches)), 0.0);

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
				return mix(color, fogColor * bloomAmount, 1.0 - exp(-distance(pos, cameraPos) * fogScaling * fogAmount));
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
						return computeShading(
							pos,
							distanceToScene - epsilon,
							iteration,
							computeBloom(rayDirectionVec)
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
		
`