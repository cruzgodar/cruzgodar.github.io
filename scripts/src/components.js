"use strict";



Page.Components =
{
	need_new_aos_section: false,
	
	
	
	get_header: function(args, banner)
	{
		let title = args.join(" ");
		
		let height_adjust = "";
		
		if (banner)
		{
			height_adjust = ` style="margin-bottom: 10vh"`;
		}
		
		
		
		return `
			<header${height_adjust}>
				<div class="new-aos-section" data-aos="fade-in">
					<div id="logo">
						<a href="/home/home.html" tabindex="-1">
							<img src="/graphics/general-icons/logo.png" alt="Logo" tabindex="1"></img>
						</a>
					</div>
				</div>
				
				<div style="height: 2vh"></div>
				
				<div data-aos="fade-up">
					<h1 class="heading-text">${title}</h1>
				</div>
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
					
					<footer>
						<div id="spawn-footer"></div>
					</footer>
				</div>
			`;
		}
		
		else
		{
			return `
					</section>
				</main>
				
				<footer>
					<div id="spawn-footer"></div>
				</footer>
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
	
	
	
	get_text: function(args, new_aos_section)
	{
		let aos_section_segment = "";
		
		if (this.need_new_aos_section)
		{
			aos_section_segment = ` class="new-aos-section"`;
			
			this.need_new_aos_section = false;
		}
		
		
		
		if (args[0] === "h")
		{
			let text = args.slice(1).join(" ");
			
			return `
				<div${aos_section_segment} data-aos="fade-up">
					<h1 class="heading-text">
						${text}
					</h1>
				</div>
			`;
		}
		
		else if (args[0] === "s")
		{
			let text = args.slice(1).join(" ");
			
			return `
				<div${aos_section_segment} data-aos="fade-up">
					<h2 class="section-text">
						${text}
					</h2>
				</div>
			`;
		}
		
		else
		{
			let text = args.slice(2).join(" ");
			
			//Only this one gets the line break at the end.
			if (args[1] === "j")
			{
				return `
					<div${aos_section_segment} data-aos="fade-up">
						<p class="body-text">
							${text}
						</p>
					</div>
					
					<br>
				`;
			}
			
			//Center if needed
			else
			{
				return `
					<div${aos_section_segment} data-aos="fade-up">
						<p class="body-text center-if-needed">
							<span>
								${text}
							</span>
						</p>
					</div>
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
		
		
		
		let src = `${file_path.slice(0, file_path.lastIndexOf("/") + 1)}cover.${Page.Images.file_extension}`;
		
		
		
		return `
			<div class="image-link${light_text}" data-aos="fade-up">
				<a href="${file_path}" tabindex="-1">
					<img data-image-id="${id}" src="${src}" alt="${subtext}" tabindex="1"></img>
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
		
		let numbers = args[0].split(".");
		
		if (numbers.length === 3)
		{
			version_string = "minor-version";
			version_text = "body-text";
		}
		
		else if (numbers[1] === "0")
		{
			version_string = "major-version";
			version_text = "heading-text";
		}
		
		
		
		let text = args.slice(1).join(" ");
		
		text = text.split(":");
		
		let description = text[1].slice(1);
		
		
		
		if (text.length === 3)
		{
			let datetime = text[2];
			
			text = text[0];
			
			let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
			
			let numbers = datetime.split("-");
			
			let year = parseInt(numbers[0]);
			
			let month = months[parseInt(numbers[1]) - 1];
			
			let day = parseInt(numbers[2]);
			
			
		
			return `
				<div class="${version_string}">
					<div class="new-aos-section" data-aos="fade-up">
						<h2 class="${version_text}">${args[0]}</h2>
					</div>
					
					<div data-aos="fade-up">
						<h2 class="${version_text}">${text}</h2>
					</div>
					
					<br>
					
					<div data-aos="fade-up">
						<p class="body-text center-if-needed"><span>${description}</span></p>
					</div>
					
					<br>
					
					<div data-aos="fade-up">
						<p class="body-text center-if-needed">
							<span>
								<time datetime="${datetime}">${month} ${day}, ${year}</time>
							</span>
						</p>
					</div>
				</div>
			`;
		}
		
		
		
		else
		{
			text = text[0];
			
			return `
				<div class="${version_string}">
					<div class="new-aos-section" data-aos="fade-up">
						<h2 class="${version_text}">${args[0]}</h2>
					</div>
					
					<div data-aos="fade-up">
						<h2 class="${version_text}">${text}</h2>
					</div>
					
					<br>
					
					<div data-aos="fade-up">
						<p class="body-text center-if-needed"><span>${description}</span></p>
					</div>
				</div>
			`;
		}
	},
	
	
	
	get_text_box: function(args)
	{
		let id = args[0];
		
		let value = args[1];
		
		let text = args.slice(2).join(" ");
		
		return `
			<div class="text-box-container" data-aos="fade-up">
				<input id="${id}-input" class="text-box" type="text" value="${value}" tabindex="1">
				<p class="body-text">${text}</p>
			</div>
		`;
	},
	
	
	
	get_text_button: function(args)
	{
		let id = args[0];
		
		let text = args.slice(1).join(" ");
		
		
		
		let linked_string = "";
		
		if (args[1] === "l")
		{
			linked_string = " linked-text-button";
			
			text = args.slice(2).join(" ");
		}
		
		
		
		return `
			<div class="focus-on-child" data-aos="fade-up" tabindex="1">
				<button class="text-button${linked_string}" type="button" id="${id}-button" tabindex="-1">${text}</button>
			</div>
		`;
	},
	
	
	
	get_checkbox: function(args)
	{
		let id = args[0];
		
		let text = args.slice(1).join(" ");
		
		
		
		return `
			<div class="checkbox-row">
				<div data-aos="fade-up">
					<div class="checkbox-container click-on-child" tabindex="1">
						<input type="checkbox" id="${id}-checkbox">
						<div class="checkbox"></div>
					</div>
				</div>
				
				<div style="margin-left: 10px" data-aos="fade-up">
					<p class="body-text">${text}</p>
				</div>
			</div>
		`;
	},
	
	
	
	get_radio_button: function(args)
	{
		let name = args[0];
		
		let id = args[1];
		
		let text = args.slice(2).join(" ");
		
		
		
		return `
			<div class="radio-button-row">
				<div data-aos="fade-up">
					<div class="radio-button-container click-on-child" tabindex="1">
						<input type="radio" name="${name}" id="${id}-radio-button">
						<div class="radio-button"></div>
					</div>
				</div>
				
				<div style="margin-left: 10px" data-aos="fade-up">
					<p class="body-text">${text}</p>
				</div>
			</div>
		`;
	},
	
	
	
	get_slider: function(args)
	{
		let id = args[0];
		
		let value = args[1];
		
		let text = args.slice(2).join(" ");
		
		return `
			<div class="slider-container" data-aos="fade-up">
				<input id="${id}-slider" type="range" min="0" max="10000" value="${value}" tabindex="1">
				<label for="${id}-slider">
					<p class="body-text">${text}: <span id="${id}-slider-value">0</span></p>
				</label>
			</div>
		`;
	},
	
	
	
	get_dropdown: function(args)
	{
		let html = "";
		
		let id = args[0];
		
		html += `<div class="focus-on-child" data-aos="fade-up" tabindex="1">
				<button class="text-button dropdown" type="button" id="${id}-dropdown-button" tabindex="-1">`;
		
		for (let i = 1; i < args.length; i++)
		{
			let value = args[i][0];
			let text = args[i].slice(1).join(" ");
			
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
			<div data-aos="fade-up">
				<canvas id="output-canvas" class="output-canvas"></canvas>
			</div>
		`;
	},
	
	
	
	get_iframe: function(src)
	{
		return `
			<div data-aos="fade-up" style="width: 100%; display: flex; justify-content: center">
				<iframe src="${src}" width="500" height="500"></iframe>
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
	
	
	
	decode: function(html)
	{
		let new_aos_section = false;
		
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
						
						
						
						if (lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$")
						{
							lines[i] = `<div data-aos="fade-up"><p class="body-text">$$`;
						
							i++;
							
							while (!(lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$"))
							{
								i++;
							}
							
							lines[i] = `$$</p></div>`;
							
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
					this.need_new_aos_section = true;
					
					lines[i] = this.get_section();
				}
				
				
				
				else if (words[0] === "!text")
				{
					lines[i] = this.get_text(words.slice(1), new_aos_section);
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
					lines[i] = `<div class="notes-def" data-aos="fade-in">`;
					
					i += 2;
					
					words = [`<span class="notes-def-title">Definition: ${lines[i]}</span>`];
					
					lines[i] = this.get_text(["b", "j"].concat(words));
					
					
					
					while (words[0] !== "!end-def")
					{
						i += 2;
						
						
						
						if (lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$")
						{
							lines[i] = `<div data-aos="fade-up"><p class="body-text">$$`;
						
							i++;
							
							while (!(lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$"))
							{
								i++;
							}
							
							lines[i] = `$$</p></div>`;
							
							continue;
						}
						
						
						
						words = lines[i].split(" ");
						
						lines[i] = this.get_text(["b", "j"].concat(words));
					}
					
					
					
					lines[i] = `</div>`;
				}
				
				
				
				else if (words[0] === "!begin-example")
				{
					lines[i] = `<div class="notes-example" data-aos="fade-in">`;
					
					i += 2;
					
					words = [`<span class="notes-example-title">Example: ${lines[i]}</span>`];
					
					lines[i] = this.get_text(["b", "j"].concat(words));
					
					
					
					while (words[0] !== "!end-example")
					{
						i += 2;
						
						
						
						if (lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$")
						{
							lines[i] = `<div data-aos="fade-up"><p class="body-text">$$`;
						
							i++;
							
							while (!(lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$"))
							{
								i++;
							}
							
							lines[i] = `$$</p></div>`;
							
							continue;
						}
						
						
						
						words = lines[i].split(" ");
						
						lines[i] = this.get_text(["b", "j"].concat(words));
					}
					
					
					
					lines[i] = `</div>`;
				}
				
				
				
				else if (words[0] === "!begin-prop")
				{
					lines[i] = `<div class="notes-prop" data-aos="fade-in">`;
					
					i += 2;
					
					words = [`<span class="notes-prop-title">Proposition: ${lines[i]}</span>`];
					
					lines[i] = this.get_text(["b", "j"].concat(words));
					
					
					
					while (words[0] !== "!end-prop")
					{
						i += 2;
						
						
						
						if (lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$")
						{
							lines[i] = `<div data-aos="fade-up"><p class="body-text">$$`;
						
							i++;
							
							while (!(lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$"))
							{
								i++;
							}
							
							lines[i] = `$$</p></div>`;
							
							continue;
						}
						
						
						
						words = lines[i].split(" ");
						
						lines[i] = this.get_text(["b", "j"].concat(words));
					}
					
					
					
					lines[i] = `</div>`;
				}
				
				
				
				else if (words[0] === "!begin-thm")
				{
					lines[i] = `<div class="notes-thm" data-aos="fade-in">`;
					
					i += 2;
					
					words = [`<span class="notes-thm-title">Theorem: ${lines[i]}</span>`];
					
					lines[i] = this.get_text(["b", "j"].concat(words));
					
					
					
					while (words[0] !== "!end-thm")
					{
						i += 2;
						
						
						
						if (lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$")
						{
							lines[i] = `<div data-aos="fade-up"><p class="body-text">$$`;
						
							i++;
							
							while (!(lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$"))
							{
								i++;
							}
							
							lines[i] = `$$</p></div>`;
							
							continue;
						}
						
						
						
						words = lines[i].split(" ");
						
						lines[i] = this.get_text(["b", "j"].concat(words));
					}
					
					
					
					lines[i] = `</div>`;
				}
				
				
				
				else if (words[0] === "!begin-proof")
				{
					lines[i] = `<div class="notes-proof" data-aos="fade-in"><span class="notes-proof-title">Proof</span>`;
					
					
					
					while (words[0] !== "!end-proof")
					{
						i += 2;
						
						
						
						if (lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$")
						{
							lines[i] = `<div data-aos="fade-up"><p class="body-text">$$`;
						
							i++;
							
							while (!(lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$"))
							{
								i++;
							}
							
							lines[i] = `$$</p></div>`;
							
							continue;
						}
						
						
						
						words = lines[i].split(" ");
						
						lines[i] = this.get_text(["b", "j"].concat(words));
					}
					
					
					
					lines[i] = `</div>`;
				}
				
				
				
				else if (words[0] === "!begin-comment")
				{
					lines[i] = `<div class="notes-comment" data-aos="fade-in"><span class="notes-comment-title">Comment</span><p></p><br>`;
					
					
					
					while (words[0] !== "!end-comment")
					{
						i += 2;
						
						
						
						if (lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$")
						{
							lines[i] = `<div data-aos="fade-up"><p class="body-text">$$`;
						
							i++;
							
							while (!(lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$"))
							{
								i++;
							}
							
							lines[i] = `$$</p></div>`;
							
							continue;
						}
						
						
						
						words = lines[i].split(" ");
						
						lines[i] = this.get_text(["b", "j"].concat(words));
					}
					
					
					
					lines[i] = `</div>`;
				}
				
				
				
				else if (words[0] === "!begin-cor")
				{
					lines[i] = `<div class="notes-cor" data-aos="fade-in">`;
					
					i += 2;
					
					words = [`<span class="notes-cor-title">Corollary: ${lines[i]}</span>`];
					
					lines[i] = this.get_text(["b", "j"].concat(words));
					
					
					
					while (words[0] !== "!end-cor")
					{
						i += 2;
						
						
						
						if (lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$")
						{
							lines[i] = `<div data-aos="fade-up"><p class="body-text">$$`;
						
							i++;
							
							while (!(lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$"))
							{
								i++;
							}
							
							lines[i] = `$$</p></div>`;
							
							continue;
						}
						
						
						
						words = lines[i].split(" ");
						
						lines[i] = this.get_text(["b", "j"].concat(words));
					}
					
					
					
					lines[i] = `</div>`;
				}
				
				
				
				else if (words[0] === "!begin-lemma")
				{
					lines[i] = `<div class="notes-lemma" data-aos="fade-in">`;
					
					i += 2;
					
					words = [`<span class="notes-lemma-title">Lemma: ${lines[i]}</span>`];
					
					lines[i] = this.get_text(["b", "j"].concat(words));
					
					
					
					while (words[0] !== "!end-lemma")
					{
						i += 2;
						
						
						
						if (lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$")
						{
							lines[i] = `<div data-aos="fade-up"><p class="body-text">$$`;
						
							i++;
							
							while (!(lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$"))
							{
								i++;
							}
							
							lines[i] = `$$</p></div>`;
							
							continue;
						}
						
						
						
						words = lines[i].split(" ");
						
						lines[i] = this.get_text(["b", "j"].concat(words));
					}
					
					
					
					lines[i] = `</div>`;
				}
				
				
				
				else if (words[0] === "!begin-axiom")
				{
					lines[i] = `<div class="notes-axiom" data-aos="fade-in">`;
					
					i += 2;
					
					words = [`<span class="notes-axiom-title">Axiom: ${lines[i]}</span>`];
					
					lines[i] = this.get_text(["b", "j"].concat(words));
					
					
					
					while (words[0] !== "!end-axiom")
					{
						i += 2;
						
						
						
						if (lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$")
						{
							lines[i] = `<div data-aos="fade-up"><p class="body-text">$$`;
						
							i++;
							
							while (!(lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$"))
							{
								i++;
							}
							
							lines[i] = `$$</p></div>`;
							
							continue;
						}
						
						
						
						words = lines[i].split(" ");
						
						lines[i] = this.get_text(["b", "j"].concat(words));
					}
					
					
					
					lines[i] = `</div>`;
				}
				
				
				
				else if (words[0] === "!begin-exercise")
				{
					lines[i] = `<div class="notes-exercise" data-aos="fade-in">`;
					
					i += 2;
					
					words = [`<span class="notes-exercise-title">Exercise: ${lines[i]}</span>`];
					
					lines[i] = this.get_text(["b", "j"].concat(words));
					
					
					
					while (words[0] !== "!end-exercise")
					{
						i += 2;
						
						
						
						if (lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$")
						{
							lines[i] = `<div data-aos="fade-up"><p class="body-text">$$`;
						
							i++;
							
							while (!(lines[i].length === 2 && lines[i][0] === "$" && lines[i][1] === "$"))
							{
								i++;
							}
							
							lines[i] = `$$</p></div>`;
							
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
					lines[i] = this.get_iframe(words.slice(1));
				}
				
				
				
				else if (words[0] === "!line-break")
				{
					lines[i] = this.get_line_break();
				}
			}
		}
		
		
		
		html = lines.join("\n");
		
		return html;
	}
};