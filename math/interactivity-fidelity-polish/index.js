import { accessibilityBuilds } from "./builds/accessibility.js";
import { addingSoundBuilds } from "./builds/addingSound.js";
import { animationEducationBuilds } from "./builds/animationEducation.js";
import { animationFlairBuilds } from "./builds/animationFlair.js";
import { animationSubstanceBuilds } from "./builds/animationSubstance.js";
import { barrierToEntryBuilds } from "./builds/barrierToEntry.js";
import { beautyBuilds } from "./builds/beauty.js";
import { clarityBuilds } from "./builds/clarity.js";
import { designingAroundSoundBuilds } from "./builds/designingAroundSound.js";
import { expandabilityBuilds } from "./builds/expandability.js";
import { fidelityBuilds } from "./builds/fidelity.js";
import { interactivityBuilds } from "./builds/interactivity.js";
import { palettesBuilds } from "./builds/palettes.js";
import { parallelizationBuilds } from "./builds/parallelization.js";
import { performanceCompromisesBuilds } from "./builds/performanceCompromises.js";
import { threeDScenesBuilds } from "./builds/threeDScenes.js";
import { titleBuilds } from "./builds/title.js";
import { webAssemblyBuilds } from "./builds/webAssembly.js";
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
		fidelity: fidelityBuilds,
		parallelization: parallelizationBuilds,
		webAssembly: webAssemblyBuilds,
		performanceCompromises: performanceCompromisesBuilds,
		expandability: expandabilityBuilds,
		interactivity: interactivityBuilds,
		clarity: clarityBuilds,
		animationEducation: animationEducationBuilds,
		animationSubstance: animationSubstanceBuilds,
		animationFlair: animationFlairBuilds,
		accessibility: accessibilityBuilds,
		threeDScenes: threeDScenesBuilds,
		barrierToEntry: barrierToEntryBuilds,
		beauty: beautyBuilds,
		palettes: palettesBuilds,
		addingSound: addingSoundBuilds,
		designingAroundSound: designingAroundSoundBuilds,
	}
};

new Lapsa(options);