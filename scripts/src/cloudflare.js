const analyticsHosts = ["cruzgodar.com", "www.cruzgodar.com"];

export function initAnalytics()
{
	if (!analyticsHosts.includes(window.location.hostname))
	{
		return;
	}

	const beacon = document.createElement("script");

	beacon.type = "module";
	beacon.src = "https://static.cloudflareinsights.com/beacon.min.js";
	beacon.setAttribute("data-cf-beacon", JSON.stringify({
		token: "cea85decd2f24b3fade40166c66cff45",
		spa: false
	}));

	document.body.appendChild(beacon);
}
