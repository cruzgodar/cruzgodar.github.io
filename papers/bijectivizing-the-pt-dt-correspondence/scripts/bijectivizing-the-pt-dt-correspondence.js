!function()
{
	let callbacks =
	{
		1: function()
		{
			let slide = Page.Presentation.get_current_slide();
		}
	};
	
	
	
	Page.Presentation.init(callbacks);
	
	Page.show();
}()