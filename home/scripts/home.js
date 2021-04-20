!function()
{
	"use strict";
	
	
	
	let homepage_image_links_mode = "";
	
	window.addEventListener("resize", homepage_resize);
	Page.temporary_handlers["resize"].push(homepage_resize);
	
	homepage_resize();
	
	
	
	let element = document.querySelectorAll(".image-links")[1];
	
	element.id = "newest-pages";
	
	let children = element.querySelectorAll(".image-link");
	
	for (let i = 0; i < children.length; i++)
	{
		children[i].setAttribute("data-aos", "zoom-out");
	}
	
	
	
	
	
	if (Browser.name === "MS Edge")
	{
		alert_on_edge();
	}
	
	
	
	if (Site.Settings.url_vars["content_animation"] === 1)
	{
		let opacity = 0;
		
		
		if (Page.scroll <= Page.Layout.window_height/3)
		{
			opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - 3 * Page.scroll / Page.Layout.window_height, 0) - Math.PI / 2);
		}
		
		else
		{
			opacity = 0;
		}
		
		
		
		document.querySelector("#banner").insertAdjacentHTML("afterend", `
			<div class="name-text-container" style="position: fixed">
				<p id="cruz-text" class="name-text" style="opacity: ${opacity}">Cruz</p>
			</div>
			
			<div class="name-text-container" style="position: fixed">
				<p id="godar-text" class="name-text" style="opacity: ${opacity}">Godar</p>
			</div>
		`);
	}
	
	else
	{
		setTimeout(add_name_text, 350);
	}
	
	
	
	Page.Footer.Floating.load();
	
	
	
	setTimeout(function()
	{
		try
		{
			let elements = document.querySelectorAll(".footer-button");
			
			for (let i = 0; i < elements.length; i++)
			{
				Page.Load.HoverEvents.add(elements[i]);
			}
		}
		
		catch(ex) {}
	}, 100);
	
	
	
	Page.Load.Links.disable();
	
	
	
	
	
	function homepage_resize()
	{
		if (homepage_image_links_mode !== Page.Layout.layout_string)
		{
			homepage_image_links_mode = Page.Layout.layout_string;
			
			if (Page.Layout.layout_string === "ultrawide")
			{
				document.querySelectorAll(".image-link")[0].insertAdjacentHTML("beforebegin", `<div id="empty-image-link"></div>`);
			}
			
			else
			{
				try {document.querySelector("#empty-image-link").remove();}
				catch(ex) {}
			}
		}
	}
	
	
	
	function alert_on_edge()
	{
		document.querySelector("#logo").insertAdjacentHTML("beforebegin", `
			<div class="body-text" style="text-align: center">
				<strong>Microsoft Edge is not fully supported on this site. Using <a href="https://www.google.com/chrome/">Chrome</a>, <a href="https://www.apple.com/safari/">Safari</a>, <a href="https://www.mozilla.org/en-US/firefox/?v=a">Firefox</a>, or <a href="https://www.opera.com/">Opera</a> is highly recommended.<strong>
			</div>
			
			<div style="height: 5vh"></div>
		`);
	}
	
	
	
	function add_name_text()
	{
		document.querySelector(".name-text").remove();
		
		let opacity = 0;
		
		
		if (Page.scroll <= Page.Layout.window_height/3)
		{
			opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - 3 * Page.scroll / Page.Layout.window_height, 0) - Math.PI / 2);
		}
		
		else
		{
			opacity = 0;
		}
		
		document.querySelector("#banner").insertAdjacentHTML("afterend", `
			<div class="name-text-container" style="position: fixed" data-aos="fade-left">
				<p id="cruz-text" class="name-text" style="opacity: ${opacity}">Cruz</p>
			</div>
		`);
		
		
		
		setTimeout(function()
		{
			if (Page.scroll <= Page.Layout.window_height/3)
			{
				opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - 3 * Page.scroll / Page.Layout.window_height, 0) - Math.PI / 2);
			}
			
			else
			{
				opacity = 0;
			}
			
			
			if (Site.Settings.url_vars["content_animation"] !== 1)
			{
				document.querySelector("#banner").insertAdjacentHTML("afterend", `
					<div class="name-text-container" style="position: fixed" data-aos="fade-left">
						<p id="godar-text" class="name-text" style="opacity: ${opacity}">Godar</p>
					</div>
				`);
			}
		}, 250);
	}
}()