!function()
{
	let collectorButtonElement = $("#collector-button");
	let glslTestsButtonElement = $("#glsl-tests-button");
	let jsLinesButtonElement = $("#js-lines-button");
	
	collectorButtonElement.addEventListener("click", () => redirect({ url: "/debug/collector/" }));
	glslTestsButtonElement.addEventListener("click", () => redirect({ url: "/debug/tests/glsl-test/" } ));
	jsLinesButtonElement.addEventListener("click", () => redirect({ url: "/debug/js-lines/" }));
	
	Page.show();
}()