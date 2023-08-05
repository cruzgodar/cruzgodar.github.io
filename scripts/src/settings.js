"use strict";



Site.forceDarkThemePages =
[
	"/gallery/",
	"/slides/oral-exam/"
];

Site.preventThemeChangePages =
[
	"/gallery/",
	"/slides/oral-exam/",
	"/writing/caracore/",
	"/writing/caligo/"
];



Site.Settings =
{
	urlVars: {},
	
	//Set to either 0 or 1 if a page has forced a theme and it needs to change back.
	revertTheme: -1,
	forcedTheme: false,
	
	
	
	getUrlVar: function(id)
	{
		const query = window.location.search.substring(1);
		const vars = query.split("&");
		
		for (let i = 0; i < vars.length; i++)
		{
			let pair = vars[i].split("=");
			
			if (pair[0] === id)
			{
				return pair[1];
			}
		}
		
		return null;
	},
	
	
	
	setUp: function()
	{
		this.urlVars =
		{
			"theme": this.getUrlVar("theme"),
			"condensedApplets": this.getUrlVar("condensedApplets")
		};
		
		
		
		window.matchMedia("(prefers-color-scheme: dark)").addListener((e) =>
		{
			if (this.revertTheme !== -1 || Page.Cards.isOpen)
			{
				return;
			}
			
			
			
			if ((e.matches && this.urlVars["theme"] !== 1) || (!e.matches && this.urlVars["theme"] === 1))
			{
				this.toggleTheme();
			}
		});

		if (window.matchMedia("(prefers-color-scheme: dark)").matches && this.urlVars["theme"] === null)
		{
			this.urlVars["theme"] = 1;
		}
		
		
		
		if (this.urlVars["theme"] == null)
		{
			this.urlVars["theme"] = 0;
		}
		
		else if (this.urlVars["theme"] == 1)
		{
			this.urlVars["theme"] = 0;
			this.toggleTheme(true);
		}
		
		
		
		if (this.urlVars["condensedApplets"] == null)
		{
			this.urlVars["condensedApplets"] = 0;
		}
		
		
		
		//This prevents things from flickering when we first load the site.
		
		let element = null;
		
		if (this.urlVars["theme"] === 1)
		{
			element = Site.addStyle(this.darkThemeStyle, false);
		}
		
		try {document.querySelector("#theme-contrast-adjust").remove();}
		catch(ex) {}
		
		try {element.id = "theme-contrast-adjust";}
		catch(ex) {}
	},
	
	
	
	metaThemeColorElement: document.querySelector("#theme-color-meta"),
	
	
	
	handleThemeRevert: function()
	{
		if (Site.Settings.forcedTheme)
		{
			Site.Settings.forcedTheme = false;
			return;
		}
		
		
		
		if (this.revertTheme === 0)
		{
			this.revertTheme = -1;
			
			this.toggleTheme();
		}
		
		else if (Site.Settings.revertTheme === 1)
		{
			this.revertTheme = -1;
			
			this.toggleTheme();
		}
	},
	


	//Changes a setting.
	toggleTheme: function(noAnimation = false, force = false)
	{
		if (!force && Site.preventThemeChangePages.includes(Page.url))
		{
			return;
		}
		
		let element = null;
		
		if (noAnimation === false)
		{
			element = Site.addStyle(`
				html, #header-container
				{
					transition: background-color ${Site.opacityAnimationTime * 2 / 1000}s ease !important;
				}
				
				p, span, h1, h2, a, q, em, strong, dfn, #card-close-button
				{
					transition: color ${Site.opacityAnimationTime * 2 / 1000}s ease !important;
				}
				
				 .text-box, .text-field, .checkbox-container, .checkbox-container > input ~ .checkbox, .radio-button-container, .radio-button-container > input ~ .radio-button, .loading-spinner:after, #floating-footer-content, #floating-footer-button-background, .footer-button, .text-button, .nav-button, .slider-container > input, .input-cap-dialog
				{
					transition: background-color ${Site.opacityAnimationTime * 2 / 1000}s ease, border-color ${Site.opacityAnimationTime * 2 / 1000}s ease, color ${Site.opacityAnimationTime * 2 / 1000}s ease !important;
				}
				
				.tex-holder, .card
				{
					transition: background-color ${Site.opacityAnimationTime * 2 / 1000}s ease, box-shadow ${Site.opacityAnimationTime * 2 / 1000}s ease;
				}
				
				#header-logo img, #header-links a img
				{
					transition: filter ${Site.opacityAnimationTime * 2 / 1000}s ease;
				}
			`);
		}
		
		
		
		//Light to dark
		if (this.urlVars["theme"] === 0)
		{
			setTimeout(() =>
			{
				const element = Site.addStyle(this.darkThemeStyle, false);
				
				try {document.querySelector("#theme-contrast-adjust").remove();}
				catch(ex) {}
				
				try {element.id = "theme-contrast-adjust";}
				catch(ex) {}
				
				this.clearWeirdInlineStyles();
			}, Site.opacityAnimationTime * 2);
			
			this.urlVars["theme"] = 1;
		}
		
		//Dark to light
		else
		{
			setTimeout(() =>
			{
				try {document.querySelector("#theme-contrast-adjust").remove();}
				catch(ex) {}
				
				this.clearWeirdInlineStyles();
			}, Site.opacityAnimationTime * 2);
			
			this.urlVars["theme"] = 0;
		}
		
		
		
		try {this.animateTheme(this.urlVars["theme"] === 1)}
		catch(ex) {}
		
		
		
		if (!noAnimation)
		{
			anime({
				targets: this.metaThemeColorElement,
				content: this.urlVars["theme"] === 1 ? "#181818" : "#ffffff",
				duration: Site.opacityAnimationTime * 2,
				easing: "cubicBezier(.25, .1, .25, 1)",
			});
		}
		
		else
		{
			this.metaThemeColorElement.setAttribute("content", this.urlVars["theme"] === 1 ? "#181818" : "#ffffff");
			
			document.querySelector(":root").style.setProperty("--invert", this.urlVars["theme"] === 1 ? 1 : 0);
		}
		
		
		
		if (!noAnimation)
		{
			setTimeout(() =>
			{
				element.remove();
			}, Site.opacityAnimationTime * 2);
		}
	},
	
	
	
	condenseApplet: function()
	{
		Site.addStyle(`
			p:not(.text-box-subtext, .checkbox-subtext, .radio-button-subtext, .slider-subtext), h1, h2, header, footer, br
			{
				display: none;
			}
			
			section:first-of-type
			{
				margin-top: 0 !important;
				margin-bottom: 0 !important;
			}
			
			body
			{
				margin-top: -5vh;
			}

			#canvas-landscape
			{
				flex-direction: column !important;
			}

			#canvas-landscape-left, #canvas-landscape-middle, #canvas-landscape-right
			{
				width: 80% !important;
			}
		`);
		
		try {$("#download-button").parentNode.parentNode.style.display = "none"}
		catch(ex) {}
	},



	animateTheme: function(dark = true)
	{
		if (!dark)
		{
			try
			{
				document.body.querySelector("#header-container").style.backgroundColor = "rgb(255, 255, 255)";
				
				document.body.querySelectorAll("#header-logo span, #header-links a span").forEach(element => element.style.color = "rgb(0, 0, 0)");
				
				document.body.querySelectorAll("#header-logo img, #header-links a img").forEach(element => element.style.filter = "invert(0)");
				
				const rootSelector = document.querySelector(":root");
				
				let dummy = {t: 1};
				
				anime({
					targets: dummy,
					t: 0,
					duration: Site.opacityAnimationTime * 2,
					easing: "cubicBezier(.25, .1, .25, 1)",
					update: () => rootSelector.style.setProperty("--invert", dummy.t)
				});
			}
			
			catch(ex) {}
			
			
			
			document.documentElement.style.backgroundColor = "rgb(255, 255, 255)";
			
			Page.setElementStyles(".heading-text, .date-text, .title-text", "color", "rgb(0, 0, 0)");
			
			Page.setElementStyles(".section-text, .quote-attribution, #card-close-button", "color", "rgb(48, 48, 48)");
			
			Page.setElementStyles(".body-text, .body-text span, .body-text em, .body-text strong, .body-text dfn, .song-lyrics, .image-link-subtext, .floating-settings-button-text, .quote-text q, .text-box, .text-field, .input-cap-dialog", "color", "rgb(96, 96, 96)");
			
			Page.setElementStyles("a", "color", "rgb(127, 192, 127)");
			
			Page.setElementStyles(".text-box, .text-field, .checkbox-container > input ~ .checkbox, .radio-button-container > input ~ .radio-button, .input-cap-dialog", "background-color", "rgb(255, 255, 255)");
			
			Page.setElementStyles(".text-box, .text-field, .text-button, .checkbox-container, #output-canvas, .input-cap-dialog", "border-color", "rgb(96, 96, 96)");
			
			Page.setElementStyles(".checkbox-container > input:checked ~ .checkbox, .radio-button-container > input:checked ~ .radio-button", "background-color", "rgb(96, 96, 96)");
			
			
			
			try {document.querySelector("#slider-style").remove();}
			catch(ex) {}
			
			
			$$(".desmos-border").forEach(element => changeOpacity(element, 0, Site.opacityAnimationTime));
			
			setTimeout(() =>
			{
				DESMOS_PURPLE = "#772fbf";
				DESMOS_BLUE = "#2f77bf";
				DESMOS_RED = "#bf2f2f";
				DESMOS_GREEN = "#2fbf2f";
				DESMOS_BLACK = "#000000";
				
				try {Page.Load.createDesmosGraphs(false);}
				catch(ex) {}
				
				setTimeout(() =>
				{
					$$(".desmos-border").forEach(element => changeOpacity(element, 1, Site.opacityAnimationTime));
				}, Site.opacityAnimationTime);
			}, 2 * Site.opacityAnimationTime);
		}
		
		
		
		else
		{
			try
			{
				document.body.querySelector("#header-container").style.backgroundColor = "rgb(24, 24, 24)";
				
				document.body.querySelectorAll("#header-logo span, #header-links a:not(.hover) span").forEach(element => element.style.setProperty("color", "rgb(255, 255, 255)", "important"));
				document.body.querySelectorAll("#header-links a.hover span").forEach(element => element.style.removeProperty("color"));
				
				document.querySelectorAll("#header-logo img, #header-links a img").forEach(element => element.style.filter = "invert(1)");
				
				const rootSelector = document.querySelector(":root");
				
				let dummy = {t: 0};
				
				anime({
					targets: dummy,
					t: 1,
					duration: Site.opacityAnimationTime * 2,
					easing: "cubicBezier(.25, .1, .25, 1)",
					update: () => rootSelector.style.setProperty("--invert", dummy.t)
				});
			}
			
			catch(ex) {}
			
			
			
			document.documentElement.style.backgroundColor = "rgb(24, 24, 24)";
			
			Page.setElementStyles(".heading-text, .date-text, .title-text", "color", "rgb(255, 255, 255)");
			
			Page.setElementStyles(".section-text, .quote-attribution, #card-close-button", "color", "rgb(220, 220, 220)");
			
			Page.setElementStyles(".body-text, .body-text span, .body-text em, .body-text strong, .body-text dfn, .song-lyrics, .image-link-subtext, .floating-settings-button-text, .quote-text q, .text-box, .text-field, .input-cap-dialog", "color", "rgb(172, 172, 172)");
			
			Page.setElementStyles("a", "color", "rgb(144, 216, 144)");
			
			Page.setElementStyles(".text-box, .text-field, .checkbox-container > input ~ .checkbox, .radio-button-container > input ~ .radio-button, .input-cap-dialog", "background-color", "rgb(24, 24, 24)");
			
			Page.setElementStyles(".text-box, .text-field, .text-button, .checkbox-container, #output-canvas, .input-cap-dialog", "border-color", "rgb(172, 172, 172)");
			
			Page.setElementStyles(".checkbox-container > input:checked ~ .checkbox, .radio-button-container > input:checked ~ .radio-button", "background-color", "rgb(172, 172, 172)");
			
			
			
			
			
			$$(".desmos-border").forEach(element => changeOpacity(element, 0, Site.opacityAnimationTime));
			
			setTimeout(() =>
			{
				DESMOS_PURPLE = "#60c000";
				DESMOS_BLUE = "#c06000";
				DESMOS_RED = "#00c0c0";
				DESMOS_GREEN = "#c000c0";
				DESMOS_BLACK = "#000000";
				
				try {Page.Load.createDesmosGraphs(true);}
				catch(ex) {}
				
				setTimeout(() =>
				{
					$$(".desmos-border").forEach(element => changeOpacity(element, 1, Site.opacityAnimationTime));
				}, Site.opacityAnimationTime);
			}, 2 * Site.opacityAnimationTime);
			
			
			
			const element = Site.addStyle(`
				.slider-container > input
				{
					background-color: rgb(127, 127, 127) !important;
				}

				.slider-container > input::-webkit-slider-thumb
				{
					background-color: rgb(172, 172, 172) !important;
				}

				.slider-container > input::-moz-slider-thumb
				{
					background-color: rgb(172, 172, 172) !important;
				}

				.slider-container > input:active
				{
					background-color: rgb(220, 220, 220) !important;
				}

				.slider-container > input:hover::-webkit-slider-thumb
				{
					background-color: rgb(220, 220, 220) !important;
				}

				.slider-container > input:hover::-moz-slider-thumb
				{
					background-color: rgb(220, 220, 220) !important;
				}

				.slider-container > input:active::-webkit-slider-thumb
				{
					background-color: rgb(255, 255, 255) !important;
				}

				.slider-container > input:active::-moz-slider-thumb
				{
					background-color: rgb(255, 255, 255) !important;
				}
			`, false);
			
			try {document.querySelector("#slider-style").remove();}
			catch(ex) {}
			
			try {element.id = "slider-style";}
			catch(ex) {}
		}
	},



	clearWeirdInlineStyles: function()
	{
		Page.setElementStyles(".checkbox-container > input ~ .checkbox, .checkbox-container > input:checked ~ .checkbox, .radio-button-container > input ~ .radio-button, .radio-button-container > input:checked ~ .radio-button, .text-box, .text-field", "background-color", "");
		
		Page.setElementStyles(".text-box, .text-field", "color", "");
		
		Page.setElementStyles(".text-box, .text-field", "border-color", "");
		
		document.body.querySelectorAll("#header-logo span, #header-links a span").forEach(element => element.style.removeProperty("color"));
	},
	
	
	
	darkThemeStyle: `
		#header-container, .card
		{
			background-color: rgb(24, 24, 24);
		}
		
		#header-logo span, #header-links a span
		{
			color: rgb(255, 255, 255);
		}
		
		#header-logo.hover span, #header-links a.hover span
		{
			color: rgb(0, 0, 0);
		}
		
		#header-logo img, #header-links a img
		{
			filter: invert(1);
		}
		
		#header-logo.hover img, #header-links a.hover imginput
		{
			filter: invert(0) !important;
		}
		
		
		
		.heading-text, .date-text, .title-text
		{
			color: rgb(255, 255, 255);
		}
		
		.section-text, .quote-attribution, #card-close-button
		{
			color: rgb(220, 220, 220);
		}
		
		.body-text, .body-text span, .song-lyrics, .image-link-subtext, .quote-text
		{
			color: rgb(172, 172, 172);
		}
		
		a
		{
			color: rgb(144, 216, 144);
		}
		
		
		
		.text-box, .text-field, .input-cap-dialog
		{
			background-color: rgb(24, 24, 24);
			color: rgb(172, 172, 172);
			border-color: rgb(172, 172, 172);
		}
		
		.text-box:focus, .text-field:focus
		{
			color: rgb(255, 255, 255);
			border-color: rgb(255, 255, 255);
		}
		
		
		
		.checkbox-container > input ~ .checkbox, .radio-button-container > input ~ .radio-button
		{
			background-color: rgb(24, 24, 24);
		}

		.checkbox-container > input:checked ~ .checkbox, .radio-button-container > input:checked ~ .radio-button
		{
			background-color: rgb(172, 172, 172);
		}
		
		.text-button, .checkbox-container, .output-canvas, .desmos-border
		{
			border-color: rgb(172, 172, 172);
		}
		
		
		
		.tex-holder
		{
			background-color: rgba(24, 24, 24, 0);
			
			box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 1);
		}
		
		.tex-holder.hover
		{
			box-shadow: 0px 0px 16px 2px rgba(0, 0, 0, 1);
		}
		
		.card
		{
			box-shadow: 0px 0px 16px 4px rgba(0, 0, 0, 1);
		}
		
		#card-close-button
		{
			background-color: rgb(24, 24, 24);
		}
		
		#card-close-button.hover
		{
			background-color: rgb(64, 64, 64);
		}
	`
};



Page.url = decodeURIComponent(Site.Settings.getUrlVar("page")).replace("index.html", "");

if (Page.url === "null")
{
	Page.url = "/home/";
}