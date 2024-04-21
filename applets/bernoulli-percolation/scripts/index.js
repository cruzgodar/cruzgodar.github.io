import { showPage } from "../../../scripts/src/loadPage.js";
import { BernoulliPercolation } from "./class.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new BernoulliPercolation({ canvas: $("#output-canvas") });

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "an-abelian-sandpile.png"
	});

	showPage();
}