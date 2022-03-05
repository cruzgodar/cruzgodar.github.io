//Returns cos(z).
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