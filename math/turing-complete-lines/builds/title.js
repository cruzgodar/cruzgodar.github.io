
import { applet, canvasBundle } from "../index.js";

async function reset({ slide })
{
	slide.appendChild(canvasBundle);

	applet.run({
		expression: "(λx.xx)(λx.xx)",
		betaReduce: true
	});
}

export const titleBuilds =
{
	reset,
};