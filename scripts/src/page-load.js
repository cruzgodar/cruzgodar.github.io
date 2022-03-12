"use strict";



//Gets the page ready to be shown but doesn't do anything that needs the page to be visible.
Page.load = function()
{
	Page.element = document.body.querySelector(".page");
	
	Page.on_show = null;
	
	
	this.Navigation.currently_changing_page = false;
	
	
	
	this.Load.parse_custom_style();
	this.Load.parse_custom_scripts();
	
	
	
	//Set the page title.
	document.head.querySelector("title").innerHTML = this.settings["title"];
	
	
	
	if (!("no_footer" in this.settings && this.settings["no_footer"]))
	{
		this.Footer.load();
		
		setTimeout(() =>
		{
			this.Footer.Floating.on_scroll();
			
			Page.Load.AOS.element_animation_types[Page.Load.AOS.element_animation_types.length - 1] = 1;
		}, 50);
	}
	
	
	
	Page.Layout.Multicols.active = false;
	
	Page.Layout.on_resize();
	
	if (this.Layout.layout_string === "ultrawide")
	{
		this.Layout.Multicols.create();
	}
	
	this.Layout.AppletColumns.are_equalized = false;
	
	if (this.Layout.aspect_ratio > 1)
	{
		this.Layout.AppletColumns.equalize();
	}
	
	
	
	//We do dropdowns here too.
	let elements = Page.element.querySelectorAll("select");
	
	for (let i = 0; i < elements.length; i++)
	{
		let button_element = elements[i].previousElementSibling;
		
		button_element.innerHTML = `${elements[i].querySelector(`[value=${elements[i].value}]`).textContent}  <span style="font-size: 12px">&#x25BC;</span>`;
		
		button_element.parentNode.parentNode.style.gridTemplateColumns = `repeat(auto-fit, 100%)`;
		
		elements[i].addEventListener("input", () =>
		{
			button_element.innerHTML = `${elements[i].querySelector(`[value=${elements[i].value}]`).textContent}  <span style="font-size: 12px">&#x25BC;</span>`;
		});
	}
	
	
	
	if (!("no_footer" in this.settings && this.settings["no_footer"]))
	{
		setTimeout(() =>
		{
			this.Load.AOS.fix_footer_anchor();
		}, 500);
	}
	
	
	
	this.Images.add_extensions();
	
	Page.Banner.fetch_other_page_banners_in_background();
	
	this.Load.Links.set();
	
	this.Load.Links.disable();
	
	this.Load.HoverEvents.set_up();
	
	this.Load.TextButtons.set_up();
	
	setTimeout(() =>
	{
		this.Load.FocusEvents.set_up_weird_elements();
	}, 50);
	
	
	
	Page.background_color_changed = false;
	
	Site.Settings.handle_theme_revert();
	
	
	
	if ("banner_page" in this.settings && this.settings["banner_page"])
	{
		this.Banner.fetch_other_size_in_background();
	}
	
	if (Site.Settings.url_vars["contrast"] === 1)
	{
		Site.Settings.set_img_button_contrast();
	}
	
	if ("writing_page" in this.settings && this.settings["writing_page"] && Site.Settings.url_vars["font"] === 1)
	{
		Site.Settings.set_writing_page_font();
	}
	
	if (this.Layout.layout_string === "ultrawide" && "small_margins_on_ultrawide" in this.settings && this.settings["small_margins_on_ultrawide"])
	{
		Site.Settings.reduce_page_margins();
	}
	
	if (Site.Settings.url_vars["content_animation"] === 1)
	{
		Site.Settings.remove_animation();
	}
	
	if ("math_page" in this.settings && this.settings["math_page"])
	{
		this.Load.Math.typeset();
	}
	
	
	
	if (Page.loaded)
	{
		Page.show();
	}
	
	else
	{
		Page.loaded = true;
	}
};



Page.show = async function()
{
	this.Load.AOS.load();
	
	await this.Load.fade_in();
	
	setTimeout(() =>
	{
		this.Load.AOS.on_resize();
	}, 1000);
	
	this.Load.AOS.show_elements = true;
	
	this.Load.AOS.on_scroll();
	
	try {Page.on_show()}
	catch(ex) {}
};



Page.Load =
{
	//Right, so this is a pain. One of those things jQuery makes really easy and that you might never notice otherwise is that when using $(element).html(data), any non-external script tags in data are automatically excuted. This is great, but it doesn't happen when using element.innerHTML. Weirdly enough, though, it works with element.appendChild. Therefore, we just need to get all our script tags, and for each one, make a new tag with identical contents, append it to the body, and delete the original script.
	parse_script_tags: function()
	{
		let scripts = document.querySelectorAll("script");
		
		for (let i = 0; i < scripts.length; i++)
		{
			let new_script = document.createElement("script");
			
			new_script.innerHTML = scripts[i].textContent;
			
			document.body.appendChild(new_script);
			
			scripts[i].remove();
		}
	},



	//Finds styles in a folder called "style" inside the page's folder. It first tries to find a minified file, and if it can't, it then tries to find a non-minified one so that testing can still work. The style files must have the same name as the html file.
	parse_custom_style: function()
	{
		let page_name = Page.url.split("/");
		page_name = page_name[page_name.length - 1];
		page_name = page_name.split(".");
		page_name = page_name[0];
		
		
		
		try
		{
			//Make sure there's actually something to get.
			fetch(Page.parent_folder + "style/" + page_name + ".css")
			
			.then((response) =>
			{
				let element = document.createElement("link");
				
				element.setAttribute("rel", "stylesheet");
				
				
				
				if (DEBUG)
				{
					element.setAttribute("href", Page.parent_folder + "style/" + page_name + ".css");
				}
				
				else
				{
					element.setAttribute("href", Page.parent_folder + "style/" + page_name + ".min.css");
				}
				
				
				
				//This is kind of subtle. If we append this new style to the end of the head, then it will take precendence over settings styles, which is terrible -- for example, the homepage will render all of its custom classes like quote-text and quote-attribution incorrectly. Therefore, we need to *prepend* it, ensuring it has the lowest-possible priority.
				element.classList.add("temporary-style");
				
				document.head.insertBefore(element, document.head.firstChild);
			});
		}
		
		catch(ex) {}
	},



	parse_custom_scripts: function()
	{
		let page_name = Page.url.split("/");
		page_name = page_name[page_name.length - 1];
		page_name = page_name.split(".");
		page_name = page_name[0];
		
		
		
		try
		{
			//Make sure there's actually something to get.
			fetch(Page.parent_folder + "scripts/" + page_name + ".js")
			
			.then((response) =>
			{
				let element = document.createElement("script");
				
				
				
				if (DEBUG)
				{
					element.setAttribute("src", Page.parent_folder + "scripts/" + page_name + ".js");
				}
				
				else
				{
					element.setAttribute("src", Page.parent_folder + "scripts/" + page_name + ".min.js");
				}
				
				
				
				element.classList.add("temporary-script");
				
				document.body.appendChild(element);
			});
		}
		
		catch(ex) {}
	},



	fade_in: function()
	{
		return new Promise(async (resolve, reject) =>
		{
			if ("banner_page" in Page.settings && Page.settings["banner_page"])
			{
				Site.add_style(`
					#banner
					{
						background: url(${Page.Banner.file_path}landscape.${Page.Images.file_extension}) no-repeat center center;
						background-size: cover;
					}
					
					@media (max-aspect-ratio: 1/1)
					{
						#banner
						{
							background: url(${Page.Banner.file_path}portrait.${Page.Images.file_extension}) no-repeat center center;
							background-size: cover;
						}
					}
				`);
				
				await Page.Animate.change_opacity(document.body, 1, Site.opacity_animation_time, true);
				
				resolve();
			}
			
			else
			{
				document.body.style.opacity = 1;
				
				resolve();
			}
		});	
	},
	
	
	
	AOS:
	{
		//A list of lists. Each sublist starts with an anchor, then lists all the elements anchored to it in sequence, along with their delays.
		show_elements: false,
		
		elements: [],
		element_animation_types: [],
		delays: [],

		anchor_positions: [],

		anchor_offsets: [],

		anchors_shown: [],

		currently_animating: [],
		
		
		
		//So, there's this bug that's plagued the site since its inception. iOS Safari eventually seems to have a memory leak and starts cutting off all transitions before they've reached their end. It gets progressively worse until quitting the app is required. It can be triggered by drag-and-dropping elements repeatedly *anywhere* in Safari, and affects all webpages with CSS transitions.

		//In iOS 13.4, it seems Apple has miraculously fixed this nightmare. But for whatever reason, AOS is still problematic. If an element has a nonzero delay, it will be bugged, but zero-delay elements behave as usual. And so the solution is, unfortunately, to handle almost all of what AOS does manually.

		//This function puts the proper delays and anchors on aos elements on the page. The first animated element in every section should have a class of new-aos-section.
		
		//Update: the bug came back even for zero-delay elements. The site's content animation has been optionally moved to the JS-based anime.js, so while variables are still called AOS to avoid massive refactoring, it's no longer a part of the site.
		load: function()
		{
			if (Site.Settings.url_vars["content_animation"] === 1)
			{
				return;
			}
			
			
			
			this.show_elements = false;
			
			this.elements = [];
			this.element_animation_types = [];
			this.delays = [];
			
			let new_elements = Page.element.querySelectorAll("[data-aos]");
			
			let current_section = 0;
			let current_delay = 0;
			
			
			
			for (let i = 0; i < new_elements.length; i++)
			{
				if (new_elements[i].classList.contains("new-aos-section"))
				{
					//Create a new section.
					this.elements.push([]);
					this.delays.push([]);
					
					current_section++;
					
					current_delay = 0;
					
					
					
					if (new_elements[i].getAttribute("data-aos-offset") !== null)
					{
						this.anchor_offsets[current_section - 1] = parseInt(new_elements[i].getAttribute("data-aos-offset"));
					}
					
					else
					{
						this.anchor_offsets[current_section - 1] = 100;
					}
					
					
					
					if (new_elements[i].getAttribute("data-aos") === "zoom-out")
					{
						this.element_animation_types.push(1);
					}
					
					else
					{
						this.element_animation_types.push(0);
					}
					
					
					
					this.anchor_positions[current_section - 1] = new_elements[i].getBoundingClientRect().top + Page.scroll;
					
					this.anchors_shown[current_section - 1] = false;
				}
				
				
				if (Site.use_js_animation)
				{
					if (new_elements[i].getAttribute("data-aos") === "zoom-out")
					{
						new_elements[i].style.transform = "scale(1.3)";
					}
					
					else
					{
						new_elements[i].style.transform = "translateY(100px)";
					}
					
					new_elements[i].style.opacity = 0;
				}	
				
				else
				{
					new_elements[i].setAttribute("data-aos-offset", 1000000);
				}	
				
				this.elements[current_section - 1].push(new_elements[i]);
				
				
				
				
				let delay_increase = new_elements[i].getAttribute("data-aos-delay-increase");
				
				if (delay_increase !== null)
				{
					current_delay += parseInt(delay_increase);
				}
				
				this.delays[current_section - 1].push(current_delay);
				
				current_delay += Site.aos_separation_time;
			}
		},



		on_resize: function()
		{
			if (!this.show_elements)
			{
				return;
			}
			
			for (let i = 0; i < this.elements.length; i++)
			{
				this.anchor_positions[i] = this.elements[i][0].getBoundingClientRect().top + Page.scroll;
			}
			
			this.fix_footer_anchor();
		},



		fix_footer_anchor: function()
		{
			if (!("no_footer" in Page.settings && Page.settings["no_footer"]))
			{
				this.anchor_positions[this.elements.length - 1] = document.body.clientHeight - 10;
			}
		},



		on_scroll: function()
		{
			if (!this.show_elements)
			{
				return;
			}
			
			for (let i = 0; i < this.elements.length; i++)
			{
				if (Page.scroll + Page.Layout.window_height >= this.anchor_positions[i] + this.anchor_offsets[i] && this.anchors_shown[i] === false)
				{
					this.show_section(i);
				}
			}
		},



		show_section: function(section, force = false)
		{
			if (Site.Settings.url_vars["content_animation"] === 1)
			{
				return;
			}
			
			
			
			if (Page.scroll !== 0 || section === 0 || force)
			{
				this.anchors_shown[section] = true;
				
				if (this.element_animation_types[section] === 1)
				{
					Page.Animate.show_zoom_out_section(this.elements[section], Site.aos_animation_time, this.delays[section]);
				}
				
				else
				{
					Page.Animate.show_fade_up_section(this.elements[section], Site.aos_animation_time, this.delays[section]);
				}
				
				
				
				if (Page.scroll === 0 && section + 1 < this.elements.length && Page.Layout.window_height >= this.anchor_positions[section + 1] + this.anchor_offsets[section + 1])
				{
					setTimeout(() => this.show_section(section + 1, true), Site.aos_separation_time * this.elements[section].length + parseInt(this.elements[section + 1][0].getAttribute("data-aos-delay-increase") || 0));
				}
			}
		}
	},	


	
	HoverEvents:
	{
		element_selectors: `
			a,
			
			select
		`,
		
		//These elements need to have their scale increased when hovered.
		element_selectors_with_scale:
		[
			["#logo img", 1.05],
			["#scroll-button", 1.1],
			[".text-button", 1.075],
			[".checkbox-container", 1.1],
			[".radio-button-container", 1.1],
			[".footer-image-link img", 1.05],
			[".image-link img", 1.05],
			["#enter-fullscreen-button", 1.1],
			["#exit-fullscreen-button", 1.1],
			[".gallery-image-1-1 img", 1.075],
			[".gallery-image-2-2 img", 1.0375],
			[".gallery-image-3-3 img", 1.025]
		],
		
		
		
		//Adds a listener to every element that needs a hover event. Yes, you could use CSS for this. No, I don't want to.
		set_up: function()
		{
			let elements = Page.element.querySelectorAll(this.element_selectors);
			
			for (let i = 0; i < elements.length; i++)
			{
				this.add(elements[i]);
			}
			
			
			
			for (let i = 0; i < this.element_selectors_with_scale.length; i++)
			{
				let elements = Page.element.querySelectorAll(this.element_selectors_with_scale[i][0]);
				
				for (let j = 0; j < elements.length; j++)
				{
					this.add_with_scale(elements[j], this.element_selectors_with_scale[i][1]);
				}
			}	
		},



		add: function(element)
		{
			element.addEventListener("mouseenter", () =>
			{
				if (!Site.Interaction.currently_touch_device)
				{
					element.classList.add("hover");
					
					if (element.tagName === "SELECT")
					{
						element.previousElementSibling.classList.add("hover");
					}
				}
			});
			
			element.addEventListener("mouseleave", () =>
			{
				if (!Site.Interaction.currently_touch_device)
				{
					element.classList.remove("hover");
					
					if (element.tagName === "SELECT")
					{
						element.previousElementSibling.classList.remove("hover");
					}
					
					else
					{
						element.blur();
					}
				}
			});
		},
		
		
		
		add_with_scale: function(element, scale)
		{
			element.addEventListener("mouseenter", () =>
			{
				if (!Site.Interaction.currently_touch_device)
				{
					element.classList.add("hover");
					
					Page.Animate.change_scale(element, scale, Site.button_animation_time);
				}
			});
			
			element.addEventListener("mouseleave", () =>
			{
				if (!Site.Interaction.currently_touch_device)
				{
					element.classList.remove("hover");
					
					Page.Animate.change_scale(element, 1, Site.button_animation_time);
				}
			});
		},



		remove: function()
		{
			let elements = Page.element.querySelectorAll(this.element_selectors);
			
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].classList.remove("hover");
			}
		}
	},
	
	
	
	FocusEvents:
	{
		set_up_weird_elements: function()
		{
			let elements = Page.element.querySelectorAll(".focus-on-child");

			for (let i = 0; i < elements.length; i++)
			{
				elements[i].addEventListener("focus", () =>
				{
					elements[i].children[0].focus();
				});
			}
		}
	},
	
	
	
	TextButtons:
	{
		set_up: function()
		{
			let bound_function = this.equalize.bind(this);
			
			window.addEventListener("resize", bound_function);
			Page.temporary_handlers["resize"].push(bound_function);
			
			setTimeout(() =>
			{
				bound_function();
			}, 50);
			
			setTimeout(() =>
			{
				bound_function();
			}, 500);
		},



		//Makes linked text buttons have the same width and height.
		equalize: function()
		{
			let elements = Page.element.querySelectorAll(".text-button");
			
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].parentNode.style.margin = "0 auto";
			}
			
			
			
			elements = Page.element.querySelectorAll(".linked-text-button");
			
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
				
				elements[i].parentNode.parentNode.style.gridTemplateColumns = `repeat(auto-fit, ${max_width}px)`;
			}
		}
	},



	//To keep expected link functionality (open in new tab, draggable, etc.), all elements with calls to redirect() are wrapped in <a> tags. Presses of <a> tags (without .real-link) are ignored, but to extend the functionality of url variables to the times they are used, we need to target them all and add the url variables onto them. Also, since the website is a single page app, we need to format them correctly, too, using the page variable.
	Links:
	{
		set: function()
		{
			let links = Page.element.querySelectorAll("a");
			
			
			
			let url_vars_suffix = Page.Navigation.concat_url_vars();
			
			
			
			for (let i = 0; i < links.length; i++)
			{
				if (!(links[i].parentNode.classList.contains("footer-image-link")))
				{
					let href = links[i].getAttribute("href");
					
					if (href.slice(0, 5) !== "https" && href.slice(0, 4) !== "data")
					{
						links[i].setAttribute("href", "/index.html?page=" + encodeURIComponent(href) + url_vars_suffix);
						
						links[i].setAttribute("onclick", `Page.Navigation.redirect("${href}")`);
					}
					
					else
					{
						links[i].setAttribute("onclick", `Page.Navigation.redirect("${href}", true)`);
					}
				}
			}
		},



		disable: function()
		{
			let links = Page.element.querySelectorAll("a:not(.real-link)");
			
			for (let i = 0; i < links.length; i++)
			{
				links[i].addEventListener("click", (e) =>
				{
					e.preventDefault();
				});
			}
		}
	},
	

	
	Math:
	{
		typeset: function()
		{
			if (!Site.scripts_loaded["mathjax"])
			{
				window.MathJax =
				{
					tex:
					{
						inlineMath: [["$", "$"], ["\\(", "\\)"]]
					}
				};
				
				Site.load_script("https://polyfill.io/v3/polyfill.min.js?features=es6");
				
				
				
				Site.load_script("https://cdn.jsdelivr.net/npm/mathjax@3.2.0/es5/tex-mml-chtml.js")
				
				.then(function()
				{
					Site.scripts_loaded["mathjax"] = true;
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
			
			
			
			setTimeout(() =>
			{
				let elements = Page.element.querySelectorAll("mjx-container");
				
				for (let i = 0; i < elements.length; i++)
				{
					elements[i].setAttribute("tabindex", -1);
				}
			}, 500);
		}
	}
};