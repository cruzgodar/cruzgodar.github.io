"use strict";



let Page = {};

let Site = {};



Page.Animate =
{
	change_opacity_js: function(element, end_value, duration, ease_in_out = false)
	{
		return new Promise((resolve, reject) =>
		{
			anime({
				targets: element,
				opacity: end_value,
				duration: duration,
				easing: ease_in_out ? "easeInOutQuad" : "easeOutQuad",
				complete: resolve
			});
		});	
	},
	
	
	
	change_opacity_css: function(element, end_value, duration, ease_in_out = false)
	{
		return new Promise((resolve, reject) =>
		{
			element.style.transition = `opacity ${duration}ms ${ease_in_out ? "ease-in-out" : "ease-out"}`;
			
			setTimeout(() =>
			{
				element.style.opacity = end_value;
				
				setTimeout(() =>
				{
					element.style.transition = "";
					resolve();
				}, duration);
			}, 10);
		});	
	},



	change_scale_js: function(element, end_value, duration, ease_in_out = false)
	{
		return new Promise((resolve, reject) =>
		{
			anime({
				targets: element,
				scale: end_value,
				duration: duration,
				easing: ease_in_out ? "easeInOutQuad" : "easeOutQuad",
				complete: resolve
			});
		});	
	},
	
	
	
	change_scale_css: function(element, end_value, duration, ease_in_out = false)
	{
		return new Promise((resolve, reject) =>
		{
			element.style.transition = `transform ${duration}ms ${ease_in_out ? "ease-in-out" : "ease-out"}`;
			
			setTimeout(() =>
			{
				element.style.transform = `scale(${end_value})`;
				
				setTimeout(() =>
				{
					element.style.transition = "";
					resolve();
				}, duration);
			}, 10);
		});	
	},
	
	
	
	fade_left_js: function(element, duration, ease_in_out = false)
	{
		return new Promise((resolve, reject) =>
		{
			anime({
				targets: element,
				translateX: 0,
				opacity: 1,
				duration: duration,
				easing: ease_in_out ? "easeInOutQuad" : "easeOutQuad",
				complete: resolve
			});
		});	
	},
	
	
	
	fade_left_css: function(element, duration, ease_in_out = false)
	{
		return new Promise((resolve, reject) =>
		{
			element.style.transition = `transform ${duration}ms ${ease_in_out ? "ease-in-out" : "ease-out"}, opacity ${duration}ms ${ease_in_out ? "ease-in-out" : "ease-out"}`;
			
			setTimeout(() =>
			{
				element.style.transform = `translateX(0px)`;
				element.style.opacity = 1;
				
				setTimeout(() =>
				{
					element.style.transition = "";
					resolve();
				}, duration);
			}, 10);
		});	
	},
	
	
	
	show_fade_up_section_js: function(elements, duration, delays, ease_in_out = false)
	{
		return new Promise((resolve, reject) =>
		{
			anime({
				targets: elements,
				translateY: 0,
				opacity: 1,
				duration: duration,
				delay: (target, index, num_targets) => delays[index],
				easing: ease_in_out ? "easeInOutCubic" : "easeOutCubic",
				complete: resolve
			});
		});	
	},
	
	
	
	show_fade_up_section_css: function(elements, duration, delays, ease_in_out = false)
	{
		return new Promise((resolve, reject) =>
		{
			for (let i = 0; i < elements.length; i++)
			{
				setTimeout(() =>
				{
					elements[i].setAttribute("data-aos-offset", -1000000);
					
					AOS.refresh();
				}, delays[i]);
			}
			
			setTimeout(resolve, delays[delays.length - 1] + duration);
		});
	},
	
	
	
	show_zoom_out_section_js: function(elements, duration, delays, ease_in_out = false)
	{
		return new Promise((resolve, reject) =>
		{
			anime({
				targets: elements,
				scale: 1,
				opacity: 1,
				duration: duration,
				delay: (target, index, num_targets) => delays[index],
				easing: ease_in_out ? "easeInOutCubic" : "easeOutCubic",
				complete: resolve
			});
		});	
	},
	
	
	
	show_zoom_out_section_css: function(elements, duration, delays, ease_in_out = false)
	{
		return new Promise((resolve, reject) =>
		{
			for (let i = 0; i < elements.length; i++)
			{
				setTimeout(() =>
				{
					elements[i].setAttribute("data-aos-offset", -1000000);
					
					AOS.refresh();
				}, delays[i]);
			}
			
			setTimeout(resolve, delays[delays.length - 1] + duration);
		});
	}
};