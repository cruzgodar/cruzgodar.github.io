export function parseLatex(latex)
{
	return latex
		// \pe, \me, \te
		.replaceAll(/(?<!\\)\\pe(?![a-zA-Z])/g, "\\ +\\!\\!=")
		.replaceAll(/(?<!\\)\\me(?![a-zA-Z])/g, "\\ -\\!\\!=")
		.replaceAll(/(?<!\\)\\te(?![a-zA-Z])/g, "\\ \\times\\!\\!=")
		
		// \G
		.replaceAll(/(?<!\\)\\G(?![a-zA-Z])/g, "\\nabla\\!")

		// \span, \image, \swap, \Re, \Im, \proj
		.replaceAll(/(?<!\\)\\(span|image|swap|Re|Im|proj)(?![a-zA-Z])/g, (match, $1) => `\\operatorname{${$1}}`)

		// Matrices: [[ 1, 2, 3 ; 4, 5, 6 ; 7, 8, 9]]
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

		// Leibniz derivatives:  d/dx, dy/dx, d\theta/dx, etc.
		.replaceAll(/d([a-zA-Z]?)\/d([a-zA-Z]?)/g, (match, $1, $2) => `\\frac{\\mathrm{d}${$1}}{\\mathrm{d}${$2}}`)
		.replaceAll(/d(\\[a-zA-Z]+?)\/d([a-zA-Z]?)/g, (match, $1, $2) => `\\frac{\\mathrm{d}${$1}}{\\mathrm{d}${$2}}`)
		.replaceAll(/d([a-zA-Z]?)\/d(\\[a-zA-Z]+?)/g, (match, $1, $2) => `\\frac{\\mathrm{d}${$1}}{\\mathrm{d}${$2}}`)
		.replaceAll(/d(\\[a-zA-Z]+?)\/d(\\[a-zA-Z]+?)/g, (match, $1, $2) => `\\frac{\\mathrm{d}${$1}}{\\mathrm{d}${$2}}`)

		// Manual d derivatives: \d
		.replaceAll(/(?<!\\)\\d(?![a-zA-Z])/g, "\\mathrm{d}")

		// Partial derivatives:  p/px, py/px, p\theta/px, etc.
		.replaceAll(/p([a-zA-Z]?)\/p([a-zA-Z]?)/g, (match, $1, $2) => `\\frac{\\partial ${$1}}{\\partial ${$2}}`)
		.replaceAll(/p(\\[a-zA-Z]+?)\/p([a-zA-Z]?)/g, (match, $1, $2) => `\\frac{\\partial ${$1}}{\\partial ${$2}}`)
		.replaceAll(/p([a-zA-Z]?)\/p(\\[a-zA-Z]+?)/g, (match, $1, $2) => `\\frac{\\partial ${$1}}{\\partial ${$2}}`)
		.replaceAll(/p(\\[a-zA-Z]+?)\/p(\\[a-zA-Z]+?)/g, (match, $1, $2) => `\\frac{\\partial ${$1}}{\\partial ${$2}}`)

		// Manual partial derivatives: \p
		.replaceAll(/(?<!\\)\\p(?![a-zA-Z])/g, "\\partial")

		// Bold: **A**
		.replaceAll(/\*\*(.+?)\*\*/g, (match, $1) => `\\mathbf{${$1}}`)

		// Blackboard bold: #A#
		.replaceAll(/#([^ ]+?)#/g, (match, $1) => `\\mathbb{${$1}}`);
}