import { parseText } from "./text.js";

export const notesEnvironmentNames =
{
	ex: "Example",
	exc: "Exercise",
	def: "Definition",
	prop: "Proposition",
	thm: "Theorem",
	lem: "Lemma",
	cor: "Corollary",
	pf: "Proof",
	ax: "Axiom",
	as: "Aside"
};

// Options:
// -m: Manual title. Will not prefix with e.g. Theorem: .
export function notesEnvironment(options, id, name)
{
	if (name)
	{
		name = parseText(name);

		//These two avoid awkward things like Theorem: The Fundamental Theorem.
		if (options.includes("m"))
		{
			return `<div class="notes-${id} notes-environment"><p class="body-text"</p><span class="notes-${id}-title">${name}</span></p>`;
		}

		else if (
			name.toLowerCase().includes(notesEnvironmentNames[id].toLowerCase())
		)
		{
			return `<div class="notes-${id} notes-environment"><p class="body-text"</p><span class="notes-${id}-title">${name}</span></p>`;
		}

		else
		{
			return `<div class="notes-${id} notes-environment"><p class="body-text"</p><span class="notes-${id}-title">${notesEnvironmentNames[id]}: ${name}</span></p>`;
		}
	}

	else
	{
		return `<div class="notes-${id} notes-environment"><p class="body-text"</p><span class="notes-${id}-title">${notesEnvironmentNames[id]}</span></p>`;
	}
}