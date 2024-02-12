import { showPage } from "../../../scripts/src/loadPage.js";
!async function()
{
	const response = await fetch("/debug/glsl-docs/src.html");
	
	const data = await response.text();
	
	const html = Page.Components.decode(data);
	
	const index1 = html.indexOf(`<div id="glsl-docs-card" class="card">`);
	const index2 = html.lastIndexOf("</div>");
	
	console.log(html.slice(index1, index2 + 6));
	
	showPage();
}()