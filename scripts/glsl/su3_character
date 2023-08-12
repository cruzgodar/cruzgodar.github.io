// Returns the character of the irreducible su3 representation with highest weight (p,q)
// e.g. trivial rep is (0,0), 3-dim fundamental is (1,0), 8-dim adjoint is (1,1)
// dimension is value at zero: (p+1)(q+1)(p+q+2)/2
// Algorithm from https://math.stackexchange.com/questions/2852355/irreducible-characters-of-su3
#function su3_character
#requires csin cexp
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
#endfunction