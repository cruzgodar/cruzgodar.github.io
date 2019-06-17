self.addEventListener("fetch", function(event)
{
    event.respondWith(caches.open("cache").then(function(cache)
    {
        fetch(event.request.url).catch(error => 
        {
           //Return the offline page
           return caches.match("/offline.html");
        });
        
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
                            "/offline.html",
                            "/style/*",
                            "/scripts/*",
                            
                            "/graphics/general-icons/logo.png",
                            
                            "/writing/cover.png",
                            "/writing/cover.webp",
                            "/blog/cover.png",
                            "/blog/cover.webp",
                            "/applets/cover.png",
                            "/applets/cover.webp",
                            "/research/cover.png",
                            "/research/cover.webp",
                            "/notes/cover.png",
                            "/notes/cover.webp",
                            "/bio/cover.png",
                            "/bio/cover.webp",
                            
                            "/graphics/button-icons/gear.png",
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