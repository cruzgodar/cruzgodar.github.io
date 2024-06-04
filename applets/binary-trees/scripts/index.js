import { showPage } from "../../../scripts/src/loadPage.js";
import { BinaryTree } from "./class.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";

export default function()
{
	const applet = new BinaryTree({ canvas: $("#output-canvas") });

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-binary-tree.png"
	});

	showPage();
}