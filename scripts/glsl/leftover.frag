const float INVERSE_WP_TOL = 0.01;
const float INVERSE_WP_DX = 0.01;
const int INVERSE_WP_GRADIENT_DESCENT_BOUND = 100;

// Invert weierstrass p by hacky gradient descent -- actually works! really slow though
// test with wp(inverse_wp(z,rho),rho)
vec2 inverse_wp(vec2 z, vec2 tau) {
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

	vec2 a = tau/2.0 + .5*ONE;
	float ydist = cabs(z-wp(a,tau));
	float n = 0.0;
	float e = 0.0;
	float s = 0.0;
	float w = 0.0;
	float dir = 0.0;

	for (int step = 0; step < INVERSE_WP_GRADIENT_DESCENT_BOUND; step++) {
		if (ydist < INVERSE_WP_TOL) {
			return a;
		}
		// TODO: think how to reuse a calculation
		n = cabs(wp(a + INVERSE_WP_DX * tau*ydist,tau)- z);
		e = cabs(wp(a + INVERSE_WP_DX * ONE*ydist,tau)- z);
		s = cabs(wp(a - INVERSE_WP_DX * tau*ydist,tau)- z);
		w = cabs(wp(a - INVERSE_WP_DX * ONE*ydist,tau)- z);
		dir = n;
		if (dir > e) {
			dir = e;
		}
		if (dir > s) {
			dir = s;
		}
		if (dir > w) {
			dir = w;
		}
		if (dir == n) {
			a += INVERSE_WP_DX * ydist * tau;
		} else if (dir == e) {
			a += INVERSE_WP_DX * ydist * ONE;
		} else if (dir == s) {
			a -= INVERSE_WP_DX * ydist * tau;
		} else if (dir == w) {
			a -= INVERSE_WP_DX * ydist * ONE;
		}
		ydist = dir;
	}
	return ZERO;

}

// Inverse function to kleinJ
// Uses ``Method 4: Solving the quadratic in α'' from https://en.wikipedia.org/wiki/J-invariant
// inverse_j(kleinj(z)) is not an inverse tho
vec2 inverse_j(vec2 z) {

	// Test code: 1728.0*cdiv(cpow(g2(inverse_j(z)),3.0),cpow(g2(inverse_j(z)),3.0)-27.0 * cpow(g3(inverse_j(z)),2.0))
	// Should return the identity (it does!)

	vec2 temp = cdiv(432.0,z);
	vec2 a = 0.5 * (ONE + cpow(ONE-4.0*temp,0.5));
	return cmul(I,cdiv(hypergeometric2f1(1.0/6.0,5.0/6.0,1.0,ONE-a),hypergeometric2f1(1.0/6.0,5.0/6.0,1.0,a)));
}

// specialized version for inverse_g2_g3
// NOTE: can up F21_BOUND if needed for more precision
vec2 inverse_j_reduced(vec2 z) {
	// sqrt(27) = 5.19615242270663
	vec2 a = 0.5 * (ONE + 5.19615242270663*cpow(z,0.5));
	// can maybe save some calculations doing these both at once!
	return cmul(I,cdiv(hypergeometric2f1(1.0/6.0,5.0/6.0,1.0,ONE-a),hypergeometric2f1(1.0/6.0,5.0/6.0,1.0,a)));
}

vec2 inverse_j_reduced(float z) {
	// sqrt(27) = 5.19615242270663
	float a = 0.5 * (1.0 + 5.19615242270663*csqrt(z).x);
	return cmul(I,cdiv(hypergeometric2f1(1.0/6.0,5.0/6.0,1.0,1.0-a),hypergeometric2f1(1.0/6.0,5.0/6.0,1.0,a)));
}


const int ARITHMETIC_GEOMETRIC_MEAN_BOUND = 10;
const float ARITHMETIC_GEOMETRIC_MEAN_TOL = .001;

vec2 arithmetic_geometric_mean(vec2 x, vec2 y) {
	vec2 an = x;
	vec2 gn = y;
	for (int i = 0; i < ARITHMETIC_GEOMETRIC_MEAN_BOUND; i++) {
		if (cabs(an-gn) < ARITHMETIC_GEOMETRIC_MEAN_TOL) {
			break;
		}
		x = 0.5*(an+gn);
		y = csqrt(cmul(an,gn));

		an = x;
		gn = y;
	}
	return an;

}

vec2 agm(vec2 x, vec2 y) {
	return arithmetic_geometric_mean(x,y);
}

// weird function to satisfy wikipedia's equation for fundamental periods on https://en.wikipedia.org/wiki/Elliptic_curve
vec2 arithmetic_geometric_mean_for_g2_g3(vec2 x, vec2 y) {
	vec2 an = x;
	vec2 gn = y;
	for (int i = 0; i < ARITHMETIC_GEOMETRIC_MEAN_BOUND; i++) {
		if (cabs(an-gn) < ARITHMETIC_GEOMETRIC_MEAN_TOL) {
			break;
		}
		x = 0.5*(an+gn);
		y = csqrt(cmul(an,gn));
		if (cabs(x-y) > cabs(x+y)) {
			y = -y;
		}

		an = x;
		gn = y;
	}
	return an;

}

bool in_fun_domain(vec2 z) {
	if (cmag2(z)<1.0) {
		return false;
	} else if (z.x < -0.5) {
		return false;
	} else if (z.x > -0.5) {
		return false;
	}
	return true;
}

// how many steps to try to map to fun domain
const int MAX_FUN = 100;

// in: z in H
// out: z in D, i.e. |z|>1, |z.x|<.5
vec2 map_to_fun_domain(vec2 z) {
	for (int i = 0; i < MAX_FUN; i++) {
		if (cmag2(z)<1.0) {
			z = -cinv(z);
		} else if (z.x <= -0.5) {
			z += ONE;
		} else if (z.x > 0.5) {
			z -= ONE;
		} else {
			return vec2(cabs(z.x),z.y);
		}
	}
	return z;
}

// IN: g2 = a, g3 = b
// OUT: tau such that y^2 = 4x^3 - g2(tau)x - g3(tau) is isomorphic to y^2 = 4x^3 - ax - b
// 

//  oh my lord it actually works
// Test with inverse_g2_g3(g2(z),g3(z))

const float cube_root_three = 1.44224957;
const float cube_root_three_squared = 2.08008382;

const vec2 one_plus_root_three_i = vec2(1.0, 1.73205081);
const vec2 one_minus_root_three_i = vec2(1.0, -1.73205081);

vec2 inverse_g2_g3(vec2 a, vec2 b) {

	vec2 a3 = cpow(a,3.0);
	vec2 b2 = cpow(b,2.0);

	vec2 d = cpow(sqrt(3.0) *csqrt(a3 + 27.0* b2) - 9.0* b,1.0/3.0);

	// r1,r2,r3 work!
	vec2 r1 = 0.5* (d/cube_root_three_squared - cdiv(a,d)/cube_root_three);
	vec2 r2 = cdiv(cmul(one_plus_root_three_i,a),4.0*cube_root_three*d) - cmul(d, one_minus_root_three_i) /4.0 / cube_root_three_squared;
	vec2 r3 = cdiv(cmul(one_minus_root_three_i,a),4.0*cube_root_three*d) - cmul(d, one_plus_root_three_i) /4.0 / cube_root_three_squared;

	vec2 a0 = csqrt(r1-r3);
	vec2 b0 = csqrt(r1-r2);
	vec2 c0 = csqrt(r2-r3);

	d = cdiv(arithmetic_geometric_mean(c0,cmul(I,b0)),arithmetic_geometric_mean_for_g2_g3(a0,b0));
	return map_to_fun_domain(d);

	// fwiw this is a decent inverse right below the fundamental domain
	// // vec2 tau = inverse_j_reduced(cdiv(cpow(b,2.0),cpow(a,3.0)));
	
}


vec2 inverse_g2_g3(float a, float b) {
	return inverse_g2_g3(vec2(a, 0.0), vec2(b, 0.0));
}



// Returns the character of the irreducible su3 representation with highest weight (p,q)
// e.g. trivial rep is (0,0), 3-dim fundamental is (1,0), 8-dim adjoint is (1,1)
// dimension is value at zero: (p+1)(q+1)(p+q+2)/2
// Algorithm from https://math.stackexchange.com/questions/2852355/irreducible-characters-of-su3

vec2 su3_character(int p, int q, vec2 z) {
	vec2 summer = ZERO;
	float theta = z.x; //todo: change
	float phi = z.y*sqrt(2.0);
	for (int k = 0; k < 100; k++) {
		if (k >= q) {
			if (k > p+q) {
				break;
			}
			for (int l = 0; l < 100; l++) {
				if (l > q) {
					break;
				}
				summer += csin(float(k-l+1) * phi / 2.0)/csin(phi / 2.0) * cexp(-1.5 * I * float(k+l)*theta); 
			}
		}
	}
	return cmul(summer, cexp(I*theta*(float(p+2*q))));
}

vec2 su3_character(float p, float q, vec2 z) {
	return su3_character(int(p),int(q), z);
}



// benchmarking function
vec2 bench1000(vec2 z) {
	vec2 temp = z;
	for (int j = 0; j < 100; j++) {
		temp += wp(z,rho);
	}
	return temp;
}

// Plan: ctet(z,100) should look like W(-ln(z))/-ln(z)
// Test: cmul(lambert_w(z),cexp(lambert_w(z)))-z
// Is this supposed to look interesting? cdiv(lambert_w(-clog(z)),-clog(z))
vec2 lambert_w(vec2 x) {
	// This tries a few easy convergence patches, then if x doesn't lie in them
	// it runs a ton of more complicated ones and returns the closest one
	if (cmag2(x)<0.13) { // annoyingly low effective convergence radius
								   // 1/e (squared)
		vec2 summer = ZERO;
		vec2 xn = x;
		// \sum_n (-n)^(n-1)/n! x^n
		summer += 1.0 * xn; xn = cmul(xn,x);
		summer += -1.0 * xn; xn = cmul(xn,x);
		summer += 1.5 * xn; xn = cmul(xn,x);
		summer += -2.6666666666666665 * xn; xn = cmul(xn,x);
		summer += 5.208333333333333 * xn; xn = cmul(xn,x);
		summer += -10.8 * xn; xn = cmul(xn,x);
		summer += 23.343055555555555 * xn; xn = cmul(xn,x);
		summer += -52.01269841269841 * xn; xn = cmul(xn,x);
		summer += 118.62522321428571 * xn; xn = cmul(xn,x);
		summer += -275.5731922398589 * xn; xn = cmul(xn,x);
		summer += 649.7871723434745 * xn; xn = cmul(xn,x);
		summer += -1551.1605194805195 * xn; xn = cmul(xn,x);
		summer += 3741.4497029592385 * xn; xn = cmul(xn,x);
		summer += -9104.500241158019 * xn; xn = cmul(xn,x);
		summer += 22324.3085127066 * xn; xn = cmul(xn,x);
		summer += -55103.621972903835 * xn; xn = cmul(xn,x);
		summer += 136808.86090394293 * xn; xn = cmul(xn,x);
		summer += -341422.05066583835 * xn; xn = cmul(xn,x);
		summer += 855992.9659966076 * xn;
		return summer;
	} else {
		// this can use a touch up
		vec2 L1 = clog(x);
		vec2 L12 = cpow(L1,2.0);
		vec2 L13 = cpow(L1,3.0);
		vec2 L14 = cpow(L1,4.0);
		vec2 L15 = cpow(L1,5.0);

		vec2 L2 = clog(L1);
		vec2 L22 = cpow(L2,2.0);
		vec2 L23 = cpow(L2,3.0);
		vec2 L24 = cpow(L2,4.0);
		vec2 L25 = cpow(L2,5.0);

		vec2 summer = ZERO;
		// can reduce these a bit
		summer += L1;
		summer -= L2;
		summer += cdiv(L2,L1);
		summer += cdiv(-2.0*L2+ L22,2.0*L12);
		summer += cdiv(6.0*L2 -9.0*L22 +2.0*L23,6.0*L13);
		summer += cdiv(-12.0*L2 + 36.0*L22-22.0*L23+3.0*L24,12.0*L14);
		summer += cdiv(60.0*L2-300.0*L22+350.0*L23-125.0*L24+12.0*L25,60.0*L15);
		if (cmag2(x) > 9000.0) {
			return summer;
		}

		// method 0: above
		vec2 sol0 = summer;
		float err0 = cmag2(cmul(sol0,cexp(sol0))-x);
		float best_err = err0;

		// try a few methods, find the one with least error in magnitude
		// method 1: simple continued fraction
		summer = 190.0*ONE +13582711.0/94423.0*x;
		summer = 17.0*ONE + 1927.0*cdiv(x,summer);
		summer = 10.0*ONE + 133.0*cdiv(x,summer);
		summer = 3.0*ONE + 17.0*cdiv(x,summer);
		summer = 2.0*ONE + 5.0*cdiv(x,summer);
		summer = ONE + cdiv(x,summer);
		summer = ONE + cdiv(x,summer);
		summer = cdiv(x,summer);
		vec2 sol1 = summer;
		float err1 = cmag2(cmul(sol1,cexp(sol1))-x);

		if (err1 < best_err) {
			best_err = err1;
		}

		// method 2: exponential continued fraction--good for |W(x)|<1 in principle,
		// bad in practice

		// summer = ZERO;
		// for (int i = 0; i < 10; i++) {
		// 	summer = cdiv(x,cexp(summer));
		// }

		// vec2 sol2 = summer;
		// float err2 = cmag2(cmul(sol2,cexp(sol2))-x);
		// if (err2 < best_err) {
		// 	best_err = err2;
		// }

		// method 3: logarithmic continued fraction--good for |W(x)|>e in theory
		// I think this one's busted
		// summer = x;
		// for (int i = 0; i < 2; i++) {
		// 	summer = cdiv(x,clog(summer));
		// }
		// summer = clog(summer);
		// vec2 sol3 = summer;
		// float err3 = cmag2(cmul(sol3,cexp(sol3))-x);
		// if (err3 < best_err) {
		// 	best_err = err3;
		// }

		vec2 sol4 = sol0;
		float err4 = 1000.0;
		vec2 sol5 = x;
		float err5 = 100.0;
		if ((x.x>-0.4) && cabs(x.y)>0.4) { //it's got some confusion about the branch cut otherwise
			// Method 4: Numerical evaluation using Newton's method: https://en.wikipedia.org/wiki/Lambert_W_function#Numerical_evaluation
			vec2 w = ONE; //picking ONE makes the answer unstable elsewhere...
			vec2 ew = ONE;
			vec2 wew = ONE;
			for (int j = 0; j < 100; j++) {
				ew = cexp(w);
				wew = cmul(w,ew);
				w -= cdiv(wew-x,ew + wew-cdiv(cmul(w+2.0*ONE,wew-x),2.0*w+2.0*ONE));
				// TODO: add something to kill this early if it's close
			}
			sol4 = w;

			err4 = cmag2(wew-x);
			if (err4 < best_err) {
				best_err = err4;
			}
			// I honestly don't understand why this works
		} else if ((x.x<-0.4) || (x.x>2.2) || (x.y>.41) || (x.y<-.41)) { //here's some goofy heuristics
			// Method 4 v2: Numerical evaluation using Newton's method: https://en.wikipedia.org/wiki/Lambert_W_function#Numerical_evaluation
			vec2 w = sol0; 
			vec2 ew = ONE;
			vec2 wew = ONE;
			for (int j = 0; j < 100; j++) {
				ew = cexp(w);
				wew = cmul(w,ew);
				w -= cdiv(wew-x,ew + wew-cdiv(cmul(w+2.0*ONE,wew-x),2.0*w+2.0*ONE));
			}
			sol5 = w;

			err5 = cmag2(wew-x);
			if (err5 < best_err) {
				if ((x.y<0.0 && w.y<0.0) || (x.y>0.0 && w.y>0.0)) {
					best_err = err5;
				}
			}
		}

		vec2 sol6 = x;
		float err6 = 100.0;
		// manual patches around bad spots
		if (cmag2(x+.37*ONE)<.01) {
			vec2 w = ONE; 
			vec2 ew = ONE;
			vec2 wew = ONE;
			for (int j = 0; j < 100; j++) {
				ew = cexp(w);
				wew = cmul(w,ew);
				w -= cdiv(wew-x,ew + wew-cdiv(cmul(w+2.0*ONE,wew-x),2.0*w+2.0*ONE));
			}
			sol6 = w;

			err6 = cmag2(wew-x);
			if (err6 < best_err) {
				if ((x.y<0.0 && w.y<0.0) || (x.y>0.0 && w.y>0.0) || (cabs(x.y)<.00000001)) {
					best_err = err6;
				}
			}
		}

		// Now return best method
		if (best_err == err0) {
			return sol0;
		} else if (best_err == err1) {
			return sol1;
		// } else if (best_err == err2) {
			// this one is pretty useless
			// return sol2;
		// } else if (best_err == err3) {
		// 	return sol3;
		} else if (best_err == err4) {
			return sol4;
		} else if (best_err == err5) {
			return sol5;
		} else if (best_err == err6) {
			return sol6;
		}
	}
	return ZERO;
}

// Assumption: real(z)>0
vec2 digamma_helper(vec2 z) {
	
	vec2 summer = -0.57721566490153286060*ONE;
	for (int k = 0; k < 1000; k++) {
		summer += cdiv(z-ONE,float(k+1)*(float(k)*ONE+z));
	}
	return summer;

}

// TODO: consider implementing bernoulli formula
// check: digamma(z+ONE)-digamma(z)-cinv(z)
vec2 digamma(vec2 z) {
	// can use reflection formula:
	//gamma(x) = gamma(1-x) - pi cot pi x

	return digamma_helper(z);

}


vec2 polygamma_helper(float m, vec2 z) {
	vec2 summer = ZERO;
	float m_plus_one = m+1.0;
	for (int k = 0; k < 1000; k++) {
		summer += cpow(z+float(k)*ONE,-m_plus_one);
	}
	return cpow(-1.0,m_plus_one)*gamma(m_plus_one) * summer;
}

// Returns (m+1)th logarithmic derivative of the gamma function
// https://en.wikipedia.org/wiki/Polygamma_function
// Example: polygamma(0,z) is digamma
vec2 polygamma(float m, vec2 z) {
	// can think about rewriting these using hurwitz zeta
	if (m == 0.0) {
		return digamma(z);
	}
	return polygamma_helper(m,z);
}

vec2 polygamma(int m, vec2 z) {
	return polygamma(float(m),z);
}

vec2 trigamma(vec2 z) {
	return polygamma(1,z);
}

vec2 hurwitz_zeta_helper(vec2 s, vec2 a) {
	vec2 summer = ZERO;
	vec2 minus_s = -s;
	for (int k = 0; k < 1000; k++) {
		summer += cpow(a+float(k)*ONE,minus_s);
	}
	return summer;
}

const int HURWITZ_ZETA_BOUND = 5;

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

const int HURWITZ_ZETA_BOUND_PQ = 100;

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