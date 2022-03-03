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
		
		
		
		if (this.aspect_ratio > 1 && !this.AppletColumns.are_equalized)
		{
			setTimeout(this.AppletColumns.equalize, 100);
		}
		
		else if (this.aspect_ratio < 1 && this.AppletColumns.are_equalized)
		{
			setTimeout(this.AppletColumns.remove, 100)
		}	
		
		
		
		for (let i = 0; i < this.Multicols.texts.length; i++)
		{
			this.Multicols.texts[i].style.marginLeft = this.Multicols.reference.getBoundingClientRect().left + "px";
			this.Multicols.image_links[i].style.marginLeft = this.Multicols.reference.getBoundingClientRect().left + "px";
		}
		
		
		
		let elements = document.querySelectorAll("iframe");
		
		for (let i = 0; i < elements.length; i++)
		{
			elements[i].style.height = `${elements[i].offsetWidth - 8}px`;
		}
		
		
		
		if (this.aspect_ratio < 1)
		{
			Page.Banner.file_name = "portrait." + Page.Images.file_extension;
		}
		
		else
		{
			Page.Banner.file_name = "landscape." + Page.Images.file_extension;
		}
		
		
		
		//The banner opacity is the big sticking point, though. The solution is to increase the window height slowly and fire scroll events in rapid succession.
		this.resize_time = 0;
		
		this.window_width_step_distance = (this.new_window_height - this.window_height) * (8 / Site.opacity_animation_time);
		this.window_height_step_distance = (this.new_window_height - this.window_height) * (8 / Site.opacity_animation_time);
		
		let refresh_id = setInterval(() =>
		{
			this.resize_step();
			
			if (this.resize_time >= Site.opacity_animation_time)
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
			if (!this.active)
			{
				return;
			}
			
			this.active = false;
			
			
			
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
				left_column = document.querySelector("#canvas-landscape-left");
				right_column = document.querySelector("#canvas-landscape-right");
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
				
				let elements_to_move = document.querySelectorAll(".move-to-right");
				
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
				
				let elements_to_move = document.querySelectorAll(".move-to-left");
				
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
				left_column = document.querySelector("#canvas-landscape-left");
				right_column = document.querySelector("#canvas-landscape-right");
			}
			
			catch(ex) {}
			
			if (left_column === null || right_column === null)
			{
				return;
			}
			
			
			
			let elements_to_move = document.querySelectorAll(".move-to-left");
			
			for (let i = elements_to_move.length - 1; i >= 0; i--)
			{
				right_column.insertBefore(elements_to_move[i], right_column.firstElementChild);
				
				elements_to_move[i].classList.remove("move-to-left");
			}
			
			
			
			elements_to_move = document.querySelectorAll(".move-to-right");
			
			for (let i = 0; i < elements_to_move.length; i++)
			{
				left_column.appendChild(elements_to_move[i]);
				
				elements_to_move[i].classList.remove("move-to-right");
			}
			
			
			
			this.are_equalized = false;
		}
	}
};