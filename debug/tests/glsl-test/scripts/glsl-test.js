!async function()
{
	"use strict";
	
	
	
	if (!Site.scripts_loaded["glsl"])
	{
		await Site.load_glsl();
	}
	
	
	
	let tests =
	[
		`
			return cadd(ONE, ONE) == vec2(2.0, 0.0);
		`
	];
	
	
	
	let wilson = null;
	
	let canvas_location_element = document.querySelector("#canvas-location");
	
	
	
	function unit_test(shader)
	{
		try
		{
			try
			{
				wilson.output_canvas_container.parentNode.remove();
				
				canvas_location_element.insertAdjacentHTML("beforebegin", `
					<div>
						<canvas id="output-canvas" class="output-canvas"></canvas>
					</div>
				`);
			}
			
			catch(ex) {}
			
			
			
			let frag_shader_source = `
				precision highp float;
				
				varying vec2 uv;
				
				
				
				${COMPLEX_GLSL}
				
				
				
				bool unit_test(void)
				{
					${shader};
				}
				
				
				
				void main(void)
				{
					if (unit_test())
					{
						gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
					}
					
					else
					{
						gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
					}
				}
			`;
			
			let options =
			{
				renderer: "gpu",
				
				shader: frag_shader_source,
				
				canvas_width: 1,
				canvas_height: 1
			};
			
			wilson = new Wilson(document.querySelector("#output-canvas"), options);
			
			
			
			wilson.render.draw_frame();
			
			let pixel_data = wilson.render.get_pixel_data();
			
			if (pixel_data[0] === 0)
			{
				return 0;
			}
			
			return 1;
		}
		
		catch(ex)
		{
			return 2;
		}
	}
	
	
	
	let passes = 0;
	
	for (let i = 0; i < tests.length; i++)
	{
		console.log(`Starting test ${i}`);
		
		let result = unit_test(tests[i]);
		
		if (result === 0)
		{
			passes++;
		}
		
		if (result === 1)
		{
			console.error(`Test ${i} returned false:`);
			
			console.error(tests[i]);
			
			passed_everything = false;
			
			break;
		}
	}
}()