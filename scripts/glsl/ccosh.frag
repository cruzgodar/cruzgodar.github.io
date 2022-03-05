vec2 ccosh(vec2 a) {
	return (cexp(a) + cexp(-a))/2.0;
}

float ccosh(float a) {
	return (exp(a)+exp(-a))/2.0;
}