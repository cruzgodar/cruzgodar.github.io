import { BinaryTrees } from "./class.js";
import { DownloadButton } from "/scripts/components/buttons.js";
import { $ } from "/scripts/src/main.js";

export default function()
{
	const applet = new BinaryTrees({ canvas: $("#output-canvas") });

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: () => "a-binary-tree.png"
	});
}