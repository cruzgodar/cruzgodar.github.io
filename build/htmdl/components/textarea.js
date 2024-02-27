export function textarea(options, id)
{
	return /* html */`
		<div class="text-field-container">
			<textarea cols="16" rows="4" name="${id}-textarea" id="${id}-textarea" class="text-field" style="font-family: 'Source Code Pro', monospace"></textarea>
			<p class="body-text" style="text-align: center"></p>
		</div>
	`;
}