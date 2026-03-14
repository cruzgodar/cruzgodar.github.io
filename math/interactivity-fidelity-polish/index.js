import { titleBuilds } from "./builds/title.js";
import Lapsa from "/scripts/lapsa.js";

function setup()
{
	for (const element of document.body.querySelectorAll(".WILSON_draggables-container"))
	{
		element.classList.add("lapsa-interactable");
	}
}

const options =
{
	shelfIconPaths: "/graphics/lapsa-icons/",

	setupBuild: setup,

	builds:
	{
		title: titleBuilds,
	}
};

new Lapsa(options);