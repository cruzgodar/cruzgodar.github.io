var CACHE_NAME = "v2";
var urlsToCache =
[
    "./",
    "./index.html",
    "./home/home.html",
    "./index.html?page=%2Fhome%2Fhome.html",
    "./home/images.json",
    
    "./style/css-bundle.min.css",
    "./style/aos.min.css",
    
    "./scripts/js-bundle.min.js",
    "./scripts/aos.min.js",
    
    "./home/style/home.min.css",
    "./home/scripts/home.min.js"
];

self.addEventListener("install", function(event)
{
    event.waitUntil(
        caches.open(CACHE_NAME)
        
        .then(function(cache)
        {
            return cache.addAll(urlsToCache);
        })
    );
});



self.addEventListener("fetch", function(event)
{
    event.respondWith(
        caches.match(event.request)
        
        .then(function(response)
        {
            return response || fetchAndCache(event.request);
        })
    );
});

function fetchAndCache(url)
{
    return fetch(url + "?v=" + Math.floor(Math.random() * 1000000))
    
    
    
    .then(function(response)
    {
        //Check if we received a valid response
        if (!response.ok)
        {
            console.log("Invalid response: " + response.statusText);
        }
        
        return response;
    })
    
    
    
    .then(function(response)
    {
        let new_headers = new Headers(response.headers);
        new_headers.append("max-age", "86400"); //Only keep this resource cached for a day.
        
        return new Response(response.body, {status: response.status, statusText: response.statusText, headers: new_headers});
    })
    
    
    
    .then(function(response)
    {
        return caches.open(CACHE_NAME)
        
        .then(function(cache)
        {
            cache.put(url, response.clone());
            return response;
        });
    })
    
    
    
    .catch(function(error)
    {
        console.log("Request failed: ", error);
    });
}