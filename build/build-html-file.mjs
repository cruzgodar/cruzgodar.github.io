import { write } from "./file-io.mjs";

//const root = process.argv[1].replace(/(\/cruzgodar.github.io\/).+$/, (match, $1) => $1)

let sitemap = null;
let parentFolder = null;

const manualHeaderPages =
[
	"/home/",

	"/projects/wilson",

	"/writing/caligo/",
];

let currentNumberedItem = 1;

// eslint-disable-next-line max-len
const GLSLDocs = "<div id=\"glsl-docs-card\" class=\"card\"><h1 class=\"heading-text\">Complex GLSL Documentation</h1><p class=\"body-text\">These functions implement many common operations on complex numbers, as well as a handful of more complicated number-theoretic functions. Unless otherwise specified, <code>float</code>s refer to real numbers and <code>vec2</code>s to complex ones.</p><h2 class=\"section-text\" style=\"margin-top: 48px\"> Constants</h2><p class=\"body-text\"><code>ZERO = vec2(0.0, 0.0)</code>.</p><p class=\"body-text\"><code>ONE = vec2(1.0, 0.0)</code>.</p><p class=\"body-text\"><code>I = i = vec2(0.0, 1.0)</code>.</p><h2 class=\"section-text\" style=\"margin-top: 48px\"> Arithmetic Functions</h2><p class=\"body-text\"><code>[float | vec2] cadd([float | vec2] z, [float | vec2] w)</code>: returns <span class=\"tex-holder inline-math\" data-source-tex=\"z + w\">$z + w$</span>.</p><p class=\"body-text\"><code>[float | vec2] csub([float | vec2] z, [float | vec2] w)</code>: returns <span class=\"tex-holder inline-math\" data-source-tex=\"z - w\">$z - w$</span>.</p><p class=\"body-text\"><code>[float | vec2] cmul([float | vec2] z, [float | vec2] w)</code>: returns <span class=\"tex-holder inline-math\" data-source-tex=\"zw\">$zw$</span>.</p><p class=\"body-text\"><code>[float | vec2] cdiv([float | vec2] z, [float | vec2] w)</code>: returns <span class=\"tex-holder inline-math\" data-source-tex=\"\\dfrac{z}{w}\">$\\dfrac{z}{w}$</span>.</p><p class=\"body-text\"><code>[float | vec2] cinv([float | vec2] z)</code>: returns <span class=\"tex-holder inline-math\" data-source-tex=\"\\frac{1}{z}\">$\\frac{1}{z}$</span>.</p><p class=\"body-text\"><code>float cabs([float | vec2] z)</code>: returns <span class=\"tex-holder inline-math\" data-source-tex=\"|z|\">$|z|$</span>, where e.g. <span class=\"tex-holder inline-math\" data-source-tex=\"|3 + 4i| = 5\">$|3 + 4i| = 5$</span>.</p><p class=\"body-text\"><code>float cmag([float | vec2] z)</code>: returns <span class=\"tex-holder inline-math\" data-source-tex=\"|z|^2\">$|z|^2$</span>. Avoids taking a square root to compute <span class=\"tex-holder inline-math\" data-source-tex=\"|z|\">$|z|$</span>.</p><p class=\"body-text\"><code>float carg([float | vec2] z)</code>: returns the principal argument of <span class=\"tex-holder inline-math\" data-source-tex=\"z\">$z$</span>, i.e. the angle in <span class=\"tex-holder inline-math\" data-source-tex=\"(-\\pi, \\pi]\">$(-\\pi, \\pi]$</span> that <span class=\"tex-holder inline-math\" data-source-tex=\"z\">$z$</span> makes with the positive <span class=\"tex-holder inline-math\" data-source-tex=\"x\">$x$</span>-axis.</p><p class=\"body-text\"><code>[float | vec2] cconj([float | vec2] z)</code>: returns <span class=\"tex-holder inline-math\" data-source-tex=\"\\overline{z}\">$\\overline{z}$</span>, the complex conjugate of <span class=\"tex-holder inline-math\" data-source-tex=\"z\">$z$</span>.</p><p class=\"body-text\"><code>[float | vec2] csign([float | vec2] z)</code>: returns the normalized vector <span class=\"tex-holder inline-math\" data-source-tex=\"\\dfrac{z}{|z|}\">$\\dfrac{z}{|z|}$</span>, generalizing the sign function on the real numbers.</p><h2 class=\"section-text\" style=\"margin-top: 48px\"> Exponential Functions</h2><p class=\"body-text\"><code>[float | vec2] cpow([float | vec2] z, [float | vec2] w)</code>: returns <span class=\"tex-holder inline-math\" data-source-tex=\"z^w\">$z^w$</span>. If both <span class=\"tex-holder inline-math\" data-source-tex=\"z\">$z$</span> and <span class=\"tex-holder inline-math\" data-source-tex=\"w\">$w$</span> are real but the power is complex, at least one of the two must be passed in as a <code>vec2</code>.</p><p class=\"body-text\"><code>vec2 cpow_logz(float z, float logz, float w)</code>: returns <span class=\"tex-holder inline-math\" data-source-tex=\"z^w\">$z^w$</span>. Saves operations in the case <span class=\"tex-holder inline-math\" data-source-tex=\"\\log(z)\">$\\log(z)$</span> is already known. Requires <span class=\"tex-holder inline-math\" data-source-tex=\"z > 0\">$z > 0$</span>.</p><p class=\"body-text\"><code>vec2 csqrt([float | vec2] z)</code>: returns <span class=\"tex-holder inline-math\" data-source-tex=\"\\sqrt{z}\">$\\sqrt{z}$</span>.</p><p class=\"body-text\"><code>[float | vec2] cexp([float | vec2] z)</code>: returns <span class=\"tex-holder inline-math\" data-source-tex=\"e^z\">$e^z$</span>.</p><p class=\"body-text\"><code>[float | vec2] clog([float | vec2] z)</code>: returns <span class=\"tex-holder inline-math\" data-source-tex=\"\\log(z)\">$\\log(z)$</span>, the natural log of <span class=\"tex-holder inline-math\" data-source-tex=\"z\">$z$</span>.</p><p class=\"body-text\"><code>[float | vec2] ctet([float | vec2] z, float w)</code>: returns <span class=\"tex-holder inline-math\" data-source-tex=\"z \\uparrow\\uparrow w\">$z \\uparrow\\uparrow w$</span>, e.g. <span class=\"tex-holder inline-math\" data-source-tex=\"2 \\uparrow\\uparrow 3 = 2^{2^2} = 16\">$2 \\uparrow\\uparrow 3 = 2^{2^2} = 16$</span>.</p><p class=\"body-text\"><code>int powermod(int a, int b, int c)</code>: returns <span class=\"tex-holder inline-math\" data-source-tex=\"a^b \\mod c\">$a^b \\mod c$</span>.</p><h2 class=\"section-text\" style=\"margin-top: 48px\"> Trigonometric Functions</h2><p class=\"body-text\">All six standard trigonometric functions are implemented, along with their inverses, hyperbolic versions, and hyperbolic inverses. For example, <code>csin(z)</code> returns <span class=\"tex-holder inline-math\" data-source-tex=\"\\sin(z)\">$\\sin(z)$</span>, <code>casin(z)</code> returns <span class=\"tex-holder inline-math\" data-source-tex=\"\\arcsin(z)\">$\\arcsin(z)$</span>, <code>csinh(z)</code> returns <span class=\"tex-holder inline-math\" data-source-tex=\"\\sinh(z)\">$\\sinh(z)$</span>, and <code>casinh(z)</code> returns <span class=\"tex-holder inline-math\" data-source-tex=\"\\operatorname{arcsinh}(z)\">$\\operatorname{arcsinh}(z)$</span>.</p><p class=\"body-text\"><code>[float | vec2] c[a]sin[h]([float | vec2] z)</code>.</p><p class=\"body-text\"><code>[float | vec2] c[a]cos[h]([float | vec2] z)</code>.</p><p class=\"body-text\"><code>[float | vec2] c[a]tan[h]([float | vec2] z)</code>.</p><p class=\"body-text\"><code>[float | vec2] c[a]csc[h]([float | vec2] z)</code>.</p><p class=\"body-text\"><code>[float | vec2] c[a]sec[h]([float | vec2] z)</code>.</p><p class=\"body-text\"><code>[float | vec2] c[a]cot[h]([float | vec2] z)</code>.</p><h2 class=\"section-text\" style=\"margin-top: 48px\"> Combinatorial Functions</h2><p class=\"body-text\"><code>float factorial([int | float] n)</code>: returns <span class=\"tex-holder inline-math\" data-source-tex=\"n!\">$n!$</span>.</p><p class=\"body-text\"><code>float binomial([int | float] n, [int | float] k)</code>: returns <span class=\"tex-holder inline-math\" data-source-tex=\"\\binom{n}{k}\">$\\displaystyle \\binom{n}{k}$</span>.</p><p class=\"body-text\"><code>float divisor(float n, float k = 1.0)</code>: returns the sum of all <span class=\"tex-holder inline-math\" data-source-tex=\"k\">$k$</span>th powers of divisors of <span class=\"tex-holder inline-math\" data-source-tex=\"n\">$n$</span>.</p><p class=\"body-text\"><code>float bernoulli(float n)</code>: returns the <span class=\"tex-holder inline-math\" data-source-tex=\"n\">$n$</span>th Bernoulli number <span class=\"tex-holder inline-math\" data-source-tex=\"B_n\">$B_n$</span>.</p><p class=\"body-text\"><code>float rising_factorial(float a, [int | float] n)</code>: returns <span class=\"tex-holder inline-math\" data-source-tex=\"(a)(a + 1)\\cdots(a+n-1)\">$(a)(a + 1)\\cdots(a+n-1)$</span>.</p><h2 class=\"section-text\" style=\"margin-top: 48px\"> Number-Theoretic Functions</h2><p class=\"body-text\"><code>[float | vec2] zeta([float | vec2] z)</code>: returns <span class=\"tex-holder inline-math\" data-source-tex=\"\\zeta(z)\">$\\zeta(z)$</span>, where <span class=\"tex-holder inline-math\" data-source-tex=\"\\zeta\">$\\zeta$</span> is the Riemann zeta function.</p><p class=\"body-text\"><code>vec2 hurwitz_zeta(vec2 z, [float | vec2] a)</code>: returns <span class=\"tex-holder inline-math\" data-source-tex=\"\\zeta(z, a)\">$\\zeta(z, a)$</span>, where <span class=\"tex-holder inline-math\" data-source-tex=\"\\zeta\">$\\zeta$</span> is the Hurwitz zeta function, a generalization of the Riemann zeta function.</p><p class=\"body-text\"><code>vec2 su3_character([int | float] p, [int | float] p, vec2 z)</code>: returns the character of the irreducible <span class=\"tex-holder inline-math\" data-source-tex=\"SU(3)\">$SU(3)$</span> representation with highest weight <span class=\"tex-holder inline-math\" data-source-tex=\"(p, q)\">$(p, q)$</span>.</p><p class=\"body-text\"><code>[float | vec2] gamma([int | float | vec2] a)</code>: returns <span class=\"tex-holder inline-math\" data-source-tex=\"\\Gamma(a)\">$\\Gamma(a)$</span>, where <span class=\"tex-holder inline-math\" data-source-tex=\"\\Gamma\">$\\Gamma$</span> is the gamma function, a generalization of the factorial operation.</p><p class=\"body-text\"><code>vec2 digamma(vec2 a)</code>: returns the logarithmic derivative of the <span class=\"tex-holder inline-math\" data-source-tex=\"\\Gamma\">$\\Gamma$</span> function, i.e. <span class=\"tex-holder inline-math\" data-source-tex=\"\\dfrac{\\Gamma'(a)}{\\Gamma(a)}\">$\\dfrac{\\Gamma'(a)}{\\Gamma(a)}$</span>.</p><p class=\"body-text\"><code>vec2 polygamma([int | float] n, vec2 a)</code>: returns the <span class=\"tex-holder inline-math\" data-source-tex=\"(n + 1)\">$(n + 1)$</span>st logarithmic derivative of the <span class=\"tex-holder inline-math\" data-source-tex=\"\\Gamma\">$\\Gamma$</span> function at <span class=\"tex-holder inline-math\" data-source-tex=\"a\">$a$</span>.</p><p class=\"body-text\"><code>vec2 hypergeometric2f1(float a, float b, float c, [float | vec2] z)</code>: returns the hypergeometric function <span class=\"tex-holder inline-math\" data-source-tex=\"_2F_1(a, b; c; z)\">$_2F_1(a, b; c; z)$</span>.</p><p class=\"body-text\"><code>vec2 hypergeometricf2(float a, float b1, float b2, float c1, float c2, [float | vec2] x, [float | vec2] y)</code>: returns the hypergeometric function <span class=\"tex-holder inline-math\" data-source-tex=\"F_2(a, b_1, b_2; c_1, c_2; x, y)\">$F_2(a, b_1, b_2; c_1, c_2; x, y)$</span>. The types of <span class=\"tex-holder inline-math\" data-source-tex=\"x\">$x$</span> and <span class=\"tex-holder inline-math\" data-source-tex=\"y\">$y$</span> must match.</p><p class=\"body-text\"><code>vec2 hypergeometricg2(float b1, float b2, float c1, float c2, [float | vec2] x, [float | vec2] y)</code>: returns the hypergeometric function <span class=\"tex-holder inline-math\" data-source-tex=\"G_2(b_1, b_2; c_1, c_2; x, y)\">$G_2(b_1, b_2; c_1, c_2; x, y)$</span>. The types of <span class=\"tex-holder inline-math\" data-source-tex=\"x\">$x$</span> and <span class=\"tex-holder inline-math\" data-source-tex=\"y\">$y$</span> must match.</p><p class=\"body-text\"><code>vec2 hypergeometricf1(float a, float b1, float b2, float c, [float | vec2] x, [float | vec2] y)</code>: returns the hypergeometric function <span class=\"tex-holder inline-math\" data-source-tex=\"F_1(b_1, b_2; c_1, c_2; x, y)\">$F_1(b_1, b_2; c_1, c_2; x, y)$</span>. The types of <span class=\"tex-holder inline-math\" data-source-tex=\"x\">$x$</span> and <span class=\"tex-holder inline-math\" data-source-tex=\"y\">$y$</span> must match.</p></div>";

const components =
{
	getImageLink(args)
	{
		let id = args[0].split(".")[0].split("/");

		id = id[id.length - 1];



		if (args.length >= 2 && args[1] === "c")
		{
			const subtext = args.slice(2).join(" ");

			const src = `${parentFolder}cards/${id}.webp`;

			return `
				<div class="image-link">
					<a data-card-id="${id}" tabindex="-1">
						<img src="${src}" alt="${subtext}" tabindex="1"></img>
					</a>
					
					<p class="image-link-subtext">${subtext}</p>
				</div>
			`;
		}

		else
		{
			let inNewTab = false;

			if (args.length >= 2 && args[1] === "t")
			{
				inNewTab = true;

				args.splice(1, 1);
			}



			let filePath = args[0];

			if (filePath[0] !== "/")
			{
				filePath = parentFolder + args[0];
			}



			let subtext = "";

			if (args.length >= 2)
			{
				subtext = args.slice(1).join(" ");
			}

			else
			{
				subtext = sitemap[filePath].title;
			}



			const src = `${filePath.slice(0, filePath.lastIndexOf("/") + 1)}cover.webp`;

			return `
				<div class="image-link">
					<a href="${filePath}"${inNewTab ? " data-in-new-tab='1'" : ""} tabindex="-1">
						<img src="${src}" alt="${subtext}" tabindex="1"></img>
					</a>
					
					<p class="image-link-subtext">${subtext}</p>
				</div>
			`;
		}
	},



	getGalleryImage(id, size, ...name)
	{
		return `
			<div class="gallery-image-${size}-${size}">
				<img src="/gallery/thumbnails/${id}.webp" data-image-id="${id}" alt="${name}"></img>
			</div>
		`;
	},



	getBanner()
	{
		return `
			<div id="banner">
				<div id="banner-small"></div>
				<div id="banner-large"></div>
			</div>
			
			<div id="banner-gradient"></div>

			<div id="banner-cover"></div>

			<div id="content">
				<div id="scroll-to"></div>
				
				<div style="height: 5vh"></div>
		`;
	},



	getTextBox(args)
	{
		const id = args[0];

		const value = args[1];

		const text = args.slice(2).join(" ");

		return `
			<div class="text-box-container">
				<input id="${id}-input" class="text-box" type="text" value="${value}" tabindex="1">
				<p class="body-text text-box-subtext">${text}</p>
			</div>
		`;
	},



	getTextButton(args)
	{
		const id = args[0];

		let text = args.slice(1).join(" ");



		let linkedString = "";

		if (args[1] === "l")
		{
			linkedString = " linked-text-button";

			text = args.slice(2).join(" ");
		}



		return `
			<div class="focus-on-child" tabindex="1">
				<button class="text-button${linkedString}" type="button" id="${id}-button" tabindex="-1">${text}</button>
			</div>
		`;
	},



	getSlider(args)
	{
		const id = args[0];

		const value = args[1];

		const text = args.slice(2).join(" ");

		return `
			<div class="slider-container">
				<input id="${id}-slider" type="range" min="0" max="10000" value="${value}" tabindex="1">
				<label for="${id}-slider">
					<p class="body-text slider-subtext">${text}: <span id="${id}-slider-value">0</span></p>
				</label>
			</div>
		`;
	},



	Parse:
	{
		"text": (text) =>
		{
			//None of the delimiters * and ` can be parsed if they're inside
			//math mode, so we'll modify those things and put them back afterward.
			//The syntax [^\$] means any character other than a dollar sign.

			//First, we replace ending dollar signs with [END$] to differentiate them
			//for later. Otherwise, delimiters between dollar signs would be matched too.
			//We also replace escaped characters.
			let html = text
				.replaceAll(/\\\$/g, "[DOLLARSIGN]")
				.replaceAll(/\\`/g, "[BACKTICK]")
				.replaceAll(/\\\*/g, "[ASTERISK]")
				.replaceAll(/\\"/g, "[DOUBLEQUOTE]")
				.replaceAll(/\\'/g, "[SINGLEQUOTE]")
				.replaceAll(/\\,/g, "[COMMA]")
				.replaceAll(/\$\$(.*?)\$\$/g, (match, $1) => `$\\displaystyle ${$1}$`)
				.replaceAll(/\$(.*?)\$/g, (match, $1) => `$${components.Parse.latex($1)}[END$]`)
				.replaceAll(/([0-9]+)#/g, (match, $1) => `${currentNumberedItem}--${currentNumberedItem + parseInt($1) - 1}`);



			//Escape every asterisk, backtick, and quote inside dollar signs.
			while (html.match(/\$([^$]*?)\*([^$]*?)\[END\$\]/))
			{
				html = html.replaceAll(/\$([^$]*?)\*([^$]*?)\[END\$\]/g, (match, $1, $2) => `$${$1}[ASTERISK]${$2}[END$]`);
			}

			while (html.match(/\$([^$]*?)`([^$]*?)\[END\$\]/))
			{
				html = html.replaceAll(/\$([^$]*?)`([^$]*?)\[END\$\]/g, (match, $1, $2) => `$${$1}[BACKTICK]${$2}[END$]`);
			}

			while (html.match(/\$([^$]*?)"([^$]*?)\[END\$\]/))
			{
				html = html.replaceAll(/\$([^$]*?)"([^$]*?)\[END\$\]/g, (match, $1, $2) => `$${$1}[DOUBLEQUOTE]${$2}[END$]`);
			}

			while (html.match(/\$([^$]*?)'([^$]*?)\[END\$\]/))
			{
				html = html.replaceAll(/\$([^$]*?)'([^$]*?)\[END\$\]/g, (match, $1, $2) => `$${$1}[SINGLEQUOTE]${$2}[END$]`);
			}

			while (html.match(/\$([^$]*?)\[END\$\]([^<])/))
			{
				html = html.replaceAll(/\$([^$]*?)\[END\$\]([^<])/g, (match, $1, $2) => `<span class="tex-holder">$${$1}[END$]</span>${$2}`);
			}

			while (html.match(/\$([^$]*?)\[END\$\]$/))
			{
				html = html.replaceAll(/\$([^$]*?)\[END\$\]$/g, (match, $1) => `<span class="tex-holder">$${$1}[END$]</span>`);
			}



			//Now we can handle the backticks. Since all of the ones still present
			//aren't inside math mode, we know they must be code.
			//That means we need to play the same game we just did.
			//First we can put back the dollar signs though.

			html = html.replaceAll(/\[END\$\]/g, "$").replaceAll(/`(.*?)`/g, (match, $1) => `\`${$1}[END\`]`);

			//Escape every asterisk and quote inside backticks.
			while (html.match(/`([^`]*?)\*([^`]*?)\[END`\]/))
			{
				html = html.replaceAll(/`([^`]*?)\*([^`]*?)\[END`\]/g, (match, $1, $2) => `\`${$1}[ASTERISK]${$2}[END\`]`);
			}

			while (html.match(/`([^`]*?)"([^`]*?)\[END`\]/))
			{
				html = html.replaceAll(/`([^`]*?)"([^`]*?)\[END`\]/g, (match, $1, $2) => `\`${$1}[DOUBLEQUOTE]${$2}[END\`]`);
			}

			while (html.match(/`([^`]*?)'([^`]*?)\[END`\]/))
			{
				html = html.replaceAll(/`([^`]*?)'([^`]*?)\[END`\]/g, (match, $1, $2) => `\`${$1}[SINGLEQUOTE]${$2}[END\`]`);
			}



			//Escape every quote inside a tag.
			while (html.match(/<([^<>]*?)"([^<>]*?)>/))
			{
				html = html.replaceAll(/<([^<>]*?)"([^<>]*?)>/g, (match, $1, $2) => `<${$1}[DOUBLEQUOTE]${$2}>`);
			}

			while (html.match(/<([^<>]*?)'([^<>]*?)>/))
			{
				html = html.replaceAll(/<([^<>]*?)'([^<>]*?)>/g, (match, $1, $2) => `<${$1}[SINGLEQUOTE]${$2}>`);
			}



			//Add leading tabs and bullet points.
			let numTabs = 0;

			while (html[numTabs] === ">")
			{
				numTabs++;
			}

			if (numTabs !== 0)
			{
				let sliceStart = numTabs;

				while (html[sliceStart] === " ")
				{
					sliceStart++;
				}

				html = html.slice(sliceStart);

				if (html[0] === "." && html[1] === " ")
				{
					html = `<strong>&#8226;</strong> ${html.slice(2)}`;
				}

				html = `<span style=[DOUBLEQUOTE]width: ${32 * numTabs}px[DOUBLEQUOTE]></span>${html}`;
			}



			//Now we're finally ready to add the code tags, and then the remaining
			//em and strong tags, and then modify the quotes. Then at long last,
			//we can unescape the remaining characters.
			return html
				.replaceAll(/`(.*?)\[END`\]/g, (match, $1) => `<code>${$1}</code>`)
				.replaceAll(/\*\*(.*?)\*\*/g, (match, $1) => `<strong>${$1}</strong>`)
				.replaceAll(/\*(.*?)\*/g, (match, $1) => `<em>${$1}</em>`)
				.replaceAll(/(\s)"(\S)/g, (match, $1, $2) => `${$1}&#x201C;${$2}`)
				.replaceAll(/^"(\S)/g, (match, $1) => `&#x201C;${$1}`)
				.replaceAll(/"/g, "&#x201D;")
				.replaceAll(/(\s)'(\S)/g, (match, $1, $2) => `${$1}&#x2018;${$2}`)
				.replaceAll(/^'(\S)/g, (match, $1) => `&#x2018;${$1}`)
				.replaceAll(/'/g, "&#x2019;")
				.replaceAll(/- - -/g, "<span style='height: 32px'></span>")
				.replaceAll(/---/g, "&mdash;")
				.replaceAll(/--/g, "&ndash;")
				.replaceAll(/\[DOUBLEQUOTE\]/g, "\"")
				.replaceAll(/\[SINGLEQUOTE\]/g, "'")
				.replaceAll(/\[COMMA\]/g, ",")
				.replaceAll(/\[ASTERISK\]/g, "*")
				.replaceAll(/\[BACKTICK\]/g, "`")
				.replaceAll(/\[DOLLARSIGN\]/g, "\\$")
				.replaceAll(/<span class="tex-holder">\$(.*?)\$<\/span>/g, (match, $1) => `<span class="tex-holder inline-math" data-source-tex="${$1.replaceAll(/\\displaystyle\s*/g, "")}">$${$1}$</span>`);
		},



		"latex": (content) =>
		{
			return content
				// \pe, \me, \te
				.replaceAll(/(?<!\\)\\pe(?![a-zA-Z])/g, "\\ +\\!\\!=")
				.replaceAll(/(?<!\\)\\me(?![a-zA-Z])/g, "\\ -\\!\\!=")
				.replaceAll(/(?<!\\)\\te(?![a-zA-Z])/g, "\\ \\times\\!\\!=")

				// \span
				.replaceAll(/(?<!\\)\\(span|image|swap)(?![a-zA-Z])/g, (match, $1) => `\\operatorname{${$1}}`)

				// [[1, 2, 3 ; 4, 5, 6 ; 7, 8, 9]]
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

				// **A**
				.replaceAll(/\*\*(.+?)\*\*/g, (match, $1) => `\\mathbf{${$1}}`)

				// #A#
				.replaceAll(/#([^ ]+?)#/g, (match, $1) => `\\mathbb{${$1}}`);
		},



		"image-links": (content) =>
		{
			let html = `<div class="image-links${content.length === 1 ? " one-image-link" : ""}">`;


			content.forEach(line =>
			{
				html = `${html}${components.getImageLink(line.split(" "))}`;
			});

			html = `${html}</div>`;

			return html;
		},



		"buttons": (content) =>
		{
			let html = "<div class='text-buttons'>";

			content.forEach(line =>
			{
				html = `${html}${components.getTextButton(line.split(" "))}`;
			});

			html = `${html}</div>`;

			return html;
		},



		"text-boxes": (content) =>
		{
			let html = "<div class='text-boxes'>";

			content.forEach(line =>
			{
				html = `${html}${components.getTextBox(line.split(" "))}`;
			});

			html = `${html}</div>`;

			return html;
		},



		"sliders": (content) =>
		{
			let html = "<div class='sliders'>";

			content.forEach(line =>
			{
				html = `${html}${components.getSlider(line.split(" "))}`;
			});

			html = `${html}</div>`;

			return html;
		},



		"dropdown": (content) =>
		{
			const id = content[0];

			let html = `
				<div class="text-buttons">
					<div class="dropdown-container focus-on-child" tabindex="1">
						<button class="text-button dropdown" type="button" id="${id}-dropdown-button" tabindex="-1">`;
			
			let inOptgroup = false;

			for (let i = 1; i < content.length; i++)
			{
				const words = content[i].split(" ");

				const value = words[0];
				const text = words.slice(1).join(" ");

				if (i === 1)
				{
					html += `${text}</button><select id="${id}-dropdown">`;
				}

				//Option groups
				const index = value.indexOf(":");

				html += index !== -1
					? `${inOptgroup ? "</optgroup>" : ""}<optgroup label="${value.slice(0, index)}">`
					: `<option value="${value}">${text}</option>`;
				
				if (index !== -1)
				{
					inOptgroup = true;
				}
			}

			html += `${inOptgroup ? "</optgroup>" : ""}</select></div></div>`;

			return html;
		},



		"carousel": (content) =>
		{
			const htmlLines = content.map(line =>
			{
				const paragraphs = line.split("\\n");

				const parsedParagraphs = paragraphs.map(
					paragraph => components.Parse.text(paragraph)
				);

				return "<p class=\"body-text\">"
					+ parsedParagraphs.join("</p><p class=\"body-text\">")
					+ "</p>";
			});

			return `
				<div class="carousel">
					<div class="carousel-content">
						${htmlLines.map((line, index) => `<div class="carousel-entry">${line}</div>`).join("")}
					</div>

					<div class="carousel-dots">
						${"<div class=\"carousel-dot\"><div class=\"fill\"></div></div>".repeat(content.length)}
					</div>
				</div>
			`;
		},



		"gallery-block": (content) =>
		{
			let html = "<div class='gallery-block'>";

			content.forEach(line =>
			{
				html = `${html}${components.getGalleryImage(...(line.split(" ")))}`;
			});

			html = `${html}</div>`;

			return html;
		},



		"card": (id, ...name) =>
		{
			if (name.length !== 0)
			{
				name = name.join(" ");

				return `<div id="${id}-card" class="card"><h1 class="heading-text">${name}</h1>`;
			}

			return `<div id="${id}-card" class="card">`;
		},



		"notes-environment": (id, ...name) =>
		{
			if (name.length !== 0)
			{
				name = name.join(" ");

				//These two avoid awkward things like Theorem: The Fundamental Theorem.
				if (name[0] === "!")
				{
					return `<div class="notes-${id} notes-environment"><p class="body-text"</p><span class="notes-${id}-title">${name.slice(1)}</span></p>`;
				}

				else if (
					name.toLowerCase().includes(components.notesEnvironments[id].toLowerCase())
				)
				{
					return `<div class="notes-${id} notes-environment"><p class="body-text"</p><span class="notes-${id}-title">${name}</span></p>`;
				}

				else
				{
					return `<div class="notes-${id} notes-environment"><p class="body-text"</p><span class="notes-${id}-title">${components.notesEnvironments[id]}: ${name}</span></p>`;
				}
			}

			else
			{
				return `<div class="notes-${id} notes-environment"><p class="body-text"</p><span class="notes-${id}-title">${components.notesEnvironments[id]}</span></p>`;
			}
		},



		"banner": () =>
		{
			return "";
		},



		"canvas": (id) =>
		{
			if (id)
			{
				return `<div class="desmos-border"><canvas id="${id}-canvas" class="output-canvas"></canvas></div>`;
			}

			else
			{
				return "<canvas id='output-canvas' class='output-canvas'></canvas>";
			}
		},



		"center": (...words) =>
		{
			const text = words.join(" ");

			return `<p class="body-text center-if-needed"><span>${components.Parse.text(text)}</span></p>`;
		},



		"checkbox": (id, ...name) =>
		{
			const text = name.join(" ");

			return `
				<div class="checkbox-row">
					<div class="checkbox-container click-on-child" tabindex="1">
						<input type="checkbox" id="${id}-checkbox">
						<div class="checkbox"></div>
					</div>
					
					<div style="margin-left: 10px">
						<p class="body-text checkbox-subtext">${text}</p>
					</div>
				</div>
			`;
		},



		"desmos": (id) =>
		{
			return `<div class="desmos-border"><div id="${id}" class="desmos-container"></div></div>`;
		},



		"glsl-docs": () =>
		{
			return GLSLDocs;
		},



		"nav-buttons": () =>
		{
			return `
				<div class="text-buttons nav-buttons">
					<div class="focus-on-child tabindex="1">
						<button class="text-button linked-text-button previous-nav-button" type="button" tabindex="-1">Previous</button>
					</div>
					
					<div class="focus-on-child" tabindex="1">
						<button class="text-button linked-text-button home-nav-button" type="button" tabindex="-1">Home</button>
					</div>
					
					<div class="focus-on-child" tabindex="1">
						<button class="text-button linked-text-button next-nav-button" type="button" tabindex="-1">Next</button>
					</div>
				</div>
			`;
		},



		"wilson": (glsl) =>
		{
			if (glsl === "glsl")
			{
				// eslint-disable-next-line max-len
				return "<p class='body-text'>This applet was made with <a href='/projects/wilson/'>Wilson</a>, a library I wrote to make high-performance, polished applets easier to create. Much of the code implementing complex functions was contributed by <a href='https://ahuchala.com'>Andy Huchala.</a> (<a data-card-id='glsl-docs'>View the documentation!</a>)</p>";
			}

			// eslint-disable-next-line max-len
			return "<p class='body-text'>This applet was made with <a href='/projects/wilson/'>Wilson</a>, a library I wrote to make high-performance, polished applets easier to create.</p>";
		}
	},

	singleLineEnvironments: [
		"banner",
		"canvas",
		"card",
		"center",
		"checkbox",
		"desmos",
		"glsl-docs",
		"nav-buttons",
		"wilson"
	],

	notesEnvironments:
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
	},



	decode(html)
	{
		const banner = html.indexOf("### banner") !== -1;

		let inEnvironment = false;

		html = html.replaceAll(/\r/g, "").replaceAll(/ {4}/g, "\t");

		//Tabs in code blocks stay, but the rest can go.
		//We match two tabs here so that we can still indent the whole block by one.
		while (html.match(/(```.+\n[\s\S]*?)\t\t([\s\S]*?```\n)/))
		{
			html = html.replaceAll(/(```.+\n[\s\S]*?)\t\t([\s\S]*?```\n)/g, (match, $1, $2) => `${$1}&#9;${$2}`);
		}

		html = html.replaceAll(/\t/g, "");



		//Automatically add a header if there's not one already here.
		if (!html.match(/\n#\s/g) && !manualHeaderPages.includes(parentFolder))
		{
			const title = sitemap[parentFolder].title;

			html = html.replaceAll(/(<div.*?>)?(### banner)?([\s\S]+)/g, (match, $1, $2, $3) => `${$1 ? $1 : ""}${$2 ? $2 : ""}\n\n# ${title}\n\n${$3 ? $3 : ""}`);
		}



		let pageTitle = "";

		const lines = html.split("\n");



		for (let i = 0; i < lines.length; i++)
		{
			//Filtering out lines beginning with < is a little rough, but pretty much necessary.
			if (lines[i].length === 0 || lines[i][0] === "<")
			{
				continue;
			}

			//A ! at the start of a line indicates we should treat it as text after all.
			if (lines[i][0] === "!")
			{
				lines[i] = lines[i].slice(1);
			}



			//Leave math mostly alone (but wrap it in body text).
			if (lines[i] === "$$")
			{
				let sourceTex = "";

				const startI = i;

				i++;

				while (lines[i].slice(0, 2) !== "$$")
				{
					if (lines[i] === "")
					{
						lines.splice(i, 1);
					}

					else
					{
						lines[i] = this.Parse.latex(lines[i]);

						sourceTex = `${sourceTex}${i === startI + 1 ? "" : "\\\\"}[NEWLINE][TAB]${lines[i]}`;

						if ([...lines[i].matchAll(/\\(begin|end){.*?}/g)].length !== 1)
						{
							lines[i] = `${lines[i]}\\\\[4px]`;
						}

						i++;
					}
				}

				sourceTex = `${sourceTex}[NEWLINE]`;

				if (sourceTex.indexOf("&") === -1)
				{
					sourceTex = `$$${sourceTex}$$`;
				}

				else
				{
					sourceTex = `\\begin{align*}${sourceTex}\\end{align*}`;
				}



				//Remove the last line break.
				lines[i - 1] = lines[i - 1].replace(/\\\\\[4px\]$/, "");

				lines[i] = "\\end{align*}$$</span></p>";

				lines[startI] = `<p class="body-text" style="text-align: center"><span class="tex-holder" style="padding: 8px" data-source-tex="${sourceTex}">$$\\begin{align*}`;
			}



			//Handle code blocks.
			else if (lines[i].slice(0, 3) === "```")
			{
				if (lines[i].length > 3)
				{
					lines[i] = `<pre><code class="language-${lines[i].slice(3)}">`;
				}

				else
				{
					lines[i] = "<pre><code>";
				}

				lines[i] = `${lines[i]}${lines[i + 1]}[ESCAPEDNEWLINE]`;

				lines.splice(i + 1, 1);

				i++;

				while (lines[i].slice(0, 3) !== "```")
				{
					lines[i] = `${lines[i]}[ESCAPEDNEWLINE]`;
					i++;
				}

				lines[i - 1] = `${lines[i - 1]}</code></pre>`;

				lines.splice(i, 1);

				i--;
			}



			//This is one of the many possible environments.
			else if (lines[i].slice(0, 3) === "###")
			{
				currentNumberedItem = 1;

				if (lines[i] === "###")
				{
					//If we find one of these in the wild, we're
					//in an environment and just need to end it.

					inEnvironment = false;

					lines[i] = "</div>";
					continue;
				}



				const words = lines[i].slice(4).split(" ");

				//The first word is the id.
				if (this.singleLineEnvironments.includes(words[0]))
				{
					lines[i] = this.Parse[words[0]](...(words.slice(1)));

					if (words[0] === "card")
					{
						inEnvironment = true;
					}
				}

				else if (words[0] in this.notesEnvironments)
				{
					lines[i] = this.Parse["notes-environment"](...words);

					inEnvironment = true;
				}

				else
				{
					const content = [];

					const startI = i;

					i++;

					while (lines[i] !== "###")
					{
						if (lines[i].length !== 0)
						{
							content.push(lines[i]);
						}

						i++;
					}

					lines[startI] = this.Parse[words[0]](content, ...(words.slice(1)));

					for (let j = startI + 1; j <= i; j++)
					{
						lines[j] = "";
					}

				}
			}

			//A new section.
			else if (lines[i].slice(0, 2) === "##")
			{
				const title = this.Parse.text(lines[i].slice(2));

				if (inEnvironment)
				{
					lines[i] = `<h2 class="section-text" style="margin-top: 80px">${title}</h2>`;
				}

				else
				{
					lines[i] = `</section><h2 class="section-text">${title}</h2><section>`;
				}
			}

			//A heading. Only one of these per file.
			else if (lines[i][0] === "#" && lines[i][1] !== ".")
			{
				const title = this.Parse.text(lines[i].slice(2));

				pageTitle = title;

				const bannerHtml = banner ? this.getBanner() :  "";

				lines[i] = `
					${bannerHtml}
					<header>
						<div id="logo">
							<a href="/home/" tabindex="-1">
								<img src="/graphics/general-icons/logo.png" alt="Logo" tabindex="1"></img>
							</a>
						</div>
						
						<div style="height: 20px"></div>
						
						<h1 class="heading-text">${title}</h1>
					</header>
					
					<main>
						<section>
				`;
			}

			//Regular text!
			else
			{
				const content = this.Parse.text(lines[i]);

				if (content.match(/^#+?\./))
				{
					lines[i] = `<p class="body-text numbered-list-item">${content.replace(/^#+?\./, `${currentNumberedItem}.`)}</p>`;

					currentNumberedItem++;
				}

				else if (content.match(/^[0-9]+?\./))
				{
					lines[i] = `<p class="body-text numbered-list-item">${content}</p>`;
				}

				else
				{
					lines[i] = `<p class="body-text">${content}</p>`;
				}
			}
		}



		//Remove blank lines and tabs.
		for (let i = 0; i < lines.length; i++)
		{
			lines[i] = lines[i].replace(/\t/g, "").replace(/\n/g, "");

			if (lines[i].length === 0)
			{
				lines.splice(i, 1);
				i--;
			}
		}



		html = lines.join("");

		//Gross
		html = html.replaceAll(/\[ESCAPEDNEWLINE\]/g, "\n");



		//End the HTML properly.

		html = `${html}</section></main>`;

		if (banner)
		{
			html = `${html}</div>`;
		}



		if (pageTitle === "")
		{
			pageTitle = "Cruz Godar";
		}

		const headHtml = `<title>${pageTitle}</title><meta property="og:title" content="${pageTitle}"/><meta property="og:type" content="website"/><meta property="og:url" content="https://cruzgodar.com${parentFolder}"/><meta property="og:image" content="https://cruzgodar.com${parentFolder}cover.webp"/><meta property="og:locale" content="en_US"/><meta property="og:site_name" content="Cruz Godar"/>`;

		const indexHtml = `<!DOCTYPE html><html lang="en"><head>${headHtml}<style>body {opacity: 0;}</style></head><body><noscript><p class="body-text" style="text-align: center">JavaScript is required to use this site and many others. Consider enabling it.</p></noscript><script src="/scripts/init.min.js"></script></body></html>`;

		return [html, indexHtml];
	}
};



export default async function buildHTMLFile(file, fileParentFolder, sitemapArgument)
{
	parentFolder = fileParentFolder;

	sitemap = sitemapArgument;

	const [html, indexHtml] = components.decode("\n" + file);

	await write(`${fileParentFolder}data.html`, html);

	await write(`${fileParentFolder}index.html`, indexHtml);
}