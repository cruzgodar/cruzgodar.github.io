import { BinaryTree } from "./class.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $ } from "/scripts/src/main.mjs";

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