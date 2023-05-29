!async function()
{
	Page.show();
	
	await Site.load_applet("vector-fields");
	
	const output_canvas = Page.element.querySelector("#vector-field-canvas");
	
	const applet = new VectorField(output_canvas);
	
	applet.load_promise.then(() =>
	{
		applet.run("((x - 1.0) * (x + 1.0), (y + 1.0) * (y - 1.0))", 500, 10000, .0035, 100, 0, 0, -.15);
		applet.pause();
	});
	
	Site.pause_applet_when_offscreen(applet);
	
}()