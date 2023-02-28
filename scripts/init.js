if (typeof Page === "undefined")
{
	if (window.location.search !== "")
	{
		window.location.replace("/index-testing.html?page=" + encodeURIComponent(window.location.pathname) + "&" + window.location.search.slice(1));
	}
	
	else
	{
		window.location.replace("/index-testing.html?page=" + encodeURIComponent(window.location.pathname));
	}
}

Page.load();