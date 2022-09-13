Page.Presentation =
{
	callbacks: {},
	
	slides: [],
	
	init: function(callbacks)
	{
		this.callbacks = callbacks;
		
		this.slides = Page.element.querySelectorAll(".slide");
		
		Page.element.querySelectorAll("header, footer").forEach(element => element.remove());
		
		Page.element.firstElementChild.remove();
		
		document.documentElement.style.overflowY = "hidden";
	}
}