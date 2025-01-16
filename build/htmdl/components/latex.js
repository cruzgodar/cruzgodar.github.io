export function parseLatex(latex)
{
	return latex
		// \pe, \me, \te
		.replaceAll(/(?<!\\)\\pe(?![a-zA-Z])/g, "\\ +\\!\\!=")
		.replaceAll(/(?<!\\)\\me(?![a-zA-Z])/g, "\\ -\\!\\!=")
		.replaceAll(/(?<!\\)\\te(?![a-zA-Z])/g, "\\ \\times\\!\\!=")

		// \span, \image, \swap, \Re, \Im
		.replaceAll(/(?<!\\)\\(span|image|swap|Re|Im|proj)(?![a-zA-Z])/g, (match, $1) => `\\operatorname{${$1}}`)

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

		// Leibniz derivatives:  d/dx, dy/dx, d\theta/dx, etc. Note that
		// \d for manual derivatives is already handled previously.
		.replaceAll(/d([a-zA-Z]?)\/d([a-zA-Z]?)/g, (match, $1, $2) => `\\frac{\\text{d}${$1}}{\\text{d}${$2}}`)
		.replaceAll(/d(\\[a-zA-Z]+?)\/d([a-zA-Z]?)/g, (match, $1, $2) => `\\frac{\\text{d}${$1}}{\\text{d}${$2}}`)
		.replaceAll(/d([a-zA-Z]?)\/d(\\[a-zA-Z]+?)/g, (match, $1, $2) => `\\frac{\\text{d}${$1}}{\\text{d}${$2}}`)
		.replaceAll(/d(\\[a-zA-Z]+?)\/d(\\[a-zA-Z]+?)/g, (match, $1, $2) => `\\frac{\\text{d}${$1}}{\\text{d}${$2}}`)

		// Manual d derivatives: \d
		.replaceAll(/(?<!\\)\\d(?![a-zA-Z])/g, "\\text{d}")

		// Bold: **A**
		.replaceAll(/\*\*(.+?)\*\*/g, (match, $1) => `\\mathbf{${$1}}`)

		// Blackboard bold: #A#
		.replaceAll(/#([^ ]+?)#/g, (match, $1) => `\\mathbb{${$1}}`);
}