!async function()
{
	"use strict";
	

	
	//This thing is constructed in a really, *really* strange way in order to decrease storing effectively duplicate files. This script fetches the plane partition applet's code and a collection of presentation-specific code that's in this directory, merges them into a new function, and then executes that. This ensures everything has the correct scope and that the two scripts can interact without needing to store and maintain the entire plane partitions script in here.
	
	let applet_response = await fetch(`/applets/plane-partitions/scripts/content.js`);
	
	let applet_data = await applet_response.text();
	
	let presentation_response = await fetch(`/papers/bijectivizing-the-pt-dt-correspondence/scripts/content.js`);
	
	let presentation_data = await presentation_response.text();
	
	const AsyncFunction = (async function () {}).constructor;
	
	AsyncFunction(`${presentation_data};${applet_data}`)();
}()