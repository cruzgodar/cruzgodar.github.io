!async function()
{
	"use strict";
	
	
	
	const num_stars = 500;
	
	let called_sweep = false;
	
	await fade_in();
	
	window.addEventListener("scroll", on_scroll);
	temporary_handlers["scroll"].push(on_scroll);
	
	
	
	
	function fade_in()
	{
		return new Promise((resolve, reject) =>
		{
			let element = Site.add_style(`
				html
				{
					transition: background-color .6s ease !important;
				}
				
				#earth-light
				{
					transition: opacity .6s ease !important;
				}
			`);
			
			document.documentElement.style.backgroundColor = "rgb(0, 0, 0)";
			
			setTimeout(() =>
			{
				document.querySelector("#earth-light").style.opacity = 1;
				
				add_stars();
				
				setTimeout(() =>
				{
					element.remove();
					
					resolve();
				}, 600);
			}, 600);
		});
	}
	
	
	
	function add_stars()
	{
		for (let i = 0; i < num_stars; i++)
		{
			let x = Math.random() * 100;
			let y = Math.random() * 100;
			let color = `rgb(${Math.random() * 48 + 207}, ${Math.random() * 48 + 207}, ${Math.random() * 48 + 207})`;
			let opacity = Math.pow(Math.random(), 5);
			let size = Math.random() * 5 + 3;
			
			add_star(x, y, color, opacity, size);
		}
	}
	
	
	
	//x and y are given between 0 and 100, and specify the number of vw / vh.
	function add_star(x, y, color, opacity, size)
	{
		let element = document.createElement("p");
		
		element.textContent = "✦";
		
		element.style.color = color;
		
		element.style.position = "fixed";
		
		element.style.left = `${x}vw`;
		
		element.style.top = `${y}vh`;
		
		element.	style.opacity = 0;
			
		element.style.fontSize = `${size}px`;
		
		element.style.transition = "opacity .6s ease-in-out";
		
		document.body.appendChild(element);
		
		setTimeout(() =>
		{
			element.style.opacity = opacity;
		}, 50);
	}
	
	
	
	function on_scroll()
	{
		let opacity = .5 + .5 * Math.sin(Math.PI * Math.max(1 - Page.scroll / Page.Layout.window_height, 0) - Math.PI / 2);
		
		document.querySelector("#earth-dark").style.opacity = 1 - opacity;
		document.querySelector("#earth-light").style.opacity = opacity;
		
		if (Page.scroll >= .95 * Page.Layout.window_height && !called_sweep)
		{
			setTimeout(sweep_to_black, 1200);
		}
	}
	
	
	
	function sweep_to_black()
	{
		document.querySelector("#gradient").style.bottom = "100vh";
		document.querySelector("#blackspace").style.bottom = "0";
	}
}()