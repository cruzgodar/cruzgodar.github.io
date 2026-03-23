
import { applet, canvasBundle } from "../index.js";

async function reset({ slide })
{
	slide.appendChild(canvasBundle);

	applet.run({
		expression: "(λx.xx)(λf.λx.fx)",
	});
}

export const diagramsBuilds =
{
	reset,
};