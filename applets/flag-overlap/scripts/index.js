import { showPage } from "../../../scripts/src/loadPage.js";
import { FlagOverlap } from "./class.js";
import { $ } from "/scripts/src/main.js";

export default async function()
{
	const applet = new FlagOverlap({ canvas: $("#output-canvas") });
	await applet.loadPromise;

	applet.guessFlag("us");

	showPage();
}