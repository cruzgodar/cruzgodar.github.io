import{fadeUpIn,fadeDownIn,fadeLeftIn,fadeRightIn,fadeIn}from"./animation.mjs";import{setUpBanner,bannerElement,bannerOpacity}from"./banners.mjs";import{setUpTextButtons,setUpNavButtons,setUpDropdowns}from"./buttons.mjs";import{setUpCards}from"./cards.mjs";import{addHoverEvent,setUpHoverEvents,setUpFocusEvents}from"./hover-events.mjs";import{typesetMath}from"./math.mjs";import{redirect,navigationTransitionType}from"./navigation.mjs";let headerElement=null;async function loadPage(){window.dispatchEvent(new Event("scroll")),window.dispatchEvent(new Event("resize")),Page.element=document.body.querySelector(".page"),$=e=>Page.element.querySelector(e),$$=e=>Page.element.querySelectorAll(e);try{document.head.querySelector("title").textContent=Site.sitemap[Page.url].title}catch(e){}setUpBanner(),loadCustomStyle(),loadCustomScripts(),equalizeAppletColumns(),setLinks(),disableLinks(),setUpHoverEvents(),setUpTextButtons(),setUpNavButtons(),setUpDropdowns(),typesetMath(),setUpCards(),Page.backgroundColorChanged=!1,Site.Settings.handleThemeRevert(),1===Site.Settings.urlVars.condensedApplets&&"/applets/"===Site.sitemap[Page.url].parent&&Site.Settings.condenseApplet(),setTimeout(()=>setUpFocusEvents(),50)}async function showPage(){await new Promise((e,t)=>setTimeout(e,10)),await fadeInPage()}function loadCustomStyle(){fetch(Page.url+"style/index."+(window.DEBUG?"css":"min.css")).then(e=>e.text()).then(e=>{var t=document.createElement("style");t.textContent=e,t.classList.add("temporary-style"),document.head.insertBefore(t,document.head.firstChild)}).catch(e=>{})}function loadCustomScripts(){import(Page.url+"scripts/index."+(window.DEBUG?"mjs":"min.mjs")).then(e=>e.load()).catch(()=>{setTimeout(()=>showPage(),1)})}function addHeader(){document.body.firstChild.insertAdjacentHTML("beforebegin",`
		<div id="header-container"></div>
		
		<div id="header">
			<a id="header-logo" href="/home/">
				<img src="/graphics/header-icons/logo.webp"></img>
				<span>Cruz Godar</span>
			</a>
			
			<div id="header-links">
				<a id="header-gallery-link" href="/gallery/">
					<span>Gallery</span>
					<img src="/graphics/header-icons/gallery.webp"></img>
				</a>
				
				<a id="header-applets-link" href="/applets/">
					<span>Applets</span>
					<img src="/graphics/header-icons/applets.webp"></img>
				</a>
				
				<a id="header-teaching-link" href="/teaching/">
					<span>Teaching</span>
					<img src="/graphics/header-icons/teaching.webp"></img>
				</a>
				
				<a id="header-slides-link" href="/slides/">
					<span>Slides</span>
					<img src="/graphics/header-icons/slides.webp"></img>
				</a>
				
				<a id="header-writing-link" href="/writing/">
					<span>Writing</span>
					<img src="/graphics/header-icons/writing.webp"></img>
				</a>
				
				<a id="header-about-link" href="/about/">
					<span>About</span>
					<img src="/graphics/header-icons/about.webp"></img>
				</a>
			</div>
			
			<div id="header-theme-button" class="${1===Site.Settings.urlVars.theme?"active":""}">
				<input type="image" src="/graphics/header-icons/moon.webp">
			</div>
		</div>
	`),setTimeout(()=>{var e=document.body.querySelector("#header-logo img"),e=(e.style.width=e.getBoundingClientRect().height+"px",document.body.querySelectorAll("#header-logo, #header-links a").forEach(e=>{addHoverEvent(e);const t=e.getAttribute("href");e.setAttribute("href","/index.html?page="+encodeURIComponent(t)),e.addEventListener("click",e=>{e.preventDefault(),redirect({url:t})})}),document.body.querySelector("#header-theme-button"));addHoverEvent(e),e.addEventListener("click",()=>Site.Settings.toggleTheme()),headerElement=document.body.querySelector("#header")})}async function fadeInPage(){await(1===navigationTransitionType?bannerElement?Promise.all([fadeUpIn(bannerElement,2*Site.pageAnimationTime,bannerOpacity),fadeUpIn(Page.element,2*Site.pageAnimationTime)]):fadeUpIn(Page.element,2*Site.pageAnimationTime):-1===navigationTransitionType?bannerElement?Promise.all([fadeDownIn(bannerElement,2*Site.pageAnimationTime,bannerOpacity),fadeDownIn(Page.element,2*Site.pageAnimationTime)]):fadeDownIn(Page.element,2*Site.pageAnimationTime):2===navigationTransitionType?bannerElement?Promise.all([fadeLeftIn(bannerElement,2*Site.pageAnimationTime,bannerOpacity),fadeLeftIn(Page.element,2*Site.pageAnimationTime)]):fadeLeftIn(Page.element,2*Site.pageAnimationTime):-2===navigationTransitionType?bannerElement?Promise.all([fadeRightIn(bannerElement,2*Site.pageAnimationTime,bannerOpacity),fadeRightIn(Page.element,2*Site.pageAnimationTime)]):fadeRightIn(Page.element,2*Site.pageAnimationTime):bannerElement?Promise.all([fadeIn(bannerElement,2*Site.pageAnimationTime,bannerOpacity),fadeIn(Page.element,2*Site.pageAnimationTime)]):fadeIn(Page.element,2*Site.pageAnimationTime))}function setLinks(){$$("a").forEach(e=>{const t=e.getAttribute("href");if(null!==t){const n=!("https"!==t.slice(0,5)&&"data"!==t.slice(0,4)&&1!=e.getAttribute("data-in-new-tab"));e.addEventListener("click",()=>redirect({url:t,inNewTab:n}))}})}function disableLinks(){$$("a:not(.real-link)").forEach(e=>e.addEventListener("click",e=>e.preventDefault()))}export{headerElement,loadPage,showPage,addHeader,disableLinks};