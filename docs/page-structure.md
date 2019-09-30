# Page Structure



## The HTML

Every page folder must have an HTML file that contains what will be in the body when the page is loaded. This HTML must include a short script that looks like the following:

```js
if (typeof current_url == "undefined")
{
	window.location.replace("/index.html?page=" + encodeURIComponent(window.location.pathname));
}



page_settings = 
{
	"title": "",
	
	"banner_page": false,
	"writing_page": false,
	"math_page": false,
	"comments": false,
	
	"small_margins_on_ultrawide": false,
	
	"manual_banner": false,
	"manual_dark_theme": false,
	
	"no_footer": false,
	"footer_exclusion": ""
};

on_page_load();
```

The `if` statement makes every page function as an entry point (see [the doc on navigation](https://github.com/90259025/90259025.github.io/blob/master/docs/navigation.md)), since `current_url` will only be defined if `main.js` has been loaded. The call to `on_page_load()` triggers a large amount of functions, and is also covered in [the navigation doc](https://github.com/90259025/90259025.github.io/blob/master/docs/navigation.md). The block in the middle sets the page settings, which tell the JS how to properly render the page. Every field is required an every page.

- `title`: the title of the page. In particular, sets the text that appears on the tab in the browser.

- `banner_page`: whether or not the page has a banner. Covered in more detail later in this doc.

- `writing_page`: two settings affect the font, spacing, and indentation on writing pages only. This is how those pages are identifed.

- `math_page`: whether MathJax appears on the page and needs to be typeset.

- `comments`: whether Disqus comments appear at the bottom of the page and need to be loaded.

- `small_margins_on_ultrawide`: whether the width of text should be reduced from 70% to 50% when the layout is in ultrawide mode.

- `manual_banner`: if the page wants `banners.js` loaded, but it doesn't want `scroll_update()` to be run. This currently isn't used by any page.

- `manual_dark_theme`: if the page is complicated enough that adding the dark theme styles will break it beyond repair. If this is true, the page must handle dark theme (and contrast) on its own.

- `no_footer`: if the footer shouldn't spawn. Used on pages like settings.

- `footer_exclusion`: if the footer is present, which page shouldn't be present. The typical value is the current page if it's first level (writing, teaching, etc.), and nothing for any other pages.



## Images on the page

Directly setting the `src` attribute of an `img` tag or the `background-image` property of anything is only appropriate in extremely rare circumstances. When an image is present, its `src` should be left empty and it should have an `id` of `image-<image-name>`, where `<image-name>` is descriptive and (obviously) not used by any other image on the page. It also must have a class of `check-webp`. To load the images, every page must include a file called `images.json`, even if that file is effectively empty. `images.json` contains keys named `image-<image-name>`, and the corresponding value is another object that contains the keys `webp` and `non-webp` and matches them with urls where the images can be found. These urls can *not* be absolute — they must either be relative, in which case `images.js` will handle finding the absolute url, or link to another site for external storage (typically Google Drive).

For example, if `/writing/writing.html` contains an image with an `id` of `image-corona`, then the file `/writing/images.json` will include

```json
"image-corona":
{
	"webp": "corona/cover.webp",
	"non-webp": "corona/cover.jpg"
}
```



## Banners

Pages can optionally include banners like the homepage's. This displays a fullscreen image at the top of the page which stays fixed as the user scrolls and slowly fades out as the content comes into view. To have a banner, a page must do a few things:

- `banner_page` must be set to `true` in the page settings.

- The page's url must be added to `banner_pages`, which is defined in `main.js`. To understand why this is required, see [the doc on navigation](https://github.com/90259025/90259025.github.io/blob/master/docs/navigation.md).

- A folder named `banners` must be present in the page folder, and it must contain four files: two 1920x1440 files named `landscape.webp` and `landscape.jpg`, and two 900x1440 files named `portrait.webp` and `portrait.jpg`. The content of all four files should match, and the quality of each image should be the standard 85%.

- Finally, the HTML file must include the following code immediately after the `noscript` tag:

```html
<div id="banner"></div>

<div id="opacity-cover"></div>

<div id="banner-cover"></div>

<div id="content">
	<div id="scroll-to"></div>
	
	<!-- All of the normal page content -->
</div
```

Note that this means most of the entire page is wrapped in the `content` tag. If all of these conditions are met, then `banners.js` will take care of the rest.



## Cover images

If one page is a subpage of another, it almost always needs a cover image. These are the rounded-corner image links that are all over the site. Two need to be present in the page folder: one named `cover.webp` and another named `cover.jpg`. Both should be 500x500 and 85% quality, unless that quality setting noticibly detracts from the image, like in the Julia set explorer's cover. In this case, the image can be made lossless.



## Custom scripts and styles

To load custom JS or CSS on a page, a page must have folders called `scripts` and `style` in the page folder. Each must contain two files: one nonminified file and one minified one, both named the same as the HTML file, just with a different ending. For example, if the HTML file is `/writing/corona/corona.html`, then the script files should be `/writing/corona/scripts/corona.js` and `/writing/corona/scripts/corona.min.js`.

Custom CSS files are loaded at the *beginning* of the head, which means they have the lowest priority of any CSS, including the base bundle. If the custom CSS intends to override something from that bundle, it must flag that property with `!important`.

Custom JS files should not create any global variables or redefine any functions. To make this easier, every custom JS file must be wrapped in the following code:

```js
!function()
{
	//The code goes here
}()
```

This ensures that any variables defined with the `let` keyword (which should be all of them) can be redefined the next time the page is loaded, and similarly for functions.



## Subpages

Finally, and most simply, subpages are just page folders inside other page folders. For example, the Corona page is a subpage of the writing page, so the `corona` folder is located at `/writing/corona/`.