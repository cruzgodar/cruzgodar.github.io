"use strict";



onmessage = async function(e)
{
	code = e.data[0];
	
	await animate_asciidots();
}



let code = [];

let active_elements = [];
let new_active_elements = [];

let active_conditionals = [];

let valid_up_tokens = ["|", "+", "/", "\\", "v", "^", "<", ">", "*", "~", "!", "#", "@", "$", "&", ":", ";", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
let valid_right_tokens = ["-", "+", "/", "\\", "(", ")", "v", "^", "<", ">", "*", "~", "#", "@", "$", "&", ":", ";", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
let valid_down_tokens = ["|", "+", "/", "\\", "v", "^", "<", ">", "*", "#", "@", "$", "&", ":", ";", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
let valid_left_tokens = ["-", "+", "/", "\\", "(", ")", "v", "^", "<", ">", "*", "~", "#", "@", "$", "&", ":", ";", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

let operations = ["+", "-", "*", "/", "%", "^", "&", "o", "x", ">", "G", "<", "L", "=", "!"];

let direction = [[-1, 0], [0, 1], [1, 0], [0, -1]];





function animate_asciidots()
{
	return new Promise(async function(resolve, reject)
	{
		for (let i = 0; i < code.length; i++)
		{
			for (let j = 0; j < code[i].length; j++)
			{
				if (code[i][j] === "." || code[i][j] === "•")
				{
					if (i < code.length - 1 && code[i + 1][j] === "|")
					{
						active_elements.push([i, j, 0, 0, 2]);
					}
					
					else if (i > 0 && code[i - 1][j] === "|")
					{
						active_elements.push([i, j, 0, 0, 0]);
					}
					
					else if (j < code[i].length && code[i][j + 1] === "-")
					{
						active_elements.push([i, j, 0, 0, 1]);
					}
					
					else if (j > 0 && code[i][j - 1] === "-")
					{
						active_elements.push([i, j, 0, 0, 3]);
					}
				}
			}
		}
		
		
		
		postMessage([active_elements, true]);
		
		
		
		while (true)
		{
			await sleep(200);
			
			postMessage([active_elements, false]);
			
			
			
			if (active_elements.length === 0)
			{
				resolve();
				
				return;
			}
			
			
			
			new_active_elements = [];
			
			//Activate the new elements.
			for (let i = 0; i < active_elements.length; i++)
			{
				let move_ability = can_move(active_elements[i][0], active_elements[i][1], active_elements[i][4]);
				
				if (move_ability === 1)
				{
					active_elements[i][0] += direction[active_elements[i][4]][0];
					active_elements[i][1] += direction[active_elements[i][4]][1];
					
					
					
					let result = parse_token(i, code[active_elements[i][0]][active_elements[i][1]]);
					
					if (result === -1)
					{
						resolve();
						
						return;
					}
					
					
					
					if (active_elements[i][4] !== -1)
					{
						new_active_elements.push(active_elements[i]);
					}
				}
				
				else if (move_ability === 2)
				{
					active_elements[i][0] += direction[active_elements[i][4]][0];
					active_elements[i][1] += direction[active_elements[i][4]][1];
					
					//parse_operation(i, code[active_elements[i][0]][active_elements[i][1]]);
					
					new_active_elements.push(active_elements[i]);
				}
			}
			
			
			
			active_elements = JSON.parse(JSON.stringify(new_active_elements));
			
			postMessage([active_elements, true]);
		}
		
		
		
		resolve();
	});
}



//Returns 1 if a dot at (row, col) can move in direction, a 2 if it's moving into an operation, and false if not.
function can_move(row, col, direction)
{
	if (direction === 0)
	{
		if (row > 0)
		{
			if (col > 0 && col < code[row].length - 1 && operations.includes(code[row - 1][col]) && ((code[row - 1][col - 1] === "[" && code[row - 1][col + 1] === "]") || (code[row - 1][col - 1] === "{" && code[row - 1][col + 1] === "}")))
			{
				return 2;
			}
			
			else if (valid_up_tokens.includes(code[row - 1][col]))
			{
				return 1;
			}
		}
		
		return 0;
	}
	
	
	
	else if (direction === 1)
	{
		if (col < code[row].length - 1)
		{
			if (col < code[row].length - 3 && operations.includes(code[row][col + 2]) && ((code[row][col + 1] === "[" && code[row][col + 3] === "]") || (code[row][col + 1] === "{" && code[row][col + 3] === "}")))
			{
				return 2;
			}
			
			else if (valid_right_tokens.includes(code[row][col + 1]))
			{
				return 1;
			}
		}
		
		return 0;
	}
	
	
	
	else if (direction === 2)
	{
		if (row < code.length - 1)
		{
			if (col > 0 && col < code[row].length - 1 && operations.includes(code[row + 1][col]) && ((code[row + 1][col - 1] === "[" && code[row + 1][col + 1] === "]") || (code[row + 1][col - 1] === "{" && code[row + 1][col + 1] === "}")))
			{
				return 2;
			}
			
			else if (valid_down_tokens.includes(code[row + 1][col]))
			{
				return 1;
			}
		}
		
		return 0;
	}
	
	
	
	else if (direction === 3)
	{
		if (col > 0)
		{
			if (col > 2 && operations.includes(code[row][col - 2]) && ((code[row][col - 1] === "]" && code[row][col - 3] === "[") || (code[row][col - 1] === "}" && code[row][col - 3] === "{")))
			{
				return 2;
			}
			
			else if (valid_left_tokens.includes(code[row][col - 1]))
			{
				return 1;
			}
		}
		
		return 0;
	}
	
	
	
	return 0;
}



function parse_token(index, token)
{
	if (token === "/")
	{
		if (active_elements[index][4] === 0)
		{
			active_elements[index][4] = 1;
		}
		
		else if (active_elements[index][4] === 1)
		{
			active_elements[index][4] = 0;
		}
		
		else if (active_elements[index][4] === 2)
		{
			active_elements[index][4] = 3;
		}
		
		else if (active_elements[index][4] === 3)
		{
			active_elements[index][4] = 2;
		}
	}
	
	
	
	else if (token === "\\")
	{
		if (active_elements[index][4] === 0)
		{
			active_elements[index][4] = 3;
		}
		
		else if (active_elements[index][4] === 1)
		{
			active_elements[index][4] = 2;
		}
		
		else if (active_elements[index][4] === 2)
		{
			active_elements[index][4] = 1;
		}
		
		else if (active_elements[index][4] === 3)
		{
			active_elements[index][4] = 0;
		}
	}
	
	
	
	else if (token === "(")
	{
		if (active_elements[index][4] === 3)
		{
			active_elements[index][4] = 1;
		}
	}
	
	
	
	else if (token === ")")
	{
		if (active_elements[index][4] === 1)
		{
			active_elements[index][4] = 3;
		}
	}
	
	
	
	else if (token === "^")
	{
		if (active_elements[index][4] !== 2)
		{
			active_elements[index][4] = 0;
		}
	}
	
	
	
	else if (token === ">")
	{
		if (active_elements[index][4] !== 3)
		{
			active_elements[index][4] = 1;
		}
	}
	
	
	
	else if (token === "v")
	{
		if (active_elements[index][4] !== 0)
		{
			active_elements[index][4] = 2;
		}
	}
	
	
	
	else if (token === "<")
	{
		if (active_elements[index][4] !== 1)
		{
			active_elements[index][4] = 3;
		}
	}
	
	
	
	else if (token === "*")
	{
		let forbidden_direction = 0;
		
		if (active_elements[index][4] === 0)
		{
			forbidden_direction = 2;
		}
		
		else if (active_elements[index][4] === 1)
		{
			forbidden_direction = 3;
		}
		
		else if (active_elements[index][4] === 3)
		{
			forbidden_direction = 1;
		}
		
		for (let i = 0; i < 4; i++)
		{
			if (i !== forbidden_direction && can_move(active_elements[index][0], active_elements[index][1], i))
			{
				new_active_elements.push([active_elements[index][0], active_elements[index][1], active_elements[index][2], active_elements[index][3], i]);
			}
			
			active_elements[index][4] = -1;
		}
	}
	
	
	
	else if (token === "~")
	{
		if (active_elements[index][4] === 0)
		{
			let found_conditional = false;
			
			for (let i = 0; i < active_conditionals.length; i++)
			{
				if (active_conditionals[i][0] === active_elements[index][0] && active_conditionals[i][1] === active_elements[index][1])
				{
					found_conditional = true;
					
					if (active_elements[index][3] === 0)
					{
						new_active_elements.push([active_conditionals[i][0], active_conditionals[i][1], active_conditionals[i][2], active_conditionals[i][3], active_conditionals[i][4]]);
					}
					
					else
					{
						new_active_elements.push([active_conditionals[i][0], active_conditionals[i][1], active_conditionals[i][2], active_conditionals[i][3], 0]);
					}
					
					active_conditionals.splice(i, 1);
					
					break;
				}
			}
			
			
			
			if (!found_conditional)
			{
				active_conditionals.push([active_elements[index][0], active_elements[index][1], 0, 0, 0, active_elements[index][3]]);
			}
			
			
			
			active_elements[index][4] = -1;
		}
		
		
		
		else
		{
			let found_conditional = false;
			
			for (let i = 0; i < active_conditionals.length; i++)
			{
				if (active_conditionals[i][0] === active_elements[index][0] && active_conditionals[i][1] === active_elements[index][1])
				{
					found_conditional = true;
					
					if (active_conditionals[i][5] === 0)
					{
						new_active_elements.push([active_elements[index][0], active_elements[index][1], active_elements[index][2], active_elements[index][3], active_elements[index][4]]);
					}
					
					else
					{
						new_active_elements.push([active_elements[index][0], active_elements[index][1], active_elements[index][2], active_elements[index][3], 0]);
					}
					
					active_conditionals.splice(i, 1);
					
					break;
				}
			}
			
			
			
			if (!found_conditional)
			{
				active_conditionals.push([active_elements[index][0], active_elements[index][1], active_elements[index][2], active_elements[index][3], active_elements[index][4], 0]);
			}
			
			
			
			active_elements[index][4] = -1;
		}
	}
	
	
	
	else if (token === "!")
	{
		if (active_elements[index][0] > 0 && code[active_elements[index][0] - 1][active_elements[index][1]] === "~")
		{
			if (active_elements[index][3] === 0)
			{
				active_elements[index][3] = 1;
			}
			
			else
			{
				active_elements[index][3] = 0;
			}
		}
	}
	
	
	
	else if (token === "#")
	{
		active_elements[index][0] += direction[active_elements[index][4]][0];
		active_elements[index][1] += direction[active_elements[index][4]][1];
		
		active_elements[index][3] = 0;
		
		while (code[active_elements[index][0]][active_elements[index][1]] >= "0" && code[active_elements[index][0]][active_elements[index][1]] <= "9")
		{
			active_elements[index][3] *= 10;
			active_elements[index][3] += parseInt(code[active_elements[index][0]][active_elements[index][1]]);
			
			active_elements[index][0] += direction[active_elements[index][4]][0];
			active_elements[index][1] += direction[active_elements[index][4]][1];
			
			if (active_elements[index][0] < 0 || active_elements[index][0] >= code.length || active_elements[index][1] < 0 || active_elements[index][1] >= code[active_elements[index][0]].length)
			{
				break;
			}
		}
	}
	
	
	
	else if (token === "@")
	{
		active_elements[index][0] += direction[active_elements[index][4]][0];
		active_elements[index][1] += direction[active_elements[index][4]][1];
		
		active_elements[index][2] = 0;
		
		while (code[active_elements[index][0]][active_elements[index][1]] >= "0" && code[active_elements[index][0]][active_elements[index][1]] <= "9")
		{
			active_elements[index][2] *= 10;
			active_elements[index][2] += parseInt(code[active_elements[index][0]][active_elements[index][1]]);
			
			active_elements[index][0] += direction[active_elements[index][4]][0];
			active_elements[index][1] += direction[active_elements[index][4]][1];
			
			if (active_elements[index][0] < 0 || active_elements[index][0] >= code.length || active_elements[index][1] < 0 || active_elements[index][1] >= code[active_elements[index][0]].length)
			{
				break;
			}
		}
	}
	
	
	
	else if (token === ":")
	{
		if (active_elements[index][3] === 0)
		{
			active_elements[index][4] = -1;
		}
	}
	
	
	
	else if (token === ";")
	{
		if (active_elements[index][4] === 1)
		{
			active_elements[index][4] = -1;
		}
	}
	
	
	
	else if (token === "&")
	{
		return -1;
	}
}



function sleep(ms)
{
	return new Promise(function(resolve, reject)
	{
		setTimeout(resolve, ms);
	});
}