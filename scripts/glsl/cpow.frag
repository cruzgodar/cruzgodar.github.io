//Returns z^w.

vec2 cpow(vec2 z, vec2 w)
{
	float arg = carg(z);
	float magnitude = cmag2(z);
	
	float exparg = exp(-w.y * arg);
	float magexp = pow(magnitude, w.x / 2.0);
	float logmag = log(magnitude) * w.y / 2.0;

	float wxarg = w.x * arg;
	
	float p1 = exparg * cos(wxarg);
	float p2 = exparg * sin(wxarg);
	
	float q1 = magexp * cos(logmag);
	float q2 = magexp * sin(logmag);
	
	return vec2(p1 * q1 - p2 * q2, q1 * p2 + p1 * q2);
}

vec2 cpow(vec2 z, float w)
{
	float arg = carg(z);
	float magnitude = z.x * z.x + z.y * z.y;
	
	float magexp = pow(magnitude, w / 2.0);
	
	float warg = w * arg;

	float p1 = cos(warg);
	float p2 = sin(warg);
	
	return vec2(p1 * magexp, p2 * magexp);
}

vec2 cpow(float z, vec2 w)
{
	if (z == 0.0)
	{
		return vec2(0.0, 0.0);
	}
	// solves same bug as below
	if (z < 0.0) {
		return cpow(vec2(z,0.0),w);
	}
	float zexp = pow(z,w.x);
	float wyzlog = w.y * log(z);
	
	return vec2(zexp * cos(wyzlog), zexp * sin(wyzlog));
}

// Warning: this inherits a bug from pow(z,w), namely it's not defined if z<0
// It tries a workaround if z < 0 and hopes the answer is real, but it's better to use vec2 cpow above
float cpow(float z, float w)
{
	if (z < 0.0) {
		return cpow(vec2(z,0.0),w).x;
	}
	return pow(z, w);
}