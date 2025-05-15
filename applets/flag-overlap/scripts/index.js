import { showPage } from "../../../scripts/src/loadPage.js";
import { FlagOverlap } from "./class.js";
import { $ } from "/scripts/src/main.js";

export default function()
{
	const applet = new FlagOverlap({ canvas: $("#output-canvas") });

	applet.showFlag("md");

	showPage();
}