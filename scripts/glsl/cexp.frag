//Returns e^z.
vec2 cexp(vec2 z)
{
	float zexp = exp(z.x);	
	return vec2(zexp * cos(z.y), zexp * sin(z.y));
}

float cexp(float z)
{
	return exp(z);
}