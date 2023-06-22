!function()
{
	"use strict";
	
	
	
	if (Site.vistedHomepage)
	{
		$("#return-scroll-to").scrollIntoView();
		
		Page.Banner.opacity = 0;
		Page.Banner.doneLoading = true;
		Page.bannerElement.style.opacity = 0;
		Page.contentElement.style.opacity = 1;
	}
	
	Site.vistedHomepage = true;
	
	
	
	setTimeout(() =>
	{
		Page.Animate.fadeLeft($("#cruz-text"), Site.opacityAnimationTime * 3.5);
		
		setTimeout(() =>
		{
			Page.Animate.fadeLeft($("#godar-text"), Site.opacityAnimationTime * 3.5);
		}, Site.opacityAnimationTime);	
	}, Site.opacityAnimationTime);
	
	setTimeout(() => setNameTextOpacity(), 100);
	
	
	
	Page.Load.Links.disable();
	
	
	
	Page.show();
	
	
	
	function setNameTextOpacity()
	{
		let opacity = 0;
		
		if (Page.scroll <= Page.Banner.maxScroll / 2.5)
		{
			opacity = Math.min(Math.max(1 - Page.scroll / (Page.Banner.maxScroll / 2.5), 0), 1);
		}
		
		$("#cruz-text").parentNode.style.opacity = opacity;
		$("#godar-text").parentNode.style.opacity = opacity;
	}
}()