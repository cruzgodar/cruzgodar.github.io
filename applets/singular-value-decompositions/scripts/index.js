import { showPage } from "../../../scripts/src/loadPage.js";
import { SingularValueDecompositions } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { FileUpload } from "/scripts/src/fileUploads.js";
import { $ } from "/scripts/src/main.js";

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
}