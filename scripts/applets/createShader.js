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
			float computeShadowIntensity(
				vec3 startPos,
				vec3 lightDirection,
				float epsilon
			) {
				vec3 rayDirectionVec = normalize(lightDirection) * .25;
				float softShadowFactor = 1.0;
	
				// Start a little bit away from where we hit so we aren't stuck in near-epsilon jail.
				float t = 5.0 * epsilon;

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

					if (t > clipDistance || dot(pos - lightPos, pos - lightPos) < 0.2*0.2)
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
			float computeShadowIntensity(
				vec3 startPos,
				vec3 lightDirection,
				float epsilon
			) {
				vec3 rayDirectionVec = normalize(lightDirection) * .25;

				// Start a little bit away from where we hit so we aren't stuck in near-epsilon jail.
				float t = 5.0 * epsilon;

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



function getComputeShadingGlsl({
	useOppositeLight,
	oppositeLightBrightness,
	ambientLight,
	useShadows,
}) {
	return /* glsl */`
		vec3 computeShading(
			vec3 pos,
			float t,
			float epsilon,
			float distanceToScene,
			int iteration,
			vec3 lightDirection,
			vec3 surfaceNormal
			${useShadows ? ", float shadowIntensity" : ""}
		) {
			float dotProduct = dot(surfaceNormal, lightDirection);
			
			float lightIntensity = max(
				${useOppositeLight ? `lightBrightness * max(dotProduct, -${getFloatGlsl(oppositeLightBrightness)} * dotProduct)` : "lightBrightness * dotProduct"},
				${getFloatGlsl(ambientLight)}
			);



			vec3 color = getColor(pos)
				* lightIntensity
				* max((1.0 - float(iteration) / float(maxMarches)), 0.0);

			

			${useShadows ? "color *= shadowIntensity;" : ""}


			
			//Apply fog.
			return mix(color, fogColor, 1.0 - exp(-t * fogScaling));
		}
	`;
}



function getRaymarchGlsl({
	getGeodesicGlsl,
}) {
	return /* glsl */`
		void raymarch(
			vec3 rayOrigin,
			vec3 rayDirectionVec,
			out vec3 pos,
			out float epsilon,
			out float t,
			out float distanceToScene,
			out int finalIteration
		) {
			t = 0.0;
			
			for (int iteration = 0; iteration < maxMarches; iteration++)
			{
				pos = ${getGeodesicGlsl("rayOrigin", "rayDirectionVec")};
				
				distanceToScene = distanceEstimator(pos);

				epsilon = max(t / (resolution * epsilonScaling), minEpsilon);
				
				if (distanceToScene < epsilon || t > clipDistance)
				{
					finalIteration = iteration;
					return;
				}
				
				t += distanceToScene;
			}

			finalIteration = maxMarches;
		}
	`;
}



function getMainFunctionGlsl({
	useFor3DPrinting,
	includeDepthData,
	useBloom,
	useShadows,
	useReflections,
	stepFactor,
}) {
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


	const alpha = includeDepthData ? "t" : "1.0";

	const clippedColor = useBloom
		? "mix(fogColor, vec3(1.0), computeBloom(rayDirectionVec))"
		: "fogColor";

	const reflectionGlsl = useReflections ? /* glsl */`
		vec3 reflectionStartPos = pos;
		vec3 reflectedDirection = reflect(rayDirectionVec, surfaceNormal);
		vec3 reflectionPos;
		float reflectionEpsilon;
		float reflectionT;
		float reflectionDistanceToScene;
		int reflectionIteration;

		raymarch(
			reflectionStartPos,
			reflectedDirection,
			reflectionPos,
			reflectionEpsilon,
			reflectionT,
			reflectionDistanceToScene,
			reflectionIteration
		);

		vec3 reflectionColor;

		if (reflectionT > clipDistance)
		{
			reflectionColor = ${clippedColor};
		}

		
		// Using distanceToScene / 2 here means we never step inside the object
		// which helps to prevent banding.
		vec3 reflectionSurfaceNormal = getSurfaceNormal(reflectionPos, reflectionDistanceToScene * 0.5);
		reflectionPos += (reflectionEpsilon - reflectionDistanceToScene) * reflectionSurfaceNormal;
		reflectionSurfaceNormal = getSurfaceNormal(reflectionPos, reflectionEpsilon * 0.5);

		vec3 reflectionLightDirection = normalize(lightPos - reflectionPos);

		// Run shadows if necessary.
		${useShadows ? "float reflectionShadowIntensity = computeShadowIntensity(reflectionPos, reflectionLightDirection, reflectionEpsilon);" : ""}

		reflectionColor = computeShading(
			reflectionPos,
			reflectionT,
			reflectionEpsilon,
			reflectionDistanceToScene,
			reflectionIteration, // Possibly should be + iteration
			reflectionLightDirection,
			reflectionSurfaceNormal
			${useShadows ? ", reflectionShadowIntensity" : ""}
		);
	` : "";

	return /* glsl */`${""}
		void main(void)
		{
			gl_FragColor = vec4(fogColor, 1.0);

			vec3 rayDirectionEye = vec3(
				((uvScale * uv.x + uvCenter.x) + projectionMatrix[2][0]) / projectionMatrix[0][0],
				((uvScale * uv.y + uvCenter.y) + projectionMatrix[2][1]) / projectionMatrix[1][1],
				-1.0
			);

			vec3 rayDirectionVec = normalize(mat3(cameraToWorld) * rayDirectionEye) * ${getFloatGlsl(stepFactor)};

			vec3 pos;
			float epsilon;
			float t;
			float distanceToScene;
			int iteration;

			raymarch(
				rayOrigin,
				rayDirectionVec,
				pos,
				epsilon,
				t,
				distanceToScene,
				iteration
			);

			if (t > clipDistance)
			{
				gl_FragColor = vec4(${clippedColor}, ${alpha});
				return;
			}

			
			// Using distanceToScene / 2 here means we never step inside the object
			// which helps to prevent banding.
			vec3 surfaceNormal = getSurfaceNormal(pos, distanceToScene * 0.5);
			pos += (epsilon - distanceToScene) * surfaceNormal;
			surfaceNormal = getSurfaceNormal(pos, epsilon * 0.5);

			vec3 lightDirection = normalize(lightPos - pos);

			// Run shadows if necessary.
			${useShadows ? "float shadowIntensity = computeShadowIntensity(pos, lightDirection, epsilon);" : ""}

			vec3 color = computeShading(
				pos,
				t,
				epsilon,
				distanceToScene,
				iteration,
				lightDirection,
				surfaceNormal
				${useShadows ? ", shadowIntensity" : ""}
			);

			${reflectionGlsl}

			gl_FragColor = vec4(
				${useReflections ? "mix(color, reflectionColor, getReflectivity(pos))" : "color"},
				${alpha}
			);
		}
	`;
}



export function createShader({
	distanceEstimatorGlsl,
	getColorGlsl,
	getReflectivityGlsl,
	getGeodesicGlsl,
	addGlsl,
	includeDepthData,

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
	fogScaling,
}) {
	const computeShadowIntensityGlsl = getComputeShadowIntensityGlsl({
		useShadows,
		useSoftShadows,
		getGeodesicGlsl,
	});

	const computeShadingGlsl = getComputeShadingGlsl({
		useOppositeLight,
		oppositeLightBrightness,
		ambientLight,
		useShadows,
	});

	const raymarchGlsl = getRaymarchGlsl({
		includeDepthData,
		stepFactor,
		getGeodesicGlsl,
		useBloom,
	});

	const mainFunctionGlsl = getMainFunctionGlsl({
		useFor3DPrinting,
		includeDepthData,
		useBloom,
		stepFactor,
		useShadows,
		useReflections,
	});

	const computeBloomGlsl = useBloom ? /* glsl */`
		float computeBloom(vec3 rayDirectionVec)
		{
			return pow(
				(3.0 - distance(
					normalize(rayDirectionVec),
					normalize(lightPos - rayOrigin)
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
			// Tetrahedral offsets - more accurate and potentially faster
			vec2 e = vec2(1.0, -1.0) * epsilon;
			return normalize(
				e.xyy * distanceEstimator(pos + e.xyy)
				+ e.yyx * distanceEstimator(pos + e.yyx)
				+ e.yxy * distanceEstimator(pos + e.yxy)
				+ e.xxx * distanceEstimator(pos + e.xxx)
			);
		}

		${computeBloomGlsl}

		${computeShadowIntensityGlsl}
		
		${computeShadingGlsl}

		${raymarchGlsl}
		
		${mainFunctionGlsl}
	`;

	return shader;
}