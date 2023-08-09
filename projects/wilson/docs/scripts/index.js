import { showPage } from "/scripts/src/load-page.mjs"
!function()
{
	$("#homepage-button").addEventListener("click", () =>
	{
		Page.Navigation.redirect("/projects/wilson/");
	});
	
	showPage();
}()