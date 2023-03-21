"use strict";

!async function()
{
	await Site.load_applet("binary-trees");
	
	const applet = new BinaryTree(Page.element.querySelector("#output-canvas"));
	
	
	
	const download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () => applet.wilson.download_frame("a-binary-tree.png"));
	
	
	
	Page.show();
}()