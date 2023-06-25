"use strict";

!async function()
{
	await Applet.load("binary-trees");
	
	const applet = new BinaryTree($("#output-canvas"));
	
	
	
	const downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () => applet.wilson.downloadFrame("a-binary-tree.png"));
	
	
	
	Page.show();
}()