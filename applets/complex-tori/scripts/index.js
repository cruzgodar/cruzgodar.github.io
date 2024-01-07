import { ComplexMap } from "../../complex-maps/scripts/class.js";
import { EllipticCurve } from "./class.js";
import { showPage } from "/scripts/src/load-page.js";
import { $, $$ } from "/scripts/src/main.js";

export function load()
{
	let g2 = -2;
	let g3 = 0;

	const ecApplet = new EllipticCurve({ canvas: $("#ec-plot-canvas") });



	const uniformCode = "uniform float g2Arg; uniform float g3Arg;";

	const wpApplet = new ComplexMap({
		canvas: $("#wp-canvas"),
		generatingCode: "wp(z, inverse_g2_g3(g2Arg, g3Arg))",
		uniformCode
	});
	wpApplet.loadPromise.then(
		() => wpApplet.wilson.render.initUniforms(["g2Arg", "g3Arg"])
	);

	const wpprimeApplet = new ComplexMap({
		canvas: $("#wpprime-canvas"),
		generatingCode: "wpprime(z, inverse_g2_g3(g2Arg, g3Arg))",
		uniformCode
	});
	wpprimeApplet.loadPromise.then(
		() => wpprimeApplet.wilson.render.initUniforms(["g2Arg", "g3Arg"])
	);

	const kleinjApplet = new ComplexMap({
		canvas: $("#kleinj-canvas"),
		generatingCode: "kleinJ(z)",
		worldCenterX: 0,
		worldCenterY: 1
	});

	const g2Applet = new ComplexMap({
		canvas: $("#g2-canvas"),
		generatingCode: "kleinj_from_g2_g3(z.x, z.y) * ONE",
		uniformCode,
		worldCenterX: 0,
		worldCenterY: 0,
		zoomLevel: -.585,
		addIndicatorDraggable: true,
		draggableCallback: onDragDraggable
	});
	g2Applet.loadPromise.then(() =>
	{
		g2Applet.wilson.render.initUniforms(["g2Arg", "g3Arg"]);

		run();
	});



	$$(".wilson-applet-canvas-container").forEach(element =>
	{
		element.style.setProperty("margin-top", 0, "important");
		element.style.setProperty("margin-bottom", 0, "important");
	});



	const resolutionInputElement = $("#resolution-input");

	ecApplet.setInputCaps([resolutionInputElement], [1000]);

	resolutionInputElement.addEventListener("input", () =>
	{
		const resolution = parseInt(resolutionInputElement.value || 500);

		ecApplet.changeResolution(resolution);

		wpApplet.wilson.changeCanvasSize(resolution, resolution);
		wpprimeApplet.wilson.changeCanvasSize(resolution, resolution);
		kleinjApplet.wilson.changeCanvasSize(resolution, resolution);
		g2Applet.wilson.changeCanvasSize(resolution, resolution);

		run();
	});



	const g2SliderElement = $("#g2-slider");
	const g2SliderValueElement = $("#g2-slider-value");

	g2SliderElement.addEventListener("input", () =>
	{
		g2 = parseFloat(g2SliderValueElement.textContent);

		g2Applet.wilson.draggables.worldCoordinates[0][0] = g2 / 5;

		g2Applet.wilson.draggables.recalculateLocations();

		run();
	});



	const g3SliderElement = $("#g3-slider");
	const g3SliderValueElement = $("#g3-slider-value");

	g3SliderElement.addEventListener("input", () =>
	{
		g3 = parseFloat(g3SliderValueElement.textContent);

		g2Applet.wilson.draggables.worldCoordinates[0][1] = g3 / 5;

		g2Applet.wilson.draggables.recalculateLocations();

		run();
	});



	function onDragDraggable(activeDraggable, x, y)
	{
		g2 = x * 5;
		g3 = y * 5;

		g2SliderElement.value = g2;
		g3SliderElement.value = g3;

		g2SliderValueElement.textContent = g2.toFixed(3);
		g3SliderValueElement.textContent = g3.toFixed(3);

		run();
	}



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener("click", () => wpApplet.wilson.downloadFrame("wp.png"));



	showPage();



	function run()
	{
		ecApplet.run({ g2, g3 });

		wpApplet.wilson.gl.uniform1f(wpApplet.wilson.uniforms["g2Arg"], g2);
		wpApplet.wilson.gl.uniform1f(wpApplet.wilson.uniforms["g3Arg"], g3);
		wpApplet.drawFrame();

		wpprimeApplet.wilson.gl.uniform1f(wpprimeApplet.wilson.uniforms["g2Arg"], g2);
		wpprimeApplet.wilson.gl.uniform1f(wpprimeApplet.wilson.uniforms["g3Arg"], g3);
		wpprimeApplet.drawFrame();

		g2Applet.wilson.gl.uniform1f(g2Applet.wilson.uniforms["g2Arg"], g2);
		g2Applet.wilson.gl.uniform1f(g2Applet.wilson.uniforms["g3Arg"], g3);
		g2Applet.drawFrame();
	}
}