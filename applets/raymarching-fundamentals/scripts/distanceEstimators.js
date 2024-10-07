export const roomSphereDE = [
	/* glsl */`
		float distanceEstimatorRoomSphere(vec3 pos)
		{
			vec3 modPos = mix(pos, mod(pos + vec3(1.0, 1.0, 0.0), 2.0) - vec3(1.0, 1.0, 0.0), modPosAmount); 
			float sphereDistance = length(modPos - vec3(0.0, 0.0, .833333)) - (-0.5 + showSphereAmount);

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

			vec3 mutablePos = abs(pos * 3.0 - vec3(0.0, 0.0, 2.5));

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

			vec3 mutablePos = abs(pos * 3.0 - vec3(0.0, 0.0, 2.5));

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