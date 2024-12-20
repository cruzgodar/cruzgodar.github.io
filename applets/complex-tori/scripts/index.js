import { showPage } from "../../../scripts/src/loadPage.js";
import { ComplexMaps } from "../../complex-maps/scripts/class.js";
import { EllipticCurve } from "./class.js";
import { $ } from "/scripts/src/main.js";
import { typesetMath } from "/scripts/src/math.js";
import { siteSettings } from "/scripts/src/settings.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	let g2 = -2;
	let g3 = 2;

	const ecApplet = new EllipticCurve({ canvas: $("#ec-plot-canvas") });

	const uniformCode = "uniform float g2Arg; uniform float g3Arg;";

	const wpApplet = new ComplexMaps({
		canvas: $("#wp-canvas"),
		generatingCode: "wp(z, inverse_g2_g3(g2Arg, g3Arg))",
		uniformCode,
		uniforms: {
			g2Arg: g2,
			g3Arg: g3
		},
		worldWidth: 2
	});

	const wpprimeApplet = new ComplexMaps({
		canvas: $("#wpprime-canvas"),
		generatingCode: "wpprime(z, inverse_g2_g3(g2Arg, g3Arg))",
		uniformCode,
		uniforms: {
			g2Arg: g2,
			g3Arg: g3
		},
		worldWidth: 2
	});

	const kleinjApplet = new ComplexMaps({
		canvas: $("#kleinj-canvas"),
		generatingCode: "kleinJ(z)",
		worldCenterX: 0,
		worldCenterY: 1,
		worldWidth: 2
	});

	const g2Applet = new ComplexMaps({
		canvas: $("#g2-canvas"),
		generatingCode: "kleinj_from_g2_g3(z.x, z.y) * ONE",
		addIndicatorDraggable: true,
		draggableCallback: onDragDraggable
	});

	g2Applet.wilson.setDraggables({ draggableArg: [g2 / 5, g3 / 5] });



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

	function onDragDraggable({ x, y })
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

		wpApplet.wilson.setUniforms({ g2Arg: g2, g3Arg: g3 });
		wpApplet.needNewFrame = true;

		wpprimeApplet.wilson.setUniforms({ g2Arg: g2, g3Arg: g3 });
		wpprimeApplet.needNewFrame = true;
	}

	function changeResolution()
	{
		const resolution = resolutionInput.value * siteSettings.resolutionMultiplier;

		ecApplet.changeResolution(resolution);

		wpApplet.wilson.resizeCanvas({ width: resolution });
		wpprimeApplet.wilson.resizeCanvas({ width: resolution });
		kleinjApplet.wilson.resizeCanvas({ width: resolution });
		g2Applet.wilson.resizeCanvas({ width: resolution });

		run();
	}

	function onSliderInput()
	{
		g2 = g2Slider.value;
		g3 = g3Slider.value;

		g2Applet.wilson.setDraggables({ draggableArg: [g2 / 5, g3 / 5] });

		run();
	}
}