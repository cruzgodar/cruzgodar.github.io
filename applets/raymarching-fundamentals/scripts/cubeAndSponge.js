import { RaymarchingFundamentals } from "./class.js";
import { extrudedCubeDE, mengerSpongeDE } from "./distanceEstimators.js";

export class CubeAndSponge extends RaymarchingFundamentals
{
	sphereWeight = 0;

	extrudedCubeWeight = 1;
	extrudedCubeSeparation = 1.5;

	mengerSpongeWeight = 0;
	mengerSpongeScale = 3;

	constructor({
		canvas,
		useShadows = true,
		useReflections = false,
	}) {
		const computeShadowIntensityGlsl = useShadows ? /* glsl */`
			// Nearly identical to raymarching, but it only marches toward the light.
			float computeShadowIntensity(vec3 startPos, vec3 lightDirection)
			{
				//That factor of .9 is important -- without it, we're always stepping as far as possible, which results in artefacts and weirdness.
				vec3 rayDirectionVec = normalize(lightDirection) * .95;

				float softShadowFactor = 100.0;
				
				float t = 0.01;
				float epsilon = max(distanceToScene / 10.0, minEpsilon); 

				for (int iteration = 0; iteration < maxShadowMarches; iteration++)
				{
					vec3 pos = startPos + t * rayDirectionVec;
					
					float distanceToScene = distanceEstimator(pos);

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
		` : "";

		const computeReflectionGlsl = useReflections ? /* glsl */`
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

				float shadowIntensity = ${useShadows ? "computeShadowIntensity(pos, lightDirection)" : "1.0"};
				
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
				float epsilon = max(distanceToScene / 10.0, minEpsilon); 
				float t = .0001;
				
				for (int iteration = 0; iteration < maxReflectionMarches; iteration++)
				{
					vec3 pos = startPos + t * rayDirectionVec;
					
					float distanceToScene = distanceEstimator(pos);

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
		` : "";



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
			
			uniform float distanceToScene;
			
			const vec3 lightPos = vec3(50.0, 70.0, 100.0);
			// The minimum distance between the light direction and a sky direction.
			const float bloomPower = 0.11;

			const float lightBrightness = 1.0;
			const float maxShadowAmount = .5;
			uniform int imageSize;
			uniform float objectRotation;
			uniform float objectFloat;

			const float modPosAmount = 1.0;
			const float showRoomsAmount = 1.0;
			const float showSphereAmount = 1.0;

			uniform float sphereWeight;
			uniform float extrudedCubeSeparation;
			uniform float extrudedCubeWeight;
			uniform float mengerSpongeWeight;
			uniform float mengerSpongeScale;
			
			const float clipDistance = 1000.0;
			const int maxMarches = 256;
			const int maxShadowMarches = 128;
			const int maxReflectionMarches = 256;
			const vec3 fogColor = vec3(0.6, 0.73, 0.87);
			const float fogScaling = .05;

			const float minEpsilon = .0000006;

			float rand(vec2 co)
			{
				return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
			}
			
			float distanceEstimatorGround(vec3 pos)
			{
				return abs(pos.z);
			}

			${extrudedCubeDE[0]}
			${mengerSpongeDE[0]}

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
				
				if (mengerSpongeWeight > 0.0)
				{
					distanceObject += mengerSpongeWeight * distanceEstimatorMengerSponge(rotatedPos);
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
			${mengerSpongeDE[1]}

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

				if (mengerSpongeWeight > 0.0)
				{
					color += mengerSpongeWeight * getColorMengerSponge(rotatedPos);
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

			${computeShadowIntensityGlsl}

			${computeReflectionGlsl}
			
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

				float shadowIntensity = ${useShadows ? "computeShadowIntensity(pos, lightDirection)" : "1.0"};
				
				//The last factor adds ambient occlusion.
				vec3 color = getColor(pos)
					* lightIntensity
					* shadowIntensity
					* max((1.0 - float(iteration) / float(maxMarches)), 0.0);

				vec3 reflectedDirection = reflect(normalize(pos - cameraPos) * .95, surfaceNormal);

				${useReflections ? `
					color = mix(
						color,
						computeReflection(pos, reflectedDirection, iteration),
						getReflectivity(pos)
					);
				` : ""}
				
				//Apply fog.
				return mix(color, fogColor, 1.0 - exp(-distance(pos, cameraPos) * fogScaling));
			}


			
			vec3 raymarch(vec3 startPos)
			{
				//That factor of .9 is important -- without it, we're always stepping as far as possible, which results in artefacts and weirdness.
				vec3 rayDirectionVec = normalize(startPos - cameraPos) * .95;
				
				float epsilon = max(distanceToScene / 10.0, minEpsilon); 
				float t = 0.0;
				
				for (int iteration = 0; iteration < maxMarches; iteration++)
				{
					vec3 pos = cameraPos + t * rayDirectionVec;
					
					float distanceToScene = distanceEstimator(pos);
					
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
				"sphereWeight",

				"extrudedCubeSeparation",
				"extrudedCubeWeight",

				"mengerSpongeWeight",
				"mengerSpongeScale",
			]
		});

		this.wilson.gl.uniform1f(this.wilson.uniforms.sphereWeight, this.sphereWeight);

		this.wilson.gl.uniform1f(this.wilson.uniforms.extrudedCubeWeight, this.extrudedCubeWeight);
		this.wilson.gl.uniform1f(
			this.wilson.uniforms.extrudedCubeSeparation,
			this.extrudedCubeSeparation
		);

		this.wilson.gl.uniform1f(this.wilson.uniforms.mengerSpongeWeight, this.mengerSpongeWeight);
		this.wilson.gl.uniform1f(this.wilson.uniforms.mengerSpongeScale, this.mengerSpongeScale);
	}

	distanceEstimator(x, y, z)
	{
		return this.extrudedCubeWeight * this.distanceEstimatorExtrudedCube(x, y, z)
			+ this.mengerSpongeWeight * this.distanceEstimatorMengerSponge(x, y, z);
	}

	distanceEstimatorExtrudedCube(x, y, z)
	{
		const scaleCenter = (this.extrudedCubeScale + 1)
			/ (this.extrudedCubeScale - 1) * this.extrudedCubeSeparation;

		let mutablePos = [
			Math.abs(x) * 3,
			Math.abs(y) * 3,
			Math.abs(z) * 3 - 2.5
		];

		let totalDistance = Math.max(
			Math.max(mutablePos[0], mutablePos[1]),
			mutablePos[2]
		) - 1;

		for (let iteration = 0; iteration < this.iterations; iteration++)
		{
			if (mutablePos[0] > Math.max(mutablePos[1], mutablePos[2]))
			{
				mutablePos = [
					this.extrudedCubeScale * mutablePos[0]
						- (this.extrudedCubeScale - 1) * scaleCenter,
					this.extrudedCubeScale * mutablePos[1],
					this.extrudedCubeScale * mutablePos[2]
				];
			}

			else if (mutablePos[1] > Math.max(mutablePos[0], mutablePos[2]))
			{
				mutablePos = [
					this.extrudedCubeScale * mutablePos[0],
					this.extrudedCubeScale * mutablePos[1]
						- (this.extrudedCubeScale - 1) * scaleCenter,
					this.extrudedCubeScale * mutablePos[2]
				];
			}

			else
			{
				mutablePos = [
					this.extrudedCubeScale * mutablePos[0],
					this.extrudedCubeScale * mutablePos[1],
					this.extrudedCubeScale * mutablePos[2]
						- (this.extrudedCubeScale - 1) * scaleCenter
				];
			}

			mutablePos = [
				Math.abs(mutablePos[0]),
				Math.abs(mutablePos[1]),
				Math.abs(mutablePos[2])
			];

			totalDistance = Math.min(
				totalDistance,
				(Math.max(Math.max(mutablePos[0], mutablePos[1]), mutablePos[2]) - 1)
					/ Math.pow(this.extrudedCubeScale, iteration + 1)
			);
		}
		
		return Math.abs(totalDistance) / 3;
	}

	distanceEstimatorMengerSponge(x, y, z)
	{
		let mutablePos = [
			Math.abs(x) * 3,
			Math.abs(y) * 3,
			Math.abs(z) * 3 - 2.5
		];

		let maxAbsPos = Math.max(Math.max(mutablePos[0], mutablePos[1]), mutablePos[2]);
		let minAbsPos = Math.min(Math.min(mutablePos[0], mutablePos[1]), mutablePos[2]);
		let sumAbsPos = mutablePos[0] + mutablePos[1] + mutablePos[2];
		mutablePos = [minAbsPos, sumAbsPos - minAbsPos - maxAbsPos, maxAbsPos];

		let totalDistance;
		const totalScale = [1, 1, 1];
		let effectiveScale;

		const invScale = 1 / this.mengerSpongeScale;
		const cornerFactor = 2 * this.mengerSpongeScale
			/ (1 * this.mengerSpongeScale - 1);
		const edgeFactor = 2 * this.mengerSpongeScale / (this.mengerSpongeScale - 1);

		const cornerScaleCenter = [
			(cornerFactor - 1) * (
				(1 + 1 * this.mengerSpongeScale) / (1 + 2 * this.mengerSpongeScale
				- 1 * this.mengerSpongeScale)
			),

			(cornerFactor - 1) * (
				(1 + 1 * this.mengerSpongeScale) / (1 + 2 * this.mengerSpongeScale
				- 1 * this.mengerSpongeScale)
			),

			(cornerFactor - 1) * (
				(1 + 1 * this.mengerSpongeScale) / (1 + 2 * this.mengerSpongeScale
				- 1 * this.mengerSpongeScale)
			)
		];
		
		const edgeScaleCenter = [0, edgeFactor - 1, edgeFactor - 1];

		const cornerRadius = 0.5 * (1 - invScale);
		const cornerCenter = 0.5 * (1 + invScale);

		const edgeRadius = 0.5 * (1 - invScale);
		const edgeCenter = 0.5 * (1 + invScale);

		for (let iteration = 0; iteration < 16; iteration++)
		{
			const distanceToCornerX = Math.abs(mutablePos[0] - cornerCenter) - cornerRadius;
			const distanceToCornerY = Math.abs(mutablePos[1] - cornerCenter) - cornerRadius;
			const distanceToCornerZ = Math.abs(mutablePos[2] - cornerCenter) - cornerRadius;
			const distanceToCorner = Math.max(
				distanceToCornerX,
				Math.max(distanceToCornerY, distanceToCornerZ)
			);
			
			const distanceToEdgeX = mutablePos[0] - invScale;
			const distanceToEdgeY = Math.abs(mutablePos[1] - edgeCenter) - edgeRadius;
			const distanceToEdgeZ = Math.abs(mutablePos[2] - edgeCenter) - edgeRadius;
			const distanceToEdge = Math.max(
				distanceToEdgeX,
				Math.max(distanceToEdgeY, distanceToEdgeZ)
			);

			if (distanceToCorner < distanceToEdge)
			{
				totalDistance = distanceToCorner;

				if (distanceToCornerX > Math.max(distanceToCornerY, distanceToCornerZ))
				{
					effectiveScale = totalScale[0];
				}

				else if (distanceToCornerY > Math.max(distanceToCornerX, distanceToCornerZ))
				{
					effectiveScale = totalScale[1];
				}

				else
				{
					effectiveScale = totalScale[2];
				}

				// Scale all directions by 2s/(s-1) from (1, 1, 1) * separation.
				mutablePos = [
					cornerFactor * mutablePos[0] - cornerScaleCenter[0],
					cornerFactor * mutablePos[1] - cornerScaleCenter[1],
					cornerFactor * mutablePos[2] - cornerScaleCenter[2]
				];

				totalScale[0] *= cornerFactor;
				totalScale[1] *= cornerFactor;
				totalScale[2] *= cornerFactor;
			}

			else
			{
				totalDistance = distanceToEdge;
				
				if (distanceToEdgeX > Math.max(distanceToEdgeY, distanceToEdgeZ))
				{
					effectiveScale = totalScale[0];
				}

				else if (distanceToEdgeY > Math.max(distanceToEdgeX, distanceToEdgeZ))
				{
					effectiveScale = totalScale[1];
				}

				else
				{
					effectiveScale = totalScale[2];
				}

				mutablePos = [
					this.mengerSpongeScale * mutablePos[0] - edgeScaleCenter[0],
					edgeFactor * mutablePos[1] - edgeScaleCenter[1],
					edgeFactor * mutablePos[2] - edgeScaleCenter[2]
				];

				totalScale[0] *= this.mengerSpongeScale;
				totalScale[1] *= edgeFactor;
				totalScale[2] *= edgeFactor;
			}

			mutablePos = [
				Math.abs(mutablePos[0]),
				Math.abs(mutablePos[1]),
				Math.abs(mutablePos[2])
			];

			maxAbsPos = Math.max(Math.max(mutablePos[0], mutablePos[1]), mutablePos[2]);
			minAbsPos = Math.min(Math.min(mutablePos[0], mutablePos[1]), mutablePos[2]);
			sumAbsPos = mutablePos[0] + mutablePos[1] + mutablePos[2];
			mutablePos = [minAbsPos, sumAbsPos - minAbsPos - maxAbsPos, maxAbsPos];
		}
		
		return Math.abs(totalDistance) / effectiveScale * 0.333333;
	}
}