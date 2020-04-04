"use strict";



//Detects the browser used and makes appropriate modifications.



let browser_detect =
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
};
	
browser_detect.init();

let browser_name = browser_detect.browser;




function remove_hover_events()
{
	let elements = document.querySelectorAll("*");
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].classList.remove("enable-hover");
	}
	
	console.log("Removed hover events");
}

function add_hover_events()
{
	let elements = document.querySelectorAll("*");
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].classList.add("enable-hover");
	}
	
	console.log("Added hover events");
	
	//This forces the document to reflow, which is necessary for some browsers to recognize the changes.
	
}