"use strict";



//Gets the page ready to be shown but doesn't do anything that needs the page to be visible.
Page.load = async function()
{
	window.dispatchEvent(new Event("scroll"));
	window.dispatchEvent(new Event("resize"));

	Page.element = document.body.querySelector(".page");
	$ = (queryString) => Page.element.querySelector(queryString);
	$$ = (queryString) => Page.element.querySelectorAll(queryString);
	
	if (bannerPages.includes(Page.url))
	{
		loadBanner(true)
		
		.then(() =>
		{
			changeOpacity($("#banner-small"), 0, 700)
			
			.then(() => $("#banner-small").remove());
		});
	}
	
	else
	{
		setBannerElement(null);
	}	
	
	Page.usingCustomScript = true;
	
	
	
	this.Load.parseCustomStyle();
	this.Load.parseCustomScripts();
	
	
	
	//Set the page title.
	try
	{
		if (Page.url === "/home/")
		{
			document.head.querySelector("title").textContent = "Cruz Godar";
		}
		
		else
		{
			document.head.querySelector("title").textContent = $("h1").textContent;
		}
	}
	
	catch(ex) {}

	equalizeAppletColumns();
	
	
	
	//We do dropdowns here too.
	$$("select").forEach(element =>
	{
		const buttonElement = element.previousElementSibling;
		
		buttonElement.innerHTML = `${element.querySelector(`[value=${element.value}]`).textContent}  <span style="font-size: 12px">&#x25BC;</span>`;
		
		buttonElement.parentNode.parentNode.style.gridTemplateColumns = `repeat(auto-fit, 100%)`;
		
		element.addEventListener("input", () =>
		{
			buttonElement.innerHTML = `${element.querySelector(`[value=${element.value}]`).textContent}  <span style="font-size: 12px">&#x25BC;</span>`;
		});
	});
	

	
	this.Load.Links.set();
	
	this.Load.Links.disable();
	
	this.Load.HoverEvents.setUp();
	
	this.Load.TextButtons.setUp();
	
	try {this.Load.TextButtons.setUpNavButtons();}
	catch(ex) {}
	
	
	
	setTimeout(() =>
	{
		this.Load.FocusEvents.setUpWeirdElements();
	}, 50);
	
	
	
	Page.backgroundColorChanged = false;
	
	Site.Settings.handleThemeRevert();
	
	
	
	if (Site.Settings.urlVars["condensedApplets"] === 1 && Site.sitemap[Page.url].parent === "/applets/")
	{
		Site.Settings.condenseApplet();
	}
	
	this.Load.Math.typeset();
};



Page.show = function()
{
	return new Promise((resolve, reject) =>
	{
		setTimeout(async () =>
		{
			await this.Load.fadeIn();
				
			resolve();
		}, 10);
	});
};



Page.Load =
{
	//Right, so this is a pain. One of those things jQuery makes really easy and that you might never notice otherwise is that when using $(element).html(data), any non-external script tags in data are automatically excuted. This is great, but it doesn't happen when using element.innerHTML. Weirdly enough, though, it works with element.appendChild. Therefore, we just need to get all our script tags, and for each one, make a new tag with identical contents, append it to the body, and delete the original script.
	parseScriptTags: function()
	{
		document.querySelectorAll("script").forEach(script =>
		{
			const newScript = document.createElement("script");
			
			newScript.innerHTML = script.textContent;
			
			document.body.appendChild(newScript);
			
			script.remove();
		});
	},



	//Finds styles in a folder called "style" inside the page's folder. It first tries to find a minified file, and if it can't, it then tries to find a non-minified one so that testing can still work. The style files must have the same name as the html file.
	parseCustomStyle: function()
	{
		let pageName = Page.url.split("/");
		pageName = pageName[pageName.length - 2];
		
		
		
		try
		{
			//Make sure there's actually something to get.
			fetch(Page.parentFolder + "style/index.css")
			
			.then((response) =>
			{
				const element = document.createElement("link");
				
				element.setAttribute("rel", "stylesheet");
				
				
				
				element.setAttribute("href", Page.parentFolder + "style/index.min.css");
				
				
				
				//This is kind of subtle. If we append this new style to the end of the head, then it will take precendence over settings styles, which is terrible -- for example, the homepage will render all of its custom classes like quote-text and quote-attribution incorrectly. Therefore, we need to *prepend* it, ensuring it has the lowest-possible priority.
				element.classList.add("temporary-style");
				
				document.head.insertBefore(element, document.head.firstChild);
			});
		}
		
		catch(ex) {}
	},



	parseCustomScripts: function()
	{
		let pageName = Page.url.split("/");
		pageName = pageName[pageName.length - 2];
		
		import(`${Page.parentFolder}scripts/index.${window.DEBUG ? "mjs" : "min.mjs"}`)

		.then((Module) =>
		{
			Module.load();
		})

		.catch(() =>
		{
			setTimeout(() => Page.show(), 1);
		})
	},
	
	
	
	addHeader: function()
	{
		document.body.firstChild.insertAdjacentHTML("beforebegin", `
			<div id="header-container"></div>
			
			<div id="header">
				<a id="header-logo" href="/home/">
					<img src="/graphics/header-icons/logo.webp"></img>
					<span>Cruz Godar</span>
				</a>
				
				<div id="header-links">
					<a id="header-gallery-link" href="/gallery/">
						<span>Gallery</span>
						<img src="/graphics/header-icons/gallery.webp"></img>
					</a>
					
					<a id="header-applets-link" href="/applets/">
						<span>Applets</span>
						<img src="/graphics/header-icons/applets.webp"></img>
					</a>
					
					<a id="header-teaching-link" href="/teaching/">
						<span>Teaching</span>
						<img src="/graphics/header-icons/teaching.webp"></img>
					</a>
					
					<a id="header-slides-link" href="/slides/">
						<span>Slides</span>
						<img src="/graphics/header-icons/slides.webp"></img>
					</a>
					
					<a id="header-writing-link" href="/writing/">
						<span>Writing</span>
						<img src="/graphics/header-icons/writing.webp"></img>
					</a>
					
					<a id="header-about-link" href="/about/">
						<span>About</span>
						<img src="/graphics/header-icons/about.webp"></img>
					</a>
				</div>
				
				<div id="header-theme-button" class="${Site.Settings.urlVars["theme"] === 1 ? "active" : ""}">
					<input type="image" src="/graphics/header-icons/moon.webp">
				</div>
			</div>
		`);
		
		setTimeout(() =>
		{
			const imageElement = document.body.querySelector("#header-logo img");
			
			imageElement.style.width = `${imageElement.getBoundingClientRect().height}px`;
			
			
			
			document.body.querySelectorAll("#header-logo, #header-links a").forEach(link =>
			{
				Page.Load.HoverEvents.add(link);
				
				const href = link.getAttribute("href");
		
				link.setAttribute("href", "/index.html?page=" + encodeURIComponent(href));
				
				link.addEventListener("click", e =>
				{
					e.preventDefault();
					
					redirect({ url: href });
				});
			});
			
			
			
			const element = document.body.querySelector("#header-theme-button");
			
			Page.Load.HoverEvents.add(element);
			
			element.addEventListener("click", () => Site.Settings.toggleTheme());
			
			
			
			Site.headerElement = document.body.querySelector("#header");
		});
	},



	fadeIn: function()
	{
		return new Promise(async (resolve, reject) =>
		{
			let promise = null;

			if (navigationTransitionType === 1)
			{
				promise = bannerElement ? Promise.all([fadeUpIn(bannerElement, Site.pageAnimationTime * 2, bannerOpacity), fadeUpIn(Page.element, Site.pageAnimationTime * 2)]) : fadeUpIn(Page.element, Site.pageAnimationTime * 2);
			}
			
			else if (navigationTransitionType === -1)
			{
				promise = bannerElement ? Promise.all([fadeDownIn(bannerElement, Site.pageAnimationTime * 2, bannerOpacity), fadeDownIn(Page.element, Site.pageAnimationTime * 2)]) : fadeDownIn(Page.element, Site.pageAnimationTime * 2);
			}
			
			else if (navigationTransitionType === 2)
			{
				promise = bannerElement ? Promise.all([fadeLeftIn(bannerElement, Site.pageAnimationTime * 2, bannerOpacity), fadeLeftIn(Page.element, Site.pageAnimationTime * 2)]) : fadeLeftIn(Page.element, Site.pageAnimationTime * 2);
			}
			
			else if (navigationTransitionType === -2)
			{
				promise = bannerElement ? Promise.all([fadeRightIn(bannerElement, Site.pageAnimationTime * 2, bannerOpacity), fadeRightIn(Page.element, Site.pageAnimationTime * 2)]) : fadeRightIn(Page.element, Site.pageAnimationTime * 2);
			}
			
			else
			{
				promise = bannerElement ? Promise.all([fadeIn(bannerElement, Site.pageAnimationTime * 2, bannerOpacity), fadeIn(Page.element, Site.pageAnimationTime * 2)]) : fadeIn(Page.element, Site.pageAnimationTime * 2);
			}
			
			await promise;
			
			resolve();
		});
	},
	
	// File break
	
	createDesmosGraphs: function(dark = Site.Settings.urlVars["theme"] === 1)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (!Site.scriptsLoaded["desmos"])
			{
				await Site.loadScript("https://www.desmos.com/api/v1.7/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6");
				
				Site.scriptsLoaded["desmos"] = true;
			}
			
			for (let key in Page.desmosGraphs)
			{
				try {Page.desmosGraphs[key].destroy()}
				catch(ex) {}
			}
			
			Page.desmosGraphs = {};
			
			try
			{
				const data = this.getDesmosData();
				
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
				
				$$(".desmos-container").forEach(element =>
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
					
					
					
					Page.desmosGraphs[element.id] = Desmos.GraphingCalculator(element, options);
					
					Page.desmosGraphs[element.id].setMathBounds(data[element.id].bounds);
					
					Page.desmosGraphs[element.id].setExpressions(data[element.id].expressions);
					
					Page.desmosGraphs[element.id].setDefaultState(Page.desmosGraphs[element.id].getState());
				});
			}
			
			catch(ex) {}
			
			resolve();
		});	
	},
	
	
	
	//Usage: Page.Load.exportDesmosScreenshot("");
	
	exportDesmosScreenshot: function(id, forPdf = false)
	{
		Page.desmosGraphs[id].updateSettings({showGrid: forPdf, xAxisNumbers: forPdf, yAxisNumbers: forPdf});
		
		let expressions = Page.desmosGraphs[id].getExpressions();
		
		for (let i = 0; i < expressions.length; i++)
		{
			expressions[i].lineWidth = forPdf ? 5 : 7.5;
			expressions[i].pointSize = forPdf ? 15 : 27;
			expressions[i].dragMode = "NONE";
		}
		
		Page.desmosGraphs[id].setExpressions(expressions);
		
		Page.desmosGraphs[id].asyncScreenshot({
			width: 500,
			height: 500,
			targetPixelRatio: 8
		}, imageData =>
		{
			const img = document.createElement("img");
			img.width = 4000;
			img.height = 4000;
			img.style.width = "50vmin";
			img.style.height = "50vmin";
			img.src = imageData;
			document.body.appendChild(img);
		});
	},
	
	// File break
	
	HoverEvents:
	{
		elementSelectors: `
			a
		`,
		
		//These elements need to have their scale increased when hovered.
		elementSelectorsWithScale:
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
		setUp: function()
		{
			$$(this.elementSelectors).forEach(element => this.add(element));
			
			this.elementSelectorsWithScale.forEach(selector =>
			{
				$$(selector[0]).forEach(element => this.addWithScale(element, selector[1]));
			});
			
			$$(".card .tex-holder").forEach(element =>
			{
				this.addForTexHolder(element);
				
				element.addEventListener("click", () => Page.Load.Math.showTex(element));
			});
		},



		add: function(element)
		{
			element.addEventListener("mouseenter", () =>
			{
				if (!Site.Interaction.currentlyTouchDevice)
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
				if (!Site.Interaction.currentlyTouchDevice)
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
		
		
		
		addWithScale: function(element, scale, forceJs = false)
		{
			element.addEventListener("mouseenter", () =>
			{
				if (!Site.Interaction.currentlyTouchDevice)
				{
					if (element.tagName === "SELECT")
					{
						element = element.previousElementSibling;
					}
					
					element.classList.add("hover");
					
					
					
					if (forceJs)
					{
						changeScaleJs(element, scale, Site.buttonAnimationTime);
					}
					
					else
					{
						changeScale(element, scale, Site.buttonAnimationTime);
					}
				}
			});
			
			element.addEventListener("mouseleave", () =>
			{
				if (!Site.Interaction.currentlyTouchDevice)
				{
					if (element.tagName === "SELECT")
					{
						element = element.previousElementSibling;
					}
					
					element.classList.remove("hover");
					
					
					
				if (forceJs)
					{
						changeScaleJs(element, 1, Site.buttonAnimationTime);
					}
					
					else
					{
						changeScale(element, 1, Site.buttonAnimationTime);
					}
				}
			});
		},
		
		
		
		addForTexHolder: function(element)
		{
			element.classList.add("active");
			
			element.addEventListener("mouseenter", () =>
			{
				if (!Site.Interaction.currentlyTouchDevice && element.getAttribute("data-showing-tex") !== "1")
				{
					element.classList.add("hover");
					
					const color = Site.Settings.urlVars["theme"] === 1 ? "rgba(24, 24, 24, 1)" : "rgba(255, 255, 255, 1)";
					
					anime({
						targets: element,
						scale: 1.05,
						borderRadius: "8px",
						backgroundColor: color,
						duration: Site.buttonAnimationTime,
						easing: "easeOutQuad",
					});
				}
			});
			
			element.addEventListener("mouseleave", () =>
			{
				if (!Site.Interaction.currentlyTouchDevice)
				{
					element.classList.remove("hover");
					
					const color = Site.Settings.urlVars["theme"] === 1 ? "rgba(24, 24, 24, 0)" : "rgba(255, 255, 255, 0)";
					
					anime({
						targets: element,
						scale: 1,
						borderRadius: "0px",
						backgroundColor: color,
						duration: Site.buttonAnimationTime,
						easing: "easeInOutQuad",
					});
				}
			});
		},



		remove: function()
		{
			$$(this.elementSelectors).forEach(element => element.classList.remove("hover"));
		}
	},
	
	
	
	FocusEvents:
	{
		setUpWeirdElements: function()
		{
			$$(".focus-on-child").forEach(element =>
			{
				element.addEventListener("focus", () =>
				{
					element.children[0].focus();
				});
			});
		}
	},
	
	// File break
	
	TextButtons:
	{
		setUp: function()
		{
			const boundFunction = this.equalize.bind(this);
			
			window.addEventListener("resize", boundFunction);
			Page.temporaryHandlers["resize"].push(boundFunction);
			
			setTimeout(() =>
			{
				boundFunction();
			}, 50);
			
			setTimeout(() =>
			{
				boundFunction();
			}, 500);
		},



		//Makes linked text buttons have the same width and height.
		equalize: function()
		{
			$$(".text-button").forEach(textButton => textButton.parentNode.style.margin = "0 auto");
			
			
			
			let heights = [];
			
			let maxHeight = 0;
			
			let widths = [];
			
			let maxWidth = 0;
			
			
			
			const elements = $$(".linked-text-button");
			
			elements.forEach((element, index) =>
			{
				element.style.height = "fit-content";
				element.style.width = "fit-content";
				
				heights.push(element.offsetHeight);
				
				if (heights[index] > maxHeight)
				{
					maxHeight = heights[index];
				}
				
				widths.push(element.offsetWidth);
				
				if (widths[index] > maxWidth)
				{
					maxWidth = widths[index];
				}
			});
			
			
			
			elements.forEach((element, index) =>
			{
				if (heights[index] < maxHeight)
				{
					element.style.height = maxHeight + "px";
				}
				
				else
				{
					element.style.height = "fit-content";
				}
				
				
				
				if (widths[index] < maxWidth)
				{
					element.style.width = maxWidth + "px";
				}
				
				else
				{
					element.style.width = "fit-content";
				}
				
				element.parentNode.parentNode.style.gridTemplateColumns = `repeat(auto-fit, ${maxWidth}px)`;
			});
		},
		
		
		
		setUpNavButtons: function()
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
				$$(".previous-nav-button").forEach(element =>
				{
					element.addEventListener("click", () => redirect({ url: list[index - 1] }));
				});
			}
			
			else
			{
				$$(".previous-nav-button").forEach(element => element.parentNode.remove());
			}
			
			
			
			$$(".home-nav-button").forEach(element => 
			{
				element.addEventListener("click", () => redirect({ url: Site.sitemap[Page.url].parent }));
			});
			
			
			
			if (index < list.length - 1)
			{
				$$(".next-nav-button").forEach(element =>
				{
					element.addEventListener("click", () => redirect({ url: list[index + 1] }));
				});
			}
			
			else
			{
				$$(".next-nav-button").forEach(element => element.parentNode.remove());
			}
		}
	},

	// Keep in page-load

	//To keep expected link functionality (open in new tab, draggable, etc.), all elements with calls to redirect() are wrapped in <a> tags. Presses of <a> tags (without .real-link) are ignored, but to extend the functionality of url variables to the times they are used, we need to target them all and add the url variables onto them. Also, since the website is a single page app, we need to format them correctly, too, using the page variable.
	Links:
	{
		set: function()
		{
			$$("a").forEach(link =>
			{
				const href = link.getAttribute("href");
				
				if (href === null)
				{
					return;
				}

				const inNewTab = !(href.slice(0, 5) !== "https" && href.slice(0, 4) !== "data" && !(link.getAttribute("data-in-new-tab") == 1));
				
				link.addEventListener("click", () => redirect({ url: href, inNewTab }));
			});
		},



		disable: function()
		{
			$$("a:not(.real-link)").forEach(link => link.addEventListener("click", e => e.preventDefault()));
		}
	},
	
	// File break
	
	Math:
	{
		lengthCap: 250,
		
		typeset: function()
		{
			return MathJax.typesetPromise();
		},
		
		showTex: async function(element)
		{
			if (!Page.Cards.isOpen || element.getAttribute("data-showing-tex") === "1")
			{
				return;
			}
			
			element.setAttribute("data-showing-tex", "1");
			
			
			element.classList.remove("active");
			element.classList.remove("hover");
			
			const color = Site.Settings.urlVars["theme"] === 1 ? "rgba(24, 24, 24, 0)" : "rgba(255, 255, 255, 0)";
			
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
			
			
			
			const tex = element.getAttribute("data-source-tex").replaceAll(/\[NEWLINE\]/g, "\n").replaceAll(/\[TAB\]/g, "\t");
			
			
			
			const oldHeight = element.getBoundingClientRect().height;
			const oldWidth = element.getBoundingClientRect().width;
			element.style.minHeight = `${oldHeight}px`;
			
			const oldPadding = element.style.padding;
			
			
			const junkDrawer = document.createElement("div");
			junkDrawer.style.display = "none";
			Page.element.appendChild(junkDrawer);
			junkDrawer.appendChild(element.firstElementChild);
			
			
			
			let texElement = null;
			
			if (tex.indexOf("\n") !== -1)
			{
				texElement = document.createElement("textarea");
				texElement.textContent = tex;
				texElement.style.minHeight = `${oldHeight - 17}px`;
				texElement.style.width = "100%";
				texElement.style.marginLeft = "-6px";
				element.style.width = "75%";
			}
			
			else
			{
				texElement = document.createElement("input");
				texElement.setAttribute("type", "text");
				texElement.setAttribute("value", tex);
				texElement.style.height = `${oldHeight - 13}px`;
				texElement.style.width = `${oldWidth - 13}px`;
			}
			
			texElement.style.fontFamily = "'Source Code Pro', monospace";
			element.appendChild(texElement);
			
			element.style.padding = 0;
			
			texElement.select();
			setTimeout(() => texElement.select(), 50);
			setTimeout(() => texElement.select(), 250);
			
			texElement.onblur = () =>
			{
				texElement.remove();
				
				element.style.removeProperty("width");
				element.style.padding = oldPadding;
				element.appendChild(junkDrawer.firstElementChild);
				element.style.minHeight = "";
				junkDrawer.remove();
				
				element.setAttribute("data-showing-tex", "0");
				element.classList.add("active");
			};
		}
	},
};

// File break

Page.Cards =
{
	container: document.querySelector("#card-container"),
	currentCard: null,
	closeButton: document.querySelector("#card-close-button"),
	
	closeButtonIsFixed: false,
	
	isOpen: false,
	
	animationTime: 500,
	
	show: async function(id)
	{
		this.isOpen = true;
		
		this.container.style.display = "flex";
		this.container.style.opacity = 0;
		this.container.style.transform = "scale(1)";
		
		
		
		//Makes the animation look a little nicer (since it doesn't cut off the bottom of long cards).
		
		
		
		this.container.style.display = "flex";
		
		this.currentCard = document.querySelector(`#${id}-card`);
		
		this.container.appendChild(this.currentCard);
		this.currentCard.insertBefore(this.closeButton, this.currentCard.firstElementChild);
		
		this.container.scroll(0, 0);
		
		
		
		const rect = this.currentCard.getBoundingClientRect();
		
		if (rect.height > window.innerHeight - 32)
		{
			this.container.style.justifyContent = "flex-start";
		}
		
		else
		{
			this.container.style.justifyContent = "center";
		}
		
		
		
		this.container.style.transform = "scale(.95)";
		
		Page.element.style.filter = "brightness(1)";
		document.querySelector("#header").style.filter = "brightness(1)";
		document.querySelector("#header-container").style.filter = "brightness(1)";
		
		Page.element.style.transformOrigin = `50% calc(50vh + ${window.scrollY}px)`;
		
		document.documentElement.addEventListener("click", this.handleClickEvent);
		
		
		
		await new Promise((resolve, reject) =>
		{
			anime({
				targets: this.container,
				opacity: 1,
				scale: 1,
				duration: this.animationTime,
				easing: "easeOutQuint"
			});
			
			anime({
				targets: Page.element,
				duration: this.animationTime,
				easing: "easeOutQuint"
			});
			
			anime({
				targets: [Page.element, document.querySelector("#header"), document.querySelector("#header-container")],
				filter: "brightness(.5)",
				scale: .975,
				duration: this.animationTime,
				easing: "easeOutQuint"
			});
			
			const themeColor = Site.Settings.urlVars["theme"] === 1 ? "#0c0c0c" : "#7f7f7f";
			
			anime({
				targets: Site.Settings.metaThemeColorElement,
				content: themeColor,
				duration: this.animationTime,
				easing: "easeOutQuint",
			});
			
			const color = Site.Settings.urlVars["theme"] === 1 ? "rgb(12, 12, 12)" : "rgb(127, 127, 127)";
			
			anime({
				targets: document.documentElement,
				backgroundColor: color,
				duration: this.animationTime,
				easing: "easeOutQuint",
				complete: resolve
			});
		});
	},
	
	hide: async function()
	{
		Page.Cards.isOpen = false;
		
		await new Promise((resolve, reject) =>
		{
			anime({
				targets: [Page.element, document.querySelector("#header"), document.querySelector("#header-container")],
				filter: "brightness(1)",
				scale: 1,
				duration: Page.Cards.animationTime,
				easing: "easeOutQuint"
			});
			
			const themeColor = Site.Settings.urlVars["theme"] === 1 ? "#181818" : "#ffffff";
			
			anime({
				targets: Site.Settings.metaThemeColorElement,
				content: themeColor,
				duration: Page.Cards.animationTime,
				easing: "easeOutQuint",
			});
			
			const color = Site.Settings.urlVars["theme"] === 1 ? "rgb(24, 24, 24)" : "rgb(255, 255, 255)";
		
			anime({
				targets: document.documentElement,
				backgroundColor: color,
				duration: Page.Cards.animationTime,
				easing: "easeOutQuint"
			});
		
			anime({
				targets: Page.Cards.container,
				opacity: 0,
				scale: .95,
				duration: Page.Cards.animationTime,
				easing: "easeOutQuint",
				complete: resolve
			});
		});
		
		Page.Cards.container.style.display = "none";
		
		Page.element.appendChild(Page.Cards.currentCard);
		
		Page.Cards.container.appendChild(Page.Cards.closeButton);
		
		document.documentElement.removeEventListener("click", Page.Cards.handleClickEvent);
	},
	
	handleClickEvent: function(e)
	{
		if (e.target.id === "card-container")
		{
			Page.Cards.hide();
		}
	}
};