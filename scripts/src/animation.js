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
			try {clearTimeout(element.getAttribute("data-opacity-timeout-id"))}
			catch(ex) {}
			
			element.style.transition = `opacity ${duration}ms ${ease_in_out ? "ease-in-out" : "ease-out"}`;
			
			setTimeout(() =>
			{
				element.style.opacity = end_value;
				
				const timeout_id = setTimeout(() =>
				{
					element.style.transition = "";
					resolve();
				}, duration);
				
				element.setAttribute("data-opacity-timeout-id", timeout_id);
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
			try {clearTimeout(element.getAttribute("data-scale-timeout-id"))}
			catch(ex) {}
			
			element.style.transition = `transform ${duration}ms ${ease_in_out ? "ease-in-out" : "ease-out"}`;
			
			setTimeout(() =>
			{
				element.style.transform = `scale(${end_value})`;
				
				const timeout_id = setTimeout(() =>
				{
					element.style.transition = "";
					resolve();
				}, duration);
				
				element.setAttribute("data-scale-timeout-id", timeout_id);
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
			try {clearTimeout(element.getAttribute("data-fade-left-timeout-id"))}
			catch(ex) {}
			
			element.style.transition = `transform ${duration}ms ${ease_in_out ? "ease-in-out" : "ease-out"}, opacity ${duration}ms ${ease_in_out ? "ease-in-out" : "ease-out"}`;
			
			setTimeout(() =>
			{
				element.style.transform = `translateX(0px)`;
				element.style.opacity = 1;
				
				const timeout_id = setTimeout(() =>
				{
					element.style.transition = "";
					resolve();
				}, duration);
				
				element.setAttribute("data-fade-left-timeout-id", timeout_id);
			}, 10);
		});	
	},
	
	
	
	change_right_settings_button_js: function(element, end_value, duration)
	{
		return new Promise((resolve, reject) =>
		{
			anime({
				targets: element,
				opacity: end_value,
				duration: duration,
				easing: "easeInOutQuad"
			});
			
			anime({
				targets: element,
				right: end_value * 50 - 40,
				duration: duration,
				easing: "easeOutQuad",
				complete: resolve
			});
		});	
	},
	
	change_right_settings_button_css: function(element, end_value, duration)
	{
		return new Promise((resolve, reject) =>
		{
			try {clearTimeout(element.getAttribute("data-opacity-timeout-id"))}
			catch(ex) {}
			
			element.style.transition = `opacity ${duration}ms ease-in-out, right ${duration}ms ease-out`;
			
			setTimeout(() =>
			{
				element.style.opacity = end_value;
				element.style.right = `${end_value * 50 - 40}px`;
				
				const timeout_id = setTimeout(() =>
				{
					element.style.transition = "";
					resolve();
				}, duration);
				
				element.setAttribute("data-opacity-timeout-id", timeout_id);
			}, 10);
		});	
	},
	
	
	
	change_left_settings_button_js: function(element, end_value, duration)
	{
		return new Promise((resolve, reject) =>
		{
			anime({
				targets: element,
				opacity: end_value,
				duration: duration,
				easing: "easeInOutQuad"
			});
			
			anime({
				targets: element,
				left: end_value * 50 - 40,
				duration: duration,
				easing: "easeOutQuad",
				complete: resolve
			});
		});
	},
	
	change_left_settings_button_css: function(element, end_value, duration)
	{
		return new Promise((resolve, reject) =>
		{
			try {clearTimeout(element.getAttribute("data-opacity-timeout-id"))}
			catch(ex) {}
			
			element.style.transition = `opacity ${duration}ms ease-in-out, left ${duration}ms ease-out`;
			
			setTimeout(() =>
			{
				element.style.opacity = end_value;
				element.style.left = `${end_value * 50 - 40}px`;
				
				const timeout_id = setTimeout(() =>
				{
					element.style.transition = "";
					resolve();
				}, duration);
				
				element.setAttribute("data-opacity-timeout-id", timeout_id);
			}, 10);
		});	
	},
	
	
	
	change_footer_image_link_text_js: function(element, end_value, duration)
	{
		return new Promise((resolve, reject) =>
		{
			anime({
				targets: element,
				opacity: end_value,
				duration: duration,
				easing: "easeInOutQuad"
			});
			
			anime({
				targets: element,
				marginTop: end_value * (-32),
				duration: duration,
				easing: "easeOutQuad",
				complete: resolve
			});
		});
	},
	
	change_footer_image_link_text_css: function(element, end_value, duration)
	{
		return new Promise((resolve, reject) =>
		{
			try {clearTimeout(element.getAttribute("data-opacity-timeout-id"))}
			catch(ex) {}
			
			element.style.transition = `opacity ${duration}ms ease-in-out, margin-top ${duration}ms ease-out`;
			
			setTimeout(() =>
			{
				element.style.opacity = end_value;
				element.style.marginTop = `${end_value * (-32)}px`;
				
				const timeout_id = setTimeout(() =>
				{
					element.style.transition = "";
					resolve();
				}, duration);
				
				element.setAttribute("data-opacity-timeout-id", timeout_id);
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
			elements.forEach((element, index) =>
			{
				setTimeout(() =>
				{
					element.setAttribute("data-aos-offset", -1000000);
					
					AOS.refresh();
				}, delays[index]);
			});
			
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
			elements.forEach((element, index) =>
			{
				setTimeout(() =>
				{
					element.setAttribute("data-aos-offset", -1000000);
					
					AOS.refresh();
				}, delays[index]);
			});
			
			setTimeout(resolve, delays[delays.length - 1] + duration);
		});
	},
	
	
	////////////////////////////////////////////
	//Here begin the page transition functions//
	////////////////////////////////////////////
	
	
	fade_up_in_js: function(element, duration, target_opacity = 1)
	{
		return new Promise((resolve, reject) =>
		{
			element.style.marginTop = `${Site.navigation_animation_distance}px`;
			element.style.marginBottom = 0;
			
			anime({
				targets: element,
				marginTop: "0px",
				opacity: target_opacity,
				duration: duration,
				easing: "cubicBezier(.4, 1.0, .7, 1.0)",
				complete: resolve
			});
		});	
	},
	
	fade_up_in_css: function(element, duration, target_opacity = 1)
	{
		return new Promise((resolve, reject) =>
		{
			try {clearTimeout(element.getAttribute("data-fade-up-in-timeout-id"))}
			catch(ex) {}
			
			element.style.transition = "";
			
			setTimeout(() =>
			{
				element.style.marginTop = `${Site.navigation_animation_distance}px`;
				element.style.marginBottom = 0;
				
				//Jesus fuck
				void(element.offsetHeight);
				
				element.style.transition = `margin-top ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0), opacity ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0)`;
				
				setTimeout(() =>
				{
					element.style.marginTop = 0;
					element.style.opacity = target_opacity;
					
					const timeout_id = setTimeout(() =>
					{
						element.style.transition = "";
						resolve();
					}, duration);
					
					element.setAttribute("data-fade-up-in-timeout-id", timeout_id);
				}, 10);
			}, 10);	
		});
	},
	
	
	
	fade_up_out_js: function(element, duration, no_opacity_change = false)
	{
		return new Promise((resolve, reject) =>
		{
			element.style.marginBottom = "20vmin";
			
			let data =
			{
				targets: element,
				marginTop: `${-Site.navigation_animation_distance}px`,
				duration: duration,
				easing: "cubicBezier(.1, 0.0, .2, 0.0)",
				complete: resolve
			};
			
			if (!no_opacity_change)
			{
				data.opacity = 0;
			}
			
			anime(data);
		});	
	},
	
	fade_up_out_css: function(element, duration, no_opacity_change = false)
	{
		return new Promise((resolve, reject) =>
		{
			try {clearTimeout(element.getAttribute("data-fade-up-out-timeout-id"))}
			catch(ex) {}
			
			element.style.transition = "";
			
			setTimeout(() =>
			{
				element.style.marginBottom = "20vmin";
				
				void(element.offsetHeight);
				
				element.style.transition = `margin-top ${duration}ms cubic-bezier(.1, 0.0, .2, 0.0), opacity ${duration}ms cubic-bezier(.1, 0.0, .2, 0.0)`;
				
				setTimeout(() =>
				{
					element.style.marginTop = `-${Site.navigation_animation_distance}px`;
					
					if (!no_opacity_change)
					{
						element.style.opacity = 0;
					}		
					
					const timeout_id = setTimeout(() =>
					{
						element.style.transition = "";
						resolve();
					}, duration);
					
					element.setAttribute("data-fade-up-out-timeout-id", timeout_id);
				}, 10);
			}, 10);	
		});
	},
	
	
	
	fade_down_in_js: function(element, duration, target_opacity = 1)
	{
		return new Promise((resolve, reject) =>
		{
			element.style.marginTop = `${-Site.navigation_animation_distance}px`;
			element.style.marginBottom = 0;
			
			anime({
				targets: element,
				marginTop: "0px",
				opacity: target_opacity,
				duration: duration,
				easing: "cubicBezier(.4, 1.0, .7, 1.0)",
				complete: resolve
			});
		});	
	},
	
	fade_down_in_css: function(element, duration, target_opacity = 1)
	{
		return new Promise((resolve, reject) =>
		{
			try {clearTimeout(element.getAttribute("data-fade-down-in-timeout-id"))}
			catch(ex) {}
			
			element.style.transition = "";
			
			setTimeout(() =>
			{
				element.style.marginTop = `${-Site.navigation_animation_distance}px`;
				element.style.marginBottom = 0;
				
				void(element.offsetHeight);
				
				element.style.transition = `margin-top ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0), opacity ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0)`;
				
				setTimeout(() =>
				{
					element.style.marginTop = 0;
					element.style.opacity = target_opacity;
					
					const timeout_id = setTimeout(() =>
					{
						element.style.transition = "";
						resolve();
					}, duration);
					
					element.setAttribute("data-fade-down-in-timeout-id", timeout_id);
				}, 10);
			}, 10);	
		});
	},
	
	
	
	fade_down_out_js: function(element, duration, no_opacity_change = false)
	{
		return new Promise((resolve, reject) =>
		{
			element.style.marginBottom = "20vmin";
			
			let data =
			{
				targets: element,
				marginTop: `${Site.navigation_animation_distance}px`,
				duration: duration,
				easing: "cubicBezier(.1, 0.0, .2, 0.0)",
				complete: resolve
			};
			
			if (!no_opacity_change)
			{
				data.opacity = 0;
			}
			
			anime(data);
		});	
	},
	
	fade_down_out_css: function(element, duration, no_opacity_change = false)
	{
		return new Promise((resolve, reject) =>
		{
			try {clearTimeout(element.getAttribute("data-fade-down-out-timeout-id"))}
			catch(ex) {}
			
			element.style.transition = "";
			
			setTimeout(() =>
			{
				element.style.marginBottom = "20vmin";
				
				void(element.offsetHeight);
				
				element.style.transition = `margin-top ${duration}ms cubic-bezier(.1, 0.0, .2, 0.0), opacity ${duration}ms cubic-bezier(.1, 0.0, .2, 0.0)`;
				
				setTimeout(() =>
				{
					element.style.marginTop = `${Site.navigation_animation_distance}px`;
					
					if (!no_opacity_change)
					{
						element.style.opacity = 0;
					}
					
					const timeout_id = setTimeout(() =>
					{
						element.style.transition = "";
						resolve();
					}, duration);
					
					element.setAttribute("data-fade-down-out-timeout-id", timeout_id);
				}, 10);
			}, 10);	
		});
	},
	
	
	
	fade_left_in_js: function(element, duration, target_opacity = 1)
	{
		return new Promise((resolve, reject) =>
		{
			element.style.marginLeft = `${Site.navigation_animation_distance}px`;
			
			anime({
				targets: element,
				marginLeft: "0px",
				opacity: target_opacity,
				duration: duration,
				easing: "cubicBezier(.4, 1.0, .7, 1.0)",
				complete: resolve
			});
		});	
	},
	
	fade_left_in_css: function(element, duration, target_opacity = 1)
	{
		return new Promise((resolve, reject) =>
		{
			try {clearTimeout(element.getAttribute("data-fade-left-in-timeout-id"))}
			catch(ex) {}
			
			element.style.transition = "";
			
			setTimeout(() =>
			{
				element.style.marginLeft = `${Site.navigation_animation_distance}px`;
				
				void(element.offsetHeight);
				
				element.style.transition = `margin-left ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0), opacity ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0)`;
				
				setTimeout(() =>
				{
					element.style.marginLeft = 0;
					element.style.opacity = target_opacity;
					
					const timeout_id = setTimeout(() =>
					{
						element.style.transition = "";
						resolve();
					}, duration);
					
					element.setAttribute("data-fade-left-in-timeout-id", timeout_id);
				}, 10);
			}, 10);	
		});
	},
	
	
	
	fade_left_out_js: function(element, duration, no_opacity_change = false)
	{
		return new Promise((resolve, reject) =>
		{
			let data =
			{
				targets: element,
				marginLeft: `${-Site.navigation_animation_distance}px`,
				duration: duration,
				easing: "cubicBezier(.1, 0.0, .2, 0.0)",
				complete: resolve
			};
			
			if (!no_opacity_change)
			{
				data.opacity = 0;
			}
			
			anime(data);
		});	
	},
	
	fade_left_out_css: function(element, duration, no_opacity_change = false)
	{
		return new Promise((resolve, reject) =>
		{
			try {clearTimeout(element.getAttribute("data-fade-left-out-timeout-id"))}
			catch(ex) {}
			
			element.style.transition = "";
			
			setTimeout(() =>
			{
				void(element.offsetHeight);
				
				element.style.transition = `margin-left ${duration}ms cubic-bezier(.1, 0.0, .2, 0.0), opacity ${duration}ms cubic-bezier(.1, 0.0, .2, 0.0)`;
				
				setTimeout(() =>
				{
					element.style.marginLeft = `${-Site.navigation_animation_distance}px`;
					
					if (!no_opacity_change)
					{
						element.style.opacity = 0;
					}
					
					const timeout_id = setTimeout(() =>
					{
						element.style.transition = "";
						resolve();
					}, duration);
					
					element.setAttribute("data-fade-left-out-timeout-id", timeout_id);
				}, 10);
			}, 10);	
		});
	},
	
	
	
	fade_right_in_js: function(element, duration, target_opacity = 1)
	{
		return new Promise((resolve, reject) =>
		{
			element.style.marginLeft = `${-Site.navigation_animation_distance}px`;
			
			anime({
				targets: element,
				marginLeft: "0px",
				opacity: target_opacity,
				duration: duration,
				easing: "cubicBezier(.4, 1.0, .7, 1.0)",
				complete: resolve
			});
		});	
	},
	
	fade_right_in_css: function(element, duration, target_opacity = 1)
	{
		return new Promise((resolve, reject) =>
		{
			try {clearTimeout(element.getAttribute("data-fade-right-in-timeout-id"))}
			catch(ex) {}
			
			element.style.transition = "";
			
			setTimeout(() =>
			{
				element.style.marginLeft = `${-Site.navigation_animation_distance}px`;
				
				void(element.offsetHeight);
				
				element.style.transition = `margin-left ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0), opacity ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0)`;
				
				setTimeout(() =>
				{
					element.style.marginLeft = 0;
					element.style.opacity = target_opacity;
					
					const timeout_id = setTimeout(() =>
					{
						element.style.transition = "";
						resolve();
					}, duration);
					
					element.setAttribute("data-fade-right-in-timeout-id", timeout_id);
				}, 10);
			}, 10);	
		});
	},
	
	
	
	fade_right_out_js: function(element, duration, no_opacity_change = false)
	{
		return new Promise((resolve, reject) =>
		{
			let data =
			{
				targets: element,
				marginLeft: `${Site.navigation_animation_distance}px`,
				duration: duration,
				easing: "cubicBezier(.1, 0.0, .2, 0.0)",
				complete: resolve
			};
			
			if (!no_opacity_change)
			{
				data.opacity = 0;
			}
			
			anime(data);
		});	
	},
	
	fade_right_out_css: function(element, duration, no_opacity_change = false)
	{
		return new Promise((resolve, reject) =>
		{
			try {clearTimeout(element.getAttribute("data-fade-right-out-timeout-id"))}
			catch(ex) {}
			
			element.style.transition = "";
			
			setTimeout(() =>
			{
				void(element.offsetHeight);
				
				element.style.transition = `margin-left ${duration}ms cubic-bezier(.1, 0.0, .2, 0.0), opacity ${duration}ms cubic-bezier(.1, 0.0, .2, 0.0)`;
				
				setTimeout(() =>
				{
					element.style.marginLeft = `${Site.navigation_animation_distance}px`;
					
					if (!no_opacity_change)
					{
						element.style.opacity = 0;
					}
					
					const timeout_id = setTimeout(() =>
					{
						element.style.transition = "";
						resolve();
					}, duration);
					
					element.setAttribute("data-fade-right-out-timeout-id", timeout_id);
				}, 10);
			}, 10);	
		});
	},
	
	
	
	fade_in_js: function(element, duration, target_opacity = 1)
	{
		return new Promise((resolve, reject) =>
		{
			anime({
				targets: element,
				opacity: target_opacity,
				duration: duration,
				easing: "cubicBezier(.4, 1.0, .7, 1.0)",
				complete: resolve
			});
		});	
	},
	
	fade_in_css: function(element, duration, target_opacity = 1)
	{
		return new Promise((resolve, reject) =>
		{
			try {clearTimeout(element.getAttribute("data-fade-in-timeout-id"))}
			catch(ex) {}
			
			element.style.transition = "";
			
			setTimeout(() =>
			{
				void(element.offsetHeight);
				
				element.style.transition = `opacity ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0)`;
				
				setTimeout(() =>
				{
					element.style.opacity = target_opacity;
					
					const timeout_id = setTimeout(() =>
					{
						element.style.transition = "";
						resolve();
					}, duration);
					
					element.setAttribute("data-fade-in-timeout-id", timeout_id);
				}, 10);
			}, 10);	
		});
	},
	
	
	
	fade_out_js: function(element, duration, no_opacity_change = false)
	{
		return new Promise((resolve, reject) =>
		{
			let data =
			{
				targets: element,
				duration: duration,
				easing: "cubicBezier(.1, 0.0, .2, 0.0)",
				complete: resolve
			};
			
			if (!no_opacity_change)
			{
				data.opacity = 0;
			}
			
			anime(data);
		});	
	},
	
	fade_out_css: function(element, duration, no_opacity_change = false)
	{
		return new Promise((resolve, reject) =>
		{
			try {clearTimeout(element.getAttribute("data-fade-out-timeout-id"))}
			catch(ex) {}
			
			element.style.transition = "";
			
			setTimeout(() =>
			{
				void(element.offsetHeight);
				
				element.style.transition = `opacity ${duration}ms cubic-bezier(.1, 0.0, .2, 0.0)`;
				
				setTimeout(() =>
				{
					if (!no_opacity_change)
					{
						element.style.opacity = 0;
					}
					
					const timeout_id = setTimeout(() =>
					{
						element.style.transition = "";
						resolve();
					}, duration);
					
					element.setAttribute("data-fade-out-timeout-id", timeout_id);
				}, 10);
			}, 10);	
		});
	}
};