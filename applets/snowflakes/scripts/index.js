"use strict";

!async function()
{
	await Site.loadApplet("snowflakes");
	
	const applet = new Snowflake(Page.element.querySelector("#output-canvas"));
	
	
	
	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 500);
		const computationsPerFrame = parseInt(computationsPerFrameInputElement.value || 25);
		const rho = parseFloat(rhoInputElement.value || .45);
		const beta = parseFloat(betaInputElement.value || 1.3);
		const alpha = parseFloat(alphaInputElement.value || .4);
		const theta = parseFloat(thetaInputElement.value || .03);
		const kappa = parseFloat(kappaInputElement.value || .005);
		const mu = parseFloat(muInputElement.value || .0325);
		const gamma = parseFloat(gammaInputElement.value || .025);
		
		applet.run(resolution, computationsPerFrame, rho, beta, alpha, theta, kappa, mu, gamma);
	}
	
	
	
	const resolutionInputElement = Page.element.querySelector("#resolution-input");
	const computationsPerFrameInputElement = Page.element.querySelector("#computations-per-frame-input");
	const rhoInputElement = Page.element.querySelector("#rho-input");
	const betaInputElement = Page.element.querySelector("#beta-input");
	const alphaInputElement = Page.element.querySelector("#alpha-input");
	const thetaInputElement = Page.element.querySelector("#theta-input");
	const kappaInputElement = Page.element.querySelector("#kappa-input");
	const muInputElement = Page.element.querySelector("#mu-input");
	const gammaInputElement = Page.element.querySelector("#gamma-input");
	
	
	
	const randomizeParametersButtonElement = Page.element.querySelector("#randomize-parameters-button");

	randomizeParametersButtonElement.addEventListener("click", () =>
	{
		rhoInputElement.value = Math.round((.3 + (.6 - .3) * Math.random()) * 100000) / 100000;
		betaInputElement.value = Math.round((.9 + (1.7 - .9) * Math.random()) * 100000) / 100000;
		alphaInputElement.value = Math.round((.2 + (.6 - .2) * Math.random()) * 100000) / 100000;
		thetaInputElement.value = Math.round((.01 + (.05 - .01) * Math.random()) * 100000) / 100000;
		kappaInputElement.value = Math.round((0 + (.01 - 0) * Math.random()) * 100000) / 100000;
		muInputElement.value = Math.round((0 + (.065 - 0) * Math.random()) * 100000) / 100000;
		muInputElement.value = Math.round((0 + (.05 - 0) * Math.random()) * 100000) / 100000;
	});
	
	
	
	const generateButtonElement = Page.element.querySelector("#generate-button");
	
	generateButtonElement.addEventListener("click", run);
	
	
	
	const downloadButtonElement = Page.element.querySelector("#download-button");
	
	downloadButtonElement.addEventListener("click", () => applet.wilson.downloadFrame("a-gravner-griffeath-snowflake.png"));
	
	
	
	Page.show();
}()