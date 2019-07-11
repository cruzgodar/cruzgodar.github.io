//Detects the browser used and makes appropriate modifications.



var browser_detect =
{
	init: function()
	{
		this.browser = this.searchString(this.dataBrowser) || "Other";
		this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "Unknown";
	},
	
	searchString: function(data)
	{
		for (var i = 0; i < data.length; i++)
		{
			var dataString = data[i].string;
			this.versionSearchString = data[i].subString;

			if (dataString.indexOf(data[i].subString) !== -1)
			{
				return data[i].identity;
			}
		}
	},
	
	searchVersion: function (dataString)
	{
		var index = dataString.indexOf(this.versionSearchString);
		
		if (index === -1)
		{
			return;
		}
		
		
		
		var rv = dataString.indexOf("rv:");
		
		if (this.versionSearchString === "Trident" && rv !== -1)
		{
			return parseFloat(dataString.substring(rv + 3));
		}
		
		else
		{
			return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
		}
	},

	dataBrowser:
	[
		{string: navigator.userAgent, subString: "Edge", identity: "MS Edge"},
		{string: navigator.userAgent, subString: "MSIE", identity: "Explorer"},
		{string: navigator.userAgent, subString: "Trident", identity: "Explorer"},
		{string: navigator.userAgent, subString: "Firefox", identity: "Firefox"},
		{string: navigator.userAgent, subString: "Opera", identity: "Opera"},  
		{string: navigator.userAgent, subString: "OPR", identity: "Opera"},  
		{string: navigator.userAgent, subString: "Chrome", identity: "Chrome"}, 
		{string: navigator.userAgent, subString: "Safari", identity: "Safari"}	   
	]
};
	
browser_detect.init();

var browser_name = browser_detect.browser;

$(function()
{
	//Handle IE and Edge.
	if (browser_name == "MS Edge")
	{		
		try
		{
			$("#background-image").addClass("bad-banner");
		}
		
		catch(ex) {}
	}

	else if (browser_name == "Explorer")
	{
		window.location.replace("/ie.html");
	}
});



//Remove hover events on touchscreen devices.
function hasTouch()
{
	return "ontouchstart" in document.documentElement
		   || navigator.maxTouchPoints > 0
		   || navigator.msMaxTouchPoints > 0;
}

if (hasTouch())
{
	//Remove all :hover stylesheets.
	try
	{
		//Prevent exception on browsers not supporting DOM styleSheets properly
		for (var si in document.styleSheets)
		{
			var styleSheet = document.styleSheets[si];
			if (!styleSheet.rules) continue;

			for (var ri = styleSheet.rules.length - 1; ri >= 0; ri--)
			{
				if (!styleSheet.rules[ri].selectorText) continue;

				if (styleSheet.rules[ri].selectorText.match(':hover'))
				{
					styleSheet.deleteRule(ri);
				}
			}
		}
	}
	
	catch (ex) {}
}