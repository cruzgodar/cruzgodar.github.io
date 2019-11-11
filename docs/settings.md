# Settings



The settings system allows users to customize the look and feel of the site. Some options are simply for personal preference, and others are accessibility features.

- Theme: light or dark. The dark theme uses a background of `rgb(24, 24, 24)` by default, since reading text on a pure back background can cause eye strain. If the theme isn't set when loading the site and the browser is using a system-wide dark theme, then the site's dark theme will automatically be applied.

- Dark theme color: dark gray or black. As mentioned before, a pure black background can cause eye strain, but some users prefer it.

- Contrast: normal or high. High contrast darkens text, borders, and graphics (or lightens them if the dark theme is active) to make them stand out more against the background.

- Text size: normal or large. Pretty self-explanatory — the large setting increases the text size by 2 pixels.

- Font: always sans serif or serif on writing. This switches the font from Rubik to Gentium Book Basic on pages whose `writing_page` setting is set to true.

- Text on writing pages: double-spaced or single-spaced and indented. Changes the spacing on writing pages from the typical web layout of double-spaced paragraphs to separate them from one another to the typical book layout of only indenting paragraphs instead.

- Comments: enabled or disabled. When disabled, Disqus will not load. It is *not* just hidden — it will not transmit any data at all, preserving privacy.

- Content animation: enabled or disabled. When disabled, the `data-aos` attribute will be removed from all elements with it, and AOS will be reloaded. The effect is that pages will appear completely loaded when they appear, rather than animating in the content as they go. In addition, `redirect()` will not animate at all, instead behaving like a regular website link.

- Banners: parallax or simple. Simple banners still display as a fullscreen image, but they move when scrolled, and `scroll_update` isn't used, inmproving performance. 