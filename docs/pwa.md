# Progressive Web App Functionality



The site is a progressive web app. All this means is that it takes explicit control of how resources get cached, and in particular, it can be installed like a native app. Three files accomplish this:

- `manifest.json` defines a bunch of information about the site that is required for an app, like its name, the icons it can use, and the url the app should load at launch. In particular, it also defines `display` to be `standalone`, which tells the browser that the app should launch in its own window and without a url bar.

- `service-worker.js` controls what the app caches and when. The list at the top and the first event listener say that it must load and store a few critical files immediately and never let go of them. The second event listener is triggered whenever the browser or app tries to fetch literally anything. If that resource is already present in the cache, then it blocks the request and returns that. Otherwise, it allows the fetch to occur and also stores the response in the cache. This cuts down on data usage, but the main benefit is that the app can load anything that it's ever seen before, even when offline. The website can also technically do this, but loading the inital resources is usually not possible when offline, unless the user was already on the page when the connection dropped.

- Finally, `register-service-worker.js` is a very short script that's part of the JS bundle. It tests to see if the browser supports service workers, and if so, registers `service-worker.js` as one. This means that those critical resources are cached as soon as the first page loads, so there's no need to wait when installing the app.