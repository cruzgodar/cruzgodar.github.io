import Lapsa from "/scripts/lapsa.mjs";

const lapsa = new Lapsa({
	shelfIconPaths: "/graphics/lapsa-icons/",
	
	builds:
	{
		"theme-demonstration":
		{
			reset: async (slide, forward, duration) =>
			{
				if (lapsa.buildState >= 3 && lapsa.buildState <= 5)
				{
					document.querySelector(":root").style.setProperty("--theme-transition-time", `${duration}ms`);
					
					document.documentElement.classList.add("theme-transition");
					lapsa.slideContainer.classList.add("theme-transition");
					
					setTimeout(() =>
					{
						document.documentElement.classList.remove("dark-industrial-theme-1");
						lapsa.slideContainer.classList.remove("dark-industrial-theme-1");
						
						document.documentElement.classList.remove("blue-whimsical-theme-1");
						lapsa.slideContainer.classList.remove("blue-whimsical-theme-1");
						
						document.documentElement.classList.remove("dark-futuristic-theme-1");
						lapsa.slideContainer.classList.remove("dark-futuristic-theme-1");
						
						lapsa.slideContainer.classList.add("theme-opacity-change");
						
						setTimeout(() =>
						{
							lapsa.slideContainer.classList.remove("theme-opacity-change");
							lapsa.slideContainer.classList.remove("dark-industrial-theme-2");
							lapsa.slideContainer.classList.remove("blue-whimsical-theme-2");
							lapsa.slideContainer.classList.remove("dark-futuristic-theme-2");
						}, duration / 2);
					}, 0);
				}
				
				await new Promise(resolve =>
				{
					setTimeout(() =>
					{
						document.documentElement.classList.remove("theme-transition");
						lapsa.slideContainer.classList.remove("theme-transition");
						
						resolve();
					}, duration);
				});
			},
			
			
			
			2: async (slide, forward, duration = 300) =>
			{
				document.querySelector(":root").style.setProperty("--theme-transition-time", `${duration}ms`);
				
				document.documentElement.classList.add("theme-transition");
				lapsa.slideContainer.classList.add("theme-transition");
				
				setTimeout(() =>
				{
					if (forward)
					{
						document.documentElement.classList.add("dark-industrial-theme-1");
						lapsa.slideContainer.classList.add("dark-industrial-theme-1");
						
						lapsa.slideContainer.classList.add("theme-opacity-change");
						
						setTimeout(() =>
						{
							lapsa.slideContainer.classList.add("dark-industrial-theme-2");
							lapsa.slideContainer.classList.remove("theme-opacity-change");
						}, duration / 2);
					}
					
					else
					{
						document.documentElement.classList.remove("dark-industrial-theme-1");
						lapsa.slideContainer.classList.remove("dark-industrial-theme-1");
						
						lapsa.slideContainer.classList.add("theme-opacity-change");
						
						setTimeout(() =>
						{
							lapsa.slideContainer.classList.remove("dark-industrial-theme-2");
							lapsa.slideContainer.classList.remove("theme-opacity-change");
						}, duration / 2);
					}
				}, 0);
				
				await new Promise(resolve =>
				{
					setTimeout(() =>
					{
						document.documentElement.classList.remove("theme-transition");
						lapsa.slideContainer.classList.remove("theme-transition");
						
						resolve();
					}, duration);
				});
			},
			
			
			
			3: async (slide, forward, duration = 300) =>
			{
				document.querySelector(":root").style.setProperty("--theme-transition-time", `${duration}ms`);
				
				document.documentElement.classList.add("theme-transition");
				lapsa.slideContainer.classList.add("theme-transition");
				
				setTimeout(() =>
				{
					if (forward)
					{
						document.documentElement.classList.remove("dark-industrial-theme-1");
						lapsa.slideContainer.classList.remove("dark-industrial-theme-1");
						
						document.documentElement.classList.add("blue-whimsical-theme-1");
						lapsa.slideContainer.classList.add("blue-whimsical-theme-1");
						
						lapsa.slideContainer.classList.add("theme-opacity-change");
						
						setTimeout(() =>
						{
							lapsa.slideContainer.classList.remove("dark-industrial-theme-2");
							lapsa.slideContainer.classList.add("blue-whimsical-theme-2");
							lapsa.slideContainer.classList.remove("theme-opacity-change");
						}, duration / 2);
					}
					
					else
					{
						document.documentElement.classList.remove("blue-whimsical-theme-1");
						lapsa.slideContainer.classList.remove("blue-whimsical-theme-1");
						
						document.documentElement.classList.add("dark-industrial-theme-1");
						lapsa.slideContainer.classList.add("dark-industrial-theme-1");
						
						lapsa.slideContainer.classList.add("theme-opacity-change");
						
						setTimeout(() =>
						{
							lapsa.slideContainer.classList.remove("blue-whimsical-theme-2");
							lapsa.slideContainer.classList.add("dark-industrial-theme-2");
							
							lapsa.slideContainer.classList.remove("theme-opacity-change");
						}, duration / 2);
					}
				}, 0);
				
				await new Promise(resolve =>
				{
					setTimeout(() =>
					{
						document.documentElement.classList.remove("theme-transition");
						lapsa.slideContainer.classList.remove("theme-transition");
						
						resolve();
					}, duration);
				});
			},
			
			
			
			4: async (slide, forward, duration = 300) =>
			{
				document.querySelector(":root").style.setProperty("--theme-transition-time", `${duration}ms`);
				
				document.documentElement.classList.add("theme-transition");
				lapsa.slideContainer.classList.add("theme-transition");
				
				setTimeout(() =>
				{
					if (forward)
					{
						document.documentElement.classList.remove("blue-whimsical-theme-1");
						lapsa.slideContainer.classList.remove("blue-whimsical-theme-1");
						
						document.documentElement.classList.add("dark-futuristic-theme-1");
						lapsa.slideContainer.classList.add("dark-futuristic-theme-1");
						
						lapsa.slideContainer.classList.add("theme-opacity-change");
						
						setTimeout(() =>
						{
							lapsa.slideContainer.classList.remove("blue-whimsical-theme-2");
							lapsa.slideContainer.classList.add("dark-futuristic-theme-2");
							lapsa.slideContainer.classList.remove("theme-opacity-change");
						}, duration / 2);
					}
					
					else
					{
						document.documentElement.classList.remove("dark-futuristic-theme-1");
						lapsa.slideContainer.classList.remove("dark-futuristic-theme-1");
						
						document.documentElement.classList.add("blue-whimsical-theme-1");
						lapsa.slideContainer.classList.add("blue-whimsical-theme-1");
						
						lapsa.slideContainer.classList.add("theme-opacity-change");
						
						setTimeout(() =>
						{
							lapsa.slideContainer.classList.remove("dark-futuristic-theme-2");
							lapsa.slideContainer.classList.add("blue-whimsical-theme-2");
							
							lapsa.slideContainer.classList.remove("theme-opacity-change");
						}, duration / 2);
					}
				}, 0);
				
				await new Promise(resolve =>
				{
					setTimeout(() =>
					{
						document.documentElement.classList.remove("theme-transition");
						lapsa.slideContainer.classList.remove("theme-transition");
						
						resolve();
					}, duration);
				});
			},
			
			
			
			5: async (slide, forward, duration = 300) =>
			{
				document.querySelector(":root").style.setProperty("--theme-transition-time", `${duration}ms`);
				
				document.documentElement.classList.add("theme-transition");
				lapsa.slideContainer.classList.add("theme-transition");
				
				setTimeout(() =>
				{
					if (forward)
					{
						document.documentElement.classList.remove("dark-futuristic-theme-1");
						lapsa.slideContainer.classList.remove("dark-futuristic-theme-1");
						
						lapsa.slideContainer.classList.add("theme-opacity-change");
						
						setTimeout(() =>
						{
							lapsa.slideContainer.classList.remove("dark-futuristic-theme-2");
							lapsa.slideContainer.classList.remove("theme-opacity-change");
						}, duration / 2);
					}
					
					else
					{
						document.documentElement.classList.add("dark-futuristic-theme-1");
						lapsa.slideContainer.classList.add("dark-futuristic-theme-1");
						
						lapsa.slideContainer.classList.add("theme-opacity-change");
						
						setTimeout(() =>
						{
							lapsa.slideContainer.classList.add("dark-futuristic-theme-2");
							
							lapsa.slideContainer.classList.remove("theme-opacity-change");
						}, duration / 2);
					}
				}, 0);
				
				await new Promise(resolve =>
				{
					setTimeout(() =>
					{
						document.documentElement.classList.remove("theme-transition");
						lapsa.slideContainer.classList.remove("theme-transition");
						
						resolve();
					}, duration);
				});
			}
		}
	}
});