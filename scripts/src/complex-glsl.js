//Needs to be loaded *after* main.js.

Site.glsl_files = 
{
	"main":
	{
		loaded: false,
		content: "",
		dependencies: [],
		keywords: []
	},
	
	"equality":
	{
		loaded: false,
		content: "",
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
		loaded: false,
		content: "",
		dependencies: [],
		keywords:
		[
			"cpow"
		]
	},
	
	"gamma":
	{
		loaded: false,
		content: "",
		dependencies: ["zeta"],
		keywords:
		[
			"gamma"
		]
	},
	
	"zeta":
	{
		loaded: false,
		content: "",
		dependencies: [],
		keywords:
		[
			"zeta"
		]
	}
};

Site.load_glsl = function()
{
	return new Promise(async (resolve, reject) =>
	{
		window.COMPLEX_GLSL = "";
		
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
		
		
		
		//Join them all for now -- we'll replace this later
		for (let i = 0; i < filenames.length; i++)
		{
			window.COMPLEX_GLSL	+= this.glsl_files[filenames[i]].content;
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
	
	//main.glsl is always included.
	let bundle = Site.glsl_files["main"].content;
	
	let filenames = Object.keys(this.glsl_files);
	
	let files_included = {};
	
	for (let i = 0; i < filenames.length; i++)
	{
		files_included[filenames[i]] = false;
	}
	
	files_included["main"] = true;
	
	
	
	for (let i = 0; i < filenames.length; i++)
	{
		if (files_included[filenames[i]])
		{
			continue;
		}
		
		for (let j = 0; j < keywords.length; j++)
		{
			if (Site.glsl_files[filenames[i]].keywords.indexOf(keywords[j]) !== -1)
			{
				bundle += Site.glsl_files[filenames[i]].content;
				
				if (DEBUG)
				{
					console.log(`[GLSL bundling] added ${filenames[i]}`);
				}
				
				
				
				let dependencies = [...Site.glsl_files[filenames[i]].dependencies];
				
				while (dependencies.length > 0)
				{
					if (!files_included[dependencies[0]])
					{
						bundle += Site.glsl_files[dependencies[0]].content;
						
						files_included[dependencies[0]] = true;
						
						dependencies = dependencies.concat(Site.glsl_files[dependencies[0]].dependencies);
						
						if (DEBUG)
						{
							console.log(`[GLSL bundling]: ${filenames[i]} requires ${dependencies[0]}`);
						}	
						
						dependencies.shift();
					}
				}
			}
		}	
	}
	
	
	return bundle;
}