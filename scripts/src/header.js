import { addHoverEvent } from "./hoverEvents.js";
import { redirect } from "./navigation.js";
import { toggleDarkTheme } from "./settings.js";

export let headerElement;

export function addHeader()
{
	document.body.firstChild.insertAdjacentHTML("beforebegin", `
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
	`);

	setTimeout(() =>
	{
		const imageElement = document.body.querySelector("#header-logo img");

		imageElement.style.width = `${imageElement.getBoundingClientRect().height}px`;



		document.body.querySelectorAll("#header-logo, #header-links a").forEach(link =>
		{
			addHoverEvent(link);

			const href = link.getAttribute("href");

			link.setAttribute("href", "/index.html?page=" + encodeURIComponent(href));

			link.addEventListener("click", e =>
			{
				e.preventDefault();

				redirect({ url: href });
			});
		});



		const element = document.body.querySelector("#header-theme-button");

		addHoverEvent(element);

		element.addEventListener("click", () => toggleDarkTheme({}));



		headerElement = document.body.querySelector("#header");
	});
}