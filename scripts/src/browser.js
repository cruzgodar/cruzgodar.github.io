/*
	
	Browser: methods to detect the user's browser.
		
		detect: detects the browser used.
	
*/



"use strict";



let Browser = 
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
			for (let i = 0; i < data.length; i++)
			{
				let dataString = data[i].string;
				this.versionSearchString = data[i].subString;

				if (dataString.indexOf(data[i].subString) !== -1)
				{
					return data[i].identity;
				}
			}
		},
		
		searchVersion: function(dataString)
		{
			let index = dataString.indexOf(this.versionSearchString);
			
			if (index === -1)
			{
				return;
			}
			
			
			
			let rv = dataString.indexOf("rv:");
			
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
	}
};