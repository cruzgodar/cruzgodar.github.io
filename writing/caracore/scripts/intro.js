!async function()
{
	"use strict";
	
	
	
	const num_stars = 500;
	
	let called_sweep = false;
	
	window.addEventListener("scroll", on_scroll);
	Page.temporary_handlers["scroll"].push(on_scroll);
	
	await fade_in();
	
	
	
	
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
		
		document.querySelector("#container").appendChild(element);
		
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
			called_sweep = true;
			
			setTimeout(sweep_to_black, 600);
		}
	}
	
	
	
	function sweep_to_black()
	{
		document.querySelector("#container").style.opacity = 0;
		
		setTimeout(() =>
		{
			show_character_text_1();
		}, 900);
	}
	
	
	
	function show_character_text_1()
	{
		document.documentElement.style.overflowY = "hidden";
		document.body.style.overflowY = "hidden";
		
		document.body.style.userSelect = "none";
		document.body.style.WebkitUserSelect = "none";
		
		
		
		document.querySelector("#container").insertAdjacentHTML("beforebegin", `
			<div class="character-text-container">
				<div style="height: 30vh"></div>
				
				<div class="new-aos-section" data-aos="fade-up">
					<p class="body-text" style="color: rgb(255, 191, 191)">A fighter, stranded from her family.</p>
				</div>
				
				<br>
				
				<div data-aos="fade-up">
					<p class="body-text" style="color: rgb(255, 225, 191)">A student, trapped on a train bound for hope.</p>
				</div>
				
				<br>
				
				<div data-aos="fade-up">
					<p class="body-text" style="color: rgb(191, 226, 255)">A scientist, surrounded by a cutthroat troupe.</p>
				</div>
			</div>
		`);
		
		setTimeout(() =>
		{
			Page.Load.AOS.load();
			Page.Load.AOS.show_section(0);
			
			setTimeout(() =>
			{
				show_character_text_2();
			}, 4000);
		}, 50);
	}
	
	
	
	function show_character_text_2()
	{
		document.querySelector(".character-text-container").style.opacity = 0;
		
		
		setTimeout(() =>
		{
				document.querySelector(".character-text-container").remove();
				
				
				document.querySelector("#container").insertAdjacentHTML("beforebegin", `
				<div class="character-text-container">
					<div style="height: 30vh"></div>
					
					<div class="new-aos-section" data-aos="fade-up">
						<p class="body-text" style="color: rgb(234, 191, 255)">A rebel stripped of her cause.</p>
					</div>
					
					<br>
					
					<div data-aos="fade-up">
						<p class="body-text" style="color: rgb(191, 196, 255)">Two brothers at odds.</p>
					</div>
					
					<br>
					
					<div data-aos="fade-up">
						<p class="body-text" style="color: rgb(248, 255, 191)">A creature barely passing as human.</p>
					</div>
				</div>
			`);
			
			setTimeout(() =>
			{
				Page.Load.AOS.load();
				Page.Load.AOS.show_section(0);
				
				setTimeout(() =>
				{
					show_character_text_3();
				}, 4000);
			}, 50);
		}, 900);
	}
	
	
	
	function show_character_text_3()
	{
		document.querySelector(".character-text-container").style.opacity = 0;
		
		
		
		setTimeout(() =>
		{
				document.querySelector(".character-text-container").remove();
				
				
				document.querySelector("#container").insertAdjacentHTML("beforebegin", `
				<div class="character-text-container">
					<div style="height: 30vh"></div>
					
					<div class="new-aos-section" data-aos="fade-up">
						<p class="body-text" style="color: rgb(255, 255, 255)">An abandoned child, and a chasing vengance.</p>
					</div>
				</div>
			`);
			
			
			
			setTimeout(() =>
			{
				Page.Load.AOS.load();
				Page.Load.AOS.show_section(0);
				
				setTimeout(() =>
				{
					document.querySelector(".character-text-container").style.opacity = 0;
					
					setTimeout(() =>
					{
						Page.Navigation.redirect("/writing/caracore/caracore.html");
					}, 300);
				}, 4000);
			}, 50);
		}, 900);
	}
}()