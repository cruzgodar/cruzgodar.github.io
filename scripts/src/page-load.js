"use strict";



//Takes over right where navigation.js leaves off -- this handles everything once a page has been redirected to.



function on_page_load()
{
	parse_page_specific_style();
	parse_page_specific_scripts();
	
	
	
	//Set the page title.
	document.querySelector("title").innerHTML = page_settings["title"];
	
	
	
	fade_in();
	
	insert_images();
	
	set_up_aos();
	
	
	
	if (page_settings["no_footer"] == false)
	{
		insert_footer();
		
		setTimeout(floating_footer_scroll, 50);
	}
	
	
	
	set_up_scroll_up_button();
	
	fetch_other_page_banners_in_background();
	
	remove_hover_on_touch();
	
	set_links();
	
	disable_links();
	
	
	
	background_color_changed = false;
	
	
	
	
	if (page_settings["banner_page"])
	{
		fetch_other_banner_size_in_background()
	}
	
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
	
	
	
	try
	{
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
		});
	}
	
	catch(ex) {}
}



function parse_page_specific_scripts()
{
	let page_name = current_url.split("/");
	page_name = page_name[page_name.length - 1];
	page_name = page_name.split(".");
	page_name = page_name[0];
	
	
	
	try
	{
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
		});
	}
	
	catch(ex) {}
}



function fade_in()
{
	if (page_settings["banner_page"])
	{
		add_style(`
			#banner
			{
				background: url(${banner_path}landscape.${banner_extension}) no-repeat center center;
				background-size: cover;
			}
			
			@media (max-aspect-ratio: 1/1)
			{
				#banner
				{
					background: url(${banner_path}portrait.${banner_extension}) no-repeat center center;
					background-size: cover;
				}
			}
		`);
		
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
	
	
	
	//Force a reflow so that the anchors' positions are recorded properly.
	setTimeout(function()
	{
		for (let i = 0; i < aos_elements.length; i++)
		{
			//We need to actually have a function here to trigger a reflow.
			void(aos_elements[i].offsetHeight);
		}
		
		AOS.refreshHard();
	
	//We can afford to wait so long because it's unlikely the user is going to load section 2 within a second of loading the page.
	}, 1000);
}



//Gets the next item from the fetch queue.
function fetch_item_from_queue()
{
	if (fetch_queue.length == 0 || currently_fetching)
	{
		return;
	}
	
	
	
	currently_fetching = true;
	
	console.log("Now fetching " + fetch_queue[0]);
	
	
	
	fetch(fetch_queue[0])
	
	.then(function()
	{
		currently_fetching = false;
		
		fetch_queue.shift();
		
		fetch_item_from_queue();
	})
}



//Fetches the other size of banner needed for the page, so that if the page is resized, there's no lag time.
function fetch_other_banner_size_in_background()
{
	if (banner_name == "landscape.webp" || banner_name == "landscape.jpg")
	{
		fetch_queue.push(banner_path + "portrait." + banner_extension);
		
		fetch_item_from_queue();
	}
	
	else
	{
		fetch_queue.push(banner_path + "landscape." + banner_extension);
		
		fetch_item_from_queue();
	}
}



//For every banner page linked to by the current page, this fetches that banner so that the waiting time between pages is minimized.
function fetch_other_page_banners_in_background()
{
	let links = document.querySelectorAll("a");
	
	for (let i = 0; i < links.length; i++)
	{
		let href = links[i].getAttribute("href");
		
		if (banner_pages.includes(href) && !(banner_pages_already_fetched.includes(href)))
		{
			if (!(multibanner_pages.hasOwnProperty(href)))
			{
				banner_pages_already_fetched.push(href);
				
				fetch_queue.push(href.slice(0, href.lastIndexOf("/") + 1) + "banners/" + banner_name);
				
				fetch_item_from_queue();
			}
			
			else
			{
				let next_index = multibanner_pages[href]["current_banner"] % (multibanner_pages[href]["current_banner"] + 1) + 1;
				
				fetch_queue.push(href.slice(0, href.lastIndexOf("/") + 1) + "banners/" + next_index + "/" + banner_name);
				
				fetch_item_from_queue();
			}
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



function set_img_button_contrast()
{
	let elements = document.querySelectorAll(".nav-button, .scroll-button");
	
	for (i = 0; i < elements.length; i++)
	{
		elements[i].setAttribute("src", elements[i].getAttribute("src").replace("chevron-left", "chevron-left-dark").replace("chevron-right", "chevron-right-dark").replace("chevron-down", "chevron-down-dark"));
	}
}



function set_writing_page_font()
{
	set_element_styles(".body-text", "font-family", "'Gentium Book Basic', serif");
}



function set_writing_page_style()
{
	//This is a fancy way of saying ("section br").remove(), but it ensures that <br> tags in places like song lyrics won't get removed.
	let elements = document.querySelectorAll("section div .body-text");
	
	for (let i = 0; i < elements.length; i++)
	{
		//The next element might not exist, so we have to be careful.
		try
		{
			let next_element = elements[i].parentNode.nextElementSibling;
			
			if (next_element.tagName.toLowerCase() == "br")
			{
				next_element.remove();
			}
		}
		
		catch(ex) {}
	}
	
	
	//Add an indent on every element except the first in the section.
	elements = document.querySelectorAll("section div:not(:first-child) .body-text");
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].style.textIndent = "10pt";
	}
}



function reduce_page_margins()
{
	try {document.querySelector("#ultrawide-margin-adjust").remove();}
	catch(ex) {}
	
	
	
	//When in ultrawide mode, shrink the margins to 50%.
	if (layout_string == "ultrawide")
	{
		let element = add_style(`
			.body-text, #disqus_thread, .nav-buttons, .line-break
			{
				width: 50vw;
			}
		`);
		
		element.id = "ultrawide-margin-adjust";
	}	
}



function remove_disqus()
{
	try
	{
		document.querySelector("#disqus_thread").previousElementSibling.remove();
		document.querySelector("#disqus_thread").previousElementSibling.remove();
		document.querySelector("#disqus_thread").previousElementSibling.remove();
		document.querySelector("#disqus_thread").remove();
	}
	
	catch(ex) {}
}



function remove_animation()
{
	let elements = document.body.querySelectorAll("[data-aos]")
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].removeAttribute("data-aos");
	}
}