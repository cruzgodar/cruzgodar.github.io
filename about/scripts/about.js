!function()
{
	document.querySelector("#toggle-minor-versions-checkbox").addEventListener("click", function()
	{
		if (document.querySelector("#toggle-minor-versions-checkbox").checked)
		{
			set_element_styles(".minor-version, .medium-version, .major-version", "opacity", 0);
			
			setTimeout(function()
			{
				set_element_styles(".minor-version", "display", "block");
				
				setTimeout(function()
				{
					set_element_styles(".minor-version, .medium-version, .major-version", "opacity", 1);
					
					AOS.init({duration: 1200, once: false, offset: window_height / 4});
				}, 50);
			}, 300);
		}
		
		else
		{
			set_element_styles(".minor-version, .medium-version, .major-version", "opacity", 0);
			
			setTimeout(function()
			{
				set_element_styles(".medium-version, .major-version", "opacity", 1);
				set_element_styles(".minor-version", "display", "none");
				
				AOS.init({duration: 1200, once: false, offset: window_height / 4});
			}, 300);
		}
	});
}()