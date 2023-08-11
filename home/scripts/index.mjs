import { fadeLeft } from "/scripts/src/animation.mjs"
import { showPage, disableLinks } from "/scripts/src/load-page.mjs"
import { bannerMaxScroll, setBannerOpacity } from "/scripts/src/banners.mjs";

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

//On large screens, make the content be centered at the bottom of the page.
function centerContent()
{
	const contentHeight = $("main").getBoundingClientRect().height;
	const marginBottom = Math.max(128, (window.innerHeight - contentHeight) / 2);
	$("section:last-of-type").style.marginBottom = `${marginBottom}px`;
}

export function load()
{
	if (Site.vistedHomepage)
	{
		$("#return-scroll-to").scrollIntoView();

		setBannerOpacity(0);
	}
	
	Site.vistedHomepage = true;

	window.addEventListener("resize", centerContent);
	Page.temporaryHandlers["resize"].push(centerContent);
	centerContent();
	
	setTimeout(() =>
	{
		fadeLeft($("#cruz-text"), Site.opacityAnimationTime * 3.5);
		
		setTimeout(() =>
		{
			fadeLeft($("#godar-text"), Site.opacityAnimationTime * 3.5);
		}, Site.opacityAnimationTime);	
	}, Site.opacityAnimationTime);
	
	setTimeout(() => setNameTextOpacity(), 100);
	
	disableLinks();
	
	showPage();
}