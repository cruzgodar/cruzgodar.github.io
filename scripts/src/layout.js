"use strict";



//Handles everything to do with the layout and when it changes.



let old_layout = "";



window.addEventListener("resize", resize_update);



//Yes, I know this is weird. But it's the only way I know to make banner opacity work smoothly.

let resize_time = 0;
let new_window_width = 0, new_window_height = 0;
let window_width_step_distance = 0, window_height_step_distance = 0;

let multicol_texts = [];
let multicol_image_links = [];
let multicol_ref = null;

function resize_update()
{
	//Everything here can be done immediately.
	let new_window_width = window.innerWidth;
	let new_window_height = window.innerHeight;
	
	aspect_ratio = new_window_width / new_window_height;
	
	old_layout = layout_string;
	
	if (new_window_width / new_window_height < 9/16 || new_window_width <= 700)
	{
		layout_string = "compact";
	}
	
	else if (new_window_width / new_window_height > 16/9 || new_window_width >= 1400)
	{
		layout_string = "ultrawide";
	}
	
	else
	{
		layout_string = "default";
	}
	
	
	
	if (old_layout !== layout_string && "small_margins_on_ultrawide" in page_settings && page_settings["small_margins_on_ultrawide"])
	{
		reduce_page_margins();
	}
	
	
	
	if (old_layout !== layout_string && layout_string === "ultrawide")
	{
		create_multicols();
	}
	
	else if (old_layout !== layout_string && old_layout === "ultrawide")
	{
		remove_multicols();
	}
	
	
	
	for (let i = 0; i < multicol_texts.length; i++)
	{
		multicol_texts[i].style.marginLeft = multicol_ref.getBoundingClientRect().left + "px";
		multicol_image_links[i].style.marginLeft = multicol_ref.getBoundingClientRect().left + "px";
	}
	
	
	
	if (new_window_width / new_window_height < 1)
	{
		banner_name = "portrait." + banner_extension;
	}
	
	else
	{
		banner_name = "landscape." + banner_extension;
	}
	
	
	
	//The banner opacity is the big sticking point, though. The solution is to increase the window height slowly and fire scroll events in rapid succession.
	resize_time = 0;
	
	window_width_step_distance = (new_window_height - window_height) * (8 / 300);
	window_height_step_distance = (new_window_height - window_height) * (8 / 300);
	
	let refresh_id = setInterval(function()
	{
		resize_step();
		
		if (resize_time >= 300)
		{
			clearInterval(refresh_id);
			
			window_width = new_window_width;
			window_height = new_window_height;
			
			scroll_update(0);
		}
	}, 8);
}



function resize_step()
{
	window_width += window_width_step_distance;
	window_height += window_height_step_distance;
	
	resize_time += 8;
	
	scroll_update(0);
}



function create_multicols()
{
	let parents = document.querySelectorAll(".multicol-block");
	
	if (parents.length === 0)
	{
		return;
	}
	
	multicol_texts = [];
	multicol_image_links = []
	
	for (let i = 0; i < parents.length; i++)
	{
		if (parents[i].querySelector(".image-links").children.length <= 3)
		{
			if (i < parents.length - 1 && parents[i + 1].querySelector(".image-links").children.length <= 3)
			{
				let container = document.createElement("div");
				
				container.classList.add("image-links-double-column-container");
				
				parents[i].parentNode.insertBefore(container, parents[i]);
				
				multicol_ref = parents[i].querySelector(".image-links");
				
				container.appendChild(parents[i]);
				container.appendChild(parents[i + 1]);
				
				let element = parents[i + 1].querySelector(".new-aos-section");
				element.classList.remove("new-aos-section");
				element.classList.add("old-new-aos-section");
				
				i++;
			}
			
			
			
			else if (i >= 1 && parents[i - 1].querySelector(".image-links").children.length <= 3)
			{
				multicol_texts.push(parents[i].querySelector(".section-text, .heading-text"));
				
				multicol_image_links.push(parents[i].querySelector(".image-links"));
				
				multicol_texts[multicol_texts.length - 1].classList.add("multicol-text");
				multicol_texts[multicol_texts.length - 1].style.marginLeft = multicol_ref.getBoundingClientRect().left + "px";
				
				multicol_image_links[multicol_image_links.length - 1].style.gridRowGap = "1.5vw";
				multicol_image_links[multicol_image_links.length - 1].style.gridColumnGap = "1.5vw";
				
				multicol_image_links[multicol_image_links.length - 1].style.width = "62.5vw";
				multicol_image_links[multicol_image_links.length - 1].style.marginLeft = multicol_ref.getBoundingClientRect().left + "px";
			}
		}
	}
}



function remove_multicols()
{
	let containers = document.querySelectorAll(".image-links-double-column-container");
	
	if (containers.length === 0)
	{
		return;
	}
	
	
	
	for (let i = 0; i < multicol_texts.length; i++)
	{
		multicol_texts[i].style.marginLeft = "";
		
		
		
		multicol_image_links[i].style.width = "";
		
		multicol_image_links[i].style.gridRowGap = "";
		multicol_image_links[i].style.gridColumnGap = "";
		
		multicol_image_links[i].style.marginLeft = "";
	}
	
	multicol_texts = [];
	multicol_image_links = [];
	multicol_ref = null;
	
	
	
	for (let i = 0; i < containers.length; i++)
	{
		//Remove the container but keep the children.
		while (containers[i].firstChild)
		{
			containers[i].parentNode.insertBefore(containers[i].firstChild, containers[i]);
		}
		
		containers[i].remove();
	}
	
	
	
	let elements = document.querySelectorAll(".old-new-aos-section");
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].classList.remove("old-new-aos-section");
		elements[i].classList.add("new-aos-section");
	}
}