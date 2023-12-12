import { parseText } from "./text.mjs";

export function carousel(options, lines)
{
	const htmlLines = lines.map(line =>
	{
		const paragraphs = line.split("\\n");

		const parsedParagraphs = paragraphs.map(
			paragraph => parseText(paragraph)
		);

		return "<p class=\"body-text\">"
			+ parsedParagraphs.join("</p><p class=\"body-text\">")
			+ "</p>";
	});

	return `
		<div class="carousel">
			<div class="carousel-content">
				${htmlLines.map(line => `<div class="carousel-entry">${line}</div>`).join("")}
			</div>

			<div class="carousel-dots">
				${"<div class=\"carousel-dot\"><div class=\"fill\"></div></div>".repeat(lines.length)}
			</div>
		</div>
	`;
}