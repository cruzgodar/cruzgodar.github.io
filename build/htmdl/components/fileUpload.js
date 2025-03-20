
export function fileUpload(options, id, accept, multiple = "")
{
	console.log(id, accept, multiple);
	return /* html */`
		<div class="text-buttons">
			<div class="focus-on-child dropdown-container" tabindex="1">
				<button class="text-button file-upload" type="button" id="${id}-upload-button" tabindex="-1"></button>
				<input type="file" id="${id}-upload" style="display: none" accept="${accept}" ${multiple}>
			</div>
		</div>
	`;
}