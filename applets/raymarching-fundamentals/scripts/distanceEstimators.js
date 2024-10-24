export const roomSphereDE = [
	/* glsl */`
		float distanceEstimatorRoomSphere(vec3 pos)
		{
			vec3 modPos = mix(pos, mod(pos + vec3(1.0, 1.0, 0.0), 2.0) - vec3(1.0, 1.0, 0.0), modPosAmount); 
			float sphereDistance = length(modPos - vec3(0.0, 0.0, .833333)) - (-0.1 + .6 * showSphereAmount);

			modPos = mix(pos, mod(pos, 2.0), modPosAmount); 
			float roomDistance = showSphereAmount * 1.25 - length(modPos - vec3(1.0, 1.0, 1.0));

			return mix(sphereDistance, roomDistance, showRoomsAmount);
		}
	`,
	/* glsl */`
		vec3 getColorRoomSphere(vec3 pos)
		{
			return vec3(0.5, 0.0, 1.0);
		}
	`
];


export const extrudedCubeDE = [
	/* glsl */`
		float distanceEstimatorExtrudedCube(vec3 pos)
		{
			float scaleCenter = 2.0 * extrudedCubeSeparation;

			vec3 mutablePos = abs(pos * 3.0 - vec3(0.0, 0.0, 3.0));

			float totalDistance = (max(max(mutablePos.x, mutablePos.y), mutablePos.z) - 1.0);

			for (int iteration = 0; iteration < 16; iteration++)
			{
				if (mutablePos.x > max(mutablePos.y, mutablePos.z))
				{
					mutablePos = 3.0 * mutablePos - (3.0 - 1.0) * vec3(scaleCenter, 0.0, 0.0);
				}

				else if (mutablePos.y > max(mutablePos.x, mutablePos.z))
				{
					mutablePos = 3.0 * mutablePos - (3.0 - 1.0) * vec3(0.0, scaleCenter, 0.0);
				}

				else
				{
					mutablePos = 3.0 * mutablePos - (3.0 - 1.0) * vec3(0.0, 0.0, scaleCenter);
				}

				mutablePos = abs(mutablePos);

				totalDistance = min(
					totalDistance,
					(max(max(mutablePos.x, mutablePos.y), mutablePos.z) - 1.0)
						/ pow(3.0, float(iteration + 1))
				);
			}
			
			return totalDistance * 0.333333;
		}
	`,
	/* glsl */`
		vec3 getColorExtrudedCube(vec3 pos)
		{
			vec3 color = vec3(0.25);

			float scaleCenter = 2.0 * extrudedCubeSeparation;

			vec3 mutablePos = abs(pos * 3.0 - vec3(0.0, 0.0, 3.0));

			for (int iteration = 0; iteration < 16; iteration++)
			{
				if (mutablePos.x > max(mutablePos.y, mutablePos.z))
				{
					mutablePos = 3.0 * mutablePos - (3.0 - 1.0) * vec3(scaleCenter, 0.0, 0.0);

					color += vec3(0.0, 0.75, 1.0) * pow(2.0, -float(iteration + 1));
				}

				else if (mutablePos.y > max(mutablePos.x, mutablePos.z))
				{
					mutablePos = 3.0 * mutablePos - (3.0 - 1.0) * vec3(0.0, scaleCenter, 0.0);

					color += vec3(0.75, 0.0, 1.0) * pow(2.0, -float(iteration + 1));
				}

				else
				{
					mutablePos = 3.0 * mutablePos - (3.0 - 1.0) * vec3(0.0, 0.0, scaleCenter);

					color += vec3(0.0, 0.0, 1.0) * pow(2.0, -float(iteration + 1));
				}

				mutablePos = abs(mutablePos);
			}
			
			return color;
		}
	`
];



const changeColorGlsl = /* glsl */`
	vec3 colorAdd = abs(mutablePos / effectiveScale);
	color = normalize(color + colorAdd * colorScale);
	colorScale *= 0.5;
`;

function getMengerSpongeDE(useForGetColor = false)
{
	return /* glsl */`
		float separation = 1.0;
		float scale = mengerSpongeScale;

		vec3 mutablePos = abs(pos * 3.0 - vec3(0.0, 0.0, 2.5));
		float maxAbsPos = max(max(mutablePos.x, mutablePos.y), mutablePos.z);
		float minAbsPos = min(min(mutablePos.x, mutablePos.y), mutablePos.z);
		float sumAbsPos = mutablePos.x + mutablePos.y + mutablePos.z;
		mutablePos = vec3(minAbsPos, sumAbsPos - minAbsPos - maxAbsPos, maxAbsPos);

		${useForGetColor ? "vec3 color = vec3(0.25); float colorScale = 0.5;" : ""}

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

		float edgeLongRadius = invScale;
		float edgeShortRadius = 0.5 * (1.0 - invScale);
		float edgeCenter = 0.5 * (1.0 + invScale);

		for (int iteration = 0; iteration < 16; iteration++)
		{
			float distanceToCornerX = abs(mutablePos.x - cornerCenter) - cornerRadius;
			float distanceToCornerY = abs(mutablePos.y - cornerCenter) - cornerRadius;
			float distanceToCornerZ = abs(mutablePos.z - cornerCenter) - cornerRadius;
			float distanceToCorner = max(distanceToCornerX, max(distanceToCornerY, distanceToCornerZ));
			
			float distanceToEdgeX = abs(mutablePos.x) - edgeLongRadius;
			float distanceToEdgeY = abs(mutablePos.y - edgeCenter) - edgeShortRadius;
			float distanceToEdgeZ = abs(mutablePos.z - edgeCenter) - edgeShortRadius;
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
				mutablePos = vec3(1.0 / edgeLongRadius, edgeFactor, edgeFactor) * mutablePos - edgeScaleCenter;

				totalScale *= vec3(1.0 / edgeLongRadius, edgeFactor, edgeFactor);
			}

			${useForGetColor ? changeColorGlsl : ""}

			mutablePos = abs(mutablePos);
			maxAbsPos = max(max(mutablePos.x, mutablePos.y), mutablePos.z);
			minAbsPos = min(min(mutablePos.x, mutablePos.y), mutablePos.z);
			sumAbsPos = mutablePos.x + mutablePos.y + mutablePos.z;
			mutablePos = vec3(minAbsPos, sumAbsPos - minAbsPos - maxAbsPos, maxAbsPos);
		}
		
		${useForGetColor ? "return abs(color);" : "return totalDistance * 0.333333 / effectiveScale;"}
	`;
}

export const mengerSpongeDE = [
	/* glsl */`
		float distanceEstimatorMengerSponge(vec3 pos)
		{
			${getMengerSpongeDE(false)}
		}
	`,
	/* glsl */`
		vec3 getColorMengerSponge(vec3 pos)
		{
			${getMengerSpongeDE(true)}
		}
	`,
];