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
		
		if (this.new_window_width <= 700)
		{
			this.layout_string = "compact";
		}
		
		else if (this.new_window_width >= 1400)
		{
			this.layout_string = "ultrawide";
		}
		
		else
		{
			this.layout_string = "default";
		}
		
		
		
		if (this.old_layout_string !== this.layout_string && "small_margins_on_ultrawide" in Page.settings && Page.settings["small_margins_on_ultrawide"])
		{
			Site.Settings.reduce_page_margins();
		}
		
		
		
		if (this.old_layout_string !== this.layout_string && this.layout_string === "ultrawide")
		{
			this.Multicols.create();
		}
		
		else if (this.old_layout_string !== this.layout_string && this.old_layout_string === "ultrawide")
		{
			this.Multicols.remove();
		}
		
		
		
		Site.navigation_animation_distance = Math.min(this.new_window_height, this.new_window_width) / 20;
		
		
		
		if (this.aspect_ratio > 1 && !this.AppletColumns.are_equalized)
		{
			setTimeout(this.AppletColumns.equalize, 50);
		}
		
		else if (this.aspect_ratio < 1 && this.AppletColumns.are_equalized)
		{
			setTimeout(this.AppletColumns.remove, 50);
		}	
		
		
		
		this.Multicols.texts.forEach((text, index) =>
		{
			text.style.marginLeft = this.Multicols.reference.getBoundingClientRect().left + "px";
			this.Multicols.image_links[index].style.marginLeft = this.Multicols.reference.getBoundingClientRect().left + "px";
		});
		
		
		
		if (this.aspect_ratio < 1)
		{
			Page.Banner.file_name = "portrait." + Page.Images.file_extension;
		}
		
		else
		{
			Page.Banner.file_name = "landscape." + Page.Images.file_extension;
		}
		
		
		
		//The banner opacity is the big sticking point, though. The solution is to increase the window height slowly and fire scroll events in rapid succession.
		let temp_object = {w: this.window_width, h: this.window_height};
		
		anime({
			targets: temp_object,
			w: this.new_window_width,
			h: this.new_window_height,
			duration: Site.opacity_animation,
			easing: "easeInOutQuad",
			update: () =>
			{
				this.window_width = temp_object.w;
				this.window_height = temp_object.h;
				
				Page.Banner.on_scroll(0);
			}
		});
	},



	Multicols:
	{
		active: false,
		
		texts: [],
		image_links: [],
		reference: null,
		
		
		
		create: function()
		{
			if (this.active)
			{
				return;
			}
			
			this.active = true;
			
			
			
			let parents = Page.element.querySelectorAll(".multicol-block");
			
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
			if (!this.active)
			{
				return;
			}
			
			this.active = false;
			
			
			
			let containers = Page.element.querySelectorAll(".image-links-double-column-container");
			
			if (containers.length === 0)
			{
				return;
			}
			
			
			
			this.texts.forEach((text, index) =>
			{
				text.style.marginLeft = "";
				
				
				
				this.image_links[index].style.width = "";
				
				this.image_links[index].style.gridRowGap = "";
				this.image_links[index].style.gridColumnGap = "";
				
				this.image_links[index].style.marginLeft = "";
			});
			
			
			
			this.texts = [];
			this.image_links = [];
			this.reference = null;
			
			
			
			containers.forEach(container =>
			{
				//Remove the container but keep the children.
				while (container.firstChild)
				{
					container.parentNode.insertBefore(container.firstChild, container);
				}
				
				container.remove();
			});
			
			
			
			Page.element.querySelectorAll(".old-new-aos-section").forEach(section =>
			{
				section.classList.remove("old-new-aos-section");
				section.classList.add("new-aos-section");
			});
		}
	},
	
	
	
	AppletColumns:
	{
		are_equalized: false,
		
		equalize: function()
		{
			let left_column = null;
			let right_column = null;
			
			try
			{
				left_column = Page.element.querySelector("#canvas-landscape-left");
				right_column = Page.element.querySelector("#canvas-landscape-right");
			}
			
			catch(ex) {}
			
			if (left_column === null || right_column === null)
			{
				return;
			}
			
			
			
			let elements = [];
			
			let num_left_children = left_column.children.length;
			let num_right_children = right_column.children.length;
			
			for (let i = 0; i < num_left_children; i++)
			{
				elements.push(left_column.children[i]);
			}
			
			for (let i = 0; i < num_right_children; i++)
			{
				elements.push(right_column.children[i]);
			}
			
			
			
			let height_sums = [elements[0].clientHeight];
			
			for (let i = 1; i < elements.length; i++)
			{
				height_sums.push(height_sums[i - 1] + elements[i].clientHeight);
			}
			
			
			
			//Find the midpoint.
			
			let min_height_difference = Infinity;
			
			let midpoint_index = 0;
			
			if (elements.length > 1)
			{
				for (let i = 0; i < elements.length; i++)
				{
					let height_difference = Math.abs(height_sums[i] - (height_sums[height_sums.length - 1] - height_sums[i]));
					
					if (height_difference < min_height_difference)
					{
						min_height_difference = height_difference;
						
						midpoint_index = i + 1;
					}
				}
			}
			
			
			
			//Move elements around.
			if (midpoint_index < num_left_children)
			{
				for (let i = midpoint_index; i < num_left_children; i++)
				{
					left_column.children[i].classList.add("move-to-right");
				}
				
				let elements_to_move = Page.element.querySelectorAll(".move-to-right");
				
				for (let i = elements_to_move.length - 1; i >= 0; i--)
				{
					right_column.insertBefore(elements_to_move[i], right_column.firstElementChild);
				}
			}
			
			else
			{
				for (let i = 0; i < midpoint_index - num_left_children; i++)
				{
					right_column.children[i].classList.add("move-to-left");
				}
				
				let elements_to_move = Page.element.querySelectorAll(".move-to-left");
				
				for (let i = 0; i < elements_to_move.length; i++)
				{
					left_column.appendChild(elements_to_move[i]);
				}
			}
			
			
			
			this.are_equalized = true;
		},
		
		remove: function()
		{
			let left_column = null;
			let right_column = null;
			
			try
			{
				left_column = Page.element.querySelector("#canvas-landscape-left");
				right_column = Page.element.querySelector("#canvas-landscape-right");
			}
			
			catch(ex) {}
			
			if (left_column === null || right_column === null)
			{
				return;
			}
			
			
			
			let elements_to_move = Page.element.querySelectorAll(".move-to-left");
			
			for (let i = elements_to_move.length - 1; i >= 0; i--)
			{
				right_column.insertBefore(elements_to_move[i], right_column.firstElementChild);
				
				elements_to_move[i].classList.remove("move-to-left");
			}
			
			
			
			elements_to_move = Page.element.querySelectorAll(".move-to-right");
			
			for (let i = 0; i < elements_to_move.length; i++)
			{
				left_column.appendChild(elements_to_move[i]);
				
				elements_to_move[i].classList.remove("move-to-right");
			}
			
			
			
			this.are_equalized = false;
		}
	}
};