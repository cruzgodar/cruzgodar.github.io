@@@
	function project({
		id,
		title,
		shortTitle,
		url,
		cover,
		description,
	}) {
		return `
			<div class="project">
				<h2 class="section-text">${title}</h2>

				<a href="${url}" class="section-text-with-image-link">
					<h2 class="section-text">${title}</h2>

					<div class="image-link no-scale">
						<img src="/graphics/general-icons/placeholder.png" data-src="${cover}" alt="${shortTitle}" tabindex="1"></img>
					</div>
				</a>

				<div class="body-text-with-image-link">
					${description}

					<a href="${url}" class="image-link">
						<img src="/graphics/general-icons/placeholder.png" data-src="${cover}" alt="${shortTitle}" tabindex="1"></img>
					</a>
				</div>

				REPLACE WITH A BUTTON WITH ID ${id}!
			</div>
		`;
	}
@@@

<div class="projects">
	@project({
		id: "wilson",
		title: "Wilson: Applets Made Easy",
		shortTitle: "Wilson",
		url: "https://github.com/cruzgodar/wilson",
		cover: "/projects/wilson/cover.webp",
		description: @[[Wilson is the TypeScript library that powers [every applet](/applets) on this site. It handles tasks like panning and zooming, makes parallelized GPU-based applets as easy as writing a shader, provides a robust and customizable fullscreen toolkit, and even lets you run 3D applets in a VR headset without hassle. All of this streamlines your work and simplifies your applets, letting you focus on the code that matters.]]
	})

	@project({
		id: "kestrel",
		title: "Kestrel: Background Bird ID",
		shortTitle: "Kestrel",
		url: "https://apps.apple.com/us/app/kestrel-background-bird-id/id6787208717",
		cover: "/projects/kestrel/cover.webp",
		description: @[[Kestrel listens for birds in the background on your iPhone or Apple Watch so you can focus on the nature around you. It uses Cornell Lab's BirdNET model to identify birds by their songs and calls, and when it hears one you've starred in your life list or have never seen before, it notifies you. That lets you keep your focus off your phone, with confidence that you'll know when a bird you care about is nearby. All processing happens on-device, all audio is deleted immediately (i.e. within a few seconds of being recorded), and the source code is [freely available.](https://github.com/cruzgodar/Kestrel)]]
	})

	@project({
		id: "motion-smoothing",
		title: "Motion Smoothing: Celeste at 120 FPS in HD",
		shortTitle: "Motion Smoothing",
		url: "https://www.youtube.com/watch?v=VOn4d2gQaKg",
		cover: "/projects/motion-smoothing/cover.webp",
		description: @[[Celeste is [one of my favorite games,](https://www.youtube.com/watch?v=ejvRmGgVbcQ) but it's always bothered me that it's limited to 60 FPS and that the camera can only move in whole-pixel increments, making it look jittery on large monitors. Motion Smoothing is a mod originally created by [FancyFurret](https://github.com/FancyFurret) that fixes both: the camera moves smoothly, and the game can run at any framerate without breaking physics. I've been actively developing and maintaining it since 2025 and have built many of its features.]]
	})

	@project({
		id: "lapsa",
		title: "Lapsa: Easy, Elegant Slides",
		shortTitle: "Lapsa",
		url: "/projects/lapsa",
		cover: "/projects/lapsa/cover.webp",
		description: @[[Lapsa is the slideshow engine that powers [all of the presentations](/math) on this site. It lets you use HTML and CSS to build beautiful presentations and JavaScript or TypeScript to make them fully interactive, making easy things easy and nearly anything possible.]]
	})
</div>