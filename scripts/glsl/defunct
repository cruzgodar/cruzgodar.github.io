// Formula from Louis Saalschütz according to Wikipedia.
float bernoulli(float m)
{
	if (m > 1.0 && mod(m, 2.0) != 0.0)
	{
		return 0.0;
	}
	
	float summer = 0.0;
	
	for (int v = 0; v < 1000; v++) 
	{
		if (float(v) > m) 
		{
			break;
		}
		
		for (int k = 0; k < 1000; k++) 
		{
			if (float(k) > m) 
			{
				break;
			}
			
			summer += (1.0 - 2.0 * mod(float(v), 2.0)) * binomial(float(k),float(v)) * pow(float(v),m) / (float(k)+1.0);
		}
	}
	
	return summer;
}

const int INVERSE_E4_BOUND = 10;
// Returns *very* approximate x in fundamental domain such e4(x) = z (brute force)
// restrictions: |real(x)|<0.5, 0 < im(x) < 1, |x|^2 > 1
vec2 inverse_e4(vec2 z) {
	float constant = 0.5/float(INVERSE_E4_BOUND);
	float x_coord = 0.0;
	float y_coord = 0.0;

	int best_i = 0;
	int best_j = 0;
	float best_f = cmag2(ONE*1000.0);
	float cur_f = 0.0;

	for (int i = -INVERSE_E4_BOUND; i < INVERSE_E4_BOUND; i++) {
		for (int j = 0; j < 4 * INVERSE_E4_BOUND; j++) {
			x_coord = constant * float(i);
			y_coord = constant * float(j);
			if (x_coord*x_coord + y_coord*y_coord>1.0) {
				cur_f = cmag2(eisenstein4(vec2(x_coord, y_coord))-z);
				if (cur_f < best_f) {
					best_i = i;
					best_j = j;
					best_f = cur_f;
				}
			}
		}
	}
	return vec2(float(best_i)*constant, float(best_j)*constant);
}



// Algorithm from Baaquie's paper cited in
// https://math.stackexchange.com/questions/2852355/irreducible-characters-of-su3

vec2 su3_character(float p, float q, vec2 z) {
	vec2 summer = ZERO;
	summer -= cexp(I*((p+1.0)*z.y-(q+1.0)*z.x));
	summer += cexp(I*((p+1.0)*z.x-(q+1.0)*z.y));
	summer += cmul(cexp(-I*(p+1.0)*(z.x+z.y)),cexp(-I*(q+1.0)*z.x)-cexp(-I*(q+1.0)*z.y));
	summer += cmul(cexp(I*(q+1.0)*(z.x+z.y)),cexp(I*(p+1.0)*z.y)-cexp(I*(p+1.0)*z.x));
	summer = vec2(summer.y,-summer.x);
	return summer / (8.0 * csin((z.x-z.y)/2.0)*csin((z.x+2.0*z.y)/2.0)*csin((2.0*z.x+z.y)/2.0));
}

// float gamma_float_helper(float a) {
// 	a -= 1.0;

// 	// float y = GAMMA_CONST_0;
// 	// y += GAMMA_CONST_1 / (a + 1.0);
// 	// y += GAMMA_CONST_2 / (a + 2.0);
// 	// y += GAMMA_CONST_3 / (a + 3.0);
// 	// y += GAMMA_CONST_4 / (a + 4.0);
// 	// y += GAMMA_CONST_5 / (a + 5.0);
// 	// y += GAMMA_CONST_6 / (a + 6.0);
// 	// y += GAMMA_CONST_7 / (a + 7.0);
// 	// y += GAMMA_CONST_8 / (a + 8.0);
// 	// y += GAMMA_CONST_9 / (a + 9.0);
// 	float t = a+7.5;
// 	return sqrt(2.0*PI) * cpow(t, a+0.5) * cexp(-t) * y;
// }
// // TODO: make a faster version for real inputs since gamma(x\in R)\in R
// float gamma(float a) {
// 	// if (a < 0.5) {
// 	// 	return PI/(csin(PI * a)* gamma_float_helper(1.0 - a));
// 	// }
// 	return gamma_float_helper(a);
// }


vec2 hypergeometricf1(float a, float b1, float b2, float c, vec2 x, vec2 y) {

	if (x == ZERO) { // (17) from //mathworld.wolfram.com/AppellHypergeometricFunction.html
		return hypergeometric2f1(a,b2,c,y);
	} else if (y == ZERO) { // (18)
		return hypergeometric2f1(a,b1,c,x);
	} else if (x == y) { // (19) and (20)
		return hypergeometric2f1(a,b1+b2,c,x);
	} else if (b1 + b2 == c) {
		return cmul(cpow(ONE-y,-a),hypergeometric2f1(a,b1,b1+b2,cdiv(x-y,ONE-y)));
	}

	int transformation_equation = xy_in_f1_domain(x,y);
	if (transformation_equation == 1) {
		return hypergeometricf1_helper(a,b1,b2,c,x,y);
	} else if (transformation_equation == 15) {
		return cmul(cmul(cpow(ONE-x,-b1),cpow(ONE-y,-b2)), hypergeometricf1_helper(c-a,b1,b2,c,u,w));
	} else if (transformation_equation == 16) {
		return cmul(cpow(ONE-x,-a), hypergeometricf1_helper(a,c-b1-b2,b2,c,u,w));
	} else if (transformation_equation == 17) {
		return cmul(cpow(ONE-y,-a), hypergeometricf1_helper(a,b1,c-b1-b2,c,u,w));
	} else if (transformation_equation == 24) {
		// only accurate for large arguments
		vec2 summer = gamma(c)*gamma(b1-a)/gamma(b1)/gamma(c-a)*cmul(cpow(-x,-a), hypergeometricf1_helper(a,1.0+a-c,b2,a-b1+1.0,u,w));
		summer += gamma(c)*gamma(a-b1)/gamma(a)/gamma(c-b1)*cmul(cpow(-x,-b1), hypergeometricg2(b1,b2,a-b1,1.0+b1-c,-u,-y));
		return summer;
	}

	return ZERO;
}

int xy_in_f1_domain(vec2 x, vec2 y) {

	// Check if x,y in unit circle
	if (cmag2(x) < 1.0) {
		if (cmag2(y) < 1.0) { // (1) denotes id
			return 1;
		}
	}
	// Otherwise, use analytic continuation
	// Subroutine: find best convergence zone
	float tmax = 10000.0;
	int transformation_equation = -1; // these ae equations from Colavecchia et al

	vec2 u = cdiv(x,x-ONE);
	vec2 w = cdiv(y,y-ONE);
	float tcur = cmag2(u) + cmag2(w);
	if (tcur < tmax) {
		tmax = tcur;
		transformation_equation = 15;
	}

	w = cdiv(x-y,x-ONE);
	tcur = cmag2(u) + cmag2(w);
	if (tcur < tmax) {
		tmax = tcur;
		transformation_equation = 16;
	}

	u = cdiv(y-x,y-ONE);
	w = cdiv(y,y-ONE);
	tcur = cmag2(u) + cmag2(w);
	if (tcur < tmax) {
		tmax = tcur;
		transformation_equation = 17;
	}

	u = cdiv(1.0,x);
	w = cdiv(y,x);
	tcur = cmag2(u) + cmag2(w);
	if (tcur < tmax) {
		tmax = tcur;
		transformation_equation = 24;
	}

	return transformation_equation;
}

const int INVERSE_WP_BOUND = 5;

// Works! test with wp(inverse_wp(z,rho),rho)
// Very slow though.
vec2 inverse_wp(vec2 z, vec2 tau) {
	// TODO: slowly implement exact inverses with F1
	// TODO: implement version for z real? r_i aren't though
	if (tau.y < 0.0) {
		tau = -tau;
	}

	vec2 r1 = wp(0.5*ONE,tau);
	vec2 r2 = wp(tau/2.0,tau);
	vec2 r3 = wp(0.5*ONE + tau/2.0,tau);

	vec2 x = cdiv(r2-r1,z-r1);
	vec2 y = cdiv(r3-r1,z-r1);

	if (xy_in_f1_domain(x,y) ==1) {
		return cdiv(-1.0*hypergeometricf1(0.5,0.5,0.5,1.5,x,y), cpow(z-r1,0.5));
	}

	// tau.x = fract(tau.x);

	// cannot mod out z

	float constant = 0.5/float(INVERSE_WP_BOUND);
	float x_coord = 0.0;
	vec2 y_coord = ZERO;

	int best_i = 0;
	int best_j = 0;
	float best_f = 1000.0;
	float cur_f = 0.0;

	for (int i = 0; i < INVERSE_WP_BOUND+1; i++) {
		for (int j = 0; j < 2*INVERSE_WP_BOUND+1; j++) {
			x_coord = constant * float(i);
			y_coord = constant * tau * float(j);
			cur_f = cmag2(wp(vec2(x_coord, 0.0)+y_coord,tau)-z);
			if (cur_f < best_f) {
				best_i = i;
				best_j = j;
				best_f = cur_f;
			}
		}
	}
	vec2 best_z = vec2(float(best_i)*constant,0.0) +  float(best_j)*constant*tau;
	best_z -= floor(best_z.y/tau.y)*tau;
	best_z.x = fract(best_z.x);
	return best_z;

}