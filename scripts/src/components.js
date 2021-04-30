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
							<img src="/graphics/general-icons/logo.png" alt="Logo" onclick="Page.Navigation.redirect('/home/home.html')" tabindex="1"></img>
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
		
		if (new_aos_section)
		{
			aos_section_segment = ` class="new-aos-section"`;
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
		
		
		
		return `
			<div class="image-link${light_text}" data-aos="fade-up">
				<a href="${file_path}" tabindex="-1">
					<img data-image-id="${id}" class="check-webp no-floating-footer" onclick="Page.Navigation.redirect('${file_path}')" src="" alt="${subtext}" tabindex="1"></img>
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
				<input id="${id}-input" class="text-box no-floating-footer" type="text" value="${value}" tabindex="1">
				<label for="${id}-input">
					<p class="body-text">${text}</p>
				</label>
			</div>
		`;
	},
	
	
	
	get_text_button: function(args, first)
	{
		let id = args[0];
		
		let text = args.slice(1).join(" ");
		
		
		
		let linked_string = "";
		
		if (args[1] === "l")
		{
			linked_string = " linked-text-button";
			
			text = args.slice(2).join(" ");
		}
		
		
		
		let delay_string = "";
		
		if (first)
		{
			delay_string = ` data-aos-delay-increase="500"`;
		}
		
		
		
		return `
			<div class="focus-on-child" data-aos="zoom-out"${delay_string} tabindex="1">
				<button class="text-button${linked_string} no-floating-footer" type="button" id="${id}-button" tabindex="-1">${text}</button>
			</div>
		`;
	},
	
	
	
	get_checkbox: function(args)
	{
		let id = args[0];
		
		let text = args.slice(1).join(" ");
		
		
		
		return `
			<div class="checkbox-row">
				<div data-aos="zoom-out">
					<div class="checkbox-container click-on-child" tabindex="1">
						<input type="checkbox" id="${id}-checkbox" class="no-floating-footer">
						<div class="checkbox no-floating-footer"></div>
					</div>
				</div>
				
				<div style="margin-left: 10px" data-aos="fade-left">
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
				<div data-aos="zoom-out">
					<div class="radio-button-container click-on-child" tabindex="1">
						<input type="radio" name="${name}" id="${id}-radio-button" class="no-floating-footer">
						<div class="radio-button no-floating-footer"></div>
					</div>
				</div>
				
				<div style="margin-left: 10px" data-aos="fade-left">
					<p class="body-text">${text}</p>
				</div>
			</div>
		`;
	},
	
	
	
	get_canvas: function()
	{
		return `
			<div class="center-content applet-canvas-container" data-aos="fade-in" data-aos-delay-increase="500">
				<canvas id="output-canvas" class="no-floating-footer"></canvas>
			</div>

			<div class="center-content" data-aos="fade-in">
				<div id="fullscreen-message">
					<p class="body-text">Double-click canvas to enter fullscreen</p>
				</div>
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
					
					i += 2;
					
					words = lines[i].split(" ");
					
					while (words[0] !== "!end-text-block")
					{
						lines[i] = this.get_text(["b", "j"].concat(words));
						
						i += 2;
						
						words = lines[i].split(" ");
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
					new_aos_section = true;
					
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
					lines[i] = this.get_canvas(words.slice(1));
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