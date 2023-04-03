"use strict";

!async function()
{
	await Site.load_applet("snowflakes");
	
	const applet = new Snowflake(Page.element.querySelector("#output-canvas"));
	
	
	
	function run()
	{
		const resolution = parseInt(resolution_input_element.value || 500);
		const computations_per_frame = parseInt(computations_per_frame_input_element.value || 25);
		const rho = parseFloat(rho_input_element.value || .45);
		const beta = parseFloat(beta_input_element.value || 1.3);
		const alpha = parseFloat(alpha_input_element.value || .4);
		const theta = parseFloat(theta_input_element.value || .03);
		const kappa = parseFloat(kappa_input_element.value || .005);
		const mu = parseFloat(mu_input_element.value || .0325);
		const gamma = parseFloat(gamma_input_element.value || .025);
		
		applet.run(resolution, computations_per_frame, rho, beta, alpha, theta, kappa, mu, gamma);
	}
	
	
	
	const resolution_input_element = Page.element.querySelector("#resolution-input");
	const computations_per_frame_input_element = Page.element.querySelector("#computations-per-frame-input");
	const rho_input_element = Page.element.querySelector("#rho-input");
	const beta_input_element = Page.element.querySelector("#beta-input");
	const alpha_input_element = Page.element.querySelector("#alpha-input");
	const theta_input_element = Page.element.querySelector("#theta-input");
	const kappa_input_element = Page.element.querySelector("#kappa-input");
	const mu_input_element = Page.element.querySelector("#mu-input");
	const gamma_input_element = Page.element.querySelector("#gamma-input");
	
	
	
	const randomize_parameters_button_element = Page.element.querySelector("#randomize-parameters-button");

	randomize_parameters_button_element.addEventListener("click", () =>
	{
		rho_input_element.value = Math.round((.3 + (.6 - .3) * Math.random()) * 100000) / 100000;
		beta_input_element.value = Math.round((.9 + (1.7 - .9) * Math.random()) * 100000) / 100000;
		alpha_input_element.value = Math.round((.2 + (.6 - .2) * Math.random()) * 100000) / 100000;
		theta_input_element.value = Math.round((.01 + (.05 - .01) * Math.random()) * 100000) / 100000;
		kappa_input_element.value = Math.round((0 + (.01 - 0) * Math.random()) * 100000) / 100000;
		mu_input_element.value = Math.round((0 + (.065 - 0) * Math.random()) * 100000) / 100000;
		mu_input_element.value = Math.round((0 + (.05 - 0) * Math.random()) * 100000) / 100000;
	});
	
	
	
	const generate_button_element = Page.element.querySelector("#generate-button");
	
	generate_button_element.addEventListener("click", run);
	
	
	
	const download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () => applet.wilson.download_frame("a-gravner-griffeath-snowflake.png"));
	
	
	
	Page.show();
}()