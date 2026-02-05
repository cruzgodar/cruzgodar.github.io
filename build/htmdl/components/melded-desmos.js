export function meldedDesmos(options, id)
{
	return /* html */`<div class="desmos-border no-stretch" style="position: relative">
	<canvas id="${id}-canvas" style="width: 100%; height: 100%; border-radius: 16px"></canvas>

	<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%">
		<div id="${id}" class="desmos-container melded"></div>
	</div>
</div>`;
}