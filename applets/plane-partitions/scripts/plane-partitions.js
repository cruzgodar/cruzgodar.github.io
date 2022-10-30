!async function()
{
	"use strict";
	
	
	let min_extension = DEBUG ? "" : "min.";
	
	let response = await fetch(`/applets/plane-partitions/scripts/content.${min_extension}js`);
	
	let data = await response.text();
	
	const AsyncFunction = (async function () {}).constructor;
	
	AsyncFunction(`const APPLET_VERSION = true;${data}`)();
}()