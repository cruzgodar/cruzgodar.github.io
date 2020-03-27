!function()
{
	"use strict";
	
	
	
	if (browser_name === "MS Edge")
	{
		alert_on_edge();
	}
	
	
	
	add_name_text();
	
	
	
	set_up_floating_footer();
	
	disable_links();
	
	
	
	
	
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
		
		setTimeout(function()
		{
			document.querySelector("#banner").insertAdjacentHTML("afterend", `
				<div class="name-text-container" style="position: fixed" data-aos="fade-left">
					<p id="cruz-text" class="name-text" style="opacity: ${opacity}">Cruz</p>
				</div>
			`);
		}, 350);
		
		setTimeout(function()
		{
			document.querySelector("#banner").insertAdjacentHTML("afterend", `
				<div class="name-text-container" style="position: fixed" data-aos="fade-left">
				<p id="godar-text" class="name-text" style="opacity: ${opacity}">Godar</p>
			</div>
			`);
		}, 600);
		
		if (url_vars["content_animation"] === 1)
		{
			let elements = document.querySelectorAll(".name-text-container");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].removeAttribute("data-aos");
			}
		}
	}
}()