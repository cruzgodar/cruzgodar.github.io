!async function()
{
	"use strict";
	
	
	
	if (!Site.scripts_loaded["glsl"])
	{
		await Site.load_glsl();
	}
	

// I'm concerned that I can't get cos(i) to work... or (1+I)^(1+I)... or tan(pi/2)
	let tests =
	[
		`
			return cadd(ONE, ONE) == vec2(2.0, 0.0);
		`,`
			return csub(I, ONE) == vec2(-1.0, 1.0);
		`,`
			return cmul(I+ONE,ONE-2.0*I) == vec2(3.0, -1.0);
		`,`
			return cdiv(ONE, ONE+I) == vec2(0.5, -0.5);
		`,`
			return cinv(I) == -I;
		`,`
			return cpow(I, I) == vec2(cexp(-PI/2.0),0.0);
		`,`
			return ctet(2.0, 3.0) == 16.0;
		`,`
			return csin(I) == vec2(0.0,1.17520119364380145688238185059560);
		`,`
			return csin(ONE) == vec2(0.84147098480789650665250232163,0.0);
		`,`
			return ccos(ONE) == vec2(0.54030230586813971740093660,0.0);
		`,`
			return ctan(ZERO) == ZERO;
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