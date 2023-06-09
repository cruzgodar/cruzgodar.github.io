!function()
{
	"use strict";
	
	
	
	const fragShaderSource = `
		precision highp float;
		
		varying vec2 uv;
		
		uniform float juliaSetsPerSide;
		uniform float juliaSetSize;
		uniform float imageSize;
		uniform int numIterations;
		
		
		
		void main(void)
		{
			float a = (floor((uv.x + 1.0) / 2.0 * juliaSetsPerSide) / juliaSetsPerSide * 2.0 - 1.0) * 1.5 - .75;
			float b = (floor((uv.y + 1.0) / 2.0 * juliaSetsPerSide) / juliaSetsPerSide * 2.0 - 1.0) * 1.5;
			
			vec2 z = vec2((mod((uv.x + 1.0) / 2.0 * imageSize, juliaSetSize) / juliaSetSize * 2.0 - 1.0) * 1.5, (mod((uv.y + 1.0) / 2.0 * imageSize, juliaSetSize) / juliaSetSize * 2.0 - 1.0) * 1.5);
			float brightness = exp(-length(z));
			
			vec3 color = normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
			
			
			
			for (int iteration = 0; iteration < 100; iteration++)
			{
				if (iteration == numIterations)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
					return;
				}
				
				if (length(z) >= 2.0)
				{
					break;
				}
				
				z = vec2(z.x * z.x - z.y * z.y + a, 2.0 * z.x * z.y + b);
				
				brightness += exp(-length(z));
			}
			
			
			
			gl_FragColor = vec4(brightness / 10.0 * color, 1.0);
		}
	`;
	
	
	
	let options =
	{
		renderer: "gpu",
		
		shader: fragShaderSource,
		
		canvasWidth: 2000,
		canvasHeight: 2000,
		
		
		
		useFullscreen: true,
		
		useFullscreenButton: true,
		
		enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
		exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
	};
	
	let wilson = new Wilson(Page.element.querySelector("#output-canvas"), options);
	
	wilson.render.initUniforms(["juliaSetsPerSide", "juliaSetSize", "imageSize", "numIterations"]);
	
	
	
	let imageSize = 2000;
	const numIterations = 50;
	
	
	
	let generateButtonElement = Page.element.querySelector("#generate-button");

	generateButtonElement.addEventListener("click", drawFrame);
	
	
	
	let numJuliasInputElement = Page.element.querySelector("#num-julias-input");
	let juliaSizeInputElement = Page.element.querySelector("#julia-size-input");
	
	numJuliasInputElement.addEventListener("keydown", function(e)
	{
		if (e.keyCode === 13)
		{
			drawFrame();
		}
	});
	
	juliaSizeInputElement.addEventListener("keydown", function(e)
	{
		if (e.keyCode === 13)
		{
			drawFrame();
		}
	});
	
	
	
	let downloadButtonElement = Page.element.querySelector("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		wilson.downloadFrame("a-julia-set-mosaic.png");
	});
	
	
	
	Page.show();
	
	
	
	function drawFrame()
	{	
		let juliaSetsPerSide = parseInt(numJuliasInputElement.value || 100);
		let juliaSetSize = parseInt(juliaSizeInputElement.value || 20);
		imageSize = juliaSetsPerSide * juliaSetSize;
		
		
		
		wilson.changeCanvasSize(imageSize, imageSize);
		
		
		
		wilson.gl.uniform1f(wilson.uniforms["juliaSetsPerSide"], juliaSetsPerSide);
		wilson.gl.uniform1f(wilson.uniforms["juliaSetSize"], juliaSetSize);
		wilson.gl.uniform1f(wilson.uniforms["imageSize"], imageSize);
		wilson.gl.uniform1i(wilson.uniforms["numIterations"], numIterations);
		
		
		
		wilson.render.drawFrame();
	}
	}()