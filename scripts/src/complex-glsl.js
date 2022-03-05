//Needs to be loaded *after* main.js.

Site.glsl_filenames =
[
	"equality",
	"powers"
];

Site.glsl_files = 
{
	"main":
	{
		dependencies: [],
		
		keywords: []
	}
	/*
	
	
	
	"clog":
	{
		dependencies: [],
		
		keywords:
		[
			"clog"
		]
	},
	
	"csinh":
	{
		dependencies:
		[
			"cexp"
		],
		
		keywords:
		[
			"csinh"
		]
	},
	
	"ccosh":
	{
		dependencies:
		[
			"cexp"
		],
		
		keywords:
		[
			"ccosh"
		]
	},
	
	"csin":
	{
		dependencies:
		[
			"cexp",
			"csinh",
			"ccosh"
		],
		
		keywords:
		[
			"csin"
		]
	},
	
	"ccos":
	{
		dependencies:
		[
			"cexp",
			"csinh",
			"ccosh"
		],
		
		keywords:
		[
			"ccos"
		]
	},
	
	"ctan":
	{
		dependencies:
		[
			"cexp"
		],
		
		keywords:
		[
			"ctan"
		]
	},
	
	"ccsc":
	{
		dependencies:
		[
			"csin"
		],
		
		keywords:
		[
			"ccsc"
		]
	},
	
	"csec":
	{
		dependencies:
		[
			"ccos"
		],
		
		keywords:
		[
			"csec"
		]
	},
	
	"ccot":
	{
		dependencies:
		[
			"cexp"
		],
		
		keywords:
		[
			"ccot"
		]
	},
	
	"casin":
	{
		dependencies:
		[
			"clog",
			"cpow"
		],
		
		keywords:
		[
			"casin"
		]
	},
	
	"cacos":
	{
		dependencies:
		[
			"clog",
			"cpow"
		],
		
		keywords:
		[
			"casin"
		]
	},
	
	"gamma":
	{
		dependencies: ["zeta"],
		
		keywords:
		[
			"gamma"
		]
	},
	
	"zeta":
	{
		dependencies: [],
		
		keywords:
		[
			"zeta"
		]
	}*/
};



Site.split_glsl_file = function(filename, text)
{
	text = text.replaceAll("\r", "");
	
	let start_search_index = 0;
	
	while (true)
	{
		let index = text.indexOf("#function", start_search_index);
		
		if (index === -1)
		{
			break;
		}
		
		let end_index = text.indexOf("\n", index + 10);
		
		if (end_index === -1)
		{
			console.error(`[GLSL bundling] Invalid function name in file ${filename}.frag`);
			return;
		}
		
		let keywords = text.slice(index + 10, end_index).split(" ");
		
		
		
		let end_function_index = text.indexOf("#endfunction", end_index + 1);
		
		if (end_function_index === -1)
		{
			console.error(`[GLSL bundling] Missing #endfunction in file ${filename}.frag`);
			return;
		}
		
		
		
		Site.glsl_files[keywords[0]] =
		{
			keywords: keywords
		};
		
		
		
		let dependencies_index = text.indexOf("#requires", index);
		
		if (dependencies_index !== -1 && dependencies_index < end_function_index)
		{
			let end_dependencies_index = text.indexOf("\n", dependencies_index + 10);
			
			Site.glsl_files[keywords[0]].dependencies = text.slice(dependencies_index + 10, end_dependencies_index).split(" ");
			
			Site.glsl_files[keywords[0]].content = text.slice(end_dependencies_index + 1, end_function_index);
		}
		
		else
		{
			Site.glsl_files[keywords[0]].dependencies = [];
			
			Site.glsl_files[keywords[0]].content = text.slice(end_index + 1, end_function_index);
		}
		
		
		
		start_search_index = end_function_index + 13;
	}
};



Site.glsl_files_by_depth = [];

Site.load_glsl = function()
{
	return new Promise(async (resolve, reject) =>
	{
		//main.frag is always fetched.
		await new Promise(async (resolve, reject) =>
		{
			fetch(`/scripts/glsl/main.frag`)
		
			.then(response => response.text())
			
			.then(text => this.glsl_files["main"].content = text)
			
			.then(() => resolve());
		});
		
		
		
		for (let i = 0; i < this.glsl_filenames.length; i++)
		{
			await new Promise(async (resolve, reject) =>
			{
				fetch(`/scripts/glsl/${this.glsl_filenames[i]}.frag`)
			
				.then(response => response.text())
				
				.then(text => this.split_glsl_file(this.glsl_filenames[i], text))
				
				.then(() => resolve());
			});
		}
		
		
		
		let filenames = Object.keys(this.glsl_files);
		
		
		
		//Figure out the depth of everything.
		for (let i = 0; i < filenames.length; i++)
		{
			this.glsl_files[filenames[i]].parents = [];
		}
		
		
		
		for (let i = 0; i < filenames.length; i++)
		{
			let dependencies = this.glsl_files[filenames[i]].dependencies;
			
			for (let j = 0; j < dependencies.length; j++)
			{
				this.glsl_files[dependencies[j]].parents.push(filenames[i]);
			}
			
			if (dependencies.length === 0 && filenames[i] !== "main")
			{
				this.glsl_files["main"].parents.push(filenames[i]);
			}
		}
		
		let active_nodes = ["main"];
		let depth = 0;
		
		while (active_nodes.length !== 0)
		{
			let next_active_nodes = [];
			
			Site.glsl_files_by_depth.push([]);
			
			for (let i = 0; i < active_nodes.length; i++)
			{
				if (typeof this.glsl_files[active_nodes[i]].depth === "undefined")
				{
					this.glsl_files[active_nodes[i]].depth = depth;
				}
				
				else
				{
					this.glsl_files[active_nodes[i]].depth = Math.max(this.glsl_files[active_nodes[i]].depth, depth);
				}
				
				let parents = this.glsl_files[active_nodes[i]].parents;
				
				for (let j = 0; j < parents.length; j++)
				{
					if (!next_active_nodes.includes(parents[j]))
					{
						next_active_nodes.push(parents[j]);
					}	
				}
			}
			
			depth++;
			active_nodes = next_active_nodes;
		}
		
		for (let i = 0; i < filenames.length; i++)
		{
			Site.glsl_files_by_depth[this.glsl_files[filenames[i]].depth].push(filenames[i]);
		}
		
		
		
		Site.scripts_loaded["glsl"] = true;
		
		resolve();
	});
};



//Returns a bundle of all required glsl to handle the given function.
Site.get_glsl_bundle = function(code_string)
{
	//First, we need to identify the keywords in the provided string.
	let keywords = code_string.match(/[a-zA-Z_][a-zA-Z0-9_]*/g);
	
	let bundle = "";
	
	let filenames = Object.keys(this.glsl_files);
	
	let files_to_include = {};
	
	for (let i = 1; i < filenames.length; i++)
	{
		files_to_include[filenames[i]] = false;
	}
	
	//main.frag is always required.
	files_to_include["main"] = true;
	
	
	
	let debug_message = "";
	
	function add_to_bundle(filename, depth)
	{
		if (files_to_include[filename])
		{
			return;
		}
		
		files_to_include[filename] = true;
		
		if (DEBUG && depth !== 0)
		{
			debug_message += "\n                    ";
			
			for (let i = 0; i < depth; i++)
			{
				debug_message += "    ";
			}
			
			debug_message += `↳ ${filename}.frag`;
		}
		
		let dependencies = Site.glsl_files[filename].dependencies;
		
		for (let i = 0; i < dependencies.length; i++)
		{
			add_to_bundle(dependencies[i], depth + 1);
		}
	}
	
	
	
	for (let i = 0; i < filenames.length; i++)
	{
		if (files_to_include[filenames[i]])
		{
			continue;
		}
		
		for (let j = 0; j < keywords.length; j++)
		{
			if (Site.glsl_files[filenames[i]].keywords.indexOf(keywords[j]) !== -1)
			{
				debug_message = `[GLSL bundling] Adding ${filenames[i]}.frag`;
				
				add_to_bundle(filenames[i], 0);
				
				if (DEBUG)
				{
					console.log(debug_message);
				}
			}
		}
	}
	
	
	
	//main.glsl is always included.
	bundle = Site.glsl_files["main"].content;
	
	for (let i = 1; i < Site.glsl_files_by_depth.length; i++)
	{
		for (let j = 0; j < Site.glsl_files_by_depth[i].length; j++)
		{
			if (files_to_include[Site.glsl_files_by_depth[i][j]])
			{
				bundle += Site.glsl_files[Site.glsl_files_by_depth[i][j]].content;
			}
		}	
	}
	
	return bundle;
}