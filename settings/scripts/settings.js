!function()
{
	"use strict";
	
	
	
	init_settings_texts();
	
	set_apply_button();
	
	
	
	
	
	function init_settings_texts()
	{
		let settings_query_strings = Object.keys(url_vars);
		
		for (let i = 0; i < settings_query_strings.length; i++)
		{
			document.querySelector("#" + settings_query_strings[i].replace(/_/g, "-") + "-button-text").textContent = settings_texts[settings_query_strings[i]][url_vars[settings_query_strings[i]]];
		}
	}
	
	
	
	function set_apply_button()
	{
		let return_url = get_url_var("return");
		
		//Believe it or not, it might actually be the string "null". If the page we're coming from is the root page (without index.html), it will write null into the url and then this page will get "null". Still an invalid url to return to.
		if (return_url == null || return_url == "null" || return_url.includes("settings"))
		{
			document.querySelector("#apply-button").setAttribute("onclick", "redirect('/home/home.html')");
		}
		
		else
		{
			document.querySelector("#apply-button").setAttribute("onclick", "redirect('" + decodeURIComponent(return_url) + "', false, false, true)");
		}
	}
}()