//Included on every page. Sets up variables and runs browsers.js, footer.js, navigation.js, and settings.js.


let window_width = null, window_height = null;

let page_settings = {};

let current_url = "/";
let parent_folder = "/";

//Whether the browser supports WebP images or not. Given a boolean value when decided.
let supports_webp = null;

let scripts_loaded = 
{
	"disqus": false,
	"mathjs": false,
	"mathjax": false
}

let temporary_handlers =
{
	"scroll": [],
	"resize": []
}



function init()
{
	window_width = window.innerWidth;
	window_height = window.innerHeight;
	
	
	
	window.addEventListener("resize", function()
	{
		window_width = window.innerWidth;
		window_height = window.innerHeight;
		
		update_aos();
	});
	
	
	
	if ("scrollRestoration" in history)
	{
		history.scrollRestoration = "manual";
	}
	
	
	
	//When in PWA form, disable text selection, drag-and-drop, and the PWA button itself.
	if (window.matchMedia("(display-mode: standalone)").matches)
	{
		document.documentElement.style.WebkitUserSelect = "none";
		document.documentElement.style.userSelect = "none";
		document.documentElement.style.WebkitTouchCallout = "none";
		
		let elements = document.querySelectorAll("body *");
		for (let i = 0; i < elements.length; i++)
		{
			elements[i].setAttribute("draggable", "false");
		}
		
		
		
		
		//Also add a little extra spacing at the top of each page to keep content from feeling too close to the top of the screen.
		add_style(`
			#pwa-button
			{
				display: none;
				width: 0px;
				height: 0px;
			}
			
			.logo, .name-text-container, .empty-top
			{
				margin-top: 2vh;
			}
		`, false);
	}
	
	
	
	scroll_button_exists = false;
}



//Redirects to the chosen page. Any page that calls this should never be able to be accessed again without unloading the page.
async function entry_point(url)
{
	init();
	
	
	
	check_webp()
	
	.then(function()
	{
		//If it's not an html file, it shouldn't be anywhere near redirect().
		if (url.substring(url.lastIndexOf(".") + 1, url.length) != "html")
		{
			//This should really be using history.replaceState(), but that doesn't update the page to make the file show for some reason.
			window.location.href = url;
		}
		
		else
		{
			redirect(url, false, false, true);
		}
	});
}



function update_aos()
{
	AOS.disable;
	
	if (url_vars["content_animation"] != 1)
	{
		if (page_settings["banner_page"])
		{
			AOS.init({duration: 1200, once: false, offset: window_height/4});
		}
		
		else
		{
			AOS.init({duration: 1200, once: true, offset: window_height/4});
		}
		
		AOS.refreshHard();
	}
}



function on_page_load()
{
	//Start at the top of the page to prevent banner glitches.
	window.scrollTo(0, 0);
	
	//Set the page title.
	document.querySelector("title").innerHTML = page_settings["title"];
	
	
	
	fade_in();
	
	update_aos();
	
	
	
	if (page_settings["no_footer"] == false)
	{
		insert_footer();
	}
	
	
	
	insert_images();
	
	apply_settings();
	
	gimp_edge();
	
	remove_hover_on_touch();
	
	disable_links();
	
	
	
	if (page_settings["math_page"])
	{
		typeset_math();
	}
	
	
	
	//If there is a footer, insert_footer() will take care of it.
	if (page_settings["no_footer"])
	{
		set_links();
	}
	
	
	
	if (url_vars["comments"] != 1 && page_settings["comments"])
	{
		load_disqus();
	}
}



function on_page_unload()
{
	//Remove any css and js that's no longer needed to prevent memory leaks.
	let elements = document.querySelectorAll("style.temporary-style, script.temporary-script");
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].remove();
	}
	
	
	
	//Unbind everything transient from the window.
	for (let key in temporary_handlers)
	{
		for (let j = 0; j < temporary_handlers[key].length; j++)
		{
			window.removeEventListener(key, temporary_handlers[key][j]);
		}
	}
}



function fade_in()
{
	if (url_vars["content_animation"] == 1)
	{
		document.documentElement.style.opacity = 1;
		
		if (page_settings["banner_page"])
		{
			load_banner();
		}
	}
	
	else
	{
		if (page_settings["banner_page"])
		{
			load_banner();
		}
		
		else
		{
			document.documentElement.classList.remove("animated-opacity");
			document.documentElement.style.opacity = 1;
			document.documentElement.classList.add("animated-opacity");
		}
	}
}



function disable_links()
{
	let links = document.querySelectorAll("a:not(.real-link)");
	
	for (let i = 0; i < links.length; i++)
	{
		links[i].addEventListener("click", function(e)
		{
			e.preventDefault();
		});
	}
}



function typeset_math()
{
	if (scripts_loaded["mathjax"] == false)
	{
		load_script("https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/latest.js?config=TeX-MML-AM_CHTML")
		
		.then(function()
		{
			scripts_loaded["mathjax"] = true;
		})
		
		.catch(function(error)
		{
			console.error("Could not load MathJax");
		});
	}
	
	else
	{
		MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
	}
}



//Loads a script with the given source and returns a promise for when it completes.
function load_script(src)
{
	return new Promise(function(resolve, reject)
	{
		const script = document.createElement("script");
		document.body.appendChild(script);
		script.onload = resolve;
		script.onerror = reject;
		script.async = true;
		script.src = src;
	});
}



//Adds a style tag to <head> with the given content. If temporary is true, it will be removed at the next page load.
function add_style(content, temporary)
{
	let element = document.createElement("style");
	
	element.textContent = content;
	
	if (temporary)
	{
		element.classList.add("temporary-style");
	}
	
	document.head.appendChild(element);
}