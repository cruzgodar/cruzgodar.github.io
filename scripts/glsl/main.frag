const float PI = 3.141592653589;

const vec2 ZERO = vec2(0.0, 0.0);
const vec2 ONE = vec2(1.0, 0.0);
const vec2 i = vec2(0.0, 1.0);
const vec2 I = i;
const vec2 rho = vec2(-0.5, 0.866025403784438);

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

// Returns |z|^2
float cmag2(vec2 z) {
	return z.x*z.x + z.y*z.y;
}

float cmag2(float z) {
	return z*z;
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
	float len_w = w.x * w.x + w.y * w.y;
	if (len_w == 0.0)
	{
		return vec2(1.0, 0.0);
	}
	
	return vec2(z.x * w.x + z.y * w.y, -z.x * w.y + z.y * w.x) / len_w;
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
	float len_w = w.x * w.x + w.y * w.y;
	if (len_w == 0.0)
	{
		return vec2(1.0, 0.0);
	}
	
	return vec2(z * w.x, -z * w.y) / len_w;
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
	float magnitude = cmag2(z);
	
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
	
	float zexp = pow(z,w.x);
	float wyzlog = w.y * log(z);
	
	return vec2(zexp * cos(wyzlog), zexp * sin(wyzlog));
}

float cpow(float z, float w)
{
	return pow(z, w);
}

// IN: log(z),w
// OUT: z^w
// Saves a few operations if you already know log(z)
vec2 cpow_logz(float z, float logz, vec2 w)
{
	// Assume z != 0
	float zexp = pow(z,w.x);
	float wyzlog = w.y * logz;
	
	return vec2(zexp * cos(wyzlog), zexp * sin(wyzlog));
}

//Returns z^^w.
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
	float zexp = exp(z.x);	
	return vec2(zexp * cos(z.y), zexp * sin(z.y));
	// return cpow(2.7182818, z);
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
	// implementation idea: cache cexp(temp)... unclear if it works now
	vec2 temp = vec2(-z.y,z.x);
	temp = 0.5*(cexp(-temp) - cexp(temp));
	return vec2(-temp.y,temp.x);
}

float csin(float z)
{
	return sin(z);
}



//Returns cos(z).
vec2 ccos(vec2 z)
{
	vec2 temp = vec2(-z.y,z.x);
	return 0.5*( cexp(temp) + cexp(-temp));
}

float ccos(float z)
{
	return cos(z);
}



//Returns tan(z).
vec2 ctan(vec2 z)
{
	vec2 temp = cexp(2.0 * vec2(-z.y,z.x));
	temp = cdiv(vec2(-1.0+temp.x,temp.y),vec2(1.0+temp.x,temp.y));
	return vec2(temp.y,-temp.x);
}

float ctan(float z)
{
	return tan(z);
}



//Returns csc(z).
vec2 ccsc(vec2 z)
{
	return cdiv(1.0, csin(z));
}

float ccsc(float z)
{
	return 1.0 / sin(z);
}



//Returns csc(z).
vec2 csec(vec2 z)
{
	return cdiv(1.0, ccos(z));
}

float csec(float z)
{
	return 1.0 / cos(z);
}



//Returns cot(z).
// code ripped off of above code for tan
vec2 ccot(vec2 z)
{
	vec2 temp = cexp(2.0 * vec2(-z.y,z.x));
	temp = cdiv(vec2(1.0+temp.x,temp.y),vec2(-1.0+temp.x,temp.y));
	return vec2(-temp.y,temp.x);
}

float ccot(float z)
{
	return 1.0 / tan(z);
}

// Returns arcsin(a)
vec2 casin(vec2 a) {
	return cmul(-I, clog(cmul(I,a) + cpow(ONE - vec2(a.x*a.x - a.y*a.y, a.x*a.y + a.y*a.x),0.5)));
}

float casin(float a) {
	return casin(vec2(a,0.0)).x;
}

vec2 cacos(vec2 a) {
	return vec2(PI/2.0, 0.0) - cmul(vec2(0,-1), clog(cmul(vec2(0.0,1.0),a) + cpow(vec2(1.0,0.0) - vec2(a.x*a.x - a.y*a.y, a.x*a.y + a.y*a.x),0.5)));
}

float cacos(float a) {
	return cacos(vec2(a,0.0)).x;
}

vec2 catan(vec2 a) {
	vec2 I_times_a = cmul(I,a);
	return cmul(0.5*I, clog(vec2(1.0-I_times_a.x,-I_times_a.y)) - clog(vec2(I_times_a.x+1.0,I_times_a.y)));
}

float catan(float a) {
	return catan(vec2(a,0.0)).x;
}

vec2 cacsc(vec2 a) {
	return casin(cdiv(vec2(1.0,0.0),a));
}

float cacsc(float a) {
	return cacsc(vec2(a,0.0)).x;
}

vec2 casec(vec2 a) {
	return cacos(cdiv(vec2(1.0,0.0),a));
}

float casec(float a) {
	return casec(vec2(a,0.0)).x;
}

vec2 cacot(vec2 a) {
	vec2 I_over_a = cdiv(I,a);
	return cmul(0.5*I, clog(vec2(1.0-I_over_a.x,-I_over_a.y)) - clog(vec2(I_over_a.x+1.0,I_over_a.y)));
	// return catan(cdiv(vec2(1.0,0.0),a));
}

float cacot(float a) {
	return cacot(vec2(a,0.0)).x;
}

vec2 csinh(vec2 a) {
	return (cexp(a) - cexp(-a))/2.0;
}

float csinh(float a) {
	return (exp(a)-exp(-a))/2.0;
}

vec2 ccosh(vec2 a) {
	return (cexp(a) + cexp(-a))/2.0;
}

float ccosh(float a) {
	return (exp(a)+exp(-a))/2.0;
}

vec2 ctanh(vec2 a) {
	return cdiv(cexp(2.0 * a) - vec2(1.0,0.0),cexp(2.0 * a) + vec2(1.0,0.0));
}

float ctanh(float a) {
	return (exp(2.0 * a) - 1.0)/(exp(2.0 * a) + 1.0);
}

vec2 ccsch(vec2 a) {
	return cdiv(1.0, csinh(a));
}

float ccsch(float a) {
	return ccsch(vec2(a,0.0)).x;
}

vec2 csech(vec2 a) {
	return cdiv(1.0, ccosh(a));
}

float csech(float a) {
	return ccsch(vec2(a,0.0)).x;
}

vec2 ccoth(vec2 a) {
	return cdiv(cexp(2.0 * a) + vec2(1.0,0.0), cexp(2.0 * a) - vec2(1.0,0.0));
}

float ccoth(float a) {
	return ccoth(vec2(a,0.0)).x;
}

vec2 casinh(vec2 z) {
	return clog(cpow(cpow(z,2.0) + ONE,0.5) + z);
}

float casinh(float a) {
	return casinh(vec2(a,0.0)).x;
}

vec2 cacosh(vec2 z) {
	return clog(cpow(cpow(z,2.0) - ONE,0.5) + z);
}

float cacosh(float a) {
	return cacosh(vec2(a,0.0)).x;
}

vec2 catanh(vec2 z) {
	return 0.5*clog(z+ONE) - 0.5*clog(ONE-z);
}

float catanh(float a) {
	return catanh(vec2(a,0.0)).x;
}

vec2 cacsch(vec2 z) {
	return clog(cpow(cpow(z,-2.0)+ONE,0.5) + cdiv(1.0,z));
}

float cacsch(float a) {
	return cacsch(vec2(a,0.0)).x;
}

// branch cuts may differ from wolfram... whatever
vec2 casech(vec2 z) {
	return clog(cpow(cpow(z,-2.0)-ONE,0.5) + cdiv(1.0,z));
}

float casech(float a) {
	return casech(vec2(a,0.0)).x;
}

vec2 cacoth(vec2 z) {
	return 0.5*clog(cdiv(1.0,z)+ONE) - 0.5*clog(ONE-cdiv(1.0,z));
}

float cacoth(float a) {
	return cacoth(vec2(a,0.0)).x;
}

//Returns divisor(n,k), the sum all k-th powers of divisors of n.
float divisor(float n,float k)
 {
	 if (n == 0.0)
	 {
		 return 0.0;
	 }

	 float summer = 0.0;

	 for (int d = 1; d < 100; d++)
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

// Returns n!. Limited to n < 20 since it's waaaay too big there already.
float factorial(float n)
{
	float prod = 1.0;
	
	for (int j = 1; j < 20; j++) 
	{
		if (float(j) > n) 
		{
			break;
		}
		
		prod *= float(j);
	}
	
	return prod;
}

// Returns n choose k.
// I ripped this off of wikipedia
float binomial(float n, float k)
{

	if (k > n) {
		return 0.0;
	} else if (n == k) {
		return 1.0;
	} else if (n == 0.0) {
		return 1.0;
	}
	k = min(k,n-k);

	float prod = 1.0;
	for (int j = 0; j < 100; j++)
	{
		if (float(j) >= k) 
		{
			return prod;
		}
		
		prod *= (n-float(j))/ (float(j) + 1.0);
	}
	
	return prod;
}

// Returns B_m, the mth Bernoulli number, e.g. 1, -1/2, 1/6, 0, -1/30, 0, ....
float bernoulli(float m) {
	if (m == 1.0) {
		return -0.5;
	}
	if (mod(m, 2.0) != 0.0) {
		return 0.0;
	}
	if (m == 0.0) {
	    return 1.00000000000000;
	} else if (m == 2.0) {
	    return 0.166666666666667;
	} else if (m == 4.0) {
	    return -0.0333333333333333;
	} else if (m == 6.0) {
	    return 0.0238095238095238;
	} else if (m == 8.0) {
	    return -0.0333333333333333;
	} else if (m == 10.0) {
	    return 0.0757575757575758;
	} else if (m == 12.0) {
	    return -0.253113553113553;
	} else if (m == 14.0) {
	    return 1.16666666666667;
	} else if (m == 16.0) {
	    return -7.09215686274510;
	} else if (m == 18.0) {
	    return 54.9711779448622;
	} else if (m == 20.0) {
	    return -529.124242424242;
	} else if (m == 22.0) {
	    return 6192.12318840580;
	} else if (m == 24.0) {
	    return -86580.253113;
	} else if (m == 26.0) {
	    return 1425517.1665;
	} else if (m == 28.0) {
	    return -27298231.070;
	} else if (m == 30.0) {
	    return 601580874.0;
	} else if (m == 32.0) {
	    return -15116315768.0;
	} else if (m == 34.0) {
	    return 429614643070.0;
	}
	// now they get inconveniently large
	return 0.0;
}


const int THETA_BOUND = 10;
// https://arxiv.org/pdf/1806.06725.pdf
vec2 theta1(vec2 z, vec2 t) {
	// TODO: implement quasiperiodicity, a la https://mathworld.wolfram.com/JacobiThetaFunctions.html

	vec2 q = cexp(PI * vec2(-t.y,t.x));
	vec2 q4 = cexp(PI/4.0 * vec2(-t.y,t.x));
	vec2 w = cexp(PI * vec2(-z.y,z.x));
	vec2 v = cdiv(1.0,w);
	vec2 summer = w-v;
	float alternate_j = -1.0;
	for (int j = 1; j < THETA_BOUND; j++) {
		summer += alternate_j * cmul(cpow(q,float(j*(j+1))),cpow(w,float(2*j+1))-cpow(v,float(2*j+1)));
		alternate_j = -alternate_j;
	}
	return cmul(vec2(q4.y,-q4.x),summer);
}

vec2 theta2(vec2 z, vec2 t) {
	vec2 q = cexp(PI * vec2(-t.y,t.x));
	vec2 q4 = cexp(PI/4.0 * vec2(-t.y,t.x));
	vec2 w = cexp(PI * vec2(-z.y,z.x));
	vec2 v = cdiv(1.0,w);
	vec2 summer = w+v;
	for (int j = 1; j < THETA_BOUND; j++) {
		summer += cmul(cpow(q,float(j*(j+1))),cpow(w,float(2*j+1))+cpow(v,float(2*j+1)));
	}
	return cmul(q4,summer);
}

vec2 theta3(vec2 z, vec2 t) {
	vec2 q = cexp(PI * vec2(-t.y,t.x));
	vec2 w = cexp(PI * vec2(-z.y,z.x));
	vec2 v = cdiv(1.0,w);
	vec2 summer = ONE;
	for (int j = 1; j < THETA_BOUND; j++) {
		summer += cmul(cpow(q,float(j*j)),cpow(w,float(2*j))+cpow(v,float(2*j)));
	}
	return summer;
}

vec2 theta4(vec2 z, vec2 t) {
	vec2 q = cexp(PI * vec2(-t.y,t.x));
	vec2 w = cexp(PI * vec2(-z.y,z.x));
	vec2 v = cdiv(1.0,w);
	float alternate_j = -1.0;
	vec2 summer = ONE;
	for (int j = 1; j < THETA_BOUND; j++) {
		summer += alternate_j * cmul(cpow(q,float(j*j)),cpow(w,float(2*j))+cpow(v,float(2*j)));
		alternate_j = -alternate_j;
	}
	return summer;
}

// auxiliary function
vec2 eisenstein4(vec2 z)
{
	if (z.y <= 0.0)
	{
		return ZERO;
	}
	vec2 q = cexp(PI * vec2(-z.y,z.x));
	vec2 q4 = cexp(PI/4.0 * vec2(-z.y,z.x));

	vec2 a = ONE;
	vec2 b = ZERO;
	vec2 c = ZERO;

	float alternate_j = -1.0;
	vec2 qjj = ZERO;
	for (int j = 1; j < THETA_BOUND; j++) {
		qjj = cpow(q,float(j*j));

		a += cpow(q,float(j*(j+1)));
		b += qjj;
		c += alternate_j * qjj;

		alternate_j = -alternate_j;
	}

	a = 2.0 * cmul(q4,a);
	b = 2.0 * b + ONE;
	c = 2.0 * c + ONE;

	return (cpow(a,8.0)+cpow(b,8.0)+cpow(c,8.0))/2.0;
}

vec2 g2(vec2 z) {
	// 60.0 *2.0 * pi^4/90.0 = 129.878788045336582
	return 129.878788045336582 * eisenstein4(z);
}


vec2 eisenstein6(vec2 z)
{
	if (z.y <= 0.0)
	{
		return ZERO;
	}
	vec2 q = cexp(PI * vec2(-z.y,z.x));
	vec2 q4 = cexp(PI/4.0 * vec2(-z.y,z.x));

	vec2 a = ONE;
	vec2 b = ZERO;
	vec2 c = ZERO;

	float alternate_j = -1.0;
	vec2 qjj = ZERO;
	for (int j = 1; j < THETA_BOUND; j++) {
		qjj = cpow(q,float(j*j));
		a += cpow(q,float(j*(j+1)));
		b += qjj;
		c += alternate_j * qjj;

		alternate_j = -alternate_j;
	}

	a = 2.0 * cmul(q4,a);
	b = 2.0 * b + ONE;
	c = 2.0 * c + ONE;

	vec2 summer = -3.0 * cmul(cpow(a,8.0),cpow(b,4.0) + cpow(c,4.0));
	summer += cpow(b,12.0) + cpow(c,12.0);
	return 0.5 * summer;
}

vec2 g3(vec2 z) {
	// off by about 0.5% at z = rho; could use some attention to precision
	// 140.0 *2.0 * pi^6/945.0  = 284.856...
	return 284.856057355645759120065 * eisenstein6(z);
}


// Developer note: eisenstein8 was implemented along the lines of the two above... it's extremely unstable!
// Just use M_k = {E_4,E_6} for all E_k, k>6.

// Returns E_k(z) where E_k is the normalized Eisenstein series of weight k and level 1 (k must be even...).
// Uses equation (1.3) from https://arxiv.org/pdf/math/0009130.pdf.
//TODO: implement eisenstein(k,q)
vec2 eisenstein(float k, vec2 z)
{
	if (z.y <= 0.0)
	{
		return ZERO;
	}
	if (k == 4.0) 
	{
		return eisenstein4(z);
	} 
	if (k == 6.0) 
	{
		return eisenstein6(z);
	}

	if (k > 6.0)
	{
		vec2 e4 = eisenstein4(z);
		if (k == 8.0)
		{
			return cmul(e4,e4);
		}
		vec2 e6 = eisenstein6(z);
		// can probably save a lot of operations copy pasting the eisenstein4/6 code here to reuse variables
		if (k == 10.0)
			// todo: distribute the division
		{
			return cmul(e4,e6);
		} else if (k == 12.0) {
			return 0.638205499276411*cpow(e4,3.0) + 0.361794500723589 * cpow(e6,2.0);
		} else if (k == 14.0) {
			return cmul(cpow(e4,2.0), e6);
		} else if (k == 16.0) {
			return 1.0/3617.0 * (1617.0*cpow(e4,4.0) + 2000.0*cmul(e4,cpow(e6,2.0)));
		} else if (k == 18.0) {
			return 1.0/43867.0 * (38367.0*cmul(cpow(e4,3.0),e6) + 550.0 * cpow(e6,3.0));
		} else if (k == 20.0) {
			return 1.0/ 174611.0 * (53361.0*cpow(e4,5.0) + 121250.0*cmul(cpow(e4,2.0),cpow(e6,2.0)));
		} else if (k == 22.0) {
			return 1.0/77683.0*(57183.0*cmul(cpow(e4,4.0),e6) + 20500.0 * cmul(e4,cpow(e6,3.0)));
		} else if (k == 24.0) {
			return 1.0/236364091.0 * (49679091.0 * cpow(e4,6.0) + 176400000.0*cmul(cpow(e4,3.0),cpow(e6,2.0)) + 10285000.0*cpow(e6,4.0));
		}
        // todo: k > 24??
	}
	return ZERO;
}

const int DELTA_BOUND = 100;

vec2 delta(vec2 z) {
	if (z.y <= 0.0)
	{
		return ZERO;
	}
	vec2 q = cexp(PI * vec2(-z.y,z.x));
	vec2 q4 = cexp(PI/4.0 * vec2(-z.y,z.x));

	vec2 a = ONE;
	vec2 b = ZERO;
	vec2 c = ZERO;

	float alternate_j = -1.0;
	for (int j = 1; j < THETA_BOUND; j++) {
		a += cpow(q,float(j*(j+1)));
		b += cpow(q,float(j*j));
		c += alternate_j *cpow(q,float(j*j));

		alternate_j = -alternate_j;
	}

	a = 2.0 * cmul(q4,a);
	b = 2.0 * b + ONE;
	c = 2.0 * c + ONE;

	vec2 prod = cpow(0.5*cmul(cmul(a,b),c),8.0);
	// can multiply by (2*pi)^12... or not
	return prod;
}

// delta(q)
vec2 deltaq(vec2 z) {
	if (z.x*z.x + z.y*z.y >= 1.0)
	{
		return ZERO;
	}
	vec2 q = z;
	vec2 prod = q;
	for (int j = 1; j < DELTA_BOUND; j++) {
		prod = cmul(prod,cpow(ONE-cpow(q,float(j)),24.0));
	}
	return prod;
}





// Returns the weierstrass p function with w1 = 1, w2 = tau
// Algorithms from equation 1.10 of https://arxiv.org/pdf/1806.06725.pdf

vec2 wp(vec2 z, vec2 t) {


	// extend domain to allow strange tau values
	if (t.y < 0.0) {
		t = -t;
	}
	
	

	// Shift z to be in the fundamental parallelogram
	z -= floor(z.y/t.y)*t;
	z.x = fract(z.x);

	// Manually compute thetas here since you can reuse variables instead of calling separately
	vec2 q = cexp(PI * vec2(-t.y,t.x));
	vec2 q4 = cexp(PI/4.0 * vec2(-t.y,t.x));
	vec2 w = cexp(PI * vec2(-z.y,z.x));
	vec2 v = cdiv(1.0,w);

	vec2 thetaz1 = w-v;
	vec2 theta02 = ONE;
	vec2 theta03 = ZERO;
	vec2 thetaz4 = ONE;

	float alternate_j = -1.0;
	for (int j = 1; j < THETA_BOUND; j++) {
		thetaz1 += alternate_j * cmul(cpow(q,float(j*(j+1))),cpow(w,float(2*j+1))-cpow(v,float(2*j+1)));
		theta02 += cpow(q,float(j*(j+1)));
		theta03 += cpow(q,float(j*j));
		thetaz4 += alternate_j * cmul(cpow(q,float(j*j)),cpow(w,float(2*j))+cpow(v,float(2*j)));

		alternate_j = -alternate_j;
	}

	thetaz1 = cmul(vec2(q4.y,-q4.x),thetaz1);
	theta02 = 2.0 * cmul(q4,theta02);
	theta03 = 2.0 * theta03 + ONE;

	theta02 = cmul(theta02,theta02);
	theta03 = cmul(theta03,theta03);

	// pi * pi = 9.8696044010893586188
	vec2 prod = 9.8696044010893586188*cmul(theta02,theta03);
	prod = cmul(prod, cpow(thetaz4,2.0));
	prod = cmul(prod, cpow(thetaz1,-2.0));

	theta02 = cmul(theta02,theta02);
	theta03 = cmul(theta03,theta03);

	// pi * pi / 3 = 3.2898681336964528729
	prod -= 3.2898681336964528729 * (theta02+theta03);
	return prod;
}

vec2 weierstrassp(vec2 z, vec2 tau) {
	return wp(z,tau);
}

const int INVERSE_WP_BOUND = 10;



// Returns the derivative of the Weierstrass p function wp
// This satisfies p'^2 - 4p^3 +g2 p + g3 =0, although we have some instability issues
// Can check by plotting cpow(wpprime(z,rho),2.0)-4.0*cpow(wp(z,rho),3.0) + g3(rho)
vec2 wpprime(vec2 z, vec2 t) {
	// Shift z to be in the fundamental parallelogram
	z -= floor(z.y/t.y)*t;
	z.x = fract(z.x);

	// Manually compute thetas here since you can reuse variables instead of calling separately
	vec2 q = cexp(PI * vec2(-t.y,t.x));
	vec2 q4 = cexp(PI/4.0 * vec2(-t.y,t.x));
	vec2 w = cexp(PI * vec2(-z.y,z.x));
	vec2 v = cdiv(1.0,w);

	vec2 thetaz1 = w-v;
	vec2 theta02 = ONE;
	vec2 theta03 = ZERO;
	vec2 thetaz4 = ONE;

	vec2 thetaz1_prime = w+v;
	vec2 thetaz4_prime = ZERO;

	float alternate_j = -1.0;
	for (int j = 1; j < THETA_BOUND; j++) {
		thetaz1 += alternate_j * cmul(cpow(q,float(j*(j+1))),cpow(w,float(2*j+1))-cpow(v,float(2*j+1)));
		theta02 += cpow(q,float(j*(j+1)));
		theta03 += cpow(q,float(j*j));
		thetaz4 += alternate_j * cmul(cpow(q,float(j*j)),cpow(w,float(2*j))+cpow(v,float(2*j)));

		thetaz1_prime += float(2*j+1)*alternate_j * cmul(cpow(q,float(j*(j+1))),cpow(w,float(2*j+1))+cpow(v,float(2*j+1)));
		thetaz4_prime += float(2*j)*alternate_j * cmul(cpow(q,float(j*j)),cpow(w,float(2*j))-cpow(v,float(2*j)));

		alternate_j = -alternate_j;
	}

	thetaz1 = cmul(vec2(q4.y,-q4.x),thetaz1);
	theta02 = 2.0 * cmul(q4,theta02);
	theta03 = 2.0 * theta03 + ONE;

	theta02 = cmul(theta02,theta02);
	theta03 = cmul(theta03,theta03);

	thetaz1_prime = cmul(PI*q4,thetaz1_prime);
	thetaz4_prime = cmul(I*PI,thetaz4_prime);

	// pi * pi = 9.8696044010893586188
	vec2 prod = 9.8696044010893586188*cmul(theta02,theta03);
	prod = cmul(2.0*prod,thetaz4);
	prod = cmul(prod, cmul(thetaz1,thetaz4_prime)-cmul(thetaz4,thetaz1_prime));
	prod = cmul(prod,cpow(thetaz1,-3.0));
	return prod;
}

// Weierstrass sigma function
// Uses the garbage implementation outlined at https://mathworld.wolfram.com/WeierstrassSigmaFunction.html
// which uses the garbage notation that w = e^{i z} not e^{i pi z}.
vec2 wsigma(vec2 z, vec2 t) {
	// TODO: implement quasiperiodicity?
	vec2 q = cexp(PI * vec2(-t.y,t.x));
	vec2 q4 = cexp(PI/4.0 * vec2(-t.y,t.x));

	vec2 w = ONE;
	vec2 v = ONE;

// theta evaluated at pi z -> z
	vec2 w_PI= cexp(PI*vec2(-z.y,z.x));
	vec2 v_PI = cdiv(1.0,w_PI);

	vec2 thetaz1 = w_PI-v_PI;

// theta1'(0,q)
	vec2 thetaz1_prime = 2.0*ONE;
	vec2 thetaz1_triple_prime = 2.0*ONE;

	float alternate_j = -1.0;
	for (int j = 1; j < THETA_BOUND; j++) {
		thetaz1 += alternate_j * cmul(cpow(q,float(j*(j+1))),cpow(w_PI,float(2*j+1))-cpow(v_PI,float(2*j+1)));


		thetaz1_prime += float(2*j+1)*alternate_j * cpow(q,float(j*(j+1))) * 2.0;
		thetaz1_triple_prime += float((2*j+1)*(2*j+1)*(2*j+1))*alternate_j * cpow(q,float(j*(j+1))) * 2.0;

		alternate_j = -alternate_j;
	}

	thetaz1 = cmul(vec2(q4.y,-q4.x),thetaz1);


	thetaz1_prime =cmul(q4,thetaz1_prime);
	thetaz1_triple_prime = -cmul(q4,thetaz1_triple_prime);

	vec2 prod = cdiv(ONE,PI*thetaz1_prime);
	prod = cmul(prod,cexp(-PI*PI*cdiv(cmul(cmul(z,z),thetaz1_triple_prime),6.0*thetaz1_prime)));
	return cmul(prod,thetaz1);
}

// Klein's j-invariant
// Implemented via https://en.wikipedia.org/wiki/J-invariant, ``Expressions in terms of theta functions''
vec2 kleinj(vec2 z) {
	if (z.y <= 0.0) {
		return ZERO;
	}
	// if (z.x == 0.0)
	// {
	// 	return ZERO;
	// } else if (z.y < 0.0) { //this should work
	// 	z = cdiv(-ONE,z);
	// }
	vec2 q = cexp(PI * vec2(-z.y,z.x));

	vec2 a = ONE;
	vec2 b = ZERO;
	vec2 c = ZERO;

	float alternate_j = -1.0;
	for (int j = 1; j < THETA_BOUND; j++) {
		a += cpow(q,float(j*(j+1)));
		b += cpow(q,float(j*j));
		c += alternate_j *cpow(q,float(j*j));

		alternate_j = -alternate_j;
	}

	a = 2.0 * a;
	b = 2.0 * b + ONE;
	c = 2.0 * c + ONE;

	a = cmul(q,cmul(q,cpow(a,8.0)));
	b = cpow(b,8.0);
	c = cpow(c,8.0);
	return 32.0 * cdiv(cpow(a+b+c,3.0),cmul(cmul(a,b),c));
}

// =j(z)/1728
vec2 kleinJ(vec2 z) {
	if (z.y <= 0.0)
	{
		return ZERO;
	}

	vec2 q = cexp(PI * vec2(-z.y,z.x));

	vec2 a = ONE;
	vec2 b = ZERO;
	vec2 c = ZERO;

	float alternate_j = -1.0;
	for (int j = 1; j < THETA_BOUND; j++) {
		a += cpow(q,float(j*(j+1)));
		b += cpow(q,float(j*j));
		c += alternate_j *cpow(q,float(j*j));

		alternate_j = -alternate_j;
	}

	a = 2.0 * a;
	b = 2.0 * b + ONE;
	c = 2.0 * c + ONE;

	a = cmul(q,cmul(q,cpow(a,8.0)));
	b = cpow(b,8.0);
	c = cpow(c,8.0);
	return cdiv(cpow(a+b+c,3.0),54.0*cmul(cmul(a,b),c));
}

// Klein's j-invariant as a function of q = exp(2 pi i z)
vec2 kleinjq(vec2 q) {
	if (q.x*q.x+q.y*q.y >= 1.0) {
		return ZERO;
	}
	q = cpow(q,0.5);

	vec2 a = ONE;
	vec2 b = ZERO;
	vec2 c = ZERO;

	float alternate_j = -1.0;
	for (int j = 1; j < THETA_BOUND; j++) {
		a += cpow(q,float(j*(j+1)));
		b += cpow(q,float(j*j));
		c += alternate_j *cpow(q,float(j*j));

		alternate_j = -alternate_j;
	}

	a = 2.0 * a;
	b = 2.0 * b + ONE;
	c = 2.0 * c + ONE;

	a = cmul(q,cmul(q,cpow(a,8.0)));
	b = cpow(b,8.0);
	c = cpow(c,8.0);
	return 32.0 * cdiv(cpow(a+b+c,3.0),cmul(cmul(a,b),c));
}

// =kleinjq(z)/1728
vec2 kleinJq(vec2 q) {
	if (q.x*q.x+q.y*q.y >= 1.0) {
		return ZERO;
	}
	q = cpow(q,0.5); //???

	vec2 a = ONE;
	vec2 b = ZERO;
	vec2 c = ZERO;

	float alternate_j = -1.0;
	for (int j = 1; j < THETA_BOUND; j++) {
		a += cpow(q,float(j*(j+1)));
		b += cpow(q,float(j*j));
		c += alternate_j *cpow(q,float(j*j));

		alternate_j = -alternate_j;
	}

	a = 2.0 * a;
	b = 2.0 * b + ONE;
	c = 2.0 * c + ONE;

	a = cmul(q,cmul(q,cpow(a,8.0)));
	b = cpow(b,8.0);
	c = cpow(c,8.0);
	return cdiv(cpow(a+b+c,3.0),54.0*cmul(cmul(a,b),c));
}



// these can probably go in a different file...

const vec2 GAMMA_CONST_0 = ONE;
const float GAMMA_CONST_1 = 676.5203681218851;
const float GAMMA_CONST_2 = -1259.1392167224028;
const float GAMMA_CONST_3 = 771.3234287776531;
const float GAMMA_CONST_4 = -176.6150291621406;
const float GAMMA_CONST_5 = 12.507343278686905;
const float GAMMA_CONST_6 = -0.13857109526572012;
const float GAMMA_CONST_7 = .000009984369578019572;
const float GAMMA_CONST_8 = .00000015056327351493116;

vec2 gamma_helper(vec2 a) 
{
	a -= ONE;

	vec2 y = GAMMA_CONST_0;
	y += cdiv(GAMMA_CONST_1, vec2(a.x + 1.0, a.y));
	y += cdiv(GAMMA_CONST_2, vec2(a.x + 2.0, a.y));
	y += cdiv(GAMMA_CONST_3, vec2(a.x + 3.0, a.y));
	y += cdiv(GAMMA_CONST_4, vec2(a.x + 4.0, a.y));
	y += cdiv(GAMMA_CONST_5, vec2(a.x + 5.0, a.y));
	y += cdiv(GAMMA_CONST_6, vec2(a.x + 6.0, a.y));
	y += cdiv(GAMMA_CONST_7, vec2(a.x + 7.0, a.y));
	y += cdiv(GAMMA_CONST_8, vec2(a.x + 8.0, a.y));
	vec2 t = vec2(a.x + 7.5, a.y);
	return sqrt(2.0*PI) * cmul(cpow(t, vec2(a.x+0.5, a.y)), cmul(cexp(-t), y));
}

// Lanczos
vec2 gamma(vec2 a) {
	float result = 0.0;
	if (a.x < 0.5) {
		return cdiv(vec2(PI, 0.0), cmul(csin(PI * a), gamma_helper(ONE - a)));
	}
	return gamma_helper(a);
}


float gamma_float_helper(float a) {
	a -= 1.0;

	float y = 1.0;
	y += GAMMA_CONST_1 / (a + 1.0);
	y += GAMMA_CONST_2 / (a + 2.0);
	y += GAMMA_CONST_3 / (a + 3.0);
	y += GAMMA_CONST_4 / (a + 4.0);
	y += GAMMA_CONST_5 / (a + 5.0);
	y += GAMMA_CONST_6 / (a + 6.0);
	y += GAMMA_CONST_7 / (a + 7.0);
	y += GAMMA_CONST_8 / (a + 8.0);
	float t = a+7.5;
	return sqrt(2.0*PI) * cpow(t, a+0.5) * cexp(-t) * y;
}

// This is a faster version of gamma for real inputs (which implies real outputs)
float gamma(float a) {
	if (a < 0.5) {
		return PI/(csin(PI * a)* gamma_float_helper(1.0 - a));
	}
	return gamma_float_helper(a);
}

float gamma(int a) {
	return gamma(float(a));
}

const int F21_BOUND = 15;

// because I can't get enough of long function names
vec2 hypergeometric2f1_helper(float a, float b, float c, vec2 z) {
	vec2 summer = ONE;
    float term = 1.0;
    vec2 zn = ONE;
    for (int n = 1; n < F21_BOUND; n++) {
        term *= a+float(n-1);
        term *= b+float(n-1);
        term /= c+float(n-1);
        term /= float(n);
        zn = cmul(z,zn);
        summer += term*zn;
    }
    return summer;
}

// Returns 2F1(a,b,c,z) a la https://en.wikipedia.org/wiki/Hypergeometric_function
// Can add some more patches to improve convergence, meh. Currently converges extremely well away from |z|=1
// ideas for more: https://fredrikj.net/blog/2015/10/the-2f1-bites-the-dust/
vec2 hypergeometric2f1(float a, float b, float c, vec2 z) {
    if (cmag2(z) <= 1.0) {
        return hypergeometric2f1_helper(a,b,c,z);
    } else {
    	vec2 summer = cmul(cpow(-z,-a)/(gamma(b)*(gamma(c-a))*gamma(a-b+1.0)),hypergeometric2f1_helper(a,a-c+1.0,a-b+1.0,cinv(z)));
    	summer -= cmul(cpow(-z,-b)/(gamma(a)*(gamma(c-b))*gamma(b-a+1.0)),hypergeometric2f1_helper(b,b-c+1.0,b-a+1.0,cinv(z)));
    	return gamma(c)*PI*ccsc(PI*(b-a))*summer;
    }
}

// because I hate typing long function names
vec2 f21(float a, float b, float c, vec2 z) {
	return hypergeometric2f1(a,b,c,z);
}

float rising_factorial(float a, int n) {
	float prod = 1.0;
	for (int i = 0; i < 100; i++) {
		if (i >= n) {
			break;
		}
		prod *= a+float(i);
	}
	return prod;
}


const int F1_BOUND = 10;


// Works!
vec2 hypergeometricf1_helper(float a, float b1, float b2, float c, vec2 x, vec2 y) {
	vec2 summer = hypergeometric2f1(a,b1, c,x);
	summer = cmul(summer,hypergeometric2f1(a,b2, c,y));

	float term = 1.0;
	vec2 vec_term = ZERO;
	vec2 xyr = ONE;
	for (int r = 1; r < F1_BOUND; r++) {
		term *= a + float(r-1);
		term *= b1 + float(r-1);
		term *= b2 + float(r-1);
		term *= c-a + float(r-1);
		term /= c + 2.0*float(r-1);
		term /= c + 2.0 *float(r-1) + 1.0;
		term /= float(r);
		xyr = cmul(cmul(xyr,x),y);
		
		vec_term = xyr/rising_factorial(c+float(r)-1.0,r) ;
		vec_term = cmul(vec_term,hypergeometric2f1(a+float(r),b1 + float(r), c+2.0*float(r),x));
		vec_term = cmul(vec_term,hypergeometric2f1(a+float(r),b2 + float(r), c+2.0*float(r),y));		
		summer += term*vec_term;
		
	}
    return summer;
}

// Appell series F1 as defined in https://en.wikipedia.org/wiki/Appell_series
// Can implement more patches with http://www.gasaneofisica.uns.edu.ar/papers/2001/ColavecchiaGasaneoMiragliacpc_01_138_29.pdf
// this is super close to working right		
vec2 hypergeometricf1(float a, float b1, float b2, float c, vec2 x, vec2 y) {
	if (cmag2(x) < 1.0) {
		if (cmag2(y) < 1.0) {
			return hypergeometricf1_helper(a,b1,b2,c,x,y);
		}
	}
	return ZERO;
}

// Works! test with wp(inverse_wp(z,rho),rho)
vec2 inverse_wp(vec2 z, vec2 tau) {
	// TODO: slowly implement exact inverses with F1
	if (tau.y < 0.0) {
		tau = -tau;
	}

	vec2 r1 = wp(0.5*ONE,tau);
	vec2 r2 = wp(tau/2.0,tau);
	vec2 r3 = wp(0.5*ONE + tau/2.0,tau);
	if (cmag2(cdiv(r2-r1,z-r1))<1.0) {
		if (cmag2(cdiv(r3-r1,z-r1)) < 1.0) {
			return cdiv(-1.0*hypergeometricf1(0.5,0.5,0.5,1.5,cdiv(r2-r1,z-r1),cdiv(r3-r1,z-r1)), cpow(z-r1,0.5));
		}
	}

	// tau.x = fract(tau.x);

	// cannot mod out z

	float constant = 0.5/float(INVERSE_WP_BOUND);
	float x_coord = 0.0;
	vec2 y_coord = ZERO;

	int best_i = 0;
	int best_j = 0;
	float best_f = 1000.0;
	float cur_f = 0.0;

	for (int i = 0; i < INVERSE_WP_BOUND+1; i++) {
		for (int j = 0; j < 2*INVERSE_WP_BOUND+1; j++) {
			x_coord = constant * float(i);
			y_coord = constant * tau * float(j);
			cur_f = cmag2(wp(vec2(x_coord, 0.0)+y_coord,tau)-z);
			if (cur_f < best_f) {
				best_i = i;
				best_j = j;
				best_f = cur_f;
			}
		}
	}
	vec2 best_z = vec2(float(best_i)*constant,0.0) +  float(best_j)*constant*tau;
	best_z -= floor(best_z.y/tau.y)*tau;
	best_z.x = fract(best_z.x);
	return best_z;

}

// Inverse function to kleinJ
// Uses ``Method 4: Solving the quadratic in α'' from https://en.wikipedia.org/wiki/J-invariant
vec2 inverse_j(vec2 z) {

	// Test code: 1728.0*cdiv(cpow(g2(inverse_j(z)),3.0),cpow(g2(inverse_j(z)),3.0)-27.0 * cpow(g3(inverse_j(z)),2.0))
	// Should return the identity (it does!)

	vec2 temp = cdiv(432.0,z);
	vec2 a = 0.5 * (ONE + cpow(ONE-4.0*temp,0.5));
	return cmul(I,cdiv(hypergeometric2f1(1.0/6.0,5.0/6.0,1.0,ONE-a),hypergeometric2f1(1.0/6.0,5.0/6.0,1.0,a)));
}

// IN: g2 = a, g3 = b
// OUT: tau such that y^2 = 4x^3 - g2(tau)x - g3(tau) is isomorphic to y^2 = 4x^3 - ax - b
vec2 inverse_g2_g3(vec2 a, vec2 b) {
	a = cpow(a,3.0);
	b = cpow(b,2.0);
	return inverse_j(1728.0*cdiv(a,a-27.0*b));
}

vec2 inverse_g2_g3(float a, float b)
{
	return inverse_g2_g3(vec2(a, 0.0), vec2(b, 0.0));
}


// Returns the character of the irreducible su3 representation with highest weight (p,q)
// Algorithm from https://math.stackexchange.com/questions/2852355/irreducible-characters-of-su3

vec2 su3_character(int p, int q, vec2 z) {
	vec2 summer = ZERO;
	float theta = z.x; //todo: change
	float phi = z.y*sqrt(2.0);
	for (int k = 0; k < 100; k++) {
		if (k >= q) {
			if (k > p+q) {
				break;
			}
			for (int l = 0; l < 100; l++) {
				if (l > q) {
					break;
				}
				summer += csin(float(k-l+1) * phi / 2.0)/csin(phi / 2.0) * cexp(-1.5 * I * float(k+l)*theta); 
			}
		}
	}
	return cmul(summer, cexp(I*theta*(float(p+2*q))));
}

vec2 su3_character(float p, float q, vec2 z) {
	return su3_character(int(p),int(q), z);
}



// benchmarking function
vec2 bench1000(vec2 z) {
	vec2 temp = z;
	for (int j = 0; j < 100; j++) {
		temp += wp(z,rho);
	}
	return temp;
}
