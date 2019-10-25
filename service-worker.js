importScripts("/scripts/workbox-sw.min.js");

if (workbox)
{
	console.log("Workbox loaded successfully");
}



//For non-image files, we go to the latest version on the network by default. If that's not available, then we look to the cache.
workbox.routing.registerRoute(
	/\.(?:html|js|css|json|xml|txt|pdf|tex|zip)$/,
	new workbox.strategies.StaleWhileRevalidate({
		cacheName: "main-cache",
		plugins: [
			new workbox.expiration.Plugin({
				//Cache up to 1000 files.
				maxEntries: 1000,
				
				//Cache for a maximum of a month. We don't really care about these going out of date, since the newest version is always fetched from the network when possible.
				maxAgeSeconds: 30 * 24 * 60 * 60,
				
				purgeOnQuotaError: true
			})
		]
	})
);



//For image files, though, we'll cache them for a week and serve the cached version by default. It's not as important to have the latest versions, and they are by far the biggest use of the network.
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
				
				purgeOnQuotaError: true
			})
		]
	})
);



//This is all well and good, but it won't cache things loaded using fetch(). Therefore, we need to do that manually.
self.addEventListener("fetch", function(event)
{
	if (/\.(?:webp|png|jpg|jpeg|gif)$/.test(event.request))
	{
		caches.open("image-cache").then(function(cache)
		{
			cache.match(event.request)
			
			.then(function(response)
			{
				if (!response)
				{
					fetch(event.request)
					
					.then(function(response)
					{
						if (response.ok)
						{
							cache.put(event.request, response.clone());
						}
					});
				}
			});
		});
	}
	
	else
	{
		caches.open("main-cache").then(function(cache)
		{
			cache.match(event.request)
			
			.then(function(response)
			{
				if (!response)
				{
					fetch(event.request)
					
					.then(function(response)
					{
						if (response.ok)
						{
							cache.put(event.request, response.clone());
						}
					});
				}
			});
		});
	}
});