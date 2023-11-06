import{BaseGeometry,getMinGlslString}from"./base.min.mjs";class E3Geometry extends BaseGeometry{}class E3Rooms extends E3Geometry{distanceEstimatorGlsl=`
		float distance1 = -length(mod(pos.xyz, 2.0) - vec3(1.0, 1.0, 1.0)) + 1.3;

		return distance1;
	`;getColorGlsl=`
		return vec3(
			.25 + .75 * (.5 * (sin(pos.x) + 1.0)),
			.25 + .75 * (.5 * (sin(pos.y) + 1.0)),
			.25 + .75 * (.5 * (sin(pos.z) + 1.0))
		);
	`;lightGlsl=`
		vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(1.0, 1.0, 1.0, 0.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		float lightIntensity = lightBrightness * max(abs(dotProduct1), abs(dotProduct2)) * 1.5;
	`;cameraPos=[1,1,1,1];normalVec=[0,0,0,1];upVec=[0,0,1,0];rightVec=[0,1,0,0];forwardVec=[1,0,0,0]}class E3Spheres extends E3Geometry{distanceEstimatorGlsl=`
		float distance1 = length(mod(pos.xyz, 2.0) - vec3(1.0, 1.0, 1.0)) - 0.5;

		return distance1;
	`;getColorGlsl=`
		return vec3(
			.25 + .75 * (.5 * (sin(floor(pos.x + .5) * 40.0) + 1.0)),
			.25 + .75 * (.5 * (sin(floor(pos.y + .5) * 57.0) + 1.0)),
			.25 + .75 * (.5 * (sin(floor(pos.z + .5) * 89.0) + 1.0))
		);
	`;lightGlsl=`
		vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		float lightIntensity = lightBrightness * max(dotProduct1, -.5 * dotProduct1) * 1.25;
	`;cameraPos=[0,0,0,1];normalVec=[0,0,0,1];upVec=[0,0,1,0];rightVec=[0,1,0,0];forwardVec=[1,0,0,0]}class H3Spheres extends E3Geometry{distanceEstimatorGlsl=`
		float distance1 = length(pos.xyz) - 0.5;

		return distance1;
	`;functionGlsl=`
		// The right side of the plane equations after normalizing.
		const float phi = 1.61803398;
		const float phi2 = 2.61803398;
		const float planeDistance = 1.3763819;
		
		const vec3 plane1 = vec3(0.52573112, 0.85065077, 0.0);
		const vec3 plane2 = vec3(0.52573112, -0.85065077, 0.0);
		const vec3 plane3 = vec3(0.0, 0.52573112, 0.85065077);
		const vec3 plane4 = vec3(0.0, 0.52573112, -0.85065077);
		const vec3 plane5 = vec3(0.85065077, 0.0, 0.52573112);
		const vec3 plane6 = vec3(-0.85065077, 0.0, 0.52573112);

		const float rotationAngle = 1.88495559215;



		// Rotates pos an angle about axis (which must be a unit vector).
		void rotateAboutVector(inout vec3 pos, inout vec3 rayDirectionVec, vec3 axis, float angle)
		{
			// float sineOfAngle = sin(angle / 2.0);
			// vec4 q = vec4(sineOfAngle * pos, cos(angle / 2.0));
			// vec3 temp = cross(q.xyz, pos) + q.w * pos;
			// pos = pos + 2.0 * cross(q.xyz, temp);

			float s = sin(angle);
			float c = cos(angle);
			float oc = 1.0 - c;

			mat3 rotationMatrix = mat3(
				oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
				oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
				oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c
			);

			pos.xyz = rotationMatrix * pos.xyz;
			rayDirectionVec = rotationMatrix * rayDirectionVec;
		}

		void teleportPos(inout vec4 pos, inout vec4 startPos, inout vec4 rayDirectionVec, inout float t)
		{
			float dotProduct = dot(pos.xyz, plane1);

			// To reflect through one of these planes, we just subtract a multiple of the normal vector.
			// However, when we're far from the actual sphere, we can jump too far and land inside of the actual
			// sphere when we teleport. So instead, we'll reset to the plane itself when we teleport.
			
			if (dotProduct < -planeDistance)
			{
				rotateAboutVector(pos.xyz, rayDirectionVec.xyz, plane1, rotationAngle);
				pos.xyz += vec3(1.0514622, 1.7013016, 0.0);
				startPos = pos;
				t = 0.0;

				return;
			}

			if (dotProduct > planeDistance)
			{
				rotateAboutVector(pos.xyz, rayDirectionVec.xyz, plane1, -rotationAngle);
				pos.xyz -= vec3(1.0514622, 1.7013016, 0.0);
				startPos = pos;
				t = 0.0;

				return;
			}

			

			dotProduct = dot(pos.xyz, plane2);

			if (dotProduct < -planeDistance)
			{
				rotateAboutVector(pos.xyz, rayDirectionVec.xyz, plane2, rotationAngle);
				pos.xyz += vec3(1.0514622, -1.7013016, 0.0);
				startPos = pos;
				t = 0.0;

				return;
			}

			if (dotProduct > planeDistance)
			{
				rotateAboutVector(pos.xyz, rayDirectionVec.xyz, plane2, -rotationAngle);
				pos.xyz -= vec3(1.0514622, -1.7013016, 0.0);
				startPos = pos;
				t = 0.0;

				return;
			}

			
			
			dotProduct = dot(pos.xyz, plane3);

			if (dotProduct < -planeDistance)
			{
				rotateAboutVector(pos.xyz, rayDirectionVec.xyz, plane3, rotationAngle);
				pos.xyz += vec3(0.0, 1.0514622, 1.7013016);
				startPos = pos;
				t = 0.0;

				return;
			}

			if (dotProduct > planeDistance)
			{
				rotateAboutVector(pos.xyz, rayDirectionVec.xyz, plane3, -rotationAngle);
				pos.xyz -= vec3(0.0, 1.0514622, 1.7013016);
				startPos = pos;
				t = 0.0;

				return;
			}



			dotProduct = dot(pos.xyz, plane4);

			if (dotProduct < -planeDistance)
			{
				rotateAboutVector(pos.xyz, rayDirectionVec.xyz, plane4, rotationAngle);
				pos.xyz += vec3(0.0, 1.0514622, -1.7013016);
				startPos = pos;
				t = 0.0;
			}

			else if (dotProduct > planeDistance)
			{
				rotateAboutVector(pos.xyz, rayDirectionVec.xyz, plane4, -rotationAngle);
				pos.xyz -= vec3(0.0, 1.0514622, -1.7013016);
				startPos = pos;
				t = 0.0;
			}



			dotProduct = dot(pos.xyz, plane5);

			if (dotProduct < -planeDistance)
			{
				rotateAboutVector(pos.xyz, rayDirectionVec.xyz, plane5, rotationAngle);
				pos.xyz += vec3(1.7013016, 0.0, 1.0514622);
				startPos = pos;
				t = 0.0;
			}

			else if (dotProduct > planeDistance)
			{
				rotateAboutVector(pos.xyz, rayDirectionVec.xyz, plane5, -rotationAngle);
				pos.xyz -= vec3(1.7013016, 0.0, 1.0514622);
				startPos = pos;
				t = 0.0;
			}



			dotProduct = dot(pos.xyz, plane6);

			if (dotProduct < -planeDistance)
			{
				rotateAboutVector(pos.xyz, rayDirectionVec.xyz, plane6, rotationAngle);
				pos.xyz += vec3(-1.7013016, 0.0, 1.0514622);
				startPos = pos;
				t = 0.0;
			}

			else if (dotProduct > planeDistance)
			{
				rotateAboutVector(pos.xyz, rayDirectionVec.xyz, plane6, -rotationAngle);
				pos.xyz -= vec3(-1.7013016, 0.0, 1.0514622);
				startPos = pos;
				t = 0.0;
			}
		}

		float getTToPlane(vec3 pos, vec3 rayDirectionVec, vec3 planeNormalVec, float planeOffset)
		{
			float denominator = dot(planeNormalVec, rayDirectionVec);

			if (denominator == 0.0)
			{
				return 100.0;
			}

			return (planeOffset - dot(planeNormalVec, pos)) / denominator;
		}
	`;geodesicGlsl=`
		vec4 pos = startPos + t * rayDirectionVec;
		
		teleportPos(pos, startPos, rayDirectionVec, t);
	`;getColorGlsl=`
		return vec3(1.0, 1.0, 1.0);
	`;updateTGlsl=`
		float t1 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane1, planeDistance));
		float t2 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane1, -planeDistance));
		float t3 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane2, planeDistance));
		float t4 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane2, -planeDistance));
		float t5 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane3, planeDistance));
		float t6 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane3, -planeDistance));
		float t7 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane4, planeDistance));
		float t8 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane4, -planeDistance));
		float t9 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane5, planeDistance));
		float t10 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane5, -planeDistance));
		float t11 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane6, planeDistance));
		float t12 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane6, -planeDistance));

		float minTToPlane = ${getMinGlslString("t",12)};
		t += min(minTToPlane + .01, distance) * stepFactor;
	`;lightGlsl=`
		vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		float lightIntensity = lightBrightness * max(dotProduct1, -.5 * dotProduct1) * 1.25;
	`;cameraPos=[-1,0,0,1];normalVec=[0,0,0,1];upVec=[0,0,1,0];rightVec=[0,1,0,0];forwardVec=[1,0,0,0]}export{E3Rooms,E3Spheres,H3Spheres};