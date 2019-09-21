var CACHE_NAME = "static-cache";
var urlsToCache =
[
    "./",
    "./index.html",
    "./home.html",
    "./index.html?page=%2Fhome.html",
    "./images.json",
    
    "./style/css-bundle.min.css",
    "./style/aos.min.css",
    
    "./scripts/js-bundle.min.js",
    "./scripts/aos.min.js"
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
    return fetch(url)
    .then(function(response)
    {
        //Check if we received a valid response
        if (!response.ok)
        {
            throw Error(response.statusText);
        }
        
        return caches.open(CACHE_NAME)
        .then(function(cache)
        {
            cache.put(url, response.clone());
            return response;
        });
    })
    
    .catch(function(error)
    {
        console.error('Request failed:', error);
        //You could return a custom offline 404 page here
    });
}