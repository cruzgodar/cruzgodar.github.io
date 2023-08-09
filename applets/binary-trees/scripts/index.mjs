import { showPage } from "/scripts/src/load-page.mjs"
import { BinaryTree } from "./class.mjs";

export function load()
{
	const applet = new BinaryTree($("#output-canvas"));
	
	
	
	const downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () => applet.wilson.downloadFrame("a-binary-tree.png"));
	
	
	
	showPage();
}