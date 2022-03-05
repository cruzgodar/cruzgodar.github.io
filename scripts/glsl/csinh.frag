vec2 csinh(vec2 a) {
	return (cexp(a) - cexp(-a))/2.0;
}

float csinh(float a) {
	return (exp(a)-exp(-a))/2.0;
}