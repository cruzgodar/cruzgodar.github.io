!async function()
{
	"use strict";
	
	Site.load_style("/style/lapsa.min.css");
	await Site.load_script("/scripts/lapsa.min.js");
	
	document.head.querySelector("#theme-color-meta").setAttribute("content", "#181818");
	
	document.body.appendChild(Page.element.querySelector("#lapsa-slide-container"));
	document.body.appendChild(Page.element.querySelector("#hidden-canvases"));
	Page.element.remove();
	document.body.querySelector("#header").remove();
	
	//This thing is constructed in a really, *really* strange way in order to decrease storing effectively duplicate files. This script fetches the plane partition applet's code and a collection of presentation-specific code that's in this directory, merges them into a new function, and then executes that. This ensures everything has the correct scope and that the two scripts can interact without needing to store and maintain the entire plane partitions script in here.
	
	let applet_response = await fetch(`/applets/plane-partitions/scripts/content.${DEBUG ? "min." : ""}js`);
	
	let applet_data = await applet_response.text();
	
	let presentation_response = await fetch(`/slides/oral-exam/scripts/content.${DEBUG ? "min." : ""}js`);
	
	let presentation_data = await presentation_response.text();
	
	const AsyncFunction = (async function () {}).constructor;
	
	AsyncFunction(`${presentation_data};${applet_data}`)();
}()