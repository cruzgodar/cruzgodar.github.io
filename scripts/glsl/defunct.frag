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

const int INVERSE_WP_BOUND = 10;

vec2 inverse_wp(vec2 z, vec2 tau) {
	if (tau.y < 0.0) {
		tau = -tau;
	}
	tau.x = fract(tau.x);
	z -= floor(z.y/tau.y)*tau;
	z.x = fract(z.x);


	float constant = 0.5/float(INVERSE_WP_BOUND);
	float x_coord = 0.0;
	vec2 y_coord = ZERO;

	int best_i = 0;
	int best_j = 0;
	float best_f = 1000.0;
	float cur_f = 0.0;

	for (int i = 0; i < INVERSE_WP_BOUND; i++) {
		for (int j = 0; j < 2 * INVERSE_WP_BOUND; j++) {
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
	return vec2(float(best_i)*constant,0.0) +  float(best_j)*constant*tau;
}