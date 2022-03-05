vec2 cacos(vec2 a) {
	return vec2(PI/2.0, 0.0) - cmul(-I, clog(vec2(-a.y,a.x) + cpow(ONE - vec2(a.x*a.x - a.y*a.y, a.x*a.y + a.y*a.x),0.5)));
}

float cacos(float a) {
	return cacos(vec2(a,0.0)).x;
}