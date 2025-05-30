import { FlagOverlap } from "./class.js";
import { Button } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { $, $$ } from "/scripts/src/main.js";

export default async function()
{
	const applet = new FlagOverlap({
		canvas: $("#output-canvas"),
		overlayCanvas: $("#overlay-canvas"),
		guessCanvases: Array.from($$(".guess-canvas")),
		overlayCanvases: Array.from($$(".overlay-canvas")),
		progressBars: Array.from($$(".progress-bar")),
		winOverlay: $("#win-overlay")
	});

	const showDiffsCheckbox = new Checkbox({
		element: $("#show-diffs-checkbox"),
		name: "Show guess overlaps",
		onInput: onCheckboxInput,
		checked: true,
		persistState: false
	});

	const replayButton = new Button({
		element: $("#replay-button"),
		name: "Play Again",
		onClick: () => applet.replay()
	});

	await applet.loadPromise;

	setTimeout(() => applet.guessFlag("sc"), 1000);
	setTimeout(() => applet.guessFlag("us"), 6000);

	function onCheckboxInput()
	{
		applet.setShowDiffs(showDiffsCheckbox.checked);
	}
}