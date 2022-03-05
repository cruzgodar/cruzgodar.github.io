//Needs to be loaded *after* main.js.

Site.glsl_files = 
{
	"main":
	{
		dependencies: [],
		
		keywords: []
	},
	
	"equality":
	{
		dependencies: [],
		
		keywords:
		[
			"equal_within_relative_tolerance",
			"equal_within_absolute_tolerance",
			"equal_within_sharp_absolute_tolerance"
		]
	},
	
	"cpow":
	{
		dependencies: [],
		
		keywords:
		[
			"cpow"
		]
	},
	
	"cpow_logz":
	{
		dependencies: [],
		
		keywords:
		[
			"cpow_logz"
		]
	},
	
	"powermod":
	{
		dependencies: [],
		
		keywords:
		[
			"powermod"
		]
	},
	
	"ctet":
	{
		dependencies:
		[
			"cpow"
		],
		
		keywords:
		[
			"ctet"
		]
	},
	
	"csqrt":
	{
		dependencies:
		[
			"cpow"
		],
		
		keywords:
		[
			"csqrt"
		]
	},
	
	"cexp":
	{
		dependencies: [],
		
		keywords:
		[
			"cexp"
		]
	},
	
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
	}
};

Site.glsl_files_by_depth = [];

Site.load_glsl = function()
{
	return new Promise(async (resolve, reject) =>
	{
		let filenames = Object.keys(this.glsl_files);
		
		for (let i = 0; i < filenames.length; i++)
		{
			await new Promise(async (resolve, reject) =>
			{
				fetch(`/scripts/glsl/${filenames[i]}.frag`)
			
				.then(response => response.text())
				
				.then(text => this.glsl_files[filenames[i]].content = text)
				
				.then(() => resolve());
			});
		}
		
		
		
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