# The Footer

---

## Overview

The purpose of the footer is to provide easy access to the main pages on the site without returning to the homepage. To that end, it's available nearly everywhere on the site, and it makes itself especially prominent at the bottom of pages.

---

## The regular footer

This implementation of the footer is simpler in almost every way. Using the page settings, it's dynamically inserted at the bottom of the body. When the user scrolls to within 5 pixels of the bottom, the footer animates into existence, giving links to all of the main pages on the site (unless the current page is one of those, in which case it's omitted). The footer also contains links to the settings and the progressive web app pages.

---

## The floating footer

Once the regular footer has been created, it's duplicated and modified to make the floating footer. This incarnation can be accessed from anywhere on the page by either hovering the mouse in the bottom 100 pixels of the screen or tapping there on a touchscreen device. Doing so will display a complete copy of the footer, and when the mouse leaves the footer or there's a tap somewhere else, the floating footer fades out. Everything to do with the floating footer has `position` set to `fixed` so that is follows the user around the page.

If the device isn't a touchscreen, two listeners are added to the 100-pixel-tall touch target: one for `mouseenter` and one for `mouseleave`. When the mouse enters and the floating footer isn't visible, *and* the regular footer isn't either, then the touch target gets its `display` property set to `none`, and the floating footer has the `display: none` property removed and its opacity subsequently animated in. When the mouse then leaves the footer (*not* the touch target), the reverse happens: the floating footer's opacity is animated out, its `display` is set to `none`, and finally, the touch target gets its `display` back.

The same procress happens with a touch screen, but now the listeners are applied to the entire page, and they measure the coordinates of where every touch occurs. `touchend` is used for triggering the footer, so that dragging from the bottom of the screen doesn't cause accidental triggers, and touchstart is used for hiding the footer, for a similar reason: dragging downward shouldn't accidentally keep the footer visible.

Finally, a `scroll` handler is added so that when the regular footer is shown, the floating footer automatically hides, and vice versa.