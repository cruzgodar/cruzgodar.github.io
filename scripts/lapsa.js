class Lapsa
{
	target_element = null;
	
	
	
	slides = [];
	
	current_slide = -1;
	
	
	
	blockquotes = [];
	
	quote_level = -1;
	
	
	
	lists = [];
	
	list_level = -1;
	
	lists_are_ordered = [];
	
	current_list_is_ordered = true;
	
	
	
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
				
				.lapsa-slide p, .lapsa-slide blockquote, .lapsa-slide ol, .lapsa-slide ul
				{
					width: 90%;
					text-align: justify;
				}
				
				.lapsa-slide blockquote
				{
					width: calc(90% - 12px);
					
					border-width: 0 0 0 4px;
					border-color: rgb(64, 64, 64);
					border-style: solid;
					padding: 5px 0 5px 10px;
					
					background-color: rgba(127, 127, 127, .1);
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
		
		lines.push("");
		
		this.create_slide();
		
		
		
		for (let i = 0; i < num_lines; i++)
		{
			let line = lines[i];
			
			if (line.length === 0)
			{
				continue;
			}
			
			
			
			
			
			let num_indents = 0;
			
			line = line.replace(/    /g, "\t");
			
			while (line[0] === "\t")
			{
				num_indents++;
				
				line = line.slice(1);
			}
			
			line = this.trim_leading_whitespace(line);
			
			
			
			
			
			//Blockquotes
			let num_carets = 0;
			
			while (line[num_carets] === ">")
			{
				num_carets++;
			}
			
			if (num_carets - 1 > this.quote_level)
			{
				let num_blockquotes_to_add = num_carets - this.quote_level;
				
				for (let j = 0; j < num_blockquotes_to_add; j++)
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
			
			line = line.slice(this.quote_level + 1);
			
			
			
			
			
			//Ordered lists
			let period_index = line.indexOf(".");
			
			if (period_index > 0 && line[period_index - 1] !== "\\")
			{
				let j = 0;
				
				while (line[j] >= "0" && line[j] <= "9")
				{
					j++;
				}
				
				if (j === period_index)
				{
					if (num_indents > this.list_level)
					{
						let num_lists_to_add = num_indents - this.list_level;
						
						for (let k = 0; k < num_lists_to_add; k++)
						{
							this.add_list(true);
						}
					}
					
					else if (num_indents < this.list_level)
					{
						this.list_level = num_indents;
						
						this.target_element = this.lists[this.list_level];
						
						this.current_list_is_ordered = this.lists_are_ordered[this.list_level];
						
						if (!this.current_list_is_ordered)
						{
							//Back out of the current list and start a new one.
							this.list_level = num_indents - 1;
							
							if (this.list_level === -1)
							{
								this.target_element = this.slides[this.current_slide];
							}
							
							else
							{
								this.target_element = this.lists[this.list_level];
								
								this.current_list_is_ordered = this.lists_are_ordered[this.list_level];
							}
							
							this.add_list(true);
						}
					}
					
					else if (!this.current_list_is_ordered)
					{
						//Back out of the current list and start a new one.
						this.list_level = num_indents - 1;
						
						if (this.list_level === -1)
						{
							this.target_element = this.slides[this.current_slide];
						}
						
						else
						{
							this.target_element = this.lists[this.list_level];
							
							this.current_list_is_ordered = this.lists_are_ordered[this.list_level];
						}
						
						this.add_list(true);
					}
					
					
					
					let text = this.trim_leading_whitespace(line.slice(period_index + 1));
					this.add_text("li", text);
					
					continue;
				}
			}
			
			
			
			//Unordered lists
			else if ((line[0] === "-" || line[0] === "*" || line[0] === "+") && line.length >= 2 && line[1] === " ")
			{
				if (num_indents > this.list_level)
				{
					let num_lists_to_add = num_indents - this.list_level;
					
					for (let k = 0; k < num_lists_to_add; k++)
					{
						this.add_list(false);
					}
				}
				
				else if (num_indents < this.list_level)
				{
					this.list_level = num_indents;
					
					this.target_element = this.lists[this.list_level];
					
					this.current_list_is_ordered = this.lists_are_ordered[this.list_level];
					
					if (this.current_list_is_ordered)
					{
						//Back out of the current list and start a new one.
						this.list_level = num_indents - 1;
						
						if (this.list_level === -1)
						{
							this.target_element = this.slides[this.current_slide];
						}
						
						else
						{
							this.target_element = this.lists[this.list_level];
							
							this.current_list_is_ordered = this.lists_are_ordered[this.list_level];
						}
						
						this.add_list(false);
					}
				}
				
				else if (this.current_list_is_ordered)
				{
					//Back out of the current list and start a new one.
					this.list_level = num_indents - 1;
					
					if (this.list_level === -1)
					{
						this.target_element = this.slides[this.current_slide];
					}
					
					else
					{
						this.target_element = this.lists[this.list_level];
						
						this.current_list_is_ordered = this.lists_are_ordered[this.list_level];
					}
					
					this.add_list(false);
				}
				
				
				
				let text = this.trim_leading_whitespace(line.slice(1));
				this.add_text("li", text);
				
				continue;
			}
				
			this.target_element = this.slides[this.current_slide];
			
			
			
			
			//Headings
			if (line[0] === "#")
			{
				let num_hashes = 1;
				
				while (line[num_hashes] === "#")
				{
					num_hashes++;
				}
				
				this.add_text(`h${num_hashes}`, line.slice(num_hashes));
			}
			
			
			
			
			
			else if (lines[i + 1][0] === "=" && lines[i + 1][1] === "=")
			{
				this.add_text("h1", line);
				
				i++;
			}
			
			else if (lines[i + 1][0] === "-" && lines[i + 1][1] === "-")
			{
				this.add_text("h2", line);
				
				i++;
			}
			
			
			
			else
			{
				this.add_text("p", line);
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
	
	
	
	add_list(ordered)
	{
		let element = null;
		
		if (ordered)
		{
			element = document.createElement("ol");
		}
		
		else
		{
			element = document.createElement("ul");
		}
		
		
		
		this.current_list_is_ordered = ordered;
		
		
		
		this.list_level++;
		
		if (this.list_level < this.lists.length - 1)
		{
			this.lists[this.list_level] = element;
			
			this.lists_are_ordered[this.list_level] = ordered;
		}
		
		else
		{
			this.lists.push(element);
			
			this.lists_are_ordered.push(ordered);
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