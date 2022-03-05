#function gamma gamma_helper gamma_float_helper
#requires cpow cexp csin
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
#endfunction