class Lapsa
{
	target_element = null;
	
	
	
	slides = [];
	
	current_slide = -1;
	
	
	
	/*
		container format:
		{
			element: the html element
			
			parent: its parent element
			
			type: one of the capital types defined below
			
			quote_depth: if it's a quote, this says how many carets to expect.
			
			list_depth: if it's a list, this says how many indents to expect.
		}
	*/
	
	SLIDE = 0;
	BLOCKQUOTE = 1;
	ORDERED_LIST = 2;
	UNORDERED_LIST = 3;
	
	
	
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
					
					font-size: 1.5vw;
				}
				
				.lapsa-slide p, .lapsa-slide blockquote, .lapsa-slide ol, .lapsa-slide ul, .lapsa-slide code
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
				
				.lapsa-slide .lapsa-hline
				{
					width: 95%;
					height: 1px;
					
					background-color: rgb(127, 127, 127);
					
					margin: 5px;
				}
				
				@media (min-aspect-ratio: 16/9)
				{				
					.lapsa-slide
					{
						width: calc(100vh * 16 / 9);
						height: 100vh;
						
						font-size: 1.5vh;
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
		
		
		
		this.current_container = {element: this.slides[0], parent: null, type: this.SLIDE, quote_depth: 0, list_depth: 0};
		
		
		
		for (let i = 0; i < num_lines; i++)
		{
			let line = lines[i];
			let num_indents = 0;
			
			[line, num_indents] = this.clean_line(line);
			
			
			
			
			
			//Blockquotes
			let num_carets = 0;
			
			while (line[num_carets] === ">")
			{
				num_carets++;
			}
			
			if (num_carets > this.current_container.quote_depth)
			{
				let num_blockquotes_to_add = num_carets - this.current_container.quote_depth;
				
				for (let j = 0; j < num_blockquotes_to_add; j++)
				{
					this.add_blockquote();
				}
			}
			
			else if (num_carets < this.current_container.quote_depth)
			{
				while (this.current_container.quote_depth > num_carets)
				{
					this.current_container = this.current_container.parent;
				}
			}
			
			line = line.slice(num_carets);
			
			
			
			
			
			if (num_carets !== 0)
			{
				[line, num_indents] = this.clean_line(line);
			}
			
			if (line.length === 0)
			{
				continue;
			}
			
			
			
			
			
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
					if (num_indents + 1 > this.current_container.list_depth)
					{
						let num_lists_to_add = num_indents + 1 - this.current_container.list_depth;
						
						for (let k = 0; k < num_lists_to_add; k++)
						{
							this.add_list(true);
						}
					}
					
					else if (num_indents + 1 < this.current_container.list_depth)
					{
						while (this.current_container.list_depth > num_indents + 1)
						{
							this.current_container = this.current_container.parent;
						}
						
						
						if (this.current_container.type === this.UNORDERED_LIST)
						{
							//Back out of the current list and start a new one.
							this.current_container = this.current_container.parent;
							
							this.add_list(true);
						}
					}
					
					else if (this.current_container.type === this.UNORDERED_LIST)
					{
						//Back out of the current list and start a new one.
						this.current_container = this.current_container.parent;
						
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
				if (num_indents + 1 > this.current_container.list_depth)
				{
					let num_lists_to_add = num_indents + 1 - this.current_container.list_depth;
					
					for (let k = 0; k < num_lists_to_add; k++)
					{
						this.add_list(false);
					}
				}
				
				else if (num_indents + 1 < this.current_container.list_depth)
				{
					while (this.current_container.list_depth > num_indents + 1)
					{
						this.current_container = this.current_container.parent;
					}
					
					
					if (this.current_container.type === this.ORDERED_LIST)
					{
						//Back out of the current list and start a new one.
						this.current_container = this.current_container.parent;
						
						this.add_list(false);
					}
				}
				
				else if (this.current_container.type === this.ORDERED_LIST)
				{
					//Back out of the current list and start a new one.
					this.current_container = this.current_container.parent;
					
					this.add_list(false);
				}
				
				
				
				let text = this.trim_leading_whitespace(line.slice(1));
				this.add_text("li", text);
				
				continue;
			}
			
			
			
			if (num_indents < this.current_container.list_depth)
			{
				while (this.current_container.list_depth > num_indents)
				{
					this.current_container = this.current_container.parent;
				}
			}
			
			
			
			
			
			//Code blocks
			if ((this.current_container.list_depth === 0 && num_indents > 0) || (this.current_container.list_depth > 0 && num_indents > this.current_container.list_depth))
			{
				this.add_text("code", line);
				
				continue;
			}
			
			
			
			//Horizontal lines
			if (line[0] === "-" || line[0] === "_" || line[0] === "*")
			{
				let token = line[0];
				
				if (line[1] === token && line[2] === token)
				{
					let success = true;
					
					for (let i = 3; i < line.length; i++)
					{
						if (line[i] !== token)
						{
							success = false;
							
							break;
						}
					}
					
					if (success)
					{
						this.add_hline();
						
						continue;
					}
					
				}
			}
			
			
			
			
			
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
	}
	
	
	
	//tag_name: p, h1, h2, etc.
	add_text(tag_name, text)
	{
		let new_element = document.createElement(tag_name);
		
		new_element.textContent = text;
		
		this.current_container.element.appendChild(new_element);
	}
	
	
	
	add_blockquote()
	{
		let new_element = document.createElement("blockquote");
		
		this.current_container.element.appendChild(new_element);
		
		this.current_container = {element: new_element, parent: this.current_container, type: this.BLOCKQUOTE, quote_depth: this.current_container.quote_depth + 1, list_depth: this.current_container.list_depth};
	}
	
	
	
	add_list(ordered)
	{
		if (ordered)
		{
			let new_element = document.createElement("ol");
			
			this.current_container.element.appendChild(new_element);
			
			this.current_container = {element: new_element, parent: this.current_container, type: this.ORDERED_LIST, quote_depth: this.current_container.quote_depth, list_depth: this.current_container.list_depth + 1};
		}
		
		else
		{
			let new_element = document.createElement("ul");
			
			this.current_container.element.appendChild(new_element);
			
			this.current_container = {element: new_element, parent: this.current_container, type: this.UNORDERED_LIST, quote_depth: this.current_container.quote_depth, list_depth: this.current_container.list_depth + 1};
		}
	}
	
	
	
	add_hline()
	{
		let new_element = document.createElement("div");
		
		new_element.classList.add("lapsa-hline");
		
		this.current_container.element.appendChild(new_element);
	}
	
	
	
	clean_line(text)
	{
		let num_indents = 0;
		
		text = text.replace(/    /g, "\t");
		
		while (text[0] === "\t")
		{
			num_indents++;
			
			text = text.slice(1);
		}
		
		text = this.trim_leading_whitespace(text);
		
		return [text, num_indents];
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