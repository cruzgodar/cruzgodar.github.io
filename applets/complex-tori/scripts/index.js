import { showPage } from "../../../scripts/src/loadPage.js";
import { ComplexMap } from "../../complex-maps/scripts/class.js";
import { EllipticCurve } from "./class.js";
import { $, $$ } from "/scripts/src/main.js";
import { typesetMath } from "/scripts/src/math.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";

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



	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		minValue: 100,
		maxValue: 1000,
		onEnter: run,
		onInput: changeResolution
	});

	const g2Slider = new Slider({
		element: $("#g2-slider"),
		name: "$g_2$",
		value: g2,
		min: -5,
		max: 5,
		onInput: onSliderInput
	});

	const g3Slider = new Slider({
		element: $("#g3-slider"),
		name: "$g_3$",
		value: g3,
		min: -5,
		max: 5,
		onInput: onSliderInput
	});

	typesetMath();

	showPage();

	function onDragDraggable(activeDraggable, x, y)
	{
		g2 = x * 5;
		g3 = y * 5;

		g2Slider.setValue(g2);
		g3Slider.setValue(g3);

		run();
	}

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

	function changeResolution()
	{
		const resolution = resolutionInput.value;

		ecApplet.changeResolution(resolution);

		wpApplet.wilson.changeCanvasSize(resolution, resolution);
		wpprimeApplet.wilson.changeCanvasSize(resolution, resolution);
		kleinjApplet.wilson.changeCanvasSize(resolution, resolution);
		g2Applet.wilson.changeCanvasSize(resolution, resolution);

		run();
	}

	function onSliderInput()
	{
		g2 = g2Slider.value;

		g2Applet.wilson.draggables.worldCoordinates[0][0] = g2 / 5;

		g3 = g3Slider.value;

		g2Applet.wilson.draggables.worldCoordinates[0][1] = g3 / 5;

		g2Applet.wilson.draggables.recalculateLocations();

		run();
	}
}