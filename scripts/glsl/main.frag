/*
	Simple arithmetic functions included by default in every shader.
*/


const float PI = 3.141592653589;

const vec2 ZERO = vec2(0.0, 0.0);
const vec2 ONE = vec2(1.0, 0.0);
const vec2 i = vec2(0.0, 1.0);
const vec2 I = i;
const vec2 rho = vec2(-0.5, 0.866025403784438);


//Returns |z|.
float cabs(vec2 z)
{
	return length(z);
}

float cabs(float z)
{
	return abs(z);
}



//Returns |z|.
float carg(vec2 z)
{
	if (z.x == 0.0)
	{
		if (z.y >= 0.0)
		{
			return 1.57079632;
		}
		
		return -1.57079632;
	}
	
	return atan(z.y, z.x);
}

float carg(float z)
{
	if (z >= 0.0)
	{
		return 0.0;
	}
	
	return 3.14159265;
}

// Returns |z|^2
float cmag2(vec2 z) {
	return dot(z, z);
}

float cmag2(float z) {
	return z*z;
}


//Returns the conjugate of z.
vec2 cconj(vec2 z)
{
	return vec2(z.x, -z.y);
}

float cconj(float z)
{
	return z;
}



//Returns z / |z|.
vec2 csign(vec2 z)
{
	if (length(z) == 0.0)
	{
		return vec2(0.0, 0.0);
	}
	
	return z / length(z);
}

float csign(float z)
{
	return sign(z);
}


//Returns z + w.
vec2 cadd(vec2 z, vec2 w)
{
	return z + w;
}

vec2 cadd(vec2 z, float w)
{
	return vec2(z.x + w, z.y);
}

vec2 cadd(float z, vec2 w)
{
	return vec2(z + w.x, w.y);
}

float cadd(float z, float w)
{
	return z + w;
}



//Returns z - w.
vec2 csub(vec2 z, vec2 w)
{
	return z - w;
}

vec2 csub(vec2 z, float w)
{
	return vec2(z.x - w, z.y);
}

vec2 csub(float z, vec2 w)
{
	return vec2(z - w.x, -w.y);
}

float csub(float z, float w)
{
	return z - w;
}



//Returns z * w.
vec2 cmul(vec2 z, vec2 w)
{
	return vec2(z.x * w.x - z.y * w.y, z.x * w.y + z.y * w.x);
}

vec2 cmul(vec2 z, float w)
{
	return z * w;
}

vec2 cmul(float z, vec2 w)
{
	return z * w;
}

float cmul(float z, float w)
{
	return z * w;
}



//Returns z / w.
vec2 cdiv(vec2 z, vec2 w)
{
	float len_w = w.x * w.x + w.y * w.y;
	if (len_w == 0.0)
	{
		return vec2(1.0, 0.0);
	}
	
	return vec2(z.x * w.x + z.y * w.y, -z.x * w.y + z.y * w.x) / len_w;
}

vec2 cdiv(vec2 z, float w)
{
	if (w == 0.0)
	{
		return vec2(1.0, 0.0);
	}
	
	return z / w;
}

vec2 cdiv(float z, vec2 w)
{
	float len_w = w.x * w.x + w.y * w.y;
	if (len_w == 0.0)
	{
		return vec2(1.0, 0.0);
	}
	
	return vec2(z * w.x, -z * w.y) / len_w;
}

float cdiv(float z, float w)
{
	if (w == 0.0)
	{
		return 1.0;
	}
	
	return z / w;
}



//Returns 1/z.
vec2 cinv(vec2 z)
{
	float magnitude = cmag2(z);
	
	return vec2(z.x / magnitude, -z.y / magnitude);
}

float cinv(float z)
{
	if (z == 0.0)
	{
		return 1.0;
	}
	
	return 1.0 / z;
}