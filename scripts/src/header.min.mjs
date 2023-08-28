import{addHoverEvent}from"./hover-events.min.mjs";import{redirect}from"./navigation.min.mjs";import{toggleDarkTheme}from"./settings.min.mjs";let headerElement=null;function addHeader(){document.body.firstChild.insertAdjacentHTML("beforebegin",`
		<div id="header-container" style="opacity: 0"></div>
		
		<div id="header" style="opacity: 0">
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
			
			<div id="header-theme-button">
				<input type="image" src="/graphics/header-icons/moon.webp">
			</div>
		</div>
	`),setTimeout(()=>{var e=document.body.querySelector("#header-logo img"),e=(e.style.width=e.getBoundingClientRect().height+"px",document.body.querySelectorAll("#header-logo, #header-links a").forEach(link=>{addHoverEvent(link);const i=link.getAttribute("href");link.setAttribute("href","/index.html?page="+encodeURIComponent(i)),link.addEventListener("click",e=>{e.preventDefault(),redirect({url:i})})}),document.body.querySelector("#header-theme-button"));addHoverEvent(e),e.addEventListener("click",()=>toggleDarkTheme({})),headerElement=document.body.querySelector("#header")})}export{headerElement,addHeader};