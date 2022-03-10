"use strict";



let Page = {};

let Site = {};



Page.Animate =
{
	change_opacity: function(element, end_value, duration)
	{
		anime({
			targets: element,
			opacity: end_value,
			duration: duration,
			easing: "easeOutQuad"
		});
	},



	change_scale: function(element, end_value, duration)
	{
		anime({
			targets: element,
			scale: end_value,
			duration: duration,
			easing: "easeOutQuad"
		});
	}
};	