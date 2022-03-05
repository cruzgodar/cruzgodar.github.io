//Returns sin(z).
// Oddly enough, this limits zeta precision along the critical strip
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