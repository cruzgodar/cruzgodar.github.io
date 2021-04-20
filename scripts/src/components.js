"use strict";



Page.Components =
{
	need_new_aos_section: false,
	
	
	
	get_header: function(args)
	{
		let title = args.join(" ");
		
		return `
			<header>
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
				
				
				
			<div style="height: 5vh"></div>
		`;
	},
	
	
	
	get_footer: function(args)
	{
		return `
			<footer>
				<div id="spawn-footer"></div>
			</footer>
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
					<h1 class="section-text">
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
	
	
	
	decode: function(html)
	{
		const commands =
		{
			"!header": Page.Components.get_header,
			"!footer": Page.Components.get_footer,
			"!text": Page.Components.get_text
		};
		
		let new_aos_section = false;
		
		
		
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
				
				
				
				else if (words[0] === "!section")
				{
					new_aos_section = true;
					
					lines[i] = "";
				}
				
				
				
				else if (words[0] === "!text")
				{
					lines[i] = this.get_text(words.slice(1), new_aos_section);
				}
				
				
				
				else
				{
					lines[i] = commands[words[0]](words.slice(1));
				}
			}
		}
		
		
		
		html = lines.join("\n");
		
		return html;
	}
};