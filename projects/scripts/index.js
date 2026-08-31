import { Button } from "/scripts/components/buttons.js";
import { $ } from "/scripts/src/main.js";
import { redirect } from "/scripts/src/navigation.js";

export default function()
{
	new Button({
		element: $("#wilson-button"),
		name: "Get Started",
		linked: false,
		onClick: () => redirect({
			url: "https://github.com/cruzgodar/wilson",
			inNewTab: true
		}),
	});

	new Button({
		element: $("#kestrel-button"),
		name: "Download Kestrel",
		linked: false,
		onClick: () => redirect({
			url: "https://apps.apple.com/us/app/kestrel-background-bird-id/id6787208717",
			inNewTab: true
		}),
	});

	new Button({
		element: $("#motion-smoothing-button"),
		name: "Watch the Video",
		linked: false,
		onClick: () => redirect({
			url: "https://www.youtube.com/watch?v=VOn4d2gQaKg",
			inNewTab: true
		}),
	});

	new Button({
		element: $("#lapsa-button"),
		name: "Open the Demo",
		linked: false,
		onClick: () => redirect({
			url: "/projects/lapsa",
			inNewTab: true
		}),
	});
}