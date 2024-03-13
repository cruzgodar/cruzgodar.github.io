import { getGlslBundle, loadGlsl } from "../../../../scripts/src/complexGlsl.js";
import { showPage } from "../../../../scripts/src/loadPage.js";
import { $ } from "/scripts/src/main.js";
import { Wilson } from "/scripts/wilson.js";

!async function()
{
	"use strict";
	
	
	
	await loadGlsl();
	


	let tests =
	[
		// ` //comment me for syntax highlighting
/*0*/	`return cadd(ONE, ONE) == vec2(2.0, 0.0);`,
		`return csub(I, ONE) == vec2(-1.0, 1.0);`,
		`return cmul(I+ONE,ONE-2.0*I) == vec2(3.0, -1.0);`,
		`return cdiv(ONE, ONE+I) == vec2(0.5, -0.5);`,
		`return cinv(I) == -I;`,
		`return cpow(I, I) == vec2(cexp(-PI/2.0),0.0);`,
		`return ctet(2.0, 3.0) == 16.0;`,
		`return equal_within_relative_tolerance(cpow(ONE+I,ONE+I),vec2(0.273957253830121, 0.583700758758615));`, // this one bottlenecks TOL... fails for .0000000001
		`return divisor(4.0,10.0) == 1049601.0;`,
		`return factorial(8.0) == 40320.0;`,
/*10*/	`return binomial(3.0,2.0) == 3.0;`,
		`return binomial(10.0,4.0) == 210.0;`,
		`return equal_within_relative_tolerance(gamma(4.0), 6.0);`,
		`return equal_within_relative_tolerance(-30.0*bernoulli(4.0),1.0);`,
		// trig
			// sin
		`return equal_within_relative_tolerance(csin(I), vec2(0.0,1.17520119364380145688238185059560));`,
		`return equal_within_relative_tolerance(csin(ONE), vec2(0.84147098480789650665250232163,0.0));`,
			// cos
		`return equal_within_relative_tolerance(ccos(ONE), vec2(0.54030230586813971740093660,0.0));`,
			// tan
		`return ctan(ZERO) == ZERO;`,
		`return ctan(I) == vec2(0.0,0.761594155955764888119458282604);`,
		`return equal_within_relative_tolerance(ctan(ONE+I), cdiv(csin(ONE+I),ccos(ONE+I)));`,
/*20*/	`return equal_within_relative_tolerance(ctan(ONE), vec2(1.55740772465490223050697480745,0.0));`,
			// csc
		`return equal_within_relative_tolerance(ccsc(ONE-I), vec2(0.621518017170428, 0.303931001628426));`,
			// sec
		`return equal_within_relative_tolerance(csec(2.0*ONE-I), vec2(-0.413149344266940, - 0.687527438655479));`,
			// cot
		`return equal_within_relative_tolerance(ccot(PI*ONE/4.0),ONE);`,
		`return equal_within_relative_tolerance(ccot(I),vec2(0.0, -1.31303528549933130363616));`,
		// arc trig
			// asin
		`return casin(I) == cmul(I,clog(ONE+cpow(2.0,0.5)*ONE));`,
			// acos
		`return cacos(I) == PI*ONE/2.0 + cmul(I,clog(-ONE+cpow(2.0,0.5)*ONE));`,
			// atan
		`return equal_within_relative_tolerance(catan(0.5*ONE),ONE*0.463647609000806116214256);`,
		`return equal_within_relative_tolerance(catan(ONE+I), PI/4.0*ONE + 0.5*cmul(I,clog(2.0*ONE-I)));`,
			// acsc
		`return cacsc(I) == cmul(-I,clog(ONE+cpow(2.0,0.5)*ONE));`,
			// asec
/*30*/	`return casec(I) == PI*ONE/2.0 + cmul(I,clog(ONE+cpow(2.0,0.5)*ONE));`,
			// acot
		`return equal_within_relative_tolerance(cacot(ONE), PI*ONE/4.0);`,
		// hyperbolic trig
			// sinh
		`return csinh(I*PI/2.0) == I;`,
			// cosh
		`return ccosh(I*PI) == -ONE;`,
			// tanh
		`return equal_within_relative_tolerance(ctanh(I*PI/4.0), I);`,
			// csch
		`return ccsch(I*PI/2.0) == -I;`,
			// sech
		`return csech(I*PI) == -ONE;`,
			// coth
		`return equal_within_relative_tolerance(ccoth(I*PI/4.0), -I);`,
		// hyperbolic arc trig -- these are a bit rougher in terms of accuracy
		// also important to test branch cuts since they're tricky
			// asinh
		`return equal_within_relative_tolerance(casinh(I/2.0), I*PI/6.0);`,
		`return equal_within_relative_tolerance(casinh(-I/2.0), -I*PI/6.0);`,
			// acosh
/*40*/	`return equal_within_relative_tolerance(cacosh(I/2.0), vec2(0.481211825059603,1.57079632679490));`,
		`return equal_within_relative_tolerance(cacosh(-I/2.0), vec2(0.481211825059603,-1.57079632679490));`,
			// atanh
		`return equal_within_relative_tolerance(catanh(ONE+I/2.0), vec2(0.708303336014054, 0.907887494960880));`,
		`return equal_within_relative_tolerance(catanh(ONE-I/2.0), vec2(0.708303336014054, -0.907887494960880));`,
			// acsch
		`return equal_within_relative_tolerance(cacsch(ONE+I/2.0), vec2(0.763884345953711, -0.311225797244761));`,
		`return equal_within_relative_tolerance(cacsch(ONE-I/2.0), vec2(0.763884345953711, 0.311225797244761));`,
			// asech
		`return equal_within_relative_tolerance(casech(ONE+I/2.0), vec2(0.533218290584112, -0.797709970075392));`,
		
		`return equal_within_relative_tolerance(casech(ONE-I/2.0), vec2(0.533218290584112, 0.797709970075392));`,
			// acoth
		`return equal_within_relative_tolerance(cacoth(ONE+I/2.0), vec2(0.708303336014054, -0.662908831834016));`,
		`return equal_within_relative_tolerance(cacoth(ONE-I/2.0), vec2(0.708303336014054, 0.662908831834016));`,
		// special functions
			// zeta
/*50*/ 	`return equal_within_relative_tolerance(zeta(I), vec2(0.00330022368532410, -0.418155449141322));`,
		`return equal_within_relative_tolerance(zeta(2.0*ONE-I), vec2(1.15035570325490, 0.437530865919608));`,
			// eisenstein series
		`return equal_within_absolute_tolerance(g2(rho),ZERO);`, //this one's pretty sensitive
		`return equal_within_absolute_tolerance(g3(rho),820.824 *ONE);`,
		`return equal_within_absolute_tolerance(g2(I),189.073 *ONE);`, //this one's pretty sensitive
		`return equal_within_absolute_tolerance(g3(I),ZERO);`,
			// weierstrass p
		`return equal_within_absolute_tolerance(wp(I,rho),4.20405 *ONE);`,
		`return equal_within_absolute_tolerance(wp(rho,I),5.36882 *ONE);`,
			// weierstrass p'
		`return equal_within_absolute_tolerance(wpprime(I,rho),22.8826 *I);`,
		`return equal_within_absolute_tolerance(wpprime(rho,I),-19.902 *I);`,
			// kleinj
/*60*/	`return equal_within_relative_tolerance(kleinJ(I),ONE);`,
		`return equal_within_relative_tolerance(kleinJ(25.0*ONE+2.0*I),166.375*ONE);`,
			// 2F1
		`return equal_within_absolute_tolerance(hypergeometric2f1(0.1,0.2,0.3,rho),vec2(0.96337183439893319229154, 0.0345873415880728314444805284));`,
		`return equal_within_absolute_tolerance(hypergeometric2f1(1.1,-0.2,0.7,0.1*ONE-I),vec2(1.08966, 0.262795));`,
			// F1 -still runs too slow to test
		// `return equal_within_absolute_tolerance(hypergeometricf1(0.3, 1.1, 0.4, 0.1, 0.1*ONE-I, -0.1*ONE+I),vec2(-0.620602, -0.834949));`,
			// Delta -- these are pretty cool
		`return equal_within_relative_tolerance(delta(I),ONE*cpow(gamma(1.0/4.0),24.0)/(16777216.0* cpow(PI,18.0)));`, // .001785
		`return equal_within_sharp_absolute_tolerance(delta(rho),-27.0*ONE*cpow(gamma(1.0/3.0),36.0)/(16777216.0* cpow(PI,24.0)));`, // -.004805
			// SU3 stuff
			// unstable at zero
		`return equal_within_absolute_tolerance(su3_character(3,4,.01*I),90.0*ONE);`,
			// rising factorials
		`return equal_within_relative_tolerance(rising_factorial(-8.0,2),56.0);`,
		`return equal_within_relative_tolerance(rising_factorial(7.5,3),605.625);`,
		`return equal_within_relative_tolerance(rising_factorial(-3.1,-3),-0.007840001254400200704032);`,
/*70*/  `return equal_within_relative_tolerance(rising_factorial(-2.0,-3),-1.0/60.0);`,
		`return equal_within_relative_tolerance(rising_factorial(-4.0,-3),-1.0/210.0);`,
			// negative float exponentiation
		`return equal_within_relative_tolerance(cpow(-1.0,2.0),1.0);`,
		`return equal_within_relative_tolerance(cpow(-1.0,-1.0),-1.0);`,
		`return equal_within_relative_tolerance(cpow(-1.0,ONE),-ONE);`,
		`return equal_within_relative_tolerance(cpow(-1.0,ONE/2.0),I);`,
		`return equal_within_absolute_tolerance(ctet(I,2.0),0.2079*ONE);`,
			// Lambert W
		`return equal_within_absolute_tolerance(lambert_w(vec2(-3.249538538483136,3.2274562027852958)),vec2(0.98397810868565668,1.4010764370433776));`,
		`return equal_within_absolute_tolerance(lambert_w(vec2(-0.009898889724885729, 0.20871443884942303)),vec2(0.030846799185485886,0.20024000517866644));`,
			//why doesn't this work for ONE exactly?
		`return equal_within_absolute_tolerance(lambert_w(ONE+.0000001*I), 0.5671432904097838729999686622103*ONE);`,
/*80*/	`return equal_within_absolute_tolerance(lambert_w(-ONE*PI/2.0), I*PI/2.0);`,
		`return equal_within_absolute_tolerance(lambert_w(-ONE*cinv(2.7181828459)), -ONE);`,
			//digamma
		`return equal_within_absolute_tolerance(digamma(40.45959427318573*ONE + 25.50759401525997*I),vec2(3.858773893848084409,0.5681140543684587976));`,
		`return equal_within_relative_tolerance(digamma(ONE),-0.57721566490153286060*ONE);`,
		`return equal_within_absolute_tolerance(digamma(ONE/2.0),-2.0*log(2.0)*ONE-0.57721566490153286060*ONE);`,
		`return equal_within_absolute_tolerance(digamma(-I),vec2(0.094650320622476977271,-2.076674047468581174134));`,
			// polygamma
		`return equal_within_absolute_tolerance(polygamma(1,I),vec2(-0.5369999033772362, -0.794233542759318865583));`,
		`return equal_within_absolute_tolerance(polygamma(10,2.0*ONE+I),vec2(-185.17306557513192307, -484.8781994177458189));`,
			// honestly surprised this works 
		`return equal_within_absolute_tolerance(polygamma(2.5,2.0*ONE+I),vec2(-0.0258830, -0.0752557 ));`,
			// arithmetic_geometric_mean
		`return equal_within_absolute_tolerance(agm(2.0*ONE,I),vec2(1.010051593619580924333050617727020, 0.7426464223997775055939));`,
		`return powermod(2,31,7) == 2;`,
		`return powermod(3,600,4) == 1;`,
	]
	
	
	
	let wilson;
	
	let canvasLocationElement = $("#canvas-location");
	
	
	
	function unitTest(shader)
	{
		try
		{
			try
			{
				wilson.outputCanvasContainer.parentNode.remove();
				
				canvasLocationElement.insertAdjacentHTML("afterend", `
					<canvas id="output-canvas" class="output-canvas"></canvas>
				`);
			}
			
			catch(ex) {}
			
			
			
			let fragShaderSource = /* glsl */`
				precision highp float;
				
				varying vec2 uv;
				
				
				
				${getGlslBundle(shader)}
				
				
				
				bool unitTest(void)
				{
					${shader};
				}
				
				
				
				void main(void)
				{
					if (unitTest())
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
				
				shader: fragShaderSource,
				
				canvasWidth: 1,
				canvasHeight: 1
			};
			
			wilson = new Wilson($("#output-canvas"), options);
			
			
			
			wilson.render.drawFrame();
			
			let pixelData = wilson.render.getPixelData();
			
			if (pixelData[0] === 0)
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
		console.log(`Starting test ${i}: ${tests[i]}`);
		
		let result = unitTest(tests[i]);
		
		if (result === 0)
		{
			passes++;
		}
		
		if (result === 1)
		{
			console.error(`Test ${i} returned false: ${tests[i]}`);
			
			passedEverything = false;
			
			break;
		}
	}
	
	
	
	showPage();
}()