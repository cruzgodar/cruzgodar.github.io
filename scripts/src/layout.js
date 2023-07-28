"use strict";



Page.Layout =
{
	layoutString: "",
	
	oldLayoutString: "",
	
	

	aspectRatio: 1,
	
	resizeTime: 0,
	
	
	
	onResize: async function()
	{
		setBannerMaxScroll(document.body.offsetHeight > window.innerHeight * 1.5 ? window.innerHeight / 2 : document.body.offsetHeight - window.innerHeight);
		
		Site.navigationAnimationDistanceVertical = Math.min(window.innerHeight / 20, 25);
		Site.navigationAnimationDistanceHorizontal = Math.min(window.innerWidth / 20, 25);
		
		this.aspectRatio = window.innerWidth / window.innerHeight;
		
		
		
		this.oldLayoutString = this.layoutString;
		
		if (window.innerWidth <= 700)
		{
			this.layoutString = "compact";
		}
		
		else if (window.innerWidth >= 1400)
		{
			this.layoutString = "ultrawide";
		}
		
		else
		{
			this.layoutString = "default";
		}
		
		
		
		if (this.oldLayoutString !== this.layoutString && this.layoutString === "ultrawide")
		{
			this.Multicols.create();
		}
		
		else if (this.oldLayoutString !== this.layoutString && this.oldLayoutString === "ultrawide")
		{
			this.Multicols.remove();
		}
		
		
		
		if (this.aspectRatio > 1 && !this.AppletColumns.areEqualized)
		{
			this.AppletColumns.equalize();
		}
		
		else if (this.aspectRatio <= 1 && this.AppletColumns.areEqualized)
		{
			this.AppletColumns.remove();
		}	
		
		
		
		this.Multicols.texts.forEach((text, index) =>
		{
			text.style.marginLeft = this.Multicols.reference.getBoundingClientRect().left + "px";
			this.Multicols.imageLinks[index].style.marginLeft = this.Multicols.reference.getBoundingClientRect().left + "px";
		});
		
		
		
		if (Page.Cards.isOpen)
		{
			const rect = Page.Cards.currentCard.getBoundingClientRect();
			
			if (rect.height > window.innerHeight - 32)
			{
				Page.Cards.container.style.justifyContent = "flex-start";
			}
			
			else
			{
				Page.Cards.container.style.justifyContent = "center";
			}
		}
		
		
		
		//Fix the logo cause Firefox is dumb.
		try
		{
			const element = Site.headerElement.children[0].children[0];
			element.style.width = `${element.getBoundingClientRect().height}px`;
		}
		
		catch(ex) {}
		
		
		
		bannerOnScroll(0);
	},



	Multicols:
	{
		active: false,
		
		texts: [],
		imageLinks: [],
		reference: null,
		
		
		
		create: function()
		{
			if (this.active)
			{
				return;
			}
			
			this.active = true;
			
			
			
			const parents = $$(".multicol-block");
			
			if (parents.length === 0)
			{
				return;
			}
			
			this.texts = [];
			this.imageLinks = [];
			
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
						
						this.imageLinks.push(parents[i].querySelector(".image-links"));
						
						this.texts[this.texts.length - 1].classList.add("multicol-text");
						this.texts[this.texts.length - 1].style.marginLeft = this.reference.getBoundingClientRect().left + "px";
						
						this.imageLinks[this.imageLinks.length - 1].style.gridRowGap = "1.5vw";
						this.imageLinks[this.imageLinks.length - 1].style.gridColumnGap = "1.5vw";
						
						this.imageLinks[this.imageLinks.length - 1].style.width = "62.5vw";
						this.imageLinks[this.imageLinks.length - 1].style.marginLeft = this.reference.getBoundingClientRect().left + "px";
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
			
			
			
			const containers = $$(".image-links-double-column-container");
			
			if (containers.length === 0)
			{
				return;
			}
			
			
			
			this.texts.forEach((text, index) =>
			{
				text.style.marginLeft = "";
				
				
				
				this.imageLinks[index].style.width = "";
				
				this.imageLinks[index].style.gridRowGap = "";
				this.imageLinks[index].style.gridColumnGap = "";
				
				this.imageLinks[index].style.marginLeft = "";
			});
			
			
			
			this.texts = [];
			this.imageLinks = [];
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
		areEqualized: false,
		
		equalize: function()
		{
			if (Site.Settings.urlVars["condensedApplets"] === 1)
			{
				return;
			}
			
			let leftColumn = null;
			let rightColumn = null;
			
			try
			{
				leftColumn = $("#canvas-landscape-left");
				rightColumn = $("#canvas-landscape-right");
			}
			
			catch(ex) {}
			
			if (leftColumn === null || rightColumn === null)
			{
				return;
			}
			
			
			
			let elements = [];
			
			const numLeftChildren = leftColumn.children.length;
			const numRightChildren = rightColumn.children.length;
			
			for (let i = 0; i < numLeftChildren; i++)
			{
				elements.push(leftColumn.children[i]);
			}
			
			for (let i = 0; i < numRightChildren; i++)
			{
				elements.push(rightColumn.children[i]);
			}
			
			
			
			let heightSums = [elements[0].clientHeight];
			
			for (let i = 1; i < elements.length; i++)
			{
				heightSums.push(heightSums[i - 1] + elements[i].clientHeight);
			}
			
			
			
			//Find the midpoint.
			
			let minHeightDifference = Infinity;
			
			let midpointIndex = 0;
			
			if (elements.length > 1)
			{
				for (let i = 0; i < elements.length; i++)
				{
					const heightDifference = Math.abs(heightSums[i] - (heightSums[heightSums.length - 1] - heightSums[i]));
					
					if (heightDifference < minHeightDifference)
					{
						minHeightDifference = heightDifference;
						
						midpointIndex = i + 1;
					}
				}
			}
			
			
			
			//Move elements around.
			if (midpointIndex < numLeftChildren)
			{
				for (let i = midpointIndex; i < numLeftChildren; i++)
				{
					leftColumn.children[i].classList.add("move-to-right");
				}
				
				const elementsToMove = $$(".move-to-right");
				
				for (let i = elementsToMove.length - 1; i >= 0; i--)
				{
					rightColumn.insertBefore(elementsToMove[i], rightColumn.firstElementChild);
				}
			}
			
			else
			{
				for (let i = 0; i < midpointIndex - numLeftChildren; i++)
				{
					rightColumn.children[i].classList.add("move-to-left");
				}
				
				const elementsToMove = $$(".move-to-left");
				
				for (let i = 0; i < elementsToMove.length; i++)
				{
					leftColumn.appendChild(elementsToMove[i]);
				}
			}
			
			
			
			this.areEqualized = true;
		},
		
		remove: function()
		{
			let leftColumn = null;
			let rightColumn = null;
			
			try
			{
				leftColumn = $("#canvas-landscape-left");
				rightColumn = $("#canvas-landscape-right");
			}
			
			catch(ex) {}
			
			if (leftColumn === null || rightColumn === null)
			{
				return;
			}
			
			
			
			let elementsToMove = $$(".move-to-left");
			
			for (let i = elementsToMove.length - 1; i >= 0; i--)
			{
				rightColumn.insertBefore(elementsToMove[i], rightColumn.firstElementChild);
				
				elementsToMove[i].classList.remove("move-to-left");
			}
			
			
			
			elementsToMove = $$(".move-to-right");
			
			for (let i = 0; i < elementsToMove.length; i++)
			{
				leftColumn.appendChild(elementsToMove[i]);
				
				elementsToMove[i].classList.remove("move-to-right");
			}
			
			
			
			this.areEqualized = false;
		}
	}
};