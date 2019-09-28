//Takes over right where navigation.js leaves off -- this handles everything once a page has been redirected to.



function on_page_load()
{
	parse_page_specific_style();
	parse_page_specific_scripts();
	
	
	
	//Set the page title.
	document.querySelector("title").innerHTML = page_settings["title"];
	
	
	
	insert_header();
	
	fade_in();
	
	set_links();
	
	set_up_aos();
	
	initial_window_height = window_height;
	
	
	
	if (page_settings["no_footer"] == false)
	{
		insert_footer();
		
		setTimeout(floating_footer_scroll, 50);
	}
	
	
	
	insert_images();
	
	remove_hover_on_touch();
	
	disable_links();
	
	
	
	background_color_changed = false;
	
	
	
	if (url_vars["contrast"] == 1)
	{
		set_img_button_contrast();
	}
	
	if (page_settings["writing_page"] && url_vars["font"] == 1)
	{
		set_writing_page_font();
	}
	
	if (page_settings["writing_page"] && url_vars["writing_style"] == 1)
	{
		set_writing_page_style();
	}
	
	if (page_settings["small_margins_on_ultrawide"] && layout_string == "ultrawide")
	{
		reduce_page_margins();
	}
	
	if (url_vars["comments"] == 1)
	{
		remove_disqus();
	}
	
	if (url_vars["content_animation"] == 1)
	{
		remove_animation();
	}
	
	
	
	if (page_settings["math_page"])
	{
		typeset_math();
	}
	
	
	
	if (url_vars["comments"] != 1 && page_settings["comments"])
	{
		load_disqus();
	}
}



//Finds styles in a folder called "style" inside the page's folder. It first tries to find a minified file, and if it can't, it then tries to find a non-minified one so that testing can still work. The style files must have the same name as the html file.
function parse_page_specific_style()
{
	let page_name = current_url.split("/");
	page_name = page_name[page_name.length - 1];
	page_name = page_name.split(".");
	page_name = page_name[0];
	
	
	
	//Make sure there's actually something to get.
	fetch(parent_folder + "style/" + page_name + ".css")
	
	.then(function(response)
	{
		let element = document.createElement("link");
		
		element.setAttribute("rel", "stylesheet");
		
		
		
		if (DEBUG)
		{
			element.setAttribute("href", parent_folder + "style/" + page_name + ".css");
		}
		
		else
		{
			element.setAttribute("href", parent_folder + "style/" + page_name + ".min.css");
		}
		
		
		
		//This is kind of subtle. If we append this new style to he end of the head, then it will take precendence over settings styles, which is terrible -- for example, the homepage will render all of its custom classes like quote-text and quote-attribution incorrectly. Therefore, we need to *prepend* it, ensuring it has the lowest-possible priority.
		element.classList.add("temporary-style");
		
		document.head.insertBefore(element, document.head.firstChild);
	})
	
	.catch(function(error) {});
}



function parse_page_specific_scripts()
{
	let page_name = current_url.split("/");
	page_name = page_name[page_name.length - 1];
	page_name = page_name.split(".");
	page_name = page_name[0];
	
	
	//Make sure there's actually something to get.
	fetch(parent_folder + "scripts/" + page_name + ".js")
	
	.then(function(response)
	{
		let element = document.createElement("script");
		
		
		
		if (DEBUG)
		{
			element.setAttribute("src", parent_folder + "scripts/" + page_name + ".js");
		}
		
		else
		{
			element.setAttribute("src", parent_folder + "scripts/" + page_name + ".min.js");
		}
		
		
		
		element.classList.add("temporary-script");
		
		document.body.appendChild(element);
	})
	
	.catch(function(error) {});
}



function fade_in()
{
	if (page_settings["banner_page"])
	{
		document.documentElement.style.opacity = 1;
	}
	
	else
	{
		document.documentElement.classList.remove("animated-opacity");
		document.documentElement.style.opacity = 1;
		document.documentElement.classList.add("animated-opacity");
	}
}



//Puts the proper delays and anchors on aos elements on the page. The first animated element in every section should have a class of new-aos-section.
function set_up_aos()
{
	let aos_elements = document.querySelectorAll("[data-aos]");
	
	let current_section = 0;
	let current_delay = 0;
	
	
	
	for (let i = 0; i < aos_elements.length; i++)
	{
		if (aos_elements[i].classList.contains("new-aos-section"))
		{
			current_section++;
			
			
			
			if (aos_elements[i].getAttribute("data-aos-delay") !== null)
			{
				
				current_delay = parseInt(aos_elements[i].getAttribute("data-aos-delay"));
			}
			
			else
			{
				current_delay = 0;
			}
			
			
			
			aos_elements[i].id = "aos-section-" + current_section;
		}
		
		else
		{
			if (aos_elements[i].getAttribute("data-aos-delay") !== null)
			{
				current_delay = parseInt(aos_elements[i].getAttribute("data-aos-delay"));
			}
			
			else
			{
				current_delay += 100;
			}
			
			
			
			aos_elements[i].setAttribute("data-aos-delay", current_delay);
			aos_elements[i].setAttribute("data-aos-anchor", "#aos-section-" + current_section);
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
		load_script("https://polyfill.io/v3/polyfill.min.js?features=es6");
		
		
		
		load_script("https://cdn.jsdelivr.net/npm/mathjax@3.0.0/es5/tex-mml-chtml.js")
		
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
		MathJax.typeset();
	}
}