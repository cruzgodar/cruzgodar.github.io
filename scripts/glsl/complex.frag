const float PI = 3.141592653589;

const vec2 ZERO = vec2(0.0, 0.0);
const vec2 ONE = vec2(1.0, 0.0);
const vec2 i = vec2(0.0, 1.0);
const vec2 I = i;

// error tolerance in glsl-tests.js... someday...
const float TOL = .0001;


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
	for (int j = 0; j < 1000; j++)
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

const int EISENSTEIN_BOUND = 20;

// auxiliary function
vec2 eisenstein4(vec2 z)
{
	vec2 summer = ZERO;
	vec2 temp = ZERO;
	for (int r = 1; r < EISENSTEIN_BOUND; r++) // need to fine tune this bound
	{
		// add r^(k-1)q^r / (1-q^r)
		// uses identity exp(2PI i rz)/(1-exp(2PI i rz)) = i/2 * (cot(PI r z)+ i)
		temp = ccot(PI*float(r)*z);
		temp = vec2(temp.x,temp.y + 1.0);
		summer += float(r*r*r)* temp;
	}
	summer *= -120.0;
	summer = vec2(-summer.y,summer.x);
	return vec2(1.0-summer.x,summer.y);
}

vec2 eisenstein6(vec2 z)
{
	vec2 summer = ZERO;
	vec2 temp = ZERO;
	for (int r = 1; r < EISENSTEIN_BOUND; r++) // need to fine tune this bound
	{
		temp = ccot(PI*float(r)*z);
		temp = vec2(temp.x,temp.y + 1.0);
		summer += float(r*r*r*r*r)* temp;
	}
	summer *= 252.0;
	summer = vec2(-summer.y,summer.x);
	return vec2(1.0-summer.x,summer.y);
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
		if (k == 10.0)
		{
			return cmul(e4,e6);
		} else if (k == 12.0) {
			return 1.0/691.0 * (441.0*cpow(e4,3.0) + 250.0 * cpow(e6,2.0));
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
	vec2 q = cexp(2.0*PI*vec2(-z.y,z.x));
	vec2 prod = q;
	for (int j = 1; j < DELTA_BOUND; j++) {
		prod = cmul(prod,cpow(ONE-cpow(q,float(j)),24.0));
	}
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


// these can probably go in a different file...

const vec2 GAMMA_CONST_0 = vec2(0.99999999999980993,0.0);
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
float gamma(float a) {
	return gamma(vec2(a, 0.0)).x;
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

const float dn = 1023286908188737.0;

// Riemann zeta function
// algorithm 2 of http://citeseerx.ist.psu.edu/viewdoc/download;jsessionid=5B07751C858FF584B31B250A0F3AFC58?doi=10.1.1.56.9455&rep=rep1&type=pdf
// accurate for |a|<20 or so

vec2 zeta_helper(vec2 a) {
	// can also cache logs of bases
	vec2 tot = vec2(-0.999999999999999,0.0);
	tot += 0.999999999999217 * cpow_logz(2.0, 0.693147180559945,-a);
	tot += -0.999999999895239 * cpow_logz(3.0, 1.09861228866811,-a);
	tot += 0.999999994405165 * cpow_logz(4.0, 1.38629436111989,-a);
	tot += -0.999999841075265 * cpow_logz(5.0, 1.60943791243410,-a);
	tot += 0.999997224244960 * cpow_logz(6.0, 1.79175946922805,-a);
	tot += -0.999967487536949 * cpow_logz(7.0, 1.94591014905531,-a);
	tot += 0.999729593872863 * cpow_logz(8.0, 2.07944154167984,-a);
	tot += -0.998337915937962 * cpow_logz(9.0, 2.19722457733622,-a);
	tot += 0.992225448145452 * cpow_logz(10.0, 2.30258509299405,-a);
	tot += -0.971700424715869 * cpow_logz(11.0, 2.39789527279837,-a);
	tot += 0.918388675548119 * cpow_logz(12.0, 2.48490664978800,-a);
	tot += -0.810606226143756 * cpow_logz(13.0, 2.56494935746154,-a);
	tot += 0.640807413543651 * cpow_logz(14.0, 2.63905732961526,-a);
	tot += -0.433275531476856 * cpow_logz(15.0, 2.70805020110221,-a);
	tot += 0.238624938641794 * cpow_logz(16.0, 2.77258872223978,-a);
	tot += -0.101270689665439 * cpow_logz(17.0, 2.83321334405622,-a);
	tot += 0.0307572784262407 * cpow_logz(18.0, 2.89037175789616,-a);
	tot += -0.00590969541814232 * cpow_logz(19.0, 2.94443897916644,-a);
	tot += 0.000537245038012938 * cpow_logz(20.0, 2.99573227355399,-a);
	return cdiv(-tot, (ONE-cpow(2.0, ONE-a)));
}

// Seems to be pretty unstable with large imaginary part
vec2 zeta(vec2 a) {
	if (a.x < 0.5) {
		if (a.x == 0.0) {
			return vec2(-0.5,0.0);
		}
		vec2 ans = cmul(cmul(cmul(cmul(cpow(2.0,a),cpow(PI,a-ONE)),csin(PI * a / 2.0)),gamma(ONE-a)), zeta_helper(ONE-a));
		return vec2(ans.x,ans.y);
	} else {
		vec2 ans = zeta_helper(a);
		return vec2(ans.x,ans.y);
	}
}

float zeta(float a) {
	return zeta(vec2(a,0.0)).x;
}


// benchmarking function
vec2 bench1000(vec2 z) {
	vec2 temp = z;
	for (int j = 0; j < 10000; j++) {
		temp += zeta(z);
	}
	return temp;
}