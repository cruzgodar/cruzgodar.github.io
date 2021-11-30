!async function()
{
	"use strict";
	
	
	
	if (!Site.scripts_loaded["glsl"])
	{
		await Site.load_glsl();
	}
	

// I'm concerned that I can't get cos(i) to work... or (1+I)^(1+I)... or tan(pi/2)
// WIshlist/these tests fail: 
		// return ctan(ONE+I) == cdiv(csin(ONE+I),ccos(ONE+I));
		// `return ccot(PI*ONE/4.0) == ONE;`,
		// `return ccot(I) == vec2(0.0, -1.31303528549933130363616);`,
		// `return -30.0*bernoulli(4.0) == 1.0;`
		// return ctan(ONE) == vec2(1.55740772465490223050697480745,0.0);`
		// `return gamma(4.0) == 6.0;`
		// `return cabs(gamma(4.0) - vec2(6.0,0.0)) < TOL;`
		// `return catan(ONE+I) == PI/4.0 + 0.5*cmul(I,clog(2.0*ONE-I));`,


// TODO: add tolerance for floating point precision stuff
// comments mean manually verified... at some point
	let tests =
	[
/*0*/	`return cadd(ONE, ONE) == vec2(2.0, 0.0);`,
		`return csub(I, ONE) == vec2(-1.0, 1.0);`,
		`return cmul(I+ONE,ONE-2.0*I) == vec2(3.0, -1.0);`,
		`return cdiv(ONE, ONE+I) == vec2(0.5, -0.5);`,
		`return cinv(I) == -I;`,
		`return cpow(I, I) == vec2(cexp(-PI/2.0),0.0);`,
		`return ctet(2.0, 3.0) == 16.0;`,
		`return divisor(4.0,10.0) == 1049601.0;`,
		`return factorial(8.0) == 40320.0;`,
		`return binomial(3.0,2.0) == 3.0;`,
/*10*/	`return binomial(10.0,4.0) == 210.0;`,
		// trig
		`return csin(I) == vec2(0.0,1.17520119364380145688238185059560);`,
		`return csin(ONE) == vec2(0.84147098480789650665250232163,0.0);`,
		`return ccos(ONE) == vec2(0.54030230586813971740093660,0.0);`,
		`return ctan(ZERO) == ZERO;`,
		`return ctan(I) == vec2(0.0,0.761594155955764888119458282604);`,
		// arc trig
		`return casin(I) == cmul(I,clog(ONE+cpow(2.0,0.5)*ONE));`,
		`return cacos(I) == PI*ONE/2.0 + cmul(I,clog(-ONE+cpow(2.0,0.5)*ONE));`,
		// `return catan(0.5*ONE) == ONE*0.463647609000806116214256;`,
		`return cacsc(I) == cmul(-I,clog(ONE+cpow(2.0,0.5)*ONE));`,
		`return casec(I) == PI*ONE/2.0 + cmul(I,clog(ONE+cpow(2.0,0.5)*ONE));`,
		// `return cacot(ONE) == PI*ONE/4.0;`,
		// hyperbolic trig
/*20*/	`return csinh(I*PI/2.0) == I;`,
		`return ccosh(I*PI) == -ONE;`,
		// `return ctanh(I*PI/4.0) == I;`,
		`return ccsch(I*PI/2.0) == -I;`,
		`return csech(I*PI) == -ONE;`,
		// `return ccoth(I*PI/4.0) == -I;`,
		// hyperbolic arc trig
		// `return casinh(I) == I*PI/2.0;`,
		// `return cacosh(I) == 1.31695789692481670862504634730*ONE;`,
		// tested the rest of hyperbolic arc trig manually...
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