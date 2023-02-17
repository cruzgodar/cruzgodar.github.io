"use strict";



Page.Layout =
{
	layout_string: "",
	
	old_layout_string: "",
	
	

	aspect_ratio: 1,
	
	resize_time: 0,
	
	
	
	on_resize: async function()
	{
		Page.Banner.max_scroll = document.body.offsetHeight > window.innerHeight * 1.5 ? window.innerHeight / 2 : document.body.offsetHeight - window.innerHeight;
		
		Site.navigation_animation_distance_vertical = Math.min(window.innerHeight / 20, 25);
		Site.navigation_animation_distance_horizontal = Math.min(window.innerWidth / 20, 25);
		
		this.aspect_ratio = window.innerWidth / window.innerHeight;
		
		
		
		this.old_layout_string = this.layout_string;
		
		if (window.innerWidth <= 700)
		{
			this.layout_string = "compact";
		}
		
		else if (window.innerWidth >= 1400)
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
			this.AppletColumns.equalize();
		}
		
		else if (this.aspect_ratio <= 1 && this.AppletColumns.are_equalized)
		{
			this.AppletColumns.remove();
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
			
			
			
			const parents = Page.element.querySelectorAll(".multicol-block");
			
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
						const container = document.createElement("div");
						
						container.classList.add("image-links-double-column-container");
						
						parents[i].parentNode.insertBefore(container, parents[i]);
						
						this.reference = parents[i].querySelector(".image-links");
						
						container.appendChild(parents[i]);
						container.appendChild(parents[i + 1]);
						
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
			
			
			
			const containers = Page.element.querySelectorAll(".image-links-double-column-container");
			
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
		}
	},
	
	
	
	AppletColumns:
	{
		are_equalized: false,
		
		equalize: function()
		{
			if (Site.Settings.url_vars["condensed_applets"] === 1)
			{
				return;
			}
			
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
			
			const num_left_children = left_column.children.length;
			const num_right_children = right_column.children.length;
			
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
					const height_difference = Math.abs(height_sums[i] - (height_sums[height_sums.length - 1] - height_sums[i]));
					
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
				
				const elements_to_move = Page.element.querySelectorAll(".move-to-right");
				
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
				
				const elements_to_move = Page.element.querySelectorAll(".move-to-left");
				
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