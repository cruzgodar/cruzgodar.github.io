import { getFloatGlsl, getVectorGlsl } from "./applet.js";

function getComputeShadowIntensityGlsl({
	useShadows,
	useSoftShadows,
	getGeodesicGlsl,
}) {
	if (useShadows && useSoftShadows)
	{
		return /* glsl */`
			// Nearly identical to raymarching, but it only marches toward the light.
			float computeShadowIntensity(
				vec3 startPos,
				vec3 lightDirection,
				float startEpsilon
			) {
				vec3 rayDirectionVec = normalize(lightDirection);

				float softShadowFactor = 1.0;

				// Start a little bit away from where we hit so we aren't stuck in near-epsilon jail.
				float t = 5.0 * minEpsilon;
				float lastDistanceToScene = 1e10;

				for (int iteration = 0; iteration < maxShadowMarches; iteration++)
				{
					vec3 pos = ${getGeodesicGlsl("startPos", "rayDirectionVec")};

					float distanceToScene = distanceEstimator(pos);

					// Aaltonen's estimate of where the ray passed closest to the surface between this
					// sample and the last. It assumes the previous step was a full sphere step, and it
					// goes imaginary the moment the clearance more than doubles -- which full-length
					// steps do constantly -- so the radicand has to be clamped.
					float y = distanceToScene * distanceToScene / (2.0 * lastDistanceToScene);
					float d = sqrt(max(distanceToScene * distanceToScene - y * y, 0.0));

					softShadowFactor = min(softShadowFactor, d / (max(t - y, 0.0) * 0.1));

					lastDistanceToScene = distanceToScene;

					float epsilon = max(t * epsilonScaling, minEpsilon);

					if (t > clipDistance || dot(pos - lightPos, pos - lightPos) < 0.04)
					{
						return clamp(softShadowFactor, maxShadowAmount, 1.0);
					}

					if (distanceToScene < epsilon)
					{
						return maxShadowAmount;
					}

					// Small steps for quality, but only near the surface.
					t += distanceToScene * (t < 5.0 ? 0.25 : 0.99);
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
				float startEpsilon
			) {
				vec3 rayDirectionVec = normalize(lightDirection);

				// Start a little bit away from where we hit so we aren't stuck in near-epsilon jail.
				float t = 5.0 * minEpsilon;

				for (int iteration = 0; iteration < maxShadowMarches; iteration++)
				{
					vec3 pos = ${getGeodesicGlsl("startPos", "rayDirectionVec")};
					
					float distanceToScene = distanceEstimator(pos);

					float epsilon = max(t * epsilonScaling, minEpsilon);

					if (t > clipDistance)
					{
						return 1.0;
					}

					if (distanceToScene < epsilon)
					{
						return maxShadowAmount;
					}
					
					// Small steps for quality, but only near the surface.
					t += distanceToScene * (t < 5.0 ? 0.25 : 0.99);
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
	useGradientCorrectedOcclusion
}) {
	// An experimental fix for DEs like quaternionic julia sets', which overestimate the actual
	// distance. Try this if the entire scene looks uniformly dim.
	const occlusionAddition = useGradientCorrectedOcclusion
		? /* glsl */`
			occlusion += weight * (height - (distanceEstimator(pos + height * surfaceNormal))
				/ max(gradientMagnitude, 0.001));
		` : /* glsl */`
			occlusion += weight * (height - (distanceEstimator(pos + height * surfaceNormal)));
		`;

	return /* glsl */`
		// Samples the estimator along the normal. On an unoccluded flat surface the distance
		// grows exactly as fast as we step away, so anything closer than the step height is
		// nearby geometry blocking part of the hemisphere.
		float computeAmbientOcclusion(vec3 pos, vec3 surfaceNormal, float gradientMagnitude, float t)
		{
			float occlusion = 0.0;
			float weight = 1.0;

			float radius = t * 0.05;

			for (int i = 1; i <= aoSamples; i++)
			{
				float height = radius * float(i) / float(aoSamples);

				${occlusionAddition}

				weight *= 0.75;
			}

			// Dividing by the radius keeps aoStrength meaningful when the radius changes.
			return clamp(1.0 - aoStrength * occlusion / radius, 0.0, 1.0);
		}



		vec3 computeShading(
			vec3 pos,
			vec3 lightDirection,
			vec3 surfaceNormal,
			float distanceFromStart,
			float ambientOcclusion
			${useShadows ? ", float shadowIntensity" : ""}
		) {
			float dotProduct = dot(surfaceNormal, lightDirection);
			
			float lightIntensity = max(
				${useOppositeLight ? `lightBrightness * max(dotProduct, -${getFloatGlsl(oppositeLightBrightness)} * dotProduct)` : "lightBrightness * dotProduct"},
				${getFloatGlsl(ambientLight)}
			);

			vec3 color = getColor(pos) * lightIntensity * ambientOcclusion;

			${useShadows ? "color *= shadowIntensity;" : ""}
			
			//Apply fog.
			return mix(color, fogColor, 1.0 - exp(-distanceFromStart * fogScaling));
		}
	`;
}



function getRaymarchGlsl({
	getGeodesicGlsl,
	stepFactor,
	overstepFactor
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

			float omega = ${getFloatGlsl(overstepFactor)};
			float stepLength = 0.0;
			float previousRadius = 0.0;
			
			for (int iteration = 0; iteration < maxMarches; iteration++)
			{
				pos = ${getGeodesicGlsl("rayOrigin", "rayDirectionVec")};
				
				distanceToScene = distanceEstimator(pos);
				
				// Keinert et al: enhanced sphere tracing. Step by omega * DE (at the end of the loop)
				// but not if the spheres around the landing point and the starting point don't intersect,
				// since then we could have stepped all the way through the object.
				if (omega > 1.0 && distanceToScene + previousRadius < stepLength)
				{
					t += previousRadius * ${getFloatGlsl(stepFactor)} - stepLength;
					previousRadius = 0.0;
					omega = 1.0;
					continue;
				}

				epsilon = max(t * epsilonScaling, minEpsilon);
				
				if (distanceToScene < epsilon || t > clipDistance)
				{
					finalIteration = iteration;
					return;
				}
				
				previousRadius = distanceToScene;
				stepLength = omega * distanceToScene * ${getFloatGlsl(stepFactor)};
				t += stepLength;
			}
			
			// Ensure the catch in main short-circuits to black.
			t = clipDistance * 2.0;
		}
	`;
}



function getMainFunctionGlsl({
	useFor3DPrinting,
	includeDepthData,
	useBloom,
	useShadows,
	useReflections,
	surfaceNormalEpsilonFactor,
}) {
	if (useFor3DPrinting)
	{
		return /* glsl */`${""}
			void main(void)
			{
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);

				if (distanceEstimator(vec3(uv.x, uv.y, uvCenter.x) * uvScale) < 0.0015)
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

	const reflectionClippedColor = useBloom
		? "mix(fogColor, vec3(1.0), computeBloom(reflectedDirection))"
		: "fogColor";

	const reflectionGlsl = useReflections ? /* glsl */`
		vec3 reflectionStartPos = pos + surfaceNormal * epsilon * 10.0;
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
			reflectionColor = ${reflectionClippedColor};
		}

		else
		{		
			// Using distanceToScene / 2 here means we never step inside the object
			// which helps to prevent banding.
			float gradientMagnitude;
			vec3 reflectionSurfaceNormal = getSurfaceNormal(reflectionPos, reflectionEpsilon * 0.5, gradientMagnitude);
			reflectionPos += (reflectionEpsilon - reflectionDistanceToScene) * reflectionSurfaceNormal;

			vec3 reflectionLightDirection = normalize(lightPos - reflectionPos);

			// Run shadows if necessary.
			${useShadows ? "float reflectionShadowIntensity = computeShadowIntensity(reflectionPos, reflectionLightDirection, reflectionEpsilon);" : ""}

			reflectionColor = computeShading(
				reflectionPos,
				reflectionLightDirection,
				reflectionSurfaceNormal,
				// The extra factor of 2 makes reflections fade before objects do, which
				// keeps distance objects from being noisy.
				(distance(reflectionPos, reflectionStartPos) + distanceFromStart) * 2.0,
				1.0 // No ambient occlusion
				${useShadows ? ", reflectionShadowIntensity" : ""}
			);
		}
	` : "";

	return /* glsl */`${""}
		void main(void)
		{
			vec3 rayDirectionEye = vec3(
				((uvScale * uv.x + uvCenter.x) + projectionMatrix[2][0]) / projectionMatrix[0][0],
				((uvScale * uv.y + uvCenter.y) + projectionMatrix[2][1]) / projectionMatrix[1][1],
				-1.0
			);

			vec3 rayDirectionVec = normalize(mat3(cameraToWorld) * rayDirectionEye);

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

			
			float gradientMagnitude;

			// Making the step size *larger* than epsilon is what
			// actually prevents brightness banding on flat surfaces.
			vec3 surfaceNormal = getSurfaceNormal(pos, epsilon * ${getFloatGlsl(surfaceNormalEpsilonFactor)}, gradientMagnitude);

			vec3 lightDirection = normalize(lightPos - pos);

			// Run shadows if necessary.
			${useShadows ? "float shadowIntensity = computeShadowIntensity(pos, lightDirection, epsilon);" : ""}

			float ambientOcclusion = computeAmbientOcclusion(pos, surfaceNormal, gradientMagnitude, t);

			float distanceFromStart = distance(pos, rayOrigin);

			vec3 color = computeShading(
				pos,
				lightDirection,
				surfaceNormal,
				distanceFromStart,
				ambientOcclusion
				${useShadows ? ", shadowIntensity" : ""}
			)
				// This final factor darkens the color if it's within 8 steps of being terminated
				// for too many marches, which keeps complicated objects from having sharp black
				// bands around them.
				* clamp(1.0 - (float(iteration) - float(maxMarches) + 8.0) / 8.0, 0.0, 1.0);

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
	useGradientCorrectedOcclusion,
	oppositeLightBrightness,
	ambientLight,
	useBloom,
	bloomPower,
	stepFactor,
	overstepFactor,
	surfaceNormalEpsilonFactor,
	useFor3DPrinting,
	
	aoSamples,
	aoStrength,

	uniformsGlsl,
	lightPos,
	lightBrightness,
	clipDistance,
	maxMarches,
	maxShadowMarches,
	fogColor,
	fogScaling,
}) {
	const computeShadowIntensityGlsl = getComputeShadowIntensityGlsl({
		useShadows,
		useSoftShadows,
		getGeodesicGlsl,
		stepFactor
	});

	const computeShadingGlsl = getComputeShadingGlsl({
		useOppositeLight,
		oppositeLightBrightness,
		ambientLight,
		useShadows,
		useGradientCorrectedOcclusion,
	});

	const raymarchGlsl = getRaymarchGlsl({
		getGeodesicGlsl,
		stepFactor,
		overstepFactor,
	});

	const mainFunctionGlsl = getMainFunctionGlsl({
		useFor3DPrinting,
		includeDepthData,
		useBloom,
		useShadows,
		useReflections,
		surfaceNormalEpsilonFactor,
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
		const vec3 fogColor = ${getVectorGlsl(fogColor)};
		const float fogScaling = ${getFloatGlsl(fogScaling)};
		const float maxShadowAmount = 0.5;

		const int aoSamples = ${aoSamples};
		const float aoStrength = ${getFloatGlsl(aoStrength)};

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
		
		
		
		vec3 getSurfaceNormal(vec3 pos, float epsilon, out float gradientMagnitude)
		{
			vec2 e = vec2(1.0, -1.0) * epsilon;

			vec3 gradient = e.xyy * distanceEstimator(pos + e.xyy)
				+ e.yyx * distanceEstimator(pos + e.yyx)
				+ e.yxy * distanceEstimator(pos + e.yxy)
				+ e.xxx * distanceEstimator(pos + e.xxx);

			// The four tetrahedral offsets satisfy sum(eᵢ eᵢᵀ) = 4ε²I, so the sum above is exactly
			// 4ε² times the gradient -- no extra estimator calls needed to recover its magnitude.
			gradientMagnitude = length(gradient) / (4.0 * epsilon * epsilon);

			return normalize(gradient);
		}

		${computeBloomGlsl}

		${computeShadowIntensityGlsl}
		
		${computeShadingGlsl}

		${raymarchGlsl}
		
		${mainFunctionGlsl}
	`;

	return shader;
}



export function createConeMarchingShader({
	distanceEstimatorGlsl,
	addGlsl,

	stepFactor,
	overstepFactor,

	uniformsGlsl,
	clipDistance,
	maxMarches,

	// The side length of the square of pixels each pixel here is responsible for.
	// For example, a scale of 2 means each pixel covers a 2x2 block.
	coneMarchingScale
}) {
	const raymarchGlsl = /* glsl */`
		void raymarch(
			vec3 rayOrigin,
			vec3 rayDirectionVec,
			out float t,
		) {
			t = 0.0;
			float epsilon;
			vec3 pos;

			// float omega = ${getFloatGlsl(overstepFactor)};
			// float stepLength = 0.0;
			// float previousRadius = 0.0;
			
			for (int iteration = 0; iteration < maxMarches; iteration++)
			{
				// Custom geodesics are not supportred for cone marching.
				pos = rayOrigin + t * rayDirectionVec;
				
				distanceToScene = distanceEstimator(pos);
				
				// // Keinert et al: enhanced sphere tracing. Step by omega * DE (at the end of the loop)
				// // but not if the spheres around the landing point and the starting point don't intersect,
				// // since then we could have stepped all the way through the object.
				// if (omega > 1.0 && distanceToScene + previousRadius < stepLength)
				// {
				// 	t += previousRadius * ${getFloatGlsl(stepFactor)} - stepLength;
				// 	previousRadius = 0.0;
				// 	omega = 1.0;
				// 	continue;
				// }

				epsilon = max(t * pixelDiagonalRadius * ${getFloatGlsl(coneMarchingScale)}, minEpsilon);
				
				if (distanceToScene < epsilon || t > clipDistance)
				{
					finalIteration = iteration;
					return;
				}
				
				// previousRadius = distanceToScene;
				// stepLength = omega * distanceToScene * ${getFloatGlsl(stepFactor)};
				// t += stepLength;

				t += distanceToScene * ${getFloatGlsl(stepFactor)};
			}
			
			// Ensure the catch in main short-circuits to black.
			t = clipDistance * 2.0;
		}
	`;

	const mainFunctionGlsl = /* glsl */`
		void main(void)
		{
			vec3 rayDirectionEye = vec3(
				((uvScale * uv.x + uvCenter.x) + projectionMatrix[2][0]) / projectionMatrix[0][0],
				((uvScale * uv.y + uvCenter.y) + projectionMatrix[2][1]) / projectionMatrix[1][1],
				-1.0
			);

			vec3 rayDirectionVec = normalize(mat3(cameraToWorld) * rayDirectionEye);

			float t;

			raymarch(
				rayOrigin,
				rayDirectionVec,
				t,
			);

			gl_FragColor = vec4(t, 0.0, 0.0, 1.0);
		}
	`;

	const shader = /* glsl */`
		precision highp float;
		
		varying vec2 uv;

		${uniformsGlsl}
		
		const float clipDistance = ${getFloatGlsl(clipDistance)};
		const int maxMarches = ${maxMarches};

		${addGlsl}
		
		
		
		float distanceEstimator(vec3 pos)
		{
			${distanceEstimatorGlsl}
		}

		${raymarchGlsl}
		
		${mainFunctionGlsl}
	`;

	return shader;
}