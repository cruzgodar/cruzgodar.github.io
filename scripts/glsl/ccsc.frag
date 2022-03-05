//Returns csc(z).
vec2 ccsc(vec2 z)
{
	return cinv(csin(z));
}

float ccsc(float z)
{
	return 1.0 / sin(z);
}