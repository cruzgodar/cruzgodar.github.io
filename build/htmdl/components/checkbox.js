export function checkbox(options, id, name)
{
	return `
		<div class="checkbox-row">
			<div class="checkbox-container click-on-child" tabindex="1">
				<input type="checkbox" id="${id}-checkbox">
				<div class="checkbox"></div>
			</div>
			
			<div style="margin-left: 10px">
				<p class="body-text checkbox-subtext">${name}</p>
			</div>
		</div>
	`;
}