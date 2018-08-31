=== Gutenberg ===
Contributors: matveb, joen, karmatosed
Requires at least: 4.9.8
Tested up to: 4.9
Stable tag: 3.6.2
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

A new editing experience for WordPress is in the works, with the goal of making it easier than ever to make your words, pictures, and layout look just right. This is the beta plugin for the project.

== Description ==

Gutenberg is more than an editor. While the editor is the focus right now, the project will ultimately impact the entire publishing experience including customization (the next focus area).

<a href="https://wordpress.org/gutenberg">Discover more about the project</a>.

= Editing focus =

> The editor will create a new page- and post-building experience that makes writing rich posts effortless, and has “blocks” to make it easy what today might take shortcodes, custom HTML, or “mystery meat” embed discovery. — Matt Mullenweg

One thing that sets WordPress apart from other systems is that it allows you to create as rich a post layout as you can imagine -- but only if you know HTML and CSS and build your own custom theme. By thinking of the editor as a tool to let you write rich posts and create beautiful layouts, we can transform WordPress into something users _love_ WordPress, as opposed something they pick it because it's what everyone else uses.

Gutenberg looks at the editor as more than a content field, revisiting a layout that has been largely unchanged for almost a decade.This allows us to holistically design a modern editing experience and build a foundation for things to come.

Here's why we're looking at the whole editing screen, as opposed to just the content field:

1. The block unifies multiple interfaces. If we add that on top of the existing interface, it would _add_ complexity, as opposed to remove it.
2. By revisiting the interface, we can modernize the writing, editing, and publishing experience, with usability and simplicity in mind, benefitting both new and casual users.
3. When singular block interface takes center stage, it demonstrates a clear path forward for developers to create premium blocks, superior to both shortcodes and widgets.
4. Considering the whole interface lays a solid foundation for the next focus, full site customization.
5. Looking at the full editor screen also gives us the opportunity to drastically modernize the foundation, and take steps towards a more fluid and JavaScript powered future that fully leverages the WordPress REST API.

= Blocks =

Blocks are the unifying evolution of what is now covered, in different ways, by shortcodes, embeds, widgets, post formats, custom post types, theme options, meta-boxes, and other formatting elements. They embrace the breadth of functionality WordPress is capable of, with the clarity of a consistent user experience.

Imagine a custom “employee” block that a client can drag to an About page to automatically display a picture, name, and bio. A whole universe of plugins that all extend WordPress in the same way. Simplified menus and widgets. Users who can instantly understand and use WordPress  -- and 90% of plugins. This will allow you to easily compose beautiful posts like <a href="http://moc.co/sandbox/example-post/">this example</a>.

Check out the <a href="https://wordpress.org/gutenberg/handbook/reference/faq/">FAQ</a> for answers to the most common questions about the project.

= Compatibility =

Posts are backwards compatible, and shortcodes will still work. We are continuously exploring how highly-tailored metaboxes can be accommodated, and are looking at solutions ranging from a plugin to disable Gutenberg to automatically detecting whether to load Gutenberg or not. While we want to make sure the new editing experience from writing to publishing is user-friendly, we’re committed to finding  a good solution for highly-tailored existing sites.

= The stages of Gutenberg =

Gutenberg has three planned stages. The first, aimed for inclusion in WordPress 5.0, focuses on the post editing experience and the implementation of blocks. This initial phase focuses on a content-first approach. The use of blocks, as detailed above, allows you to focus on how your content will look without the distraction of other configuration options. This ultimately will help all users present their content in a way that is engaging, direct, and visual.

These foundational elements will pave the way for stages two and three, planned for the next year, to go beyond the post into page templates and ultimately, full site customization.

Gutenberg is a big change, and there will be ways to ensure that existing functionality (like shortcodes and meta-boxes) continue to work while allowing developers the time and paths to transition effectively. Ultimately, it will open new opportunities for plugin and theme developers to better serve users through a more engaging and visual experience that takes advantage of a toolset supported by core.

= Contributors =

Gutenberg is built by many contributors and volunteers. Please see the full list in <a href="https://github.com/WordPress/gutenberg/blob/master/CONTRIBUTORS.md">CONTRIBUTORS.md</a>.

== Frequently Asked Questions ==

= How can I send feedback or get help with a bug? =

We'd love to hear your bug reports, feature suggestions and any other feedback! Please head over to <a href="https://github.com/WordPress/gutenberg/issues">the GitHub issues page</a> to search for existing issues or open a new one. While we'll try to triage issues reported here on the plugin forum, you'll get a faster response (and reduce duplication of effort) by keeping everything centralized in the GitHub repository.

= How can I contribute? =

We’re calling this editor project "Gutenberg" because it's a big undertaking. We are working on it every day in GitHub, and we'd love your help building it.You’re also welcome to give feedback, the easiest is to join us in <a href="https://make.wordpress.org/chat/">our Slack channel</a>, `#core-editor`.

See also <a href="https://github.com/WordPress/gutenberg/blob/master/CONTRIBUTING.md">CONTRIBUTING.md</a>.

= Where can I read more about Gutenberg? =

- <a href="http://matiasventura.com/post/gutenberg-or-the-ship-of-theseus/">Gutenberg, or the Ship of Theseus</a>, with examples of what Gutenberg might do in the future
- <a href="https://make.wordpress.org/core/2017/01/17/editor-technical-overview/">Editor Technical Overview</a>
- <a href="https://wordpress.org/gutenberg/handbook/reference/design-principles/">Design Principles and block design best practices</a>
- <a href="https://github.com/Automattic/wp-post-grammar">WP Post Grammar Parser</a>
- <a href="https://make.wordpress.org/core/tag/gutenberg/">Development updates on make.wordpress.org</a>
- <a href="https://wordpress.org/gutenberg/handbook/">Documentation: Creating Blocks, Reference, and Guidelines</a>
- <a href="https://wordpress.org/gutenberg/handbook/reference/faq/">Additional frequently asked questions</a>


== Changelog ==

= Latest =

* New “Spotlight Mode” that focuses on a single block at a time and an updated “Unified Toolbar” design. Both can be combined.
* Refactor to how image floats are handled.
* Improve visual clarity of block switcher menu.
* Add a delay to the block type label when hovering.
* Allow converting a multiline-paragraph into a list with corresponding items.
* Position caret at end of previous block for any type of block removal.
* Automatically create an Audio block when drag-and-dropping an audio file.
* Update icons used for Paragraph, Heading, and Subheading blocks for added clarity.
* Adhere to OS guidelines when showing keyboard shortcuts (icons for Mac).
* Improve link insertion by continuing to show highlighted text when URL input is toggled.
* Automatically create a link when selected text is a URL.
* Expand on capabilities of invalid block actions by adding an ellipsis menu and an option to convert to classic block.
* Ignore leading slash when searching blocks in the inserter.
* Pass the title attribute when uploading an image.
* Allow blocks which support alignments to have a default option.
* Add poster image support for Video Block.
* Add support for preload attribute in Video Block.
* Add description for Reusable Blocks, show in the inspector.
* Update Heading Block description for clarity.
* Small design update to the editor fixed toolbar.
* Improve visual display of post visibility settings.
* Apply enhancements to the coloring mechanism and the exposed components (withColors).
* Only show transforms for blocks that can be inserted on the root block. Also orders them by frequency / use.
* Remove margin-bottom from the last element on panel body.
* Store and restore the global post object around dynamic block callbacks to allow for loops.
* Move first editor tip about inserter to the toolbar.
* Use double quotes in all NUX tips.
* Use sentence case for text in Tooltips.
* Only request embed preview if there is a URL.
* Change keyboard shortcut for remove block to Cmd+Shift+X / Ctrl+Shift+X.
* Reset value of RangeControl when setting it to empty.
* Add Text Columns → Columns transform.
* Add Code → Preformatted transform.
* Add “blockquote” as a keyword for the Quote block.
* Clear the floating element for clearing color values. Update the appearance so that it’s consistent with other button settings.
* Rewrite Table Block to use a simpler RichText value.
* Add RichText.isEmpty API.
* Allow disabling Google Fonts URL by translators.
* Refactor post format block implementation to assign as template setting.
* Improve settings consistency of blocks under widget category.
* Fix issue where pasting malformed HTML into a block the HTML tokenizer could break by wrapping it with an exception handler.
* Restore option to add links within a Verse Block.
* Fix excess whitespace in block style class name.
* Fix issue where hit-area for the inserter between blocks was not perfectly centered.
* Fix incorrect example code for withSelect higher-order component.
* Fix flex-box issue on IE11 for keyboard shortcuts help panel.
* Fix lint issues found in block-serialization-spec-parser packages.
* Fix malformed SVGs for Facebook.
* Fix small alignment issue with the inserter arrow.
* Fix issue with recent blocks showing on mobile.
* Fix another issue with page publishing.
* Fix issue with string that was not showing up for translation.
* Fix left margin of Archives Block.
* Fix styling issue with block inserter.
* Fix regression with missing SVG roles and attributes.
* Fix script registration of TinyMCE to account for compression.
* Fix embed block pattern mismatch.
* Fix issue with tooltips not being shown on IconButtons with DotTip children.
* Fix some regressions with Table Block and make sure it behaves responsibly.
* Fix regression with textbox spacing and a focus issue.
* Resolve an issue where removing all blocks from a post with a template assigned would reintroduce the template blocks after saving and reloading the editor.
* Switch order of operations so that post content is parsed first regardless of the presence of a template.
* Add doAction when a deprecated feature is encountered.
* Deprecate Subheading block.
* Change title and description of Text Columns to include deprecation notice.
* Remove extra classNames from integration test.
* Make sure property for gallery=multiple is only set when type of media is image.
* Avoid changing the public API of the warning component to avoid potential backwards compatibility issues.
* Check for window in data registry.
* Update FocusableIframe component URL example.
* Drop explicit window reference from withSafeTimeout in compose.
* Prevent case where early editor checks might bail out preventing hidden meta-boxes from being actually hidden.
* Use “post” instead of “page” in the warning when the post contains blocks.
* Make alt text for image in example post translatable.
* Remove TinyMCE paste plugin as it’s absorbed in raw handling modules.
* Extract LinkContainer from FormatToolbar.
* Document how to add block style variations.
* Add mention of Material Design icons to the design docs.
* Update documentation for block controls.
* Extend guidelines for managing packages and publishing them to npm.
* Update contributing guidelines to include local wp dev instructions.
* Update FAQ doc with info about keyboard shortcuts.
* Update package-lock.json to expected values.
* Deprecate onSetup and getSettings as unstable APIs from RichText.
* Some general updates to handbook documents.
* Add documentation about floats.
* Add e2e test for font size mechanism.
* Make usage of core-data explicit.
* Create new spec-parser package.
* Restores the test URL we should be using for e2e tests.
* Upgrade WP Coding Standards to 1.0.0.
* Update npm-package-json-lint lock to 3.3.1.
* Update stylelint to 9.5.0 and stylelint-config-wordpress to 13.1.0.
* Update lint-staged and docs/manifest.js.
* Mobile Native
* - Initial implementation of Toolbar.
* - Add basic text toolbar actions.
* - Update on the event interface for contentSizeChange on Aztec component.
* - Fix toolbar status when pressing buttons on Android (and iOS).
