//Returns cot(z).
// code ripped off of above code for tan
vec2 ccot(vec2 z)
{
	vec2 temp = cexp(2.0 * vec2(-z.y,z.x));
	temp = cdiv(vec2(1.0+temp.x,temp.y),vec2(-1.0+temp.x,temp.y));
	return vec2(-temp.y,temp.x);
}

float ccot(float z)
{
	return 1.0 / tan(z);
}