import { ThurstonGeometry } from "./class.js";
import { E3Axes, E3Rooms, E3Spheres } from "./geometries/e3.js";
import { H2xEAxes, H2xERooms } from "./geometries/h2xe.js";
import { H3Axes, H3Rooms } from "./geometries/h3.js";
import { NilAxes, NilRooms, NilSpheres } from "./geometries/nil.js";
import { S2xEAxes, S2xERooms, S2xESpheres } from "./geometries/s2xe.js";
import { S3Axes, S3HopfFibration, S3Rooms, S3Spheres } from "./geometries/s3.js";
import { SL2RAxes, SL2RRooms } from "./geometries/sl2r.js";
import { SolRooms } from "./geometries/sol.js";
import { showPage } from "/scripts/src/load-page.js";
import { $, $$ } from "/scripts/src/main.js";

export function load()
{
	const applet = new ThurstonGeometry({
		canvas: $("#output-canvas"),
	});

	const scenes =
	{
		"e3-axes": E3Axes,
		"e3-rooms": E3Rooms,
		"e3-spheres": E3Spheres,

		"s3-axes": S3Axes,
		"s3-rooms": S3Rooms,
		"s3-spheres": S3Spheres,
		"s3-hopf-fibration": S3HopfFibration,

		"h3-axes": H3Axes,
		"h3-rooms": H3Rooms,

		"s2xe-axes": S2xEAxes,
		"s2xe-rooms": S2xERooms,
		"s2xe-spheres": S2xESpheres,

		"h2xe-axes": H2xEAxes,
		"h2xe-rooms": H2xERooms,

		"nil-axes": NilAxes,
		"nil-rooms": NilRooms,
		"nil-spheres": NilSpheres,

		"sl2r-axes": SL2RAxes,
		"sl2r-rooms": SL2RRooms,

		"sol-rooms": SolRooms
	};

	const sceneSelectorDropdownElement = $("#scene-selector-dropdown");

	if (!window.DEBUG)
	{
		$$("[data-option-name$=axes]").forEach(element => element.style.display = "none");
	}

	function run()
	{
		const GeometryDataClass = sceneSelectorDropdownElement.value === "none"
			? E3Rooms
			: scenes[sceneSelectorDropdownElement.value];
		
		const geometryData = new GeometryDataClass();

		const elementsToShow = Array.from(
			geometryData.uiElementsUsed
				? $$(geometryData.uiElementsUsed)
				: []
		).map(element => element.parentNode);
		
		const elementsToHide = Array.from(
			geometryData.uiElementsUsed
				? $$(`.slider-container > input:not(#fov-slider, ${geometryData.uiElementsUsed})`)
				: $$(".slider-container > input:not(#fov-slider)")
		).map(element => element.parentNode);

		elementsToShow.forEach(element => element.style.display = "");
		elementsToHide.forEach(element => element.style.display = "none");

		applet.run(geometryData);
		geometryData.initUI();
	}



	const sliders = {
		wallThickness: [$("#wall-thickness-slider"), $("#wall-thickness-slider-value")],
		fiberThickness: [$("#fiber-thickness-slider"), $("#fiber-thickness-slider-value")],
		gluingAngle: [$("#gluing-angle-slider"), $("#gluing-angle-slider-value")],
	};

	const resolutionInputElement = $("#resolution-input");

	applet.setInputCaps([resolutionInputElement], [1000]);



	resolutionInputElement.addEventListener("input", () =>
	{
		applet.needNewFrame = true;
		const resolution = parseInt(resolutionInputElement.value || 500);

		applet.changeResolution(resolution);
	});

	for (const key in sliders)
	{
		sliders[key][0].addEventListener("input", () =>
		{
			applet.geometryData.sliderValues[key] = parseFloat(sliders[key][1].textContent);
			applet.needNewFrame = true;
		});
	}

	const fovSliderElement = $("#fov-slider");
	const fovSliderValueElement = $("#fov-slider-value");

	fovSliderElement.addEventListener("input", () =>
	{
		applet.needNewFrame = true;
		applet.fov = Math.tan(parseFloat(fovSliderValueElement.textContent) / 2 * Math.PI / 180);
		applet.wilson.gl.uniform1f(applet.wilson.uniforms.fov, applet.fov);
	});



	sceneSelectorDropdownElement.addEventListener("input", run);

	run();



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("a-thurston-geometry.png");
	});

	

	showPage();
}

`

precision highp float;
			
varying vec2 uv;

uniform float aspectRatioX;
uniform float aspectRatioY;

uniform vec4 cameraPos;
uniform vec4 normalVec;
uniform vec4 upVec;
uniform vec4 rightVec;
uniform vec4 forwardVec;

uniform int resolution;

const float epsilon = 0.00001;
const int maxMarches = 200;
const float maxT = 50.0;
const float stepFactor = .9;
const vec3 fogColor = vec3(0.0, 0.0, 0.0);
const float fogScaling = .07;
uniform float fov;


uniform float wallThickness;
uniform vec3 baseColor;


float geometryDot(vec4 v, vec4 w)
{
	
return dot(v, w);

}

vec4 geometryNormalize(vec4 dir)
{
	
return normalize(dir);

}


const float pi = 3.141592653589793;
const float phi = 1.618033988749895;
const float tauInverse = 1.0390434606175136;

const mat4 teleportationMatrixA1 = mat4(
1, 0, 0, 0,
0, 1, 0, 0,
0, 0, 1, 0,
0.4472135954999579, -0.276393202250021, 0, 1
);
const mat4 teleportationMatrixA1inv = mat4(
1, 0, 0, 0,
0, 1, 0, 0,
0, 0, 1, 0,
-0.4472135954999579, 0.276393202250021, 0, 1
);
const mat4 teleportationMatrixA2 = mat4(
1, 0, 0, 0,
0, 1, 0, 0,
0, 0, 1, 0,
0.276393202250021, 0.4472135954999579, 0, 1
);
const mat4 teleportationMatrixA2inv = mat4(
1, 0, 0, 0,
0, 1, 0, 0,
0, 0, 1, 0,
-0.276393202250021, -0.4472135954999579, 0, 1
);
const mat4 teleportationMatrixB = mat4(
2.618033988749895, 0, 0, 0,
0, 0.38196601125010515, 0, 0,
0, 0, 1, 0,
0, 0, 0.9624236501192069, 1
);
const mat4 teleportationMatrixBinv = mat4(
0.38196601125010515, 0, 0, 0,
0, 2.618033988749895, 0, 0,
0, 0, 1, 0,
0, 0, -0.9624236501192069, 1
);

float sinh(float x)
{
return .5 * (exp(x) - exp(-x));
}

float cosh(float x)
{
return .5 * (exp(x) + exp(-x));
}

float tanh(float x)
{
float expTerm = exp(2.0 * x);

return (expTerm - 1.0) / (expTerm + 1.0);
}

float asinh(float x)
{
return log(x + sqrt(x*x + 1.0));
}

mat4 getTransformationMatrix(vec4 pos)
{
return mat4(
	exp(pos.z), 0.0, 0.0, 0.0,
	0.0, exp(-pos.z), 0.0, 0.0,
	0.0, 0.0, 1.0, 0.0,
	pos.x, pos.y, pos.z, 1.0
);
}

mat4 getInverseTransformationMatrix(vec4 pos)
{
float expZ = exp(pos.z);
float expNegZ = exp(-pos.z);

return mat4(
	expNegZ, 0.0, 0.0, 0.0,
	0.0, expZ, 0.0, 0.0,
	0.0, 0.0, 1.0, 0.0,
	-expNegZ * pos.x, -expZ * pos.y, -pos.z, 1.0
);
}

// Converts an element in Sol to an element in the universal cover of the suspension of the
// 2-torus, so that we can easily check if it needs to be teleported.
vec3 liftToM(vec4 pos)
{
return vec3(
	phi * pos.x - pos.y,
	pos.x + phi * pos.y,
	tauInverse * pos.z
);
}

// Elliptic integral computations, sourced from
// https://github.com/henryseg/non-euclidean_VR/blob/master/src/geometries/sol/geometry/shaders/part1.glsl,
// which is in turn based on various sources in the literature.

float global_mu;
float global_k;
float global_kPrime;
float global_m;
float global_K;
float global_E;
float global_L;

const int maxAGMSteps = 20;

// We can terminate the algorithm early, and this is the actual length of the data vector.
int actualAGMSteps;

const float minAGMError = 0.000001;

// The results of the AGM algorithm at each step. Each entry is of the form
// (arithmetic mean, geometric mean, error).
vec3 AGMData[maxAGMSteps];

// Equal to AGMData[actualAGMSteps - 1], which is invalid GLSL since it's not a compile-time
// constant index.
vec3 lastAGMData;

// The sequence of arithmetic-geometric means converges to an elliptic integral,
// and that's exactly what we need for some globals!
// See: https://en.wikipedia.org/wiki/Elliptic_integral#Computation
void runAGMAlgorithm()
{
// The starting values are 1 and kPrime. k starts as the initial error.
vec3 data = vec3(1.0, global_kPrime, global_k);
AGMData[0] = data;
actualAGMSteps = 1;

for (int i = 1; i < maxAGMSteps; i++)
{
	// This doesn't seem to match the Wikipedia article, although it does match
	// https://en.wikipedia.org/wiki/Arithmetic%E2%80%93geometric_mean#The_number_%CF%80.
	float error = 0.5 * (data.x - data.y);

	if (error < minAGMError)
	{
		lastAGMData = data;
		break;
	}

	data = vec3(0.5 * (data.x + data.y), sqrt(data.x * data.y), error);
	AGMData[i] = data;
	actualAGMSteps = i + 1;
}
}

// Called every time the direction chages (i.e. when we start marching and when we teleport)
void setGlobals(vec4 rayDirectionVec)
{
float absAB = abs(rayDirectionVec.x * rayDirectionVec.y);
float root1Minus2AbsAB = sqrt(1.0 - 2.0 * absAB);
float rootAbsAB = sqrt(absAB);

global_mu = sqrt(1.0 + 2.0 * absAB);
global_k = root1Minus2AbsAB / global_mu;
global_kPrime = 2.0 * rootAbsAB / global_mu;
global_m = (1.0 - 2.0 * absAB) / (1.0 + 2.0 * absAB);

runAGMAlgorithm();

// With that elliptic integral computed, we can compute K and E.
global_K = 0.5 * pi / lastAGMData.x;

float sumTotal = 0.0;

for (int i = 0; i < maxAGMSteps; i++)
{
	if (i == actualAGMSteps)
	{
		break;
	}

	sumTotal += pow(2.0, float(i - 1)) * AGMData[i].z * AGMData[i].z;
}

global_E = global_K * (1.0 - sumTotal);

if (absAB != 0.0)
{
	global_L = global_E / (global_kPrime * global_K) - 0.5 * global_kPrime;
}
}

const float numericalStepDistance = 0.0002;
const int maxNumericalSteps = 10;

// Flow from the origin numerically. Used when objects in the scene are extremely close.
vec4 getUpdatedPosNumerically(vec4 rayDirectionVec, float t)
{
vec4 pos = vec4(0.0, 0.0, 0.0, 1.0);
vec4 dir = rayDirectionVec;

int numSteps = int(floor(t / numericalStepDistance));

for (int i = 0; i < maxNumericalSteps; i++)
{
	if (i == numSteps)
	{
		break;
	}

	// This translates dir to pos.
	pos += numericalStepDistance * dir * vec4(exp(pos.z), exp(-pos.z), 1.0, 0.0);
	dir += numericalStepDistance * vec4(
		dir.x * dir.z,
		-dir.y * dir.z,
		-dir.x * dir.x + dir.y * dir.y,
		0.0
	);

	// Normalize the direction.
	float dirMagnitude = sqrt(
		exp(-2.0 * pos.z) * dir.x * dir.x
		+ exp(2.0 * pos.z) * dir.y * dir.y
		+ dir.z * dir.z
	);

	dir /= dirMagnitude;
}

return pos;
}

vec4 getUpdatedDirectionVecNumerically(vec4 rayDirectionVec, float t)
{
vec4 pos = vec4(0.0, 0.0, 0.0, 1.0);
vec4 dir = rayDirectionVec;

int numSteps = int(floor(t / numericalStepDistance));

for (int i = 0; i < maxNumericalSteps; i++)
{
	if (i == numSteps)
	{
		break;
	}

	// This translates dir to pos.
	pos += numericalStepDistance * dir * vec4(exp(pos.z), exp(-pos.z), 1.0, 0.0);
	dir += numericalStepDistance * vec4(
		dir.x * dir.z,
		-dir.y * dir.z,
		-dir.x * dir.x + dir.y * dir.y,
		0.0
	);

	// Normalize the direction.
	float dirMagnitude = sqrt(
		exp(-2.0 * pos.z) * dir.x * dir.x
		+ exp(2.0 * pos.z) * dir.y * dir.y
		+ dir.z * dir.z
	);

	dir /= dirMagnitude;
}

return dir;
}

vec4 getUpdatedPosNearX0(vec4 rayDirectionVec, float t)
{
float a = rayDirectionVec.x;
float b = rayDirectionVec.y;
float c = rayDirectionVec.z;

float b2 = b * b;
float c2 = c * c;

float n1 = sqrt(b2 + c2);
float n2 = n1 * n1;
float n3 = n1 * n2;
float n4 = n1 * n3;

// From the repo: cosh(s), sinh(s), and tanh(s) where s = n(t+t0)
float shs = (c * cosh(n1 * t) + n1 * sinh(n1 * t)) / abs(b);
float chs = (n1 * cosh(n1 * t) + c * sinh(n1 * t)) / abs(b);
float ths = shs / chs;

vec4 p0 = vec4(0.0, n1 * ths / b - c / b, log(abs(b) * chs / n1), 1.0);

vec4 p1 = vec4(b2 * (shs * chs + n1 * t) / (2.0 * n3) - c / (2.0 * n2), 0.0, 0.0, 0.0);

vec4 p2 = vec4(0.0,
	b * n1 * t / (2.0 * n3)
		- (b2 - 2.0 * c2) * ( n1 * t / pow(chs, 2.0) + ths) / (4.0 * b * n3)
		+ 3.0 * c / (4.0 * b * n2 * pow(chs, 2.0))
		- c / (2.0 * b * n2),
	-b2 * pow(chs, 2.0) / (4.0 * n4)
		- (b2 - 2.0 * c2) * (n1 * t * ths - 1.0) / (4.0 * n4)
		+ 3.0 * c * ths / (4.0 * n3),
	0.0
);

return p0 + a * p1 + a * a * p2;
}

vec4 getUpdatedDirectionVecNearX0(vec4 rayDirectionVec, float t)
{
float a = rayDirectionVec.x;
float b = rayDirectionVec.y;
float c = rayDirectionVec.z;

float b2 = b * b;
float c2 = c * c;

float n1 = sqrt(b2 + c2);
float n2 = n1 * n1;
float n3 = n1 * n2;
float n4 = n1 * n3;

// From the repo: cosh(s), sinh(s), and tanh(s) where s = n(t+t0)
float shs = (c * cosh(n1 * t) + n1 * sinh(n1 * t)) / abs(b);
float chs = (n1 * cosh(n1 * t) + c * sinh(n1 * t)) / abs(b);
float ths = shs / chs;

vec4 u0 = vec4(0.0, sign(b) * n1 / chs, n1 * ths, 0.0);

vec4 u1 = vec4(abs(b) * chs / n1, 0.0, 0.0, 0.0);

vec4 u2 = vec4(
	0.0,
	sign(b) * b2 * chs / (4.0 * n3)
		+ sign(b) * (b2 - 2.0 * c2) * (n1 * t * shs / pow(chs, 2.0) - 1.0 / chs) / (4.0 * n3)
		- 3.0 * sign(b) * c * shs / (4.0 * n2 * pow(chs, 2.0)),
	-b2 * shs * chs / (2.0 * n3)
		- (b2 - 2.0 * c2) * (ths - n1 * t / pow(chs, 2.0)) / (4.0 * n3)
		+ 3.0 * c / (4.0 * n2 * pow(chs, 2.0)),
	0.0
);

return u0 + a * u1 + a * a * u2;
}

vec4 getUpdatedPosNearY0(vec4 rayDirectionVec, float t)
{
// Applying the isometry S_2 from the paper lets us
// reuse the previous function.
vec4 pos = getUpdatedPosNearX0(
	vec4(rayDirectionVec.y, rayDirectionVec.x, -rayDirectionVec.z, 0.0),
	t
);

return vec4(pos.y, pos.x, -pos.z, 1.0);
}

vec4 getUpdatedDirectionVecNearY0(vec4 rayDirectionVec, float t)
{
vec4 dir = getUpdatedDirectionVecNearX0(
	vec4(rayDirectionVec.y, rayDirectionVec.x, -rayDirectionVec.z, 0.0),
	t
);

return vec4(dir.y, dir.x, -dir.z, 0.0);
}

const float jacobiEllipticTolerance = 0.001;

// Returns sn(u, m), cn(u, m), and dn(u, m).
// See https://en.wikipedia.org/wiki/Jacobi_elliptic_functions.
// Like most of the other math in this section, it's taken mostly
// wholecloth from the noneuclidean VR repo (which itself is taken
// partially wholecloth from other sources) --- the difference here
// is that I understand the math in this function much less.
vec3 computeJacobiEllipticFunctions(float u)
{
float uMod4K = mod(u, 4.0 * global_K);

float xSign = 1.0;

vec3 signVector = vec3(1.0, 1.0, 1.0);

if (uMod4K > 2.0 * global_K)
{
	uMod4K = 4.0 * global_K - uMod4K;
	xSign = -1.0;
}

if (uMod4K < jacobiEllipticTolerance)
{
	// Series expansion about 0 of the Jacobi elliptic functions sn, cn and dn

	float k2 = global_m;
	float k4 = global_m * global_m;
	float k6 = k4 * global_m;

	float u1 = uMod4K;
	float u2 = u1 * uMod4K;
	float u3 = u2 * uMod4K;
	float u4 = u3 * uMod4K;
	float u5 = u4 * uMod4K;
	float u6 = u5 * uMod4K;
	float u7 = u6 * uMod4K;

	return vec3(
		xSign * (
			u1
			- (1.0 + k2) * u3 / 6.0
			+ (1.0 + 14.0 * k2 + k4) * u5 / 120.0
			- (1.0 + 135.0 * k2 + 135.0 * k4 + k6) * u7 / 5040.0
		),

		1.0
		- u2 / 2.0
		+ (1.0 + 4.0 * k2) * u4 / 24.0
		- (1.0 + 44.0 * k2 + 16.0 * k4) * u6 / 720.0,

		1.0
		- k2 * u2 / 2.0
		+ k2 * (4.0 + k2) * u4 / 24.0
		- k2 * (16.0 + 44.0 * k2 + k4) * u6 / 720.0
	);
}

// This implementation comes ultimately (at least probably?)
// from https://www.shadertoy.com/view/4tlBRl.

float emc = 1.0 - global_m;

float a = 1.0;
float b;
float c;

float em[4];
float en[4];

float dn = 1.0;

for (int i = 0; i < 4; i++)
{
	em[i] = a;
	emc = sqrt(emc);
	en[i] = emc;
	c = 0.5 * (a + emc);
	emc *= a;
	a = c;
}

uMod4K *= c;

float sn = sin(uMod4K);
float cn = cos(uMod4K);

if (sn != 0.0)
{
	a = cn / sn;
	c *= a;

	for (int i = 3; i >= 0; i--)
	{
		b = em[i];
		a *= c;
		c *= dn;
		dn = (en[i] + a) / (b + a);
		a = c / b;
	}

	a = 1.0 / sqrt(c * c + 1.0);

	sn = sign(sn) * a;

	cn = c * sn;
}

return vec3(xSign * sn, cn, dn);
}

const float jacobiZetaTolerance = 0.001;
// This is about as far as the project has gotten from my area of understanding.
// It's sourced from the noneuclidean VR repo, like many other functions
// in this shader.
float computeJacobiZetaFunction(float tanPhi)
{
float t0 = abs(tanPhi);

float result = 0.0;

// The series expansion about 0.
if (t0 < jacobiZetaTolerance)
{
	float k2 = global_m;
	float k4 = k2 * global_m;
	float k6 = k4 * global_m;

	result = -(global_E / global_K - 1.0) * t0;
	result -= (1.0 / 6.0) * (global_E * k2 / global_K + k2 - 2.0 * global_E / global_K + 2.0) * pow(t0, 3.0);
	result -= (1.0 / 40.0) * (3.0 * global_E * k4 / global_K + k4 - 8.0 * global_E * k2 / global_K - 8.0 * k2 + 8.0 * global_E / global_K - 8.0) * pow(t0, 5.0);
	result -= (1.0 / 112.0) * (5.0 * global_E * k6 / global_K + k6 - 18.0 * global_E * k4 / global_K - 6.0 * k4 + 24.0 * global_E * k2 / global_K + 24.0 * k2 - 16.0 * global_E / global_K + 16.0) * pow(t0, 7.0);
}

else
{
	float t1;
	float s1;
	float temp;

	for (int i = 0; i < maxAGMSteps; i++)
	{
		if (i == actualAGMSteps)
		{
			break;
		}

		temp = AGMData[i].y / AGMData[i].x;

		t1 = t0 * (1.0 + temp) / (1.0 - temp * t0 * t0);
		s1 = t0 * (1.0 + temp) / sqrt((1.0 + t0 * t0) * (1.0 + temp * temp * t0 * t0));

		result += AGMData[i + 1].z * s1;

		t0 = t1;
	}
}

return sign(tanPhi) * result;
}

// The full flow function, used in most cases.
vec4 getUpdatedPosExactly(vec4 rayDirectionVec, float t)
{
// The convention used in the paper.
float a = rayDirectionVec.x;
float b = rayDirectionVec.y;
float c = rayDirectionVec.z;

float root1Minus2AbsAB = sqrt(1.0 - 2.0 * abs(a * b));

vec3 jef0 = vec3(
	-c / root1Minus2AbsAB,
	(abs(a) - abs(b)) / root1Minus2AbsAB,
	(abs(a) + abs(b)) / global_mu
);

// The elliptic functions are periodic with period 4K.
float muTimesTMod4K = mod(global_mu * t, 4.0 * global_K);

// Now we'll plug this into the elliptic functions. In the paper, we need
// an argument of alpha + mu*t, but first we'll get just mu*t.
vec3 jef1 = computeJacobiEllipticFunctions(muTimesTMod4K);

vec3 jef2 = vec3(
	jef1.x * jef0.y * jef0.z + jef0.x * jef1.y * jef1.z,
	jef1.y * jef0.y - jef1.x * jef1.z * jef0.x * jef0.z,
	jef1.z * jef0.z - global_m * jef1.x * jef1.y * jef0.x * jef0.y
) / (1.0 - global_m * jef1.x * jef1.x * jef0.x * jef0.x);

// Compute the Jacobi zeta function.
float zeta = computeJacobiZetaFunction(jef1.x / jef1.y) - global_m * jef1.x * jef0.x * jef2.x;

// Now *finally* we can compute the formula for gamma
// from the paper.
return vec4(
	sign(a) * sqrt(abs(b / a)) * (
		zeta / global_kPrime
		+ global_k * (jef2.x - jef0.x) / global_kPrime
		+ global_L * global_mu * t
	),
	sign(b) * sqrt(abs(a / b)) * (
		zeta / global_kPrime
		- global_k * (jef2.x - jef0.x) / global_kPrime
		+ global_L * global_mu * t
	),
	0.5 * log(abs(b / a)) + asinh(global_k * jef2.y / global_kPrime),
	1.0
);
}

vec4 getUpdatedDirectionVecExactly(vec4 rayDirectionVec, float t)
{
// The convention used in the paper.
float a = rayDirectionVec.x;
float b = rayDirectionVec.y;
float c = rayDirectionVec.z;

float root1Minus2AbsAB = sqrt(1.0 - 2.0 * abs(a * b));

vec3 jef0 = vec3(
	-c / root1Minus2AbsAB,
	(abs(a) - abs(b)) / root1Minus2AbsAB,
	(abs(a) + abs(b)) / global_mu
);

// The elliptic functions are periodic with period 4K.
float muTimesTMod4K = mod(global_mu * t, 4.0 * global_K);

// Now we'll plug this into the elliptic functions. In the paper, we need
// an argument of alpha + mu*t, but first we'll get just mu*t.
vec3 jef1 = computeJacobiEllipticFunctions(muTimesTMod4K);

vec3 jef2 = vec3(
	jef1.x * jef0.y * jef0.z + jef0.x * jef1.y * jef1.z,
	jef1.y * jef0.y - jef1.x * jef1.z * jef0.x * jef0.z,
	jef1.z * jef0.z - global_m * jef1.x * jef1.y * jef0.x * jef0.y
) / (1.0 - global_m * jef1.x * jef1.x * jef0.x * jef0.x);

float sineThing = sin(global_mu * t + global_alpha);
float sineTerm = sqrt(1.0 - global_k * sineTerm * sineTerm);

return vec4(
	sign(a) * sqrt(abs(b / a)) * (
		global_mu * (-global_kPrime + global_E / (2.0 * global_kPrime * global_K))
		+ global_k * global_mu * jef2.y * jef2.z / (2.0 * global_kPrime)
		+ mu * (sineTerm - global_E / (global_K * sineTerm)) / (2.0 * global_kPrime)
	),
	sign(b) * sqrt(abs(a / b)) * (
		global_mu * (-global_kPrime + global_E / (2.0 * global_kPrime * global_K))
		- global_k * global_mu * jef2.y * jef2.z / (2.0 * global_kPrime)
		+ mu * (sineTerm - global_E / (global_K * sineTerm)) / (2.0 * global_kPrime)
	),
	-global_k * global_mu * jef2.x * jef2.z / (
		2.0 * global_kPrime * sqrt(
			1.0 + (1.0 - 2.0 * abs(a * b)) / (4.0 * abs(a * b)) * jef2.y * jef2.y
		)
	)
	0.0
);
}

const float flowNumericallyThreshhold = 0.002;
const float flowNearPlaneThreshhold = 0.0001;

vec4 getUpdatedPos(vec4 startPos, vec4 rayDirectionVec, float t)
{
vec4 pos = getUpdatedPosExactly(rayDirectionVec, t);

if (t < flowNumericallyThreshhold)
{
	pos = getUpdatedPosNumerically(rayDirectionVec, t);
}

else if (abs(rayDirectionVec.x * t) < flowNearPlaneThreshhold)
{
	pos = getUpdatedPosNearX0(rayDirectionVec, t);
}

else if (abs(rayDirectionVec.y * t) < flowNearPlaneThreshhold)
{
	pos = getUpdatedPosNearY0(rayDirectionVec, t);
}

else
{
	pos = getUpdatedPosExactly(rayDirectionVec, t);
}

return getTransformationMatrix(startPos) * pos;
}

vec4 getUpdatedDirectionVec(vec4 startPos, vec4 rayDirectionVec, float t)
{
vec4 dir;

if (t < flowNumericallyThreshhold)
{
	dir = getUpdatedDirectionVecNumerically(rayDirectionVec, t);
}

else if (abs(rayDirectionVec.x * t) < flowNearPlaneThreshhold)
{
	dir = getUpdatedDirectionVecNearX0(rayDirectionVec, t);
}

else if (abs(rayDirectionVec.y * t) < flowNearPlaneThreshhold)
{
	dir = getUpdatedDirectionVecNearY0(rayDirectionVec, t);
}

else
{
	dir = getUpdatedDirectionVecExactly(rayDirectionVec, t);
}

return getTransformationMatrix(startPos) * dir;
}

vec3 teleportPos(inout vec4 pos, inout vec4 startPos, inout vec4 rayDirectionVec, inout float t, inout float totalT)
{
vec3 color = vec3(0.0, 0.0, 0.0);

vec3 mElement = liftToM(pos);

if (mElement.z < -0.5)
{
	pos = teleportationMatrixB * pos;

	// rayDirectionVec = getInverseTransformationMatrix(pos) * teleportationMatrixB * getUpdatedDirectionVec(startPos, rayDirectionVec, t);
	setGlobals(rayDirectionVec);

	startPos = pos;
	
	totalT += t;
	t = 0.0;

	mElement = liftToM(pos);

	color += vec3(0.0, 0.0, -1.0);
}

else if (mElement.z > 0.5)
{
	pos = teleportationMatrixBinv * pos;

	// rayDirectionVec = getInverseTransformationMatrix(pos) * teleportationMatrixBinv * getUpdatedDirectionVec(startPos, rayDirectionVec, t);
	setGlobals(rayDirectionVec);

	startPos = pos;
	
	totalT += t;
	t = 0.0;

	mElement = liftToM(pos);

	color += vec3(0.0, 0.0, 1.0);
}

if (mElement.x < -0.5)
{
	pos = teleportationMatrixA1 * pos;

	// rayDirectionVec = getInverseTransformationMatrix(pos) * teleportationMatrixA1 * getUpdatedDirectionVec(startPos, rayDirectionVec, t);
	setGlobals(rayDirectionVec);

	startPos = pos;
	
	totalT += t;
	t = 0.0;

	mElement = liftToM(pos);

	color += vec3(-1.0, 0.0, 0.0);
}

else if (mElement.x > 0.5)
{
	pos = teleportationMatrixA1inv * pos;

	// rayDirectionVec = getInverseTransformationMatrix(pos) * teleportationMatrixA1inv * getUpdatedDirectionVec(startPos, rayDirectionVec, t);
	setGlobals(rayDirectionVec);

	startPos = pos;
	
	totalT += t;
	t = 0.0;

	mElement = liftToM(pos);

	color += vec3(1.0, 0.0, 0.0);
}

if (mElement.y < -0.5)
{
	pos = teleportationMatrixA2 * pos;

	// rayDirectionVec = getInverseTransformationMatrix(pos) * teleportationMatrixA2 * getUpdatedDirectionVec(startPos, rayDirectionVec, t);
	setGlobals(rayDirectionVec);

	startPos = pos;
	
	totalT += t;
	t = 0.0;

	color += vec3(0.0, -1.0, 0.0);
}

else if (mElement.y > 0.5)
{
	pos = teleportationMatrixA2inv * pos;

	// rayDirectionVec = getInverseTransformationMatrix(pos) * teleportationMatrixA2inv * getUpdatedDirectionVec(startPos, rayDirectionVec, t);
	setGlobals(rayDirectionVec);

	startPos = pos;
	
	totalT += t;
	t = 0.0;

	color += vec3(0.0, 1.0, 0.0);
}

return color;
}




float getBanding(float amount, float numBands)
{
	return 1.0 - floor(mod(amount * numBands, 2.0)) / 2.0;
}



float distanceEstimator(vec4 pos)
{
	

float distance1 = length(pos.xyz) - .33;
float distance2 = length(pos.xyz - vec3(0.0, 0.0, wallThickness)) - .33;
float distance3 = length(pos.xyz + vec3(0.0, 0.0, wallThickness)) - .33;

float minDistance = min(min(distance1, distance2), distance3);


return -minDistance;

}

vec3 getColor(vec4 pos, vec3 globalColor)
{
	

float distance1 = length(pos.xyz) - .33;
float distance2 = length(pos.xyz - vec3(0.0, 0.0, wallThickness)) - .33;
float distance3 = length(pos.xyz + vec3(0.0, 0.0, wallThickness)) - .33;

float minDistance = min(min(distance1, distance2), distance3);


return vec3(
.25 + .75 * (.5 * (sin((.02 * pos.x + baseColor.x + globalColor.x) * 40.0) + 1.0)),
.25 + .75 * (.5 * (sin((.02 * pos.y + baseColor.y + globalColor.y) * 57.0) + 1.0)),
.25 + .75 * (.5 * (sin((.02 * pos.z + baseColor.z + globalColor.z) * 89.0) + 1.0))
);

}



vec4 getSurfaceNormal(vec4 pos)
{
	float xStep1 = distanceEstimator(pos + vec4(epsilon, 0.0, 0.0, 0.0));
	float yStep1 = distanceEstimator(pos + vec4(0.0, epsilon, 0.0, 0.0));
	float zStep1 = distanceEstimator(pos + vec4(0.0, 0.0, epsilon, 0.0));
	float wStep1 = distanceEstimator(pos + vec4(0.0, 0.0, 0.0, epsilon));
	
	float xStep2 = distanceEstimator(pos - vec4(epsilon, 0.0, 0.0, 0.0));
	float yStep2 = distanceEstimator(pos - vec4(0.0, epsilon, 0.0, 0.0));
	float zStep2 = distanceEstimator(pos - vec4(0.0, 0.0, epsilon, 0.0));
	float wStep2 = distanceEstimator(pos - vec4(0.0, 0.0, 0.0, epsilon));
	
	return normalize(vec4(
		xStep1 - xStep2,
		yStep1 - yStep2,
		zStep1 - zStep2,
		wStep1 - wStep2
	));
}



vec3 computeShading(vec4 pos, int iteration, vec3 globalColor, float totalT)
{
	vec4 surfaceNormal = getSurfaceNormal(pos);
	
	
surfaceNormal.w = 0.0;

vec4 lightDirection1 = normalize(vec4(3.0, -3.0, 3.0, 1.0) - pos);
float dotProduct1 = dot(surfaceNormal, lightDirection1);

vec4 lightDirection2 = normalize(vec4(-4.0, 2.0, -1.0, 1.0) - pos);
float dotProduct2 = dot(surfaceNormal, lightDirection2);

vec4 lightDirection3 = normalize(vec4(3.0, 2.0, 0.5, 1.0) - pos);
float dotProduct3 = .5 * dot(surfaceNormal, lightDirection3);

float lightIntensity = 1.2 * max(max(abs(dotProduct1), abs(dotProduct2)), abs(dotProduct3));

lightIntensity = 1.0;


	//The last factor adds ambient occlusion.
	vec3 color = getColor(pos, globalColor)
		* lightIntensity
		* max(
			1.0 - float(iteration) / 100.0,
			0.0)
		;

	//Apply fog.
	
return color;
//mix(color, fogColor, 1.0 - exp(-totalT * 0.2));

}



vec3 raymarch(vec4 rayDirectionVec)
{
	vec3 finalColor = fogColor;
	
	float t = 0.0;
	float totalT = 0.0;
	
	float lastTIncrease = 0.0;

	vec4 startPos = cameraPos;

	vec3 globalColor = vec3(0.0, 0.0, 0.0);

	
setGlobals(rayDirectionVec);

	
	for (int iteration = 0; iteration < maxMarches; iteration++)
	{
		
vec4 pos = getUpdatedPos(startPos, rayDirectionVec, t);

vec3 mElement = liftToM(pos);
float dotProduct;


dotProduct = dot(mElement, vec3(0.0, 0.0, 1.0));

if (abs(dotProduct) > 0.501)
{
// Binary search our way down until we're back in the fundamental domain.
// It feels like we should change totalT here to reflect the new value, but that seems
// to badly affect fog calculations.
float oldT = t - lastTIncrease;

// The factor by which we multiply lastTIncrease to get the usable increase.
float currentSearchPosition = 0.5;
float currentSearchScale = 0.25;

for (int i = 0; i < 10; i++)
{
	pos = getUpdatedPos(startPos, rayDirectionVec, oldT + lastTIncrease * currentSearchPosition);

	mElement = liftToM(pos);

	dotProduct = dot(mElement, vec3(0.0, 0.0, 1.0));

	if (abs(dotProduct) > 0.501)
	{
		currentSearchPosition -= currentSearchScale;
	}

	else 
	{
		currentSearchPosition += currentSearchScale;
	}

	currentSearchScale *= .5;
}

t = oldT + lastTIncrease * currentSearchPosition;

// totalT -= lastTIncrease * (1.0 - currentSearchPosition);

pos = getUpdatedPos(startPos, rayDirectionVec, oldT + lastTIncrease * currentSearchPosition);

mElement = liftToM(pos);
}



dotProduct = dot(mElement, vec3(1.0, 0.0, 0.0));

if (abs(dotProduct) > 0.501)
{
// Binary search our way down until we're back in the fundamental domain.
// It feels like we should change totalT here to reflect the new value, but that seems
// to badly affect fog calculations.
float oldT = t - lastTIncrease;

// The factor by which we multiply lastTIncrease to get the usable increase.
float currentSearchPosition = 0.5;
float currentSearchScale = 0.25;

for (int i = 0; i < 10; i++)
{
	pos = getUpdatedPos(startPos, rayDirectionVec, oldT + lastTIncrease * currentSearchPosition);

	mElement = liftToM(pos);

	dotProduct = dot(mElement, vec3(1.0, 0.0, 0.0));

	if (abs(dotProduct) > 0.501)
	{
		currentSearchPosition -= currentSearchScale;
	}

	else 
	{
		currentSearchPosition += currentSearchScale;
	}

	currentSearchScale *= .5;
}

t = oldT + lastTIncrease * currentSearchPosition;

// totalT -= lastTIncrease * (1.0 - currentSearchPosition);

pos = getUpdatedPos(startPos, rayDirectionVec, oldT + lastTIncrease * currentSearchPosition);

mElement = liftToM(pos);
}



dotProduct = dot(mElement, vec3(0.0, 1.0, 0.0));

if (abs(dotProduct) > 0.501)
{
// Binary search our way down until we're back in the fundamental domain.
// It feels like we should change totalT here to reflect the new value, but that seems
// to badly affect fog calculations.
float oldT = t - lastTIncrease;

// The factor by which we multiply lastTIncrease to get the usable increase.
float currentSearchPosition = 0.5;
float currentSearchScale = 0.25;

for (int i = 0; i < 10; i++)
{
	pos = getUpdatedPos(startPos, rayDirectionVec, oldT + lastTIncrease * currentSearchPosition);

	mElement = liftToM(pos);

	dotProduct = dot(mElement, vec3(0.0, 1.0, 0.0));

	if (abs(dotProduct) > 0.501)
	{
		currentSearchPosition -= currentSearchScale;
	}

	else 
	{
		currentSearchPosition += currentSearchScale;
	}

	currentSearchScale *= .5;
}

t = oldT + lastTIncrease * currentSearchPosition;

// totalT -= lastTIncrease * (1.0 - currentSearchPosition);

pos = getUpdatedPos(startPos, rayDirectionVec, oldT + lastTIncrease * currentSearchPosition);

mElement = liftToM(pos);
}


globalColor += teleportPos(pos, startPos, rayDirectionVec, t, totalT);

		
		float distance = distanceEstimator(pos);
		
		if (distance < epsilon)
		{
			
			
			finalColor = computeShading(pos, iteration, globalColor, totalT);
			break;
		}

		
lastTIncrease = distance * stepFactor;

t += lastTIncrease;


		if (t > maxT || totalT > maxT)
		{
			return fogColor;
		}
	}
	
	return finalColor;
}



void main(void)
{
	gl_FragColor = vec4(
		raymarch(
			geometryNormalize(
				forwardVec
				+ rightVec * uv.x * aspectRatioX * fov
				+ upVec * uv.y / aspectRatioY * fov
			)
		),
		1.0
	);
}

`