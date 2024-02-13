import { showPage } from "../../../../scripts/src/loadPage.js";
import { Button } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { redirect } from "/scripts/src/navigation.js";

!function()
{
	new Button({
		element: $("#homepage-button"),
		name: "Homepage",
		onClick: () => redirect({ url: "/projects/wilson/" })
	});
	
	showPage();
}()