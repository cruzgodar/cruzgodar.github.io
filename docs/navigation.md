# Navigation



## Entry points

When the site is first loaded, one of the *entry point* files is accessed: `index.html`, `index-testing.html`, or `404.html`. All of these load the same styles and scripts and have all the required tags in their heads, but they differ in a few ways.

- `index.html` is intended for finished commits. It fetches a minified bundle of JS and CSS, reducing requests and decreasing the total amount of data requested. It also defers the loading of the CSS until after the page loads so that it can load in parallel with the JS.

- `index-testing.html` is identical to `index.html`, just without any fancy features. It loads the CSS and JS from individual, unminified files, it loads the CSS first like a normal website, and it also sets a `DEBUG` flag that makes all future CSS and JS requests look for unminified files. All of this makes it ideal for, well, *testing* -- when code is added or modified, it's very inconvenient to have to minify it before its effects are visible.

- `404.html` is also identical to `index.html`, but its difference is that it's loaded when the user receives a 404 error. This unavoidably causes a redirect, so it's necessary to have another entry point. It also *always* loads `/404/404.html`, unlike the first two pages.

Once the required files are loaded, the entry point files load a page. As mentioned before, `404.html` always loads `/404/404.html`, but the other two differ. By default, they will load `/home/home.html`, but if the url contains a variable named `page`, the loaded page will be that value, *decoded*. For example, if the user navigates to `cruzgodar.com/index.html?page=%2Fwriting%2Fcorona%2Fcorona.html`, then the `page` variable has a value of `%2Fwriting%2Fcorona%2Fcorona.html`, and when decoded, `%2F` becomes `/`. Therefore, the initial page loaded will be `/writing/corona/corona.html`. Because navigating between pages changes the url to match this encoded format, the url of any page can be copied and shared as a link with the expected result.



## Links

The `redirect()` function handles all navigatgion within the site. Any element that should act as a link has an `onclick` attribute that calls `redirect()`, but many browsers have specific features for `a` tags in particular, like opening them in a new tab. For that reason, every element that calls `redirect` must be wrapped in an `a` tag, and whenever a page is loaded, all `a` tags are found and blocked, so that they do nothing when clicked. This method gives the best of both worlds.

It's worthwhile to note that these `a` tags' `href` attributes don't need to be converted to the `page`-variable format. For example, an image link to the Corona page could look like the following:

```html
<a href="/writing/corona/corona.html">
	<img id="image-corona" class="check-webp" onclick="redirect('/writing/corona/corona.html')" src="" alt="Corona"></img>
</a>
```

Here, `navigation.js` will automatically find the `a` tag, block it from being directly clicked, and change its `href` to `/index.html?page=%2Fwriting%2Fcorona%2Fcorona.html`. It will also append any settings to this url so that they're preserved when (for example) the link is opened in a new tab.



## The `redirect()` function

When a link is clicked and `redirect()` is called, a number of things happen, but we will focus on the main three. After checking to see if the link should be forced to open in a new tab (for example, a link to an external site), the `redirect()` function:

1. Fetches the target HTML file using the modern JS fetch API.

2. Fades out the current page's content, as long as the setting for decreased animation isn't enabled. If the background color of the page has changed, then it also animates that back to normal.

3. Starts loading the banner if the target page has one. This is why it's required to have a list of banner pages separate from the `banner_page` setting: that setting hasn't yet taken effect. Loading the banner at this point effectively gives it a 300ms grace period to load while the content fades out before any loading time will be noticible. Of course, that banner was probably already preloaded on the previous page, so unless that page was visited for a very short time, this grace period shouldn't be necessary.

All three of these functions run in parallel and return promises. If all three promises resolve, `redirect()` runs `on_page_unload()`, loads the new HTML into the body, and executes any scripts present in that HTML. Usually, this will only include the default setup script described in [the page structure doc](https://github.com/90259025/90259025.github.io/blob/master/docs/page-structure.md), which sets the page settings and calls `on_page_load()`. The function is only called at this point to ensure that the HTML has loaded and the page settings have been set before finishing the rest of the page setup.



## Loading a page

`on_page_load()` is the main workhorse for preparing everything on a page beyond the plain HTML. In order, it:

1. Loads any page-specific styles or scripts.

2. Sets the page's title defined in the page settings.

3. Fades in the banner or just makes the content visible on nonbanner pages.

4. Detects and blocks all `a` tags on the page, and processes them as described in the previous section.

5. Detects all elements with an attribute of `data-aos` and automatically sets their delays and anchors so that they animate in in sequence.

6. Sets up both the regular and floating footers (see [the footer doc](https://github.com/90259025/90259025.github.io/blob/master/docs/footer.md) for more).

7. Sets up the scroll up button that can be revealed at the top of the page.

8. Fetches the other size of the current banner in the background to reduce the delay when changing the window's orientation.

9. Detects all links to banner pages and fetches those banners in the background.

10. Detects if the device being used is a touchscreen, and if so, removes all `:hover` selectors from the CSS.

11. Applies various settings, including setting the font and layout on writing pages, disabling comments, and turning off content animation.

12. If the page setting `math_page` is true, typesets any math on the page.

13. If the page setting `comments` is true, loads Disqus.



## Unloading a page

`on_page_unload()` does much less than `on_page_load()` — its job is simply to clean a few things up so that the next page can be loaded with a clean slate. The function:

1. Removes any CSS and JS with a class of `temporary-style` or `temporary-script`. These are almost always page-specific styles or scripts.

2. Removes every element that isn't a `script` tag from the body to prevent memory leaks. While it may not be necessary to leave the scripts behind, it makes sense philosophically. Note that temporary scripts are still removed in the previous step.

3. Unbinds all temporary event listers from the window and the `html` element. This includes `scroll` and `resize` listeners and occasionally `touchstart` and `touchend` ones, too.

4. Terminates all temporary Web Workers.