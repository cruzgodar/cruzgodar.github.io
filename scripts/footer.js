//Inserts the footer and theme button at the bottom of the page.



//Puts the footer in at the bottom of the page, omitting one link (whatever the current page is)
function insert_footer(omit, no_theme_button, from_nonstandard_color)
{
	//We're required to use this archaic default parameter method so IE doesn't crash before it can say that it's IE and get redirected somewhere else.
	no_theme_button = (typeof no_theme_button != "undefined") ? no_theme_button : 0;
	
	from_nonstandard_color = (typeof from_nonstandard_color != "undefined") ? from_nonstandard_color : 0;
	var fnc_arg;
	
	if (from_nonstandard_color == 1)
	{
		fnc_arg = ", 1";
	}
	
	else
	{
		fnc_arg = "";
	}
	
	var delay = 100;
	
	$("#spawn-footer").before('<div style="height: 30vh"></div> <div data-aos="fade-in" data-aos-duration="500" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu"> <div class="line-break"> <div class="line-break-dark" style="opacity: ' + url_vars["theme"] + '"></div> </div> </div> <div style="height: 4vw"></div> <div class="menu-image-links"></div>');
	
	if (omit != "writing")
	{
		$(".menu-image-links").append('<div id="writing-link" class="menu-image-link" data-aos="zoom-out" data-aos-delay="' + delay + '" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu"> <img class="link" onclick="redirect(\'/writing.html\'' + fnc_arg + ')" src="/graphics/image-links/writing-glyph.png" alt="Writing"></img> </div>');
		
		delay += 100;
	}
	
	if (omit != "blog")
	{
		$(".menu-image-links").append('<div id="blog-link" class="menu-image-link" data-aos="zoom-out" data-aos-delay="' + delay + '" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu"> <img class="link" onclick="redirect(\'/blog.html\'' + fnc_arg + ')" src="/graphics/image-links/blog-glyph.png" alt="Blog"></img> </div>');
		
		delay += 100;
	}
	
	if (omit != "applets")
	{
		$(".menu-image-links").append('<div id="applets-link" class="menu-image-link" data-aos="zoom-out" data-aos-delay="' + delay + '" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu"> <img class="link" onclick="redirect(\'/applets.html\'' + fnc_arg + ')" src="/graphics/image-links/applets-glyph.png" alt="Applets"></img> </div>');
		
		delay += 100;
	}
	
	if (omit != "research")
	{
		$(".menu-image-links").append('<div id="research-link" class="menu-image-link" data-aos="zoom-out" data-aos-delay="' + delay + '" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu"> <img class="link" onclick="redirect(\'/research.html\'' + fnc_arg + ')" src="/graphics/image-links/research-glyph.png" alt="Research"></img> </div>');
		
		delay += 100;
	}
	
	if (omit != "notes")
	{
		$(".menu-image-links").append('<div id="notes-link" class="menu-image-link" data-aos="zoom-out" data-aos-delay="' + delay + '" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu"> <img class="link" onclick="redirect(\'/notes.html\'' + fnc_arg + ')" src="/graphics/image-links/notes-glyph.png" alt="Notes"></img> </div>');
		
		delay += 100;
	}
	
	if (omit != "bio")
	{
		$(".menu-image-links").append('<div id="bio-link" class="menu-image-link" data-aos="zoom-out" data-aos-delay="' + delay + '" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu"> <img class="link" onclick="redirect(\'/bio.html\'' + fnc_arg + ')" src="/graphics/image-links/me-glyph.png" alt="Me"></img> </div>');
		
		delay += 100;
	}
	
	$("#spawn-footer").before('<div id="trigger-menu"></div>');
	
	if (no_theme_button == 1)
	{
		$("#spawn-footer").before('<div style="height: 4vw"></div>');
	}
	
	if (no_theme_button == 0)
	{
		$("#spawn-footer").before('<div style="height: calc(4vw - 45px); min-height: 0px"></div> <div style="display: flex; align-items: left; margin-bottom: 6px; justify-content: space-between"> <div data-aos="zoom-out" data-aos-offset="0" data-aos-once="false"> <img class="footer-button" style="margin-left: 10px" src="/graphics/button-icons/gear.png" alt="Change Theme" onclick="redirect(\'/settings.html\'' + fnc_arg + ')"></img> </div> <div></div> </div>');
	}
	
	if (url_vars["content_animation"] == 1)
	{
		$(".line-break").parent().removeAttr("data-aos");
		$(".menu-image-link").removeAttr("data-aos");
		$(".footer-button").parent().removeAttr("data-aos");
	}
	
	footer_loaded = 1;
}