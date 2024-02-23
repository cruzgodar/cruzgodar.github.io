import { showPage } from "../../../scripts/src/loadPage.js";
import { VoronoiDiagram } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { $ } from "/scripts/src/main.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	const applet = new VoronoiDiagram({ canvas: $("#output-canvas") });

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 1000,
		maxValue: 4000,
		onEnter: run,
	});

	const numPointsInput = new TextBox({
		element: $("#num-points-input"),
		name: "Points",
		value: 20,
		maxValue: 100,
		onEnter: run,
	});

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-voronoi-diagram.png"
	});

	const metricSlider = new Slider({
		element: $("#metric-slider"),
		name: "Metric",
		value: 2,
		min: 1,
		max: 16,
		logarithmic: true,
		onInput: onSliderInput
	});

	const maximumSpeedCheckbox = new Checkbox({
		element: $("#maximum-speed-checkbox"),
		name: "Maximum speed"
	});

	showPage();

	function run()
	{
		applet.run({
			resolution: resolutionInput.value,
			numPoints: numPointsInput.value,
			metric: metricSlider.value,
			maximumSpeed: maximumSpeedCheckbox.checked
		});
	}

	function onSliderInput()
	{
		applet.metric = metricSlider.value;

		applet.updateMetric();
	}
}

`

precision highp float;
			
varying vec2 uv;

uniform float radius;
uniform float pointOpacity;
uniform float metric;

const float pointRadius = 0.01;
const float blurRatio = 0.5;
const float boundaryWidth = 0.01;


const vec2 point0 = vec2(-0.5397848574926637, -0.5267077712455688);

const vec2 point1 = vec2(-0.7888234895523881, 1);

const vec2 point2 = vec2(-0.5811268631283598, -0.25428311628249695);

const vec2 point3 = vec2(-0.36338147076119676, -0.8610139136407835);

const vec2 point4 = vec2(-0.7729136992624043, -0.03156481646265649);

const vec2 point5 = vec2(-1, -0.13446843794631558);

const vec2 point6 = vec2(0.7871346138318335, 0.0594193376425262);

const vec2 point7 = vec2(0.10218842248279034, -0.1513529833224237);

const vec2 point8 = vec2(-0.9870927998516892, 0.6283490719203216);

const vec2 point9 = vec2(0.5020334637671808, 0.9994610619286388);

const vec2 point10 = vec2(0.800114655438782, -0.3239681188166186);

const vec2 point11 = vec2(-0.9989077355004057, 0.315186348188933);

const vec2 point12 = vec2(-0.23145495916160336, 0.40439451568824303);

const vec2 point13 = vec2(-0.765173607375792, -0.6982442033716612);

const vec2 point14 = vec2(0.3572801556187665, -0.654259048314727);

const vec2 point15 = vec2(-0.05798127649070081, 0.08311325986553922);

const vec2 point16 = vec2(0.3442432643726253, 0.4368861263878948);

const vec2 point17 = vec2(0.5182800570631699, -0.31270466037510986);

const vec2 point18 = vec2(0.13556455856361768, 0.9667546539734952);

const vec2 point19 = vec2(1, -0.2717048040724164);



const vec3 color0 = vec3(0.9781321285513297, 0.7819604457258904, 0.472253846397267);

const vec3 color1 = vec3(0.3262201851444211, 0.36250717144851496, 0.7752549934134956);

const vec3 color2 = vec3(0.740345514804499, 0.3644508870547569, 0.6356437108336281);

const vec3 color3 = vec3(0.5279993761198245, 0.2123200520305309, 0.22105671146523254);

const vec3 color4 = vec3(0.2465391695743439, 0.6127162058647303, 0.5753717544793869);

const vec3 color5 = vec3(0.719342718853772, 0.3123783703640396, 0.9326826748816651);

const vec3 color6 = vec3(0.5748768143870299, 0.3490326571132324, 0.8556906184845184);

const vec3 color7 = vec3(0.19948071172000814, 0.5252772002895656, 0.49074756590214885);

const vec3 color8 = vec3(0.48397651108772355, 0.20809020676508833, 0.6627921558300647);

const vec3 color9 = vec3(0.47222712882525575, 0.9473793239102065, 0.696972050676419);

const vec3 color10 = vec3(0.9150147095061024, 0.7176085525092285, 0.31054637751170266);

const vec3 color11 = vec3(0.34701654123833336, 0.9546671058334703, 0.4578393245668117);

const vec3 color12 = vec3(0.20084634437916993, 0.6700416766330435, 0.4292565519429091);

const vec3 color13 = vec3(0.35252490547919557, 0.9197611965901672, 0.2827136180996598);

const vec3 color14 = vec3(0.9574333637369404, 0.38486609684640605, 0.9343492303303813);

const vec3 color15 = vec3(0.7757807527350247, 0.3451720010406018, 0.4607107761978859);

const vec3 color16 = vec3(0.33239717911681743, 0.45003417167692655, 0.6681764608256467);

const vec3 color17 = vec3(0.8173803763936044, 0.3153020203972744, 0.41523866757564576);

const vec3 color18 = vec3(0.5846902129171955, 0.5650210641431787, 0.14779787371649084);

const vec3 color19 = vec3(0.525691483302402, 0.733386161313615, 0.32295484771904354);


float metricDistance(vec2 p, vec2 q)
{
	return pow(
		pow(abs(p.x - q.x), metric)
		+ pow(abs(p.y - q.y), metric),
		1.0 / metric
	);
}

void getMinDistanceToPoints(vec2 p, out float minDistance, out float secondMinDistance, out vec3 color)
{

float distance1 = metricDistance(p, point0);

float distance2 = metricDistance(p, point1);

float distance3 = metricDistance(p, point2);

float distance4 = metricDistance(p, point3);

float distance5 = metricDistance(p, point4);

float distance6 = metricDistance(p, point5);

float distance7 = metricDistance(p, point6);

float distance8 = metricDistance(p, point7);

float distance9 = metricDistance(p, point8);

float distance10 = metricDistance(p, point9);

float distance11 = metricDistance(p, point10);

float distance12 = metricDistance(p, point11);

float distance13 = metricDistance(p, point12);

float distance14 = metricDistance(p, point13);

float distance15 = metricDistance(p, point14);

float distance16 = metricDistance(p, point15);

float distance17 = metricDistance(p, point16);

float distance18 = metricDistance(p, point17);

float distance19 = metricDistance(p, point18);

float distance20 = metricDistance(p, point19);


	minDistance = min(min(min(min(min(distance1, distance2), min(distance3, distance4)), min(min(distance5, distance6), min(distance7, distance8))), min(min(min(distance9, distance10), min(distance11, distance12)), min(min(distance13, distance14), min(distance15, distance16)))), min(min(distance17, distance18), min(distance19, distance20)));


if (minDistance == distance1)
{
	color = color0;
}

else if (minDistance == distance2)
{
	color = color1;
}

else if (minDistance == distance3)
{
	color = color2;
}

else if (minDistance == distance4)
{
	color = color3;
}

else if (minDistance == distance5)
{
	color = color4;
}

else if (minDistance == distance6)
{
	color = color5;
}

else if (minDistance == distance7)
{
	color = color6;
}

else if (minDistance == distance8)
{
	color = color7;
}

else if (minDistance == distance9)
{
	color = color8;
}

else if (minDistance == distance10)
{
	color = color9;
}

else if (minDistance == distance11)
{
	color = color10;
}

else if (minDistance == distance12)
{
	color = color11;
}

else if (minDistance == distance13)
{
	color = color12;
}

else if (minDistance == distance14)
{
	color = color13;
}

else if (minDistance == distance15)
{
	color = color14;
}

else if (minDistance == distance16)
{
	color = color15;
}

else if (minDistance == distance17)
{
	color = color16;
}

else if (minDistance == distance18)
{
	color = color17;
}

else if (minDistance == distance19)
{
	color = color18;
}

else if (minDistance == distance20)
{
	color = color19;
}


secondMinDistance = 10.0;


if (distance1 < secondMinDistance && distance1 != minDistance)
{
	secondMinDistance = distance1;
}

if (distance2 < secondMinDistance && distance2 != minDistance)
{
	secondMinDistance = distance2;
}

if (distance3 < secondMinDistance && distance3 != minDistance)
{
	secondMinDistance = distance3;
}

if (distance4 < secondMinDistance && distance4 != minDistance)
{
	secondMinDistance = distance4;
}

if (distance5 < secondMinDistance && distance5 != minDistance)
{
	secondMinDistance = distance5;
}

if (distance6 < secondMinDistance && distance6 != minDistance)
{
	secondMinDistance = distance6;
}

if (distance7 < secondMinDistance && distance7 != minDistance)
{
	secondMinDistance = distance7;
}

if (distance8 < secondMinDistance && distance8 != minDistance)
{
	secondMinDistance = distance8;
}

if (distance9 < secondMinDistance && distance9 != minDistance)
{
	secondMinDistance = distance9;
}

if (distance10 < secondMinDistance && distance10 != minDistance)
{
	secondMinDistance = distance10;
}

if (distance11 < secondMinDistance && distance11 != minDistance)
{
	secondMinDistance = distance11;
}

if (distance12 < secondMinDistance && distance12 != minDistance)
{
	secondMinDistance = distance12;
}

if (distance13 < secondMinDistance && distance13 != minDistance)
{
	secondMinDistance = distance13;
}

if (distance14 < secondMinDistance && distance14 != minDistance)
{
	secondMinDistance = distance14;
}

if (distance15 < secondMinDistance && distance15 != minDistance)
{
	secondMinDistance = distance15;
}

if (distance16 < secondMinDistance && distance16 != minDistance)
{
	secondMinDistance = distance16;
}

if (distance17 < secondMinDistance && distance17 != minDistance)
{
	secondMinDistance = distance17;
}

if (distance18 < secondMinDistance && distance18 != minDistance)
{
	secondMinDistance = distance18;
}

if (distance19 < secondMinDistance && distance19 != minDistance)
{
	secondMinDistance = distance19;
}

if (distance20 < secondMinDistance && distance20 != minDistance)
{
	secondMinDistance = distance20;
}

}

void main(void)
{
	vec3 color;
	float minDistance;
	float secondMinDistance;
	getMinDistanceToPoints(uv, minDistance, secondMinDistance, color);

	
	if (minDistance < pointRadius)
	{
		gl_FragColor = mix(
			vec4(color, 1),
			vec4(1, 1, 1, 1),
			pointOpacity
		);
		return;
	}

	if (minDistance < (1.0 + blurRatio) * pointRadius)
	{
		float t = 1.0 - (minDistance - pointRadius) / (blurRatio * pointRadius);

		gl_FragColor = mix(
			vec4(color, 1),
			vec4(t, t, t, 1),
			pointOpacity
		);
		return;
	}

	if (minDistance < radius)
	{
		float boundaryDistance = secondMinDistance - minDistance;

		if (boundaryDistance < boundaryWidth)
		{
			// Despite all our best efforts, we can still sometimes get here mistakenly.
			// We sample 8 nearby points to make sure this is actually a boundary.
			vec3 newColor;


getMinDistanceToPoints(uv + vec2(boundaryWidth, 0), minDistance, secondMinDistance, newColor);

if (color != newColor)
{
	float t = .5 + .5 * boundaryDistance / boundaryWidth;
	gl_FragColor = vec4(color * t, 1);
	return;
}
,
getMinDistanceToPoints(uv + vec2(-boundaryWidth, 0), minDistance, secondMinDistance, newColor);

if (color != newColor)
{
	float t = .5 + .5 * boundaryDistance / boundaryWidth;
	gl_FragColor = vec4(color * t, 1);
	return;
}
,
getMinDistanceToPoints(uv + vec2(0, boundaryWidth), minDistance, secondMinDistance, newColor);

if (color != newColor)
{
	float t = .5 + .5 * boundaryDistance / boundaryWidth;
	gl_FragColor = vec4(color * t, 1);
	return;
}
,
getMinDistanceToPoints(uv + vec2(0, -boundaryWidth), minDistance, secondMinDistance, newColor);

if (color != newColor)
{
	float t = .5 + .5 * boundaryDistance / boundaryWidth;
	gl_FragColor = vec4(color * t, 1);
	return;
}
,
getMinDistanceToPoints(uv + vec2(boundaryWidth, boundaryWidth), minDistance, secondMinDistance, newColor);

if (color != newColor)
{
	float t = .5 + .5 * boundaryDistance / boundaryWidth;
	gl_FragColor = vec4(color * t, 1);
	return;
}
,
getMinDistanceToPoints(uv + vec2(boundaryWidth, -boundaryWidth), minDistance, secondMinDistance, newColor);

if (color != newColor)
{
	float t = .5 + .5 * boundaryDistance / boundaryWidth;
	gl_FragColor = vec4(color * t, 1);
	return;
}
,
getMinDistanceToPoints(uv + vec2(-boundaryWidth, boundaryWidth), minDistance, secondMinDistance, newColor);

if (color != newColor)
{
	float t = .5 + .5 * boundaryDistance / boundaryWidth;
	gl_FragColor = vec4(color * t, 1);
	return;
}
,
getMinDistanceToPoints(uv + vec2(-boundaryWidth, -boundaryWidth), minDistance, secondMinDistance, newColor);

if (color != newColor)
{
	float t = .5 + .5 * boundaryDistance / boundaryWidth;
	gl_FragColor = vec4(color * t, 1);
	return;
}

		}
		
		gl_FragColor = vec4(color, 1);
		return;
	}

	if (minDistance < radius + 0.01)
	{
		gl_FragColor = vec4(color * 0.5, 1);
		return;
	}


	gl_FragColor = vec4(0, 0, 0, 1);
}

`