//Inserts the footer at the bottom of the page.



var footer_done = false;

$(function()
{
	var fnc_arg;

	if (footer_from_nonstandard_color)
	{
		fnc_arg = ", 1";
	}

	else
	{
		fnc_arg = "";
	}



	var delay = 100;

	var extension;



	var refresh_id = setInterval(function()
	{
		if (supports_webp != null)
		{
			clearInterval(refresh_id);
			
			if (supports_webp)
			{
				extension = "webp";
			}
			
			else
			{
				extension = "jpg";
			}
		
			
			
			if (footer_exclusion == "")
			{
				$("#spawn-footer").before(`
					<div style="height: 30vh"></div>
						<div data-aos="fade-in" data-aos-duration="500" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
							<div class="line-break" style="width: 80vw"></div>
						</div>
					<div style="height: 4vw"></div>
					
					<nav class="footer-image-links" style="width: 68vw"></nav>
				`);
			}
			
			else
			{
				$("#spawn-footer").before(`
					<div style="height: 30vh"></div>
						<div data-aos="fade-in" data-aos-duration="500" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
							<div class="line-break"></div>
						</div>
					<div style="height: 4vw"></div>
					
					<div class="footer-image-links"></div>
				`);
			}
			
			
	
			if (footer_exclusion != "writing")
			{
				$(".footer-image-links").append(`
					<div id="writing-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
						<a href="/writing/writing.html${concat_url_vars(false)}">
							<img onclick="redirect(\'/writing/writing.html\', 0${fnc_arg})" src="/writing/cover.${extension}" alt="Writing"></img>
						</a>
					</div>
				`);
				
				delay += 100;
			}
			
			if (footer_exclusion != "blog")
			{
				$(".footer-image-links").append(`
					<div id="blog-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
						<a href="/blog/blog.html${concat_url_vars(false)}">
							<img onclick="redirect(\'/blog/blog.html\', 0${fnc_arg})" src="/blog/cover.${extension}" alt="Blog"></img>
						</a>
					</div>
				`);
				
				delay += 100;
			}
			
			if (footer_exclusion != "applets")
			{
				$(".footer-image-links").append(`
					<div id="applets-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
						<a href="/applets/applets.html${concat_url_vars(false)}">
							<img onclick="redirect(\'/applets/applets.html\', 0${fnc_arg})" src="/applets/cover.${extension}" alt="Applets"></img>
						</a>
					</div>
				`);
				
				delay += 100;
			}
			
			if (footer_exclusion != "research")
			{
				$(".footer-image-links").append(`
					<div id="research-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
						<a href="/research/research.html${concat_url_vars(false)}">
							<img onclick="redirect(\'/research/research.html\', 0${fnc_arg})" src="/research/cover.${extension}" alt="Research"></img>
						</a>
					</div>
				`);
				
				delay += 100;
			}
			
			if (footer_exclusion != "notes")
			{
				$(".footer-image-links").append(`
					<div id="notes-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
						<a href="/notes/notes.html${concat_url_vars(false)}">
							<img onclick="redirect(\'/notes/notes.html\', 0${fnc_arg})" src="/notes/cover.${extension}" alt="Notes"></img>
						</a>
					</div>
				`);
				
				delay += 100;
			}
			
			if (footer_exclusion != "bio")
			{
				$(".footer-image-links").append(`
					<div id="bio-link" class="footer-image-link" data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0" data-aos-once="false" data-aos-anchor="#trigger-menu">
						<a href="/bio/bio.html${concat_url_vars(false)}">
							<img onclick="redirect(\'/bio/bio.html\', 0${fnc_arg})" src="/bio/cover.${extension}" alt="Me"></img>
						</a>
					</div>
				`);
				
				delay += 100;
			}
			
			
			
			$("#spawn-footer").before('<div id="trigger-menu"></div>');
			
			
			
			$("#spawn-footer").before(`
				<div style="height: calc(4vw - 45px); min-height: 0px"></div>
				
				<div class="footer-button-container">
					<div data-aos="zoom-out" data-aos-offset="0" data-aos-once="false">
						<a href="/settings.html${concat_url_vars(false)}">
							<input type="image" class="footer-button" src="/graphics/button-icons/gear.png" alt="Change Theme" onclick="redirect('/settings.html', 0${fnc_arg})">
						</a>
					</div>
					
					<div data-aos="zoom-out" data-aos-delay="${delay}" data-aos-offset="0" data-aos-once="false">
						<a href="/pwa.html${concat_url_vars(false)}">
							<input type="image" id="pwa-button" class="footer-button" style="margin-left: 0px;" src="/graphics/button-icons/app.png" alt="Progressive Web App Info" onclick="redirect('/pwa.html', 0${fnc_arg})">
						</a>
					</div>
				</div>
			`);
			
			
			
			if (url_vars["content_animation"] == 1)
			{
				$(".line-break").parent().removeAttr("data-aos");
				$(".footer-image-link").removeAttr("data-aos");
				$(".footer-button").parent().removeAttr("data-aos");
			}
		}
	}, 50);
	
	footer_done = true;
});