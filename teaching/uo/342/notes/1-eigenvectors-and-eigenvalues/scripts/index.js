import { BarnsleyFern } from "/applets/barnsley-fern/scripts/class.js";
import { ThurstonGeometry } from "/applets/thurston-geometries/scripts/class.js";
import { H3Rooms } from "/applets/thurston-geometries/scripts/geometries/h3.js";
import { VectorField } from "/applets/vector-fields/scripts/class.js";
import {
	createDesmosGraphs,
	desmosBlue,
	desmosGreen,
	desmosPurple,
	desmosRed,
	getDesmosVector,
	setGetDesmosData
} from "/scripts/src/desmos.js";
import { showPage } from "/scripts/src/loadPage.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			"area-scaling":
			{
				bounds: { left: -1, right: 8, bottom: -1, top: 8 },

				expressions:
				[
					...getDesmosVector({ from: [0, 0], to: [1, 1], color: desmosPurple }),
					...getDesmosVector({ from: [0, 0], to: [2, 1], color: desmosBlue }),
					...getDesmosVector({ from: [1, 1], to: [3, 2], color: desmosBlue }),
					...getDesmosVector({ from: [2, 1], to: [3, 2], color: desmosPurple }),

					...getDesmosVector({ from: [0, 0], to: [3, 3], color: desmosRed }),
					...getDesmosVector({ from: [0, 0], to: [4, 2], color: desmosGreen }),
					...getDesmosVector({ from: [3, 3], to: [7, 5], color: desmosGreen }),
					...getDesmosVector({ from: [4, 2], to: [7, 5], color: desmosRed }),
				]
			},
		};

		return data;
	});

	createDesmosGraphs();


	const h3GeometryCanvas = $("#h3-geometry-canvas");

	const h3GeometryApplet = new ThurstonGeometry({ canvas: h3GeometryCanvas });

	const geometryData = new H3Rooms();
	geometryData.sliderValues.wallThickness = .143;

	h3GeometryApplet.run(geometryData);

	h3GeometryApplet.changeResolution(1000);



	const barnsleyFernCanvas = $("#barnsley-fern-canvas");

	const barnsleyFernApplet = new BarnsleyFern({ canvas: barnsleyFernCanvas });

	barnsleyFernApplet.runWhenOnscreen({ numIterations: 10_000_000 });



	const vectorFieldCanvas = $("#vector-field-canvas");

	const vectorFieldApplet = new VectorField({ canvas: vectorFieldCanvas });

	vectorFieldApplet.loadPromise.then(() =>
	{
		vectorFieldApplet.run({
			generatingCode: "(x - y, x + y)",
			zoomLevel: -0.5
		});
		vectorFieldApplet.pauseWhenOffscreen();
	});



	showPage();
}