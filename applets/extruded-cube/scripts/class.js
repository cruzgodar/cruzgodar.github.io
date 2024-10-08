import { RaymarchApplet } from "/scripts/applets/raymarchApplet.js";

export class ExtrudedCube extends RaymarchApplet
{
	maxIterations = 16;

	cameraPos = [1.749, 1.75, 1.751];
	theta = 1.25 * Math.PI;
	phi = 2.1539;

	constructor({ canvas })
	{
		const distanceEstimatorGlsl = /* glsl */`
			float scaleCenter = (scale + 1.0) / (scale - 1.0) * separation;

			vec3 mutablePos = abs(pos);

			float totalDistance = (max(max(mutablePos.x, mutablePos.y), mutablePos.z) - 1.0);

			for (int iteration = 0; iteration < maxIterations; iteration++)
			{
				if (iteration == iterations)
				{
					break;
				}

				if (mutablePos.x > max(mutablePos.y, mutablePos.z))
				{
					mutablePos = scale * mutablePos - (scale - 1.0) * vec3(scaleCenter, 0.0, 0.0);
				}

				else if (mutablePos.y > max(mutablePos.x, mutablePos.z))
				{
					mutablePos = scale * mutablePos - (scale - 1.0) * vec3(0.0, scaleCenter, 0.0);
				}

				else
				{
					mutablePos = scale * mutablePos - (scale - 1.0) * vec3(0.0, 0.0, scaleCenter);
				}

				mutablePos = abs(mutablePos);

				totalDistance = min(
					totalDistance,
					(max(max(mutablePos.x, mutablePos.y), mutablePos.z) - 1.0)
						/ pow(scale, float(iteration + 1))
				);
			}
			
			return totalDistance;
		`;
			
		const getColorGlsl = /* glsl */`	
			vec3 color = vec3(0.25);

			float scaleCenter = (scale + 1.0) / (scale - 1.0) * separation;

			vec3 mutablePos = abs(pos);

			for (int iteration = 0; iteration < maxIterations; iteration++)
			{
				if (iteration == iterations)
				{
					break;
				}

				if (mutablePos.x > max(mutablePos.y, mutablePos.z))
				{
					mutablePos = scale * mutablePos - (scale - 1.0) * vec3(scaleCenter, 0.0, 0.0);

					color += vec3(0.0, 0.75, 1.0) * pow(2.0, -float(iteration + 1));
				}

				else if (mutablePos.y > max(mutablePos.x, mutablePos.z))
				{
					mutablePos = scale * mutablePos - (scale - 1.0) * vec3(0.0, scaleCenter, 0.0);

					color += vec3(0.75, 0.0, 1.0) * pow(2.0, -float(iteration + 1));
				}

				else
				{
					mutablePos = scale * mutablePos - (scale - 1.0) * vec3(0.0, 0.0, scaleCenter);

					color += vec3(0.0, 0.0, 1.0) * pow(2.0, -float(iteration + 1));
				}

				mutablePos = abs(mutablePos);
			}
			
			return color;
		`;

		const addGlsl = /* glsl */`
			const int maxIterations = 16;
		`;

		const uniforms = {
			iterations: ["int", 16],
			scale: ["float", 3],
			separation: ["float", 1],
		};

		super({
			canvas,
			distanceEstimatorGlsl,
			getColorGlsl,
			addGlsl,
			uniforms,
		});
	}

	distanceEstimator(x, y, z)
	{
		const scaleCenter = (this.uniforms.scale + 1)
			/ (this.uniforms.scale - 1) * this.uniforms.separation;

		let mutablePos = [
			Math.abs(x),
			Math.abs(y),
			Math.abs(z)
		];

		let totalDistance = Math.max(
			Math.max(mutablePos[0], mutablePos[1]),
			mutablePos[2]
		) - 1;

		for (let iteration = 0; iteration < this.maxIterations; iteration++)
		{
			if (mutablePos[0] > Math.max(mutablePos[1], mutablePos[2]))
			{
				mutablePos = [
					this.uniforms.scale * mutablePos[0] - (this.uniforms.scale - 1) * scaleCenter,
					this.uniforms.scale * mutablePos[1],
					this.uniforms.scale * mutablePos[2]
				];
			}

			else if (mutablePos[1] > Math.max(mutablePos[0], mutablePos[2]))
			{
				mutablePos = [
					this.uniforms.scale * mutablePos[0],
					this.uniforms.scale * mutablePos[1] - (this.uniforms.scale - 1) * scaleCenter,
					this.uniforms.scale * mutablePos[2]
				];
			}

			else
			{
				mutablePos = [
					this.uniforms.scale * mutablePos[0],
					this.uniforms.scale * mutablePos[1],
					this.uniforms.scale * mutablePos[2] - (this.uniforms.scale - 1) * scaleCenter
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
					/ Math.pow(this.uniforms.scale, iteration + 1)
			);
		}
		
		return Math.abs(totalDistance);
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
			uniform float epsilon;
			uniform int imageSize;

			
				uniform int iterations;
			

				uniform float scale;
			

				uniform float separation;
			
			
			const vec3 lightPos = vec3(50, 70, 100);
			const float lightBrightness = float(1);
			const float bloomPower = 0.11;
			
			const float minEpsilon = .0000006;
			const float clipDistance = float(1000);
			const int maxMarches = 256;
			const int maxShadowMarches = 128;
			const int maxReflectionMarches = 256;
			const vec3 fogColor = vec3(0, 0, 0);
			const float fogScaling = 0.05;

			
			
			
			
			float distanceEstimator(vec3 pos)
			{
				
			float scaleCenter = (scale + 1.0) / (scale - 1.0) * separation;

			vec3 mutablePos = abs(pos);

			float totalDistance = (max(max(mutablePos.x, mutablePos.y), mutablePos.z) - 1.0);

			for (int iteration = 0; iteration < maxIterations; iteration++)
			{
				if (iteration == iterations)
				{
					break;
				}

				if (mutablePos.x > max(mutablePos.y, mutablePos.z))
				{
					mutablePos = scale * mutablePos - (scale - 1.0) * vec3(scaleCenter, 0.0, 0.0);
				}

				else if (mutablePos.y > max(mutablePos.x, mutablePos.z))
				{
					mutablePos = scale * mutablePos - (scale - 1.0) * vec3(0.0, scaleCenter, 0.0);
				}

				else
				{
					mutablePos = scale * mutablePos - (scale - 1.0) * vec3(0.0, 0.0, scaleCenter);
				}

				mutablePos = abs(mutablePos);

				totalDistance = min(
					totalDistance,
					(max(max(mutablePos.x, mutablePos.y), mutablePos.z) - 1.0)
						/ pow(scale, float(iteration + 1))
				);
			}
			
			return totalDistance;
		
			}
			
			vec3 getColor(vec3 pos)
			{
					
			vec3 color = vec3(0.25);

			float scaleCenter = (scale + 1.0) / (scale - 1.0) * separation;

			vec3 mutablePos = abs(pos);

			for (int iteration = 0; iteration < maxIterations; iteration++)
			{
				if (iteration == iterations)
				{
					break;
				}

				if (mutablePos.x > max(mutablePos.y, mutablePos.z))
				{
					mutablePos = scale * mutablePos - (scale - 1.0) * vec3(scaleCenter, 0.0, 0.0);

					color += vec3(0.0, 0.75, 1.0) * pow(2.0, -float(iteration + 1));
				}

				else if (mutablePos.y > max(mutablePos.x, mutablePos.z))
				{
					mutablePos = scale * mutablePos - (scale - 1.0) * vec3(0.0, scaleCenter, 0.0);

					color += vec3(0.75, 0.0, 1.0) * pow(2.0, -float(iteration + 1));
				}

				else
				{
					mutablePos = scale * mutablePos - (scale - 1.0) * vec3(0.0, 0.0, scaleCenter);

					color += vec3(0.0, 0.0, 1.0) * pow(2.0, -float(iteration + 1));
				}

				mutablePos = abs(mutablePos);
			}
			
			return color;
		
			}

			
			
			
			
			vec3 getSurfaceNormal(vec3 pos)
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
		

			

			
			
			vec3 computeShading(
				vec3 pos,
				float correctionDistance,
				int iteration
			) {
				vec3 surfaceNormal = getSurfaceNormal(pos);

				// This corrects the position so that it's exactly on the surface (we probably marched a little bit inside).
				pos -= surfaceNormal * correctionDistance;
				
				vec3 lightDirection = normalize(lightPos - pos);
				
				float dotProduct = dot(surfaceNormal, lightDirection);
				
				float lightIntensity = max(
					lightBrightness * dotProduct,
					.25
				);

				float shadowIntensity = 1.0;
				
				//The last factor adds ambient occlusion.
				vec3 color = getColor(pos)
					* lightIntensity
					* shadowIntensity
					* max((1.0 - float(iteration) / float(maxMarches)), 0.0);

				vec3 reflectedDirection = reflect(normalize(pos - cameraPos) * .95, surfaceNormal);

				
				
				//Apply fog.
				return mix(color, fogColor, 1.0 - exp(-distance(pos, cameraPos) * fogScaling));
			}


			
			vec3 raymarch(vec3 startPos)
			{
				vec3 rayDirectionVec = normalize(startPos - cameraPos) * .95;
				
				float t = 0.0;
				
				for (int iteration = 0; iteration < maxMarches; iteration++)
				{
					vec3 pos = cameraPos + t * rayDirectionVec;
					
					float distanceToScene = distanceEstimator(pos);
					
					if (distanceToScene < epsilon)
					{
						return computeShading(
							pos,
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
			}`