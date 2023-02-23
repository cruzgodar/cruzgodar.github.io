"use strict";



Page.Components =
{
	get_header: function(args, banner)
	{
		const title = args.join(" ");
		
		const height_adjust = banner ? ` style="margin-bottom: 10vh"` :  "";
		
		return `
			<header${height_adjust}>
				<div id="logo">
					<a href="/home/" tabindex="-1">
						<img src="/graphics/general-icons/logo.png" alt="Logo" tabindex="1"></img>
					</a>
				</div>
				
				<div style="height: 2vh"></div>
				
				<h1 class="heading-text">${title}</h1>
			</header>
			
			<main>
				<section>
		`;
	},
	
	
	
	get_footer: function(banner)
	{
		if (banner)
		{
			return `
						</section>
					</main>
				</div>
			`;
		}
		
		else
		{
			return `
					</section>
				</main>
			`;
		}
	},
	
	
	
	get_section: function()
	{
		return `
			</section>
			
			<section>
		`;
	},
	
	
	
	get_text: function(args)
	{
		if (args[0] === "h")
		{
			const text = args.slice(1).join(" ");
			
			return `
				<h1 class="heading-text">
					${text}
				</h1>
			`;
		}
		
		else if (args[0] === "s")
		{
			const text = args.slice(1).join(" ");
			
			return `
				<h2 class="section-text">
					${text}
				</h2>
			`;
		}
		
		else if (args[2] === "!iframe")
		{
			const src = args.slice(3);
			
			return this.get_iframe(src);
		}
		
		else if (args[2] === "!desmos")
		{
			const id = args.slice(3);
			
			return this.get_desmos(id);
		}
		
		else
		{
			const text = args.slice(2).join(" ");
			
			//Only this one gets the line break at the end.
			if (args[1] === "j")
			{
				return `
					<p class="body-text">
						${text}
					</p>
					
					<br>`; //It's important that there are no characters after the <br>.
			}
			
			//Center if needed
			else
			{
				return `
					<p class="body-text center-if-needed">
						<span>
							${text}
						</span>
					</p>
				`;
			}
		}
	},
	
	
	
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
		
		
		
		const src = `${file_path.slice(0, file_path.lastIndexOf("/") + 1)}cover.${Page.Images.file_extension}`;
		
		
		
		return `
			<div class="image-link${light_text}">
				<a href="${file_path}" tabindex="-1">
					<img src="/graphics/general-icons/placeholder.png" data-image-id="${id}" data-src="${src}" alt="${subtext}" tabindex="1"></img>
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
	
	
	
	get_about_page_version: function(args)
	{
		let version_string = "medium-version";
		let version_text = "section-text";
		let element_type = "h2";
		
		const numbers = args[0].split(".");
		
		if (numbers.length === 3)
		{
			version_string = "minor-version";
			version_text = "body-text";
			element_type = "p";
		}
		
		else if (numbers[1] === "0")
		{
			version_string = "major-version";
			version_text = "heading-text";
			element_type = "h1";
		}
		
		
		
		let text = args.slice(1).join(" ");
		
		text = text.split(":");
		
		const description = text[1].slice(1);
		
		
		
		if (text.length === 3)
		{
			const datetime = text[2];
			
			text = text[0];
			
			const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
			
			const numbers = datetime.split("-");
			
			const year = parseInt(numbers[0]);
			
			const month = months[parseInt(numbers[1]) - 1];
			
			const day = parseInt(numbers[2]);
			
			
		
			return `
				<div class="${version_string}">
					<${element_type} class="${version_text}">${args[0]}</${element_type}>
					
					<${element_type} class="${version_text}">${text}</${element_type}>
					
					<br>
					
					<p class="body-text center-if-needed"><span>${description}</span></p>
					
					<br>
					
					<p class="body-text center-if-needed">
						<span>
							<time datetime="${datetime}">${month} ${day}, ${year}</time>
						</span>
					</p>
				</div>
			`;
		}
		
		
		
		else
		{
			text = text[0];
			
			return `
				<div class="${version_string}">
					<${element_type} class="${version_text}">${args[0]}</${element_type}>
					
					<${element_type} class="${version_text}">${text}</${element_type}>
					
					<br>
					
					<p class="body-text center-if-needed"><span>${description}</span></p>
				</div>
			`;
		}
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
	
	
	
	get_checkbox: function(args)
	{
		const id = args[0];
		
		const text = args.slice(1).join(" ");
		
		
		
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
	
	
	
	get_radio_button: function(args)
	{
		const name = args[0];
		
		const id = args[1];
		
		const text = args.slice(2).join(" ");
		
		
		
		return `
			<div class="radio-button-row">
				<div class="radio-button-container click-on-child" tabindex="1">
					<input type="radio" name="${name}" id="${id}-radio-button">
					<div class="radio-button"></div>
				</div>
				
				<div style="margin-left: 10px">
					<p class="body-text radio-button-subtext">${text}</p>
				</div>
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
	
	
	
	//This is an incredibly delicate balance -- modify with caution.
	get_dropdown: function(args)
	{
		let html = "";
		
		const id = args[0];
		
		html += `
			<div class="dropdown-container focus-on-child" tabindex="1">
				<button class="text-button dropdown" type="button" id="${id}-dropdown-button" tabindex="-1">`;
		
		for (let i = 1; i < args.length; i++)
		{
			const value = args[i][0];
			const text = args[i].slice(1).join(" ");
			
			if (i === 1)
			{
				html += `${text}</button><select id="${id}-dropdown">`;
			}
			
			html += `<option value="${value}">${text}</option>`;
		}
		
		html += `</select></div></div>`;
		
		return html;
	},
	
	
	
	get_canvas: function()
	{
		return `
			<canvas id="output-canvas" class="output-canvas"></canvas>
		`;
	},
	
	
	
	get_iframe: function(src)
	{
		return `
			<div class="iframe-container">	
				<div class="iframe-outer-border">
					<div class="iframe-clipper">
						<iframe src="${src}" width="500" height="500"></iframe>
					</div>
				</div>
			</div>
		`;	
	},
	
	
	
	get_desmos: function(id)
	{
		return `
			<div class="desmos-border">
				<div id="${id}" class="desmos-container"></div>
			</div>
		`;
	},
	
	
	
	get_line_break: function()
	{
		return `
			<div class="line-break line-break-0-0"></div>
			<div class="line-break line-break-1-0"></div>
			<div class="line-break line-break-0-1"></div>
			<div class="line-break line-break-1-1"></div>
		`;
	},
	
	
	
	get_nav_buttons: function()
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
	
	
	
	decode: function(html)
	{
		let banner = false;
		
		
		
		let lines = html.replace(/\t/g, "").replace(/    /g, "").replace(/\r/g, "").split("\n");
		
		
		
		for (let i = 0; i < lines.length; i++)
		{
			if (lines[i][0] === "!")
			{
				let words = lines[i].split(" ");
				
				if (words[0] === "!begin-text-block")
				{
					lines[i] = "";
					
					
					
					while (words[0] !== "!end-text-block")
					{
						i += 2;
						
						
						
						if (lines[i] === "!wilson")
						{
							lines[i] = `This applet was made with <a href="/projects/wilson/">Wilson</a>, a library I wrote to make high-performance, polished applets easier to create.`
						}
						
						
						
						if (lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$")
						{
							if (lines[i - 2].slice(lines[i - 2].length - 4) === "<br>")
							{
								lines[i - 2] = lines[i - 2].slice(0, lines[i - 2].length - 4);
							}
							
							lines[i] = `<p class="body-text">$$`;
						
							i++;
							
							while (!(lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$"))
							{
								i++;
							}
							
							lines[i] = `$$</p>`;
							
							continue;
						}
						
						
						
						words = lines[i].split(" ");
						
						lines[i] = this.get_text(["b", "j"].concat(words));
					}
					
					
					
					lines[i] = "";
				}
				
				
				
				else if (words[0] === "!begin-image-links")
				{
					lines[i] = `<div class="image-links">`;
					
					i += 2;
					
					words = lines[i].split(" ");
					
					while (words[0] !== "!end-image-links")
					{
						lines[i] = this.get_image_link(words);
						
						i += 2;
						
						words = lines[i].split(" ");
					}
					
					lines[i] = `</div>`;
				}
				
				
				
				else if (words[0] === "!section")
				{
					lines[i] = this.get_section();
				}
				
				
				
				else if (words[0] === "!text")
				{
					lines[i] = this.get_text(words.slice(1));
				}
				
				
				
				else if (words[0] === "!banner")
				{
					banner = true;
					
					lines[i] = this.get_banner();
				}
				
				
				
				else if (words[0] === "!footer")
				{
					lines[i] = this.get_footer(banner);
				}
				
				
				
				else if (words[0] === "!header")
				{
					lines[i] = this.get_header(words.slice(1), banner);
				}
				
				
				
				else if (words[0] === "!version")
				{
					lines[i] = this.get_about_page_version(words.slice(1));
				}
				
				
				
				else if (words[0] === "!begin-text-boxes")
				{
					lines[i] = `<div class="text-boxes">`;
					
					i += 2;
					
					words = lines[i].split(" ");
					
					while (words[0] !== "!end-text-boxes")
					{
						lines[i] = this.get_text_box(words);
						
						i += 2;
						
						words = lines[i].split(" ");
					}
					
					lines[i] = `</div>`;
				}
				
				
				
				else if (words[0] === "!begin-text-buttons")
				{
					lines[i] = `<div class="text-buttons">`;
					
					i += 2;
					
					let first = true;
					
					words = lines[i].split(" ");
					
					while (words[0] !== "!end-text-buttons")
					{
						lines[i] = this.get_text_button(words, first);
						
						i += 2;
						
						words = lines[i].split(" ");
						
						first = false;
					}
					
					lines[i] = `</div>`;
				}
				
				
				
				else if (words[0] === "!begin-sliders")
				{
					lines[i] = `<div class="sliders">`;
					
					i += 2;
					
					words = lines[i].split(" ");
					
					while (words[0] !== "!end-sliders")
					{
						lines[i] = this.get_slider(words);
						
						i += 2;
						
						words = lines[i].split(" ");
					}
					
					lines[i] = `</div>`;
				}
				
				
				
				else if (words[0] === "!begin-dropdown")
				{
					lines[i] = `<div class="text-buttons">`;
					
					i += 2;
					
					words = lines[i].split(" ");
					
					let args = [];
					
					while (words[0] !== "!end-dropdown")
					{
						args.push(words);
						
						lines[i] = "";
						
						i += 2;
						
						words = lines[i].split(" ");
					}
						
					lines[i] = `${this.get_dropdown(args)}`;
				}
				
				
				
				else if (words[0] === "!begin-def")
				{
					lines[i] = `<div class="notes-def notes-environment">`;
					
					i += 2;
					
					words = [`<span class="notes-def-title">Definition: ${lines[i]}</span>`];
					
					lines[i] = this.get_text(["b", "j"].concat(words));
					
					
					
					while (words[0] !== "!end-def")
					{
						i += 2;
						
						
						
						if (lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$")
						{
							if (lines[i - 2].slice(lines[i - 2].length - 4) === "<br>")
							{
								lines[i - 2] = lines[i - 2].slice(0, lines[i - 2].length - 4);
							}
							
							lines[i] = `<p class="body-text">$$`;
						
							i++;
							
							while (!(lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$"))
							{
								i++;
							}
							
							lines[i] = `$$</p>`;
							
							continue;
						}
						
						
						
						words = lines[i].split(" ");
						
						lines[i] = this.get_text(["b", "j"].concat(words));
					}
					
					
					
					lines[i] = `</div>`;
				}
				
				
				
				else if (words[0] === "!begin-example")
				{
					lines[i] = `<div class="notes-example notes-environment">`;
					
					i += 2;
					
					words = [`<span class="notes-example-title">Example: ${lines[i]}</span>`];
					
					lines[i] = this.get_text(["b", "j"].concat(words));
					
					
					
					while (words[0] !== "!end-example")
					{
						i += 2;
						
						
						
						if (lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$")
						{
							if (lines[i - 2].slice(lines[i - 2].length - 4) === "<br>")
							{
								lines[i - 2] = lines[i - 2].slice(0, lines[i - 2].length - 4);
							}
							
							lines[i] = `<p class="body-text">$$`;
						
							i++;
							
							while (!(lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$"))
							{
								i++;
							}
							
							lines[i] = `$$</p>`;
							
							continue;
						}
						
						
						
						words = lines[i].split(" ");
						
						lines[i] = this.get_text(["b", "j"].concat(words));
					}
					
					
					
					lines[i] = `</div>`;
				}
				
				
				
				else if (words[0] === "!begin-prop")
				{
					lines[i] = `<div class="notes-prop notes-environment">`;
					
					i += 2;
					
					words = [`<span class="notes-prop-title">Proposition: ${lines[i]}</span>`];
					
					lines[i] = this.get_text(["b", "j"].concat(words));
					
					
					
					while (words[0] !== "!end-prop")
					{
						i += 2;
						
						
						
						if (lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$")
						{
							if (lines[i - 2].slice(lines[i - 2].length - 4) === "<br>")
							{
								lines[i - 2] = lines[i - 2].slice(0, lines[i - 2].length - 4);
							}
							
							lines[i] = `<p class="body-text">$$`;
						
							i++;
							
							while (!(lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$"))
							{
								i++;
							}
							
							lines[i] = `$$</p>`;
							
							continue;
						}
						
						
						
						words = lines[i].split(" ");
						
						lines[i] = this.get_text(["b", "j"].concat(words));
					}
					
					
					
					lines[i] = `</div>`;
				}
				
				
				
				else if (words[0] === "!begin-thm")
				{
					lines[i] = `<div class="notes-thm notes-environment">`;
					
					i += 2;
					
					if (lines[i].toLowerCase().includes("theorem"))
					{
						lines[i] = lines[i][0].toUpperCase() + lines[i].slice(1);
						
						words = [`<span class="notes-thm-title">${lines[i]}</span>`];
					}
					
					else
					{
						words = [`<span class="notes-thm-title">Theorem: ${lines[i]}</span>`];
					}
					
					lines[i] = this.get_text(["b", "j"].concat(words));
					
					
					
					while (words[0] !== "!end-thm")
					{
						i += 2;
						
						
						
						if (lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$")
						{
							if (lines[i - 2].slice(lines[i - 2].length - 4) === "<br>")
							{
								lines[i - 2] = lines[i - 2].slice(0, lines[i - 2].length - 4);
							}
							
							lines[i] = `<p class="body-text">$$`;
						
							i++;
							
							while (!(lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$"))
							{
								i++;
							}
							
							lines[i] = `$$</p>`;
							
							continue;
						}
						
						
						
						words = lines[i].split(" ");
						
						lines[i] = this.get_text(["b", "j"].concat(words));
					}
					
					
					
					lines[i] = `</div>`;
				}
				
				
				
				else if (words[0] === "!begin-proof")
				{
					lines[i] = `<div class="notes-proof notes-environment"><p class="body-text"><span class="notes-proof-title">Proof</span></p><p></p><br>`;
					
					
					
					while (words[0] !== "!end-proof")
					{
						i += 2;
						
						
						
						if (lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$")
						{
							if (lines[i - 2].slice(lines[i - 2].length - 4) === "<br>")
							{
								lines[i - 2] = lines[i - 2].slice(0, lines[i - 2].length - 4);
							}
							
							lines[i] = `<p class="body-text">$$`;
						
							i++;
							
							while (!(lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$"))
							{
								i++;
							}
							
							lines[i] = `$$</p>`;
							
							continue;
						}
						
						
						
						words = lines[i].split(" ");
						
						lines[i] = this.get_text(["b", "j"].concat(words));
					}
					
					
					
					lines[i] = `</div>`;
				}
				
				
				
				else if (words[0] === "!begin-cor")
				{
					lines[i] = `<div class="notes-cor notes-environment">`;
					
					i += 2;
					
					words = [`<span class="notes-cor-title">Corollary: ${lines[i]}</span>`];
					
					lines[i] = this.get_text(["b", "j"].concat(words));
					
					
					
					while (words[0] !== "!end-cor")
					{
						i += 2;
						
						
						
						if (lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$")
						{
							if (lines[i - 2].slice(lines[i - 2].length - 4) === "<br>")
							{
								lines[i - 2] = lines[i - 2].slice(0, lines[i - 2].length - 4);
							}
							
							lines[i] = `<p class="body-text">$$`;
						
							i++;
							
							while (!(lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$"))
							{
								i++;
							}
							
							lines[i] = `$$</p>`;
							
							continue;
						}
						
						
						
						words = lines[i].split(" ");
						
						lines[i] = this.get_text(["b", "j"].concat(words));
					}
					
					
					
					lines[i] = `</div>`;
				}
				
				
				
				else if (words[0] === "!begin-lemma")
				{
					lines[i] = `<div class="notes-lemma notes-environment">`;
					
					i += 2;
					
					words = [`<span class="notes-lemma-title">Lemma: ${lines[i]}</span>`];
					
					lines[i] = this.get_text(["b", "j"].concat(words));
					
					
					
					while (words[0] !== "!end-lemma")
					{
						i += 2;
						
						
						
						if (lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$")
						{
							if (lines[i - 2].slice(lines[i - 2].length - 4) === "<br>")
							{
								lines[i - 2] = lines[i - 2].slice(0, lines[i - 2].length - 4);
							}
							
							lines[i] = `<p class="body-text">$$`;
						
							i++;
							
							while (!(lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$"))
							{
								i++;
							}
							
							lines[i] = `$$</p>`;
							
							continue;
						}
						
						
						
						words = lines[i].split(" ");
						
						lines[i] = this.get_text(["b", "j"].concat(words));
					}
					
					
					
					lines[i] = `</div>`;
				}
				
				
				
				else if (words[0] === "!begin-axiom")
				{
					lines[i] = `<div class="notes-axiom notes-environment">`;
					
					i += 2;
					
					words = [`<span class="notes-axiom-title">Axiom: ${lines[i]}</span>`];
					
					lines[i] = this.get_text(["b", "j"].concat(words));
					
					
					
					while (words[0] !== "!end-axiom")
					{
						i += 2;
						
						
						
						if (lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$")
						{
							if (lines[i - 2].slice(lines[i - 2].length - 4) === "<br>")
							{
								lines[i - 2] = lines[i - 2].slice(0, lines[i - 2].length - 4);
							}
							
							lines[i] = `<p class="body-text">$$`;
						
							i++;
							
							while (!(lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$"))
							{
								i++;
							}
							
							lines[i] = `$$</p>`;
							
							continue;
						}
						
						
						
						words = lines[i].split(" ");
						
						lines[i] = this.get_text(["b", "j"].concat(words));
					}
					
					
					
					lines[i] = `</div>`;
				}
				
				
				
				else if (words[0] === "!begin-exercise")
				{
					lines[i] = `<div class="notes-exercise notes-environment">`;
					
					i += 2;
					
					words = [`<span class="notes-exercise-title">Exercise: ${lines[i]}</span>`];
					
					lines[i] = this.get_text(["b", "j"].concat(words));
					
					
					
					while (words[0] !== "!end-exercise")
					{
						i += 2;
						
						
						
						if (lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$")
						{
							if (lines[i - 2].slice(lines[i - 2].length - 4) === "<br>")
							{
								lines[i - 2] = lines[i - 2].slice(0, lines[i - 2].length - 4);
							}
							
							lines[i] = `<p class="body-text">$$`;
						
							i++;
							
							while (!(lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$"))
							{
								i++;
							}
							
							lines[i] = `$$</p>`;
							
							continue;
						}
						
						
						
						words = lines[i].split(" ");
						
						lines[i] = this.get_text(["b", "j"].concat(words));
					}
					
					
					
					lines[i] = `</div>`;
				}
				
				
				
				else if (words[0] === "!checkbox")
				{
					lines[i] = this.get_checkbox(words.slice(1));
				}
				
				
				
				else if (words[0] === "!radio-button")
				{
					lines[i] = this.get_radio_button(words.slice(1));
				}
				
				
				
				else if (words[0] === "!canvas")
				{
					lines[i] = this.get_canvas();
				}
				
				
				
				else if (words[0] === "!iframe")
				{
					lines[i] = this.get_iframe(words[1]);
				}
				
				
				
				else if (words[0] === "!desmos")
				{
					lines[i] = this.get_desmos(words[1]);
				}
				
				
				
				else if (words[0] === "!line-break")
				{
					lines[i] = this.get_line_break();
				}
				
				
				
				else if (words[0] === "!nav-buttons")
				{
					lines[i] = this.get_nav_buttons();
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
		
		return html;
	}
};