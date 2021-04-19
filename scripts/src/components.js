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
	
	
	
	decode: function(html)
	{
		const commands =
		{
			"!header": Page.Components.get_header
		};
		
		
		
		let lines = html.replace(/\t/g, "").replace(/    /g, "").split("\n");
		
		
		
		for (let i = 0; i < lines.length; i++)
		{
			if (lines[i][0] === "!")
			{
				if (lines[i].indexOf(";") === -1)
				{
					console.error(`Missing semicolon on line ${i}!`);
				}
				
				let command = lines[i].split(";")[0].split(" ");
				
				let component = commands[command[0]](command.slice(1));
				
				lines[i] = component;
			}
		}
		
		
		
		html = lines.join("\n");
		
		return html;
	}
};