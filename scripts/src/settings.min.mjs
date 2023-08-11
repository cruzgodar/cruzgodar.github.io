import{cardIsOpen}from"./cards.min.mjs";const forceThemePages={"/gallery/":!0,"/slides/oral-exam/":!0},preventThemeChangePages=["/gallery/","/slides/oral-exam/","/writing/caracore/","/writing/caligo/"],rootElement=document.querySelector(":root"),metaThemeColorElement=document.querySelector("#theme-color-meta"),params=new URLSearchParams(document.location.search),siteSettings={darkTheme:window.matchMedia("(prefers-color-scheme: dark)").matches&&null===params.get("theme")||"1"===params.get("theme"),condensedApplets:"1"===params.get("condensedapplets")};let revertThemeTo=null;function setRevertThemeTo(e){revertThemeTo=e}let forcedTheme=!1;function setForcedTheme(e){forcedTheme=e}function revertTheme(){forcedTheme?forcedTheme=!1:null!==revertThemeTo&&(revertThemeTo=null,siteSettings.darkTheme!==revertThemeTo)&&toggleDarkTheme({})}function toggleDarkTheme({noAnimation:e=!1,force:t=!1}){if(t||!preventThemeChangePages.includes(Page.url))if(siteSettings.darkTheme=!siteSettings.darkTheme,e)metaThemeColorElement.setAttribute("content",siteSettings.darkTheme?"#181818":"#ffffff"),rootElement.style.setProperty("--theme",siteSettings.darkTheme?1:0);else{const r=Site.addStyle(`
			*
			{
				transition: none !important;
			}
		`),a=(anime({targets:metaThemeColorElement,content:siteSettings.darkTheme?"#181818":"#ffffff",duration:2*Site.opacityAnimationTime,easing:"cubicBezier(.25, .1, .25, 1)"}),{t:siteSettings.darkTheme?0:1});anime({targets:a,t:siteSettings.darkTheme?1:0,duration:2*Site.opacityAnimationTime,easing:"cubicBezier(.25, .1, .25, 1)",update:()=>{rootElement.style.setProperty("--theme",a.t)},complete:()=>r.remove()})}}function condenseApplet(){Site.addStyle(`
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
	`);try{$("#download-button").parentNode.parentNode.style.display="none"}catch(e){}}window.matchMedia("(prefers-color-scheme: dark)").addListener(e=>{-1!==revertTheme||cardIsOpen||(e.matches&&!siteSettings.darkTheme||!e.matches&&siteSettings.darkTheme)&&toggleDarkTheme()}),siteSettings.darkTheme&&toggleDarkTheme({noAnimation:!(siteSettings.darkTheme=!1)});export{forceThemePages,preventThemeChangePages,metaThemeColorElement,siteSettings,setRevertThemeTo,setForcedTheme,revertTheme,toggleDarkTheme,condenseApplet};