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

		vec3 mutablePos = abs(pos * 3.0 - vec3(0.0, 0.0, 3.0));
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
			mutablePos = rotationMatrix * mutablePos;
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



const kIFSScale = 1.15;

function getKIFSDistanceEstimator(shape, useForGetColor = false)
{
	// Make the first letter uppercase.
	const variableName = shape[0].toUpperCase() + shape.slice(1);

	return /* glsl */`
		pos = (pos - vec3(0.0, 0.0, 1.0));

		${useForGetColor ? "vec3 color = vec3(1.0, 1.0, 1.0); float colorScale = .5;" : ""}
		//We'll find the closest vertex, scale everything by a factor of 2 centered on that vertex (so that we don't need to recalculate the vertices), and repeat.
		for (int iteration = 0; iteration < 56; iteration++)
		{
			//Fold space over on itself so that we can reference only the top vertex.
			float t1 = dot(pos, n1${variableName});
			
			if (t1 < 0.0)
			{
				pos -= 2.0 * t1 * n1${variableName};
				${useForGetColor ? "color = mix(color, color1, colorScale);" : ""}
			}
			
			float t2 = dot(pos, n2${variableName});
			
			if (t2 < 0.0)
			{
				pos -= 2.0 * t2 * n2${variableName};
				${useForGetColor ? "color = mix(color, color2, colorScale);" : ""}
			}
			
			float t3 = dot(pos, n3${variableName});
			
			if (t3 < 0.0)
			{
				pos -= 2.0 * t3 * n3${variableName};
				${useForGetColor ? "color = mix(color, color3, colorScale);" : ""}
			}

			${variableName === "Octahedron" ? /* glsl */`
				float t4 = dot(pos, n4${variableName});
				
				if (t4 < 0.0)
				{
					pos -= 2.0 * t4 * n4${variableName};
					${useForGetColor ? "color = mix(color, color4, colorScale);" : ""}
				}
			` : ""}
			
			//Scale the system -- this one takes me a fair bit of thinking to get. What's happening here is that we're stretching from a vertex, but since we never scale the vertices, the four new ones are the four closest to the vertex we scaled from. Now (x, y, z) will get farther and farther away from the origin, but that makes sense -- we're really just zooming in on the tetrahedron.
			pos = ${kIFSScale} * pos - (${kIFSScale} - 1.0) * scaleCenter${variableName};
			
			pos = rotationMatrix * pos;

			${useForGetColor ? "colorScale *= .5;" : ""}
		}

		float totalDistance = length(pos) * pow(1.0/${kIFSScale}, float(56));
		
		return ${useForGetColor ? "color" : "totalDistance"};
	`;
}

export const kIFSCubeDE = [
	/* glsl */`
		float distanceEstimatorKIFS(vec3 pos)
		{
			${getKIFSDistanceEstimator("tetrahedron")}
		}
	`,
	/* glsl */`
		vec3 getColorKIFS(vec3 pos)
		{
			${getKIFSDistanceEstimator("tetrahedron", true)}
		}
	`,
];



export const mandelbulbDE = [
	/* glsl */`
		float distanceEstimatorMandelbulb(vec3 pos)
		{
			pos = pos * 2.0 - vec3(0.0, 0.0, 2.0);
			vec3 z = pos;
			
			float r = length(z);
			float dr = 1.0;
			
			for (int iteration = 0; iteration < 16; iteration++)
			{
				if (r > 16.0)
				{
					break;
				}
				
				float theta = acos(z.z / r);
				
				float phi = atan(z.y, z.x);
				
				dr = pow(r, 8.0 - 1.0) * 8.0 * dr + 1.0;
				
				theta *= 8.0;
				
				phi *= 8.0;
				
				z = pow(r, 8.0) * vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));
				
				z += pos;
				
				z = rotationMatrix * z;
				
				r = length(z);
			}
			
			return .5 * log(r) * r / dr / 2.0;
		}
	`,

	/* glsl */`
		vec3 getColorMandelbulb(vec3 pos)
		{
			pos = pos * 2.0 - vec3(0.0, 0.0, 2.0);
			vec3 z = pos;
			
			float r = length(z);
			float dr = 1.0;
			
			vec3 color = vec3(1.0, 1.0, 1.0);
			float colorScale = .5;
			
			for (int iteration = 0; iteration < 100; iteration++)
			{
				if (r > 16.0)
				{
					break;
				}
				
				float theta = acos(z.z / r);
				
				float phi = atan(z.y, z.x);
				
				dr = pow(r, 8.0 - 1.0) * 8.0 * dr + 1.0;
				
				theta *= 8.0;
				
				phi *= 8.0;
				
				z = pow(r, 8.0) * vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));
				
				z += pos;
				
				z = rotationMatrix * z;
				
				r = length(z);
				
				color = mix(color, abs(z / r), colorScale);
				
				colorScale *= .5;
			}
			
			color /= max(max(color.x, color.y), color.z);
			
			return color;
		}
	`
];



export const qJuliaDE = [
	/* glsl */`
		float distanceEstimatorQJulia(vec3 pos)
		{
			pos = pos * 2.0 - vec3(0.0, 0.0, 2.0);
			vec4 z = vec4(pos, 0.0);
			vec4 zPrime = vec4(1.0, 0.0, 0.0, 0.0);
			float r;
			
			for (int iteration = 0; iteration < 16; iteration++)
			{
				r = length(z);
				
				if (r > 16.0)
				{
					break;
				}
				
				zPrime = 2.0 * qmul(z, zPrime);
				
				z = qmul(z, z);
				
				z += vec4(-.54, -.25, -.668, 0.0);

				z = mat4(
					vec4(rotationMatrix[0], 0.0),
					vec4(rotationMatrix[1], 0.0),
					vec4(rotationMatrix[2], 0.0),
					vec4(0.0, 0.0, 0.0, 1.0)
				) * z;
			}
			
			r = length(z);
			return .5 * r * log(r) / length(zPrime) / 2.0;
		}
	`,

	/* glsl */`
		vec3 getColorQJulia(vec3 pos)
		{
			pos = pos * 2.0 - vec3(0.0, 0.0, 2.0);
			vec4 z = vec4(pos, 0.0);
			vec4 zPrime = vec4(1.0, 0.0, 0.0, 0.0);
			float r;
			
			vec3 color = vec3(1.0, 1.0, 1.0);
			float colorScale = .5;
			
			for (int iteration = 0; iteration < 16; iteration++)
			{
				r = length(z);
				
				if (r > 16.0)
				{
					break;
				}
				
				zPrime = 2.0 * qmul(z, zPrime);
				
				z = qmul(z, z);
				
				z += vec4(-.54, -.25, -.668, 0.0);

				z = mat4(
					vec4(rotationMatrix[0], 0.0),
					vec4(rotationMatrix[1], 0.0),
					vec4(rotationMatrix[2], 0.0),
					vec4(0.0, 0.0, 0.0, 1.0)
				) * z;
				
				color = mix(color, abs(normalize(z.xyz)), colorScale);
				
				colorScale *= .5;
			}
			
			color /= max(max(color.x, color.y), color.z);
			
			return color;
		}
	`
];