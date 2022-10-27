!function()
{
	let collector_button_element = Page.element.querySelector("#collector-button");
	let glsl_tests_button_element = Page.element.querySelector("#glsl-tests-button");
	let js_lines_button_element = Page.element.querySelector("#js-lines-button");
	
	collector_button_element.addEventListener("click", () => Page.Navigation.redirect("/debug/collector/"));
	glsl_tests_button_element.addEventListener("click", () => Page.Navigation.redirect("/debug/tests/glsl-test/"));
	js_lines_button_element.addEventListener("click", () => Page.Navigation.redirect("/debug/js-lines/"));
	
	Page.show();
}()