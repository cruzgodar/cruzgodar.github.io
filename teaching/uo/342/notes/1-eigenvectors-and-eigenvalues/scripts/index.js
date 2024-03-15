import { BarnsleyFern } from "/applets/barnsley-fern/scripts/class.js";
import { ThurstonGeometry } from "/applets/thurston-geometries/scripts/class.js";
import { H3Rooms } from "/applets/thurston-geometries/scripts/geometries/h3.js";
import { VectorField } from "/applets/vector-fields/scripts/class.js";
import { showPage } from "/scripts/src/loadPage.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
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