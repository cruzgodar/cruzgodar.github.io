import { BarnsleyFern } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/components/buttons.js";
import { TextBox } from "/scripts/components/textBoxes.js";
import { $ } from "/scripts/src/main.js";

export default function()
{
	const applet = new BarnsleyFern({ canvas: $("#output-canvas") });

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: () => "the-barnsley-fern.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 1500,
		maxValue: 4000,
		onEnter: run,
	});

	run();

	async function run()
	{
		await resolutionInput.loaded;
		
		applet.run({ resolution: resolutionInput.value });
	}
}