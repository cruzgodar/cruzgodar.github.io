//Returns divisor(n,k), the sum all k-th powers of divisors of n.
#function divisor
float divisor(float n, float k)
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
#endfunction



// Returns n!. Limited to n < 20 since it's waaaay too big there already.
#function factorial
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

float factorial(int n)
{
	return factorial(float(n));
}
#endfunction



// Returns n choose k.
// I ripped this off of wikipedia
#function binomial
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

float binomial(float n, int k) {
	return binomial(n, float(k));
}

float binomial(int n, float k) {
	return binomial(float(n), k);
}

float binomial(int n, int k) {
	return binomial(float(n),float(k));
}
#endfunction



// Returns B_m, the mth Bernoulli number, e.g. 1, -1/2, 1/6, 0, -1/30, 0, ....
#function bernoulli
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
#endfunction



#function rising_factorial
#requires gamma
float rising_factorial(float a, int n) {
	if (n == 0) {
		return 1.0;
	}
	float prod = 1.0;

	if (n < 0) {
		n = -n;
		for (int i = 0; i < 100; i++) {
			if (i >= n) {
				break;
			}
			prod /= a-float(i+1);
		}
		return prod;
	}
	for (int i = 0; i < 100; i++) {
		if (i >= n) {
			break;
		}
		prod *= a+float(i);
	}
	return prod;
}

float rising_factorial(float a, float n) {
	if (fract(n) == 0.0) {
		return rising_factorial(a,int(n));
	}
	return gamma(a+n)/gamma(a);
}
#endfunction