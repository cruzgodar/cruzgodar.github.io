# Overview



## Hosting

cruzgodar\.com is hosted on Github Pages — when a repository is named [username].github.io, it can be accessed at that address as a website. The domain cruzgodar\.com is provided by Google Domains, and to connect the two, a few things are required:

- A file called `CNAME` containing the lines `cruzgodar.com` and `www.cruzgodar.com` in the Github repo.
- An `@` record in Google Domains with type `A` containing the IPs of the service that Github Pages uses for encryption.
- A `www` record in Google Domains with type `CNAME` containing `90259025.github.io`.



## Synopsis

The site is a single page, progressive web app. The scripts and styles required for all pages are loaded once and then never again, and `index.html` contains the bare minimum in order to do that. Each page folder contains the HTML that the body should contain, and it can also contain supplementary files, like custom styles and scripts, banner images, and subpages. For more in-depth information on any of these things, take a look at the relevant section below.

- [The structure of pages](https://github.com/90259025/90259025.github.io/blob/master/docs/page-structure.md)
- [Navigation between pages](https://github.com/90259025/90259025.github.io/blob/master/docs/navigation.md)
- [The footer](https://github.com/90259025/90259025.github.io/blob/master/docs/footer.md)
- [Settings](https://github.com/90259025/90259025.github.io/blob/master/docs/settings.md)
- [Progressive web app functionality](https://github.com/90259025/90259025.github.io/blob/master/docs/pwa.md)