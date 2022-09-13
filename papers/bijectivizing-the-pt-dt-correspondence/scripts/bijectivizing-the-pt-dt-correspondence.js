!function()
{
	Page.Presentation.init();
	
	Page.show();
	
	setTimeout(() =>
	{
		Page.Animate.fade_up_out(Page.element, Site.page_animation_time)
		
		.then(() =>
		{
			Page.Animate.fade_up_in(Page.element, Site.page_animation_time * 2)
		});
	}, 1000);
}()