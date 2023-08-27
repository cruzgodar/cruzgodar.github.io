import { cardIsOpen } from "./cards.mjs";
import { pageElement } from "./main.mjs";
import anime from "/scripts/anime.js";

export function typesetMath()
{
	// eslint-disable-next-line no-undef
	return MathJax.typesetPromise();
}

export async function showTex(element)
{
	if (!cardIsOpen || element.getAttribute("data-showing-tex") === "1")
	{
		return;
	}

	element.setAttribute("data-showing-tex", "1");

	element.classList.remove("active");
	element.classList.remove("hover");

	await anime({
		targets: element,
		scale: 1,
		borderRadius: "0px",
		duration: 0,
	}).finished;



	const tex = element.getAttribute("data-source-tex").replaceAll(/\[NEWLINE\]/g, "\n").replaceAll(/\[TAB\]/g, "\t");



	const oldHeight = element.getBoundingClientRect().height;
	const oldWidth = element.getBoundingClientRect().width;
	element.style.minHeight = `${oldHeight}px`;

	const oldPadding = element.style.padding;


	const junkDrawer = document.createElement("div");
	junkDrawer.style.display = "none";
	pageElement.appendChild(junkDrawer);
	junkDrawer.appendChild(element.firstElementChild);



	let texElement = null;

	if (tex.indexOf("\n") !== -1)
	{
		texElement = document.createElement("textarea");
		texElement.textContent = tex;
		texElement.style.minHeight = `${oldHeight - 17}px`;
		texElement.style.width = "100%";
		texElement.style.marginLeft = "-6px";
		element.style.width = "75%";
	}

	else
	{
		texElement = document.createElement("input");
		texElement.setAttribute("type", "text");
		texElement.setAttribute("value", tex);
		texElement.style.height = `${oldHeight - 13}px`;
		texElement.style.width = `${oldWidth - 13}px`;
	}

	texElement.style.fontFamily = "'Source Code Pro', monospace";
	element.appendChild(texElement);

	element.style.padding = 0;

	texElement.select();
	setTimeout(() => texElement.select(), 50);
	setTimeout(() => texElement.select(), 250);

	texElement.onblur = () =>
	{
		texElement.remove();

		element.style.removeProperty("width");
		element.style.padding = oldPadding;
		element.appendChild(junkDrawer.firstElementChild);
		element.style.minHeight = "";
		junkDrawer.remove();

		element.setAttribute("data-showing-tex", "0");
		element.classList.add("active");
	};
}