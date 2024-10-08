import { showPage } from "../../../scripts/src/loadPage.js";
import { ExtrudedCube } from "./class.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const applet = new ExtrudedCube({ canvas: $("#output-canvas") });

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "an-extruded-cube.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		minValue: 100,
		maxValue: 1000,
		onInput: changeResolution
	});

	const iterationsSlider = new Slider({
		element: $("#iterations-slider"),
		name: "Iterations",
		value: 16,
		min: 1,
		max: 32,
		integer: true,
		onInput: onSliderInput
	});

	const scaleSlider = new Slider({
		element: $("#scale-slider"),
		name: "Scale",
		value: 3,
		min: 1.1,
		max: 4,
		snapPoints: [1.5, 2, 3],
		onInput: onSliderInput
	});

	const separationSlider = new Slider({
		element: $("#separation-slider"),
		name: "Separation",
		value: 1,
		min: 0.5,
		max: 2,
		snapPoints: [2 / 3, 1],
		onInput: onSliderInput
	});

	const shadowsCheckbox = new Checkbox({
		element: $("#shadows-checkbox"),
		name: "Shadows",
		onInput: onCheckboxInput
	});

	const reflectionsCheckbox = new Checkbox({
		element: $("#reflections-checkbox"),
		name: "Reflections",
		onInput: onCheckboxInput
	});

	showPage();

	function changeResolution()
	{
		applet.changeResolution(resolutionInput.value * siteSettings.resolutionMultiplier);
	}

	function onSliderInput()
	{
		applet.setUniform("iterations", iterationsSlider.value);
		applet.setUniform("scale", scaleSlider.value);
		applet.setUniform("separation", separationSlider.value);

		applet.calculateVectors();

		applet.needNewFrame = true;
	}

	function onCheckboxInput()
	{
		applet.useShadows = shadowsCheckbox.checked;
		applet.useReflections = reflectionsCheckbox.checked;
		applet.reloadShader();
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
			
			const float clipDistance = float(1000);
			const int maxMarches = 256;
			const int maxShadowMarches = 128;
			const int maxReflectionMarches = 256;
			const vec3 fogColor = vec3(0, 0, 0);
			const float fogScaling = 0.05;
			const float maxShadowAmount = 0.5;

			
			const int maxIterations = 32;
		
			
			
			
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

			float getReflectivity(vec3 pos)
			{
				return 0.5;
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
		

			

			
			vec3 computeShadingWithoutReflection(
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

				vec3 color = getColor(pos)
					* lightIntensity
					* max((1.0 - float(iteration) / float(maxMarches)), 0.0);

				
				
				//Apply fog.
				return mix(color, fogColor, 1.0 - exp(-distance(pos, cameraPos) * fogScaling));
			}

			// Unlike in raymarch(), startPos is replacing cameraPos, and rayDirectionVec is precomputed.
			vec3 computeReflection(vec3 startPos, vec3 rayDirectionVec, int startIteration)
			{
				float t = .0001;
				
				for (int iteration = 0; iteration < maxReflectionMarches; iteration++)
				{
					vec3 pos = startPos + t * rayDirectionVec;
					
					float distanceToScene = distanceEstimator(pos);

					if (distanceToScene < epsilon)
					{
						return computeShadingWithoutReflection(
							pos,
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

				vec3 color = getColor(pos)
					* lightIntensity
					* max((1.0 - float(iteration) / float(maxMarches)), 0.0);

				

				
					vec3 reflectedDirection = reflect(normalize(pos - cameraPos) * .95, surfaceNormal);

					color = mix(
						color,
						computeReflection(pos, reflectedDirection, iteration),
						getReflectivity(pos)
					);
				
				
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
			}
`