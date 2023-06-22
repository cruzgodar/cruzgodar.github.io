!function()
{
	let collectorButtonElement = $("#collector-button");
	let glslTestsButtonElement = $("#glsl-tests-button");
	let jsLinesButtonElement = $("#js-lines-button");
	
	collectorButtonElement.addEventListener("click", () => Page.Navigation.redirect("/debug/collector/"));
	glslTestsButtonElement.addEventListener("click", () => Page.Navigation.redirect("/debug/tests/glsl-test/"));
	jsLinesButtonElement.addEventListener("click", () => Page.Navigation.redirect("/debug/js-lines/"));
	
	Page.show();
}()