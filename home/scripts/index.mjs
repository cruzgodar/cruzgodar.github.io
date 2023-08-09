import { showPage } from "/scripts/src/load-page.mjs"
import { bannerMaxScroll } from "../../scripts/src/banners.mjs";

function setNameTextOpacity()
{
	let opacity = 0;

	if (Page.scroll === 0)
	{
		if (bannerMaxScroll)
		{
			opacity = Page.scroll <= bannerMaxScroll / 2.5 ? Math.min(Math.max(1 - Page.scroll / (bannerMaxScroll / 2.5), 0), 1) : 0;
		}

		else
		{
			opacity = 1;
		}
	}
	
	$("#cruz-text").parentNode.style.opacity = opacity;
	$("#godar-text").parentNode.style.opacity = opacity;
}

export function load()
{
	if (Site.vistedHomepage)
	{
		$("#return-scroll-to").scrollIntoView();
		
		setBannerOpacity(0);
	}
	
	Site.vistedHomepage = true;
	
	
	
	setTimeout(() =>
	{
		fadeLeft($("#cruz-text"), Site.opacityAnimationTime * 3.5);
		
		setTimeout(() =>
		{
			fadeLeft($("#godar-text"), Site.opacityAnimationTime * 3.5);
		}, Site.opacityAnimationTime);	
	}, Site.opacityAnimationTime);
	
	setTimeout(() => setNameTextOpacity(), 100);
	
	
	
	Page.Load.Links.disable();
	
	
	
	showPage();
}