!function()
{
	let collectorButtonElement = Page.element.querySelector("#collector-button");
	let glslTestsButtonElement = Page.element.querySelector("#glsl-tests-button");
	let jsLinesButtonElement = Page.element.querySelector("#js-lines-button");
	
	collectorButtonElement.addEventListener("click", () => Page.Navigation.redirect("/debug/collector/"));
	glslTestsButtonElement.addEventListener("click", () => Page.Navigation.redirect("/debug/tests/glsl-test/"));
	jsLinesButtonElement.addEventListener("click", () => Page.Navigation.redirect("/debug/js-lines/"));
	
	Page.show();
}()