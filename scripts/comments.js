//Handles loading the comments on pages that require them.



let disqus_config = null;



function load_disqus()
{
	if (scripts_loaded["disqus"])
	{
		DISQUS.reset({
			reload: true,
			config: disqus_config
		});
	}
	
	else
	{
		let d = document, s = d.createElement("script");
		s.src = "https://cruzgodar.disqus.com/embed.js";
		s.setAttribute("data-timestamp", +new Date());
		(d.head || d.body).appendChild(s);
		
		scripts_loaded["disqus"] = true;
	}
}