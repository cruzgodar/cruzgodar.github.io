class Lapsa
{
	slides = [];
	
	current_slide = -1;
	
	target_element = null;
	
	blockquotes = [];
	
	quote_level = -1;
	
	
	
	constructor(source, options)
	{
		if (document.querySelectorAll("#lapsa-style").length === 0)
		{
			let element = document.createElement("style");
			
			element.textContent = `
				.lapsa-container
				{
					position: fixed;
					width: 100vw;
					height: 100vh;
					
					display: flex;
					
					justify-content: center;
					align-items: center;
					
					background-color: rgb(0, 0, 0);
					
					z-index: 1000000;
				}
				
				.lapsa-slide
				{
					width: 100vw;
					height: calc(100vw * 9 / 16);
					
					display: flex;
					
					flex-direction: column;
					
					justify-content: center;
					align-items: center;
					
					background-color: rgb(255, 255, 255);
				}
				
				.lapsa-slide p, .lapsa-slide blockquote
				{
					width: 90%;
					text-align: justify;
				}
				
				.lapsa-slide blockquote
				{
					width: calc(90% - 12px);
					border-width: 0 0 0 2px;
					padding: 5px 0 5px 10px;
					border-color: rgb(0, 0, 0);
					border-style: solid;
				}
				
				@media (min-aspect-ratio: 16/9)
				{				
					.lapsa-slide
					{
						width: calc(100vh * 16 / 9);
						height: 100vh;
					}
				}
			`;
			
			element.id = "lapsa-style";
			
			document.head.appendChild(element);
		}
		
		
		
		if (document.querySelectorAll("#lapsa-body-freeze").length === 0)
		{
			let element = document.createElement("style");
			
			element.textContent = `
				body
				{
					width: 100%;
					height: 100%;
				}
			`;
			
			element.id = "lapsa-body-freeze";
			
			document.head.appendChild(element);
			
			
			
			document.documentElement.style.overflowY = "hidden";
			document.body.style.overflowY = "hidden";
		}
		
		
		
		this.container = document.createElement("div")
		
		this.container.classList.add("lapsa-container");
		
		document.body.appendChild(this.container);
		
		
		
		let lines = source.replace(/\r/g, "").split("\n");
		
		let num_lines = lines.length;
		
		this.create_slide();
		
		
		
		for (let i = 0; i < num_lines; i++)
		{
			let line = lines[i];
			
			if (line.length === 0)
			{
				continue;
			}
			
			
			let num_carets = 0;
			
			while (line[num_carets] === ">")
			{
				num_carets++;
			}
			
			if (num_carets - 1 > this.quote_level)
			{
				for (let j = 0; j < num_carets - this.quote_level; j++)
				{
					this.add_blockquote();
				}
			}
			
			else if (num_carets - 1 < this.quote_level)
			{
				this.quote_level = num_carets - 1;
				
				if (this.quote_level === -1)
				{
					this.target_element = this.slides[this.current_slide];
				}
				
				else
				{
					this.target_element = this.blockquotes[this.quote_level];
				}
			}
			
			console.log(this.quote_level);
			
			line = line.slice(this.quote_level + 1);
			
			
			
			if (line[0] === "#")
			{
				let num_hashes = 1;
				
				while (line[num_hashes] === "#")
				{
					num_hashes++;
				}
				
				this.add_text(`h${num_hashes}`, this.trim_leading_whitespace(line.slice(num_hashes)));
			}
			
			
			
			else
			{
				this.add_text("p", this.trim_leading_whitespace(line));
			}
		}
	}
	
	
	
	create_slide()
	{
		let slide = document.createElement("div")
		
		slide.classList.add("lapsa-slide");
		
		this.container.appendChild(slide);
		
		
		
		this.slides.push(slide);
		
		this.current_slide++;
		
		this.target_element = slide;
	}
	
	
	
	//tag_name: p, h1, h2, etc.
	add_text(tag_name, text)
	{
		let element = document.createElement(tag_name);
		
		element.textContent = text;
		
		this.target_element.appendChild(element);
	}
	
	
	
	add_blockquote()
	{
		let element = document.createElement("blockquote");
		
		this.quote_level++;
		
		if (this.quote_level < this.blockquotes.length - 1)
		{
			this.blockquotes[this.quote_level] = element;
		}
		
		else
		{
			this.blockquotes.push(element);
		}
		
		this.target_element.appendChild(element);
		
		this.target_element = element;
	}
	
	
	
	trim_leading_whitespace(text)
	{
		let start_index = 0;
		
		while (text[start_index] === " " || text[start_index] === "\t")
		{
			start_index++;
		}
		
		return text.slice(start_index);
	}
};