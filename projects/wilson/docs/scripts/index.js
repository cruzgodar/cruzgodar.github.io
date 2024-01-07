import { showPage } from "/scripts/src/load-page.js";
import { $ } from "/scripts/src/main.js";
import { redirect } from "/scripts/src/navigation.js";

!function()
{
	$("#homepage-button").addEventListener("click", () =>
	{
		redirect({ url: "/projects/wilson/" });
	});
	
	showPage();
}()