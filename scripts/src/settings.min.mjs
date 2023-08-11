import{cardIsOpen}from"./cards.min.mjs";const forceThemePages={"/gallery/":!0,"/slides/oral-exam/":!0},preventThemeChangePages=["/gallery/","/slides/oral-exam/","/writing/caracore/","/writing/caligo/"],rootElement=document.querySelector(":root"),metaThemeColorElement=document.querySelector("#theme-color-meta"),params=new URLSearchParams(document.location.search),siteSettings={darkTheme:window.matchMedia("(prefers-color-scheme: dark)").matches&&null===params.get("theme")||"1"===params.get("theme"),condensedApplets:"1"===params.get("condensedapplets")};let revertThemeTo=null;function setRevertThemeTo(e){revertThemeTo=e}let forcedTheme=!1;function setForcedTheme(e){forcedTheme=e}function revertTheme(){forcedTheme?forcedTheme=!1:null!==revertThemeTo&&(revertThemeTo=null,siteSettings.darkTheme!==revertThemeTo)&&toggleDarkTheme()}function toggleDarkTheme({noAnimation:e=!1,force:t=!1}){if(t||!preventThemeChangePages.includes(Page.url))if(siteSettings.darkTheme=!siteSettings.darkTheme,e){anime({targets:metaThemeColorElement,content:siteSettings.darkTheme?"#181818":"#ffffff",duration:2*Site.opacityAnimationTime,easing:"cubicBezier(.25, .1, .25, 1)"});const o={t:siteSettings.darkTheme?0:1};anime({targets:o,t:siteSettings.darkTheme?1:0,duration:2*Site.opacityAnimationTime,easing:"cubicBezier(.25, .1, .25, 1)",update:()=>{rootElement.style.setProperty("--theme",o.t)}})}else metaThemeColorElement.setAttribute("content",siteSettings.darkTheme?"#181818":"#ffffff"),rootElement.style.setProperty("--theme",siteSettings.darkTheme?1:0)}function condenseApplet(){Site.addStyle(`
		p:not(.text-box-subtext, .checkbox-subtext, .radio-button-subtext, .slider-subtext), h1, h2, header, footer, br
		{
			display: none;
		}
		
		section:first-of-type
		{
			margin-top: 0 !important;
			margin-bottom: 0 !important;
		}
		
		body
		{
			margin-top: -5vh;
		}

		#canvas-landscape
		{
			flex-direction: column !important;
		}

		#canvas-landscape-left, #canvas-landscape-middle, #canvas-landscape-right
		{
			width: 80% !important;
		}
	`);try{$("#download-button").parentNode.parentNode.style.display="none"}catch(e){}}window.matchMedia("(prefers-color-scheme: dark)").addListener(e=>{-1!==revertTheme||cardIsOpen||(e.matches&&!siteSettings.darkTheme||!e.matches&&siteSettings.darkTheme)&&toggleDarkTheme()}),siteSettings.darkTheme&&(siteSettings.darkTheme=!1,toggleTheme({noAnimation:!0}));const darkThemeStyle=`
	#header-container, .card
	{
		background-color: rgb(24, 24, 24);
	}
	
	#header-logo span, #header-links a span
	{
		color: rgb(255, 255, 255);
	}
	
	#header-logo.hover span, #header-links a.hover span
	{
		color: rgb(0, 0, 0);
	}
	
	#header-logo img, #header-links a img
	{
		filter: invert(1);
	}
	
	#header-logo.hover img, #header-links a.hover imginput
	{
		filter: invert(0) !important;
	}
	
	
	
	.heading-text, .date-text, .title-text
	{
		color: rgb(255, 255, 255);
	}
	
	.section-text, .quote-attribution, #card-close-button
	{
		color: rgb(220, 220, 220);
	}
	
	.body-text, .body-text span, .song-lyrics, .image-link-subtext, .quote-text
	{
		color: rgb(172, 172, 172);
	}
	
	a
	{
		color: rgb(144, 216, 144);
	}
	
	
	
	.text-box, .text-field, .input-cap-dialog
	{
		background-color: rgb(24, 24, 24);
		color: rgb(172, 172, 172);
		border-color: rgb(172, 172, 172);
	}
	
	.text-box:focus, .text-field:focus
	{
		color: rgb(255, 255, 255);
		border-color: rgb(255, 255, 255);
	}
	
	
	
	.checkbox-container > input ~ .checkbox, .radio-button-container > input ~ .radio-button
	{
		background-color: rgb(24, 24, 24);
	}

	.checkbox-container > input:checked ~ .checkbox, .radio-button-container > input:checked ~ .radio-button
	{
		background-color: rgb(172, 172, 172);
	}
	
	.text-button, .checkbox-container, .output-canvas, .desmos-border
	{
		border-color: rgb(172, 172, 172);
	}
	
	
	
	.tex-holder
	{
		background-color: rgba(24, 24, 24, 0);
		
		box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 1);
	}
	
	.tex-holder.hover
	{
		box-shadow: 0px 0px 16px 2px rgba(0, 0, 0, 1);
	}
	
	.card
	{
		box-shadow: 0px 0px 16px 4px rgba(0, 0, 0, 1);
	}
	
	#card-close-button
	{
		background-color: rgb(24, 24, 24);
	}
	
	#card-close-button.hover
	{
		background-color: rgb(64, 64, 64);
	}
`;export{forceThemePages,metaThemeColorElement,siteSettings,setRevertThemeTo,setForcedTheme,revertTheme,toggleDarkTheme,condenseApplet};