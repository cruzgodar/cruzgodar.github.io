export function dropdown(options, id)
{
	return /* html */`
		<div class="text-buttons dropdown-holder">
			<div class="dropdown-container focus-on-child" tabindex="1">
				<button class="text-button dropdown" type="button" id="${id}-dropdown-button" tabindex="-1"></button>
				<select id="${id}-dropdown"></select>
			</div>
		</div>
	`;
}