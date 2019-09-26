//Inserts the footer at the bottom of the page.



function insert_footer()
{
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
		<div class="footer-buttons" style="position: relative">
			<div data-aos="zoom-out" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu" style="position: absolute; bottom: 6.5px; left: 10px">
				<a href="/index.html?page=%2Fsettings%2Fsettings.html${vars_return}">
					<input type="image" class="footer-button" src="/graphics/button-icons/gear.png" alt="Change Theme" onclick="redirect('/settings/settings.html')">
				</a>
			</div>
			
			<div data-aos="zoom-out" data-aos-delay="1000" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu" style="position: absolute; bottom: 6.5px; right: 10px">
				<a href="/index.html?page=%2Fpwa%2Fpwa.html${vars_no_return}">
					<input type="image" id="pwa-button" class="footer-button" src="/graphics/button-icons/app.png" alt="Progressive Web App Info" onclick="redirect('/pwa/pwa.html')">
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
				<div class="line-break-container" data-aos="fade-in" data-aos-duration="500" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
					<div class="line-break" style="width: 80vw !important"></div>
				</div>
			<div style="height: 3vw"></div>
			
			<nav class="footer-image-links" style="width: 74vw"></nav>
		`);
	}
	
	else
	{
		document.querySelector("#spawn-footer").insertAdjacentHTML("afterend", `
			<div style="height: 30vh"></div>
				<div class="line-break-container" data-aos="fade-in" data-aos-duration="500" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
					<div class="line-break" style="width: 70vw !important"></div>
				</div>
			<div style="height: 3vw"></div>
			
			<nav class="footer-image-links"></nav>
		`);
	}
			
			
	
	if (page_settings["footer_exclusion"] != "writing")
	{
		let element = document.createElement("div");
		
		document.querySelector(".footer-image-links").appendChild(element);
		
		element.outerHTML = `
			<div id="writing-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
				<a href="/index.html?page=%2Fwriting%2Fwriting.html${vars_no_return}">
					<img onclick="redirect('/writing/writing.html')" src="/writing/cover.${extension}" alt="Writing"></img>
				</a>
			</div>
		`;
		
		delay += 100;
	}
	
	if (page_settings["footer_exclusion"] != "teaching")
	{
		let element = document.createElement("div");
		
		document.querySelector(".footer-image-links").appendChild(element);
		
		element.outerHTML = `
			<div id="teaching-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
				<a href="/index.html?page=%2Fteaching%2Fteaching.html${vars_no_return}">
					<img onclick="redirect('/teaching/teaching.html')" src="/teaching/cover.${extension}" alt="Teaching"></img>
				</a>
			</div>
		`;
		
		delay += 100;
	}
	
	if (page_settings["footer_exclusion"] != "applets")
	{
		let element = document.createElement("div");
		
		document.querySelector(".footer-image-links").appendChild(element);
		
		element.outerHTML = `
			<div id="applets-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
				<a href="index.html?page=%2Fapplets%2Fapplets.html${vars_no_return}">
					<img onclick="redirect('/applets/applets.html')" src="/applets/cover.${extension}" alt="Applets"></img>
				</a>
			</div>
		`;
		
		delay += 100;
	}
	
	if (page_settings["footer_exclusion"] != "blog")
	{
		let element = document.createElement("div");
		
		document.querySelector(".footer-image-links").appendChild(element);
		
		element.outerHTML = `
			<div id="blog-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
				<a href="/index.html?page=%2Fblog%2Fblog.html${vars_no_return}">
					<img onclick="redirect('/blog/blog.html')" src="/blog/cover.${extension}" alt="Blog"></img>
				</a>
			</div>
		`;
		
		delay += 100;
	}
	
	if (page_settings["footer_exclusion"] != "notes")
	{
		let element = document.createElement("div");
		
		document.querySelector(".footer-image-links").appendChild(element);
		
		element.outerHTML = `
			<div id="notes-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
				<a href="/index.html?page=%2Fnotes%2Fnotes.html${vars_no_return}">
					<img onclick="redirect('/notes/notes.html')" src="/notes/cover.${extension}" alt="Notes"></img>
				</a>
			</div>
		`;
		
		delay += 100;
	}
	
	if (page_settings["footer_exclusion"] != "bio")
	{
		let element = document.createElement("div");
		
		document.querySelector(".footer-image-links").appendChild(element);
		
		element.outerHTML = `
			<div id="about-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
				<a href="/index.html?page=%2Fbio%2Fbio.html${vars_no_return}">
					<img onclick="redirect('/bio/bio.html')" src="/bio/cover.${extension}" alt="Me"></img>
				</a>
			</div>
		`;
		
		delay += 100;
	}
	
	if (page_settings["footer_exclusion"] != "about")
	{
		let element = document.createElement("div");
		
		document.querySelector(".footer-image-links").appendChild(element);
		
		element.outerHTML = `
			<div id="about-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
				<a href="/index.html?page=%2Fabout%2Fabout.html${vars_no_return}">
					<img onclick="redirect('/about/about.html')" src="/about/cover.${extension}" alt="About"></img>
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
	
	
	
	set_up_floating_footer();
	
	
	
	//If we restored a scroll position that was supposed to be in the footer, we aren't
	if (scroll > 0)
	{
		window.scrollTo(0, scroll);
	}
}



//Initializes the floating footer by copying specific parts of the normal footer.
function set_up_floating_footer()
{
	let floating_footer_element = document.createElement("footer");
	floating_footer_element.classList.add("floating-footer");
	
	document.body.insertBefore(floating_footer_element, document.body.firstChild);
	
	
	
	floating_footer_element.innerHTML = `
		<div class="floating-footer-gradient"></div>
		
		<div class="floating-footer-content">
			<div style="height: 30px"></div>
		</div>
	`;
	
	
	
	//We want all the footer image links, but we don't want the animations anchored to anything.
	element = document.querySelector("#spawn-footer").parentNode.querySelector(".footer-image-links").cloneNode(true);
	
	for (let i = 0; i < element.children.length; i++)
	{
		element.children[i].removeAttribute("data-aos-anchor");
	}
	
	document.querySelector(".floating-footer-content").appendChild(element);
	
	
	
	//Next, we want the footer buttons.
	element = document.querySelector("#spawn-footer").parentNode.querySelector(".footer-buttons").cloneNode(true);
	
	for (let i = 0; i < element.children.length; i++)
	{
		element.children[i].removeAttribute("data-aos-anchor");
	}
	
	document.querySelector(".floating-footer-content").appendChild(element);
	
	
	
	//Finally, we need to cover the bottom with a very thin strip of white to fix a strange glitch where absolutely-positioned elements always have a transparent background.
	element = document.createElement("div");
	
	element.classList.add("floating-footer-button-background");
	
	document.querySelector(".floating-footer-content").appendChild(element);
	
	
	
	document.querySelector(".floating-footer").insertAdjacentHTML("afterend", `<div class="floating-footer-touch-target"></div>`);
	
	
	
	fit_floating_footer_to_window_width();
	
	window.addEventListener("resize", fit_floating_footer_to_window_width);
	temporary_handlers["resize"].push(fit_floating_footer_to_window_width);
	
	
	
	window.addEventListener("scroll", floating_footer_scroll);
	temporary_handlers["scroll"].push(floating_footer_scroll);
	
	
	
	//Idk why this is required. Occasionally the touch target will have display: none until the window is scrolled any amount.
	setTimeout(function()
	{
		document.querySelector(".floating-footer-touch-target").style.display = "block";
	}, 50);
	
	
	
	
	if (hasTouch())
	{
		init_floating_footer_listeners_touch();
	}
	
	else
	{
		init_floating_footer_listeners_no_touch();
	}
}



//Properly size the floating footer -- when there is a scroll bar, the right button will clip into it. Unfortunately, there is no way to solve this with CSS, as far as I'm aware.
function fit_floating_footer_to_window_width()
{
	document.querySelector(".floating-footer").style.width = document.documentElement.clientWidth + "px";
	
	//This one beats me. A window resize will cause the touch target to become visible, blocking some or all of the footer image links. If the timeout isn't here, then it will flicker on and off violently before remaining on.
	if (floating_footer_is_visible)
	{
		setTimeout(function()
		{
			document.querySelector(".floating-footer-touch-target").style.display = "none";
		}, 50);
	}
}



//Remove the trigger zone when we reach the actual footer so that we don't cause any problems, and hide the footer when scrolling so that it doesn't flicker weirdly.
function floating_footer_scroll()
{
	if (document.querySelector(".line-break-container").classList.contains("aos-animate"))
	{
		document.querySelector(".floating-footer").style.opacity = 0;
		
		floating_footer_is_visible = false;
		
		document.querySelector(".floating-footer-touch-target").style.display = "none";
		
		setTimeout(function()
		{
			document.querySelector(".floating-footer").style.display = "none";
		}, 300);
	}
	
	else if (floating_footer_is_visible == false)
	{
		document.querySelector(".floating-footer-touch-target").style.display = "block";
	}
}



//When the touch target is moused over or tapped, show the footer and hide the touch target. When the mouse leaves the footer or there's a tap somewhere else, hide the footer and show the touch target again.
let floating_footer_is_visible = false;

function init_floating_footer_listeners_no_touch()
{
	floating_footer_is_visible = false;
	
	document.querySelector(".floating-footer-touch-target").addEventListener("mouseenter", function()
	{
		if (floating_footer_is_visible == false && !(document.querySelector(".line-break-container").classList.contains("aos-animate")))
		{
			document.querySelector(".floating-footer").style.display = "block";
			document.querySelector(".floating-footer-touch-target").style.display = "none";
			
			setTimeout(function()
			{
				document.querySelector(".floating-footer").style.opacity = 1;
				
				floating_footer_is_visible = true;
			}, 50);
		}
	});
	
	document.querySelector(".floating-footer-content").addEventListener("mouseleave", function()
	{
		if (floating_footer_is_visible)
		{
			document.querySelector(".floating-footer").style.opacity = 0;
			
			floating_footer_is_visible = false;
			
			setTimeout(function()
			{
				document.querySelector(".floating-footer").style.display = "none";
				document.querySelector(".floating-footer-touch-target").style.display = "block";
			}, 300);
		}
	});
}



function init_floating_footer_listeners_touch()
{
	floating_footer_is_visible = false;
	
	
	
	document.documentElement.addEventListener("touchend", footer_process_touchend, false);
	temporary_handlers["touchend"].push(footer_process_touchend);
	
	document.documentElement.addEventListener("touchstart", footer_process_touchstart, false);
	temporary_handlers["touchstart"].push(footer_process_touchstart);
}



function footer_process_touchend()
{
	let target = document.elementFromPoint(last_touch_x, last_touch_y);
	
	
	
	if (document.querySelector(".floating-footer-touch-target") == target)
	{
		if (floating_footer_is_visible == false && !(document.querySelector(".line-break-container").classList.contains("aos-animate")))
		{
			document.querySelector(".floating-footer").style.display = "block";
			document.querySelector(".floating-footer-touch-target").style.display = "none";
			
			floating_footer_is_visible = true;
			
			setTimeout(function()
			{
				document.querySelector(".floating-footer").style.opacity = 1;
			}, 50);
		}
	}
}



function footer_process_touchstart(event)
{
	if (!(document.querySelector(".floating-footer-content").contains(event.target)))
	{
		if (floating_footer_is_visible)
		{
			document.querySelector(".floating-footer").style.opacity = 0;
			
			floating_footer_is_visible = false;
			
			setTimeout(function()
			{
				document.querySelector(".floating-footer").style.display = "none";
				document.querySelector(".floating-footer-touch-target").style.display = "block";
			}, 300);
		}
	}
}