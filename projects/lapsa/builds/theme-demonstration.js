
const rootElement = document.querySelector(":root");

if (!rootElement)
{
	throw new Error("Root element does not exist");
}

const reset = function({ lapsa, duration })
{
	return new Promise(resolve =>
	{
		if (lapsa.buildState >= 3 && lapsa.buildState <= 5)
		{
			rootElement.style.setProperty("--theme-transition-time", `${duration}ms`);
			
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
		
		setTimeout(() =>
		{
			document.documentElement.classList.remove("theme-transition");
			lapsa.slideContainer.classList.remove("theme-transition");
			
			resolve();
		}, duration);
	});
};



const build2 = function({ lapsa, forward, duration = 300 })
{
	return new Promise(resolve =>
	{
		rootElement.style.setProperty("--theme-transition-time", `${duration}ms`);
		
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
		
		setTimeout(() =>
		{
			document.documentElement.classList.remove("theme-transition");
			lapsa.slideContainer.classList.remove("theme-transition");
			
			resolve();
		}, duration);
	});
};

const build3 = function({ lapsa, forward, duration = 300 })
{
	return new Promise(resolve =>
	{
		rootElement.style.setProperty("--theme-transition-time", `${duration}ms`);
		
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
		
		setTimeout(() =>
		{
			document.documentElement.classList.remove("theme-transition");
			lapsa.slideContainer.classList.remove("theme-transition");
			
			resolve();
		}, duration);
	});
};

const build4 = function({ lapsa, forward, duration = 300 })
{
	return new Promise(resolve =>
	{
		rootElement.style.setProperty("--theme-transition-time", `${duration}ms`);
		
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
		
		setTimeout(() =>
		{
			document.documentElement.classList.remove("theme-transition");
			lapsa.slideContainer.classList.remove("theme-transition");
			
			resolve();
		}, duration);
	});
};

const build5 = function({ lapsa, forward, duration = 300 })
{
	return new Promise(resolve =>
	{
		rootElement.style.setProperty("--theme-transition-time", `${duration}ms`);
		
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
		
		setTimeout(() =>
		{
			document.documentElement.classList.remove("theme-transition");
			lapsa.slideContainer.classList.remove("theme-transition");
			
			resolve();
		}, duration);
	});
};

export const themeDemonstrationSlideBuilds =
{
	reset,
	2: build2,
	3: build3,
	4: build4,
	5: build5
};