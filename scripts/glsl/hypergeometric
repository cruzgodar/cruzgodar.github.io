#function hypergeometric2f1 hypergeometric2f1_helper f21
#requires cpow clog casin csqrt gamma ccsc
const int F21_BOUND = 10;

// because I can't get enough of long function names
vec2 hypergeometric2f1_helper(float a, float b, float c, vec2 z) {
	if (b == c) {
		return cpow(ONE-z,-a);
	} else if (a == 1.0) {
		if (b == 1.0) {
			if (c == 2.0) {
				return cdiv(clog(ONE-z),-z);
			}
		}
	} else if (a == 0.5) {
		if (b == 0.5) {
			if (c == 1.5) {
				return cdiv(casin(csqrt(z)),csqrt(z));
			}
		}
	// } else if (b == a+0.5) { // from https://reference.wolfram.com/language/ref/Hypergeometric2F1.html
		// if (c == 2.0*a) {
			// I cant for the life of me figure out why this isn't working
			// return cdiv(cpow(2.0,2.0*a-1.0) * cpow(csqrt(ONE-z)+1.0,1.0-2.0*a) ,csqrt(ONE-z));
		// }
	}
		// can add some goofy quadratic ones for 2f1(1/3,2/3,3/2,z) if the mood strikes you

	vec2 summer = ONE;
    float term = 1.0;
    vec2 zn = ONE;
    for (int n = 0; n < F21_BOUND; n++) {
        term *= a+float(n);
        term *= b+float(n);
        term /= c+float(n);
        term /= float(n+1);
        zn = cmul(z,zn);
        summer += term*zn;
    }
    return summer;
}

// float version
vec2 hypergeometric2f1_helper(float a, float b, float c, float z) {
	if (b == c) {
		return ONE*cpow(1.0-z,-a);
	} else if (a == 1.0) {
		if (b == 1.0) {
			if (c == 2.0) {
				return ONE*cdiv(clog(1.0-z),-z);
			}
		}
	} else if (a == 0.5) {
		if (b == 0.5) {
			if (c == 1.5) {
				return ONE*cdiv(casin(csqrt(z)),csqrt(z));
			}
		}
	// } else if (b == a+0.5) { // from https://reference.wolfram.com/language/ref/Hypergeometric2F1.html
	// 	if (c == 2.0*a) {
			// I cant for the life of me figure out why this isn't working
			// return cdiv(cpow(2.0,2.0*a-1.0) * cpow(csqrt(ONE-z)+1.0,1.0-2.0*a) ,csqrt(ONE-z));
		// }
	}
		// can add some goofy quadratic ones for 2f1(1/3,2/3,3/2,z) if the mood strikes you

	float summer = 1.0;
    float term = 1.0;
    float zn = 1.0;
    for (int n = 0; n < F21_BOUND; n++) {
        term *= a+float(n);
        term *= b+float(n);
        term /= c+float(n);
        term /= float(n+1);
        zn *= z;
        summer += term*zn;
    }
    return vec2(summer,0.0);
}

// Returns 2F1(a,b,c,z) a la https://en.wikipedia.org/wiki/Hypergeometric_function
// Can add some more patches to improve convergence, meh. Currently converges extremely well away from |z|=1
// ideas for more: https://fredrikj.net/blog/2015/10/the-2f1-bites-the-dust/
vec2 hypergeometric2f1(float a, float b, float c, vec2 z) {
	
	if (cmag2(z) <= 1.0) {
        return hypergeometric2f1_helper(a,b,c,z);
    } else {
    	vec2 summer = cmul(cpow(-z,-a)/(gamma(b)*(gamma(c-a))*gamma(a-b+1.0)),hypergeometric2f1_helper(a,a-c+1.0,a-b+1.0,cinv(z)));
    	summer -= cmul(cpow(-z,-b)/(gamma(a)*(gamma(c-b))*gamma(b-a+1.0)),hypergeometric2f1_helper(b,b-c+1.0,b-a+1.0,cinv(z)));
    	return gamma(c)*PI*ccsc(PI*(b-a))*summer;
    }
}

// float version
vec2 hypergeometric2f1(float a, float b, float c, float z) {
	if (z*z <= 1.0) {
        return hypergeometric2f1_helper(a,b,c,z);
    } else {
    	vec2 Z = vec2(z,0.0);
    	vec2 summer = cmul(cpow(-Z,-a)/(gamma(b)*(gamma(c-a))*gamma(a-b+1.0)),hypergeometric2f1_helper(a,a-c+1.0,a-b+1.0,1.0/z));
    	summer -= cmul(cpow(-Z,-b)/(gamma(a)*(gamma(c-b))*gamma(b-a+1.0)),hypergeometric2f1_helper(b,b-c+1.0,b-a+1.0,1.0/z));
    	return gamma(c)*PI*ccsc(PI*(b-a))*summer;
    }
}

// because I hate typing long function names
vec2 f21(float a, float b, float c, vec2 z) {
	return hypergeometric2f1(a,b,c,z);
}
#endfunction



#function hypergeometricf2 hypergeometricf2_helper
#requires hypergeometric2f1
const int F2_BOUND = 10;

// This is correct for |x| + |y| < 1
vec2 hypergeometricf2_helper(float a, float b1, float b2, float c1, float c2, vec2 x, vec2 y) {
	vec2 summer = hypergeometric2f1(a,b1, c1,x);
	summer = cmul(summer,hypergeometric2f1(a,b2, c2,y));

	float term = 1.0;
	vec2 vec_term = ZERO;
	vec2 xyr = ONE;

	for (int r = 1; r < F2_BOUND; r++) {
		term *= a + float(r-1);
		term *= b1 + float(r-1);
		term *= b2 + float(r-1);
		term /= c1 + float(r-1);
		term /= c2 + float(r-1);
		term /= float(r);
		xyr = cmul(cmul(xyr,x),y);

		vec_term = xyr;
		vec_term = cmul(vec_term,hypergeometric2f1(a+float(r),b1 + float(r), c1+float(2*r),x));
		vec_term = cmul(vec_term,hypergeometric2f1(a+float(r),b2 + float(r), c2+float(2*r),y));		
		summer += term*vec_term;
		
	}
    return summer;
}

// Check (49) and (82) from
// https://www.tandfonline.com/doi/pdf/10.1080/10652469.2013.822207?needAccess=true
vec2 hypergeometricf2_helper(float a, float b1, float b2, float c1, float c2, float x, float y) {
	vec2 summer = hypergeometric2f1(a,b1, c1,x);
	summer = cmul(summer,hypergeometric2f1(a,b2, c2,y));

	float term = 1.0;
	vec2 vec_term = ZERO;
	vec2 xyr = ONE;

	for (int r = 1; r < F2_BOUND; r++) {
		term *= a + float(r-1);
		term *= b1 + float(r-1);
		term *= b2 + float(r-1);
		term /= c1 + float(r-1);
		term /= c2 + float(r-1);
		term /= float(r);
		xyr = cmul(cmul(xyr,x),y);

		vec_term = xyr;
		vec_term = cmul(vec_term,hypergeometric2f1(a+float(r),b1 + float(r), c1+float(2*r),x));
		vec_term = cmul(vec_term,hypergeometric2f1(a+float(r),b2 + float(r), c2+float(2*r),y));		
		summer += term*vec_term;
		
	}
    return summer;
}
vec2 hypergeometricf2(float a, float b1, float b2, float c1, float c2, vec2 x, vec2 y) {
	if (cabs(x)+cabs(y) < 1.0) {
		return hypergeometricf2_helper(a,b1,b2,c1,c2,x,y);
	}
	return ZERO;
}

// Check with hypergeometricf2(0.1,0.2,0.3,0.4,0.5,z.x,z.y)
// Appears correct in domain
vec2 hypergeometricf2(float a, float b1, float b2, float c1, float c2, float x, float y) {
	if (cabs(x)+cabs(y) < 1.0) {
		return hypergeometricf2_helper(a,b1,b2,c1,c2,x,y);
	}
	return ZERO;
}
#endfunction



#function hypergeometricg2
#requires cpow hypergeometricf2 rising_factorial factorial
const int G2_BOUND = 5;

// Horn function G2, defined for |x|<1 and |y|<1
vec2 hypergeometricg2(float b1, float b2, float c1, float c2, vec2 x, vec2 y) {
	vec2 u = cdiv(x,x+ONE);
	vec2 w = cdiv(y,y+ONE);
	if (cmag2(u) < 1.0) {
		if (cmag2(w) < 1.0) {
			return cmul(cmul(cpow(ONE+x,-b1),cpow(ONE+y,-b2)),hypergeometricf2(1.0-c1-c2,b1,b2,1.0-c1,1.0-c2,u,w));
		}
	}
	return ZERO;
}

// This implementation is no longer super scuffed for x,y<0
// check with hypergeometricg2(0.1,0.2,0.4,0.5,z.x,z.y)
vec2 hypergeometricg2(float b1, float b2, float c1, float c2, float x, float y) {
	float u = x/(x+1.0);
	float w = y/(y+1.0); 
	if (length(u) + length(w) < 1.0) {
		return cmul(cmul(cpow(vec2(1.0+x,0.0),-b1),cpow(vec2(1.0+y,0.0),-b2)),hypergeometricf2(1.0-c1-c2,b1,b2,1.0-c1,1.0-c2,u,w));
	}

	if (cmag2(x) < 1.0) {
		if (cmag2(y) < 1.0) {
			float summer = 0.0;
			float term = 0.0;
			float xm = 1.0;
			float yn = 1.0;
			for (int m = 0; m < G2_BOUND; m++) {
				yn = 1.0;
				for (int n = 0; n < G2_BOUND; n++) {
					// can probably rewrite this nicer

					term = rising_factorial(b1,float(m));
					term *= rising_factorial(b2,float(n));
					term *= rising_factorial(c1,float(n-m));
					term *= rising_factorial(c2,float(m-n));
					term /= factorial(m);
					term /= factorial(n);
					term *= xm*yn;
					summer += term;

					yn *= y;
				}
				xm *= x;
			}
			
			return ONE*summer;
		}
	}
	
	return ZERO;
}
#endfunction



// Returns 1 if f1(a,b1,...,x,y) implemented, -1 if not
// Commented section is correct but too slow to be useful as implemented
#function xy_in_f1_domain
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

	u = ONE-x;
	w = ONE-y;
	tcur = cmag2(u) + cmag2(w);

	if (tcur < tmax) {
		tmax = tcur;
		if (cmag2(w) < cmag2(u)) {
			transformation_equation = 21;
		} else {
			transformation_equation = 22;
		}
		
	}

	u = cdiv(x,y);
	w = cdiv(1.0,y);
	tcur = cmag2(u) + cmag2(w);
	if (tcur < tmax) {
		tmax = tcur;
		transformation_equation = 23;
	}

	u = cdiv(1.0,x);
	w = cdiv(y,x);
	tcur = cmag2(u) + cmag2(w);
	if (tcur < tmax) {
		tmax = tcur;
		transformation_equation = 24;
	}

	u = ONE-x;
	w = cinv(y);
	tcur = cmag2(u) + cmag2(w);
	if (tcur < tmax) {
		tmax = tcur;
		transformation_equation = 25;
	}

	u = cinv(x);
	w = ONE-y;
	tcur = cmag2(u) + cmag2(w);
	if (tcur < tmax) {
		tmax = tcur;
		transformation_equation = 26;
	}

	u = cinv(x);
	w = cinv(y);
	tcur = cmag2(u) + cmag2(w);
	if (tcur < tmax) {
		tmax = tcur;
		if (x.x < y.x) { // this is incorrect for the complex case, but oh well
			transformation_equation = 27;
		} else {
			transformation_equation = 28;
		}
		
	}

	if (cmag2(x-y)<cmag2(ONE-x)) {
		u = cdiv(x-y,cmul(y,x-ONE));
		w = cinv(y);
		tcur = cmag2(u) + cmag2(w);
		if (tcur < tmax) {
			tmax = tcur;
			transformation_equation = 29;
		}
	}

	if (cmag2(x-y)<cmag2(ONE-y)) {
		u = cinv(x);
		w = cdiv(x-y,cmul(x,y-ONE));
		tcur = cmag2(u) + cmag2(w);
		if (tcur < tmax) {
			tmax = tcur;
			transformation_equation = 30;
		}
	}


	return transformation_equation;
}

// float version
int xy_in_f1_domain(float x, float y) {
	return xy_in_f1_domain(vec2(x,0.0),vec2(y,0.0));
}
#endfunction



#function hypergeometricf1 hypergeometricf1_helper
#requires hypergeometric2f1 gamma cpow xy_in_f1_domain
const int F1_BOUND = 10;

vec2 hypergeometricf1_helper(float a, float b1, float b2, float c, vec2 x, vec2 y) {
	vec2 summer = hypergeometric2f1(a,b1, c,x);
	summer = cmul(summer,hypergeometric2f1(a,b2, c,y));

	float term = 1.0;
	vec2 vec_term = ZERO;
	vec2 xyr = ONE;
	float gamma2r = gamma(c-1.0);
	float gammar = gamma(c-1.0);

	for (int r = 1; r < F1_BOUND; r++) {
		term *= a + float(r-1);
		term *= b1 + float(r-1);
		term *= b2 + float(r-1);
		term *= c-a + float(r-1);
		term /= c + 2.0*float(r-1);
		term /= c + 2.0 *float(r-1) + 1.0;
		term /= float(r);
		xyr = cmul(cmul(xyr,x),y);
		gamma2r *= (float(2*r) +c - 3.0)*(float(2*r) +c - 2.0);
		gammar *= (float(r) + c-2.0);

		vec_term = xyr / gamma2r*gammar;
		vec_term = cmul(vec_term,hypergeometric2f1(a+float(r),b1 + float(r), c+2.0*float(r),x));
		vec_term = cmul(vec_term,hypergeometric2f1(a+float(r),b2 + float(r), c+2.0*float(r),y));		
		summer += term*vec_term;
		
	}
	
    return summer;
}

// float version
vec2 hypergeometricf1_helper(float a, float b1, float b2, float c, float x, float y) {
	vec2 summer = hypergeometric2f1(a,b1, c,x);
	summer = cmul(summer,hypergeometric2f1(a,b2, c,y));

	float term = 1.0;
	vec2 vec_term = ZERO;
	float xyr = 1.0;
	float gamma2r = gamma(c-1.0);
	float gammar = gamma(c-1.0);

	for (int r = 1; r < F1_BOUND; r++) {
		term *= a + float(r-1);
		term *= b1 + float(r-1);
		term *= b2 + float(r-1);
		term *= c-a + float(r-1);
		term /= c + 2.0*float(r-1);
		term /= c + 2.0 *float(r-1) + 1.0;
		term /= float(r);
		xyr *= x*y;
		gamma2r *= (float(2*r) +c - 3.0)*(float(2*r) +c - 2.0);
		gammar *= (float(r) + c-2.0);

		vec_term = xyr / gamma2r*gammar*(hypergeometric2f1(a+float(r),b1 + float(r), c+2.0*float(r),x));
		vec_term = cmul(vec_term,hypergeometric2f1(a+float(r),b2 + float(r), c+2.0*float(r),y));		
		summer += term*vec_term;
		
	}
    return summer;
}

// Appell series F1 as defined in https://en.wikipedia.org/wiki/Appell_series
// Can implement more patches with http://www.gasaneofisica.uns.edu.ar/papers/2001/ColavecchiaGasaneoMiragliacpc_01_138_29.pdf
// A note about the above paper: it's insufficient for complex x and y

// This is pretty slow now... think about optimizing
vec2 hypergeometricf1(float a, float b1, float b2, float c, vec2 x, vec2 y) {

	if (x == ZERO) { // (17) from //mathworld.wolfram.com/AppellHypergeometricFunction.html
		return hypergeometric2f1(a,b2,c,y);
	} else if (y == ZERO) { // (18)
		return hypergeometric2f1(a,b1,c,x);
	} else if (x == y) { // (19) and (20)
		return hypergeometric2f1(a,b1+b2,c,x);
	} else if (b1 + b2 == c) {
		return cmul(cpow(ONE-y,-a),hypergeometric2f1(a,b1,b1+b2,cdiv(x-y,ONE-y)));
	} //TODO: add a = c case from (37)

	int transformation_equation = xy_in_f1_domain(x,y);
	if (transformation_equation == 1) {
		return hypergeometricf1_helper(a,b1,b2,c,x,y);
		// Some of these are too slow to be useful for now
	// } else if (transformation_equation == 15) {
	// 	return cmul(cmul(cpow(ONE-x,-b1),cpow(ONE-y,-b2)), hypergeometricf1_helper(c-a,b1,b2,c,cdiv(x,x-ONE),cdiv(y,y-ONE)));
	// } else if (transformation_equation == 16) {
	// 	return cmul(cpow(ONE-x,-a), hypergeometricf1_helper(a,c-b1-b2,b2,c,cdiv(x,x-ONE),cdiv(x-y,x-ONE)));
	// } else if (transformation_equation == 17) {
	// 	return cmul(cpow(ONE-y,-a), hypergeometricf1_helper(a,b1,c-b1-b2,c,cdiv(y-x,y-ONE),cdiv(y,y-ONE)));
	// } else if (transformation_equation == 24) {
		// // only accurate for large arguments
		// float gammac = gamma(c);
		// vec2 summer = gammac*gamma(b1-a)/gamma(b1)/gamma(c-a)*cmul(cpow(-x,-a), hypergeometricf1_helper(a,1.0+a-c,b2,a-b1+1.0,cinv(x),cdiv(y,x)));
		// summer += gammac*gamma(a-b1)/gamma(a)/gamma(c-b1)*cmul(cpow(-x,-b1), hypergeometricg2(b1,b2,a-b1,1.0+b1-c,-cinv(x),-y));
		// return summer;
	}

	return ZERO;
}

// float version
// test with: hypergeometricf1(0.1,0.2,0.4,0.5,z.x,z.y)
vec2 hypergeometricf1(float a, float b1, float b2, float c, float x, float y) {
	if (x == 0.0) { // (17) from //mathworld.wolfram.com/AppellHypergeometricFunction.html
		return hypergeometric2f1(a,b2,c,y);
	} else if (y == 0.0) { // (18)
		return hypergeometric2f1(a,b1,c,x);
	} else if (x == y) { // (19) and (20)
		return hypergeometric2f1(a,b1+b2,c,x);
	} else if (b1 + b2 == c) {
		return cmul(cpow(1.0-y,vec2(-a,0.0)),hypergeometric2f1(a,b1,b1+b2,(x-y)/(1.0-y)));
	} //TODO: add a = c case from (37)


	int transformation_equation = xy_in_f1_domain(x,y);
	if (transformation_equation == 1) { //correct!
		return hypergeometricf1_helper(a,b1,b2,c,x,y);
	} else if (transformation_equation == 15) { // correct!
		return cmul(cmul(cpow(1.0-x,vec2(-b1,0.0)),cpow(1.0-y,vec2(-b2,0.0))), hypergeometricf1_helper(c-a,b1,b2,c,cdiv(x,x-1.0),cdiv(y,y-1.0)));
	} else if (transformation_equation == 16) { // correct!
		return cmul(cpow(1.0-x,vec2(-a,0.0)), hypergeometricf1_helper(a,c-b1-b2,b2,c,x/(x-1.0),(x-y)/(x-1.0)));
	} else if (transformation_equation == 17) { //correct! even in all 3 connected components
		return cmul(cpow(1.0-y,vec2(-a,0.0)), hypergeometricf1_helper(a,b1,c-b1-b2,c,(y-x)/(y-1.0),y/(y-1.0)));
	} else if (transformation_equation == 21) {
		return I;
	} else if (transformation_equation == 22) {
		return I;
	} else if (transformation_equation == 23) { // correct below x-axis... although misses some imaginary part
		// also unbelievably slow above x-axis
		// vec2 X = vec2(x,0.0);
		// vec2 Y = vec2(y,0.0);
		// float gammac = gamma(c);
		// vec2 summer = gammac*gamma(b2-a)/(gamma(b2)*gamma(c-a))*cmul(cpow(-Y,-a), hypergeometricf1_helper(a,b1,1.0+a-c,a-b2+1.0,x/y,1.0/y));
		// summer += gammac*gamma(a-b2)/(gamma(a)*gamma(c-b2))*cmul(cpow(-Y,-b2), hypergeometricg2(b1,b2,1.0+b2-c,a-b2,-x,-1.0/y));
		// return summer;
	} else if (transformation_equation == 24) { // correct in 3rd quad, seems to have correct real part elsewhere
												// just maybe not imag part?
		// vec2 X = vec2(x,0.0);
		// vec2 Y = vec2(y,0.0);
		// float gammac = gamma(c);
		// vec2 summer = gammac*gamma(b1-a)/(gamma(b1)*gamma(c-a))*cmul(cpow(-X,-a), hypergeometricf1_helper(a,1.0+a-c,b2,a-b1+1.0,1.0/x,y/x));
		// summer += gammac*gamma(a-b1)/(gamma(a)*gamma(c-b1))*cmul(cpow(-X,-b1), hypergeometricg2(b1,b2,a-b1,1.0+b1-c,-1.0/x,-y));
		// return summer;
	} else if (transformation_equation == 25) {
		return I;
	} else if (transformation_equation == 26) {
		return I;
	} else if (transformation_equation == 27) {
		// vec2 X = vec2(x,0.0);
		// vec2 Y = vec2(y,0.0);
		// float gammac = gamma(c);
		// vec2 summer = gammac*gamma(b1-a)/(gamma(b1)*gamma(c-a))*cmul(cpow(-X,-a), hypergeometricf1_helper(a,1.0+a-c,b2,1.0+a-b1,1.0/x,y/x));
		// summer += gammac*gamma(a-b1-b2)/(gamma(a)*gamma(c-b1-b2))*cmul(cpow(-X,-b1),cmul(cpow(-Y,-b2),hypergeometricf1_helper(1.0+b1+b2-c,b1,b2,1.0+b1+b2-a,1.0/x,1.0/y)));
		// summer += gammac*gamma(a-b1)*gamma(b1+b2-a)/(gamma(a)*gamma(b2)*gamma(c-a))*cmul(cpow(-X,-b1),cmul(cpow(-Y,b1-a),hypergeometricg2(b1,1.0+a-c,a-b1,b1+b2-a,-y/x,-1.0/y)));
		// return summer;
	} else if (transformation_equation == 28) {
		// vec2 X = vec2(x,0.0);
		// vec2 Y = vec2(y,0.0);
		// float gammac = gamma(c);
		// vec2 summer = gammac*gamma(b2-a)/(gamma(b2)*gamma(c-a))*cmul(cpow(-Y,-a), hypergeometricf1_helper(a,b1,1.0+a-c,1.0+a-b2,x/y,1.0/y));
		// summer += gammac*gamma(a-b1-b2)/(gamma(a)*gamma(c-b1-b2))*cmul(cpow(-X,-b1),cmul(cpow(-Y,-b2),hypergeometricf1_helper(1.0+b1+b2-c,b1,b2,1.0+b1+b2-a,1.0/x,1.0/y)));
		// summer += gammac*gamma(a-b2)*gamma(b1+b2-a)/(gamma(a)*gamma(b1)*gamma(c-a))*cmul(cpow(-X,b2-a),cmul(cpow(-Y,-b2),hypergeometricg2(1.0+a-c,b2,b1+b2-a,a-b2,-1.0/x,-x/y)));
		// return summer;
	} else if (transformation_equation == 29) {
		return I;
	} else if (transformation_equation == 30) {
		return I;
	} else if (transformation_equation == -1) {
		// something has gone wrong
		return ONE+I;
	}
	// return hypergeometricf1(a,b1,b2,c,vec2(x,0.0),vec2(y,0.0));
	return -ONE;
}
#endfunction