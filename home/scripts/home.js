!function()
{
	if (browser_name == "MS Edge")
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
		
		document.querySelector("#banner").insertAdjacentHTML("afterend", `
			<div class="name-text-container" style="position: fixed" data-aos="fade-left" data-aos-delay="350">
				<p id="cruz-text" class="name-text">Cruz</p>
			</div>
			
			<div class="name-text-container" style="position: fixed" data-aos="fade-left" data-aos-delay="600">
				<p id="godar-text" class="name-text">Godar</p>
			</div>
		`);
		
		if (url_vars["content_animation"] == 1)
		{
			let elements = document.querySelectorAll(".name-text-container");
			for (let i = 0; i < elements.length; i++)
			{
				elements[i].removeAttribute("data-aos");
			}
		}
		
		if (url_vars["banner_style"] == 1)
		{
			set_element_styles(".name-text-container", "position", "absolute");
		}
	}
}()