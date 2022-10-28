Page.Presentation =
{
	callbacks: {},
	
	slides: [],
	slide_container: null,
	
	current_slide: -1,
	
	build_state: 0,
	num_builds: 0,
	
	
	
	init: function(callbacks)
	{
		this.callbacks = callbacks;
		
		this.slides = Page.element.querySelectorAll(".slide");
		this.slide_container = Page.element.querySelector("#slide-container");
		
		this.slides.forEach(element => element.style.display = "none");
		
		Page.element.querySelectorAll("header, footer").forEach(element => element.style.display = "none");
		
		Page.element.firstElementChild.style.display = "none";
		
		document.documentElement.style.overflowY = "hidden";
		
		
		
		document.documentElement.addEventListener("keydown", this.handle_keydown_event);
		Page.temporary_handlers["keydown"].push(this.handle_keydown_event);
		
		document.documentElement.addEventListener("touchstart", this.handle_touchstart_event);
		Page.temporary_handlers["touchstart"].push(this.handle_touchstart_event);
		
		document.documentElement.addEventListener("touchend", this.handle_touchend_event);
		Page.temporary_handlers["touchend"].push(this.handle_touchend_event);
		
		
		
		this.next_slide();
	},
	
	
	
	exit: function()
	{
		this.slide_container.remove();
		
		this.slides.forEach(element => element.remove());
		
		Page.element.querySelectorAll("header, footer").forEach(element => element.style.display = "block");
	
		Page.element.firstElementChild.style.display = "block";
		
		document.documentElement.style.overflowY = "visible";
	},
	
	
	
	next_slide: async function()
	{
		if (this.num_builds !== 0 && this.build_state !== this.num_builds)
		{
			this.slides[this.current_slide].querySelectorAll(`.build-${this.build_state}`).forEach(element => Page.Animate.fade_up_in(element, Site.page_animation_time * 2));
			
			try {await this.callbacks[this.current_slide].builds[this.build_state](this.slides[this.current_slide])}
			catch(ex) {}
			
			this.build_state++;
			
			return;
		}
		
		
		
		if (this.current_slide === this.slides.length)
		{
			return;
		}
		
		await Page.Animate.fade_up_out(Page.element, Site.page_animation_time);
		
		if (this.current_slide !== -1)
		{
			this.slides[this.current_slide].style.display = "none";
		}
		
		this.current_slide++;
		
		if (this.current_slide === this.slides.length)
		{
			this.exit();
		}
		
		else
		{
			this.slides[this.current_slide].style.display = "block";
			
			this.build_state = 0;
			
			let builds = this.slides[this.current_slide].querySelectorAll(".build");
			
			this.num_builds = Math.max(builds.length, this.callbacks?.[this.current_slide]?.builds?.length ?? 0);
			
			builds.forEach(element => element.style.opacity = 0);
		}
		
		try {await this.callbacks[this.current_slide].callback(this.slides[this.current_slide])}
		catch(ex) {}
		
		Page.Animate.fade_up_in(Page.element, Site.page_animation_time * 2);
	},
	
	
	
	previous_slide: async function()
	{
		if (this.num_builds !== 0 && this.build_state !== 0)
		{
			this.build_state--;
			
			this.slides[this.current_slide].querySelectorAll(`.build-${this.build_state}`).forEach(element => Page.Animate.fade_down_out(element, Site.page_animation_time));
			
			try {await this.callbacks[this.current_slide].builds[this.build_state](this.slides[this.current_slide])}
			catch(ex) {}
			
			return;
		}
		
		
		
		if (this.current_slide === 0 || this.current_slide === this.slides.length)
		{
			return;
		}
		
		
		
		await Page.Animate.fade_down_out(Page.element, Site.page_animation_time);
		
		this.slides[this.current_slide].style.display = "none";
		
		
		
		this.current_slide--;
		
		let builds = this.slides[this.current_slide].querySelectorAll(".build");
		
		this.num_builds = Math.max(builds.length, this.callbacks?.[this.current_slide]?.builds?.length ?? 0);
		
		this.build_state = this.num_builds;
		
		
		
		this.slides[this.current_slide].style.display = "block";
		
		try {await this.callbacks[this.current_slide].callback(this.slides[this.current_slide])}
		catch(ex) {}
		
		Page.Animate.fade_down_in(Page.element, Site.page_animation_time * 2);
	},
	
	
	
	handle_keydown_event: function(e)
	{
		if (e.keyCode === 39 || e.keyCode === 40 || e.keyCode === 32 || e.keyCode === 13)
		{
			Page.Presentation.next_slide();
		}
		
		else if (e.keyCode === 37 || e.keyCode === 38)
		{
			Page.Presentation.previous_slide();
		}
	},
	
	
	
	max_touches: 0,
	
	handle_touchstart_event: function(e)
	{
		Page.Presentation.max_touches = Math.max(Page.Presentation.max_touches, e.touches.length);
	},
	
	handle_touchend_event: function(e)
	{
		if (Page.Presentation.max_touches === 2)
		{
			Page.Presentation.next_slide();
		}
		
		else if (Page.Presentation.max_touches === 3)
		{
			Page.Presentation.previous_slide();
		}
		
		Page.Presentation.max_touches = 0;
	},
	
	
	
	get_current_slide: function()
	{
		return this.slides[this.current_slide];
	}
}