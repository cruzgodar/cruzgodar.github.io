// A debug-only export of the currently open card as a pdf.

// Cards are routinely much taller than the window, and nothing can screenshot
// what isn't on screen, so this scrolls the card past the window and stitches
// the frames back together. The frames come from getDisplayMedia, which is the
// only screenshot a page actually gets to take: it costs a permission prompt,
// but it captures exactly what the browser rendered instead of trying to
// reproduce the card from scratch.

// Everything in here is destructive to the live page --- the theme is forced to
// light, the card's chrome is stripped off, and the card is left scrolled
// wherever the capture ended --- so the page wants a refresh afterwards.

import { cardContainer } from "./cards.js";
import { siteSettings, toggleDarkTheme } from "./settings.js";
import { downloadBlob, sleep } from "./utils.js";

const jpegQuality = .92;

// Rasters much past this fail outright in Safari.
const maxRasterArea = 1.5e8;
const maxRasterDimension = 16384;

// The largest page size every pdf reader is required to handle.
const maxPdfDimension = 14400;

// Css pixels are 1/96 of an inch and pdf units are 1/72, so the page comes out
// the same physical size the card is on a 96dpi screen.
const pdfUnitsPerPixel = .75;

// How long to let each screenful render on the pass that isn't capturing.
const renderTime = 250;

// How long to wait on the capture catching up before giving up and drawing
// whatever frame it's on.
const frameTime = 500;

// How long the card's height has to hold still before it counts as settled.
const settledTime = 500;
const maxSettlingTime = 30000;



export async function downloadCardPdf({ card, name })
{
	let stopRendering = null;

	// This has to come first, while the click that got us here still counts as
	// a user gesture.
	const stream = await navigator.mediaDevices.getDisplayMedia({
		video: {
			displaySurface: "browser",
			width: { ideal: window.innerWidth * window.devicePixelRatio },
			height: { ideal: window.innerHeight * window.devicePixelRatio }
		},
		preferCurrentTab: true
	});

	try
	{
		const surface = stream.getVideoTracks()[0].getSettings().displaySurface;

		if (surface && surface !== "browser")
		{
			throw new Error(`Shared a ${surface} instead of this tab --- the capture has to be the tab for it to line up with the page.`);
		}

		if (siteSettings.darkTheme)
		{
			await toggleDarkTheme({ noAnimation: true, force: true });
		}

		document.querySelector("#card-close-button")?.remove();
		document.querySelector("#card-debug-button")?.remove();

		card.style.borderRadius = 0;

		const video = await playStream(stream);

		stopRendering = keepRendering();

		// Scrolling the card past the window is what makes the site typeset the
		// math and build the graphs that were too far off screen to bother
		// with, and that changes the card's height, so do a pass for that
		// first and let it settle before anything gets captured.
		await scrollThrough(card, { settle: () => sleep(renderTime) });
		await waitForCardToSettle(card);

		const { canvas, width, height } = await captureCard(card, video);

		const jpeg = new Uint8Array(await (await new Promise(
			resolve => canvas.toBlob(resolve, "image/jpeg", jpegQuality)
		)).arrayBuffer());

		// The page is sized from the card's css size, not the raster's, so that
		// capturing at a lower resolution only ever costs resolution.
		const [pageWidth, pageHeight] = getPageSize(width, height);

		downloadBlob(
			createSingleImagePdf({
				jpeg,
				pixelWidth: canvas.width,
				pixelHeight: canvas.height,
				pageWidth,
				pageHeight
			}),
			`${name}.pdf`
		);
	}

	finally
	{
		stopRendering?.();

		for (const track of stream.getTracks())
		{
			track.stop();
		}
	}
}

// The browser only runs a rendering step when something on the page needs
// painting, and the capture only gets a frame when the page paints --- so with
// nothing asking for frames, the capture advances only when something like a
// mouse moving over the page forces a repaint. Asking for an animation frame
// over and over is what keeps them coming.
function keepRendering()
{
	let rendering = true;

	(function requestFrame()
	{
		if (rendering)
		{
			requestAnimationFrame(requestFrame);
		}
	})();

	return () => rendering = false;
}



async function captureCard(card, video)
{
	const { width, height } = card.getBoundingClientRect();

	// The capture runs at whatever resolution the browser felt like giving us.
	const scaleX = video.videoWidth / window.innerWidth;
	const scaleY = video.videoHeight / window.innerHeight;
	const scale = getRasterScale(width, height, scaleX);

	const canvas = document.createElement("canvas");
	canvas.width = Math.round(width * scale);
	canvas.height = Math.round(height * scale);

	const context = canvas.getContext("2d");

	// Jpegs have no alpha, and the last screenful is usually a partial one.
	context.fillStyle = "#ffffff";
	context.fillRect(0, 0, canvas.width, canvas.height);

	await scrollThrough(card, {
		settle: () => waitForFrames(video),

		// Each screenful is drawn where it belongs in the card, so screenfuls
		// that overlap just paint the same pixels twice.
		onScreenful: ({ rect, from, to }) => context.drawImage(
			video,
			rect.left * scaleX,
			(rect.top + from) * scaleY,
			rect.width * scaleX,
			(to - from) * scaleY,
			0,
			from * scale,
			canvas.width,
			(to - from) * scale
		)
	});

	return { canvas, width, height };
}

// Walks the card past the window a screenful at a time.
async function scrollThrough(card, { settle, onScreenful })
{
	let scrolledTo = 0;

	for (;;)
	{
		cardContainer.scrollTop += card.getBoundingClientRect().top + scrolledTo;

		await settle();

		const rect = card.getBoundingClientRect();

		// The part of the card that's on screen, in the card's own coordinates.
		const from = Math.max(0, -rect.top);
		const to = Math.min(rect.height, window.innerHeight - rect.top);

		onScreenful?.({ rect, from, to });

		// Either the bottom of the card is on screen or the container has run
		// out of room to scroll.
		if (to >= rect.height || to <= scrolledTo)
		{
			return;
		}

		scrolledTo = to;
	}
}

// Typesetting math and building graphs changes the card's height, and switching
// themes fades every graph out and back in, so wait until none of that is still
// happening.
async function waitForCardToSettle(card)
{
	const start = Date.now();

	let lastHeight = null;
	let settlingSince = Date.now();

	while (Date.now() - settlingSince < settledTime)
	{
		if (Date.now() - start > maxSettlingTime)
		{
			console.warn("Gave up waiting for the card to settle");

			return;
		}

		await sleep(100);

		const { height } = card.getBoundingClientRect();

		const fading = Array.from(card.querySelectorAll(".desmos-container"))
			.some(container => getComputedStyle(container).opacity !== "1");

		if (height !== lastHeight || fading)
		{
			lastHeight = height;
			settlingSince = Date.now();
		}
	}
}



async function playStream(stream)
{
	const video = document.createElement("video");
	video.srcObject = stream;
	video.muted = true;

	await video.play();

	while (!video.videoWidth)
	{
		await sleep(50);
	}

	return video;
}

// The captured stream runs a frame or two behind what the page has painted, so
// a scroll isn't really on camera until a couple of new frames have shown up.
// A capture with nothing new to send can stop sending, so don't wait forever.
function waitForFrames(video, count = 3)
{
	if (!video.requestVideoFrameCallback)
	{
		return sleep(frameTime);
	}

	return new Promise(resolve =>
	{
		let remaining = count;

		function onFrame()
		{
			remaining--;

			if (remaining > 0)
			{
				video.requestVideoFrameCallback(onFrame);
			}

			else
			{
				resolve();
			}
		}

		video.requestVideoFrameCallback(onFrame);

		setTimeout(() =>
		{
			if (remaining > 0)
			{
				console.warn("The capture stopped sending frames --- this screenful"
					+ " may be a stale one");
			}

			resolve();
		}, frameTime);
	});
}



// Captures at the resolution the stream is running at, unless that makes a
// raster too big to survive.
function getRasterScale(width, height, streamScale)
{
	return Math.min(
		streamScale,
		maxRasterDimension / width,
		maxRasterDimension / height,
		Math.sqrt(maxRasterArea / (width * height))
	);
}

function getPageSize(width, height)
{
	const scale = Math.min(
		pdfUnitsPerPixel,
		maxPdfDimension / width,
		maxPdfDimension / height
	);

	return [Math.round(width * scale), Math.round(height * scale)];
}



// A pdf with one page and one image on it. Jpeg data goes into a pdf verbatim,
// which is the only reason this doesn't need a pdf library.
function createSingleImagePdf({
	jpeg,
	pixelWidth,
	pixelHeight,
	pageWidth,
	pageHeight
}) {
	const encoder = new TextEncoder();
	const chunks = [];
	const objectOffsets = [];

	let length = 0;

	function push(data)
	{
		const bytes = typeof data === "string" ? encoder.encode(data) : data;

		chunks.push(bytes);
		length += bytes.length;
	}

	function pushObject(text)
	{
		objectOffsets.push(length);

		push(text);
	}

	const contents = `q ${pageWidth} 0 0 ${pageHeight} 0 0 cm /Im0 Do Q\n`;

	push("%PDF-1.3\n");

	// The conventional "there are high bytes in here" marker.
	push(new Uint8Array([0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A]));

	pushObject("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
	pushObject("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

	pushObject(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}]`
		+ " /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n");

	pushObject(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pixelWidth}`
		+ ` /Height ${pixelHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8`
		+ ` /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);

	push(jpeg);
	push("\nendstream\nendobj\n");

	pushObject(`5 0 obj\n<< /Length ${contents.length} >>\nstream\n${contents}endstream\nendobj\n`);

	const xrefOffset = length;

	let xref = `xref\n0 ${objectOffsets.length + 1}\n0000000000 65535 f \n`;

	for (const offset of objectOffsets)
	{
		xref += `${String(offset).padStart(10, "0")} 00000 n \n`;
	}

	push(xref);

	push(`trailer\n<< /Size ${objectOffsets.length + 1} /Root 1 0 R >>\n`
		+ `startxref\n${xrefOffset}\n%%EOF\n`);

	const pdf = new Uint8Array(length);

	let at = 0;

	for (const chunk of chunks)
	{
		pdf.set(chunk, at);
		at += chunk.length;
	}

	return new Blob([pdf], { type: "application/pdf" });
}
