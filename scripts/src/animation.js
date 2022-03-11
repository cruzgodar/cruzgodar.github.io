"use strict";



let Page = {};

let Site = {};



Page.Animate =
{
	change_opacity: function(element, end_value, duration)
	{
		return new Promise((resolve, reject) =>
		{
			anime({
				targets: element,
				opacity: end_value,
				duration: duration,
				easing: "easeOutQuad",
				complete: resolve
			});
		});	
	},



	change_scale: function(element, end_value, duration)
	{
		return new Promise((resolve, reject) =>
		{
			anime({
				targets: element,
				scale: end_value,
				duration: duration,
				easing: "easeOutQuad",
				complete: resolve
			});
		});	
	}
};	