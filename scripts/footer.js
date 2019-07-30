//Inserts the footer at the bottom of the page.



let footer_done = false;

function insert_footer()
{
	let fnc_arg = "";

	if (page_settings["footer_from_nonstandard_color"])
	{
		fnc_arg = ", true";
	}



	let delay = 100;

	let extension = "";



	if (supports_webp)
	{
		extension = "webp";
	}
	
	else
	{
		extension = "jpg";
	}

	
	
	document.querySelector("#spawn-footer").insertAdjacentHTML("afterend", `
		<div style="position: relative">
			<div data-aos="zoom-out" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu" style="position: absolute; bottom: 6.5px; left: 10px">
				<a href="/settings.html${concat_url_vars(false)}">
					<input type="image" class="footer-button" src="/graphics/button-icons/gear.png" alt="Change Theme" onclick="redirect('/settings.html', 0${fnc_arg})">
				</a>
			</div>
			
			<div data-aos="zoom-out" data-aos-delay="1000" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu" style="position: absolute; bottom: 6.5px; right: 10px">
				<a href="/pwa.html${concat_url_vars(false)}">
					<input type="image" id="pwa-button" class="footer-button" src="/graphics/button-icons/app.png" alt="Progressive Web App Info" onclick="redirect('/pwa.html', 0${fnc_arg})">
				</a>
			</div>
		</div>
	`);
	
	document.querySelector("#spawn-footer").insertAdjacentHTML("afterend", `
		<div style="position: relative">
			<div id="trigger-menu" style="position: absolute; bottom: 5px"></div>
		</div>
	`);
	
	
	
	if (page_settings["footer_exclusion"] == "")
	{
		document.querySelector("#spawn-footer").insertAdjacentHTML("afterend", `
			<div style="height: 30vh"></div>
				<div data-aos="fade-in" data-aos-duration="500" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
					<div class="line-break" style="width: 80vw"></div>
				</div>
			<div style="height: 4vw"></div>
			
			<nav id="footer-image-links" style="width: 68vw"></nav>
		`);
	}
	
	else
	{
		document.querySelector("#spawn-footer").insertAdjacentHTML("afterend", `
			<div style="height: 30vh"></div>
				<div data-aos="fade-in" data-aos-duration="500" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
					<div class="line-break"></div>
				</div>
			<div style="height: 4vw"></div>
			
			<nav id="footer-image-links"></nav>
		`);
	}
			
			
	
	if (page_settings["footer_exclusion"] != "writing")
	{
		let element = document.createElement("div");
		
		document.querySelector("#footer-image-links").appendChild(element);
		
		element.outerHTML = `
			<div id="writing-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
				<a href="/writing/writing.html${concat_url_vars(false)}">
					<img onclick="redirect('/writing/writing.html', 0${fnc_arg})" src="/writing/cover.${extension}" alt="Writing"></img>
				</a>
			</div>
		`;
		
		delay += 100;
	}
	
	if (page_settings["footer_exclusion"] != "blog")
	{
		let element = document.createElement("div");
		
		document.querySelector("#footer-image-links").appendChild(element);
		
		element.outerHTML = `
			<div id="blog-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
				<a href="/blog/blog.html${concat_url_vars(false)}">
					<img onclick="redirect('/blog/blog.html', 0${fnc_arg})" src="/blog/cover.${extension}" alt="Blog"></img>
				</a>
			</div>
		`;
		
		delay += 100;
	}
	
	if (page_settings["footer_exclusion"] != "applets")
	{
		let element = document.createElement("div");
		
		document.querySelector("#footer-image-links").appendChild(element);
		
		element.outerHTML = `
			<div id="applets-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
				<a href="/applets/applets.html${concat_url_vars(false)}">
					<img onclick="redirect('/applets/applets.html', 0${fnc_arg})" src="/applets/cover.${extension}" alt="Applets"></img>
				</a>
			</div>
		`;
		
		delay += 100;
	}
	
	if (page_settings["footer_exclusion"] != "research")
	{
		let element = document.createElement("div");
		
		document.querySelector("#footer-image-links").appendChild(element);
		
		element.outerHTML = `
			<div id="research-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
				<a href="/research/research.html${concat_url_vars(false)}">
					<img onclick="redirect('/research/research.html', 0${fnc_arg})" src="/research/cover.${extension}" alt="Research"></img>
				</a>
			</div>
		`;
		
		delay += 100;
	}
	
	if (page_settings["footer_exclusion"] != "notes")
	{
		let element = document.createElement("div");
		
		document.querySelector("#footer-image-links").appendChild(element);
		
		element.outerHTML = `
			<div id="notes-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
				<a href="/notes/notes.html${concat_url_vars(false)}">
					<img onclick="redirect('/notes/notes.html', 0${fnc_arg})" src="/notes/cover.${extension}" alt="Notes"></img>
				</a>
			</div>
		`;
		
		delay += 100;
	}
	
	if (page_settings["footer_exclusion"] != "bio")
	{
		let element = document.createElement("div");
		
		document.querySelector("#footer-image-links").appendChild(element);
		
		element.outerHTML = `
			<div id="bio-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
				<a href="/bio/bio.html${concat_url_vars(false)}">
					<img onclick="redirect(\'/bio/bio.html\', 0${fnc_arg})" src="/bio/cover.${extension}" alt="Me"></img>
				</a>
			</div>
		`;
		
		delay += 100;
	}
	
	
	
	document.querySelector("#pwa-button").parentNode.parentNode.setAttribute("data-aos-delay", delay);
	
	
	
	if (url_vars["content_animation"] == 1)
	{
		try
		{
			let elements = document.querySelectorAll(".line-break");
			
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].parentNode.removeAttribute("data-aos");
			}
		}
		
		catch(ex) {}
		
		
		
		try
		{
			let elements = document.querySelectorAll(".footer-image-link");
			
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].removeAttribute("data-aos");
			}
		}
		
		catch(ex) {}
		
		
		
		try
		{
			let elements = document.querySelectorAll(".footer-button");
			
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].parentNode.parentNode.removeAttribute("data-aos");
			}
		}
		
		catch(ex) {}
	}
	
	
	
	//If the page isn't as tall as the screen (e.g. the 404 page), move the footer to the bottom of the page.
	if (document.body.clientHeight < window_height)
	{
		document.querySelector("#spawn-footer").insertAdjacentHTML("beforebegin", `
			<div style="height: ${window_height - document.body.clientHeight}px"></div>
		`);
	}
	
	
	
	footer_done = true;
	
	
	
	set_links();
}