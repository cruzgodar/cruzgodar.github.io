"use strict";

!async function()
{
	let g2 = -2;
	let g3 = 0;
	
	
	
	await Site.loadApplet("complex-maps");
	await Site.loadApplet("complex-tori");
	
	const ecApplet = new EllipticCurve($("#ec-plot-canvas"));
	
	
	
	const uniformCode = "uniform float g2Arg; uniform float g3Arg;";
	
	const wpApplet = new ComplexMap($("#wp-canvas"), "wp(z, inverse_g2_g3(g2Arg, g3Arg))", uniformCode);
	wpApplet.loadPromise.then(() => wpApplet.wilson.render.initUniforms(["g2Arg", "g3Arg"]));
	
	const wpprimeApplet = new ComplexMap($("#wpprime-canvas"), "wpprime(z, inverse_g2_g3(g2Arg, g3Arg))", uniformCode);
	wpprimeApplet.loadPromise.then(() => wpprimeApplet.wilson.render.initUniforms(["g2Arg", "g3Arg"]));
	
	const kleinjApplet = new ComplexMap($("#kleinj-canvas"), "kleinJ(z)", "", 0, 1);
	
	const g2Applet = new ComplexMap($("#g2-canvas"), "kleinj_from_g2_g3(z.x, z.y) * ONE", uniformCode, 0, 0, -.585, true, onDragDraggable);
	g2Applet.loadPromise.then(() =>
	{
		g2Applet.wilson.render.initUniforms(["g2Arg", "g3Arg"]);
		
		run();
	});
	
	
	
	Page.setElementStyles(".wilson-applet-canvas-container", "margin-top", "0", true);
	Page.setElementStyles(".wilson-applet-canvas-container", "margin-bottom", "0", true);
	
	
	
	function run()
	{
		ecApplet.run(g2, g3);
		
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
	g2SliderElement.addEventListener("input", () =>
	{
		g2 = parseInt(g2SliderElement.value || 5000) / 1000 - 5;
		g2SliderValueElement.textContent = Math.round(g2 * 1000) / 1000;
		
		g2Applet.wilson.draggables.worldCoordinates[0][0] = g2;
		
		g2Applet.wilson.draggables.recalculateLocations();
		
		run();
	});
	
	const g2SliderValueElement = $("#g2-slider-value");
	g2SliderValueElement.textContent = "-2";
	
	
	
	const g3SliderElement = $("#g3-slider");
	g3SliderElement.addEventListener("input", () =>
	{
		g3 = parseInt(g3SliderElement.value || 5000) / 1000 - 5;
		g3SliderValueElement.textContent = Math.round(g3 * 1000) / 1000;
		
		g2Applet.wilson.draggables.worldCoordinates[0][1] = g3;
		
		g2Applet.wilson.draggables.recalculateLocations();
		
		run();
	});
	
	const g3SliderValueElement = $("#g3-slider-value");
	g3SliderValueElement.textContent = "0";
	
	
	
	function onDragDraggable(activeDraggable, x, y, event)
	{
		g2 = x;
		g3 = y;
		
		g2SliderValueElement.textContent = Math.round(g2 * 1000) / 1000;
		g3SliderValueElement.textContent = Math.round(g3 * 1000) / 1000;
		
		run();
	}
	
	
	
	const downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () => wpApplet.wilson.downloadFrame("wp.png"));
	
	
	
	Page.show();
}()