"use strict";



//Gets the page ready to be shown but doesn't do anything that needs the page to be visible.
Page.load = async function()
{
	Page.element = document.body.querySelector(".page");
	
	if ("banner_page" in Page.settings && Page.settings["banner_page"])
	{
		Page.banner_element = Page.element.querySelector("#banner");
		
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
	}
	
	else
	{
		Page.banner_element = null;
	}	
	
	Page.using_custom_script = true;
	
	Page.ready_to_show = false;
	
	
	
	this.Navigation.currently_changing_page = false;
	
	
	
	this.Load.parse_custom_style();
	await this.Load.parse_custom_scripts();
	
	
	
	//Set the page title.
	document.head.querySelector("title").innerHTML = this.settings["title"];
	
	
	
	if (!("no_footer" in this.settings && this.settings["no_footer"]))
	{
		this.Footer.load();
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
	Page.element.querySelectorAll("select").forEach(element =>
	{
		let button_element = element.previousElementSibling;
		
		button_element.innerHTML = `${element.querySelector(`[value=${element.value}]`).textContent}  <span style="font-size: 12px">&#x25BC;</span>`;
		
		button_element.parentNode.parentNode.style.gridTemplateColumns = `repeat(auto-fit, 100%)`;
		
		element.addEventListener("input", () =>
		{
			button_element.innerHTML = `${element.querySelector(`[value=${element.value}]`).textContent}  <span style="font-size: 12px">&#x25BC;</span>`;
		});
	});
	
	
	
	this.Images.add_extensions();
	
	Page.Banner.fetch_other_page_banners_in_background();
	
	this.Load.Links.set();
	
	this.Load.Links.disable();
	
	this.Load.HoverEvents.set_up();
	
	this.Load.TextButtons.set_up();
	
	this.Load.show_images_and_iframes();
	
	if ("parent_list" in this.settings)
	{
		this.Load.TextButtons.set_up_nav_buttons(this.settings["parent_list"]);
	}
	
	
	
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
	
	if (Site.Settings.url_vars["condensed_applets"] === 1 && Site.sitemap[Page.url].parent === "/applets/")
	{
		Site.Settings.condense_applet();
	}
	
	if ("math_page" in this.settings && this.settings["math_page"])
	{
		this.Load.Math.typeset();
	}
	
	
	
	if (!Page.using_custom_script)
	{
		//Truly godawful
		setTimeout(() => Page.show(), 1);
	}
};



Page.show = function()
{
	return new Promise((resolve, reject) =>
	{
		setTimeout(async () =>
		{
			await this.Load.fade_in();
				
			resolve();
		}, 10);
	});
};



Page.Load =
{
	//Right, so this is a pain. One of those things jQuery makes really easy and that you might never notice otherwise is that when using $(element).html(data), any non-external script tags in data are automatically excuted. This is great, but it doesn't happen when using element.innerHTML. Weirdly enough, though, it works with element.appendChild. Therefore, we just need to get all our script tags, and for each one, make a new tag with identical contents, append it to the body, and delete the original script.
	parse_script_tags: function()
	{
		document.querySelectorAll("script").forEach(script =>
		{
			let new_script = document.createElement("script");
			
			new_script.innerHTML = script.textContent;
			
			document.body.appendChild(new_script);
			
			script.remove();
		});
	},



	//Finds styles in a folder called "style" inside the page's folder. It first tries to find a minified file, and if it can't, it then tries to find a non-minified one so that testing can still work. The style files must have the same name as the html file.
	parse_custom_style: function()
	{
		let page_name = Page.url.split("/");
		page_name = page_name[page_name.length - 2];
		
		
		
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
		return new Promise((resolve, reject) =>
		{
			let page_name = Page.url.split("/");
			page_name = page_name[page_name.length - 2];
			
			
			
			//Make sure there's actually something to get.
			fetch(Page.parent_folder + "scripts/" + page_name + ".js")
			
			.then((response) =>
			{
				if (!response.ok)
				{
					if (Page.ready_to_show)
					{
						Page.show();
					}
					
					else
					{
						Page.using_custom_script = false;
					}
					
					resolve();
					
					return;
				}
				
				Page.ready_to_show = true;
				
				
				
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
				
				resolve();
			});
		});	
	},



	fade_in: function()
	{
		return new Promise(async (resolve, reject) =>
		{
			let promise = null;
			
			if (Page.Navigation.transition_type === 1)
			{
				promise = Page.Animate.fade_up_in(Page.element, Site.page_animation_time * 2);
				
				if (Page.banner_element !== null)
				{
					promise = Page.Animate.fade_up_in(Page.banner_element, Site.page_animation_time * 2, Page.Banner.opacity);
				}
			}
			
			else if (Page.Navigation.transition_type === -1)
			{
				promise = Page.Animate.fade_down_in(Page.element, Site.page_animation_time * 2);
				
				if (Page.banner_element !== null)
				{
					promise = Page.Animate.fade_down_in(Page.banner_element, Site.page_animation_time * 2, Page.Banner.opacity);
				}
			}
			
			else if (Page.Navigation.transition_type === 2)
			{
				promise = Page.Animate.fade_left_in(Page.element, Site.page_animation_time * 2);
				
				if (Page.banner_element !== null)
				{
					promise = Page.Animate.fade_left_in(Page.banner_element, Site.page_animation_time * 2, Page.Banner.opacity);
				}
			}
			
			else if (Page.Navigation.transition_type === -2)
			{
				promise = Page.Animate.fade_right_in(Page.element, Site.page_animation_time * 2);
				
				if (Page.banner_element !== null)
				{
					promise = Page.Animate.fade_right_in(Page.banner_element, Site.page_animation_time * 2, Page.Banner.opacity);
				}
			}
			
			else
			{
				promise = Page.Animate.fade_in(Page.element, Site.page_animation_time * 2);
				
				if (Page.banner_element !== null)
				{
					promise = Page.Animate.fade_in(Page.banner_element, Site.page_animation_time * 2, Page.Banner.opacity);
				}
			}
			
			await promise;
			
			resolve();
		});
	},
	
	
	
	lazy_loaded_images: [],
	lazy_loaded_iframes: [],
	
	show_images_and_iframes: function()
	{
		Page.element.querySelectorAll("img:not([src])").forEach(element => this.lazy_loaded_images.push([element, element.getBoundingClientRect().top, null]));
		
		Page.element.querySelectorAll("iframe:not([src])").forEach(element => this.lazy_loaded_iframes.push([element, element.getBoundingClientRect().top, null]));
		
		this.lazy_loaded_images.forEach((entry, index) =>
		{
			if (entry[1] > Page.Layout.window_height + 200)
			{
				entry[2] = setTimeout(() => this.load_lazy_element(this.lazy_loaded_images, index), index * 200);
			}
			
			else
			{
				this.load_lazy_element(this.lazy_loaded_images, index);
			}
		});
		
		this.lazy_loaded_iframes.forEach((entry, index) =>
		{
			if (entry[1] > Page.Layout.window_height + 200)
			{
				entry[2] = setTimeout(() => this.load_lazy_element(this.lazy_loaded_iframes, index), index * 800);
			}
			
			else
			{
				this.load_lazy_element(this.lazy_loaded_iframes, index);
			}
		});
	},
	
	
	
	load_lazy_element: function(list, index)
	{
		list[index][0].src = list[index][0].getAttribute("data-src");
		
		list[index][2] = -1;
	},
	
	
	
	last_lazy_load_scroll_timestamp: 0,
	
	lazy_load_scroll: function(timestamp)
	{
		const elapsed_time = timestamp - Page.Load.last_lazy_load_scroll_timestamp;
		
		Page.Load.last_lazy_load_scroll_timestamp = timestamp;
		
		if (elapsed_time < 16)
		{
			return;
		}
		
		
		
		Page.Load.lazy_loaded_images.forEach((entry, index) =>
		{
			if (entry[1] < Page.Layout.window_height + Page.scroll + 200 && entry[2] !== -1)
			{
				clearTimeout(entry[2]);
				Page.Load.load_lazy_element(Page.Load.lazy_loaded_images, index);
			}
		});
		
		Page.Load.lazy_loaded_iframes.forEach((entry, index) =>
		{
			if (entry[1] < Page.Layout.window_height + Page.scroll + 200 && entry[2] !== -1)
			{
				clearTimeout(entry[2]);
				Page.Load.load_lazy_element(Page.Load.lazy_loaded_iframes, index);
			}
		});
	},


	
	HoverEvents:
	{
		element_selectors: `
			a
		`,
		
		//These elements need to have their scale increased when hovered.
		element_selectors_with_scale:
		[
			["#logo img", 1.05],
			["#scroll-button", 1.1],
			[".text-button:not(.dropdown)", 1.075],
			["select", 1.075],
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
			Page.element.querySelectorAll(this.element_selectors).forEach(element => this.add(element));
			
			this.element_selectors_with_scale.forEach(selector =>
			{
				Page.element.querySelectorAll(selector[0]).forEach(element => this.add_with_scale(element, selector[1]));
			});
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
					
					else if (element.classList.contains("dropdown-container"))
					{
						element.firstElementChild.classList.add("hover");
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
					
					else if (element.classList.contains("dropdown-container"))
					{
						element.firstElementChild.classList.remove("hover");
					}
					
					else
					{
						element.blur();
					}
				}
			});
		},
		
		
		
		add_with_scale: function(element, scale, force_js = false)
		{
			element.addEventListener("mouseenter", () =>
			{
				if (!Site.Interaction.currently_touch_device)
				{
					if (element.tagName === "SELECT")
					{
						element = element.previousElementSibling;
					}
					
					element.classList.add("hover");
					
					if (force_js)
					{
						Page.Animate.change_hover_js(element, scale, Site.button_animation_time);
					}
					
					else
					{
						Page.Animate.change_hover(element, scale, Site.button_animation_time);
					}	
				}
			});
			
			element.addEventListener("mouseleave", () =>
			{
				if (!Site.Interaction.currently_touch_device)
				{
					if (element.tagName === "SELECT")
					{
						element = element.previousElementSibling;
					}
					
					element.classList.remove("hover");
					
					if (force_js)
					{
						Page.Animate.change_hover_js(element, 1, Site.button_animation_time);
					}
					
					else
					{
						Page.Animate.change_hover(element, 1, Site.button_animation_time);
					}
				}
			});
		},



		remove: function()
		{
			Page.element.querySelectorAll(this.element_selectors).forEach(element => element.classList.remove("hover"));
		}
	},
	
	
	
	FocusEvents:
	{
		set_up_weird_elements: function()
		{
			Page.element.querySelectorAll(".focus-on-child").forEach(element =>
			{
				element.addEventListener("focus", () =>
				{
					element.children[0].focus();
				});
			});
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
			Page.element.querySelectorAll(".text-button").forEach(text_button => text_button.parentNode.style.margin = "0 auto");
			
			
			
			let heights = [];
			
			let max_height = 0;
			
			let widths = [];
			
			let max_width = 0;
			
			
			
			let elements = Page.element.querySelectorAll(".linked-text-button");
			
			elements.forEach((element, index) =>
			{
				element.style.height = "fit-content";
				element.style.width = "fit-content";
				
				heights.push(element.offsetHeight);
				
				if (heights[index] > max_height)
				{
					max_height = heights[index];
				}
				
				widths.push(element.offsetWidth);
				
				if (widths[index] > max_width)
				{
					max_width = widths[index];
				}
			});
			
			
			
			elements.forEach((element, index) =>
			{
				if (heights[index] < max_height)
				{
					element.style.height = max_height + "px";
				}
				
				else
				{
					element.style.height = "fit-content";
				}
				
				
				
				if (widths[index] < max_width)
				{
					element.style.width = max_width + "px";
				}
				
				else
				{
					element.style.width = "fit-content";
				}
				
				element.parentNode.parentNode.style.gridTemplateColumns = `repeat(auto-fit, ${max_width}px)`;
			});
		},
		
		
		
		set_up_nav_buttons: function(parent_list)
		{
			let index = Site.page_lists[parent_list].indexOf(Page.url);
			
			if (index === -1)
			{
				console.error("Page not found in page list!");
				
				return;
			}
			
			
			
			if (index > 1)
			{
				Page.element.querySelectorAll(".previous-nav-button").forEach(element => element.setAttribute("onclick", `Page.Navigation.redirect("${Site.page_lists[parent_list][index - 1]}")`));
			}
			
			else
			{
				Page.element.querySelectorAll(".previous-nav-button").forEach(element => element.parentNode.remove());
			}
			
			
			
			Page.element.querySelectorAll(".home-nav-button").forEach(element => element.setAttribute("onclick", `Page.Navigation.redirect("${Site.page_lists[parent_list][0]}")`));
			
			
			
			if (index < Site.page_lists[parent_list].length - 1)
			{
				Page.element.querySelectorAll(".next-nav-button").forEach(element => element.setAttribute("onclick", `Page.Navigation.redirect("${Site.page_lists[parent_list][index + 1]}")`));
			}
			
			else
			{
				Page.element.querySelectorAll(".next-nav-button").forEach(element => element.parentNode.remove());
			}
		}
	},



	//To keep expected link functionality (open in new tab, draggable, etc.), all elements with calls to redirect() are wrapped in <a> tags. Presses of <a> tags (without .real-link) are ignored, but to extend the functionality of url variables to the times they are used, we need to target them all and add the url variables onto them. Also, since the website is a single page app, we need to format them correctly, too, using the page variable.
	Links:
	{
		set: function()
		{
			let url_vars_suffix = Page.Navigation.concat_url_vars();
			
			
			
			Page.element.querySelectorAll("a").forEach(link =>
			{
				if (!(link.parentNode.classList.contains("footer-image-link")))
				{
					let href = link.getAttribute("href");
					
					if (href.slice(0, 5) !== "https" && href.slice(0, 4) !== "data")
					{
						link.setAttribute("href", "/index.html?page=" + encodeURIComponent(href) + url_vars_suffix);
						
						link.setAttribute("onclick", `Page.Navigation.redirect("${href}")`);
					}
					
					else
					{
						link.setAttribute("onclick", `Page.Navigation.redirect("${href}", true)`);
					}
				}
			});
		},



		disable: function()
		{
			Page.element.querySelectorAll("a:not(.real-link)").forEach(link => link.addEventListener("click", e => e.preventDefault()));
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
			
			
			
			setTimeout(() => Page.element.querySelectorAll("mjx-container").forEach(element => element.setAttribute("tabindex", -1)), 500);
		}
	}
};