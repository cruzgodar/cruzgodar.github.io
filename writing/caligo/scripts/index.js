!function()
{
	"use strict";
	
	
	
	let backgroundColor = 255;
	let opacity = 0;
	
	Page.Banner.doneLoading = false;
	Page.Banner.ScrollButton.doneLoading = false;
	let eclipseDone = false;
	
	
	
	setTimeout(adjustForSettings, 500);
	
	
	
	//Make the eclipse image have a 1:1 aspect ratio.
	$("#eclipse").style.height = $("#eclipse").offsetWidth + "px";
	$("#eclipse img").style.height = $("#eclipse").offsetWidth + "px";
	
	window.addEventListener("resize", caligoResize);
	Page.temporaryHandlers["resize"].push(caligoResize);
	
	window.addEventListener("scroll", caligoScroll);
	Page.temporaryHandlers["scroll"].push(caligoScroll);
	
	setTimeout(caligoResize, 500);
	setTimeout(caligoResize, 1000);
	
	
	
	//We're coming back from another page, so let's not just snap the background color abruptly.
	if (scroll !== 0)
	{
		document.documentElement.classList.add("background-transition");
		
		caligoScroll();
		
		setTimeout(() =>
		{
			document.documentElement.classList.remove("background-transition");
		}, Site.backgroundColorAnimationTime);
	}
	
	setTimeout(Page.Banner.ScrollButton.insert, 7000);
	
	
	
	Page.show();
	
	
	
	function caligoScroll()
	{
		if (Page.scroll >= 0)
		{
			updateBackground();
			
			updateScrollButton();
			
			updateEclipse();
		}
	}
	
	
	
	function updateBackground()
	{
		Page.backgroundColorChanged = true;
		
		if (Page.scroll === 0)
		{
			Page.backgroundColorChanged = false;
		}
		
		
		
		else if (Page.scroll <= window.innerHeight / 1.25)
		{
			backgroundColor = .5 + .5 * Math.sin(Math.PI * Math.max(1 - 1.25 * Page.scroll / window.innerHeight, 0) - .5 * Math.PI);
			
			if (Site.Settings.urlVars["theme"] === 1)
			{
				if (Site.Settings.urlVars["darkThemeColor"] === 1)
				{
					backgroundColor = 0;
				}
				
				else
				{
					backgroundColor *= 24;
				}
			}
				
			else
			{
				backgroundColor *= 255;
			}
			
			
			document.documentElement.style.backgroundColor = `rgb(${backgroundColor}, ${backgroundColor}, ${backgroundColor})`;
			
			Site.Settings.metaThemeColorElement.setAttribute("content", `rgb(${backgroundColor}, ${backgroundColor}, ${backgroundColor})`);
			
			if (backgroundColor === 0)
			{
				Page.Banner.doneLoading = true;
			}
			
			else
			{
				Page.Banner.doneLoading = false;
			}
		}
		
		else if (Page.Banner.doneLoading === false)
		{
			document.documentElement.style.backgroundColor = "rgb(0, 0, 0)";
			Site.Settings.metaThemeColorElement.setAttribute("content", "rgb(0, 0, 0)");
			Page.Banner.doneLoading = true;
		}
	}
	
	
	
	function updateScrollButton()
	{
		if (Page.scroll <= window.innerHeight / 3)
		{
			opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - 3 * Page.scroll / window.innerHeight, 0) - .5 * Math.PI);
			
			try {$("#scroll-button").style.opacity = opacity;}
			catch(ex) {}
			
			if (opacity === 0)
			{
				try {$("#scroll-button").remove();}
				catch(ex) {}
				
				Page.Banner.ScrollButton.doneLoading = true;
			}
			
			else
			{
				Page.Banner.ScrollButton.doneLoading = false;
			}
		}
		
		else if (Page.Banner.ScrollButton.doneLoading === false)
		{
			try {$("#scroll-button").remove();}
			catch(ex) {}
			
			Page.Banner.ScrollButton.doneLoading = true;
		}
	}
	
	
	
	function updateEclipse()
	{
		if (Page.scroll >= 4/5 * window.innerHeight && Page.scroll <= window.innerHeight * 6/5)
		{
			opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - 3.5 * (Page.scroll - (4/5 * window.innerHeight)) / window.innerHeight, 0) - .5 * Math.PI);
			
			$("#eclipse").style.opacity = 1 - opacity;
			
			if (opacity === 1)
			{
				eclipseDone = true;
			}
			
			else
			{
				eclipseDone = false;
			}
		}
		
		else if (scroll >= 6/5 * window.innerHeight && eclipseDone === false)
		{
			$("#eclipse").style.opacity = 1;
			
			eclipseDone = true;
		}
		
		else if (scroll <= 4/5 * window.innerHeight && eclipseDone === false)
		{
			$("#eclipse").style.opacity = 0;
			
			eclipseDone = true;
		}
	}
	
	
	
	function caligoResize()
	{
		$("#eclipse").style.height = $("#eclipse").offsetWidth + "px";
		$("#eclipse img").style.height = $("#eclipse").offsetWidth + "px";
		
		
		
		let maxWidth = 0;
		
		$$(".chapter-link a").forEach(element =>
		{
			let width = element.offsetWidth;
			
			if (width > maxWidth)
			{
				maxWidth = width;
			}
		});
		
		$$(".chapter-link").forEach(element => element.style.width = maxWidth + "px");
	}
	
	
	
	function adjustForSettings()
	{
		//Meet the jankiest solution ever. Putting things in the style files puts them at the top of the head, so even though they have !important, they're before the settings style, which ALSO has to have !important. It's a garbage fire.
		Site.addStyle(`
			#floating-footer-gradient
			{
				background: -moz-linear-gradient(top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%) !important;
				background: -webkit-linear-gradient(top, rgba(0,0,0,0) 0%,rgba(0,0,0,1) 100%) !important;
				background: linear-gradient(to bottom, rgba(0,0,0,0) 0%,rgba(0,0,0,1) 100%) !important;
			}
		`);
		
		
		
		if (Site.Settings.urlVars["contrast"] === 1)
		{
			Page.setElementStyles(".synopsis-text", "color", "rgb(192, 192, 192)");
			
			Page.setElementStyles(".body-text", "color", "rgb(192, 192, 192)");
			
			if (Site.Settings.urlVars["theme"] !== 1)
			{
				Page.setElementStyles(".hook-text", "color", "rgb(120, 120, 120)");
			}
			
			
			
			$("#email img").style.filter = "brightness(150%)";
			
			
			
			Page.setElementStyles(".stage-bubble", "border-color", "rgb(192, 192, 192)");
			
			Page.setElementStyles(".stage-bubble span", "background-color", "rgb(192, 192, 192)");
			
			
			
			Site.addStyle(`
				.line-break
				{
					background: -moz-linear-gradient(left, rgb(0,0,0) 0%, rgb(140,140,140) 50%, rgb(0,0,0) 100%);
					background: -webkit-linear-gradient(left, rgb(0,0,0) 0%,rgb(140,140,140) 50%,rgb(0,0,0) 100%);
					background: linear-gradient(to right, rgb(0,0,0) 0%,rgb(140,140,140) 50%,rgb(0,0,0) 100%);
				}
			`);
		}
		
		else
		{
			Site.addStyle(`
				.line-break
				{
					background: -moz-linear-gradient(left, rgb(0,0,0) 0%, rgb(92,92,92) 50%, rgb(0,0,0) 100%);
					background: -webkit-linear-gradient(left, rgb(0,0,0) 0%,rgb(92,92,92) 50%,rgb(0,0,0) 100%);
					background: linear-gradient(to right, rgb(0,0,0) 0%,rgb(92,92,92) 50%,rgb(0,0,0) 100%);
				}
			`);
			
			
			
			if (Site.Settings.urlVars["theme"] === 1)
			{
				Page.setElementStyles(".hook-text", "color", "rgb(120, 120, 120)");
			}
		}
	}
	}()