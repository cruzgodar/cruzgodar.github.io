import { showPage } from "../../../scripts/src/loadPage.js";
import { SingularValueDecompositions } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { FileUpload } from "/scripts/src/fileUploads.js";
import { $ } from "/scripts/src/main.js";
import { Slider } from "/scripts/src/sliders.js";

export default function()
{
	const applet = new SingularValueDecompositions({ canvas: $("#output-canvas") });

	const fileUpload = new FileUpload({
		element: $("#images-upload"),
		name: "Choose Images",
	});

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	const indexSlider = new Slider({
		element: $("#index-slider"),
		name: "Image",
		value: 1,
		min: 1,
		max: 2,
		onInput: onSliderInput
	});

	const depthSlider = new Slider({
		element: $("#depth-slider"),
		name: "Depth",
		value: 1,
		min: 1,
		max: 2,
		onInput: onSliderInput
	});

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: "an-abelian-sandpile.png"
	});

	showPage();

	function run()
	{
		applet.run({ files: fileUpload.files });
	}

	function onSliderInput()
	{
		applet.drawTruncatedEigenimage(
			indexSlider.value - 1,
			depthSlider.value
		);
	}
}