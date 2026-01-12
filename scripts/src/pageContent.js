import anime from "../anime.js";
import { cardAnimationTime } from "./animation.js";
import { convertHtmlToTex } from "./convertHtmlToTex.js";
import { addHoverEventWithScale } from "./hoverEvents.js";
import { $, $$, pageElement, pageUrl } from "./main.js";
import { siteSettings } from "./settings.js";
import { downloadString } from "./utils.js";

const contentsSelector = ".notes-title, .section-text, .heading-text";

let contentsContainerElement;
let contentsElement;
let indicatorElement;
let contentsShown = false;
let contentsAnimating = false;

export function initPageContents()
{
	const navButtonsElement = $(".nav-buttons");

	if (!navButtonsElement)
	{
		return;
	}

	prepareContents();

	if (window.DEBUG)
	{
		navButtonsElement.insertAdjacentHTML("afterend", /* html */`
			<div class="text-buttons nav-buttons contents-button-container" style="grid-template-columns: repeat(auto-fit, 88px);">
				<div class="focus-on-child" tabindex="1">
					<button class="text-button linked-text-button" type="button" tabindex="-1">Download Worksheet</button>
				</div>
			</div>
		`);
	}

	navButtonsElement.insertAdjacentHTML("afterend", /* html */`
		<div class="text-buttons nav-buttons contents-button-container" style="grid-template-columns: repeat(auto-fit, 88px);">
			<div class="focus-on-child" tabindex="1">
				<button class="text-button linked-text-button" type="button" tabindex="-1">Contents</button>
			</div>
		</div>
	`);

	navButtonsElement.classList.add("contents-container");

	setTimeout(() =>
	{
		const contentButtonElement = navButtonsElement.nextElementSibling.firstElementChild;

		addHoverEventWithScale({
			element: contentButtonElement,
			scale: 1.075,
			addBounceOnTouch: () => true
		});

		contentButtonElement.addEventListener("click", showContents);

		if (window.DEBUG)
		{
			const downloadTexButtonElement = navButtonsElement
				.nextElementSibling
				.nextElementSibling
				.firstElementChild;

			addHoverEventWithScale({
				element: downloadTexButtonElement,
				scale: 1.075,
				addBounceOnTouch: () => true
			});

			downloadTexButtonElement.addEventListener("click", downloadWorksheet);
		}
	});
}

function prepareContents()
{
	contentsContainerElement = document.createElement("div");
	contentsContainerElement.id = "contents-container";
	pageElement.appendChild(contentsContainerElement);

	contentsElement = document.createElement("div");
	contentsElement.id = "contents";
	contentsContainerElement.append(contentsElement);

	for (const element of $$(contentsSelector))
	{
		const clonedElement = element.cloneNode(true);

		if (clonedElement.classList.contains("heading-text"))
		{
			const index = clonedElement.textContent.indexOf(":");
			
			if (index !== -1)
			{
				clonedElement.textContent = clonedElement.textContent.slice(index + 2);
			}
		}

		contentsElement.appendChild(clonedElement);

		clonedElement.addEventListener("click", () =>
		{
			element.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

			if (window.innerWidth < 1000)
			{
				hideContents();
			}
		});

		addHoverEventWithScale({
			element: clonedElement,
			scale: 1.025,
			addBounceOnTouch: () => true
		});
	}

	contentsContainerElement.style.opacity = 0;
	contentsContainerElement.style.marginRight = siteSettings.reduceMotion ? 0 : "-32px";
	contentsContainerElement.style.display = "none";



	indicatorElement = document.createElement("img");
	indicatorElement.id = "contents-indicator";
	indicatorElement.src = "/graphics/general-icons/contents-indicator.png";
	pageElement.appendChild(indicatorElement);

	addHoverEventWithScale({
		element: indicatorElement,
		scale: 1.1,
	});

	indicatorElement.addEventListener("click", showContents);
}

async function showContents()
{
	if (contentsShown || contentsAnimating)
	{
		return;
	}

	contentsAnimating = true;
	contentsShown = true;

	contentsContainerElement.style.display = "flex";

	await Promise.all([
		anime({
			targets: contentsContainerElement,
			opacity: 1,
			marginRight: 0,
			duration: cardAnimationTime,
			easing: "easeOutQuint"
		}).finished,

		anime({
			targets: indicatorElement,
			opacity: 0,
			duration: cardAnimationTime,
			easing: "easeOutQuint"
		}).finished
	]);

	document.documentElement.addEventListener("click", handleClickEvent);
	contentsAnimating = false;
}

async function hideContents()
{
	if (!contentsShown || contentsAnimating)
	{
		return;
	}

	contentsAnimating = true;
	contentsShown = false;

	document.documentElement.removeEventListener("click", handleClickEvent);

	await Promise.all([
		anime({
			targets: contentsContainerElement,
			opacity: 0,
			marginRight: siteSettings.reduceMotion ? 0 : "-32px",
			duration: cardAnimationTime,
			easing: "easeOutQuint"
		}).finished,

		anime({
			targets: indicatorElement,
			opacity: 1,
			duration: cardAnimationTime,
			easing: "easeOutQuint"
		}).finished
	]);

	contentsContainerElement.style.display = "none";
	contentsAnimating = false;
}

function handleClickEvent(e)
{
	let element = e.target;
	while (element !== pageElement)
	{
		if (element === contentsElement)
		{
			return;
		}

		element = element.parentElement;
	}

	hideContents();
}



async function downloadWorksheet()
{
	const html = await fetch(`${pageUrl}/data.html`).then(r => r.text());

	// Get just the exercises.

	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");
	
	const elements = doc.querySelectorAll("div.notes-exc.notes-environment");
	
	const exerciseHtml = Array.from(elements).map(el =>
	{
		const innerHTML = el.innerHTML;
		const solutionIndex = innerHTML.indexOf("<div class=\"solution\">");

		return solutionIndex === -1 ? innerHTML : innerHTML.slice(0, solutionIndex);
	}).join("");

	let index = 0;

	const replacedTitles = exerciseHtml
		.replaceAll(
			/<div class="notes-exc-title notes-title">.*?<\/div>/g, () =>
			{
				index++;
				const beforeExercise = index % 2 === 0
					? "[VSPACE]\n"
					: index !== 1
						? "[PAGEBREAK]\n"
						: "";
				
				return `${beforeExercise}<strong>Exercise ${index}</strong>: `;
			}
		);

	const result = convertHtmlToTex({
		html: replacedTitles,
		course: "COURSE NAME",
		pageUrl,
		title: "Worksheet NUMBER",
		partnerField: true,
		margin: 0.75,
		pageNumbers: false
	});

	downloadString(result[0], "Worksheet.tex");
}