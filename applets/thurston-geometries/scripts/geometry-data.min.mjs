import{ThurstonGeometry}from"./class.min.mjs";function getS3BaseData(){return{updateCameraPos:(cameraPos,tangentVec,dt)=>{for(let s=0;s<4;s++)cameraPos[s]=Math.cos(dt)*cameraPos[s]+Math.sin(dt)*tangentVec[s];var a=ThurstonGeometry.magnitude(cameraPos);cameraPos[0]/=a,cameraPos[1]/=a,cameraPos[2]/=a,cameraPos[3]/=a},getNormalVec:cameraPos=>ThurstonGeometry.normalize(cameraPos),getGammaPrime:(_pos,dir)=>[...dir],getGammaDoublePrime:pos=>[-pos[0],-pos[1],-pos[2],-pos[3]],cameraPos:[0,0,0,-1],normalVec:[0,0,0,-1],upVec:[0,0,1,0],rightVec:[0,1,0,0],forwardVec:[1,0,0,0]}}function getS3SpheresData(){return{...getS3BaseData(),distanceEstimatorGlsl:`
			float distance1 = acos(pos.x) - .3;
			float distance2 = acos(-pos.x) - .3;
			float distance3 = acos(pos.y) - .3;
			float distance4 = acos(-pos.y) - .3;
			float distance5 = acos(pos.z) - .3;
			float distance6 = acos(-pos.z) - .3;
			float distance7 = acos(pos.w) - .3;

			float minDistance = min(
				min(
					min(distance1, distance2),
					min(distance3, distance4)
				),
				min(
					min(distance5, distance6),
					distance7
				)
			);

			return minDistance;
		`,getColorGlsl:`
			float distance1 = acos(pos.x) - .3;
			float distance2 = acos(-pos.x) - .3;
			float distance3 = acos(pos.y) - .3;
			float distance4 = acos(-pos.y) - .3;
			float distance5 = acos(pos.z) - .3;
			float distance6 = acos(-pos.z) - .3;
			float distance7 = acos(pos.w) - .3;

			float minDistance = min(
				min(
					min(distance1, distance2),
					min(distance3, distance4)
				),
				min(
					min(distance5, distance6),
					distance7
				)
			);

			if (minDistance == distance1)
			{
				return vec3(1.0, 0.0, 0.0) * getBanding(pos.y + pos.z + pos.w, 10.0);
			}

			if (minDistance == distance2)
			{
				return vec3(0.0, 1.0, 1.0) * getBanding(pos.y + pos.z + pos.w, 10.0);
			}

			if (minDistance == distance3)
			{
				return vec3(0.0, 1.0, 0.0) * getBanding(pos.x + pos.z + pos.w, 10.0);
			}

			if (minDistance == distance4)
			{
				return vec3(1.0, 0.0, 1.0) * getBanding(pos.x + pos.z + pos.w, 10.0);
			}

			if (minDistance == distance5)
			{
				return vec3(0.0, 0.0, 1.0) * getBanding(pos.x + pos.y + pos.w, 10.0);
			}

			if (minDistance == distance6)
			{
				return vec3(1.0, 1.0, 0.0) * getBanding(pos.x + pos.y + pos.w, 10.0);
			}

			if (minDistance == distance7)
			{
				return vec3(1.0, 1.0, 1.0) * getBanding(pos.x + pos.y + pos.z, 10.0);
			}
		`}}function getS3RoomsData(){return{...getS3BaseData(),distanceEstimatorGlsl:`
			float distance1 = acos(pos.x) - .9;
			float distance2 = acos(-pos.x) - .9;
			float distance3 = acos(pos.y) - .9;
			float distance4 = acos(-pos.y) - .9;
			float distance5 = acos(pos.z) - .9;
			float distance6 = acos(-pos.z) - .9;
			float distance7 = acos(pos.w) - .9;
			float distance8 = acos(-pos.w) - .9;

			float minDistance = min(
				min(
					min(distance1, distance2),
					min(distance3, distance4)
				),
				min(
					min(distance5, distance6),
					min(distance7, distance8)
				)
			);

			return -minDistance;
		`,getColorGlsl:`
			float distance1 = acos(pos.x) - .9;
			float distance2 = acos(-pos.x) - .9;
			float distance3 = acos(pos.y) - .9;
			float distance4 = acos(-pos.y) - .9;
			float distance5 = acos(pos.z) - .9;
			float distance6 = acos(-pos.z) - .9;
			float distance7 = acos(pos.w) - .9;
			float distance8 = acos(-pos.w) - .9;

			float minDistance = min(
				min(
					min(distance1, distance2),
					min(distance3, distance4)
				),
				min(
					min(distance5, distance6),
					min(distance7, distance8)
				)
			);

			if (minDistance == distance1)
			{
				return vec3(1.0, 0.0, 0.0);
			}

			if (minDistance == distance2)
			{
				return vec3(0.0, 1.0, 1.0);
			}

			if (minDistance == distance3)
			{
				return vec3(0.0, 1.0, 0.0);
			}

			if (minDistance == distance4)
			{
				return vec3(1.0, 0.0, 1.0);
			}

			if (minDistance == distance5)
			{
				return vec3(0.0, 0.0, 1.0);
			}

			if (minDistance == distance6)
			{
				return vec3(1.0, 1.0, 0.0);
			}

			if (minDistance == distance7)
			{
				return vec3(1.0, 0.5, 0.0);
			}

			if (minDistance == distance8)
			{
				return vec3(.5, 0.0, 1.0);
			}
		`}}export{getS3SpheresData,getS3RoomsData};