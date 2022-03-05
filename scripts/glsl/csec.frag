//Returns csc(z).
vec2 csec(vec2 z)
{
	return cinv(ccos(z));
}

float csec(float z)
{
	return 1.0 / cos(z);
}