!function()
{
	"use strict";
	
	
	
	if (Site.visted_homepage)
	{
		Page.element.querySelector("#return-scroll-to").scrollIntoView();
		
		Page.Banner.opacity = 0;
		Page.Banner.done_loading = true;
		Page.banner_element.style.opacity = 0;
		Page.content_element.style.opacity = 1;
	}
	
	Site.visted_homepage = true;
	
	
	
	setTimeout(() =>
	{
		Page.Animate.fade_left(Page.element.querySelector("#cruz-text"), Site.opacity_animation_time * 3.5);
		
		setTimeout(() =>
		{
			Page.Animate.fade_left(Page.element.querySelector("#godar-text"), Site.opacity_animation_time * 3.5);
		}, Site.opacity_animation_time);	
	}, Site.opacity_animation_time);
	
	set_name_text_opacity();
	
	
	
	if (Browser.name === "MS Edge")
	{
		alert_on_edge();
	}
	
	
	
	setTimeout(() =>
	{
		Page.element.querySelectorAll(".footer-button").forEach(element => Page.Load.HoverEvents.add(element));
	}, 100);
	
	
	
	Page.Load.Links.disable();
	
	
	
	Page.show();
	
	
	
	
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
		
		if (Page.scroll <= Page.Banner.max_scroll / 2.5)
		{
			opacity = Math.min(Math.max(1 - Page.scroll / (Page.Banner.max_scroll / 2.5), 0), 1);
		}
		
		Page.element.querySelector("#cruz-text").parentNode.style.opacity = opacity;
		Page.element.querySelector("#godar-text").parentNode.style.opacity = opacity;
	}
}()