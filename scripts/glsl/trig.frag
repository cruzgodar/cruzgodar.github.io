#function csinh
#requires cexp
vec2 csinh(vec2 a) {
	return (cexp(a) - cexp(-a))/2.0;
}

float csinh(float a) {
	return (exp(a)-exp(-a))/2.0;
}
#endfunction



#function ccosh
#requires cexp
vec2 ccosh(vec2 a) {
	return (cexp(a) + cexp(-a))/2.0;
}

float ccosh(float a) {
	return (exp(a)+exp(-a))/2.0;
}
#endfunction



//Returns sin(z).
//Oddly enough, this limits zeta precision along the critical strip
#function csin
#requires cexp csinh ccosh
vec2 csin(vec2 z)
{
	if (cabs(z.y) > 10.0) { // random heuristic to make it at least defined there
		return vec2(sin(z.x)*ccosh(z.y),cos(z.x)*csinh(z.y));
	}
	vec2 cexp_temp = cexp(vec2(-z.y,z.x));
	vec2 temp = 0.5*(cinv(cexp_temp) - cexp_temp);
	return vec2(-temp.y,temp.x);
}

float csin(float z)
{
	return sin(z);
}
#endfunction



//Returns cos(z).
#function ccos
#requires cexp csinh ccosh
vec2 ccos(vec2 z)
{
	if (cabs(z.y) > 10.0) { // random heuristic to make it at least defined there
		return vec2(cos(z.x)*ccosh(z.y),-sin(z.x)*csinh(z.y));
	}
	vec2 temp = vec2(-z.y,z.x);
	vec2 cexp_temp = cexp(temp);
	return 0.5*( cexp_temp + cinv(cexp_temp));
}

float ccos(float z)
{
	return cos(z);
}
#endfunction



//Returns tan(z).
#function ctan
#requires cexp
vec2 ctan(vec2 z)
{
	vec2 temp = cexp(2.0 * vec2(-z.y,z.x));
	temp = cdiv(vec2(-1.0+temp.x,temp.y),vec2(1.0+temp.x,temp.y));
	return vec2(temp.y,-temp.x);
}

float ctan(float z)
{
	return tan(z);
}
#endfunction



#function ccsc
#requires csin
//Returns csc(z).
vec2 ccsc(vec2 z)
{
	return cinv(csin(z));
}

float ccsc(float z)
{
	return 1.0 / sin(z);
}
#endfunction



//Returns csc(z).
#function csec
#requires ccos
vec2 csec(vec2 z)
{
	return cinv(ccos(z));
}

float csec(float z)
{
	return 1.0 / cos(z);
}
#endfunction



//Returns cot(z).
// code ripped off of above code for tan
#function ccot
#requires cexp
vec2 ccot(vec2 z)
{
	vec2 temp = cexp(2.0 * vec2(-z.y,z.x));
	temp = cdiv(vec2(1.0+temp.x,temp.y),vec2(-1.0+temp.x,temp.y));
	return vec2(-temp.y,temp.x);
}

float ccot(float z)
{
	return 1.0 / tan(z);
}
#endfunction



// Returns arcsin(a)
#function casin
#requires clog cpow
vec2 casin(vec2 a) {
	return cmul(-I, clog(vec2(-a.y,a.x) + cpow(ONE - vec2(a.x*a.x - a.y*a.y, a.x*a.y + a.y*a.x),0.5)));
}

float casin(float a) {
	return casin(vec2(a,0.0)).x;
}
#endfunction



#function cacos
#requires clog cpow
vec2 cacos(vec2 a) {
	return vec2(PI/2.0, 0.0) - cmul(-I, clog(vec2(-a.y,a.x) + cpow(ONE - vec2(a.x*a.x - a.y*a.y, a.x*a.y + a.y*a.x),0.5)));
}

float cacos(float a) {
	return cacos(vec2(a,0.0)).x;
}
#endfunction



#function catan
#requires clog
vec2 catan(vec2 a) {
	vec2 I_times_a = vec2(-a.y,a.x);
	return cmul(0.5*I, clog(vec2(1.0-I_times_a.x,-I_times_a.y)) - clog(vec2(I_times_a.x+1.0,I_times_a.y)));
}

float catan(float a) {
	return catan(vec2(a,0.0)).x;
}
#endfunction



#function cacsc
#requires casin
vec2 cacsc(vec2 a) {
	return casin(cinv(a));
}

float cacsc(float a) {
	return cacsc(vec2(a,0.0)).x;
}
#endfunction



#function casec
#requires cacos
vec2 casec(vec2 a) {
	return cacos(cinv(a));
}

float casec(float a) {
	return casec(vec2(a,0.0)).x;
}
#endfunction



#function cacot
#requires clog
vec2 cacot(vec2 a) {
	vec2 I_over_a = cdiv(I,a);
	return cmul(0.5*I, clog(vec2(1.0-I_over_a.x,-I_over_a.y)) - clog(vec2(I_over_a.x+1.0,I_over_a.y)));
	// return catan(cdiv(vec2(1.0,0.0),a));
}

float cacot(float a) {
	return cacot(vec2(a,0.0)).x;
}
#endfunction



#function ctanh
#requires cexp
vec2 ctanh(vec2 a) {
	return cdiv(cexp(2.0 * a) - vec2(1.0,0.0),cexp(2.0 * a) + vec2(1.0,0.0));
}

float ctanh(float a) {
	return (exp(2.0 * a) - 1.0)/(exp(2.0 * a) + 1.0);
}
#endfunction



#function ccsch
#requires csinh
vec2 ccsch(vec2 a) {
	return cinv(csinh(a));
}

float ccsch(float a) {
	return ccsch(vec2(a,0.0)).x;
}
#endfunction



#function csech
#requires ccosh
vec2 csech(vec2 a) {
	return cinv(ccosh(a));
}

float csech(float a) {
	return ccsch(vec2(a,0.0)).x;
}
#endfunction



#function ccoth
#requires cexp
vec2 ccoth(vec2 a) {
	return cdiv(cexp(2.0 * a) + ONE, cexp(2.0 * a) - ONE);
}

float ccoth(float a) {
	return ccoth(vec2(a,0.0)).x;
}
#endfunction



#function casinh
#requires clog cpow
vec2 casinh(vec2 z) {
	return clog(cpow(cpow(z,2.0) + ONE,0.5) + z);
}

float casinh(float a) {
	return casinh(vec2(a,0.0)).x;
}
#endfunction



#function cacosh
#requires clog cpow
vec2 cacosh(vec2 z) {
	return clog(cmul(cpow(z + ONE,0.5),cpow(z - ONE,0.5)) + z);
}

float cacosh(float a) {
	return cacosh(vec2(a,0.0)).x;
}
#endfunction



#function catanh
#requires clog
vec2 catanh(vec2 z) {
	return 0.5*clog(z+ONE) - 0.5*clog(ONE-z);
}

float catanh(float a) {
	return catanh(vec2(a,0.0)).x;
}
#endfunction



#function cacsch
#requires clog cpow
vec2 cacsch(vec2 z) {
	return clog(cpow(cpow(z,-2.0)+ONE,0.5) + cdiv(1.0,z));
}

float cacsch(float a) {
	return cacsch(vec2(a,0.0)).x;
}
#endfunction



// branch cuts may differ from wolfram... whatever
#function casech
#requires clog csqrt
vec2 casech(vec2 z) {
	vec2 zinv = cinv(z);
	return clog(cmul(csqrt(zinv-ONE),csqrt(zinv+ONE)) + zinv);
}

float casech(float a) {
	return casech(vec2(a,0.0)).x;
}
#endfunction



#function cacoth
#requires clog
vec2 cacoth(vec2 z) {
	vec2 zinv = cinv(z);
	return 0.5*clog(zinv+ONE) - 0.5*clog(ONE-zinv);
}

float cacoth(float a) {
	return cacoth(vec2(a,0.0)).x;
}
#endfunction