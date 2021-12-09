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

const int INVERSE_E4_BOUND = 10;
// Returns *very* approximate x in fundamental domain such e4(x) = z (brute force)
// restrictions: |real(x)|<0.5, 0 < im(x) < 1, |x|^2 > 1
vec2 inverse_e4(vec2 z) {
	float constant = 0.5/float(INVERSE_E4_BOUND);
	float x_coord = 0.0;
	float y_coord = 0.0;

	int best_i = 0;
	int best_j = 0;
	float best_f = cmag2(ONE*1000.0);
	float cur_f = 0.0;

	for (int i = -INVERSE_E4_BOUND; i < INVERSE_E4_BOUND; i++) {
		for (int j = 0; j < 4 * INVERSE_E4_BOUND; j++) {
			x_coord = constant * float(i);
			y_coord = constant * float(j);
			if (x_coord*x_coord + y_coord*y_coord>1.0) {
				cur_f = cmag2(eisenstein4(vec2(x_coord, y_coord))-z);
				if (cur_f < best_f) {
					best_i = i;
					best_j = j;
					best_f = cur_f;
				}
			}
		}
	}
	return vec2(float(best_i)*constant, float(best_j)*constant);
}



// Algorithm from Baaquie's paper cited in
// https://math.stackexchange.com/questions/2852355/irreducible-characters-of-su3

vec2 su3_character(float p, float q, vec2 z) {
	vec2 summer = ZERO;
	summer -= cexp(I*((p+1.0)*z.y-(q+1.0)*z.x));
	summer += cexp(I*((p+1.0)*z.x-(q+1.0)*z.y));
	summer += cmul(cexp(-I*(p+1.0)*(z.x+z.y)),cexp(-I*(q+1.0)*z.x)-cexp(-I*(q+1.0)*z.y));
	summer += cmul(cexp(I*(q+1.0)*(z.x+z.y)),cexp(I*(p+1.0)*z.y)-cexp(I*(p+1.0)*z.x));
	summer = vec2(summer.y,-summer.x);
	return summer / (8.0 * csin((z.x-z.y)/2.0)*csin((z.x+2.0*z.y)/2.0)*csin((2.0*z.x+z.y)/2.0));
}

// float gamma_float_helper(float a) {
// 	a -= 1.0;

// 	// float y = GAMMA_CONST_0;
// 	// y += GAMMA_CONST_1 / (a + 1.0);
// 	// y += GAMMA_CONST_2 / (a + 2.0);
// 	// y += GAMMA_CONST_3 / (a + 3.0);
// 	// y += GAMMA_CONST_4 / (a + 4.0);
// 	// y += GAMMA_CONST_5 / (a + 5.0);
// 	// y += GAMMA_CONST_6 / (a + 6.0);
// 	// y += GAMMA_CONST_7 / (a + 7.0);
// 	// y += GAMMA_CONST_8 / (a + 8.0);
// 	// y += GAMMA_CONST_9 / (a + 9.0);
// 	float t = a+7.5;
// 	return sqrt(2.0*PI) * cpow(t, a+0.5) * cexp(-t) * y;
// }
// // TODO: make a faster version for real inputs since gamma(x\in R)\in R
// float gamma(float a) {
// 	// if (a < 0.5) {
// 	// 	return PI/(csin(PI * a)* gamma_float_helper(1.0 - a));
// 	// }
// 	return gamma_float_helper(a);
// }