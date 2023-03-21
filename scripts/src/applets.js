class Applet
{
	canvas;
	wilson;
	
	constructor(canvas)
	{
		this.canvas = canvas;
	}
}

Site.loaded_applets = [];

Site.load_applet = function(id)
{
	return new Promise(async (resolve, reject) =>
	{
		if (Site.loaded_applets.includes(id))
		{
			if (DEBUG)
			{
				console.log(`Refusing to load duplicate ${id}`);
			}
		}
		
		else
		{
			if (DEBUG)
			{
				console.log(`Loading ${id}`);
			}
			
			await Site.load_script(`/applets/${id}/scripts/class.${DEBUG ? "" : "min."}js`);
			
			Site.loaded_applets.push(id);
		}
		
		resolve();
	});
};