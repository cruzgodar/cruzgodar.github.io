!async function()
{
	"use strict";
	
	if (Site.Settings.url_vars["theme"] !== 1)
	{
		Site.Settings.toggle("theme");
	}
}()