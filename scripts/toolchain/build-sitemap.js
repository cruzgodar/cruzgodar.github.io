let lines = args.plainTexts[0].replaceAll(/\r/g, "").replaceAll(/    /g, "\t").replaceAll(/\n\t*?\n/g, "\n").split("\n");

let depths = new Array(lines.length);

//Find everything's depth and then discard the tabs.
for (let i = 0; i < lines.length; i++)
{
	let j = 0;
	
	while (lines[i][j] === "\t")
	{
		j++;
	}
	
	depths[i] = j;
	
	lines[i] = lines[i].slice(j);
}



let sitemap = `Site.sitemap =\n{${get_page_string("/home/", "", ["/gallery/", "/applets/", "/teaching/", "/slides/", "/writing/", "/about/", "/404/", "/debug/"])}`;

lines[0] = "/home/";

for (let i = 1; i < lines.length; i++)
{
	//To find our parent, we search upward until we find something at depth one less than us.
	const depth = depths[i];
	
	let j = i - 1;
	
	while (j >= 0 && depths[j] !== depth - 1)
	{
		j--;
	}
	
	//We can assume this one is properly formatted since it came before us.
	let parent = lines[j].replace("/home", "");
	
	//This is part of the magic: we replace the current line with its correct form (i.e. the full path and trailing slash) now, which also makes sure future pages have correctly-formed parents.
	
	if (lines[i][0] !== "/")
	{
		lines[i] = `${parent}${lines[i]}/`;
	}
	
	else
	{
		lines[i] = `${lines[i]}/`;
	}
	
	//To find all the children, we search ahead and find everything at depth one more than us, until we find something at depth <= us.
	
	let children = [];
	
	j = i + 1;
	
	while (j < lines.length && depths[j] > depth)
	{
		if (depths[j] === depth + 1)
		{
			//On the other hand, these are guaranteed *not* to be formatted correctly, so we modify them (but not in place, since we'll get to them later).
			if (lines[j][0] !== "/")
			{
				children.push(`${lines[i]}${lines[j]}/`);
			}
			
			else
			{
				children.push(`${lines[j]}/`);
			}
		}
		
		j++;
	}
	
	
	
	const real_parent = parent === "/" ? "/home/" : parent;
	
	sitemap = `${sitemap}${get_page_string(lines[i], real_parent, children)}`;
}

sitemap = `${sitemap.slice(0, sitemap.length - 1)}};`;

return sitemap;



function get_page_string(url, parent, children)
{
	if (children.length !== 0)
	{
		let children_string = "";
		
		children.forEach(child => children_string = `${children_string}\t\t\t"${child}",\n`);
		
		return `
	"${url}":
	{
		parent: "${parent}",
		
		children:
		[
${children_string}\t\t]
	},
		`;
	}
	
	return `
	"${url}":
	{
		parent: "${parent}",
		
		children: []
	},
	`;
}