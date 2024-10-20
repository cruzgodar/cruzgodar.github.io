/* eslint-disable quotes */

const bridges2022 = /* html */`the <a href='https://gallery.bridgesmathart.org/exhibitions/2022-bridges-conference'>2022 Bridges conference</a>`;
const bridges2023 = /* html */`the <a href='https://gallery.bridgesmathart.org/exhibitions/2023-bridges-conference'>2023 Bridges conference</a>`;
const bridges2024 = /* html */`the <a href='https://gallery.bridgesmathart.org/exhibitions/bridges-2024-exhibition-of-mathematical-art'>2024 Bridges conference</a>`;
const jsma = /* html */`the <a href='https://mpembed.com/show/?m=FGvT8EzPQpy&mpu=885'>Jordan Schnitzer Museum of Art</a>`;
const emu = /* html */`<a href='https://www.facebook.com/visualartsteam/videos/4909794042367446/'>UO&#x2019;s Erb Memorial Union</a>`;
const researchAsArt = /* html */`<a href='https://www.artscioregon.com/2020-gallery'>UO&#x2019;s 2020 Research as Art Competition</a> `;
const girlsAngle = /* html */`the <a href='https://www.girlsangle.org/page/bulletin-archive/GABv15n01E.pdf'>Girls&#x2019; Angle Bulletin magazine</a>`;

export const galleryImageData =
{
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

	"barnsley-fern":
	{
		title: "The Barnsley Fern",

		featured: `Featured in ${jsma} and ${girlsAngle}`,

		appletLink: "barnsley-fern",

		driveId: "1ED5_vAUhFEF0E3fcnY4NOEYJSVf1P7cA"
	},

	"brownian-tree":
	{
		title: "A Brownian Tree",

		featured: `Featured in ${emu}`,

		appletLink: "brownian-trees",

		driveId: "1BSuYpCW9jQKqu8NOu6f_6omr_LVMXprh"
	},

	"chaos-game":
	{
		title: "A Chaos Game",

		featured: `Featured in ${emu}`,

		appletLink: "chaos-game",

		driveId: "15NZyBmIqZxCaTrT9C9m87bqfM1sUmY5i"
	},

	"chaos-game-2":
	{
		title: "A Chaos Game",

		appletLink: "chaos-game",

		driveId: "14ADChQ4KHV426ySW_CIVvTAXe2irMKU0"
	},

	"complex-map":
	{
		title: "A Complex Map",

		parameters: /* html */`
			Generated from $e^{1/z}$
		`,

		appletLink: "complex-maps",

		driveId: "1rcF2qy4gGCJ3lg3X8jQW0Z0_OcFYKv8Q"
	},

	"double-pendulum-fractal":
	{
		title: "A Double Pendulum Fractal",

		appletLink: "double-pendulum-fractal",

		featured: `Featured in ${bridges2024}`,

		driveId: "1HO44mUVDz0A-A6xeY-uzUBahzwrNAdik"
	},

	"double-pendulum-fractal-2":
	{
		title: "A Double Pendulum Fractal",

		appletLink: "double-pendulum-fractal",

		driveId: "1VGx8gfIrp2gfKms7KOgWNdLeCEwfE0XE"
	},

	"extruded-cube":
	{
		title: "An Extruded Cube",

		appletLink: "extruded-cube",
		
		driveId: "130jI2YEQehE_VENFUDplZNSZHgbX_GN2"
	},
	
	"finite-subdivision":
	{
		title: "A Finite Subdivision",

		parameters: "6 vertices, 6 iterations",

		featured: `Featured in ${emu}`,

		appletLink: "finite-subdivisions",

		driveId: "1ohpmOx1bVGszGolKGxphW4qc15fghyIc"
	},

	"generalized-julia-set":
	{
		title: "A Generalized Julia Set",

		parameters: /* html */`
			Generated from $\\sin(cz)$
		`,

		featured: `Featured in ${emu}`,

		appletLink: "generalized-julia-sets",

		driveId: "1rgAIVr9Ztfs2EiVtY_39-GQ91ayeMJXu"
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

	"generalized-julia-set-3":
	{
		title: "A Generalized Julia Set",

		parameters: /* html */`
			Generated from $\\left( \\left| \\operatorname{Re} z \\right| - \\left| \\operatorname{Im} z \\right| \\right)^2 + c$
		`,

		appletLink: "generalized-julia-sets",

		driveId: "1ZOh2bya7QzuvSQqkM55cLxV3v-0MlET3"
	},

	"hitomezashi-pattern":
	{
		title: "A Hitomezashi Pattern",

		appletLink: "hitomezashi-patterns",

		driveId: "1JkngUmUdSEJvzYMRTTUIa3jy26F0c6m8"
	},

	"hopf-fibration":
	{
		title: "The Hopf Fibration",

		appletLink: "hopf-fibration",

		driveId: "1h8kmCtONHyUEX28IF2JzFNL-Qgn-TFEX"
	},

	"julia-set":
	{
		title: "A Julia Set",

		appletLink: "julia-set-explorer",

		driveId: "1She5ljhYilPIXpiSN80QyZEspWbnz6mu"
	},

	"juliabulb":
	{
		title: "A Juliabulb",

		featured: `A prior version of this image was featured in ${emu}.`,

		appletLink: "the-mandelbulb",

		driveId: "1s0hdeBUkJ1-ENlX7r78D-j5TjdLFt1rh"
	},

	"juliabulb-2":
	{
		title: "A Juliabulb",

		featured: `A prior version of this image was featured in ${emu}.`,

		appletLink: "the-mandelbulb",

		driveId: "1SvGDDc0Mz9Qv67GdIhy_5dfhHoP9thQd"
	},

	"juliabulb-3":
	{
		title: "A Juliabulb",

		featured: `A prior version of this image was featured in ${emu}.`,

		appletLink: "the-mandelbulb",

		driveId: "1mZ7hmt6z1Iq0POqgSXSh7NrmiOIdtYxC"
	},

	"kaleidoscopic-ifs":
	{
		title: "A Kaleidoscopic IFS Fractal",

		parameters: /* html */`
			Generated from a tetrahedron with scale $1.1679$, $\\theta_x = 1.762$, $\\theta_y = 1.377$, and $\\theta_z = 3.845$
		`,

		appletLink: "kaleidoscopic-ifs-fractals",

		driveId: "164SyXm3-le_Le1QuM_mDJoOZLChzTCDD"
	},

	"kaleidoscopic-ifs-2":
	{
		title: "A Kaleidoscopic IFS Fractal",

		parameters: /* html */`
			Generated from a cube with scale $1.2046$, $\\theta_x = 3.438$, $\\theta_y = 0.336$, and $\\theta_z = 2.396$
		`,

		appletLink: "kaleidoscopic-ifs-fractals",

		driveId: "13b99_5HrSgXamfVtAOPz5IGfiSdK19KC"
	},

	"kicked-rotator":
	{
		title: "A Kicked Rotator",

		parameters: /* html */`
			Generated with $K = 0.75$
		`,

		featured: `A prior version of this image was featured in ${jsma}. The current version was featured in ${emu}.`,

		appletLink: "kicked-rotator",

		driveId: "1vXP_8ArZg7F2o7rbFCsksoHDT3nw8y66"
	},

	"lyapunov-fractal":
	{
		title: "A Lyapunov Fractal",

		parameters: "Generating string <code>AABB</code>",

		appletLink: "lyapunov-fractals",

		driveId: "1Xb5BMuz-iB9f-CN4l5wyZtbCLLOXrz80"
	},

	"magic-carpet":
	{
		title: "A Magic Carpet",

		appletLink: "magic-carpets",

		driveId: "1bD3P4pzIU7M6Ni_lp9oSjtrwoAJQpJ98"
	},

	"mandelbulb":
	{
		title: "The Mandelbulb",

		featured: `A prior version of this image was featured in ${jsma}, ${researchAsArt}, and ${bridges2022}. It is currently on display at the Eugene airport.`,

		appletLink: "the-mandelbulb",

		driveId: "1aOwjMPuzRhguc7Q0x90uQFnIr61mkA7_"
	},

	"menger-sponge":
	{
		title: "A Menger Sponge",

		parameters: /* html */`
			Generated with scale $2.263$, $\\theta_x = 0.776$, $\\theta_y = 0.159$, and $\\theta_z = 1.477$
		`,

		appletLink: "menger-sponge",

		driveId: "1UlE8wy-gUUuTA-areWOJiKkCABcK1YqN"
	},

	"menger-sponge-2":
	{
		title: "A Menger Sponge",

		parameters: /* html */`
			Generated with scale $2.267$, $\\theta_x = 0.923$, $\\theta_y = 0.113$, and $\\theta_z = 0.957$
		`,

		appletLink: "menger-sponge",

		driveId: "1hRXwXnD7g1DQ7QepwqicbguoFXQRLy4s"
	},

	"newtons-method":
	{
		title: "Newton&#x2019;s Method",

		parameters: /* html */`
			Roots at $(\\pm 1, 0), (0, \\pm 1.5), (\\pm 1.5, \\pm 1.5)$
		`,

		featured: `A prior version of this image was featured in ${emu}.`,

		appletLink: "newtons-method",

		driveId: "1T8X5JduKEg8BkakXzGXZzu3CFW_R88i6"
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

	"quasi-fuchsian-group":
	{
		title: "A Quasi-Fuchsian Group",

		featured: `A prior version of this image was featured in ${emu}.`,

		appletLink: "quasi-fuchsian-groups",

		driveId: "1mAQCyO3bHIL7yAV1I8uxVFmLBGbhQwRQ"
	},

	"quaternionic-julia-set":
	{
		title: "A Quaternionic Julia Set",

		parameters: /* html */`
			Generated with $c = (-0.54, -0.25, -0.668, 0)$
		`,

		featured: `A prior version of this image was featured in ${bridges2023}.`,

		appletLink: "quaternionic-julia-sets",

		driveId: "1L2juSwwawdW322PyVNIej1DM0m0vHekk"
	},
		
	"secant-method":
	{
		title: "The Secant Method",

		parameters: /* html */`
			Generated from the polynomial $z^6 - 1$ with $a = 1.5$
		`,

		appletLink: "newtons-method",

		featured: `Featured in ${emu}`,

		driveId: "1XaNHxtiX5oA9KcLGs8ZSPFJwpDWt4mPk"
	},

	"snowflake":
	{
		title: "A Gravner-Griffeath Snowflake",

		appletLink: "snowflakes",

		featured: `A prior version of this image was featured in ${emu}.`,

		driveId: "1G4GWlWJvQWlP04IxWpNGmVCfwj0RZnX0"
	},

	"strange-attractor":
	{
		title: "A Lorenz Attractor",

		appletLink: "strange-attractors",

		driveId: "1sRCKC-WE8a2iYNW942uKgAJbHVkAYDrQ"
	},

	"thurston-geometry-e3":
	{
		title: "The Thurston Geometry $\\mathbb{E}^3$",

		appletLink: "thurston-geometries",

		driveId: "1XqXEVoe82btwYcTolWTKT3tlsWz_98c0"
	},

	"thurston-geometry-h2xe":
	{
		title: "The Thurston Geometry $\\mathbb{H}^2 \\times \\mathbb{E}$",

		appletLink: "thurston-geometries",

		driveId: "1LCBMWW4n8IcF3_bGo4up4dcO0ISDqH0n"
	},

	"thurston-geometry-h3":
	{
		title: "The Thurston Geometry $\\mathbb{H}^3$",

		appletLink: "thurston-geometries",

		driveId: "1wm59bChDwRgm91lONQR1bVKTCBKGWien"
	},

	"thurston-geometry-nil":
	{
		title: "The Thurston Geometry Nil",

		appletLink: "thurston-geometries",

		driveId: "1-1h44Q9CEVGqyCkkxAQ-ykODsVzWYKwE"
	},

	"thurston-geometry-s2xe":
	{
		title: "The Thurston Geometry $S^2 \\times \\mathbb{E}$",

		appletLink: "thurston-geometries",

		driveId: "1bA57Lhq12oJ1W611UkRjOwuTs8mIXtm-"
	},

	"thurston-geometry-s3":
	{
		title: "The Thurston Geometry $S^3$",

		appletLink: "thurston-geometries",

		driveId: "1yvG5KfAg7qiYjzBDuXDilaSV23X-KyzB"
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

	"vector-field":
	{
		title: "A Vector Field",

		parameters: /* html */`
			Generated from $\\left( \\sin\\left( \\frac{y}{2.5} \\right), \\tan\\left( \\frac{x}{2.5} \\right) \\right)$
		`,

		appletLink: "vector-fields",

		driveId: "1DyYo2hLpJ-9NjwW_akmmmq3pmnS9VKPa"
	},

	"voronoi-diagram":
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

	"wilsons-algorithm":
	{
		title: "Wilson&#x2019;s Algorithm",

		featured: `A prior version of this image was featured in ${jsma} and ${girlsAngle}. This version was featured in ${emu} and ${bridges2024}.`,

		appletLink: "wilsons-algorithm",

		driveId: "1EJD5tYppybnvAxK1bWpLEXK2gjKAnMqZ"
	},
};