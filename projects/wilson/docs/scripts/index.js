import { showPage } from "/scripts/src/load-page.mjs";
import { $ } from "/scripts/src/main.mjs";

!function()
{
	$("#homepage-button").addEventListener("click", () =>
	{
		Page.Navigation.redirect("/projects/wilson/");
	});
	
	showPage();
}()