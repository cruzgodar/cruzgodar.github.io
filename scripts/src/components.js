"use strict";



Page.Components =
{
	get_image_link: function(args)
	{
		let file_path = args[0];
		
		if (file_path[0] !== "/")
		{
			file_path = Page.parent_folder + args[0];
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
		"text": (text) =>
		{
			//None of the delimiters * and ` can be parsed if they're inside math mode, so we'll modify those things and put them back afterward. The syntax [.^\$] means any character other than a dollar sign.
			
			//First, we replace ending dollar signs with [END$] to differentiate them for later. Otherwise, delimiters between dollar signs would be matched too.
			let html = text.replaceAll(/\$(.*?)\$/g, "\$ $1 [END\$]");
			
			while (html.match(/\$([.^\$]*?)\*([.^\$]*?)\[END\$\]/))
			{
				html = html.replaceAll(/\$([.^\$]*?)\*([.^\$]*?)%/g, "\$ $1[ASTERISK]$2 [END\$]");
			}
			
			while (html.match(/\$([.^\$]*?)`([.^\$]*?)\[END\$\]/))
			{
				html = html.replaceAll(/\$([.^\$]*?)`([.^\$]*?)\[END\$\]/g, "\$ $1[BACKTICK]$2 [END\$]");
			}
			
			html = html.replaceAll(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replaceAll(/\*(.*?)\*/g, "<em>$1</em>").replaceAll(/`(.*?)`/g, "<code>$1</code>");
			
			return html.replaceAll(/\[ASTERISK\]/g, "*").replaceAll(/\[BACKTICK\]/g, "`").replaceAll(/\[END\$\]/g, "\$");
		},
		
		
		
		"image-links": (content) =>
		{
			let html = `<div class="image-links">`;
			
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
		
		
		
		"notes-environment": (id, ...name) =>
		{
			if (name.length !== 0)
			{
				name = name.join(" ");
				
				//This avoids awkward things like Theorem: The Fundamental Theorem.
				if (name.toLowerCase().includes(Page.Components.notes_environments[id].toLowerCase()))
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
		
		
		
		"canvas": () =>
		{
			return `<canvas id="output-canvas" class="output-canvas"></canvas>`;
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
	
	single_line_environments: ["canvas", "checkbox", "desmos", "nav-buttons", "wilson"],
	
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
		"ax": "Axiom"
	},
	
	
	
	decode: function(html)
	{
		const banner = html.match(/"banner_page": "true"/) ? true : false;
		
		let page_title = "";
		
		let lines = html.replace(/\t/g, "").replace(/    /g, "").replace(/\r/g, "").split("\n");
		
		
		
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
			
			
			
			//Leave math alone.
			if (lines[i].slice(0, 2) === "$$")
			{
				i++;
				
				while (lines[i].slice(0, 2) !== "$$")
				{
					i++;
				}
				
				i++;
			}
			
			//This is one of the many possible environments.
			if (lines[i].slice(0, 3) === "###")
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
				
				lines[i] = `
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
		
		
		
		//End the HTML properly.
		
		html = `${html}</section></main>`;
		
		if (banner)
		{
			html = `${html}</div>`;
		}
		
		
		
		if (!DEBUG)
		{
			//This is for the published html, so it shouldn't be in debug mode.
			html = html.replace(/index-testing.html/g, "index.html");
			
			if (page_title === "")
			{
				page_title = "Cruz Godar";
			}
			
			const head_html = `<title>${page_title}</title><meta property="og:title" content="${page_title}"/><meta property="og:type" content="website"/><meta property="og:url" content="https://cruzgodar.com${args.plainTexts[1]}"/><meta property="og:image" content="https://cruzgodar.com${args.plainTexts[1]}cover.jpg"/><meta property="og:locale" content="en_US"/><meta property="og:site_name" content="Cruz Godar"/>`;
			
			html = `<!DOCTYPE html><html lang="en"><head>${head_html}<style>body {opacity: 0;}</style></head><noscript><p class="body-text" style="text-align: center">JavaScript is required to use this site and many others. Consider enabling it.</p></noscript>${html}</html>`;
		}
		
		
		
		return html;
	}
};