// Returns arcsin(a)
vec2 casin(vec2 a) {
	return cmul(-I, clog(vec2(-a.y,a.x) + cpow(ONE - vec2(a.x*a.x - a.y*a.y, a.x*a.y + a.y*a.x),0.5)));
}

float casin(float a) {
	return casin(vec2(a,0.0)).x;
}