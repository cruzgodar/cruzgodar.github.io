import { fadeLeft, opacityAnimationTime } from "/scripts/src/animation.mjs";
import { bannerMaxScroll, setBannerOpacity } from "/scripts/src/banners.mjs";
import { disableLinks, showPage } from "/scripts/src/load-page.mjs";
import { $, addTemporaryListener, pageScroll, setVisitedHomepage, visitedHomepage } from "/scripts/src/main.mjs";

function setNameTextOpacity()
{
	let opacity = 0;

	if (pageScroll === 0)
	{
		if (bannerMaxScroll)
		{
			opacity = pageScroll <= bannerMaxScroll / 2.5 ? Math.min(Math.max(1 - pageScroll / (bannerMaxScroll / 2.5), 0), 1) : 0;
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
	if (visitedHomepage)
	{
		$("#return-scroll-to").scrollIntoView();

		setBannerOpacity(0);
	}
	
	setVisitedHomepage(true);

	addTemporaryListener({
		object: window,
		event: "resize",
		callback: centerContent
	});

	centerContent();
	
	setTimeout(() =>
	{
		fadeLeft($("#cruz-text"));
		
		setTimeout(() =>
		{
			fadeLeft($("#godar-text"));
		}, opacityAnimationTime);	
	}, opacityAnimationTime);
	
	setTimeout(() => setNameTextOpacity(), 100);
	
	disableLinks();
	
	showPage();
}