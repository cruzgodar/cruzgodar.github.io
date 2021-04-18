/*
	Page
		...
		
		Layout: methods for handling layout changes.
			
			on_resize: updates the banner opacity and anything else that needs changing when the window resizes.
			
			resize_step: updates the banner opacity gradually so there aren't abrupt opacity changes when next scrolling.
			
			Multicols: methods to split image link pages into multiple columns in the ultrawide layout.
				
				create: arranges the image links into multiple columns.
				
				remove: reverts to the standard layout.
		
		
		
		Interaction: methods for dealing with mouse vs touch iteraction.
	
*/



"use strict";



Page.Layout =
{
	layout_string: "",
	
	old_layout_string: "",
	
	

	window_width: 0,
	window_height: 0,
	aspect_ratio: 1,
	
	new_window_width: 0,
	new_window_height: 0,
	
	
	
	window_width_step_distance: 0,
	window_height_step_distance: 0,
	
	resize_time: 0,
	
	
	
	on_resize: function()
	{
		//Everything here can be done immediately.
		this.new_window_width = window.innerWidth;
		this.new_window_height = window.innerHeight;
		
		this.aspect_ratio = this.new_window_width / this.new_window_height;
		
		this.old_layout_string = this.layout_string;
		
		if (this.new_window_width / this.new_window_height < 9/16 || this.new_window_width <= 700)
		{
			this.layout_string = "compact";
		}
		
		else if (this.new_window_width / this.new_window_height > 16/9 || this.new_window_width >= 1400)
		{
			this.layout_string = "ultrawide";
		}
		
		else
		{
			this.layout_string = "default";
		}
		
		
		
		if (this.old_layout_string !== this.layout_string && "small_margins_on_ultrawide" in Page.settings && Page.settings["small_margins_on_ultrawide"])
		{
			reduce_page_margins();
		}
		
		
		
		if (this.old_layout_string !== this.layout_string && this.layout_string === "ultrawide")
		{
			this.Multicols.create();
		}
		
		else if (this.old_layout_string !== this.layout_string && this.old_layout_string === "ultrawide")
		{
			this.Multicols.remove();
		}
		
		
		
		for (let i = 0; i < this.Multicols.texts.length; i++)
		{
			this.Multicols.texts[i].style.marginLeft = this.Multicols.reference.getBoundingClientRect().left + "px";
			this.Multicols.image_links[i].style.marginLeft = this.Multicols.reference.getBoundingClientRect().left + "px";
		}
		
		
		
		if (this.aspect_ratio < 1)
		{
			Page.Banner.file_name = "portrait." + Images.file_extension;
		}
		
		else
		{
			Page.Banner.file_name = "landscape." + Images.file_extension;
		}
		
		
		
		//The banner opacity is the big sticking point, though. The solution is to increase the window height slowly and fire scroll events in rapid succession.
		this.resize_time = 0;
		
		this.window_width_step_distance = (this.new_window_height - this.window_height) * (8 / 300);
		this.window_height_step_distance = (this.new_window_height - this.window_height) * (8 / 300);
		
		let refresh_id = setInterval(() =>
		{
			this.resize_step();
			
			if (this.resize_time >= 300)
			{
				clearInterval(refresh_id);
				
				this.window_width = this.new_window_width;
				this.window_height = this.new_window_height;
				
				Page.Banner.on_scroll(0);
			}
		}, 8);
	},



	resize_step: function()
	{
		this.window_width += this.window_width_step_distance;
		this.window_height += this.window_height_step_distance;
		
		this.resize_time += 8;
		
		Page.Banner.on_scroll(0);
	},



	Multicols:
	{
		texts: [],
		image_links: [],
		reference: null,
		
		
		
		create: function()
		{
			let parents = document.querySelectorAll(".multicol-block");
			
			if (parents.length === 0)
			{
				return;
			}
			
			this.texts = [];
			this.image_links = [];
			
			for (let i = 0; i < parents.length; i++)
			{
				if (parents[i].querySelector(".image-links").children.length <= 3)
				{
					if (i < parents.length - 1 && parents[i + 1].querySelector(".image-links").children.length <= 3)
					{
						let container = document.createElement("div");
						
						container.classList.add("image-links-double-column-container");
						
						parents[i].parentNode.insertBefore(container, parents[i]);
						
						this.reference = parents[i].querySelector(".image-links");
						
						container.appendChild(parents[i]);
						container.appendChild(parents[i + 1]);
						
						let element = parents[i + 1].querySelector(".new-aos-section");
						element.classList.remove("new-aos-section");
						element.classList.add("old-new-aos-section");
						
						i++;
					}
					
					
					
					else if (i >= 1 && parents[i - 1].querySelector(".image-links").children.length <= 3)
					{
						this.texts.push(parents[i].querySelector(".section-text, .heading-text"));
						
						this.image_links.push(parents[i].querySelector(".image-links"));
						
						this.texts[this.texts.length - 1].classList.add("multicol-text");
						this.texts[this.texts.length - 1].style.marginLeft = this.reference.getBoundingClientRect().left + "px";
						
						this.image_links[this.image_links.length - 1].style.gridRowGap = "1.5vw";
						this.image_links[this.image_links.length - 1].style.gridColumnGap = "1.5vw";
						
						this.image_links[this.image_links.length - 1].style.width = "62.5vw";
						this.image_links[this.image_links.length - 1].style.marginLeft = this.reference.getBoundingClientRect().left + "px";
					}
				}
			}
		},



		remove: function()
		{
			let containers = document.querySelectorAll(".image-links-double-column-container");
			
			if (containers.length === 0)
			{
				return;
			}
			
			
			
			for (let i = 0; i < this.texts.length; i++)
			{
				this.texts[i].style.marginLeft = "";
				
				
				
				this.image_links[i].style.width = "";
				
				this.image_links[i].style.gridRowGap = "";
				this.image_links[i].style.gridColumnGap = "";
				
				this.image_links[i].style.marginLeft = "";
			}
			
			
			
			this.texts = [];
			this.image_links = [];
			this.reference = null;
			
			
			
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
	}
};



Page.Interaction =
{
	//Whether this is a touchscreen device on the current page. It's assumed to be false on every page until a touchstart or touchmove event is detected, at which point it's set to true.
	currently_touch_device: true,
	
	last_mousemove_event: 0
};