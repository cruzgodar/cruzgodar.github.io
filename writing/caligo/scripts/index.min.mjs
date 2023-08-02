let backgroundColor=255,opacity=0,eclipseDone=!1;function caligoScroll(){0<=Page.scroll&&(updateBackground(),updateEclipse())}function updateBackground(){Page.backgroundColorChanged=!0,0===Page.scroll?Page.backgroundColorChanged=!1:Page.scroll<=window.innerHeight/1.25?(backgroundColor=.5+.5*Math.sin(Math.PI*Math.max(1-1.25*Page.scroll/window.innerHeight,0)-.5*Math.PI),1===Site.Settings.urlVars.theme?1===Site.Settings.urlVars.darkThemeColor?backgroundColor=0:backgroundColor*=24:backgroundColor*=255,document.documentElement.style.backgroundColor=`rgb(${backgroundColor}, ${backgroundColor}, ${backgroundColor})`,Site.Settings.metaThemeColorElement.setAttribute("content",`rgb(${backgroundColor}, ${backgroundColor}, ${backgroundColor})`),0===backgroundColor?setBannerDoneLoading(!0):setBannerDoneLoading(!1)):bannerDoneLoading||(document.documentElement.style.backgroundColor="rgb(0, 0, 0)",Site.Settings.metaThemeColorElement.setAttribute("content","rgb(0, 0, 0)"),setBannerDoneLoading(!0))}function updateEclipse(){Page.scroll>=.8*window.innerHeight&&Page.scroll<=6*window.innerHeight/5?(opacity=.5+.5*Math.sin(Math.PI*Math.max(1-3.5*(Page.scroll-.8*window.innerHeight)/window.innerHeight,0)-.5*Math.PI),$("#eclipse").style.opacity=1-opacity,eclipseDone=1===opacity):scroll>=1.2*window.innerHeight&&!eclipseDone?($("#eclipse").style.opacity=1,eclipseDone=!0):scroll<=.8*window.innerHeight&&!eclipseDone&&($("#eclipse").style.opacity=0,eclipseDone=!0)}function caligoResize(){$("#eclipse").style.height=$("#eclipse").offsetWidth+"px",$("#eclipse img").style.height=$("#eclipse").offsetWidth+"px";let t=0;$$(".chapter-link a").forEach(e=>{e=e.offsetWidth;e>t&&(t=e)}),$$(".chapter-link").forEach(e=>e.style.width=t+"px")}function adjustForSettings(){Site.addStyle(`
		#floating-footer-gradient
		{
			background: -moz-linear-gradient(top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%) !important;
			background: -webkit-linear-gradient(top, rgba(0,0,0,0) 0%,rgba(0,0,0,1) 100%) !important;
			background: linear-gradient(to bottom, rgba(0,0,0,0) 0%,rgba(0,0,0,1) 100%) !important;
		}
	`),1===Site.Settings.urlVars.contrast?(Page.setElementStyles(".synopsis-text","color","rgb(192, 192, 192)"),Page.setElementStyles(".body-text","color","rgb(192, 192, 192)"),1!==Site.Settings.urlVars.theme&&Page.setElementStyles(".hook-text","color","rgb(120, 120, 120)"),$("#email img").style.filter="brightness(150%)",Page.setElementStyles(".stage-bubble","border-color","rgb(192, 192, 192)"),Page.setElementStyles(".stage-bubble span","background-color","rgb(192, 192, 192)"),Site.addStyle(`
			.line-break
			{
				background: -moz-linear-gradient(left, rgb(0,0,0) 0%, rgb(140,140,140) 50%, rgb(0,0,0) 100%);
				background: -webkit-linear-gradient(left, rgb(0,0,0) 0%,rgb(140,140,140) 50%,rgb(0,0,0) 100%);
				background: linear-gradient(to right, rgb(0,0,0) 0%,rgb(140,140,140) 50%,rgb(0,0,0) 100%);
			}
		`)):(Site.addStyle(`
			.line-break
			{
				background: -moz-linear-gradient(left, rgb(0,0,0) 0%, rgb(92,92,92) 50%, rgb(0,0,0) 100%);
				background: -webkit-linear-gradient(left, rgb(0,0,0) 0%,rgb(92,92,92) 50%,rgb(0,0,0) 100%);
				background: linear-gradient(to right, rgb(0,0,0) 0%,rgb(92,92,92) 50%,rgb(0,0,0) 100%);
			}
		`),1===Site.Settings.urlVars.theme&&Page.setElementStyles(".hook-text","color","rgb(120, 120, 120)"))}function load(){backgroundColor=255,opacity=0,setBannerOpacity(1),setScrollButtonDoneLoading(!0),eclipseDone=!1,setTimeout(adjustForSettings,500),$("#eclipse").style.height=$("#eclipse").offsetWidth+"px",$("#eclipse img").style.height=$("#eclipse").offsetWidth+"px",window.addEventListener("resize",caligoResize),Page.temporaryHandlers.resize.push(caligoResize),window.addEventListener("scroll",caligoScroll),Page.temporaryHandlers.scroll.push(caligoScroll),setTimeout(caligoResize,500),setTimeout(caligoResize,1e3),0!==scroll&&(document.documentElement.classList.add("background-transition"),caligoScroll(),setTimeout(()=>{document.documentElement.classList.remove("background-transition")},Site.backgroundColorAnimationTime)),setTimeout(insertScrollButton,7e3),Page.show()}export{load};