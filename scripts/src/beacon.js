// Cloudflare Web Analytics.
//
// Embedded here rather than left to Cloudflare's automatic injection: that
// generates its own config with "spa": 2, and the spa option can only be set
// through a manual install.
//
// With spa tracking on, the beacon counts every History API change as a page
// view. The input components rewrite the url as you interact with an applet, so
// /applets/lambda-calculus was reporting 70,643 page views against 280 real
// visits. With it off, only full page loads count.
//
// Loaded from main.js, which every generated page imports, and directly by the
// handful of standalone pages that don't (the Lapsa decks and /debug).
//
// Nothing is reported off the live site, so local development stays out of the
// numbers --- Cloudflare's injection never ran on localhost either.

const analyticsHosts = ["cruzgodar.com", "www.cruzgodar.com"];

export function initBeacon()
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
