!function()
{
	"use strict";
	
	
	
	let active_row = 0;
	
	let entry = ["_", "_", "_", "_", "_"];
	
	let completed = false;
	
	let currently_animating = false;
	
	let boxes = Page.element.querySelectorAll("#wordle input");
	
	let confirm_buttons = Page.element.querySelectorAll("#wordle div:nth-child(7n)");
	let info_buttons = Page.element.querySelectorAll("#wordle div:nth-child(7n + 1)");
	
	let num_words_to_evaluate = 200;
	
	let hardmode = false;
	
	let good_guesses = [];
	let bad_guesses = [];
	
	let hardmode_checkbox_element = Page.element.querySelector("#hardmode-checkbox");
	
	
	
	let web_worker = null;
	
	if (DEBUG)
	{
		web_worker = new Worker("/applets/wordle-scorer/scripts/worker.js");
	}
	
	else
	{
		web_worker = new Worker("/applets/wordle-scorer/scripts/worker.min.js");
	}
	
	Page.temporary_web_workers.push(web_worker);
	
	web_worker.onmessage = function(e)
	{
		let entry_score = e.data[0];
		
		
		
		if (entry_score === -1)
		{
			reject_submission();
			
			return;
		}
		
		
		
		currently_animating = true;
		
		
		
		good_guesses = e.data[2];
		bad_guesses = e.data[3];
		
		
		
		//Display the score.
		confirm_buttons[active_row].classList.add("score");
		confirm_buttons[active_row].firstElementChild.textContent = 0;
		confirm_buttons[active_row].style.opacity = 1;
		
		
		
		hardmode_checkbox_element.style.pointerEvents = "none";
		
		
		
		let t = 0;
		
		let refresh_id = setInterval(() =>
		{
			t++;
			
			confirm_buttons[active_row - 1].firstElementChild.textContent = (Math.round(100 * Math.pow(Math.sin(Math.PI / 2 * t / 120), .35) * entry_score) / 100).toFixed(2);
			
			if (t === 120)
			{
				clearInterval(refresh_id);
			}
		}, 16);
		
		
		
		try
		{
			info_buttons[active_row - 1].style.opacity = 0;
			info_buttons[active_row - 1].style.cursor = "default";
			info_buttons[active_row - 1].firstElementChild.style.cursor = "default";
		}
		
		catch(ex) {}
		
		
		
		boxes[active_row * 5].style.pointerEvents = "none";
		boxes[active_row * 5 + 1].style.pointerEvents = "none";
		boxes[active_row * 5 + 2].style.pointerEvents = "none";
		boxes[active_row * 5 + 3].style.pointerEvents = "none";
		boxes[active_row * 5 + 4].style.pointerEvents = "none";
		
		active_row++;
		
		boxes[active_row * 5].style.pointerEvents = "auto";
		boxes[active_row * 5 + 1].style.pointerEvents = "auto";
		boxes[active_row * 5 + 2].style.pointerEvents = "auto";
		boxes[active_row * 5 + 3].style.pointerEvents = "auto";
		boxes[active_row * 5 + 4].style.pointerEvents = "auto";
		
		boxes[active_row * 5].focus();
		
		
		
		let score = e.data[1];
		
		//Add colors.
		for (let i = 0; i < 5; i++)
		{
			if (score[i] === 0)
			{
				setTimeout(() =>
				{
					boxes[(active_row - 1) * 5 + i].classList.add("gray");
					boxes[(active_row - 1) * 5 + i].parentNode.classList.add("gray");
				}, i * 300);
			}
			
			else if (score[i] === 1)
			{
				setTimeout(() =>
				{
					boxes[(active_row - 1) * 5 + i].classList.add("yellow");
					boxes[(active_row - 1) * 5 + i].parentNode.classList.add("yellow");
				}, i * 300);
			}
			
			else
			{
				setTimeout(() =>
				{
					boxes[(active_row - 1) * 5 + i].classList.add("green");
					boxes[(active_row - 1) * 5 + i].parentNode.classList.add("green");
				}, i * 300);
			}
		}
		
		if (score[0] + score[1] + score[2] + score[3] + score[4] === 10)
		{
			completed = true;
		}
		
		else
		{
			setTimeout(() =>
			{
				info_buttons[active_row - 1].style.opacity = 1;
				info_buttons[active_row - 1].style.cursor = "pointer";
				info_buttons[active_row - 1].firstElementChild.style.cursor = "pointer";
			}, 1800);
		}
		
		
		
		setTimeout(() =>
		{
			currently_animating = false;
		}, 2000);
	}
	
	
	
	boxes[0].style.pointerEvents = "auto";
	boxes[1].style.pointerEvents = "auto";
	boxes[2].style.pointerEvents = "auto";
	boxes[3].style.pointerEvents = "auto";
	boxes[4].style.pointerEvents = "auto";
	
	
	
	for (let i = 0; i < boxes.length; i++)
	{
		boxes[i].addEventListener("click", () =>
		{
			if (completed || Math.floor(i / 5) !== active_row)
			{
				boxes[i].blur();
			}
			
			//Put cursor on the right
			let value = boxes[i].value;
			boxes[i].value = "";
			boxes[i].value = value;
		});
		
		boxes[i].addEventListener("input", () =>
		{
			if (boxes[i].value.length >= 1)
			{
				if (boxes[i].value.length === 2)
				{
					boxes[i].value = boxes[i].value[1].toUpperCase();
				}
				
				else
				{
					boxes[i].value = boxes[i].value[0].toUpperCase();
				}
				
				boxes[i].parentNode.classList.add("black");
				
				
				
				entry[i % 5] = boxes[i].value[0].toLowerCase();
				
				
				
				if (i % 5 !== 4)
				{
					boxes[i + 1].focus();
				}
				
				if (entry.indexOf("_") === -1)
				{
					confirm_buttons[Math.floor(i / 5)].style.opacity = 1;
					confirm_buttons[Math.floor(i / 5)].style.cursor = "pointer";
					confirm_buttons[Math.floor(i / 5)].firstElementChild.style.cursor = "pointer";
				}
			}
			
			else
			{
				confirm_buttons[Math.floor(i / 5)].style.opacity = 0;
				confirm_buttons[Math.floor(i / 5)].style.cursor = "default";
				confirm_buttons[Math.floor(i / 5)].firstElementChild.style.cursor = "default";
				
				
				
				if (boxes[i].parentNode.classList.contains("black"))
				{
					boxes[i].parentNode.classList.remove("black");
					
					entry[i % 5] = "_";
				}
				
				else
				{
					if (i % 5 !== 0)
					{
						boxes[i - 1].value = "";
						entry[i % 5 - 1] = "_";
						boxes[i - 1].focus();
						boxes[i - 1].parentNode.classList.remove("black");
					}
				}
			}
		});
		
		boxes[i].addEventListener("keydown", (e) =>
		{
			if (e.keyCode === 8 && boxes[i].value.length === 0 && !(boxes[i].parentNode.classList.contains("black")) && (i % 5 !== 0))
			{
				boxes[i - 1].value = "";
				entry[i % 5 - 1] = "_";
				boxes[i - 1].focus();
				boxes[i - 1].parentNode.classList.remove("black");
			}
			
			else if (e.keyCode === 13 && confirm_buttons[Math.floor(i / 5)].style.opacity == 1)
			{
				let entry_string = `${entry[0]}${entry[1]}${entry[2]}${entry[3]}${entry[4]}`;
				
				confirm_buttons[Math.floor(i / 5)].style.opacity = 0;
				confirm_buttons[Math.floor(i / 5)].style.cursor = "default";
				confirm_buttons[Math.floor(i / 5)].firstElementChild.style.cursor = "default";
				
				web_worker.postMessage([entry_string, hardmode_checkbox_element.checked]);
			}
		});
	}
	
	
	
	for (let i = 0; i < confirm_buttons.length; i++)
	{
		confirm_buttons[i].style.transition = "opacity .125s ease-in-out";
		info_buttons[i].style.transition = "opacity .125s ease-in-out";
		
		
		
		confirm_buttons[i].addEventListener("click", () =>
		{
			if (confirm_buttons[i].style.opacity == 1 && active_row === i)
			{
				let entry_string = `${entry[0]}${entry[1]}${entry[2]}${entry[3]}${entry[4]}`;
				
				confirm_buttons[i].style.opacity = 0;
				confirm_buttons[i].style.cursor = "default";
				confirm_buttons[i].firstElementChild.style.cursor = "default";
				
				web_worker.postMessage([entry_string, hardmode_checkbox_element.checked]);
			}
		});
		
		
		
		info_buttons[i].addEventListener("click", () =>
		{
			if (info_buttons[i].style.opacity == 1)
			{
				info_buttons[i].style.opacity = 0;
				info_buttons[i].style.cursor = "default";
				info_buttons[i].firstElementChild.style.cursor = "default";
				
				display_info();
			}
		});
	}
	
	
	
	Page.show();
	
	
	
	function reject_submission()
	{
		setTimeout(() =>
		{
			confirm_buttons[active_row].firstElementChild.innerHTML = "&#10005;";
			
			confirm_buttons[active_row].classList.add("reject");
			
			confirm_buttons[active_row].style.opacity = 1;
			
			setTimeout(() =>
			{
				confirm_buttons[active_row].style.opacity = 0;
				
				setTimeout(() =>
				{
					confirm_buttons[active_row].firstElementChild.innerHTML = "&#x2794;";
					
					confirm_buttons[active_row].classList.remove("reject");
				}, 250);
			}, 1750);
		}, 250);
	}
	
	
	
	function display_info()
	{
		let info_panel_element = Page.element.querySelector("#info-panel");
		
		info_panel_element.innerHTML = `<h2>Top Guesses</h2><br>`;
		
		
		
		if (good_guesses.length === 5 && bad_guesses.length === 5)
		{
			for (let i = 0; i < 5; i++)
			{
				info_panel_element.innerHTML += `<p>${good_guesses[i][0].toUpperCase()} <span style="float: right">${(Math.round(good_guesses[i][1] * 100) / 100).toFixed(2)}</span></p><br>`;
			}
			
			info_panel_element.innerHTML += `<p style="text-align: center">&#x22ee;</p><br>`;
			
			for (let i = 4; i > 0; i--)
			{
				info_panel_element.innerHTML += `<p>${bad_guesses[i][0].toUpperCase()} <span style="float: right">${(Math.round(bad_guesses[i][1] * 100) / 100).toFixed(2)}</span></p><br>`;
			}
			
			info_panel_element.innerHTML += `<p>${bad_guesses[0][0].toUpperCase()} <span style="float: right">${(Math.round(bad_guesses[0][1] * 100) / 100).toFixed(2)}</span></p>`;
		}
		
		
		
		else if (bad_guesses.length > 0)
		{
			for (let i = 0; i < good_guesses.length; i++)
			{
				info_panel_element.innerHTML += `<p>${good_guesses[i][0].toUpperCase()} <span style="float: right">${(Math.round(good_guesses[i][1] * 100) / 100).toFixed(2)}</span></p><br>`;
			}
			
			for (let i = bad_guesses.length - 1; i > 0; i--)
			{
				info_panel_element.innerHTML += `<p>${bad_guesses[i][0].toUpperCase()} <span style="float: right">${(Math.round(bad_guesses[i][1] * 100) / 100).toFixed(2)}</span></p><br>`;
			}
			
			info_panel_element.innerHTML += `<p>${bad_guesses[0][0].toUpperCase()} <span style="float: right">${(Math.round(bad_guesses[0][1] * 100) / 100).toFixed(2)}</span></p>`;
		}
		
		
		
		else
		{
			for (let i = 0; i < good_guesses.length - 1; i++)
			{
				info_panel_element.innerHTML += `<p>${good_guesses[i][0].toUpperCase()} <span style="float: right">${(Math.round(good_guesses[i][1] * 100) / 100).toFixed(2)}</span></p><br>`;
			}
			
			info_panel_element.innerHTML += `<p>${good_guesses[good_guesses.length - 1][0].toUpperCase()} <span style="float: right">${(Math.round(good_guesses[good_guesses.length - 1][1] * 100) / 100).toFixed(2)}</span></p>`;
		}
		
		
		
		let info_panel_container_element = Page.element.querySelector("#info-panel-container");
		
		info_panel_container_element.style.display = "flex";
		
		setTimeout(() =>
		{
			info_panel_container_element.style.opacity = 1;
			
			info_panel_container_element.addEventListener("click", () =>
			{
				info_panel_container_element.style.opacity = 0;
				info_buttons[active_row - 1].style.opacity = 1;
				info_buttons[active_row - 1].style.cursor = "pointer";
				info_buttons[active_row - 1].firstElementChild.style.cursor = "pointer";
				
				setTimeout(() =>
				{
					info_panel_container_element.style.display = "none";
				}, 250);
			});
		}, 10);
	}
	
	
	
	async function resize_boxes()
	{
		if (currently_animating)
		{
			await new Promise((resolve, reject) => setTimeout(resolve, 2000));
		}
		
		
		
		let big_size = Page.Layout.new_window_width <= 450 ? "34px" : "54px";
		let small_size = Page.Layout.new_window_width <= 450 ? "30px" : "50px";
		
		for (let i = 0; i < 6; i++)
		{
			for (let j = 0; j < 5; j++)
			{
				boxes[5 * i + j].parentNode.style.width = small_size;
				boxes[5 * i + j].parentNode.style.height = small_size;
			}
			
			confirm_buttons[i].style.width = big_size;
			confirm_buttons[i].style.height = big_size;
			
			info_buttons[i].style.width = big_size;
			info_buttons[i].style.height = big_size;
		}
	}
	
	
	
	window.addEventListener("resize", resize_boxes);
	Page.temporary_handlers["resize"].push(resize_boxes);
}();