!function()
{
	"use strict";
	
	
	
	let homepage_image_links_mode = "";
	
	window.addEventListener("resize", homepage_resize);
	temporary_handlers["resize"].push(homepage_resize);
	
	homepage_resize();
	
	
	
	if (browser_name === "MS Edge")
	{
		alert_on_edge();
	}
	
	
	
	if (url_vars["content_animation"] === 1)
	{
		let opacity = 0;
		
		
		if (scroll <= window_height/3)
		{
			opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - 3 * scroll / window_height, 0) - Math.PI / 2);
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
	
	
	
	set_up_floating_footer();
	
	setTimeout(function()
	{
		try
		{
			let elements = document.querySelectorAll(".footer-button");
			
			for (let i = 0; i < elements.length; i++)
			{
				add_hover_event(elements[i]);
			}
		}
		
		catch(ex) {}
	}, 100);
	
	
	
	disable_links();
	
	
	
	
	
	function homepage_resize()
	{
		if (homepage_image_links_mode !== layout_string)
		{
			homepage_image_links_mode = layout_string;
			
			if (layout_string === "ultrawide")
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
		
		
		if (scroll <= window_height/3)
		{
			opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - 3 * scroll / window_height, 0) - Math.PI / 2);
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
			if (scroll <= window_height/3)
			{
				opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - 3 * scroll / window_height, 0) - Math.PI / 2);
			}
			
			else
			{
				opacity = 0;
			}
			
			
			if (url_vars["content_animation"] !== 1)
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