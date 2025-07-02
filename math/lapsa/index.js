import { themeDemonstrationSlideBuilds } from "./builds/theme-demonstration.js";
import Lapsa from "/scripts/lapsa.js";


const options =
{
	shelfIconPaths: "/graphics/lapsa-icons/",
	
	builds:
	{
		"theme-demonstration": themeDemonstrationSlideBuilds
	},
};

new Lapsa(options);