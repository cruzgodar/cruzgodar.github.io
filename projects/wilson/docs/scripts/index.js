import { showPage } from "/scripts/src/load-page.mjs";
import { $ } from "/scripts/src/main.mjs";
import { redirect } from "/scripts/src/navigation.mjs";

!function()
{
	$("#homepage-button").addEventListener("click", () =>
	{
		redirect({ url: "/projects/wilson/" });
	});
	
	showPage();
}()