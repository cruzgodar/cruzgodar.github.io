/* eslint-disable quotes */
import { doubleEncodingGlsl } from "../src/complexGlsl.js";
import { getFloatGlsl, getVectorGlsl } from "./applet.js";

function getComputeShadowIntensityGlsl({
	useShadows,
	useSoftShadows,
	getGeodesicGlsl
}) {
	if (useShadows && useSoftShadows)
	{
		return /* glsl */`
			// Nearly identical to raymarching, but it only marches toward the light.
			float computeShadowIntensity(vec3 startPos, vec3 lightDirection)
			{
				vec3 rayDirectionVec = normalize(lightDirection) * .25;
				float softShadowFactor = 1.0;
				float t = 0.0;

				float lastDistanceToScene = 100000.0;

				for (int iteration = 0; iteration < maxShadowMarches; iteration++)
				{
					vec3 pos = ${getGeodesicGlsl("startPos", "rayDirectionVec")};
					
					// Use Sebastian Aaltonen's improvement to Inigo Quilez's soft shadow algorithm.
					float distanceToScene = distanceEstimator(pos);
					float y = distanceToScene * distanceToScene / (2.0 * lastDistanceToScene);
					float d = sqrt(distanceToScene * distanceToScene - y * y);

					softShadowFactor = min(
						softShadowFactor,
						d / (max(t - y, 0.0) * 0.025) 
					);

					lastDistanceToScene = distanceToScene;

					float epsilon = max(t / (resolution * epsilonScaling), minEpsilon);

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
		`;
	}
		
	if (useShadows)
	{
		return /* glsl */`
			// Nearly identical to raymarching, but it only marches toward the light.
			float computeShadowIntensity(vec3 startPos, vec3 lightDirection)
			{
				vec3 rayDirectionVec = normalize(lightDirection) * .25;
				float t = 0.0;

				for (int iteration = 0; iteration < maxShadowMarches; iteration++)
				{
					vec3 pos = ${getGeodesicGlsl("startPos", "rayDirectionVec")};
					
					float distanceToScene = distanceEstimator(pos);

					float epsilon = max(t / (resolution * epsilonScaling), minEpsilon);

					if (t > clipDistance)
					{
						return 1.0;
					}

					if (distanceToScene < epsilon)
					{
						return maxShadowAmount;
					}
					
					t += distanceToScene;
				}

				return 1.0;
			}
		`;
	}

	return "";
}



function getComputeReflectionsGlsl({
	useReflections,
	useOppositeLight,
	oppositeLightBrightness,
	ambientLight,
	getGeodesicGlsl,
	useBloom,
	useShadows
}) {
	if (useReflections)
	{
		return /* glsl */`
			vec3 computeShadingWithoutReflection(
				vec3 pos,
				float epsilon,
				float distanceToScene,
				int iteration
			) {
				vec3 surfaceNormal = getSurfaceNormal(pos, distanceToScene * 0.5);
				pos += (epsilon - distanceToScene) * surfaceNormal;
				surfaceNormal = getSurfaceNormal(pos, epsilon * 0.5);
				
				vec3 lightDirection = normalize(lightPos - pos);
				
				float dotProduct = dot(surfaceNormal, lightDirection);
				
				float lightIntensity = max(
					${useOppositeLight ? `lightBrightness * max(dotProduct, -${getFloatGlsl(oppositeLightBrightness)} * dotProduct)` : "lightBrightness * dotProduct"},
					${getFloatGlsl(ambientLight)}
				);

				vec3 color = getColor(pos)
					* lightIntensity
					* max((1.0 - float(iteration) / float(maxMarches)), 0.0);

				${useShadows ? /* glsl */`
					float shadowIntensity = computeShadowIntensity(pos, lightDirection);

					color *= shadowIntensity;
				` : ""}
				
				//Apply fog.
				return mix(color, fogColor, 1.0 - exp(-distance(pos, cameraPos) * fogScaling));
			}

			// Unlike in raymarch(), startPos is replacing cameraPos, and rayDirectionVec is precomputed.
			vec3 computeReflection(
				vec3 startPos,
				vec3 rayDirectionVec,
				int startIteration
			) {
				float t = 0.0;
				
				for (int iteration = 0; iteration < maxReflectionMarches; iteration++)
				{
					vec3 pos = ${getGeodesicGlsl("startPos", "rayDirectionVec")};
					
					float distanceToScene = distanceEstimator(pos);

					float epsilon = max(t / (resolution * epsilonScaling), minEpsilon);

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
						return ${useBloom ? "mix(fogColor, vec3(1.0), computeBloom(rayDirectionVec))" : "fogColor"};
					}
					
					t += distanceToScene;
				}
				
				return ${useBloom ? "mix(fogColor, vec3(1.0), computeBloom(rayDirectionVec))" : "fogColor"};
			}
		`;
	}

	return "";
}



function getComputeShadingGlsl({
	useForDepthBuffer,
	useOppositeLight,
	oppositeLightBrightness,
	ambientLight,
	useShadows,
	useReflections,
	stepFactor
}) {
	if (useForDepthBuffer)
	{
		return /* glsl */`
			vec3 computeShading(
				vec3 pos,
				float epsilon,
				float distanceToScene,
				int iteration
			) {
				gl_FragColor = encodeFloat(length(pos - cameraPos));
				return vec3(0.0);
			}
		`;
	}

	return /* glsl */`
		vec3 computeShading(
			vec3 pos,
			float epsilon,
			float distanceToScene,
			int iteration
		) {
			// Using distanceToScene / 2 here means we never step inside the object
			// which helps to prevent banding.
			vec3 surfaceNormal = getSurfaceNormal(pos, distanceToScene * 0.5);
			pos += (epsilon - distanceToScene) * surfaceNormal;
			surfaceNormal = getSurfaceNormal(pos, epsilon * 0.5);
			
			vec3 lightDirection = normalize(lightPos - pos);
			
			float dotProduct = dot(surfaceNormal, lightDirection);
			
			float lightIntensity = max(
				${useOppositeLight ? `lightBrightness * max(dotProduct, -${getFloatGlsl(oppositeLightBrightness)} * dotProduct)` : "lightBrightness * dotProduct"},
				${getFloatGlsl(ambientLight)}
			);



			vec3 color = getColor(pos)
				* lightIntensity
				* max((1.0 - float(iteration) / float(maxMarches)), 0.0);

			

			${useShadows ? /* glsl */`
				float shadowIntensity = computeShadowIntensity(pos, lightDirection);

				color *= shadowIntensity;
			` : ""}

			${useReflections ? /* glsl */`
				vec3 reflectedDirection = reflect(
					normalize(pos - cameraPos) * ${getFloatGlsl(stepFactor)},
					surfaceNormal
				);

				color = mix(
					color,
					computeReflection(pos, reflectedDirection, iteration),
					getReflectivity(pos)
				);
			` : ""}
			
			//Apply fog.
			return mix(color, fogColor, 1.0 - exp(-distance(pos, cameraPos) * fogScaling));
		}
	`;
}



function getRaymarchGlsl({
	useForDepthBuffer,
	stepFactor,
	getGeodesicGlsl,
	useBloom
}) {
	const clippedGlsl = useForDepthBuffer
		? /* glsl */`gl_FragColor = encodeFloat(clipDistance); return vec3(0.0);`
		: useBloom
			? /* glsl */`return mix(fogColor, vec3(1.0), computeBloom(rayDirectionVec));`
			: /* glsl */`return fogColor;`;

	return /* glsl */`
		vec3 raymarch(vec3 startPos)
		{
			vec3 rayDirectionVec = normalize(startPos - cameraPos) * ${getFloatGlsl(stepFactor)};
			
			float t = 0.0;
			
			for (int iteration = 0; iteration < maxMarches; iteration++)
			{
				vec3 pos = ${getGeodesicGlsl("cameraPos", "rayDirectionVec")};
				
				float distanceToScene = distanceEstimator(pos);

				float epsilon = max(t / (resolution * epsilonScaling), minEpsilon);
				
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
					${clippedGlsl}
				}
				
				t += distanceToScene;
			}
			
			${clippedGlsl}
		}
	`;
}



function getMainFunctionGlsl({
	useForDepthBuffer,
	useFor3DPrinting
}) {
	if (useForDepthBuffer)
	{
		return /* glsl */`${""}
			void main(void)
			{
				raymarch(
					imagePlaneCenterPos
						+ rightVec * (uvScale * uv.x + uvCenter.x) * aspectRatio.x
						+ upVec * (uvScale * uv.y + uvCenter.y) * aspectRatio.y
				);
			}
		`;
	}

	if (useFor3DPrinting)
	{
		return /* glsl */`${""}
			void main(void)
			{
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);

				if (distanceEstimator(vec3(uv.x, uv.y, uvCenter.x) * uvScale) < epsilonScaling)
				{
					gl_FragColor = vec4(1.0);
				}
			}
		`;
	}

	return /* glsl */`${""}
		void main(void)
		{
			vec3 finalColor = raymarch(
				imagePlaneCenterPos
					+ rightVec * (uvScale * uv.x + uvCenter.x) * aspectRatio.x
					+ upVec * (uvScale * uv.y + uvCenter.y) * aspectRatio.y
			);

			gl_FragColor = vec4(finalColor.xyz, 1.0);
		}
	`;
}



export function createShader({
	distanceEstimatorGlsl,
	getColorGlsl,
	getReflectivityGlsl,
	getGeodesicGlsl,
	addGlsl,
	useForDepthBuffer,

	useShadows,
	useSoftShadows,
	useReflections,
	useOppositeLight,
	oppositeLightBrightness,
	ambientLight,
	useBloom,
	bloomPower,
	stepFactor,
	useFor3DPrinting,

	uniformsGlsl,
	lightPos,
	lightBrightness,
	clipDistance,
	maxMarches,
	maxShadowMarches,
	maxReflectionMarches,
	fogColor,
	fogScaling
}) {
	const computeShadowIntensityGlsl = getComputeShadowIntensityGlsl({
		useShadows,
		useSoftShadows,
		getGeodesicGlsl
	});

	const computeReflectionGlsl = getComputeReflectionsGlsl({
		useReflections,
		useOppositeLight,
		oppositeLightBrightness,
		ambientLight,
		getGeodesicGlsl,
		useBloom,
		useShadows
	});

	const computeShadingGlsl = getComputeShadingGlsl({
		useForDepthBuffer,
		useOppositeLight,
		oppositeLightBrightness,
		ambientLight,
		useShadows,
		useReflections,
		stepFactor
	});

	const raymarchGlsl = getRaymarchGlsl({
		useForDepthBuffer,
		stepFactor,
		getGeodesicGlsl,
		useBloom
	});

	const mainFunctionGlsl = getMainFunctionGlsl({
		useForDepthBuffer,
		useFor3DPrinting
	});

	const computeBloomGlsl = useBloom ? /* glsl */`
		float computeBloom(vec3 rayDirectionVec)
		{
			return pow(
				(3.0 - distance(
					normalize(rayDirectionVec),
					normalize(lightPos - cameraPos)
				)) / 2.99,
				${getFloatGlsl(20 / bloomPower)}
			);
		}
	` : "";

	const shader = /* glsl */`
		precision highp float;
		
		varying vec2 uv;

		${uniformsGlsl}
		
		const vec3 lightPos = ${getVectorGlsl(lightPos)};
		const float lightBrightness = ${getFloatGlsl(lightBrightness)};
		const float bloomPower = ${getFloatGlsl(bloomPower)};
		
		const float clipDistance = ${getFloatGlsl(clipDistance)};
		const int maxMarches = ${maxMarches};
		const int maxShadowMarches = ${maxShadowMarches};
		const int maxReflectionMarches = ${maxReflectionMarches};
		const vec3 fogColor = ${getVectorGlsl(fogColor)};
		const float fogScaling = ${getFloatGlsl(fogScaling)};
		const float maxShadowAmount = 0.5;

		${useForDepthBuffer ? doubleEncodingGlsl : ""}

		${addGlsl}
		
		
		
		float distanceEstimator(vec3 pos)
		{
			${distanceEstimatorGlsl}
		}
		
		vec3 getColor(vec3 pos)
		{
			${getColorGlsl}
		}

		${useReflections ? /* glsl */`float getReflectivity(vec3 pos)
		{
			${getReflectivityGlsl}
		}` : ""}
		
		
		
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

		${computeBloomGlsl}

		${computeShadowIntensityGlsl}

		${computeReflectionGlsl}
		
		${computeShadingGlsl}

		${raymarchGlsl}
		
		${mainFunctionGlsl}
	`;

	return shader;
}