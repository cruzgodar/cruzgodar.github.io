import { animationBuilds } from "./builds/animation.js";
import { grandmasRecipeBuilds } from "./builds/grandmasRecipe.js";
import { rileysRecipeBuilds } from "./builds/rileysRecipe.js";
import { specialRecipeBuilds } from "./builds/specialRecipe.js";
import { titleBuilds } from "./builds/title.js";
import { untamedBuilds } from "./builds/untamed.js";
import { QuasiFuchsianGroups } from "/applets/quasi-fuchsian-groups/scripts/class.js";
import Lapsa from "/scripts/lapsa.js";

export const applet = new QuasiFuchsianGroups({
	canvas: document.body.querySelector("#output-canvas")
});

export const canvasBundle = document.body.querySelector("#canvas-bundle");

setTimeout(() =>
{
	document.body.querySelectorAll(".wilson-draggable")
		.forEach(element => element.classList.add("lapsa-interactable"));
}, 500);



const options =
{
	shelfIconPaths: "/graphics/lapsa-icons/",

	builds:
	{
		"title": titleBuilds,
		"untamed": untamedBuilds,
		"grandmas-recipe": grandmasRecipeBuilds,
		"rileys-recipe": rileysRecipeBuilds,
		"special-recipe": specialRecipeBuilds,
		"animation": animationBuilds
	}
};

new Lapsa(options);