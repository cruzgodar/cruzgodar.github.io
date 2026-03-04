import { VectorField } from "/applets/vector-fields/scripts/class.js";
import { createEphemeralApplet, hsvToHex } from "/scripts/applets/applet.js";
import { Dropdown } from "/scripts/components/dropdowns.js";
import {
	createDesmosGraphs, desmosColors,
	desmosGraphs,
	desmosGraphsLoaded,
	getColoredParametricCurve,
	getDesmosBounds,
	getDesmosSlider,
	getDesmosVector
} from "/scripts/src/desmos.js";
import { $, raw } from "/scripts/src/main.js";

export default function()
{
	// This is unfortunately inverted along with all the other colors,
	// so we have to account for that.
	function colorFunction(c)
	{
		return hsvToHex(
			(270 + (120 - 270) * 0.5 * (Math.sign(c) + 1) + 180) / 360,
			1,
			0.4 * Math.abs(c),
		);
	}
	
	createDesmosGraphs({
		slicingAndBoundaries:
		{
			bounds: { xmin: -0.25, xmax: 1.25, ymin: -0.25, ymax: 1.25 },
			
			expressions:
			[
				{ latex: raw`y = \sqrt{x}\{ 0 \leq x \leq 1 \}`, color: desmosColors.black },
				{ latex: raw`y = 0\{ 0 \leq x \leq 1 \}`, color: desmosColors.black },
				{ latex: raw`x = 1\{ 0 \leq y \leq 1 \}`, color: desmosColors.black },

				...getDesmosSlider({
					expression: raw`x_0 = 0.75`,
					min: 0,
					max: 1,
					secret: false
				}),

				{ latex: raw`x = x_0\{ 0 \leq y \leq \sqrt{x_0} \}`, color: desmosColors.purple },
			]
		},

		negativeBoundaryCurve:
		{
			bounds: { xmin: -0.25, xmax: 1.25, ymin: -0.25, ymax: 1.25 },
			
			expressions:
			[
				{ latex: raw`f(x) = \sqrt{x}`, hidden: true, secret: true },

				{ latex: raw`y = \sqrt{x}\{ 0 \leq x \leq 1 \}`, color: desmosColors.purple },
				{ latex: raw`y = 0\{ 0 \leq x \leq 1 \}`, color: desmosColors.blue },
				{ latex: raw`x = 1\{ 0 \leq y \leq 1 \}`, color: desmosColors.red },

				...getDesmosVector({
					from: ["0.4", "f(0.4)"],
					to: ["0.4 + 0.001", "f(0.4) + 0.001f'(0.4)"],
					color: desmosColors.purple,
					arrowSize: "0.05",
				}),

				...getDesmosVector({
					from: ["0.5", "0"],
					to: ["0.5 - 0.001", "0"],
					color: desmosColors.blue,
					arrowSize: "0.05",
				}),

				...getDesmosVector({
					from: ["1", "0.5"],
					to: ["1", "0.5 - 0.001"],
					color: desmosColors.red,
					arrowSize: "0.05",
				}),
			]
		},

		unitDiskBoundary:
		{
			bounds: { xmin: -1.25, xmax: 1.25, ymin: -1.25, ymax: 1.25 },
			
			expressions:
			[
				{ latex: raw`x^2 + y^2 \leq 1`, color: desmosColors.purple },
				{ latex: raw`x^2 + y^2 = 1`, color: desmosColors.blue },

				...getDesmosVector({
					from: ["\\frac{1}{\\sqrt{2}}", "\\frac{1}{\\sqrt{2}}"],
					to: ["\\frac{1}{\\sqrt{2}} - 0.001", "\\frac{1}{\\sqrt{2}} + 0.001"],
					color: desmosColors.blue,
					arrowSize: "0.05",
				}),

				...getDesmosVector({
					from: ["-\\frac{1}{\\sqrt{2}}", "\\frac{1}{\\sqrt{2}}"],
					to: ["-\\frac{1}{\\sqrt{2}} - 0.001", "\\frac{1}{\\sqrt{2}} - 0.001"],
					color: desmosColors.blue,
					arrowSize: "0.05",
				}),

				...getDesmosVector({
					from: ["-\\frac{1}{\\sqrt{2}}", "-\\frac{1}{\\sqrt{2}}"],
					to: ["-\\frac{1}{\\sqrt{2}} + 0.001", "-\\frac{1}{\\sqrt{2}} - 0.001"],
					color: desmosColors.blue,
					arrowSize: "0.05",
				}),

				...getDesmosVector({
					from: ["\\frac{1}{\\sqrt{2}}", "-\\frac{1}{\\sqrt{2}}"],
					to: ["\\frac{1}{\\sqrt{2}} + 0.001", "-\\frac{1}{\\sqrt{2}} + 0.001"],
					color: desmosColors.blue,
					arrowSize: "0.05",
				}),
			]
		},

		clockwiseBoundary:
		{
			bounds: { xmin: -2.5, xmax: 2.5, ymin: -2.5, ymax: 2.5 },
			
			expressions:
			[
				{ latex: raw`x^2 + y^2 \leq 4 \{ 1 \leq x^2 + y^2 \}`, color: desmosColors.purple },
				{ latex: raw`x^2 + y^2 = [1, 4]`, color: desmosColors.blue },

				...getDesmosVector({
					from: ["\\frac{1}{\\sqrt{2}}", "\\frac{1}{\\sqrt{2}}"],
					to: ["\\frac{1}{\\sqrt{2}} + 0.001", "\\frac{1}{\\sqrt{2}} - 0.001"],
					color: desmosColors.blue,
					arrowSize: "0.1",
				}),

				...getDesmosVector({
					from: ["-\\frac{1}{\\sqrt{2}}", "\\frac{1}{\\sqrt{2}}"],
					to: ["-\\frac{1}{\\sqrt{2}} + 0.001", "\\frac{1}{\\sqrt{2}} + 0.001"],
					color: desmosColors.blue,
					arrowSize: "0.1",
				}),

				...getDesmosVector({
					from: ["-\\frac{1}{\\sqrt{2}}", "-\\frac{1}{\\sqrt{2}}"],
					to: ["-\\frac{1}{\\sqrt{2}} - 0.001", "-\\frac{1}{\\sqrt{2}} + 0.001"],
					color: desmosColors.blue,
					arrowSize: "0.1",
				}),

				...getDesmosVector({
					from: ["\\frac{1}{\\sqrt{2}}", "-\\frac{1}{\\sqrt{2}}"],
					to: ["\\frac{1}{\\sqrt{2}} - 0.001", "-\\frac{1}{\\sqrt{2}} - 0.001"],
					color: desmosColors.blue,
					arrowSize: "0.1",
				}),



				...getDesmosVector({
					from: ["\\frac{2}{\\sqrt{2}}", "\\frac{2}{\\sqrt{2}}"],
					to: ["\\frac{2}{\\sqrt{2}} - 0.001", "\\frac{2}{\\sqrt{2}} + 0.001"],
					color: desmosColors.blue,
					arrowSize: "0.1",
				}),

				...getDesmosVector({
					from: ["-\\frac{2}{\\sqrt{2}}", "\\frac{2}{\\sqrt{2}}"],
					to: ["-\\frac{2}{\\sqrt{2}} - 0.001", "\\frac{2}{\\sqrt{2}} - 0.001"],
					color: desmosColors.blue,
					arrowSize: "0.1",
				}),

				...getDesmosVector({
					from: ["-\\frac{2}{\\sqrt{2}}", "-\\frac{2}{\\sqrt{2}}"],
					to: ["-\\frac{2}{\\sqrt{2}} + 0.001", "-\\frac{2}{\\sqrt{2}} - 0.001"],
					color: desmosColors.blue,
					arrowSize: "0.1",
				}),

				...getDesmosVector({
					from: ["\\frac{2}{\\sqrt{2}}", "-\\frac{2}{\\sqrt{2}}"],
					to: ["\\frac{2}{\\sqrt{2}} + 0.001", "-\\frac{2}{\\sqrt{2}} + 0.001"],
					color: desmosColors.blue,
					arrowSize: "0.1",
				}),
			]
		},

		positiveBoundaryCurve:
		{
			bounds: { xmin: -0.25, xmax: 1.25, ymin: -0.25, ymax: 1.25 },
			
			expressions:
			[
				{ latex: raw`f(x) = \sqrt{x}`, hidden: true, secret: true },

				{ latex: raw`y = \sqrt{x}\{ 0 \leq x \leq 1 \}`, color: desmosColors.purple },
				{ latex: raw`y = 0\{ 0 \leq x \leq 1 \}`, color: desmosColors.blue },
				{ latex: raw`x = 1\{ 0 \leq y \leq 1 \}`, color: desmosColors.red },

				...getDesmosVector({
					from: ["0.4", "f(0.4)"],
					to: ["0.4 - 0.001", "f(0.4) - 0.001f'(0.4)"],
					color: desmosColors.purple,
					arrowSize: "0.05",
				}),

				...getDesmosVector({
					from: ["0.5", "0"],
					to: ["0.5 + 0.001", "0"],
					color: desmosColors.blue,
					arrowSize: "0.05",
				}),

				...getDesmosVector({
					from: ["1", "0.5"],
					to: ["1", "0.5 + 0.001"],
					color: desmosColors.red,
					arrowSize: "0.05",
				}),
			]
		},

		cycloid:
		{
			bounds: { xmin: -1, xmax: 2, ymin: -0.5, ymax: 2.5 },
			
			expressions:
			[
				{ latex: raw`(t - \sin(2\pi t), 1 - \cos(2\pi t))`, color: desmosColors.purple },
			]
		},

		flux:
		{
			alwaysDark: true,
			highContrast: true,
			
			bounds: { xmin: -3, xmax: 3, ymin: -3, ymax: 3 },

			options: { expressions: false },
			
			expressions:
			[
				{ latex: raw`l_1(t) = (2\cos(t), 2\sin(t))` },
				{ latex: raw`l_2(t) = (-\sqrt{3}, -1) + t(2\sqrt{3}, 0)` },

				...getColoredParametricCurve({
					fieldFunction: (x, y) => [-y, -x + y],
					pathFunction: (t) => [2 * Math.cos(t), 2 * Math.sin(t)],
					pathFunctionDesmos: raw`l_1(t)`,
					useUnitNormal: true,
					minT: -Math.PI / 6,
					maxT: 7 * Math.PI / 6,
					numSlices: 100,
					colorFunction
				}),

				...getColoredParametricCurve({
					fieldFunction: (x, y) => [-y, -x + y],
					pathFunction: (t) => [-Math.sqrt(3) + 2 * Math.sqrt(3) * t, -1],
					pathFunctionDesmos: raw`l_2(t)`,
					useUnitNormal: true,
					minT: 0,
					maxT: 1,
					numSlices: 100,
					colorFunction
				}),
			]
		},
	});



	desmosGraphsLoaded.flux.then(() =>
	{
		createEphemeralApplet($("#flux-canvas"), (canvas) =>
		{
			const applet = new VectorField({
				canvas,
				useFullscreenButton: false,
				useResetButton: false,
				transparency: true,
				onDrawFrame,
				minWorldWidth: 0.01,
				maxWorldWidth: 100,
				minWorldHeight: 0.01,
				maxWorldHeight: 100,
			});

			applet.allowFullscreenWithKeyboard = false;
			applet.allowResetWithKeyboard = false;

			applet.loadPromise.then(() =>
			{
				applet.run({
					resolution: 500,
					maxParticles: 5000,
					generatingCode: "(-y * 0.5, (-x + y) * 0.5)",
					dt: .002,
					worldWidth: 5,
					hue: 0.6,
					saturation: 0.85,
					brightness: 0.85,
					darkenWhenSlow: true,
				});
			});

			function onDrawFrame()
			{
				const bounds = getDesmosBounds(desmosGraphs.flux);

				applet.wilson.resizeWorld({
					width: bounds.xmax - bounds.xmin,
					height: bounds.ymax - bounds.ymin,
					centerX: (bounds.xmin + bounds.xmax) / 2,
					centerY: (bounds.ymin + bounds.ymax) / 2,
				});
			}

			return applet;
		});
	});

	

	let runDivergenceCurlApplet = () => {};

	const divergenceCurlDropdown = new Dropdown({
		element: $("#divergence-curl-dropdown"),
		name: "Color by",
		options: {
			curl: "Curl",
			divergence: "Divergence",
		},
		persistState: false,
		onInput: () => runDivergenceCurlApplet(VectorField[divergenceCurlDropdown.value]),
	});

	createEphemeralApplet($("#divergence-curl-canvas"), (canvas) =>
	{
		const applet = new VectorField({ canvas });

		runDivergenceCurlApplet = (colorBy) =>
		{
			applet.loadPromise.then(() =>
			{
				applet.run({
					generatingCode: "(sin(x) + sin(y), sin(y) - sin(x))",
					worldWidth: 12,
					colorBy,
				});
			});
		};

		runDivergenceCurlApplet(
			divergenceCurlDropdown.value
				? VectorField[divergenceCurlDropdown.value]
				: VectorField.monochrome
		);

		return applet;
	});
}