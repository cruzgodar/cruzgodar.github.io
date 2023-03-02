const parent_folder = args.plainTexts[1];

const components =
{
	get_image_link: function(args)
	{
		let file_path = args[0];
		
		if (file_path[0] !== "/")
		{
			file_path = parent_folder + args[0];
		}
		
		
		
		let subtext = "";
		
		
		
		let light_text = "";
		
		if (args[1] === "l")
		{
			light_text = " image-link-light";
			
			subtext = args.slice(2).join(" ");
		}
		
		else
		{
			subtext = args.slice(1).join(" ");
		}
		
		
		
		let id = args[0].split(".")[0].split("/");
		
		id = id[id.length - 1];
		
		
		
		const src = `${file_path.slice(0, file_path.lastIndexOf("/") + 1)}cover.`;
		
		
		
		return `
			<div class="image-link${light_text}">
				<a href="${file_path}" tabindex="-1">
					<img class="check-webp" src="/graphics/general-icons/placeholder.png" data-image-id="${id}" data-src="${src}" alt="${subtext}" tabindex="1"></img>
				</a>
				
				<p class="image-link-subtext">${subtext}</p>
			</div>
		`;
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
			<div id="banner"></div>
			
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
			.replaceAll(/\$(.*?)\$/g, "\$ $1 [END\$]");
			
			//Escape every asterisk, backtick, and quote inside dollar signs.
			while (html.match(/\$([^\$]*?)\*([^\$]*?)\[END\$\]/))
			{
				html = html.replaceAll(/\$([^\$]*?)\*([^\$]*?)\[END\$\]/g, "\$ $1[ASTERISK]$2 [END\$]");
			}
			
			while (html.match(/\$([^\$]*?)`([^\$]*?)\[END\$\]/))
			{
				html = html.replaceAll(/\$([^\$]*?)`([^\$]*?)\[END\$\]/g, "\$ $1[BACKTICK]$2 [END\$]");
			}
			
			while (html.match(/\$([^\$]*?)\"([^\$]*?)\[END\$\]/))
			{
				html = html.replaceAll(/\$([^\$]*?)\"([^\$]*?)\[END\$\]/g, "\$ $1[DOUBLEQUOTE]$2 [END\$]");
			}
			
			while (html.match(/\$([^\$]*?)\'([^\$]*?)\[END\$\]/))
			{
				html = html.replaceAll(/\$([^\$]*?)\'([^\$]*?)\[END\$\]/g, "\$ $1[SINGLEQUOTE]$2 [END\$]");
			}
			
			//Now we can handle the backticks. Since all of the ones still present aren't inside math mode, we know they must be code. That means we need to play the same game we just did. First we can put back the dollar signs though.
			
			html = html.replaceAll(/\[END\$\]/g, "\$").replaceAll(/`(.*?)`/g, "` $1 [END`]");
			
			//Escape every asterisk and quote inside backticks.
			while (html.match(/`([^`]*?)\*([^`]*?)\[END`\]/))
			{
				html = html.replaceAll(/`([^`]*?)\*([^`]*?)\[END`\]/g, "` $1[ASTERISK]$2 [END`]");
			}
			
			while (html.match(/`([^`]*?)\"([^`]*?)\[END`\]/))
			{
				html = html.replaceAll(/`([^`]*?)\"([^`]*?)\[END`\]/g, "` $1[DOUBLEQUOTE]$2 [END`]");
			}
			
			while (html.match(/`([^`]*?)\'([^`]*?)\[END`\]/))
			{
				html = html.replaceAll(/`([^`]*?)\'([^`]*?)\[END`\]/g, "` $1[SINGLEQUOTE]$2 [END`]");
			}
			
			//Now we're finally ready to add the code tags, and then the remaining em and strong tags, and then modify the quotes. Then at long last, we can unescape the remaining characters.
			return html
			.replaceAll(/`(.*?)\[END`\]/g, "<code>$1</code>")
			.replaceAll(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
			.replaceAll(/\*(.*?)\*/g, "<em>$1</em>")
			.replaceAll(/(\s)\"(\S)/g, "$1&#x201C;$2")
			.replaceAll(/^\"(\S)/g, "&#x201C;$1")
			.replaceAll(/\"/g, "&#x201D;")
			.replaceAll(/(\s)\'(\S)/g, "$1&#x2018;$2")
			.replaceAll(/^\'(\S)/g, "&#x2018;$1")
			.replaceAll(/\'/g, "&#x2019;")
			.replaceAll(/\[DOUBLEQUOTE\]/g, "\"")
			.replaceAll(/\[SINGLEQUOTE\]/g, "\'")
			.replaceAll(/\[ASTERISK\]/g, "*")
			.replaceAll(/\[BACKTICK\]/g, "`")
			.replaceAll(/\[DOLLARSIGN\]/g, "\\$");
		},
		
		
		
		"image-links": (content) =>
		{
			let html = `<div class="image-links">`;
			
			content.forEach(line =>
			{
				html = `${html}${components.get_image_link(line.split(" "))}`
			});
			
			html = `${html}</div>`
			
			return html;
		},
		
		
		
		"buttons": (content) =>
		{
			let html = `<div class="text-buttons">`;
			
			content.forEach(line =>
			{
				html = `${html}${components.get_text_button(line.split(" "))}`
			});
			
			html = `${html}</div>`
			
			return html;
		},
		
		
		
		"text-boxes": (content) =>
		{
			let html = `<div class="text-boxes">`;
			
			content.forEach(line =>
			{
				html = `${html}${components.get_text_box(line.split(" "))}`
			});
			
			html = `${html}</div>`
			
			return html;
		},
		
		
		
		"sliders": (content) =>
		{
			let html = `<div class="sliders">`;
			
			content.forEach(line =>
			{
				html = `${html}${components.get_slider(line.split(" "))}`
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
				html = `${html}${components.get_gallery_image(...(line.split(" ")))}`;
			});
			
			html = `${html}</div>`
			
			return html;
		},
		
		
		
		"notes-environment": (id, ...name) =>
		{
			if (name.length !== 0)
			{
				name = name.join(" ");
				
				//This avoids awkward things like Theorem: The Fundamental Theorem.
				if (name.toLowerCase().includes(components.notes_environments[id].toLowerCase()))
				{
					return `<div class="notes-${id} notes-environment"><p class="body-text"</p><span class="notes-${id}-title">${name}</span></p>`;
				}
				
				else
				{
					return `<div class="notes-${id} notes-environment"><p class="body-text"</p><span class="notes-${id}-title">${components.notes_environments[id]}: ${name}</span></p>`;
				}
			}
			
			else
			{
				return `<div class="notes-${id} notes-environment"><p class="body-text"</p><span class="notes-${id}-title">${components.notes_environments[id]}</span></p>`;
			}
		},
		
		
		
		"banner": () =>
		{
			return "";
		},
		
		
		
		"canvas": () =>
		{
			return `<canvas id="output-canvas" class="output-canvas"></canvas>`;
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
	
	single_line_environments: ["banner", "canvas", "checkbox", "desmos", "nav-buttons", "wilson"],
	
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
		
		html = html.replaceAll(/[\t\r]/g, "").replaceAll(/    /g, "");
		
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
			
			
			
			//Leave math alone (but wrap it in body text).
			if (lines[i].slice(0, 2) === "$$")
			{
				lines[i] = `<p class="body-text">$$`;
				
				i++;
				
				while (lines[i].slice(0, 2) !== "$$")
				{
					lines[i] = lines[i].replace(/\\\\/g, "\\\\[4px]")
					i++;
				}
				
				lines[i] = `$$</p>`;
				
				i++;
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
			}
			
			
			
			//This is one of the many possible environments.
			else if (lines[i].slice(0, 3) === "###")
			{
				if (lines[i] === "###")
				{
					//If we find one of these in the wild, we&#x2019;re in a notes environment and just need to end it.
					
					lines[i] = `</div>`;
					continue;
				}
				
				
				
				const words = lines[i].slice(4).split(" ");
				
				//The first word is the id.
				if (this.single_line_environments.includes(words[0]))
				{
					lines[i] = this.Parse[words[0]](...(words.slice(1)));
				}
				
				else if (words[0] in this.notes_environments)
				{
					lines[i] = this.Parse["notes-environment"](...words);
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
				
				//The first word is the id.
				lines[i] = `</section><h2 class="section-text">${title}</h2><section>`;
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
				lines[i] = `<p class="body-text">${this.Parse.text(lines[i])}</p>`;
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
		
		
		
		scripts_data = scripts_data.replace(/init\.js/g, "init.min.js");
		
		
		
		if (page_title === "")
		{
			page_title = "Cruz Godar";
		}
		
		const head_html = `<title>${page_title}</title><meta property="og:title" content="${page_title}"/><meta property="og:type" content="website"/><meta property="og:url" content="https://cruzgodar.com${args.plainTexts[1]}"/><meta property="og:image" content="https://cruzgodar.com${args.plainTexts[1]}cover.jpg"/><meta property="og:locale" content="en_US"/><meta property="og:site_name" content="Cruz Godar"/>`;
			
		html = `<!DOCTYPE html><html lang="en"><head>${head_html}<style>body {opacity: 0;}</style></head><body><noscript><p class="body-text" style="text-align: center">JavaScript is required to use this site and many others. Consider enabling it.</p></noscript>${html}${scripts_data}</body></html>`;
		
		return html;
	}
};

return components.decode(args.plainTexts[0]);