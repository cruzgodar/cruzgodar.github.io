"use strict";



Page.Components =
{
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
	
	
	
	get_text: function(args)
	{
		let text = args.slice(2).join(" ");
		
		console.log(text);
		
		if (args[0] === "h")
		{
			return `
				<div data-aos="fade-up">
					<h1 class="section-text">
						${text}
					</h1>
				</div>
			`;
		}
		
		else if (args[0] === "s")
		{
			return `
				<div data-aos="fade-up">
					<h2 class="section-text">
						${text}
					</h2>
				</div>
			`;
		}
		
		else
		{
			//Only this one gets the line break at the end.
			if (args[1] === "j")
			{
				return `
					<div data-aos="fade-up">
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
					<div data-aos="fade-up">
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
		
		
		
		let lines = html.replace(/\t/g, "").replace(/    /g, "").replace(/\r/g, "").split("\n");
		
		
		
		for (let i = 0; i < lines.length; i++)
		{
			if (lines[i][0] === "!")
			{
				let words = lines[i].split(" ");
				
				lines[i] = commands[words[0]](words.slice(1));
			}
		}
		
		
		
		html = lines.join("\n");
		
		return html;
	}
};