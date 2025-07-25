/* eslint-disable quotes */

const bridges2022 = /* html */`the <a href="https://gallery.bridgesmathart.org/exhibitions/2022-bridges-conference">2022 Bridges conference</a>`;
const bridges2023 = /* html */`the <a href="https://gallery.bridgesmathart.org/exhibitions/2023-bridges-conference">2023 Bridges conference</a>`;
const bridges2024 = /* html */`the <a href="https://gallery.bridgesmathart.org/exhibitions/bridges-2024-exhibition-of-mathematical-art">2024 Bridges conference</a>`;
const jsma = /* html */`the <a href="https://mpembed.com/show/?m=FGvT8EzPQpy&mpu=885">Jordan Schnitzer Museum of Art</a>`;
const emu = /* html */`<a href="https://www.facebook.com/visualartsteam/videos/4909794042367446/">UO&#x2019;s Erb Memorial Union</a>`;
const researchAsArt = /* html */`<a href="https://www.artscioregon.com/2020-gallery">UO&#x2019;s 2020 Research as Art Competition</a>`;
const girlsAngle = /* html */`the <a href="https://www.girlsangle.org/page/bulletin-archive/GABv15n01E.pdf">Girls&#x2019; Angle Bulletin magazine</a>`;

export const galleryImageData =
{
	"abelian-sandpile":
	{
		title: "An Abelian Sandpile",

		// eslint-disable-next-line max-len
		appletLink: "/applets/abelian-sandpiles/?palettes-dropdown=nectarine&surrounding-grains-input=2",

		parameters: /* html */`
			Generated with 4000000 center grains, 2 surrounding grains, and a grid size of 3001.
		`,

		driveId: "1YKzPisfXzOYcovQFJgB4XYR7gMVVHNpz"
	},

	"aztec-diamond":
	{
		title: "An Aztec Diamond",

		appletLink: "/applets/domino-shuffling",

		driveId: "1XaoTpV0dKscPtOvrjU6sUuD1Mo-pyQzH"
	},

	"barnsley-fern":
	{
		title: "The Barnsley Fern",

		featured: `Featured in ${jsma} and ${girlsAngle}`,

		appletLink: "/applets/barnsley-fern",

		driveId: "1ED5_vAUhFEF0E3fcnY4NOEYJSVf1P7cA"
	},

	"brownian-tree":
	{
		title: "A Brownian Tree",

		featured: `Featured in ${emu}`,

		appletLink: "/applets/brownian-trees",

		driveId: "1BSuYpCW9jQKqu8NOu6f_6omr_LVMXprh"
	},

	"chaos-game":
	{
		title: "A Chaos Game",

		appletLink: "/applets/chaos-game/?num-vertices-input=6",

		driveId: "14ADChQ4KHV426ySW_CIVvTAXe2irMKU0"
	},

	"double-pendulum-fractal":
	{
		title: "A Double Pendulum Fractal",

		appletLink: "/applets/double-pendulum-fractal",

		featured: `Featured in ${bridges2024}`,

		driveId: "1HO44mUVDz0A-A6xeY-uzUBahzwrNAdik"
	},

	"double-pendulum-fractal-2":
	{
		title: "A Double Pendulum Fractal",

		appletLink: "/applets/double-pendulum-fractal/?center-unstable-equilibrium-checkbox=1",

		driveId: "1VGx8gfIrp2gfKms7KOgWNdLeCEwfE0XE"
	},

	"extruded-cube":
	{
		title: "An Extruded Cube",

		appletLink: "/applets/extruded-cube",
		
		driveId: "130jI2YEQehE_VENFUDplZNSZHgbX_GN2"
	},
	
	"finite-subdivision":
	{
		title: "A Finite Subdivision",

		parameters: "6 vertices, 6 iterations",

		featured: `Featured in ${emu}`,

		appletLink: "/applets/finite-subdivisions/?num-iterations-input=6",

		driveId: "1ohpmOx1bVGszGolKGxphW4qc15fghyIc"
	},

	"generalized-julia-set":
	{
		title: "A Generalized Julia Set",

		parameters: /* html */`
			Generated from $\\sin(cz)$
		`,

		featured: `Featured in ${emu}`,

		appletLink: "/applets/generalized-julia-sets/?examples-dropdown=trig",

		driveId: "1rgAIVr9Ztfs2EiVtY_39-GQ91ayeMJXu"
	},

	"generalized-julia-set-2":
	{
		title: "A Generalized Julia Set",

		parameters: /* html */`
			Generated from $z^2 - 0.05z^{-2} + c$
		`,

		featured: `Featured in ${emu}`,

		appletLink: "/applets/generalized-julia-sets/?examples-dropdown=rationalMap",

		driveId: "16LcsF7n7w329sO4T-IwWb-p7ykpglNQO"
	},

	"generalized-julia-set-3":
	{
		title: "A Generalized Julia Set",

		parameters: /* html */`
			Generated from $\\left( \\left| \\operatorname{Re} z \\right| - \\left| \\operatorname{Im} z \\right| \\right)^2 + c$
		`,

		appletLink: "/applets/generalized-julia-sets/?examples-dropdown=burningShip",

		driveId: "1ZOh2bya7QzuvSQqkM55cLxV3v-0MlET3"
	},

	"hitomezashi-pattern":
	{
		title: "A Hitomezashi Pattern",

		appletLink: "/applets/hitomezashi-patterns",

		driveId: "1JkngUmUdSEJvzYMRTTUIa3jy26F0c6m8"
	},

	"hopf-fibration":
	{
		title: "The Hopf Fibration",

		// eslint-disable-next-line max-len
		appletLink: "/applets/hopf-fibration/?latitudes-slider=4.947382&toggle-compression-button=1&core-slider=0.75&longitudes-slider=94.195608",

		driveId: "1h8kmCtONHyUEX28IF2JzFNL-Qgn-TFEX"
	},

	"julia-set":
	{
		title: "A Julia Set",

		appletLink: "/applets/julia-set-explorer",

		driveId: "1She5ljhYilPIXpiSN80QyZEspWbnz6mu"
	},

	"juliabulb":
	{
		title: "A Juliabulb",

		featured: `A prior version of this image was featured in ${emu}.`,

		appletLink: "/applets/mandelbulb/?switch-bulb-button=1&c-x-slider=0.8",

		driveId: "1s0hdeBUkJ1-ENlX7r78D-j5TjdLFt1rh"
	},

	"juliabulb-2":
	{
		title: "A Juliabulb",

		featured: `A prior version of this image was featured in ${emu}.`,

		appletLink: "/applets/mandelbulb/?switch-bulb-button=1&c-y-slider=0.8",

		driveId: "1SvGDDc0Mz9Qv67GdIhy_5dfhHoP9thQd"
	},

	"juliabulb-3":
	{
		title: "A Juliabulb",

		featured: `A prior version of this image was featured in ${emu}.`,

		appletLink: "/applets/mandelbulb/?switch-bulb-button=1&c-z-slider=-0.8",

		driveId: "1mZ7hmt6z1Iq0POqgSXSh7NrmiOIdtYxC"
	},

	"juliabulb-power-2":
	{
		title: "A Juliabulb",

		// eslint-disable-next-line max-len
		appletLink: "/applets/mandelbulb/?debug=1&switch-bulb-button=1&c-x-slider=1&c-z-slider=-.336&power-slider=2",

		driveId: "1PNVXqlPub0RNvj3EpyYj0kiLi3YwnPvj"
	},

	"juliabulb-zoom":
	{
		title: "A Juliabulb",

		// eslint-disable-next-line max-len
		appletLink: "/applets/mandelbulb/?switch-bulb-button=1&c-x-slider=0.8&lock-on-origin-checkbox=0",

		driveId: "1AAENn9-QgCVjTYaFP_HcPcDjakM0pBYc"
	},

	"juliabulb-zoom-2":
	{
		title: "A Juliabulb",

		// eslint-disable-next-line max-len
		appletLink: "/applets/mandelbulb/?switch-bulb-button=1&c-z-slider=-0.825591&switch-bulb-button=1&c-x-slider=-0.062753&lock-on-origin-checkbox=0",

		driveId: "1i7jSyoBnkKF0CG-PdrwBFPccIgyzJbFh"
	},

	"kaleidoscopic-ifs":
	{
		title: "A Kaleidoscopic IFS Fractal",

		parameters: /* html */`
			Generated from a tetrahedron with scale $1.1679$, $\\theta_x = 1.762$, $\\theta_y = 1.377$, and $\\theta_z = 3.845$
		`,

		// eslint-disable-next-line max-len
		appletLink: "/applets/kaleidoscopic-ifs-fractals/?polyhedra-dropdown=tetrahedron&rotation-angle-x-slider=1.762&rotation-angle-y-slider=1.377&rotation-angle-z-slider=3.845&scale-slider=1.1679",

		driveId: "17-UW2b0uTMbv-VYDVRstnkge-8D4sdDT"
	},

	"kaleidoscopic-ifs-2":
	{
		title: "A Kaleidoscopic IFS Fractal",

		parameters: /* html */`
			Generated from a cube with scale $1.2046$, $\\theta_x = 3.438$, $\\theta_y = 0.336$, and $\\theta_z = 2.396$
		`,

		// eslint-disable-next-line max-len
		appletLink: "/applets/kaleidoscopic-ifs-fractals/?polyhedra-dropdown=cube&rotation-angle-x-slider=3.438&rotation-angle-y-slider=0.336&rotation-angle-z-slider=2.396&scale-slider=1.2046",

		driveId: "1GSG-LNt7oqQjE-pmO8TfsgAvZDQ9wA1_"
	},

	"kaleidoscopic-ifs-3":
	{
		title: "A Kaleidoscopic IFS Fractal",

		parameters: /* html */`
			Generated from a tetrahedron with scale $1.3299$, $\\theta_x = 0.068$, $\\theta_y = 2.468$, and $\\theta_z = 0.448$
		`,

		// eslint-disable-next-line max-len
		appletLink: "/applets/kaleidoscopic-ifs-fractals/?polyhedra-dropdown=tetrahedron&rotation-angle-x-slider=0.068&rotation-angle-y-slider=2.468&rotation-angle-z-slider=0.448&scale-slider=1.3299",

		driveId: "1iwHMZWhC1vTKv9IvTNRSVRPfEis3x3dP"
	},

	"kicked-rotator":
	{
		title: "A Kicked Rotator",

		parameters: /* html */`
			Generated with $K = 0.75$
		`,

		featured: `A prior version of this image was featured in ${jsma}. The current version was featured in ${emu}.`,

		appletLink: "/applets/kicked-rotator",

		driveId: "1vXP_8ArZg7F2o7rbFCsksoHDT3nw8y66"
	},

	"lyapunov-fractal":
	{
		title: "A Lyapunov Fractal",

		parameters: "Generating string <code>AABB</code>",

		appletLink: "/applets/lyapunov-fractals/?generating-string-input=AABB",

		driveId: "1Xb5BMuz-iB9f-CN4l5wyZtbCLLOXrz80"
	},

	"magic-carpet":
	{
		title: "A Magic Carpet",

		appletLink: "/applets/magic-carpets",

		driveId: "1bD3P4pzIU7M6Ni_lp9oSjtrwoAJQpJ98"
	},

	"mandelbulb":
	{
		title: "The Mandelbulb",

		featured: `A prior version of this image was featured in ${jsma}, ${researchAsArt}, and ${bridges2022}. It is currently on display at the Eugene airport.`,

		appletLink: "/applets/mandelbulb",

		driveId: "1aOwjMPuzRhguc7Q0x90uQFnIr61mkA7_"
	},

	"maurer-rose":
	{
		title: "A Maurer Rose",

		appletLink: "/applets/maurer-roses",

		driveId: "1RolPnj-o5o1havy0jii4XPIa_iw9JID-"
	},

	"maurer-rose-2":
	{
		title: "A Maurer Rose",

		appletLink: "/applets/maurer-roses",

		driveId: "1J9qEixnXoO-JgoS0hYVvLLUiDU0hVQ16"
	},

	"menger-sponge":
	{
		title: "A Menger Sponge",

		parameters: /* html */`
			Generated with scale $2.267$, $\\theta_x = 0.923$, $\\theta_y = 0.113$, and $\\theta_z = 0.957$
		`,

		// eslint-disable-next-line max-len
		appletLink: "/applets/menger-sponge/?scale-slider=2.267&rotation-angle-x-slider=0.923&rotation-angle-z-slider=0.957&rotation-angle-y-slider=0.113",

		driveId: "1UlE8wy-gUUuTA-areWOJiKkCABcK1YqN"
	},

	"menger-sponge-2":
	{
		title: "A Menger Sponge",

		parameters: /* html */`
			Generated with scale $2.263$, $\\theta_x = 0.776$, $\\theta_y = 0.159$, and $\\theta_z = 1.477$
		`,

		// eslint-disable-next-line max-len
		appletLink: "/applets/menger-sponge/?scale-slider=2.263&rotation-angle-x-slider=0.776&rotation-angle-z-slider=1.477&rotation-angle-y-slider=0.159",

		driveId: "1hRXwXnD7g1DQ7QepwqicbguoFXQRLy4s"
	},

	"newtons-method":
	{
		title: "Newton&#x2019;s Method",

		parameters: /* html */`
			Roots at $(\\pm 1, 0), (0, \\pm 1.5), (\\pm 1.5, \\pm 1.5)$
		`,

		appletLink: "/applets/newtons-method",

		driveId: "1RlX0QW3PeGd-ec3jAHKZsZChaiwJpF6-"
	},

	"newtons-method-extended":
	{
		title: "Newton&#x2019;s Method, Extended",

		parameters: /* html */`
			Generated from $\\sin(z)\\left( -\\sin\\left( \\operatorname{Im}(z) \\right) + i\\sin \\left( \\operatorname{Re} z \\right) \\right)$
		`,

		appletLink: "/applets/newtons-method-extended",

		driveId: "1yQCt0FaiBzQKM5h9RKh5akHs3wihil7B"
	},

	"quasi-fuchsian-group":
	{
		title: "A Quasi-Fuchsian Group",

		featured: `A prior version of this image was featured in ${emu}.`,

		appletLink: "/applets/quasi-fuchsian-groups",

		driveId: "1mAQCyO3bHIL7yAV1I8uxVFmLBGbhQwRQ"
	},

	"quaternionic-julia-set":
	{
		title: "A Quaternionic Julia Set",

		parameters: /* html */`
			Generated with $c = (-0.54, -0.25, -0.668, 0)$
		`,

		featured: `A prior version of this image was featured in ${bridges2023}.`,

		appletLink: "/applets/quaternionic-julia-sets",

		driveId: "1L2juSwwawdW322PyVNIej1DM0m0vHekk"
	},
		
	"secant-method":
	{
		title: "The Secant Method",

		parameters: /* html */`
			Generated from the polynomial $z^6 - 1$ with $a = 1.15$
		`,

		appletLink: "/applets/newtons-method/?switch-method-button=1",

		featured: `A prior version of this image was featured in ${emu}.`,

		driveId: "1V5EYzz_CjgNRAx2zVd1Jeb2hsO9bGBqI"
	},

	"snowflake":
	{
		title: "A Gravner-Griffeath Snowflake",

		appletLink: "/applets/snowflakes",

		featured: `A prior version of this image was featured in ${emu}.`,

		driveId: "1G4GWlWJvQWlP04IxWpNGmVCfwj0RZnX0"
	},

	"strange-attractor":
	{
		title: "A Lorenz Attractor",

		appletLink: "/applets/strange-attractors",

		driveId: "1sRCKC-WE8a2iYNW942uKgAJbHVkAYDrQ"
	},

	"thurston-geometry-e3":
	{
		title: "The Thurston Geometry $\\mathbb{E}^3$",

		appletLink: "/applets/thurston-geometries/?geometries-dropdown=e3",

		driveId: "1XqXEVoe82btwYcTolWTKT3tlsWz_98c0"
	},

	"thurston-geometry-h2xe":
	{
		title: "The Thurston Geometry $\\mathbb{H}^2 \\times \\mathbb{E}$",

		appletLink: "/applets/thurston-geometries/?geometries-dropdown=h2xe&switch-scene-button=1",

		driveId: "1LCBMWW4n8IcF3_bGo4up4dcO0ISDqH0n"
	},

	"thurston-geometry-h3":
	{
		title: "The Thurston Geometry $\\mathbb{H}^3$",

		appletLink: "/applets/thurston-geometries/?geometries-dropdown=h3&switch-scene-button=1",

		driveId: "1wm59bChDwRgm91lONQR1bVKTCBKGWien"
	},

	"thurston-geometry-nil":
	{
		title: "The Thurston Geometry Nil",

		appletLink: "/applets/thurston-geometries/?geometries-dropdown=nil&switch-scene-button=1",

		driveId: "1-1h44Q9CEVGqyCkkxAQ-ykODsVzWYKwE"
	},

	"thurston-geometry-s2xe":
	{
		title: "The Thurston Geometry $S^2 \\times \\mathbb{E}$",

		appletLink: "/applets/thurston-geometries/?geometries-dropdown=s2xe&switch-scene-button=1",

		driveId: "1bA57Lhq12oJ1W611UkRjOwuTs8mIXtm-"
	},

	"thurston-geometry-s3":
	{
		title: "The Hopf Fibration in $S^3$",

		appletLink: "/applets/thurston-geometries/?geometries-dropdown=s3",

		driveId: "1yvG5KfAg7qiYjzBDuXDilaSV23X-KyzB"
	},

	"thurston-geometry-sl2r":
	{
		title: "The Thurston Geometry $\\widetilde{\\operatorname{SL}}(2, \\mathbb{R})$",

		appletLink: "/applets/thurston-geometries/?geometries-dropdown=sl2r",

		driveId: "1XBJVX2kWVWz1dH06DIAVlDeqr21ei8Ty"
	},

	"thurston-geometry-sol":
	{
		title: "The Thurston Geometry Sol",

		appletLink: "/applets/thurston-geometries/?geometries-dropdown=sol&switch-scene-button=1",

		driveId: "1Pz0IUsM43_-qEXIf27CWzjOkTnMyLXz6"
	},

	"voronoi-diagram":
	{
		title: "A Voronoi Diagram",

		parameters: /* html */`
			Generated with metric $1$
		`,

		appletLink: "/applets/voronoi-diagrams/?metric-slider=0",

		driveId: "1TrBXxbjYeHMbznxnT1NiNXWSj8jVBthA"
	},

	"wilsons-algorithm":
	{
		title: "Wilson&#x2019;s Algorithm",

		featured: `A prior version of this image was featured in ${jsma} and ${girlsAngle}. This version was featured in ${emu} and ${bridges2024}.`,

		appletLink: "/applets/wilsons-algorithm",

		driveId: "1EJD5tYppybnvAxK1bWpLEXK2gjKAnMqZ"
	},
};