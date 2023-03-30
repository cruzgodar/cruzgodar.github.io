"use strict";



Page.Components =
{
	get_image_link: function(args)
	{
		let id = args[0].split(".")[0].split("/");
		
		id = id[id.length - 1];
		
		
		
		//A card.
		if (args[1] === "c")
		{
			const subtext = args.slice(2).join(" ");
			
			const src = `${Page.parent_folder}cards/${id}.`;
			
			return `
				<div class="image-link">
					<a onclick="Page.Cards.show('${id}')" tabindex="-1">
						<img class="check-webp" src="/graphics/general-icons/placeholder.png" data-image-id="${id}" data-src="${src}" alt="${subtext}" tabindex="1"></img>
					</a>
					
					<p class="image-link-subtext">${subtext}</p>
				</div>
			`;
		}
		
		else
		{
			let in_new_tab = false;
				
			if (args[1] === "t")
			{
				in_new_tab = true;
				
				args.splice(1, 1);
			}
			
			let file_path = args[0];
			
			if (file_path[0] !== "/")
			{
				file_path = Page.parent_folder + args[0];
			}
			
			const subtext = args.slice(1).join(" ");
			
			const src = `${file_path.slice(0, file_path.lastIndexOf("/") + 1)}cover.`;
			
			return `
				<div class="image-link">
					<a href="${file_path}" data-in-new-tab="${in_new_tab ? 1 : 0}" tabindex="-1">
						<img class="check-webp" src="/graphics/general-icons/placeholder.png" data-image-id="${id}" data-src="${src}" alt="${subtext}" tabindex="1"></img>
					</a>
					
					<p class="image-link-subtext">${subtext}</p>
				</div>
			`;
		}
	},
	
	
	
	get_gallery_image: function(id, size, ...name)
	{
		const text = name.join(" ");
		
		return `
			<div class="gallery-image-${size}-${size}">
				<img class="check-webp" data-image-id="${id}" onclick="" src="/graphics/general-icons/placeholder.png" data-src="/gallery/thumbnails/${id}." alt="${name}"></img>
			</div>
		`;
	},
	
	
	
	get_banner: function()
	{
		return `
			<div id="banner">
				<div id="banner-small"></div>
				<div id="banner-large"></div>
			</div>
			
			<div id="banner-gradient"></div>

			<div id="banner-cover"></div>

			<div id="content">
				<div id="scroll-to"></div>
				
				<div style="height: 5vh"></div>
		`;
	},
	
	
	
	get_text_box: function(args)
	{
		const id = args[0];
		
		const value = args[1];
		
		const text = args.slice(2).join(" ");
		
		return `
			<div class="text-box-container">
				<input id="${id}-input" class="text-box" type="text" value="${value}" tabindex="1">
				<p class="body-text text-box-subtext">${text}</p>
			</div>
		`;
	},
	
	
	
	get_text_button: function(args)
	{
		const id = args[0];
		
		let text = args.slice(1).join(" ");
		
		
		
		let linked_string = "";
		
		if (args[1] === "l")
		{
			linked_string = " linked-text-button";
			
			text = args.slice(2).join(" ");
		}
		
		
		
		return `
			<div class="focus-on-child" tabindex="1">
				<button class="text-button${linked_string}" type="button" id="${id}-button" tabindex="-1">${text}</button>
			</div>
		`;
	},
	
	
	
	get_slider: function(args)
	{
		const id = args[0];
		
		const value = args[1];
		
		const text = args.slice(2).join(" ");
		
		return `
			<div class="slider-container">
				<input id="${id}-slider" type="range" min="0" max="10000" value="${value}" tabindex="1">
				<label for="${id}-slider">
					<p class="body-text slider-subtext">${text}: <span id="${id}-slider-value">0</span></p>
				</label>
			</div>
		`;
	},
	
	
	
	Parse:
	{
		/*
			Test cases: *italics*, **bold**, `code`, $math$, ***bold and italic***, $*asterisks in math*$, $**bold in math**$, $`code in math`$, `*asterisks in code*`, \$escaped dollar signs\$, \`escaped backticks\`, \*escaped asterisks\*, `$dollar signs in code$`
		*/
		
		"text": (text) =>
		{
			//None of the delimiters * and ` can be parsed if they're inside math mode, so we'll modify those things and put them back afterward. The syntax [^\$] means any character other than a dollar sign.
			
			//First, we replace ending dollar signs with [END$] to differentiate them for later. Otherwise, delimiters between dollar signs would be matched too. We also replace escaped characters.
			let html = text
			.replaceAll(/\\\$/g, "[DOLLARSIGN]")
			.replaceAll(/\\`/g, "[BACKTICK]")
			.replaceAll(/\\\*/g, "[ASTERISK]")
			.replaceAll(/\\\"/g, "[DOUBLEQUOTE]")
			.replaceAll(/\\\'/g, "[SINGLEQUOTE]")
			.replaceAll(/\$\$(.*?)\$\$/g, (match, $1) => `\$\\displaystyle ${$1}\$`)
			.replaceAll(/\$(.*?)\$/g, (match, $1) => `\$${$1}[END\$]`);
			
			
			
			//Escape every asterisk, backtick, and quote inside dollar signs.
			while (html.match(/\$([^\$]*?)\*([^\$]*?)\[END\$\]/))
			{
				html = html.replaceAll(/\$([^\$]*?)\*([^\$]*?)\[END\$\]/g, (match, $1, $2) => `\$${$1}[ASTERISK]${$2}[END\$]`);
			}
			
			while (html.match(/\$([^\$]*?)`([^\$]*?)\[END\$\]/))
			{
				html = html.replaceAll(/\$([^\$]*?)`([^\$]*?)\[END\$\]/g, (match, $1, $2) => `\$${$1}[BACKTICK]${$2}[END\$]`);
			}
			
			while (html.match(/\$([^\$]*?)\"([^\$]*?)\[END\$\]/))
			{
				html = html.replaceAll(/\$([^\$]*?)\"([^\$]*?)\[END\$\]/g, (match, $1, $2) => `\$${$1}[DOUBLEQUOTE]${$2}[END\$]`);
			}
			
			while (html.match(/\$([^\$]*?)\'([^\$]*?)\[END\$\]/))
			{
				html = html.replaceAll(/\$([^\$]*?)\'([^\$]*?)\[END\$\]/g, (match, $1, $2) => `\$${$1}[SINGLEQUOTE]${$2}[END\$]`);
			}
			
			while (html.match(/\$([^\$]*?)\[END\$\]([^<])/))
			{
				html = html.replaceAll(/\$([^\$]*?)\[END\$\]([^<])/g, (match, $1, $2) => `<span class="tex-holder">\$${$1}[END\$]</span>${$2}`);
			}
			
			while (html.match(/\$([^\$]*?)\[END\$\]$/))
			{
				html = html.replaceAll(/\$([^\$]*?)\[END\$\]$/g, (match, $1) => `<span class="tex-holder">\$${$1}[END\$]</span>`);
			}
			
			
			
			//Now we can handle the backticks. Since all of the ones still present aren't inside math mode, we know they must be code. That means we need to play the same game we just did. First we can put back the dollar signs though.
			
			html = html.replaceAll(/\[END\$\]/g, "\$").replaceAll(/`(.*?)`/g, (match, $1) => `\`${$1}[END\`]`);
			
			//Escape every asterisk and quote inside backticks.
			while (html.match(/`([^`]*?)\*([^`]*?)\[END`\]/))
			{
				html = html.replaceAll(/`([^`]*?)\*([^`]*?)\[END`\]/g, (match, $1, $2) => `\`${$1}[ASTERISK]${$2}[END\`]`);
			}
			
			while (html.match(/`([^`]*?)\"([^`]*?)\[END`\]/))
			{
				html = html.replaceAll(/`([^`]*?)\"([^`]*?)\[END`\]/g, (match, $1, $2) => `\`${$1}[DOUBLEQUOTE]${$2}[END\`]`);
			}
			
			while (html.match(/`([^`]*?)\'([^`]*?)\[END`\]/))
			{
				html = html.replaceAll(/`([^`]*?)\'([^`]*?)\[END`\]/g, (match, $1, $2) => `\`${$1}[SINGLEQUOTE]${$2}[END\`]`);
			}
			
			
			
			//Escape every quote inside a tag.
			while (html.match(/<([^<>]*?)\"([^<>]*?)>/))
			{
				html = html.replaceAll(/<([^<>]*?)\"([^<>]*?)>/g, (match, $1, $2) => `<${$1}[DOUBLEQUOTE]${$2}>`);
			}
			
			while (html.match(/<([^<>]*?)\'([^<>]*?)>/))
			{
				html = html.replaceAll(/<([^<>]*?)\'([^<>]*?)>/g, (match, $1, $2) => `<${$1}[SINGLEQUOTE]${$2}>`);
			}
			
			
			
			//Add leading tabs and bullet points.
			let num_tabs = 0;
			
			while (html[num_tabs] === ">")
			{
				num_tabs++;
			}
			
			if (num_tabs !== 0)
			{
				let slice_start = num_tabs;
				
				while (html[slice_start] === " ")
				{
					slice_start++;
				}
				
				html = html.slice(slice_start);
				
				if (html[0] === "." && html[1] === " ")
				{
					html = `<strong>&#8226;</strong> ${html.slice(2)}`;
				}
				
				html = `<span style=[DOUBLEQUOTE]width: ${32 * num_tabs}px[DOUBLEQUOTE]></span>${html}`;
			}
			
			
			
			//Now we're finally ready to add the code tags, and then the remaining em and strong tags, and then modify the quotes. Then at long last, we can unescape the remaining characters.
			return html
			.replaceAll(/`(.*?)\[END`\]/g, (match, $1) => `<code>${$1}</code>`)
			.replaceAll(/\*\*(.*?)\*\*/g, (match, $1) => `<strong>${$1}</strong>`)
			.replaceAll(/\*(.*?)\*/g, (match, $1) => `<em>${$1}</em>`)
			.replaceAll(/(\s)\"(\S)/g, (match, $1, $2) => `${$1}&#x201C;${$2}`)
			.replaceAll(/^\"(\S)/g, (match, $1) => `&#x201C;${$1}`)
			.replaceAll(/\"/g, "&#x201D;")
			.replaceAll(/(\s)\'(\S)/g, (match, $1, $2) => `${$1}&#x2018;${$2}`)
			.replaceAll(/^\'(\S)/g, (match, $1) => `&#x2018;${$1}`)
			.replaceAll(/\'/g, "&#x2019;")
			.replaceAll(/---/g, "&mdash;")
			.replaceAll(/--/g, "&ndash;")
			.replaceAll(/\[DOUBLEQUOTE\]/g, "\"")
			.replaceAll(/\[SINGLEQUOTE\]/g, "\'")
			.replaceAll(/\[ASTERISK\]/g, "*")
			.replaceAll(/\[BACKTICK\]/g, "`")
			.replaceAll(/\[DOLLARSIGN\]/g, "\\$")
			.replaceAll(/<span class="tex-holder">\$(.*?)\$<\/span>/g, (match, $1) => `<span class="tex-holder inline-math" data-source-tex="${$1.replaceAll(/\\displaystyle\s*/g, "")}">\$${$1}\$</span>`);
		},
		
		
		
		"image-links": (content) =>
		{
			let html = `<div class="image-links${content.length === 1 ? " one-image-link" : ""}">`;
			
			content.forEach(line =>
			{
				html = `${html}${Page.Components.get_image_link(line.split(" "))}`
			});
			
			html = `${html}</div>`
			
			return html;
		},
		
		
		
		"buttons": (content) =>
		{
			let html = `<div class="text-buttons">`;
			
			content.forEach(line =>
			{
				html = `${html}${Page.Components.get_text_button(line.split(" "))}`
			});
			
			html = `${html}</div>`
			
			return html;
		},
		
		
		
		"text-boxes": (content) =>
		{
			let html = `<div class="text-boxes">`;
			
			content.forEach(line =>
			{
				html = `${html}${Page.Components.get_text_box(line.split(" "))}`
			});
			
			html = `${html}</div>`
			
			return html;
		},
		
		
		
		"sliders": (content) =>
		{
			let html = `<div class="sliders">`;
			
			content.forEach(line =>
			{
				html = `${html}${Page.Components.get_slider(line.split(" "))}`
			});
			
			html = `${html}</div>`
			
			return html;
		},
		
		
		
		"dropdown": (content) =>
		{
			const id = content[0];
			
			let html = `
				<div class="text-buttons">
					<div class="dropdown-container focus-on-child" tabindex="1">
						<button class="text-button dropdown" type="button" id="${id}-dropdown-button" tabindex="-1">`;
			
			for (let i = 1; i < content.length; i++)
			{
				const words = content[i].split(" ");
				
				const value = words[0];
				const text = words.slice(1).join(" ");
				
				if (i === 1)
				{
					html += `${text}</button><select id="${id}-dropdown">`;
				}
				
				html += `<option value="${value}">${text}</option>`;
			}
			
			html += `</select></div></div>`;
			
			return html;
		},
		
		
		
		"gallery-block": (content) =>
		{
			let html = `<div class="gallery-block">`;
			
			content.forEach(line =>
			{
				html = `${html}${Page.Components.get_gallery_image(...(line.split(" ")))}`;
			});
			
			html = `${html}</div>`
			
			return html;
		},
		
		
		
		"card": (id, ...name) =>
		{
			if (name.length !== 0)
			{
				name = name.join(" ");
				
				return `<div id="${id}-card" class="card"><h1 class="heading-text">${name}</h1>`;
			}
			
			return `<div id="${id}-card" class="card">`;
		},
		
		
		
		"notes-environment": (id, ...name) =>
		{
			if (name.length !== 0)
			{
				name = name.join(" ");
				
				//These two avoid awkward things like Theorem: The Fundamental Theorem.
				if (name[0] === "!")
				{
					return `<div class="notes-${id} notes-environment"><p class="body-text"</p><span class="notes-${id}-title">${name.slice(1)}</span></p>`;
				}
				
				else if (name.toLowerCase().includes(Page.Components.notes_environments[id].toLowerCase()))
				{
					return `<div class="notes-${id} notes-environment"><p class="body-text"</p><span class="notes-${id}-title">${name}</span></p>`;
				}
				
				else
				{
					return `<div class="notes-${id} notes-environment"><p class="body-text"</p><span class="notes-${id}-title">${Page.Components.notes_environments[id]}: ${name}</span></p>`;
				}
			}
			
			else
			{
				return `<div class="notes-${id} notes-environment"><p class="body-text"</p><span class="notes-${id}-title">${Page.Components.notes_environments[id]}</span></p>`;
			}
		},
		
		
		
		"banner": () =>
		{
			return "";
		},
		
		
		
		"canvas": (id) =>
		{
			if (id)
			{
				return `<div class="desmos-border"><canvas id="${id}-canvas" class="output-canvas"></canvas></div>`;
			}
			
			else
			{
				return `<canvas id="output-canvas" class="output-canvas"></canvas>`;
			}
		},
		
		
		
		"center": (...words) =>
		{
			const text = words.join(" ");
			
			return `<p class="body-text center-if-needed"><span>${Page.Components.Parse.text(text)}</span></p>`;
		},
		
		
		
		"checkbox": (id, ...name) =>
		{
			const text = name.join(" ");
			
			return `
				<div class="checkbox-row">
					<div class="checkbox-container click-on-child" tabindex="1">
						<input type="checkbox" id="${id}-checkbox">
						<div class="checkbox"></div>
					</div>
					
					<div style="margin-left: 10px">
						<p class="body-text checkbox-subtext">${text}</p>
					</div>
				</div>
			`;
		},
		
		
		
		"desmos": (id) =>
		{
			return `<div class="desmos-border"><div id="${id}" class="desmos-container"></div></div>`;
		},
		
		
		
		"nav-buttons": () =>
		{
			return `
				<div class="text-buttons nav-buttons">
					<div class="focus-on-child tabindex="1">
						<button class="text-button linked-text-button previous-nav-button" type="button" tabindex="-1">Previous</button>
					</div>
					
					<div class="focus-on-child" tabindex="1">
						<button class="text-button linked-text-button home-nav-button" type="button" tabindex="-1">Home</button>
					</div>
					
					<div class="focus-on-child" tabindex="1">
						<button class="text-button linked-text-button next-nav-button" type="button" tabindex="-1">Next</button>
					</div>
				</div>
			`;
		},
		
		
		
		"wilson": () =>
		{
			return `<p class="body-text">This applet was made with <a href="/projects/wilson/">Wilson</a>, a library I wrote to make high-performance, polished applets easier to create.</p>`;
		}
	},
	
	single_line_environments: ["banner", "canvas", "card", "center", "checkbox", "desmos", "nav-buttons", "wilson"],
	
	notes_environments:
	{
		"ex": "Example",
		"exc": "Exercise",
		"def": "Definition",
		"prop": "Proposition",
		"thm": "Theorem",
		"lem": "Lemma",
		"cor": "Corollary",
		"pf": "Proof",
		"ax": "Axiom",
		"as": "Aside"
	},
	
	
	
	decode: function(html)
	{
		const banner = html.indexOf("### banner") !== -1;
		
		let in_environment = false;
		
		html = html.replaceAll(/\r/g, "").replaceAll(/    /g, "\t");
		
		//Tabs in code blocks stay, but the rest can go. We match two tabs here so that we can still indent the whole block by one.
		while (html.match(/(```.+\n[\s\S]*?)\t\t([\s\S]*?```\n)/))
		{
			html = html.replaceAll(/(```.+\n[\s\S]*?)\t\t([\s\S]*?```\n)/g, (match, $1, $2) => `${$1}&#9;${$2}`);
		}
		
		html = html.replaceAll(/\t/g, "");
		
		
		
		//We need to ignore the scripts at the bottom.
		const index = html.indexOf("<script");
		
		let scripts_data = "";
		
		if (index !== -1)
		{
			scripts_data = html.slice(index);
			
			html = html.slice(0, index);
		}
		
		let page_title = "";
		
		let lines = html.split("\n");
		
		
		
		for (let i = 0; i < lines.length; i++)
		{
			//filtering out lines beginning with < is a little rough, but pretty much necessary.
			if (lines[i].length === 0 || lines[i][0] === "<")
			{
				continue;
			}
			
			//A ! at the start of a line indicates we should treat it as text after all.
			if (lines[i][0] === "!")
			{
				lines[i] = lines[i].slice(1);
			}
			
			
			
			//Leave math mostly alone (but wrap it in body text).
			if (lines[i] === "$$")
			{
				let source_tex = "";
				
				const start_i = i;
				
				i++;
				
				while (lines[i].slice(0, 2) !== "$$")
				{
					if (lines[i] === "")
					{
						lines.splice(i, 1);
					}
					
					else
					{
						source_tex = `${source_tex}${i === start_i + 1 ? "" : "\\\\"}[NEWLINE][TAB]${lines[i]}`;
						
						if ([...lines[i].matchAll(/\\(begin|end){.*?}/g)].length !== 1)
						{
							lines[i] = `${lines[i]}\\\\[4px]`;
						}
						
						i++;
					}
				}
				
				source_tex = `${source_tex}[NEWLINE]`;
				
				if (source_tex.indexOf("&") === -1)
				{
					source_tex = `$$${source_tex}$$`;
				}
				
				else
				{
					source_tex = `\\begin{align*}${source_tex}\\end{align*}`;
				}
				
				
				
				//Remove the last line break.
				lines[i - 1] = lines[i - 1].replace(/\\\\\[4px\]$/, "");
				
				lines[i] = `\\end{align*}$$</span></p>`;
				
				lines[start_i] = `<p class="body-text" style="text-align: center"><span class="tex-holder" style="padding: 8px" data-source-tex="${source_tex}">$$\\begin{align*}`;
			}
			
			
			
			//Handle code blocks.
			else if (lines[i].slice(0, 3) === "```")
			{
				if (lines[i].length > 3)
				{
					lines[i] = `<pre><code class="language-${lines[i].slice(3)}">`;
				}
				
				else
				{
					lines[i] = `<pre><code>`;
				}
				
				lines[i] = `${lines[i]}${lines[i + 1]}[ESCAPEDNEWLINE]`;
				
				lines.splice(i + 1, 1);
				
				i++;
				
				while (lines[i].slice(0, 3) !== "```")
				{
					lines[i] = `${lines[i]}[ESCAPEDNEWLINE]`;
					i++;
				}
				
				lines[i - 1] = `${lines[i - 1]}</code></pre>`;
				
				lines.splice(i, 1);
				
				i--;
			}
			
			
			
			//This is one of the many possible environments.
			else if (lines[i].slice(0, 3) === "###")
			{
				if (lines[i] === "###")
				{
					//If we find one of these in the wild, we&#x2019;re in an environment and just need to end it.
					
					in_environment = false;
					
					lines[i] = `</div>`;
					continue;
				}
				
				
				
				const words = lines[i].slice(4).split(" ");
				
				//The first word is the id.
				if (this.single_line_environments.includes(words[0]))
				{
					lines[i] = this.Parse[words[0]](...(words.slice(1)));
					
					if (words[0] === "card")
					{
						in_environment = true;
					}
				}
				
				else if (words[0] in this.notes_environments)
				{
					lines[i] = this.Parse["notes-environment"](...words);
					
					in_environment = true;
				}
				
				else
				{
					let content = [];
					
					const start_i = i;
					
					i++;
					
					while (lines[i] !== "###")
					{
						if (lines[i].length !== 0)
						{
							content.push(lines[i]);
						}
						
						i++;
					}
					
					lines[start_i] = this.Parse[words[0]](content, ...(words.slice(1)));
					
					for (let j = start_i + 1; j <= i; j++)
					{
						lines[j] = "";
					}
					
				}
			}
			
			//A new section.
			else if (lines[i].slice(0, 2) === "##")
			{
				let title = this.Parse.text(lines[i].slice(2));
				
				if (in_environment)
				{
					lines[i] = `<h2 class="section-text" style="margin-top: 48px">${title}</h2>`;
				}
				
				else
				{
					lines[i] = `</section><h2 class="section-text">${title}</h2><section>`;
				}
			}
			
			//A heading. Only one of these per file.
			else if (lines[i][0] === "#")
			{
				const title = this.Parse.text(lines[i].slice(2));
				
				page_title = title;
				
				const height_adjust = banner ? ` style="margin-bottom: 10vh"` :  "";
				const banner_html = banner ? this.get_banner() :  "";
				
				lines[i] = `
					${banner_html}
					<header${height_adjust}>
						<div id="logo">
							<a href="/home/" tabindex="-1">
								<img src="/graphics/general-icons/logo.png" alt="Logo" tabindex="1"></img>
							</a>
						</div>
						
						<div style="height: 20px"></div>
						
						<h1 class="heading-text">${title}</h1>
					</header>
					
					<main>
						<section>
				`;
			}
			
			//Regular text!
			else
			{
				const content = this.Parse.text(lines[i]);
				
				if (content.match(/^[0-9]+?\./))
				{
					lines[i] = `<p class="body-text numbered-list-item">${content}</p>`;
				}
				
				else
				{
					lines[i] = `<p class="body-text">${content}</p>`;
				}
			}
		}
		
		
		
		//Remove blank lines and tabs.
		for (let i = 0; i < lines.length; i++)
		{
			lines[i] = lines[i].replace(/\t/g, "").replace(/\n/g, "");
			
			if (lines[i].length === 0)
			{
				lines.splice(i, 1);
				i--;
			}
		}
		
		
		
		html = lines.join("");
		
		//Gross
		html = html.replaceAll(/\[ESCAPEDNEWLINE\]/g, "\n");
		
		
		
		//End the HTML properly.
		
		html = `${html}</section></main>`;
		
		if (banner)
		{
			html = `${html}</div>`;
		}
		
		
			
		html = `<html><body>${html}${scripts_data}</body></html>`;
		
		return html;
	}
};