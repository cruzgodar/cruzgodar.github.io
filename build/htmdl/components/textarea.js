export function textarea(options, id)
{
	return /* html */`
		<div class="text-field-container">
			<div class="textarea-wrapper">
				<textarea cols="16" rows="4" name="${id}-textarea" id="${id}-textarea" class="text-field" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"></textarea>
				<div class="textarea-overlay"></div>
			</div>
			<p class="body-text" style="text-align: center"></p>
		</div>
	`;
}