function load_disqus()
{
	if (loaded_disqus)
	{
		DISQUS.reset({
			reload: true,
			config: disqus_config
		});
	}
	
	else
	{
		var d = document, s = d.createElement("script");
		s.src = "https://cruzgodar.disqus.com/embed.js";
		s.setAttribute("data-timestamp", +new Date());
		(d.head || d.body).appendChild(s);
		
		loaded_disqus = true;
	}
}