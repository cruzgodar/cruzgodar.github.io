import{opacityAnimationTime}from"./animation.min.mjs";import{cardIsOpen}from"./cards.min.mjs";import{recreateDesmosGraphs}from"./desmos.min.mjs";import{$,addStyle,pageUrl}from"./main.min.mjs";import{getDisplayUrl}from"./navigation.min.mjs";import anime from"/scripts/anime.js";const forceThemePages={"/gallery/":!0,"/slides/oral-exam/":!0},preventThemeChangePages=["/gallery/","/slides/oral-exam/","/writing/caracore/","/writing/caligo/"],rootElement=document.querySelector(":root"),metaThemeColorElement=document.querySelector("#theme-color-meta"),params=new URLSearchParams(window.location.search),darkTheme=null===params.get("theme")?window.matchMedia("(prefers-color-scheme: dark)").matches:"1"===params.get("theme"),siteSettings={darkTheme:darkTheme,condensedApplets:"1"===params.get("condensedapplets")};function getQueryParams(){var e=[];return siteSettings.darkTheme&&!window.matchMedia("(prefers-color-scheme: dark)").matches?e.push("theme=1"):!siteSettings.darkTheme&&window.matchMedia("(prefers-color-scheme: dark)").matches&&e.push("theme=0"),window.DEBUG&&e.push("debug=1"),0!==e.length?"?"+e.join("&"):""}let revertThemeTo=null;function setRevertThemeTo(e){revertThemeTo=e}let forcedTheme=!1;function setForcedTheme(e){forcedTheme=e}function setUpDarkTheme(){window.matchMedia("(prefers-color-scheme: dark)").addListener(e=>{-1!==revertTheme||cardIsOpen||(e.matches&&!siteSettings.darkTheme||!e.matches&&siteSettings.darkTheme)&&toggleDarkTheme()}),void 0!==forceThemePages[pageUrl]?(siteSettings.darkTheme=forceThemePages[pageUrl],toggleDarkTheme({noAnimation:!(siteSettings.darkTheme=!1),force:!0})):siteSettings.darkTheme&&toggleDarkTheme({noAnimation:!(siteSettings.darkTheme=!1)})}function revertTheme(){forcedTheme?forcedTheme=!1:null!==revertThemeTo&&(revertThemeTo=null,siteSettings.darkTheme!==revertThemeTo)&&toggleDarkTheme({})}async function toggleDarkTheme({noAnimation:e=!1,force:t=!1}){if(t||!preventThemeChangePages.includes(pageUrl))if(siteSettings.darkTheme=!siteSettings.darkTheme,recreateDesmosGraphs(),history.replaceState({url:pageUrl},document.title,getDisplayUrl()),e)metaThemeColorElement.setAttribute("content",siteSettings.darkTheme?"#181818":"#ffffff"),rootElement.style.setProperty("--theme",siteSettings.darkTheme?1:0);else{t=addStyle(`
			*:not(.page, #banner, .desmos-container)
			{
				transition: none !important;
			}
		`);const r={t:siteSettings.darkTheme?0:1};await Promise.all([anime({targets:metaThemeColorElement,content:siteSettings.darkTheme?"#181818":"#ffffff",duration:2*opacityAnimationTime,easing:"cubicBezier(.25, .1, .25, 1)"}).finished,anime({targets:r,t:siteSettings.darkTheme?1:0,duration:2*opacityAnimationTime,easing:"cubicBezier(.25, .1, .25, 1)",update:()=>{rootElement.style.setProperty("--theme",r.t)}}).finished]),t.remove()}}function condenseApplet(){addStyle(`
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
	`);var e=$("#download-button");e?.parentNode?.parentNode&&(e.parentNode.parentNode.style.display="none")}export{forceThemePages,preventThemeChangePages,metaThemeColorElement,siteSettings,getQueryParams,setRevertThemeTo,setForcedTheme,setUpDarkTheme,revertTheme,toggleDarkTheme,condenseApplet};