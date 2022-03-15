!function()
{
	"use strict";
	
	
	
	setTimeout(() =>
	{
		Page.Animate.fade_left(Page.element.querySelector("#cruz-text"), Site.aos_animation_time * .8);
		
		setTimeout(() =>
		{
			Page.Animate.fade_left(Page.element.querySelector("#godar-text"), Site.aos_animation_time * .8);
		}, 300);	
	}, 200);
	
	set_name_text_opacity();
	
	
	
	let homepage_image_links_mode = "";
	
	window.addEventListener("resize", homepage_resize);
	Page.temporary_handlers["resize"].push(homepage_resize);
	
	setTimeout(() =>
	{
		homepage_resize();
	}, 500);
	
	
	
	if (Browser.name === "MS Edge")
	{
		alert_on_edge();
	}
	
	
	
	Page.Footer.Floating.load();
	
	
	
	setTimeout(() =>
	{
		try
		{
			let elements = Page.element.querySelectorAll(".footer-button");
			
			for (let i = 0; i < elements.length; i++)
			{
				Page.Load.HoverEvents.add(elements[i]);
			}
		}
		
		catch(ex) {}
	}, 100);
	
	
	
	Page.Load.Links.disable();
	
	
	
	Page.show();
	
	
	
	let elements = Page.element.querySelectorAll(".image-links");
	
	elements[0].id = "category-pages";
	
	elements[1].id = "newest-pages";
	
	let children = elements[1].querySelectorAll(".image-link");
	
	for (let i = 0; i < Page.Load.AOS.elements[2].length; i++)
	{
		Page.Load.AOS.elements[2][i].setAttribute("data-aos", "zoom-out");
		
		if (Site.use_js_animation)
		{
			Page.Load.AOS.elements[2][i].style.transform = "scale(1.3)";
		}
	}
	
	Page.Load.AOS.element_animation_types[2] = 1;
	
	
	
	
	
	function homepage_resize()
	{
		if (homepage_image_links_mode !== Page.Layout.layout_string)
		{
			homepage_image_links_mode = Page.Layout.layout_string;
			
			if (Page.Layout.layout_string === "ultrawide")
			{
				Page.element.querySelectorAll(".image-link")[4].insertAdjacentHTML("beforebegin", `<div id="empty-image-link"></div>`);
			}
			
			else
			{
				try {Page.element.querySelector("#empty-image-link").remove();}
				catch(ex) {}
			}
		}
	}
	
	
	
	function alert_on_edge()
	{
		Page.element.querySelector("#logo").insertAdjacentHTML("beforebegin", `
			<div class="body-text" style="text-align: center">
				<strong>Microsoft Edge is not fully supported on this site. Using <a href="https://www.google.com/chrome/">Chrome</a>, <a href="https://www.apple.com/safari/">Safari</a>, <a href="https://www.mozilla.org/en-US/firefox/?v=a">Firefox</a>, or <a href="https://www.opera.com/">Opera</a> is highly recommended.<strong>
			</div>
			
			<div style="height: 5vh"></div>
		`);
	}
	
	
	
	function set_name_text_opacity()
	{
		let opacity = 0;
		
		if (Page.scroll <= Page.Layout.window_height/3)
		{
			opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - 3 * Page.scroll / Page.Layout.window_height, 0) - Math.PI / 2);
		}
		
		Page.element.querySelector("#cruz-text").parentNode.style.opacity = opacity;
		Page.element.querySelector("#godar-text").parentNode.style.opacity = opacity;
	}
}()