!async function()
{
	"use strict";
	
	if (Site.Settings.url_vars["theme"] !== 1)
	{
		Site.Settings.toggle("theme");
	}
	
	
	
	let full_res_viewer_element = document.querySelector("#full-res-viewer");
	let full_res_viewer_image_element = document.querySelector("#full-res-viewer img");
	let full_res_viewer_text_container_element = document.querySelector("#full-res-viewer-text-container");
	let main_text_container_element = document.querySelector("#main-text-container");
	let applet_link_element = document.querySelector("#applet-link");
	
	
	
	let elements = document.querySelectorAll(".gallery-image-1-1 img, .gallery-image-2-2 img, .gallery-image-3-3 img");
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].addEventListener("click", e =>
		{
			show_full_res_image(e.target.getAttribute("data-image-id"));
		});
	}
	
	
	
	full_res_viewer_element.addEventListener("click", e =>
	{
		console.log(e.target.id);
		
		if (e.target.id === "full-res-viewer-image-container" || e.target.id === "full-res-viewer-text-container" || e.target.id === "full-res-viewer")
		{
			hide_full_res_image();
		}
	});
	
	
	
	function show_full_res_image(id)
	{
		full_res_viewer_element.style.display = "block";
		full_res_viewer_image_element.src = `${Page.parent_folder}full-res/${id}.png`;
		
		
		
		let new_html = `
			<h1 class="heading-text center-if-needed">
				<span>${gallery_image_data[id]["title"]}</span>
			</h1>
			
			<br>
		`;
		
		
		
		let parameters = gallery_image_data[id]["parameters"];
		
		if (parameters !== "")
		{
			new_html += `
				<p class="body-text center-if-needed">
					<span>${parameters}</span>
				</p>
				
				<br>
			`;
		}
		
		
		
		let featured = gallery_image_data[id]["featured"];
		
		if (featured !== "")
		{
			new_html += `
				<p class="body-text center-if-needed">
					<span>${featured}</span>
				</p>
				
				<br>
			`;
		}
		
		
		
		main_text_container_element.innerHTML = new_html;
		
		
		
		applet_link_element.setAttribute("href", `/applets/${gallery_image_data[id]["applet_link"]}/${gallery_image_data[id]["applet_link"]}.html`);
		applet_link_element.setAttribute("onclick", `Page.Navigation.redirect('/applets/${gallery_image_data[id]["applet_link"]}/${gallery_image_data[id]["applet_link"]}.html')`);
		
		
		
		setTimeout(() =>
		{
			full_res_viewer_element.style.opacity = 1;
		}, 10);
	}
	
	
	
	function hide_full_res_image()
	{
		full_res_viewer_element.style.opacity = 0;
		
		setTimeout(() =>
		{
			full_res_viewer_element.style.display = "none";
		}, Site.opacity_animation_time);
	}
	
	
	
	const gallery_image_data = 
	{
		"double-pendulum-fractal":
		{
			"title": "The Double Pendulum Fractal",
			
			"parameters": "",
			
			"featured": "",
			
			"applet_link": "double-pendulum-fractal"
		}
	};
}()