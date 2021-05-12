!async function()
{
	"use strict";
	
	
	
	const num_stars = 100;
	
	await change_background_color();
	
	await add_stars();
	
	
	
	
	
	function change_background_color()
	{
		return new Promise((resolve, reject) =>
		{
			let element = Site.add_style(`
				html
				{
					transition: background-color .6s ease !important;
				}
			`);
			
			document.documentElement.style.backgroundColor = "rgb(0, 0, 0)";
			
			setTimeout(() =>
			{
				element.remove();
				
				resolve();
			}, 600);
		});
	}
	
	
	
	function add_stars()
	{
		return new Promise(async (resolve, reject) =>
		{
			for (let i = 0; i < num_stars; i++)
			{
				let x = Math.random() * 100;
				let y = Math.random() * 100;
				let color = `rgb(${Math.random() * 48 + 207}, ${Math.random() * 48 + 207}, ${Math.random() * 48 + 207})`;
				let opacity = Math.pow(Math.random(), 5);
				let size = Math.random() * 5 + 5;
				
				await add_star(x, y, color, opacity, size);
			}
		});
	}
	
	
	
	//x and y are given between 0 and 100, and specify the number of vw / vh.
	function add_star(x, y, color, opacity, size)
	{
		return new Promise((resolve, reject) =>
		{
			let element = document.createElement("p");
			
			element.textContent = "✦";
			
			element.style.color = color;
			
			element.style.position = "absolute";
			
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
			
			setTimeout(() =>
			{
				resolve();
			}, 10);
		});
	}
}()