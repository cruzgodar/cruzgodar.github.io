import { splitCommandLine } from "../build.js";

const components = {
	"button": button,
	"checkbox": checkbox,
	"dropdown": dropdown,
	"file-upload": fileUpload,
	"nav-buttons": navButtons,
	"slider": slider,
	"textarea": textarea,
	"text-box": textBox,
};


export function controls(_options, lines)
{
	let html = "<div class=\"applet-controls\">";

	for (const line of lines)
	{
		const [words] = splitCommandLine(line);

		html = `${html}${components[words[0]](...words.slice(1))}`;
	}

	html = /* html */`${html}</div>`;

	return html;
}

export function slider(id)
{
	return /* html */`
		<div class="slider-container">
			<div class="slider-bar"></div>
			<div id="${id}-slider" class="slider-thumb"></div>
			<p class="body-text slider-subtext"></p>
		</div>
	`;
}

export function textarea(id)
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

export function button(id)
{
	return /* html */`
		<div class="focus-on-child" tabindex="1">
			<button class="text-button" type="button" id="${id}-button" tabindex="-1"></button>
		</div>
	`;
}

export function navButtons()
{
	return /* html */`
		<div class="applet-controls nav-buttons">
			<div class="focus-on-child" tabindex="1">
				<button class="text-button linked-text-button nav-button previous-nav-button" type="button" tabindex="-1">Previous</button>
			</div>
			
			<div class="focus-on-child" tabindex="1">
				<button class="text-button linked-text-button nav-button home-nav-button" type="button" tabindex="-1">Home</button>
			</div>
			
			<div class="focus-on-child" tabindex="1">
				<button class="text-button linked-text-button nav-button next-nav-button" type="button" tabindex="-1">Next</button>
			</div>
		</div>
	`;
}

export function dropdown(id)
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


export function fileUpload(id, accept, multiple = "")
{
	return /* html */`
		<div class="text-buttons">
			<div class="focus-on-child dropdown-container" tabindex="1">
				<button class="text-button file-upload" type="button" id="${id}-upload-button" tabindex="-1"></button>
				<input type="file" id="${id}-upload" style="display: none" accept="${accept}" ${multiple}>
			</div>
		</div>
	`;
}

export function checkbox(id)
{
	return /* html */`
		<div class="checkbox-row">
			<div class="checkbox-container" tabindex="1">
				<input type="checkbox" id="${id}-checkbox">
				<div class="checkbox"></div>
			</div>
			
			<label for="${id}-checkbox" style="margin-left: 10px">
				<p class="body-text checkbox-subtext"></p>
			</label>
		</div>
	`;
}

export function textBox(id)
{
	return /* html */`
		<div class="text-box-container">
			<input id="${id}-input" class="text-box" type="text" value="" tabindex="1">
			<p class="body-text text-box-subtext"></p>
		</div>
	`;
}