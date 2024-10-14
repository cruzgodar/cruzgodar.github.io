/* eslint-disable quotes */
/* eslint-disable max-len */

const bridges2022 = /* html */`the <a href='https://gallery.bridgesmathart.org/exhibitions/2022-bridges-conference'>2022 Bridges conference</a>`;
const bridges2023 = /* html */`the <a href='https://gallery.bridgesmathart.org/exhibitions/2023-bridges-conference'>2023 Bridges conference</a>`;
const bridges2024 = /* html */`the <a href='https://gallery.bridgesmathart.org/exhibitions/bridges-2024-exhibition-of-mathematical-art'>2024 Bridges conference</a>`;
const jsma = /* html */`the <a href='https://mpembed.com/show/?m=FGvT8EzPQpy&mpu=885'>Jordan Schnitzer Museum of Art</a>`;
const emu = /* html */`<a href='https://www.facebook.com/visualartsteam/videos/4909794042367446/'>UO&#x2019;s Erb Memorial Union</a>`;
const researchAsArt = /* html */`<a href='https://www.artscioregon.com/2020-gallery'>UO&#x2019;s 2020 Research as Art Competition</a> `;
const girlsAngle = /* html */`the <a href='https://www.girlsangle.org/page/bulletin-archive/GABv15n01E.pdf'>Girls&#x2019; Angle Bulletin magazine</a>`;

export const galleryImageData =
{
	"voronoi-diagram-1":
	{
		title: "A Voronoi Diagram",

		appletLink: "voronoi-diagrams",

		driveId: "1J1dfHbqx1tX1qkkuJF0ZUp-OPlRezEsV"
	},

	"voronoi-diagram-2":
	{
		title: "A Voronoi Diagram",

		appletLink: "voronoi-diagrams",

		driveId: "1TrBXxbjYeHMbznxnT1NiNXWSj8jVBthA"
	},

	"thurston-geometry-h3":
	{
		title: "The Thurston Geometry $\\mathbb{H}^3$",

		appletLink: "thurston-geometries",

		driveId: "1wm59bChDwRgm91lONQR1bVKTCBKGWien"
	},

	"thurston-geometry-e3":
	{
		title: "The Thurston Geometry $\\mathbb{E}^3$",

		appletLink: "thurston-geometries",

		driveId: "1XqXEVoe82btwYcTolWTKT3tlsWz_98c0"
	},

	"thurston-geometry-nil":
	{
		title: "The Thurston Geometry Nil",

		appletLink: "thurston-geometries",

		driveId: "1-1h44Q9CEVGqyCkkxAQ-ykODsVzWYKwE"
	},
	
	"thurston-geometry-sl2r":
	{
		title: "The Thurston Geometry $\\widetilde{\\operatorname{SL}}(2, \\mathbb{R})$",

		appletLink: "thurston-geometries",

		driveId: "1XBJVX2kWVWz1dH06DIAVlDeqr21ei8Ty"
	},

	"thurston-geometry-sol":
	{
		title: "The Thurston Geometry Sol",

		appletLink: "thurston-geometries",

		driveId: "1Pz0IUsM43_-qEXIf27CWzjOkTnMyLXz6"
	},

	"thurston-geometry-s2xe":
	{
		title: "The Thurston Geometry $S^2 \\times \\mathbb{E}$",

		appletLink: "thurston-geometries",

		driveId: "1bA57Lhq12oJ1W611UkRjOwuTs8mIXtm-"
	},

	"thurston-geometry-h2xe":
	{
		title: "The Thurston Geometry $\\mathbb{H}^2 \\times \\mathbb{E}$",

		appletLink: "thurston-geometries",

		driveId: "1LCBMWW4n8IcF3_bGo4up4dcO0ISDqH0n"
	},
	
	"thurston-geometry-s3":
	{
		title: "The Thurston Geometry $S^3$",

		appletLink: "thurston-geometries",

		driveId: "1yvG5KfAg7qiYjzBDuXDilaSV23X-KyzB"
	},

	"newtons-method-2":
	{
		title: "Newton&#x2019;s Method",

		parameters: /* html */`
			Roots at $(\\pm 1, 0), (0, \\pm 1.5), (\\pm 1.5, \\pm 1.5)$
		`,

		featured: `A prior version of this image was featured in ${emu}.`,

		appletLink: "newtons-method",

		driveId: "1T8X5JduKEg8BkakXzGXZzu3CFW_R88i6"
	},

	"abelian-sandpile":
	{
		title: "An Abelian Sandpile",

		featured: `Featured in ${emu}`,

		appletLink: "abelian-sandpiles",

		driveId: "1pqpf8z08AgJ9oFXQLU0J6eWaJvgg6oME"
	},

	"aztec-diamond":
	{
		title: "An Aztec Diamond",

		appletLink: "domino-shuffling",

		driveId: "1XaoTpV0dKscPtOvrjU6sUuD1Mo-pyQzH"
	},

	"finite-subdivision-1":
	{
		title: "A Finite Subdivision",

		parameters: "6 vertices, 6 iterations",

		featured: `Featured in ${emu}`,

		appletLink: "finite-subdivisions",

		driveId: "1ohpmOx1bVGszGolKGxphW4qc15fghyIc"
	},

	"generalized-julia-set-2":
	{
		title: "A Generalized Julia Set",

		parameters: /* html */`
			Generated from $z^2 - 0.05z^{-2} + c$
		`,

		featured: `Featured in ${emu}`,

		appletLink: "generalized-julia-sets",

		driveId: "16LcsF7n7w329sO4T-IwWb-p7ykpglNQO"
	},

	"hitomezashi-pattern-2":
	{
		title: "A Hitomezashi Pattern",

		appletLink: "hitomezashi-patterns",

		driveId: "1JkngUmUdSEJvzYMRTTUIa3jy26F0c6m8"
	},



	"brownian-tree":
	{
		title: "A Brownian Tree",

		featured: `Featured in ${emu}`,

		appletLink: "brownian-trees",

		driveId: "1BSuYpCW9jQKqu8NOu6f_6omr_LVMXprh"
	},

	"lyapunov-fractal":
	{
		title: "A Lyapunov Fractal",

		parameters: "Generating string <code>AABB</code>",

		appletLink: "lyapunov-fractals",

		driveId: "1Xb5BMuz-iB9f-CN4l5wyZtbCLLOXrz80"
	},

	"strange-attractor":
	{
		title: "A Lorenz Attractor",

		appletLink: "strange-attractors",

		driveId: "1sRCKC-WE8a2iYNW942uKgAJbHVkAYDrQ"
	},

	"vector-field":
	{
		title: "A Vector Field",

		parameters: /* html */`
			Generated from $\\left( \\sin\\left( \\frac{y}{2.5} \\right), \\tan\\left( \\frac{x}{2.5} \\right) \\right)$
		`,

		appletLink: "vector-fields",

		driveId: "1DyYo2hLpJ-9NjwW_akmmmq3pmnS9VKPa"
	},

	"julia-set-1":
	{
		title: "A Julia Set",

		appletLink: "julia-set-explorer",

		driveId: "1V4B0ULle-Dq0-ludCNyQg5lQ8Hm6cm_X"
	},

	"snowflake":
	{
		title: "A Gravner-Griffeath Snowflake",

		appletLink: "snowflakes",

		featured: `A prior version of this image was featured in ${emu}.`,

		driveId: "1G4GWlWJvQWlP04IxWpNGmVCfwj0RZnX0"
	},



	"quaternionic-julia-set-1":
	{
		title: "A Quaternionic Julia Set",

		parameters: /* html */`
			Generated with $c = (-0.54, -0.25, -0.668, 0)$
		`,

		featured: `A prior version of this image was featured in ${bridges2023}.`,

		appletLink: "quaternionic-julia-sets",

		driveId: "1x2ss96tGmo-IvT2H31tm1zHimm8p7CWz"
	},

	"kicked-rotator":
	{
		title: "A Kicked Rotator",

		parameters: /* html */`
			Generated with $K = 0.75$
		`,

		featured: `A prior version of this image was featured in ${jsma}. The current version was featured in ${emu}.`,

		appletLink: "the-kicked-rotator",

		driveId: "1vXP_8ArZg7F2o7rbFCsksoHDT3nw8y66"
	},

	"kaleidoscopic-ifs-1":
	{
		title: "A Kaleidoscopic IFS Fractal",

		appletLink: "kaleidoscopic-ifs-fractals",

		driveId: "142FfsLHr4aJDbkwH0zPIBFtvtgCqvBgn"
	},

	"kaleidoscopic-ifs-2":
	{
		title: "A Kaleidoscopic IFS Fractal",

		appletLink: "kaleidoscopic-ifs-fractals",

		driveId: "10Z3WG23_IowWw81UnvZ3ABnrJpzCVBbL"
	},

	"generalized-julia-set-1":
	{
		title: "A Generalized Julia Set",

		parameters: /* html */`
			Generated from $\\sin(cz)$
		`,

		featured: `Featured in ${emu}`,

		appletLink: "generalized-julia-sets",

		driveId: "1rgAIVr9Ztfs2EiVtY_39-GQ91ayeMJXu"
	},

	"quasi-fuchsian-group":
	{
		title: "A Quasi-Fuchsian Group",

		featured: `A prior version of this image was featured in ${emu}.`,

		appletLink: "quasi-fuchsian-groups",

		driveId: "1mAQCyO3bHIL7yAV1I8uxVFmLBGbhQwRQ"
	},

	"chaos-game-1":
	{
		title: "A Chaos Game",

		featured: `Featured in ${emu}`,

		appletLink: "the-chaos-game",

		driveId: "15NZyBmIqZxCaTrT9C9m87bqfM1sUmY5i"
	},



	"wilsons-algorithm-2":
	{
		title: "Wilson&#x2019;s Algorithm",

		featured: `A prior version of this image was featured in ${jsma} and ${girlsAngle}. This version was featured in ${emu} and ${bridges2024}.`,

		appletLink: "wilsons-algorithm",

		driveId: "1EJD5tYppybnvAxK1bWpLEXK2gjKAnMqZ"
	},

	

	"barnsley-fern":
	{
		title: "The Barnsley Fern",

		featured: `Featured in ${jsma} and ${girlsAngle}`,

		appletLink: "the-barnsley-fern",

		driveId: "1ED5_vAUhFEF0E3fcnY4NOEYJSVf1P7cA"
	},

	"generalized-julia-set-3":
	{
		title: "A Generalized Julia Set",

		parameters: /* html */`
			Generated from $\\left( \\left| \\operatorname{Re} z \\right| - \\left| \\operatorname{Im} z \\right| \\right)^2 + c$
		`,

		appletLink: "generalized-julia-sets",

		driveId: "1ZOh2bya7QzuvSQqkM55cLxV3v-0MlET3"
	},

	"magic-carpet":
	{
		title: "A Magic Carpet",

		appletLink: "magic-carpets",

		driveId: "1bD3P4pzIU7M6Ni_lp9oSjtrwoAJQpJ98"
	},

	"complex-map-1":
	{
		title: "A Complex Map",

		parameters: /* html */`
			Generated from $e^{1/z}$
		`,

		appletLink: "complex-maps",

		driveId: "1rcF2qy4gGCJ3lg3X8jQW0Z0_OcFYKv8Q"
	},

	"hopf-fibration":
	{
		title: "The Hopf Fibration",

		appletLink: "hopf-fibration",

		driveId: "1h8kmCtONHyUEX28IF2JzFNL-Qgn-TFEX"
	},


	"secant-method":
	{
		title: "The Secant Method",

		parameters: /* html */`
			Generated from the polynomial $z^6 - 1$ with $a = 1.5$
		`,

		appletLink: "secant-method",

		featured: `Featured in ${emu}`,

		driveId: "1XaNHxtiX5oA9KcLGs8ZSPFJwpDWt4mPk"
	},

	"juliabulb-1":
	{
		title: "A Juliabulb",

		featured: `A prior version of this image was featured in ${emu}.`,

		appletLink: "the-mandelbulb",

		driveId: "16LaSCsDam08PBt_IuvK_EEq7sGWclUOW"
	},

	"juliabulb-2":
	{
		title: "A Juliabulb",

		featured: `A prior version of this image was featured in ${emu}.`,

		appletLink: "the-mandelbulb",

		driveId: "1kz4oy8A82NZsbtm2JcWmpKUEBkMfpjfa"
	},

	"newtons-method-extended":
	{
		title: "Newton&#x2019;s Method, Extended",

		parameters: /* html */`
			Generated from $\\sin(z)\\left( -\\sin\\left( \\operatorname{Im}(z) \\right) + i\\sin \\left( \\operatorname{Re} z \\right) \\right)$
		`,

		appletLink: "newtons-method-extended",

		driveId: "1yQCt0FaiBzQKM5h9RKh5akHs3wihil7B"
	},

	"chaos-game-2":
	{
		title: "A Chaos Game",

		appletLink: "the-chaos-game",

		driveId: "14ADChQ4KHV426ySW_CIVvTAXe2irMKU0"
	},

	"juliabulb-3":
	{
		title: "A Juliabulb",

		featured: `A prior version of this image was featured in ${emu}.`,

		appletLink: "the-mandelbulb",

		driveId: "1H1Rn6_RU9SWfFLPqo184EQ_otYxYKAlA"
	},



	"mandelbulb":
	{
		title: "The Mandelbulb",

		featured: `A prior version of this image was featured in ${jsma}, ${researchAsArt}, and ${bridges2022}. It is currently on display at the Eugene airport.`,

		appletLink: "the-mandelbulb",

		driveId: "1TsrHd6sEB3Wg2mxdFUiZwHxPhUsH7ZJv"
	},



	"double-pendulum-fractal":
	{
		title: "A Double Pendulum Fractal",

		appletLink: "double-pendulum-fractal",

		featured: `Featured in ${bridges2024}`,

		driveId: "1zkTbCjaQlwxsTdqDpyOVSUXcRRHjQ5eI"
	},

	"double-pendulum-fractal-2":
	{
		title: "A Double Pendulum Fractal",

		appletLink: "double-pendulum-fractal",

		driveId: "1Mo-R78eX10oNCc1Ywo9NlIpywK0Zfzxe"
	},

	"extruded-cube":
	{
		title: "An Extruded Cube",

		appletLink: "extruded-cube",
		
		driveId: "1hvfpRt6StCVqoCizzGTMHFrEpfZow4g0"
	},

	"menger-sponge-1":
	{
		title: "A Menger Sponge",

		appletLink: "menger-sponge",

		driveId: "10U01_WySYGeFe0iq5PA2uIBwQ4LQODh_"
	},

	"menger-sponge-2":
	{
		title: "A Menger Sponge",

		appletLink: "menger-sponge",

		driveId: "16fSQRq5Drql7SjmiuNOFvAEnJD7Z_QSe"
	}
};