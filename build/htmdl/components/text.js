import { currentNumberedItem } from "../build.js";
import { parseLatex } from "./latex.js";

export function parseText(text)
{
	//None of the delimiters * and ` can be parsed if they're inside
	//math mode, so we'll modify those things and put them back afterward.
	//The syntax [^\$] means any character other than a dollar sign.

	//First, we replace ending dollar signs with [END$] to differentiate them
	//for later. Otherwise, delimiters between dollar signs would be matched too.
	//We also replace escaped characters.
	let html = text
		.replaceAll(/\\\$/g, "[DOLLARSIGN]")
		.replaceAll(/\\`/g, "[BACKTICK]")
		.replaceAll(/\\\*/g, "[ASTERISK]")
		.replaceAll(/\\"/g, "[DOUBLEQUOTE]")
		.replaceAll(/\\'/g, "[SINGLEQUOTE]")
		.replaceAll(/\\,/g, "[COMMA]")
		.replaceAll(/\\:/g, "[COLON]")
		.replaceAll(/\$\$(.*?)\$\$/g, (match, $1) => `$\\displaystyle ${$1}$`)
		.replaceAll(/\$(.*?)\$/g, (match, $1) => `$${parseLatex($1)}[END$]`)
		.replaceAll(/([0-9]+)#/g, (match, $1) => `${currentNumberedItem}--${currentNumberedItem + parseInt($1) - 1}`);



	//Escape every asterisk, backtick, and quote inside dollar signs.
	while (html.match(/\$([^$]*?)\*([^$]*?)\[END\$\]/))
	{
		html = html.replaceAll(/\$([^$]*?)\*([^$]*?)\[END\$\]/g, (match, $1, $2) => `$${$1}[ASTERISK]${$2}[END$]`);
	}

	while (html.match(/\$([^$]*?)`([^$]*?)\[END\$\]/))
	{
		html = html.replaceAll(/\$([^$]*?)`([^$]*?)\[END\$\]/g, (match, $1, $2) => `$${$1}[BACKTICK]${$2}[END$]`);
	}

	while (html.match(/\$([^$]*?)"([^$]*?)\[END\$\]/))
	{
		html = html.replaceAll(/\$([^$]*?)"([^$]*?)\[END\$\]/g, (match, $1, $2) => `$${$1}[DOUBLEQUOTE]${$2}[END$]`);
	}

	while (html.match(/\$([^$]*?)'([^$]*?)\[END\$\]/))
	{
		html = html.replaceAll(/\$([^$]*?)'([^$]*?)\[END\$\]/g, (match, $1, $2) => `$${$1}[SINGLEQUOTE]${$2}[END$]`);
	}

	while (html.match(/\$([^$]*?)\[END\$\]([^<])/))
	{
		html = html.replaceAll(/\$([^$]*?)\[END\$\]([^<])/g, (match, $1, $2) => `<span class="tex-holder">$${$1}[END$]</span>${$2}`);
	}

	while (html.match(/\$([^$]*?)\[END\$\]$/))
	{
		html = html.replaceAll(/\$([^$]*?)\[END\$\]$/g, (match, $1) => `<span class="tex-holder">$${$1}[END$]</span>`);
	}



	//Now we can handle the backticks. Since all of the ones still present
	//aren't inside math mode, we know they must be code.
	//That means we need to play the same game we just did.
	//First we can put back the dollar signs though.

	html = html.replaceAll(/\[END\$\]/g, "$").replaceAll(/`(.*?)`/g, (match, $1) => `\`${$1}[END\`]`);

	//Escape every asterisk and quote inside backticks.
	while (html.match(/`([^`]*?)\*([^`]*?)\[END`\]/))
	{
		html = html.replaceAll(/`([^`]*?)\*([^`]*?)\[END`\]/g, (match, $1, $2) => `\`${$1}[ASTERISK]${$2}[END\`]`);
	}

	while (html.match(/`([^`]*?)"([^`]*?)\[END`\]/))
	{
		html = html.replaceAll(/`([^`]*?)"([^`]*?)\[END`\]/g, (match, $1, $2) => `\`${$1}[DOUBLEQUOTE]${$2}[END\`]`);
	}

	while (html.match(/`([^`]*?)'([^`]*?)\[END`\]/))
	{
		html = html.replaceAll(/`([^`]*?)'([^`]*?)\[END`\]/g, (match, $1, $2) => `\`${$1}[SINGLEQUOTE]${$2}[END\`]`);
	}



	//Escape every quote inside a tag.
	while (html.match(/<([^<>]*?)"([^<>]*?)>/))
	{
		html = html.replaceAll(/<([^<>]*?)"([^<>]*?)>/g, (match, $1, $2) => `<${$1}[DOUBLEQUOTE]${$2}>`);
	}

	while (html.match(/<([^<>]*?)'([^<>]*?)>/))
	{
		html = html.replaceAll(/<([^<>]*?)'([^<>]*?)>/g, (match, $1, $2) => `<${$1}[SINGLEQUOTE]${$2}>`);
	}



	//Add leading tabs and bullet points.
	let numTabs = 0;

	while (html[numTabs] === ">")
	{
		numTabs++;
	}

	if (numTabs !== 0)
	{
		let sliceStart = numTabs;

		while (html[sliceStart] === " ")
		{
			sliceStart++;
		}

		html = html.slice(sliceStart);

		if (html[0] === "." && html[1] === " ")
		{
			html = `<strong>&#8226;</strong> ${html.slice(2)}`;
		}

		html = `<span style=[DOUBLEQUOTE]width: ${32 * numTabs}px[DOUBLEQUOTE]></span>${html}`;
	}



	//Now we're finally ready to add the code tags, and then the remaining
	//em and strong tags, and then modify the quotes. Then at long last,
	//we can unescape the remaining characters.
	return html
		.replaceAll(/`(.*?)\[END`\]/g, (match, $1) => `<code>${$1}</code>`)
		.replaceAll(/\*\*(.*?)\*\*/g, (match, $1) => `<strong>${$1}</strong>`)
		.replaceAll(/\*(.*?)\*/g, (match, $1) => `<em>${$1}</em>`)
		.replaceAll(/(\s)"(\S)/g, (match, $1, $2) => `${$1}&#x201C;${$2}`)
		.replaceAll(/^"(\S)/g, (match, $1) => `&#x201C;${$1}`)
		.replaceAll(/"/g, "&#x201D;")
		.replaceAll(/(\s)'(\S)/g, (match, $1, $2) => `${$1}&#x2018;${$2}`)
		.replaceAll(/^'(\S)/g, (match, $1) => `&#x2018;${$1}`)
		.replaceAll(/'/g, "&#x2019;")
		.replaceAll(/- - -/g, "<span style='height: 32px'></span>")
		.replaceAll(/---/g, "&mdash;")
		.replaceAll(/--/g, "&ndash;")
		.replaceAll(/\[DOUBLEQUOTE\]/g, "\"")
		.replaceAll(/\[SINGLEQUOTE\]/g, "'")
		.replaceAll(/\[COMMA\]/g, ",")
		.replaceAll(/\[COLON\]/g, ":")
		.replaceAll(/\[ASTERISK\]/g, "*")
		.replaceAll(/\[BACKTICK\]/g, "`")
		.replaceAll(/\[DOLLARSIGN\]/g, "\\$")
		.replaceAll(/<span class="tex-holder">\$(.*?)\$<\/span>/g, (match, $1) => `<span class="tex-holder inline-math" data-source-tex="${$1.replaceAll(/\\displaystyle\s*/g, "")}">$${$1}$</span>`);
}