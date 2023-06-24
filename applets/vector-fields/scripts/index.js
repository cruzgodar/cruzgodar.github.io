"use strict";

!async function()
{
	await Site.loadApplet("vector-fields");
	
	const applet = new VectorField($("#output-canvas"));
	
	applet.loadPromise.then(() => run());
	
	
	
	function run()
	{
		const generatingCode = rawGLSLCheckboxElement.checked ? codeTextareaElement.value : Applet.parseNaturalGLSL(codeTextareaElement.value);
		
		const resolution = parseInt(resolutionInputElement.value || 500);
		const maxParticles = Math.max(parseInt(maxParticlesInputElement.value || 10000), 100);
		const dt = parseFloat(speedInputElement.value || 1) / 150;
		const lifetime = Math.min(parseInt(lifetimeInputElement.value || 100), 255);
		
		applet.run(generatingCode, resolution, maxParticles, dt, lifetime, 0, 0, .5);
	}
	
	
	
	function generateNewField()
	{
		const resolution = parseInt(resolutionInputElement.value || 500);
		const maxParticles = Math.max(parseInt(maxParticlesInputElement.value || 10000), 100);
		const dt = parseFloat(speedInputElement.value || 1) / 150;
		const lifetime = Math.min(parseInt(lifetimeInputElement.value || 100), 255);
		
		applet.generateNewField(resolution, maxParticles, dt, lifetime);
	}
	
	
	
	const examples =
	{
		"none": "",
		"sources-and-sinks": "((0.6x - 1)(0.6x + 1), (0.6y + 1)(0.6y - 1))",
		"saddle-points": "(0.49y^2, 1 - 0.49x^2)",
		"clockwork": "(sin(1.5y), -sin(1.5x))",
		"df": "(1, sin(y) / (x^2 + 1))",
		"cross": "(sin(y / 2.5), tan(x / 2.5))",
		"draggables": "(draggableArg.x * x - y, x + draggableArg.y * y)"
	};
	
	const exampleSelectorDropdownElement = $("#example-selector-dropdown");
	
	exampleSelectorDropdownElement.addEventListener("input", () =>
	{
		if (exampleSelectorDropdownElement.value !== "none")
		{
			codeTextareaElement.value = examples[exampleSelectorDropdownElement.value];
			
			run();
		}
	});
	
	
	
	const codeTextareaElement = $("#code-textarea");
	
	codeTextareaElement.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			e.preventDefault();
			
			run();
		}
	});
	
	
	
	const rawGLSLCheckboxElement = $("#raw-glsl-checkbox");
	
	
	
	const generateButtonElement = $("#generate-button");
	
	generateButtonElement.addEventListener("click", run);
	
	
	
	const resolutionInputElement = $("#resolution-input");
	
	const maxParticlesInputElement = $("#max-particles-input");
	
	const speedInputElement = $("#speed-input");
	
	const lifetimeInputElement = $("#lifetime-input");
	
	applet.setInputCaps([resolutionInputElement, maxParticlesInputElement], [1000, 50000]);
	
	
	
	resolutionInputElement.addEventListener("input", generateNewField);
	
	maxParticlesInputElement.addEventListener("input", generateNewField);
	
	speedInputElement.addEventListener("input", () =>
	{
		const dt = parseFloat(speedInputElement.value || 1) / 150;
		
		applet.wilsonUpdate.gl.useProgram(applet.wilsonUpdate.render.shaderPrograms[0]);
		applet.wilsonUpdate.gl.uniform1f(applet.wilsonUpdate.uniforms["dt"][0], dt);
		
		applet.wilsonUpdate.gl.useProgram(applet.wilsonUpdate.render.shaderPrograms[1]);
		applet.wilsonUpdate.gl.uniform1f(applet.wilsonUpdate.uniforms["dt"][1], dt);
		
		applet.wilsonUpdate.gl.useProgram(applet.wilsonUpdate.render.shaderPrograms[2]);
		applet.wilsonUpdate.gl.uniform1f(applet.wilsonUpdate.uniforms["dt"][2], dt);
		
		applet.wilsonUpdate.gl.useProgram(applet.wilsonUpdate.render.shaderPrograms[3]);
		applet.wilsonUpdate.gl.uniform1f(applet.wilsonUpdate.uniforms["dt"][3], dt);
	});
	
	lifetimeInputElement.addEventListener("input", generateNewField);
	
	
	
	const downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () => applet.wilson.downloadFrame("a-vector-field.png"));
	
	
	
	Page.show();
	}()