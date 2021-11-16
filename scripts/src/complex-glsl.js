const COMPLEX_GLSL = `
const vec2 ZERO = vec2(0.0, 0.0);
const vec2 ONE = vec2(1.0, 0.0);
const vec2 i = vec2(0.0, 1.0);
const vec2 I = i;



//Returns |z|.
float cabs(vec2 z)
{
	return length(z);
}

float cabs(float z)
{
	return abs(z);
}



//Returns |z|.
float carg(vec2 z)
{
	if (z.x == 0.0)
	{
		if (z.y >= 0.0)
		{
			return 1.57079632;
		}
		
		return -1.57079632;
	}
	
	return atan(z.y, z.x);
}

float carg(float z)
{
	if (z >= 0.0)
	{
		return 0.0;
	}
	
	return 3.14159265;
}



//Returns the conjugate of z.
vec2 cconj(vec2 z)
{
	return vec2(z.x, -z.y);
}

float cconj(float z)
{
	return z;
}



//Returns z / |z|.
vec2 csign(vec2 z)
{
	if (length(z) == 0.0)
	{
		return vec2(0.0, 0.0);
	}
	
	return z / length(z);
}

float csign(float z)
{
	return sign(z);
}




//Returns z + w.
vec2 cadd(vec2 z, vec2 w)
{
	return z + w;
}

vec2 cadd(vec2 z, float w)
{
	return vec2(z.x + w, z.y);
}

vec2 cadd(float z, vec2 w)
{
	return vec2(z + w.x, w.y);
}

float cadd(float z, float w)
{
	return z + w;
}



//Returns z - w.
vec2 csub(vec2 z, vec2 w)
{
	return z - w;
}

vec2 csub(vec2 z, float w)
{
	return vec2(z.x - w, z.y);
}

vec2 csub(float z, vec2 w)
{
	return vec2(z - w.x, -w.y);
}

float csub(float z, float w)
{
	return z - w;
}



//Returns z * w.
vec2 cmul(vec2 z, vec2 w)
{
	return vec2(z.x * w.x - z.y * w.y, z.x * w.y + z.y * w.x);
}

vec2 cmul(vec2 z, float w)
{
	return z * w;
}

vec2 cmul(float z, vec2 w)
{
	return z * w;
}

float cmul(float z, float w)
{
	return z * w;
}



//Returns z / w.
vec2 cdiv(vec2 z, vec2 w)
{
	if (length(w) == 0.0)
	{
		return vec2(1.0, 0.0);
	}
	
	return vec2(z.x * w.x + z.y * w.y, -z.x * w.y + z.y * w.x) / (w.x * w.x + w.y * w.y);
}

vec2 cdiv(vec2 z, float w)
{
	if (w == 0.0)
	{
		return vec2(1.0, 0.0);
	}
	
	return z / w;
}

vec2 cdiv(float z, vec2 w)
{
	if (length(w) == 0.0)
	{
		return vec2(1.0, 0.0);
	}
	
	return vec2(z * w.x, -z * w.y) / (w.x * w.x + w.y * w.y);
}

float cdiv(float z, float w)
{
	if (w == 0.0)
	{
		return 1.0;
	}
	
	return z / w;
}



//Returns 1/z.
vec2 cinv(vec2 z)
{
	float magnitude = z.x*z.x + z.y*z.y;
	
	return vec2(z.x / magnitude, -z.y / magnitude);
}

float cinv(float z)
{
	if (z == 0.0)
	{
		return 1.0;
	}
	
	return 1.0 / z;
}



//Returns z^w.
vec2 cpow(vec2 z, vec2 w)
{
	float arg = carg(z);
	float magnitude = z.x * z.x + z.y * z.y;
	
	float exparg = exp(-w.y * arg);
	float magexp = pow(magnitude, w.x / 2.0);
	float logmag = log(magnitude) * w.y / 2.0;
	
	float p1 = exparg * cos(w.x * arg);
	float p2 = exparg * sin(w.x * arg);
	
	float q1 = magexp * cos(logmag);
	float q2 = magexp * sin(logmag);
	
	return vec2(p1 * q1 - p2 * q2, q1 * p2 + p1 * q2);
}

vec2 cpow(vec2 z, float w)
{
	float arg = carg(z);
	float magnitude = z.x * z.x + z.y * z.y;
	
	float magexp = pow(magnitude, w / 2.0);
	
	float p1 = cos(w * arg);
	float p2 = sin(w * arg);
	
	return vec2(p1 * magexp, p2 * magexp);
}

vec2 cpow(float z, vec2 w)
{
	if (z == 0.0)
	{
		return vec2(0.0, 0.0);
	}
	
	float zlog = log(z);
	float zexp = exp(w.x * zlog);
	
	return vec2(zexp * cos(w.y * zlog), zexp * sin(w.y * zlog));
}

float cpow(float z, float w)
{
	return pow(z, w);
}



//Returns z^^w.
vec2 ctet(vec2 z, float w)
{
	if (w == 0.0)
	{
		return vec2(1.0, 0.0);
	}

	
	vec2 prod = z;
	
	for (int j = 1; j < 10000; j++)
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
	
	for (int j = 1; j < 10000; j++)
	{
		if (float(j) >= w)
		{
			return prod;
		}
		
		prod = pow(z, prod);
	}
	
	return prod;
}



//Returns sqrt(z).
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



//Returns e^z.
vec2 cexp(vec2 z)
{
	return cpow(2.7182818, z);
}

float cexp(float z)
{
	return exp(z);
}



//Returns log(z).
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



//Returns sin(z).
vec2 csin(vec2 z)
{
	vec2 temp = cexp(cmul(z, vec2(0.0, 1.0))) - cexp(cmul(z, vec2(0.0, -1.0)));
	
	return cmul(temp, vec2(0.0, -0.5));
}

float csin(float z)
{
	return sin(z);
}



//Returns cos(z).
vec2 ccos(vec2 z)
{
	vec2 temp = cexp(cmul(z, vec2(0.0, 1.0))) + cexp(cmul(z, vec2(0.0, -1.0)));
	
	return cmul(temp, vec2(0.0, -0.5));
}

float ccos(float z)
{
	return cos(z);
}



//Returns tan(z).
vec2 ctan(vec2 z)
{
	vec2 temp = cexp(cmul(z, vec2(0.0, 2.0)));
	
	return cdiv(cmul(vec2(0.0, -1.0), vec2(-1.0, 0.0) + temp), vec2(1.0, 0.0) + temp);
}

float ctan(float z)
{
	return tan(z);
}

//Returns divisor(n,k), the sum all k-th powers of divisors of n.
float divisor(float n,float k)
 {
	 if (n == 0.0)
	 {
		 return 0.0;
	 }

	 float summer = 0.0;

	 for (int d = 1; d < 10000; d++)
	 {
		 if (float(d) > n)
		 {
			 return summer;
		 }

		 if (mod(n,float(d)) == 0.0)
		 {
			 summer += pow(float(d),k);
		 }
	 }
	 return summer;
 }

// Returns divisor(n,1).
float divisor(float n)
{
	return divisor(n,1.0);
}

// Returns n!.
float factorial(float n)
{
	float prod = 1.0;
	
	for (int j = 1; j < 10000; j++) 
	{
		if (float(j) > n) 
		{
			break;
		}
		
		prod *= float(j);
	}
	
	return prod;
}

// Returns m choose n.
float binomial(float m, float n)
{
	if (n > m)
	{
		return 0.0;
	}
	
	float prod = 1.0;
	
	for (int j = 1; j < 1000; j++)
	{
		if (float(j) + n > m) 
		{
			break;
		}
		
		prod *= (float(j) + n);
	}
	
	return prod / factorial(m-n);
}

// Returns B_m, the mth Bernoulli number, e.g. 1, -1/2, 1/6, 0, -1/30, 0, ....
// Formula from Louis Saalschütz according to Wikipedia.
float bernoulli(float m)
{
	if (m > 1.0 && mod(m, 2.0) != 0.0)
	{
		return 0.0;
	}
	
	float summer = 0.0;
	
	for (int v = 0; v < 1000; v++) 
	{
		if (float(v) > m) 
		{
			break;
		}
		
		for (int k = 0; k < 1000; k++) 
		{
			if (float(k) > m) 
			{
				break;
			}
			
			summer += (1.0 - 2.0 * mod(float(v), 2.0)) * binomial(float(k),float(v)) * pow(float(v),m) / (float(k)+1.0);
		}
	}
	
	return summer;
}


// Returns E_k(z) where E_k is the normalized Eisenstein series of weight k and level 1 (k must be even...).
// Uses equation (1.3) from https://arxiv.org/pdf/math/0009130.pdf.
//TODO: implement eisnstein(k,q)
vec2 eisenstein(float k, vec2 z)
{
	if (z.y <= 0.0)
	{
		return ZERO;
	}
		
	vec2 q = cexp(6.28318530717959 * vec2(-z.y,z.x)); // q = e^(2pi i z)
	vec2 summer = ZERO;

	for (int r = 1; r < 6; r++) // need to fine tune this bound
	{
		// add r^(k-1)q^r / (1-q^r)
		vec2 q_r = cpow(q,float(r));
		summer += pow(float(r),k-1.0) * cdiv(q_r,vec2(1.0-q_r.x,q_r.y));
	}
	
	summer *= 2.0*k/bernoulli(k);
	
	return vec2(1.0-summer.x,summer.y);

}
`;
