//Functions for testing if floats and vec2s are close enough to be considered equal.

#function equal_within_relative_tolerance
const float RELATIVE_TOL = .0000000001;

// relative
bool equal_within_relative_tolerance(vec2 a, vec2 b) {
	return (cmag2(a-b) < RELATIVE_TOL*cmag2(a+b));
}

bool equal_within_relative_tolerance(float a, float b) {
	return (cmag2(a-b) < RELATIVE_TOL*cmag2(a+b));
}
#endfunction


#function equal_within_absolute_tolerance
const float ABSOLUTE_TOL = .01;
bool equal_within_absolute_tolerance(vec2 a, vec2 b) {
	return (cmag2(a-b) < ABSOLUTE_TOL);
}
#endfunction

#function equal_within_sharp_absolute_tolerance
const float SHARP_ABSOLUTE_TOL = .0000000001;
bool equal_within_sharp_absolute_tolerance(vec2 a, vec2 b) {
	return (cmag2(a-b) < SHARP_ABSOLUTE_TOL);
}
#endfunction