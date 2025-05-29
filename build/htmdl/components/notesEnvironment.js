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

		// These two avoid awkward things like Theorem: The Fundamental Theorem.
		if (options.includes("m"))
		{
			return /* html */`<div class="notes-${id} notes-environment"><div class="notes-${id}-title notes-title">${name}</div>`;
		}

		else if (
			name.toLowerCase().includes(notesEnvironmentNames[id].toLowerCase())
		) {
			return /* html */`<div class="notes-${id} notes-environment"><div class="notes-${id}-title notes-title">${name}</div>`;
		}

		else
		{
			return /* html */`<div class="notes-${id} notes-environment"><div class="notes-${id}-title notes-title">${notesEnvironmentNames[id]}: ${name}</div>`;
		}
	}

	else
	{
		return /* html */`<div class="notes-${id} notes-environment"><div class="notes-${id}-title notes-title">${notesEnvironmentNames[id]}</div>`;
	}
}