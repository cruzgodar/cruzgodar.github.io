export function canvas(options, id)
{
	if (id)
	{
		return /* html */`<div class="desmos-border canvas-container"><canvas id="${id}-canvas" class="output-canvas"></canvas></div>`;
	}

	else
	{
		return "<canvas id='output-canvas' class='output-canvas'></canvas>";
	}
}