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

					float epsilon = max(t / (resolution * epsilonScaling), minEpsilon);

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

					float epsilon = max(t / (resolution * epsilonScaling), minEpsilon);

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
}) {
	return /* glsl */`
		vec3 computeShading(
			vec3 pos,
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


			
			//Apply fog. We can't just use t here since curved light has nonlinear geodesics.
			return mix(color, fogColor, 1.0 - exp(-distance(pos, rayOrigin) * fogScaling));
		}
	`;
}



function getRaymarchGlsl({
	getGeodesicGlsl,
	stepFactor
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

			// Testing; will specify per-applet later
			float omega = 1.5;
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

				epsilon = max(t / (resolution * epsilonScaling), minEpsilon);
				
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

	const reflectionClippedColor = useBloom
		? "mix(fogColor, vec3(1.0), computeBloom(reflectedDirection))"
		: "fogColor";

	const reflectionGlsl = useReflections ? /* glsl */`
		vec3 reflectionStartPos = pos + surfaceNormal * epsilon * 5.0;
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
			vec3 reflectionSurfaceNormal = getSurfaceNormal(reflectionPos, reflectionEpsilon * 0.5);
			reflectionPos += (reflectionEpsilon - reflectionDistanceToScene) * reflectionSurfaceNormal;

			vec3 reflectionLightDirection = normalize(lightPos - reflectionPos);

			// Run shadows if necessary.
			${useShadows ? "float reflectionShadowIntensity = computeShadowIntensity(reflectionPos, reflectionLightDirection, reflectionEpsilon);" : ""}

			reflectionColor = computeShading(
				reflectionPos,
				reflectionIteration + iteration,
				reflectionLightDirection,
				reflectionSurfaceNormal
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
			vec3 surfaceNormal = getSurfaceNormal(pos, epsilon * 0.5);
			pos += (epsilon - distanceToScene) * surfaceNormal;

			vec3 lightDirection = normalize(lightPos - pos);

			// Run shadows if necessary.
			${useShadows ? "float shadowIntensity = computeShadowIntensity(pos, lightDirection, epsilon);" : ""}

			vec3 color = computeShading(
				pos,
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
	});

	const raymarchGlsl = getRaymarchGlsl({
		getGeodesicGlsl,
		stepFactor
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