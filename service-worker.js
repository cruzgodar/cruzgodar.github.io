//After a service worker is installed and the user navigates to a different page or refreshes the current one, the service worker will begin to receive fetch events. Look, I don't know how this PWA stuff works. At all. But if this does the job, then I'm happy.



self.addEventListener("fetch", function(event)
{
    event.respondWith(caches.open("cache").then(function(cache)
    {
        return cache.match(event.request).then(function(response)
        {
            console.log("Cache request: " + event.request.url);
            var fetchPromise = fetch(event.request).then(function(networkResponse)
            {           
                //If we got a response from the cache, update the cache                   
                console.log("Fetch completed: " + event.request.url, networkResponse);
                if (networkResponse)
                {
                    console.log("Updated cached page: " + event.request.url, networkResponse);
                    cache.put(event.request, networkResponse.clone());
                }
                
                return networkResponse;
            },
            
            function(event)
            {   
                //A rejected promise - just ignore it, we're offline!   
                console.log("Error in fetch()", event);
                event.waitUntil(
                    caches.open("cache").then(function(cache)
                    {
                        //Takes a list of URLs, fetches them from the server, and adds the response to the cache.
                        return cache.addAll(
                        [                                 
                            "/", //Do not remove
                            "/index.html", //Default
                            "/index.html?homescreen=1", //Default
                            "/?homescreen=1", //Default
                            "/style/base-style.css"
                        ]);
                    })
                );
            });
            
            //Respond from the cache, or the network
            return response || fetchPromise;
        });
    }));
});

self.addEventListener("install", function(event)
{
    //The promise that skipWaiting() returns can be safely ignored.
    self.skipWaiting();
    console.log("Latest version installed!");
});