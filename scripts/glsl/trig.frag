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