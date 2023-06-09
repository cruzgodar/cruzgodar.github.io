"use strict";

!async function()
{
	await Site.loadApplet("binary-trees");
	
	const applet = new BinaryTree(Page.element.querySelector("#output-canvas"));
	
	
	
	const downloadButtonElement = Page.element.querySelector("#download-button");
	
	downloadButtonElement.addEventListener("click", () => applet.wilson.downloadFrame("a-binary-tree.png"));
	
	
	
	Page.show();
}()