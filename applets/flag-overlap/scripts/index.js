import { showPage } from "../../../scripts/src/loadPage.js";
import { FlagOverlap } from "./class.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { $, $$ } from "/scripts/src/main.js";

export default async function()
{
	const applet = new FlagOverlap({
		canvas: $("#output-canvas"),
		guessCanvases: Array.from($$(".guess-canvas")),
		overlayCanvases: Array.from($$(".overlay-canvas"))
	});

	const showDiffsCheckbox = new Checkbox({
		element: $("#show-diffs-checkbox"),
		name: "Show guess overlaps",
		onInput: onCheckboxInput,
		checked: true,
		persistState: false
	});

	await applet.loadPromise;

	setTimeout(() => applet.guessFlag("us"), 1000);

	showPage();

	function onCheckboxInput()
	{
		applet.setShowDiffs(showDiffsCheckbox.checked);
	}
}