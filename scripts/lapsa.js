class Lapsa
{
	target_element = null;
	
	
	
	slides = [];
	
	current_slide = -1;
	
	last_element = null;
	
	reference_links = {};
	
	
	
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
	
	escape_tokens = ["\\", "`", "*", "_", "{", "}", "[", "]", "<", ">", "(", ")", "#", "+", "-", ".", "!"];
	escape_indices = {"\\": "00", "`": "01", "*": "02", "_": "03", "{": "04", "}": "05", "[": "06", "]": "07", "<": "08", ">": "09", "(": "10", ")": "11", "#": "12", "+": "13", "-": "14", ".": "15", "!": "16"};
	
	
	
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
				
				.lapsa-slide p, .lapsa-slide blockquote, .lapsa-slide ol, .lapsa-slide ul, .lapsa-slide pre
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
				
				.lapsa-slide pre code
				{
					tab-size: 4;
					-moz-tab-size: 4;
					-o-tab-size: 4;
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
		
		let need_new_paragraph = true;
		
		
		
		
		
		//Find link references before anything else.
		for (let i = 0; i < lines.length; i++)
		{
			let line = lines[i];
			let num_indents = 0;
			
			[line, num_indents] = this.clean_line(line);
			
			if (line[0] === "[")
			{
				line += " ";
				
				let index = line.indexOf("]");
				
				if (index !== -1 && line[index + 1] === ":")
				{
					let var_name = line.slice(1, index);
					
					line = this.trim_leading_whitespace(line.slice(index + 2));
					
					let space_index = line.indexOf(" ");
					
					
					
					let url = null;
					
					if (line[0] === "&lt;")
					{
						let index_2 = line.indexOf("&gt;");
						
						if (index_2 !== -1)
						{
							url = line.slice(1, index_2);
						}
					}
					
					else
					{
						if (space_index !== -1)
						{
							url = line.slice(0, space_index);
						}
						
						else
						{
							url = line;
						}
					}
					
					
					
					if (space_index === -1)
					{
						this.reference_links[var_name] = [url];
					}
					
					else
					{
						let start_index = space_index + 1;
						
						while (line[start_index] === " ")
						{
							start_index++;
						}
						
						let end_index = line.length - 1;
						
						while (line[end_index] === " ")
						{
							end_index--;
						}
						
						let title = line.slice(start_index + 1, end_index);
						
						this.reference_links[var_name] = [url, title];
					}
				}
			}
		}
		
		
		
		
		
		for (let i = 0; i < num_lines; i++)
		{
			let line = lines[i];
			let num_indents = 0;
			
			[line, num_indents] = this.clean_line(line);
			
			if (line.length === 0 && num_indents === 0)
			{
				while (this.current_container.list_depth !== 0)
				{
					this.current_container = this.current_container.parent;
				}
				
				while (this.current_container.quote_depth !== 0)
				{
					this.current_container = this.current_container.parent;
				}
			}
			
			
			
			
			
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
				need_new_paragraph = true;
				
				continue;
			}
			
			
			
			
			
			//Ordered lists
			let period_index = line.indexOf(".");
			
			if (period_index > 0)
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
					
					need_new_paragraph = true;
					
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
				
				need_new_paragraph = true;
				
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
				this.add_text("pre code", line);
				
				need_new_paragraph = true;
				
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
						
						need_new_paragraph = true;
						
						continue;
					}
					
				}
			}
			
			
			
			
			//Images
			else if (line[0] === "!" && line[1] === "[")
			{
				let end_bracket_index = line.indexOf("]");
				let end_parenthesis_index = line.lastIndexOf(")");
				
				if (end_bracket_index !== -1 && end_parenthesis_index !== -1)
				{
					let space_index = line.indexOf(" ", end_bracket_index);
					
					if (space_index === -1)
					{
						this.add_image(line.slice(end_bracket_index + 2, end_parenthesis_index), line.slice(2, end_bracket_index));
					}
					
					else
					{
						this.add_image(line.slice(end_bracket_index + 2, space_index), line.slice(2, end_bracket_index), line.slice(space_index + 2, end_parenthesis_index - 1));
					}
					
					need_new_paragraph = true;
					
					continue;
				}
			}
			
			//Image links
			else if (line[0] === "[" && line[1] === "!" && line[2] === "[")
			{
				let end_bracket_index = line.indexOf("]");
				let end_parenthesis_index = line.indexOf(")]");
				
				if (end_bracket_index !== -1 && end_parenthesis_index !== -1)
				{
					let space_index = line.indexOf(" ", end_bracket_index);
					
					if (space_index === -1)
					{
						this.add_image_link(line.slice(end_bracket_index + 2, end_parenthesis_index), line.slice(3, end_bracket_index), line.slice(end_parenthesis_index + 3, line.length - 1));
					}
					
					else
					{
						this.add_image_link(line.slice(end_bracket_index + 2, space_index), line.slice(3, end_bracket_index), line.slice(end_parenthesis_index + 3, line.length - 1), line.slice(space_index + 2, end_parenthesis_index - 1));
					}
					
					need_new_paragraph = true;
					
					continue;
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
				this.add_text("p", line, need_new_paragraph);
				
				need_new_paragraph = false;
				
				continue;
			}
			
			need_new_paragraph = true;
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
	
	
	
	//tag_name: p, h1, h2, etc. There can be a space in the name (e.g. "pre code") to indicate nested tags.
	add_text(tag_name, text, need_new_paragraph = true)
	{
		let tags = tag_name.split(" ");
		
		let new_element = null;
		
		let last_element = this.current_container.element;
		
		for (let i = 0; i < tags.length; i++)
		{
			new_element = document.createElement(tags[i]);
			
			last_element.appendChild(new_element);
			
			last_element = new_element;
		}
		
		new_element.textContent = text;
		
		
		
		
		new_element.innerHTML = this.escape_characters(new_element.innerHTML);
		
		//Inline code
		new_element.innerHTML = this.add_code(new_element.innerHTML);
		
		//Emphasis
		new_element.innerHTML = this.add_emphasis(new_element.innerHTML, "*");
		new_element.innerHTML = this.add_emphasis(new_element.innerHTML, "_");
		
		//Links
		new_element.innerHTML = this.add_links(new_element.innerHTML);
		
		
		
		let html = new_element.innerHTML;
		
		//Unescape characters
		for (let i = 0; i < html.length - 2; i++)
		{
			if (html[i] === "\t")
			{
				html = html.slice(0, i) + this.escape_tokens[parseInt(html.slice(i + 1, i + 3))] + html.slice(i + 3);
			}
		}
		
		new_element.innerHTML = html;
		
		
		
		if (need_new_paragraph)
		{
			this.last_element = new_element;
		}
		
		else
		{
			this.last_element.innerHTML = this.last_element.innerHTML + "<br>" + new_element.innerHTML;
			
			new_element.remove();
		}
	}
	
	
	
	escape_characters(html)
	{
		let start_delimiters = ["``", "`", "(", "&lt;"];
		
		let end_delimiters = ["``", "`", ")", "&gt;"];
		
		let index = 0;
		
		html += "  ";
		
		
		
		for (let j = 0; j < start_delimiters.length; j++)
		{
			index = 0;
			
			while (index < html.length - 2)
			{
				index = html.indexOf(start_delimiters[j], index);
				
				if (index === -1)
				{
					break;
				}
				
				
				
				//Until the next ``, escape all characters.
				let end_index = html.indexOf(end_delimiters[j], index + start_delimiters[j].length);
				
				if (end_index !== -1)
				{
					for (let i = 0; i < this.escape_tokens.length; i++)
					{
						let token = this.escape_tokens[i];
						
						let new_index = html.indexOf(token, index + start_delimiters[j].length);
						
						while (new_index !== -1 && new_index < end_index)
						{
							html = html.slice(0, new_index) + `\t${this.escape_indices[token]}` + html.slice(new_index + 1);
							
							end_index += 2;
							
							new_index = html.indexOf(token, index + start_delimiters[j].length);
						}
					}
					
					index = end_index + start_delimiters[j].length;
				}
				
				else
				{
					break;
				}
			}
		}
		
		
		
		return html;
	}
	
	
	
	escape_string(text)
	{
		for (let i = 0; i < this.escape_tokens.length; i++)
		{
			let token = this.escape_tokens[i];
			
			let index = text.indexOf(token);
			
			while (index !== -1)
			{
				text = text.slice(0, index) + `\t${this.escape_indices[token]}` + text.slice(index + 1);
				
				index = text.indexOf(token, index + 3);
			}
		}
		
		return text;
	}
	
	
	
	add_links(html)
	{
		let index = 0;
		
		html += "  ";
		
		//[]() style
		while (index < html.length - 2)
		{
			index = html.indexOf("[");
			
			if (index === -1)
			{
				break;
			}
			
			
			
			let end_index = html.indexOf("]", index + 1);
			
			if (end_index !== -1)
			{
				let text = html.slice(index + 1, end_index);
				
				if (html[end_index + 1] === "(")
				{
					let end_parenthesis_index = html.indexOf(")", end_index + 2);
					
					if (end_parenthesis_index !== -1)
					{
						let space_index = html.indexOf(" ", end_index + 2);
						
						if (space_index === -1 || space_index > end_parenthesis_index)
						{
							let src = html.slice(end_index + 2, end_parenthesis_index);
							
							html = html.slice(0, index) + this.escape_string(`<a href="${src}">${text}</a>`) + html.slice(end_parenthesis_index + 1);
						}
						
						else
						{
							let src = html.slice(end_index + 2, space_index);
							
							let title = html.slice(space_index + 2, end_parenthesis_index - 1);
							
							html = html.slice(0, index) + this.escape_string(`<a href="${src}" title="${title}">${text}</a>`) + html.slice(end_parenthesis_index + 1);
						}
					}
				}
			}
			
			else
			{
				break;
			}
		}
		
		
		
		index = 0;
		
		//<> style
		while (index < html.length - 2)
		{
			index = html.indexOf("&lt;");
			
			if (index === -1)
			{
				break;
			}
			
			
			
			let end_index = html.indexOf("&gt;", index + 1);
			
			if (end_index !== -1)
			{
				let text = html.slice(index + 4, end_index);
				
				html = html.slice(0, index) + this.escape_string(`<a href="${text}">${text}</a>`) + html.slice(end_index + 4);
			}
			
			else
			{
				break;
			}
		}
		
		
		
		return html;
	}
	
	
	
	//Token is either * or _ to save code.
	add_emphasis(html, token)
	{
		let index = 0;
		
		let em = false;
		let strong = false;
		
		let tag_stack = [];
		
		html += "  ";
		
		while (index < html.length - 2)
		{
			index = html.indexOf(token);
			
			if (index === -1)
			{
				break;
			}
			
			
			
			if (html[index + 1] === token)
			{
				if (!strong)
				{
					strong = true;
					
					html = html.slice(0, index) + this.escape_string("<strong>") + html.slice(index + 2);
					
					tag_stack.push(0);
				}
				
				else if (tag_stack[tag_stack.length - 1] === 0)
				{
					strong = false;
					
					html = html.slice(0, index) + this.escape_string("</strong>") + html.slice(index + 2);
					
					tag_stack.pop();
				}
				
				//If we're currently bold but it's not the last thing that was added, we need to take this as an opportunity to remove italics.
				else
				{
					em = false;
					
					html = html.slice(0, index) + this.escape_string("</em>") + html.slice(index + 1);
					
					tag_stack.pop();
				}
			}
			
			
			
			else
			{
				if (!em)
				{
					em = true;
					
					html = html.slice(0, index) + this.escape_string("<em>") + html.slice(index + 1);
					
					tag_stack.push(1);
				}
				
				else if (tag_stack[tag_stack.length - 1] === 1)
				{
					em = false;
					
					html = html.slice(0, index) + this.escape_string("</em>") + html.slice(index + 1);
					
					tag_stack.pop();
				}
				
				//This is a new italics tag after we already started italics, which doesn't make any sense. We'll just ignore it.
				else
				{
					html = html.slice(0, index) + html.slice(index + 1);
				}
			}
		}
		
		
		
		return html;
	}
	
	
	
	
	
	
	
	add_code(html)
	{
		let index = 0;
		
		html += "  ";
		
		while (index < html.length - 2)
		{
			index = html.indexOf("``");
			
			if (index === -1)
			{
				break;
			}
			
			
			
			let end_index = html.indexOf("``", index + 2);
			
			if (end_index !== -1)
			{
				html = html.slice(0, end_index) + this.escape_string("</code></pre>") + html.slice(end_index + 2);
				
				html = html.slice(0, index) + this.escape_string("<pre><code>") + html.slice(index + 2);
			}
		}
		
		
		
		index = 0;
		
		while (index < html.length - 1)
		{
			index = html.indexOf("`");
			
			if (index === -1)
			{
				break;
			}
			
			
			
			let end_index = html.indexOf("`", index + 1);
			
			if (end_index !== -1)
			{
				html = html.slice(0, end_index) + this.escape_string("</code></pre>") + html.slice(end_index + 1);
				
				html = html.slice(0, index) + this.escape_string("<pre><code>") + html.slice(index + 1);
			}
		}
		
		
		
		return html;
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
	
	
	
	add_image(src, alt, title)
	{
		let new_element = document.createElement("img");
		
		this.current_container.element.appendChild(new_element);
		
		new_element.src = src;
		
		new_element.alt = alt;
		
		if (typeof title !== "undefined")
		{
			new_element.title = title;
		}
	}
	
	add_image_link(src, alt, href, title)
	{
		let new_element = document.createElement("a");
		
		let new_element_2 = document.createElement("img");
		
		this.current_container.element.appendChild(new_element);
		
		new_element.appendChild(new_element_2);
		
		
		
		new_element_2.src = src;
		
		new_element_2.alt = alt;
		
		if (typeof title !== "undefined")
		{
			new_element_2.title = title;
		}
		
		new_element.href = href;
	}
	
	
	
	clean_line(text)
	{
		let num_indents = 0;
		
		text = text.replace(/\t/g, "    ");
		
		while (text.slice(0, 4) === "    ")
		{
			num_indents++;
			
			text = text.slice(4);
		}
		
		text = this.trim_leading_whitespace(text);
		
		
		
		//Escape characters
		for (let i = 0; i < text.length - 1; i++)
		{
			if (text[i] === "\\" && this.escape_tokens.includes(text[i + 1]))
			{
				text = text.slice(0, i) + `\t${this.escape_indices[text[i + 1]]}` + text.slice(i + 2);
				
				i += 2;
			}
		}
		
		return [text, num_indents];
	}
	
	
	
	trim_leading_whitespace(text)
	{
		let start_index = 0;
		
		while (text[start_index] === " ")
		{
			start_index++;
		}
		
		return text.slice(start_index);
	}
};