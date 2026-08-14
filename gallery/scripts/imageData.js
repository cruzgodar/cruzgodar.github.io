/* eslint-disable quotes */

const bridges2022 = /* html */`the <a href="https://gallery.bridgesmathart.org/exhibitions/2022-bridges-conference">2022 Bridges conference</a>`;
const bridges2023 = /* html */`the <a href="https://gallery.bridgesmathart.org/exhibitions/2023-bridges-conference">2023 Bridges conference</a>`;
const bridges2024 = /* html */`the <a href="https://gallery.bridgesmathart.org/exhibitions/bridges-2024-exhibition-of-mathematical-art">2024 Bridges conference</a>`;
const jsma = /* html */`the <a href="https://mpembed.com/show/?m=FGvT8EzPQpy&mpu=885">Jordan Schnitzer Museum of Art</a>`;
const emu = /* html */`<a href="https://www.facebook.com/visualartsteam/videos/4909794042367446/">UO&#x2019;s Erb Memorial Union</a>`;
const researchAsArt = /* html */`<a href="https://www.artscioregon.com/2020-gallery">UO&#x2019;s 2020 Research as Art Competition</a>`;
const girlsAngle = /* html */`the <a href="https://www.girlsangle.org/page/bulletin-archive/GABv15n01E.pdf">Girls&#x2019; Angle Bulletin magazine</a>`;

// Full-res images live as assets on a GitHub release rather than in the repo,
// since they're far too big to commit. Their urls are determined by their ids,
// so there's nothing to store here --- see buildGallery() in build/bin/cggallery.js.
export const galleryFullResTag = "gallery-full-res";

export const galleryFullResUrl = id => `https://github.com/cruzgodar/cruzgodar.github.io/releases/download/${galleryFullResTag}/${id}.png`;

export const galleryImageData =
{
	"abelian-sandpile":
	{
		title: "An Abelian Sandpile",

		// eslint-disable-next-line max-len
		appletLink: "/applets/abelian-sandpiles/?palettes-dropdown=nectarine&surrounding-grains-input=2",

		parameters: /* html */`
			Generated with 4000000 center grains, 2 surrounding grains, and a grid size of 3001.
		`
	},

	"aztec-diamond":
	{
		title: "An Aztec Diamond",

		appletLink: "/applets/domino-shuffling"
	},

	"barnsley-fern":
	{
		title: "The Barnsley Fern",

		featured: `Featured in ${jsma} and ${girlsAngle}`,

		appletLink: "/applets/barnsley-fern"
	},

	"brownian-tree":
	{
		title: "A Brownian Tree",

		featured: `Featured in ${emu}`,

		appletLink: "/applets/brownian-trees"
	},

	"chaos-game":
	{
		title: "A Chaos Game",

		appletLink: "/applets/chaos-game/?num-vertices-input=6"
	},

	"double-pendulum-fractal":
	{
		title: "A Double Pendulum Fractal",

		appletLink: "/applets/double-pendulum-fractal",

		featured: `Featured in ${bridges2024}`
	},

	"double-pendulum-fractal-2":
	{
		title: "A Double Pendulum Fractal",

		appletLink: "/applets/double-pendulum-fractal/?center-unstable-equilibrium-checkbox=1"
	},

	"extruded-cube":
	{
		title: "An Extruded Cube",

		appletLink: "/applets/extruded-cube"
	},
	
	"finite-subdivision":
	{
		title: "A Finite Subdivision",

		parameters: "6 vertices, 6 iterations",

		featured: `Featured in ${emu}`,

		appletLink: "/applets/finite-subdivisions/?num-iterations-input=6"
	},

	"generalized-julia-set-2":
	{
		title: "A Generalized Julia Set",

		parameters: /* html */`
			Generated from $z^2 - 0.05z^{-2} + c$
		`,

		featured: `Featured in ${emu}`,

		appletLink: "/applets/generalized-julia-sets/?examples-dropdown=rationalMap"
	},

	"generalized-julia-set-3":
	{
		title: "A Generalized Julia Set",

		parameters: /* html */`
			Generated from $\\left( \\left| \\operatorname{Re} z \\right| - \\left| \\operatorname{Im} z \\right| \\right)^2 + c$
		`,

		appletLink: "/applets/generalized-julia-sets/?examples-dropdown=burningShip"
	},

	"hitomezashi-pattern":
	{
		title: "A Hitomezashi Pattern",

		appletLink: "/applets/hitomezashi-patterns"
	},

	"hopf-fibration":
	{
		title: "The Hopf Fibration",

		// eslint-disable-next-line max-len
		appletLink: "/applets/hopf-fibration/?latitudes-slider=4.947382&toggle-compression-button=1&core-slider=0.75&longitudes-slider=94.195608"
	},

	"julia-set":
	{
		title: "A Julia Set",

		appletLink: "/applets/julia-set-explorer"
	},

	"juliabulb":
	{
		title: "A Juliabulb",

		featured: `A prior version of this image was featured in ${emu}.`,

		appletLink: "/applets/mandelbulb/?switch-bulb-button=1&c-x-slider=0.8"
	},

	"juliabulb-2":
	{
		title: "A Juliabulb",

		featured: `A prior version of this image was featured in ${emu}.`,

		appletLink: "/applets/mandelbulb/?switch-bulb-button=1&c-y-slider=0.8"
	},

	"juliabulb-3":
	{
		title: "A Juliabulb",

		featured: `A prior version of this image was featured in ${emu}.`,

		appletLink: "/applets/mandelbulb/?switch-bulb-button=1&c-z-slider=-0.8"
	},

	"juliabulb-power-2":
	{
		title: "A Juliabulb",

		// eslint-disable-next-line max-len
		appletLink: "/applets/mandelbulb/?debug=1&switch-bulb-button=1&c-x-slider=1&c-z-slider=-.336&power-slider=2"
	},

	"juliabulb-zoom":
	{
		title: "A Juliabulb",

		// eslint-disable-next-line max-len
		appletLink: "/applets/mandelbulb/?switch-bulb-button=1&c-x-slider=0.8&lock-on-origin-checkbox=0"
	},

	"juliabulb-zoom-2":
	{
		title: "A Juliabulb",

		// eslint-disable-next-line max-len
		appletLink: "/applets/mandelbulb/?switch-bulb-button=1&c-z-slider=-0.825591&switch-bulb-button=1&c-x-slider=-0.062753&lock-on-origin-checkbox=0"
	},

	"kaleidoscopic-ifs":
	{
		title: "A Kaleidoscopic IFS Fractal",

		parameters: /* html */`
			Generated from a tetrahedron with scale $1.1679$, $\\theta_x = 1.762$, $\\theta_y = 1.377$, and $\\theta_z = 3.845$
		`,

		// eslint-disable-next-line max-len
		appletLink: "/applets/kaleidoscopic-ifs-fractals/?polyhedra-dropdown=tetrahedron&rotation-angle-x-slider=1.762&rotation-angle-y-slider=1.377&rotation-angle-z-slider=3.845&scale-slider=1.1679"
	},

	"kaleidoscopic-ifs-2":
	{
		title: "A Kaleidoscopic IFS Fractal",

		parameters: /* html */`
			Generated from a cube with scale $1.2046$, $\\theta_x = 3.438$, $\\theta_y = 0.336$, and $\\theta_z = 2.396$
		`,

		// eslint-disable-next-line max-len
		appletLink: "/applets/kaleidoscopic-ifs-fractals/?polyhedra-dropdown=cube&rotation-angle-x-slider=3.438&rotation-angle-y-slider=0.336&rotation-angle-z-slider=2.396&scale-slider=1.2046"
	},

	"kaleidoscopic-ifs-3":
	{
		title: "A Kaleidoscopic IFS Fractal",

		parameters: /* html */`
			Generated from a tetrahedron with scale $1.3299$, $\\theta_x = 0.068$, $\\theta_y = 2.468$, and $\\theta_z = 0.448$
		`,

		// eslint-disable-next-line max-len
		appletLink: "/applets/kaleidoscopic-ifs-fractals/?polyhedra-dropdown=tetrahedron&rotation-angle-x-slider=0.068&rotation-angle-y-slider=2.468&rotation-angle-z-slider=0.448&scale-slider=1.3299"
	},

	"kicked-rotator":
	{
		title: "A Kicked Rotator",

		parameters: /* html */`
			Generated with $K = 0.75$
		`,

		featured: `A prior version of this image was featured in ${jsma}. The current version was featured in ${emu}.`,

		appletLink: "/applets/kicked-rotator"
	},

	"lyapunov-fractal":
	{
		title: "A Lyapunov Fractal",

		parameters: "Generating string <code>AABB</code>",

		appletLink: "/applets/lyapunov-fractals/?generating-string-input=AABB"
	},

	"magic-carpet":
	{
		title: "A Magic Carpet",

		appletLink: "/applets/magic-carpets"
	},

	"mandelbulb":
	{
		title: "The Mandelbulb",

		featured: `A prior version of this image was featured in ${jsma}, ${researchAsArt}, and ${bridges2022}. It is currently on display at the Eugene airport.`,

		appletLink: "/applets/mandelbulb"
	},

	"maurer-rose":
	{
		title: "A Maurer Rose",

		appletLink: "/applets/maurer-roses"
	},

	"maurer-rose-2":
	{
		title: "A Maurer Rose",

		appletLink: "/applets/maurer-roses"
	},

	"menger-sponge":
	{
		title: "A Menger Sponge",

		parameters: /* html */`
			Generated with scale $2.267$, $\\theta_x = 0.923$, $\\theta_y = 0.113$, and $\\theta_z = 0.957$
		`,

		// eslint-disable-next-line max-len
		appletLink: "/applets/menger-sponge/?scale-slider=2.267&rotation-angle-x-slider=0.923&rotation-angle-z-slider=0.957&rotation-angle-y-slider=0.113"
	},

	"menger-sponge-2":
	{
		title: "A Menger Sponge",

		parameters: /* html */`
			Generated with scale $2.263$, $\\theta_x = 0.776$, $\\theta_y = 0.159$, and $\\theta_z = 1.477$
		`,

		// eslint-disable-next-line max-len
		appletLink: "/applets/menger-sponge/?scale-slider=2.263&rotation-angle-x-slider=0.776&rotation-angle-z-slider=1.477&rotation-angle-y-slider=0.159"
	},

	"newtons-method":
	{
		title: "Newton&#x2019;s Method",

		parameters: /* html */`
			Roots at $(\\pm 1, 0), (0, \\pm 1.5), (\\pm 1.5, \\pm 1.5)$
		`,

		appletLink: "/applets/newtons-method"
	},

	"newtons-method-extended":
	{
		title: "Newton&#x2019;s Method, Extended",

		parameters: /* html */`
			Generated from $\\sin(z)\\left( -\\sin\\left( \\operatorname{Im}(z) \\right) + i\\sin \\left( \\operatorname{Re} z \\right) \\right)$
		`,

		appletLink: "/applets/newtons-method-extended"
	},

	"quasi-fuchsian-group":
	{
		title: "A Quasi-Fuchsian Group",

		featured: `A prior version of this image was featured in ${emu}.`,

		appletLink: "/applets/quasi-fuchsian-groups"
	},

	"quaternionic-julia-set":
	{
		title: "A Quaternionic Julia Set",

		parameters: /* html */`
			Generated with $c = (-0.54, -0.25, -0.668, 0)$
		`,

		featured: `A prior version of this image was featured in ${bridges2023}.`,

		appletLink: "/applets/quaternionic-julia-sets"
	},
		
	"secant-method":
	{
		title: "The Secant Method",

		parameters: /* html */`
			Generated from the polynomial $z^6 - 1$ with $a = 0.115$
		`,

		appletLink: "/applets/newtons-method/?switch-method-button=1",

		featured: `A prior version of this image was featured in ${emu}.`
	},

	"snowflake":
	{
		title: "A Gravner-Griffeath Snowflake",

		appletLink: "/applets/snowflakes",

		featured: `A prior version of this image was featured in ${emu}.`
	},

	"thurston-geometry-e3":
	{
		title: "The Thurston Geometry $\\mathbb{E}^3$",

		appletLink: "/applets/thurston-geometries/?geometries-dropdown=e3"
	},

	"thurston-geometry-h2xe":
	{
		title: "The Thurston Geometry $\\mathbb{H}^2 \\times \\mathbb{E}$",

		appletLink: "/applets/thurston-geometries/?geometries-dropdown=h2xe&switch-scene-button=1"
	},

	"thurston-geometry-h3":
	{
		title: "The Thurston Geometry $\\mathbb{H}^3$",

		appletLink: "/applets/thurston-geometries/?geometries-dropdown=h3&switch-scene-button=1"
	},

	"thurston-geometry-nil":
	{
		title: "The Thurston Geometry Nil",

		appletLink: "/applets/thurston-geometries/?geometries-dropdown=nil&switch-scene-button=1"
	},

	"thurston-geometry-s2xe":
	{
		title: "The Thurston Geometry $S^2 \\times \\mathbb{E}$",

		appletLink: "/applets/thurston-geometries/?geometries-dropdown=s2xe&switch-scene-button=1"
	},

	"thurston-geometry-s3":
	{
		title: "The Hopf Fibration in $S^3$",

		appletLink: "/applets/thurston-geometries/?geometries-dropdown=s3"
	},

	"thurston-geometry-sl2r":
	{
		title: "The Thurston Geometry $\\widetilde{\\operatorname{SL}}(2, \\mathbb{R})$",

		appletLink: "/applets/thurston-geometries/?geometries-dropdown=sl2r"
	},

	"thurston-geometry-sol":
	{
		title: "The Thurston Geometry Sol",

		appletLink: "/applets/thurston-geometries/?geometries-dropdown=sol&switch-scene-button=1"
	},

	"voronoi-diagram":
	{
		title: "A Voronoi Diagram",

		parameters: /* html */`
			Generated with metric $1$
		`,

		appletLink: "/applets/voronoi-diagrams/?metric-slider=0"
	},

	"wilsons-algorithm":
	{
		title: "Wilson&#x2019;s Algorithm",

		featured: `A prior version of this image was featured in ${jsma} and ${girlsAngle}. This version was featured in ${emu} and ${bridges2024}.`,

		appletLink: "/applets/wilsons-algorithm"
	},
};