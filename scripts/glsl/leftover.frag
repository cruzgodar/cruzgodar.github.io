

// these can probably go in a different file...

const vec2 GAMMA_CONST_0 = ONE;
const float GAMMA_CONST_1 = 676.5203681218851;
const float GAMMA_CONST_2 = -1259.1392167224028;
const float GAMMA_CONST_3 = 771.3234287776531;
const float GAMMA_CONST_4 = -176.6150291621406;
const float GAMMA_CONST_5 = 12.507343278686905;
const float GAMMA_CONST_6 = -0.13857109526572012;
const float GAMMA_CONST_7 = .000009984369578019572;
const float GAMMA_CONST_8 = .00000015056327351493116;

vec2 gamma_helper(vec2 a) 
{
	a -= ONE;

	vec2 y = GAMMA_CONST_0;
	y += cdiv(GAMMA_CONST_1, vec2(a.x + 1.0, a.y));
	y += cdiv(GAMMA_CONST_2, vec2(a.x + 2.0, a.y));
	y += cdiv(GAMMA_CONST_3, vec2(a.x + 3.0, a.y));
	y += cdiv(GAMMA_CONST_4, vec2(a.x + 4.0, a.y));
	y += cdiv(GAMMA_CONST_5, vec2(a.x + 5.0, a.y));
	y += cdiv(GAMMA_CONST_6, vec2(a.x + 6.0, a.y));
	y += cdiv(GAMMA_CONST_7, vec2(a.x + 7.0, a.y));
	y += cdiv(GAMMA_CONST_8, vec2(a.x + 8.0, a.y));
	vec2 t = vec2(a.x + 7.5, a.y);
	// return sqrt(2.0*PI) * cmul(cpow(t, vec2(a.x+0.5, a.y)), cmul(cexp(-t), y));
	// e^(-7.5)*sqrt(2 pi) = 0.0013863769204690377346...
	return cmul(cpow(t, vec2(a.x+0.5, a.y)), cmul(cexp(-a), y)) * 0.0013863769204690377346;
}

// Lanczos
vec2 gamma(vec2 a) {
	float result = 0.0;
	if (a.x < 0.5) {
		return cdiv(PI, cmul(csin(PI * a), gamma_helper(ONE - a)));
	}
	return gamma_helper(a);
}


float gamma_float_helper(float a) {
	// always have a >= 0.5 when calling from gamma
	a -= 1.0;

	float y = 1.0;
	y += GAMMA_CONST_1 / (a + 1.0);
	y += GAMMA_CONST_2 / (a + 2.0);
	y += GAMMA_CONST_3 / (a + 3.0);
	y += GAMMA_CONST_4 / (a + 4.0);
	y += GAMMA_CONST_5 / (a + 5.0);
	y += GAMMA_CONST_6 / (a + 6.0);
	y += GAMMA_CONST_7 / (a + 7.0);
	y += GAMMA_CONST_8 / (a + 8.0);
	float t = a+7.5;
	return sqrt(2.0*PI) * cpow(t, a+0.5) * cexp(-t) * y;
}

// This is a faster version of gamma for real inputs (which implies real outputs)
float gamma(float a) {

	if (a < 0.5) {
		return PI/(csin(PI * a)* gamma_float_helper(1.0 - a));
	}
	return gamma_float_helper(a);
}

float gamma(int a) {
	return gamma(float(a));
}


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


float rising_factorial(float a, int n) {
	if (n == 0) {
		return 1.0;
	}
	float prod = 1.0;

	if (n < 0) {
		n = -n;
		for (int i = 0; i < 100; i++) {
			if (i >= n) {
				break;
			}
			prod /= a-float(i+1);
		}
		return prod;
	}
	for (int i = 0; i < 100; i++) {
		if (i >= n) {
			break;
		}
		prod *= a+float(i);
	}
	return prod;
}

float rising_factorial(float a, float n) {
	if (fract(n) == 0.0) {
		return rising_factorial(a,int(n));
	}
	return gamma(a+n)/gamma(a);
}


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



// Returns 1 if f1(a,b1,...,x,y) implemented, -1 if not
// Commented section is correct but too slow to be useful as implemented
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