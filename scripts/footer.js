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
	
	
	
	let vars_no_return = concat_url_vars(false);
			
	if (vars_no_return.indexOf("&") == -1)
	{
		vars_no_return = "";
	}
	
	else
	{
		vars_no_return = vars_no_return.substring(vars_no_return.indexOf("&"));
	}
	
	
	
	let vars_return = concat_url_vars(true);
			
	if (vars_return.indexOf("&") == -1)
	{
		vars_return = "";
	}
	
	else
	{
		vars_return = vars_return.substring(vars_return.indexOf("&"));
	}

	
	
	document.querySelector("#spawn-footer").insertAdjacentHTML("afterend", `
		<div style="position: relative">
			<div data-aos="zoom-out" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu" style="position: absolute; bottom: 6.5px; left: 10px">
				<a href="/index.html?page=%2Fsettings.html${vars_return}">
					<input type="image" class="footer-button" src="/graphics/button-icons/gear.png" alt="Change Theme" onclick="redirect('/settings.html', 0${fnc_arg})">
				</a>
			</div>
			
			<div data-aos="zoom-out" data-aos-delay="1000" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu" style="position: absolute; bottom: 6.5px; right: 10px">
				<a href="/index.html?page=%2Fpwa.html${vars_no_return}">
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
				<a href="/index.html?page=%2Fwriting%2Fwriting.html${vars_no_return}">
					<img onclick="redirect('/writing/writing.html', 0${fnc_arg})" src="/writing/cover.${extension}" alt="Writing"></img>
				</a>
			</div>
		`;
		
		delay += 100;
	}
	
	if (page_settings["footer_exclusion"] != "teaching")
	{
		let element = document.createElement("div");
		
		document.querySelector("#footer-image-links").appendChild(element);
		
		element.outerHTML = `
			<div id="teaching-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
				<a href="/index.html?page=%2Fteaching%2Fteaching.html${vars_no_return}">
					<img onclick="redirect('/teaching/teaching.html', 0${fnc_arg})" src="/teaching/cover.${extension}" alt="Teaching"></img>
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
				<a href="index.html?page=%2Fapplets%2Fapplets.html${vars_no_return}">
					<img onclick="redirect('/applets/applets.html', 0${fnc_arg})" src="/applets/cover.${extension}" alt="Applets"></img>
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
				<a href="/index.html?page=%2Fblog%2Fblog.html${vars_no_return}">
					<img onclick="redirect('/blog/blog.html', 0${fnc_arg})" src="/blog/cover.${extension}" alt="Blog"></img>
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
				<a href="/index.html?page=%2Fnotes%2Fnotes.html${vars_no_return}">
					<img onclick="redirect('/notes/notes.html', 0${fnc_arg})" src="/notes/cover.${extension}" alt="Notes"></img>
				</a>
			</div>
		`;
		
		delay += 100;
	}
	
	if (page_settings["footer_exclusion"] != "about")
	{
		let element = document.createElement("div");
		
		document.querySelector("#footer-image-links").appendChild(element);
		
		element.outerHTML = `
			<div id="about-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
				<a href="/index.html?page=%2Fabout%2Fabout.html${vars_no_return}">
					<img onclick="redirect('/about/about.html', 0${fnc_arg})" src="/about/cover.${extension}" alt="About"></img>
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
}