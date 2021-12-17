//Needs to be loaded *after* main.js.

Site.glsl_functions = 
{
	"main":
	{
		loaded: false,
		content: "",
		dependencies: [],
		keywords: []
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
		dependencies: ["main"],
		keywords:
		[
			"zeta",
			"zeta_helper"
		]
	}
};

Site.load_glsl = function()
{
	return new Promise(async (resolve, reject) =>
	{
		window.COMPLEX_GLSL = "";
		
		let filenames = Object.keys(this.glsl_functions);
		
		
		
		for (let i = 0; i < filenames.length; i++)
		{
			await new Promise(async (resolve, reject) =>
			{
				fetch(`/scripts/glsl/${filenames[i]}.frag`)
			
				.then(response => response.text())
				
				.then(text => this.glsl_functions[filenames[i]].content = text)
				
				.then(() => resolve());
			});
		}
		
		
		
		//Join them all for now -- we'll replace this later
		for (let i = 0; i < filenames.length; i++)
		{
			window.COMPLEX_GLSL	+= this.glsl_functions[filenames[i]].content;
		}
		
		Site.scripts_loaded["glsl"] = true;
		
		resolve();
	});
};