importScripts("/scripts/workbox-sw.min.js");

if (workbox)
{
	console.log("Workbox loaded successfully");
}



//For image files, though, we'll cache them for a week. It's not as important to have the latest versions, and they are by far the biggest use of the network.
workbox.routing.registerRoute(
	/\.(?:webp|png|jpg|jpeg|gif)$/,
	new workbox.strategies.CacheFirst({
		cacheName: "image-cache",
		plugins: [
			new workbox.expiration.Plugin({
				//Cache up to 200 images.
				maxEntries: 200,
				
				//Cache for a maximum of a week.
				maxAgeSeconds: 7 * 24 * 60 * 60,
			})
		],
	})
);