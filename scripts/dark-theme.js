//Loaded in head to change the background color before the body loads in order to prevent a white (or rarely, gray) flash on every page.

function get_url_var(id)
{
	var svalue = location.search.match(new RegExp("[\?\&]" + id + "=([^\&]*)(\&?)","i"));
	return svalue ? svalue[1] : svalue;
}

var theme = get_url_var("theme");

if (theme == 0)
{
	document.documentElement.style.backgroundColor = "rgb(255, 255, 255)";
}

else if (theme == 1)
{
	document.documentElement.style.backgroundColor = "rgb(24, 24, 24)";
}