//Returns z^w.

#function cpow
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
#endfunction



// IN: log(z),w
// OUT: z^w
// Saves a few operations if you already know log(z)
// Need to be sure that z > 0 to use this
#function cpow_logz
vec2 cpow_logz(float z, float logz, vec2 w)
{
	// Assume z != 0

	float zexp = pow(z,w.x);
	float wyzlog = w.y * logz;
	
	return vec2(zexp * cos(wyzlog), zexp * sin(wyzlog));
}
#endfunction



// modular exponentiation
// returns a^b mod c
#function powermod
int powermod(int a, int b, int c) {
	if (c==0) {
		return 0;
	}
	int temp = 1;
	float floatc = float(c);
	for (int i = 0; i < 1000; i++) {
		if (i == b) {
			return temp;
		}
		temp *= a;
		temp = int(mod(float(temp),floatc));
	}
	return temp;
}
#endfunction



// Returns w^^z.
// Example: ctet(2,3) = 16, not 27
#function ctet
#requires cpow
vec2 ctet(vec2 z, float w)
{
	if (w == 0.0)
	{
		return vec2(1.0, 0.0);
	}

	
	vec2 prod = z;
	
	for (int j = 1; j < 1000; j++)
	{
		if (float(j) >= w)
		{
			return prod;
		}
		
		prod = cpow(z, prod);
	}
	
	return prod;
}

float ctet(float z, float w)
{
	if (w == 0.0)
	{
		return 1.0;
	}
	float prod = z;
	for (int j = 1; j < 1000; j++)
	{
		if (float(j) >= w)
		{
			return prod;
		}
		
		prod = pow(z, prod);
	}
	
	return prod;
}
#endfunction



//Returns sqrt(z).
#function csqrt
#requires cpow
vec2 csqrt(vec2 z)
{
	return cpow(z, .5);
}

vec2 csqrt(float z)
{
	if (z >= 0.0)
	{
		return vec2(sqrt(z), 0.0);
	}
		
	return vec2(0.0, sqrt(-z));
}
#endfunction



//Returns e^z.
#function cexp
vec2 cexp(vec2 z)
{
	float zexp = exp(z.x);	
	return vec2(zexp * cos(z.y), zexp * sin(z.y));
}

float cexp(float z)
{
	return exp(z);
}
#endfunction



//Returns log(z).
#function clog
vec2 clog(vec2 z)
{
	return vec2(.5 * log(z.x * z.x + z.y * z.y), carg(z));
}

float clog(float z)
{
	if (z == 0.0)
	{
		return 0.0;
	}
	
	return log(z);
}
#endfunction