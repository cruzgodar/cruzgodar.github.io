// https://arxiv.org/pdf/1806.06725.pdf
// TODO: implement quasiperiodicity, a la https://mathworld.wolfram.com/JacobiThetaFunctions.html
#function theta1
#requires cexp cpow
vec2 theta1(vec2 z, vec2 t) {
	

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
#endfunction



#function theta2
#requires cexp cpow
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
#endfunction



#function theta3
#requires cexp cpow
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
#endfunction



#function theta4
#requires cexp cpow
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
#endfunction



// auxiliary function
#function eisenstein4
#requires cexp cpow
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
#endfunction



#function g2
#requires eisenstein4
vec2 g2(vec2 z) {
	// 60.0 *2.0 * pi^4/90.0 = 129.878788045336582
	return 129.878788045336582 * eisenstein4(z);
}
#endfunction



#function eisenstein6
#requires cexp cpow
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
#endfunction



#function g3
#requires eisenstein6
vec2 g3(vec2 z) {
	// off by about 0.5% at z = rho; could use some attention to precision
	// 140.0 *2.0 * pi^6/945.0  = 284.856...
	return 284.856057355645759120065 * eisenstein6(z);
}
#endfunction


// Developer note: eisenstein8 was implemented along the lines of the two above... it's extremely unstable!
// Just use M_k = {E_4,E_6} for all E_k, k>6.

// Returns E_k(z) where E_k is the normalized Eisenstein series of weight k and level 1 (k must be even...).
// Uses equation (1.3) from https://arxiv.org/pdf/math/0009130.pdf.
//TODO: implement eisenstein(k,q)
#function eisenstein
#requires eisenstein4 eisenstein6 cpow
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
#endfunction



// Returns eta^24 where eta is the dedekind eta function
// Note: this is the modular discriminant over (2pi)^12
#function delta
#requires cexp cpow
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
#endfunction



// delta(q)
#function deltaq
#requires cpow
vec2 deltaq(vec2 z) {
	if (cmag2(z) >= 1.0)
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
#endfunction



// Returns the weierstrass p function with w1 = 1, w2 = tau
// Algorithms from equation 1.10 of https://arxiv.org/pdf/1806.06725.pdf
#function wp
#requires cexp cpow
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
#endfunction



#function weierstrassp
#requires wp
vec2 weierstrassp(vec2 z, vec2 tau) {
	return wp(z,tau);
}
#endfunction




// Returns the derivative of the Weierstrass p function wp
// This satisfies p'^2 - 4p^3 +g2 p + g3 =0, although we have some instability issues
// Can check by plotting cpow(wpprime(z,rho),2.0)-4.0*cpow(wp(z,rho),3.0) + g3(rho)
#function wpprime
#requires cexp cpow
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
#endfunction



// Weierstrass sigma function
// Uses the garbage implementation outlined at https://mathworld.wolfram.com/WeierstrassSigmaFunction.html
// which uses the garbage notation that w = e^{i z} not e^{i pi z}.
#function wsigma
#requires cexp cpow
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
#endfunction



// Klein's j-invariant
// Implemented via https://en.wikipedia.org/wiki/J-invariant, ``Expressions in terms of theta functions''
#function kleinj
#requires cexp cpow
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
#endfunction



// =j(z)/1728
#function kleinJ
#requires cexp cpow
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
#endfunction



// Klein's j-invariant as a function of q = exp(2 pi i z)
#function kleinjq
#requires cpow
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
#endfunction



// =kleinjq(z)/1728
#function kleinJq
#requires cpow
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
#endfunction



#function kleinj_from_g2_g3
#requires cpow
float kleinj_from_g2_g3(float a, float b) {
	return cpow(4.0*a,3.0)/(cpow(4.0*a,3.0) + cpow(27.0*b,2.0)) * 1728.0/16.0;
}
#endfunction