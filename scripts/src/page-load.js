"use strict";



//Takes over right where navigation.js leaves off -- this handles everything once a page has been redirected to.



async function on_page_load()
{
	currently_changing_page = false;
	
	
	
	parse_page_specific_style();
	parse_page_specific_scripts();
	
	
	
	//Set the page title.
	document.querySelector("title").innerHTML = page_settings["title"];
	
	
	
	if ("title_page_text" in page_settings && page_settings["title_page_text"] !== "")
	{
		if (url_vars["content_animation"] === 1 || ((url_vars["title_pages_seen"] >> title_page_ids[current_url]) & 1))
		{
			document.querySelector("#vara-container").remove();
			
			document.querySelector("#cancel-vara-text").remove();
		}
		
		else
		{
			document.body.classList.remove("animated-opacity");
			document.body.style.opacity = 1;
			document.body.classList.add("animated-opacity");
			
			
			
			await Promise.any([show_title_page(page_settings["title_page_text"]), listen_for_click()]);
			
			
			
			document.documentElement.removeEventListener("mousemove", show_cancel_vara_text_no_touch);
			document.documentElement.removeEventListener("touchmove", show_cancel_vara_text_touch);
			
			
			
			if (!((url_vars["title_pages_seen"] >> title_page_ids[current_url]) & 1))
			{
				url_vars["title_pages_seen"] += (1 << title_page_ids[current_url]);
				
				write_url_vars();
			}
		}
	}
	
	
	
	if (!("no_footer" in page_settings && page_settings["no_footer"]))
	{
		insert_footer();
		
		setTimeout(floating_footer_scroll, 50);
	}
	
	
	
	if (layout_string === "ultrawide")
	{
		create_multicols();
	}
	
	
	
	set_up_aos();
	
	setTimeout(aos_resize, 1000);
	
	
	
	if (!("no_footer" in page_settings && page_settings["no_footer"]))
	{
		setTimeout(fix_footer_aos_anchor, 50);
	}
	
	
	
	fade_in();
	
	
	
	insert_images().then(aos_resize);
	
	Banners.fetch_other_page_banners_in_background();
	
	set_links();
	
	disable_links();
	
	set_up_hover_events();
	
	set_up_equalize_text_buttons();
	
	setTimeout(set_up_weird_focus_elements, 50);
	
	
	
	background_color_changed = false;
	
	floating_settings_is_visible = false;
	
	
	
	if ("banner_page" in page_settings && page_settings["banner_page"])
	{
		Banners.fetch_other_size_in_background();
	}
	
	if (url_vars["contrast"] === 1)
	{
		set_img_button_contrast();
	}
	
	if ("writing_page" in page_settings && page_settings["writing_page"] && url_vars["font"] === 1)
	{
		set_writing_page_font();
	}
	
	if (layout_string === "ultrawide" && "small_margins_on_ultrawide" in page_settings && page_settings["small_margins_on_ultrawide"])
	{
		reduce_page_margins();
	}
	
	if (url_vars["content_animation"] === 1)
	{
		remove_animation();
	}
	
	if ("math_page" in page_settings && page_settings["math_page"])
	{
		typeset_math();
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
			
			
			
			//This is kind of subtle. If we append this new style to the end of the head, then it will take precendence over settings styles, which is terrible -- for example, the homepage will render all of its custom classes like quote-text and quote-attribution incorrectly. Therefore, we need to *prepend* it, ensuring it has the lowest-possible priority.
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
	if ("banner_page" in page_settings && page_settings["banner_page"])
	{
		add_style(`
			#banner
			{
				background: url(${Banners.file_path}landscape.${Banners.file_extension}) no-repeat center center;
				background-size: cover;
			}
			
			@media (max-aspect-ratio: 1/1)
			{
				#banner
				{
					background: url(${Banners.file_path}portrait.${Banners.file_extension}) no-repeat center center;
					background-size: cover;
				}
			}
		`);
		
		document.body.style.opacity = 1;
	}
	
	else
	{
		document.body.classList.remove("animated-opacity");
		document.body.style.opacity = 1;
		document.body.classList.add("animated-opacity");
	}
}



//Displays an animated block of text (usually an equation).
let vara_canceled = false;

let cancel_vara_text_shown = false;

function show_title_page(text_to_draw)
{
	return new Promise(function(resolve, reject)
	{
		vara_canceled = false;
		
		
		
		document.documentElement.style.overflowY = "hidden";
		document.body.style.overflowY = "hidden";
		
		document.body.style.userSelect = "none";
		document.body.style.WebkitUserSelect = "none";
		
		document.querySelector("#vara-container").addEventListener("touchmove", function(e)
		{
			e.preventDefault();
		});
		
		
		
		setTimeout(function()
		{
			let color = "black";
			
			if (url_vars["theme"] === 1)
			{
				color = "white";
			}
			
			let text = new Vara("#vara-container", parent_folder + "/vara-font.json", [{text: text_to_draw, fontSize: page_settings["title_page_text_size"] * window_width / text_to_draw.length, duration: 4000, strokeWidth: .5, textAlign: "center", color: color}]);
			
			text.animationEnd(function(id, object)
			{
				if (vara_canceled)
				{
					return;
				}
				
				
				
				setTimeout(function()
				{
					if (vara_canceled)
					{
						return;
					}
					
					
					
					document.body.style.opacity = 0;
					
					setTimeout(function()
					{
						if (vara_canceled)
						{
							return;
						}
						
						
						
						document.querySelector("#vara-container").remove();
						
						
						
						document.documentElement.style.overflowY = "visible";
						document.body.style.overflowY = "visible";
						
						document.body.style.userSelect = "auto";
						document.body.style.WebkitUserSelect = "auto";
						
						
						
						resolve();
					}, 300);
				}, 500);
			});
		}, 300);
	});
}



function listen_for_click()
{
	return new Promise(function(resolve, reject)
	{
		document.querySelector("#vara-container").addEventListener("click", function()
		{
			vara_canceled = true;
		
			document.body.style.opacity = 0;
			
			setTimeout(function()
			{
				document.querySelector("#vara-container").remove();
				
				document.querySelector("#cancel-vara-text").remove();
				
				
				
				document.documentElement.style.overflowY = "visible";
				document.body.style.overflowY = "visible";
				
				document.body.style.userSelect = "auto";
				document.body.style.WebkitUserSelect = "auto";
				
				
				
				resolve();
			}, 300);
		});
		
		
		
		setTimeout(function()
		{
			cancel_vara_text_shown = false;
			
			document.documentElement.addEventListener("mousemove", show_cancel_vara_text_no_touch);
			document.documentElement.addEventListener("touchmove", show_cancel_vara_text_touch);
		}, 1000);
	});
}



function show_cancel_vara_text_no_touch()
{
	if (cancel_vara_text_shown)
	{
		return;
	}
	
	cancel_vara_text_shown = true;
	
	
	
	try
	{
		document.querySelector("#cancel-vara-text").textContent = "Click animation to skip";
		
		document.querySelector("#cancel-vara-text").style.opacity = 1;
	}
	
	catch(ex) {}
}



function show_cancel_vara_text_touch()
{
	if (cancel_vara_text_shown)
	{
		return;
	}
	
	cancel_vara_text_shown = true;
	
	
	
	document.querySelector("#cancel-vara-text").textContent = "Tap animation to skip";
	
	document.querySelector("#cancel-vara-text").style.opacity = 1;
}



//So, there's this bug that's plagued the site since its inception. iOS Safari eventually seems to have a memory leak and starts cutting off all transitions before they've reached their end. It gets progressively worse until quitting the app is required. It can be triggered by drag-and-dropping elements repeatedly *anywhere* in Safari, and affects all webpages with CSS transitions.

//In iOS 13.4, it seems Apple has miraculously fixed this nightmare. But for whatever reason, AOS is still problematic. If an element has a nonzero delay, it will be bugged, but zero-delay elements behave as usual. And so the solution is, unfortunately, to handle almost all of what AOS does manually.

//This function puts the proper delays and anchors on aos elements on the page. The first animated element in every section should have a class of new-aos-section.
function set_up_aos()
{
	aos_elements = [];
	
	let new_aos_elements = document.querySelectorAll("[data-aos]");
	
	let current_section = 0;
	let current_delay = 0;
	
	
	
	for (let i = 0; i < new_aos_elements.length; i++)
	{
		if (new_aos_elements[i].classList.contains("new-aos-section"))
		{
			//Create a new section.
			aos_elements.push([]);
			
			aos_currently_animating.push([]);
			
			current_section++;
			
			
			
			if (new_aos_elements[i].getAttribute("data-aos-delay") !== null)
			{
				current_delay = parseInt(new_aos_elements[i].getAttribute("data-aos-delay"));
			}
			
			else
			{
				current_delay = 0;
			}
			
			
			
			if (new_aos_elements[i].getAttribute("data-aos-offset") !== null)
			{
				aos_anchor_offsets[current_section - 1] = parseInt(new_aos_elements[i].getAttribute("data-aos-offset"));
			}
			
			else
			{
				aos_anchor_offsets[current_section - 1] = 100;
			}
			
			
			
			new_aos_elements[i].setAttribute("data-aos-offset", 1000000);
			new_aos_elements[i].setAttribute("data-aos-delay", 0);
			
			
			
			aos_elements[current_section - 1].push([new_aos_elements[i], current_delay]);
			
			aos_anchor_positions[current_section - 1] = new_aos_elements[i].getBoundingClientRect().top + window.scrollY;
			
			aos_anchors_shown[current_section - 1] = false;
		}
		
		
		
		else
		{
			if (new_aos_elements[i].getAttribute("data-aos-delay") !== null)
			{
				current_delay = parseInt(new_aos_elements[i].getAttribute("data-aos-delay"));
			}
			
			else
			{
				current_delay += 100;
				
				if (current_delay > 2000)
				{
					current_delay = 2000;
				}
			}
			
			
			
			new_aos_elements[i].setAttribute("data-aos-offset", 1000000);
			new_aos_elements[i].setAttribute("data-aos-delay", 0);
			
			aos_elements[current_section - 1].push([new_aos_elements[i], current_delay]);
		}
	}
	
	
	
	//At this point we have a list of all the AOS sections and their delays. Now whenever we scroll, we'll check each of the anchors to see if the scroll position is beyond the offset.
	
	aos_resize();
	aos_scroll();
}



function aos_resize()
{
	console.log("Updated AOS anchors");
	
	for (let i = 0; i < aos_elements.length; i++)
	{
		aos_anchor_positions[i] = aos_elements[i][0][0].getBoundingClientRect().top + window.scrollY;
	}
	
	fix_footer_aos_anchor();
}



function fix_footer_aos_anchor()
{
	aos_anchor_positions[aos_elements.length - 1] = document.body.clientHeight - 10;
}



function aos_scroll()
{
	for (let i = 0; i < aos_elements.length; i++)
	{
		if (scroll + window_height >= aos_anchor_positions[i] + aos_anchor_offsets[i] && aos_anchors_shown[i] === false)
		{
			show_aos_section(i);
		}
		
		else if (scroll + window_height < aos_anchor_positions[i] + aos_anchor_offsets[i] && aos_anchors_shown[i] === true)
		{
			hide_aos_section(i);
		}
	}
}



function show_aos_section(section)
{
	if (url_vars["content_animation"] === 1)
	{
		return;
	}
	
	
	
	for (let i = 0; i < aos_elements[section].length; i++)
	{
		let refresh_id = setTimeout(function()
		{
			aos_elements[section][i][0].setAttribute("data-aos-offset", -1000000);
			
			AOS.refresh();
		}, aos_elements[section][i][1]);
		
		aos_currently_animating[section].push(refresh_id);
	}
	
	aos_anchors_shown[section] = true;
}



function hide_aos_section(section)
{
	try
	{
		for (let i = 0; i < aos_currently_animating[section].length; i++)
		{
			clearTimeout(aos_currently_animating[section][i]);
		}
	}
	
	catch(ex) {}
	
	aos_currently_animating[section] = [];
	
	
	
	for (let i = 0; i < aos_elements[section].length; i++)
	{
		aos_elements[section][i][0].setAttribute("data-aos-offset", 1000000);
		
		AOS.refresh();
	}
	
	aos_anchors_shown[section] = false;
}



//Gets the next item from the fetch queue.
function fetch_item_from_queue()
{
	if (fetch_queue.length === 0 || currently_fetching)
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



//Adds a listener to every element that needs a hover event. Yes, you could use CSS for this. No, I don't want to.
function set_up_hover_events()
{
	let elements = document.querySelectorAll(hover_elements);
	
	for (let i = 0; i < elements.length; i++)
	{
		add_hover_event(elements[i]);
	}
}



function add_hover_event(element)
{
	element.addEventListener("mouseenter", function()
	{
		if (currently_touch_device === false)
		{
			element.classList.add("hover");
		}
	});
	
	element.addEventListener("mouseleave", function()
	{
		if (currently_touch_device === false)
		{
			element.classList.remove("hover");
			
			element.blur();
		}
	});
}



function remove_hover_events()
{
	let elements = document.querySelectorAll(hover_elements);
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].classList.remove("hover");
	}
}



function set_up_weird_focus_elements()
{
	let elements = document.querySelectorAll(".focus-on-child");

	for (let i = 0; i < elements.length; i++)
	{
		elements[i].addEventListener("focus", function()
		{
			elements[i].children[0].focus();
		});
	}
}



function set_up_equalize_text_buttons()
{
	window.addEventListener("resize", equalize_text_buttons);
	temporary_handlers["resize"].push(equalize_text_buttons);
	
	setTimeout(equalize_text_buttons, 50);
	
	setTimeout(equalize_text_buttons, 500);
}



//Makes linked text buttons have the same width and height.
function equalize_text_buttons()
{
	let elements = document.querySelectorAll(".text-button");
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].parentNode.style.margin = "0 auto";
	}
	
	
	
	elements = document.querySelectorAll(".linked-text-button");
	
	let heights = [];
	
	let max_height = 0;
	
	let widths = [];
	
	let max_width = 0;
	
	
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].style.height = "fit-content";
		elements[i].style.width = "fit-content";
		
		heights.push(elements[i].offsetHeight);
		
		if (heights[i] > max_height)
		{
			max_height = heights[i];
		}
		
		widths.push(elements[i].offsetWidth);
		
		if (widths[i] > max_width)
		{
			max_width = widths[i];
		}
	}
	
	
	
	for (let i = 0; i < elements.length; i++)
	{
		if (heights[i] < max_height)
		{
			elements[i].style.height = max_height + "px";
		}
		
		else
		{
			elements[i].style.height = "fit-content";
		}
		
		
		
		if (widths[i] < max_width)
		{
			elements[i].style.width = max_width + "px";
		}
		
		else
		{
			elements[i].style.width = "fit-content";
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
	if (scripts_loaded["mathjax"] === false)
	{
		load_script("https://polyfill.io/v3/polyfill.min.js?features=es6");
		
		
		
		load_script("https://cdn.jsdelivr.net/npm/mathjax@3.0.1/es5/tex-mml-chtml.js")
		
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
	
	
	
	setTimeout(function()
	{
		let elements = document.querySelectorAll("mjx-container");
		
		for (let i = 0; i < elements.length; i++)
		{
			elements[i].setAttribute("tabindex", -1);
		}
	}, 500);
}



function set_img_button_contrast()
{
	let elements = document.querySelectorAll(".nav-button, .scroll-button");
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].setAttribute("src", elements[i].getAttribute("src").replace("chevron-left", "chevron-left-dark").replace("chevron-right", "chevron-right-dark").replace("chevron-down", "chevron-down-dark"));
	}
}



function set_writing_page_font()
{
	set_element_styles(".body-text, .heading-text", "font-family", "'Gentium Book Basic', serif");
}



function reduce_page_margins()
{
	try {document.querySelector("#ultrawide-margin-adjust").remove();}
	catch(ex) {}
	
	
	
	//When in ultrawide mode, shrink the margins to 50%.
	if (layout_string === "ultrawide")
	{
		let element = add_style(`
			.body-text, .nav-buttons, .line-break
			{
				width: 50vw;
			}
		`);
		
		element.id = "ultrawide-margin-adjust";
	}	
}



function remove_animation()
{
	let elements = document.body.querySelectorAll("[data-aos]")
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].removeAttribute("data-aos");
	}
}