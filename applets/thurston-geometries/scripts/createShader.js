export function createShader({
	maxMarches,
	maxT,
	stepFactor,
	uniformGlsl,
	dotProductGlsl,
	normalizeGlsl,
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
	finalTeleportationGlsl,
	updateTGlsl,
}) {
	return /* glsl */`
		precision highp float;
		
		varying vec2 uv;
		
		uniform float aspectRatioX;
		uniform float aspectRatioY;
		
		uniform vec4 cameraPos;
		uniform vec4 normalVec;
		uniform vec4 upVec;
		uniform vec4 rightVec;
		uniform vec4 forwardVec;
		
		uniform int resolution;
		
		const float pi = ${Math.PI};
		const float epsilon = 0.00001;
		const int maxMarches = ${maxMarches};
		const float maxT = ${maxT};
		const float stepFactor = ${stepFactor};
		const vec3 fogColor = vec3(0.0, 0.0, 0.0);
		const float fogScaling = .05;

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
		
		
		
		vec4 getSurfaceNormal(${posSignature}, float totalT)
		{
			float xStep1 = distanceEstimator(pos + vec4(epsilon, 0.0, 0.0, 0.0)${addFiberArgument}, totalT);
			float yStep1 = distanceEstimator(pos + vec4(0.0, epsilon, 0.0, 0.0)${addFiberArgument}, totalT);
			float zStep1 = distanceEstimator(pos + vec4(0.0, 0.0, epsilon, 0.0)${addFiberArgument}, totalT);
			float wStep1 = distanceEstimator(pos + vec4(0.0, 0.0, 0.0, epsilon)${addFiberArgument}, totalT);
			
			float xStep2 = distanceEstimator(pos - vec4(epsilon, 0.0, 0.0, 0.0)${addFiberArgument}, totalT);
			float yStep2 = distanceEstimator(pos - vec4(0.0, epsilon, 0.0, 0.0)${addFiberArgument}, totalT);
			float zStep2 = distanceEstimator(pos - vec4(0.0, 0.0, epsilon, 0.0)${addFiberArgument}, totalT);
			float wStep2 = distanceEstimator(pos - vec4(0.0, 0.0, 0.0, epsilon)${addFiberArgument}, totalT);
			
			return normalize(vec4(
				xStep1 - xStep2,
				yStep1 - yStep2,
				zStep1 - zStep2,
				wStep1 - wStep2
			));
		}
		
		
		
		vec3 computeShading(${posSignature}, int iteration, vec3 globalColor, float totalT)
		{
			vec4 surfaceNormal = getSurfaceNormal(pos${addFiberArgument}, totalT);
			
			${lightGlsl}

			//The last factor adds ambient occlusion.
			vec3 color = getColor(pos${addFiberArgument}, globalColor, totalT)
				* lightIntensity
				* max(
					1.0 - float(iteration) / ${ambientOcclusionDenominator},
					0.0)
				${doClipBrightening ? "* (1.0 + clipDistance / 5.0)" : ""};

			//Apply fog.
			${fogGlsl}
		}
		
		
		
		vec3 raymarch(float u, float v)
		{
			vec4 rayDirectionVec = geometryNormalize(
				forwardVec
				+ rightVec * u * aspectRatioX * fov
				+ upVec * v / aspectRatioY * fov
			);

			vec3 finalColor = fogColor;
			
			float t = 0.0;
			float totalT = 0.0;
			
			float lastTIncrease = 0.0;

			vec4 startPos = cameraPos;

			vec3 globalColor = vec3(0.0, 0.0, 0.0);

			${raymarchSetupGlsl ?? ""}
			
			for (int iteration = 0; iteration < maxMarches; iteration++)
			{
				${geodesicGlsl}
				
				float distanceToScene = distanceEstimator(pos${addFiberArgument}, totalT);
				
				if (distanceToScene < epsilon)
				{
					${finalTeleportationGlsl ?? ""}

					if (totalT == 0.0 && clipDistance > 0.0)
					{
						totalT = t;
					}
					
					return computeShading(pos${addFiberArgument}, iteration, globalColor, totalT);
				}

				${updateTGlsl}

				if (t > maxT || totalT > maxT)
				{
					return fogColor;
				}
			}
			
			return fogColor;
		}
		
		
		
		void main(void)
		{
			gl_FragColor = vec4(
				raymarch(uv.x, uv.y),
				1.0
			);
		}
	`;
}