import {
	createDesmosGraphs
} from "/scripts/src/desmos.js";

export default function()
{
	createDesmosGraphs({
		curveIntegral:
		{
			use3d: true,

			options: { showPlane3D: false, translucentSurfaces: true },

			bounds: { xmin: -3, xmax: 3, ymin: -3, ymax: 3, zmin: -3, zmax: 3 },
			
			expressions:
			[
				
			]
		},
	});
}