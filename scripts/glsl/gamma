#function gamma gamma_helper gamma_float_helper
#requires cpow cexp csin
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
#endfunction



// Assumption: real(z)>0
#function digamma digamma_helper
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
#endfunction



#function polygamma polygamma_helper
#requires cpow gamma digamma
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
#endfunction



#function trigamma
#requires polygamma
vec2 trigamma(vec2 z) {
	return polygamma(1,z);
}
#endfunction