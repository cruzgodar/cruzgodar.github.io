import { document } from "../../build/spruceStdlib.js";
import { sitemap } from "./sitemap.js";

export function bannerDocument(body)
{
	return /* html */`<div id="banner">
	<div id="banner-small"></div>
	<div id="banner-large"></div>
</div>

<div id="content-container">
	<div id="content">
		${document(body)}
	</div>
</div>`;
}


export const gap = "<div style=\"height: 32px\"></div>";



export function carousel(...blocks)
{
	return /* html */`
		<div class="carousel">
			<div class="carousel-content">
				${blocks.map(block => `<div class="carousel-entry">${block}</div>`).join("")}
			</div>

			<div class="carousel-dots">
				${"<div class=\"carousel-dot\"><div class=\"fill\"></div></div>".repeat(blocks.length)}
			</div>
		</div>
	`;
}

export function clickTap(clickText, tapText)
{
	return /* html */`<span class="click-tap"><span>${clickText}</span><span>${tapText}</span></span>`;
}

// The arguments alternate id, size, id, size...
export function galleryBlock(...data)
{
	if (data.length % 2 !== 0)
	{
		throw new Error("Invalid number of arguments");
	}

	let html = "<div class=\"gallery-block\">";

	for (let i = 0; i < data.length; i += 2)
	{
		const id = data[i];
		const size = data[i + 1];

		html = /* html */`${html}
		<div class="gallery-image-${size}-${size}">
			<img src="/graphics/general-icons/placeholder.png" data-src="/gallery/thumbnails/${id}.webp" data-image-id="${id}" />
		</div>`;
	}

	return /* html */`${html}</div>`;
}


// data is an array of objects of the form
// {
//   url,
//   name,
//   forCard: boolean,
//   inNewTab: boolean
//   // optional override for the default path.
//   coverPath: string
// },
// or alternately strings, in which case they're just treated as urls.
export function imageLinks(data)
{
	const html = data.map(item =>
	{
		if (typeof item === "string")
		{
			item = { url: item };
		}

		const url = resolveUrl(item.url);

		const idPieces = url.split(".")[0].split("/");
		const id = idPieces[idPieces.length - 1];

		if (
			item.name === undefined
			&& sitemap[url] === undefined
			&& item.coverPath === undefined
		) {
			throw new Error(`${url} is not in sitemap!`);
		}

		const name = item.name ?? sitemap[url].title;

		if (item.forCard)
		{
			const slicedUrl = url.slice(0, url.lastIndexOf("/"));
			const src = `${slicedUrl}/cards/${id}/cover.webp`;

			return /* html */`
				<a href="${slicedUrl}/?card=${id}" data-card-id="${id}" class="image-link">
					<img src="/graphics/general-icons/placeholder.png" data-src="${item.coverPath ?? src}" alt="${name}" tabindex="1" />
					
					<p class="image-link-subtext">${name}</p>
				</a>
			`;
		}

		// pdf files, etc.
		const imgSrc = url.includes(".")
			? `${url.slice(0, url.lastIndexOf("/"))}/cover.webp`
			: `${url}/cover.webp`;

		return /* html */`
		<a href="${url}"${item.inNewTab ? " data-in-new-tab=\"1\"" : ""} class="image-link">
			<img src="/graphics/general-icons/placeholder.png" data-src="${item.coverPath ?? imgSrc}" alt="${name}" tabindex="1" />
			
			<p class="image-link-subtext">${name}</p>
		</a>`;
	}).join("");

	return /* html */`<div style="display: flex; justify-content: center; width: 100%;">
	<div class="image-links">${html}</div>
</div>`;
}



export function card(id, name, body)
{
	if (name)
	{
		return /* html */`<div id="${id}-card" class="card"><h1 class="heading-text">${name}</h1>${body}</div>`;
	}

	return /* html */`<div id="${id}-card" class="card">${body}</div>`;
}

export function externalCard(id)
{
	return /* html */`<div id="${id}-card" class="card external-card"></div>`;
}



export function debug(body)
{
	return /* html */`<div class="DEBUG">${body}</div>`;
}



export function center(body)
{
	return /* html */`<p class="body-text center-if-needed"><span>${body}</span></p>`;
}



function resolveUrl(url)
{
	if (url.startsWith("http"))
	{
		return url;
	}

	const repoPath = globalThis.filePath.replace(/^.+?cruzgodar\.github\.io/, "");
	const pageUrl = repoPath.slice(0, repoPath.lastIndexOf("/"));

	return url[0] === "/" ? url : pageUrl + "/" + url;
}



const controlsFunctions = {
	slider,
	textarea,
	button,
	navButtons,
	dropdown,
	fileUpload,
	checkbox,
	textBox
};

// data is an object whose keys are IDs and whose values are types.
export function controls(data)
{
	let html = "<div class=\"applet-controls\">";

	for (const [id, type] of Object.entries(data))
	{
		const controlFunction = controlsFunctions[type];

		if (!controlFunction)
		{
			throw new Error(`${type} is not a valid control type`);
		}

		html = `${html}${controlsFunctions[type](id)}`;
	}

	return `${html}</div>`;
}

function slider(id)
{
	return /* html */`
		<div class="slider-container">
			<div class="slider-bar"></div>
			<div id="${id}Slider" class="slider-thumb"></div>
			<p class="body-text slider-subtext"></p>
		</div>
	`;
}

function textarea(id)
{
	return /* html */`
		<div class="text-field-container">
			<div class="textarea-wrapper">
				<textarea cols="16" rows="4" name="${id}Textarea" id="${id}-textarea" class="text-field" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"></textarea>
				<div class="textarea-overlay"></div>
			</div>
			<p class="body-text" style="text-align: center"></p>
		</div>
	`;
}

function button(id)
{
	return /* html */`
		<div class="focus-on-child" tabindex="1">
			<button class="text-button" type="button" id="${id}Button" tabindex="-1"></button>
		</div>
	`;
}

function navButtons()
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

function dropdown(id)
{
	return /* html */`
		<div class="dropdown-holder">
			<div class="dropdown-container focus-on-child" tabindex="1">
				<button class="text-button dropdown" type="button" id="${id}-dropdown-button" tabindex="-1"></button>
				<select id="${id}Dropdown"></select>
			</div>
		</div>
	`;
}


function fileUpload(id, accept, multiple = "")
{
	return /* html */`
		<div class="text-buttons">
			<div class="focus-on-child dropdown-container" tabindex="1">
				<button class="text-button file-upload" type="button" id="${id}-upload-button" tabindex="-1"></button>
				<input type="file" id="${id}Upload" style="display: none" accept="${accept}" ${multiple}>
			</div>
		</div>
	`;
}

function checkbox(id)
{
	return /* html */`
		<div class="checkbox-row">
			<div class="checkbox-container" tabindex="1">
				<input type="checkbox" id="${id}Checkbox">
				<div class="checkbox"></div>
			</div>
			
			<label for="${id}-checkbox" style="margin-left: 10px">
				<p class="body-text checkbox-subtext"></p>
			</label>
		</div>
	`;
}

function textBox(id)
{
	return /* html */`
		<div class="text-box-container">
			<input id="${id}Input" class="text-box" type="text" value="" tabindex="1">
			<p class="body-text text-box-subtext"></p>
		</div>
	`;
}



let count = 1;

export function problem(body)
{
	const output = `<p class="body-text homework-problem">${count}. ${body}</p>`;

	count++;

	return output;
}

export function problemNumber(offset)
{
	return count + offset;
}

export function problemNumberRange(startOffset, stopOffset)
{
	return `${count + startOffset}&ndash;${count + stopOffset}`;
}

export function problemNumberNextRange(length)
{
	return problemNumberRange(0, length - 1);
}