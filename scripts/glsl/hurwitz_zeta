#function hurwitz_zeta hurwitz_zeta_helper
#requires cpow binomial
const int HURWITZ_ZETA_BOUND = 5;

vec2 hurwitz_zeta_helper(vec2 s, vec2 a) {
	vec2 summer = ZERO;
	vec2 minus_s = -s;
	for (int k = 0; k < 1000; k++) {
		summer += cpow(a+float(k)*ONE,minus_s);
	}
	return summer;
}

// can't call zeta rn LOL
// test with hurwitz_zeta(z,1.0/3.0)
// this one is pretty: hurwitz_zeta(3.0*ONE + 4.0*I,z)
vec2 hurwitz_zeta(vec2 s, vec2 a) {
	// for real a, Bailey and Borwein apparently have a decent algorithm
	if (a == ONE) {
		// return zeta(s);
	} else if (a == 0.5*ONE) {
		// return cmul(cpow(2.0,s)-ONE,zeta(s));
	}
	if (s.x > 1.0) {
		return hurwitz_zeta_helper(s,a);
		// can implement functional equation with (Apostol 1995, Miller and Adamchik 1999) for real, rational a,
		// read: https://mathworld.wolfram.com/HurwitzZetaFunction.html
	} else if (a.x>0.0) {
		// use hasse's formula from https://en.wikipedia.org/wiki/Hurwitz_zeta_function
		vec2 summer = ZERO;
		vec2 term = ZERO;
		for (int n = 0; n < HURWITZ_ZETA_BOUND; n++) {
			term = ZERO;
			for (int k = 0; k < HURWITZ_ZETA_BOUND; k++) {
				term += cpow(-1.0,float(k)) * binomial(float(n),float(k)) * cpow(a + float(k)*ONE,ONE-s);
			}
			summer += term/float(n+1);
		}
		return cdiv(summer,s-ONE);
	}
	return ZERO;
}

vec2 hurwitz_zeta(vec2 s, float a) {
	return hurwitz_zeta(s, vec2(a,0.0));
}
#endfunction

//const int HURWITZ_ZETA_BOUND_PQ = 100;

// test: hurwitz_zeta(z,1,2)
// also useful: hurwitz_zeta(z,1,1)
// currenty broken
// vec2 hurwitz_zeta(vec2 s, int p, int q) {
// 	// returns hurwitz_zeta(s,p/q)
// 	// can think about looking at gcd of p and q

// 	if ((s.x > 1.0) || (float(p)/float(q) > 0.0)) {
// 		return hurwitz_zeta(s,float(p)/float(q));
// 	}
	
// 	vec2 summer = ZERO;
// 	vec2 one_minus_s = ONE-s;
// 	for (int n = 1; n < HURWITZ_ZETA_BOUND_PQ; n++) {
// 		if (n > q) {
// 			break;
// 		}
// 		summer += cmul(csin(PI/2.0*s + 2.0*PI*float(n*p)/float(q)*ONE), hurwitz_zeta(ONE-s,float(n)/float(q)));
// 	}
// 	return 2.0 * cmul(gamma(one_minus_s),cpow(2.0*PI*float(q),s-ONE));
// }

// TODO: dirichlet characters and L-functions