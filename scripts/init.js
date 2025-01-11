const params = new URLSearchParams(window.location.search);

const file = (() =>
{
	switch (params.get("debug"))
	{
		case "2":
			return "debug-offline";
		case "1":
			return "debug";
		default:
			return "index";
	}
})();

window.location.replace(`/${file}.html?page=${encodeURIComponent(window.location.pathname)}${window.location.search ? "&" + window.location.search.slice(1) : ""}`);