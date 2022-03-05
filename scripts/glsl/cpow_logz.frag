// IN: log(z),w
// OUT: z^w
// Saves a few operations if you already know log(z)
// Need to be sure that z > 0 to use this
vec2 cpow_logz(float z, float logz, vec2 w)
{
	// Assume z != 0

	float zexp = pow(z,w.x);
	float wyzlog = w.y * logz;
	
	return vec2(zexp * cos(wyzlog), zexp * sin(wyzlog));
}