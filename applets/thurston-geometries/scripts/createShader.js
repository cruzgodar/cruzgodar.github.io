
export function createShader({
	maxMarches,
	maxT,
	stepFactor,
	uniformGlsl,
	dotProductGlsl,
	normalizeGlsl,
	getNormalVecGlsl,
	functionGlsl,
	posSignature,
	distanceEstimatorGlsl,
	getColorGlsl,
	addFiberArgument,
	lightGlsl,
	ambientOcclusionDenominator,
	doClipBrightening,
	fogGlsl,
	raymarchSetupGlsl,
	geodesicGlsl,
	correctPosGlsl,
	finalTeleportationGlsl,
	updateTGlsl,

	useReflections = false,
	antialiasing = false,
}) {
	const computeReflectionGlsl = useReflections ? /* glsl */`
		vec3 computeShadingWithoutReflection(
			${posSignature},
			float correctionDistance,
			int iteration,
			vec3 globalColor,
			float totalT
		) {
			vec4 surfaceNormal = getSurfaceNormal(
				pos${addFiberArgument},
				totalT
			);

			${correctPosGlsl}
			
			${lightGlsl}

			vec3 color = getColor(pos${addFiberArgument}, globalColor, totalT)
				* lightIntensity
				* max(
					1.0 - float(iteration) / ${ambientOcclusionDenominator},
					0.0)
				${doClipBrightening ? "* (1.0 + clipDistance / 5.0)" : ""};
			
			${fogGlsl}
		}

		vec3 computeReflection(
			vec4 startPos,
			vec4 rayDirectionVec,
			vec3 globalColor,
			int startIteration,
			float startT
		) {
			vec4 manifoldNormal = getNormalVec(startPos);

			rayDirectionVec = stepFactor * normalize(
				rayDirectionVec - dot(rayDirectionVec, manifoldNormal) * manifoldNormal
			);

			vec3 finalColor = fogColor;
			
			float t = 0.0;
			float totalT = 0.0;
			
			float lastTIncrease = 0.0;

			${raymarchSetupGlsl ?? ""}
			
			for (int iteration = 0; iteration < maxMarches; iteration++)
			{
				${geodesicGlsl}
				
				float distanceToScene = distanceEstimator(
					pos${addFiberArgument},
					totalT
				);
				
				if (distanceToScene < epsilon)
				{
					${finalTeleportationGlsl ?? ""}

					if (totalT == 0.0 && clipDistance > 0.0)
					{
						totalT = t;
					}
					
					return computeShadingWithoutReflection(
						pos${addFiberArgument},
						distanceToScene - 2.0 * epsilon,
						iteration + startIteration,
						globalColor,
						totalT + startT
					);
				}

				${updateTGlsl}

				if (t > maxT || totalT > maxT)
				{
					return fogColor;
				}
			}
			
			return fogColor;
		}
	` : "";

	const mainFunctionGlsl = antialiasing
		? /* glsl */`${""}
			vec3 raymarchHelper(vec2 uvAdjust)
			{
				return raymarch(
					geometryNormalize(
						forwardVec
						+ rightVec * (uvScale * (uv.x + uvAdjust.x) + uvCenter.x) * aspectRatioX * fov
						+ upVec * (uvScale * (uv.y + uvAdjust.y) + uvCenter.y) / aspectRatioY * fov
					)
				);
			}
			
			void main(void)
			{
				vec2 texCoord = (uv + vec2(1.0)) * 0.5;
				vec4 sample = texture2D(uTexture, texCoord);
				float stepSize = 2.0 / (float(resolution * 3));
				
				if (sample.w > 0.1)
				{
					vec3 aaSample = (
						sample.xyz	
						+ raymarchHelper(vec2(stepSize, 0.0))
						+ raymarchHelper(vec2(0.0, stepSize))
						+ raymarchHelper(vec2(-stepSize, 0.0))
						+ raymarchHelper(vec2(0.0, -stepSize))
					) / 5.0;
					
					gl_FragColor = vec4(aaSample, 1.0);
					return;
				}

				gl_FragColor = vec4(sample.xyz, 1.0);
			}
		`
		: /* glsl */`${""}
			void main(void)
			{
				gl_FragColor = vec4(
					raymarch(
						geometryNormalize(
							forwardVec
							+ rightVec * (uvScale * uv.x + uvCenter.x) * aspectRatioX * fov
							+ upVec * (uvScale * uv.y + uvCenter.y) / aspectRatioY * fov
						)
					),
					1.0
				);
			}
		`;
	
	const shader = /* glsl */`
		precision highp float;
		
		varying vec2 uv;

		uniform float uvScale;
		uniform vec2 uvCenter;
		
		uniform float aspectRatioX;
		uniform float aspectRatioY;
		
		uniform vec4 cameraPos;
		uniform vec4 normalVec;
		uniform vec4 upVec;
		uniform vec4 rightVec;
		uniform vec4 forwardVec;
		
		uniform int resolution;

		${antialiasing ? /* glsl */`
			uniform sampler2D uTexture;
		` : ""}
		
		const float pi = ${Math.PI};
		const float epsilon = 0.00005;
		const int maxMarches = ${maxMarches};
		const float maxT = ${maxT};
		const float stepFactor = ${stepFactor};
		const vec3 fogColor = vec3(0.0, 0.0, 0.0);
		const float fogScaling = .05;
		const float reflectivity = .2;

		uniform float clipDistance;
		uniform float fov;

		${uniformGlsl ?? ""}

		float geometryDot(vec4 v, vec4 w)
		{
			${dotProductGlsl}
		}

		vec4 geometryNormalize(vec4 dir)
		{
			${normalizeGlsl}
		}

		${functionGlsl ?? ""}



		float getBanding(float amount, float numBands)
		{
			return 1.0 - floor(mod(abs(amount) * numBands, 2.0)) * 0.5;
		}

		vec3 hsv2rgb(vec3 c)
		{
			vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
			vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
			return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
		}
		
		
		
		float distanceEstimator(${posSignature}, float totalT)
		{
			${distanceEstimatorGlsl}
		}
		
		vec3 getColor(${posSignature}, vec3 globalColor, float totalT)
		{
			${getColorGlsl}
		}
		
		

		vec4 getNormalVec(${posSignature})
		{
			${getNormalVecGlsl}
		}
		
		vec4 getSurfaceNormal(${posSignature}, float totalT)
		{
			float xStep1 = distanceEstimator(
				pos + vec4(epsilon, 0.0, 0.0, 0.0)${addFiberArgument},
				totalT
			);
			float yStep1 = distanceEstimator(
				pos + vec4(0.0, epsilon, 0.0, 0.0)${addFiberArgument},
				totalT
			);
			float zStep1 = distanceEstimator(
				pos + vec4(0.0, 0.0, epsilon, 0.0)${addFiberArgument},
				totalT
			);
			float wStep1 = distanceEstimator(
				pos + vec4(0.0, 0.0, 0.0, epsilon)${addFiberArgument},
				totalT
			);
			
			float xStep2 = distanceEstimator(
				pos - vec4(epsilon, 0.0, 0.0, 0.0)${addFiberArgument},
				totalT
			);
			float yStep2 = distanceEstimator(
				pos - vec4(0.0, epsilon, 0.0, 0.0)${addFiberArgument},
				totalT
			);
			float zStep2 = distanceEstimator(
				pos - vec4(0.0, 0.0, epsilon, 0.0)${addFiberArgument},
				totalT
			);
			float wStep2 = distanceEstimator(
				pos - vec4(0.0, 0.0, 0.0, epsilon)${addFiberArgument},
				totalT
			);
			
			vec4 surfaceNormal = normalize(vec4(
				xStep1 - xStep2,
				yStep1 - yStep2,
				zStep1 - zStep2,
				wStep1 - wStep2
			));

			vec4 manifoldNormal = getNormalVec(pos${addFiberArgument});

			return normalize(
				surfaceNormal - dot(surfaceNormal, manifoldNormal) * manifoldNormal
			);
		}



		${computeReflectionGlsl}
		
		
		
		vec3 computeShading(
			${posSignature},
			// This is the direction in which the ray is marching
			// at the moment of impact.
			vec4 rayDirectionVec,
			float correctionDistance,
			int iteration,
			vec3 globalColor,
			float totalT
		) {
			vec4 surfaceNormal = getSurfaceNormal(pos${addFiberArgument}, totalT);

			${correctPosGlsl}
			
			${lightGlsl}

			//The last factor adds ambient occlusion.
			vec3 color = getColor(pos${addFiberArgument}, globalColor, totalT)
				* lightIntensity
				* max(
					1.0 - float(iteration) / ${ambientOcclusionDenominator},
					0.0
				)
				${doClipBrightening ? "* (1.0 + clipDistance / 5.0)" : ""};

			${useReflections ? /* glsl */`
				vec4 reflectedDirection = reflect(
					rayDirectionVec,
					surfaceNormal
				);

				color = mix(
					color,
					computeReflection(
						pos${addFiberArgument},
						reflectedDirection,
						globalColor,
						iteration,
						totalT
					),
					reflectivity
				);
			` : ""}

			${fogGlsl}
		}
		
		
		
		vec3 raymarch(vec4 rayDirectionVec)
		{
			vec3 finalColor = fogColor;
			
			float t = 0.0;
			float totalT = 0.0;
			
			float lastTIncrease = 0.0;

			vec4 startPos = cameraPos;
			vec4 lastPos = cameraPos;

			vec3 globalColor = vec3(0.0, 0.0, 0.0);

			${raymarchSetupGlsl ?? ""}
			
			for (int iteration = 0; iteration < maxMarches; iteration++)
			{
				${geodesicGlsl}
				
				float distanceToScene = distanceEstimator(
					pos${addFiberArgument},
					totalT
				);
				
				if (distanceToScene < epsilon)
				{
					${finalTeleportationGlsl ?? ""}

					if (totalT == 0.0 && clipDistance > 0.0)
					{
						totalT = t;
					}
					
					return computeShading(
						pos${addFiberArgument},
						normalize(pos - lastPos),
						distanceToScene - 2.0 * epsilon,
						iteration,
						globalColor,
						totalT
					);
				}

				${updateTGlsl}

				lastPos = pos;

				if (t > maxT || totalT > maxT)
				{
					return fogColor;
				}
			}
			
			return fogColor;
		}
		
		
		
		${mainFunctionGlsl}
	`;

	if (window.DEBUG)
	{
		console.log(shader);
	}

	return shader;
}