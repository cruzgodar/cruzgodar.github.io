import anime from "/scripts/anime.js";

// coordinates is a list of length-3 arrays [i, j, k]
// containing the coordinates of the cubes to highlight.
export async function colorCubes(array, coordinates, hue, saturation = 1)
{
	if (coordinates.length === 0)
	{
		return;
	}

	const targets = [];

	coordinates.forEach(xyz =>
	{
		array.cubes[xyz[0]][xyz[1]][xyz[2]].material
			.forEach(material => targets.push(material.color));
	});

	targets.forEach(color => color.getRGB(color));

	// Convert HSV to HSL.
	const v = this.cubeLightness + 1 * Math.min(this.cubeLightness, 1 - this.cubeLightness);
	const s = v === 0 ? 0 : 2 * (1 - this.cubeLightness / v);

	const targetColor = this.wilson.utils.hsvToRgb(hue, saturation * s, v);



	await anime({
		targets,
		r: targetColor[0] / 255,
		g: targetColor[1] / 255,
		b: targetColor[2] / 255,
		duration: this.animationTime,
		delay: (element, index) => Math.floor(index / 6) * this.animationTime / 10,
		easing: "easeOutQuad",
		update: () =>
		{
			targets.forEach(color => color.setRGB(color.r, color.g, color.b));
			this.needNewFrame = true;
		},
		complete: () =>
		{
			targets.forEach(color => color.setRGB(color.r, color.g, color.b));
			this.needNewFrame = true;
		}
	}).finished;
}



export async function uncolorCubes(array, coordinates)
{
	const targets = [];

	coordinates.forEach(xyz =>
	{
		array.cubes[xyz[0]][xyz[1]][xyz[2]].material
			.forEach(material => targets.push(material.color));
	});

	targets.forEach(color => color.getHSL(color));

	await anime({
		targets,
		s: 0,
		duration: this.animationTime,
		easing: "easeOutQuad",
		update: () =>
		{
			targets.forEach(color => color.setHSL(
				color.h,
				color.s,
				this.cubeLightness
			));

			this.needNewFrame = true;
		},
		complete: () =>
		{
			targets.forEach(color => color.setHSL(
				color.h,
				color.s,
				this.cubeLightness
			));

			this.needNewFrame = true;
		}
	}).finished;
}



// Lifts the specified cubes to the specified height. The animation is skipped in 2d mode.
export async function raiseCubes(array, coordinates, height)
{
	const duration = this.in2dView ? 0 : this.animationTime;

	const targets = [];

	coordinates.forEach(xyz =>
	{
		targets.push(array.cubes[xyz[0]][xyz[1]][xyz[2]].position);

		if (array.numbers[xyz[0]][xyz[1]] === Infinity)
		{
			console.error("Cannot raise cubes from an infinite height");
		}
	});

	await anime({
		targets,
		y: height,
		duration,
		easing: "easeInOutQuad",
		update: () => this.needNewFrame = true,
		complete: () => this.needNewFrame = true
	}).finished;
}



// Lowers the specified cubes onto the array. The animation is skipped in 2d mode.
export async function lowerCubes(array, coordinates)
{
	const duration = this.in2dView ? 0 : this.animationTime;

	const targets = [];

	coordinates.forEach(xyz =>
	{
		targets.push(array.cubes[xyz[0]][xyz[1]][xyz[2]].position);

		if (array.numbers[xyz[0]][xyz[1]] === Infinity)
		{
			console.error("Cannot lower cubes onto an infinite height");
		}
	});

	await anime({
		targets,
		y: (element, index) => array.numbers[coordinates[index][0]][coordinates[index][1]],
		duration,
		easing: "easeInOutQuad",
		update: () => this.needNewFrame = true,
		complete: () => this.needNewFrame = true
	}).finished;

	coordinates.forEach(xyz =>
	{
		array.cubes[xyz[0]][xyz[1]][array.numbers[xyz[0]][xyz[1]]]
			= array.cubes[xyz[0]][xyz[1]][xyz[2]];

		array.cubes[xyz[0]][xyz[1]][xyz[2]] = undefined;
	});
}



// Moves cubes from one array to another and changes their group.
export async function moveCubes(
	sourceArray,
	sourceCoordinates,
	targetArray,
	targetCoordinates,
	updateCubeArray = true
) {
	const targets = [];

	sourceCoordinates.forEach(xyz =>
	{
		targets.push(sourceArray.cubes[xyz[0]][xyz[1]][xyz[2]].position);
		targetArray.cubeGroup.attach(sourceArray.cubes[xyz[0]][xyz[1]][xyz[2]]);

		if (sourceArray.numbers[xyz[0]][xyz[1]] === Infinity)
		{
			console.error("Cannot move cubes from an infinite height");
		}
	});

	await anime({
		targets,
		x: (element, index) => targetCoordinates[index][1] - (targetArray.footprint - 1) / 2,
		y: (element, index) => targetCoordinates[index][2],
		z: (element, index) => targetCoordinates[index][0] - (targetArray.footprint - 1) / 2,
		duration: this.animationTime,
		easing: "easeInOutQuad",
		update: () => this.needNewFrame = true,
		complete: () => this.needNewFrame = true
	}).finished;

	if (updateCubeArray)
	{
		// This is necessary in case the source and target arrays are the same.
		const sourceCubes = sourceCoordinates
			.map(xyz => sourceArray.cubes[xyz[0]][xyz[1]][xyz[2]]);

		sourceCoordinates.forEach(xyz => sourceArray.cubes[xyz[0]][xyz[1]][xyz[2]]);

		targetCoordinates.forEach((xyz, index) =>
		{
			if (targetArray.numbers[xyz[0]][xyz[1]] === Infinity)
			{
				console.error("Cannot move cubes to an infinite height");
			}

			if (
				targetArray.cubes[xyz[0]][xyz[1]][xyz[2]]
				&& !sourceCoordinates
					.some(e => e[0] === xyz[0] && e[1] === xyz[1] && e[2] === xyz[2])
			) {
				console.warn(`Moving a cube to a location that's already occupied: ${xyz}. This is probably not what you want to do.`);
			}

			targetArray.cubes[xyz[0]][xyz[1]][xyz[2]] = sourceCubes[index];
		});
	}
}



// Fades the specified cubes' opacity to 1.
export async function revealCubes(array, coordinates)
{
	if (coordinates.length === 0)
	{
		return;
	}

	const targets = [];

	coordinates.forEach(xyz =>
	{
		array.cubes[xyz[0]][xyz[1]][xyz[2]].material
			.forEach(material => targets.push(material));

		if (array.numbers[xyz[0]][xyz[1]] === Infinity)
		{
			console.error("Cannot reveal cubes at an infinite height");
		}
	});

	await anime({
		targets,
		opacity: 1,
		duration: this.animationTime / 2,
		delay: (element, index) => Math.floor(index / 6) * this.animationTime / 10,
		easing: "easeOutQuad",
		update: () => this.needNewFrame = true,
		complete: () => this.needNewFrame = true
	}).finished;
}



// Fades the specified cubes' opacity to zero, and then deletes them.
export async function deleteCubes(array, coordinates, instant = false, noAnimation = false)
{
	const targets = [];

	coordinates.forEach(xyz =>
	{
		array.cubes[xyz[0]][xyz[1]][xyz[2]].material
			.forEach(material => targets.push(material));
	});

	await anime({
		targets,
		opacity: 0,
		duration: this.animationTime / 2 * !noAnimation,
		delay: (element, index) => (!instant) * Math.floor(index / 6) * this.animationTime / 10,
		easing: "easeOutQuad",
		update: () => this.needNewFrame = true,
		complete: () => this.needNewFrame = true
	}).finished;

	targets.forEach(material => material.dispose());

	coordinates.forEach(xyz =>
	{
		array.cubeGroup.remove(array.cubes[xyz[0]][xyz[1]][xyz[2]]);

		array.cubes[xyz[0]][xyz[1]][xyz[2]] = undefined;
	});
}



// For use with tableaux of skew shape.
export async function deleteFloor(array, coordinates)
{
	const targets = [];

	coordinates.forEach(xyz =>
	{
		array.floor[xyz[0]][xyz[1]].material.forEach(material => targets.push(material));
	});

	await anime({
		targets,
		opacity: 0,
		duration: this.animationTime / 2,
		easing: "easeOutQuad",
		update: () => this.needNewFrame = true,
		complete: () => this.needNewFrame = true
	}).finished;

	targets.forEach(material => material.dispose());

	coordinates.forEach(xyz =>
	{
		array.cubeGroup.remove(array.floor[xyz[0]][xyz[1]]);

		array.cubes[xyz[0]][xyz[1]] = undefined;
	});
}