import { showPage } from "../../../scripts/src/loadPage.js";
import { MengerSponge } from "./class.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	const applet = new MengerSponge({ canvas: $("#output-canvas") });

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-menger-sponge.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		maxValue: 1000,
		onInput: changeResolution
	});

	const scaleSlider = new Slider({
		element: $("#scale-slider"),
		name: "Scale",
		value: 3,
		min: 1.25,
		max: 3,
		snapPoints: [1.5, 2],
		onInput: onSliderInput
	});

	const separationSlider = new Slider({
		element: $("#separation-slider"),
		name: "Separation",
		value: 1,
		min: 5 / 9,
		max: 4 / 3,
		snapPoints: [6 / 9, 7 / 9, 1],
		onInput: onSliderInput
	});

	showPage();

	function changeResolution()
	{
		applet.changeResolution(resolutionInput.value);
	}

	function onSliderInput()
	{
		applet.scale = scaleSlider.value;
		applet.wilson.gl.uniform1f(applet.wilson.uniforms.scale, applet.scale);

		applet.separation = separationSlider.value;
		applet.wilson.gl.uniform1f(applet.wilson.uniforms.separation, applet.separation);

		applet.calculateVectors();

		applet.needNewFrame = true;
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
			const float lightBrightness = 3.0;
			
			uniform int imageSize;
			
			
			
			const float clipDistance = 1000.0;
			const int maxMarches = 256;
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .2;
			const int maxIterations = 2;
			
			uniform float scale;
			uniform float separation;
			

			
			float distanceEstimator(vec3 pos)
			{
				
		vec3 mutablePos = abs(pos);
		float maxAbsPos = max(max(mutablePos.x, mutablePos.y), mutablePos.z);
		float minAbsPos = min(min(mutablePos.x, mutablePos.y), mutablePos.z);
		float sumAbsPos = mutablePos.x + mutablePos.y + mutablePos.z;
		mutablePos = vec3(minAbsPos, sumAbsPos - minAbsPos - maxAbsPos, maxAbsPos);

		

		float totalDistance;
		vec3 totalScale = vec3(1.0, 1.0, 1.0);
		float effectiveScale;

		float invScale = 1.0 / scale;
		float cornerFactor = 2.0 * scale / (separation * scale - 1.0);
		float edgeFactor = 2.0 * scale / (scale - 1.0);

		vec3 cornerScaleCenter = (cornerFactor - 1.0) * vec3(
			(1.0 + separation * scale) / (1.0 + 2.0 * scale - separation * scale)
		);
		vec3 edgeScaleCenter = vec3(0.0, edgeFactor - 1.0, edgeFactor - 1.0);

		float cornerRadius = 0.5 * (separation - invScale);
		float cornerCenter = 0.5 * (separation + invScale);

		float edgeLongRadius = invScale - abs(separation - 1.0) * 0.1;
		float edgeShortRadius = 0.5 * (1.0 - invScale);
		float edgeCenter = 0.5 * (1.0 + invScale);

		for (int iteration = 0; iteration < maxIterations; iteration++)
		{
			float distanceToCornerX = abs(mutablePos.x - cornerCenter) - cornerRadius;
			float distanceToCornerY = abs(mutablePos.y - cornerCenter) - cornerRadius;
			float distanceToCornerZ = abs(mutablePos.z - cornerCenter) - cornerRadius;
			float distanceToCorner = max(distanceToCornerX, max(distanceToCornerY, distanceToCornerZ));
			
			float distanceToEdgeX = abs(mutablePos.x) - edgeLongRadius;
			float distanceToEdgeY = abs(mutablePos.y - edgeCenter) - edgeRadius;
			float distanceToEdgeZ = abs(mutablePos.z - edgeCenter) - edgeRadius;
			float distanceToEdge = max(distanceToEdgeX, max(distanceToEdgeY, distanceToEdgeZ));

			if (distanceToCorner < distanceToEdge)
			{
				totalDistance = distanceToCorner;

				if (distanceToCornerX > max(distanceToCornerY, distanceToCornerZ))
				{
					effectiveScale = totalScale.x;
				}

				else if (distanceToCornerY > max(distanceToCornerX, distanceToCornerZ))
				{
					effectiveScale = totalScale.y;
				}

				else
				{
					effectiveScale = totalScale.z;
				}

				// Scale all directions by 2s/(s-1) from (1, 1, 1) * separation.
				mutablePos = cornerFactor * mutablePos - cornerScaleCenter;

				totalScale *= cornerFactor;
			}

			else
			{
				totalDistance = distanceToEdge;
				
				if (distanceToEdgeX > max(distanceToEdgeY, distanceToEdgeZ))
				{
					effectiveScale = totalScale.x;
				}

				else if (distanceToEdgeY > max(distanceToEdgeX, distanceToEdgeZ))
				{
					effectiveScale = totalScale.y;
				}

				else
				{
					effectiveScale = totalScale.z;
				}

				// Scale x by s and y and z by 2s/(s-1) from (0, 1, 1). The second term is equal to
				mutablePos = vec3(scale, edgeFactor, edgeFactor) * mutablePos - edgeScaleCenter;

				totalScale *= vec3(scale, edgeFactor, edgeFactor);
			}

			

			mutablePos = abs(mutablePos);
			maxAbsPos = max(max(mutablePos.x, mutablePos.y), mutablePos.z);
			minAbsPos = min(min(mutablePos.x, mutablePos.y), mutablePos.z);
			sumAbsPos = mutablePos.x + mutablePos.y + mutablePos.z;
			mutablePos = vec3(minAbsPos, sumAbsPos - minAbsPos - maxAbsPos, maxAbsPos);
		}
		
		return totalDistance / effectiveScale;
	
			}
			
			
			
			vec3 getColor(vec3 pos)
			{
				
		vec3 mutablePos = abs(pos);
		float maxAbsPos = max(max(mutablePos.x, mutablePos.y), mutablePos.z);
		float minAbsPos = min(min(mutablePos.x, mutablePos.y), mutablePos.z);
		float sumAbsPos = mutablePos.x + mutablePos.y + mutablePos.z;
		mutablePos = vec3(minAbsPos, sumAbsPos - minAbsPos - maxAbsPos, maxAbsPos);

		vec3 color = vec3(0.25); float colorScale = 0.5;

		float totalDistance;
		vec3 totalScale = vec3(1.0, 1.0, 1.0);
		float effectiveScale;

		float invScale = 1.0 / scale;
		float cornerFactor = 2.0 * scale / (separation * scale - 1.0);
		float edgeFactor = 2.0 * scale / (scale - 1.0);

		vec3 cornerScaleCenter = (cornerFactor - 1.0) * vec3(
			(1.0 + separation * scale) / (1.0 + 2.0 * scale - separation * scale)
		);
		vec3 edgeScaleCenter = vec3(0.0, edgeFactor - 1.0, edgeFactor - 1.0);

		float cornerRadius = 0.5 * (separation - invScale);
		float cornerCenter = 0.5 * (separation + invScale);

		float edgeLongRadius = invScale - abs(separation - 1.0) * 0.1;
		float edgeShortRadius = 0.5 * (1.0 - invScale);
		float edgeCenter = 0.5 * (1.0 + invScale);

		for (int iteration = 0; iteration < maxIterations; iteration++)
		{
			float distanceToCornerX = abs(mutablePos.x - cornerCenter) - cornerRadius;
			float distanceToCornerY = abs(mutablePos.y - cornerCenter) - cornerRadius;
			float distanceToCornerZ = abs(mutablePos.z - cornerCenter) - cornerRadius;
			float distanceToCorner = max(distanceToCornerX, max(distanceToCornerY, distanceToCornerZ));
			
			float distanceToEdgeX = abs(mutablePos.x) - edgeLongRadius;
			float distanceToEdgeY = abs(mutablePos.y - edgeCenter) - edgeRadius;
			float distanceToEdgeZ = abs(mutablePos.z - edgeCenter) - edgeRadius;
			float distanceToEdge = max(distanceToEdgeX, max(distanceToEdgeY, distanceToEdgeZ));

			if (distanceToCorner < distanceToEdge)
			{
				totalDistance = distanceToCorner;

				if (distanceToCornerX > max(distanceToCornerY, distanceToCornerZ))
				{
					effectiveScale = totalScale.x;
				}

				else if (distanceToCornerY > max(distanceToCornerX, distanceToCornerZ))
				{
					effectiveScale = totalScale.y;
				}

				else
				{
					effectiveScale = totalScale.z;
				}

				// Scale all directions by 2s/(s-1) from (1, 1, 1) * separation.
				mutablePos = cornerFactor * mutablePos - cornerScaleCenter;

				totalScale *= cornerFactor;
			}

			else
			{
				totalDistance = distanceToEdge;
				
				if (distanceToEdgeX > max(distanceToEdgeY, distanceToEdgeZ))
				{
					effectiveScale = totalScale.x;
				}

				else if (distanceToEdgeY > max(distanceToEdgeX, distanceToEdgeZ))
				{
					effectiveScale = totalScale.y;
				}

				else
				{
					effectiveScale = totalScale.z;
				}

				// Scale x by s and y and z by 2s/(s-1) from (0, 1, 1). The second term is equal to
				mutablePos = vec3(scale, edgeFactor, edgeFactor) * mutablePos - edgeScaleCenter;

				totalScale *= vec3(scale, edgeFactor, edgeFactor);
			}

			
	vec3 colorAdd = abs(mutablePos / effectiveScale);
	color = normalize(color + colorAdd * colorScale);
	colorScale *= 0.5;


			mutablePos = abs(mutablePos);
			maxAbsPos = max(max(mutablePos.x, mutablePos.y), mutablePos.z);
			minAbsPos = min(min(mutablePos.x, mutablePos.y), mutablePos.z);
			sumAbsPos = mutablePos.x + mutablePos.y + mutablePos.z;
			mutablePos = vec3(minAbsPos, sumAbsPos - minAbsPos - maxAbsPos, maxAbsPos);
		}
		
		if (totalDistance < 0.0) {return vec3(1.0, 0.0, 0.0);} return abs(color);
	
			}
			
			
			
			vec3 getSurfaceNormal(vec3 pos)
			{
				float xStep1 = distanceEstimator(pos + vec3(.00001, 0.0, 0.0));
				float yStep1 = distanceEstimator(pos + vec3(0.0, .00001, 0.0));
				float zStep1 = distanceEstimator(pos + vec3(0.0, 0.0, .00001));
				
				float xStep2 = distanceEstimator(pos - vec3(.00001, 0.0, 0.0));
				float yStep2 = distanceEstimator(pos - vec3(0.0, .00001, 0.0));
				float zStep2 = distanceEstimator(pos - vec3(0.0, 0.0, .00001));
				
				return normalize(vec3(xStep1 - xStep2, yStep1 - yStep2, zStep1 - zStep2));
			}
			
			
			
			vec3 computeShading(vec3 pos, int iteration)
			{
				vec3 surfaceNormal = getSurfaceNormal(pos);
				
				vec3 lightDirection = normalize(lightPos - pos);
				
				float dotProduct = dot(surfaceNormal, lightDirection);
				
				float lightIntensity = lightBrightness * abs(dotProduct);
				
				//The last factor adds ambient occlusion.
				vec3 color = getColor(pos) * lightIntensity * max((1.0 - float(iteration) / float(64)), 0.0);
				
				
				
				//Apply fog.
				return mix(color, fogColor, 1.0 - exp(-distance(pos, cameraPos) * fogScaling));
			}
			
			
			
			vec3 raymarch(vec3 startPos)
			{
				vec3 rayDirectionVec = normalize(startPos - cameraPos) * .5;
				
				float epsilon;
				
				float t = 0.0;
				float oldT = 0.0;
				vec3 oldPos = startPos;
				
				// This lets us stop a march early if it passes throughthe plane between the corner and the edge.
				float boundaryX = 1.0 / scale;
				
				for (int iteration = 0; iteration < maxMarches; iteration++)
				{
					vec3 pos = startPos + t * rayDirectionVec;

					if (sign(pos.x - boundaryX) != sign(oldPos.x - boundaryX))
					{
						t = oldT + (boundaryX - oldPos.x) / (pos.x - oldPos.x) * (t - oldT) + epsilon;

						pos = startPos + t * rayDirectionVec;
					}
					
					float distance = distanceEstimator(pos);
					
					//This lowers the detail far away, which makes everything run nice and fast.
					epsilon = max(.0000006, 0.1 * scale * t / min(float(imageSize), 500.0));
					
					if (distance < epsilon)
					{
						return computeShading(pos, iteration);
					}
					
					else if (t > clipDistance)
					{
						return fogColor;
					}
					
					
					oldT = t;
					oldPos = pos;
					
					t += distance;
				}
				
				return fogColor;
			}
			
			
			
			void main(void)
			{
				vec3 finalColor = raymarch(imagePlaneCenterPos + rightVec * uv.x * aspectRatioX + upVec * uv.y / aspectRatioY);
				
				gl_FragColor = vec4(finalColor.xyz, 1.0);
			}
`