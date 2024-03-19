export function parseLatex(latex)
{
	return latex
		// \pe, \me, \te
		.replaceAll(/(?<!\\)\\pe(?![a-zA-Z])/g, "\\ +\\!\\!=")
		.replaceAll(/(?<!\\)\\me(?![a-zA-Z])/g, "\\ -\\!\\!=")
		.replaceAll(/(?<!\\)\\te(?![a-zA-Z])/g, "\\ \\times\\!\\!=")

		// \span, \image, \swap, \re, \im
		.replaceAll(/(?<!\\)\\(span|image|swap|Re|Im)(?![a-zA-Z])/g, (match, $1) => `\\operatorname{${$1}}`)

		// Matrices: [[1, 2, 3 ; 4, 5, 6 ; 7, 8, 9]]
		.replaceAll(/\[\[(.+?)\]\]/g, (match, $1) =>
		{
			const colString = ("," + $1)
				.split(";")[0]
				.match(/[,|]/g)
				.join("")
				.replaceAll(/,/g, "c")
				.replaceAll(/\|/g, "|c");
			
			const content = $1.replaceAll(/[,|]/g, "&").replaceAll(/;/g, "\\\\");

			return `\\left[\\begin{array}{${colString}}${content}\\end{array}\\right]`;
		})

		// A left-aligned block: :: a = 1 ; b = 1 ::
		.replaceAll(/::(.+?)::/g, (match, $1) => `\\begin{array}{l}${$1.replaceAll(/;/g, "\\\\")}\\end{array}`)

		// Bold: **A**
		.replaceAll(/\*\*(.+?)\*\*/g, (match, $1) => `\\mathbf{${$1}}`)

		// Blackboard bold: #A#
		.replaceAll(/#([^ ]+?)#/g, (match, $1) => `\\mathbb{${$1}}`);
}