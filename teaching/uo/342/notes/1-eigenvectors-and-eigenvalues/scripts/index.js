import { BarnsleyFern } from "/applets/barnsley-fern/scripts/class.js";
import { ThurstonGeometry } from "/applets/thurston-geometries/scripts/class.js";
import { H3Rooms } from "/applets/thurston-geometries/scripts/geometries/h3.js";
import { VectorField } from "/applets/vector-fields/scripts/class.js";
import {
	createDesmosGraphs,
	desmosBlue,
	desmosPurple,
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
			"test-graph":
			{
				bounds: { left: -1, right: 3, bottom: -1, top: 3 },

				expressions:
				[
					{ latex: String.raw`f(x) = x^3 - 2x^2 + 2`, color: desmosPurple },
					{ latex: String.raw`a = 0` },
					{ latex: String.raw`b = 2` },

					{ latex: String.raw`x = [a, b] \{0 \leq y \leq f(x)\} `, color: desmosPurple, secret: true },
					{ latex: String.raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: desmosPurple, secret: true }
				]
			},
			
			"linear-system":
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: String.raw`x + y = 1`, color: desmosPurple, secret: true },
					{ latex: String.raw`(a + 1)x + (a^2 + 1)y = 4a + 1`, color: desmosBlue, secret: true },
					{ latex: String.raw`a = 2`, sliderBounds: { min: -2, max: 2 } },
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