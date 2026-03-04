import { BarnsleyFern } from "/applets/barnsley-fern/scripts/class.js";
import { ThurstonGeometries } from "/applets/thurston-geometries/scripts/class.js";
import { H3Rooms } from "/applets/thurston-geometries/scripts/geometries/h3.js";
import { VectorField } from "/applets/vector-fields/scripts/class.js";
import { createEphemeralApplet } from "/scripts/applets/applet.js";
import {
	createDesmosGraphs, desmosColors,
	getDesmosVector
} from "/scripts/src/desmos.js";
import { $ } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		areaScaling:
		{
			bounds: { xmin: -1, xmax: 8, ymin: -1, ymax: 8 },

			expressions:
			[
				...getDesmosVector({ from: [0, 0], to: [1, 1], color: desmosColors.purple }),
				...getDesmosVector({ from: [0, 0], to: [2, 1], color: desmosColors.blue }),
				...getDesmosVector({ from: [1, 1], to: [3, 2], color: desmosColors.blue }),
				...getDesmosVector({ from: [2, 1], to: [3, 2], color: desmosColors.purple }),

				...getDesmosVector({ from: [0, 0], to: [3, 3], color: desmosColors.red }),
				...getDesmosVector({ from: [0, 0], to: [4, 2], color: desmosColors.orange }),
				...getDesmosVector({ from: [3, 3], to: [7, 5], color: desmosColors.orange }),
				...getDesmosVector({ from: [4, 2], to: [7, 5], color: desmosColors.red }),
			]
		},
	});


	const h3GeometryCanvas = $("#h3-geometry-canvas");

	const h3GeometryApplet = new ThurstonGeometries({ canvas: h3GeometryCanvas });

	const geometryData = new H3Rooms();
	geometryData.sliderValues.wallThickness = .143;

	h3GeometryApplet.run(geometryData);

	h3GeometryApplet.wilson.resizeCanvas({ width: 1000 });



	const barnsleyFernCanvas = $("#barnsley-fern-canvas");

	const barnsleyFernApplet = new BarnsleyFern({ canvas: barnsleyFernCanvas });

	barnsleyFernApplet.runWhenOnscreen({ numIterations: 10_000_000 });



	createEphemeralApplet($("#vector-field-canvas"), (canvas) =>
	{
		const applet = new VectorField({ canvas });

		applet.loadPromise.then(() =>
		{
			applet.run({
				generatingCode: "(x - y, x + y)",
				worldWidth: 2
			});
		});

		return applet;
	});
}