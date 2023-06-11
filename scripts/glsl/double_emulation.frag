float timesFrc(float a, float b)
{
	return mix(0.0, a * b, b != 0.0 ? 1.0 : 0.0);
}

float plusFrc(float a, float b)
{
	return mix(a, a + b, b != 0.0 ? 1.0 : 0.0);
}

float minusFrc(float a, float b)
{
	return mix(a, a - b, b != 0.0 ? 1.0 : 0.0);
}

// Double emulation based on GLSL Mandelbrot Shader by Henry Thasler (www.thasler.org/blog)
// Emulation based on Fortran-90 double-single package. See http://crd.lbl.gov/~dhbailey/mpdist/
// Add: res = dsAdd(a, b) => res = a + b
vec2 add (vec2 dsa, vec2 dsb)
{
	vec2 dsc;
	float t1, t2, e;
	t1 = plusFrc(dsa.x, dsb.x);
	e = minusFrc(t1, dsa.x);
	t2 = plusFrc(plusFrc(plusFrc(minusFrc(dsb.x, e), minusFrc(dsa.x, minusFrc(t1, e))), dsa.y), dsb.y);
	dsc.x = plusFrc(t1, t2);
	dsc.y = minusFrc(t2, minusFrc(dsc.x, t1));
	return dsc;
}

// Subtract: res = dsSub(a, b) => res = a - b
vec2 sub (vec2 dsa, vec2 dsb)
{
	vec2 dsc;
	float e, t1, t2;
	t1 = minusFrc(dsa.x, dsb.x);
	e = minusFrc(t1, dsa.x);
	t2 = minusFrc(plusFrc(plusFrc(minusFrc(minusFrc(0.0, dsb.x), e), minusFrc(dsa.x, minusFrc(t1, e))), dsa.y), dsb.y);
	dsc.x = plusFrc(t1, t2);
	dsc.y = minusFrc(t2, minusFrc(dsc.x, t1));
	return dsc;
}

// Compare: res = -1 if a < b // = 0 if a == b // = 1 if a > b
float cmp(vec2 dsa, vec2 dsb)
{
	if (dsa.x < dsb.x)
	{
		return -1.;
	}
	
	if (dsa.x > dsb.x)
	{
		return 1.;
	}
	
	if (dsa.y < dsb.y)
	{
		return -1.;
	}
	
	if (dsa.y > dsb.y)
	{
		return 1.;
	}
	
	return 0.;
}

// Multiply: res = dsMul(a, b) => res = a * b

vec2 mul (vec2 dsa, vec2 dsb)
{
	vec2 dsc;
	float c11, c21, c2, e, t1, t2;
	float a1, a2, b1, b2, cona, conb, split = 8193.;
	cona = timesFrc(dsa.x, split);
	conb = timesFrc(dsb.x, split);
	a1 = minusFrc(cona, minusFrc(cona, dsa.x));
	b1 = minusFrc(conb, minusFrc(conb, dsb.x));
	a2 = minusFrc(dsa.x, a1);
	b2 = minusFrc(dsb.x, b1);
	c11 = timesFrc(dsa.x, dsb.x);
	c21 = plusFrc(timesFrc(a2, b2), plusFrc(timesFrc(a2, b1), plusFrc(timesFrc(a1, b2), minusFrc(timesFrc(a1, b1), c11))));
	c2 = plusFrc(timesFrc(dsa.x, dsb.y), timesFrc(dsa.y, dsb.x));
	t1 = plusFrc(c11, c2);
	e = minusFrc(t1, c11);
	t2 = plusFrc(plusFrc(timesFrc(dsa.y, dsb.y), plusFrc(minusFrc(c2, e), minusFrc(c11, minusFrc(t1, e)))), c21);
	dsc.x = plusFrc(t1, t2);
	dsc.y = minusFrc(t2, minusFrc(dsc.x, t1));
	return dsc;
}

// create double-single number from float
vec2 set(float a)
{
	return vec2(a, 0.0);
}

float rand(vec2 co)
{
	// implementation found at: lumina.sourceforge.net/Tutorials/Noise.html
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec2 complexMul(vec2 a, vec2 b)
{
	return vec2(a.x*b.x - a.y*b.y,a.x*b.y + a.y * b.x);
}

// double complex multiplication
vec4 dcMul(vec4 a, vec4 b)
{
	return vec4(sub(mul(a.xy,b.xy),mul(a.zw,b.zw)),add(mul(a.xy,b.zw),mul(a.zw,b.xy)));
}

vec4 dcAdd(vec4 a, vec4 b)
{
	return vec4(add(a.xy,b.xy),add(a.zw,b.zw));
}

// Length of double complex
vec2 dcLength(vec4 a)
{
	return add(mul(a.xy,a.xy),mul(a.zw,a.zw));
}

vec4 dcSet(vec2 a)
{
	return vec4(a.x,0.,a.y,0.);
}

vec4 dcSet(vec2 a, vec2 ad)
{
	return vec4(a.x, ad.x,a.y,ad.y);
}

// Multiply double-complex with double
vec4 dcMul(vec4 a, vec2 b)
{
	return vec4(mul(a.xy,b),mul(a.wz,b));
}