import { BinaryTree } from "./class.js";
import { showPage } from "/scripts/src/load-page.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new BinaryTree({ canvas: $("#output-canvas") });



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener(
		"click",
		() => applet.wilson.downloadFrame("a-binary-tree.png")
	);



	showPage();
}