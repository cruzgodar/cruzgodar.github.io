"use strict";



let Page = {};

let Site = {};



Page.Animate =
{
	change_opacity: function(element, end_value, duration)
	{
		let total_time = 0;
		
		let start_time = -1;
		
		let last_time = -1;
		
		let start_value = parseFloat(element.style.opacity || 0);
		
		let step = function(timestamp)
		{
			if (last_time === timestamp)
			{
				return;
			}
			
			if (start_time === -1)
			{
				start_time = timestamp;
			}
			
			last_time = timestamp;
			
			total_time = timestamp - start_time;
			
			let value = start_value + Site.bezier_easing(total_time / duration) * (end_value - start_value);
			
			
			
			element.style.opacity = value;
			
			if (total_time < duration)
			{
				window.requestAnimationFrame(step);
			}
			
			else
			{
				element.style.opacity = end_value;
			}
		}
		
		window.requestAnimationFrame(step);
	},



	change_scale: function(element, end_value, duration)
	{
		let total_time = 0;
		
		let start_time = -1;
		
		let last_time = -1;
		
		let start_value = 1;
		
		let index = element.style.transform.indexOf("scale(");
		
		if (index !== -1)
		{
			let index_2 = element.style.transform.indexOf(")", index);
			
			if (index_2 !== -1)
			{
				start_value = parseFloat(element.style.transform.slice(index + 6, index_2));
			}	
		}
		
		
		
		let step = function(timestamp)
		{
			if (last_time === timestamp)
			{
				return;
			}
			
			if (start_time === -1)
			{
				start_time = timestamp;
			}
			
			last_time = timestamp;
			
			total_time = timestamp - start_time;
			
			let value = start_value + Site.bezier_easing(total_time / duration) * (end_value - start_value)
			
			
			
			element.style.transform = `scale(${value})`;
			
			if (total_time < duration)
			{
				window.requestAnimationFrame(step);
			}
			
			else
			{
				element.style.transform = `scale(${end_value})`;
			}
		}
		
		window.requestAnimationFrame(step);
	}
};	