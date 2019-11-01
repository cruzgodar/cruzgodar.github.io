//Handles registering the service worker, whenever that's possible.



if ("serviceWorker" in navigator)
{
	window.addEventListener("load", function()
	{
		navigator.serviceWorker.register("/service-worker.js");
	});
}