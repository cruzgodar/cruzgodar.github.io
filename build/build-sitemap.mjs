import { read, write } from "./file-io.mjs";

const textSitemapPath = "/build/sitemap.txt";
export const sitemapPath = "/scripts/src/sitemap.js";

export default async () =>
{
	const lines = (await read(textSitemapPath)).replaceAll(/\r/g, "").replaceAll(/    /g, "\t").replaceAll(/\n\t*?\n/g, "\n").split("\n");

	const depths = new Array(lines.length);

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



	let sitemap = `Site.sitemap =\n{${getPageString("/home/", "", ["/gallery/", "/applets/", "/teaching/", "/slides/", "/writing/", "/about/", "/404/", "/debug/"], "Cruz Godar")}`;

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
		const parent = lines[j].replace("/home", "");
		
		//This is part of the magic: we replace the current line with its correct form (i.e. the full path and trailing slash) now, which also makes sure future pages have correctly-formed parents.

		const index = lines[i].indexOf(" ");
		const title = lines[i].slice(index + 1);
		lines[i] = lines[i].slice(0, index);
		
		if (lines[i][0] !== "/")
		{
			lines[i] = `${parent}${lines[i]}/`;
		}
		
		else
		{
			lines[i] = `${lines[i]}/`;
		}
		
		//To find all the children, we search ahead and find everything at depth one more than us, until we find something at depth <= us.
		
		const children = [];
		
		j = i + 1;
		
		while (j < lines.length && depths[j] > depth)
		{
			if (depths[j] === depth + 1)
			{
				const index = lines[j].indexOf(" ");
				const child = lines[j].slice(0, index);
				
				//On the other hand, these are guaranteed *not* to be formatted correctly, so we modify them (but not in place, since we'll get to them later).
				if (lines[j][0] !== "/")
				{
					children.push(`${lines[i]}${child}/`);
				}
				
				else
				{
					children.push(`${child}/`);
				}
			}
			
			j++;
		}
		
		
		
		const realParent = parent === "/" ? "/home/" : parent;
		
		sitemap = `${sitemap}${getPageString(lines[i], realParent, children, title)}`;
	}

	sitemap = `${sitemap.slice(0, sitemap.length - 3)}\n}`;

	await write(sitemapPath, sitemap);
}



function getPageString(url, parent, children, title)
{
	if (children.length !== 0)
	{
		let childrenString = "";
		
		for (let i = 0; i < children.length; i++)
		{
			childrenString = `${childrenString}\t\t\t"${children[i]}"`;
			
			if (i !== children.length - 1)
			{
				childrenString = `${childrenString},`;
			}
			
			childrenString = `${childrenString}\n`;
		}
		
		return `
	"${url}":
	{
		"title": "${title}",
		
		"parent": "${parent}",
		
		"children":
		[
${childrenString}\t\t]
	},
		`;
	}
	
	return `
	"${url}":
	{
		"title": "${title}",
		
		"parent": "${parent}",
		
		"children": []
	},
	`;
}