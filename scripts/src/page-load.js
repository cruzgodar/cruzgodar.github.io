"use strict";



//Gets the page ready to be shown but doesn't do anything that needs the page to be visible.
Page.load = async function()
{
	Page.element = document.body.querySelector(".page");
	
	if (Page.Banner.banner_pages.includes(Page.url))
	{
		Page.banner_element = Page.element.querySelector("#banner");
		Page.content_element = Page.element.querySelector("#content");
		
		Site.add_style(`
			#banner-small
			{
				background: url(${Page.Banner.file_path}small.${Page.Images.file_extension}) no-repeat center center;
				background-size: cover;
			}
			
			#banner-large
			{
				background: url(${Page.Banner.file_path}large.${Page.Images.file_extension}) no-repeat center center;
				background-size: cover;
			}
		`);
		
		await Page.Banner.load(true);
		
		await Page.Animate.change_opacity(Page.element.querySelector("#banner-small"), 0, 700);
		
		Page.element.querySelector("#banner-small").remove();
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
	try
	{
		if (Page.url === "/home/")
		{
			document.head.querySelector("title").textContent = "Cruz Godar";
		}
		
		else
		{
			document.head.querySelector("title").textContent = Page.element.querySelector("h1").textContent;
		}
	}
	
	catch(ex) {}
	
	
	
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
		const button_element = element.previousElementSibling;
		
		button_element.innerHTML = `${element.querySelector(`[value=${element.value}]`).textContent}  <span style="font-size: 12px">&#x25BC;</span>`;
		
		button_element.parentNode.parentNode.style.gridTemplateColumns = `repeat(auto-fit, 100%)`;
		
		element.addEventListener("input", () =>
		{
			button_element.innerHTML = `${element.querySelector(`[value=${element.value}]`).textContent}  <span style="font-size: 12px">&#x25BC;</span>`;
		});
	});
	
	
	
	this.Images.add_extensions();
	
	this.Load.Links.set();
	
	this.Load.Links.disable();
	
	this.Load.HoverEvents.set_up();
	
	this.Load.TextButtons.set_up();
	
	this.Load.show_images();
	
	try {this.Load.TextButtons.set_up_nav_buttons();}
	catch(ex) {}
	
	
	
	setTimeout(() =>
	{
		this.Load.FocusEvents.set_up_weird_elements();
	}, 50);
	
	
	
	Page.background_color_changed = false;
	
	Site.Settings.handle_theme_revert();
	
	
	
	if (this.Layout.layout_string === "ultrawide")
	{
		Site.Settings.reduce_page_margins();
	}
	
	if (Site.Settings.url_vars["condensed_applets"] === 1 && Site.sitemap[Page.url].parent === "/applets/")
	{
		Site.Settings.condense_applet();
	}
	
	this.Load.Math.typeset();
	
	this.Cards.init();
	
	
	
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
			const new_script = document.createElement("script");
			
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
			fetch(Page.parent_folder + "style/index.css")
			
			.then((response) =>
			{
				const element = document.createElement("link");
				
				element.setAttribute("rel", "stylesheet");
				
				
				
				if (DEBUG)
				{
					element.setAttribute("href", Page.parent_folder + "style/index.css");
				}
				
				else
				{
					element.setAttribute("href", Page.parent_folder + "style/index.min.css");
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
			fetch(Page.parent_folder + "scripts/index.js")
			
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
				
				
				
				const element = document.createElement("script");
				
				if (DEBUG)
				{
					element.setAttribute("src", Page.parent_folder + "scripts/index.js");
				}
				
				else
				{
					element.setAttribute("src", Page.parent_folder + "scripts/index.min.js");
				}
				
				
				
				element.classList.add("temporary-script");
				
				document.body.appendChild(element);
				
				resolve();
			});
		});	
	},
	
	
	
	add_header: function()
	{
		document.body.firstChild.insertAdjacentHTML("beforebegin", `
			<div id="header">
				<a id="header-logo" href="/home/">
					<img src="/graphics/general-icons/logo.png"></img>
					<span>Cruz Godar</span>
				</a>
				
				<div id="header-links">
					<a id="header-gallery-link" href="/gallery/">Gallery</a>
					<a id="header-applets-link" href="/applets/">Applets</a>
					<a id="header-teaching-link" href="/teaching/">Teaching</a>
					<a id="header-writing-link" href="/writing/">Writing</a>
					<a id="header-about-link" href="/about/">About</a>
				</div>
				
				<div id="header-theme-button" class="${Site.Settings.url_vars["theme"] === 1 ? "active" : ""}">
					<input type="image" src="/graphics/general-icons/moon.png">
				</div>
			</div>
		`);
		
		setTimeout(() =>
		{
			document.body.querySelectorAll("#header-logo, #header-links a").forEach(link =>
			{
				Page.Load.HoverEvents.add(link);
				
				const href = link.getAttribute("href");
				
				const url_vars_suffix = Page.Navigation.concat_url_vars();
		
				link.setAttribute("href", "/index.html?page=" + encodeURIComponent(href) + url_vars_suffix);
				
				link.addEventListener("click", e =>
				{
					e.preventDefault();
					
					Page.Navigation.redirect(href);
				});
			});
			
			const element = document.body.querySelector("#header-theme-button");
			
			Page.Load.HoverEvents.add(element);
			
			element.addEventListener("click", () => Site.Settings.toggle_theme());
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
	
	show_images: function()
	{
		Page.element.querySelectorAll("img[data-src]").forEach(element => this.lazy_loaded_images.push([element, element.getBoundingClientRect().top, null]));
		
		this.lazy_loaded_images.forEach((entry, index) =>
		{
			if (entry[1] > window.innerHeight + 200)
			{
				entry[2] = setTimeout(() => this.load_lazy_element(this.lazy_loaded_images, index), index * 200);
			}
			
			else
			{
				this.load_lazy_element(this.lazy_loaded_images, index);
			}
		});
	},
	
	
	
	load_lazy_element: function(list, index)
	{
		list[index][0].src = list[index][0].getAttribute("data-src");
		
		list[index][0].setAttribute("data-src", "");
		
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
			if (entry[1] < window.innerHeight + Page.scroll + 200 && entry[2] !== -1)
			{
				clearTimeout(entry[2]);
				Page.Load.load_lazy_element(Page.Load.lazy_loaded_images, index);
			}
		});
	},
	
	
	
	create_desmos_graphs: function(dark = Site.Settings.url_vars["theme"] === 1)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (!Site.scripts_loaded["desmos"])
			{
				await Site.load_script("https://www.desmos.com/api/v1.7/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6");
				
				Site.scripts_loaded["desmos"] = true;
			}
			
			for (let key in Page.desmos_graphs)
			{
				try {Page.desmos_graphs[key].destroy()}
				catch(ex) {}
			}
			
			Page.desmos_graphs = {};
			
			
			
			const data = this.get_desmos_data();
			
			for (let key in data)
			{
				data[key].expressions.forEach(expression =>
				{
					expression.latex = expression.latex.replace(/\(/g, String.raw`\left(`);
					expression.latex = expression.latex.replace(/\)/g, String.raw`\right)`);
					
					expression.latex = expression.latex.replace(/\[/g, String.raw`\left[`);
					expression.latex = expression.latex.replace(/\]/g, String.raw`\right]`);
				});
			}
			
			Page.element.querySelectorAll(".desmos-container").forEach(element =>
			{
				const options = {
					keypad: false,
					settingsMenu: false,
					zoomButtons: false,
					showResetButtonOnGraphpaper: true,
					border: false,
					expressionsCollapsed: true,
					invertedColors: dark,
					
					xAxisMinorSubdivisions: 1,
					yAxisMinorSubdivisions: 1
				};
				
				if (data[element.id].options !== undefined)
				{
					for (let key in data[element.id].options)
					{
						options[key] = data[element.id].options[key];
					}
				}
				
				
				
				Page.desmos_graphs[element.id] = Desmos.GraphingCalculator(element, options);
				
				Page.desmos_graphs[element.id].setMathBounds(data[element.id].bounds);
				
				Page.desmos_graphs[element.id].setExpressions(data[element.id].expressions);
				
				Page.desmos_graphs[element.id].setDefaultState(Page.desmos_graphs[element.id].getState());
			});
			
			resolve();
		});	
	},
	
	
	
	//Usage: Page.Load.export_desmos_screenshot("");
	
	export_desmos_screenshot: function(id)
	{
		Page.desmos_graphs[id].updateSettings({showGrid: false, xAxisNumbers: false, yAxisNumbers: false});
		
		let expressions = Page.desmos_graphs[id].getExpressions();
		
		for (let i = 0; i < expressions.length; i++)
		{
			expressions[i].lineWidth = 7.5;
			expressions[i].pointSize = 27;
			expressions[i].dragMode = "NONE";
		}
		
		Page.desmos_graphs[id].setExpressions(expressions);
		
		Page.desmos_graphs[id].asyncScreenshot({
			width: 500,
			height: 500,
			targetPixelRatio: 8
		}, image_data =>
		{
			const img = document.createElement("img");
			img.width = 4000;
			img.height = 4000;
			img.style.width = "50vmin";
			img.style.height = "50vmin";
			img.src = image_data;
			document.body.appendChild(img);
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
			[".image-link img", 1.05],
			["#enter-fullscreen-button", 1.1],
			["#exit-fullscreen-button", 1.1],
			[".gallery-image-1-1 img", 1.075],
			[".gallery-image-2-2 img", 1.0375],
			[".gallery-image-3-3 img", 1.025],
		],
		
		
		
		//Adds a listener to every element that needs a hover event. Yes, you could use CSS for this. No, I don't want to.
		set_up: function()
		{
			Page.element.querySelectorAll(this.element_selectors).forEach(element => this.add(element));
			
			this.element_selectors_with_scale.forEach(selector =>
			{
				Page.element.querySelectorAll(selector[0]).forEach(element => this.add_with_scale(element, selector[1]));
			});
			
			Page.element.querySelectorAll(".card .tex-holder").forEach(element =>
			{
				this.add_for_tex_holder(element);
				
				element.addEventListener("pointerdown", () => Page.Load.Math.show_tex(element));
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
						Page.Animate.change_scale_js(element, scale, Site.button_animation_time);
					}
					
					else
					{
						Page.Animate.change_scale(element, scale, Site.button_animation_time);
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
						Page.Animate.change_scale_js(element, 1, Site.button_animation_time);
					}
					
					else
					{
						Page.Animate.change_scale(element, 1, Site.button_animation_time);
					}
				}
			});
		},
		
		
		
		add_for_tex_holder: function(element)
		{
			element.classList.add("active");
			
			element.addEventListener("mouseenter", () =>
			{
				if (!Site.Interaction.currently_touch_device && element.getAttribute("data-showing-tex") !== "1")
				{
					element.classList.add("hover");
					
					const color = Site.Settings.url_vars["theme"] === 1 ? "rgba(24, 24, 24, 1)" : "rgba(255, 255, 255, 1)";
					
					anime({
						targets: element,
						scale: 1.05,
						borderRadius: "8px",
						backgroundColor: color,
						duration: Site.button_animation_time,
						easing: "easeOutQuad",
					});
				}
			});
			
			element.addEventListener("mouseleave", () =>
			{
				if (!Site.Interaction.currently_touch_device)
				{
					element.classList.remove("hover");
					
					const color = Site.Settings.url_vars["theme"] === 1 ? "rgba(24, 24, 24, 0)" : "rgba(255, 255, 255, 0)";
					
					anime({
						targets: element,
						scale: 1,
						borderRadius: "0px",
						backgroundColor: color,
						duration: Site.button_animation_time,
						easing: "easeInOutQuad",
					});
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
			const bound_function = this.equalize.bind(this);
			
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
			
			
			
			const elements = Page.element.querySelectorAll(".linked-text-button");
			
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
		
		
		
		set_up_nav_buttons: function()
		{
			const list = Site.sitemap[Site.sitemap[Page.url].parent].children;
			const index = list.indexOf(Page.url);
			
			if (index === -1)
			{
				console.error("Page not found in page list!");
				
				return;
			}
			
			
			
			if (index > 0)
			{
				Page.element.querySelectorAll(".previous-nav-button").forEach(element => element.setAttribute("onclick", `Page.Navigation.redirect("${list[index - 1]}")`));
			}
			
			else
			{
				Page.element.querySelectorAll(".previous-nav-button").forEach(element => element.parentNode.remove());
			}
			
			
			
			Page.element.querySelectorAll(".home-nav-button").forEach(element => element.setAttribute("onclick", `Page.Navigation.redirect("${Site.sitemap[Page.url].parent}")`));
			
			
			
			if (index < list.length - 1)
			{
				Page.element.querySelectorAll(".next-nav-button").forEach(element => element.setAttribute("onclick", `Page.Navigation.redirect("${list[index + 1]}")`));
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
			const url_vars_suffix = Page.Navigation.concat_url_vars();
			
			
			
			Page.element.querySelectorAll("a").forEach(link =>
			{
				let href = link.getAttribute("href");
				
				if (href === null)
				{
					return;
				}
				
				if (href.slice(0, 5) !== "https" && href.slice(0, 4) !== "data")
				{
					link.setAttribute("href", "/index.html?page=" + encodeURIComponent(href) + url_vars_suffix);
					
					link.setAttribute("onclick", `Page.Navigation.redirect("${href}")`);
				}
				
				else
				{
					link.setAttribute("onclick", `Page.Navigation.redirect("${href}", true)`);
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
			MathJax.typesetPromise()
			
			.then(() =>
			{
				Page.element.querySelectorAll("mjx-container").forEach(element => element.setAttribute("tabindex", -1));
			});
		},
		
		show_tex: async function(element)
		{
			if (element.getAttribute("data-showing-tex") === "1")
			{
				return;
			}
			
			element.setAttribute("data-showing-tex", "1");
			
			
			element.classList.remove("active");
			element.classList.remove("hover");
			
			const color = Site.Settings.url_vars["theme"] === 1 ? "rgba(24, 24, 24, 0)" : "rgba(255, 255, 255, 0)";
			
			await new Promise((resolve, reject) =>
			{
				anime({
					targets: element,
					scale: 1,
					borderRadius: "0px",
					backgroundColor: color,
					duration: 0,
					complete: resolve
				});
			});
			
			
			
			const tex = element.getAttribute("data-source-tex").replaceAll(/\[NEWLINE\]/g, "\n");
			
			
			
			const old_height = element.getBoundingClientRect().height;
			element.style.minHeight = `${old_height}px`;
			
			const old_padding = element.style.padding;
			
			
			const junk_drawer = document.createElement("div");
			junk_drawer.style.display = "none";
			Page.element.appendChild(junk_drawer);
			junk_drawer.appendChild(element.firstElementChild);
			
			
			
			let tex_element = null;
			
			if (tex.indexOf("\n") !== -1)
			{
				tex_element = document.createElement("textarea");
				tex_element.textContent = tex;
				tex_element.style.minHeight = `${old_height - 17}px`;
			}
			
			else
			{
				tex_element = document.createElement("input");
				tex_element.setAttribute("type", "text");
				tex_element.setAttribute("value", tex);
				tex_element.style.minHeight = `${old_height - 11}px`;
			}
			
			tex_element.style.fontFamily = "'Source Code Pro', monospace";
			element.appendChild(tex_element);
			
			element.style.padding = 0;
			
			tex_element.select();
			setTimeout(() => tex_element.select(), 50);
			setTimeout(() => tex_element.select(), 250);
			
			tex_element.onblur = () =>
			{
				tex_element.remove();
				
				element.style.padding = old_padding;
				element.appendChild(junk_drawer.firstElementChild);
				element.style.minHeight = "";
				junk_drawer.remove();
				
				element.setAttribute("data-showing-tex", "0");
				element.classList.add("active");
			};
		}
	},
};



Page.Cards =
{
	container: document.querySelector("#card-container"),
	current_card: null,
	close_button: document.querySelector("#card-close-button"),
	
	is_open: false,
	
	init: function()
	{
		Page.element.querySelectorAll(".card").forEach(card =>
		{
			card.style.opacity = 1;
			card.style.display = "none";
		});
	},
	
	show: function(id)
	{
		this.is_open = true;
		
		this.container.style.display = "flex";
		this.container.style.opacity = 0;
		this.container.style.transform = "scale(1)";
		
		this.current_card = document.querySelector(`#${id}-card`);
		
		this.container.appendChild(this.current_card);
		this.current_card.appendChild(this.close_button);
		
		
		
		const rect = this.current_card.getBoundingClientRect();
		
		this.close_button.style.top = `${rect.top}px`;
		this.close_button.style.left = `${rect.right - 50}px`;
		
		
		this.container.style.transform = "scale(.95)";
		
		Page.element.style.filter = "brightness(1)";
		document.querySelector("#header").style.filter = "brightness(1)";
		
		anime({
			targets: this.container,
			opacity: 1,
			scale: 1,
			duration: 400,
			easing: "easeOutQuint"
		});
		
		anime({
			targets: [Page.element, document.querySelector("#header")],
			filter: "brightness(.5)",
			duration: 400,
			easing: "easeOutQuint"
		});
		
		const theme_color = Site.Settings.url_vars["theme"] === 1 ? "#0c0c0c" : "#7f7f7f";
		
		anime({
			targets: Site.Settings.meta_theme_color_element,
			content: theme_color,
			duration: 400,
			easing: "easeOutQuint",
		});
		
		const color = Site.Settings.url_vars["theme"] === 1 ? "rgb(12, 12, 12)" : "rgb(127, 127, 127)";
		
		anime({
			targets: document.documentElement,
			backgroundColor: color,
			duration: 400,
			easing: "easeOutQuint"
		});
		
		document.documentElement.addEventListener("click", this.handle_click_event);
	},
	
	hide: async function()
	{
		this.is_open = false;
		
		await new Promise((resolve, reject) =>
		{
			anime({
				targets: [Page.element, document.querySelector("#header")],
				filter: "brightness(1)",
				duration: 400,
				easing: "easeOutQuint"
			});
			
			const theme_color = Site.Settings.url_vars["theme"] === 1 ? "#181818" : "#ffffff";
			
			anime({
				targets: Site.Settings.meta_theme_color_element,
				content: theme_color,
				duration: 400,
				easing: "easeOutQuint",
			});
			
			const color = Site.Settings.url_vars["theme"] === 1 ? "rgb(24, 24, 24)" : "rgb(255, 255, 255)";
		
			anime({
				targets: document.documentElement,
				backgroundColor: color,
				duration: 400,
				easing: "easeOutQuint"
			});
		
			anime({
				targets: Page.Cards.container,
				opacity: 0,
				scale: .95,
				duration: 400,
				easing: "easeOutQuint",
				complete: resolve
			});
		});
		
		Page.Cards.container.style.display = "none";
		
		Page.element.appendChild(Page.Cards.current_card);
		
		Page.Cards.container.appendChild(Page.Cards.close_button);
		
		document.documentElement.removeEventListener("click", this.handle_click_event);
	},
	
	handle_click_event: function(e)
	{
		if (e.target.id === "card-container")
		{
			Page.Cards.hide();
		}
	}
};