"use strict";



const Browser = 
{
	name: "",
	
	detect: function()
	{
		this.Detector.init();
		
		this.name = this.Detector.browser;
	},
	
	Detector:
	{
		init: function()
		{
			this.browser = this.searchString(this.dataBrowser) || "Other";
			this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "Unknown";
		},
		
		searchString: function(data)
		{
			data.forEach(entry =>
			{
				const dataString = entry.string;
				this.versionSearchString = entry.subString;

				if (dataString.indexOf(entry.subString) !== -1)
				{
					return entry.identity;
				}
			});
		},
		
		searchVersion: function(dataString)
		{
			const index = dataString.indexOf(this.versionSearchString);
			
			if (index === -1)
			{
				return;
			}
			
			
			
			const rv = dataString.indexOf("rv:");
			
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
	},
	
	isIos: function()
	{
		return [
			'iPad Simulator',
			'iPhone Simulator',
			'iPod Simulator',
			'iPad',
			'iPhone',
			'iPod'
		].includes(navigator.platform)
		
		// iPad on iOS 13 detection
		|| (navigator.userAgent.includes("Mac") && "ontouchend" in document)
	}
};