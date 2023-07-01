"use strict";



const Page = {};

const Site = {};



Page.Animate =
{
	changeOpacityJs: function(element, endValue, duration, easeInOut = false)
	{
		return new Promise((resolve, reject) =>
		{
			anime({
				targets: element,
				opacity: endValue,
				duration: duration,
				easing: easeInOut ? "easeInOutQuad" : "easeOutQuad",
				complete: resolve
			});
		});	
	},
	
	changeOpacityCss: function(element, endValue, duration, easeInOut = false)
	{
		return new Promise((resolve, reject) =>
		{
			try {clearTimeout(element.getAttribute("data-opacity-timeout-id"))}
			catch(ex) {}
			
			element.style.transition = `opacity ${duration}ms ${easeInOut ? "ease-in-out" : "ease-out"}`;
			
			setTimeout(() =>
			{
				element.style.opacity = endValue;
				
				const timeoutId = setTimeout(() =>
				{
					element.style.transition = "";
					resolve();
				}, duration);
				
				element.setAttribute("data-opacity-timeout-id", timeoutId);
			}, 10);
		});	
	},
	
	
	
	changeScaleJs: function(element, endValue, duration, easeInOut = false)
	{
		return new Promise((resolve, reject) =>
		{
			anime({
				targets: element,
				scale: endValue,
				duration: duration,
				easing: easeInOut ? "easeInOutQuad" : "easeOutQuad",
				complete: resolve
			});
		});	
	},	
	
	changeScaleCss: function(element, endValue, duration, easeInOut = false)
	{
		return new Promise((resolve, reject) =>
		{
			try {clearTimeout(element.getAttribute("data-scale-timeout-id"))}
			catch(ex) {}
			
			element.style.transition = `transform ${duration}ms ${easeInOut ? "ease-in-out" : "ease-out"}`;
			
			setTimeout(() =>
			{
				element.style.transform = `scale(${endValue})`;
				
				const timeoutId = setTimeout(() =>
				{
					element.style.transition = "";
					resolve();
				}, duration);
				
				element.setAttribute("data-scale-timeout-id", timeoutId);
			}, 10);
		});	
	},
	
	
	
	fadeLeftJs: function(element, duration, easeInOut = false)
	{
		return new Promise((resolve, reject) =>
		{
			anime({
				targets: element,
				translateX: 0,
				opacity: 1,
				duration: duration,
				easing: easeInOut ? "easeInOutQuad" : "easeOutQuad",
				complete: resolve
			});
		});	
	},
	
	fadeLeftCss: function(element, duration, easeInOut = false)
	{
		return new Promise((resolve, reject) =>
		{
			try {clearTimeout(element.getAttribute("data-fade-left-timeout-id"))}
			catch(ex) {}
			
			element.style.transition = `transform ${duration}ms ${easeInOut ? "ease-in-out" : "ease-out"}, opacity ${duration}ms ${easeInOut ? "ease-in-out" : "ease-out"}`;
			
			setTimeout(() =>
			{
				element.style.transform = `translateX(0px)`;
				element.style.opacity = 1;
				
				const timeoutId = setTimeout(() =>
				{
					element.style.transition = "";
					resolve();
				}, duration);
				
				element.setAttribute("data-fade-left-timeout-id", timeoutId);
			}, 10);
		});	
	},
	
	
	
	changeRightSettingsButtonJs: function(element, endValue, duration)
	{
		return new Promise((resolve, reject) =>
		{
			anime({
				targets: element,
				opacity: endValue,
				duration: duration,
				easing: "easeInOutQuad"
			});
			
			anime({
				targets: element,
				right: endValue * 50 - 40,
				duration: duration,
				easing: "easeOutQuad",
				complete: resolve
			});
		});	
	},
	
	changeRightSettingsButtonCss: function(element, endValue, duration)
	{
		return new Promise((resolve, reject) =>
		{
			try {clearTimeout(element.getAttribute("data-opacity-timeout-id"))}
			catch(ex) {}
			
			element.style.transition = `opacity ${duration}ms ease-in-out, right ${duration}ms ease-out`;
			
			setTimeout(() =>
			{
				element.style.opacity = endValue;
				element.style.right = `${endValue * 50 - 40}px`;
				
				const timeoutId = setTimeout(() =>
				{
					element.style.transition = "";
					resolve();
				}, duration);
				
				element.setAttribute("data-opacity-timeout-id", timeoutId);
			}, 10);
		});	
	},
	
	
	
	changeLeftSettingsButtonJs: function(element, endValue, duration)
	{
		return new Promise((resolve, reject) =>
		{
			anime({
				targets: element,
				opacity: endValue,
				duration: duration,
				easing: "easeInOutQuad"
			});
			
			anime({
				targets: element,
				left: endValue * 50 - 40,
				duration: duration,
				easing: "easeOutQuad",
				complete: resolve
			});
		});
	},
	
	changeLeftSettingsButtonCss: function(element, endValue, duration)
	{
		return new Promise((resolve, reject) =>
		{
			try {clearTimeout(element.getAttribute("data-opacity-timeout-id"))}
			catch(ex) {}
			
			element.style.transition = `opacity ${duration}ms ease-in-out, left ${duration}ms ease-out`;
			
			setTimeout(() =>
			{
				element.style.opacity = endValue;
				element.style.left = `${endValue * 50 - 40}px`;
				
				const timeoutId = setTimeout(() =>
				{
					element.style.transition = "";
					resolve();
				}, duration);
				
				element.setAttribute("data-opacity-timeout-id", timeoutId);
			}, 10);
		});	
	},
	
	
	
	hideSlideShelfJs: function(element, duration)
	{
		return new Promise((resolve, reject) =>
		{
			anime({
				targets: element,
				marginLeft: `${-Site.navigationAnimationDistanceHorizontal}px`,
				opacity: 0,
				duration: duration,
				easing: "cubicBezier(.4, 0.0, .4, 1.0)",
				complete: resolve
			});
		});	
	},
	
	showSlideShelfJs: function(element, duration)
	{
		return new Promise((resolve, reject) =>
		{
			anime({
				targets: element,
				marginLeft: "0px",
				opacity: 1,
				duration: duration,
				easing: "cubicBezier(.4, 1.0, .7, 1.0)",
				complete: resolve
			});
		});	
	},
	
	
	////////////////////////////////////////////
	//Here begin the page transition functions//
	////////////////////////////////////////////
	
	
	fadeUpInJs: function(element, duration, targetOpacity = 1)
	{
		return new Promise((resolve, reject) =>
		{
			element.style.marginTop = `${Site.navigationAnimationDistanceVertical}px`;
			element.style.marginBottom = 0;
			
			anime({
				targets: element,
				marginTop: "0px",
				opacity: targetOpacity,
				duration: duration,
				easing: "cubicBezier(.4, 1.0, .7, 1.0)",
				complete: resolve
			});
		});	
	},
	
	fadeUpInCss: function(element, duration, targetOpacity = 1)
	{
		return new Promise((resolve, reject) =>
		{
			try {clearTimeout(element.getAttribute("data-fade-up-in-timeout-id"))}
			catch(ex) {}
			
			element.style.transition = "";
			
			setTimeout(() =>
			{
				element.style.marginTop = `${Site.navigationAnimationDistanceVertical}px`;
				element.style.marginBottom = 0;
				
				//Jesus fuck
				void(element.offsetHeight);
				
				element.style.transition = `margin-top ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0), opacity ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0)`;
				
				setTimeout(() =>
				{
					element.style.marginTop = 0;
					element.style.opacity = targetOpacity;
					
					const timeoutId = setTimeout(() =>
					{
						element.style.transition = "";
						resolve();
					}, duration);
					
					element.setAttribute("data-fade-up-in-timeout-id", timeoutId);
				}, 10);
			}, 10);	
		});
	},
	
	
	
	fadeUpOutJs: function(element, duration, noOpacityChange = false)
	{
		return new Promise((resolve, reject) =>
		{
			element.style.marginBottom = "20vmin";
			
			const data =
			{
				targets: element,
				marginTop: `${-Site.navigationAnimationDistanceVertical}px`,
				duration: duration,
				easing: "cubicBezier(.1, 0.0, .2, 0.0)",
				complete: resolve
			};
			
			if (!noOpacityChange)
			{
				data.opacity = 0;
			}
			
			anime(data);
		});	
	},
	
	fadeUpOutCss: function(element, duration, noOpacityChange = false)
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
					element.style.marginTop = `-${Site.navigationAnimationDistanceVertical}px`;
					
					if (!noOpacityChange)
					{
						element.style.opacity = 0;
					}		
					
					const timeoutId = setTimeout(() =>
					{
						element.style.transition = "";
						resolve();
					}, duration);
					
					element.setAttribute("data-fade-up-out-timeout-id", timeoutId);
				}, 10);
			}, 10);	
		});
	},
	
	
	
	fadeDownInJs: function(element, duration, targetOpacity = 1)
	{
		return new Promise((resolve, reject) =>
		{
			element.style.marginTop = `${-Site.navigationAnimationDistanceVertical}px`;
			element.style.marginBottom = 0;
			
			anime({
				targets: element,
				marginTop: "0px",
				opacity: targetOpacity,
				duration: duration,
				easing: "cubicBezier(.4, 1.0, .7, 1.0)",
				complete: resolve
			});
		});	
	},
	
	fadeDownInCss: function(element, duration, targetOpacity = 1)
	{
		return new Promise((resolve, reject) =>
		{
			try {clearTimeout(element.getAttribute("data-fade-down-in-timeout-id"))}
			catch(ex) {}
			
			element.style.transition = "";
			
			setTimeout(() =>
			{
				element.style.marginTop = `${-Site.navigationAnimationDistanceVertical}px`;
				element.style.marginBottom = 0;
				
				void(element.offsetHeight);
				
				element.style.transition = `margin-top ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0), opacity ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0)`;
				
				setTimeout(() =>
				{
					element.style.marginTop = 0;
					element.style.opacity = targetOpacity;
					
					const timeoutId = setTimeout(() =>
					{
						element.style.transition = "";
						resolve();
					}, duration);
					
					element.setAttribute("data-fade-down-in-timeout-id", timeoutId);
				}, 10);
			}, 10);	
		});
	},
	
	
	
	fadeDownOutJs: function(element, duration, noOpacityChange = false)
	{
		return new Promise((resolve, reject) =>
		{
			element.style.marginBottom = "20vmin";
			
			const data =
			{
				targets: element,
				marginTop: `${Site.navigationAnimationDistanceVertical}px`,
				duration: duration,
				easing: "cubicBezier(.1, 0.0, .2, 0.0)",
				complete: resolve
			};
			
			if (!noOpacityChange)
			{
				data.opacity = 0;
			}
			
			anime(data);
		});	
	},
	
	fadeDownOutCss: function(element, duration, noOpacityChange = false)
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
					element.style.marginTop = `${Site.navigationAnimationDistanceVertical}px`;
					
					if (!noOpacityChange)
					{
						element.style.opacity = 0;
					}
					
					const timeoutId = setTimeout(() =>
					{
						element.style.transition = "";
						resolve();
					}, duration);
					
					element.setAttribute("data-fade-down-out-timeout-id", timeoutId);
				}, 10);
			}, 10);	
		});
	},
	
	
	
	fadeLeftInJs: function(element, duration, targetOpacity = 1)
	{
		return new Promise((resolve, reject) =>
		{
			element.style.marginLeft = `${Site.navigationAnimationDistanceHorizontal}px`;
			
			anime({
				targets: element,
				marginLeft: "0px",
				opacity: targetOpacity,
				duration: duration,
				easing: "cubicBezier(.4, 1.0, .7, 1.0)",
				complete: resolve
			});
		});	
	},
	
	fadeLeftInCss: function(element, duration, targetOpacity = 1)
	{
		return new Promise((resolve, reject) =>
		{
			try {clearTimeout(element.getAttribute("data-fade-left-in-timeout-id"))}
			catch(ex) {}
			
			element.style.transition = "";
			
			setTimeout(() =>
			{
				element.style.marginLeft = `${Site.navigationAnimationDistanceHorizontal}px`;
				
				void(element.offsetHeight);
				
				element.style.transition = `margin-left ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0), opacity ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0)`;
				
				setTimeout(() =>
				{
					element.style.marginLeft = 0;
					element.style.opacity = targetOpacity;
					
					const timeoutId = setTimeout(() =>
					{
						element.style.transition = "";
						resolve();
					}, duration);
					
					element.setAttribute("data-fade-left-in-timeout-id", timeoutId);
				}, 10);
			}, 10);	
		});
	},
	
	
	
	fadeLeftOutJs: function(element, duration, noOpacityChange = false)
	{
		return new Promise((resolve, reject) =>
		{
			const data =
			{
				targets: element,
				marginLeft: `${-Site.navigationAnimationDistanceHorizontal}px`,
				duration: duration,
				easing: "cubicBezier(.1, 0.0, .2, 0.0)",
				complete: resolve
			};
			
			if (!noOpacityChange)
			{
				data.opacity = 0;
			}
			
			anime(data);
		});	
	},
	
	fadeLeftOutCss: function(element, duration, noOpacityChange = false)
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
					element.style.marginLeft = `${-Site.navigationAnimationDistanceHorizontal}px`;
					
					if (!noOpacityChange)
					{
						element.style.opacity = 0;
					}
					
					const timeoutId = setTimeout(() =>
					{
						element.style.transition = "";
						resolve();
					}, duration);
					
					element.setAttribute("data-fade-left-out-timeout-id", timeoutId);
				}, 10);
			}, 10);	
		});
	},
	
	
	
	fadeRightInJs: function(element, duration, targetOpacity = 1)
	{
		return new Promise((resolve, reject) =>
		{
			element.style.marginLeft = `${-Site.navigationAnimationDistanceHorizontal}px`;
			
			anime({
				targets: element,
				marginLeft: "0px",
				opacity: targetOpacity,
				duration: duration,
				easing: "cubicBezier(.4, 1.0, .7, 1.0)",
				complete: resolve
			});
		});	
	},
	
	fadeRightInCss: function(element, duration, targetOpacity = 1)
	{
		return new Promise((resolve, reject) =>
		{
			try {clearTimeout(element.getAttribute("data-fade-right-in-timeout-id"))}
			catch(ex) {}
			
			element.style.transition = "";
			
			setTimeout(() =>
			{
				element.style.marginLeft = `${-Site.navigationAnimationDistanceHorizontal}px`;
				
				void(element.offsetHeight);
				
				element.style.transition = `margin-left ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0), opacity ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0)`;
				
				setTimeout(() =>
				{
					element.style.marginLeft = 0;
					element.style.opacity = targetOpacity;
					
					const timeoutId = setTimeout(() =>
					{
						element.style.transition = "";
						resolve();
					}, duration);
					
					element.setAttribute("data-fade-right-in-timeout-id", timeoutId);
				}, 10);
			}, 10);	
		});
	},
	
	
	
	fadeRightOutJs: function(element, duration, noOpacityChange = false)
	{
		return new Promise((resolve, reject) =>
		{
			const data =
			{
				targets: element,
				marginLeft: `${Site.navigationAnimationDistanceHorizontal}px`,
				duration: duration,
				easing: "cubicBezier(.1, 0.0, .2, 0.0)",
				complete: resolve
			};
			
			if (!noOpacityChange)
			{
				data.opacity = 0;
			}
			
			anime(data);
		});	
	},
	
	fadeRightOutCss: function(element, duration, noOpacityChange = false)
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
					element.style.marginLeft = `${Site.navigationAnimationDistanceHorizontal}px`;
					
					if (!noOpacityChange)
					{
						element.style.opacity = 0;
					}
					
					const timeoutId = setTimeout(() =>
					{
						element.style.transition = "";
						resolve();
					}, duration);
					
					element.setAttribute("data-fade-right-out-timeout-id", timeoutId);
				}, 10);
			}, 10);	
		});
	},
	
	
	
	fadeInJs: function(element, duration, targetOpacity = 1)
	{
		return new Promise((resolve, reject) =>
		{
			anime({
				targets: element,
				opacity: targetOpacity,
				duration: duration,
				easing: "cubicBezier(.4, 1.0, .7, 1.0)",
				complete: resolve
			});
		});	
	},
	
	fadeInCss: function(element, duration, targetOpacity = 1)
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
					element.style.opacity = targetOpacity;
					
					const timeoutId = setTimeout(() =>
					{
						element.style.transition = "";
						resolve();
					}, duration);
					
					element.setAttribute("data-fade-in-timeout-id", timeoutId);
				}, 10);
			}, 10);	
		});
	},
	
	
	
	fadeOutJs: function(element, duration, noOpacityChange = false)
	{
		return new Promise((resolve, reject) =>
		{
			const data =
			{
				targets: element,
				duration: duration,
				easing: "cubicBezier(.1, 0.0, .2, 0.0)",
				complete: resolve
			};
			
			if (!noOpacityChange)
			{
				data.opacity = 0;
			}
			
			anime(data);
		});	
	},
	
	fadeOutCss: function(element, duration, noOpacityChange = false)
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
					if (!noOpacityChange)
					{
						element.style.opacity = 0;
					}
					
					const timeoutId = setTimeout(() =>
					{
						element.style.transition = "";
						resolve();
					}, duration);
					
					element.setAttribute("data-fade-out-timeout-id", timeoutId);
				}, 10);
			}, 10);	
		});
	}
};